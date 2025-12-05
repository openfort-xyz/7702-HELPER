export interface EIP7702Authorization {
    chainId: number
    address: `0x${string}`
    nonce: number
    yParity: number
    r: `0x${string}`
    s: `0x${string}`
  }
  
  /**
   * Creates EIP-7702 authorization from signature
   * @param signature - The 65-byte signature from generateRandomSignature
   * @param smartAccountAddress - Address of smart account contract
   * @param chainId - Chain ID (0 for all chains)
   * @param nonce - Account nonce (usually 0)
   */
  export function createAuthorization(
    signature: `0x${string}`,
    smartAccountAddress: `0x${string}`,
    chainId: number = 0,
    nonce: number = 0
  ): EIP7702Authorization {
    // Extract r, s, v from signature (65 bytes: 32r + 32s + 1v)
    const r = signature.slice(0, 66) as `0x${string}` // 0x + 64 chars
    const s = `0x${signature.slice(66, 130)}` as `0x${string}` // 64 chars  
    const v = parseInt(signature.slice(130, 132), 16) // last byte
    
    // Convert v to y_parity (v - 27)
    const yParity = v === 27 ? 0 : 1
    
    return {
      chainId,
      address: smartAccountAddress,
      nonce,
      yParity,
      r,
      s
    }
  }