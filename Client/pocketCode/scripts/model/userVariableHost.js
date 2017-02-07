/// <reference path="../model/userVariable.js" />
'use strict';

/*
 * this is a base class for sprite and gameEngine introduced to avoid duplicated code for handling variables and lists
 */
PocketCode.Model.UserVariableHost = (function () {
    UserVariableHost.extends(SmartJs.Core.Component);

    //ctr
    function UserVariableHost(scope, globalLookupHost) {
        if (scope !== PocketCode.UserVariableScope.PROCEDURE &&
            scope !== PocketCode.UserVariableScope.LOCAL &&
            scope !== PocketCode.UserVariableScope.GLOBAL)
            throw new Error('invalid argument: scope');
        this.__variableScope = scope;

        if (globalLookupHost) {
            if (!(globalLookupHost instanceof PocketCode.Model.UserVariableHost))
                throw new Error('invalid argument: global lookup host: expectet type = PocketCode.Model.UserVariableHost');
            if (scope === PocketCode.UserVariableScope.GLOBAL)
                throw new Error('invalid argument: a global lookup host cannot refer to another global variable definition');
            if (scope == PocketCode.UserVariableScope.PROCEDURE && globalLookupHost.variableScope !== PocketCode.UserVariableScope.LOCAL ||
                scope == PocketCode.UserVariableScope.LOCAL && globalLookupHost.variableScope !== PocketCode.UserVariableScope.GLOBAL)
                throw new Error('invalid argument: a lookup host has to have a \'parent\' scope');
        }
        this.__variableLookupHost = globalLookupHost;

        this.__variablesSimple = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.SIMPLE, scope);
        this.__variablesList = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.LIST, scope);

        this._onVariableChange = new SmartJs.Event.Event(this);
        this.__variablesSimple.onVariableChange.addEventListener(new SmartJs.Event.EventListener(this._valueChangeHandler, this));
        //this.__variablesList.onVariableChange.addEventListener(new SmartJs.Event.EventListener(this._valueChangeHandler, this));
    }

    //properties
    Object.defineProperties(UserVariableHost.prototype, {
        renderingVariables: {
            get: function () {
                var list = [],
                    vars = this.__variablesSimple.getVariables();
                for (var v in vars) {   //{[id]: {}}
                    if (vars.hasOwnProperty(v))
                        list.push(new PocketCode.RenderingText({ id: v, text: vars[v].toString(), x: 0, y: 0, visible: false }));
                }
                return list;
            },
        },
        variableScope: {
            get: function () {
                return this.__variableScope;
            },
        },
        _variables: {
            set: function (value) {
                this.__variablesSimple.initVariableList(value);
            },
        },
        _lists: {
            set: function (value) {
                this.__variablesList.initVariableList(value);
            },
        },
    });

    //events
    //Object.defineProperties(UserVariableHost.prototype, {
    //    _onVariableChange: {
    //        get: function () { return this.__variablesSimple.onVariableChange },    //binding to internal event
    //    },
    //    _onListChange: {
    //        get: function () { return this.__variablesList.onVariableChange },      //binding to internal event
    //    },
    //});

    //methods
    UserVariableHost.prototype.merge({
        getVariable: function (id) {
            var tmp = this.__variablesSimple.getVariableById(id);
            if (!tmp && this.__variableLookupHost)
                tmp = this.__variableLookupHost.getVariable(id);
            if (tmp)
                return tmp;

            throw new Error('variable with id ' + id + ' not found');
        },
        getAllVariables: function () {
            var tmp = {
                //[PocketCode.UserVariableScope.GLOBAL]: {},
                //[PocketCode.UserVariableScope.LOCAL]: {},
                //[PocketCode.UserVariableScope.PROCEDURE]: {},
                //^^not supported by blanket.js (code coverage)
                global: {},
                local: {},
                procedure: {},
            };
            tmp[this.__variableScope] = this.__variablesSimple.getVariables();
            if (this.__variableLookupHost)
                tmp.merge(this.__variableLookupHost.getAllVariables());
            return tmp;
        },
        _valueChangeHandler: function (e) {
            this._onVariableChange.dispatchEvent({ id: e.id, properties: { text: e.target.toString() } });
        },
        showVariableAt: function (id, positionX, positionY) {   //called as sprite.show.. from brick
            var tmp = this.getVariable(id);

            if (isNaN(positionX) || isNaN(positionY))
                throw new Error('show variable: invalid position');
            this._onVariableChange.dispatchEvent({ id: id, properties: { text: tmp.toString(), visible: true, x: positionX, y: positionY } });
        },
        hideVariable: function (id) {    //called as sprite.hide.. from brick
            var tmp = this.getVariable(id);
            //if (!tmp)
            //    throw new Error('hide variable: variable with id = ' + id + 'could not be found');
            this._onVariableChange.dispatchEvent({ id: id, properties: { visible: false } });
        },
        getList: function (id) {
            var tmp = this.__variablesList.getVariableById(id);
            if (!tmp && this.__variableLookupHost)
                tmp = this.__variableLookupHost.getList(id);
            if (tmp)
                return tmp;

            throw new Error('list with id ' + id + ' not found');
        },
        getAllLists: function () {
            var tmp = {
                //[PocketCode.UserVariableScope.GLOBAL]: {},
                //[PocketCode.UserVariableScope.LOCAL]: {},
                //[PocketCode.UserVariableScope.PROCEDURE]: {},
                //^^not supported by blanket.js (code coverage)
                global: {},
                local: {},
                procedure: {},
            };
            tmp[this.__variableScope] = this.__variablesList.getVariables();
            if (this.__variableLookupHost)
                tmp.merge(this.__variableLookupHost.getAllLists());
            return tmp;
        },
        _resetVariables: function () {
            this.__variablesSimple.reset();
            this.__variablesList.reset();
        },
        /* override */
        dispose: function () {
            this.__variableLookupHost = undefined;  //prevent gameEngine from getting disposed as well during background or sprite dispose
            //call super class
            SmartJs.Core.Component.prototype.dispose.call(this);
        },
    });

    return UserVariableHost;
})();
