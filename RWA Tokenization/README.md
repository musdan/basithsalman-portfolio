# 🏙️ ERC-3643 Real-World Asset (RWA) Real Estate Tokenization

An end-to-end implementation of an **ERC-3643 (T-REX Protocol)** permissioned security tokenization system for a **$1,000,000 Real Estate Property ("100 Palm Avenue, Miami, FL")**.

---

## 📂 Source Tree

```text
RWA Tokenization/
├── README.md
├── contracts/
│   ├── RealEstateHouseToken.sol    # ERC-3643 Property Equity Security Token
│   ├── HouseSalesContract.sol      # Atomic Payment & Share Delivery Contract
│   ├── MockUSDC.sol                # Mock 6-Decimal USDC Payment Token
│   ├── compliance/                 # ERC-3643 Compliance Engine & Modules
│   ├── registry/                   # Identity, Issuer, and Claim Topic Registries
│   ├── token/                      # ERC-3643 Core Token Implementation
│   └── factory/                    # Token Factory Contracts
└── scripts/
    ├── 01-deploy-complete-rwa.ts    # Complete Deployment & Treasury Minting
    ├── 02-issuer-admin-onboarding.ts# ONCHAINID KYC Registration Script
    └── 03-buyer-alice-purchase.ts   # Buyer Payment & Share Purchase Script
```

---

## 📐 System Architecture & Workflow

```text
[Step A] Deploy Registries & Compliance Contracts
  ├── ClaimTopicsRegistry (Topic 1: KYC)
  ├── TrustedIssuersRegistry (Authorized KYC Authority)
  ├── IdentityRegistryStorage & Gateway
  └── DefaultCompliance Engine

[Step B] Capture Deployed Contract Addresses
  ├── identityRegistryAddress -> 0x5FbDB2315678afecb367f032d93F642f64180aa3
  └── complianceAddress       -> 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

[Step C & D] Deploy & Initialize Security Token
  ├── RealEstateHouseToken("100 Palm Avenue, Miami, FL", "LLC-998241")
  └── initializeHouseToken(identityRegistryAddress, complianceAddress)

[Step E] Mint Property Equity Shares
  └── issueInitialHouseShares(xyzTreasuryVault) -> 1,000,000 HOUSE Shares ($1M Equity)

[Step F] Investor Onboarding & Purchase
  ├── Issuer deploys Alice's ONCHAINID & signs KYC Topic 1 claim
  ├── IdentityRegistry registers Alice (Country Code 840 = USA)
  └── Alice approves $50,000 USDC payment -> HouseSalesContract delivers 50,000 HOUSE shares
```

---

## 📜 Key Smart Contracts

1. **[`RealEstateHouseToken.sol`](./contracts/RealEstateHouseToken.sol)**
   - Inherits full ERC-3643 security token compliance, forced transfer capabilities, and freeze functions.
   - Stores physical address metadata (`"100 Palm Avenue, Miami, FL"`) and SPV filing ID (`"LLC-998241"`).
   - Initialized with 1,000,000 `HOUSE` tokens representing 100% legal ownership ($1 per share).

2. **[`HouseSalesContract.sol`](./contracts/HouseSalesContract.sol)**
   - Enables atomic settlement between USDC payment tokens and `HOUSE` security tokens.
   - Automatically transfers USDC payment directly into the Issuer Treasury Vault.
   - Invokes `forcedTransfer()` on the token, which triggers `IdentityRegistry.isVerified(buyer)` on-chain. Unverified buyers are automatically rejected on-chain.

3. **[`MockUSDC.sol`](./contracts/MockUSDC.sol)**
   - Standard 6-decimal test payment token for local environment simulation.

---

## ⚡ Execution Scripts

- **`01-deploy-complete-rwa.ts`**: Deploys the complete registry, token, sales contract, and treasury vault setup.
- **`02-issuer-admin-onboarding.ts`**: Onboards Investor Alice, creates her ONCHAINID smart contract, attaches the signed KYC claim, and whitelists her wallet in `IdentityRegistry`.
- **`03-buyer-alice-purchase.ts`**: Simulates Investor Alice approving payment and purchasing 50,000 `HOUSE` tokens ($50,000 equity).

---

## 🚀 Running Locally

```bash
# 1. Compile all contracts
npx hardhat compile

# 2. Deploy RWA System
npx hardhat run scripts/01-deploy-complete-rwa.ts --network localhost

# 3. Onboard Buyer (KYC & ONCHAINID)
npx hardhat run scripts/02-issuer-admin-onboarding.ts --network localhost

# 4. Execute Share Purchase
npx hardhat run scripts/03-buyer-alice-purchase.ts --network localhost
```
