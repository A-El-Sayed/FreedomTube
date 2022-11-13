/**
 * Collection
 *
 * This is similar to the Backbone collection. Think
 * of it as a table of data.
 */

/* Node modules */


/* Third-party modules */
var _ = require("underscore");
var uuid = require("node-uuid");


/* Files */
var datatypes = require("./datatypes");
var model = require("./model");


function Collection(options) {

    var self = this;


    /* The data stored in this collection */
    self.data = {};


    /* Won't be able to do much if a model isn't set, but just for completeness */
    if(self.model === undefined) {
        self.model = model;
    }


    /**
     * Construct
     *
     * Invoked when this object is called.  It handles
     * whatever is initially passed through to it.
     *
     * @param {mixed} data
     * @returns {undefined}
     */
    self._construct = function construct(data) {
        self.add(data);
    };


    /* Invoke the constructor */
    self._construct(options);

    return self;

}


_.extend(Collection.prototype, {


    /**
     * Add
     *
     * Adds in the model to the collection
     *
     * @param {object} data
     */
    add: function(data) {

        /* Check if it's an array */
        if(data instanceof Array) {
            var self = this;
            data.forEach(function(model) {
                self.add(model);
            });
        } else {
            /* Check that it's an object */
            data = datatypes.setObject(data, null);

            if(data !== null) {

                /* Don't create anything if an empty object is given */
                if(_.isEmpty(data)) {
                    return;
                }

                /* Put it to the model */
                var obj;
                if(data instanceof this.model) {
                    /* Already instance of the model */
                    obj = data;
                } else {
                    obj = new this.model(data);
                }

                var key = uuid.v4();
                this.data[key] = obj;

            }
        }

    },


    /**
     * Each
     *
     * This is fundamentally a copy of the Underscore each
     * method.  It allows us to cycle through each model
     * in the collection.
     */
    each: function(iterator, context) {

        var obj = this.getAll();

        var length = 0;
        var i;
        var breaker = {};
        var nativeForEach = Array.prototype.forEach;

        if (obj === null) {
            return obj;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) {
                    return;
                }
            }
        }
        return obj;
    },


    /**
     * Get All
     *
     * Gets everything
     *
     * @return {array}
     */
    getAll: function() {
        return this.data;
    },


    /**
     * Get Count
     *
     * Counts the number of items in the collection
     *
     * @returns {array}
     */
    getCount: function() {
        return _.size(this.getAll());
    },


    /**
     * Get Keys
     *
     * Gets the IDs of the models
     *
     * @returns {array}
     */
    getKeys: function() {
        return _.keys(this.data);
    },


    /**
     * Get
     *
     * Gets the specific model from the collection
     *
     * @param {int|string|object|array} id
     * @param {bool} getUUID
     * @returns {mixed}
     */
    get: function(id, getUUID) {

        getUUID = datatypes.setBool(getUUID, false);

        if(id instanceof Array) {

            var self = this;

            var out = [];

            id.forEach(function(element) {
                out.push(self.get(element, getUUID));
            });

            return out;

        } else {

            if(id instanceof this.model) {

                for(var key in this.data) {
                    if(id === this.data[key]) {
                        return getUUID ? key : this.data[key];
                    }
                }

            } else {

                /* First check for integer */
                var int = datatypes.setInt(id, null);

                if(int !== null) {
                    /* Get the ID of the position */
                    var arr = _.values(this.data);

                    if(arr[int]) {

                        var model = arr[int];

                        if(getUUID) {
                            /* Get the model */
                            return this.get(model, true);
                        } else {
                            return model;
                        }
                    }
                } else {

                    var str = datatypes.setString(id, null);

                    if(this.data[str]) {
                        return getUUID ? str : this.data[str];
                    }

                }


            }

        }

        return null;

    },


    /**
     * Remove
     *
     * Removes the specific model or models
     * from the collection
     *
     * @param {int|object|array|string} model
     * @returns {bool|array}
     */
    remove: function(model) {

        var self = this;

        var int, str;

        /* Input maybe a model, array or integer */
        if(model instanceof Array) {

            if(model.length > 0) {

                var out = [];

                var toDelete = [];

                /* Array */
                model.forEach(function(id) {

                    var deleted = false;

                    /* Check what type the id is - int, string or instance */
                    if(id instanceof self.model) {
                        /* It's an instance of the model - find it's UUID */
                        var modelKey = self.get(id, true);

                        if(modelKey !== null) {
                            deleted = true;
                            toDelete.push(modelKey);
                        }

                    } else {

                        int = datatypes.setInt(id, null);

                        if(int === null) {

                            /* Do it by UUID */
                            str = datatypes.setString(id, null);

                            if(self.get(str) !== null) {
                                deleted = true;
                                toDelete.push(str);
                            }

                        } else {

                            /* Do it by integer */
                            var i = 0;
                            for(var key in self.data) {
                                if(i === int) {
                                    deleted = _.has(self.data, key);

                                    if(deleted) {
                                        toDelete.push(key);
                                    }
                                }
                                i++;
                            }

                        }

                    }

                    out.push(deleted);
                });

                self.data = _.omit(self.data, toDelete);

                return out;

            }

        } else if (model instanceof this.model) {

            for(var key in this.data) {
                if(model === this.data[key]) {
                    return self.remove(key);
                }
            }

        } else {

            /* Integer */
            int = datatypes.setInt(model, null);

            if(int !== null) {

                /* Do it by integer */
                return self.remove([int])[0];

            } else {

                /* Do it by UUID */
                str = datatypes.setString(model, null);

                if(str !== null) {

                    if(self.data[str]) {
                        delete self.data[str];
                        return true;
                    }

                }

            }

        }

        /* Default to nothing removed */
        return false;

    },


    /**
     * Reset
     *
     * Resets the collection back to it's original (empty)
     * setting
     *
     * @return {bool}
     */
    reset: function() {

        if(_.isEmpty(this.data)) {
            /* Nothing to do - it's already empty */
            return false;
        }

        this.data = {};

        return _.isEmpty(this.data);

    },


    /**
     * To JSON
     *
     * Converts the whole collection into a JSON
     * array.
     *
     * @returns {array}
     */
    toJSON: function() {

        var out = [];

        for(var key in this.data) {
            var model = this.data[key];
            out.push(model.toObject());
        }

        return out;

    }


});




/**
 * Extend
 *
 * Extends this Collection object into a definable
 * collection model.
 *
 * @param {object} objProperties
 * @param {object} objStaticProperties
 * @returns {function}
 */
Collection.extend = function(objProperties, objStaticProperties) {

    objProperties = datatypes.setObject(objProperties, null);
    objStaticProperties = datatypes.setObject(objStaticProperties, {});

    var options = {};

    options.model = datatypes.setFunction(objProperties.model, model, null);

    var parent = this;
    var inst = function() {
        return parent.apply(this, arguments);
    };

    /* Add static properties */
    _.extend(inst, parent, objStaticProperties);

    function Surrogate() {
        this.constructor = inst;
    }

    Surrogate.prototype = parent.prototype;
    inst.prototype = new Surrogate();

    if (objProperties) {
        _.extend(inst.prototype, objProperties);
    }

    inst.__super__ = parent.prototype;

    return inst;

};


module.exports = Collection;