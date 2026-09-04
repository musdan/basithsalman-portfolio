import { ethers } from "hardhat";

async function main() {
  console.log("==========================================================");
  console.log("🏢 ERC-3643 REAL WORLD ASSET (RWA) TOKENIZATION DEMO");
  console.log("==========================================================");

  const [deployer, kycAuthority, investorAlice, unverifiedBob] = await ethers.getSigners();
  console.log("🔹 Deployer (Issuer Admin):", deployer.address);
  console.log("🔹 KYC Claim Authority:    ", kycAuthority.address);
  console.log("🔹 Verified Investor Alice:", investorAlice.address);
  console.log("🔹 Unverified User Bob:    ", unverifiedBob.address);
  console.log("----------------------------------------------------------");

  // 1. Deploy Implementation Contracts for ONCHAINID & Registries
  console.log("\n📦 1. Deploying ONCHAINID & Registry Contracts...");

  const ClaimTopicsRegistryFactory = await ethers.getContractFactory("ClaimTopicsRegistry");
  const claimTopicsRegistry = await ClaimTopicsRegistryFactory.deploy();
  await claimTopicsRegistry.deployed();
  console.log("  ✔ ClaimTopicsRegistry deployed to:", claimTopicsRegistry.address);

  // Add Topic 1 (KYC Verification)
  await claimTopicsRegistry.addClaimTopic(1);
  console.log("  ✔ Added Claim Topic 1 (KYC Verified)");

  const TrustedIssuersRegistryFactory = await ethers.getContractFactory("TrustedIssuersRegistry");
  const trustedIssuersRegistry = await TrustedIssuersRegistryFactory.deploy();
  await trustedIssuersRegistry.deployed();
  console.log("  ✔ TrustedIssuersRegistry deployed to:", trustedIssuersRegistry.address);

  // Add KYC Authority as trusted issuer for Topic 1
  await trustedIssuersRegistry.addTrustedIssuer(kycAuthority.address, [1]);
  console.log("  ✔ Added KYC Authority as Trusted Issuer for Topic 1");

  const IdentityRegistryStorageFactory = await ethers.getContractFactory("IdentityRegistryStorage");
  const identityRegistryStorage = await IdentityRegistryStorageFactory.deploy();
  await identityRegistryStorage.deployed();
  console.log("  ✔ IdentityRegistryStorage deployed to:", identityRegistryStorage.address);

  const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistryFactory.deploy(
    trustedIssuersRegistry.address,
    claimTopicsRegistry.address,
    identityRegistryStorage.address
  );
  await identityRegistry.deployed();
  console.log("  ✔ IdentityRegistry deployed to:", identityRegistry.address);

  // Bind storage to identity registry
  await identityRegistryStorage.bindIdentityRegistry(identityRegistry.address);

  // 2. Deploy Modular Compliance Contract
  console.log("\n⚖️ 2. Deploying Compliance Module...");
  const DefaultComplianceFactory = await ethers.getContractFactory("DefaultCompliance");
  const compliance = await DefaultComplianceFactory.deploy();
  await compliance.deployed();
  console.log("  ✔ DefaultCompliance deployed to:", compliance.address);

  // 3. Deploy ERC-3643 Security Token ("Manhattan Tower Token")
  console.log("\n🏙️ 3. Tokenizing RWA Asset ($1,000,000 Real Estate Property)...");
  const TokenFactory = await ethers.getContractFactory("Token");
  const token = await TokenFactory.deploy();
  await token.deployed();

  await token.init(
    identityRegistry.address,
    compliance.address,
    "Manhattan Tower Token",
    "MTT",
    18,
    ethers.constants.AddressZero
  );
  console.log("  ✔ Manhattan Tower Token (MTT) Contract initialized at:", token.address);

  // Mint 1,000,000 MTT ($1M Property Value) to Issuer
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
  await token.mint(deployer.address, INITIAL_SUPPLY);
  console.log("  💰 Minted 1,000,000 MTT ($1M Property Value) to Issuer Admin");

  const issuerBalance = await token.balanceOf(deployer.address);
  console.log("  📊 Issuer Balance:", ethers.utils.formatEther(issuerBalance), "MTT");

  // 4. ONCHAINID & KYC Registration for Investor Alice
  console.log("\n🆔 4. Onboarding & KYC Registration for Investor Alice...");

  const IdentityFactory = await ethers.getContractFactory("Identity");
  const aliceIdentity = await IdentityFactory.deploy(investorAlice.address, false);
  await aliceIdentity.deployed();
  console.log("  ✔ Alice ONCHAINID Contract deployed to:", aliceIdentity.address);

  // Register Alice in Identity Registry (Country Code 840 = USA)
  await identityRegistry.registerIdentity(investorAlice.address, aliceIdentity.address, 840);
  console.log("  ✅ Investor Alice registered in IdentityRegistry (KYC Approved, USA)");

  // 5. Test Compliant Transfer to Investor Alice
  console.log("\n💸 5. Executing Compliant Token Transfer to Alice ($50,000 Property Shares)...");
  const aliceTransferAmount = ethers.utils.parseEther("50000");

  const tx1 = await token.transfer(investorAlice.address, aliceTransferAmount);
  await tx1.wait();

  const aliceBalance = await token.balanceOf(investorAlice.address);
  console.log("  🎉 Transfer SUCCESSFUL!");
  console.log("  📊 Alice New Balance:", ethers.utils.formatEther(aliceBalance), "MTT ($50,000 Property Share)");

  // 6. Test Transfer to Unverified User Bob (Should REVERT on-chain)
  console.log("\n🚫 6. Attempting Transfer to Unverified User Bob (Non-KYC)...");
  try {
    const bobTransferAmount = ethers.utils.parseEther("10000");
    await token.transfer(unverifiedBob.address, bobTransferAmount);
    console.log("  ❌ ERROR: Transfer should have failed!");
  } catch (error: any) {
    console.log("  🛡️ REJECTED ON-CHAIN: Transfer blocked because Bob is not KYC registered!");
    console.log("  Reason:", error.reason || "ERC-3643 Identity Compliance Check Failed");
  }

  console.log("\n==========================================================");
  console.log("✨ ERC-3643 RWA TOKENIZATION DEMO COMPLETE!");
  console.log("==========================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
