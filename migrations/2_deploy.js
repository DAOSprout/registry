var registry = artifacts.require('Registry.sol')

module.exports = async deployer => {
  // Default fee is 1 ETH
  const fee = web3.toWei(1, 'ether')

  await deployer.deploy(registry, fee)

  // Register the registry
  const deployed = await registry.deployed()
  await deployed.register(registry.address, 'Registry', 'https://github.com/DeveloppSoft/ethereum_registry', {value: fee})

  // Get back the ether
  await deployed.withdrawFees()
}
