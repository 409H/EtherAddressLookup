## EtherAddressLookup

#### Automatically adds links to strings that look like Ethereum addresses so you can quickly look them up on your favourite block explorer. 

#### Prevents you from interacting with known phishing domains by wiping the DOM and displaying text notifying you.

The blacklists found in this repo serve both the EAL Chrome Extension & MetaMask Chrome Extension. We use a [Levenshtein distance algoritm](https://en.wikipedia.org/wiki/Levenshtein_distance) to detect similar URLs, so if you encounter an errounously-blocked website, please add it to the whitelist. 

Announcement Post: http://harrydenley.com/ethaddresslookup-chrome-extension-release/

Ether/ERC20 donation address: [`0x661b5dc032bedb210f225df4b1aa2bdd669b38bc`](https://etherscan.io/address/0x661b5dc032bedb210f225df4b1aa2bdd669b38bc)

#### Install Chrome Extension Here: https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn

#### Install Firefox Extension Here: https://addons.mozilla.org/en-US/firefox/addon/etheraddresslookup/

## Installations

### Chrome & Firefox Extension

The `master` branch is bundled on every release and pushed to the Chrome & Firefox Extension store, you can view/download it 
here: [https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn](https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn) for Chrome, and [https://addons.mozilla.org/en-US/firefox/addon/etheraddresslookup/](https://addons.mozilla.org/en-US/firefox/addon/etheraddresslookup/) for Firefox.

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


## Blacklisted Domains

The blacklist can only be updated by myself (@409H) and MyEtherWallet (@tayvano). This is a to prevent anyone
from modifying the blacklist (ie: removing something). To request a change to the 
blacklist, please [open an issue](https://github.com/409H/EtherAddressLookup/issues/new) or open
a [pull request](https://github.com/409H/EtherAddressLookup/compare) with the changes. Make sure you give some
details on why the changes are needed.

## Whitelisted Domains

The whitelist can only be updated by myself (@409H) and MyCrypto (@tayvano). The whitelist will prevent any false-positives
from happening with the Levenshtein algo (special thanks to @sogoiii). If you find a domain that is wrongly blacklisted, then please
[open an issue](https://github.com/409H/EtherAddressLookup/issues/new) or open
a [pull request](https://github.com/409H/EtherAddressLookup/compare) with the changes.

## Special Thanks

* Thanks to the team at MyCrypto for helping keep the domain blacklist up-to-date!
* Thanks to the team at [Cryptominded](https://cryptominded.com/) for the store graphics!
* Thanks to MrLuit for providing [https://etherscamdb.info](https://etherscamdb.info) and the report domain functionality (v1.5)
* Thanks to [Samyoul](https://github.com/Samyoul) for continued support and development!
* To everyone who reports bad domains to us through the various channels!
* Thanks to [danielkmakcom](https://twitter.com/danielkmakcom) from [ChronoLogicETH](https://twitter.com/ChronoLogicETH) for doing the label functionality (v1.17)!
* Thanks to [CryptoInfl](https://cryptoinfluencers.io/) for providing a whitelist of Twitter handles (v1.18)!

----

## Changelog

Read the changelog [on my blog](https://harrydenley.com/ethaddresslookup-chrome-extension-release/).
