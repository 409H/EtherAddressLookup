const FORM_CHAIN_LOOKUP_SELECTOR = '#ext-etheraddresslookup-chain_lookup_form';
const FORM_CHAIN_LOOKUP_INPUT_SELECTOR = '#ext-etheraddresslookup-addr_or_tx';
const FORM_CHAIN_LOOKUP_OUTPUT_SELECTOR = '#ext-etheraddresslookup-chain_lookup_output';
const FORM_CHAIN_LOOKUP_DETAILS_SELECTOR = '#ext-etheraddresslookup-chain_lookup_details';

class ChainLookup 
{
    constructor()
    {
        chrome.runtime.sendMessage({ func: "rpc_provider" }, (objResponse) => {
            this.web3 = new Web3(new Web3.providers.HttpProvider(objResponse.resp)); 
            this.setupFormSubmitHandler();
        });
    }

    setupFormSubmitHandler()
    {
        if(document.querySelector(FORM_CHAIN_LOOKUP_SELECTOR)) {

            this.getRpcDetails();

            document.querySelector(FORM_CHAIN_LOOKUP_SELECTOR).addEventListener('submit', async (event) => {
                event.preventDefault();

                chrome.runtime.sendMessage({ func: "blockchain_explorer" }, async function(objResponse) {
                    this.strBlockExplorer = objResponse.resp;

                    const strInput = document.querySelector(FORM_CHAIN_LOOKUP_INPUT_SELECTOR).value;
                    await this.resolve(strInput);
                }.bind(this));
            });
        }
    }

    async getRpcDetails()
    {

        if(document.querySelector(FORM_CHAIN_LOOKUP_DETAILS_SELECTOR)) {
            let intBlockNumber = await this.web3.eth.blockNumber;

            this.intBlockNumber = intBlockNumber;

            document.querySelector(FORM_CHAIN_LOOKUP_DETAILS_SELECTOR).innerHTML = `
                <strong>Latest Block Number:</strong> ${intBlockNumber.toLocaleString("en-US")} <br />
            `

            chrome.runtime.sendMessage({ func: "rpc_details" }, (objResponse) => {
                let objDetails = JSON.parse(objResponse.resp);

                document.querySelector(FORM_CHAIN_LOOKUP_DETAILS_SELECTOR).innerHTML += `
                    <strong>Network:</strong> ${objDetails.name} (${objDetails.type})
                `;
            });
        }
    }

    async resolve(strInput)
    {
        strInput = strInput.trim();
        strInput = strInput.startsWith("0x") ? strInput : `0x${strInput}`
        
        document.querySelector(FORM_CHAIN_LOOKUP_OUTPUT_SELECTOR).innerHTML = ``;
        let strInputType = this.getInputType(strInput);

        switch(strInputType.toUpperCase()) {
            default:
            case 'ADDRESS':
                await this.doAddressLookup(strInput);
                break;
            case 'TX':
                this.doTxLookup(strInput);
                break;
            case 'UNKNOWN':
                if(strInput.endsWith(".eth")) {
                    document.querySelector(FORM_CHAIN_LOOKUP_OUTPUT_SELECTOR).innerHTML += `
                    <span class="error">ENS Integration coming soon. Search by 0x address or transaction hash.</span>
                `;
                } else {
                    document.querySelector(FORM_CHAIN_LOOKUP_OUTPUT_SELECTOR).innerHTML = `
                    <span class="error">Invalid input. Either an Ethereum address or transaction hash.</span>
                `;
                }
            break;
        }
    }

    getInputType(strInput)
    {
        /**
         * Determines if we are inptting an address or transaction hash
         */
        switch(strInput.length) {
            case 42 : //Address
                return "ADDRESS";
            case 66 : //TX HASH
                return "TX";
            default :
                return "UNKNOWN";
        }
    }

