//On page load it checks/unchecks the checkbox
(function() {
    refreshPerformAddressLookups();
})();

//Sets the local storage to remember their RPC address lookup setting
function togglePerformAddressLookups()
{
    var objAddressLookups = document.getElementById("ext-etheraddresslookup-perform_address_lookups");
    var intAddressLookups = objAddressLookups.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-perform_address_lookups", intAddressLookups);

    refreshPerformAddressLookups();
}

function refreshPerformAddressLookups() {
    var intAddressLookups = localStorage.getItem("ext-etheraddresslookup-perform_address_lookups");
    if(intAddressLookups === null) {
        intAddressLookups = 1;
    }
    document.getElementById("ext-etheraddresslookup-perform_address_lookups").checked = (intAddressLookups == 1 ? true : false);
}