// src/getCode7702.ts
import 'dotenv/config';
import { Address, Chain, createPublicClient, http } from "viem";

const prefix770 = "0xef0100";
const rpc = process.env.SEPOLIA_RPC_URL!;

/** ------------------------------------------------------------
 * Checks whether the given address has 7702-style bytecode.
 * If matched, extracts and logs the designator address.
 *
 * @param address Address to check
 * @returns true if valid 7702 code, false otherwise
 ------------------------------------------------------------  */
export async function getCode7702(address: Address, chain: Chain): Promise<boolean> {
  const client = createPublicClient({
    chain: chain,
    transport: http(rpc),
  });

  try {
    const code = await client.getCode({ address });
    console.log(code)
    if (!code || code.length < 9) {
      console.warn("⚠️ Code is too short or empty.");
      return false;
    }

    const prefix = code.slice(0, 8);
    const designator = `0x${code.slice(8, 48)}` as Address;

    if (prefix.toLowerCase() === prefix770.toLowerCase()) {
      console.log("✅ 7702-compatible smart account");
      console.log("📦 Designator Address:", designator);
      return true;
    } else {
      console.log("❌ Not a 7702-compatible contract");
      return false;
    }
  } catch (err) {
    console.error("💥 Failed to fetch code:", err);
    return false;
  }
}
