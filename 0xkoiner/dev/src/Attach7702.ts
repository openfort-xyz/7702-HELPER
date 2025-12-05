import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const {
  IMPLEMENTATION_CONTRACT,
  PRIVATE_KEY_OPENFORT_USER_7702,
  ADDRESS_OPENFORT_USER_ADDRESS_7702,
  BASE_SEPOLIA_RPC_URL
} = process.env;

// EIP-7702 constants
const EIP7702_TX_TYPE = 0x04;
const CHAIN_ID = 84532; // Base Sepolia

// Helper to RLP encode
function rlpEncode(data: any[]): string {
  return ethers.encodeRlp(data);
}

async function main() {
  console.log("=== EIP-7702 Account Delegation Setup (Type 4 Transaction) ===\n");

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY_OPENFORT_USER_7702!, provider);

  console.log("Configuration:");
  console.log("  EOA Address:", wallet.address);
  console.log("  Implementation:", IMPLEMENTATION_CONTRACT);
  console.log("  Chain ID:", CHAIN_ID);

  // Check EOA balance
  const balance = await provider.getBalance(wallet.address);
  console.log("\nEOA Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("\n❌ Error: EOA has no balance to pay for gas");
    process.exit(1);
  }

  // Check current code at EOA
  const currentCode = await provider.getCode(wallet.address);
  if (currentCode && currentCode !== '0x') {
    console.log("\n✓ EOA already has delegated code:", currentCode.slice(0, 20) + "...");
  } else {
    console.log("\n○ EOA has no delegated code yet");
  }

  // Get transaction parameters
  const txNonce = await provider.getTransactionCount(wallet.address);
  const feeData = await provider.getFeeData();

  console.log("\n=== Transaction Parameters ===");
  console.log("  Transaction Nonce:", txNonce);
  console.log("  Max Fee Per Gas:", feeData.maxFeePerGas?.toString());
  console.log("  Max Priority Fee:", feeData.maxPriorityFeePerGas?.toString());

  // Get authorization nonce (for EIP-7702)
  const authNonce = await provider.getTransactionCount(wallet.address);

  console.log("\n=== Creating EIP-7702 Authorization ===");
  console.log("  Authorization Nonce:", authNonce);

  // Create authorization message hash according to EIP-7702
  // Hash = keccak256(MAGIC || rlp([chain_id, address, nonce]))
  const authorizationTuple = [
    ethers.toBeHex(CHAIN_ID),
    IMPLEMENTATION_CONTRACT,
    ethers.toBeHex(authNonce)
  ];

  const rlpEncoded = rlpEncode(authorizationTuple);
  const magicByte = '0x05';
  const authMessage = ethers.concat([magicByte, rlpEncoded]);
  const authHash = ethers.keccak256(authMessage);

  console.log("  Authorization Message:", authMessage);
  console.log("  Authorization Hash:", authHash);

  // Sign the authorization hash (not wrapped with EIP-191)
  const authSig = wallet.signingKey.sign(authHash);

  const authorization = {
    chainId: CHAIN_ID,
    address: IMPLEMENTATION_CONTRACT,
    nonce: authNonce,
    yParity: authSig.yParity,
    r: authSig.r,
    s: authSig.s
  };

  console.log("\nSigned Authorization:");
  console.log("  Chain ID:", authorization.chainId);
  console.log("  Address:", authorization.address);
  console.log("  Nonce:", authorization.nonce);
  console.log("  yParity:", authorization.yParity);
  console.log("  r:", authorization.r);
  console.log("  s:", authorization.s);

  // Build EIP-7702 (Type 4) Transaction
  console.log("\n=== Building Type 4 Transaction ===");

  // Encode authorization list
  const authorizationList = [[
    ethers.toBeHex(authorization.chainId),
    authorization.address,
    ethers.toBeHex(authorization.nonce),
    ethers.toBeHex(authorization.yParity),
    authorization.r,
    authorization.s
  ]];

  // Build transaction fields for Type 4
  const txData = [
    ethers.toBeHex(CHAIN_ID),                                    // chain_id
    ethers.toBeHex(txNonce),                                     // nonce
    ethers.toBeHex(feeData.maxPriorityFeePerGas || 1000000000n), // max_priority_fee_per_gas
    ethers.toBeHex(feeData.maxFeePerGas || 2000000000n),         // max_fee_per_gas
    ethers.toBeHex(100000),                                      // gas_limit
    wallet.address,                                               // to (call to self)
    ethers.toBeHex(0),                                           // value
    '0x',                                                         // data
    [],                                                           // access_list
    authorizationList                                             // authorization_list
  ];

  // RLP encode the transaction
  const rlpTx = rlpEncode(txData);

  // Create the transaction payload: 0x04 || rlp([...])
  const txPayload = ethers.concat([ethers.toBeHex(EIP7702_TX_TYPE), rlpTx]);

  console.log("  Transaction Type:", EIP7702_TX_TYPE);
  console.log("  Transaction Payload:", txPayload.slice(0, 100) + "...");

  // Hash and sign the transaction
  const txHash = ethers.keccak256(txPayload);
  const txSig = wallet.signingKey.sign(txHash);

  // Build signed transaction with signature
  const signedTxData = [
    ethers.toBeHex(CHAIN_ID),
    ethers.toBeHex(txNonce),
    ethers.toBeHex(feeData.maxPriorityFeePerGas || 1000000000n),
    ethers.toBeHex(feeData.maxFeePerGas || 2000000000n),
    ethers.toBeHex(100000),
    wallet.address,
    ethers.toBeHex(0),
    '0x',
    [],
    authorizationList,
    ethers.toBeHex(txSig.yParity),
    txSig.r,
    txSig.s
  ];

  const signedRlpTx = rlpEncode(signedTxData);
  const signedTxPayload = ethers.concat([ethers.toBeHex(EIP7702_TX_TYPE), signedRlpTx]);

  console.log("  Signed Transaction:", signedTxPayload.slice(0, 100) + "...");
  console.log("  Transaction Length:", signedTxPayload.length, "bytes");

  // Send raw transaction
  console.log("\n=== Sending Type 4 Transaction ===");

  try {
    const txResponse = await provider.broadcastTransaction(signedTxPayload);
    console.log("\nTransaction submitted:", txResponse.hash);
    console.log("Waiting for confirmation...");

    const receipt = await txResponse.wait();

    console.log("\n✅ Transaction confirmed!");
    console.log("  Block:", receipt?.blockNumber);
    console.log("  Gas used:", receipt?.gasUsed.toString());
    console.log("  Status:", receipt?.status === 1 ? 'Success' : 'Failed');
    console.log("  TX Hash:", receipt?.hash);

    // Verify delegation was applied
    const newCode = await provider.getCode(wallet.address);

    if (newCode && newCode !== '0x') {
      console.log("\n✅ EOA successfully delegated to implementation!");
      console.log("  Delegated code:", newCode.slice(0, 66) + "...");
    } else {
      console.log("\n⚠️  EOA still has no delegated code");
      console.log("   The network may not support EIP-7702 yet");
    }
  } catch (error: any) {
    console.error("\n❌ Transaction failed:", error.message);

    if (error.message.includes('invalid transaction type')) {
      console.log("\n   Base Sepolia doesn't support EIP-7702 (Type 4) transactions yet");
      console.log("   EIP-7702 requires the Pectra upgrade");
    }

    if (error.error?.message) {
      console.log("   RPC Error:", error.error.message);
    }
  }

  console.log("\n=== Complete ===");
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
