//On page load it checks/unchecks the checkbox
(function() {
    refreshPerformAddressLookups();
})();

var LS = {
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
};

//Sets the local storage to remember their RPC address lookup setting
async function togglePerformAddressLookups()
{
    var objAddressLookups = document.getElementById("ext-etheraddresslookup-perform_address_lookups");
    var intAddressLookups = objAddressLookups.checked ? 1 : 0;
    await LS.setItem("ext-etheraddresslookup-perform_address_lookups", intAddressLookups);

    refreshPerformAddressLookups();
}

async function refreshPerformAddressLookups() {
    var intAddressLookups = await LS.getItem("ext-etheraddresslookup-perform_address_lookups");
    if(!intAddressLookups) {
        intAddressLookups = 1;
    }
    document.getElementById("ext-etheraddresslookup-perform_address_lookups").checked = (intAddressLookups == 1 ? true : false);
}