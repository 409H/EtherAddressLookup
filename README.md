### EtherAddressLookup

Automatically adds links to strings that look like Ethereum addresses so you can quickly look them up on your favourite 
block explorer. It also prevents you from interacting with known phishing domains by wiping the DOM and displaying text
notifying you.

Ether/ERC20 donation address: [`0x661b5dc032bedb210f225df4b1aa2bdd669b38bc`](https://etherscan.io/address/0x661b5dc032bedb210f225df4b1aa2bdd669b38bc) (donations aren't required to run the extension. Each Friday, I will send 50% of the donations to MEW)

##### Read: http://harrydenley.com/ethaddresslookup-chrome-extension-release/

## Installations

### Chrome Extension

The `master` branch is bundled on every release and pushed to the Chrome Extension store, you can view/download it 
here: [https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn](https://chrome.google.com/webstore/detail/etheraddresslookup/pdknmigbbbhmllnmgdfalmedcmcefdfn)

(Note that this will have automatic updates)

### Manual Installation

* Clone/download [the repo](https://github.com/409H/EtherAddressLookup).
* Go to [chrome://extensions](chrome://extensions) in Chrome.
* Turn on developer mode.
* Load the `manifest.json` file by dragging and dropping.

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

----

## Changelog

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
