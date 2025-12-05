// SPDX-License-Identifier: MIT

pragma solidity 0.8.29;

import {PaymasterData} from "./PaymasterData.t.sol";
import {MockERC20} from "test/foundry/paymasterV3EPv9/mocks/MockERC20.sol";
import {Simple7702Account} from "test/foundry/paymasterV3EPv9/mocks/Simple7702Account.sol";
import {OPFPaymasterV3 as Paymaster} from "contracts/paymaster/PaymasterV3/OPFPaymasterV3.sol";


contract Data is PaymasterData {
    Paymaster PM;
    MockERC20 mockERC20;
    Simple7702Account account;
    Simple7702Account implementation;

    uint256 forkId;

    uint256 owner7702PK;
    address owner7702;

    function _setData() internal {
        (owner7702, owner7702PK) = makeAddrAndKey("owner7702");
    }
}