class Addresses extends Storage {

    /**
     *
     * @return {Promise}
     */
    retrieve(_address)
    {
        return this.get(_address).then((address) => {
            return new Promise(function(resolve){

                // Do we have a labels attribute, if not set them up
                if(!(_address in address)){
                    address[_address]={};
                    address[_address][parent.labels.labels] = [];
                }
                resolve(address)

            }.bind(this))
        });
    }

    /**
     *
     * @param {String | Array} _address
     * @return {Promise}
     */
    remove(_address)
    {
        return parent.remove(_address);
    }

    /**
     *
     * @param {Object} object
     */
    update(object)
    {
        return this.set(object);
    }

    /**
     *
     * @param {String} _address
     * @param {int | Array} label
     */
    addLabel(_address, label)
    {

    }

    /**
     *
     * @param _address
     * @return {Promise}
     */
    getLabels(_address)
    {
        return this.retrieve(_address).then(function(address){
            return new Promise(function(resolve){
                resolve(address[_address][parent.labels.labels])
            })
        });
    }

}

var addresses = new Addresses();

window.addEventListener('load', function() {
    addresses.getLabels('0x123').then(function(labels){
        console.log(labels);
    });
});