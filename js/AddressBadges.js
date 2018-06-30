(function() {

    //@todo - check the user options!
    objBrowser.runtime.sendMessage({func: "address_badges"}, function(objResponse) {
        let objSettings = JSON.parse(objResponse.resp);

        if(objSettings.enabled == 0) {
            return;
        }

        const blEtherScamDb = objSettings.etherscamdb.enabled;

        let objEsdbBadge = document.createElement("div");
        objEsdbBadge.id = "esd-address-verify";

        let objEalBadge = document.createElement("div");
        objEalBadge.id = "eal-address-verify";

        switch(window.location.host) {
            case 'mycrypto.com':
                return MyCryptoAddressBadges();
                break;
            case 'etherscan.io':
                return EtherscanAddressBadges();
                break;
            default:
                //Do nothing
                break;
        }

        function MyCryptoAddressBadges()
        {
            objEsdbBadge.style = "padding-top:1em;text-align:center;height:50px;width:25px;margin-top:1em;float:left;margin-right:1em;";
            objEalBadge.style = "padding-top:1em;text-align:center;height:50px;width:30px;margin-top:1em;float:right;margin-left:1em;";

            let objEsdbInterval = setInterval(() => {
                let objIdenticon;
                let objAddressTo;
        
                //MyCrypto
                if(window.location.href == "https://mycrypto.com/account/send") {
                    if(document.querySelector('input.input-group-input')) {
                        objIdenticon = document.querySelector("div.AddressInput-identicon");
                        objAddressTo = document.querySelectorAll('input.input-group-input')[0];
        
                        if(!objIdenticon.contains(objEsdbBadge)) {
                            objIdenticon.appendChild(objEsdbBadge);
                        }

                        if(!objIdenticon.contains(objEalBadge)) {
                            objIdenticon.appendChild(objEalBadge);
                        }
        
                        if(blEtherScamDb) {
                            objAddressTo.addEventListener('keyup', EtherScamDbValidateAddress);
                        }

                        objAddressTo.addEventListener('keyup', isAddressLabel);

                        clearInterval(objEsdbInterval);
                    }
                }
        
            }, 1000);
        }
        
        function EtherscanAddressBadges()
        {
            objEsdbBadge.style = "position: relative;float:left;margin-right:1em;";
            objEalBadge.style = "position: relative;float:left;margin-right:1em;";

            let objHeader;
            let objAddressTo;
        
            //Etherscan
            if(document.querySelector('span#mainaddress')) {
                objHeader = document.querySelector("span#mainaddress");
                strAddress = document.querySelector('span#mainaddress').innerText.trim();

                if(!objHeader.contains(objEsdbBadge)) {
                    objHeader.appendChild(objEsdbBadge);
                }

                if(!objHeader.contains(objEalBadge)) {
                    objHeader.appendChild(objEalBadge);
                }

                //Now inject a hidden input on the page
                let objAddressInput = document.createElement("input");
                objAddressInput.style = "display:none";
                objAddressInput.value = strAddress.toLowerCase();

                if(blEtherScamDb) {
                    objAddressInput.addEventListener('change', EtherScamDbValidateAddress);
                }

                objAddressInput.addEventListener('change', isAddressLabel);

                objAddressInput.dispatchEvent(new Event('change', { 'bubbles': true }))
            }
        }

        function isAddressLabel()
        {
            let addr = this.value.trim();

            if(!document.getElementById("eal-address-verify")) {
                return false;
            }

            if(!(new RegExp("^0x[a-fA-F0-9]{40}$").exec(addr))) {
                document.getElementById("eal-address-verify").innerHTML = "";
                return false;
            }

            if(false) { //@todo - check the labels on local storage
                return addressIsEalLabelled();
            }
        }

        function addressIsEalLabelled()
        {
            document.getElementById("eal-address-verify").innerHTML = `
                <?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <svg width="30.555px" height="50px" viewBox="0 0 610 1000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
                    <g transform="matrix(7.55254,0,0,7.55254,-596.311,18.3404)">
                        <g id="Ether">
                            <g>
                                <g>
                                    <g transform="matrix(1,0,0,1,0,0.990842)">
                                        <path d="M119.276,81.519L152.508,66.287L119.276,117.519L86.044,66.287L119.276,81.519Z" style="fill:url(#_Linear1);"/>
                                    </g>
                                    <g transform="matrix(1.05421,0,0,1.05421,-6.46769,-2.92141)">
                                        <path d="M153.942,61.709L140.996,42.233L155.567,60.996L155.523,61.017L153.726,63.806L119.306,79.227L84.885,63.806L83.088,61.017L83.044,60.996L97.615,42.233L84.669,61.709L119.306,77.227L153.942,61.709Z" style="fill:rgb(20,100,185);"/>
                                    </g>
                                    <g transform="matrix(1,0,0,1,-80.8128,-0.064499)">
                                        <path d="M234.011,61.456L200.279,76.568L166.547,61.456L200.279,9.104L234.011,61.456Z" style="fill:url(#_Linear2);"/>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                    <defs>
                        <linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(2.21657e-15,36.1993,-36.1993,2.21657e-15,119.291,81.6952)"><stop offset="0" style="stop-color:rgb(23,67,112);stop-opacity:1"/><stop offset="1" style="stop-color:black;stop-opacity:1"/></linearGradient>
                        <linearGradient id="_Linear2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(4.04697e-15,-66.092,66.092,4.04697e-15,200.343,75.9982)"><stop offset="0" style="stop-color:rgb(20,100,185);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(81,156,236);stop-opacity:1"/></linearGradient>
                    </defs>
                </svg>
            `;
        }
    });
})();