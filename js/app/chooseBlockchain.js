const ETHEREUM_NETWORK_IDS = { //As per https://ethereum.stackexchange.com/a/17101/8198
    0: "Olympic",
    1: "Mainnet",
    2: "Morden",
    3: "Ropsten",
    4: "Rinkeby",
    5: "Goerli",
    8: "Ubiq",
    42: "Kovan",
    77: "Sokol",
    99: "Core",
    100: "xDai",
    401697: "Tobalaba",
    7762959: "Musicoin"
};

var LS = {
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
};

//On page load it selects the default blockchain explorer
(function() {
    refreshBlockchainExplorer();
})();

//Sets the local storage to remember their match favourite blockchain explorer
async function toggleBlockchainExplorer() {
    var objBlockchainExplorer = document.getElementById("ext-etheraddresslookup-choose_blockchain");
    await LS.setItem("ext-etheraddresslookup-blockchain_explorer", objBlockchainExplorer.options[objBlockchainExplorer.selectedIndex].value);

    // See if the node is on a different network
    let intNetworkId = objBlockchainExplorer.options[objBlockchainExplorer.selectedIndex].dataset.network;
    var objBrowser = chrome || browser;

    chrome.runtime.sendMessage({ func: "rpc_provider" }, (objResponse) => {
        chrome.runtime.lastError;
        web3 = new Web3(new Web3.providers.HttpProvider(objResponse.resp)); 
        let intWeb3NetworkId = web3.version.network;

        if(intWeb3NetworkId !== intNetworkId) {
            document.querySelector(".ext-etheraddresslookup-note_network_diff").style.display = "block";
            document.querySelector(".ext-etheraddresslookup-note_network_diff").innerHTML = `
                <strong>NOTE:</strong> Your node is on a different network to your preferred blockchain explorer!
            `;

            if(ETHEREUM_NETWORK_IDS.hasOwnProperty(intWeb3NetworkId)) {
                document.querySelector(".ext-etheraddresslookup-note_network_diff").innerHTML += `
                    Your node is pointing to <strong>${ETHEREUM_NETWORK_IDS[intWeb3NetworkId]}</strong>
                `;
            }
        } else {
            document.querySelector(".ext-etheraddresslookup-note_network_diff").style.display = "none";
            document.querySelector(".ext-etheraddresslookup-note_network_diff").innerHTML = ``;
        }
    });


    refreshBlockchainExplorer();
}

async function refreshBlockchainExplorer() {
    var strBlockchainExplorer = await LS.getItem("ext-etheraddresslookup-blockchain_explorer");

    if(!strBlockchainExplorer) {
        document.getElementById("ext-etheraddresslookup-choose_blockchain").value = "https://etherscan.io/address";
    } else {
        document.getElementById("ext-etheraddresslookup-choose_blockchain").value = strBlockchainExplorer;
    }

    //Notify the tab to do a class method
    var strMethod = "changeBlockchainExplorer";
    var objBrowser = chrome || browser;
    objBrowser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.runtime.lastError;
        objBrowser.tabs.sendMessage(tabs[0].id, {
            "func":strMethod
        }, function(objResponse) {
            chrome.runtime.lastError;
            if(objResponse && objResponse.status) {
                console.log("Response from tab: " + objResponse.status);
            } else {
                console.log("Cannot "+ strMethod +" on tab.");
            }
        });
    });
}