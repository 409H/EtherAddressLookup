class TwitterFakeAccount
{

    constructor()
    {
        this.intMaxEditDistance = 1;
        this.arrAllTwitterUsernames = [];
        this.objWhitelistedHandles = [];
        this.objBlacklistedHandles = [];
        this.arrViewBlacklistedUserIds = [];
        this.arrViewWhitelistedUserIds = [];
        this.intTweetCount = 0;
    }

    setWhitelist(arrWhitelist)
    {
        this.objWhitelistedHandles = arrWhitelist;
    }

    setBlacklist(arrBlacklist)
    {
        this.objBlacklistedHandles = arrBlacklist;
    }

    /**
     * Checks to see if a userid/username is an "imposter" of a whitelisted one.
     *
     * @param   int         intUserId           The twitter userid
     * @param   string      strUsername         The twitter username
     * @return  object                          IE: {"result":true,"similar_to":"xxxx"} or {"result":false}
     */
    isImposter(intUserId, strUsername)
    {

        //idk why sometimes it's null...
        if(intUserId === null) {
            return {
                "result":false
            };
        }

        //Check the userid against the whitelist
        if(Object.keys(this.objWhitelistedHandles).length) {
            for(var intKey in this.objWhitelistedHandles) {
                if (intUserId === this.objWhitelistedHandles[intKey]) {
                    return {
                        "result": false,
                        "whitelisted": true
                    };
                }
            }
        }

        //Check the userid against the blacklist 
        if(Object.keys(this.objBlacklistedHandles).length) {
            for(var intKey in this.objBlacklistedHandles) {
                if (intUserId === this.objBlacklistedHandles[intKey]) {
                    return {
                        "result": false,
                        "blacklisted": false
                    };
                }
            }
        }

        return {
            "result":false
        };
    }
}

self.onmessage = function(objData) {
    var objTwitterFakeAccount = new TwitterFakeAccount();
    var objRequest = JSON.parse(objData.data);
    var arrTweetData = objRequest.tweet_data;
    objTwitterFakeAccount.setWhitelist(objRequest.whitelist);
    objTwitterFakeAccount.setBlacklist(objRequest.blacklist);

    for(var intCounter=0; intCounter<arrTweetData.length; intCounter++) {
        var objTweetData = arrTweetData[intCounter];
        var objImposter = objTwitterFakeAccount.isImposter(objTweetData.userId, objTweetData.name);
        if(objImposter.result) {
            objTweetData.is_imposter = true;
            objTweetData.similar_to = objImposter.similar_to;
        } else {
            objTweetData.is_imposter = false;
        }

        if(objImposter.hasOwnProperty("whitelisted")) {
            objTweetData.is_whitelisted = true;
        } else {
            objTweetData.is_whitelisted = false;
        }

        if(objImposter.hasOwnProperty("blacklisted")) {
            objTweetData.is_blacklisted = true;
        } else {
            objTweetData.is_blacklisted = false;
        }
        
        arrTweetData[intCounter] = objTweetData;
    }

   postMessage(JSON.stringify(arrTweetData));

};