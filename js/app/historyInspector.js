(function () {
    var objHistoryInspector = document.getElementById("ext-etheraddresslookup-history_inspect");
    //Perform the history inspection
    if(typeof chrome !== 'undefined') {
        objHistoryInspector.addEventListener('click', event => {
            chrome.permissions.request({permissions: ['history']}, function(blGranted) {
                if (blGranted) {
                    console.log("Granted history permission");
                    doHistoryInspection();
                } else {
                    exitNoPermission();
                }
            });
        });
    } else {
        objHistoryInspector.addEventListener('click', event => {
            browser.permissions.request({permissions: ['history']}).then((blGranted) => {
                if (blGranted) {
                    console.log("Granted history permission");
                    doHistoryInspection();
                } else {
                    exitNoPermission();
                }
            });
        });
    }
})();

function doHistoryInspection() {
    var objBrowser = chrome ? chrome : browser;
    objBrowser.history.search({text: "", maxResults: 500}, function (objHistoryItems) {
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
            if (objUri.domain() === "harrydenley.com" && ["/EtherAddressLookup/phishing.html", "/EtherAddressLookup/phishing-segasec.html", "/EtherAddressLookup/phishing-phishfort.html"].indexOf(objUri.path()) >= 0) {
                blRedirected = true;
                continue;
            }

            //See if the domain is in the phishing list
            if (objBlacklistedDomains.domains.indexOf(objUri.domain()) >= 0) {
                strReportText += "<span class='ext-etheraddresslookup-note'>" + (new Date(objHistoryItems[intIterator].lastVisitTime).toUTCString()) + "</span>&nbsp;";
                //Did EAL redirect you away?
                if (blRedirected) {
                    strReportText += objUri.domain() + "<span class='ext-etheraddresslookup-note ext-etheraddresslookup-history_good'>EAL successfully redirected you away.</span>";
                } else {
                    strReportText += objUri.domain() + "<span class='ext-etheraddresslookup-note ext-etheraddresslookup-history_bad'>Domain is now blacklisted - but wasn't at the time.</span>";
                    ++intTotalWarnings;
                }
                strReportText += "<span class='ext-etheraddresslookup-note'><small>Visited "+ objHistoryItems[intIterator].visitCount +" times</small></span>";
                strReportText += "<br />";
            }

            blRedirected = false;
        }

        objDiv.innerHTML = "";
        if(intTotalWarnings > 0) {
            objDiv.innerHTML += "<div class='warning'>You have been on a domain that has now been blacklisted - if you " +
                "entered your private key anywhere on the reported domains below, please consider your address " +
                "compromised and start moving your coins to an alternative address that you trust and control!</div><br /><br />";
        } else {
            objDiv.innerHTML += "<div class='success'>It looks like you're all good! Remember to never share your private keys.</div><br /><br />";
        }
        objDiv.innerHTML += strReportText;
        objDiv.style.display = "inline";

        removePermission();
    });
}

function exitNoPermission()
{
    var objDiv = document.getElementById("ext-etheraddresslookup-history_inspect_data");
    objDiv.innerHTML = "<div class='error'>Permission wasn't granted. Cannot inspect history!</div>";
    objDiv.classList.remove("hide-me");
}

function removePermission()
{
    var objBrowser = chrome ? chrome : browser;
    objBrowser.permissions.remove({
        permissions: ['history']
    }, function(removed) {
        if (removed) {
            console.log("Removed history permission.");
        } else {
            console.log("Cannot remove history permission!");
        }
    });
}