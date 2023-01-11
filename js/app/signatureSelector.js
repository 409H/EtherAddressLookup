var LS = {
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
};

class SignatureSelector
{

    constructor()
    {
        //No need to do anything here.
    }

    /**
     * Ticks/Unticks the checkbox based on the users setting
     */
    populateOptionCheckbox()
    {
        document.getElementById("ext-etheraddresslookup-signature_success").classList.add("hide-me");

        objBrowser.runtime.sendMessage({func: "signature_inject"}, function(objResponse) {
            chrome.runtime.lastError;
            document.getElementById("ext-etheraddresslookup-signature_modify_checkbox").checked = !!parseInt(objResponse.resp);
        });
    }

    async saveFormValues(objEvent)
    {
        objEvent.preventDefault();

        var objSignatureInject = document.getElementById("ext-etheraddresslookup-signature_modify_checkbox");
        await LS.setItem("ext-etheraddresslookup-signature_inject", objSignatureInject.checked ? 1 : 0);
        document.getElementById("ext-etheraddresslookup-signature_success").classList.remove("hide-me");
        return false;
    }

}

//On page load do everything.
(function() {
    let objSignatureSelector = new SignatureSelector();
    objSignatureSelector.populateOptionCheckbox();

    var objForm = document.getElementById("ext-etheraddresslookup-signature_modify_form");
    objForm.addEventListener("submit", objSignatureSelector.saveFormValues, true);
})();