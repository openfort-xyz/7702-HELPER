import {
    concatHex,
    encodeAbiParameters,
    keccak256,
    recoverAddress,
    toBytes,
  } from 'viem'
  import { privateKeyToAccount, sign } from 'viem/accounts'
  import type { Address, Hex } from 'viem'
  
  export type GetHashArgs = {
    name: string
    version?: string
    chainId: bigint | number
    verifyingContract: Address
    initTypeHash: Hex
    keyEnc: Hex
    keyDataEnc: Hex
    skEnc: Hex
    skDataEnc: Hex
    initialGuardian: Hex
  }
  
  export function getEIP712HashToSign(args: GetHashArgs) {
    const {
      name = 'OPF7702Recoverable',
      version = '1',
      chainId,
      verifyingContract,
      initTypeHash,
      keyEnc,
      keyDataEnc,
      skEnc,
      skDataEnc,
      initialGuardian,
    } = args
  
    const structHash = keccak256(
      encodeAbiParameters(
        [
          { type: 'bytes32' },
          { type: 'bytes' },
          { type: 'bytes' },
          { type: 'bytes' },
          { type: 'bytes' },
          { type: 'bytes32' },
        ],
        [
          initTypeHash,
          keyEnc,
          keyDataEnc,
          skEnc,
          skDataEnc,
          initialGuardian,
        ],
      ),
    )
  
    const DOMAIN_TYPEHASH = keccak256(
      toBytes(
        'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)',
      ),
    )
  
    const domainSeparator = keccak256(
      encodeAbiParameters(
        [
          { type: 'bytes32' },
          { type: 'bytes32' },
          { type: 'bytes32' },
          { type: 'uint256' },
          { type: 'address' },
        ],
        [
          DOMAIN_TYPEHASH,
          keccak256(toBytes(name)),
          keccak256(toBytes(version)),
          BigInt(chainId),
          verifyingContract,
        ],
      ),
    )
  
    const digest: Hex = keccak256(
      concatHex(['0x1901', domainSeparator, structHash]),
    )
  
    return { digest, structHash, domainSeparator } as const
  }
  
  export async function recoverSigner(
    digest: Hex,
    signature: Hex | { r: Hex; s: Hex; v?: number | bigint; yParity?: number },
  ): Promise<Address> {
    return recoverAddress({ hash: digest, signature })
  }
  
  async function example() {
    const TOKEN =
      '0x9C0b94fb071Ed4066d7C18F4b68968e311A66209' as Address
  
    const allowedSelectors = [
      '0xa9059cbb',
      '0x40c10f19',
      '0x00000000',
    ] as Hex[]
  
    const INIT_TYPEHASH =
      '0x82dc6262fca76342c646d126714aa4005dfcd866448478747905b2e7b9837183' as Hex
  
    const changePublicKeyX =
      '0xe5a3fe2f831377233f24e655f2295b470fac386552824223a7c122dbbc8fe131' as Hex
    const changePublicKeyY =
      '0xed289d65087d2ea63e98abf88a285af69efa092f91a64cf291811a6fbf613172' as Hex
  
    const keyEnc = encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'uint8' },
      ],
      [
        changePublicKeyX,
        changePublicKeyY,
        '0x0000000000000000000000000000000000000000',
        1,
      ],
    )
  
    const keyDataEnc = encodeAbiParameters(
      [
        { type: 'uint48' },
        { type: 'uint48' },
        { type: 'uint48' },
        { type: 'bool' },
        { type: 'address' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes4[]' },
        { type: 'uint256' },
      ],
      [
        281474976710655n,
        0n,
        0n,
        false,
        '0x0000000000000000000000000000000000000000',
        TOKEN,
        0n,
        allowedSelectors,
        0n,
      ],
    )
  
    const skEnc = encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'uint8' },
      ],
      [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        1,
      ],
    )
  
    const skDataEnc = encodeAbiParameters(
      [
        { type: 'uint48' },
        { type: 'uint48' },
        { type: 'uint48' },
        { type: 'bool' },
        { type: 'address' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes4[]' },
      ],
      [
        281474976710655n,
        0n,
        0n,
        false,
        '0x0000000000000000000000000000000000000000',
        TOKEN,
        0n,
        allowedSelectors,
      ],
    )
  
    const ownerPk =
      '0xPRIVATE_KEY' as Hex
    const owner = privateKeyToAccount(ownerPk).address
  
    const guardian = keccak256(toBytes(owner)) as Hex
  
    const { digest } = getEIP712HashToSign({
      name: 'OPF7702Recoverable',
      version: '1',
      chainId: 11155111n,
      verifyingContract: owner,
      initTypeHash: INIT_TYPEHASH,
      keyEnc,
      keyDataEnc,
      skEnc,
      skDataEnc,
      initialGuardian: guardian,
    })
  
    const sig = await sign({ hash: digest, privateKey: ownerPk })
    const recovered = await recoverSigner(digest, sig)
  
    console.log({ digest, sig, recovered })
  }
  
  example().catch(console.error)