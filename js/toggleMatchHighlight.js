//On page load it checks/unchecks the checkbox
document.addEventListener("DOMContentLoaded", function() {
    var intShowHighlight = localStorage.getItem("ext-etheraddresslookup-show_style");
    if(intShowHighlight == 1) {
        document.getElementById("ext-etheraddresslookup-show_style").checked = true;
        //Notify the tab to do a class method
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            //Construct & send message
            chrome.tabs.sendMessage(tabs[0].id, {
                "func":"addHighlightStyle"
            }, function(response) {
                console.log(response);
            });
        });
    } else {
        document.getElementById("ext-etheraddresslookup-show_style").checked = false;
        //Notify the tab to do a class method
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            //Construct & send message
            chrome.tabs.sendMessage(tabs[0].id, {
                "func":"removeHighlightStyle"
            }, function(response) {
                console.log(response);
            });
        });
    }
});

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