(function () {
    var objHistoryInspector = document.getElementById("ext-etheraddresslookup-history_inspect");

    //Perform the history inspection
    objHistoryInspector.addEventListener("click", function (objEvent) {
        //See if we need to request permission
        chrome.permissions.contains({
            permissions: ['history']
        }, function (blResult) {
            //No permission to history, ask for it.
            if (blResult === false) {
                chrome.permissions.request({
                    permissions: ['history']
                }, function (blGranted) {
                    if (blGranted) {
                        doHistoryInspection();
                    } else {
                        exitNoPermission();
                    }
                });
            } else {
                doHistoryInspection();
            }
        });
    });
})();

function doHistoryInspection() {
    chrome.history.search({text: "", maxResults: 500}, function (objHistoryItems) {
        console.log(objHistoryItems);
        var blRedirected = false;
        var intTotalWarnings = 0;
        var strReportText = "";

        var objBlacklistedDomains = localStorage.getItem("ext-etheraddresslookup-blacklist_domains_list");
        objBlacklistedDomains = JSON.parse(objBlacklistedDomains);

        var objDiv = document.getElementById("ext-etheraddresslookup-history_inspect_data");
        objDiv.innerHTML = "";

        for (var intIterator = 0; intIterator < objHistoryItems.length; intIterator++) {
            var objUri = URI(objHistoryItems[intIterator].url);

            //See if we redirected to the phishing site...
            if (objUri.domain() === "harrydenley.com" && objUri.path() === "/EtherAddressLookup/phishing.html") {
                blRedirected = true;
                continue;
            }

            //See if the domain is in the phishing list
            console.log(objUri.domain() + ' - ' + objBlacklistedDomains.domains.indexOf(objUri.domain()));
            if (objBlacklistedDomains.domains.indexOf(objUri.domain()) >= 0) {
                strReportText += "<span class='note'>" + (new Date(objHistoryItems[intIterator].lastVisitTime).toUTCString()) + "</span>&nbsp;";
                //Did EAL redirect you away?
                if (blRedirected) {
                    strReportText += objUri.domain() + "<span class='note ext-etheraddresslookup-history_good'>EAL successfully redirected you away.</span>";
                } else {
                    strReportText += objUri.domain() + "<span class='note ext-etheraddresslookup-history_bad'>Domain is now blacklisted - but wasn't at the time.</span>";
                    ++intTotalWarnings;
                }
                strReportText += "<span class='note'><small>Visited "+ objHistoryItems[intIterator].visitCount +" times</small></span>";
                strReportText += "<br />";
            }

            blRedirected = false;
        }

        objDiv.innerHTML = "";
        if(false && intTotalWarnings > 0) {
            objDiv.innerHTML += "<div class='warning'>You have been on a domain that has now been blacklisted - if you " +
                "entered your private key anywhere on the reported domains below, please consider your address " +
                "compromised and start moving your coins to an alternative address that you trust and control!</div><br /><br />"
        } else {
            objDiv.innerHTML += "<div class='success'>It looks like you're all good! Remember to never share your private keys.</div><br /><br />"
        }
        objDiv.innerHTML += strReportText;
        objDiv.style.display = "inline";
    });
}

function exitNoPermission() {
    var objDiv = document.getElementById("ext-etheraddresslookup-history_inspect_data");
    objDiv.innerHTML = "<div class='error'>Permission wasn't granted. Cannot inspect history!</div>";
    objDiv.classList.remove("hide-me");
}