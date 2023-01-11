const HIGHLIGHT_CHECKBOX_SELECTOR = '[name="ext-etheraddresslookup-show_style"]';

var LS = {
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
};

//Sets the local storage to remember their match highlight settings
async function toggleMatchHighlight()
{
    var objShowHighlight = document.querySelector(HIGHLIGHT_CHECKBOX_SELECTOR);
    var intShowHighlight = objShowHighlight.checked ? 1 : 0;
    await LS.setItem("ext-etheraddresslookup-show_style", intShowHighlight);

    refreshHighlightOption();
}

async function refreshHighlightOption()
{
    var objBrowser = chrome || browser;
    var intShowHighlight = await LS.getItem("ext-etheraddresslookup-show_style");

    document.querySelector(HIGHLIGHT_CHECKBOX_SELECTOR).checked = (intShowHighlight == 1 ? true : false);
    //Notify the tab to do a class method
    var strMethod = (intShowHighlight == 1 ? "addHighlightStyle" : "removeHighlightStyle");

    objBrowser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        objBrowser.tabs.sendMessage(tabs[0].id, {
            "func":strMethod
        }, function(objResponse) {
            chrome.runtime.lastError;
            if(objResponse && objResponse.status) {
                console.log("Response from tab: " + objResponse.status);
            } else {
                console.log("Cannot "+ strMethod +" on tab.");
            }
        });
    });
}

window.addEventListener('load', function() {
    refreshHighlightOption();
});