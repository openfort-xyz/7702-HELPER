# EIP-7702 + ERC-4337 Paymaster Integration - Investigation & Fixes

## Project Overview

This project implements EIP-7702 account delegation with ERC-4337 (Account Abstraction) UserOperations, using a custom PaymasterV3 for gas sponsorship. The main goal is to allow an EOA to delegate its code to a Simple7702Account contract and execute batched transactions with paymaster-sponsored gas.

## Key Components

### Addresses
- **EOA**: `0x2426EDd2D2e445674665D1f79F0D863281055879`
- **Simple7702Account**: `0xe6Cae83BdE06E4c305530e199D7217f42808555B`
- **EntryPoint v0.8**: `0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108`
- **PAYMASTER_V3**: `0xc524309B8F502a0CCE700321B8c60B3b4faeE9dB`
- **Authorized Signer (SIGNER_1)**: `0xd0c4637b0Fac10cba161907D9b6A1135241DeC91`
- **Call Target (RECIVER)**: `0x25B10f9CAdF3f9F7d3d57921fab6Fdf64cC8C7f4`

### Technology Stack
- **EIP-7702**: Account delegation (EOA delegates to contract code)
- **ERC-4337**: Account Abstraction with UserOperations
- **Viem**: Ethereum library for TypeScript
- **Permissionless**: Library for smart account abstraction
- **Pimlico**: Bundler service for gas estimation and UserOperation submission

## Issues Encountered & Fixes

### Issue 1: AA24 Signature Error (Account Signature) ✅ FIXED

**Error**: `UserOperation reverted with reason: AA24 signature error`

**Root Cause**: The `factory: "0x7702"` field was manually set in the UserOperation, causing hash mismatches. The permissionless library's `toSimpleSmartAccount` with `eip7702: true` automatically handles factory logic by setting it to `undefined`.

**Fix**: Removed the manual `factory: "0x7702"` line from `getFreshUserOp()` in `Helpers.ts`

**Location**: `src/paymaster/helpers/Helpers.ts:24-46`

**Key Learning**: When using permissionless library with EIP-7702, let the library handle factory field management. The signature validation in Simple7702Account expects `ECDSA.recover(userOpHash, signature) == address(this)`, where `this` is the EOA address.

### Issue 2: EIP-191 Signature Wrapping for Paymaster ✅ FIXED

**Error**: AA34 signature error due to mismatched hash wrapping

**Root Cause**: The paymaster contract uses EIP-191 message wrapping (`hashMessage`) but the client was double-wrapping or not wrapping correctly.

**Fix**: Updated `signMessageWithEOA()` in `walletsClient.ts` to properly wrap the raw hash once with EIP-191:
```typescript
const wrappedHash = hashMessage({ raw: rawHash });
const signatureObj = await sign({
  hash: wrappedHash,
  privateKey: SIGNER_1
});
const signature = serializeSignature(signatureObj);
```

**Location**: `src/paymaster/clients/walltesClient.ts:58-93`

### Issue 3: PaymasterData Structure - Mode Byte ⚠️ CRITICAL FIX

**Error**: `getHash` contract function reverted

**Root Cause**: The paymasterData structure was missing the MODE_BYTE that the PaymasterV3 contract expects.

**Expected Structure** (from PaymasterV3 contract):
```
paymasterAndData:
- Paymaster address (20 bytes)          [offset 0-19]
- paymasterVerificationGasLimit (16 bytes) [offset 20-35]
- paymasterPostOpGasLimit (16 bytes)    [offset 36-51]
- MODE_BYTE (1 byte)                    [offset 52] ← WAS MISSING!
- validUntil (6 bytes)                  [offset 53-58]
- validAfter (6 bytes)                  [offset 59-64]
- signature (64-65 bytes)               [offset 65+]
```

**Mode Byte Calculation**:
- For VERIFYING_MODE (0): `(0 << 1) | 0 = 0x00`
- For ERC20_MODE (1): `(1 << 1) | 0 = 0x02`

