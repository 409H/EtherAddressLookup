class EtherAddressLookup {

    constructor()
    {
        this.setDefaultExtensionSettings();
        this.init();
    }

    setDefaultExtensionSettings()
    {
        this.blHighlight = false;
        this.intSettingsCount = 0;
        this.intSettingsTotalCount = 1;
    }

    //Gets extension settings and then converts addresses to links
    init()
    {
        chrome.runtime.sendMessage({func: "highlight_option"}, function(objResponse) {
            console.log(objResponse);
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                this.blHighlight = (objResponse.resp == 1 ? true : false);
            }
            ++this.intSettingsCount;
        }.bind(this));

        //Update the DOM once all settings have been received...
        setTimeout(function() {
            console.log("Settings:" + this.intSettingsCount);
            console.log("Total: "+ this.intSettingsTotalCount);
            if(this.intSettingsCount === this.intSettingsTotalCount) {
                this.convertAddressToLink();
            }
        }.bind(this), 500)
    }

    //Finds Ethereum addresses and converts to a link to a block explorer
    convertAddressToLink()
    {
        document.body.innerHTML = document.body.innerHTML.replace(
            new RegExp("(?!.*\")(0[xX][0-9a-fA-F]{40})(?!\")(!?<\s|\<|$)", "g"),
            `<a title="See this address on Etherscan" href="https://etherscan.io/address/$1" class="ext-etheraddresslookup-link">$1</a>$2`
        );

        if(this.blHighlight) {
            this.addHighlightStyle();
        }
    }
    //Removes the highlight style
    removeHighlightStyle()
    {
        var objEtherAddresses = document.getElementsByClassName("ext-etheraddresslookup-link");
        for (var i = 0; i < objEtherAddresses.length; i++) {
            objEtherAddresses[i].classList.add("ext-etheraddresslookup-link-no_highlight");
            objEtherAddresses[i].classList.add("ext-etheraddresslookup-link-highlight");
        }
        return false;
    }

    //Adds the highlight style
    addHighlightStyle()
    {
        var objEtherAddresses = document.getElementsByClassName("ext-etheraddresslookup-link");
        for (var i = 0; i < objEtherAddresses.length; i++) {
            objEtherAddresses[i].classList.add("ext-etheraddresslookup-link-highlight");
            objEtherAddresses[i].classList.remove("ext-etheraddresslookup-link-no_highlight");
        }
        return false;
    }
}

let objEtherAddressLookup = new EtherAddressLookup();

//Send message from the extension to here.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(typeof request.func !== "undefined") {
            if(typeof objEtherAddressLookup[request.func] == "function") {
                objEtherAddressLookup[request.func]();
                sendResponse({status: "ok"});
                return true;
            }
        }
        sendResponse({status: "fail"});
    }
);