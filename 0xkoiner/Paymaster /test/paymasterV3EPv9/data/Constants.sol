// SPDX-License-Identifier: MIT

pragma solidity 0.8.29;

import {IEntryPoint} from "@account-abstraction-v8/interfaces/IEntryPoint.sol";

abstract contract Constants {
    IEntryPoint ENTRY_POINT_V9 = IEntryPoint(0x43370900c8de573dB349BEd8DD53b4Ebd3Cce709);

    uint256 constant signersLength = 3;

    string SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/EIOmdDtOw7ulufI5S27isOfZfW51PQXB";
}
