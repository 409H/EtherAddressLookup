//On page load it selects the default blockchain explorer
(function() {
    refreshBlockchainExplorer();
})();

//Sets the local storage to remember their match favourite blockchain explorer
function toggleBlockchainExplorer() {
    var objBlockchainExplorer = document.getElementById("ext-etheraddresslookup-choose_blockchain");
    localStorage.setItem("ext-etheraddresslookup-blockchain_explorer", objBlockchainExplorer.options[objBlockchainExplorer.selectedIndex].value);
    refreshBlockchainExplorer();
}

function refreshBlockchainExplorer() {
    var strBlockchainExplorer = localStorage.getItem("ext-etheraddresslookup-blockchain_explorer");

    if(strBlockchainExplorer === null) {
        document.getElementById("ext-etheraddresslookup-choose_blockchain").value = "https://etherscan.io/address";
    } else {
        document.getElementById("ext-etheraddresslookup-choose_blockchain").value = strBlockchainExplorer;
    }

    //Notify the tab to do a class method
    var strMethod = "changeBlockchainExplorer";
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            "func":strMethod
        }, function(response) {
            console.log(response);
        });
    });
}