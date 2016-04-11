/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
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
                            tmp.onChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onVariableChange.dispatchEvent({id: e.id}, e.target); }, this)); //target override
                            this._variables[variable.id] = tmp;
                            break;

                        case PocketCode.UserVariableType.LIST:
                            tmp = new PocketCode.Model.UserVariableList(variable.id, variable.name, variable.value ? variable.value : undefined);
                            tmp.onChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onVariableChange.dispatchEvent({ id: e.id }, e.target); }, this));
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


    UserVariableSimple: (function () {

        function UserVariableSimple(id, name, value) {
            this._id = id;
            this.name = name;
            //this._defaultValue = 0.000001;
            //else
            //    this._value = 0.000001;   //prevent division by zero
            this._onChange = new SmartJs.Event.Event(this);
            //init
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
                    this._onChange.dispatchEvent({ id: this._id });
                },
            },
            valueAsNumber: {
                get: function () {
                    if (typeof this._value === 'number')
                        return this._value;
                    return 0;
                },
            },
        });

        //events
        Object.defineProperties(UserVariableSimple.prototype, {
            onChange: {
                get: function () { return this._onChange; },
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
                var val = this._value;
                if (val == undefined)
                    return '';
                if (typeof val != 'number')
                    return val.toString();
                if (parseInt(val) === val)
                    return val.toFixed(1);
                return val.toFixed(10);
            },
            reset: function () {
                if (this.value === undefined)
                    return;
                this.value = undefined;
            },
        });

        return UserVariableSimple;
    })(),


    /* please notice: this class does not represent a list of variables, but a user variable of type list */
    UserVariableList: (function () {

        function UserVariableList(id, name, value) {
            this._id = id;
            this.name = name;

            this._value = [];
            this._onChange = new SmartJs.Event.Event(this);
            //init
            if (value != undefined) {
                if (!(value instanceof Array))
                    throw new Error('invalid argument: expected: value typeof array');
                for (var i = 0, l = value.length; i < l; i++)
                    this.append(value[i]);
            }
        }

        //properties
        Object.defineProperties(UserVariableList.prototype, {
            length: {
                get: function () {
                    return this._value.length;
                }
            },
        });

        //events
        Object.defineProperties(UserVariableList.prototype, {
            onChange: {
                get: function () { return this._onChange; },
            },
        });

        //methods
        UserVariableList.prototype.merge({
            _toTypedValue: function (value) {
                if (value instanceof PocketCode.Model.UserVariableSimple)
                    return this._toTypedValue(value.value);
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
                this._onChange.dispatchEvent({ id: this._id });
            },
            _validIndex: function (idx) {
                if (parseInt(idx) !== idx || idx < 1 || idx > this._value.length)
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
                return 0;
            },
            insertAt: function (idx, value) {
                if (this._validIndex(idx)) {
                    this._value.insert(idx - 1, this._toTypedValue(value));
                    this._onChange.dispatchEvent({ id: this._id });
                }
                else if (idx == this._value.length + 1)
                    this.append(this._toTypedValue(value));
            },
            replaceAt: function (idx, value) {
                if (this._validIndex(idx)) {
                    this._value[idx - 1] = this._toTypedValue(value);
                    this._onChange.dispatchEvent({ id: this._id });
                }
            },
            deleteAt: function (idx) {
                if (this._validIndex(idx)) {
                    this._value.splice(idx - 1, 1);
                    this._onChange.dispatchEvent({ id: this._id });
                }
            },
            contains: function (value) {
                if (this._value.indexOf(this._toTypedValue(value)) !== -1)
                    return true;
                return false;
            },
            reset: function () {
                if (this._value.length === 0)
                    return;
                this._value = [];
                this._onChange.dispatchEvent({ id: this._id });
            },
        });

        return UserVariableList;
    })(),

});


