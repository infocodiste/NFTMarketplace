// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UnitedMetaverseNation is ERC721("United Metaverse Nation", "UMN"), ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Strings for uint256;

    /*
     * Currently Assuming there will be one baseURI.
     * If it fails to upload all NFTs data under one baseURI,
     * we will divide baseURI and tokenURI function will be changed accordingly.
    */
    string private baseURI;
    string private blindURI;

    uint256 public BUY_LIMIT_PER_TX = 10;
    uint256 public MAX_NFT = 11111;
    uint256 public NFTPrice = 100000000000000000;  // 0.1 ETH
    bool public reveal = false;

    bool public isActive = false;
    bool public isAllowListActive = false;
    uint256 public allowListMaxMint = 2;
    mapping(address => bool) private allowList;
    mapping(address => uint256) private allowListClaimed;

    /*
     * Function to reveal all NFTs
    */
    function revealNow() external onlyOwner {
        reveal = true;
    }

    /*
     * Function to withdraw collected amount during minting
    */
    function withdraw(address _to) public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "Balance should be more then zero");
        payable(_to).transfer(balance);
    }

    function addToAllowList(address[] memory _addresses) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(_addresses[i] != address(0), "Cannot add the null address");

            allowList[_addresses[i]] = true;
            /**
            * @dev We don't want to reset _allowListClaimed count
            * if we try to add someone more than once.
            */
            allowListClaimed[_addresses[i]] > 0 ? allowListClaimed[_addresses[i]] : 0;
        }
    }

    function onAllowList(address addr) external view returns (bool) {
        return allowList[addr];
    }

    function removeFromAllowList(address[] calldata _addresses) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(_addresses[i] != address(0), "Cannot add the null address");

            /// @dev We don't want to reset possible allowListClaimed numbers.
            allowList[_addresses[i]] = false;
        }
    }

    /**
    * @dev We want to be able to distinguish tokens bought during isAllowListActive
    * and tokens bought outside of isAllowListActive
    */
    function allowListClaimedBy(address _owner) external view returns (uint256){
        require(_owner != address(0), 'Zero address not on Allow List');

        return allowListClaimed[_owner];
    }

    function setIsActive(bool _isActive) external onlyOwner {
        isActive = _isActive;
    }

    function setIsAllowListActive(bool _isAllowListActive) external onlyOwner {
        isAllowListActive = _isAllowListActive;
    }

    function setAllowListMaxMint(uint256 _maxMint) external onlyOwner {
        allowListMaxMint = _maxMint;
    }

    function setBuyLimitPerTransaction(uint256 _limit) public onlyOwner{
        require(_limit <= MAX_NFT, "Cannot set buy limit more then max supply of NFT's" );
        BUY_LIMIT_PER_TX = _limit;
    }

    function setMaxNFT(uint256 _maxNFT) public onlyOwner{
        MAX_NFT = _maxNFT;
    }

    /*
     * Function to mint new NFTs
     * It is payable. Amount is calculated as per (NFTPrice.mul(_numOfTokens))
    */
    function mintNFT(uint256 _numOfTokens) public payable {
    
        require(isActive, 'Contract is not active');
        require(!isAllowListActive, 'Only allowing from Allow List');
        require(_numOfTokens <= BUY_LIMIT_PER_TX, "Cannot mint above limit");
        require(totalSupply().add(_numOfTokens) <= MAX_NFT, "Purchase would exceed max supply of NFTs");
        require(NFTPrice.mul(_numOfTokens) == msg.value, "Ether value sent is not correct");
        
        for(uint i = 0; i < _numOfTokens; i++) {
            _safeMint(msg.sender, totalSupply());
        }
    }

    function mintNFTAllowList(uint256 _numOfTokens) public payable {
        require(isActive, 'Contract is not active');
        require(isAllowListActive, 'Only allowing from Allow List');
        require(allowList[msg.sender], 'You are not on the Allow List');
        require(totalSupply() < MAX_NFT, 'All tokens have been minted');
        require(_numOfTokens <= allowListMaxMint, 'Cannot purchase this many tokens');
        require(totalSupply().add(_numOfTokens) <= MAX_NFT, 'Purchase would exceed max supply of NFTs');
        require(allowListClaimed[msg.sender].add(_numOfTokens) <= allowListMaxMint, 'Purchase exceeds max allowed');
        require(NFTPrice.mul(_numOfTokens) == msg.value, "Ether value sent is not correct");

        for (uint256 i = 0; i < _numOfTokens; i++) {
            
            allowListClaimed[msg.sender] += 1;
            _safeMint(msg.sender, totalSupply());
        }
    }

    /*
     * Function to get token URI of given token ID
     * URI will be blank untill totalSupply reaches MAX_NFT
    */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        if (!reveal) {
            return string(abi.encodePacked(blindURI));
        } else {
            return string(abi.encodePacked(baseURI, tokenId.toString()));
        }
    }

    /*
     * Function to set Base and Blind URI 
    */
    function setURIs(string memory _blindURI, string memory _URI) external onlyOwner {
        blindURI = _blindURI;
        baseURI = _URI;
    }

    // Standard functions to be overridden 
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, 
        ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}