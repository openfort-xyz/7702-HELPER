import { executeBatch08Abi } from "../data/abis";
import { SIMPLE_ACCOUNT } from "../data/addressBook";
import { UserOperation } from "viem/account-abstraction";
import { SignAuthorizationReturnType } from "viem/accounts";
import { type UserOperationWithEip7702Auth } from '../actions/pimlicoActions';
import { Address, EncodeFunctionDataReturnType, Hex, PublicClient, encodeFunctionData, parseEther, type Call, WalletClient, Account, toHex, SignedAuthorization } from "viem";

export type gasFees = {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

class Helpres {
  readonly DUMMY_SIG = '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as Hex;
  readonly RECIVER = '0x6E10F8bEfC4069Faa560bF3DdFe441820BbE37d0' as Hex;
  readonly VERIFYING_MODE = 0;
  readonly ERC20_MODE = 0;

  async getGasParams(publicClient: PublicClient): Promise<gasFees> {
    const { maxFeePerGas, maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  async getFreshUserOp(authorization: SignAuthorizationReturnType): Promise<UserOperationWithEip7702Auth> {
    return {
      sender: '0x',
      nonce: 0n,
      factory: "0x7702",
      callData: '0x',
      callGasLimit: 0n,
      verificationGasLimit: 0n,
      preVerificationGas: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      signature: this.DUMMY_SIG,
      eip7702Auth: {
        address: authorization.address,
        chainId: authorization.chainId, 
        nonce: authorization.nonce,     
        r: authorization.r,
        s: authorization.s,
        yParity: authorization.yParity,
        v: authorization.v,  
      } as SignedAuthorization,
    }
  }

  async getCallData(to: Address = this.RECIVER, value: bigint = parseEther('0'), data: Hex = '0x'): Promise<EncodeFunctionDataReturnType> {
    const calls: Call[] = []
    calls.push({ to, value, data })

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

  async getAuthorization(walletClient: WalletClient, eoa: Account): Promise<SignAuthorizationReturnType> {
    const authorization = await walletClient.signAuthorization({
      account: eoa,
      contractAddress: SIMPLE_ACCOUNT,
    });

    return authorization;
  }
}

export const helpers = new Helpres();