const ENS_KEY = 'ens';
const FORM_ENS_NAME_SELECTOR = '#ext-etheraddresslookup-ens_name';
const ENS_REGISTRY = {
    "mainnet": {
        "addr": '0x314159265dd8dbb310642f98f50c066173c1259b',
        "abi": '[{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"resolver","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"label","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setSubnodeOwner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"ttl","type":"uint64"}],"name":"setTTL","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"ttl","outputs":[{"name":"","type":"uint64"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"resolver","type":"address"}],"name":"setResolver","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"label","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"NewOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"resolver","type":"address"}],"name":"NewResolver","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"ttl","type":"uint64"}],"name":"NewTTL","type":"event"}]'
    },
    "ropsten": {
        "addr": '0x112234455c3a32fd11230c42e7bccd4a84e02010',
        "abi": ''
    },
    "rinkeby": {
        "addr": '0xe7410170f87102df0055eb195163a03b7f2bff4a',
        "abi": ''
    }
};
const ENS_RESOLVER = {
    "0x5ffc014343cd971b7eb70732021e26c35b744cc4": {
        "addr": '0x5ffc014343cd971b7eb70732021e26c35b744cc4',
        "abi": '[{"constant":true,"inputs":[{"name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"key","type":"string"},{"name":"value","type":"string"}],"name":"setText","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentTypes","type":"uint256"}],"name":"ABI","outputs":[{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"name":"setPubkey","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"content","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"addr","outputs":[{"name":"ret","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"},{"name":"key","type":"string"}],"name":"text","outputs":[{"name":"ret","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"name":"setABI","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"name","outputs":[{"name":"ret","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"name","type":"string"}],"name":"setName","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"hash","type":"bytes32"}],"name":"setContent","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"pubkey","outputs":[{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"addr","type":"address"}],"name":"setAddr","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"ensAddr","type":"address"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"a","type":"address"}],"name":"AddrChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"hash","type":"bytes32"}],"name":"ContentChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"name","type":"string"}],"name":"NameChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"contentType","type":"uint256"}],"name":"ABIChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"x","type":"bytes32"},{"indexed":false,"name":"y","type":"bytes32"}],"name":"PubkeyChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"indexedKey","type":"string"},{"indexed":false,"name":"key","type":"string"}],"name":"TextChanged","type":"event"}]'
    }
}

class Ens {

    web3;

    constructor()
    {
        chrome.runtime.sendMessage({ func: "rpc_provider" }, (objResponse) => {
            this.web3 = new Web3(new Web3.providers.HttpProvider(objResponse.resp)); 
            this.setupFormSubmitHandler();
        });
    }

