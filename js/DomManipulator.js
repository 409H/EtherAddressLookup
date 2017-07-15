let objBrowser = chrome ? chrome : browser;

class EtherAddressLookup {

    constructor()
    {
        console.log("Init");
        this.setDefaultExtensionSettings();
        this.init();
    }

    levenshtein(a, b) {
        if(a.length == 0) return b.length;
        if(b.length == 0) return a.length;

        // swap to save some memory O(min(a,b)) instead of O(a)
        if(a.length > b.length) {
            var tmp = a;
            a = b;
            b = tmp;
        }

        var row = [];
        // init the row
        for(var i = 0; i <= a.length; i++){
            row[i] = i;
        }

        // fill in the rest
        for(var i = 1; i <= b.length; i++){
            var prev = i;
            for(var j = 1; j <= a.length; j++){
                var val;
                if(b.charAt(i-1) == a.charAt(j-1)){
                    val = row[j-1]; // match
                } else {
                    val = Math.min(row[j-1] + 1, // substitution
                        prev + 1,     // insertion
                        row[j] + 1);  // deletion
                }
                row[j - 1] = prev;
                prev = val;
            }
            row[a.length] = prev;
        }

        return row[a.length];
    }

    setDefaultExtensionSettings()
    {
        this.blHighlight = false;
        this.blBlacklistDomains = true;
        this.strBlockchainExplorer = "https://etherscan.io/address";

        this.intSettingsCount = 0;
        this.intSettingsTotalCount = 3;
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

        //Get the blacklist domains option for the user
        objBrowser.runtime.sendMessage({func: "blacklist_domains"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                this.blBlacklistDomains = (objResponse.resp == 1 ? true : false);
            }
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
        }.bind(this), 100)
    }

    //Finds Ethereum addresses and converts to a link to a block explorer
    convertAddressToLink()
    {
        var arrWhitelistedTags = new Array("code", "span", "p", "td", "li", "em", "i", "b", "strong");
        var strRegex = /(^|\s|:|-)((?:0x)?[0-9a-fA-F]{40})(?:\s|$)/gi;

        //Get the whitelisted nodes
        for(var i=0; i<arrWhitelistedTags.length; i++) {
            var objNodes = document.getElementsByTagName(arrWhitelistedTags[i]);
            //Loop through the whitelisted content
            for(var x=0; x<objNodes.length; x++) {
                var strContent = objNodes[x].innerHTML;
                if( /((?:0x)?[0-9a-fA-F]{40})/gi.exec(strContent) !== null) {
                    objNodes[x].innerHTML = strContent.replace(
                        new RegExp(strRegex, "gi"),
                        '$1<a title="See this address on the blockchain explorer" href="'+ this.strBlockchainExplorer +'/$2" class="ext-etheraddresslookup-link" target="_blank">$2</a>'
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

    //Detects if the current tab is in the blacklisted domains file
    blacklistedDomainCheck()
    {
        let objBrowser = chrome ? chrome : browser;
        var self = this;
        var arrBlacklistedDomains = [];
        var arrWhitelistedDomains = ["www.myetherwallet.com", "myetherwallet.com"];
        objBrowser.runtime.sendMessage({func: "blacklist_domain_list"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                arrBlacklistedDomains = objResponse.resp;
            }
        }.bind(arrBlacklistedDomains));

        objBrowser.runtime.sendMessage({func: "whitelist_domain_list"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                arrWhitelistedDomains = objResponse.resp;
            }
        }.bind(arrWhitelistedDomains));

        setTimeout(function() {
            if(arrBlacklistedDomains.length > 0) {
                var strCurrentTab = window.location.hostname;

                //Domain is whitelisted, don't check the blacklist.
                if(arrWhitelistedDomains.includes(strCurrentTab)) {
                    console.log("Domain "+ strCurrentTab +" is whitelisted on EAL!");
                    return;
                }

                //Levenshtien - @sogoiii
                var isBlacklisted = arrBlacklistedDomains.includes(strCurrentTab);
                var source = strCurrentTab.replace(/\./g,'');
                var intHolisticMetric = self.levenshtein(source, 'myetherwallet');
                var intHolisticLimit = 7 // How different can the word be?
                var blHolisticStatus = (intHolisticMetric > 0 && intHolisticMetric < intHolisticLimit) ? true : false;

                if (isBlacklisted || blHolisticStatus ) {
                    window.location.href = "https://harrydenley.com/EtherAddressLookup/phishing.html";
                }
            }
        }.bind(arrBlacklistedDomains), 500)
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
