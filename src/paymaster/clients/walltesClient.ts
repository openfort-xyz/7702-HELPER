import { baseSepolia } from 'viem/chains';
import { Account, createWalletClient, hashMessage, Hex, http, recoverAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import 'dotenv/config';

const { 
    OWNER, 
    MANAGER, 
    SIGNER_1, 
    SIGNER_2, 
    SIGNER_3,
    ACCOUNT_7702 
} = process.env as Record<
    string,
    Hex
>


const owner = privateKeyToAccount(OWNER);
const manager = privateKeyToAccount(MANAGER);
const signer_1 = privateKeyToAccount(SIGNER_1);
const signer_2 = privateKeyToAccount(SIGNER_2);
const signer_3 = privateKeyToAccount(SIGNER_3);
const account7702 = privateKeyToAccount(ACCOUNT_7702);

class WalletsClient {
    readonly walletClientOwner = createWalletClient({
        account: owner,
        chain: baseSepolia,
        transport: http()
    });
    readonly walletClientManager = createWalletClient({
        account: manager,
        chain: baseSepolia,
        transport: http()
    });
    readonly walletClientSigner_1 = createWalletClient({
        account: signer_1,
        chain: baseSepolia,
        transport: http()
    });
    readonly walletClientSigner_2 = createWalletClient({
        account: signer_2,
        chain: baseSepolia,
        transport: http()
    });
    readonly walletClientSigner_3 = createWalletClient({
        account: signer_3,
        chain: baseSepolia,
        transport: http()
    });
    readonly walletClientAccount7702 = createWalletClient({
        account: account7702,
        chain: baseSepolia,
        transport: http()
    });

    async signMessageWithEOA(message: Hex): Promise<Hex> {
        try {
            const signature = await signer_1.signMessage({ message });
            const messageHash = hashMessage(message); 
            const recovered = await recoverAddress({
                hash: messageHash,
                signature: signature,
              });

            if (recovered != signer_1.address) {
                console.error('❌ Recovered not Match with Signer:', recovered, signer_1.address)
            }
            console.log("message", message);
            console.log("signer_1.address", signer_1.address);
            console.log("recovered", recovered);
            return signature
        } catch (error) {
            console.error('❌ Error signing message with EOA:', error)
            throw error
        }
    }
}

export const walletsClient = new WalletsClient();