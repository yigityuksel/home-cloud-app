module.exports = class systemBase{

    constructor(){
        if (new.target === systemBase) {
            throw new TypeError("Must override this method.");
        }
    }

}

