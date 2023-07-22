// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity >=0.6.11;

interface IMailbox {
    function dispatch(
        uint32 _destinationDomain,
        bytes32 _recipientAddress,
        bytes calldata _messageBody
    ) external returns (bytes32);

    function process(
        bytes calldata _metadata,
        bytes calldata _message
    ) external;
}