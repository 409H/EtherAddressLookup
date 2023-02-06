var objBrowser = chrome || browser;

var LS = {
    getItem: key => {
        return new Promise(resolve => {
            resolve((objBrowser.storage.local.get(key))[key])
        })
    },
    setItem: (key, val) => objBrowser.storage.local.set({[key]: val}),
};

const DATA_UPDATE_PERIOD = 3;

(async function() {
    //Toggle the highlight option and set it in LocalStorage
    var objOptionAddHighlight = document.querySelector('[name="ext-etheraddresslookup-show_style"]');
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
    let objBlacklistDomains = document.getElementById('ext-etheraddresslookup-blacklist_domains');
    if (objBlacklistDomains) {
        objBlacklistDomains.addEventListener('click', toggleBlacklistDomains);
    }

    //Toggle the use 3rd party blacklist domains option and set it in LocalStorage
    objBlacklistDomains = document.getElementById('ext-etheraddresslookup-3rd_party_blacklist_domains');
    if (objBlacklistDomains) {
        objBlacklistDomains.addEventListener('click', toggle3rdPartyBlacklistDomains);
    }

    //Toggle the use of blacklisting all punycode domains and set it in LocalStorage
    var objBlacklistPunycodeDomains = document.getElementById('ext-etheraddresslookup-block_punycode_blacklist_domains');
    if(objBlacklistPunycodeDomains) {
        objBlacklistPunycodeDomains.addEventListener('click', toggleBlockPunycodeDomains);
    }

    //Get the extension version
    var objManifest = objBrowser.runtime.getManifest();
    var objManifestVersion = document.getElementById('ext-manifest_version');
    if(objManifestVersion) {
        objManifestVersion.innerHTML = objManifest.version;
    }

    // //Get the rpc network details
    var objNetworkDetails = document.querySelector("#ext-etheraddresslookup-rpc_node_details > span");
    if(objNetworkDetails) {
        let objNetworkDetails;
        const rpcNodeDetails = await objBrowser.storage.local.get("ext-etheraddresslookup-rpc_node_details")["ext-etheraddresslookup-rpc_node_details"];
        if(!rpcNodeDetails) {
            objNetworkDetails = {
                "network_id": 1,
                "chain_id": 1,
                "name": "MAINNET",
                "type": "ETH"
            };
        } else {
            objNetworkDetails = JSON.parse(rpcNodeDetails);
        }
        document.querySelector("#ext-etheraddresslookup-rpc_node_details > span").innerText = [objNetworkDetails.name, objNetworkDetails.type].join(" - ");
    }

    //init getting blacklisted domains
    getBlacklistedDomains();
    getWhitelistedDomains();

    if (objBrowser.alarms) {
        objBrowser.alarms.create("DomainListUpdate", {
            periodInMinutes: DATA_UPDATE_PERIOD
        });
    }
})();

if (objBrowser.alarms) {
    objBrowser.alarms.onAlarm.addListener(function(alarm) {
        if (alarm.name !== "DomainListUpdate")
            return;
        getBlacklistedDomains();
        getWhitelistedDomains();
    });
}

