import { expect } from "chai";
import { ethers } from "hardhat";
import { RaceFactory, RaceInstance } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RaceInstance", function () {
  let raceFactory: RaceFactory;
  let raceInstance: RaceInstance;
  let oracle: HardhatEthersSigner;
  let host: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;
  let player3: HardhatEthersSigner;

  const ENTRY_FEE = ethers.parseEther("0.001");

  beforeEach(async function () {
    [oracle, host, player1, player2, player3] = await ethers.getSigners();

    const RaceFactoryContract = await ethers.getContractFactory("RaceFactory");
    raceFactory = await RaceFactoryContract.deploy(oracle.address);
    await raceFactory.waitForDeployment();

    // Create a race
    await raceFactory.connect(host).createRace(ENTRY_FEE, {
      value: ENTRY_FEE,
    });

    const raceAddress = await raceFactory.races(0);
    raceInstance = await ethers.getContractAt("RaceInstance", raceAddress);

    // Add players to both teams
    await raceFactory.connect(player1).joinRace(0, {
      value: ENTRY_FEE,
    }); // Team 2
    await raceFactory.connect(player2).joinRace(0, {
      value: ENTRY_FEE,
    }); // Team 1
    await raceFactory.connect(player3).joinRace(0, {
      value: ENTRY_FEE,
    }); // Team 2
  });

  describe("Initialization", function () {
    it("Should set correct initial values", async function () {
      expect(await raceInstance.raceId()).to.equal(0);
      expect(await raceInstance.entryFee()).to.equal(ENTRY_FEE);
      expect(await raceInstance.host()).to.equal(host.address);
      expect(await raceInstance.state()).to.equal(0); // Created
      expect(await raceInstance.prizePool()).to.equal(ENTRY_FEE * 4n);
    });

    it("Should have correct team assignments", async function () {
      expect(await raceInstance.playerTeam(host.address)).to.equal(1);
      expect(await raceInstance.playerTeam(player1.address)).to.equal(2);
      expect(await raceInstance.playerTeam(player2.address)).to.equal(1);
      expect(await raceInstance.playerTeam(player3.address)).to.equal(2);
    });
  });

  describe("startRace", function () {
    it("Should start race when called by host through factory", async function () {
      await raceFactory.connect(host).startRace(0);
      expect(await raceInstance.state()).to.equal(1); // Started
    });

    it("Should emit RaceStarted event", async function () {
      const tx = await raceFactory.connect(host).startRace(0);
      const receipt = await tx.wait();

      // Check for RaceStarted event from RaceInstance
      const raceInstanceInterface = raceInstance.interface;
      const logs = receipt?.logs || [];

      let foundEvent = false;
      for (const log of logs) {
        try {
          const parsed = raceInstanceInterface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
          if (parsed?.name === "RaceStarted") {
            foundEvent = true;
            break;
          }
        } catch (e) {
          // Not our event, continue
        }
      }

      expect(foundEvent).to.be.true;
    });

    it("Should revert if only one team has players", async function () {
      // Create a new race with only one team
      await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });

      await expect(
        raceFactory.connect(host).startRace(1)
      ).to.be.revertedWithCustomError(raceInstance, "NotEnoughPlayers");
    });
  });

  describe("recordResults", function () {
    beforeEach(async function () {
      await raceFactory.connect(host).startRace(0);
    });

    it("Should record results and set winning team", async function () {
      // Team 1 wins (host and player2)
      const winners = [host.address, player2.address];
      const tapCounts = [100, 150];

      await raceInstance
        .connect(oracle)
        .recordResults(winners, tapCounts);

      expect(await raceInstance.state()).to.equal(2); // Ended
      expect(await raceInstance.winningTeam()).to.equal(1);
      expect(await raceInstance.team1TotalTaps()).to.equal(250);
    });

    it("Should revert if not called by oracle", async function () {
      const winners = [host.address];
      const tapCounts = [100];

      await expect(
        raceInstance.connect(host).recordResults(winners, tapCounts)
      ).to.be.revertedWithCustomError(raceInstance, "OnlyOracle");
    });

    it("Should revert if arrays have different lengths", async function () {
      const winners = [host.address, player2.address];
      const tapCounts = [100]; // Mismatched length

      await expect(
        raceInstance.connect(oracle).recordResults(winners, tapCounts)
      ).to.be.revertedWithCustomError(raceInstance, "InvalidArrayLength");
    });

    it("Should revert if winners are from different teams", async function () {
      const winners = [host.address, player1.address]; // Different teams
      const tapCounts = [100, 100];

      await expect(
        raceInstance.connect(oracle).recordResults(winners, tapCounts)
      ).to.be.revertedWithCustomError(raceInstance, "InvalidTeam");
    });

    it("Should emit RaceEnded event", async function () {
      const winners = [host.address, player2.address];
      const tapCounts = [100, 150];

      await expect(
        raceInstance.connect(oracle).recordResults(winners, tapCounts)
      )
        .to.emit(raceInstance, "RaceEnded")
        .withArgs(1, 250, 0);
    });
  });

  describe("claimWinnings", function () {
    beforeEach(async function () {
      await raceFactory.connect(host).startRace(0);

      // Team 1 wins
      const winners = [host.address, player2.address];
      const tapCounts = [100, 150]; // Host: 40%, Player2: 60%

      await raceInstance
        .connect(oracle)
        .recordResults(winners, tapCounts);
    });

    it("Should allow winners to claim proportional winnings", async function () {
      const prizePool = await raceInstance.prizePool();
      const hostShare = (prizePool * 100n) / 250n; // 40%

      const balanceBefore = await ethers.provider.getBalance(host.address);
      const tx = await raceInstance.connect(host).claimWinnings();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(host.address);

      expect(balanceAfter).to.be.closeTo(
        balanceBefore - gasUsed + hostShare,
        ethers.parseEther("0.0001") // Small tolerance for gas price variations
      );
    });

    it("Should mark player as claimed", async function () {
      await raceInstance.connect(host).claimWinnings();
      expect(await raceInstance.hasClaimed(host.address)).to.be.true;
    });

    it("Should revert if player already claimed", async function () {
      await raceInstance.connect(host).claimWinnings();

      await expect(
        raceInstance.connect(host).claimWinnings()
      ).to.be.revertedWithCustomError(raceInstance, "AlreadyClaimed");
    });

    it("Should revert if player is not a winner", async function () {
      await expect(
        raceInstance.connect(player1).claimWinnings()
      ).to.be.revertedWithCustomError(raceInstance, "NotAWinner");
    });

    it("Should distribute winnings proportionally", async function () {
      const prizePool = await raceInstance.prizePool();

      const hostClaimable = await raceInstance.getClaimableAmount(
        host.address
      );
      const player2Claimable = await raceInstance.getClaimableAmount(
        player2.address
      );

      expect(hostClaimable).to.equal((prizePool * 100n) / 250n); // 40%
      expect(player2Claimable).to.equal((prizePool * 150n) / 250n); // 60%
    });

    it("Should emit WinningsClaimed event", async function () {
      const prizePool = await raceInstance.prizePool();
      const hostShare = (prizePool * 100n) / 250n;

      await expect(raceInstance.connect(host).claimWinnings())
        .to.emit(raceInstance, "WinningsClaimed")
        .withArgs(host.address, hostShare);
    });
  });

  describe("getClaimableAmount", function () {
    it("Should return 0 for race not ended", async function () {
      const claimable = await raceInstance.getClaimableAmount(host.address);
      expect(claimable).to.equal(0);
    });

    it("Should return 0 for non-winners", async function () {
      await raceFactory.connect(host).startRace(0);
      await raceInstance
        .connect(oracle)
        .recordResults([host.address], [100]);

      const claimable = await raceInstance.getClaimableAmount(
        player1.address
      );
      expect(claimable).to.equal(0);
    });

    it("Should return correct amount for winners", async function () {
      await raceFactory.connect(host).startRace(0);
      await raceInstance
        .connect(oracle)
        .recordResults([host.address, player2.address], [100, 150]);

      const prizePool = await raceInstance.prizePool();
      const hostClaimable = await raceInstance.getClaimableAmount(
        host.address
      );

      expect(hostClaimable).to.equal((prizePool * 100n) / 250n);
    });
  });

  describe("Team getters", function () {
    it("Should return correct Team 1 players", async function () {
      const team1 = await raceInstance.getTeam1Players();
      expect(team1.length).to.equal(2);
      expect(team1).to.include(host.address);
      expect(team1).to.include(player2.address);
    });

    it("Should return correct Team 2 players", async function () {
      const team2 = await raceInstance.getTeam2Players();
      expect(team2.length).to.equal(2);
      expect(team2).to.include(player1.address);
      expect(team2).to.include(player3.address);
    });

    it("Should return correct total players", async function () {
      const total = await raceInstance.getTotalPlayers();
      expect(total).to.equal(4);
    });
  });
});

