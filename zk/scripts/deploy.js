async function main() {
  const Identifier = await ethers.getContractFactory("Identifier");
  const identifier = await Identifier.deploy();

  await identifier.deployed();

  console.log(`Identifier contract deployed to ${identifier.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
