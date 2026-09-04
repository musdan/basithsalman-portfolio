import { ethers } from "hardhat";

/**
 * @notice BUYER SCRIPT: Simulates Investor Alice approving her $50,000 USDC payment
 * and triggering the atomic buy order on HouseSalesContract to receive 50,000 HOUSE shares.
 */
async function main() {
  console.log("==========================================================================");
  console.log("👩 BUYER SCRIPT: INVESTOR ALICE PURCHASING $50,000 PROPERTY SHARES");
  console.log("==========================================================================");

  const [xyzAdmin, kycAuthority, xyzTreasuryVault, investorAlice, unverifiedBob] = await ethers.getSigners();

  // 1. Setup Payment Token & Mints $50,000 USDC to Alice
  const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
  const usdcToken = await MockUSDCFactory.deploy();
  await usdcToken.deployed();

  const HouseTokenFactory = await ethers.getContractFactory("RealEstateHouseToken");
  const houseToken = await HouseTokenFactory.deploy("100 Palm Avenue, Miami, FL", "LLC-998241");
  await houseToken.deployed();

  const SalesFactory = await ethers.getContractFactory("HouseSalesContract");
  const houseSales = await SalesFactory.deploy(
    houseToken.address,
    usdcToken.address,
    xyzTreasuryVault.address,
    1000000 // 1 USDC (6 decimals = 1,000,000) per 1 HOUSE token (18 decimals)
  );
  await houseSales.deployed();

  // Mint $50,000 USDC to Alice's wallet
  const paymentAmountUsdc = ethers.utils.parseUnits("50000", 6); // $50,000 USDC (6 decimals)
  await usdcToken.mint(investorAlice.address, paymentAmountUsdc);

  console.log("💳 Alice Initial USDC Balance:", ethers.utils.formatUnits(await usdcToken.balanceOf(investorAlice.address), 6), "USDC");
  console.log("🏠 Alice Initial HOUSE Shares:", ethers.utils.formatEther(await houseToken.balanceOf(investorAlice.address)), "HOUSE");

  // =========================================================================
  // STEP 1: ALICE APPROVES PAYMENT TO SALES CONTRACT
  // =========================================================================
  console.log("\n🔑 1. Alice Approves $50,000 USDC Payment to HouseSalesContract...");
  const usdcAliceInstance = usdcToken.connect(investorAlice);
  await usdcAliceInstance.approve(houseSales.address, paymentAmountUsdc);
  console.log("  ✔ Payment Approval Granted!");

  // =========================================================================
  // STEP 2: ALICE EXECUTES ATOMIC BUY ORDER
  // =========================================================================
  console.log("\n💸 2. Alice Triggers buyHouseShares($50,000 USDC)...");
  const salesAliceInstance = houseSales.connect(investorAlice);
  
  // Try atomic buy order
  try {
    const txBuy = await salesAliceInstance.buyHouseShares(paymentAmountUsdc);
    await txBuy.wait();
    console.log("  🎉 SUCCESS! Buy transaction mined successfully.");
  } catch (error: any) {
    console.log("  🛑 Transaction Reverted (KYC Check Failed or Unverified)");
  }

  // =========================================================================
  // STEP 3: VERIFY FINAL BALANCES
  // =========================================================================
  console.log("\n📊 3. Final Balance Audit:");
  console.log("  💳 Alice Final USDC Balance:         ", ethers.utils.formatUnits(await usdcToken.balanceOf(investorAlice.address), 6), "USDC");
  console.log("  🏠 Alice Final HOUSE Shares:         ", ethers.utils.formatEther(await houseToken.balanceOf(investorAlice.address)), "HOUSE (5% Equity)");
  console.log("  🏛️ Issuer Treasury Vault USDC Balance:", ethers.utils.formatUnits(await usdcToken.balanceOf(xyzTreasuryVault.address), 6), "USDC");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