**Fix**: Add mode byte to `createVerifyingModePaymasterData()`:
```typescript
createVerifyingModePaymasterData(validUntil: number, validAfter: number): Hex {
  const modeByte = '0x00'; // VERIFYING_MODE: (0 << 1) | 0 = 0
  const validUntilHex = pad(toHex(validUntil), { size: 6 });
  const validAfterHex = pad(toHex(validAfter), { size: 6 });
  return concat([modeByte, validUntilHex, validAfterHex]) as Hex;
}
```

**Location**: `src/paymaster/helpers/Helpers.ts:80-85`

### Issue 4: Gas Limits Encoding Error ⚠️ CRITICAL FIX

**Error**: Gas limits being encoded as strings instead of numeric values

**Symptom**:
```
accountGasLimits: "0x0000000000000000000030783763623300000000000000000000307834363233"
```
This is encoding the STRING "0x7cb3" as hex bytes, not the numeric value.

**Root Cause**: Pimlico returns gas estimates as hex strings (e.g., `'0x7cb3'`), but these weren't being converted to bigints before being passed to the `toHex()` function in `getAccountGasLimits()` and `getPaymasterAndData()`.

**Fix**: Explicitly convert all gas estimate values from hex strings to bigints:
```typescript
userOp.preVerificationGas = BigInt(gasEstimates.preVerificationGas);
userOp.verificationGasLimit = BigInt(gasEstimates.verificationGasLimit);
userOp.callGasLimit = BigInt(gasEstimates.callGasLimit);
userOp.paymasterVerificationGasLimit = BigInt(gasEstimates.paymasterVerificationGasLimit || 0);
userOp.paymasterPostOpGasLimit = BigInt(gasEstimates.paymasterPostOpGasLimit || 0);
```

**Location**: `src/paymaster/index.ts:49-53`

### Issue 5: Bundler Paymaster Override ✅ FIXED

**Error**: UserOperation timing out with WaitForUserOperationReceiptTimeoutError, custom PAYMASTER_V3 not being used

**Symptom**:
- Code sets `userOp.paymaster = PAYMASTER_V3` at index.ts:77
- But final UserOp uses Pimlico's paymaster: `0x888888888888Ec68A58AB8094Cc1AD20Ba3D2402`
- UserOperation submitted but never confirmed on-chain
- No transactions visible on block explorer

**Root Cause**: The `smartAccountClient` was configured with `paymaster: pimlicoClient` (line 52 in pimlicoClient.ts). When this field is present, Pimlico's bundler automatically overrides the UserOp's paymaster field with their own paymaster for sponsorship, ignoring the custom `userOp.paymaster = PAYMASTER_V3` setting.

**Additional Issues Found**:
1. Wrong chain ID for paymasterClient (11155111 = Ethereum Sepolia instead of 84532 = Base Sepolia)
2. User checking wrong block explorer (Ethereum Sepolia instead of Base Sepolia)

**Fix**:
1. Removed `paymaster: pimlicoClient` from `createSmartAccount()` function in pimlicoClient.ts:47-59
2. Changed paymasterClient chain ID from 11155111 to 84532 in pimlicoClient.ts:32

**Location**: `src/paymaster/clients/pimlicoClient.ts:32,47-59`

**Key Learning**: When using a custom paymaster with Pimlico bundler:
- DO NOT include `paymaster: pimlicoClient` in smartAccountClient configuration
- The bundler will respect the UserOp's paymaster field if no client-level paymaster is configured
- All clients must use the same chain ID (84532 for Base Sepolia)
- Use correct block explorer: `https://base-sepolia.blockscout.com` or `https://sepolia.basescan.org` for Base Sepolia

## Execution Flow

### 1. Authorization Setup (EIP-7702)
```typescript
const authorization = await helpers.getAuthorization(
  walletsClient.walletClientAccount7702,
  walletsClient.walletClientAccount7702.account
);
```
Creates signed authorization for EOA to delegate to Simple7702Account contract.

