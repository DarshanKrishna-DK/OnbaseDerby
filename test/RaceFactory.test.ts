import { expect } from "chai";
import { ethers } from "hardhat";
import { RaceFactory, RaceInstance } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RaceFactory", function () {
  let raceFactory: RaceFactory;
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
  });

  describe("createRace", function () {
    it("Should create a new race with correct entry fee", async function () {
      const tx = await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });

      await expect(tx)
        .to.emit(raceFactory, "RaceCreated")
        .withArgs(0, host.address, await raceFactory.races(0), ENTRY_FEE);

      await expect(tx)
        .to.emit(raceFactory, "PlayerJoined")
        .withArgs(0, host.address, 1);
    });

    it("Should revert if entry fee is zero", async function () {
      await expect(
        raceFactory.connect(host).createRace(0, { value: 0 })
      ).to.be.revertedWithCustomError(raceFactory, "InvalidEntryFee");
    });

    it("Should revert if payment doesn't match entry fee", async function () {
      await expect(
        raceFactory.connect(host).createRace(ENTRY_FEE, {
          value: ethers.parseEther("0.0005"),
        })
      ).to.be.revertedWithCustomError(raceFactory, "InsufficientPayment");
    });

    it("Should assign host to Team 1", async function () {
      await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });

      const raceAddress = await raceFactory.races(0);
      const raceInstance = await ethers.getContractAt(
        "RaceInstance",
        raceAddress
      );

      expect(await raceInstance.playerTeam(host.address)).to.equal(1);
    });
  });

  describe("joinRace", function () {
    beforeEach(async function () {
      await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });
    });

    it("Should allow players to join a race", async function () {
      const tx = await raceFactory.connect(player1).joinRace(0, {
        value: ENTRY_FEE,
      });

      await expect(tx)
        .to.emit(raceFactory, "PlayerJoined")
        .withArgs(0, player1.address, 2); // Team 2 (alternating assignment)
    });

    it("Should alternate team assignments", async function () {
      // Player1 joins (Team 2 - total players = 1, 1 % 2 = 1, so team 2)
      await raceFactory.connect(player1).joinRace(0, {
        value: ENTRY_FEE,
      });

      // Player2 joins (Team 1 - total players = 2, 2 % 2 = 0, so team 1)
      await raceFactory.connect(player2).joinRace(0, {
        value: ENTRY_FEE,
      });

      // Player3 joins (Team 2 - total players = 3, 3 % 2 = 1, so team 2)
      await raceFactory.connect(player3).joinRace(0, {
        value: ENTRY_FEE,
      });

      const raceAddress = await raceFactory.races(0);
      const raceInstance = await ethers.getContractAt(
        "RaceInstance",
        raceAddress
      );

      expect(await raceInstance.playerTeam(player1.address)).to.equal(2);
      expect(await raceInstance.playerTeam(player2.address)).to.equal(1);
      expect(await raceInstance.playerTeam(player3.address)).to.equal(2);
    });

    it("Should revert if race doesn't exist", async function () {
      await expect(
        raceFactory.connect(player1).joinRace(999, {
          value: ENTRY_FEE,
        })
      ).to.be.revertedWithCustomError(raceFactory, "RaceNotFound");
    });

    it("Should revert if payment doesn't match entry fee", async function () {
      await expect(
        raceFactory.connect(player1).joinRace(0, {
          value: ethers.parseEther("0.0005"),
        })
      ).to.be.revertedWithCustomError(raceFactory, "InsufficientPayment");
    });

    it("Should increase prize pool with each player", async function () {
      const raceAddress = await raceFactory.races(0);
      const raceInstance = await ethers.getContractAt(
        "RaceInstance",
        raceAddress
      );

      await raceFactory.connect(player1).joinRace(0, {
        value: ENTRY_FEE,
      });

      await raceFactory.connect(player2).joinRace(0, {
        value: ENTRY_FEE,
      });

      const prizePool = await raceInstance.prizePool();
      expect(prizePool).to.equal(ENTRY_FEE * 3n); // Host + 2 players
    });
  });

  describe("startRace", function () {
    beforeEach(async function () {
      await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });
      await raceFactory.connect(player1).joinRace(0, {
        value: ENTRY_FEE,
      });
    });

    it("Should allow host to start the race", async function () {
      const tx = await raceFactory.connect(host).startRace(0);
      await expect(tx).to.emit(raceFactory, "RaceStarted").withArgs(0);

      const raceAddress = await raceFactory.races(0);
      const raceInstance = await ethers.getContractAt(
        "RaceInstance",
        raceAddress
      );

      expect(await raceInstance.state()).to.equal(1); // Started state
    });

    it("Should revert if non-host tries to start", async function () {
      await expect(
        raceFactory.connect(player1).startRace(0)
      ).to.be.revertedWithCustomError(raceFactory, "Unauthorized");
    });

    it("Should revert if race doesn't exist", async function () {
      await expect(
        raceFactory.connect(host).startRace(999)
      ).to.be.revertedWithCustomError(raceFactory, "RaceNotFound");
    });
  });

  describe("getActiveRaces", function () {
    it("Should return empty array when no races exist", async function () {
      const activeRaces = await raceFactory.getActiveRaces();
      expect(activeRaces.length).to.equal(0);
    });

    it("Should return created races", async function () {
      await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });
      await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });

      const activeRaces = await raceFactory.getActiveRaces();
      expect(activeRaces.length).to.equal(2);
      expect(activeRaces[0]).to.equal(0);
      expect(activeRaces[1]).to.equal(1);
    });
  });

  describe("getRaceDetails", function () {
    it("Should return correct race details", async function () {
      await raceFactory.connect(host).createRace(ENTRY_FEE, {
        value: ENTRY_FEE,
      });

      const details = await raceFactory.getRaceDetails(0);

      expect(details.host).to.equal(host.address);
      expect(details.entryFee).to.equal(ENTRY_FEE);
      expect(details.currentState).to.equal(0); // Created state
      expect(details.totalPlayers).to.equal(1);
      expect(details.prizePool).to.equal(ENTRY_FEE);
    });
  });
});

