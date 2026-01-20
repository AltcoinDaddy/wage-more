// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title SmartAccount
 * @dev A minimal smart contract wallet designed for gasless meta-transactions.
 * This contract is intended to be used with a ProxyFactory (Minimal Proxy / Clones).
 */
contract SmartAccount is Initializable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // The owner of the wallet (the user's EOA)
    address public owner;

    // Nonce for replay protection
    uint256 public nonce;

    // EIP-712 Domain Separator components
    string public constant NAME = "Wagemore Smart Account";
    string public constant VERSION = "1.0.0";
    bytes32 public DOMAIN_SEPARATOR;

    // Typehash for the Execute functionality
    // keccak256("Execute(address target,uint256 value,bytes data,uint256 nonce)")
    bytes32 public constant EXECUTE_TYPEHASH =
        keccak256(
            "Execute(address target,uint256 value,bytes data,uint256 nonce)"
        );

    event TransactionExecuted(
        address indexed target,
        uint256 value,
        bytes data,
        bytes result
    );
    event Received(address sender, uint256 value);

    /**
     * @dev Initializer for the proxy contract.
     * @param _owner The address of the user's EOA (signer).
     */
    function initialize(address _owner) external initializer {
        require(_owner != address(0), "Invalid owner");
        owner = _owner;

        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                chainId,
                address(this)
            )
        );
    }

    /**
     * @dev Allows the owner or valid signer to execute a transaction.
     * This function is called by the Relayer.
     *
     * @param target The contract to call (e.g., Wagemore Market).
     * @param value ETH value to send.
     * @param data Calldata for the function execution.
     * @param signature The EIP-712 signature from the owner.
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data,
        bytes calldata signature
    ) external payable nonReentrant {
        // 1. Verify Signature
        bytes32 structHash = keccak256(
            abi.encode(EXECUTE_TYPEHASH, target, value, keccak256(data), nonce)
        );

        bytes32 digest = MessageHashUtils.toTypedDataHash(
            DOMAIN_SEPARATOR,
            structHash
        );

        address signer = ECDSA.recover(digest, signature);
        require(signer == owner, "Invalid signature");

        // 2. Increment Nonce (Replay Protection)
        nonce++;

        // 3. Execute Transaction
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Transaction failed");

        emit TransactionExecuted(target, value, data, result);
    }

    /**
     * @dev Standard execute allow for direct calls from owner (optional but useful)
     */
    function executeDirect(
        address target,
        uint256 value,
        bytes calldata data
    ) external payable nonReentrant {
        require(msg.sender == owner, "Only owner");
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Transaction failed");
        emit TransactionExecuted(target, value, data, result);
    }

    // Allow receiving ETH
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
