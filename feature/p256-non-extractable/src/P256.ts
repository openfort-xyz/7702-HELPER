// src/p256Data.ts
import { p256 } from "@noble/curves/p256";
import { randomBytes } from "crypto";
import type { Hex } from "viem";
import { fromHex } from 'viem';

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
 * Generates a fresh P-256 key pair, signs a random 32-byte challenge,
 * verifies the signature, and returns everything you might want to send
 * on-chain (public-key coordinates, signature r & s, and the challenge).
 *
 * Returned object shape:
 * {
 *   hashHex:          Hex;       // 32-byte challenge
 *   rHex:             Hex;       // signature.r   (32-byte padded)
 *   sHex:             Hex;       // signature.s   (32-byte padded)
 *   xHex:             Hex;       // public-key X  (32-byte)
 *   yHex:             Hex;       // public-key Y  (32-byte)
 *   challenge:        Hex;       // alias of hashHex
 *   webauthnData:     Signature; // noble-curves Signature object
 *   isValidSignature: boolean;   // verification result
 * }
 * ------------------------------------------------------------------ */
export const p256Data = (async () => {
  /* 1️⃣  PRIVATE KEY ------------------------------------------------- */
  //   32-byte cryptographically-secure random scalar
  const privKey = p256.utils.randomPrivateKey();

  /* 2️⃣  PUBLIC KEY -------------------------------------------------- */
  //   Uncompressed EC-point format: 0x04 | X | Y (65 bytes total)
  const pubKey = p256.getPublicKey(privKey, /* compressed? */ false);

  //   Slice out the coordinates (omit byte 0 -- the 0x04 header)
  const xHex = toHex(pubKey.slice(1, 33));
  const yHex = toHex(pubKey.slice(33));

  /* 3️⃣  CHALLENGE --------------------------------------------------- */
  //   Generate a 32-byte random message
  // const challengeBytes = randomBytes(32);
  const challengeBytesHex = '0xc0193c8eb3d7a398290aa9f75eab5f0e682d71d6c2f0f96e16a67ed4c28f7a48';
  const challengeBytes = fromHex(challengeBytesHex, 'bytes');
  const hashHex = toHex(challengeBytes);

  /* 4️⃣  SIGN -------------------------------------------------------- */
  const signature = p256.sign(challengeBytes, privKey);
  const rHex = bigintToHex(signature.r);
  const sHex = bigintToHex(signature.s);

  /* 5️⃣  VERIFY (sanity-check) -------------------------------------- */
  const isValidSignature = p256.verify(signature, challengeBytes, pubKey);
  console.log("✅ signature verified:", isValidSignature);

  /* 6️⃣  RETURN + LOG ----------------------------------------------- */
  const result = {
    hashHex,
    rHex,
    sHex,
    xHex,
    yHex,
    challenge: hashHex, // alias to emphasise “challenge” terminology
    webauthnData: signature,
    isValidSignature,
  };

  console.log("📦 on-chain payload:", result);
  return result;
})();   // <- IIFE immediately executes and its Promise is exported