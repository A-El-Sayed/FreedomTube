/**
 * Model
 *
 * This is the main model file that allows
 * us to create a model, with definitions
 * and validation in-built.
 */

/* Node modules */


/* Third-party modules */
var _ = require("underscore");


/* Files */
var datatypes = require("./datatypes");
var validationutils = require("./validation");
var ModelError = require("./modelError");



/**
 * Create Closure
 *
 * Creates a closure of the function.  This returns
 * another function with the parameters sets as an
 * array and pushes through to validation function.
 *
 * @param {function} rule
 * @param {mixed} params
 * @param {mixed} defaultValue
 * @param {boolean} isRequired
 * @returns {function}
 */
function createClosure(rule, params, defaultValue, isRequired) {

    /* Create closure with params */
    var fn = function(value) {

        if(value === defaultValue && isRequired === false) {
            /* value is not set - don't run the rule */
            return true;
        } else {

            /* Add value as first parameter */
            var input = [value];

            if(params !== undefined) {

                /* Parameters set */
                if(params instanceof Array) {
                    input = input.concat(params);
                } else {
                    input.push(params);
                }

            }

            /* Execute the function with parameters */
            return rule.apply(this, input);

        }

    };

    /* Return the function */
    return fn;

}



function Model(options) {


    var self = this;



    /* Where we store the attributes */
    self._attr = {};



    /* Where we store the definition object */
    self._definition = {};



    /* Where we store the primary key */
    self._primaryKey = null;



    /**
     * Construct
     *
     * The constructor function.  This is run
     * every time a new version of the model is
     * instantiated
     *
     * @param {object} data
     * @returns {undefined}
     */
    self._construct = function _construct(data) {

        /* Set the data */
        data = datatypes.setObject(data, null);

        /* Set the definition */
        self._setDefinition(datatypes.setObject(self.definition, null));

        /* Delete the definition so it can't be used again */
        self.definition = undefined;

        /* Set the data */
        if (data !== null) {
            for (var key in data) {
                self.set(key, data[key]);
            }
        }

    };



    /**
     * Match
     *
     * Detects if the value matches a
     * given key
     *
     * @param {mixed} value
     * @param {string} key
     * @returns {Boolean}
     * @throw {Error}
     */
    self._match = function _match(value, key) {

        var matchValue = self.get(key);

        if(value === matchValue) {
            return true;
        } else {
            var err = new Error("VALUE_DOES_NOT_MATCH");
            err.value = value;
            err.params = [matchValue];

            throw err;
        }

    };



    /**
     * Set Definition
     *
     * Sets the model definition
     *
     * @param {object} objDefinitions
     * @returns {undefined}
     */
    self._setDefinition = function _setDefinition(objDefinitions) {

        /* Accept objects only - key represents the model key */
        if (typeof objDefinitions === "object" && objDefinitions !== null) {

            /**
             * Get Setting
             *
             * Returns the setting
             *
             * @param {string} setting
             * @returns {mixed}
             */
            var getSetting = function getter(setting) {
                return this.settings[setting];
            };

            for (var key in objDefinitions) {

                var objDefinition = objDefinitions[key];

                var type = null; /* Datatype */
                var value = null; /* Default value */
                var column = key;
                var primaryKey = false;
                var validation = null;
                var allowedValues = [];
                var settings = {};

                /* If nothing set, use the defaults */
                if (objDefinition) {

                    /* Set the datatype */
                    if (_.has(objDefinition, "type")) {
                        if (typeof objDefinition.type === "string") {
                            type = objDefinition.type;
                        } else if (typeof objDefinition.type === "function") {
                            type = objDefinition.type;
                        }
                    }

                    /* Set the default value */
                    if (_.has(objDefinition, "value")) {
                        value = objDefinition.value;
                    }

                    /* Set the column value */
                    if (_.has(objDefinition, "column")) {
                        column = objDefinition.column;
                    }

                    /* Set the primary key */
                    if (_.has(objDefinition, "primaryKey")) {
                        primaryKey = datatypes.setBool(objDefinition.primaryKey, false);
                    }

                    validation = self._setValidationRule(objDefinition.validation, value);

                    if (_.has(objDefinition, "enum")) {
                        allowedValues = datatypes.setArray(objDefinition.enum, []);
                    }

                    if (_.has(objDefinition, "settings")) {
                        settings = datatypes.setObject(objDefinition.settings, {});
                    }

                }

                /* Set the definition */
                self._definition[key] = {
                    type: type,
                    value: value,
                    column: column,
                    validation: validation,
                    enum: allowedValues,
                    settings: settings,
                    getSetting: getSetting
                };

                /* Set primary key */
                if(primaryKey) {
                    self._setPrimaryKey(key);
                }

                /* Set default value */
                self.set(key, undefined, false);

            }

        }

    };



    /**
     * Set Primary Key
     *
     * Sets the primary key
     *
     * @param {string} key
     * @returns {undefined}
     */
    self._setPrimaryKey = function _setPrimaryKey(key) {

        if(self.getPrimaryKey() === null) {
            self._primaryKey = key;
        } else {
            throw new Error("CANNOT_SET_MULTIPLE_PRIMARY_KEYS");
        }

    };



    /**
     * Set Validation Rule
     *
     * Sets the validation rules for the model
     *
     * @param {Array} arrValidation
     * @param {mixed} defaultValue
     * @returns {Array}
     */
    self._setValidationRule = function _setValidationRule(arrValidation, defaultValue) {

        arrValidation = datatypes.setArray(arrValidation, []);

        var arrRules = [];

        for(var i = 0; i < arrValidation.length; i++) {

            var obj = arrValidation[i];

            var rule;
            var ruleFn;

            var ruleType = typeof obj.rule;

            if(ruleType === "function") {
                /* We're passing a custom function to validate against */
                ruleFn = obj.rule;
                rule = "custom";
            } else if (ruleType === "string") {
                /* Check for function in validation object */
                rule = datatypes.setString(obj.rule, null);

                if(rule !== null) {

                    if(rule === "match") {
                        /* This is a special rule, contained in the model */
                        ruleFn = this._match;
                    } else  if(typeof validationutils[rule] !== "function") {
                        throw new Error(obj.rule + " is not a validation function");
                    } else {
                        ruleFn = validationutils[rule];
                    }

                }
            } else {
                /* Not string or function - throw error */
                throw new Error(obj.rule + " is not a function or string");

            }

            if(ruleFn) {
                /* Create a closure */
                var fn = createClosure(ruleFn, obj.param, defaultValue, rule === "required");

                /* Add to the rules array */
                arrRules.push(fn);
            }

        }

        return arrRules;

    };


    /* Invoke the constructor */
    self._construct(options);

    return self;

}



