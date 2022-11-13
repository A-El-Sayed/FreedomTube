/**
 * Array Utils
 *
 * Helper functions for arrays
 */

module.exports = {


    /**
     * In Array
     *
     * Checks if the needle is in the haystack
     *
     * @param {mixed} needle
     * @param {mixed} haystack
     * @returns {Boolean}
     */
    inArray: function inArray(needle, haystack) {

        if(typeof haystack === "object" && haystack instanceof Array) {
            return haystack.indexOf(needle) !== -1;
        }

        return false;

    },


    /**
     * Object Values
     *
     * Pass out the values of an object
     * as an array.  Similar to PHP's
     * array_values() function
     *
     * @param {object} obj
     * @returns {array}
     */
    objectValues: function objectValues(obj) {

        if(typeof obj !== "object" || obj instanceof Array || obj === null) {
            throw new TypeError("INPUT_NOT_OBJECT");
        }

        var arrOut = [];

        for(var key in obj) {
            arrOut.push(obj[key]);
        }

        return arrOut;
    }


};