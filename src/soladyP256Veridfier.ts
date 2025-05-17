// soladyP256Veridfier.ts
import { sepolia } from "viem/chains";
import { abiP256 } from "./utils/abis";
import { createPublicClient, Hex, http } from "viem";

const P256_CONTRACT = '0xc3F5De14f8925cAB747a531B53FE2094C2C5f597'
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Update the type to match the actual property names in p256Data
export type P256Data = {
  hashHex: Hex;    // Changed from 'hash'
  rHex: Hex;       // Changed from 'r'
  sHex: Hex;       // Changed from 's'
  xHex: Hex;       // Changed from 'x'
  yHex: Hex;       // Changed from 'y'
  challenge: Hex;
  webauthnData: any;
  isValidSignature: boolean;
};

// Update the function to use the correct property names
export const isValidP256 = async (p256Data: P256Data): Promise<boolean> => {
  try {
    const isValid = await publicClient.readContract({
      address: P256_CONTRACT as Hex,
      abi: abiP256,
      functionName: 'verifyP256Signature',
      args: [p256Data.hashHex, p256Data.rHex, p256Data.sHex, p256Data.xHex, p256Data.yHex],
    });
    
    console.log("Solady P256 isValid:", isValid)
    return isValid as boolean;
  } catch (error) {
    console.error("Error verifying P256 signature:", error);
    return false;
  }
};