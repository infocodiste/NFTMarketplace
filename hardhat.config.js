
const { privateKey, etherScanApiKey, bscscanApiKey } = require('./secrets.json');

require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  etherscan: {
    apiKey: "AT2PY5RQ2BGK171WNDKVUZJRZ9YI6E5I6J" 
  },

  defaultNetwork: "localhost", 

  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "10000000000000000000000000",
        count: 10,
      }
    },

    localhost: {
      url: "http://127.0.0.1:8545"
    },

    Ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/Gwy3q1VE1ub6RtnpUTNz0ZrUD_B4fjEk',
      accounts: [privateKey]
    },

    Rinkeby: {
      url: 'https://rinkeby.infura.io/v3/03ff92d75ebf45eb8ed193b7a410543a',
      accounts: [privateKey]
    },

    Kovan: {
      url: 'https://eth-kovan.alchemyapi.io/v2/2TPPFXUI14eJLpNihnegJ_vHbqLnI_1S',
      accounts: [privateKey]
    },

    bscTestnet: {
      url: "https://data-seed-prebsc-2-s3.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [privateKey]
    },

    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [privateKey]
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }   
      },
    ]
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  mocha: {
    timeout: 2000000
  }
};
