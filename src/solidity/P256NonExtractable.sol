// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {P256} from "solady/utils/P256.sol";
import {LibBytes} from "solady/utils/LibBytes.sol";
import {EfficientHashLib} from "solady/utils/EfficientHashLib.sol";

contract P256NonExtractable {
    function isValidSignature(bytes32 digest, bytes calldata signature, bytes32 x, bytes32 y)
        public
        view
        returns (bytes4)
    {
        // Require signature to be at least 97 bytes (64 r+s + 32 keyHash + 1 flag)
        if (signature.length < 97) {
            return bytes4(0xffffffff);
        }

        unchecked {
            uint256 n = signature.length - 0x21; // 33 bytes: 32 for keyHash, 1 for flag
            bytes32 keyHash = LibBytes.loadCalldata(signature, n);
            uint256 prehashFlag = uint256(LibBytes.loadCalldata(signature, n + 1)) & 0xff;

            // Truncate the actual signature to r + s (64 bytes)
            signature = LibBytes.truncatedCalldata(signature, n);

            // Apply prehashing if required
            if (prehashFlag != 0) {
                digest = EfficientHashLib.sha2(digest); // sha256(abi.encode(digest))
            }
        }

        // Decode r and s from signature
        (bytes32 r, bytes32 s) = abi.decode(signature, (bytes32, bytes32));
        bool isValid = P256.verifySignature(digest, r, s, x, y);

        return isValid ? bytes4(0x1626ba7e) : bytes4(0xffffffff);
    }
}
