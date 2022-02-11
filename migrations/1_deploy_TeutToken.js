const TeutToken = artifacts.require("TeutToken");
const Ownable= artifacts.require('Ownable');

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(TeutToken, "TeutToken", "TTK",18,"5000000");
  const teutToken = await TeutToken.deployed();


  await deployer.deploy(Ownable);
};
