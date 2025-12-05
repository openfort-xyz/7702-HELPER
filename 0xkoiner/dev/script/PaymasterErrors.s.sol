// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import {Script, console2 as console} from "lib/forge-std/src/Script.sol";

contract PaymasterErrors is Script {
    bytes4 constant S = 0xca8a01e9;

    error BasePaymaster__SenderNotEntryPointV8();
    error OPFPaymasterV3__PaymasterAndDataLengthInvalid();

    /// @notice The paymaster data mode is invalid. The mode should be 0 or 1.
    error OPFPaymasterV3__PaymasterModeInvalid();

    /// @notice The paymaster data length is invalid for the selected mode.
    error OPFPaymasterV3__PaymasterConfigLengthInvalid();

    /// @notice The paymaster signature length is invalid.
    error OPFPaymasterV3__PaymasterSignatureLengthInvalid();

    /// @notice The token is invalid.
    error OPFPaymasterV3__TokenAddressInvalid();

    /// @notice The token exchange rate is invalid.
    error OPFPaymasterV3__ExchangeRateInvalid();

    /// @notice The recipient is invalid.
    error OPFPaymasterV3__RecipientInvalid();

    /// @notice The preFund is too high.
    error OPFPaymasterV3__PreFundTooHigh();
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
    error MultiSigner__SignerNotExist();
    error MultiSigner__SignerAlreadyExist();

    function run() public {
        string memory s = which();
        console.logString(s);
    }

    function which() internal pure returns (string memory) {
        if (S == BasePaymaster__SenderNotEntryPointV8.selector) return "SenderNotEntryPointV8";
        if (S == OPFPaymasterV3__PaymasterAndDataLengthInvalid.selector) return "PaymasterAndDataLengthInvalid";
        if (S == OPFPaymasterV3__PaymasterModeInvalid.selector) return "PaymasterModeInvalid";
        if (S == OPFPaymasterV3__PaymasterConfigLengthInvalid.selector) return "PaymasterConfigLengthInvalid";
        if (S == OPFPaymasterV3__PaymasterSignatureLengthInvalid.selector) return "PaymasterSignatureLengthInvalid";
        if (S == OPFPaymasterV3__TokenAddressInvalid.selector) return "TokenAddressInvalid";
        if (S == OPFPaymasterV3__ExchangeRateInvalid.selector) return "ExchangeRateInvalid";
        if (S == OPFPaymasterV3__RecipientInvalid.selector) return "RecipientInvalid";
        if (S == OPFPaymasterV3__PreFundTooHigh.selector) return "PreFundTooHigh";
        if (S == AccessControlUnauthorizedAccount.selector) return "AccessControlUnauthorizedAccount";
        if (S == MultiSigner__SignerNotExist.selector) return "SignerNotExist";
        if (S == MultiSigner__SignerAlreadyExist.selector) return "SignerAlreadyExist";
        return "Unknown";
    }
}
