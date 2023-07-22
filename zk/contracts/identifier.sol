// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.11;

import "./verifier.sol";

contract Identifier {
    using Pairing for *;

    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }

    Verifier verifier;
    
    constructor() public {
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
        
        require(!faceAdded[identityNum], "Identity already associated");
        require(!registered[msg.sender], "Address already registered");
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
}