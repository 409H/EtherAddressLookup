let objBrowser = chrome ? chrome : browser;

class EtherAddressLookup {

    constructor()
    {
        console.log("Init EAL");
        this.setDefaultExtensionSettings();
        this.init();
    }

    setDefaultExtensionSettings()
    {
        this.blHighlight = false;
        this.strBlockchainExplorer = "https://etherscan.io/address";

        this.intSettingsCount = 0;
        this.intSettingsTotalCount = 2;
    }

    /**
     * @name init
     * @desc Gets extension settings and applies DOM manipulation
     */
    init()
    {
        let objBrowser = chrome ? chrome : browser;
        //Get the highlight option for the user
        objBrowser.runtime.sendMessage({func: "highlight_option"}, function(objResponse) {
            if(objResponse && objResponse.hasOwnProperty("resp")) {
                this.blHighlight = (objResponse.resp == 1);
            }
            ++this.intSettingsCount;
        }.bind(this));

        //Get the blockchain explorer for the user
        objBrowser.runtime.sendMessage({func: "blockchain_explorer"}, function(objResponse) {
            this.strBlockchainExplorer = objResponse.resp;
            ++this.intSettingsCount;
        }.bind(this));

        //Update the DOM once all settings have been received...
        setTimeout(function() {
            // Needs to happen after user settings have been collected
            // and in the context of init();
            this.setSearchAndReplaceSettings();
            this.setWarningSettings();
            this.manipulateDOM();
        }.bind(this), 10);
    }

    /**
     * @name Set Search And Replace Settings
     * @desc
     */
    setSearchAndReplaceSettings()
    {
        // Check user is on their favourite block explorer, on fail target blank.
        this.target = (this.isBlockchainExplorerSite() ? '_self' : '_blank');

        // Register RegEx Patterns
        this.regExPatterns = [
            // Ethereum Address Regex
            /(^|\s|:|-)((?:0x)[0-9a-fA-F]{40})(\s|$)/gi,

            // ENS Address Regex
            /([a-z0-9][a-z0-9-\.]+[a-z0-9](?:\.eth))(\s|$)/gi
        ];

        // Register RegEx Matching Patterns
        this.matchPatterns = [
            // Ethereum Match Pattern
            /((?:0x)[0-9a-fA-F]{40})/gi,

            // ENS Match Pattern
            this.regExPatterns[1]
        ];

        // Register Replace Patterns
        this.replacePatterns = [
            // Ethereum Address Replace
            '$1<a title="See this address on the blockchain explorer" ' +
            'href="' + this.strBlockchainExplorer + '/$2" ' +
            'class="ext-etheraddresslookup-link" ' +
            'target="'+ this.target +'">' +
            '<div class="ext-etheraddresslookup-blockie" data-ether-address="$2" ></div> $2' +
            '</a>$3',

            // ENS Address Replace
            '<a title="See this address on the blockchain explorer" ' +
            'href="' + this.strBlockchainExplorer + '/$1" ' +
            'class="ext-etheraddresslookup-link" ' +
            'target="'+ this.target +'">$1</a>$2'
        ];
    }

    /**
     * @name Set Warning Settings
     * @desc
     */
    setWarningSettings()
    {
        // The block explorers that can handle ENS addresses
        this.ENSCompatiableExplorers = [
            "https://etherscan.io/address",
            "https://etherchain.org/account"
        ];

        // Does the user's favorite explorer support an ENS address
        for(var i=0; i<this.ENSCompatiableExplorers.length; i++){
            if(this.strBlockchainExplorer == this.ENSCompatiableExplorers[i]){
                this.ENSCompatiable = true;
                break;
            }
            this.ENSCompatiable = false;
        }

        // On failure give the user a warning.
        if(!this.ENSCompatiable){
            this.replacePatterns[1] = '<a title="Notification! We have spotted an ENS address, your current block explorer can\'t parse this address. Please choose a compatible block explorer." ' +
                'class="ext-etheraddresslookup-link ext-etheraddresslookup-warning" href="#">$1</a>$2';
        }
    }

    manipulateDOM()
    {
        if(true || this.intSettingsCount === this.intSettingsTotalCount) {
            if(this.blBlacklistDomains) {
                this.blacklistedDomainCheck();
            }
            this.convertAddressToLink();
        }
    }

    /**
     * @name Convert Address To Link
     * @desc Finds Ethereum addresses and converts to a link to a block explorer
     */
    convertAddressToLink()
    {
        var arrWhitelistedTags = ["code", "span", "p", "td", "li", "em", "i", "b", "strong", "small"];

        //Get the whitelisted nodes
        for(var i=0; i<arrWhitelistedTags.length; i++) {
            var objNodes = document.getElementsByTagName(arrWhitelistedTags[i]);
            //Loop through the whitelisted content
            for(var x=0; x<objNodes.length; x++) {

                if(this.hasIgnoreAttributes(objNodes[x])){
                    continue;
                }

                this.convertAddresses(objNodes[x]);
            }
        }

        this.tidyUpSlots();
        this.addBlockies();

        if(this.blHighlight) {
            this.addHighlightStyle();
        }
    }

