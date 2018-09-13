class TwitterFakeAccount
{

    constructor()
    {
        this.arrAllTwitterUsernames = [];
        this.intTweetCount = 0;
    }

    /**
     * Fetches the tweets on the page and returns an array of objects
     *
     * @return  array
     */
    getTweets()
    {
        if(document.getElementsByClassName("permalink-container").length > 0) {
            if(document.getElementsByClassName("permalink-container")[0].getElementsByClassName("tweet").length > 0) {
                return document.getElementsByClassName("permalink-container")[0].getElementsByClassName("tweet");
            }
        }

        if(document.getElementsByClassName("tweet")) {
            return document.getElementsByClassName("tweet");
        }
        return [];
    }

    /**
     * Fetches the Twitter usernames that are in the DOM and puts them into a class array arrAllTwitterUsernames.
     *
     * @return  array
     */
    getTwitterUsernames()
    {
        var arrUsersOnView = document.getElementsByClassName("tweet");
        for(var intCounter=0; intCounter<arrUsersOnView.length; intCounter++) {
            var strUsername = arrUsersOnView[intCounter].getAttribute("data-screen-name");
            var intUserId = arrUsersOnView[intCounter].getAttribute("data-user-id");

            if(intUserId === null) {
                continue;
            }

            this.arrAllTwitterUsernames[intUserId] = {
                "userid": intUserId,
                "username": strUsername
            };
        }

        return this.arrAllTwitterUsernames;
    }

    // @todo - fix the ui on this. it's shit atm
    doInfluenceScore(objData)
    {
        console.log(objData);
        var objNodes = document.getElementsByClassName("ext-etheraddresslookup-tweet-" + objData.tweet_id);
        for (var intCounter = 0; intCounter < objNodes.length; intCounter++) {
            var objNode = objNodes[intCounter];
            if (objNode.getAttribute("ext-etheraddresslookup-twitterflagged-influencescore")) {
                return;
            }

            var objAccountDetails = objNode.getElementsByClassName("account-group")[0];
            if(typeof objAccountDetails === 'undefined') {
                return;
            }
            objNode.setAttribute("ext-etheraddresslookup-twitterflagged-influencescore", 1);

            var objInfluenceScore = document.createElement("div");
            objInfluenceScore.style.display = "inline";
            objInfluenceScore.style.height = "25px;";
            objInfluenceScore.style.width = "55px";
            objInfluenceScore.style.padding = "0 10px";
            objInfluenceScore.style.textAlign = "center";
            objInfluenceScore.style.cursor = "help";
            objInfluenceScore.style.background = "rgb(231, 231, 231)";
            objInfluenceScore.style.borderRadius = "1em";
            // Switch up the text colour because vanity
            switch(true) {
                // Top tier influential
                case Math.floor(objData.influence_score) > 700:
                    objInfluenceScore.style.color = "#9AD490";
                break;
                // Second tier influential
                case Math.floor(objData.influence_score) > 600:
                    objInfluenceScore.style.color = "#90D4C1";
                break;
                // Third tier influential
                case Math.floor(objData.influence_score) > 500:
                    objInfluenceScore.style.color = "#90B5D4";
                break;     
                // Fourth tier influential
                case Math.floor(objData.influence_score) > 400:
                    objInfluenceScore.style.color = "#A690D4";
                break;    
                // Fifth tier influential
                case Math.floor(objData.influence_score) > 300:
                    objInfluenceScore.style.color = "#D490D3";
                break;                                          
                default:
                    objInfluenceScore.style.color = "#111";
                break;

            }
            objInfluenceScore.innerHTML = "<strong>"+ objData.influence_score +"</strong>";
            objInfluenceScore.title = "This influence score is calculated by CryptoInfluencers.io"
            objAccountDetails.append(objInfluenceScore);
        }
    }

    doNeutralAlert(objData)
    {
        var objNodes = document.getElementsByClassName("ext-etheraddresslookup-tweet-" + objData.tweet_id);
        for (var intCounter = 0; intCounter < objNodes.length; intCounter++) {
            var objNode = objNodes[intCounter];
            if (objNode.getAttribute("ext-etheraddresslookup-twitterflagged")) {
                return;
            }

            var objAccountDetails = objNode.getElementsByClassName("account-group")[0];
            if(typeof objAccountDetails === 'undefined') {
                return;
            }
            objNode.setAttribute("ext-etheraddresslookup-twitterflagged", 1);

            var objWhitelistedIcon = document.createElement("img");
            objWhitelistedIcon.src = chrome.runtime.getURL('/images/twitter/neutral.png');
            objWhitelistedIcon.style = "display:inline;height:25px;width:25px;left:15px;";
            objWhitelistedIcon.title = "This account is not categorized by EtherAddressLookup";
            objAccountDetails.append(objWhitelistedIcon);
        }
    }

    doBlacklistAlert(objData)
    {
        var objNodes = document.getElementsByClassName("ext-etheraddresslookup-tweet-" + objData.tweet_id);
        for (var intCounter = 0; intCounter < objNodes.length; intCounter++) {
            var objNode = objNodes[intCounter];
            if (objNode.getAttribute("ext-etheraddresslookup-twitterflagged")) {
                return;
            }

            var objAccountDetails = objNode.getElementsByClassName("account-group")[0];
            objNode.setAttribute("ext-etheraddresslookup-twitterflagged", 1);

            var objWhitelistedIcon = document.createElement("img");
            objWhitelistedIcon.src = chrome.runtime.getURL('/images/twitter/blacklisted.png');
            objWhitelistedIcon.style = "display:inline;height:25px;width:25px;left:15px;";
            objWhitelistedIcon.title = "This account is blacklisted by EtherAddressLookup";
            objAccountDetails.append(objWhitelistedIcon);
        }
    }

    doWhitelistAlert(objData) {
        var objNodes = document.getElementsByClassName("ext-etheraddresslookup-tweet-" + objData.tweet_id);
        for (var intCounter = 0; intCounter < objNodes.length; intCounter++) {
            var objNode = objNodes[intCounter];

            if (objNode.getAttribute("ext-etheraddresslookup-twitterflagged")) {
                return;
            }

            var objAccountDetails = objNode.getElementsByClassName("account-group")[0];
            objNode.setAttribute("ext-etheraddresslookup-twitterflagged", 1);

            var objWhitelistedIcon = document.createElement("img");
            objWhitelistedIcon.src = chrome.runtime.getURL('/images/twitter/whitelisted.png');
            objWhitelistedIcon.style = "display:inline;height:25px;width:25px;left:15px;";
            objWhitelistedIcon.title = "This account is whitelisted by EtherAddressLookup";
            objAccountDetails.append(objWhitelistedIcon);
        }
    }

    /**
     * https://stackoverflow.com/a/9496574
     * @param attribute
     * @return {Array}
     */
    getAllElementsWithAttribute(attribute, strValue)
    {
        var objNode = document;
        if(document.getElementsByClassName("permalink-container").length > 0) {
            if (document.getElementsByClassName("permalink-container")[0].getElementsByClassName("tweet").length > 0) {
                objNode = document.getElementsByClassName("permalink-container")[0];
            }
        }
        var matchingElements = [];
        var allElements = objNode.getElementsByTagName('*');
        for (var i = 0, n = allElements.length; i < n; i++)
        {
            if (allElements[i].getAttribute(attribute) !== null)
            {
                if(allElements[i].getAttribute(attribute) === strValue) {
                    // Element exists with attribute. Add to array.
                    matchingElements.push(allElements[i]);
                }
            }
        }
        return matchingElements;
    }

    isTwitterVerified(objTweet)
    {
        if(typeof objTweet.children[1] !== 'undefined') {
            if(typeof objTweet.children[1].children[0] !== 'undefined') {
                if(typeof objTweet.children[1].children[0].children[0] !== 'undefined') {
                    if(typeof objTweet.children[1].children[0].children[0].children[1] !== 'undefined') {
                        if(typeof objTweet.children[1].children[0].children[0].children[1].children[2] !== 'undefined') {
                            if(typeof objTweet.children[1].children[0].children[0].children[1].children[2].children[0] !== 'undefined') {
                                var arrClasses = objTweet.children[1].children[0].children[0].children[1].children[2].children[0].classList;
                                if(arrClasses.contains("Icon--verified")) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}


var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, callback){
        if( MutationObserver ){
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer){
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true });
        }
        else if( eventListenerSupported ){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    };
})();

// Observe a specific DOM element:
var objTwitterFakeAccount = new TwitterFakeAccount();
var objWorker = new Worker(chrome.runtime.getURL('/js/workers/TwitterFakeAccount.js'));

let objCachedBadges = {
    "whitelist": [],
    "blacklist": [],
    "neutral": [],
    "influence_score": []
};

let arrWhitelistedAccountIds = [];
let arrBlacklistedAccountIds = [];
let arrNeutralAccountIds = [];
let arrInfluenceScore = [];
var intTweetCounter = 0;

chrome.runtime.sendMessage({func: "twitter_validation"}, function(objResponse) {
    if(objResponse.resp == 1) {

        // If they click on the Home button which draws them to the top of the page
        if(document.getElementById("global-nav-home")) {
            document.getElementById("global-nav-home").addEventListener("click", doTwitterBadges.bind(objCachedBadges));
        }
        // If anything on the DOM changes
        observeDOM( document.getElementsByTagName('body')[0], doTwitterBadges.bind(objCachedBadges));

        function doTwitterBadges(){
            if(document.activeElement.classList.contains("tweet-box") === false) {
                if (document.getElementsByClassName("tweet")) {
                    var arrTweets = objTwitterFakeAccount.getTweets();

                    intTweetCounter = arrTweets.length;

                    var arrTweetData = [];
                    for(var intCounter=0; intCounter<arrTweets.length; intCounter++) {

                        if(arrTweets[intCounter].classList.contains("ext-etheraddresslookup-tweet-"+arrTweets[intCounter].getAttribute("data-tweet-id")) === false) {

                            arrTweets[intCounter].classList.add("ext-etheraddresslookup-tweet-" + arrTweets[intCounter].getAttribute("data-tweet-id"));

                            let blContactBackground = true;

                            let arrTmpTweetData = {
                                "userId": arrTweets[intCounter].getAttribute("data-user-id"),
                                "name": arrTweets[intCounter].getAttribute("data-screen-name"),
                                "tweet_id": arrTweets[intCounter].getAttribute("data-tweet-id"),
                                "twitter_verified":  objTwitterFakeAccount.isTwitterVerified(arrTweets[intCounter]),
                                "influence_score": -1
                            };

                            //See if we've already checked the userid (whitelist)
                            if(this.whitelist.indexOf(arrTmpTweetData.userId) > -1) {
                                blContactBackground = false;
                                objTwitterFakeAccount.doWhitelistAlert(arrTmpTweetData);

                                //See if we've already got the influence score
                                console.log("@@");
                                console.log(Object.keys(this.influence_score));
                                console.log(this.influence_score);
                                if(Object.keys(this.influence_score).indexOf(arrTmpTweetData.userId) > -1) {
                                    arrTmpTweetData.influence_score = this.influence_score[arrTmpTweetData.userId];
                                    objTwitterFakeAccount.doInfluenceScore(arrTmpTweetData); 
                                }
                            }

                            //See if we've already checked the userid (blacklist)
                            if(this.blacklist.indexOf(arrTmpTweetData.userId) > -1) {
                                blContactBackground = false;
                                objTwitterFakeAccount.doBlacklistAlert(arrTmpTweetData);
                            }

                            //See if we've already checked the userid (neutral)
                            if(this.neutral.indexOf(arrTmpTweetData.userId) > -1) {
                                blContactBackground = false;
                                objTwitterFakeAccount.doNeutralAlert(arrTmpTweetData);
                            }

                            if(blContactBackground) {
                                arrTweetData.push(arrTmpTweetData);
                            }
                        }
                    }

                    var objDataToInspect = {
                        "whitelist": {},
                        "blacklist": {},
                        "tweet_data": arrTweetData
                    };

                    if(arrTweetData.length) {
                        chrome.runtime.sendMessage({func: "twitter_lists"}, function(objResponse) {
                            let twitterlists = JSON.parse(objResponse.resp);

                            this.whitelist = twitterlists.whitelist;
                            this.blacklist = twitterlists.blacklist;
                            this.influence_score = twitterlists.influence_score.list;
                            
                            console.log("___LIST____");
                            console.log(twitterlists.influence_score.list);

                            objWorker.postMessage(JSON.stringify(this));
                        }.bind(objDataToInspect));
                    }
                }
            }
        };
    }
});

objWorker.onmessage = function (event) 
{
    var arrData = JSON.parse(event.data);

    for(var intCounter=0; intCounter<arrData.length; intCounter++) {

        if(arrData[intCounter].is_imposter) {
            if(arrData[intCounter].twitter_verified === false) {
                objTwitterFakeAccount.doWarningAlert(arrData[intCounter]);
            }
        }

        if(arrData[intCounter].is_whitelisted) {
            objCachedBadges["whitelist"].push(arrData[intCounter].userId);
            objTwitterFakeAccount.doWhitelistAlert(arrData[intCounter]);

            if(arrData[intCounter].influence_score) {
                var objIs = new Object;
                objIs.arrData[intCounter].userId = arrData[intCounter].influence_score;
                objCachedBadges["influence_score"].push(objIs);
                objTwitterFakeAccount.doInfluenceScore(arrData[intCounter]);
            }

            continue;
        }

        if(arrData[intCounter].is_blacklisted) {
            objCachedBadges["blacklist"].push(arrData[intCounter].userId);
            objTwitterFakeAccount.doBlacklistAlert(arrData[intCounter]);
            continue;
        }

        objCachedBadges["neutral"].push(arrData[intCounter].userId);
        objTwitterFakeAccount.doNeutralAlert(arrData[intCounter]);
    }
};