/// <reference path="../core.js" />
'use strict';


PocketCode.UserVariableScope = {
    LOCAL: 'local',
    GLOBAL: 'global',
};

PocketCode.UserVariableType = {
    SIMPLE: 'UserVariableSimple',
    LIST: 'UserVariableList',
};


PocketCode.Model.merge({

    UserVariableCollection: (function () {

        function UserVariableCollection(type, scope) {
            if (!type || (type !== PocketCode.UserVariableType.SIMPLE && type !== PocketCode.UserVariableType.LIST))
                throw new Error('invalid argument: type');
            this._type = type;

            if (!scope || (scope !== PocketCode.UserVariableScope.LOCAL && scope !== PocketCode.UserVariableScope.GLOBAL))
                throw new Error('invalid argument: scope');
            this._scope = scope;

            this._variables = {};
        }

        UserVariableCollection.prototype = {
            initVariableList: function (variables) {
                if (!(variables instanceof Array))
                    throw new Error('setter expects type Array');

                this._variables = {};   //empty
                for (var i = 0, l = variables.length; i < l; i++) {
                    var variable = variables[i];

                    switch (this._type) {
                        case PocketCode.UserVariableType.SIMPLE:
                            //var tmp = 
                            this._variables[variable.id] = new PocketCode.Model.UserVariableSimple(variable.id, variable.name, variable.value ? variable.value : undefined);
                            break;

                        case PocketCode.UserVariableType.LIST:
                            //var tmp = 
                            this._variables[variable.id] = new PocketCode.Model.UserVariableList(variable.id, variable.name, variable.value ? variable.value : undefined);
                            break;

                    }
                    //this._variables[variable.id] = tmp;
                }
            },
            getVariableById: function (id) {
                if (id === null) {  //this is required because the android app allows adding a variable brick without defining a name
                    if (this._type === PocketCode.UserVariableType.SIMPLE)
                        return new PocketCode.Model.UserVariableSimple(null, "New...");
                    else
                        return new PocketCode.Model.UserVariableList(null, "New...");
                }
                //if (this._variables[id])
                return this._variables[id];
                //throw new Error('variable/list not found: id=' + id + ', type: ' + this._type);
            },
            getVariables: function () {
                return this._variables;
            },
        };

        return UserVariableCollection;
    })(),


    UserVariableSimple: (function () {

        function UserVariableSimple(/*scope,*/ id, name, value) {   //scope is handled already by it's collection
            //this.scope = scope;
            this._id = id;
            this.name = name;
            //if (value != undefined)
            this._value = this._toTypedValue(value);
            //else
            //    this.value = undefined;   //init
        }

        //properties
        Object.defineProperties(UserVariableSimple.prototype, {
            value: {
                get: function () {
                    return this._value;
                },
                set: function (value) {
                    this._value = this._toTypedValue(value);
                },
            },
            valueAsNumber: {
                get: function () {
                    if (typeof this._value === 'number')
                        return this._value;
                    //if (typeof this._value === 'string') {    //not scratch conform
                    //    var num = parseFloat(this._value);
                    //    return num.toString() === this._value ? num : 0;
                    //}
                    return 0;
                },
            },
        });

        //methods
        UserVariableSimple.prototype.merge({
            _toTypedValue: function (value) {
                if (value instanceof PocketCode.Model.UserVariableSimple)
                    return value.value;
                else if (value instanceof PocketCode.Model.UserVariableList)
                    return this._toTypedValue(value.toString());
                else if (typeof value === 'string') {
                    var num = parseFloat(value);
                    return (num.toString() === value ? num : value);
                }
                else
                    return value;
            },
            toString: function () {
                if (this._value)
                    return this._value.toString();
                return '';
            },
        });

        return UserVariableSimple;
    })(),


    /* please notice: this class does not represent a variable list, but a user variable of type list */
    UserVariableList: (function () {

        function UserVariableList(/*scope,*/ id, name, value) {   //scope is handled already by it's collection
            this._id = id;
            this.name = name;

            this._value = [];
            if (value != undefined) {
                if (!(value instanceof Array))
                    throw new Error('invalid argument: expected: value typeof array');
                for (var i = 0, l = value.length; i < l; i++)
                    this.append(value[i]);
            }
            //else
            //    this._value = [];   //init
        }

        //properties
        Object.defineProperties(UserVariableList.prototype, {
            length: {
                get: function () {
                    return this._value.length;
                }
            },
        });

        //methods
        UserVariableList.prototype.merge({
            _toTypedValue: function (value) {
                if (value instanceof PocketCode.Model.UserVariableSimple)
                    return value.value;
                else if (value instanceof PocketCode.Model.UserVariableList)
                    return this._toTypedValue(value.toString());
                else if (typeof value === 'string') {
                    var num = parseFloat(value);
                    return (num.toString() === value ? num : value);
                }
                return value;
            },
            toString: function () {
                return this._value.join(' ');
            },
            append: function (value) {
                this._value.push(this._toTypedValue(value));
            },
            _validIndex: function (idx) {
                if (idx < 1 || idx > this._value.length)
                    return false;
                return true;
            },
            valueAt: function (idx) {
                if (this._validIndex(idx))
                    return this._value[idx - 1];
                return undefined;
            },
            valueAsNumberAt: function (idx) {
                var val = this.valueAt(idx);
                if (typeof val === 'number')
                    return val;
                //if (typeof val === 'string') {    //not scratch conform
                //    var num = parseFloat(val);
                //    return num.toString() === val ? num : 0;
                //}
                return 0;
            },
            insertAt: function (idx, value) {
                if (this._validIndex(idx))
                    this._value.insert(idx - 1, this._toTypedValue(value));
                else if (idx == this._value.length + 1)
                    this.append(this._toTypedValue(value));
            },
            replaceAt: function (idx, value) {
                if (this._validIndex(idx))
                    this._value[idx - 1] = this._toTypedValue(value);
            },
            deleteAt: function (idx) {
                if (this._validIndex(idx))
                    this._value.splice(idx - 1, 1);
            },
            contains: function (value) {
                if (this._value.indexOf(this._toTypedValue(value)) !== -1)
                    return true;
                return false;
            },
        });

        return UserVariableList;
    })(),

});


