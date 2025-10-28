import { Address, PublicClient} from "viem";
import { entryPoint08Abi, entryPoint08Address } from "viem/account-abstraction";

export async function getNonce(publicClient: PublicClient, sender: Address, key: bigint): Promise<bigint> {
    return await publicClient.readContract({
        address: entryPoint08Address,
        abi: entryPoint08Abi,
        functionName: 'getNonce',
        args: [sender, key]
    });
}