    /**
     * @name Convert Addresses
     * @desc Takes a Node and checks if any of its children are textNodes. On success replace textNode with slot node
     * @desc slot node contains regex replaced content; see generateReplacementContent()
     * @param {Node} objNode
     */
    convertAddresses(objNode)
    {
        // Some nodes have non-textNode children
        // we need to ensure regex is applied only to text otherwise we will mess the html up
        for(var i=0; i < objNode.childNodes.length; i++){
            // Only check textNodes to prevent applying RegEx against element attributes
            if(objNode.childNodes[i].nodeType == 3){ // nodeType 3 = a text node

                var child = objNode.childNodes[i];
                var childContent = child.textContent;

                // Only start replacing stuff if the we get a RegEx match.
                if(this.isPatternMatched(childContent)) {
                    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot
                    var replacement = document.createElement('slot');
                    replacement.setAttribute('class', 'ext-etheraddresslookup-temporary');
                    replacement.innerHTML = this.generateReplacementContent(childContent);
                    objNode.replaceChild(replacement, child);
                }
            }
        }
    }

    /**
     * @name Generate Replacement Content
     * @desc Takes string and replaces any regex pattern matches with the associated replace patterns
     * @param {string} content
     * @returns {string}
     */
    generateReplacementContent(content)
    {
        for(var i=0; i < this.regExPatterns.length; i++){
            content = content.replace(this.regExPatterns[i], this.replacePatterns[i]);
        }
        return content;
    }

    /**
     * @name Has Ignore Attributes
     * @desc Checks if a node contains any attribute that we want to avoid manipulating
     * @param {Element} node
     * @returns {boolean}
     */
    hasIgnoreAttributes(node)
    {
        var ignoreAttributes = {
            "class": ["ng-binding"]
        };

        // Loop through all attributes we want to test for ignoring
        for(var attributeName in ignoreAttributes){
            // Filter out the object's default properties
            if (ignoreAttributes.hasOwnProperty(attributeName)) {

                // Check this node has the attribute we are currently checking for
                if(node.hasAttribute(attributeName)){

                    // This node's value for the attribute we are checking
                    var nodeAttributeValue = node.getAttribute(attributeName);
                    // The values we want to ignore for this attribute
                    var badAttributeValueList = ignoreAttributes[attributeName];

                    // Loop through the attribute values we want to ignore
                    for(var i=0; i < badAttributeValueList.length; i++){
                        // If we find an indexOf, this value is present in the attribute
                        if(nodeAttributeValue.indexOf(badAttributeValueList[i]) !== -1){
                            return true;
                        }
                    }

                }

            }
        }

        return false;
    }

    /**
     * @name Is Pattern Matched
     * @desc Checks content matches any of the object's matchPatterns
     * @param {string} content
     * @returns {boolean}
     */
    isPatternMatched(content)
    {
        for(var i=0; i < this.matchPatterns.length; i++){
            if(this.matchPatterns[i].exec(content) !== null){
                return true;
            }
        }
        return false;
    }

    /**
     * @name Is Blockchain Explorer Site
     * @desc Check if the current website is the user's selected block explorer
     * @returns {boolean}
     */
    isBlockchainExplorerSite()
    {
        var objBlockchainExplorer = document.createElement("a");
        objBlockchainExplorer.href = this.strBlockchainExplorer;
        return (objBlockchainExplorer.hostname === window.location.hostname);
    }

    /**
     * @name Tidy Slots
     * @desc Searches document for slots adds the slot's child nodes to its parent then removes the slot
     */
    tidyUpSlots()
    {
        var slots = document.querySelectorAll("slot.ext-etheraddresslookup-temporary");
        for(var i=0; i < slots.length; i++){
            while(slots[i].childNodes.length > 0){
                slots[i].parentNode.insertBefore(slots[i].firstChild, slots[i]);
            }
            slots[i].parentNode.removeChild(slots[i]);
        }
    }

    addBlockies()
    {
        var blockieDivs = document.querySelectorAll("div.ext-etheraddresslookup-blockie");
        for(var i = 0; i < blockieDivs.length; i++){

            blockieDivs[i].style.backgroundImage = 'url(' + blockies.create({
                // toLowerCase is used because standard blockies are based on none-checksum Ethereum addresses
                seed:blockieDivs[i].getAttribute('data-ether-address').toLowerCase(),
                size: 8,
                scale: 16
            }).toDataURL() +')';
        }
    }

    //Removes the highlight style from Ethereum addresses
    removeHighlightStyle()
    {
        var objEtherAddresses = document.getElementsByClassName("ext-etheraddresslookup-link");
        for (var i = 0; i < objEtherAddresses.length; i++) {
            objEtherAddresses[i].classList.add("ext-etheraddresslookup-link-no_highlight");
            objEtherAddresses[i].classList.add("ext-etheraddresslookup-link-highlight");
        }
        return false;
    }

    //Adds the highlight style
    addHighlightStyle()
    {
        var objEtherAddresses = document.getElementsByClassName("ext-etheraddresslookup-link");
        for (var i = 0; i < objEtherAddresses.length; i++) {
            objEtherAddresses[i].classList.add("ext-etheraddresslookup-link-highlight");
            objEtherAddresses[i].classList.remove("ext-etheraddresslookup-link-no_highlight");
        }
        return false;
    }
}

window.addEventListener("load", function() {
    let objEtherAddressLookup = new EtherAddressLookup();
});

//Send message from the extension to here.
objBrowser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let objEtherAddressLookup = new EtherAddressLookup();
        if(typeof request.func !== "undefined") {
            if(typeof objEtherAddressLookup[request.func] == "function") {
                objEtherAddressLookup[request.func]();
                sendResponse({status: "ok"});
                return true;
            }
        }
        sendResponse({status: "fail"});
    }
);