### 2. UserOperation Construction
```typescript
let userOp: UserOperationWithEip7702Auth = await helpers.getFreshUserOp(authorization);
userOp.sender = walletsClient.walletClientAccount7702.account.address;
userOp.nonce = await getNonce(publicClient, userOp.sender, 0n);
userOp.callData = await helpers.getCallData(RECIVER, 0, '0x');
```
Creates fresh UserOperation with EIP-7702 authorization and empty call.

### 3. Gas Estimation with Pimlico
```typescript
const sponsorFields = await getPaymasterData(pimlicoClient, userOp, chainId);
userOp.paymaster = sponsorFields.paymaster;
userOp.paymasterData = sponsorFields.paymasterData;

const gasEstimates = await estimateUserOperationGas(smartAccountClient, userOp);
```
Uses Pimlico's paymaster temporarily to get accurate gas estimates.

### 4. Switch to Custom PAYMASTER_V3
```typescript
userOp.paymaster = PAYMASTER_V3;
userOp.paymasterData = helpers.createVerifyingModePaymasterData(validUntil, validAfter);

const pmHash = await getHash(publicClient, helpers.VERIFYING_MODE, userOp);
const pmSignature = await walletsClient.signMessageWithEOA(pmHash);

userOp.paymasterData = helpers.appendSignatureToPaymasterData(paymasterDataWithoutSig, pmSignature);
```
Switches to custom paymaster with properly signed paymasterData.

### 5. Sign and Submit
```typescript
const userOpSig = await simpleSmartAccout.signUserOperation(userOp);
userOp.signature = userOpSig;

const userOperationHash = await sendUserOperation(smartAccountClient, userOp, authorization);
const { receipt } = await waitForUserOperationReceipt(smartAccountClient, userOperationHash);
```
Signs UserOperation with account signature and submits to bundler.

## PaymasterAndData Structure

### Complete Breakdown
```
Total structure sent in UserOperation.paymasterAndData:

Byte Range    | Field                           | Size    | Value Example
--------------|---------------------------------|---------|----------------
0-19         | Paymaster Address               | 20 bytes| 0xc524309B8F502a0CCE700321B8c60B3b4faeE9dB
20-35        | paymasterVerificationGasLimit   | 16 bytes| 0x00000000000000000000000000008a8e
36-51        | paymasterPostOpGasLimit         | 16 bytes| 0x00000000000000000000000000000001
52           | MODE_BYTE                       | 1 byte  | 0x00 (VERIFYING_MODE)
53-58        | validUntil                      | 6 bytes | 0x000069022dde
59-64        | validAfter                      | 6 bytes | 0x000000000000
65-129/130   | signature                       | 64-65 bytes | ECDSA signature
```

### PaymasterData Field Content
The `userOp.paymasterData` field contains everything AFTER the gas limits:
```
MODE_BYTE (1) + validUntil (6) + validAfter (6) + signature (64-65) = 77-78 bytes
```

## Contract References

### Simple7702Account.sol
**Location**: `src/Simple7702Account/contracts/accounts/Simple7702Account.sol`

**Key Function**: `_validateSignature()`
```solidity
function _validateSignature(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash
) internal virtual override returns (uint256 validationData) {
    address recovered = ECDSA.recover(userOpHash, userOp.signature);
    bool isValid = recovered == address(this);

    emit SignatureValidationDebug(recovered, address(this), userOpHash, isValid);

    return isValid ? SIG_VALIDATION_SUCCESS : SIG_VALIDATION_FAILED;
}
```

**Critical Detail**: Validates that recovered address equals `address(this)`, which in EIP-7702 context is the EOA address (sender).

### PaymasterV3 Contract
**Location**: `src/PaymasterV3/`

**Key Functions**:
- `getHash()`: Computes hash for signature verification
- `validatePaymasterUserOp()`: Validates paymaster signature and data
- `_parsePaymasterAndData()`: Extracts mode, timestamps, and signature
- `_parseVerifyingConfig()`: Parses validUntil, validAfter, and signature

**Mode Byte Logic** (from `PaymasterHelpers.sol:163`):
```solidity
(_mode << 1) | MODE_AND_ALLOW_ALL_BUNDLERS_LENGTH
```

