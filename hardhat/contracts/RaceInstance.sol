// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RaceInstance
 * @dev Individual race contract that manages escrow, teams, and payouts
 * @notice This contract handles a single race from start to finish, including proportional winnings
 */
contract RaceInstance is ReentrancyGuard {
    /// @notice Enum for race states
    enum RaceState {
        Created,
        Started,
        Ended
    }

    /// @notice Current state of the race
    RaceState public state;

    /// @notice Unique race ID
    uint256 public immutable raceId;

    /// @notice Entry fee in wei
    uint256 public immutable entryFee;

    /// @notice Host address (creator of the race)
    address public immutable host;

    /// @notice Factory contract address
    address public immutable factory;

    /// @notice Oracle address that can record results
    address public immutable oracle;

    /// @notice Total prize pool
    uint256 public prizePool;

    /// @notice Team 1 (Ethereum) players
    address[] public team1Players;

    /// @notice Team 2 (Bitcoin) players
    address[] public team2Players;

    /// @notice Mapping to check if address is a player
    mapping(address => bool) public isPlayer;

    /// @notice Mapping to get player's team (1 or 2)
    mapping(address => uint8) public playerTeam;

    /// @notice Mapping to store each player's tap count after race ends
    mapping(address => uint256) public playerTaps;

    /// @notice Total taps for Team 1
    uint256 public team1TotalTaps;

    /// @notice Total taps for Team 2
    uint256 public team2TotalTaps;

    /// @notice Winning team (1 or 2, 0 if not determined yet)
    uint8 public winningTeam;

    /// @notice Mapping to track if a player has claimed their winnings
    mapping(address => bool) public hasClaimed;

    // Events
    event PlayerAdded(address indexed player, uint8 team);
    event RaceStarted();
    event RaceEnded(uint8 winningTeam, uint256 team1Taps, uint256 team2Taps);
    event ResultsRecorded(address[] winners, uint256[] tapCounts);
    event WinningsClaimed(address indexed player, uint256 amount);

    // Errors
    error OnlyFactory();
    error OnlyHost();
    error OnlyOracle();
    error InvalidState();
    error AlreadyPlayer();
    error NotEnoughPlayers();
    error InvalidTeam();
    error NotAWinner();
    error AlreadyClaimed();
    error TransferFailed();
    error InvalidArrayLength();
    error InvalidTapCount();

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }

    modifier onlyHost() {
        if (msg.sender != host) revert OnlyHost();
        _;
    }

    modifier onlyOracle() {
        if (msg.sender != oracle) revert OnlyOracle();
        _;
    }

    modifier inState(RaceState _state) {
        if (state != _state) revert InvalidState();
        _;
    }

    constructor(
        uint256 _raceId,
        uint256 _entryFee,
        address _host,
        address _oracle
    ) {
        raceId = _raceId;
        entryFee = _entryFee;
        host = _host;
        factory = msg.sender;
        oracle = _oracle;
        state = RaceState.Created;
    }

    /// @notice Receive function to accept ETH
    receive() external payable {
        prizePool += msg.value;
    }

    /**
     * @notice Adds a player to the race (only callable by factory)
     * @param player The address of the player to add
     * @param team The team to assign (1 or 2)
     */
    function addPlayer(address player, uint8 team)
        external
        onlyFactory
        inState(RaceState.Created)
    {
        if (isPlayer[player]) revert AlreadyPlayer();
        if (team != 1 && team != 2) revert InvalidTeam();

        isPlayer[player] = true;
        playerTeam[player] = team;

        if (team == 1) {
            team1Players.push(player);
        } else {
            team2Players.push(player);
        }

        emit PlayerAdded(player, team);
    }

    /**
     * @notice Starts the race (only callable by host)
     * @dev Requires at least one player on each team
     */
    function startRace() external onlyHost inState(RaceState.Created) {
        if (team1Players.length == 0 || team2Players.length == 0) {
            revert NotEnoughPlayers();
        }

        state = RaceState.Started;
        emit RaceStarted();
    }

    /**
     * @notice Records the race results (only callable by oracle)
     * @dev This is called by the backend after determining the winner
     * @param winners Array of winning players' addresses
     * @param tapCounts Array of tap counts corresponding to each winner
     */
    function recordResults(address[] calldata winners, uint256[] calldata tapCounts)
        external
        onlyOracle
        inState(RaceState.Started)
        nonReentrant
    {
        if (winners.length != tapCounts.length) revert InvalidArrayLength();
        if (winners.length == 0) revert InvalidTapCount();

        // Verify all winners are on the same team and calculate total taps
        uint8 teamCheck = playerTeam[winners[0]];
        uint256 totalWinnerTaps = 0;

        for (uint256 i = 0; i < winners.length; i++) {
            if (playerTeam[winners[i]] != teamCheck) revert InvalidTeam();
            if (tapCounts[i] == 0) revert InvalidTapCount();

            playerTaps[winners[i]] = tapCounts[i];
            totalWinnerTaps += tapCounts[i];
        }

        winningTeam = teamCheck;

        // Store total taps for reference
        if (winningTeam == 1) {
            team1TotalTaps = totalWinnerTaps;
        } else {
            team2TotalTaps = totalWinnerTaps;
        }

        state = RaceState.Ended;

        emit ResultsRecorded(winners, tapCounts);
        emit RaceEnded(winningTeam, team1TotalTaps, team2TotalTaps);

        // Notify factory
        (bool success, ) = factory.call(
            abi.encodeWithSignature("markRaceEnded(uint256,uint8)", raceId, winningTeam)
        );
        require(success, "Factory notification failed");
    }

    /**
     * @notice Allows winners to claim their proportional winnings
     * @dev Payout is calculated as: (playerTaps / teamTotalTaps) * prizePool
     */
    function claimWinnings() external nonReentrant inState(RaceState.Ended) {
        if (playerTeam[msg.sender] != winningTeam) revert NotAWinner();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (playerTaps[msg.sender] == 0) revert NotAWinner();

        hasClaimed[msg.sender] = true;

        // Calculate proportional winnings
        uint256 teamTotal = winningTeam == 1 ? team1TotalTaps : team2TotalTaps;
        uint256 playerShare = (playerTaps[msg.sender] * prizePool) / teamTotal;

        // Transfer winnings
        (bool success, ) = msg.sender.call{value: playerShare}("");
        if (!success) revert TransferFailed();

        emit WinningsClaimed(msg.sender, playerShare);
    }

    /**
     * @notice Gets total number of players
     * @return Total number of players in the race
     */
    function getTotalPlayers() external view returns (uint256) {
        return team1Players.length + team2Players.length;
    }

    /**
     * @notice Gets Team 1 players
     * @return Array of Team 1 player addresses
     */
    function getTeam1Players() external view returns (address[] memory) {
        return team1Players;
    }

    /**
     * @notice Gets Team 2 players
     * @return Array of Team 2 player addresses
     */
    function getTeam2Players() external view returns (address[] memory) {
        return team2Players;
    }

    /**
     * @notice Calculates claimable amount for a player
     * @param player The address to check
     * @return The amount claimable in wei
     */
    function getClaimableAmount(address player) external view returns (uint256) {
        if (state != RaceState.Ended) return 0;
        if (playerTeam[player] != winningTeam) return 0;
        if (hasClaimed[player]) return 0;
        if (playerTaps[player] == 0) return 0;

        uint256 teamTotal = winningTeam == 1 ? team1TotalTaps : team2TotalTaps;
        return (playerTaps[player] * prizePool) / teamTotal;
    }
}

