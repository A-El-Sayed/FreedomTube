/**
 * Validation
 *
 * This is a collection of validation utilies.
 */

var datatypes = require("./datatypes");
var _ = require("underscore");


/**
 * Exception
 *
 * This is a simple creator of the Error
 * object that allows us to pass in a value
 * parameter easily.  This is a private
 * method that should not be exposed out of
 * this file.
 *
 * @param {string} message
 * @param {mixed} value
 * @returns {Error}
 */
function Exception(message, value) {
    var err = new Error(message);
    err.value = value;

    /* Push arguments to array */
    var args = Array.prototype.slice.call(arguments);

    args.shift();
    args.shift();

    if(args.length > 0) {
        err.params = args;
    }

    return err;
}



module.exports = {


    /**
     * Email
     *
     * Checks if the given string validates as
     * an email address. THIS DOES NOT CHECK IF
     * THE EMAIL IS ACTUALLY VALID!!!
     *
     * @param {string} value
     * @returns {boolean}
     * @throws {Error}
     */
    email: function(value) {

        if(typeof value === "string") {
            var match = value.match(/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/i);

            if(match === null) {
                throw new Exception("VALUE_NOT_EMAIL", value);
            }
        } else {
            throw new Exception("VALUE_NOT_EMAIL_NOT_STRING", value);
        }

        return true;

    },


    /**
     * Equal
     *
     * This tests if the two variables are equal. If
     * the variables are of a complex nature (eg,
     * objects), then it will match those too.
     *
     * @param {mixed} value
     * @param {mixed} match
     * @returns {Boolean}
     * @throw {Error}
     */
    equal: function(value, match) {

        /**
         * This long comparison is taken from Stack Overflow
         *
         * @link http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
         */
        var deepCompare = function () {
            var leftChain, rightChain;

            function compare2Objects (x, y) {
                var p;

                // remember that NaN === NaN returns false
                // and isNaN(undefined) returns true
                if (isNaN(x) && isNaN(y) && typeof x === "number" && typeof y === "number") {
                    return true;
                }

                // Compare primitives and functions.
                // Check if both arguments link to the same object.
                // Especially useful on step when comparing prototypes
                if (x === y) {
                    return true;
                }

                // Works in case when functions are created in constructor.
                // Comparing dates is a common scenario. Another built-ins?
                // We can even handle functions passed across iframes
                if ((typeof x === "function" && typeof y === "function") ||
                    (x instanceof Date && y instanceof Date) ||
                    (x instanceof RegExp && y instanceof RegExp) ||
                    (x instanceof String && y instanceof String) ||
                    (x instanceof Number && y instanceof Number)) {
                        return x.toString() === y.toString();
                }

                // At last checking prototypes as good a we can
                if (!(x instanceof Object && y instanceof Object)) {
                    return false;
                }

                if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                    return false;
                }

                if (x.constructor !== y.constructor) {
                    return false;
                }

                if (x.prototype !== y.prototype) {
                    return false;
                }

                // check for infinitive linking loops
                if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
                    return false;
                }

                // Quick checking of one object beeing a subset of another.
                // todo: cache the structure of arguments[0] for performance
                for (p in y) {
                    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                        return false;
                    } else if (typeof y[p] !== typeof x[p]) {
                        return false;
                    }
                }

                for (p in x) {
                    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                        return false;
                    } else if (typeof y[p] !== typeof x[p]) {
                        return false;
                    }

                    switch (typeof (x[p])) {
                        case "object":
                        case "function":

                            leftChain.push(x);
                            rightChain.push(y);

                            if (!compare2Objects (x[p], y[p])) {
                                return false;
                            }

                            leftChain.pop();
                            rightChain.pop();
                            break;

                        default:
                            if (x[p] !== y[p]) {
                                return false;
                            }
                            break;
                    }
                }

                return true;
            }

            if (arguments.length < 1) {
                return true; //Die silently? Don't know how to handle such case, please help...
                // throw "Need two or more arguments to compare";
            }

            for (var i = 1, l = arguments.length; i < l; i++) {

                leftChain = []; //todo: this can be cached
                rightChain = [];

                if (!compare2Objects(arguments[0], arguments[i])) {
                    return false;
                }
            }

            return true;
        };

        if(value === match) {
            /* Simple matching - works on scalar values */
            return true;
        } else if(deepCompare(value, match) === true) {
            /* More complex matching - works on all values */
            return true;
        } else {
            /* We've not matched */
            throw new Exception("VALUES_NOT_EQUAL", value, match);
        }

    },


    /**
     * Greater Than
     *
     * Does a numerical test on the variable, to
     * see if it is greater than the given value.
     *
     * @param {mixed} value
     * @param {mixed} target
     * @returns {Boolean}
     * @throw {Error}
     */
    greaterThan: function(value, target) {

        var numValue = datatypes.setFloat(value, null);
        var numTarget = datatypes.setFloat(target, null);

        if(numValue === null || numTarget === null) {
            throw new Exception("VALUE_GREATER_THAN_TYPE_ERROR", value, target);
        }

        if(numValue > numTarget) {
            return true;
        } else {
            throw new Exception("VALUE_NOT_GREATER_THAN_TARGET", value, target);
        }

    },


    /**
     * Greater Than Or Equal
     *
     * Does a numerical test on the variable, to
     * see if it is greater than or equal to the
     * given value.
     *
     * @param {mixed} value
     * @param {mixed} target
     * @returns {Boolean}
     * @throw {Error}
     */
    greaterThanOrEqual: function(value, target) {

        var numValue = datatypes.setFloat(value, null);
        var numTarget = datatypes.setFloat(target, null);

        if(numValue === null || numTarget === null) {
            throw new Exception("VALUE_GREATER_OR_EQUAL_TO_TYPE_ERROR", value, target);
        }

        if(numValue >= numTarget) {
            return true;
        } else {
            throw new Exception("VALUE_NOT_GREATER_OR_EQUAL_TO_TARGET", value, target);
        }

    },


    /**
     * Length
     *
     * Makes sure that the value matches the length
     *
     * @param {string} value
     * @param {number} length
     * @returns {boolean}
     */
    length: function(value, length) {

        var iLength = datatypes.setInt(length, null);

        if(typeof value === "string" || _.isObject(value) || _.isArray(value)) {

            if (iLength === null) {
                throw new Exception("LENGTH_NOT_INTEGER", value, length);
            }

            if (iLength < 0) {
                throw new Exception("LENGTH_LESS_THAN_ZERO", value, iLength);
            }

            if (_.size(value) !== iLength) {
                throw new Exception("VALUE_DOES_NOT_MATCH_LENGTH", value, iLength);
            }

        } else {
            throw new Exception("VALUE_LENGTH_NOT_STRING", value, length);
        }

        return true;

    },


    /**
     * Length Between
     *
     * Checks if the value is between the two lengths
     *
     * @param {string} value
     * @param {number} minLength
     * @param {number} maxLength
     * @returns {Boolean}
     */
    lengthBetween: function(value, minLength, maxLength) {

        var iMinLength = datatypes.setInt(minLength, null);
        var iMaxLength = datatypes.setInt(maxLength, null);

        if(typeof value === "string" || _.isObject(value) || _.isArray(value)) {

            if(iMinLength === null) {
                throw new Exception("LENGTH_BETWEEN_MINLENGTH_NOT_INTEGER", value, iMinLength, iMaxLength);
            }

            if(iMaxLength === null) {
                throw new Exception("LENGTH_BETWEEN_MAXLENGTH_NOT_INTEGER", value, iMinLength, iMaxLength);
            }

            if(iMinLength < 0) {
                throw new Exception("LENGTH_BETWEEN_MINLENGTH_LESS_THAN_ZERO", value, iMinLength, iMaxLength);
            }

            if(iMaxLength < iMinLength) {
                throw new Exception("LENGTH_BETWEEN_MAXLENGTH_LESS_THAN_MINLENGTH", value, iMinLength, iMaxLength);
            }

            if(_.size(value) < iMinLength || _.size(value) > iMaxLength) {
                throw new Exception("VALUE_NOT_BETWEEN_MINLENGTH_AND_MAXLENGTH", value, iMinLength, iMaxLength);
            }

        } else {
            throw new Exception("VALUE_LENGTH_BETWEEN_NOT_STRING", value, iMinLength, iMaxLength);
        }

        return true;

    },


    /**
     * Less Than
     *
     * Does a numerical test on the variable, to
     * see if it is less than the given value.
     *
     * @param {mixed} value
     * @param {mixed} target
     * @returns {Boolean}
     * @throw {Error}
     */
    lessThan: function(value, target) {

        var numValue = datatypes.setFloat(value, null);
        var numTarget = datatypes.setFloat(target, null);

        if(numValue === null || numTarget === null) {
            throw new Exception("VALUE_LESS_THAN_TYPE_ERROR", value, target);
        }

        if(numValue < numTarget) {
            return true;
        } else {
            throw new Exception("VALUE_NOT_LESS_THAN_TARGET", value, target);
        }

    },


    /**
     * Less Than Or Equal
     *
     * Does a numerical test on the variable, to
     * see if it is less than or equal to the
     * given value.
     *
     * @param {mixed} value
     * @param {mixed} target
     * @returns {Boolean}
     * @throw {Error}
     */
    lessThanOrEqual: function(value, target) {

        var numValue = datatypes.setFloat(value, null);
        var numTarget = datatypes.setFloat(target, null);

        if(numValue === null || numTarget === null) {
            throw new Exception("VALUE_LESS_OR_EQUAL_TO_TYPE_ERROR", value, target);
        }

        if(numValue <= numTarget) {
            return true;
        } else {
            throw new Exception("VALUE_NOT_LESS_OR_EQUAL_TO_TARGET", value, target);
        }

    },


    /**
     * Max Length
     *
     * Ensures that the value is no longer than
     * the given max length
     *
     * @param {string} value
     * @param {number} length
     * @returns {Boolean}
     */
    maxLength: function(value, length) {

        var iLength = datatypes.setInt(length, null);

        if(typeof value === "string" || _.isObject(value) || _.isArray(value)) {

            if (iLength === null) {
                throw new Exception("MAX_LENGTH_NOT_INTEGER", value, length);
            }

            if (iLength < 0) {
                throw new Exception("MAX_LENGTH_LESS_THAN_ZERO", value, iLength);
            }

            if(_.size(value) > iLength) {
                throw new Exception("VALUE_GREATER_THAN_MAX_LENGTH", value, iLength);
            }

        } else {
            throw new Exception("VALUE_MAX_LENGTH_NOT_STRING", value, length);
        }

        return true;

    },


    /**
     * Min Length
     *
     * Ensures that the value fulfils the given
     * minimum length
     *
     * @param {string} value
     * @param {number} length
     * @returns {Boolean}
     * @throws {Exception}
     */
    minLength: function(value, length) {

        var iLength = datatypes.setInt(length, null);

        if(typeof value === "string" || _.isObject(value) || _.isArray(value)) {

            if (iLength === null) {
                throw new Exception("MIN_LENGTH_NOT_INTEGER", value, length);
            }

            if (iLength < 0) {
                throw new Exception("MIN_LENGTH_LESS_THAN_ZERO", value, iLength);
            }

            if (_.size(value) < iLength) {
                throw new Exception("VALUE_LESS_THAN_MIN_LENGTH", value, iLength);
            }

        } else {
            throw new Exception("VALUE_MIN_LENGTH_NOT_STRING", value, length);
        }

        return true;

    },


    /**
     * Regex
     *
     * Matches the given value against the given
     * regular expression.  It will allow either
     * a string or an instance of the RegExp
     * object (by either new RegExp() or /regex/)
     *
     * @param {string} value
     * @param {RegExp|string} regex
     * @returns {Boolean}
     * @throws {Exception}
     */
    regex: function(value, regex) {

        if(regex instanceof RegExp === false) {
            if(typeof regex === "string") {
                /* Push to a regular expression */
                regex = new RegExp(regex);
            } else {
                throw new Exception("VALUE_REGEX_NOT_REGEXP_OR_STRING", value, regex);
            }
        }

        var result = value.match(regex);

        if(result === null) {
            throw new Exception("VALUE_REGEX_FAILED_TO_MATCH", value, regex.toString());
        }

        return true;

    },


    /**
     * Required
     *
     * If it's a truthy value, 0 or false, it is ok. Otherwise,
     * it fails the test
     *
     * @param {mixed} value
     * @returns {boolean}
     * @throws {Error}
     */
    required: function(value) {
        if (value instanceof Array) {
            if (value.length > 0) {
                return true;
            }
        } else if(value || value === 0 || value === false) {
            return true;
        }
        throw new Exception("VALUE_REQUIRED", value);
    }


};