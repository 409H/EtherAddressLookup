//On page load it checks/unchecks the checkbox
(function()
{
    refreshBlacklistDomains();

    getBlacklistStats();
    setInterval(function() {getBlacklistStats()}, 3000);
})();

//Sets the local storage to remember their match blacklist settings
function toggleBlacklistDomains()
{
    var objBlacklistDomains = document.getElementById("ext-etheraddresslookup-blacklist_domains");
    var intBlacklistDomains = objBlacklistDomains.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-blacklist_domains", intBlacklistDomains);

    refreshBlacklistDomains();
}

function refreshBlacklistDomains()
{
    chrome.runtime.sendMessage({func: "blacklist_domain_list"}, function(objResponse) {
        console.log("BDL-001");
    });

    var intBlacklistDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains");

    if(intBlacklistDomains === null) {
        document.getElementById("ext-etheraddresslookup-blacklist_domains").checked = true;
    } else {
        document.getElementById("ext-etheraddresslookup-blacklist_domains").checked = (intBlacklistDomains == 1 ? true : false);
    }
}

function getBlacklistStats()
{
    var objLastUpdatedText = document.getElementById("ext-etheraddresslookup-blacklist_domains_last_updated");
    var objTotalCountText = document.getElementById("ext-etheraddresslookup-blacklist_domains_total_count");
    var objBlacklistedDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list");
    objBlacklistedDomains = JSON.parse(objBlacklistedDomains);
    var intLastUpdated = objBlacklistedDomains.timestamp;

    objLastUpdatedText.innerText = timeDifference(Math.floor(Date.now()/1000), intLastUpdated);
    objTotalCountText.innerText = new Intl.NumberFormat().format(objBlacklistedDomains.domains.length);
}

function timeDifference(current, previous)
{
    var elapsed = parseInt(current) - parseInt(previous);
    if(elapsed > 59) {
        return Math.floor(elapsed / 60) + ' minutes ago';
    }
    return Math.round(elapsed) + ' seconds ago';
}