class Storage {

    constructor(scope = chrome.storage.sync)
    {
        this.scope = scope;
        this.labels = 'labels';
    }

    /**
     * @name get
     * @desc Gets one or more items from storage.
     * @param {String | Array} key
     * @return {Promise}
     */
    get(key)
    {
        return new Promise(function(resolve, reject){
            this.scope.get(key, function(items) {
                if(chrome.runtime.lastError){
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
            });
        }.bind(this));
    }

    /**
     * @name set
     * @desc Sets multiple items.
     * @param {Object} dataObject
     * @return {Promise}
     */
    set(dataObject)
    {
        return new Promise(function(resolve, reject){
            this.scope.set(dataObject, function() {
                if(chrome.runtime.lastError){
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            })
        }.bind(this));
    }

    /**
     * @name remove
     * @desc Removes one or more items from storage.
     * @param {String | Array} key
     * @return {Promise}
     */
    remove(key)
    {
        return new Promise(function(resolve, reject){
            this.scope.remove(key, function() {
                if(chrome.runtime.lastError){
                    console.log(chrome.runtime.lastError);
                }
            })
        }.bind(this));
    }

    /**
     * @name clear
     * @desc Removes all items from storage.
     * @return {Promise}
     */
    clear()
    {
        return new Promise(function(resolve, reject){
            this.scope.clear(function() {
                if(chrome.runtime.lastError){
                    console.log(chrome.runtime.lastError);
                }
            })
        }.bind(this));
    }

    /**
     *
     * @return {Promise}
     */
    getLabels(_address)
    {
        return this.get(_address);
    }

    /**
     * @name Add Label
     * @desc Associates a label with an address, if the label name is present overwrite it
     * @param _address
     * @param name
     * @param colour
     * @return {Promise}
     */
    _addLabel(_address, name, colour)
    {
        return this.get(_address).then(function(address){
            // Flag check for label name duplicate
            var duplicate = false;

            // Have we handled this address before, if not create object
            if(!(_address in address)){
                address[_address]={};
            }

            // TODO fix weird bug that adds a duplicate once, then not again.
            // Have we added any labels before, if not add an labels array
            if(!("labels" in address[_address])){
                address[_address]["labels"] = [];
            }
            // Otherwise check we've seen this label before
            else{
                for(var i=0; i < address[_address]["labels"].length; i++){
                    if(address[_address]["labels"][i][0] == name){
                        duplicate = i;
                    }
                }
            }

            // If we have a duplicate overwrite the new colour
            if(duplicate){
                address[_address]["labels"][duplicate][1] = colour;
            }
            // Else, add a new label. We use array to save byte space in storage.
            else{
                address[_address]["labels"].push([name, colour]);
            }

            this.set(address);
        }.bind(this));
    }
}

`var storage = new Storage();

//storage.clear();
storage.get(null).then((labels) => {console.log('get null');console.log(labels)});
storage.addLabel('0x123', "Joe Bloggs", "eaeaea")
    .then(function(){storage.addLabel('0x123', "smelly", "808080")}.bind(storage));
storage.addLabel('0x321', "a big boat", "adadad");
storage.addLabel('0x321', "Jupiter", "efefef");
storage.get(null).then((labels) => {console.log('get null');console.log(labels)});`;
