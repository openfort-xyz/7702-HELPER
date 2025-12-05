// src/isValidP256.ts
import 'dotenv/config';  
import { sepolia } from "viem/chains";
import { abiP256 } from "./utils/abis";
import { createPublicClient, type Hex, http } from "viem";
/* ────────────────────────────────────────────────────────── config ── */
const rpc = process.env.SEPOLIA_RPC_URL!;

/** P-256 curve order (𝑛) */
const P256_N = BigInt(
  "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"
);

/** Deployed Solady verifier on Sepolia */
const P256_CONTRACT = "0xCbF90Ad1286eF8A2Bdcd62C3C6b3Afae3FD03008" as const;

/** Read-only JSON-RPC client (Sepolia) */
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpc),
});

/* ────────────────────────────────────────────────────────── types ── */

export type P256Data = {
  hashHex: Hex;        // 32-byte message hash
  rHex: Hex;           // signature.r
  sHex: Hex;           // signature.s
  xHex: Hex;           // pub-key X coord
  yHex: Hex;           // pub-key Y coord
  challenge: Hex;      // alias of hashHex
  webauthnData: any;   // noble-curves Signature (if you keep it)
  isValidSignature: boolean; // local JS verification
};

/* ────────────────────────────────────────────── helper: normalize ── */

/** ------------------------------------------------------------------
 * Ensures the P-256 signature is in “low-S” form ( s ≤ n/2 ) to avoid
 * malleability.  If s is already low we return the original pair.
 *
 * @param r  32-byte hex string (signature.r)
 * @param s  32-byte hex string (signature.s)
 * @returns  Same r plus (possibly) reduced s, both Hex-encoded
 * ----------------------------------------------------------------- */
function normalizeP256Signature(
  r: Hex,
  s: Hex
): { r: Hex; s: Hex } {
  const sBig = BigInt(s);
  const halfN = P256_N / 2n;

  if (sBig > halfN) {
    // s' = n − s   (still within group order)
    const sNormalized = P256_N - sBig;
    const sHex = `0x${sNormalized.toString(16).padStart(64, "0")}` as Hex;
    return { r, s: sHex };
  }
  return { r, s }; // already low-S
}

/* ─────────────────────────────────────────────────────────── main ── */

/** ------------------------------------------------------------------
 * Calls a Solady smart-contract verifier to check a P-256 signature.
 * It performs two reads:
 *   (A) strict   — low-S enforced on-chain
 *   (B) lenient  — accepts high-S (for diagnostics)
 *
 * @param p256Data  Object produced by `p256Data()` helper
 * @returns         true if signature is valid under strict rules
 * ----------------------------------------------------------------- */
export const isValidP256 = async (
  p256Data: P256Data
): Promise<boolean> => {
  try {
    /* 1️⃣  Normalise signature ------------------------------------- */
    const { r: lowSR, s: lowSS } = normalizeP256Signature(
      p256Data.rHex,
      p256Data.sHex
    );

    /* 2️⃣  Strict verification (low-S) ----------------------------- */
    const isValidStrict = await publicClient.readContract({
      address: P256_CONTRACT,
      abi: abiP256,
      functionName: "verifyP256Signature",
      args: [
        p256Data.hashHex,
        lowSR,
        lowSS,
        p256Data.xHex,
        p256Data.yHex,
      ],
    });
    console.log("✅ strict (low-S) :", isValidStrict);
    console.log("  hash:", p256Data.hashHex);
    console.log("  r   :", lowSR);
    console.log("  s   :", lowSS);
    console.log("  x   :", p256Data.xHex);
    console.log("  y   :", p256Data.yHex);

    /* 3️⃣  Lenient check (original S) ----------------------------- */
    const isValidLenient = await publicClient.readContract({
      address: P256_CONTRACT,
      abi: abiP256,
      functionName: "verifyP256SignatureAllowMalleability",
      args: [
        p256Data.hashHex,
        p256Data.rHex,
        p256Data.sHex,
        p256Data.xHex,
        p256Data.yHex,
      ],
    });
    console.log("ℹ️  lenient (high-S ok):", isValidLenient);

    /* 4️⃣  Return strict result ----------------------------------- */
    return isValidStrict as boolean;
  } catch (err) {
    console.error("💥 Verification failed:", err);
    return false;
  }
};