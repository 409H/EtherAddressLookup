let objBrowser = chrome ? chrome : browser;

class RpcNodeSelector
{

    constructor()
    {
        //No need to do anything here.
    }

    /**
     * Populates the RPC node input box with the current RPC node endpoint.
     */
    populateRpcNodeInput()
    {
        objBrowser.runtime.sendMessage({func: "rpc_provider"}, function(objResponse) {
            document.getElementById("ext-etheraddresslookup-rpcnode_modify_url").value = objResponse.resp;
        });
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
        document.getElementById("ext-etheraddresslookup-rpcnode_eth_version").classList.add("hide-me");
        document.getElementById("ext-etheraddresslookup-rpcnode_api_version").classList.add("hide-me");
        document.getElementById("ext-etheraddresslookup-rpcnode_network_version").classList.add("hide-me");

        var objRpcSuccessNode = document.getElementById("ext-etheraddresslookup-rpcnode_success");
        objRpcSuccessNode.classList.add("hide-me");

        if( RpcNodeSelector.rpcEndpointIsAvailable(objRpcValue.value) ) {
            localStorage.setItem("ext-etheraddresslookup-rpc_node", objRpcValue.value);
        }

        objEvent.preventDefault();

        RpcNodeSelector.updateNodeDetails();

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

        console.log("RPC Node Version: "+ strVersion);
        return true;
    }

    static updateNodeDetails()
    {
        var strWeb3Provider = localStorage.getItem("ext-etheraddresslookup-rpc_node");
        var objWeb3 = new Web3(new Web3.providers.HttpProvider(strWeb3Provider));

        document.getElementById("ext-etheraddresslookup-rpcnode_connected_status").classList.remove("hide-me");
        document.getElementById("ext-etheraddresslookup-rpcnode_eth_version").classList.remove("hide-me");
        document.getElementById("ext-etheraddresslookup-rpcnode_api_version").classList.remove("hide-me");
        document.getElementById("ext-etheraddresslookup-rpcnode_network_version").classList.remove("hide-me");

        var blConnected = objWeb3.isConnected();
        document.getElementById("ext-etheraddresslookup-rpcnode_connected_status").innerHTML = (blConnected ? "CONNECTED" : "DISCONNECTED") + "<br />";
        if(blConnected) {
            document.getElementById("ext-etheraddresslookup-rpcnode_eth_version").innerHTML = "ETH Version: " + objWeb3.version.ethereum +"<br />";
            document.getElementById("ext-etheraddresslookup-rpcnode_api_version").innerHTML = "API Version: " + objWeb3.version.api +"<br />";
            document.getElementById("ext-etheraddresslookup-rpcnode_network_version").innerHTML = "API Version: " + objWeb3.version.network +"<br />";
        }
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