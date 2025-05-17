import { sepolia } from "viem/chains";
import { getCode7702 } from "./getCode7702";
import { p256Data } from "./P256";
import { isValidP256, P256Data } from "./soladyP256Veridfier"

const testAddress = "0x6386b339C3DEc11635C5829025eFE8964DE03b05" as const;

async function main() {
  const is7702 = await getCode7702(testAddress, sepolia);
  console.log("Result:", is7702);

  const p256 = await p256Data;
  const isValidAll = await isValidP256(p256);
}

main();