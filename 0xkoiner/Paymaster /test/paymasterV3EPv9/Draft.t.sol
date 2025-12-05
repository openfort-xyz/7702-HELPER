// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.29;

// import {Test, console} from "forge-std/Test.sol";
// import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
// import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
// import {UserOperationLib} from "account-abstraction/core/UserOperationLib.sol";
// import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

// contract AsyncPaymasterSignatureTest is Test {
//     using UserOperationLib for PackedUserOperation;
    
//     // Constants from UserOperationLib
//     bytes8 constant PAYMASTER_SIG_MAGIC = 0x22e325a297439656;
//     uint256 constant PAYMASTER_DATA_OFFSET = 52;
    
//     // Mock addresses
//     address constant ENTRY_POINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032; // v0.7 EntryPoint
//     address payable constant BENEFICIARY = payable(0xBEEF);
    
//     // Accounts
//     uint256 accountOwnerPK;
//     address accountOwner;
//     address account;
    
//     uint256 paymasterOwnerPK;
//     address paymasterOwner;
//     address paymaster;
    
//     // Chain ID for EIP-712
//     uint256 chainId = 1; // mainnet
    
//     function setUp() public {
//         // Create account owner
//         accountOwnerPK = 0xA11CE;
//         accountOwner = vm.addr(accountOwnerPK);
//         account = makeAddr("account"); // The smart account address
        
//         // Create paymaster owner
//         paymasterOwnerPK = 0xBA11;
//         paymasterOwner = vm.addr(paymasterOwnerPK);
//         paymaster = makeAddr("paymaster"); // The paymaster contract address
        
//         console.log("Account Owner:", accountOwner);
//         console.log("Account:", account);
//         console.log("Paymaster Owner:", paymasterOwner);
//         console.log("Paymaster:", paymaster);
//     }
    
//     function test_AsyncPaymasterSignature() external view {
//         console.log("\n=== ASYNC PAYMASTER SIGNATURE FLOW ===\n");
        
//         // =====================================================
//         // STEP 1: Prepare paymasterAndData with MAGIC suffix
//         // =====================================================
//         console.log("STEP 1: Prepare paymasterAndData for parallel signing");
        
//         // Paymaster-specific data (must end with 0x0000!)
//         uint48 validUntil = uint48(block.timestamp + 3600);
//         uint48 validAfter = uint48(block.timestamp);
        
//         bytes memory paymasterData = abi.encode(
//             validUntil,
//             validAfter,
//             uint16(0) // ← CRITICAL! Last 2 bytes MUST be 0x0000
//         );
        
//         // Build paymasterAndData for signing (WITH magic, NO signature yet)
//         bytes memory paymasterAndDataForSigning = abi.encodePacked(
//             paymaster,              // 20 bytes - paymaster address
//             uint128(50000),        // 16 bytes - verificationGasLimit
//             uint128(30000),        // 16 bytes - postOpGasLimit
//             paymasterData,         // N bytes - paymaster-specific data (ends in 0x0000)
//             PAYMASTER_SIG_MAGIC    // 8 bytes - magic for parallel signing
//         );
        
//         console.log("paymasterAndData length (for signing):", paymasterAndDataForSigning.length);
//         console.log("Last 8 bytes (should be magic):");
//         console.logBytes(
//             _slice(paymasterAndDataForSigning, paymasterAndDataForSigning.length - 8, 8)
//         );
//         console.log("2 bytes before magic (should be 0x0000):");
//         console.logBytes(
//             _slice(paymasterAndDataForSigning, paymasterAndDataForSigning.length - 10, 2)
//         );
        
//         // =====================================================
//         // STEP 2: Build UserOperation
//         // =====================================================
//         console.log("\nSTEP 2: Build UserOperation");
        
//         PackedUserOperation memory userOp = PackedUserOperation({
//             sender: account,
//             nonce: 5,
//             initCode: hex"",
//             callData: abi.encodeWithSignature("execute(address,uint256,bytes)", address(0xbAbE), 0, hex""),
//             accountGasLimits: bytes32(abi.encodePacked(uint128(100000), uint128(200000))),
//             preVerificationGas: 21000,
//             gasFees: bytes32(abi.encodePacked(uint128(2 gwei), uint128(50 gwei))),
//             paymasterAndData: paymasterAndDataForSigning,
//             signature: hex"" // Empty for now
//         });
        
//         // =====================================================
//         // STEP 3: Calculate UserOpHash
//         // =====================================================
//         console.log("\nSTEP 3: Calculate UserOpHash");
        
