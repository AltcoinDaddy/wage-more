// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./SmartAccount.sol";

/**
 * @title SmartAccountFactory
 * @dev Factory to deploy SmartAccount proxies deterministically.
 */
contract SmartAccountFactory {
    address public immutable implementation;

    event AccountCreated(address indexed account, address indexed owner);

    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation");
        implementation = _implementation;
    }

    /**
     * @dev Deploys a new SmartAccount proxy using CREATE2.
     * The address is deterministic based on the owner's address.
     */
    function deployAccount(address owner) external returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(owner));
        address proxy = Clones.cloneDeterministic(implementation, salt);

        // Initialize the proxy
        SmartAccount(payable(proxy)).initialize(owner);

        emit AccountCreated(proxy, owner);
        return proxy;
    }

    /**
     * @dev Predicts the address of the SmartAccount for a given owner.
     * Useful for the frontend/Relayer to know the address before deployment.
     */
    function getAccountAddress(address owner) external view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(owner));
        return Clones.predictDeterministicAddress(implementation, salt);
    }
}
