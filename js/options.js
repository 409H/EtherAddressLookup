(function() {
    //Toggle the highlight option and set it in LocalStorage
    var objOptionAddHighlight = document.getElementById('ext-etheraddresslookup-show_style');
    if(objOptionAddHighlight) {
        objOptionAddHighlight.addEventListener('click', toggleMatchHighlight);
    }

    //Select the blockchain explorer set it in LocalStorage
    var objOptionBlockchainExplorer = document.getElementById('ext-etheraddresslookup-choose_blockchain');
    if(objOptionBlockchainExplorer) {
        objOptionBlockchainExplorer.addEventListener('change', toggleBlockchainExplorer);
    }

    //Toggle the blacklist domains option and set it in LocalStorage
    var objBlacklistDomains = document.getElementById('ext-etheraddresslookup-blacklist_domains');
    if(objBlacklistDomains) {
        objBlacklistDomains.addEventListener('click', toggleBlacklistDomains);
    }

    //Get the extension version
    var objManifest = chrome.runtime.getManifest();
    var objManifestVersion = document.getElementById('ext-manifest_version');
    if(objManifestVersion) {
        objManifestVersion.innerHTML = objManifest.version;
    }
})();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var strOption = request.func;
        var strResponse = "";

        switch(strOption) {
            case 'highlight_option' :
                strResponse = localStorage.getItem("ext-etheraddresslookup-show_style");
                break;
            case 'blockchain_explorer' :
                strResponse = localStorage.getItem("ext-etheraddresslookup-blockchain_explorer");
                break;
            case 'blacklist_domains' :
                strResponse = localStorage.getItem("ext-etheraddresslookup-blacklist_domains");
                break;
            case 'blacklist_domain_list' :
                console.log("Getting domain list");
                    var objBlacklistedDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list");
                    if(objBlacklistedDomains === null) {
                        //We haven't cached the blacklisted domains yet, let's do it.
                        console.log("Fetching new domain list");
                        objBlacklistedDomains = getBlacklistedDomainsFromSource();
                        strResponse = objBlacklistedDomains.domains;
                    } else {
                        //Check to see if the cache is older than 5 minutes, if so re-cache it.
                        objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
                        console.log("Domains last fetched: "+ (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) +" seconds ago");
                        if( (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) > 180 ) {
                            console.log("Caching blacklisted domains again.");
                            objBlacklistedDomains = getBlacklistedDomainsFromSource();
                        }
                    }
                strResponse = objBlacklistedDomains.domains;
                break;
            default:
                strResponse = "unsupported";
                break;
        }

        sendResponse({resp:strResponse});
    }
);

function getBlacklistedDomainsFromSource()
{
    var objAjax = new XMLHttpRequest();
    objAjax.open("GET", "https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/domains.json", true);
    objAjax.send();
    objAjax.onreadystatechange = function () {
        if (objAjax.readyState === 4) {
            var arrBlacklistedDomains = JSON.parse(objAjax.responseText);
            var objBlacklist = {};
            objBlacklist.timestamp = Math.floor(Date.now() / 1000);
            objBlacklist.domains = arrBlacklistedDomains;
            localStorage.setItem("ext-etheraddresslookup-blacklist_domains_list", JSON.stringify(objBlacklist));
            return objBlacklist;
        }
    }
    return {"timestamp":0,"domains":[]};
}