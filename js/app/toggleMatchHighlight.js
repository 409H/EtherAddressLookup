//On page load it checks/unchecks the checkbox
(function() {
    refreshHighlightOption();
})();

//Sets the local storage to remember their match highlight settings
function toggleMatchHighlight() {
    var objShowHighlight = document.getElementById("ext-etheraddresslookup-show_style");
    var intShowHighlight = objShowHighlight.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-show_style", intShowHighlight);

    refreshHighlightOption();
}

function refreshHighlightOption() {
    var intShowHighlight = localStorage.getItem("ext-etheraddresslookup-show_style");
    document.getElementById("ext-etheraddresslookup-show_style").checked = (intShowHighlight == 1 ? true : false);
    //Notify the tab to do a class method
    var strMethod = (intShowHighlight == 1 ? "addHighlightStyle" : "removeHighlightStyle");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            "func":strMethod
        }, function(response) {
            consoleLogger.log(response);
        });
    });
}