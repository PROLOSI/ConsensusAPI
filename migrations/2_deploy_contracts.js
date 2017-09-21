var Voting = artifacts.require("./Voting.sol");
module.exports = function(deployer) {
  //deployer.deploy(Voting, 0, web3.toWei('0', 'ether'), []);
  deployer.deploy(Voting, 0, web3.toWei('0', 'ether'), ['Rama', 'Nick', 'Jose']);
};
