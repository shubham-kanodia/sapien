// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.11;

import "./verifier.sol";
import "./interfaces/IInterchainGasPaymaster.sol";
import "./interfaces/IMailBox.sol";

contract Identifier {
    using Pairing for *;

    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }

    Verifier verifier;
    address mailBoxAddress;
    address igpAddress;

    constructor(address _mailBoxAddress, address _igpAddress) public {
        mailBoxAddress = _mailBoxAddress;
        igpAddress = _igpAddress;

        verifier = new Verifier();
    }

    uint currUserId;
    mapping (uint => address) identities;
    mapping (uint => bool) faceAdded;

    mapping (address => bool) registered;
    mapping (address => uint) users;

    event UserAdded(address userAddr, address userId);

    function addUserByFace(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[17] memory input
        ) public {

        uint identityNum = input[16];
        
        // Below lines commented out only for demo purposes

        // require(!faceAdded[identityNum], "Identity already associated");
        // require(!registered[msg.sender], "Address already registered");
        faceAdded[identityNum] = true;
        
        // require(!faceAdded[..], "Identity already associated")
        bool verified = verifier.verifyProof(a, b, c, input);

        if (verified) {
            identities[currUserId] = msg.sender;
            users[msg.sender] = currUserId;

            registered[msg.sender] = true;
            currUserId++;
        }
        else {
            revert("Invalid Proof");
        }
        
    }

    function addUser() public {
        require(!registered[msg.sender], "Address already registered");

        identities[currUserId] = msg.sender;
        users[msg.sender] = currUserId;

        currUserId++;

        registered[msg.sender] = true;
    }

    function addressToBytes32(address _addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function updateRemote(
        uint32 _destinationDomain,
        address _recipientAddress,
        uint256 _gasAmount
    ) public payable {
        bytes32 _messageId = IMailbox(mailBoxAddress).dispatch(
            _destinationDomain,
            addressToBytes32(_recipientAddress),
            abi.encode(msg.sender, users[msg.sender])
        );

        IInterchainGasPaymaster(igpAddress).payForGas{value: msg.value}(
            _messageId,
            _destinationDomain,
            _gasAmount,
            msg.sender
        );
    }
}