import 'dotenv/config';
import { type Hex, type UserOperation } from "viem/account-abstraction";
import { deepHexlify } from "permissionless";
import { publicClient } from "./clients/publicClient";
import { account } from "./clients/walletClient";
import { pimlicoClient, createSmartClient } from "./clients/pimlicoClient";
import { ADDRESSES } from "./data/addressBook";
import { createSmartAccount } from "./helpers/account";
import { createExecuteCallData, type Call } from "./helpers/execution";
import { wrapSignature } from "./helpers/signature";
import { sepolia } from "viem/chains";

async function main() {
  console.log("🚀 Executing UserOperation with Paymaster\n");

  console.log("📋 Configuration:");
  console.log(`   Sender:     ${ADDRESSES.SENDER}`);
  console.log(`   Target:     ${ADDRESSES.TARGET}`);
  console.log(`   EntryPoint: ${ADDRESSES.ENTRY_POINT}`);
  console.log(`   Network:    Sepolia\n`);

  console.log("1️⃣ Creating smart account...");
  const smartAccount = await createSmartAccount(publicClient, account, ADDRESSES.SENDER);
  console.log(`   Account created: ${await smartAccount.getAddress()}\n`);

  console.log("2️⃣ Setting up Pimlico client...");
  const smartAccountClient = createSmartClient(smartAccount);
  console.log("   Pimlico client ready\n");

  console.log("3️⃣ Building callData...");
  const calls: Call[] = [{
    target: ADDRESSES.TARGET,
    value: 0n,
    data: "0x" as Hex
  }];
  const callData = createExecuteCallData(calls);
  console.log(`   Mode: mode_1`);
  console.log(`   Target: ${ADDRESSES.TARGET}`);
  console.log(`   Value: 0`);
  console.log(`   Data: 0x\n`);

  console.log("4️⃣ Creating UserOperation...");
  let userOperation = {} as UserOperation<"0.8">;
  userOperation.sender = ADDRESSES.SENDER;
  userOperation.nonce = await smartAccount.getNonce();
  userOperation.callData = callData;
  userOperation.signature = await smartAccount.getStubSignature();
  console.log(`   Nonce: ${userOperation.nonce}\n`);

  console.log("5️⃣ Getting gas prices from Pimlico...");
  const gasInfo = (await pimlicoClient.getUserOperationGasPrice()).fast;
  userOperation = { ...userOperation, ...gasInfo };
  console.log(`   maxFeePerGas: ${gasInfo.maxFeePerGas}`);
  console.log(`   maxPriorityFeePerGas: ${gasInfo.maxPriorityFeePerGas}\n`);

  console.log("6️⃣ Getting paymaster stub data...");
  const stub = await pimlicoClient.getPaymasterStubData({
    ...userOperation,
    chainId: sepolia.id,
    entryPointAddress: ADDRESSES.ENTRY_POINT
  });
  userOperation = { ...userOperation, ...stub };
  console.log("   Paymaster stub obtained\n");

  console.log("7️⃣ Estimating gas...");
  const gasEstimates = await smartAccountClient.request({
    method: "eth_estimateUserOperationGas",
    params: [deepHexlify({ ...userOperation }), ADDRESSES.ENTRY_POINT]
  });
  userOperation = { ...userOperation, ...gasEstimates };
  console.log(`   callGasLimit: ${gasEstimates.callGasLimit}`);
  console.log(`   verificationGasLimit: ${gasEstimates.verificationGasLimit}`);
  console.log(`   preVerificationGas: ${gasEstimates.preVerificationGas}\n`);

  console.log("8️⃣ Getting paymaster data...");
  const sponsorFields = await pimlicoClient.getPaymasterData({
    ...userOperation,
    chainId: sepolia.id,
    entryPointAddress: ADDRESSES.ENTRY_POINT
  });
  userOperation = { ...userOperation, ...sponsorFields };
  console.log("   Paymaster data obtained\n");

  console.log("9️⃣ Signing UserOperation...");
  const userOpSig = await smartAccount.signUserOperation(userOperation);
  const wrappedSig = wrapSignature(userOpSig);
  userOperation.signature = wrappedSig;
  console.log(`   Signature: ${userOpSig.slice(0, 20)}...`);
  console.log(`   Wrapped: ${wrappedSig.slice(0, 20)}...\n`);

  console.log("🔟 Submitting UserOperation...");
  const userOperationHash = await smartAccountClient.request({
    method: "eth_sendUserOperation",
    params: [deepHexlify({ ...userOperation }), ADDRESSES.ENTRY_POINT]
  }) as Hex;

  console.log(`✅ UserOperation submitted!`);
  console.log(`   UserOp Hash: ${userOperationHash}\n`);

  console.log("⏳ Waiting for receipt...");
  const { receipt } = await smartAccountClient.waitForUserOperationReceipt({
    hash: userOperationHash
  });

  console.log("\n✅ UserOperation executed!");
  console.log(`   Transaction Hash: ${receipt.transactionHash}`);
  console.log(`   Block Number: ${receipt.blockNumber}`);
  console.log(`   Status: ${receipt.status}\n`);
  console.log("🎉 Transaction complete!");
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  if (error.details) {
    console.error("   Details:", error.details);
  }
  process.exit(1);
});
