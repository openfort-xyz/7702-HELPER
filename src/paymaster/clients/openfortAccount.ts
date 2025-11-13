import {
    Account,
    encodeAbiParameters,
    encodeFunctionData,
    Hex,
    SignAuthorizationReturnType,
    createWalletClient,
    http
} from "viem";
import {
    entryPoint08Abi,
    toSmartAccount,
    toPackedUserOperation
} from "viem/account-abstraction";
import { optimismSepolia } from 'viem/chains';
import { bundlerClient, ENTRY_POINT_V9_ADDRESS } from "./etherspotClient";
import { publicClient } from "./publicClient";
import { SIMPLE_ACCOUNT } from "../data/addressBook";
import { executeBatch08Abi } from "../data/abis";

type Call = {
    to: `0x${string}`;
    value?: bigint;
    data?: `0x${string}`;
};

const callType = {
    name: 'Call',
    type: 'tuple',
    components: [
        { name: 'target', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' }
    ]
} as const;

export async function createOpenfortAccount(owner: Account) {
    return await toSmartAccount({
        client: bundlerClient,
        entryPoint: {
            abi: entryPoint08Abi,
            address: ENTRY_POINT_V9_ADDRESS,
            version: "0.8"
        },
        async encodeCalls(calls: readonly Call[]) {
            return encodeFunctionData({
                abi: executeBatch08Abi,
                functionName: "executeBatch",
                args: [
                    calls.map((call) => ({
                        target: call.to,
                        value: call.value ?? 0n,
                        data: call.data ?? "0x"
                    }))
                ]
            });
        },
        async decodeCalls(data: Hex) {
            return [];
        },
        authorization: {
            account: owner,
            address: SIMPLE_ACCOUNT
        },
        async getNonce() {
            return publicClient.readContract({
                address: ENTRY_POINT_V9_ADDRESS,
                abi: entryPoint08Abi,
                functionName: "getNonce",
                args: [owner.address, 0n]
            });
        },
        async getAddress() {
            return owner.address;
        },
        async getFactoryArgs() {
            return { factory: '0x7702' as Hex, factoryData: '0x' as Hex };
        },
        async getStubSignature() {
            return encodeAbiParameters(
                [
                    { type: 'uint256' },
                    { type: 'bytes' }
                ],
                [
                    0n,
                    "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
                ]
            );
        },
        async signMessage({ message }) {
            if (typeof message === 'string') {
                return owner.signMessage({ message });
            }
            return owner.signMessage({ message: message.raw });
        },
        async signTypedData(parameters) {
            return owner.signTypedData(parameters);
        },
        async signUserOperation(parameters) {
            const { chainId = bundlerClient.chain.id, authorization, ...userOperation } = parameters;

            const packedUserOp = toPackedUserOperation({
                ...userOperation,
                sender: owner.address,
                signature: '0x'
            });

            const userOpHash = await publicClient.readContract({
                address: ENTRY_POINT_V9_ADDRESS,
                abi: entryPoint08Abi,
                functionName: 'getUserOpHash',
                args: [packedUserOp]
            });

            const rawSignature = await owner.sign({ hash: userOpHash as Hex });

            return encodeAbiParameters(
                [
                    { type: 'uint256' },
                    { type: 'bytes' }
                ],
                [0n, rawSignature]
            );
        }
    });
}

export async function getAuthorization(owner: Account): Promise<SignAuthorizationReturnType | undefined> {
    const senderCode = await publicClient.getCode({
        address: owner.address
    });

    const delegateAddress = SIMPLE_ACCOUNT;

    if (senderCode !== `0xef0100${delegateAddress.toLowerCase().substring(2)}`) {
        const walletClient = createWalletClient({
            account: owner,
            chain: optimismSepolia,
            transport: http()
        });

        return await walletClient.signAuthorization({
            contractAddress: delegateAddress
        });
    }

    return undefined;
}
