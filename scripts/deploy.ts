import { formatBytes32String, formatEther, hashMessage, id, parseBytes32String, verifyMessage } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { arrayify, keccak256, solidityKeccak256, solidityPack } from "ethers/lib/utils";
import { utils } from "ethers";

async function printPoints() {
	const [deployer] = await ethers.getSigners();

	const pointsAddress = '0x53e37895Ec887F577EC481549Aeb14B367D1904a';
	const Points = await ethers.getContractFactory("ERC20TD");
	const points = await Points.attach(pointsAddress);

	const balance = await points.balanceOf(deployer.address);
	console.log(formatEther(balance));
}

async function main() {

	const [deployer] = await ethers.getSigners();

	const evaluatorAddress = '0x657e2603c61eC6562258d72ce9E2C27E8537F81C';

	const Evaluator = await ethers.getContractFactory("Evaluator");

	const evaluator = await Evaluator.attach(evaluatorAddress);

	const Minter = await ethers.getContractFactory('Minter');
	const minter = await Minter.deploy(evaluatorAddress);
	await minter.deployed();

	console.log("submit")
	await evaluator.submitExercice(minter.address);

	console.log('ex1')
	await (await evaluator.ex1_testERC721()).wait();

	const hashMsg = id(solidityPack(['bytes32'], ['0x00000000596f75206e65656420746f207369676e207468697320737472696e67']));
	const sig1 = await deployer.signMessage(hashMsg);
	await evaluator.ex2_generateASignature(sig1);


	console.log('ex3')
	await evaluator.ex3_extractAddressFromSignature();

	console.log('ex4')
	const b = id("TEST");
	const sig = await deployer.signMessage(arrayify(b));
	await evaluator.ex4_manageWhiteListWithSignature(b, sig);

	console.log('ex5')
	const dataToSign = await minter.getDataToSign();
	const sigMint = await deployer.signMessage(arrayify(dataToSign));
	await evaluator.ex5_mintATokenWithASpecificSignature(sigMint)

	console.log('ex6')
	const Bouncer = await ethers.getContractFactory('BouncerProxy');
	const bouncer = await Bouncer.deploy();
	await bouncer.deployed();

	await (await evaluator.ex6_deployBouncerProxyAndWhitelistYourself('0xb3D9Aa5f8891da8336DEfA2c352Ab17216E3F943')).wait();

	await printPoints();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