## Important Constants

### Gas-related
```typescript
maxFeePerGas: 1000066n
maxPriorityFeePerGas: 1000000n
verificationGasLimit: ~31923 (0x7cb3)
callGasLimit: ~17955 (0x4623)
preVerificationGas: ~78349 (0x1320d)
paymasterVerificationGasLimit: ~35470 (0x8a8e)
paymasterPostOpGasLimit: 1
```

### Time-related
```typescript
validUntil = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now
validAfter = 0; // Valid from epoch 0
```

## Debugging Tips

### 1. Check Authorization Nonce
The authorization nonce increments with each delegation:
```typescript
authorization.nonce // Should be 2 for this EOA
```

### 2. Verify Signature Recovery
```typescript
const recovered = await recoverAddress({
  hash: wrappedHash,
  signature: signature,
});
console.log("Expected:", signer_1.address);
console.log("Recovered:", recovered);
```

### 3. Inspect PackedUserOperation
```typescript
const packed = toPackedFromV08(userOp);
console.log("accountGasLimits:", packed.accountGasLimits);
console.log("paymasterAndData:", packed.paymasterAndData);
```

### 4. Monitor EntryPoint Events
The Simple7702Account emits `SignatureValidationDebug` events:
```solidity
event SignatureValidationDebug(
    address indexed recovered,
    address indexed expected,
    bytes32 hash,
    bool isValid
);
```

## Common Pitfalls

1. **Factory Field**: Never manually set `factory: "0x7702"` when using permissionless with EIP-7702
2. **Mode Byte**: Always include the mode byte in paymasterData for PaymasterV3
3. **Gas Limits**: Convert Pimlico's hex string responses to bigints before encoding
4. **EIP-191 Wrapping**: Use `hashMessage({ raw: hash })` for paymaster signatures
5. **Signature Order**: Sign paymaster data BEFORE signing the UserOperation
6. **Bundler Paymaster Override**: When using custom paymaster, DO NOT include `paymaster: pimlicoClient` in smartAccountClient configuration - it will override your custom paymaster
7. **Wrong Block Explorer**: For Base Sepolia (chain 84532), use `https://base-sepolia.blockscout.com` or `https://sepolia.basescan.org/address/[ADDRESS]#aatx`, NOT Ethereum Sepolia explorer
8. **Chain ID Mismatch**: Ensure all clients (pimlico, paymaster, public) use the same chain ID (84532 for Base Sepolia)

## Testing Checklist

- [ ] Authorization nonce matches on-chain delegation
- [ ] EOA has sufficient balance for delegation
- [ ] Paymaster has sufficient deposit in EntryPoint
- [ ] SIGNER_1 is authorized in PaymasterV3
- [ ] All gas limits are bigints (not hex strings)
- [ ] Mode byte is 0x00 for VERIFYING_MODE
- [ ] PaymasterData includes: modeByte + validUntil + validAfter + signature
- [ ] ValidUntil timestamp is in the future
- [ ] Signature recovers to SIGNER_1 address

## Current Status

**AA24 (Account Signature)**: ✅ FIXED
- Removed manual factory field
- Permissionless library handles EIP-7702 correctly

**AA34 (Paymaster Signature)**: ✅ FIXED
- Fixed EIP-191 wrapping
- Fixed paymasterData structure (added mode byte)
- Fixed gas limits encoding (convert hex strings to bigints)

**Bundler Configuration**: ✅ FIXED
- Removed paymaster override from smartAccountClient
- Fixed chain ID mismatch (11155111 → 84532)
- Custom PAYMASTER_V3 now correctly used
- Ready for end-to-end testing

## Block Explorers

**Base Sepolia (Chain ID: 84532)**
- BlockScout: `https://base-sepolia.blockscout.com`
- BaseScan: `https://sepolia.basescan.org`
- Account Abstract Transactions: `https://sepolia.basescan.org/address/[ADDRESS]#aatx`

