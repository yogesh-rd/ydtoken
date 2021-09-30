let web3, eth, accounts, contract, decimals;

const contractAddress = "0x5061abE05ef2b768faA11B3eC83b289c4A333407";

const getWeb3 = () => {
    return new Promise((resolve, reject) => {
        window.addEventListener("load", async () => {
            eth = window.ethereum;
            if (eth) {
                web3 = new Web3(eth);
                try {
                    accounts = await window.ethereum.request({
                        method: "eth_requestAccounts",
                    });
                    resolve(web3);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject("must install MetaMask");
            }
        });
    });
};

async function display() {
    updateBalance();
    updateTotalSupply();
    updateAddress();
}

async function updateBalance() {
    const balance = parseInt(
        await contract.methods.balanceOf(accounts[0]).call()
    );
    $("#balance")[0].textContent = balance / 10 ** decimals;
}

async function updateTotalSupply() {
    const totalSupply = parseInt(await contract.methods.totalSupply().call());
    $("#total-supply")[0].textContent = totalSupply / 10 ** decimals;
}

async function updateAddress() {
    $("#address")[0].textContent = accounts[0];
}

const getContract = async (web3) => {
    const data = await $.getJSON("../build/contracts/YDToken.json");

    const netId = await web3.eth.net.getId();
    const deployedNetwork = data.networks[netId];
    const contract = new web3.eth.Contract(
        data.abi,
        deployedNetwork && deployedNetwork.address
    );

    return contract;
};

const transfer = async () => {
    const amount = Number($("#transfer-amount")[0].value);
    const receiverAddress = $("#receiver")[0].value;
    await contract.methods
        .transfer(receiverAddress, BigInt(amount * 10 ** 18))
        .send({ from: accounts[0], gas: 200000 });
    await updateBalance();
};

const approve = async () => {
    const amount = Number($("#allowance-approval")[0].value);
    const delegateAddress = $("#delegate-approval")[0].value;
    await contract.methods
        .approve(delegateAddress, BigInt(amount * 10 ** decimals))
        .send({ from: accounts[0], gas: 400000 });
};

const check = async () => {
    const delegateAddress = $("#delegate-check")[0].value;
    const amount = (
        await contract.methods.allowance(accounts[0], delegateAddress).call()
    ).toString();
    $("#allowance-check")[0].style.color = "black";
    $("#allowance-check")[0].textContent =
        (amount / 10 ** decimals).toString() + " YDT";
};

const spend = async () => {
    const owner = $("#owner")[0].value;
    const receiver = $("#receiver-behalf")[0].value;
    const amount = Number($("#amount-behalf")[0].value);
    await contract.methods
        .transferFrom(owner, receiver, BigInt(amount * 10 ** decimals))
        .send({ from: accounts[0], gas: 400000 });
    updateBalance();
};

const burn = async () => {
    const amount = Number($("#burn-amount")[0].value);
    await contract.methods
        .burn(BigInt(amount * 10 ** decimals))
        .send({ from: accounts[0], gas: 200000 });
    updateTotalSupply();
    updateBalance();
};

const mint = async () => {
    const receiver = $("#mint-receiver")[0].value;
    const amount = Number($("#mint-amount")[0].value);
    await contract.methods
        .mint(receiver, BigInt(amount * 10 ** decimals))
        .send({ from: accounts[0], gas: 400000 });
    updateTotalSupply();
    updateBalance();
};

async function init() {
    await getWeb3();
    contract = await getContract(web3);
    decimals = await contract.methods.decimals().call();
    display();
    eth.on("accountsChanged", (new_accounts) => {
        accounts = new_accounts;
        updateAddress();
        updateBalance();
    });
}

init();

// const id = setInterval(async () => {
//     updateTotalSupply();
//     console.log("TOTAL SUPPLY UPDATED");
// }, 10000);