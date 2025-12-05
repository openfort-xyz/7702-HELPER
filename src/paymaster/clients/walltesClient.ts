import { baseSepolia } from 'viem/chains';
import { Account, createWalletClient, hashMessage, Hex, http, recoverAddress, keccak256, toBytes, serializeSignature } from 'viem'
import { privateKeyToAccount, sign } from 'viem/accounts'
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

    async signMessageWithEOA(rawHash: Hex): Promise<Hex> {
        try {
            // The paymaster wraps the hash with EIP-191, so we need to sign it the same way
            // First, wrap the raw hash with EIP-191 message prefix
            const wrappedHash = hashMessage({ raw: rawHash });

            // Sign the wrapped hash directly (without another EIP-191 wrap)
            const signatureObj = await sign({
                hash: wrappedHash,
                privateKey: SIGNER_1
            });

            // Serialize the signature object to hex string
            const signature = serializeSignature(signatureObj);

            // Verify the signature
            const recovered = await recoverAddress({
                hash: wrappedHash,
                signature: signature,
            });

            if (recovered !== signer_1.address) {
                console.error('❌ Recovered not Match with Signer:', recovered, signer_1.address)
                throw new Error(`Signature verification failed: expected ${signer_1.address}, got ${recovered}`)
            }

            console.log("rawHash", rawHash);
            console.log("wrappedHash", wrappedHash);
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
