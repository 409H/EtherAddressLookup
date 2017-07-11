class EtherAddressLookup {

    constructor()
    {
        this.setDefaultExtensionSettings();
        this.init();
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
        //Get the highlight option for the user
        chrome.runtime.sendMessage({func: "highlight_option"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                this.blHighlight = (objResponse.resp == 1 ? true : false);
            }
            ++this.intSettingsCount;
        }.bind(this));

        //Get the blockchain explorer for the user
        chrome.runtime.sendMessage({func: "blockchain_explorer"}, function(objResponse) {
            this.strBlockchainExplorer = objResponse.resp;
            ++this.intSettingsCount;
        }.bind(this));

        //Get the blacklist domains option for the user
        chrome.runtime.sendMessage({func: "blacklist_domains"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                this.blBlacklistDomains = (objResponse.resp == 1 ? true : false);
            }
            ++this.intSettingsCount;
        }.bind(this));

        //Update the DOM once all settings have been received...
        setTimeout(function() {
            if(this.intSettingsCount === this.intSettingsTotalCount) {
                if(this.blBlacklistDomains) {
                    this.blacklistedDomainCheck();
                }
                this.convertAddressToLink();
            }
        }.bind(this), 1)
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
        var arrBlacklistedDomains = [];
        chrome.runtime.sendMessage({func: "blacklist_domain_list"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                arrBlacklistedDomains = objResponse.resp;
            }
        }.bind(arrBlacklistedDomains));

        setTimeout(function() {
            if(arrBlacklistedDomains.length > 0) {
                var strCurrentTab = window.location.hostname;
                if (arrBlacklistedDomains.includes(strCurrentTab)) {
                    document.body.innerHTML = ""; //Clear the DOM.
                    document.body.cssText = "margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline;font-family:arial,sans-serif";
                    var objBlacklistedDomain = document.createElement("div");
                    objBlacklistedDomain.style.cssText = "position:absolute;top:0%;left:0%;width:100%;height:100%;background:#00c2c1;color:#fff;text-align:center;font-size:100%;"

                    var objBlacklistedDomainText = document.createElement("div");
                    objBlacklistedDomainText.style.cssText = "margin-left:auto;margin-right:auto;width:50%;padding:5%;margin-top:5%;";
                    objBlacklistedDomainText.innerHTML = "<img src='https://github.com/409H/EtherAddressLookup/raw/master/images/icon.png?raw=true' style='margin-left:auto;margin-right:auto;margin-bottom:1.5em'/>" +
                        "<br /><h3 style='font-size:130%;font-weight:800;'>ATTENTION</h3>We have detected this domain to have malicious " +
                        "intent and have prevented you from interacting with it.<br /><br /><br />" +
                        "<div style='margin-left:auto;margin-right:auto;width:50%'>" +
                        "<span style='font-size:10pt;'>This is because you have enabled <em>'Warn of blacklisted domains'</em> setting on EtherAddressLookup Chrome " +
                        "Extension. You can turn this setting off to interact with this site but it's advised not to." +
                        "<br /><br />We blacklisted it for a reason.</span></div>";
                    objBlacklistedDomainText.innerHTML += "<br /><span style='font-size:10pt;'>You can donate to this " +
                        "address if you want to: 0x661b5dc032bedb210f225df4b1aa2bdd669b38bc</span>";

                    objBlacklistedDomain.appendChild(objBlacklistedDomainText);
                    document.body.appendChild(objBlacklistedDomain);
                }
            }
        }.bind(arrBlacklistedDomains), 500)
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