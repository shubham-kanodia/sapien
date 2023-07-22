async function main() {
    const CELO_MAILBOX = "0xCC737a94FecaeC165AbCf12dED095BB13F037685";

    const Handler = await ethers.getContractFactory("RemoteIdentity");
    const handler = await Handler.deploy(CELO_MAILBOX);
  
    await handler.deployed();
  
    console.log(`Handler contract deployed to ${handler.address}`);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  