**Example URLs**:
- EOA transactions: `https://sepolia.basescan.org/address/0x2426EDd2D2e445674665D1f79F0D863281055879#aatx`
- EntryPoint: `https://sepolia.basescan.org/address/0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108`
- PAYMASTER_V3: `https://sepolia.basescan.org/address/0xc524309B8F502a0CCE700321B8c60B3b4faeE9dB`

## ERC20 Token Sponsorship (USDC)

### Overview
In addition to native token (ETH) sponsorship, PaymasterV3 supports ERC20 token sponsorship where users pay gas costs in tokens like USDC instead of ETH. The paymaster charges tokens from the user's account based on the gas consumed and a configured exchange rate.

### Key Differences from Native Sponsorship

**1. Longer PaymasterData Structure**
ERC20 mode requires significantly more data than native VERIFYING_MODE:
- Native: ~78 bytes (mode + validUntil + validAfter + signature)
- ERC20: ~183+ bytes (mode + combined byte + timestamps + token config + signature)

**2. Combined Byte for Optional Fields**
The ERC20 mode uses a `combinedByte` to specify optional fields:
- Bit 0 (0x01): constantFee present
- Bit 1 (0x02): recipient present
- Bit 2 (0x04): preFundInToken present
- 0x00: Basic mode (no optional fields)

**3. Token Approval Required**
Before the first ERC20-sponsored UserOp, the sender must approve the paymaster to spend their tokens. This can be included in the UserOp callData as a batch:
```typescript
// Batch: 1) Approve USDC, 2) Execute call
userOp.callData = await helpers.getCalBatchData();
```

**4. Exchange Rate Calculation**
The exchange rate determines how much USDC to charge for ETH-denominated gas costs:
- USDC has 6 decimals (1 USDC = 1e6 units)
- If 1 ETH = 3000 USDC: `exchangeRate = 3_000_000_000n` (3000 * 1e6)
- Cost formula: `(gasCost * exchangeRate) / 1e18`

### ERC20 PaymasterData Structure (Basic Mode)

```
Complete paymasterAndData structure:

Byte Range    | Field                           | Size    | Value Example (Basic Mode)
--------------|---------------------------------|---------|---------------------------
0-19         | Paymaster Address               | 20 bytes| 0xc524309B8F502a0CCE700321B8c60B3b4faeE9dB
20-35        | paymasterVerificationGasLimit   | 16 bytes| 0x000000000000000000000000000249f0 (150000)
36-51        | paymasterPostOpGasLimit         | 16 bytes| 0x00000000000000000000000000000c350 (50000)
52           | MODE_BYTE                       | 1 byte  | 0x02 (ERC20_MODE << 1)
53           | COMBINED_BYTE                   | 1 byte  | 0x00 (basic mode, no optional fields)
54-59        | validUntil                      | 6 bytes | 0x000069023456
60-65        | validAfter                      | 6 bytes | 0x000000000000
66-85        | token                           | 20 bytes| 0x036CbD53842c5426634e7929541eC2318f3dCF7e (USDC)
86-101       | postOpGas                       | 16 bytes| 0x00000000000000000000000000000c350 (50000)
102-133      | exchangeRate                    | 32 bytes| 0x00000000000000000000000000000000000000000000000000000000b2d05e00 (3B)
134-149      | paymasterValidationGasLimit     | 16 bytes| 0x000000000000000000000000000249f0 (150000)
150-169      | treasury                        | 20 bytes| 0x6E10F8bEfC4069Faa560bF3DdFe441820BbE37d0
170-234/235  | signature                       | 64-65 bytes | ECDSA signature from SIGNER_1
```

**Note**: Optional fields (preFundInToken, constantFee, recipient) would appear after treasury and before signature if their respective bits are set in COMBINED_BYTE.

### Implementation: indexERC20.ts

**Location**: `src/paymaster/indexERC20.ts`

