/**
 * Model Error
 *
 * If the model throw an error, this
 * is the error that it uses.  It is
 * an instance of the main Error
 * object but with utility methods.
 */

/* Node modules */
var _ = require("underscore");



function ModelError() {

    Error.call(this);

    this.errors = null;

    Object.defineProperty(this, "type", {
        enumerable: true,
        configurable: true,
        writable: false,
        value: "ModelError"
    });

    return this;

}



ModelError.prototype = new Error();
ModelError.prototype.constructor = ModelError;



_.extend(ModelError.prototype, {



    /**
     * Add Error
     *
     * Add in a new error
     *
     * @param {string} key
     * @param {object} err
     */
    addError: function(key, err) {

        if(this.errors === null) {
            this.errors = {};
        }

        if(this.errors[key] === undefined) {
            this.errors[key] = [];
        }

        this.errors[key].push(err);

    },



    /**
     * Get Errors
     *
     * Gets the errors contained in this
     * object.
     *
     * @returns {array}
     */
    getErrors: function() {
        return this.errors;
    },



    /**
     * Get Stack
     *
     * Gets the stack
     *
     * @returns {string}
     */
    getStack: function() {
        return this.stack;
    },



    /**
     * Get Type
     *
     * Gets the error type
     *
     * @returns {string}
     */
    getType: function() {
        return this.type;
    },



    /**
     * Has Errors
     *
     * Do we have any errors?
     *
     * @returns {boolean}
     */
    hasErrors: function() {
        return this.errors !== null;
    }



});



module.exports = ModelError;