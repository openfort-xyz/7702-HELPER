import * as dotenv from 'dotenv';
import {
  type Account,
  type Address,
  type Assign,
  type Chain,
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type OneOf,
  Prettify,
  SignedAuthorization,
  type Transport,
  type WalletClient,
  concat,
  createClient,
  createPublicClient,
  decodeAbiParameters,
  decodeFunctionData,
  encodeDeployData,
  encodeFunctionData,
  http,
  encodePacked, keccak256, zeroAddress
} from "viem"
import {
  type EntryPointVersion,
  EstimateUserOperationGasReturnType,
  type SmartAccount,
  type SmartAccountImplementation,
  UserOperation,
  entryPoint07Address,
  entryPoint08Abi,
  entryPoint08Address,
  getUserOperationTypedData,
  toSmartAccount
} from "viem/account-abstraction"
import { call, getChainId, prepareAuthorization, readContract } from "viem/actions"
import { getAction } from "viem/utils"
import { privateKeyToAccount, signAuthorization } from 'viem/accounts';
import { sepolia, baseSepolia, base } from 'viem/chains';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { createSmartAccountClient, deepHexlify } from 'permissionless';
import { abi } from './abi';
import { encodeAbiParameters } from 'viem';

dotenv.config();

console.info('Start');


const {
  IMPLEMENTATION_CONTRACT,
  PRIVATE_KEY_OPENFORT_USER_7702,
  ADDRESS_OPENFORT_USER_ADDRESS_7702,
} = process.env;

const getAccountInitCode = async (
  owner: Address,
  index = BigInt(0)
): Promise<Hex> => {
  if (!owner) throw new Error("Owner account not found")
  console.log("using init code?")
  return encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          }
        ],
        name: "createAccount",
        outputs: [
          {
            internalType: "contract SimpleAccount",
            name: "ret",
            type: "address"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    functionName: "createAccount",
    args: [owner, index]
  })
}

const getFactoryAddress = (
  entryPointVersion: EntryPointVersion,
  factoryAddress?: Address
): Address => {
  if (factoryAddress) return factoryAddress

  switch (entryPointVersion) {
    case "0.8":
      return "0x"
    case "0.7":
      return "0x"
    default:
      return "0x"
  }
}

const getEntryPointAbi = (entryPointVersion: EntryPointVersion) => {
  switch (entryPointVersion) {
    default:
      return entryPoint08Abi
  }
}


