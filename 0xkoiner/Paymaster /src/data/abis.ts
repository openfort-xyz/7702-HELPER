export const OPF7702_EXECUTE_ABI = [{
  inputs: [
    { name: "mode", type: "bytes32" },
    { name: "executionData", type: "bytes" }
  ],
  name: "execute",
  outputs: [],
  stateMutability: "payable",
  type: "function"
}] as const;

export const ENTRY_POINT_GET_NONCE_ABI = [{
  inputs: [
    { name: "sender", type: "address" },
    { name: "key", type: "uint192" }
  ],
  name: "getNonce",
  outputs: [{ name: "nonce", type: "uint256" }],
  stateMutability: "view",
  type: "function"
}] as const;

export const EXECUTE_SINGLE_ABI = [{
  inputs: [
    { name: "dest", type: "address" },
    { name: "value", type: "uint256" },
    { name: "func", type: "bytes" }
  ],
  name: "execute",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}] as const;
