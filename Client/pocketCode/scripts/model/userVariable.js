/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';


PocketCode.UserVariableScope = {
    PROCEDURE: 'procedure', //function is a protected name and may cause errors
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

            if (!scope || (scope !== PocketCode.UserVariableScope.PROCEDURE && scope !== PocketCode.UserVariableScope.LOCAL && scope !== PocketCode.UserVariableScope.GLOBAL))
                throw new Error('invalid argument: scope');
            this._scope = scope;

            this._variables = {};
            this._onVariableChange = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(UserVariableCollection.prototype, {
            onVariableChange: {
                get: function () { return this._onVariableChange; },
            },
        });

        //methods
        UserVariableCollection.prototype.merge({
            initVariableList: function (variables) {
                if (!(variables instanceof Array))
                    throw new Error('setter expects type Array');

                this._variables = {};   //empty
                var variable, tmp;
                for (var i = 0, l = variables.length; i < l; i++) {
                    variable = variables[i];

                    switch (this._type) {
                        case PocketCode.UserVariableType.SIMPLE:
                            tmp = new PocketCode.Model.UserVariableSimple(variable.id, variable.name, variable.value ? variable.value : undefined);
                            tmp.onChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onVariableChange.dispatchEvent({ id: e.id, value: e.value }, e.target); }, this)); //target override
                            this._variables[variable.id] = tmp;
                            break;

                        case PocketCode.UserVariableType.LIST:
                            tmp = new PocketCode.Model.UserVariableList(variable.id, variable.name, variable.value ? variable.value : undefined);
                            //tmp.onChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onVariableChange.dispatchEvent({ id: e.id, value: e.value }, e.target); }, this));
                            this._variables[variable.id] = tmp;
                            break;
                    }
                }
            },
            getVariableById: function (id) {
                if (id === null) {  //this is required because the android app allows adding a variable brick without defining a name
                    if (this._type === PocketCode.UserVariableType.SIMPLE)
                        return new PocketCode.Model.UserVariableSimple(null, "New...");
                    else
                        return new PocketCode.Model.UserVariableList(null, "New...");
                }
                if (this._variables.hasOwnProperty(id))
                    return this._variables[id];
            },
            getVariables: function () {
                return this._variables;
            },
            reset: function () {
                for (var v in this._variables)
                    this._variables[v].reset();
            },
        });

        return UserVariableCollection;
    })(),

    UserVariable: (function () {

        function UserVariable(id, name) {
            this._id = id;
            this.name = name;

            //events
            this._onChange = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(UserVariable.prototype, {
            onChange: {
                get: function () { return this._onChange; },
            },
        });

        //methods
        UserVariable.prototype.merge({
            _toTypedValue: function (value) {
                if (value === null || value === undefined)
                    return undefined;
                if (value instanceof PocketCode.Model.UserVariable) //for variables and lists
                    return value.value;
                if (typeof value === 'string') { //convert numbers added as string
                    var num = parseFloat(value);
                    return (num.toString() === value ? num : value);
                }
                if (isNaN(value))   //false for bools and Infinity, true for e.g. Error
                    return 0;   //like in Scratch
                else    //boolean or number including +-Infinity
                    return value;
            },
        });

        return UserVariable;
    })(),

});

PocketCode.Model.merge({

    UserVariableSimple: (function () {
        UserVariableSimple.extends(PocketCode.Model.UserVariable, false);

        function UserVariableSimple(id, name, value) {
            PocketCode.Model.UserVariable.call(this, id, name);

            this._value = 0;
            if (value != undefined)
                this._value = this._toTypedValue(value);
        }

        //properties
        Object.defineProperties(UserVariableSimple.prototype, {
            value: {
                get: function () {
                    return this._value;
                },
                set: function (value) {
                    value = this._toTypedValue(value);
                    if (this._value == value)
                        return;
                    this._value = value;
                    this._onChange.dispatchEvent({ id: this._id, value: this._value });
                },
            },
        });

        //methods
        UserVariableSimple.prototype.merge({
            reset: function () {
                this._value = 0;
            },
        });

        return UserVariableSimple;
    })(),


    /* please notice: this class does not represent a list of variables, but a user variable of type list */
    UserVariableList: (function () {
        UserVariableList.extends(PocketCode.Model.UserVariable, false);

        function UserVariableList(id, name, value) {
            PocketCode.Model.UserVariable.call(this, id, name);

            this._value = [];
            if (value != undefined) {
                if (!(value instanceof Array))
                    throw new Error('invalid argument: expected: value typeof array');
                for (var i = 0, l = value.length; i < l; i++)
                    this.append(value[i]);
            }
        }

        //properties
        Object.defineProperties(UserVariableList.prototype, {
            value: {
                //as lists can be assigned to variables and used in formulas (at least in Scratch) we need
                //to represent the list as single value as well
                get: function () {
                    return this._toTypedValue(this._value.join(''));
                },
            },
            length: {
                get: function () {
                    return this._value.length;
                }
            },
        });

        //methods
        UserVariableList.prototype.merge({
            append: function (value) {
                this._value.push(this._toTypedValue(value));
            },
            _validateIndex: function (idx, length) {
                idx = this._toTypedValue(idx);  //NaN -> 0
                if (idx === true)   //false = isNaN
                    idx = 1;
                idx = Math.floor(idx);  //to int like in Scratch
                if (idx < 1 || idx > length)
                    return false;
                return idx;
            },
            valueAt: function (idx) {
                idx = this._validateIndex(idx, this._value.length);
                if (idx)
                    return this._value[idx - 1];
                return undefined;
            },
            insertAt: function (idx, value) {
                idx = this._validateIndex(idx, this._value.length + 1);
                if (!idx)
                    return;

                if (idx <= this._value.length)
                    this._value.insert(idx - 1, this._toTypedValue(value));
                else
                    this.append(this._toTypedValue(value));
            },
            replaceAt: function (idx, value) {
                idx = this._validateIndex(idx, this._value.length);
                if (idx) //{
                    this._value[idx - 1] = this._toTypedValue(value);
            },
            deleteAt: function (idx) {
                idx = this._validateIndex(idx, this._value.length);
                if (idx) //{
                    this._value.splice(idx - 1, 1);
            },
            contains: function (value) {
                if (this._value.indexOf(this._toTypedValue(value)) !== -1)
                    return true;
                return false;
            },
            reset: function () {
                this._value = [];
            },
        });

        return UserVariableList;
    })(),
});
