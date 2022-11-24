pragma solidity ^0.6.0;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import './IExerciceSolution.sol';
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Custom is ERC721 {

    address public minter;
    uint256 supply;

    constructor (string memory name_, string memory symbol_) ERC721 (name_, symbol_) public {
        minter = msg.sender;
    }

    function mint (address _for) public returns (uint256) {
        require (msg.sender == minter);
        uint256 id = supply;
        _mint(_for, id);
        supply++;
        return id;
    }

}

contract Minter is IExerciceSolution {

    ERC721Custom public erc721;
    mapping (address => bool) public whitelisted;
    address public owner;
    address evaluator;

    constructor (address _eval) public {
        erc721 = new ERC721Custom("Custom", "Bleb");
        whitelisted[msg.sender] = true;
        owner = msg.sender;
        evaluator = _eval;
    }

    function ERC721Address() external override returns (address) {
        return address(erc721);
    }

	function mintATokenForMe() external override returns (uint256) {
        return erc721.mint(msg.sender);
    }


	function getAddressFromSignature(bytes32 _hash, bytes calldata _signature) external override returns (address) {
        return ECDSA.recover(ECDSA.toEthSignedMessageHash(_hash), _signature);
    }

	function signerIsWhitelisted(bytes32 _hash, bytes calldata _signature) external override returns (bool){
        return whitelisted[this.getAddressFromSignature(_hash, _signature)];
    }

	function whitelist(address _signer) external override returns (bool) {
        if(msg.sender == owner) whitelisted[_signer] = true;
        return whitelisted[_signer];
    }

    function mintATokenForMeWithASignature(bytes calldata _signature) external override returns (uint256) {
        require(this.signerIsWhitelisted(getDataToSign(), _signature), "not whitelisted");

        return erc721.mint(msg.sender);
    }

    function getDataToSign() public view returns (bytes32) {
        return keccak256(abi.encodePacked(evaluator, tx.origin, address(erc721)));
    }

}