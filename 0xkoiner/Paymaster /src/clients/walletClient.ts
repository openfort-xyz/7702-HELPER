import { type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is required in .env");
}

export const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);
