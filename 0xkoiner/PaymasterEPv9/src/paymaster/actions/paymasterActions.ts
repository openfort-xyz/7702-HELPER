import { Address, concat, concatHex, Hex, pad, PublicClient, toHex } from "viem";
import { ABI_PAYMASTER } from "../data/abis";
import { PAYMASTER_V3 } from "../data/addressBook";
import { UserOperation } from "viem/account-abstraction";
import { PackedUserOperation } from "viem/account-abstraction";
import { type UserOperationWithEip7702Auth } from '../actions/pimlicoActions';


export function toPackedFromV08(uo: UserOperationWithEip7702Auth): PackedUserOperation {
  const initCode = uo.factory
    ? uo.factory === "0x7702"
      ? pad("0x7702", { dir: "right", size: 20 })
      : concat([uo.factory, uo.factoryData || "0x"])
    : "0x";

  return {
    sender: uo.sender,
    nonce: uo.nonce,
    initCode: initCode,
    callData: uo.callData,
    accountGasLimits: getAccountGasLimits(uo),
    preVerificationGas: uo.preVerificationGas,
    gasFees: getGasLimits(uo),
    paymasterAndData: getPaymasterAndData(uo),
    signature: uo.signature
  }
}

export async function getDeposit(publicClient: PublicClient): Promise<bigint> {
  return await publicClient.readContract({
    address: PAYMASTER_V3,
    abi: ABI_PAYMASTER,
    functionName: 'getDeposit',
  });
}

export async function getHash(publicClient: PublicClient, mode: number, userOp: UserOperationWithEip7702Auth): Promise<Hex> {
  const packed = toPackedFromV08(userOp);
  return await publicClient.readContract({
    address: userOp.paymaster || PAYMASTER_V3,
    abi: ABI_PAYMASTER,
    functionName: 'getHash',
    args: [mode, packed]
  });
}

export async function createPaymasterData(
  paymasterVerificationGas: bigint,
  paymasterPostOpGas: bigint,
  validUntil: number,
  validAfter: number,
  signature: Hex
): Promise<Hex> {
  const verificationGas = toHex(paymasterVerificationGas, { size: 16 });
  const postOpGas = toHex(paymasterPostOpGas, { size: 16 });
  const mode = '0x01'; // Mode byte
  const validUntilHex = toHex(validUntil, { size: 6 });
  const validAfterHex = toHex(validAfter, { size: 6 });

  return concat([
    verificationGas,
    postOpGas,
    mode,
    validUntilHex,
    validAfterHex,
    signature
  ]) as Hex;
}

export async function createPaymasterDataERC20(
  paymasterVerificationGas: bigint,
  paymasterPostOpGas: bigint,
  validUntil: number,
  validAfter: number,
  signature: Hex
): Promise<Hex> {
  const verificationGas = toHex(paymasterVerificationGas, { size: 16 });
  const postOpGas = toHex(paymasterPostOpGas, { size: 16 });
  const mode = '0x01'; // Mode byte
  const validUntilHex = toHex(validUntil, { size: 6 });
  const validAfterHex = toHex(validAfter, { size: 6 });

  return concat([
    verificationGas,
    postOpGas,
    mode,
    validUntilHex,
    validAfterHex,
    signature
  ]) as Hex;
}

export function getAccountGasLimits(unpackedUserOp: UserOperationWithEip7702Auth) {
  return concat([
    pad(toHex(unpackedUserOp.verificationGasLimit), {
      size: 16
    }),
    pad(toHex(unpackedUserOp.callGasLimit), { size: 16 })
  ])
}

export function getGasLimits(unpackedUserOp: UserOperationWithEip7702Auth) {
  return concat([
    pad(toHex(unpackedUserOp.maxPriorityFeePerGas), {
      size: 16
    }),
    pad(toHex(unpackedUserOp.maxFeePerGas), { size: 16 })
  ])
}

export function getPaymasterAndData(unpackedUserOp: UserOperationWithEip7702Auth) {
  return unpackedUserOp.paymaster
    ? concat([
      unpackedUserOp.paymaster,
      pad(toHex(unpackedUserOp.paymasterVerificationGasLimit || 0n), {
        size: 16
      }),
      pad(toHex(unpackedUserOp.paymasterPostOpGasLimit || 0n), {
        size: 16
      }),
      unpackedUserOp.paymasterData || ("0x" as Hex)
    ])
    : "0x"
}
