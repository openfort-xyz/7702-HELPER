// SPDX-License-Identifier: MIT

pragma solidity 0.8.29;

import {MockERC20} from "test/foundry/paymasterV3EPv9/mocks/MockERC20.sol";
import {PaymasterHelper} from "test/foundry/paymasterV3EPv9/helpers/PaymasterHelper.t.sol";
import {Simple7702Account} from "test/foundry/paymasterV3EPv9/mocks/Simple7702Account.sol";
import {OPFPaymasterV3 as Paymaster} from "contracts/paymaster/PaymasterV3/OPFPaymasterV3.sol";

contract Deploy is PaymasterHelper {
    function setUp() public virtual {
        forkId = vm.createFork(SEPOLIA_RPC_URL);
        vm.selectFork(forkId);

        _setPaymasterData();
        _setData();

        mockERC20 = new MockERC20();
        account = new Simple7702Account();
        implementation = account;
        PM = new Paymaster(owner, manager, signers);

        _etch();
        _deal();
        _depositToEP();
    }

    function test_AfterConstructor() public {
        address getOwner = PM.OWNER();
        address getManager = PM.MANAGER();
        address[] memory getSigners = PM.getSigners();

        assertEq(getOwner, owner);
        assertEq(getManager, manager);

        for (uint256 i = 0; i < getSigners.length;) {
            assertEq(getSigners[i], signers[i]);
            unchecked {
                i++;
            }
        }
    }

    function _deal() internal {
        deal(owner, 10 ether);
        deal(owner7702, 10 ether);
    }
}