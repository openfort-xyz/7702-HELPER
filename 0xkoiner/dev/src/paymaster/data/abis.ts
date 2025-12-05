export const ABI_PAYMASTER =
   [
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "_owner",
               "type": "address"
            },
            {
               "internalType": "address",
               "name": "_manager",
               "type": "address"
            },
            {
               "internalType": "address[]",
               "name": "_signers",
               "type": "address[]"
            }
         ],
         "stateMutability": "nonpayable",
         "type": "constructor"
      },
      {
         "inputs": [

         ],
         "name": "AccessControlBadConfirmation",
         "type": "error"
      },
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "account",
               "type": "address"
            },
            {
               "internalType": "bytes32",
               "name": "neededRole",
               "type": "bytes32"
            }
         ],
         "name": "AccessControlUnauthorizedAccount",
         "type": "error"
      },
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "account",
               "type": "address"
            },
            {
               "internalType": "bytes32",
               "name": "neededRole",
               "type": "bytes32"
            }
         ],
         "name": "AccessControlUnauthorizedAccount",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "BasePaymaster__SenderNotEntryPointV8",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "ECDSAInvalidSignature",
         "type": "error"
      },
      {
         "inputs": [
            {
               "internalType": "uint256",
               "name": "length",
               "type": "uint256"
            }
         ],
         "name": "ECDSAInvalidSignatureLength",
         "type": "error"
      },
      {
         "inputs": [
            {
               "internalType": "bytes32",
               "name": "s",
               "type": "bytes32"
            }
         ],
         "name": "ECDSAInvalidSignatureS",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "MultiSigner__SignerAlreadyExist",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "MultiSigner__SignerNotExist",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__ExchangeRateInvalid",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__PaymasterAndDataLengthInvalid",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__PaymasterConfigLengthInvalid",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__PaymasterModeInvalid",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__PaymasterSignatureLengthInvalid",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__PreFundTooHigh",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__RecipientInvalid",
         "type": "error"
      },
      {
         "inputs": [

         ],
         "name": "OPFPaymasterV3__TokenAddressInvalid",
         "type": "error"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": true,
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            },
            {
               "indexed": true,
               "internalType": "bytes32",
               "name": "previousAdminRole",
               "type": "bytes32"
            },
            {
               "indexed": true,
               "internalType": "bytes32",
               "name": "newAdminRole",
               "type": "bytes32"
            }
         ],
         "name": "RoleAdminChanged",
         "type": "event"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": true,
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            },
            {
               "indexed": true,
               "internalType": "address",
               "name": "account",
               "type": "address"
            },
            {
               "indexed": true,
               "internalType": "address",
               "name": "sender",
               "type": "address"
            }
         ],
         "name": "RoleGranted",
         "type": "event"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": true,
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            },
            {
               "indexed": true,
               "internalType": "address",
               "name": "account",
               "type": "address"
            },
            {
               "indexed": true,
               "internalType": "address",
               "name": "sender",
               "type": "address"
            }
         ],
         "name": "RoleRevoked",
         "type": "event"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": false,
               "internalType": "address",
               "name": "signer",
               "type": "address"
            }
         ],
         "name": "SignerAdded",
         "type": "event"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": false,
               "internalType": "address",
               "name": "signer",
               "type": "address"
            }
         ],
         "name": "SignerRemoved",
         "type": "event"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": true,
               "internalType": "bytes32",
               "name": "userOpHash",
               "type": "bytes32"
            },
            {
               "indexed": true,
               "internalType": "address",
               "name": "user",
               "type": "address"
            },
            {
               "indexed": false,
               "internalType": "uint8",
               "name": "paymasterMode",
               "type": "uint8"
            },
            {
               "indexed": false,
               "internalType": "address",
               "name": "token",
               "type": "address"
            },
            {
               "indexed": false,
               "internalType": "uint256",
               "name": "tokenAmountPaid",
               "type": "uint256"
            },
            {
               "indexed": false,
               "internalType": "uint256",
               "name": "exchangeRate",
               "type": "uint256"
            }
         ],
         "name": "UserOperationSponsored",
         "type": "event"
      },
      {
         "inputs": [

         ],
         "name": "DEFAULT_ADMIN_ROLE",
         "outputs": [
            {
               "internalType": "bytes32",
               "name": "",
               "type": "bytes32"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "ENTRY_POINT_V8",
         "outputs": [
            {
               "internalType": "contract IEntryPoint",
               "name": "",
               "type": "address"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "MANAGER",
         "outputs": [
            {
               "internalType": "address",
               "name": "",
               "type": "address"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "MANAGER_ROLE",
         "outputs": [
            {
               "internalType": "bytes32",
               "name": "",
               "type": "bytes32"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "OWNER",
         "outputs": [
            {
               "internalType": "address",
               "name": "",
               "type": "address"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint256",
               "name": "_actualGasCost",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "_actualUserOpFeePerGas",
               "type": "uint256"
            },
            {
               "internalType": "uint128",
               "name": "postOpGas",
               "type": "uint128"
            },
            {
               "internalType": "uint256",
               "name": "preOpGasApproximation",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "executionGasLimit",
               "type": "uint256"
            }
         ],
         "name": "_expectedPenaltyGasCost",
         "outputs": [
            {
               "internalType": "uint256",
               "name": "",
               "type": "uint256"
            }
         ],
         "stateMutability": "pure",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "_signer",
               "type": "address"
            }
         ],
         "name": "addSigner",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint32",
               "name": "unstakeDelaySec",
               "type": "uint32"
            }
         ],
         "name": "addStake",
         "outputs": [

         ],
         "stateMutability": "payable",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "deposit",
         "outputs": [

         ],
         "stateMutability": "payable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint256",
               "name": "_actualGasCost",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "_postOpGas",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "_actualUserOpFeePerGas",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "_exchangeRate",
               "type": "uint256"
            }
         ],
         "name": "getCostInToken",
         "outputs": [
            {
               "internalType": "uint256",
               "name": "",
               "type": "uint256"
            }
         ],
         "stateMutability": "pure",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "getDeposit",
         "outputs": [
            {
               "internalType": "uint256",
               "name": "",
               "type": "uint256"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint8",
               "name": "_mode",
               "type": "uint8"
            },
            {
               "components": [
                  {
                     "internalType": "address",
                     "name": "sender",
                     "type": "address"
                  },
                  {
                     "internalType": "uint256",
                     "name": "nonce",
                     "type": "uint256"
                  },
                  {
                     "internalType": "bytes",
                     "name": "initCode",
                     "type": "bytes"
                  },
                  {
                     "internalType": "bytes",
                     "name": "callData",
                     "type": "bytes"
                  },
                  {
                     "internalType": "bytes32",
                     "name": "accountGasLimits",
                     "type": "bytes32"
                  },
                  {
                     "internalType": "uint256",
                     "name": "preVerificationGas",
                     "type": "uint256"
                  },
                  {
                     "internalType": "bytes32",
                     "name": "gasFees",
                     "type": "bytes32"
                  },
                  {
                     "internalType": "bytes",
                     "name": "paymasterAndData",
                     "type": "bytes"
                  },
                  {
                     "internalType": "bytes",
                     "name": "signature",
                     "type": "bytes"
                  }
               ],
               "internalType": "struct PackedUserOperation",
               "name": "_userOp",
               "type": "tuple"
            }
         ],
         "name": "getHash",
         "outputs": [
            {
               "internalType": "bytes32",
               "name": "",
               "type": "bytes32"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            }
         ],
         "name": "getRoleAdmin",
         "outputs": [
            {
               "internalType": "bytes32",
               "name": "",
               "type": "bytes32"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "getSigners",
         "outputs": [
            {
               "internalType": "address[]",
               "name": "",
               "type": "address[]"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            },
            {
               "internalType": "address",
               "name": "account",
               "type": "address"
            }
         ],
         "name": "grantRole",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            },
            {
               "internalType": "address",
               "name": "account",
               "type": "address"
            }
         ],
         "name": "hasRole",
         "outputs": [
            {
               "internalType": "bool",
               "name": "",
               "type": "bool"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "enum IPaymasterV8.PostOpMode",
               "name": "mode",
               "type": "uint8"
            },
            {
               "internalType": "bytes",
               "name": "context",
               "type": "bytes"
            },
            {
               "internalType": "uint256",
               "name": "actualGasCost",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "actualUserOpFeePerGas",
               "type": "uint256"
            }
         ],
         "name": "postOp",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "_signer",
               "type": "address"
            }
         ],
         "name": "removeSigner",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            },
            {
               "internalType": "address",
               "name": "callerConfirmation",
               "type": "address"
            }
         ],
         "name": "renounceRole",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "bytes32",
               "name": "role",
               "type": "bytes32"
            },
            {
               "internalType": "address",
               "name": "account",
               "type": "address"
            }
         ],
         "name": "revokeRole",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint256",
               "name": "index",
               "type": "uint256"
            }
         ],
         "name": "signerAt",
         "outputs": [
            {
               "internalType": "address",
               "name": "",
               "type": "address"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "signerCount",
         "outputs": [
            {
               "internalType": "uint256",
               "name": "",
               "type": "uint256"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "account",
               "type": "address"
            }
         ],
         "name": "signers",
         "outputs": [
            {
               "internalType": "bool",
               "name": "isValidSigner",
               "type": "bool"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "bytes4",
               "name": "interfaceId",
               "type": "bytes4"
            }
         ],
         "name": "supportsInterface",
         "outputs": [
            {
               "internalType": "bool",
               "name": "",
               "type": "bool"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [

         ],
         "name": "unlockStake",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "components": [
                  {
                     "internalType": "address",
                     "name": "sender",
                     "type": "address"
                  },
                  {
                     "internalType": "uint256",
                     "name": "nonce",
                     "type": "uint256"
                  },
                  {
                     "internalType": "bytes",
                     "name": "initCode",
                     "type": "bytes"
                  },
                  {
                     "internalType": "bytes",
                     "name": "callData",
                     "type": "bytes"
                  },
                  {
                     "internalType": "bytes32",
                     "name": "accountGasLimits",
                     "type": "bytes32"
                  },
                  {
                     "internalType": "uint256",
                     "name": "preVerificationGas",
                     "type": "uint256"
                  },
                  {
                     "internalType": "bytes32",
                     "name": "gasFees",
                     "type": "bytes32"
                  },
                  {
                     "internalType": "bytes",
                     "name": "paymasterAndData",
                     "type": "bytes"
                  },
                  {
                     "internalType": "bytes",
                     "name": "signature",
                     "type": "bytes"
                  }
               ],
               "internalType": "struct PackedUserOperation",
               "name": "userOp",
               "type": "tuple"
            },
            {
               "internalType": "bytes32",
               "name": "userOpHash",
               "type": "bytes32"
            },
            {
               "internalType": "uint256",
               "name": "requiredPreFund",
               "type": "uint256"
            }
         ],
         "name": "validatePaymasterUserOp",
         "outputs": [
            {
               "internalType": "bytes",
               "name": "context",
               "type": "bytes"
            },
            {
               "internalType": "uint256",
               "name": "validationData",
               "type": "uint256"
            }
         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "address payable",
               "name": "withdrawAddress",
               "type": "address"
            }
         ],
         "name": "withdrawStake",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "address payable",
               "name": "withdrawAddress",
               "type": "address"
            },
            {
               "internalType": "uint256",
               "name": "amount",
               "type": "uint256"
            }
         ],
         "name": "withdrawTo",
         "outputs": [

         ],
         "stateMutability": "nonpayable",
         "type": "function"
      }
   ] as const;

export const executeBatch08Abi = [
   {
      type: "function",
      name: "executeBatch",
      inputs: [
         {
            name: "calls",
            type: "tuple[]",
            internalType: "struct BaseAccount.Call[]",
            components: [
               {
                  name: "target",
                  type: "address",
                  internalType: "address"
               },
               {
                  name: "value",
                  type: "uint256",
                  internalType: "uint256"
               },
               {
                  name: "data",
                  type: "bytes",
                  internalType: "bytes"
               }
            ]
         }
      ],
      outputs: [],
      stateMutability: "nonpayable"
   }
] as const