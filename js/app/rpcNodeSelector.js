let objBrowser = chrome ? chrome : browser;

const ETH_NETWORK_MAP = [
    {
        "network_id": 1,
        "chain_id": 1,
        "name": "MAINNET",
        "type": "ETH"
    }, 
    {
        "network_id": 3,
        "chain_id": 3,
        "name": "ROPSTEN",
        "type": "ETH"
    },
    {
        "network_id": 4,
        "chain_id": 4,
        "name": "RINKEBY",
        "type": "ETH"
    },
    {
        "network_id": 5,
        "chain_id": 5,
        "name": "GORLI",
        "type": "ETH"
    },    
    {
        "network_id": 6,
        "chain_id": 6,
        "name": "KOTTI",
        "type": "ETC"
    },
    {
        "network_id": 775,
        "chain_id": 30,
        "name": "MAINNET",
        "type": "RSK"
    },
    {
        "network_id": 8052,
        "chain_id": 31,
        "name": "TESTNET",
        "type": "RSK"
    },      
    {
        "network_id": 42,
        "chain_id": 42,
        "name": "KOVAN",
        "type": "ETH"
    },  
    {
        "network_id": 2,
        "chain_id": 62,
        "name": "TESTNET",
        "type": "ETC"
    },
    {
        "network_id": 88,
        "chain_id": 88,
        "name": "MAINNET",
        "type": "TOMO"
    },
    {
        "network_id": 99,
        "chain_id": 2,
        "name": "CORE",
        "type": "POA"
    }   
];

let LOCALSTORAGE_IDENTIFER = {
    "DETAILS": "ext-etheraddresslookup-rpc_node_details",
    "ENDPOINT": "ext-etheraddresslookup-rpc_node"
}

class RpcNodeSelector
{
    constructor()
    {
        //No need to do anything here.
    }

    static getCurrentNetworkDescription()
    {
        if(localStorage.getItem(LOCALSTORAGE_IDENTIFER.DETAILS)) {
            let objDetails = JSON.parse(localStorage.getItem(LOCALSTORAGE_IDENTIFER.DETAILS));
            document.getElementById("ext-etheraddresslookup-rpcnode_current_details").innerText = `You are currently connected to: ${[objDetails.name, objDetails.type].join(" ")}`
        }
    }

    /**
     * Populates the RPC node input box with the current RPC node endpoint.
     */
    populateRpcNodeInput()
    {
        objBrowser.runtime.sendMessage({func: "rpc_provider"}, function(objResponse) {
            document.getElementById("ext-etheraddresslookup-rpcnode_modify_url").value = objResponse.resp;
        });

        RpcNodeSelector.getCurrentNetworkDescription();
    }

    resetFormValues(objEvent)
    {
        objBrowser.runtime.sendMessage({func: "rpc_default_provider"}, function(objResponse) {
            document.getElementById("ext-etheraddresslookup-rpcnode_modify_url").value = objResponse.resp;
        });

        objEvent.preventDefault();
    }

    saveFormValues(objEvent)
    {
        var objRpcValue = document.getElementById("ext-etheraddresslookup-rpcnode_modify_url");

        document.getElementById("ext-etheraddresslookup-rpcnode_connected_status").classList.add("hide-me");
        document.getElementById("ext-etheraddresslookup-rpcnode_details").classList.add("hide-me");

        var objRpcSuccessNode = document.getElementById("ext-etheraddresslookup-rpcnode_success");
        objRpcSuccessNode.classList.add("hide-me");

        if( RpcNodeSelector.rpcEndpointIsAvailable(objRpcValue.value) ) {
            localStorage.setItem(LOCALSTORAGE_IDENTIFER.ENDPOINT, objRpcValue.value);
        }

        objEvent.preventDefault();

        RpcNodeSelector.updateNodeDetails();
        RpcNodeSelector.getCurrentNetworkDescription();

        return false;
    }

    static rpcEndpointIsAvailable(strHttpProvider)
    {
        var objWeb3 = new Web3(new Web3.providers.HttpProvider(strHttpProvider));
        var objRpcErrorNode = document.getElementById("ext-etheraddresslookup-rpcnode_errors");
        objRpcErrorNode.innerText = "";
        objRpcErrorNode.classList.add("hide-me");

        try {
            var strVersion = objWeb3.version.ethereum;
        } catch (objException) {
            objRpcErrorNode.innerText = objException.message;
            objRpcErrorNode.classList.remove("hide-me");
            return false;
        }

        var objRpcSuccessNode = document.getElementById("ext-etheraddresslookup-rpcnode_success");
        objRpcSuccessNode.classList.remove("hide-me");

        return true;
    }

    static updateNodeDetails()
    {
        var strWeb3Provider = localStorage.getItem(LOCALSTORAGE_IDENTIFER.ENDPOINT);
        var objWeb3 = new Web3(new Web3.providers.HttpProvider(strWeb3Provider));

        document.getElementById("ext-etheraddresslookup-rpcnode_connected_status").classList.remove("hide-me");
        document.getElementById("ext-etheraddresslookup-rpcnode_details").classList.remove("hide-me");

        var blConnected = objWeb3.isConnected();
        document.getElementById("ext-etheraddresslookup-rpcnode_connected_status").innerHTML = (blConnected ? "CONNECTED" : "DISCONNECTED") + "<br />";
        if(blConnected) {
            document.getElementById("ext-etheraddresslookup-rpcnode_details").innerHTML = `
                ETH Version: ${objWeb3.version.ethereum}<br />
                API Version: ${objWeb3.version.api}<br />
            `;
        }

        const intNetworkId = parseInt(objWeb3.version.network);
        let arrNetwork = ETH_NETWORK_MAP.filter(v => v.network_id === intNetworkId)
        document.getElementById("ext-etheraddresslookup-rpcnode_details").innerHTML += `
            Network: ${arrNetwork[0].name} (${arrNetwork[0].type})
        `;

        // Set the LocalStorage so we can remind them on address hover
        localStorage.setItem(LOCALSTORAGE_IDENTIFER.DETAILS, JSON.stringify(arrNetwork[0]));
    }

}

//On page load do everything.
(function() {
    let objRpcNodeSelector = new RpcNodeSelector();
    objRpcNodeSelector.populateRpcNodeInput();

    var objForm = document.getElementById("ext-etheraddresslookup-rpcnode_modify_form");
    objForm.addEventListener("reset", objRpcNodeSelector.resetFormValues, true);
    objForm.addEventListener("submit", objRpcNodeSelector.saveFormValues, true);
})();