    async doAddressLookup(strInput)
    {
        let strAddressBlockie = blockies.create({
            seed: strInput.toLowerCase(),
            size: 8,
            scale: 16
        }).toDataURL();

        let objAddressDetails = {
            "eth": 0,
            "tx": 0,
            "contract": false
        };

        objAddressDetails.eth = this.web3.fromWei(
            this.web3.eth.getBalance(strInput).toString(10), "ether"
        ).toLocaleString("en-US", {maximumSignificantDigits: 5});

        objAddressDetails.tx = parseInt(this.web3.eth.getTransactionCount(strInput)).toLocaleString();
        objAddressDetails.contract = this.web3.eth.getCode(strInput) === "0x" ? "Normal (EOA)": "Contract";

        let strAddressLookedup = strInput;
        let objLabels = new Labels();
        let objLabelledAddress = await objLabels.getLabelForAddress(strAddressLookedup);
        if(typeof objLabelledAddress !== "undefined") {
            let strLabel = `${objLabelledAddress.label} (${ChainLookup.getShortAddress(strAddressLookedup)})`;
            strAddressLookedup = objLabels.getTemplate(strLabel, objLabelledAddress.color);
        }

        document.querySelector(FORM_CHAIN_LOOKUP_OUTPUT_SELECTOR).innerHTML = `
                <strong>Address:</strong> <br />
                    <span>
                        <img class="blockie" src="${strAddressBlockie}" />
                        <a target="_blank" href="${this.strBlockExplorer +"/"+ strInput}">${strAddressLookedup}</a>
                    </span> <br />
                    <ul>
                        <li><strong>ETH:</strong> ${objAddressDetails.eth}</li>
                        <li><strong>Transactions out:</strong> ${objAddressDetails.tx}</li>
                        <li><strong>Type:</strong> ${objAddressDetails.contract}</li>
                    </ul>
            `;
    }

