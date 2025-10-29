import axios from "axios";
import { Hex, SignedAuthorization, toHex } from "viem";
import { helpers } from "../helpers/Helpers";
import { SmartAccountClient, deepHexlify } from 'permissionless';
import { SignAuthorizationReturnType } from "viem/accounts";
import { PimlicoClient } from "permissionless/clients/pimlico";
import { PaymasterClient, GetPaymasterStubDataReturnType } from 'viem/account-abstraction'
import { entryPoint08Address, EstimateUserOperationGasReturnType, UserOperation, GetPaymasterDataReturnType } from "viem/account-abstraction";

export type UserOperationWithEip7702Auth = UserOperation<'0.8'> & {
  eip7702Auth: SignedAuthorization;
};

export async function getDummyPaymasterData(
  userOp: UserOperation<'0.8'>,
  authorization: SignAuthorizationReturnType
): Promise<GetPaymasterStubDataReturnType> {
  const params = [
    {
      callData: userOp.callData,
      maxFeePerGas: toHex(userOp.maxFeePerGas),
      maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
      nonce: toHex(userOp.nonce),
      sender: userOp.sender,
      signature: userOp.signature,
      eip7702Auth: {
        address: authorization.address,
        chainId: toHex(authorization.chainId),
        nonce: toHex(authorization.nonce),
        r: authorization.r,
        s: authorization.s,
        yParity: authorization.yParity,
      },
      callGasLimit: toHex(userOp.callGasLimit),
      verificationGasLimit: toHex(userOp.verificationGasLimit),
      preVerificationGas: toHex(userOp.preVerificationGas),
    },
    entryPoint08Address,
    '0xaa36a7',
  ];

  const apiKey = process.env.PIMLICO_API;

  const response = await axios.post(
    'https://api.pimlico.io/v2/sepolia/rpc',
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'pm_getPaymasterStubData',
      params
    },
    {
      params: {
        apikey: apiKey,
      },
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
      }
    }
  );

  return response.data.result;
}

export async function getDummyPaymasterDataERC20(
  userOp: UserOperation<'0.8'>,
  authorization: SignAuthorizationReturnType
): Promise<GetPaymasterStubDataReturnType> {
  const params = [
    {
      callData: userOp.callData,
      maxFeePerGas: toHex(userOp.maxFeePerGas),
      maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
      nonce: toHex(userOp.nonce),
      sender: userOp.sender,
      signature: userOp.signature,
      eip7702Auth: {
        address: authorization.address,
        chainId: toHex(authorization.chainId),
        nonce: toHex(authorization.nonce),
        r: authorization.r,
        s: authorization.s,
        yParity: authorization.yParity,
      },
      callGasLimit: toHex(userOp.callGasLimit),
      verificationGasLimit: toHex(userOp.verificationGasLimit),
      preVerificationGas: toHex(userOp.preVerificationGas),
    },
    entryPoint08Address,
    '0xaa36a7',
    {
      paymasterConfig: {
        verifyingMode: false,
        erc20Mode: true,
      }
    }
  ];

  const apiKey = process.env.PIMLICO_API;

  const response = await axios.post(
    'https://api.pimlico.io/v2/sepolia/rpc',
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'pm_getPaymasterStubData',
      params
    },
    {
      params: {
        apikey: apiKey,
      },
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
      }
    }
  );

  return response.data.result;
}

export async function estimateUserOperationGas(smartAccountClient: SmartAccountClient, userOperation: UserOperationWithEip7702Auth) {
  return (await smartAccountClient.request({
    method: "eth_estimateUserOperationGas",
    params: [deepHexlify({ ...userOperation }), entryPoint08Address],
  })) as EstimateUserOperationGasReturnType;
}

export async function getPaymasterData(pimlicoClient: PimlicoClient, userOperation: UserOperationWithEip7702Auth, chainId: number): Promise<GetPaymasterDataReturnType> {
  return await pimlicoClient.getPaymasterData({
    ...userOperation,
    chainId: chainId,
    entryPointAddress: entryPoint08Address,
  });
}

export async function sendUserOperationWithAuthorization(smartAccountClient: SmartAccountClient, userOperation: UserOperationWithEip7702Auth, signedAuthorization: SignAuthorizationReturnType) {
  return (await smartAccountClient.request({
    method: "eth_sendUserOperation",
    params: [
      deepHexlify({ ...userOperation, eip7702Auth: signedAuthorization }),
      entryPoint08Address,
    ],
  })) as Hex;
}

export async function sendUserOperation(smartAccountClient: SmartAccountClient, userOperation: UserOperationWithEip7702Auth) {
  return (await smartAccountClient.request({
    method: "eth_sendUserOperation",
    params: [
      deepHexlify({ ...userOperation}),
      entryPoint08Address,
    ],
  })) as Hex;
}

export async function waitForUserOperationReceipt(smartAccountClient: SmartAccountClient, userOperationHash: Hex) {
  return await smartAccountClient.waitForUserOperationReceipt({
    hash: userOperationHash,
  });
}
