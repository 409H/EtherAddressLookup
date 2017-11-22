## EtherAddressLookup

#### Automatically adds links to strings that look like Ethereum addresses so you can quickly look them up on your favourite block explorer. 

#### Prevents you from interacting with known phishing domains by wiping the DOM and displaying text notifying you.

The blacklists found in this repo serve both the EAL Chrome Extension & MetaMask Chrome Extension. We use a [Levenshtein distance algoritm](https://en.wikipedia.org/wiki/Levenshtein_distance) to detect similar URLs, so if you encounter an errounously-blocked website, please add it to the whitelist. 

Announcement Post: http://harrydenley.com/ethaddresslookup-chrome-extension-release/

Ether/ERC20 donation address: [`0x661b5dc032bedb210f225df4b1aa2bdd669b38bc`](https://etherscan.io/address/0x661b5dc032bedb210f225df4b1aa2bdd669b38bc)

#### Install Chrome Extension Here: https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn

## Found a Phishing URL? Is your website getting erroneously blocked? You have the power to fix it, not just talk about it!

As a community resource, everyone is encouraged to make a PR to add or update these lists. This process is far easier than you might imagine!

1. If you do not already have a Github account, sign up. (it's free and easy!)
2. Navigate to the file you would like to make the adjustment to by clicking it's name.
    - If a site is erroneously blacklisted you will likely want to **add** it to the whitelist. It probably isn't on the blacklist and got caught due to Levenstein distance algoritm.
    - If you see a scam website being passed around that isn't blockced, please **add** it to the blackliast.
3. Click the pencil icon in upper right.
4. Type `"yourdomain.com",` on line #2 (right below the first `[`)
5. Type `"www.yourdomain.com",` on line #3
6. Scroll to the bottom. under "Commit changes" enter a reason you are making this change.
    - Example: *"Adding myetherscam.com to blacklist. See [link to tweet / reddit post / screenshot]."*
    - You can also provide more details in the box below. Please provide as much detail / evidence as reasonable so reviewers can verify quickly.
7. Click the green "Propose File change" button.
8. This next page is a review of what you did. Proofread and stuff.
9. Click the "Create Pull Request" button.....twice.
10. That's it. You successfully made a new pull request and helped make the world a better place! Tell all your friends.


## Installations

### Chrome & Firefox Extension

The `master` branch is bundled on every release and pushed to the Chrome & Firefox Extension store, you can view/download it 
here: [https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn](https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn) for Chrome, and _coming soon_ for Firefox (though manual installation is supported - it's just not listed officially on the AMO site, going through review stages.).

(Note that this will have automatic updates)

### Manual Installation

#### Chrome
* Clone/download [the repo](https://github.com/409H/EtherAddressLookup).
* Go to [chrome://extensions](chrome://extensions) in Chrome
* Turn on developer mode.
* Load the `manifest.json` file by dragging and dropping.

#### Firefox
* Clone/download [the repo](https://github.com/409H/EtherAddressLookup).
* Go to [about:debugging](about:debugging) in Firefox
* Click "Load Temporary Add-on"
* Browse to the downloaded repo, and double click `manifest.json`

(Note that this will **not** have automatic updates)

## Blacklisted Domains

The blacklist can only be updated by myself (@409H) and MyEtherWallet (@tayvano). This is a to prevent anyone
from modifying the blacklist (ie: removing something). To request a change to the 
blacklist, please [open an issue](https://github.com/409H/EtherAddressLookup/issues/new) or open
a [pull request](https://github.com/409H/EtherAddressLookup/compare) with the changes. Make sure you give some
details on why the changes are needed.

## Whitelisted Domains

The whitelist can only be updated by myself (@409H) and MyEtherWallet (@tayvano). The whitelist will prevent any false-positives
from happening with the Levenshtein algo (special thanks to @sogoiii). If you find a domain that is wrongly blacklisted, then please
[open an issue](https://github.com/409H/EtherAddressLookup/issues/new) or open
a [pull request](https://github.com/409H/EtherAddressLookup/compare) with the changes.

## Special Thanks

* Thanks to the team at MyEtherWallet for helping keep the domain blacklist up-to-date!
* Thanks to the team at [Cryptominded](https://cryptominded.com/) for the store graphics!
* Thanks to MrLuit for providing [https://etherscamdb.info](https://etherscamdb.info) and the report domain functionality (v1.5)

----

## Changelog

### v1.8

* Improved Levenshtien edit distance check for MyEtherWallet and punycode domains.

### v1.7

* Added the ability for EAL to check your browser history to see if you have been on a domain that has since been blacklisted.

### v1.6

* Added the ability to bookmark up to 6 domains with their favicon showing.

### v1.5

* Added report domain button.

### v1.4

* Added support for Firefox.

### v1.3

* Due to the recent phishing campaigns going on, we have decided to start a [domain blacklist](https://github.com/409H/EtherAddressLookup/blob/master/blacklists/domains.json), and 
the extension will try to help you from being phished by removing the ability for you to interact with the blacklisted 
domain by wiping the DOM and displaying a notice. This functionality is toggleable, but it's best to keep it on.
  * If you find a domain that look suspicious and/or confirmed stealing private keys/being malicious, send 
a [pull request](https://github.com/409H/EtherAddressLookup/compare) or [open an issue](https://github.com/409H/EtherAddressLookup/issues/new).

### v1.2

* You can now select your favourite blockchain explorer for links to direct you to.

### v1.0

* This extension will search the DOM for any Ether address (a hexidecimal string) and add a link to it to your favourite
blockchain explorer. It will give you the option to add a highlight option so you can easily find addresses.
