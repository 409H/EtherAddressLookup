# EtherAddressLookup Contributing Guide

## How to submit links to blacklists/whitelists

For each type of request, please make sure you provide evidence as to why it needs to be on the particular list - this will help speed up the process of accepting the change.

#### Blacklists

This list will redirect users away from the domain so you cannot view it. You can submit a **blacklist** request via the following methods (in no particular order);

* [https://etherscamdb.info/report/](https://etherscamdb.info/report/) 
* [Opening a new issue](https://github.com/409H/EtherAddressLookup/issues/new)
* [Opening a new pull request with your change](https://github.com/409H/EtherAddressLookup/compare)

#### Whistelists

This will ensure the domain can be accessed with EAL enabled, even if the domain is on the blacklist (by mistake or otherwsie). You can submit a **whitelist** request via the following methods (in no particular order);

* [Opening a new issue](https://github.com/409H/EtherAddressLookup/issues/new)
* [Opening a new pull request with your change](https://github.com/409H/EtherAddressLookup/compare)

#### What kind of links do I submit?

##### All relevant subdomains
Please submit the domain (and any relevent subdomains) that you feel need to be on the list. 

##### Punycodes
If a domain has unicode characters, please submit the punycode variant (ie: `xn--bttrex-3va.net` instead of `bíttrex.net`.) You can use this tool to do that: [https://www.punycoder.com/](https://www.punycoder.com/).

#### How to title PRs for blacklists/whitelists

Please title each PR with the domain you wish to add to the list - this will help us search the repository if there is a dispute and see the evidence as to why it was added to the list.
