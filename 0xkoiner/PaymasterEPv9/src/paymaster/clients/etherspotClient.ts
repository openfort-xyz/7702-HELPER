import 'dotenv/config';
import createFreeBundler, { getFreeBundlerUrl } from "@etherspot/free-bundler";
import { publicActions, walletActions, Chain, http } from "viem";
import { optimismSepolia } from 'viem/chains';

const chain: Chain = optimismSepolia;

const bundlerUrl = process.env.BUNDLER_URL || getFreeBundlerUrl(chain.id);

console.log(`[Etherspot] Using bundler URL for chain ${chain.id}:`, bundlerUrl);

export const bundlerClient = createFreeBundler({
    chain,
    bundlerUrl
}).extend(publicActions).extend(walletActions);

export const ENTRY_POINT_V9_ADDRESS = '0x43370900c8de573dB349BEd8DD53b4Ebd3Cce709' as const;
