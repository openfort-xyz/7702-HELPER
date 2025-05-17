// soladyP256Veridfier.ts
import { sepolia } from "viem/chains";
import { abiP256 } from "./utils/abis";
import { createPublicClient, Hex, http } from "viem";

const P256_CONTRACT = '0xCbF90Ad1286eF8A2Bdcd62C3C6b3Afae3FD03008'
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
    const isValid_A = await publicClient.readContract({
      address: P256_CONTRACT as Hex,
      abi: abiP256,
      functionName: 'verifyP256Signature',
      args: [p256Data.hashHex, p256Data.rHex, p256Data.sHex, p256Data.xHex, p256Data.yHex],
    });
    
    console.log("Solady P256 isValid `verifyP256Signature`:", isValid_A)

    const isValid_B = await publicClient.readContract({
      address: P256_CONTRACT as Hex,
      abi: abiP256,
      functionName: 'verifyP256SignatureAllowMalleability',
      args: [p256Data.hashHex, p256Data.rHex, p256Data.sHex, p256Data.xHex, p256Data.yHex],
    });
    
    console.log("Solady P256 isValid `verifyP256SignatureAllowMalleability`:", isValid_B)

    return (isValid_A as boolean, isValid_B as boolean);
  } catch (error) {
    console.error("Error verifying P256 signature:", error);
    return false;
  }
};