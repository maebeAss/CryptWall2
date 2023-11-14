const ethers = require("ethers");
const { parseUnits, parseEther, Contract } = require("ethers");
const dotenv = require('dotenv');
require('dotenv').config();
const jacket = require('./jacket.json');

const abi = [ "function transfer(address to, uint amount)",
              "function balanceOf(address) public view returns (uint)",
              "function symbol() view returns (string)",
              "function name() view returns (string)" ];

const provider = new ethers.JsonRpcProvider(jacket.nodeUrl); // blockchain RPC node link
const wallet = new ethers.Wallet(jacket.privateKey, provider); // wallet private key

async function getBalanceETH(value) {
const balanceETH = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balanceETH); // wei to ether
    return balanceInEth;
}

async function getBalanceERC20(token, value) {
    const contract = new Contract(token, abi, provider); // ERC20 token contract address
    if ( value === "amount" ) {
        const balance = await contract.balanceOf(wallet.address);
        const balanceInEth = ethers.formatEther(balance); // wei to ether
        return balanceInEth;
    } else if ( value === "symbol" ) {
        const erc20_symbol = await contract.symbol();
        return erc20_symbol;
    } else {
        return "invalid function parameter";
    }
}

async function sendETH(addressTo, amount) {
    const sendAddressTo = await wallet.sendTransaction ({to: addressTo, value: parseEther(amount) });
    const receive = await sendAddressTo.wait();
    console.log (sendAddressTo.hash, receive);
    return sendAddressTo.hash
}

async function sendERC20( nodeUrl, addressTo, token, amountERC20 ) {
    const provider = new ethers.JsonRpcProvider(nodeUrl); 
    const wallet = new ethers.Wallet(jacket.privateKey, provider); 
    const contract = new Contract(token, abi, wallet);
    const amount = parseUnits(amountERC20, 18);
    const sendAddressTo = await contract.trans(addressTo, amount);
    const receive = await sendAddressTo.wait();
    console.log (sendAddressTo.hash, receive);
    return sendAddressTo.hash;
}

module.exports = { getBalanceETH, getBalanceERC20, sendERC20, sendETH };