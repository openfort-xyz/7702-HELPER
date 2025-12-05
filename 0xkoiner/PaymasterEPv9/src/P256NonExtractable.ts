// src/webCryptoP256Data.ts
import { randomBytes } from "node:crypto";
import { WebCryptoP256 } from "ox";
import { fromHex } from 'viem';
import type { Hex } from "viem";

/* ────────────────────────────────────────────────────────── helpers ── */

/**
 * Convert a byte array to `0x`-prefixed hexadecimal.
 *
 * @param bytes Uint8Array to convert
 * @returns Hex string (e.g. 0xdeadbeef…)
 */
const toHex = (bytes: Uint8Array): Hex =>
  `0x${Buffer.from(bytes).toString("hex")}` as Hex;

/**
 * Convert a bigint to 32-byte, zero-padded, `0x`-prefixed hexadecimal.
 *
 * @param n bigint to convert
 * @returns 64-char Hex string (e.g. 0x00…1a)
 */
const toHex32 = (n: bigint): Hex =>
  `0x${n.toString(16).padStart(64, "0")}` as Hex;

/** Alias kept so the API still matches the original reference code. */
const bigintToHex = (n: bigint): Hex => toHex32(n);

/* ──────────────────────────────────────────────────────────── main ── */

/** --------------------------------------------------------------------
 * Generates a fresh P-256 key pair using WebCrypto, signs a random 32-byte
 * challenge, verifies the signature, and returns everything you might want
 * to send on-chain (public-key coordinates, signature r & s, and the challenge).
 *
 * Returned object shape:
 * {
 *   hashHex:          Hex;                    // 32-byte challenge
 *   rHex:             Hex;                    // signature.r   (32-byte padded)
 *   sHex:             Hex;                    // signature.s   (32-byte padded)
 *   xHex:             Hex;                    // public-key X  (32-byte)
 *   yHex:             Hex;                    // public-key Y  (32-byte)
 *   challenge:        Hex;                    // alias of hashHex
 *   webauthnData:     { r: bigint; s: bigint }; // WebCrypto signature object
 *   isValidSignature: boolean;               // verification result
 * }
 * ------------------------------------------------------------------ */
export const webCryptoP256Data = (async () => {
  /* 1️⃣  KEY PAIR --------------------------------------------------- */
  const keyPair = await WebCryptoP256.createKeyPair();
  console.log("Key pair generated:", keyPair);

  const publicKey = keyPair.publicKey;
  console.log("Public key:", publicKey);

  const privateKey = keyPair.privateKey;
  console.log("Private key:", privateKey);

  /* 2️⃣  CHALLENGE --------------------------------------------------- */
  // Generate random bytes and convert directly to hex
  // const challengeBytes = randomBytes(32);
  const challengeBytesHex = '0x0377a30fcfc4671b5b2a831cb98420acddf2900115c4a26d1d8b6eb755ed4ec9';
  const challengeBytes = fromHex(challengeBytesHex, 'bytes');
  const userOpHash = toHex(challengeBytes);

  /* 3️⃣  SIGN -------------------------------------------------------- */
  const { r, s } = await WebCryptoP256.sign({
    privateKey: privateKey,
    payload: userOpHash,
  });

  console.log("Signature components - r:", r, "s:", s);

  const rHex = bigintToHex(r);
  const sHex = bigintToHex(s);

  console.log("r as hex:", rHex);
  console.log("s as hex:", sHex);

  /* 4️⃣  VERIFY (sanity-check) -------------------------------------- */
  const isValid = await WebCryptoP256.verify({
    publicKey: publicKey,
    payload: userOpHash,
    signature: { r, s }
  });

  console.log("Signature verification result:", isValid);

  if (isValid) {
    console.log("✅ Signature is VALID!");
  } else {
    console.log("❌ Signature is INVALID!");
  }

  /* 6️⃣  RETURN + LOG ----------------------------------------------- */
  const result = {
    hashHex: userOpHash,
    rHex,
    sHex,
    xHex: toHex32(keyPair.publicKey.x),
    yHex: toHex32(keyPair.publicKey.y),
    challenge: userOpHash, // alias to emphasise "challenge" terminology
    webauthnData: { r, s },
    isValidSignature: isValid,
  };

  console.log("📦 on-chain payload:", result);
  return result;
})();   // <- IIFE immediately executes and its Promise is exported
