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
    const recipientAddress = $("#recipient")[0].value;
    await contract.methods
        .transfer(recipientAddress, BigInt(amount * 10 ** 18))
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
    const recipient = $("#recipient-behalf")[0].value;
    const amount = Number($("#amount-behalf")[0].value);
    await contract.methods
        .transferFrom(owner, recipient, BigInt(amount * 10 ** decimals))
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
    const recipient = $("#mint-recipient")[0].value;
    const amount = Number($("#mint-amount")[0].value);
    await contract.methods
        .mint(recipient, BigInt(amount * 10 ** decimals))
        .send({ from: accounts[0], gas: 400000 });
    updateTotalSupply();
    updateBalance();
};

$("#buy-amount").keyup(() => {
    $("#eth-cost")[0].textContent = $("#buy-amount")[0].value / 1000;
});

$("#sell-amount").keyup(() => {
    $("#sell-price")[0].textContent = (
        $("#sell-amount")[0].value / 1010
    ).toFixed(4);
});

const buy = async () => {
    const amount = $("#eth-cost")[0].textContent;
    await contract.methods.buy().send({
        from: accounts[0],
        gasPrice: web3.utils.toHex(20000000000),
        gas: web3.utils.toHex(60000),
        value: web3.utils.toHex(web3.utils.toWei(amount, "ether")),
    });
    updateBalance();
};

const sell = async () => {
    const amount = $("#sell-amount")[0].value;
    await contract.methods.sell(BigInt(amount * 10 ** decimals)).send({
        from: accounts[0],
        gasPrice: web3.utils.toHex(20000000000),
        gas: web3.utils.toHex(60000),
    });
};

async function init() {
    await getWeb3();
    contract = await getContract(web3);
    decimals = await contract.methods.decimals().call();
    display();
    if ($("#buy-amount").value != "") {
        $("#eth-cost")[0].textContent = $("#buy-amount")[0].value / 1000;
    }
    if ($("#sell-amount").value != "") {
        $("#sell-price")[0].textContent = (
            $("#sell-amount")[0].value / 1020
        ).toFixed(4);
    }
    eth.on("accountsChanged", (new_accounts) => {
        accounts = new_accounts;
        updateAddress();
        updateBalance();
    });
}

init();

const id = setInterval(async () => {
    updateTotalSupply();
    updateBalance();
}, 5000);
