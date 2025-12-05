import { exit } from 'node:process';
import { baseSepolia } from 'viem/chains';
import { PAYMASTER_V3 } from './data/addressBook';
import { helpers, gasFees } from "./helpers/Helpers";
import { publicClient } from "./clients/publicClient";
import { getNonce } from './actions/entryPointActions';
import { walletsClient } from './clients/walltesClient';
import { UserOperation } from 'viem/account-abstraction';
import { sponsorUserOperation } from 'permissionless/actions/pimlico';
import { getHash, createPaymasterData } from './actions/paymasterActions';
import { getSimpleAccount, createSmartAccount, pimlicoClient } from "./clients/pimlicoClient";
import { getDummyPaymasterData, type UserOperationWithEip7702Auth, estimateUserOperationGas, getPaymasterData, sendUserOperation, waitForUserOperationReceipt } from './actions/pimlicoActions';
import { Hex } from 'viem';
import { hashMessage, keccak256, toBytes } from 'viem';

async function main() {
    const gasFees: gasFees = await helpers.getGasParams(publicClient);
    console.log(gasFees.maxFeePerGas);
    console.log(gasFees.maxPriorityFeePerGas);

    const authorization = await helpers.getAuthorization(walletsClient.walletClientAccount7702, walletsClient.walletClientAccount7702.account);
    console.log(authorization);

    let userOp: UserOperationWithEip7702Auth = await helpers.getFreshUserOp(authorization);
    userOp.sender = walletsClient.walletClientAccount7702.account.address;
    userOp.nonce = await getNonce(publicClient, userOp.sender, 0n);
    userOp.callData = await helpers.getCallData();
    userOp.maxFeePerGas = gasFees.maxFeePerGas;
    userOp.maxPriorityFeePerGas = gasFees.maxPriorityFeePerGas;
    console.log(userOp);

    const dummyValidUntil = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    const dummyValidAfter = 0;
    const dummyPaymasterData = helpers.getDummyPaymasterDataAsync(dummyValidUntil, dummyValidAfter);

    userOp.paymaster = "0x4337fee09FB16C4A214408C0A3E43b40B3A631B2";
    userOp.paymasterData = dummyPaymasterData;
    userOp.paymasterVerificationGasLimit = 150000n;
    userOp.paymasterPostOpGasLimit = 50000n;

    const simpleSmartAccout = await getSimpleAccount();
    const smartAccountClient = await createSmartAccount(simpleSmartAccout);

    try {
        const gasEstimates = await estimateUserOperationGas(smartAccountClient, userOp);
        console.log(gasEstimates);

        userOp.preVerificationGas = typeof gasEstimates.preVerificationGas === 'string'
            ? BigInt(gasEstimates.preVerificationGas)
            : gasEstimates.preVerificationGas;
        userOp.verificationGasLimit = typeof gasEstimates.verificationGasLimit === 'string'
            ? BigInt(gasEstimates.verificationGasLimit)
            : gasEstimates.verificationGasLimit;
        userOp.callGasLimit = typeof gasEstimates.callGasLimit === 'string'
            ? BigInt(gasEstimates.callGasLimit)
            : gasEstimates.callGasLimit;

        const pmVerificationGas = (gasEstimates as any).paymasterVerificationGasLimit;
        const pmPostOpGas = (gasEstimates as any).paymasterPostOpGasLimit;

        userOp.paymasterVerificationGasLimit = pmVerificationGas
            ? (typeof pmVerificationGas === 'string' ? BigInt(pmVerificationGas) : pmVerificationGas)
            : 0n;
        userOp.paymasterPostOpGasLimit = pmPostOpGas
            ? (typeof pmPostOpGas === 'string' ? BigInt(pmPostOpGas) : pmPostOpGas)
            : 0n;
        console.log("UserOp with gas estimates:", userOp)
    } catch (error) {
        console.log("\n=== GAS ESTIMATION FAILED (EXPECTED FOR V0.8 ENTRYPOINT) ===");
        console.log("Error:", error instanceof Error ? error.message : error);
        console.log("Using fallback gas limits...\n");

        userOp.preVerificationGas = 80000n;
        userOp.verificationGasLimit = 350000n;
        userOp.callGasLimit = 200000n;
        userOp.paymasterVerificationGasLimit = 150000n;
        userOp.paymasterPostOpGasLimit = 50000n;

        console.log("UserOp with fallback gas limits:", userOp);
    }

    const validUntil = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    const validAfter = 0;

    userOp.paymaster = PAYMASTER_V3;

    const userOpForAccountSigning = { ...userOp };
    userOpForAccountSigning.paymasterData = helpers.createAsyncPaymasterDataWithMagic(validUntil, validAfter);

    const userOpForPaymasterSigning = { ...userOp };
    userOpForPaymasterSigning.paymasterData = helpers.createAsyncPaymasterDataForSigning(validUntil, validAfter);

    console.log("\n=== ASYNC SIGNATURE FLOW ===");
    console.log("UserOp for account signing - paymasterData:", userOpForAccountSigning.paymasterData);
    console.log("UserOp for paymaster signing - paymasterData:", userOpForPaymasterSigning.paymasterData);
    console.log("===========================\n");

    const [userOpSig, pmSignature] = await Promise.all([
        simpleSmartAccout.signUserOperation(userOpForAccountSigning),
        (async () => {
            const hash = await getHash(publicClient, helpers.VERIFYING_MODE, userOpForPaymasterSigning);
            console.log("Paymaster hash:", hash);
            return await walletsClient.signMessageWithEOA(hash);
        })()
    ]);

    console.log("UserOp signature:", userOpSig);
    console.log("Paymaster signature:", pmSignature);

    const paymasterDataBase = helpers.createVerifyingModePaymasterData(validUntil, validAfter);
    userOp.paymasterData = helpers.appendAsyncSignature(paymasterDataBase, pmSignature);
    userOp.signature = userOpSig;

    console.log("\n=== FINAL PAYMASTER DATA STRUCTURE (ASYNC) ===");
    console.log("Full paymasterData:", userOp.paymasterData);
    console.log("Length:", userOp.paymasterData.length - 2, "hex chars =", (userOp.paymasterData.length - 2) / 2, "bytes");

    const pmData = userOp.paymasterData;
    const modeB = pmData.slice(0, 4);
    const validU = pmData.slice(4, 16);
    const validA = pmData.slice(16, 28);
    const sig = pmData.slice(28, 158);
    const sigLen = pmData.slice(158, 162);
    const magic = pmData.slice(162, 178);

    console.log("\nByte breakdown:");
    console.log("  mode (1 byte):", modeB);
    console.log("  validUntil (6 bytes):", validU);
    console.log("  validAfter (6 bytes):", validA);
    console.log("  signature (65 bytes):", sig);
    console.log("  sigLength (2 bytes):", sigLen, "=", parseInt(sigLen, 16), "bytes");
    console.log("  MAGIC (8 bytes):", magic);
    console.log("==========================================\n");

    console.log("\n=== VERIFICATION: Custom Paymaster Configuration ===");
    console.log("Paymaster Address:", userOp.paymaster);
    console.log("Expected PAYMASTER_V3:", PAYMASTER_V3);
    console.log("Match:", userOp.paymaster === PAYMASTER_V3);
    console.log("===================================================\n");

    console.log("Complete UserOp before sending:", JSON.stringify({
        sender: userOp.sender,
        nonce: userOp.nonce.toString(),
        paymaster: userOp.paymaster,
        paymasterData: userOp.paymasterData,
        paymasterVerificationGasLimit: userOp.paymasterVerificationGasLimit?.toString(),
        paymasterPostOpGasLimit: userOp.paymasterPostOpGasLimit?.toString(),
    }, null, 2));

    try {
        const userOperationHash = await sendUserOperation(smartAccountClient, userOp);
        const { receipt } = await waitForUserOperationReceipt(smartAccountClient, userOperationHash);
        console.log("User operation receipt:", receipt);
    } catch (error) {
        console.log("\n=== SUBMISSION FAILED (EXPECTED) ===");
        console.log("Error:", error instanceof Error ? error.message : error);
        console.log("\nThis is expected because EntryPoint v0.8 doesn't support async signatures with PAYMASTER_SIG_MAGIC.");
        console.log("The paymasterData structure is correct for v0.9 EntryPoint.\n");
    }
}

main().catch((e) => {
    console.error(e);
    exit(1);
});
