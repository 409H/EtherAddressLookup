//On page load it checks/unchecks the checkbox
(function() {
    refreshBookmarksOption();
    showBookmarks();

    //Check to see if we are on settings.html
    if(document.getElementById("ext-etheraddresslookup-show_bookmarks")) {
        document.getElementById("ext-etheraddresslookup-show_bookmarks").addEventListener("change", toggleBookmarks);

        var objModifyBookmarks = document.getElementsByClassName("ext-etheraddresslookup-bookmarks_modify");
        for(var i = 0; i < objModifyBookmarks.length; i++) {
            objModifyBookmarks[i].addEventListener("click", showModifyWindow, false);
        }
    }
})();

//Sets the local storage to remember their match highlight settings
function toggleBookmarks()
{
    var objShowBookmarks = document.getElementById("ext-etheraddresslookup-show_bookmarks");
    var intShowBookmarks = objShowBookmarks.checked ? 1 : 0;
    localStorage.setItem("ext-etheraddresslookup-show_bookmarks", intShowBookmarks);

    refreshBookmarksOption();
}

function refreshBookmarksOption()
{
    var intShowBookmarks = localStorage.getItem("ext-etheraddresslookup-show_bookmarks");

    if(document.getElementById("ext-etheraddresslookup-show_bookmarks")) {
        document.getElementById("ext-etheraddresslookup-show_bookmarks").checked = (intShowBookmarks == 1 || intShowBookmarks === null ? true : false);
        document.getElementById("ext-etheraddresslookup-show_bookmarks_text").innerText = (intShowBookmarks == 1 || intShowBookmarks === null ? "Enabled" : "Disabled");
    }

    if(document.getElementById("ext-etheraddresslookup-bookmarks")) {
        document.getElementById("ext-etheraddresslookup-bookmarks").style.display = (intShowBookmarks == 1 || intShowBookmarks === null ? "block" : "none");
    }
}

/**
 * Fetches the bookmarks from LocalStorage (or default)
 */
function getBookmarks()
{
    var strBookmarks = localStorage.getItem("ext-etheraddresslookup-bookmarks");
    //No bookmarks have been set, set the default ones.
    if(strBookmarks === null) {
        var arrBookmarks = new Array();
        arrBookmarks.push({
            "icon": "https://www.google.com/s2/favicons?domain=https://mycrypto.com",
            "url": "https://mycrypto.com"
        });
        arrBookmarks.push({
            "icon": "images/bookmarks/etherscan.png",
            "url": "https://etherscan.io"
        });
        arrBookmarks.push({
            "icon": "images/bookmarks/etherchain.jpg",
            "url": "https://etherchain.org"
        });
        arrBookmarks.push({
            "icon": "images/bookmarks/ethplorer.jpg",
            "url": "https://ethplorer.io"
        });
        arrBookmarks.push({
            "icon": "images/bookmarks/rethereum.png",
            "url": "https://reddit.com/r/ethereum"
        });
        arrBookmarks.push({
            "icon": "images/bookmarks/rethtrader.png",
            "url": "https://reddit.com/r/ethtrader"
        });
    } else {
        arrBookmarks = JSON.parse(strBookmarks);
    }

    return arrBookmarks;
}

/**
 * Renders the bookmarks for options.html and settings.html
 */
function showBookmarks()
{
    var arrBookmarks = getBookmarks();

    //We are on the settings view
    if(document.getElementById("ext-etheraddresslookup-bookmarks_table")) {
        for (var i = 0; i < arrBookmarks.length; i++) {
            var objTable = document.getElementById("ext-etheraddresslookup-bookmarks_table").getElementsByTagName("tbody")[0];
            var objRow = objTable.insertRow(objTable.rows.length);

            //Show the icon
            var objCellIcon = objRow.insertCell(0);
            objCellIcon.appendChild(document.createTextNode(""));
            if( arrBookmarks[i].icon.length > 0 ) {
                objCellIcon.innerHTML = "<img src='" + arrBookmarks[i].icon + "' class=\"ext-etheraddresslookup-bookmark_icon\" />";
            }

            //Show the link
            var objCellLink = objRow.insertCell(1);
            objCellLink.appendChild(document.createTextNode(arrBookmarks[i].url));
            if( arrBookmarks[i].url.length === 0 ) {
                objCellLink.innerHTML = "<span class='ext-etheraddresslookup-note'>Unused bookmark</span>";
            }

            //Add a modify links
            var objCellModify = objRow.insertCell(2);
            objCellModify.appendChild(document.createTextNode(""));
            objCellModify.innerHTML = "<button class='ext-etheraddresslookup-bookmarks_modify' data-id='"+ i +"'>Modify</button>";
        }
    }

    if(document.getElementById("ext-etheraddresslookup-bookmarks")) {
        for (let i = 0; i < arrBookmarks.length; i++) {
            if(arrBookmarks[i].icon.length === 0) {
                continue;
            }
            var objLink = document.createElement("span");
            objLink.className = 'ext-etheraddresslookup-bookmark_icon';
            objLink.innerHTML = "<a href='"+ arrBookmarks[i].url +"' target='_blank'><img src='"+ arrBookmarks[i].icon +"' title='"+ arrBookmarks[i].url +"' class=\"ext-etheraddresslookup-bookmark_icon\"></a>";
            document.getElementById("ext-etheraddresslookup-bookmarks").appendChild(objLink);
        }
    }
}

/**
 * Shows the modify bookmark window
 */
function showModifyWindow()
{
    var intBookmarkId = this.getAttribute("data-id");
    var objBookmarks = getBookmarks();
    document.getElementById("ext-etheraddresslookup-bookmark_modify_id").value = intBookmarkId;
    document.getElementById("ext-etheraddresslookup-bookmark_modify_icon").value = objBookmarks[intBookmarkId].icon;
    document.getElementById("ext-etheraddresslookup-bookmark_modify_url").value = objBookmarks[intBookmarkId].url;
        document.getElementById("ext-etheraddresslookup-bookmark_modify_form").setAttribute("data-id", intBookmarkId);
    document.getElementById("ext-etheraddresslookup-bookmark_modify_form").addEventListener('submit', function(objEvent) {
        objEvent.preventDefault();
        var intId = document.getElementById("ext-etheraddresslookup-bookmark_modify_id").value;

        //See if the icon is blank
        var strIconLink = document.getElementById("ext-etheraddresslookup-bookmark_modify_icon").value;
        if(document.getElementById("ext-etheraddresslookup-bookmark_modify_icon").value === "") {
            strIconLink = "https://www.google.com/s2/favicons?domain="+ document.getElementById("ext-etheraddresslookup-bookmark_modify_url").value;
        }

        objBookmarks[intId] = {
            "icon": strIconLink,
            "url": document.getElementById("ext-etheraddresslookup-bookmark_modify_url").value
        };

        localStorage.setItem("ext-etheraddresslookup-bookmarks", JSON.stringify(objBookmarks));
        location.reload();
        return false;
    }.bind(objBookmarks));

    document.getElementById("ext-etheraddresslookup-bookmark_modify_remove").addEventListener('click', function(objEvent) {
        objEvent.preventDefault();
        var intId = document.getElementById("ext-etheraddresslookup-bookmark_modify_id").value;
        objBookmarks[intId] = {
            "icon": "",
            "url": ""
        };

        localStorage.setItem("ext-etheraddresslookup-bookmarks", JSON.stringify(objBookmarks));
        location.reload();
        return false;
    }.bind(objBookmarks));

    document.getElementById("ext-etheraddresslookup-bookmark_modify_window").style.display = "block";
}