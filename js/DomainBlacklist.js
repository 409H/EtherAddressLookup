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

                //Domain is whitelisted, don't check the blacklist.
                if(arrWhitelistedDomains.includes(strCurrentTab)) {
                    console.log("Domain "+ strCurrentTab +" is whitelisted on EAL!");
                    return;
                }

                //Levenshtein - @sogoiii
                var isBlacklisted = arrBlacklistedDomains.includes(strCurrentTab);
                var source = strCurrentTab.replace(/\./g,'');
                var intHolisticMetric = levenshtein(source, 'myetherwallet');
                var intHolisticLimit = 7 // How different can the word be?
                var blHolisticStatus = (intHolisticMetric > 0 && intHolisticMetric < intHolisticLimit) ? true : false;

                if (isBlacklisted || blHolisticStatus ) {
                    window.location.href = "https://harrydenley.com/EtherAddressLookup/phishing.html#"+ (window.location.href);
                    return false;
                }
            }
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
