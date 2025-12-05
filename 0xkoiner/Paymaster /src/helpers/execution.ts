import { type Address, type Hex, encodeAbiParameters, encodeFunctionData, pad, toHex } from "viem";
import { OPF7702_EXECUTE_ABI } from "../data/abis";

export interface Call {
  target: Address;
  value: bigint;
  data: Hex;
}

const MODE_1 = (() => {
  const value = BigInt("0x01000000000000000000") << (22n * 8n);
  return pad(toHex(value), { size: 32 }) as Hex;
})();

function encodeExecutionData(calls: Call[]): Hex {
  const callType = {
    components: [
      { name: 'target', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ],
    name: 'Call',
    type: 'tuple'
  };

  return encodeAbiParameters(
    [{ ...callType, type: 'tuple[]' }],
    [calls]
  );
}

export function createExecuteCallData(calls: Call[]): Hex {
  const executionData = encodeExecutionData(calls);

  return encodeFunctionData({
    abi: OPF7702_EXECUTE_ABI,
    functionName: 'execute',
    args: [MODE_1, executionData]
  });
}