    setupFormSubmitHandler()
    {
        document.getElementById('ext-etheraddresslookup-ens_lookup_form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const ensname = document.querySelector(FORM_ENS_NAME_SELECTOR).value;
            await this.resolve(ensname);
        });
    }

    async resolve(strEnsName)
    {
        document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = ``;
        strEnsName = this.normalizeAndValidate(strEnsName);
        if(typeof strEnsName !== "undefined") {
            document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = `Loading...`;
            let objNameHashes = this.getNameHash(strEnsName);
            this.getEnsResolver(objNameHashes.namehash);
        }
    }

    normalizeAndValidate(strEnsName)
    {
        strEnsName = strEnsName.toLowerCase();
        document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = ``;

        if(/^([a-z0-9]+\.?)+\.eth$/gm.exec(strEnsName) === null) {
            document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = `
                <span class="error">Invalid ENS name - invalid characters used.</span>
            `;
            return;
        }

        return strEnsName;
    }

    getNameHash(strEnsName)
    {
        // @todo - create the namehash correctly
        let objEnsName = {
            "labels": {},
            "namehash": "0x4304299c9f838df31435eb3e8d79705f28960b6ea59329d33828cca28b7fcb76"
        }; 
       
        return objEnsName;
    }

    getEnsResolver(strNameHash)
    {
        // @todo - get the network ID for the web3 provider
        let objContract = this.web3.eth.contract(JSON.parse(ENS_REGISTRY.mainnet.abi));
        let objContractInst = objContract.at(ENS_REGISTRY.mainnet.addr);

        objContractInst.resolver.call(strNameHash, (err, res) => {
            if(err) {
                document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = `
                    <span class="error">Error - ${err}</span> <br />
                    <p>
                        <strong>Namehash:</strong> <br />
                        <span>${strNameHash}</span> <br />
                    </p>
                `;
                return;
            }
    
            if(res === "0x"+"0".repeat(40)) { // No resolver set (assuming name doesn't exist)
                document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = `
                    <span class="error">Error - Either the domain is not registered or no resolver is set!</span> <br /><br />
                    <p>
                        <strong>Namehash:</strong> <br />
                        <span>${strNameHash}</span> <br />
                    </p>
                `;
                return;
            }

            let objResolverContract = this.web3.eth.contract(JSON.parse(ENS_RESOLVER[res].abi));
            let objResolverContractInst = objResolverContract.at(res);

            let objResolveDetails = {
                "owner": null,
                "address": {
                    "addr": null,
                    "eth": 0,
                    "tx": 0,
                    "contract": false
                },
                "content": null,
                "name": null,
                "pubkey": null
            };

            objResolveDetails.owner = objContractInst.owner.call(strNameHash);
            objResolveDetails.address.addr = objResolverContractInst.addr.call(strNameHash);
            objResolveDetails.content = objResolverContractInst.content.call(strNameHash);
            objResolveDetails.name = objResolverContractInst.name.call(strNameHash);
            objResolveDetails.pubkey = objResolverContractInst.pubkey.call(strNameHash);

            // Fetch address specifics
            objResolveDetails.address.eth = this.web3.fromWei(this.web3.eth.getBalance(objResolveDetails.address.addr).toString(10), "ether").toLocaleString("en-US", {maximumSignificantDigits: 9});
            objResolveDetails.address.tx = parseInt(this.web3.eth.getTransactionCount(objResolveDetails.address.addr)).toLocaleString();
            objResolveDetails.address.contract = this.web3.eth.getCode(objResolveDetails.address.addr) === "0x" ? "Normal (EOA)": "Contract";

            if(objResolveDetails.address.addr === null) {
                document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = `
                    <span class="error">Error - something went wrong - try again.</span>
                `;
                return;
            }

            let strOwnerBlockie = blockies.create({
                // toLowerCase is used because standard blockies are based on none-checksum Ethereum addresses
                seed: objResolveDetails.owner.toLowerCase(),
                size: 8,
                scale: 16
            }).toDataURL();

            let strAddrBlockie = blockies.create({
                // toLowerCase is used because standard blockies are based on none-checksum Ethereum addresses
                seed: objResolveDetails.address.addr.toLowerCase(),
                size: 8,
                scale: 16
            }).toDataURL();

            document.querySelector("#ext-etheraddresslookup-ens_output").innerHTML = `
                <strong>Address:</strong> <br />
                    <span><img class="blockie" src="${strAddrBlockie}" /> <a target="_blank" href="https://etherscan.io/address/${objResolveDetails.address.addr}">${objResolveDetails.address.addr}</a></span> <br />
                    <ul>
                        <li><strong>ETH:</strong> ${objResolveDetails.address.eth}</li>
                        <li><strong>Transactions out:</strong> ${objResolveDetails.address.tx}</li>
                        <li><strong>Type:</strong> ${objResolveDetails.address.contract}</li>
                    </ul>

                <div id="ens_additional_details">
                    <strong>Additional Details &dArr;</strong>
                    <p>
                        <strong>Owner:</strong> <br />
                        <span><img class="blockie" src="${strOwnerBlockie}" /> ${objResolveDetails.owner}</span> <br />
                    </p>
                    <p>
                        <strong>Namehash:</strong> <br />
                        <span>${strNameHash}</span> <br />
                    </p>
                </div>
            `;
        });
    }
}