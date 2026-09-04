// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./token/IToken.sol";

/**
 * @title HouseSalesContract
 * @notice Handles atomic payment in USD/USDC and delivers permissioned ERC-3643 HOUSE shares to buyers.
 */
contract HouseSalesContract {

    IToken public houseToken;
    IERC20 public usdcToken;
    address public treasuryVault;
    uint256 public pricePerTokenUsdc; // e.g., 1 USDC per HOUSE token (6 decimals for USDC)

    event HouseSharesPurchased(
        address indexed buyer,
        uint256 usdcPaid,
        uint256 houseSharesReceived
    );

    constructor(
        address _houseTokenAddress,
        address _usdcTokenAddress,
        address _treasuryVault,
        uint256 _pricePerTokenUsdc
    ) {
        houseToken = IToken(_houseTokenAddress);
        usdcToken = IERC20(_usdcTokenAddress);
        treasuryVault = _treasuryVault;
        pricePerTokenUsdc = _pricePerTokenUsdc;
    }

    /**
     * @notice Allows a KYC-verified buyer to purchase fractional property shares.
     * @param _usdcAmount The amount of USDC payment tokens to spend (6 decimals)
     */
    function buyHouseShares(uint256 _usdcAmount) external {
        require(_usdcAmount > 0, "Payment amount must be greater than zero");

        // 1. Transfer USDC payment from Buyer to Issuer Treasury Vault
        bool paymentSuccess = usdcToken.transferFrom(msg.sender, treasuryVault, _usdcAmount);
        require(paymentSuccess, "USDC Payment transfer failed");

        // 2. Calculate HOUSE shares to deliver (18 decimals)
        // 1 USDC (1e6) = 1 HOUSE Token (1e18)
        uint256 shareAmount = (_usdcAmount * 10**18) / pricePerTokenUsdc;

        // 3. Transfer HOUSE tokens from Treasury Vault to Buyer
        // (Token.sol automatically executes IdentityRegistry.isVerified(msg.sender) on-chain!)
        bool tokenSuccess = houseToken.forcedTransfer(treasuryVault, msg.sender, shareAmount);
        require(tokenSuccess, "HOUSE Token transfer failed or buyer is not KYC verified!");

        emit HouseSharesPurchased(msg.sender, _usdcAmount, shareAmount);
    }
}
