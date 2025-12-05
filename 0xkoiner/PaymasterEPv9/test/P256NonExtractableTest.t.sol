// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import {Test, console2 as console} from "lib/forge-std/src/Test.sol";
import {P256NonExtractable} from "src/solidity/P256NonExtractable.sol";

contract P256NonExtractableTest is Test {
    P256NonExtractable p;

    function setUp() public {
        p = new P256NonExtractable();
    }

    function test_isValidSignature() public {
        bytes32 HASH = hex"7320d244bfa0841c8bc7d186913b7857b494df9c416c15f58d264dde1e2c7a25";
        bytes32 R = hex"0b8234d0e92c1a6f7f0efca2d00a04a8c666211ed5c4b444e05b25f7b260320b";
        bytes32 S = hex"7813ea7fe178b240bc2c72759525c17b5ef5e442401b6b9312bd28df193c6a45";
        bytes32 X = hex"43d3959eb659864ccf30affdcdbdcb90e2a950e44ed819d5a96864f18b5ce2f2";
        bytes32 Y = hex"b5bd3872defb498868a47649f84937dc25fd1c70be11945cc0a2cfb0f4cc0d15";

        // Placeholder keyHash and prehash flag (0x01 means we MUST prehash for WebCrypto)
        bytes32 keyHash = bytes32(0);
        bytes memory prehashFlag = hex"01";

        // Construct the full wrapped signature: [r || s || keyHash || prehashFlag]
        bytes memory SIGNATURE = bytes.concat(abi.encodePacked(R, S), abi.encodePacked(keyHash), prehashFlag);

        // Validate
        bytes4 result = p.isValidSignature(HASH, SIGNATURE, X, Y);

        // Output and assert
        console.logBytes4(result);
        assertEq(result, bytes4(0x1626ba7e));
    }
}
