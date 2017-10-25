let objBrowser = chrome ? chrome : browser;

class EtherAddressLookup {

    constructor()
    {
        console.log("Init EAL");

        this.setDefaultExtensionSettings();
        this.setSearchAndReplaceSettings();
        this.init();
    }

    setDefaultExtensionSettings()
    {
        this.blHighlight = false;
        this.strBlockchainExplorer = "https://etherscan.io/address";

        this.intSettingsCount = 0;
        this.intSettingsTotalCount = 2;
    }

    setSearchAndReplaceSettings()
    {
        // Check user is on their favourite block explorer
        // If we are on our favourite blockchain explorer, don't target blank.
        this.onBlockchainExplorer = this.onBlockchainExplorer();
        this.target = (this.onBlockchainExplorer ? '_self' : '_blank');

        // Set RegExs
        this.ethereumAddressRegex = new RegExp(/(^|\s|:|-)((?:0x)[0-9a-fA-F]{40})(?:\s|$)/gi, "gi");
        this.ENSAddressRegex = new RegExp(/(\s|^|\.|\"|\'|\>)([a-z0-9][a-z0-9-\.]+[a-z0-9](?:.eth))(\s|$|\.|\"|\'|\<)/gim, "gim");

        // Set string substitutions
        this.ethereumAddressReplace = '$1<a title="See this address on the blockchain explorer" ' +
            'href="' + this.strBlockchainExplorer + '/$2" ' +
            'class="ext-etheraddresslookup-link" ' +
            'target="'+ this.target +'">$2</a>';
        this.ENSAddressReplace = '$1<a title="See this address on the blockchain explorer" ' +
            'href="' + this.strBlockchainExplorer + '/$2" ' +
            'class="ext-etheraddresslookup-link" ' +
            'target="'+ this.target +'">$2</a>$3';
    }

    //Gets extension settings and then converts addresses to links
    init()
    {
        let objBrowser = chrome ? chrome : browser;
        //Get the highlight option for the user
        objBrowser.runtime.sendMessage({func: "highlight_option"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                this.blHighlight = (objResponse.resp == 1 ? true : false);
            }
            ++this.intSettingsCount;
        }.bind(this));

        //Get the blockchain explorer for the user
        objBrowser.runtime.sendMessage({func: "blockchain_explorer"}, function(objResponse) {
            this.strBlockchainExplorer = objResponse.resp;
            ++this.intSettingsCount;
        }.bind(this));

        //Update the DOM once all settings have been received...
        setTimeout(function() {
            if(true || this.intSettingsCount === this.intSettingsTotalCount) {
                if(this.blBlacklistDomains) {
                    this.blacklistedDomainCheck();
                }
                this.convertAddressToLink();
            }
        }.bind(this), 10)
    }

    //Finds Ethereum addresses and converts to a link to a block explorer
    convertAddressToLink()
    {
        var arrWhitelistedTags = ["code", "span", "p", "td", "li", "em", "i", "b", "strong", "small"];

        //Get the whitelisted nodes
        for(var i=0; i<arrWhitelistedTags.length; i++) {
            var objNodes = document.getElementsByTagName(arrWhitelistedTags[i]);
            //Loop through the whitelisted content
            for(var x=0; x<objNodes.length; x++) {

                this.convertEthereumAddress(objNodes, x);
                this.convertENSAddress(objNodes, x);

            }
        }

        if(this.blHighlight) {
            this.addHighlightStyle();
        }
    }

    convertEthereumAddress(objNodes, index)
    {
        this.convertAddress(
            objNodes, index, /((?:0x)[0-9a-fA-F]{40})/gi, this.ethereumAddressRegex, this.ethereumAddressReplace
        );
    }

    convertENSAddress(objNodes, index)
    {
        this.convertAddress(
            objNodes, index, this.ENSAddressRegex, this.ENSAddressRegex, this.ENSAddressReplace
        );
    }

    convertAddress(objNodes, index, checkRegex, replaceRegex, replacePattern)
    {
        var strContent = objNodes[index].innerHTML;
        if( checkRegex.exec(strContent) !== null) {
            objNodes[index].innerHTML = strContent.replace(replaceRegex, replacePattern);
        }
    }

    onBlockchainExplorer()
    {
        var objBlockchainExplorer = document.createElement("a");
        objBlockchainExplorer.href = this.strBlockchainExplorer;
        return objBlockchainExplorer.hostname === window.location.hostname;
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
objBrowser.runtime.onMessage.addListener(
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
