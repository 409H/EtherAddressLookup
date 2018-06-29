//On page load it checks/unchecks the checkbox
(function() {
    refreshBlacklistDomains();

    getBlacklistStats();
    setInterval(() => {
        getBlacklistStats();
    }, 3000);
})();

//Sets the local storage to remember their match blacklist settings
function toggleBlacklistDomains()
{
    var objBlacklistDomains = document.getElementById("ext-etheraddresslookup-blacklist_domains");
    var intBlacklistDomains = objBlacklistDomains.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-blacklist_domains", intBlacklistDomains);

    refreshBlacklistDomains();
}

//Sets the local storage to remember their use 3rd party blacklist setting
function toggle3rdPartyBlacklistDomains()
{
    var obj3rdPartyBlacklists = document.getElementById("ext-etheraddresslookup-3rd_party_blacklist_domains");
    var intBlacklistDomains = obj3rdPartyBlacklists.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-3rd_party_blacklist_domains", intBlacklistDomains);

    refreshBlacklistDomains();
}

//Sets the local storage to remember if we are blocking all punycode domains or not
function toggleBlockPunycodeDomains()
{
    var objBlockPunycodeDomains = document.getElementById("ext-etheraddresslookup-block_punycode_blacklist_domains");
    var intBlockPunycodeDomains = objBlockPunycodeDomains.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-block_punycode_blacklist_domains", intBlockPunycodeDomains);

    refreshBlacklistDomains();
}

function refreshBlacklistDomains()
{
    var objBrowser = chrome ? chrome : browser;
    objBrowser.runtime.sendMessage({func: "blacklist_domain_list"}, function(objResponse) {
        console.log("BDL-001 - Fetched blacklisted domains");
    });

    var intBlacklistDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains");

    if(intBlacklistDomains === null) {
        document.getElementById("ext-etheraddresslookup-blacklist_domains").checked = true;
    } else {
        document.getElementById("ext-etheraddresslookup-blacklist_domains").checked = (intBlacklistDomains == 1 ? true : false);
    }

    //Check/uncheck use 3rd party blacklists
    var intUse3rdPartyBlacklists = localStorage.getItem("ext-etheraddresslookup-3rd_party_blacklist_domains");
    if(intUse3rdPartyBlacklists === null) {
        document.getElementById("ext-etheraddresslookup-3rd_party_blacklist_domains").checked = true;
    } else {
        document.getElementById("ext-etheraddresslookup-3rd_party_blacklist_domains").checked = (intUse3rdPartyBlacklists == 1 ? true : false);
    }

    //Check/uncheck use block punycode domains
    var intBlockPunycodeDomains = localStorage.getItem("ext-etheraddresslookup-block_punycode_blacklist_domains");
    if(intBlockPunycodeDomains === null) {
        document.getElementById("ext-etheraddresslookup-block_punycode_blacklist_domains").checked = true;
    } else {
        document.getElementById("ext-etheraddresslookup-block_punycode_blacklist_domains").checked = (intBlockPunycodeDomains == 1 ? true : false);
    }
}

function getBlacklistStats()
{
    var objLastUpdatedText = document.getElementById("ext-etheraddresslookup-blacklist_domains_last_updated");
    var objTotalCountText = document.getElementById("ext-etheraddresslookup-blacklist_domains_total_count");
    let objBlacklistedDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list");
    objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
    var intLastUpdated = objBlacklistedDomains.timestamp;

    objLastUpdatedText.innerText = timeDifference(Math.floor(Date.now()/1000), intLastUpdated);
    objTotalCountText.innerText = new Intl.NumberFormat().format(objBlacklistedDomains.domains.length);

    //Now get the 3p blacklist stats
    var objTotal3pCountText = document.getElementById("ext-etheraddresslookup-3p_blacklist_domains_total_count");
    objBlacklistedDomains = localStorage.getItem("ext-etheraddresslookup-3p_blacklist_domains_list");
    objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
    var intTotalBlacklisted = 0;
    for(var str3pName in objBlacklistedDomains) {
        intTotalBlacklisted += objBlacklistedDomains[str3pName].domains.length;
    }
    objTotal3pCountText.innerText = "+" + new Intl.NumberFormat().format(intTotalBlacklisted);

}

function timeDifference(current, previous)
{
    if(previous == 0) {
        return "Not fetched";
    }

    var elapsed = parseInt(current) - parseInt(previous);
    if(elapsed > 59) {
        return Math.floor(elapsed / 60) + ' minutes ago';
    }
    return Math.round(elapsed) + ' seconds ago';
}