const YDToken = artifacts.require("YDToken");

module.exports = function (deployer) {
  deployer.deploy(YDToken);
};