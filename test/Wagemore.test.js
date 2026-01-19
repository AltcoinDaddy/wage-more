const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Wagemore", function () {
  let wagemore;
  let owner;
  let creator;
  let user1;
  let user2;
  let user3;

  const CREATION_FEE = ethers.parseEther("0.001");
  const BET_AMOUNT = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, creator, user1, user2, user3] = await ethers.getSigners();

    const Wagemore = await ethers.getContractFactory("Wagemore");
    wagemore = await Wagemore.deploy();
    await wagemore.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wagemore.owner()).to.equal(owner.address);
    });

    it("Should have correct initial settings", async function () {
      expect(await wagemore.platformFeeBps()).to.equal(1000n); // 10%
      expect(await wagemore.creationFee()).to.equal(CREATION_FEE);
      expect(await wagemore.nextMarketId()).to.equal(1n);
    });
  });

  describe("Market Creation", function () {
    it("Should create a binary market", async function () {
      const futureTime = (await time.latest()) + 86400; // +1 day
      
      const tx = await wagemore.connect(creator).createMarket(
        "Will BTC hit $100k?",
        "https://example.com/btc.png",
        ["Yes", "No"],
        futureTime,
        0, // Binary
        { value: CREATION_FEE }
      );

      await expect(tx)
        .to.emit(wagemore, "MarketCreated")
        .withArgs(
          1n, // marketId
          creator.address,
          "Will BTC hit $100k?",
          "https://example.com/btc.png",
          ["Yes", "No"],
          2, // optionCount
          0, // MarketType.Binary
          futureTime,
          await time.latest()
        );

      const marketState = await wagemore.getMarketState(1);
      expect(marketState.creator).to.equal(creator.address);
      expect(marketState.optionCount).to.equal(2);
      expect(marketState.resolved).to.equal(false);
    });

    it("Should create a multiple choice market", async function () {
      const futureTime = (await time.latest()) + 86400;
      
      await wagemore.connect(creator).createMarket(
        "Who will win?",
        "https://example.com/election.png",
        ["Alice", "Bob", "Charlie", "Diana"],
        futureTime,
        1, // Multiple
        { value: CREATION_FEE }
      );

      const marketState = await wagemore.getMarketState(1);
      expect(marketState.optionCount).to.equal(4);
      expect(marketState.marketType).to.equal(1); // Multiple
    });

    it("Should fail if end time is in the past", async function () {
      const pastTime = (await time.latest()) - 86400;
      
      await expect(
        wagemore.connect(creator).createMarket(
          "Test",
          "https://example.com/test.png",
          ["Yes", "No"],
          pastTime,
          0,
          { value: CREATION_FEE }
        )
      ).to.be.revertedWith("End time must be in future");
    });

    it("Should fail with incorrect creation fee", async function () {
      const futureTime = (await time.latest()) + 86400;
      
      await expect(
        wagemore.connect(creator).createMarket(
          "Test",
          "https://example.com/test.png",
          ["Yes", "No"],
          futureTime,
          0,
          { value: ethers.parseEther("0.0005") }
        )
      ).to.be.revertedWith("Incorrect creation fee");
    });

    it("Owner should create market without fee", async function () {
      const futureTime = (await time.latest()) + 86400;
      
      await expect(
        wagemore.connect(owner).createMarket(
          "Test",
          "https://example.com/test.png",
          ["Yes", "No"],
          futureTime,
          0,
          { value: 0 }
        )
      ).to.not.be.reverted;
    });
  });

  describe("Purchasing Shares", function () {
    let marketId;
    let endTime;

    beforeEach(async function () {
      endTime = (await time.latest()) + 86400;
      const tx = await wagemore.connect(creator).createMarket(
        "Will BTC hit $100k?",
        "https://example.com/btc.png",
        ["Yes", "No"],
        endTime,
        0,
        { value: CREATION_FEE }
      );
      marketId = 1n;
    });

    it("Should allow purchasing shares", async function () {
      await expect(
        wagemore.connect(user1).purchaseShares(marketId, 0, { value: BET_AMOUNT })
      ).to.emit(wagemore, "SharesPurchased")
        .withArgs(marketId, user1.address, 0, BET_AMOUNT, await time.latest());

      const userBet = await wagemore.getUserBet(marketId, 0, user1.address);
      expect(userBet).to.equal(BET_AMOUNT);
    });

    it("Should track total pool correctly", async function () {
      await wagemore.connect(user1).purchaseShares(marketId, 0, { value: BET_AMOUNT });
      await wagemore.connect(user2).purchaseShares(marketId, 1, { value: BET_AMOUNT });

      const marketState = await wagemore.getMarketState(marketId);
      expect(marketState.totalPool).to.equal(BET_AMOUNT * 2n);
    });

    it("Should fail if betting after end time", async function () {
      await time.increaseTo(endTime + 1);

      await expect(
        wagemore.connect(user1).purchaseShares(marketId, 0, { value: BET_AMOUNT })
      ).to.be.revertedWith("Betting phase ended");
    });

    it("Should fail if invalid option index", async function () {
      await expect(
        wagemore.connect(user1).purchaseShares(marketId, 5, { value: BET_AMOUNT })
      ).to.be.revertedWith("Invalid option index");
    });

    it("Should fail if bet amount is zero", async function () {
      await expect(
        wagemore.connect(user1).purchaseShares(marketId, 0, { value: 0 })
      ).to.be.revertedWith("Bet amount must be > 0");
    });
  });

  describe("Market Resolution", function () {
    let marketId;
    let endTime;

    beforeEach(async function () {
      endTime = (await time.latest()) + 86400;
      await wagemore.connect(creator).createMarket(
        "Will BTC hit $100k?",
        "https://example.com/btc.png",
        ["Yes", "No"],
        endTime,
        0,
        { value: CREATION_FEE }
      );
      marketId = 1n;

      // Add some bets
      await wagemore.connect(user1).purchaseShares(marketId, 0, { value: BET_AMOUNT });
      await wagemore.connect(user2).purchaseShares(marketId, 1, { value: BET_AMOUNT });
    });

    it("Creator should be able to resolve market", async function () {
      await expect(
        wagemore.connect(creator).resolveMarket(marketId, 0)
      ).to.emit(wagemore, "MarketResolved")
        .withArgs(marketId, 0, await time.latest());

      const marketState = await wagemore.getMarketState(marketId);
      expect(marketState.resolved).to.equal(true);
      expect(marketState.winningOption).to.equal(0);
    });

    it("Owner should be able to resolve market", async function () {
      await expect(
        wagemore.connect(owner).resolveMarket(marketId, 1)
      ).to.emit(wagemore, "MarketResolved");

      const marketState = await wagemore.getMarketState(marketId);
      expect(marketState.resolved).to.equal(true);
      expect(marketState.winningOption).to.equal(1);
    });

    it("Non-creator/non-owner should not be able to resolve", async function () {
      await expect(
        wagemore.connect(user1).resolveMarket(marketId, 0)
      ).to.be.revertedWith("Only creator or owner can resolve");
    });

    it("Should fail if already resolved", async function () {
      await wagemore.connect(creator).resolveMarket(marketId, 0);

      await expect(
        wagemore.connect(creator).resolveMarket(marketId, 1)
      ).to.be.revertedWith("Already resolved");
    });

    it("Should fail with invalid winning option", async function () {
      await expect(
        wagemore.connect(creator).resolveMarket(marketId, 5)
      ).to.be.revertedWith("Invalid winning option");
    });
  });

  describe("Claiming Winnings", function () {
    let marketId;

    beforeEach(async function () {
      const endTime = (await time.latest()) + 86400;
      await wagemore.connect(creator).createMarket(
        "Will BTC hit $100k?",
        "https://example.com/btc.png",
        ["Yes", "No"],
        endTime,
        0,
        { value: CREATION_FEE }
      );
      marketId = 1n;
    });

    it("Should calculate and transfer correct payout", async function () {
      // User1 bets 1 ETH on option 0 (winner)
      // User2 bets 1 ETH on option 1 (loser)
      await wagemore.connect(user1).purchaseShares(marketId, 0, { value: ethers.parseEther("1") });
      await wagemore.connect(user2).purchaseShares(marketId, 1, { value: ethers.parseEther("1") });

      // Resolve to option 0
      await wagemore.connect(creator).resolveMarket(marketId, 0);

      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await wagemore.connect(user1).claimWinnings(marketId);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);

      // User1 should receive 1 ETH (principal) + 0.9 ETH (loser's bet minus 10% fee)
      // Total pool: 2 ETH
      // Fee: 0.2 ETH (10%)
      // Distributable: 1.8 ETH
      // User1's share: 100% = 1.8 ETH
      const expectedPayout = ethers.parseEther("1.8");
      const actualPayout = balanceAfter - balanceBefore + gasCost;

      expect(actualPayout).to.be.closeTo(expectedPayout, ethers.parseEther("0.01"));
    });

    it("Should handle multiple winners proportionally", async function () {
      // User1: 2 ETH on option 0
      // User2: 1 ETH on option 0
      // User3: 3 ETH on option 1 (loser)
      await wagemore.connect(user1).purchaseShares(marketId, 0, { value: ethers.parseEther("2") });
      await wagemore.connect(user2).purchaseShares(marketId, 0, { value: ethers.parseEther("1") });
      await wagemore.connect(user3).purchaseShares(marketId, 1, { value: ethers.parseEther("3") });

      await wagemore.connect(creator).resolveMarket(marketId, 0);

      // Total pool: 6 ETH
      // Fee: 0.6 ETH
      // Distributable: 5.4 ETH
      // User1's stake: 2/3 of winning pool → 2/3 * 5.4 = 3.6 ETH
      // User2's stake: 1/3 of winning pool → 1/3 * 5.4 = 1.8 ETH

      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
      const tx1 = await wagemore.connect(user1).claimWinnings(marketId);
      const receipt1 = await tx1.wait();
      const gasCost1 = receipt1.gasUsed * receipt1.gasPrice;
      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      const user1Payout = user1BalanceAfter - user1BalanceBefore + gasCost1;

      expect(user1Payout).to.be.closeTo(ethers.parseEther("3.6"), ethers.parseEther("0.01"));
    });

    it("Should fail if market not resolved", async function () {
      await wagemore.connect(user1).purchaseShares(marketId, 0, { value: BET_AMOUNT });

      await expect(
        wagemore.connect(user1).claimWinnings(marketId)
      ).to.be.revertedWith("Market not resolved yet");
    });

    it("Should fail if user has no winning bets", async function () {
      await wagemore.connect(user1).purchaseShares(marketId, 1, { value: BET_AMOUNT });
      await wagemore.connect(creator).resolveMarket(marketId, 0);

      await expect(
        wagemore.connect(user1).claimWinnings(marketId)
      ).to.be.revertedWith("No winning bets to claim");
    });

    it("Should prevent double claiming", async function () {
      await wagemore.connect(user1).purchaseShares(marketId, 0, { value: BET_AMOUNT });
      await wagemore.connect(creator).resolveMarket(marketId, 0);

      await wagemore.connect(user1).claimWinnings(marketId);
      
      await expect(
        wagemore.connect(user1).claimWinnings(marketId)
      ).to.be.revertedWith("No winning bets to claim");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to withdraw fees", async function () {
      // Create markets to accumulate fees
      const endTime = (await time.latest()) + 86400;
      await wagemore.connect(creator).createMarket(
        "Test",
        "image.png",
        ["Yes", "No"],
        endTime,
        0,
        { value: CREATION_FEE }
      );

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await wagemore.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      const withdrawn = ownerBalanceAfter - ownerBalanceBefore + gasCost;
      expect(withdrawn).to.be.closeTo(CREATION_FEE, ethers.parseEther("0.0001"));
    });

    it("Should update platform fee", async function () {
      await wagemore.connect(owner).setPlatformFee(500); // 5%
      expect(await wagemore.platformFeeBps()).to.equal(500n);
    });

    it("Should fail if platform fee > 20%", async function () {
      await expect(
        wagemore.connect(owner).setPlatformFee(2100)
      ).to.be.revertedWith("Fee cannot exceed 20%");
    });

    it("Should pause and unpause", async function () {
      await wagemore.connect(owner).pause();
      
      const endTime = (await time.latest()) + 86400;
      await expect(
        wagemore.connect(creator).createMarket(
          "Test",
          "image.png",
          ["Yes", "No"],
          endTime,
          0,
          { value: CREATION_FEE }
        )
      ).to.be.reverted;

      await wagemore.connect(owner).unpause();
      
      await expect(
        wagemore.connect(creator).createMarket(
          "Test",
          "image.png",
          ["Yes", "No"],
          endTime,
          0,
          { value: CREATION_FEE }
        )
      ).to.not.be.reverted;
    });
  });
});
