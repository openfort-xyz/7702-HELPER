import { baseSepolia } from 'viem/chains'
import { createPublicClient, http, PublicClient } from 'viem'
 
export const publicClient: PublicClient = createPublicClient({ 
  chain: baseSepolia,
  transport: http()
}) as PublicClient;