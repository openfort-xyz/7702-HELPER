import { randomBytes } from "crypto";
import { concat, toHex, recoverAddress } from 'viem'

const SECP256K1_N_HALF = BigInt('0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0')

export async function generateRandomSignature(messageHash: `0x${string}`) {
  while (true) {
    try {
      // Generate random r and s as described in the article
      const r = randomBytes(32)

      // Generate random s, ensuring s < secp256k1n/2 (EIP-2 compliance)
      let s: Buffer
      do {
        s = randomBytes(32)
      } while (BigInt(`0x${s.toString('hex')}`) >= SECP256K1_N_HALF)

      // Random v value (27 or 28) - article says "we don't care about the v value"
      const v = Math.random() < 0.5 ? 27 : 28

      // Concatenate [r, s, v] as described in article
      const signature = concat([
        `0x${r.toString('hex')}`,
        `0x${s.toString('hex')}`,
        toHex(v, { size: 1 })
      ])

      // Recover address using ecrecover equivalent
      const recoveredAddress = await recoverAddress({
        hash: messageHash,
        signature
      })

      console.log("signature", signature)
      console.log("recoveredAddress", recoveredAddress)
      return { signature, recoveredAddress }

    } catch (error) {
      // Keep trying until we get a valid signature/address pair
      continue
    }
  }
}
