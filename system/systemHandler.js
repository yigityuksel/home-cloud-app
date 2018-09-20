const logger = require('../utils/logger').logger;

module.exports = class systemHandler {

    constructor() {

        if (systemHandler.singleton)
            return systemHandler.singleton;

        this.systemList = [];
        systemHandler.singleton = this;

        return systemHandler.singleton;

    }

    start(index) {

        var this_ = this;
        var item = this.systemList[index];

        logger.verbose("Index : " + index + " - Waiting result from " + item.constructor.name);

        item.call(function (status) {

            if (status) {
                this_.start(++index);
            }

        });

    }

    add(item) {
        logger.debug("Object type is " + item.constructor.name + " - Total item count is " + this.systemList.length);
        this.systemList.push(item);
    }

}