//         bytes32 userOpHash = _getUserOpHash(userOp);
//         console.log("UserOpHash:");
//         console.logBytes32(userOpHash);
        
//         // =====================================================
//         // STEP 4: User signs (PARALLEL to Step 5)
//         // =====================================================
//         console.log("\nSTEP 4: Account owner signs UserOp");
        
//         (uint8 v_account, bytes32 r_account, bytes32 s_account) = vm.sign(accountOwnerPK, userOpHash);
//         bytes memory accountSignature = abi.encodePacked(r_account, s_account, v_account);
        
//         console.log("Account signature:");
//         console.logBytes(accountSignature);
        
//         // =====================================================
//         // STEP 5: Paymaster signs (PARALLEL to Step 4)
//         // =====================================================
//         console.log("\nSTEP 5: Paymaster owner signs UserOp (in parallel!)");
        
//         (uint8 v_pm, bytes32 r_pm, bytes32 s_pm) = vm.sign(paymasterOwnerPK, userOpHash);
//         bytes memory paymasterSignature = abi.encodePacked(r_pm, s_pm, v_pm);
        
//         console.log("Paymaster signature:");
//         console.logBytes(paymasterSignature);
        
//         // =====================================================
//         // STEP 6: Combine signatures into final UserOp
//         // =====================================================
//         console.log("\nSTEP 6: Combine signatures into final UserOp");
        
//         // Update account signature
//         userOp.signature = accountSignature;
        
//         // Update paymasterAndData with paymaster signature
//         // Remove the "for signing" magic, add signature + length + magic
//         bytes memory paymasterAndDataFinal = abi.encodePacked(
//             paymaster,                  // 20 bytes
//             uint128(50000),            // 16 bytes - verificationGasLimit
//             uint128(30000),            // 16 bytes - postOpGasLimit
//             paymasterData,             // N bytes (same data, still ends in 0x0000)
//             paymasterSignature,        // 65 bytes - paymaster signature
//             uint16(paymasterSignature.length), // 2 bytes - signature length
//             PAYMASTER_SIG_MAGIC        // 8 bytes - magic
//         );
        
//         userOp.paymasterAndData = paymasterAndDataFinal;
        
//         console.log("Final paymasterAndData length:", paymasterAndDataFinal.length);
//         console.log("Signature length field:");
//         console.logBytes(
//             _slice(paymasterAndDataFinal, paymasterAndDataFinal.length - 10, 2)
//         );
        
//         // =====================================================
//         // STEP 7: Verify hash remains the same
//         // =====================================================
//         console.log("\nSTEP 7: Verify UserOpHash remains the same");
        
//         bytes32 finalUserOpHash = _getUserOpHash(userOp);
//         console.log("Final UserOpHash:");
//         console.logBytes32(finalUserOpHash);
        
//         console.log("\nHash comparison:");
//         console.log("Original hash == Final hash:", userOpHash == finalUserOpHash);
        
//         assertEq(userOpHash, finalUserOpHash, "UserOpHash should remain the same!");
        
//         // =====================================================
//         // STEP 8: Extract and verify paymaster signature
//         // =====================================================
//         console.log("\nSTEP 8: Extract paymaster signature from paymasterAndData");
        
//         uint256 extractedSigLength = _getPaymasterSignatureLength(userOp.paymasterAndData);
//         console.log("Extracted signature length:", extractedSigLength);
        
//         bytes memory extractedSig = _getPaymasterSignature(userOp.paymasterAndData);
//         console.log("Extracted signature matches original:", 
//             keccak256(extractedSig) == keccak256(paymasterSignature)
//         );
        
//         assertEq(extractedSigLength, 65, "Signature length should be 65");
//         assertEq(extractedSig, paymasterSignature, "Extracted signature should match");
        
//         // =====================================================
//         // STEP 9: Verify signature recovery
//         // =====================================================
//         console.log("\nSTEP 9: Verify signatures can be recovered");
        
//         address recoveredAccount = ecrecover(
//             userOpHash,
//             v_account,
//             r_account,
//             s_account
//         );
//         console.log("Recovered account signer:", recoveredAccount);
//         console.log("Expected account owner:", accountOwner);
//         assertEq(recoveredAccount, accountOwner, "Account signature should be valid");
        
//         address recoveredPaymaster = ecrecover(
//             userOpHash,
//             v_pm,
//             r_pm,
//             s_pm
//         );
//         console.log("Recovered paymaster signer:", recoveredPaymaster);
//         console.log("Expected paymaster owner:", paymasterOwner);
//         assertEq(recoveredPaymaster, paymasterOwner, "Paymaster signature should be valid");
        
