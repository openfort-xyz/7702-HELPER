import { http } from "viem";
import { sepolia } from "viem/chains";
import { entryPoint08Address } from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createSmartAccountClient } from "permissionless";

if (!process.env.PIMLICO_API_KEY) {
  throw new Error("PIMLICO_API_KEY is required in .env");
}

const PIMLICO_URL = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_API_KEY}`;

export const pimlicoClient = createPimlicoClient({
  transport: http(PIMLICO_URL),
  entryPoint: {
    address: entryPoint08Address,
    version: "0.8"
  }
});

export const createSmartClient = (account: any) => {
  return createSmartAccountClient({
    account,
    chain: sepolia,
    bundlerTransport: http(PIMLICO_URL),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      }
    }
  });
};
