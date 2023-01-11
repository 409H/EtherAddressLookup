const LABELS_KEY = 'labels';
const LABELLED_ADDRESSES_KEY = 'labelledAddresses';
const BEGINNING_AND_END_CHARS_IN_ADDR_TO_SHOW = 6;
const FORM_ADDRESS_SELECTOR = '#ext-etheraddresslookup-label-address';
const FORM_NAME_SELECTOR = '#ext-etheraddresslookup-label-name';
const FORM_COLOR_SELECTOR = '#ext-etheraddresslookup-label-color';

class Labels {

    async retrieve() {
        const labelledAddresses = await this.retrieveLabelledAddresses();

        const labels = await this.get(labelledAddresses);

        return Object.keys(labels).map((address) => {
            const { label, color } = labels[address];

            return [address, label, color];
        });
    }

    async retrieveLabelledAddresses() {
        let storageObject = await this.get(LABELLED_ADDRESSES_KEY);

        // Do we have a labels attribute, if not set them up
        if (!(LABELLED_ADDRESSES_KEY in storageObject)){
            storageObject = this.initialise(storageObject);
            this.set(storageObject);
        }

        return storageObject[LABELLED_ADDRESSES_KEY];
    }

    async addLabelledAddress(address) {
        const storageObject = await this.get(LABELLED_ADDRESSES_KEY);

        if (!storageObject[LABELLED_ADDRESSES_KEY].includes(address)) {
            storageObject[LABELLED_ADDRESSES_KEY].push(address);
        }

        return await this.set(storageObject);
    }

    async add(name, address, color) {
        address = address.toLowerCase();
        await this.addLabelledAddress(address);

        return await this.set({
            [address]: {
                label: name,
                color
            }
        });
    }

    /**
     * @name remove
     * @desc Removes one or more items from storage.
     * @param {String | Array} key
     * @return {Promise}
     */
    remove(key) {
        return new Promise((resolve) => {
            this.scope.remove(key, () => {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                }

                resolve();
            });
        });
    }

    initialise(object) {
        object[LABELS_KEY] = [];
        object[LABELLED_ADDRESSES_KEY] = [];

        return object;
    }

    shortenAddress(address) {
        const beginning = address.slice(0, BEGINNING_AND_END_CHARS_IN_ADDR_TO_SHOW);
        const end = address.slice(address.length - BEGINNING_AND_END_CHARS_IN_ADDR_TO_SHOW, address.length);

        return `${beginning}...${end}`;
    }

    getTemplate(name, color) {
        let font_color = 'white';

        if (color === 'ffffff') {
            font_color = '';
        }

        return `<span
            class='ext-etheraddresslookup-label'
            style="color:${font_color};background-color:#${color};">
                ${name}
            </span>`;
    }

    getExtendedTemplate(address, name, color) {
        let font_color = 'white';

        if (color === 'ffffff') {
            font_color = '';
        }

        return `<span
            class="ext-etheraddresslookup-label"
            data-fill-label-input="${address}"
            style="color:${font_color};background-color:#${color};">
                ${name} (${this.shortenAddress(address)})
            </span>
            &nbsp;
            <span style="float:right; cursor:pointer;" class="ext-etheraddresslookup-label-delete" data-ext-etheraddresslookup-label-id="${address}">x</span>
            <br/>`;
    }

    constructor(scope = chrome.storage.sync) {
        this.scope = scope;
        this.labels = 'labels';
    }

    /**
     * @name get
     * @desc Gets one or more items from storage.
     * @param {String | Array} key
     * @return {Promise}
     */
    get(key) {
        return new Promise((resolve, reject) => {
            this.scope.get(key, (items) => {
                if (chrome.runtime.lastError){
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
            });
        });
    }

    /**
     * @name set
     * @desc Sets multiple items.
     * @param {Object} dataObject
     * @return {Promise}
     */
    async set(dataObject) {
        return new Promise((resolve, reject) => {
            this.scope.set(dataObject, () => {
                if (chrome.runtime.lastError){
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    clear() {
        return new Promise((resolve) => {
            this.scope.clear(() => {
                if (chrome.runtime.lastError){
                    console.log(chrome.runtime.lastError);
                }

                resolve();
            });
        });
    }

    async getLabelForAddress(address) {
        const retrievedObject = await this.get(address.toLowerCase());

        if (retrievedObject) {
            return retrievedObject[address.toLowerCase()];
        }
    }

    addLabelsListEvents() {
        const labelsDeleteElements = document.getElementsByClassName("ext-etheraddresslookup-label-delete");

        Array.from(labelsDeleteElements).forEach((element) => {
            element.addEventListener('click', async (event) => {
                const id = event.target.getAttribute('data-ext-etheraddresslookup-label-id');

                await this.remove(id);

                this.updateLabelsList();
            });
        });

        const FILL_LABEL_INPUT_ATTRIBUTE = 'data-fill-label-input';

        document.querySelectorAll(`[${FILL_LABEL_INPUT_ATTRIBUTE}]`).forEach(element => {
            element.addEventListener('click', async (event) => {
                const address = event.target.getAttribute(FILL_LABEL_INPUT_ATTRIBUTE);

                const { color, label } = await this.getLabelForAddress(address);

                document.querySelector(FORM_NAME_SELECTOR).value = label;
                document.querySelector(FORM_ADDRESS_SELECTOR).value = address;
                document.querySelector(FORM_COLOR_SELECTOR).value = color;
            });
        });
    }

    setupFormSubmitHandler() {
        document.getElementById('ext-etheraddresslookup-new-label-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.querySelector(FORM_NAME_SELECTOR).value;
            const address = document.querySelector(FORM_ADDRESS_SELECTOR).value;
            const color = document.querySelector(FORM_COLOR_SELECTOR).value;

            if (!name || !address || !color) {
                alert('Please make sure that "Name", "Address", and "Color" is filled.');
            } else {
                await this.add(name, address, color);

                await this.updateLabelsList();
            }
        });
    }

    async updateLabelsList() {
        const retrievedLabels = await this.retrieve();

        let HTMLLabels = '';
        for (const [address, label, color] of retrievedLabels){
            HTMLLabels += this.getExtendedTemplate(
                address,
                label,
                color
            );
        }

        document.getElementById('ext-etheraddresslookup-current-labels').innerHTML = HTMLLabels;

        objBrowser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            objBrowser.tabs.sendMessage(tabs[0].id, {
                func: 'resetLoadedLabels'
            }, (objResponse) => {
                chrome.runtime.lastError;
            });
        });

        this.addLabelsListEvents();
    }
}