**Key Steps**:
1. Use `helpers.getCalBatchData()` to include USDC approval in callData
2. Create dummy ERC20 paymaster data with `helpers.getDummyPaymasterDataERC20()`
3. Set exchange rate: `3_000_000_000n` (3000 USDC per ETH)
4. Estimate gas with custom PAYMASTER_V3 and ERC20 dummy data
5. Create real ERC20 paymaster data with `helpers.createVerifyingModePaymasterDataERC20()`
6. Get hash from paymaster using `helpers.ERC20_MODE`
7. Sign hash and append signature
8. Submit UserOperation

**Exchange Rate Configuration**:
```typescript
// For real market rate, you might fetch from an oracle
// Static rate for testing: 3000 USDC per 1 ETH
const exchangeRate = 3_000_000_000n; // 3000 * 1e6 (USDC has 6 decimals)
```

**Gas Limits**:
- `paymasterVerificationGasLimit`: 150,000 (higher than native due to ERC20 parsing)
- `paymasterPostOpGasLimit`: 50,000 (covers ERC20 token transfer)

### Testing ERC20 Sponsorship

**Prerequisites**:
1. EOA must have USDC balance (USDC_BASE_SEPOLIA: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`)
2. EOA must have sufficient ETH for EIP-7702 delegation transaction
3. PAYMASTER_V3 must have deposit in EntryPoint
4. SIGNER_1 must be authorized in PaymasterV3
5. Treasury address configured: `0x6E10F8bEfC4069Faa560bF3DdFe441820BbE37d0`

**Run Test**:
```bash
npx ts-node src/paymaster/indexERC20.ts
```

**Expected Flow**:
1. First UserOp: Approves USDC to PAYMASTER_V3 + executes empty call
2. PAYMASTER_V3 validates signature and timestamps
3. EntryPoint executes UserOp
4. PaymasterV3 postOp: Transfers calculated USDC amount from sender to treasury
5. Transaction succeeds, USDC tokens charged

### Troubleshooting ERC20 Mode

**1. "AA33 reverted" - Paymaster Validation Failed**
- Check USDC approval: sender must have approved PAYMASTER_V3
- Verify USDC balance: sender must have enough USDC to cover gas costs
- Check exchange rate: must be > 0
- Verify treasury address: must not be 0x0

**2. "AA36 over paymasterVerificationGasLimit"**
- Increase `paymasterVerificationGasLimit` to at least 150,000
- ERC20 mode requires more gas than native due to longer config parsing

**3. "Token transfer failed" in postOp**
- Ensure sender has sufficient USDC balance
- Verify USDC approval amount is sufficient (use MAX_UINT256 for unlimited)
- Check `paymasterPostOpGasLimit` is at least 50,000

**4. Exchange Rate Issues**
- Ensure exchange rate accounts for token decimals (USDC = 6, ETH = 18)
- Formula: If 1 ETH = X USDC, exchangeRate = X * 1e6
- Test with higher exchange rate first, optimize after successful test

### Helper Functions

**getDummyPaymasterDataERC20()** - `src/paymaster/helpers/Helpers.ts:225-247`
Creates dummy ERC20 paymaster data for gas estimation with basic mode (no optional fields).

**createVerifyingModePaymasterDataERC20()** - `src/paymaster/helpers/Helpers.ts:136-213`
Creates real ERC20 paymaster data with proper structure, supporting optional fields via combinedByte.

**getCalBatchData()** - `src/paymaster/helpers/Helpers.ts:80-112`
Creates batch callData that approves USDC to PAYMASTER_V3 and executes a call to RECIVER.

## Next Steps

1. ✅ Native sponsorship (VERIFYING_MODE) working
2. 🔄 Test ERC20 sponsorship (Basic mode, combinedByte: 0x00)
3. Test ERC20 with optional fields (preFundInToken, constantFee, recipient)
4. Optimize gas limits based on actual usage
5. Implement dynamic exchange rate fetching

## References

- EIP-7702: https://eips.ethereum.org/EIPS/eip-7702
- ERC-4337: https://eips.ethereum.org/EIPS/eip-4337
- EntryPoint v0.8: https://github.com/eth-infinitism/account-abstraction/tree/v0.8
- Permissionless.js: https://docs.pimlico.io/permissionless
- Viem: https://viem.sh/
