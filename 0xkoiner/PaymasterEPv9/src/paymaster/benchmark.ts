import { exit } from 'node:process';
import { parseEther } from 'viem';
import { PAYMASTER_V3_EPV9 } from './data/addressBook';
import { helpers } from "./helpers/Helpers";
import { publicClient } from "./clients/publicClient";
import { walletsClient } from './clients/walltesClient';
import { createOpenfortAccount, getAuthorization } from './clients/openfortAccount';
import { getHash } from './actions/paymasterActions';
import { Hex } from 'viem';

async function benchmarkSync(iterations: number): Promise<number[]> {
    const times: number[] = [];
    const owner = walletsClient.walletClientAccount7702.account;
    const openfortAccount = await createOpenfortAccount(owner);

    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        const validUntil = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        const validAfter = 0;

        const calls = [
            {
                to: helpers.RECIVER,
                value: parseEther('0')
            }
        ];

        const paymasterDataForPmSigning = helpers.createVerifyingModePaymasterDataAsyncWithPlaceholder(validUntil, validAfter);

        const userOpForPmHash = {
            sender: owner.address,
            nonce: await openfortAccount.getNonce(),
            callData: await openfortAccount.encodeCalls(calls),
            callGasLimit: 100000n,
            verificationGasLimit: 100000n,
            preVerificationGas: 100000n,
            maxFeePerGas: 1000000n,
            maxPriorityFeePerGas: 1000000n,
            paymaster: PAYMASTER_V3_EPV9,
            paymasterData: paymasterDataForPmSigning,
            paymasterVerificationGasLimit: 150000n,
            paymasterPostOpGasLimit: 50000n,
            signature: '0x'
        };

        const pmHash = await getHash(publicClient, helpers.VERIFYING_MODE, userOpForPmHash);
        const paymasterSignature = await walletsClient.signMessageWithEOA(pmHash);

        const paymasterDataForAccountSigning = helpers.createVerifyingModePaymasterDataAsync(validUntil, validAfter);

        const userOpForSigning = {
            sender: owner.address,
            nonce: await openfortAccount.getNonce(),
            callData: await openfortAccount.encodeCalls(calls),
            paymaster: PAYMASTER_V3_EPV9,
            paymasterData: paymasterDataForAccountSigning,
        };

        const accountSignature = await openfortAccount.signUserOperation(userOpForSigning);

        const paymasterDataBase = helpers.createVerifyingModePaymasterData(validUntil, validAfter);
        const finalPaymasterData = helpers.appendAsyncSignatureToPaymasterData(paymasterDataBase, paymasterSignature);

        const endTime = performance.now();
        times.push(endTime - startTime);
    }

    return times;
}

async function benchmarkAsync(iterations: number): Promise<number[]> {
    const times: number[] = [];
    const owner = walletsClient.walletClientAccount7702.account;
    const openfortAccount = await createOpenfortAccount(owner);

    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        const validUntil = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        const validAfter = 0;

        const paymasterDataForAccountSigning = helpers.createVerifyingModePaymasterDataAsync(validUntil, validAfter);
        const paymasterDataForPmSigning = helpers.createVerifyingModePaymasterDataAsyncWithPlaceholder(validUntil, validAfter);

        const calls = [
            {
                to: helpers.RECIVER,
                value: parseEther('0')
            }
        ];

        let accountSignature: Hex;
        let paymasterSignature: Hex;

        await Promise.all([
            (async () => {
                const userOpForSigning = {
                    sender: owner.address,
                    nonce: await openfortAccount.getNonce(),
                    callData: await openfortAccount.encodeCalls(calls),
                    paymaster: PAYMASTER_V3_EPV9,
                    paymasterData: paymasterDataForAccountSigning,
                };

                const sig = await openfortAccount.signUserOperation(userOpForSigning);
                accountSignature = sig;
            })(),
            (async () => {
                const userOpForPmHash = {
                    sender: owner.address,
                    nonce: await openfortAccount.getNonce(),
                    callData: await openfortAccount.encodeCalls(calls),
                    callGasLimit: 100000n,
                    verificationGasLimit: 100000n,
                    preVerificationGas: 100000n,
                    maxFeePerGas: 1000000n,
                    maxPriorityFeePerGas: 1000000n,
                    paymaster: PAYMASTER_V3_EPV9,
                    paymasterData: paymasterDataForPmSigning,
                    paymasterVerificationGasLimit: 150000n,
                    paymasterPostOpGasLimit: 50000n,
                    signature: '0x'
                };

                const pmHash = await getHash(publicClient, helpers.VERIFYING_MODE, userOpForPmHash);
                const sig = await walletsClient.signMessageWithEOA(pmHash);
                paymasterSignature = sig;
            })()
        ]);

        const paymasterDataBase = helpers.createVerifyingModePaymasterData(validUntil, validAfter);
        const finalPaymasterData = helpers.appendAsyncSignatureToPaymasterData(paymasterDataBase, paymasterSignature);

        const endTime = performance.now();
        times.push(endTime - startTime);
    }

    return times;
}

