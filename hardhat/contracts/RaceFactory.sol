// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./RaceInstance.sol";

/**
 * @title RaceFactory
 * @dev Factory contract for creating and managing Onbase Derby race instances
 * @notice This contract creates individual race instances and tracks all races
 */
contract RaceFactory {
    /// @notice Counter for generating unique race IDs
    uint256 private _raceIdCounter;

    /// @notice Mapping from race ID to race instance address
    mapping(uint256 => address) public races;

    /// @notice Mapping from race ID to host address
    mapping(uint256 => address) public raceHosts;

    /// @notice Array of all active race IDs
    uint256[] public activeRaceIds;

    /// @notice Mapping to check if a race is active
    mapping(uint256 => bool) public isRaceActive;

    /// @notice Oracle address that can record race results
    address public oracle;

    // Events
    event RaceCreated(
        uint256 indexed raceId,
        address indexed host,
        address raceInstance,
        uint256 entryFee
    );

    event PlayerJoined(
        uint256 indexed raceId,
        address indexed player,
        uint8 team
    );

    event RaceStarted(uint256 indexed raceId);

    event RaceEnded(uint256 indexed raceId, uint8 winningTeam);

    // Errors
    error InvalidEntryFee();
    error RaceNotFound();
    error RaceAlreadyStarted();
    error InsufficientPayment();
    error AlreadyJoined();
    error Unauthorized();
    error TransferFailed();

    constructor(address _oracle) {
        oracle = _oracle;
    }

    /**
     * @notice Creates a new race with the specified entry fee
     * @dev Host must pay the entry fee when creating the race
     * @param entryFee The entry fee in wei for the race
     * @return raceId The unique identifier for the created race
     */
    function createRace(uint256 entryFee) external payable returns (uint256) {
        if (entryFee == 0) revert InvalidEntryFee();
        if (msg.value != entryFee) revert InsufficientPayment();

        uint256 raceId = _raceIdCounter++;

        // Deploy new race instance
        RaceInstance newRace = new RaceInstance(
            raceId,
            entryFee,
            msg.sender,
            oracle
        );

        races[raceId] = address(newRace);
        raceHosts[raceId] = msg.sender;
        activeRaceIds.push(raceId);
        isRaceActive[raceId] = true;

        // Transfer entry fee to race instance
        (bool success, ) = address(newRace).call{value: msg.value}("");
        if (!success) revert TransferFailed();

        // Host is automatically assigned to Team 1 (Ethereum)
        newRace.addPlayer(msg.sender, 1);

        emit RaceCreated(raceId, msg.sender, address(newRace), entryFee);
        emit PlayerJoined(raceId, msg.sender, 1);

        return raceId;
    }

    /**
     * @notice Allows a player to join an existing race
     * @dev Players are alternately assigned to teams for balance
     * @param raceId The ID of the race to join
     */
    function joinRace(uint256 raceId) external payable {
        address raceAddress = races[raceId];
        if (raceAddress == address(0)) revert RaceNotFound();

        RaceInstance raceInstance = RaceInstance(payable(raceAddress));

        if (raceInstance.state() != RaceInstance.RaceState.Created) {
            revert RaceAlreadyStarted();
        }

        uint256 entryFee = raceInstance.entryFee();
        if (msg.value != entryFee) revert InsufficientPayment();

        // Transfer entry fee to race instance
        (bool success, ) = raceAddress.call{value: msg.value}("");
        if (!success) revert TransferFailed();

        // Determine team assignment (alternate assignment)
        uint256 totalPlayers = raceInstance.getTotalPlayers();
        uint8 team = (totalPlayers % 2 == 0) ? 1 : 2; // Odd count -> Team 1, Even count -> Team 2

        raceInstance.addPlayer(msg.sender, team);

        emit PlayerJoined(raceId, msg.sender, team);
    }

    /**
     * @notice Starts a race (only callable by host)
     * @param raceId The ID of the race to start
     */
    function startRace(uint256 raceId) external {
        address raceAddress = races[raceId];
        if (raceAddress == address(0)) revert RaceNotFound();
        if (msg.sender != raceHosts[raceId]) revert Unauthorized();

        RaceInstance raceInstance = RaceInstance(payable(raceAddress));
        raceInstance.startRace();

        emit RaceStarted(raceId);
    }

    /**
     * @notice Gets all active race IDs
     * @return Array of active race IDs
     */
    function getActiveRaces() external view returns (uint256[] memory) {
        // Count truly active races
        uint256 count = 0;
        for (uint256 i = 0; i < activeRaceIds.length; i++) {
            RaceInstance raceInstance = RaceInstance(
                payable(races[activeRaceIds[i]])
            );
            if (
                raceInstance.state() == RaceInstance.RaceState.Created ||
                raceInstance.state() == RaceInstance.RaceState.Started
            ) {
                count++;
            }
        }

        // Build result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeRaceIds.length; i++) {
            RaceInstance raceInstance = RaceInstance(
                payable(races[activeRaceIds[i]])
            );
            if (
                raceInstance.state() == RaceInstance.RaceState.Created ||
                raceInstance.state() == RaceInstance.RaceState.Started
            ) {
                result[index] = activeRaceIds[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @notice Gets details about a specific race
     * @param raceId The ID of the race
     * @return raceAddress The address of the race instance
     * @return host The address of the race host
     * @return entryFee The entry fee for the race
     * @return currentState The current state of the race
     * @return totalPlayers The total number of players
     * @return prizePool The current prize pool
     */
    function getRaceDetails(uint256 raceId)
        external
        view
        returns (
            address raceAddress,
            address host,
            uint256 entryFee,
            RaceInstance.RaceState currentState,
            uint256 totalPlayers,
            uint256 prizePool
        )
    {
        raceAddress = races[raceId];
        if (raceAddress == address(0)) revert RaceNotFound();

        RaceInstance raceInstance = RaceInstance(payable(raceAddress));
        host = raceHosts[raceId];
        entryFee = raceInstance.entryFee();
        currentState = raceInstance.state();
        totalPlayers = raceInstance.getTotalPlayers();
        prizePool = raceInstance.prizePool();

        return (raceAddress, host, entryFee, currentState, totalPlayers, prizePool);
    }

    /**
     * @notice Marks a race as ended (called by race instance)
     * @param raceId The ID of the race that ended
     * @param winningTeam The team that won (1 or 2)
     */
    function markRaceEnded(uint256 raceId, uint8 winningTeam) external {
        if (races[raceId] != msg.sender) revert Unauthorized();
        isRaceActive[raceId] = false;
        emit RaceEnded(raceId, winningTeam);
    }

    /**
     * @notice Updates the oracle address
     * @param newOracle The new oracle address
     */
    function setOracle(address newOracle) external {
        if (msg.sender != oracle) revert Unauthorized();
        oracle = newOracle;
    }
}

