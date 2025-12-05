
import 'dotenv/config';
import {
    createPublicClient,
    createWalletClient,
    http,
    type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts'
import {
    encodeFunctionData,
    type PublicClient,
    type WalletClient,
} from 'viem';
import { ABI_PAYMASTER } from '../data/abis';
import { parseEther } from 'viem';

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

function toUint32(value: number | bigint): number {
    const n = typeof value === 'bigint' ? Number(value) : value;
    if (!Number.isInteger(n) || n < 0 || n > 0xffffffff) {
      throw new Error(`unstakeDelaySec out of uint32 range: ${value}`);
    }
    return n;
  }

export async function getDeposit(publicClient: PublicClient): Promise<bigint> {
    return publicClient.readContract({
        address: PAYMASTER_V3,
        abi: ABI_PAYMASTER,
        functionName: 'getDeposit',
    });
}

export async function deposit(
    walletClient: WalletClient,
    publicClient: PublicClient,
    value: bigint,
): Promise<{ hash: Hex; }> {
    if (!walletClient.account) throw new Error('walletClient is missing an account');

    const data = encodeFunctionData({
        abi: ABI_PAYMASTER,
        functionName: 'deposit',
        args: [],
    });

    const hash = await walletClient.sendTransaction({
        to: PAYMASTER_V3,
        data,
        value,
        account: walletClient.account!,
        chain: undefined,            
      });


    await publicClient.waitForTransactionReceipt({ hash });

    return { hash };
}

export async function addStake(
    walletClient: WalletClient,
    publicClient: PublicClient,
    value: bigint,
    unstakeDelaySec: number | bigint,
  ): Promise<{ hash: Hex }> {
    if (!walletClient.account) throw new Error('walletClient is missing an account');
  
    const delay = toUint32(unstakeDelaySec);
  
    const hash = await walletClient.writeContract({
      address: PAYMASTER_V3,
      abi: ABI_PAYMASTER,
      functionName: 'addStake',
      args: [delay],
      value,
      account: walletClient.account,
      chain: undefined,
    });
  
    await publicClient.waitForTransactionReceipt({ hash });
    return { hash };

  }

async function main() {
    const before = await getDeposit(publicClient);
    console.log('Before deposit:', before.toString());
  
    const { hash } = await deposit(walletClient, publicClient, parseEther('0.00081'));
    console.log('Sent deposit tx:', hash);
  
    const after = await getDeposit(publicClient);
    console.log('After deposit:', after.toString());

    const stake = await addStake(walletClient, publicClient, parseEther('0.00081'),  8600);
    console.log('addStake tx:', stake.hash);
  
    console.log('After:', (await getDeposit(publicClient)).toString());
  }
  
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });