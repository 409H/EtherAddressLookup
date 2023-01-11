const TWITTER_CHECKBOX_SELECTOR = '[name="ext-etheraddresslookup-twitter_validation"]';

var LS = {
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
};

//Sets the local storage to remember their match highlight settings
async function toggleTwitterValidation()
{
    var objTwitterValidation = document.querySelector(TWITTER_CHECKBOX_SELECTOR);
    var intTwitterValidation = objTwitterValidation.checked ? 1 : 0;
    await LS.setItem("ext-etheraddresslookup-twitter_validation", intTwitterValidation);

    refreshTwittertOption();
}

async function refreshTwittertOption()
{
    var objBrowser = chrome || browser;
    var intTwitterValidation;
    const twitterValidation = await LS.getItem("ext-etheraddresslookup-twitter_validation");
    if(!twitterValidation) {
        intTwitterValidation = true;
    } else {
        intTwitterValidation = twitterValidation;
    }

    if(intTwitterValidation) {
        setInterval(() => {
            getTwitterLists();
        }, 3000);
    }

    document.querySelector(TWITTER_CHECKBOX_SELECTOR).checked = (intTwitterValidation == 1 ? true : false);
}

async function getTwitterLists()
{
    //See when they were last fetched
    let twitter_lists = {
        "last_fetched": 0,
        "whitelist": [],
        "blacklist": []
    };

    const twitterLists = await LS.getItem("ext-etheraddresslookup-twitter_lists");

    if(twitterLists) {
        let saved_settings = twitterLists;
        twitter_lists.last_fetched = saved_settings.last_fetched;
    }

    if((Math.floor(Date.now() - twitter_lists.last_fetched)) > 600*1000) {
        fetch("https://raw.githubusercontent.com/MrLuit/EtherScamDB/master/_data/twitter.json")
        .then(res => res.json())
        .then(async (lists) => {
            twitter_lists.last_fetched = Date.now();
            
            //We only need the Twitter IDs
            Object.entries(lists.whitelist).forEach(
                ([twitter_userid, screename]) => {
                    twitter_lists.whitelist.push(twitter_userid);
                }
            );

            Object.entries(lists.blacklist).forEach(
                ([twitter_userid, screename]) => {
                    twitter_lists.blacklist.push(twitter_userid);
                }
            );

            await LS.setItem("ext-etheraddresslookup-twitter_lists", JSON.stringify(twitter_lists));
        });
    }
}

window.addEventListener('load', function() {
    document.querySelector(TWITTER_CHECKBOX_SELECTOR).addEventListener('click', toggleTwitterValidation);
    refreshTwittertOption();
});