async function getBlacklistedDomains(strType)
{
    var objEalBlacklistedDomains = {
        "eal": {
            "timestamp": 0,
            "domains": [],
            "format": "plain",
            "repo": "https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/domains.json",
            "identifer": "eal"
        },
        "uri": {
            "timestamp": 0,
            "domains": [],
            "format": "plain",
            "repo": "https://raw.githubusercontent.com/409H/EtherAddressLookup/master/blacklists/uri.json",
            "identifer": "uri"
        },
        "third_party": {
            "phishfort": {
                "timestamp": 0,
                "domains": [],
                "format": "plain",
                "repo": "https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json",
                "identifer": "phishfort"
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
    const blacklistDomainList = await LS.getItem("ext-etheraddresslookup-blacklist_domains_list");
    if (!blacklistDomainList) {
        updateAllBlacklists(objEalBlacklistedDomains);
    } else {
        var objBlacklistedDomains = blacklistDomainList;
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
        console.log("Domains last fetched: " + (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) + " seconds ago");
        if (objBlacklistedDomains.timestamp == 0 || (Math.floor(Date.now() / 1000) - objBlacklistedDomains.timestamp) > 300) {
            updateAllBlacklists(objEalBlacklistedDomains);
        }
    }

    strType = strType || "eal";
    if(strType === "eal") {
        strType = "";
    } else {
        strType = `${strType}_`;
    }

    return await LS.getItem(`ext-etheraddresslookup-${strType}blacklist_domains_list`);
}

async function updateAllBlacklists(objEalBlacklistedDomains)
{
    let arrDomains_1 = await getBlacklistedDomainsFromSource(objEalBlacklistedDomains.eal);
    objEalBlacklistedDomains.eal.timestamp = Math.floor(Date.now() / 1000);
    objEalBlacklistedDomains.eal.domains = arrDomains_1.filter((v,i,a)=>a.indexOf(v)==i); 
    await LS.setItem("ext-etheraddresslookup-blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.eal));

    let arrDomains_2 = await getBlacklistedDomainsFromSource(objEalBlacklistedDomains.uri)
    objEalBlacklistedDomains.uri.timestamp = Math.floor(Date.now() / 1000);
    objEalBlacklistedDomains.uri.domains = arrDomains_2.filter((v,i,a)=>a.indexOf(v)==i);

    await LS.setItem("ext-etheraddresslookup-uri_blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.uri));

    if( [null, undefined, 1].indexOf(await LS.getItem("ext-etheraddresslookup-use_3rd_party_blacklist")) >= 0) {
        let phishDomains = await getBlacklistedDomainsFromSource(objEalBlacklistedDomains.third_party.phishfort)

        let arrPhishFortBlacklist = [];
        // De-dupe from the main EAL source - save on space.
        let objEalBlacklist = await LS.getItem("ext-etheraddresslookup-blacklist_domains_list");
        if(objEalBlacklist) {
            objEalBlacklist = JSON.parse(objEalBlacklist);
            let arrEalBlacklist = objEalBlacklist.domains;
            var intBlacklistLength = phishDomains.length;
            while(intBlacklistLength--) {
                if(arrEalBlacklist.indexOf(phishDomains[intBlacklistLength]) < 0) {
                    arrPhishFortBlacklist.push(phishDomains[intBlacklistLength])
                }
            }
        }

        objEalBlacklistedDomains.third_party.phishfort.timestamp = Math.floor(Date.now() / 1000);
        objEalBlacklistedDomains.third_party.phishfort.domains = arrPhishFortBlacklist;

        await LS.setItem("ext-etheraddresslookup-3p_blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.third_party));

        let thridPartyDomains = await getBlacklistedDomainsFromSource(objEalBlacklistedDomains.third_party.segasec);
        objEalBlacklistedDomains.third_party.segasec.timestamp = Math.floor(Date.now() / 1000);
        objEalBlacklistedDomains.third_party.segasec.domains = thridPartyDomains.filter((v,i,a)=>a.indexOf(v)==i);

        await LS.setItem("ext-etheraddresslookup-3p_blacklist_domains_list", JSON.stringify(objEalBlacklistedDomains.third_party));
    }
}

async function getWhitelistedDomains()
{
    let objWhitelistedDomains = {"timestamp":0,"domains":[]};
    //See if we need to get the blacklisted domains - ie: do we have them cached?
    const whiteListDomainsList = await LS.getItem("ext-etheraddresslookup-whitelist_domains_list");
    if (!whiteListDomainsList) {
        getWhitelistedDomainsFromSource().then(async function (arrDomains) {
            objWhitelistedDomains.timestamp = Math.floor(Date.now() / 1000);
            objWhitelistedDomains.domains = arrDomains;

            await LS.setItem("ext-etheraddresslookup-whitelist_domains_list", JSON.stringify(objWhitelistedDomains));
            return objWhitelistedDomains.domains;
        });
    } else {
        objWhitelistedDomains = whiteListDomainsList;
        //Check to see if the cache is older than 5 minutes, if so re-cache it.
        objWhitelistedDomains = JSON.parse(objWhitelistedDomains);
        console.log("Whitelisted domains last fetched: " + (Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) + " seconds ago");
        if ((Math.floor(Date.now() / 1000) - objWhitelistedDomains.timestamp) > 300) {
            console.log("Caching whitelisted domains again.");
            getWhitelistedDomainsFromSource().then(async function (arrDomains) {
                objWhitelistedDomains.timestamp = Math.floor(Date.now() / 1000);
                objWhitelistedDomains.domains = arrDomains;

                await LS.setItem("ext-etheraddresslookup-whitelist_domains_list", JSON.stringify(objWhitelistedDomains));
                return objWhitelistedDomains.domains;
            });
        }
    }

    return objWhitelistedDomains.domains;
}

async function getBlacklistedDomainsFromSource(objBlacklist)
{
    try {
        console.log("Getting blacklist from GitHub now: "+ objBlacklist.repo);
        let objResponse = await fetch(objBlacklist.repo);
        return objResponse.json();
    }
    catch(objError) {
        console.log("Failed to get blacklist for "+ objBlacklist.repo, objError);
    }
}

async function getWhitelistedDomainsFromSource()
{
    try {
        console.log("Getting whitelist from GitHub now: https://raw.githubusercontent.com/409H/EtherAddressLookup/master/whitelists/domains.json");
        let objResponse = await fetch("https://raw.githubusercontent.com/409H/EtherAddressLookup/master/whitelists/domains.json");
        return objResponse.json();
    }
    catch(objError) {
        console.log("Failed to get whitelist for https://raw.githubusercontent.com/409H/EtherAddressLookup/master/whitelists/domains.json", objError);
    }
}
