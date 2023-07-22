// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

import "./interfaces/IMailBox.sol";

contract RemoteIdentity {
    mapping(address => uint) public identities;
    address mailBoxAddress;

    constructor(address _mailBoxAddress) public {
        mailBoxAddress = _mailBoxAddress;
    }

    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes memory _body
    ) external {
        require(msg.sender == mailBoxAddress);
        _origin;
        _sender;
        (address addr, uint256 value) = abi.decode(_body, (address, uint256));
        identities[addr] = value;
    }
}