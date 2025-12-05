import { sepolia } from "viem/chains";
import { getCode7702 } from "./getCode7702";
import { p256Data } from "./P256";
import { isValidP256, P256Data } from "./soladyP256Veridfier"
import { webCryptoP256Data } from "./P256NonExtractable";
import { generateRandomSignature } from "./PERP"
import { createAuthorization } from "./PREPAttache"

const testAddress = "0x6386b339C3DEc11635C5829025eFE8964DE03b05" as const;

async function main() {
  // const is7702 = await getCode7702(testAddress, sepolia);
  // console.log("Result:", is7702);

  // const p256 = await p256Data;
  // const isValidAll = await isValidP256(p256);

  // const webCrypto = await webCryptoP256Data;
  const messageHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as const;
  const PREP = await generateRandomSignature(messageHash);

  // Create EIP-7702 authorization
  const smartAccountAddress = "0x1234567890123456789012345678901234567890" as const;
  const authorization = createAuthorization(PREP.signature, PREP.recoveredAddress);

  console.log("Authorization:", authorization);
}

main();
