import { keccak256, encodeAbiParameters } from 'viem';
import { toPackedFromV08 } from '../src/paymaster/actions/paymasterActions';
import { type UserOperationWithEip7702Auth } from '../src/paymaster/actions/pimlicoActions';

const PAYMASTER_DATA_OFFSET = 52;
const MODE_AND_ALLOW_ALL_BUNDLERS_LENGTH = 1;
const VERIFYING_PAYMASTER_DATA_LENGTH = 12;
const chainId = 84532n;

function computeHash(userOp: UserOperationWithEip7702Auth) {
  const packed = toPackedFromV08(userOp);
  const initCodeHash = keccak256(packed.initCode);
  const callDataHash = keccak256(packed.callData);
  const sliceBytes = PAYMASTER_DATA_OFFSET + MODE_AND_ALLOW_ALL_BUNDLERS_LENGTH + VERIFYING_PAYMASTER_DATA_LENGTH;
  const paymasterPrefix = ('0x' + packed.paymasterAndData.slice(2, 2 + sliceBytes * 2)) as `0x${string}`;
  const paymasterPrefixHash = keccak256(paymasterPrefix);
  const encoded = encodeAbiParameters(
    [
      { name: 'sender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'accountGasLimits', type: 'bytes32' },
      { name: 'preVerificationGas', type: 'uint256' },
      { name: 'gasFees', type: 'bytes32' },
      { name: 'initCodeHash', type: 'bytes32' },
      { name: 'callDataHash', type: 'bytes32' },
      { name: 'paymasterAndDataHash', type: 'bytes32' },
    ],
    [
      packed.sender,
      packed.nonce,
      packed.accountGasLimits,
      packed.preVerificationGas,
      packed.gasFees,
      initCodeHash,
      callDataHash,
      paymasterPrefixHash,
    ]
  );
  const userOpHash = keccak256(encoded);
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'userOpHash', type: 'bytes32' },
        { name: 'chainId', type: 'uint256' },
      ],
      [userOpHash, chainId]
    )
  );
}

const userOp: UserOperationWithEip7702Auth = {
  sender: '0x2426EDd2D2e445674665D1f79F0D863281055879',
  nonce: 1n,
  factory: '0x7702',
  callData: '0x34fcd5be0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006e10f8befc4069faa560bf3ddfe441820bbe37d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 0x4623n,
  verificationGasLimit: 0x7cb3n,
  preVerificationGas: 0x132c2n,
  maxFeePerGas: 1000072n,
  maxPriorityFeePerGas: 1000000n,
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
  eip7702Auth: {
    address: '0xe6Cae83BdE06E4c305530e199D7217f42808555B',
    chainId: 84532,
    nonce: 2,
    r: '0x4f7ce27de052334141557ebcaf6f4b83f47389f9271aa3ae94a34d40658799f0',
    s: '0x2161051385d6f365daad5a8e72a50d704e7cc1d2a3820c19a821f18d7efdd3f7',
    yParity: 0,
    v: 27n,
  },
  paymaster: '0xc524309B8F502a0CCE700321B8c60B3b4faeE9dB',
  paymasterData: '0x0100006900cf1d0000000000008b0232cdfe2db1de3b5502fd7fd29daeb00af28f98e9a27e0d690b9cac734ae8136efaa54e4fba272d98e74c07de9939c8304d571749dba5f65c55795042fcad1b',
  paymasterVerificationGasLimit: 0xe062n,
  paymasterPostOpGasLimit: 1n,
};

console.log('local hash', computeHash(userOp));
