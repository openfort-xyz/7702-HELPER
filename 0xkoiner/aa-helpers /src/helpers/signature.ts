import { type Hex, encodeAbiParameters } from "viem";

export function wrapSignature(signature: Hex): Hex {
  return encodeAbiParameters(
    [{ type: 'uint256' }, { type: 'bytes' }],
    [0n, signature]
  );
}