(async () => {
  try {
    const client = createClient({
      chain: base,
      pollingInterval: 1_000,
      transport: http()
    })
    const apiKey = process.env.PIMLICO_API_KEY
    if (!apiKey) throw new Error("Missing PIMLICO_API_KEY")
    const pimlicoUrl = `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    })
    const pk = PRIVATE_KEY_OPENFORT_USER_7702 as Hex
    const owner = privateKeyToAccount(pk)
    const authorization = await prepareAuthorization(client, {
      account: ADDRESS_OPENFORT_USER_ADDRESS_7702 as Hex,
      contractAddress: IMPLEMENTATION_CONTRACT as Hex,
    })
    const signedAuthorization = await signAuthorization({
      ...authorization,
      privateKey: pk,
    });
    const account = await toSimpleSmartAccount({
      owner,
      client: publicClient,
      entryPoint: {
        address: entryPoint08Address,
        version: "0.8"
      }
    })

    const pimlicoClient = createPimlicoClient({
      transport: http(pimlicoUrl),
      entryPoint: {
        address: entryPoint08Address,
        version: "0.8",
      },
    })

    const smartAccountClient = createSmartAccountClient({
      account,
      chain: base,
      bundlerTransport: http(pimlicoUrl),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast
        },
      },
    })
    type UserOperationWithEip7702Auth = UserOperation & {
      eip7702Auth: SignedAuthorization;
    };
    let userOperation = {} as UserOperationWithEip7702Auth;
    userOperation.sender = ADDRESS_OPENFORT_USER_ADDRESS_7702 as Hex;
    userOperation.nonce = await account.getNonce();

    // OPF7702 only accepts execute(bytes32 mode, bytes executionData) calls
    // Testing with empty call to isolate the issue

    // mode_1 = bytes32(uint256(0x01000000000000000000) << (22 * 8))
    const mode_1 = '0x0100000000000000000000000000000000000000000000000000000000000000' as Hex;

    // Create empty Call[] array - just testing execute function itself
    // Each call needs: { target, value, data }
    // Using a simple call to address(this) with no data
    const calls = [{
      target: ADDRESS_OPENFORT_USER_ADDRESS_7702 as Hex, // Call to self
      value: 0n,
      data: '0x' as Hex // Empty call data
    }];

    // ABI encode Call[] array
    const executionData = encodeAbiParameters(
      [{
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' }
        ]
      }],
      [calls]
    );

    // Now call execute(bytes32 mode, bytes executionData)
    userOperation.callData = encodeFunctionData({
      abi: [{
        name: 'execute',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
          { name: 'mode', type: 'bytes32' },
          { name: 'executionData', type: 'bytes' }
        ],
        outputs: []
      }],
      functionName: 'execute',
      args: [mode_1, executionData]
    });
    
    userOperation.signature = await account.getStubSignature(userOperation);
    const gasInfo = (await pimlicoClient.getUserOperationGasPrice()).fast;
    userOperation = {
      ...userOperation,
      ...gasInfo,
      eip7702Auth: signedAuthorization, // Use the REAL signed authorization
    };
    const stub = await pimlicoClient.getPaymasterStubData({
      ...userOperation,
      chainId: base.id,
      entryPointAddress: entryPoint08Address,
    });
    userOperation = { ...userOperation, ...stub } as UserOperationWithEip7702Auth;
    const gasEstimates = (await smartAccountClient.request({
      method: "eth_estimateUserOperationGas",
      params: [deepHexlify({ ...userOperation }), entryPoint08Address],
    })) as EstimateUserOperationGasReturnType;
    console.log(gasEstimates);

  //   userOperation = {
  //     ...userOperation,
  //     ...gasEstimates,
  //   } as UserOperationWithEip7702Auth;
  //   const sponsorFields = await pimlicoClient.getPaymasterData({
  //     ...userOperation,
  //     chainId: base.id,
  //     entryPointAddress: entryPoint08Address,
  //   });
  //   userOperation = {
  //     ...userOperation,
  //     ...sponsorFields,
  //   } as UserOperationWithEip7702Auth;

  //   const userOpSig = await account.signUserOperation(userOperation);
    
  //   const wrappedSig = encodeAbiParameters(
  //     [
  //       { type: 'uint8'  }, 
  //       { type: 'bytes'  }, 
  //     ],
  //     [0, userOpSig],   
  //   );
  //   console.log("userOpSig", wrappedSig)
  //   userOperation.signature = wrappedSig
  //   const userOperationHash = (await smartAccountClient.request({
  //     method: "eth_sendUserOperation",
  //     params: [
  //       deepHexlify({ ...userOperation, eip7702Auth: signedAuthorization }),
  //       entryPoint08Address,
  //     ],
  //   })) as Hex;
  //   console.log("User operation hash:", userOperationHash);

  //   const { receipt } = await smartAccountClient.waitForUserOperationReceipt({
  //     hash: userOperationHash,
  //   });
  //   console.log("User operation receipt:", receipt);
  } catch (error) {
    console.log("Failed to decode ERC20 error", { error });
  }

  // console.info('End');
})();

type ToSimpleSmartAccountParameters<
  entryPointVersion extends EntryPointVersion
> = {
  client: Client<
    Transport,
    Chain | undefined,
    JsonRpcAccount | LocalAccount | undefined
  >
  owner: OneOf<
    | WalletClient<Transport, Chain | undefined, Account>
    | LocalAccount
  >
  factoryAddress?: Address
  entryPoint?: {
    address: Address
    version: entryPointVersion
  }
  index?: bigint
  address?: Address
  nonceKey?: bigint
}


export type SimpleSmartAccountImplementation<
  entryPointVersion extends EntryPointVersion = "0.8"
> = Assign<
  SmartAccountImplementation<
    ReturnType<typeof getEntryPointAbi>,
    entryPointVersion
  >,
  { sign: NonNullable<SmartAccountImplementation["sign"]> }
>

export type ToSimpleSmartAccountReturnType<
  entryPointVersion extends EntryPointVersion = "0.8"
> = SmartAccount<SimpleSmartAccountImplementation<entryPointVersion>>

/**
 * @description Creates an Simple Account from a private key.
 *
 * @returns A Private Key Simple Account.
 */
async function toSimpleSmartAccount<
  entryPointVersion extends EntryPointVersion
>(
  parameters: ToSimpleSmartAccountParameters<entryPointVersion>
): Promise<ToSimpleSmartAccountReturnType<entryPointVersion>> {
  const {
    client,
    owner,
    factoryAddress: _factoryAddress,
    index = BigInt(0),
    address,
    nonceKey
  } = parameters

  const localOwner = owner as LocalAccount

  const entryPoint = parameters.entryPoint
    ? {
      address: parameters.entryPoint.address,
      abi: getEntryPointAbi(parameters.entryPoint.version),
      version: parameters.entryPoint.version
    }
    : ({
      address: entryPoint07Address,
      abi: getEntryPointAbi("0.8"),
      version: "0.8"
    } as const)

  const factoryAddress = getFactoryAddress(
    entryPoint.version,
    _factoryAddress
  )

  let accountAddress: Address | undefined = address

  let chainId: number

  const getMemoizedChainId = async () => {
    if (chainId) return chainId
    chainId = client.chain
      ? client.chain.id
      : await getAction(client, getChainId, "getChainId")({})
    return chainId
  }

  const getFactoryArgs = async () => {
    // For EIP-7702, the EOA delegates directly to the implementation
    // No factory or initCode is needed
    return {
      factory: undefined,
      factoryData: undefined
    }
  }

  type GetAccountNonceParams = {
    address: Address
    entryPointAddress: Address
    key?: bigint
  }

  const getAccountNonce = async (
    client: Client,
    args: GetAccountNonceParams
  ): Promise<bigint> => {
    const { address, entryPointAddress, key = BigInt(0) } = args

    return await getAction(
      client,
      readContract,
      "readContract"
    )({
      address: entryPointAddress,
      abi: [
        {
          inputs: [
            {
              name: "sender",
              type: "address"
            },
            {
              name: "key",
              type: "uint192"
            }
          ],
          name: "getNonce",
          outputs: [
            {
              name: "nonce",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: "getNonce",
      args: [address, key]
    })
  }

  // https://github.com/pimlicolabs/contracts/blob/80277d0de609e6b5fb4cedeeb1fb9a023caed59f/src/GetSenderAddressHelper.sol
  const GetSenderAddressHelperByteCode =
    "0x60806040526102a28038038091610015826100ae565b6080396040816080019112610093576080516001600160a01b03811681036100935760a0516001600160401b0381116100935782609f82011215610093578060800151610061816100fc565b9361006f60405195866100d9565b81855260a082840101116100935761008e9160a0602086019101610117565b610196565b600080fd5b634e487b7160e01b600052604160045260246000fd5b6080601f91909101601f19168101906001600160401b038211908210176100d457604052565b610098565b601f909101601f19168101906001600160401b038211908210176100d457604052565b6001600160401b0381116100d457601f01601f191660200190565b60005b83811061012a5750506000910152565b818101518382015260200161011a565b6040916020825261015a8151809281602086015260208686019101610117565b601f01601f1916010190565b3d15610191573d90610177826100fc565b9161018560405193846100d9565b82523d6000602084013e565b606090565b600091908291826040516101cd816101bf6020820195639b249f6960e01b87526024830161013a565b03601f1981018352826100d9565b51925af16101d9610166565b906102485760048151116000146101f7576024015160005260206000f35b60405162461bcd60e51b8152602060048201526024808201527f67657453656e64657241646472657373206661696c656420776974686f7574206044820152636461746160e01b6064820152608490fd5b60405162461bcd60e51b815260206004820152602b60248201527f67657453656e6465724164647265737320646964206e6f74207265766572742060448201526a185cc8195e1c1958dd195960aa1b6064820152608490fdfe"

  const GetSenderAddressHelperAbi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_entryPoint",
          type: "address"
        },
        {
          internalType: "bytes",
          name: "initCode",
          type: "bytes"
        }
      ],
      stateMutability: "payable",
      type: "constructor"
    }
  ]

  type GetSenderAddressParams = OneOf<
    | {
      initCode: Hex
      entryPointAddress: Address
      factory?: never
      factoryData?: never
    }
    | {
      entryPointAddress: Address
      factory: Address
      factoryData: Hex
      initCode?: never
    }
  >


  const getSenderAddress = async (
    client: Client,
    args: Prettify<GetSenderAddressParams>
  ): Promise<Address> => {
    const { initCode, entryPointAddress, factory, factoryData } = args

    if (!initCode && !factory && !factoryData) {
      throw new Error(
        "Either `initCode` or `factory` and `factoryData` must be provided"
      )
    }

    const formattedInitCode =
      initCode || concat([factory as Hex, factoryData as Hex])

    const { data } = await getAction(
      client,
      call,
      "call"
    )({
      data: encodeDeployData({
        abi: GetSenderAddressHelperAbi,
        bytecode: GetSenderAddressHelperByteCode,
        args: [entryPointAddress, formattedInitCode]
      })
    })

    if (!data) {
      throw new Error("Failed to get sender address")
    }

    return decodeAbiParameters([{ type: "address" }], data)[0]
  }


  return toSmartAccount({
    client,
    entryPoint,
    getFactoryArgs,
    async getAddress() {
      if (accountAddress) return accountAddress

      const { factory, factoryData } = await getFactoryArgs()

      // Get the sender address based on the init code. hardcoded here because there's no factory yet
      accountAddress =ADDRESS_OPENFORT_USER_ADDRESS_7702 as Hex;
      // accountAddress = await getSenderAddress(client, {
      //     factory,
      //     factoryData,
      //     entryPointAddress: entryPoint.address
      // })
      return accountAddress
    },
    async encodeCalls(calls) {
      if (calls.length > 1) {
        return encodeFunctionData({
          abi: executeBatch08Abi,
          functionName: "executeBatch",
          args: [
            calls.map((a) => ({
              target: a.to,
              value: a.value ?? 0n,
              data: a.data ?? "0x"
            }))
          ]
        })

      }

      const call = calls.length === 0 ? undefined : calls[0]

      if (!call) {
        throw new Error("No calls to encode")
      }

      // 0.6, 0.7 and 0.8 all use the same for "execute"
      return encodeFunctionData({
        abi: executeSingleAbi,
        functionName: "execute",
        args: [call.to, call.value ?? 0n, call.data ?? "0x"]
      })
    },
    decodeCalls: async (callData) => {
      try {
        const calls: {
          to: Address
          data: Hex
          value?: bigint
        }[] = []

        const decodedV8 = decodeFunctionData({
          abi: executeBatch08Abi,
          data: callData
        })

        for (const call of decodedV8.args[0]) {
          calls.push({
            to: call.target,
            data: call.data,
            value: call.value
          })
        }

        return calls
      } catch (_) {
        const decodedSingle = decodeFunctionData({
          abi: executeSingleAbi,
          data: callData
        })

        return [
          {
            to: decodedSingle.args[0],
            value: decodedSingle.args[1],
            data: decodedSingle.args[2]
          }
        ]
      }
    },
    async getNonce(args) {
      return getAccountNonce(client, {
        address: await this.getAddress(),
        entryPointAddress: entryPoint.address,
        key: nonceKey ?? args?.key
      })
    },
    async getStubSignature() {
      // OPF7702 expects signature as abi.encode(KeyType, bytes)
      // KeyType.EOA = 0

      // For gas estimation, sign a dummy hash with the EOA's private key
      // This ensures ECDSA.recover() returns address(this) and passes validation
      const dummyHash = '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;
      const dummySig = await localOwner.signMessage({
        message: { raw: dummyHash }
      });

      // ABI encode (uint256 keyType, bytes sigData)
      // This produces exactly 192 bytes: 32 (KeyType) + 32 (offset) + 32 (length) + 96 (65 bytes padded)
      return encodeAbiParameters(
        [{ type: 'uint256' }, { type: 'bytes' }],
        [0n, dummySig] // KeyType.EOA = 0, signed by EOA for validation
      );
    },
    async sign({ hash }) {
      return this.signMessage({ message: hash })
    },
    signMessage: async (_) => {
      throw new Error("Simple account isn't 1271 compliant")
    },
    signTypedData: async (_) => {
      throw new Error("Simple account isn't 1271 compliant")
    },
    async signUserOperation(parameters) {
      const { chainId = await getMemoizedChainId(), ...userOperation } =
        parameters

      const typedData = getUserOperationTypedData({
        chainId,
        entryPointAddress: entryPoint.address,
        userOperation: {
          ...userOperation,
          sender:
            userOperation.sender ?? (await this.getAddress()),
          signature: "0x"
        }
      })

      // Get raw ECDSA signature (65 bytes)
      const rawSignature = await localOwner.signTypedData(typedData);

      // OPF7702 expects signature as abi.encode(KeyType, bytes)
      // Encode with KeyType.EOA = 0
      return encodeAbiParameters(
        [{ type: 'uint256' }, { type: 'bytes' }],
        [0n, rawSignature]
      );
    }
  }) as Promise<ToSimpleSmartAccountReturnType<entryPointVersion>>
}

const executeSingleAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "dest",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "func",
        type: "bytes"
      }
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const

const executeBatch08Abi = [
  {
    type: "function",
    name: "executeBatch",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct BaseAccount.Call[]",
        components: [
          {
            name: "target",
            type: "address",
            internalType: "address"
          },
          {
            name: "value",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes"
          }
        ]
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const