_.extend(Model.prototype, {


    /**
     * Get
     *
     * Gets an individual parameter
     *
     * @param {string} key
     * @returns {mixed}
     */
    get: function getter(key) {
        return this._attr[key];
    },


    /**
     * Get Column Keys
     *
     * Gets the keys and the column name
     * as an array of objects
     *
     * @returns {array}
     */
    getColumnKeys: function getter() {

        var arr = [];
        if (this._definition && _.isEmpty(this._definition) === false) {

            var definition = _.clone(this._definition);

            for (var key in definition) {

                var value = definition[key];

                arr.push({
                    key: key,
                    column: value.column || key
                });

            }

        }

        return arr;

    },


    getDefinition: function getter(definition) {
        return this._definition[definition] || null;
    },


    /**
     * Get Primary Key
     *
     * Gets the primary key
     *
     * @return {string}
     */
    getPrimaryKey: function() {
        return this._primaryKey;
    },


    /**
     * Get Primary Key Value
     *
     * Gets the value of the primary key
     *
     * @returns {mixed}
     */
    getPrimaryKeyValue: function() {
        return this.get(this.getPrimaryKey());
    },


    /**
     * Is Set
     *
     * Runs through all the parameters and check
     * they're not all the default options
     *
     * @return {boolean}
     */
    isSet: function() {

        var obj = this.toObject();

        for(var key in obj) {

            var value = obj[key];

            var def = this.getDefinition(key).value;

            if(value !== def) {
                return true;
            }

        }

        return false;

    },


    /**
     * Set
     *
     * Sets the value to the object
     *
     * @param {string} key
     * @param {mixed} value
     * @param {boolean} checkForCustom
     * @returns {undefined}
     */
    set: function setter(key, value, checkForCustom) {

        /* Get the definition key */
        if (this._definition[key]) {

            checkForCustom = datatypes.setBool(checkForCustom, true);

            var definition = this._definition[key];
            var defaults = definition.value;

            /* Search for a set function - makes it setKey() */
            var setFunc = "set" + key.charAt(0).toUpperCase() + key.slice(1);

            if (checkForCustom === true && this[setFunc] && typeof this[setFunc] === "function") {

                return this[setFunc](value, defaults);

            } else {

                var err;

                if (typeof definition.type === "function") {

                    value = definition.type(value, defaults);

                } else {

                    /* Set the datatype */
                    switch (definition.type) {

                        case "array":
                            value = datatypes.setArray(value, defaults);
                            break;

                        case "boolean":
                            value = datatypes.setBool(value, defaults);
                            break;

                        case "date":
                            value = datatypes.setDate(value, defaults);
                            break;

                        case "enum":
                            /* Doesn't matter the datatype as they're set */
                            value = datatypes.setEnum(value, definition.enum, defaults);
                            break;

                        case "float":
                            value = datatypes.setFloat(value, defaults);
                            break;

                        case "integer":
                            value = datatypes.setInt(value, defaults);
                            break;

                        case "object":
                            value = datatypes.setObject(value, defaults);
                            break;

                        case "string":
                            value = datatypes.setString(value, defaults);
                            break;

                        case "mixed":
                            if(value === undefined) {
                                value = defaults;
                            }
                            break;

                        default:
                            err = new TypeError("DATATYPE_NOT_VALID");
                            err.type = definition.type;
                            break;

                    }

                }

                if(err) {
                    throw err;
                }

                /* Set the value */
                this._attr[key] = value;

            }

        }

    },


    /**
     * To Data
     *
     * Pushes the data to the database
     * representation.
     *
     * @returns {object}
     */
    toData: function() {

        var obj = {};
        var keys = Object.keys(this._definition);

        for (var i = 0; i < keys.length; i++) {

            var key = keys[i];

            /* Get the column name */
            var column = this._definition[key].column;

            obj[column] = this.get(key);

        }

        return obj;

    },


    /**
     * To Object
     *
     * Clones out the data as an object
     * of key/value pairs
     *
     * @returns {object}
     */
    toObject: function() {

        var obj = {};
        var keys = Object.keys(this._definition);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            var value = this.get(key);

            /* If a model, run toObject() */
            if(typeof value === "object" && value !== null && value instanceof Model) {
                value = value.toObject();
            }

            obj[key] = value;
        }

        return obj;

    },


    /**
     * Validate
     *
     * Validates the model against the validation
     * rules.  It throws an error if it detects a
     * violation of the rules.  If it's fine, it
     * continues without any problems.
     *
     * @returns true
     * @throws {Error}
     */
    validate: function() {

        var self = this;

        var objValidationError = new ModelError();

        /* Run through each of the definitions for the validation rules */
        for(var key in self._definition) {

            var arrValidate = self._definition[key].validation;

            if(arrValidate instanceof Array) {

                for(var i = 0; i < arrValidate.length; i++) {

                    /* This will be a function - run it */
                    var rule = arrValidate[i];

                    try {
                        /* By default, we expect this to throw an error */
                        if(rule(self.get(key)) === false) {
                            /* A custom error where they've returned false */
                            throw new Error("CUSTOM_VALIDATION_FAILED");
                        }
                    } catch(err) {
                        /* Catch the validation error */

                        var detail = {
                            message: err.message,
                            value: self.get(key)
                        };

                        if(err.params) {
                            detail.params = err.params;
                        }

                        objValidationError.addError(key, detail);

                    }

                }

            }

        }

        if(objValidationError.hasErrors()) {
            /* There's validation errors */
            throw objValidationError;
        }

        /* Not really needed, but it shows we're happy with it */
        return true;

    }


});




