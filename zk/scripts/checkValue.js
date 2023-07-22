async function main() {
    const HANDLER_ADDR = "0x95c5683d9e9f48F00E32c1Ff4e273631cD105Da5"
    const ACCOUNT_AddR = "0x360B44153d4D200572429904e4Fb717eF8E393F6"
    
    const handler = await ethers.getContractAt("Handler", HANDLER_ADDR);
  
    console.log(await handler.values(ACCOUNT_AddR));
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  