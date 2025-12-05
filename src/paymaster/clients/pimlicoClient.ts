import 'dotenv/config';
import { Account, http, SignedAuthorization } from 'viem';
import { baseSepolia } from 'viem/chains';
import { helpers } from '../helpers/Helpers';
import { publicClient } from './publicClient';
import { walletsClient } from './walltesClient';
import { SmartAccountClient } from 'permissionless';
import { createSmartAccountClient } from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts'
import { ToSimpleSmartAccountReturnType } from 'permissionless/accounts';
import { entryPoint08Address, entryPoint06Address, UserOperation } from 'viem/account-abstraction';
import { createPaymasterClient, PaymasterClient } from 'viem/account-abstraction'
import { createPimlicoClient, PimlicoClient } from 'permissionless/clients/pimlico'

const {
  PIMLICO_API,
} = process.env as Record<
  string,
  string
>

const pimlicoUrl = `https://api.pimlico.io/v2/84532/rpc?apikey=${PIMLICO_API}`

export const pimlicoClient: PimlicoClient = createPimlicoClient({
  transport: http(pimlicoUrl),
  entryPoint: {
    address: entryPoint08Address,
    version: '0.8'
  }
}) as PimlicoClient;

// Fixed: Changed from chain 11155111 (Ethereum Sepolia) to 84532 (Base Sepolia)
export const paymasterClient: PaymasterClient = createPaymasterClient({ transport: http('https://public.pimlico.io/v2/84532/rpc') }) as PaymasterClient;

export async function getSimpleAccount(): Promise<ToSimpleSmartAccountReturnType<'0.8', true>> {
  return await toSimpleSmartAccount({
    owner: walletsClient.walletClientAccount7702.account,
    client: publicClient,
    eip7702: true,
    entryPoint: {
      address: entryPoint08Address,
      version: '0.8'
    }
  });
}


export async function createSmartAccount(account: ToSimpleSmartAccountReturnType<'0.8', true>): Promise<SmartAccountClient> {
  return createSmartAccountClient({
    account,
    chain: baseSepolia,
    bundlerTransport: http(pimlicoUrl),
    // Removed paymaster: pimlicoClient to allow custom PAYMASTER_V3 usage
    // When paymaster field is included, Pimlico overrides the UserOp's paymaster field
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast
      },
    },
  });
}
