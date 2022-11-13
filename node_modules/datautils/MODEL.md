# Model

A strong model is essential for representing data.  It makes sure that the data
is correctly and consistently presented, can be validated against various rules
and can add helper functions automatically.

There are various ways of defining your models and this is mine. The starting
point is the [Backbone]([http://backbonejs.org) model, but hopefully improved
greatly.  These models have the following functionality:
 - create a definition, with type casting
 - create a new model as an extension of an existing model
 - validate the data, against various set or custom methods
 - allow definition of database columns, to decouple the database and model

## Get the Model Library

    var model = require('datautils').model;

## Extending a Model

The first thing you need to do is to extend the model. To do this, you want to
enter an object with a `definition` key.  Inside this object, the key is the
element name. Below is an example...

    /* Begin definition */
    var Model = model.extend({
        definition: {
            id: {
                type: "integer",
                value: null,
                primaryKey: true // This is the primary key - there can only be one
            },
            firstName: {
                type: "string",
                value: null
            },
            lastName: {
                type: "string",
                value: null
            },
            email: {
                type: "string",
                value: null
            }
        }
    });

This is a very simple model with 4 elements (id, firstName, lastName and email).
The datatype is specified by `type` and the default value is specified by
`value`.

Now we've defined the model, we can start using it.

    var obj = new Model({
        id: "2",
        firstName: "Test",
        lastName: "Testington",
        email: "test@test.com
    });

If we output this model, using the `toObject()` method, then we get this object.
Notice how the `id` has changed from a `String` into a `Number`. This is because
the `type` casts it (see [Data Type](#datatypes) for more information)

    {
        "id": 2,
        "firstName": "Test",
        "lastName": "Testington",
        "email": "test@test.com"
    }

## Getters and Setters

By default, you have the basic `get` and `set` method on the object.

	var obj = new Model({
    	key: "value"
    });

Now `obj.get("key");` will return `value` and you can update this by doing `obj.set("key", "newValue");`  This will now return `newValue`.

### Customised Setters

That will work for the majority of cases, but sometimes you'll want to do something to the data before actually setting it to the model.  Fortunately, we can pass in function.  The name **_must_** be in the format `setKeyname`.  It receives two parameters - the value you are trying to set and the default value.

	var Model = model.extend({
    	definition: {
        	key: {
            	type: "string",
                value: null
            }
        },
        /* Capitalise the K in key */
        setKey: function(value, defaults) {

        	/* Usually declared at top of file */
        	var datatype = require("datautils").data;

            value = datatype.setString(value, defaults);

            if(value !== defaults) {
            	/* Prepend the string */
            	value = "prepend-" + value;
            }

            /**
             * Now we can use the normal setter to set
             * the value.  We need to add a third parameter
             * of false so it doesn't enter into an
             * infinite loop
             */
            this.set("key", value, false);

        }
    });

    /* Create a model */
    var obj = new Model({
    	key: "value"
    });

Now when we run `obj.get("key")`, it will return `prepend-value`.  Again, you can use the `obj.set("key", "newValue")` to return `prepend-newValue;`

## Validating Data

In an ideal world, anyone working with this model would behave themselves and
would always put it in the correct data. However, in the real world, people will
always make mistakes.  So we validate the data.  Let's look at validation using
the `email` element.  Naturally, we want to ensure that this is actually an email
address.

When defining the model, we want to validate this as an email. Let's also make
it required to.

    var Model = model.extend({
        definition: {
            email: {
                type: "string",
                value: null,
                validation: [{
                    rule: "required"
                }, {
                    rule: "email"
                }]
            }
        }
    });

Let's now add it some data

    /* Email not set */
    var obj1 = new Model();

    /* Email not valid */
    var obj2 = new Model({
        email: "notanemail"
    });

Now, let's validate them and see what errors they throw

    obj1.validate();

    /* Throws
    {
        "errors": {
            "email":[{
                "message": "VALUE_REQUIRED",
                "value": null
            }]
        },
        "type": "ModelError"
    }
     */

    obj2.validate();

    /* Throws
    {
        "errors": {
            "email":[{
                "message": "VALUE_NOT_EMAIL",
                "value": "notanemail"
            }]
        },
        "type": "ModelError"
    }
     */

Sometimes you will want to validate an element where you have to pass in a
parameter.  We can do that easily.

    var Model = model.extend({
        definition: {
            username: {
                type: "string",
                validation: [{
                    rule: "lengthBetween",
                    param: [
                        5,
                        10
                    ]
                }]
            }
        }
    });

    var obj1 = new Model({
        username: "test"
    });

Now when we run the `validate()` method, it makes sure that the `username`
element is between 5 and 10 characters long.

### The Match Rule

Sometimes, we want to make sure that two elements are identical, such as when
confirming a password.

    var Model = model.extend({
        definition: {
            password: {
                type: "string",
                validation: [{
                    rule: "minLength",
                    param: 8
                }]
            },
            password2: {
                type: "string",
                validation: [{
                    rule: "match",
                    param: "password"
                }]
            }
        }
    });

This will ensure that the `password` element is a minimum of 8 characters long
and that the `password2` element matches the `password` element.  Note how that,
if you only have 1 parameter to pass in, you don't have to use an array.

### A Note on 'Required'

The `required` rule works slightly differently and only runs on ones that are
set.  For example, this would not throw an error...

    var obj2 = new Model();

The reason is because it's not required, so it only applies subsequent rules if
the value is not the default value.

## Custom Rules

There's plenty of pre-defined validation rules, but you might want to define your
own rules.  In order to pass the test it must return `true`.  If it returns `false`
or throws an error, it will fail the test.

    var Model = model.extend({
        definition: {
            name: {
                type: "string",
                validation: [{
                    rule: function(value, match) {
                        if(value === "throw") {
                            throw new Error("THROWN_ERROR");
                        }
                        return value === match;
                    },
                    param: "Test"
                }]
            }
        }
    });

This is a very simple example, showing how to pass in a function and parameters.
Also, notice how it either returns `false` or throws an error.  From the model's
point of view, both `false` and the throw error will result in a failed validation
test.

<a name="datatypes" />
## Data Types

The model elements can be defined with the following types. This uses the set
methods in [datatypes](lib/datatypes.js), so it will cast types as appropriate.

 - array
 - boolean
 - date: instance of `Date`, or a datetime string
 - float
 - integer
 - object
 - string
 - mixed: if it receives `undefined`, it uses the default value. Otherwise, it
uses whatever it receives.

## Model Methods

These are the methods available to the every model.

### _mixed_ get(_string_ key)

Returns the value of an individual parameter.

### _array_ getColumnKeys()

Gets the keys and the column name as an array of objects

### _string_ getPrimaryKey()

Gets the primary key

### _mixed_ getPrimaryKeyValue()

Gets the value of the primary key

### _undefined_ set(_string_ key, _mixed_ value)

Sets the value to the object

### _object_ toObject()

Clones out the data as an object of key/value pairs

### _boolean_ validate()

Validates the model against the validation rules.  It throws an error if it
detects a violation of the rules.  If it's fine, it continues without any
problems.

# Linking To A Database

It's always a good idea to keep your model and database loosely coupled. This
allows you long-term flexibility, such as if you need to change the database
type.  Sometimes, your database column and model elements will have different
names - maybe you prefer to have camelCase in your business logic and using
underscores in your database.

The definition element object can receive a `column` object - if you want to
change the database 'column' name, this is where you do it.

    /* Begin definition */
    var Model = model.extend({
        definition: {
            id: {
                type: "integer",
                value: null
            },
            firstName: {
                type: "string",
                value: null,
                column: "first_name"
            },
            lastName: {
                type: "string",
                value: null,
                column: "last_name"
            },
            email: {
                type: "string",
                value: null,
                column: "email_address"
            }
        }
    });

Let's now create a simple model

    var obj = new Model({
        firstName: "Test",
        lastName: "Testington",
        email: "test@test.com"
    });

## toData

The `toData` method on the object will convert the model into the database
representation of the data.

    var data = obj.toData();

`data` is now equal to:

    {
        "id": null,
        "first_name": "Test",
        "last_name": "Testington",
        "email_address": "test@test.com"
    }

## toModel

When we want to take data out of the database, we need to convert that into a
model.  The `toModel` method is your friend - it takes the object from the DB
and puts it into an instance of the model.

    var obj = Model.toModel({
        "id": 1,
        "first_name": "Test",
        "last_name": "Testington",
        "email_address": "test@test.com"
    });

`obj` is now and instance of `Model` and equal to:

    {
        "id": 1,
        "firstName": "Test",
        "lastName": "Testington"
        "emailAddress": "test@test.com"
    }