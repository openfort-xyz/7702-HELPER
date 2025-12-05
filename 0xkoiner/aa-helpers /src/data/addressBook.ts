import { type Address } from "viem";
import { entryPoint08Address } from "viem/account-abstraction";

export const ADDRESSES = {
  ENTRY_POINT: entryPoint08Address,
  SENDER: process.env.SENDER_ADDRESS as Address,
  TARGET: process.env.TARGET_ADDRESS as Address,
} as const;
