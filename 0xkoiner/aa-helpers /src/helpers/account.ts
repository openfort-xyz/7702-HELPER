import {
  type Address,
  type Chain,
  type Client,
  type Hex,
  type Transport,
  encodeFunctionData
} from "viem";
import {
  type EntryPointVersion,
  type SmartAccount,
  type SmartAccountImplementation,
  getUserOperationTypedData,
  toSmartAccount
} from "viem/account-abstraction";
import { getChainId, readContract } from "viem/actions";
import { ADDRESSES } from "../data/addressBook";
import { ENTRY_POINT_GET_NONCE_ABI, EXECUTE_SINGLE_ABI } from "../data/abis";

type ToSimpleSmartAccountReturnType = SmartAccount<SmartAccountImplementation<any, "0.8">>;

async function getAccountNonce(
  client: Client,
  address: Address,
  entryPointAddress: Address,
  key: bigint = 1n
): Promise<bigint> {
  return await readContract(client, {
    address: entryPointAddress,
    abi: ENTRY_POINT_GET_NONCE_ABI,
    functionName: "getNonce",
    args: [address, key]
  });
}

export async function createSmartAccount(
  client: Client<Transport, Chain | undefined>,
  owner: any,
  accountAddress: Address
): Promise<ToSimpleSmartAccountReturnType> {
  const entryPoint = {
    address: ADDRESSES.ENTRY_POINT,
    version: "0.8" as EntryPointVersion
  };

  let chainId: number;

  const getMemoizedChainId = async () => {
    if (chainId) return chainId;
    chainId = client.chain ? client.chain.id : await getChainId(client);
    return chainId;
  };

  return toSmartAccount({
    client,
    entryPoint: {
      address: entryPoint.address,
      abi: [],
      version: entryPoint.version
    },
    async getFactoryArgs() {
      return {
        factory: undefined,
        factoryData: undefined
      };
    },
    async getAddress() {
      return accountAddress;
    },
    async encodeCalls(calls) {
      const call = calls.length === 0 ? undefined : calls[0];
      if (!call) throw new Error("No calls to encode");

      return encodeFunctionData({
        abi: EXECUTE_SINGLE_ABI,
        functionName: "execute",
        args: [call.to, call.value ?? 0n, call.data ?? "0x"]
      });
    },
    async getNonce() {
      return getAccountNonce(client, accountAddress, entryPoint.address, 1n);
    },
    async getStubSignature() {
      return "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c00000000000000000000000000000000000000000000000000000000000000" as Hex;
    },
    async sign({ hash }) {
      return owner.sign({ hash });
    },
    async signMessage({ message }) {
      return owner.signMessage({ message });
    },
    async signTypedData(typedData) {
      return owner.signTypedData(typedData);
    },
    async signUserOperation(parameters) {
      const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;

      const typedData = getUserOperationTypedData({
        chainId,
        entryPointAddress: entryPoint.address,
        userOperation: {
          ...userOperation,
          sender: userOperation.sender ?? accountAddress,
          signature: "0x"
        }
      });

      return await owner.signTypedData(typedData);
    }
  }) as Promise<ToSimpleSmartAccountReturnType>;
}
