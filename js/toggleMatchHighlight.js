//On page load it checks/unchecks the checkbox
(function() {
    var intShowHighlight = localStorage.getItem("ext-etheraddresslookup-show_style");
    document.getElementById("ext-etheraddresslookup-show_style").checked = (intShowHighlight == 1 ? true : false);
    //Notify the tab to do a class method
    var strMethod = (intShowHighlight == 1 ? "addHighlightStyle" : "removeHighlightStyle");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //Construct & send message
        chrome.tabs.sendMessage(tabs[0].id, {
            "func":strMethod
        }, function(response) {
            console.log(response);
        });
    });
})();

//Sets the local storage to remember their match highlight settings
function toggleMatchHighlight() {
    var objShowHighlight = document.getElementById("ext-etheraddresslookup-show_style");
    var intShowHighlight = objShowHighlight.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-show_style", intShowHighlight);

    //Notify the tab to do a class method
    if(intShowHighlight == 1) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            //Construct & send message
            chrome.tabs.sendMessage(tabs[0].id, {
                "func":"addHighlightStyle"
            }, function(response) {
                console.log(response);
            });
        });
    } else {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            //Construct & send message
            chrome.tabs.sendMessage(tabs[0].id, {
                "func":"removeHighlightStyle"
            }, function(response) {
                console.log(response);
            });
        });
    }
}