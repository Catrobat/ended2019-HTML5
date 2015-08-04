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
                return this._variables[id];
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
                this._value = value;
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
                    this._value = value;
                },
            },
        });

        //methods
        UserVariableSimple.prototype.merge({
            toString: function () {
                if (this._value)
                    return this._value.toString();
                return '';
            },
        });

        return UserVariableSimple;
    })(),

});


/* please notice: this class does not represent a variable list, but a user variable of type list */
PocketCode.Model.UserVariableList = (function () {
    UserVariableList.extends(PocketCode.Model.UserVariableSimple, false);

    function UserVariableList(/*scope,*/ id, name, value) {   //scope is handled already by it's collection
        PocketCode.Model.UserVariableSimple.call(this, /*scope,*/ id, name);

        if (value != undefined) {
            if (!(value instanceof Array))
                throw new Error('invalid argument: expected: value typeof array');
            this._value = value;
        }
        else
            this._value = [];   //init
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
        toString: function () {
            return this._value.join(' ');
        },
        append: function (value) {
            this._value.push(value);
        },
        _validIndex: function (idx) {
            if (idx < 1 || idx > this._value.length)
                return false;
            return true;
        },
        valueAt: function(idx) {
            if (this._validIndex(idx))
                return this._value[idx - 1];
            return undefined;
        },
        insertAt: function (idx, value) {
            if (this._validIndex(idx))
                this._value.insert(value, idx - 1);  //this.value.insert(idx, value);    //TODO: cahnge insert function in js.js (change parameter order)
            else if (idx == this._value.length + 1)
                this.append(value);
        },
        replaceAt: function (idx, value) {
            if (this._validIndex(idx))
                this._value[idx - 1] = value;
        },
        deleteAt: function (idx) {
            if (this._validIndex(idx))
                this._value.splice(idx - 1, 1);
        },
        contains: function (value) {
            if (this._value.indexOf(value) !== -1)
                return true;
            return false;
        },
    });

    return UserVariableList;
})();

