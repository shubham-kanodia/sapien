//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
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

    event UserAdded(address userAddr, address userId);

    function addUserByFace(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[17] memory input
        ) public {
        
        // require(!faceAdded[..], "Identity already associated")
        bool verified = verifier.verifyProof(a, b, c, input);

        if (verified) {
            identities[currUserId] = msg.sender;
            currUserId++;
        }
        else {
            revert("Invalid Proof");
        }
        
    }
}