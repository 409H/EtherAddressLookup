const labels = new Labels();

const createExtensionInstance = () => new EtherAddressLookup(Web3, labels);

window.addEventListener("load", function() {
    const objEtherAddressLookup = createExtensionInstance();
});

//Send message from the extension to here.
objBrowser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let objEtherAddressLookup = createExtensionInstance();

        if (typeof request.func !== "undefined") {
            if(typeof objEtherAddressLookup[request.func] == "function") {
                objEtherAddressLookup[request.func]();
                sendResponse({status: "ok"});
                return true;
            }
        }

        sendResponse({status: "fail"});
    }
);
