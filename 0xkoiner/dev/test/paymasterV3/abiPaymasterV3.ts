const abiPaymasterV3 = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_manager",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_signers",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "DEFAULT_ADMIN_ROLE",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "ENTRY_POINT_V8",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IEntryPoint"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MANAGER",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MANAGER_ROLE",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "OWNER",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "_expectedPenaltyGasCost",
        "inputs": [
            {
                "name": "_actualGasCost",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_actualUserOpFeePerGas",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "postOpGas",
                "type": "uint128",
                "internalType": "uint128"
            },
            {
                "name": "preOpGasApproximation",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "executionGasLimit",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "addSigner",
        "inputs": [
            {
                "name": "_signer",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "addStake",
        "inputs": [
            {
                "name": "unstakeDelaySec",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "deposit",
        "inputs": [

        ],
        "outputs": [

        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "getCostInToken",
        "inputs": [
            {
                "name": "_actualGasCost",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_postOpGas",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_actualUserOpFeePerGas",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_exchangeRate",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "getDeposit",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getHash",
        "inputs": [
            {
                "name": "_mode",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "_userOp",
                "type": "tuple",
                "internalType": "struct PackedUserOperation",
                "components": [
                    {
                        "name": "sender",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nonce",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "initCode",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "accountGasLimits",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "preVerificationGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "gasFees",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "paymasterAndData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getRoleAdmin",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getSigners",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "grantRole",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "hasRole",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "postOp",
        "inputs": [
            {
                "name": "mode",
                "type": "uint8",
                "internalType": "enum IPaymasterV8.PostOpMode"
            },
            {
                "name": "context",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "actualGasCost",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "actualUserOpFeePerGas",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "removeSigner",
        "inputs": [
            {
                "name": "_signer",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "renounceRole",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "callerConfirmation",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "revokeRole",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "signerAt",
        "inputs": [
            {
                "name": "index",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "signerCount",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "signers",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "isValidSigner",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "supportsInterface",
        "inputs": [
            {
                "name": "interfaceId",
                "type": "bytes4",
                "internalType": "bytes4"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "unlockStake",
        "inputs": [

        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "validatePaymasterUserOp",
        "inputs": [
            {
                "name": "userOp",
                "type": "tuple",
                "internalType": "struct PackedUserOperation",
                "components": [
                    {
                        "name": "sender",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nonce",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "initCode",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "accountGasLimits",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "preVerificationGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "gasFees",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "paymasterAndData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "userOpHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "requiredPreFund",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "context",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "validationData",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawStake",
        "inputs": [
            {
                "name": "withdrawAddress",
                "type": "address",
                "internalType": "address payable"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawTo",
        "inputs": [
            {
                "name": "withdrawAddress",
                "type": "address",
                "internalType": "address payable"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "RoleAdminChanged",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "previousAdminRole",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "newAdminRole",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RoleGranted",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RoleRevoked",
        "inputs": [
            {
                "name": "role",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SignerAdded",
        "inputs": [
            {
                "name": "signer",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SignerRemoved",
        "inputs": [
            {
                "name": "signer",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "UserOperationSponsored",
        "inputs": [
            {
                "name": "userOpHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "paymasterMode",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "tokenAmountPaid",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "exchangeRate",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "AccessControlBadConfirmation",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "AccessControlUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "neededRole",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ]
    },
    {
        "type": "error",
        "name": "AccessControlUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "neededRole",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ]
    },
    {
        "type": "error",
        "name": "BasePaymaster__SenderNotEntryPointV8",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignature",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureLength",
        "inputs": [
            {
                "name": "length",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureS",
        "inputs": [
            {
                "name": "s",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ]
    },
    {
        "type": "error",
        "name": "MultiSigner__SignerAlreadyExist",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "MultiSigner__SignerNotExist",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__ExchangeRateInvalid",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__PaymasterAndDataLengthInvalid",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__PaymasterConfigLengthInvalid",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__PaymasterModeInvalid",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__PaymasterSignatureLengthInvalid",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__PreFundTooHigh",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__RecipientInvalid",
        "inputs": [

        ]
    },
    {
        "type": "error",
        "name": "OPFPaymasterV3__TokenAddressInvalid",
        "inputs": [

        ]
    }
] as const;