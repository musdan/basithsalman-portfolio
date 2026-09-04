import { ethers } from "hardhat";

/**
 * @notice ISSUER ADMIN SCRIPT: Onboards Investor Alice by creating her ONCHAINID,
 * attaching the KYC Authority's signed claim, and registering her wallet in the IdentityRegistry.
 */
async function main() {
  console.log("==========================================================================");
  console.log("🏢 ISSUER ADMIN SCRIPT: ONBOARDING INVESTOR ALICE");
  console.log("==========================================================================");

  const [xyzAdmin, kycAuthority, xyzTreasuryVault, investorAlice] = await ethers.getSigners();

  // Attach to existing deployed contracts
  const identityRegistry = await ethers.getContractAt("IdentityRegistry", (await ethers.getContractFactory("IdentityRegistry")).attach(await getAddress("IdentityRegistry")).address);
  
  console.log("🔹 Investor Alice Wallet Address:", investorAlice.address);

  // 1. Deploy Alice's personal ONCHAINID contract (Block #12)
  console.log("\n🆔 1. Deploying Alice's ONCHAINID Contract...");
  const IdentityFactory = await ethers.getContractFactory("Identity");
  const aliceIdentity = await IdentityFactory.deploy(investorAlice.address, false);
  await aliceIdentity.deployed();
  console.log("  ✔ Alice ONCHAINID Contract deployed to:", aliceIdentity.address);

  // 2. Generate Cryptographic KYC Claim (Topic 1) signed by KYC Authority
  console.log("\n✍️ 2. Generating & Signing KYC Credential (Topic 1)...");
  const claimTopic = 1;
  const claimScheme = 1; // ECDSA Signature
  const data = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("KYC Verified: US Passport Passed"));

  const claimHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "bytes"],
      [aliceIdentity.address, claimTopic, data]
    )
  );

  const signature = await kycAuthority.signMessage(ethers.utils.arrayify(claimHash));

  // 3. Add Signed KYC Claim to Alice's ONCHAINID (Block #13)
  await aliceIdentity.addClaim(claimTopic, claimScheme, kycAuthority.address, signature, data, "");
  console.log("  ✔ Signed KYC Topic 1 Claim added to Alice's ONCHAINID");

  // 4. Register Alice's wallet in IdentityRegistry (Block #14)
  console.log("\n📑 3. Whitelisting Alice in IdentityRegistry Database...");
  await identityRegistry.registerIdentity(
    investorAlice.address, // Alice's Wallet
    aliceIdentity.address, // Alice's ONCHAINID
    840                    // Country Code (840 = USA)
  );
  console.log("  ✔ Mapped investorAlice.address -> aliceIdentity.address (Country: USA)");

  const isVerified = await identityRegistry.isVerified(investorAlice.address);
  console.log("\n✅ VERIFICATION CHECK: Is Alice Verified On-Chain?", isVerified);
}

// Helper to attach to existing contract
async function getAddress(contractName: string): Promise<string> {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy();
  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
