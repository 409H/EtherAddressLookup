class AddressBadges
{

    constructor()
    {
        //No need to do anything here.
    }

    /**
     * Ticks/Unticks the checkbox based on the users setting and sets the form values
     */
    populateOptionCheckbox()
    {
        if(document.getElementById("ext-etheraddresslookup-address_badges_success")) {
            document.getElementById("ext-etheraddresslookup-address_badges_success").classList.add("hide-me");
        }

        objBrowser.runtime.sendMessage({func: "address_badges"}, function(objResponse) {
            let objSettings = JSON.parse(objResponse.resp);
            document.getElementById("ext-etheraddresslookup-address_badges").checked = !!parseInt(objSettings.enabled);
            if(document.getElementById("ext-etheraddresslookup-address_badges_toggle_checkbox")) {
                document.getElementById("ext-etheraddresslookup-address_badges_toggle_checkbox").checked = !!parseInt(objSettings.etherscamdb.enabled);
            }
            if(document.getElementById("ext-etheraddresslookup-address_badges_esdb_url")) {
                document.getElementById("ext-etheraddresslookup-address_badges_esdb_url").value = objSettings.etherscamdb.endpoint;
            }
        });
    }

    saveFormValues(objEvent)
    {
        objEvent.preventDefault();

        objBrowser.runtime.sendMessage({func: "address_badges"}, function(objResponse) {
            let objSettings = JSON.parse(objResponse.resp);

            objSettings.enabled = document.getElementById("ext-etheraddresslookup-address_badges").checked ? 1 : 0;

            if(document.getElementById("ext-etheraddresslookup-address_badges_toggle_checkbox")) {
                objSettings.etherscamdb.enabled = document.getElementById("ext-etheraddresslookup-address_badges_toggle_checkbox").checked ? 1 : 0;
            }

            if(document.getElementById("ext-etheraddresslookup-address_badges_esdb_url")) {
                objSettings.etherscamdb.endpoint = document.getElementById("ext-etheraddresslookup-address_badges_esdb_url").value;
            }

            //Commit it to localstorage
            localStorage.setItem("ext-etheraddresslookup-address_badges", JSON.stringify(objSettings));

            document.getElementById("ext-etheraddresslookup-address_badges_success").classList.remove("hide-me");
        });

        return false;
    }
}

(function(){
    let objAddressBadges = new AddressBadges;
    objAddressBadges.populateOptionCheckbox();

    document.getElementById("ext-etheraddresslookup-address_badges").addEventListener("change", objAddressBadges.saveFormValues, true);
    
    if(document.getElementById("ext-etheraddresslookup-address_badges_modify_form")) {
        var objForm = document.getElementById("ext-etheraddresslookup-address_badges_modify_form");
        objForm.addEventListener("submit", objAddressBadges.saveFormValues, true);
    }

})();