let objBrowser = chrome ? chrome : browser;
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
    var objManifest = objBrowser.runtime.getManifest();
    var objManifestVersion = document.getElementById('ext-manifest_version');
    if(objManifestVersion) {
        objManifestVersion.innerHTML = objManifest.version;
    }

    //init getting blacklisted domains
    getBlacklistedDomains();
    setInterval(function() {
        console.log("Re-caching blacklisted domains");
        getBlacklistedDomains();
    }, 180000);

    getWhitelistedDomains();
    setInterval(function() {
        console.log("Re-caching whitelisted domains");
        getWhitelistedDomains();
    }, 180000);
})();

objBrowser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var strOption = request.func;
        var strResponse = "";

        switch(strOption) {
            case 'highlight_option' :
                strResponse = localStorage.getItem("ext-etheraddresslookup-show_style");
                break;
            case 'blockchain_explorer' :
                strResponse = localStorage.getItem("ext-etheraddresslookup-blockchain_explorer");
                if(strResponse === null) {
                    strResponse = "https://etherscan.io/address";
                }
                break;
            case 'blacklist_domains' :
                //This option is enabled by default
                if(localStorage.getItem("ext-etheraddresslookup-blacklist_domains") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-etheraddresslookup-blacklist_domains");
                }
                break;
            case 'blacklist_domain_list' :
                console.log("Getting blacklisted domain list");
                strResponse = getBlacklistedDomains();
                break;
            case 'whitelist_domain_list' :
                console.log("Getting whitelisted domain list");
                strResponse = getWhitelistedDomains();
                break;
            case 'rpc_provider' :
                    strResponse = "https://instantly-clear-sloth.quiknode.io/fc551b4e-b3bf-4b0b-b438-aeb6c9c311f5/pF749Rxn3Mn8vgaCD4FM_A==/";
                break;
            default:
                strResponse = "unsupported";
                break;
        }

        sendResponse({resp:strResponse});
    }
);

//@todo - make these nicer and so they're not duplicated
function getBlacklistedDomains()
{
    var objBlacklistedDomains = {"timestamp":0,"domains":[]};
    //See if we need to get the blacklisted domains - ie: do we have them cached?
    if(localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list") === null) {
        objBlacklistedDomains = getBlacklistedDomainsFromSource();
    } else {
        var objBlacklistedDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list");
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
        console.log("Domains last fetched: " + (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) + " seconds ago");
        if ((Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) > 180) {
            console.log("Caching blacklisted domains again.");
            objBlacklistedDomains = getBlacklistedDomainsFromSource();
        }
    }

    return objBlacklistedDomains.domains;
}

function getWhitelistedDomains()
{
    var objWhitelistedDomains = {"timestamp":0,"domains":[]};
    //See if we need to get the blacklisted domains - ie: do we have them cached?
    if(localStorage.getItem("ext-etheraddresslookup-whitelist_domains_list") === null) {
        objWhitelistedDomains = getWhitelistedDomainsFromSource();
    } else {
        var objWhitelistedDomains = localStorage.getItem("ext-etheraddresslookup-whitelist_domains_list");
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objWhitelistedDomains = JSON.parse(objWhitelistedDomains);
        console.log("Whitelisted domains last fetched: " + (Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) + " seconds ago");
        if ((Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) > 180) {
            console.log("Caching blacklisted domains again.");
            objWhitelistedDomains = getWhitelistedDomainsFromSource();
        }
    }

    return objWhitelistedDomains.domains;
}

function getBlacklistedDomainsFromSource()
{
    console.log("Getting blacklist from GitHub now");
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

function getWhitelistedDomainsFromSource()
{
    console.log("Getting whitelist from GitHub now");
    var objAjax = new XMLHttpRequest();
    objAjax.open("GET", "https://raw.githubusercontent.com/409H/EtherAddressLookup/master/whitelists/domains.json", true);
    objAjax.send();
    objAjax.onreadystatechange = function () {
        if (objAjax.readyState === 4) {
            var arrWhitelistedDomains = JSON.parse(objAjax.responseText);
            var objWhitelist = {};
            objWhitelist.timestamp = Math.floor(Date.now() / 1000);
            objWhitelist.domains = arrWhitelistedDomains;
            localStorage.setItem("ext-etheraddresslookup-whitelist_domains_list", JSON.stringify(objWhitelist));
            return objWhitelist;
        }
    }
    return {"timestamp":0,"domains":[]};
}