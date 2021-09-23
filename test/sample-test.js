const { expect, use } = require("chai");
const { ethers, web3 } = require("hardhat");

beforeEach(async function () {
  [owner, user1, user2, user3, user4,user5, user6, user7, feeRewardIncludedUser, feeExcludedUser, rewardExcludedUser, feeRewardExcludedUser] = await ethers.getSigners();

  united = await ethers.getContractFactory("UnitedMetaverseNation");
  UMN = await united.deploy();
  await UMN.deployed();
});

describe("Universal Contract", function () {
  it("Paramter", async function () {
    expect(await UMN.BUY_LIMIT_PER_TX()).to.equal(10);
    expect(await UMN.MAX_NFT()).to.equal(11111);
    expect(await UMN.NFTPrice()).to.equal(web3.utils.toWei("0.1", "ether"));
    expect(await UMN.reveal()).to.equal(false);
    expect(await UMN.isActive()).to.equal(false);
    expect(await UMN.isAllowListActive()).to.equal(false);
    expect(await UMN.allowListMaxMint()).to.equal(2);

    await expect(UMN.connect(user2).setBuyLimitPerTransaction(10)).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(UMN.connect(owner).setBuyLimitPerTransaction(11112)).to.be.revertedWith("Cannot set buy limit more then max supply of NFT's");
    await UMN.connect(owner).setBuyLimitPerTransaction(15);
    expect(await UMN.BUY_LIMIT_PER_TX()).to.equal(15);
    await expect(UMN.connect(user2).setMaxNFT(100)).to.be.revertedWith("Ownable: caller is not the owner");
    await UMN.connect(owner).setMaxNFT(100);
    expect(await UMN.MAX_NFT()).to.equal(100);
  });

  it("Functionality", async function(){
    const allowList = [user1.address, user2.address, user3.address, user4.address, user5.address];

    await expect(UMN.connect(user3).addToAllowList(allowList)).to.be.revertedWith('Ownable: caller is not the owner');
    await UMN.connect(owner).addToAllowList(allowList);
    expect(await UMN.onAllowList(user1.address)).to.equal(true);
    expect(await UMN.onAllowList(user2.address)).to.equal(true);
    expect(await UMN.onAllowList(user3.address)).to.equal(true);
    expect(await UMN.onAllowList(user4.address)).to.equal(true);
    expect(await UMN.onAllowList(user5.address)).to.equal(true);
    expect(await UMN.onAllowList(user6.address)).to.equal(false);
    expect(await UMN.onAllowList(user7.address)).to.equal(false);
    await expect(UMN.connect(user7).removeFromAllowList([user5.address])).to.be.revertedWith('Ownable: caller is not the owner');
    await UMN.connect(owner).removeFromAllowList([user5.address]);
    expect(await UMN.onAllowList(user5.address)).to.equal(false);

    await expect(UMN.connect(user2).mintNFT(2, {value : web3.utils.toWei("0.2", "ether")})).to.be.revertedWith("Contract is not active");
    await expect(UMN.connect(user2).setIsActive(true)).to.be.revertedWith('Ownable: caller is not the owner');
    await UMN.connect(owner).setIsActive(true);
    await expect(UMN.connect(owner).mintNFT(12,{value : web3.utils.toWei("0.12", "ether")})).to.be.revertedWith("Cannot mint above limit");
    await expect(UMN.connect(owner).mintNFT(2, {value : web3.utils.toWei("0.1", "ether")})).to.be.revertedWith("Ether value sent is not correct");

    expect(await UMN.totalSupply()).to.equal(0);
    await UMN.connect(owner).mintNFT(5,  {value : web3.utils.toWei("0.5", "ether")});
    expect(await UMN.totalSupply()).to.equal(5);

    await UMN.connect(user5).mintNFT(5,  {value : web3.utils.toWei("0.5", "ether")});
    expect(await UMN.totalSupply()).to.equal(10);

    await expect(UMN.connect(user4).mintNFTAllowList(2, {value : web3.utils.toWei("0.2", "ether")})).to.be.revertedWith("Only allowing from Allow List");
    await expect(UMN.connect(user2).setIsAllowListActive(true)).to.be.revertedWith('Ownable: caller is not the owner');
    await UMN.connect(owner).setIsAllowListActive(true);
    await expect(UMN.connect(user7).mintNFTAllowList(2, {value : web3.utils.toWei("0.2", "ether")})).to.be.revertedWith("You are not on the Allow List");
    await expect(UMN.connect(user1).mintNFTAllowList(5, {value : web3.utils.toWei("0.5", "ether")})).to.be.revertedWith("Cannot purchase this many tokens");
    await UMN.connect(user2).mintNFTAllowList(1, {value : web3.utils.toWei("0.1", "ether")});
    await expect(UMN.connect(user2).mintNFTAllowList(2, {value : web3.utils.toWei("0.2", "ether")})).to.be.revertedWith("Purchase exceeds max allowed");
    await expect(UMN.connect(user3).mintNFTAllowList(2, {value : web3.utils.toWei("0.1", "ether")})).to.be.revertedWith("Ether value sent is not correct");

    await expect(UMN.connect(user6).setAllowListMaxMint(5)).to.be.revertedWith('Ownable: caller is not the owner');
    await UMN.connect(owner).setAllowListMaxMint(5);
    await UMN.connect(user2).mintNFTAllowList(4, {value : web3.utils.toWei("0.4", "ether")});
    expect(await UMN.totalSupply()).to.equal(15);

    expect(await UMN.allowListClaimedBy(user1.address)).to.equal(0);
    expect(await UMN.allowListClaimedBy(user2.address)).to.equal(5);

    await expect(UMN.connect(user6).setURIs("ipfs://", "QmaEWEUnSBz2hdkAdgEPd5wJ6H6BY7PPCfwhGpA4xbZGrs")).to.be.revertedWith('Ownable: caller is not the owner'); 
    await UMN.connect(owner).setURIs("ipfs://", "QmaEWEUnSBz2hdkAdgEPd5wJ6H6BY7PPCfwhGpA4xbZGrs");
    expect(await UMN.tokenURI(1)).to.equal("ipfs://1");
    await expect(UMN.connect(user3).revealNow()).to.be.revertedWith("Ownable: caller is not the owner");
    await UMN.connect(owner).revealNow();
    expect(await UMN.tokenURI(10)).to.equal("QmaEWEUnSBz2hdkAdgEPd5wJ6H6BY7PPCfwhGpA4xbZGrs10");

    await expect(UMN.connect(user4).withdraw(user5.address)).to.be.revertedWith('Ownable: caller is not the owner');

    expect(await web3.eth.getBalance(UMN.address)).to.equals(web3.utils.toWei("1.5", "ether"));

    await UMN.connect(owner).withdraw(user1.address);
  });

  it("Mint all NFTs", async function(){

    await UMN.connect(owner).setIsActive(true);
    await UMN.connect(owner).revealNow();
    for(var i = 0; i < 1111; i++){
      await UMN.connect(user2).mintNFT(10, {value : web3.utils.toWei("1", "ether")});
    }
    expect(await UMN.totalSupply()).to.equal(11110);
    await expect(UMN.connect(owner).mintNFT(2, {value : web3.utils.toWei("0.2", "ether")})).to.be.revertedWith("Purchase would exceed max supply of NFTs");
    await UMN.connect(user2).mintNFT(1, {value : web3.utils.toWei("0.1", "ether")});

    expect(await web3.eth.getBalance(UMN.address)).to.equals(web3.utils.toWei("1111.1", "ether"));
    await UMN.connect(owner).withdraw(user1.address);
  });
});