    async doTxLookup(strInput)
    {
        let objTransaction = await this.web3.eth.getTransaction(strInput);

        if(objTransaction === null) {
            document.querySelector(FORM_CHAIN_LOOKUP_OUTPUT_SELECTOR).innerHTML = `
                <span class="error">Unknown transaction (it might still be pending, waiting to be mined by the network or you may be on the wrong network)</span>
            `;
            return;
        }

        let objTransactionReceipt = await this.web3.eth.getTransactionReceipt(strInput);
    
        if(objTransactionReceipt === null) {
            objTransactionReceipt = {
                contractAddress: null,
                gasUsed: null,
                is_pending: true
            }
        }

        let strAddressFromBlockie = blockies.create({
            seed: objTransaction.from.toLowerCase(),
            size: 8,
            scale: 16
        }).toDataURL();

        let strToAddress = objTransaction.to !== null ? objTransaction.to : objTransactionReceipt.contractAddress;
        let strAddressToBlockie = blockies.create({
            seed: strToAddress.toLowerCase(),
            size: 8,
            scale: 16
        }).toDataURL();

        let objTxDetails = {
            "eth": this.web3.fromWei(objTransaction.value).toLocaleString("en-US", {maximumSignificantDigits: 4}),
            "eth_full": this.web3.fromWei(objTransaction.value).toLocaleString("en-US", {maximumSignificantDigits: 18}),
            "gas": {
                "limit": objTransaction.gas.toLocaleString("en-US"),                
                "price": this.web3.fromWei(objTransaction.gasPrice.toString()).toLocaleString("en-US"),
                "used": objTransactionReceipt.gasUsed,
                "used_percent": (objTransactionReceipt.gasUsed / objTransaction.gas)*100,
                "fee": (objTransactionReceipt.gasUsed * this.web3.fromWei(objTransaction.gasPrice.toString()).toLocaleString("en-US"))
            },
            "block": {
                "number": objTransaction.blockNumber ? objTransaction.blockNumber.toLocaleString("en-US") : null,
                "ago": (this.intBlockNumber - objTransaction.blockNumber).toLocaleString("en-US"),
            },
            "nonce": objTransaction.nonce.toLocaleString("en-US"),
            "input": objTransaction.v,
            "contract": {
                "is": false
            }
        }

        objTxDetails.contract.is = this.web3.eth.getCode(strToAddress) === "0x" ? false : true;

        let objLabels = new Labels();
        let objLabelledAddress;
        let strLabel;
        let blUseLables = false;
        let objLabelledAddresses = {
            "from": ChainLookup.getShortAddress(objTransaction.from),
            "to": ChainLookup.getShortAddress(strToAddress)
        }

        objLabelledAddress = await objLabels.getLabelForAddress(objTransaction.from);
        if(typeof objLabelledAddress !== "undefined") {
            strLabel = `${objLabelledAddress.label} (${ChainLookup.getShortAddress(objTransaction.from)})`;
            objLabelledAddresses.from = objLabels.getTemplate(strLabel, objLabelledAddress.color);
            blUseLables = true;
        }

        objLabelledAddress = await objLabels.getLabelForAddress(strToAddress);
        if(typeof objLabelledAddress !== "undefined") {
            strLabel = `${objLabelledAddress.label} (${ChainLookup.getShortAddress(strToAddress)})`;
            objLabelledAddresses.to = objLabels.getTemplate(strLabel, objLabelledAddress.color);
            blUseLables = true;
        }

        document.querySelector(FORM_CHAIN_LOOKUP_OUTPUT_SELECTOR).innerHTML = `
                <strong>Transaction:</strong> <br />
                    <div style="text-align:center">
                        ${objTransactionReceipt.contractAddress !== null 
                            ? `<strong>🐣 This transaction created a contract</strong><br />`
                            : objTxDetails.contract.is
                                ? `<strong>📞 This transaction called a contract</strong><br />`
                                : ``
                        }

                        <span>
                            <img class="blockie" src="${strAddressFromBlockie}" />
                            <a target="_blank" href="${this.strBlockExplorer +"/"+ objTransaction.from}">${objLabelledAddresses.from}</a>
                        </span> 
                        ${blUseLables ? `<br />&darr;<br />` : `&#8594;`}
                        <a style="border-bottom:1px dotted #000;" title="Ξ${objTxDetails.eth_full}">${objTxDetails.eth} ETH</a>
                        ${blUseLables ? `<br />&darr;<br />` : `&#8594;`}
                        <span>
                            <img class="blockie" src="${strAddressToBlockie}" />
                            <a target="_blank" href="${this.strBlockExplorer +"/"+ strToAddress}">${objLabelledAddresses.to}</a>
                        </span>

                        <br />

                        ${
                            objTransactionReceipt.is_pending
                                ?
                                    `<span style="color:#C0BC37;font-weight:600;">Transaction is pending</span>`
                                :
                                    objTransactionReceipt.status === "0x0"
                                        ?
                                            `<span style="color:#C03737;font-weight:600;">Transaction Failed</span>`
                                        :
                                        `<span style="color:#4FC037;font-weight:600;">Transaction Successful</span>`
                        }

                    </div>

                    <br />

                    <ul>
                        <li><strong>Gas Limit:</strong> ${objTxDetails.gas.limit} 
                        ${
                            objTransactionReceipt.is_pending
                                ?
                                    ``
                                :
                                    `(${Math.ceil(objTxDetails.gas.used_percent)}% consumed)`
                        }</li>
                        <li><strong>Transaction Fee:</strong> Ξ${objTxDetails.gas.fee} 
                            ${objTransactionReceipt.contractAddress === null 
                                && objTxDetails.gas.fee >= objTxDetails.eth 
                                && objTxDetails.eth > 0
                                ? `<a title="Yikes! It cost more to send">😱</a>` 
                                : ``}
                        </li>
                        <li><strong>Block:</strong> 
                        ${
                            objTransactionReceipt.is_pending
                                ?
                                    `<i>Pending</i>`
                                :
                                    `${objTxDetails.block.number} (${objTxDetails.block.ago.replace(",", "") <= 3000000 ? objTxDetails.block.ago + " blocks ago" : "millions of blocks ago"})`
                        }</li>
                    </ul>
            `;
    }

    static getShortAddress(strAddress)
    {
        return `${strAddress.slice(0, 4)}...${strAddress.slice(strAddress.length-4, strAddress.length)}`
    }
} 