//         console.log("\n=== SUCCESS! Async signature flow verified! ===\n");
//     }
    
//     // =====================================================
//     // HELPER FUNCTIONS
//     // =====================================================
    
//     /**
//      * Calculate UserOpHash (simplified version)
//      * In production, use EntryPoint.getUserOpHash()
//      */
//     function _getUserOpHash(PackedUserOperation memory userOp) internal view returns (bytes32) {
//         bytes32 hash = keccak256(_encodeUserOp(userOp));
        
//         // EIP-712 wrapping
//         bytes32 domainSeparator = keccak256(
//             abi.encode(
//                 keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
//                 keccak256("Account Abstraction"),
//                 keccak256("1"),
//                 chainId,
//                 ENTRY_POINT
//             )
//         );
        
//         return MessageHashUtils.toTypedDataHash(domainSeparator, hash);
//     }
    
//     /**
//      * Encode UserOperation for hashing
//      */
//     function _encodeUserOp(PackedUserOperation memory userOp) internal pure returns (bytes memory) {
//         bytes32 typeHash = keccak256(
//             "PackedUserOperation(address sender,uint256 nonce,bytes initCode,bytes callData,bytes32 accountGasLimits,uint256 preVerificationGas,bytes32 gasFees,bytes paymasterAndData)"
//         );
        
//         return abi.encode(
//             typeHash,
//             userOp.sender,
//             userOp.nonce,
//             keccak256(userOp.initCode),
//             keccak256(userOp.callData),
//             userOp.accountGasLimits,
//             userOp.preVerificationGas,
//             userOp.gasFees,
//             _paymasterDataKeccak(userOp.paymasterAndData) // ← KEY! Excludes paymaster signature
//         );
//     }
    
//     /**
//      * Hash paymasterAndData, excluding paymaster signature if present
//      */
//     function _paymasterDataKeccak(bytes memory data) internal pure returns (bytes32) {
//         uint256 pmSigLength = _getPaymasterSignatureLength(data);
        
//         if (pmSigLength > 0) {
//             // Signature present - hash only the data part + magic
//             uint256 dataLength = data.length - pmSigLength - 10; // Exclude sig + len + magic
            
//             // Copy data to memory and append magic
//             bytes memory toHash = new bytes(dataLength + 8);
//             for (uint256 i = 0; i < dataLength; i++) {
//                 toHash[i] = data[i];
//             }
//             // Append magic
//             bytes8 magic = PAYMASTER_SIG_MAGIC;
//             assembly {
//                 mstore(add(toHash, add(32, dataLength)), magic)
//             }
            
//             return keccak256(toHash);
//         }
        
//         // No signature - hash everything
//         return keccak256(data);
//     }
    
//     /**
//      * Get paymaster signature length from paymasterAndData
//      */
//     function _getPaymasterSignatureLength(bytes memory data) internal pure returns (uint256) {
//         uint256 dataLength = data.length;
        
//         if (dataLength < 62) { // MIN_PAYMASTER_DATA_WITH_SUFFIX_LEN
//             return 0;
//         }
        
//         // Check last 8 bytes for magic
//         bytes8 suffix;
//         assembly {
//             suffix := mload(add(data, dataLength))
//         }
        
//         if (suffix != PAYMASTER_SIG_MAGIC) {
//             return 0;
//         }
        
//         // Read signature length (2 bytes before magic)
//         uint16 sigLength;
//         assembly {
//             let pos := add(data, sub(dataLength, 8))
//             sigLength := shr(240, mload(pos))
//         }
        
//         return uint256(sigLength);
//     }
    
//     /**
//      * Extract paymaster signature from paymasterAndData
//      */
//     function _getPaymasterSignature(bytes memory data) internal pure returns (bytes memory) {
//         uint256 sigLength = _getPaymasterSignatureLength(data);
        
//         if (sigLength == 0) {
//             return new bytes(0);
//         }
        
//         bytes memory sig = new bytes(sigLength);
//         uint256 dataLen = data.length;
//         uint256 sigStart = dataLen - sigLength - 10; // Before sig+len+magic
        
//         for (uint256 i = 0; i < sigLength; i++) {
//             sig[i] = data[sigStart + i];
//         }
        
//         return sig;
//     }
    
//     /**
//      * Helper to slice bytes
//      */
//     function _slice(bytes memory data, uint256 start, uint256 length) internal pure returns (bytes memory) {
//         bytes memory result = new bytes(length);
//         for (uint256 i = 0; i < length; i++) {
//             result[i] = data[start + i];
//         }
//         return result;
//     }
// }