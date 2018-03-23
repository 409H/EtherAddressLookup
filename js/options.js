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

    //Toggle the address lookups option and set it in LocalStorage
    var objAddressLookups = document.getElementById('ext-etheraddresslookup-perform_address_lookups');
    if(objAddressLookups) {
        objAddressLookups.addEventListener('click', togglePerformAddressLookups);
    }

    //Toggle the blacklist domains option and set it in LocalStorage
    var objBlacklistDomains = document.getElementById('ext-etheraddresslookup-blacklist_domains');
    if(objBlacklistDomains) {
        objBlacklistDomains.addEventListener('click', toggleBlacklistDomains);
    }

    //Toggle the use 3rd party blacklist domains option and set it in LocalStorage
    var objBlacklistDomains = document.getElementById('ext-etheraddresslookup-3rd_party_blacklist_domains');
    if(objBlacklistDomains) {
        objBlacklistDomains.addEventListener('click', toggle3rdPartyBlacklistDomains);
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
        consoleLogger.log("Re-caching blacklisted domains");
        getBlacklistedDomains();
    }, 180000);

    getWhitelistedDomains();
    setInterval(function() {
        consoleLogger.log("Re-caching whitelisted domains");
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
            case '3rd_party_blacklist_domains' :
                //This option is enabled by defailt
                if(localStorage.getItem("ext-etheraddresslookup-3rd_party_blacklist_domains") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-etheraddresslookup-3rd_party_blacklist_domains");
                }
                break;
            case 'blacklist_domain_list' :
                consoleLogger.log("Getting blacklisted domain list");
                strResponse = getBlacklistedDomains("eal");
                break;
            case '3p_blacklist_domain_list' :
                consoleLogger.log("Getting 3p blacklisted domain list");
                strResponse = getBlacklistedDomains("3p");
                break;
            case 'use_3rd_party_blacklists' :
                //This option is enabled by default
                if(localStorage.getItem("ext-etheraddresslookup-use_3rd_party_blacklist") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-etheraddresslookup-use_3rd_party_blacklist");
                }
                break;
            case 'whitelist_domain_list' :
                consoleLogger.log("Getting whitelisted domain list");
                strResponse = getWhitelistedDomains();
                break;
            case 'rpc_provider' :
                    if(localStorage.getItem("ext-etheraddresslookup-rpc_node") === null) {
                        strResponse = "https://freely-central-lark.quiknode.io/9fe4c4a0-2ea2-4ac1-ab64-f92990cd2914/118-xxADc8hKSSB9joCb-g==/";
                    } else {
                        strResponse = localStorage.getItem("ext-etheraddresslookup-rpc_node");
                    }
                break;
            case 'rpc_default_provider' :
                strResponse = "https://freely-central-lark.quiknode.io/9fe4c4a0-2ea2-4ac1-ab64-f92990cd2914/118-xxADc8hKSSB9joCb-g==/";
                break;
            case 'perform_address_lookups' :
                //This option is enabled by default
                if(localStorage.getItem("ext-etheraddresslookup-perform_address_lookups") === null) {
                    strResponse = 1;
                } else {
                    strResponse = localStorage.getItem("ext-etheraddresslookup-perform_address_lookups");
                }
                break;
            case 'blacklist_whitelist_domain_list' :
                var objDomainLists = {"blacklist": "", "whitelist": ""};
                var objBlacklist = JSON.parse(getBlacklistedDomains("eal"));
                objDomainLists.blacklist = objBlacklist.domains;
                objDomainLists.whitelist = getWhitelistedDomains();
                strResponse = JSON.stringify(objDomainLists);
                break;
            default:
                strResponse = "unsupported";
                break;
        }

        sendResponse({resp:strResponse});
    }
);

function getBlacklistedDomains(strType)
{
    var objEalBlacklistedDomains = {
        "eal": {
            "timestamp": 0,
            "domains": [],
            "format": "plain",
            "repo": "https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/domains.json",
            "identifer": "eal"
        },
        "third_party": {
            "iosiro": {
                "timestamp": 0,
                "domains": [],
                "format": "plain",
                "repo": "https://raw.githubusercontent.com/iosiro/counter_phishing_blacklist/master/blacklists/domains.json",
                "identifer": "iosiro"
            },
            "segasec": {
                "timestamp": 0,
                "domains": [],
                "format": "sha256",
                "repo": "https://segasec.github.io/PhishingFeed/phishing-domains-sha256.json",
                "identifer": "segasec"
            }
        }
    };
    //See if we need to get the blacklisted domains - ie: do we have them cached?
    if(localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list") === null) {
        updateAllBlacklists(objEalBlacklistedDomains);
    } else {
        var objBlacklistedDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list");
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
        consoleLogger.log("Domains last fetched: " + (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) + " seconds ago");
        if (objBlacklistedDomains.timestamp == 0 || (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) > 300) {
            updateAllBlacklists(objEalBlacklistedDomains);
        }
    }

    strType = strType || "eal";
    if(strType == "eal") {
        var objEalDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list");
        return objEalDomains;
    } else {
        var objEalDomains = localStorage.getItem("ext-etheraddresslookup-3p_blacklist_domains_list");
        return objEalDomains;
    }
}

