(function() {
    let objBrowser = chrome ? chrome : browser;

    //Get the blacklist domains option for the user
    objBrowser.runtime.sendMessage({func: "blacklist_domains"}, function(objResponse) {
        if(objResponse && objResponse.hasOwnProperty("resp")) {
            if(objResponse.resp == 1) {
                blacklistedDomainCheck();
            }
        }
    });

    //Detects if the current tab is in the blacklisted domains file
    function blacklistedDomainCheck()
    {
        let objBrowser = chrome ? chrome : browser;
        var arrBlacklistedDomains = [];
        var arrWhitelistedDomains = ["www.myetherwallet.com", "myetherwallet.com"];
        objBrowser.runtime.sendMessage({func: "blacklist_domain_list"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                arrBlacklistedDomains = objResponse.resp;
                objBrowser.runtime.sendMessage({func: "whitelist_domain_list"}, function(objResponse) {
                    if(objResponse && objResponse.hasOwnProperty("resp")) {
                        arrWhitelistedDomains = objResponse.resp;
                        return doBlacklistCheck();
                    }
                }.bind(arrWhitelistedDomains));
            }
        }.bind(arrBlacklistedDomains));

        function doBlacklistCheck() {
            if(arrBlacklistedDomains.length > 0) {
                var strCurrentTab = window.location.hostname;
                var strCurrentTab = strCurrentTab.replace(/www\./g,'');

                var objBlacklistedDomains = JSON.parse(arrBlacklistedDomains);
                arrBlacklistedDomains = objBlacklistedDomains.domains;

                if(arrBlacklistedDomains.length === 0) {
                    console.log("No domains blacklisted at this time");
                    return false;
                }

                //Domain is whitelisted, don't check the blacklist.
                if(arrWhitelistedDomains.indexOf(strCurrentTab) >= 0) {
                    console.log("Domain "+ strCurrentTab +" is whitelisted on EAL!");
                    return false;
                }

                var isBlacklisted = arrBlacklistedDomains.indexOf(strCurrentTab) >= 0 ? true : false;

                //Only do Levenshtein if it's not blacklisted
                //Levenshtein - @sogoiii
                var blHolisticStatus = false;
                if(isBlacklisted === false && arrWhitelistedDomains.indexOf(strCurrentTab) < 0) {
                    var strCurrentTab = punycode.toUnicode(strCurrentTab);
                    var source = strCurrentTab.replace(/\./g, '');
                    var intHolisticMetric = levenshtein(source, 'myetherwallet');
                    var intHolisticLimit = 7 // How different can the word be?
                    blHolisticStatus = (intHolisticMetric > 0 && intHolisticMetric < intHolisticLimit) ? true : false;
                }

                //If it's not in the whitelist and it is blacklisted or levenshtien wants to blacklist it.
                if ( arrWhitelistedDomains.indexOf(strCurrentTab) < 0 && (isBlacklisted || blHolisticStatus)) {
                    console.warn(window.location.href + " is blacklisted by EAL - "+ (isBlacklisted ? "Blacklisted" : "Levenshtein Logic"));
                    window.location.href = "https://harrydenley.com/EtherAddressLookup/phishing.html#"+ (window.location.href);
                    return false;
                }
            }

            //Now do the 3rd party domain list check if they have that option enabled.
            objBrowser.runtime.sendMessage({func: "3rd_party_blacklist_domains"}, function(objResponse) {
                if(objResponse && objResponse.hasOwnProperty("resp")) {
                    if(objResponse.resp == 1) {
                        objBrowser.runtime.sendMessage({func: "3p_blacklist_domain_list"}, function(objResponse) {
                            if(objResponse && objResponse.hasOwnProperty("resp")) {
                                var obj3rdPartyLists = JSON.parse(objResponse.resp);
                                var strCurrentTab = window.location.hostname;
                                var strCurrentTab = strCurrentTab.replace(/www\./g,'');

                                for(var str3rdPartyIdentifier in obj3rdPartyLists) {

                                    if(obj3rdPartyLists[str3rdPartyIdentifier].format == "sha256") {
                                        strCurrentTab = sha256(strCurrentTab);
                                    }

                                    if(obj3rdPartyLists[str3rdPartyIdentifier].domains.indexOf(strCurrentTab) >= 0) {
                                        console.warn(window.location.href + " is blacklisted by "+ str3rdPartyIdentifier);
                                        window.location.href = "https://harrydenley.com/EtherAddressLookup/phishing-"+ str3rdPartyIdentifier +".html#"+ (window.location.href);
                                        return false;
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    function levenshtein(a, b) {
        if(a.length == 0) return b.length;
        if(b.length == 0) return a.length;

        // swap to save some memory O(min(a,b)) instead of O(a)
        if(a.length > b.length) {
            var tmp = a;
            a = b;
            b = tmp;
        }

        var row = [];
        // init the row
        for(var i = 0; i <= a.length; i++){
            row[i] = i;
        }

        // fill in the rest
        for(var i = 1; i <= b.length; i++){
            var prev = i;
            for(var j = 1; j <= a.length; j++){
                var val;
                if(b.charAt(i-1) == a.charAt(j-1)){
                    val = row[j-1]; // match
                } else {
                    val = Math.min(row[j-1] + 1, // substitution
                        prev + 1,     // insertion
                        row[j] + 1);  // deletion
                }
                row[j - 1] = prev;
                prev = val;
            }
            row[a.length] = prev;
        }

        return row[a.length];
    }
})();
