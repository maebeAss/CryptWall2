const ethers = require("ethers");
const { parseUnits, parseEther, Contract } = require("ethers");
const dotenv = require('dotenv');
require('dotenv').config();
const jacket = require('./jacket.json');

const mnemonic = 'spend margin round echo taxi unknown kangaroo chalk lens protect radio leader';

// Функция для создания адреса по указанному пути
function getAddress(mnemonic, path) {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    return wallet.address;
}

// Стандартные пути деривации для Ethereum (BIP44)
const path1 = "m/44'/60'/0'/0/0"; // Первый адрес
const path2 = "m/44'/60'/0'/0/1"; // Второй адрес
const path3 = "m/44'/60'/0'/0/2"; // Третий адрес

console.log('Address 1:', getAddress(mnemonic, path1));
console.log('Address 2:', getAddress(mnemonic, path2));
console.log('Address 3:', getAddress(mnemonic, path3));

const masterPrivateKey = wallet.privateExtendedKey();
const derivedWallet = wallet.derivePath("m/44'/60'/0'/0/0");
const privateKey = derivedWallet.getWallet().getPrivateKeyString();
const address = ethUtil.privateToAddress(privateKey).toString('hex');

console.log('Private Key:', privateKey); // This is the private key in hexadecimal format
console.log('Address:', address); // This is the public address derived from the private key


// const hdNode = HDNode.fromMnemonic(mnemonic, passphrase).derivePath(utils.defaultPath);
// const HDwallet = new Wallet(hdNode);

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