// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title WagemoreWithOracle
 * @dev Enhanced prediction market with FREE UMA Optimistic Oracle V3 integration
 *
 * KEY FEATURES:
 * - Market creators can propose resolutions
 * - Community can challenge incorrect resolutions
 * - Fully decentralized and trustless
 * - NO ORACLE FEES (just refundable bonds)
 *
 * UMA Optimistic Oracle V3: https://docs.uma.xyz/
 */

// UMA Optimistic Oracle V3 Interface
interface OptimisticOracleV3Interface {
    function assertTruth(
        bytes memory claim,
        address asserter,
        address callbackRecipient,
        address escalationManager,
        uint64 liveness,
        address currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domainId
    ) external payable returns (bytes32 assertionId);

    function settleAssertion(bytes32 assertionId) external;

    function getAssertion(
        bytes32 assertionId
    )
        external
        view
        returns (
            bool,
            address,
            address,
            address,
            uint64,
            address,
            uint256,
            bytes32,
            bytes32,
            bytes memory
        );
}

contract WagemoreWithOracle is Ownable, ReentrancyGuard, Pausable {
    // =====================================
    // CONFIGURATION
    // =====================================

    enum MarketType {
        Binary,
        Multiple
    }

    // UMA Oracle Configuration
    OptimisticOracleV3Interface public immutable oo;
    uint64 public constant ASSERTION_LIVENESS = 2 hours; // Challenge period
    uint256 public constant ASSERTION_BOND = 0.01 ether; // Refundable bond
    bytes32 public constant DEFAULT_IDENTIFIER = bytes32("ASSERT_TRUTH");

    // =====================================
    // EVENTS
    // =====================================

    event MarketCreated(
        uint64 indexed marketId,
        address indexed creator,
        string title,
        string imageUrl,
        string[] options,
        uint8 optionCount,
        MarketType marketType,
        uint64 endTime,
        uint64 timestamp
    );

    event SharesPurchased(
        uint64 indexed marketId,
        address indexed buyer,
        uint8 optionIndex,
        uint64 amount,
        uint64 timestamp
    );

    event ResolutionProposed(
        uint64 indexed marketId,
        address indexed proposer,
        uint8 proposedWinner,
        bytes32 assertionId,
        uint64 timestamp
    );

    event ResolutionChallenged(
        uint64 indexed marketId,
        address indexed challenger,
        bytes32 assertionId,
        uint64 timestamp
    );

    event MarketResolved(
        uint64 indexed marketId,
        uint8 winningOption,
        bytes32 assertionId,
        uint64 timestamp
    );

    event WinningsClaimed(
        uint64 indexed marketId,
        address indexed claimer,
        uint64 amount,
        uint64 timestamp
    );

    event PlatformFeesWithdrawn(address owner, uint64 amount);
    event CreationFeeUpdated(uint64 newFee);
    event PlatformFeeUpdated(uint64 newBps);

    // =====================================
    // STATE STORAGE
    // =====================================

    struct Market {
        uint64 id;
        address creator;
        uint64 endTime;
        uint64 totalPool;
        uint64[] totalSharesPerOption;
        bool resolved;
        uint8 winningOption;
        uint8 optionCount;
        MarketType marketType;
        bytes32 assertionId; // UMA assertion ID
        bool oracleResolved;
    }

    uint64 public nextMarketId = 1;
    uint64 public platformFeeBps = 1000; // 10.00%
    uint64 public creationFee = 0.001 ether;
    uint64 public accumulatedFees;

    mapping(uint64 => Market) public markets;
    mapping(uint64 => mapping(uint8 => mapping(address => uint256)))
        public bets;

    // Map assertion IDs to market IDs
    mapping(bytes32 => uint64) public assertionIdToMarketId;

    // =====================================
    // CONSTRUCTOR
    // =====================================

    /**
     * @param _optimisticOracle Address of UMA Optimistic Oracle V3
     * Mainnet: 0x...(check UMA docs)
     * Sepolia: 0x...(check UMA docs)
     */
    constructor(address _optimisticOracle) Ownable(msg.sender) {
        require(_optimisticOracle != address(0), "Invalid OO address");
        oo = OptimisticOracleV3Interface(_optimisticOracle);
    }

    // =====================================
    // MAIN FUNCTIONS
    // =====================================

    function createMarket(
        string calldata title,
        string calldata imageUrl,
        string[] calldata optionLabels,
        uint64 endTime,
        MarketType _marketType
    ) external payable whenNotPaused returns (uint64) {
        require(endTime > block.timestamp, "End time must be in future");
        require(bytes(title).length > 0, "Title required");

        if (_marketType == MarketType.Binary) {
            require(optionLabels.length == 2, "Binary must have 2 options");
        } else {
            require(optionLabels.length >= 2, "Multiple needs 2+ options");
            require(optionLabels.length <= 20, "Max 20 options");
        }

        if (msg.sender != owner()) {
            require(msg.value == creationFee, "Incorrect creation fee");
            accumulatedFees += uint64(msg.value);
        }

        uint64 marketId = nextMarketId++;
        uint8 count = uint8(optionLabels.length);

        markets[marketId] = Market({
            id: marketId,
            creator: msg.sender,
            endTime: endTime,
            totalPool: 0,
            totalSharesPerOption: new uint64[](count),
            resolved: false,
            winningOption: 0,
            optionCount: count,
            marketType: _marketType,
            assertionId: bytes32(0),
            oracleResolved: false
        });

        emit MarketCreated(
            marketId,
            msg.sender,
            title,
            imageUrl,
            optionLabels,
            count,
            _marketType,
            endTime,
            uint64(block.timestamp)
        );

        return marketId;
    }

    function purchaseShares(
        uint64 marketId,
        uint8 optionIndex
    ) external payable whenNotPaused {
        require(msg.value > 0, "Bet amount must be > 0");
        Market storage market = markets[marketId];

        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(block.timestamp < market.endTime, "Betting phase ended");
        require(optionIndex < market.optionCount, "Invalid option index");

        market.totalPool += uint64(msg.value);
        market.totalSharesPerOption[optionIndex] += uint64(msg.value);
        bets[marketId][optionIndex][msg.sender] += msg.value;

        emit SharesPurchased(
            marketId,
            msg.sender,
            optionIndex,
            uint64(msg.value),
            uint64(block.timestamp)
        );
    }

    /**
     * @dev Propose a resolution using UMA Optimistic Oracle
     * @param marketId The market to resolve
     * @param winningOption The proposed winning option
     * @param evidence URL or IPFS hash with proof (e.g., "ipfs://Qm...")
     *
     * REQUIRES: ASSERTION_BOND (0.01 ETH) - REFUNDED if not challenged
     */
    function proposeResolution(
        uint64 marketId,
        uint8 winningOption,
        string calldata evidence
    ) external payable nonReentrant {
        Market storage market = markets[marketId];
        require(market.id != 0, "Invalid market");
        require(!market.resolved, "Already resolved");
        require(block.timestamp >= market.endTime, "Market still active");
        require(winningOption < market.optionCount, "Invalid option");
        require(
            market.assertionId == bytes32(0),
            "Resolution already proposed"
        );

        // Only creator or owner can propose
        require(
            msg.sender == market.creator || msg.sender == owner(),
            "Only creator or owner"
        );

        // Must provide bond
        require(msg.value >= ASSERTION_BOND, "Insufficient bond");

        // Construct the claim
        bytes memory claim = abi.encode(
            "Market ",
            marketId,
            " resolved. Winner: Option ",
            winningOption,
            ". Evidence: ",
            evidence
        );

        // Submit assertion to UMA
        bytes32 assertionId = oo.assertTruth{value: ASSERTION_BOND}(
            claim,
            msg.sender, // asserter
            address(this), // callback recipient
            address(0), // no escalation manager
            ASSERTION_LIVENESS,
            address(0), // use native token (ETH)
            ASSERTION_BOND,
            DEFAULT_IDENTIFIER,
            bytes32(0) // no domain
        );

        // Store assertion ID
        market.assertionId = assertionId;
        assertionIdToMarketId[assertionId] = marketId;

        // Refund excess bond
        if (msg.value > ASSERTION_BOND) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - ASSERTION_BOND
            }("");
            require(success, "Refund failed");
        }

        emit ResolutionProposed(
            marketId,
            msg.sender,
            winningOption,
            assertionId,
            uint64(block.timestamp)
        );
    }

    /**
     * @dev Finalize the resolution after challenge period
     * Anyone can call this after ASSERTION_LIVENESS passes
     */
    function finalizeResolution(uint64 marketId) external {
        Market storage market = markets[marketId];
        require(market.id != 0, "Invalid market");
        require(!market.resolved, "Already resolved");
        require(market.assertionId != bytes32(0), "No resolution proposed");

        // Settle the assertion (will revert if still in challenge period)
        oo.settleAssertion(market.assertionId);

        // Get the assertion result
        (bool resolved, , , , , , , , , bytes memory claim) = oo.getAssertion(
            market.assertionId
        );
        require(resolved, "Assertion not settled");

        // Extract winning option from claim
        (, , , uint8 winningOption, , ) = abi.decode(
            claim,
            (string, uint64, string, uint8, string, string)
        );

        market.resolved = true;
        market.oracleResolved = true;
        market.winningOption = winningOption;

        emit MarketResolved(
            marketId,
            winningOption,
            market.assertionId,
            uint64(block.timestamp)
        );
    }

    /**
     * @dev Emergency override by owner (for broken oracle)
     * Requires waiting 7 days after market end
     */
    function emergencyResolve(
        uint64 marketId,
        uint8 winningOption
    ) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.id != 0, "Invalid market");
        require(!market.resolved, "Already resolved");
        require(block.timestamp >= market.endTime + 7 days, "Must wait 7 days");

        market.resolved = true;
        market.winningOption = winningOption;

        emit MarketResolved(
            marketId,
            winningOption,
            bytes32(0),
            uint64(block.timestamp)
        );
    }

    function claimWinnings(uint64 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.resolved, "Market not resolved yet");

        uint8 winner = market.winningOption;
        uint256 userStake = bets[marketId][winner][msg.sender];

        require(userStake > 0, "No winning bets to claim");

        bets[marketId][winner][msg.sender] = 0;

        uint64 totalWinnerStakes = market.totalSharesPerOption[winner];
        uint64 marketPool = market.totalPool;

        require(totalWinnerStakes > 0, "Critical logic error");

        uint64 totalFee = (marketPool * platformFeeBps) / 10000;
        uint64 distributablePool = marketPool - totalFee;

        uint256 payout = (userStake * distributablePool) / totalWinnerStakes;
        uint256 feeShare = (userStake * totalFee) / totalWinnerStakes;
        accumulatedFees += uint64(feeShare);

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit WinningsClaimed(
            marketId,
            msg.sender,
            uint64(payout),
            uint64(block.timestamp)
        );
    }

    // =====================================
    // ADMIN FUNCTIONS
    // =====================================

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees to withdraw");

        accumulatedFees = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");

        emit PlatformFeesWithdrawn(owner(), uint64(amount));
    }

    function setCreationFee(uint64 newFee) external onlyOwner {
        creationFee = newFee;
        emit CreationFeeUpdated(newFee);
    }

    function setPlatformFee(uint64 newBps) external onlyOwner {
        require(newBps <= 2000, "Fee cannot exceed 20%");
        platformFeeBps = newBps;
        emit PlatformFeeUpdated(newBps);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // =====================================
    // VIEW FUNCTIONS
    // =====================================

    function getMarketState(
        uint64 marketId
    )
        external
        view
        returns (
            address creator,
            uint64 endTime,
            uint64 totalPool,
            bool resolved,
            uint8 winningOption,
            uint8 optionCount,
            MarketType marketType,
            bytes32 assertionId,
            bool oracleResolved
        )
    {
        Market storage m = markets[marketId];
        return (
            m.creator,
            m.endTime,
            m.totalPool,
            m.resolved,
            m.winningOption,
            m.optionCount,
            m.marketType,
            m.assertionId,
            m.oracleResolved
        );
    }

    function getUserBet(
        uint64 marketId,
        uint8 optionIndex,
        address user
    ) external view returns (uint256) {
        return bets[marketId][optionIndex][user];
    }

    // Allow contract to receive ETH for bonds
    receive() external payable {}
}
