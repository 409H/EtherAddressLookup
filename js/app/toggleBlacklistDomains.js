//On page load it checks/unchecks the checkbox
(function() {
    refreshBlacklistDomains();
})();

//Sets the local storage to remember their match blacklist settings
function toggleBlacklistDomains() {
    var objBlacklistDomains = document.getElementById("ext-etheraddresslookup-blacklist_domains");
    var intBlacklistDomains = objBlacklistDomains.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-blacklist_domains", intBlacklistDomains);

    refreshBlacklistDomains();
}

function refreshBlacklistDomains() {
    var intBlacklistDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains");
    document.getElementById("ext-etheraddresslookup-blacklist_domains").checked = (intBlacklistDomains == 1 ? true : false);
}