/**
 * Extend
 *
 * Extends the model class so it can be used
 * consistently
 *
 * @param {object} objProperties
 * @param {object} objStaticProperties
 * @returns {function}
 */
Model.extend = function extend(objProperties, objStaticProperties) {

    /* Detect if we're extending an existing model */
    if(this.__super__ !== undefined) {

        /* Yes, we're extending an existing model */

        var obj = {};

        var prototype = this.prototype;

        var arrProperties = Object.getOwnPropertyNames(prototype);

        /* Put in the parent's stuff */
        for(var i = 0; i < arrProperties.length; i++) {

            var key = arrProperties[i];

            /* Ignore constructor */
            if(key !== "constructor") {
                /* Take a copy of the prototype */

                var tmp;
                if(typeof prototype[key] === "function") {
                    tmp = prototype[key];
                } else {
                    tmp = _.clone(prototype[key]);
                }

                obj[key] = _.extend(tmp, objProperties[key]);
            }
        }

        /* Put in the given properties */
        for(var param in objProperties) {

            /* Ignore definition if not already set */
            if(param !== "definition" || (param === "definition" && !obj.definition)) {
                obj[param] = objProperties[param];
            }

        }

        /* Replace the objProperties */
        objProperties = obj;

    }

    objProperties = datatypes.setObject(objProperties, null);
    objStaticProperties = datatypes.setObject(objStaticProperties, {});

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



/**
 * To Model
 *
 * Pushes the data object into a model
 *
 * @param {object} objData
 * @returns {Model}
 */
Model.toModel = function(objData) {

    objData = datatypes.setObject(objData, {array: []});

    /* Create instance of model - this doesn't feel right, but it works */
    var obj = new this();

    /* Get the definition */
    var def = obj.getColumnKeys();

    /* Set the information to the model */
    for (var i = 0; i < def.length; i++) {
        var key = def[i].key;
        var value = objData[def[i].column];

        obj.set(key, value);
    }

    return obj;

};



module.exports = Model;