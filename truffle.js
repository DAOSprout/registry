require('babel-register')
require('babel-polyfill')

var HDWalletProvider = require('truffle-hdwallet-provider')
const mnemonic = 'act forest much author indoor bench adapt mix pluck movie wood usage' // 12 word mnemonic

let ropstenProvider
let kovanProvider

if (process.env.LIVE_NETWORKS) {
  ropstenProvider = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/')
  kovanProvider = new HDWalletProvider(mnemonic, 'https://kovan.infura.io')
}

module.exports = {
  networks: {
    rpc: {
      network_id: 15, // eslint-disable-line camelcase
      host: 'localhost',
      port: 8545,
      gas: 50e6
    },
    ropsten: {
      network_id: 3, // eslint-disable-line camelcase
      provider: ropstenProvider,
      gas: 4.712e6
    },
    kovan: {
      network_id: 42, // eslint-disable-line camelcase
      provider: kovanProvider,
      gas: 6.9e6
    }
  }
}
