import 'dotenv/config';
import {
    createPublicClient,
    createWalletClient,
    http,
    type Hex,
    type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts'
import {
    encodeFunctionData,
    type PublicClient,
    type WalletClient,
} from 'viem';
import { ABI_PAYMASTER } from '../data/abis';

const RPC_URL = 'https://base-rpc.publicnode.com';
const PAYMASTER_V3: Hex = "0x8888Fee880063D8C6B96Cf3D4b2C1696CAcf65D2";
const { OWNER } = process.env as Record<string, Hex>;
if (!OWNER) throw new Error('Missing OWNER private key in env (OWNER)');

export const publicClient = createPublicClient({
    transport: http(RPC_URL),
});

export const walletClient = createWalletClient({
    account: privateKeyToAccount(OWNER),
    transport: http(RPC_URL),
});

export async function addSigner(walletClient: WalletClient, publicClient: PublicClient, signer: Hex): Promise<{ hash: Hex }> {
    if (!walletClient.account) throw new Error('walletClient is missing an account');

    const data = encodeFunctionData({
        abi: ABI_PAYMASTER,
        functionName: 'addSigner',
        args: [signer],
    });

    const hash = await walletClient.sendTransaction({
        to: PAYMASTER_V3,
        data,
        account: walletClient.account!,
        chain: undefined,            
      });


    await publicClient.waitForTransactionReceipt({ hash });

    return { hash };
}

export async function removeSigner(walletClient: WalletClient, publicClient: PublicClient, signer: Hex): Promise<{ hash: Hex }> {
    if (!walletClient.account) throw new Error('walletClient is missing an account');

    const data = encodeFunctionData({
        abi: ABI_PAYMASTER,
        functionName: 'removeSigner',
        args: [signer],
    });

    const hash = await walletClient.sendTransaction({
        to: PAYMASTER_V3,
        data,
        account: walletClient.account!,
        chain: undefined,            
      });


    await publicClient.waitForTransactionReceipt({ hash });

    return { hash };
}

async function getSigners(publicClient: PublicClient): Promise<Address[]> {
    const signers: Address[] = await publicClient.readContract({
        address: PAYMASTER_V3,
        abi: ABI_PAYMASTER,
        functionName: 'getSigners',
    });
    return signers;
}

async function main() {
    let signers = await getSigners(publicClient);
    console.log('signers before remove:', signers);
    const hash2 = await removeSigner(walletClient, publicClient, '0xbebCD8Cba50c84f999d6A8C807f261FF278161fb');
    console.log('removeSigner tx:', hash2.toString());
    const hash3 = await removeSigner(walletClient, publicClient, '0x50Eb929D025E9b9d2c29CA1849D9673275DB91f5');
    console.log('removeSigner tx:', hash3.toString());
    
    // signers = await getSigners(publicClient);
    // console.log('signers after remove:', signers);

    // const hash = await addSigner(walletClient, publicClient, '0xb25fE9d3e04fD2403bB3c31c76a8F8dc59ac7832');
    // console.log('addSigner tx:', hash.toString());

    signers = await getSigners(publicClient);
    console.log('signers after add:', signers);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
  });