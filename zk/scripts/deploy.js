async function main() {
  const IGP_ADDRESS = "0xF90cB82a76492614D07B82a7658917f3aC811Ac1";
  const CELO_MAILBOX = "0xCC737a94FecaeC165AbCf12dED095BB13F037685";

  const Identifier = await ethers.getContractFactory("Identifier");
  const identifier = await Identifier.deploy(CELO_MAILBOX, IGP_ADDRESS);

  await identifier.deployed();

  console.log(`Identifier contract deployed to ${identifier.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
