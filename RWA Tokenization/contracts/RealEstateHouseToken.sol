// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "./token/Token.sol";

/**
 * @title RealEstateHouseToken
 * @notice ERC-3643 Permissioned Security Token representing 100% legal equity in a $1,000,000 House.
 * @dev Inherits full compliance hooks, ONCHAINID identity checks, and forced transfer capabilities.
 */
contract RealEstateHouseToken is Token {

    // Real Estate Property Metadata
    string public propertyAddress;
    string public spvLegalRegistrationNumber;
    uint256 public constant TOTAL_APPRAISED_VALUE_USD = 1_000_000;

    event HouseSharesIssued(address indexed treasuryVault, uint256 amount);

    /**
     * @dev Constructor sets the physical property address and legal SPV registration ID on-chain.
     */
    constructor(
        string memory _propertyAddress,
        string memory _spvLegalRegistrationNumber
    ) {
        propertyAddress = _propertyAddress;
        spvLegalRegistrationNumber = _spvLegalRegistrationNumber;
    }

    /**
     * @dev One-time initializer linking compliance and identity registry contracts.
     * @param _identityRegistry Address of the deployed IdentityRegistry contract
     * @param _compliance Address of the deployed DefaultCompliance contract
     */
    function initializeHouseToken(
        address _identityRegistry,
        address _compliance
    ) external onlyOwner {
        init(
            _identityRegistry,
            _compliance,
            "100 Palm Avenue House Token",
            "HOUSE",
            18,
            address(0)
        );
    }

    /**
     * @dev Mints the initial 1,000,000 property shares ($1.00 per share = $1M value) to the Treasury Vault.
     * @param _treasuryVault Address of the corporate treasury vault receiving the initial supply
     */
    function issueInitialHouseShares(address _treasuryVault) external onlyOwner {
        require(_treasuryVault != address(0), "Invalid vault address");
        mint(_treasuryVault, 1_000_000 * 10**18);
        emit HouseSharesIssued(_treasuryVault, 1_000_000 * 10**18);
    }
}
