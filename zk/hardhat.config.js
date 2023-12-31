require("@nomicfoundation/hardhat-toolbox");

const goerliApiKey = process.env.GOERLI_ALCHEMY_API_KEY || "";
const privateKey = ""

const config = {
  solidity: {
    compilers: [
      {
        version: "0.6.11",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${goerliApiKey}`,
      accounts: privateKey !== undefined ? [privateKey] : [],
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/h-b2j7w7v-hBAL6IozZrEMD280pSb_vk`,
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    celo: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: privateKey !== undefined ? [privateKey] : [],
    },
    era: {
      url: "https://testnet.era.zksync.dev",
      accounts: privateKey !== undefined ? [privateKey] : [],
    }
  },
};

module.exports = config;
