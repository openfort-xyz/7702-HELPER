import { exit } from 'node:process';
import { baseSepolia } from 'viem/chains';
import { PAYMASTER_V3 } from './data/addressBook';
import { helpers, gasFees } from "./helpers/Helpers";
import { publicClient } from "./clients/publicClient";
import { getNonce } from './actions/entryPointActions';
import { walletsClient } from './clients/walltesClient';
import { UserOperation } from 'viem/account-abstraction';
import { sponsorUserOperation } from 'permissionless/actions/pimlico';
import { getHash, createPaymasterData } from './actions/paymasterActions';
import { getSimpleAccount, createSmartAccount, pimlicoClient } from "./clients/pimlicoClient";
import { getDummyPaymasterData, type UserOperationWithEip7702Auth, estimateUserOperationGas, getPaymasterData, sendUserOperation, waitForUserOperationReceipt } from './actions/pimlicoActions';
import { Hex } from 'viem';
import { hashMessage, keccak256, toBytes } from 'viem';

async function main() {
    const gasFees: gasFees = await helpers.getGasParams(publicClient);
    console.log(gasFees.maxFeePerGas);
    console.log(gasFees.maxPriorityFeePerGas);

    const authorization = await helpers.getAuthorization(walletsClient.walletClientAccount7702, walletsClient.walletClientAccount7702.account);
    console.log(authorization);

    let userOp: UserOperationWithEip7702Auth = await helpers.getFreshUserOp(authorization);
    userOp.sender = walletsClient.walletClientAccount7702.account.address;
    userOp.nonce = await getNonce(publicClient, userOp.sender, 0n);
    userOp.callData = await helpers.getCallData();
    userOp.maxFeePerGas = gasFees.maxFeePerGas;
    userOp.maxPriorityFeePerGas = gasFees.maxPriorityFeePerGas;
    console.log(userOp);

    const pmDummy = await getDummyPaymasterData(userOp, authorization);
    console.log(pmDummy);

    const sponsorFields = await getPaymasterData(pimlicoClient, userOp, publicClient.chain?.id ?? baseSepolia.id);
    console.log(sponsorFields);
    
    userOp.paymaster = PAYMASTER_V3;
    userOp.paymasterData = pmDummy.paymasterData;

    const simpleSmartAccout = await getSimpleAccount();
    const smartAccountClient = await createSmartAccount(simpleSmartAccout);
    const gasEstimates = await estimateUserOperationGas(smartAccountClient, userOp);
    console.log(gasEstimates);

    userOp.preVerificationGas = gasEstimates.preVerificationGas;
    userOp.verificationGasLimit = gasEstimates.verificationGasLimit;
    userOp.callGasLimit = gasEstimates.callGasLimit;
    userOp.paymasterVerificationGasLimit = gasEstimates.paymasterVerificationGasLimit;
    userOp.paymasterPostOpGasLimit = gasEstimates.paymasterPostOpGasLimit;
    console.log(userOp)
    
    const pmHash = await getHash(publicClient, helpers.VERIFYING_MODE, userOp);
    console.log(pmHash)

    const pmSignature = await walletsClient.signMessageWithEOA(pmHash);
    console.log("pmSignature", pmSignature);
    

    
    // userOp.paymasterData = sponsorFields.paymasterData;
    // userOp.paymaster = sponsorFields.paymaster;
    
    console.log("Current PM Data: ", sponsorFields.paymasterData)
    const paymasterDataPrefix = sponsorFields.paymasterData!.slice(0, 28); 
    userOp.paymasterData = `${paymasterDataPrefix}${pmSignature.slice(2)}` as Hex;
    console.log("Post Changes PM Data: ", userOp.paymasterData);
    

    const userOpSig = await simpleSmartAccout.signUserOperation(userOp);
    userOp.signature = userOpSig;

    const userOperationHash = await sendUserOperation(smartAccountClient, userOp, authorization);

    const { receipt } = await waitForUserOperationReceipt(smartAccountClient, userOperationHash);
    console.log("User operation receipt:", receipt);
}

main().catch((e) => {
    console.error(e);
    exit(1);
});

// Current PM Data:        0x01 000068c19d92 000000000000 3b2a16f027b6fb0a6a60dfde828680b78468869d50036807e9d3d5c01247af7470fe484f78479134a945c5b02ffb1618f751f4785885857a671edbcc8d92db671b
// Post Changes PM Data:   0x01 000000000000 000000000000 9ff2f05d5ee66202611e4b2623ff0ce7da5a4ea3df012426acafb7781166ae83601cae1d2dbcff5ea51db5dbbf5fc8be891fce20c12b9720d2012dd311a2e1131c