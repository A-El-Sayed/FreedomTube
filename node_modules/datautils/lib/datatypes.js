/**
 * Data Utils
 *
 * A series of utility functions that allow
 * us to ensure consistent data coming into
 * the library.
 */

var arrayutils = require("./arrayutils");

module.exports = {



    /**
     * Set Array
     *
     * Ensures the input is an array, or returns the
     * default value
     *
     * @param {mixed} input
     * @param {mixed} def
     * @returns {mixed}
     */
    setArray: function setArray(input, def) {

        return this.setInstanceOf(input, Array, def);

    },



    /**
     * Set Bool
     *
     * Sets an input value as a boolean, or
     * the default value
     *
     * @param {mixed} input
     * @param {mixed} def
     * @returns {mixed}
     */
    setBool: function setBool(input, def) {

        if(typeof input === "boolean") {
            return input;
        }

        if(typeof input === "string") {
            input = input.toUpperCase();

            /* True */
            if(input === "Y" || input === "1" || input === "TRUE" || input === "T" || input === "YES") {
                return true;
            }

            /* False */
            if(input === "N" || input === "0" || input === "FALSE" || input === "F" || input === "NO") {
                return false;
            }

        }

        if(typeof input === "number") {
            /* True */
            if(input === 1) {
                return true;
            }

            /* False */
            if(input === 0) {
                return false;
            }
        }

        return def;

    },



    /**
     * Set Date
     *
     * Sets an input value as a date object, or
     * the default value
     *
     * @param {mixed} input
     * @param {mixed} def
     * @returns {mixed}
     */
    setDate: function setDate(input, def) {

        if(input instanceof Date) {
            /* Already date object - return */
            return input;
        }

        if(typeof input === "string") {
            /* Match ISO8601 date */
            if(input.match(/(\d{4}(?:(?:(?:\-)?(?:00[1-9]|0[1-9][0-9]|[1-2][0-9][0-9]|3[0-5][0-9]|36[0-6]))?|(?:(?:\-)?(?:1[0-2]|0[1-9]))?|(?:(?:\-)?(?:1[0-2]|0[1-9])(?:\-)?(?:0[1-9]|[12][0-9]|3[01]))?|(?:(?:\-)?W(?:0[1-9]|[1-4][0-9]5[0-3]))?|(?:(?:\-)?W(?:0[1-9]|[1-4][0-9]5[0-3])(?:\-)?[1-7])?)?)/)) {
                return new Date(input);
            }
        }

        return def;

    },



    /**
     * Set Enum
     *
     * Sets the input value if it's in the allowed
     * list
     *
     * @param {mixed} input
     * @param {array} values
     * @param {mixed} def
     * @returns {mixed}
     */
    setEnum: function setEnum(input, values, def) {

        if(arrayutils.inArray(input, values)) {
            return input;
        }

        return def;

    },



    /**
     * Set Float
     *
     * Sets an input value as a float, or
     * the default value
     *
     * @param {mixed} input
     * @param {mixed} def
     * @returns {mixed}
     */
    setFloat: function setFloat(input, def) {

        if(typeof input === "string" || typeof input === "number") {
            /* Cast to string so we can see if integer */
            var value = String(input);

            if(isNaN(value) === false) {
                return parseFloat(value);
            }
        }

        return def;

    },



    /**
     * Set Function
     *
     * Sets an input parameter as a function
     *
     * @param {mixed} input
     * @param {mixed} def
     * @returns {mixed}
     */
    setFunction: function setFunction(input, def) {

        if(typeof input === "function") {
            return input;
        }

        return def;

    },



    /**
     * Set Instance Of
     *
     * Sets the input parameter as an instance of the
     * given function
     *
     * @param {mixed} input
     * @param {function} instance
     * @param {mixed} def
     * @returns {mixed}
     */
    setInstanceOf: function setInstanceOf(input, instance, def) {

        if(typeof instance === "function" && input instanceof instance) {
            return input;
        }

        return def;

    },



    /**
     * Set Int
     *
     * Sets an input value as an integer, or
     * the default value
     *
     * @param {mixed} input
     * @param {mixed} def
     * @returns {mixed}
     */
    setInt: function setInt(input, def) {

        if(typeof input === "string" || typeof input === "number") {
            /* Cast to string so we can see if integer */
            var value = String(input);

            if(value.match(/^(\-|\+)?\d+$/)) {
                /* It's an integer - push to integer and carry on */
                return parseInt(value, 10);
            }
        }

        return def;

    },



    /**
     * Set Object
     *
     * Makes sure that the input is an object. This
     * is designed for key/value pairs, but will allow
     * other objects (like Date).
     *
     * This will not allow Arrays or null values in.
     *
     * @param {mixed} input
     * @param {mixed} def
     * @returns {mixed}
     */
    setObject: function setObject(input, def) {

        if(typeof input === "object" && (input instanceof Array) === false && input !== null) {
            return input;
        }

        return def;

    },



    /**
     * Set Regex
     *
     * Makes sure that the input matches the given
     * regular expression.  It also forces the output
     * to be a string, so be careful.
     *
     * @param {string|RegExp} regex
     * @param {string} input
     * @param {mixed} def
     * @returns {string}
     */
    setRegex: function setRegex(regex, input, def) {

        /* Put input to a string */
        input = this.setString(input, null);

        /* Make sure some input is set */
        if(input !== null) {

            if(typeof regex === "string") {
                regex = new RegExp(regex);
            }

            if(regex instanceof RegExp) {

                if(input.match(regex) !== null) {
                    return input;
                }

            } else {
                throw new Error("SETREGEX_NOT_REGEXP_OR_STRING");
            }

        }

        return def;

    },



    /**
     * Set String
     *
     * Sets an input value as a string, or
     * the default value
     *
     * @param {type} input
     * @param {type} def
     * @param {array} values
     * @returns {unresolved}
     */
    setString: function setString(input, def, values) {

        if(values instanceof Array === false) { values = null; }

        if(typeof input === "string" || (typeof input === "number" && isNaN(input) === false)) {

            input = String(input);

            if(values !== null) {
                if(values.indexOf(input) !== -1) {
                    return input;
                }
            } else {
                return input;
            }

        }

        return def;

    }



};