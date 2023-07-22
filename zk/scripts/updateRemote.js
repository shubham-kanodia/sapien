async function main() {
    const IGP_ADDRESS = "0xF90cB82a76492614D07B82a7658917f3aC811Ac1";
    const CELO_MAILBOX = "0xCC737a94FecaeC165AbCf12dED095BB13F037685";
    const MUMBAI_MAILBOX = "0xCC737a94FecaeC165AbCf12dED095BB13F037685";

    const RELAYER_ADDR = "0x2b85Ea90adB8a33668cdEf0282882B0D360867Dd";
    const HANDLER_ADDR = "0x95c5683d9e9f48F00E32c1Ff4e273631cD105Da5"
    
    const relayer = await ethers.getContractAt("Relayer", RELAYER_ADDR);
    const receipt = await relayer.updateRemote(44787, HANDLER_ADDR, 200000, { value: 2338284000000000 });
  
    receipt.wait();
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  