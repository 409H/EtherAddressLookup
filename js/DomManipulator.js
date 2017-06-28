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
        //Get the highlight option for the user
        chrome.runtime.sendMessage({func: "highlight_option"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                this.blHighlight = (objResponse.resp == 1 ? true : false);
            }
            ++this.intSettingsCount;
        }.bind(this));

        //Update the DOM once all settings have been received...
        setTimeout(function() {
            if(this.intSettingsCount === this.intSettingsTotalCount) {
                this.convertAddressToLink();
            }
        }.bind(this), 1)
    }

    //Finds Ethereum addresses and converts to a link to a block explorer
    convertAddressToLink()
    {
        var arrWhitelistedTags = new Array("code", "span", "p", "td");
        var strRegex = /(?:^|\s)((?:0x)?[0-9a-fA-F]{40})(?:\s|$)/gi;

        //Get the whitelisted nodes
        for(var i=0; i<arrWhitelistedTags.length; i++) {
            var objNodes = document.getElementsByTagName(arrWhitelistedTags[i]);
            //Loop through the whitelisted content
            for(var x=0; x<objNodes.length; x++) {
                var strContent = objNodes[x].innerText;
                if( /((?:0x)?[0-9a-fA-F]{40})/gi.exec(strContent) !== null) {
                    objNodes[x].innerHTML = strContent.replace(
                        new RegExp(strRegex, "gi"),
                        `<a title="See this address on Etherscan" href="https://etherscan.io/address/$1" class="ext-etheraddresslookup-link">$1</a>`
                    );
                }
            }
        }

        if(this.blHighlight) {
            this.addHighlightStyle();
        }
    }

    //Removes the highlight style from Ethereum addresses
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

window.addEventListener("load", function() {
    let objEtherAddressLookup = new EtherAddressLookup();
});

//Send message from the extension to here.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let objEtherAddressLookup = new EtherAddressLookup();
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