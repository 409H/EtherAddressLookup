const TWITTER_CHECKBOX_SELECTOR = '[name="ext-etheraddresslookup-twitter_validation"]';

//Sets the local storage to remember their match highlight settings
function toggleTwitterValidation()
{
    var objTwitterValidation = document.querySelector(TWITTER_CHECKBOX_SELECTOR);
    var intTwitterValidation = objTwitterValidation.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-twitter_validation", intTwitterValidation);

    refreshTwittertOption();
}

function refreshTwittertOption()
{
    var objBrowser = chrome ? chrome : browser;
    var intTwitterValidation;
    if(localStorage.getItem("ext-etheraddresslookup-twitter_validation") === null) {
        intTwitterValidation = true;
    } else {
        intTwitterValidation = localStorage.getItem("ext-etheraddresslookup-twitter_validation");
    }

    if(intTwitterValidation) {
        setInterval(() => {
            getTwitterLists();
        }, 3000);
    }

    document.querySelector(TWITTER_CHECKBOX_SELECTOR).checked = (intTwitterValidation == 1 ? true : false);
}

function getTwitterLists()
{
    //See when they were last fetched
    let twitter_lists = {
        "last_fetched": 0,
        "whitelist": [],
        "blacklist": []
    };

    if(localStorage.getItem("ext-etheraddresslookup-twitter_lists")) {
        let saved_settings = JSON.parse(localStorage.getItem("ext-etheraddresslookup-twitter_lists"));
        twitter_lists.last_fetched = saved_settings.last_fetched;
    }

    if((Math.floor(Date.now() - twitter_lists.last_fetched)) > 600*1000) {
        fetch("https://raw.githubusercontent.com/MrLuit/EtherScamDB/master/_data/twitter.json")
        .then(res => res.json())
        .then((lists) => {
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

            localStorage.setItem("ext-etheraddresslookup-twitter_lists", JSON.stringify(twitter_lists));
        });
    }
}

window.addEventListener('load', function() {
    document.querySelector(TWITTER_CHECKBOX_SELECTOR).addEventListener('click', toggleTwitterValidation);
    refreshTwittertOption();
});