function updateAllBlacklists(objEalBlacklistedDomains)
{
    getBlacklistedDomainsFromSource(objEalBlacklistedDomains.eal).then(function (arrDomains) {
        objEalBlacklistedDomains.eal.timestamp = Math.floor(Date.now() / 1000);
        objEalBlacklistedDomains.eal.domains = arrDomains;

        localStorage.setItem("ext-etheraddresslookup-blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.eal));
    });

    if( [null, 1].indexOf(localStorage.getItem("ext-etheraddresslookup-use_3rd_party_blacklist")) >= 0) {
        getBlacklistedDomainsFromSource(objEalBlacklistedDomains.third_party.iosiro).then(function (arrDomains) {
            objEalBlacklistedDomains.third_party.iosiro.timestamp = Math.floor(Date.now() / 1000);
            objEalBlacklistedDomains.third_party.iosiro.domains = arrDomains;

            localStorage.setItem("ext-etheraddresslookup-3p_blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.third_party));
            return objEalBlacklistedDomains.eal.domains;
        });

        getBlacklistedDomainsFromSource(objEalBlacklistedDomains.third_party.segasec).then(function (arrDomains) {
            objEalBlacklistedDomains.third_party.segasec.timestamp = Math.floor(Date.now() / 1000);
            objEalBlacklistedDomains.third_party.segasec.domains = arrDomains;

            localStorage.setItem("ext-etheraddresslookup-3p_blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.third_party));
            return objEalBlacklistedDomains.eal.domains;
        });
    }
}

function getWhitelistedDomains()
{
    var objWhitelistedDomains = {"timestamp":0,"domains":[]};
    //See if we need to get the blacklisted domains - ie: do we have them cached?
    if(localStorage.getItem("ext-etheraddresslookup-whitelist_domains_list") === null) {
        getWhitelistedDomainsFromSource().then(function (arrDomains) {
            objWhitelistedDomains.timestamp = Math.floor(Date.now() / 1000);
            objWhitelistedDomains.domains = arrDomains;

            localStorage.setItem("ext-etheraddresslookup-whitelist_domains_list", JSON.stringify(objWhitelistedDomains));
            return objWhitelistedDomains.domains;
        });
    } else {
        var objWhitelistedDomains = localStorage.getItem("ext-etheraddresslookup-whitelist_domains_list");
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objWhitelistedDomains = JSON.parse(objWhitelistedDomains);
        consoleLogger.log("Whitelisted domains last fetched: " + (Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) + " seconds ago");
        if ((Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) > 300) {
            consoleLogger.log("Caching whitelisted domains again.");
            getWhitelistedDomainsFromSource().then(function (arrDomains) {
                objWhitelistedDomains.timestamp = Math.floor(Date.now() / 1000);
                objWhitelistedDomains.domains = arrDomains;

                localStorage.setItem("ext-etheraddresslookup-whitelist_domains_list", JSON.stringify(objWhitelistedDomains));
                return objWhitelistedDomains.domains;
            });
        }
    }

    return objWhitelistedDomains.domains;
}

async function getBlacklistedDomainsFromSource(objBlacklist)
{
    try {
        consoleLogger.log("Getting blacklist from GitHub now: "+ objBlacklist.repo);
        let objResponse = await fetch(objBlacklist.repo);
        return objResponse.json();
    }
    catch(objError) {
        consoleLogger.log("Failed to get blacklist for "+ objBlacklist.repo, objError);
    }
}

async function getWhitelistedDomainsFromSource()
{
    try {
        consoleLogger.log("Getting whitelist from GitHub now: https://raw.githubusercontent.com/409H/EtherAddressLookup/master/whitelists/domains.json");
        let objResponse = await fetch("https://raw.githubusercontent.com/409H/EtherAddressLookup/master/whitelists/domains.json");
        return objResponse.json();
    }
    catch(objError) {
        consoleLogger.log("Failed to get whitelist for https://raw.githubusercontent.com/409H/EtherAddressLookup/master/whitelists/domains.json", objError);
    }
}