import { ethers } from "hardhat";

async function main() {
  console.log("==========================================================================");
  console.log("🚀 STEP 1: COMPLETE END-TO-END ERC-3643 REAL ESTATE TOKENIZATION DEPLOYMENT");
  console.log("==========================================================================");

  const [xyzAdmin, kycAuthority, xyzTreasuryVault, investorAlice, unverifiedBob] = await ethers.getSigners();
  console.log("🔹 Issuer Admin (XYZ Company):  ", xyzAdmin.address);
  console.log("🔹 Identity Authority (KYC):    ", kycAuthority.address);
  console.log("🔹 XYZ Treasury Vault:          ", xyzTreasuryVault.address);
  console.log("🔹 Investor Alice (Verified):   ", investorAlice.address);
  console.log("🔹 User Bob (Unverified):       ", unverifiedBob.address);
  console.log("--------------------------------------------------------------------------");

  // =========================================================================
  // 1. DEPLOY REGISTRIES & COMPLIANCE
  // =========================================================================
  console.log("\n📦 1. Deploying ERC-3643 Registries & Compliance Modules...");

  // ClaimTopicsRegistry (Block #1)
  const ClaimTopicsRegistryFactory = await ethers.getContractFactory("ClaimTopicsRegistry");
  const claimTopicsRegistry = await ClaimTopicsRegistryFactory.deploy();
  await claimTopicsRegistry.deployed();
  console.log("  ✔ ClaimTopicsRegistry deployed to:", claimTopicsRegistry.address);

  // Add Topic 1 (KYC) Rule (Block #2)
  await claimTopicsRegistry.addClaimTopic(1);
  console.log("  ✔ Added Required Rule: Claim Topic 1 (KYC Verification)");

  // TrustedIssuersRegistry (Block #3)
  const TrustedIssuersRegistryFactory = await ethers.getContractFactory("TrustedIssuersRegistry");
  const trustedIssuersRegistry = await TrustedIssuersRegistryFactory.deploy();
  await trustedIssuersRegistry.deployed();
  console.log("  ✔ TrustedIssuersRegistry deployed to:", trustedIssuersRegistry.address);

  // Authorize KYC Authority for Topic 1 (Block #4)
  await trustedIssuersRegistry.addTrustedIssuer(kycAuthority.address, [1]);
  console.log("  ✔ Authorized KYC Authority Address for Topic 1");

  // IdentityRegistryStorage (Block #5)
  const IdentityRegistryStorageFactory = await ethers.getContractFactory("IdentityRegistryStorage");
  const identityRegistryStorage = await IdentityRegistryStorageFactory.deploy();
  await identityRegistryStorage.deployed();
  console.log("  ✔ IdentityRegistryStorage database deployed to:", identityRegistryStorage.address);

  // IdentityRegistry Gateway (Block #6)
  const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistryFactory.deploy(
    trustedIssuersRegistry.address,
    claimTopicsRegistry.address,
    identityRegistryStorage.address
  );
  await identityRegistry.deployed();
  console.log("  ✔ IdentityRegistry Gateway deployed to:", identityRegistry.address);

  // Bind Storage to IdentityRegistry (Block #7)
  await identityRegistryStorage.bindIdentityRegistry(identityRegistry.address);
  console.log("  ✔ Storage database bound to IdentityRegistry Gateway");

  // DefaultCompliance Rules Engine (Block #8)
  const DefaultComplianceFactory = await ethers.getContractFactory("DefaultCompliance");
  const compliance = await DefaultComplianceFactory.deploy();
  await compliance.deployed();
  console.log("  ✔ DefaultCompliance engine deployed to:", compliance.address);

  // =========================================================================
  // 2. DEPLOY PAYMENT TOKEN & HOUSE TOKEN
  // =========================================================================
  console.log("\n🏙️ 2. Tokenizing RWA Asset ($1,000,000 House)...");

  // Deploy Mock USDC Payment Token
  const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
  const usdcToken = await MockUSDCFactory.deploy();
  await usdcToken.deployed();
  console.log("  ✔ Mock USDC Payment Token deployed to:", usdcToken.address);

  // Deploy RealEstateHouseToken (Block #9)
  const HouseTokenFactory = await ethers.getContractFactory("RealEstateHouseToken");
  const houseToken = await HouseTokenFactory.deploy(
    "100 Palm Avenue, Miami, FL", // Property Address
    "LLC-998241"                  // SPV LLC Filing ID
  );
  await houseToken.deployed();
  console.log("  ✔ RealEstateHouseToken deployed to:", houseToken.address);

  // Initialize House Token (Block #10)
  await houseToken.initializeHouseToken(identityRegistry.address, compliance.address);
  console.log("  ✔ RealEstateHouseToken initialized with IdentityRegistry & Compliance links!");

  // Issue 1,000,000 HOUSE Shares to Treasury Vault (Block #11)
  await houseToken.issueInitialHouseShares(xyzTreasuryVault.address);
  console.log("  💰 Issued 1,000,000 HOUSE Shares ($1M Equity Value) to XYZ Treasury Vault");

  // =========================================================================
  // 3. DEPLOY ATOMIC SALES CONTRACT
  // =========================================================================
  console.log("\n🛒 3. Deploying House Sales Contract...");

  const SalesFactory = await ethers.getContractFactory("HouseSalesContract");
  const houseSales = await SalesFactory.deploy(
    houseToken.address,
    usdcToken.address,
    xyzTreasuryVault.address,
    1000000 // 1 USDC (6 decimals = 1,000,000) per 1 HOUSE token (18 decimals)
  );
  await houseSales.deployed();
  console.log("  ✔ HouseSalesContract deployed at:", houseSales.address);

  // Grant Agent Role to Sales Contract on Token
  await houseToken.addAgent(houseSales.address);
  console.log("  ✔ Granted Agent authorization to Sales Contract for atomic share transfers");

  console.log("\n==========================================================================");
  console.log("🎉 DEPLOYMENT COMPLETE! All contracts are live & ready for onboarded buyers.");
  console.log("==========================================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