function calculateStats(times: number[]): { avg: number, min: number, max: number } {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    return { avg, min, max };
}

async function main() {
    const iterations = 20;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`PAYMASTER ASYNC SIGNING BENCHMARK (${iterations} iterations)`);
    console.log('='.repeat(60));
    console.log(`EntryPoint v0.9: 0x43370900c8de573dB349BEd8DD53b4Ebd3Cce709`);
    console.log(`Paymaster: ${PAYMASTER_V3_EPV9}`);
    console.log('='.repeat(60));

    console.log("\nRunning SYNC (Sequential) flow...");
    const syncTimes = await benchmarkSync(iterations);
    const syncStats = calculateStats(syncTimes);

    console.log("\nRunning ASYNC (Parallel) flow...");
    const asyncTimes = await benchmarkAsync(iterations);
    const asyncStats = calculateStats(asyncTimes);

    const improvement = ((syncStats.avg - asyncStats.avg) / syncStats.avg) * 100;
    const timeSaved = syncStats.avg - asyncStats.avg;

    console.log(`\n${'='.repeat(60)}`);
    console.log("RESULTS");
    console.log('='.repeat(60));
    console.log("\nSYNC FLOW (Sequential Signing):");
    console.log(`  Average: ${syncStats.avg.toFixed(2)}ms`);
    console.log(`  Min:     ${syncStats.min.toFixed(2)}ms`);
    console.log(`  Max:     ${syncStats.max.toFixed(2)}ms`);
    console.log(`  Times:   ${syncTimes.map(t => t.toFixed(2)).join('ms, ')}ms`);

    console.log("\nASYNC FLOW (Parallel Signing):");
    console.log(`  Average: ${asyncStats.avg.toFixed(2)}ms`);
    console.log(`  Min:     ${asyncStats.min.toFixed(2)}ms`);
    console.log(`  Max:     ${asyncStats.max.toFixed(2)}ms`);
    console.log(`  Times:   ${asyncTimes.map(t => t.toFixed(2)).join('ms, ')}ms`);

    console.log("\nPERFORMANCE IMPROVEMENT:");
    console.log(`  Time Saved:     ${timeSaved.toFixed(2)}ms per operation`);
    console.log(`  Improvement:    ${improvement.toFixed(2)}%`);
    console.log(`  Speedup:        ${(syncStats.avg / asyncStats.avg).toFixed(2)}x`);

    console.log(`\n${'='.repeat(60)}`);
    console.log("CONCLUSION:");
    console.log(`Async paymaster signatures are ${improvement.toFixed(1)}% faster`);
    console.log(`Saves ${timeSaved.toFixed(0)}ms per UserOperation`);
    console.log('='.repeat(60));
    console.log();
}

main().catch((e) => {
    console.error(e);
    exit(1);
});
