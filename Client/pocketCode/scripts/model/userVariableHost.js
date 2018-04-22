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
        this.__variablesSimple.onVariableChange.addEventListener(new SmartJs.Event.EventListener(this._valueChangeHandler, this));
        this.__variablesList = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.LIST, scope);
        //this.__variablesList.onVariableChange.addEventListener(new SmartJs.Event.EventListener(this._valueChangeHandler, this));

        this._variableViewStates = {};

        //events
        this._onVariableChange = new SmartJs.Event.Event(this); //internal (protected) event used by sprites and gameEngine
    }

    //properties
    Object.defineProperties(UserVariableHost.prototype, {
        variableScope: {
            get: function () {
                return this.__variableScope;
            },
        },
        _variables: {
            set: function (variables) {
                this.__variablesSimple.initVariableList(variables);
                this._variableViewStates = {};
            },
        },
        _lists: {
            set: function (value) {
                this.__variablesList.initVariableList(value);
            },
        },
    });

    //methods
    UserVariableHost.prototype.merge({
        _getRenderingVariables: function (scopeId) {
            var list = [],
                vars = this.__variablesSimple.getVariables(),
                vs;
            for (var v in vars) {   //{[id]: {}}
                vs = this._variableViewStates[v] || {};
                list.push(new PocketCode.RenderingText({ scopeId: scopeId, id: v, value: vars[v].value, x: vs.x || 0, y: vs.y || 0, visible: vs.visible || false }));
            }
            return list;
        },
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
            var viewState = this._variableViewStates[e.id];
            if (viewState && viewState.visible) //only dispatch if visible
                this._onVariableChange.dispatchEvent({ scopeId: this._id, variableId: e.id, value: e.value });
        },
        showVariableAt: function (id, positionX, positionY) {   //called as sprite.show() from brick
            if (isNaN(positionX) || isNaN(positionY))
                throw new Error('show variable: invalid position');

            var tmp = this.__variablesSimple.getVariableById(id);
            if (tmp) {
                var viewState = { visible: true, x: positionX, y: positionY };  //important: always create a new object when setting the viewState
                this._variableViewStates[id] = viewState;
                this._onVariableChange.dispatchEvent({ scopeId: this._id, variableId: id, value: tmp.value, viewState: viewState });
            }
            else if (this.__variableLookupHost)
                this.__variableLookupHost.showVariableAt(id, positionX, positionY);
            else
                throw new Error('variable not found: ' + id);
        },
        hideVariable: function (id) {    //called as sprite.hide() from brick
            var tmp = this.__variablesSimple.getVariableById(id);
            if (tmp) {
                var viewState = { visible: false };  //important: always create a new object when setting the viewState
                this._variableViewStates[id] = viewState;
                this._onVariableChange.dispatchEvent({ scopeId: this._id, variableId: id, viewState: viewState });
            }
            else if (this.__variableLookupHost)
                this.__variableLookupHost.hideVariable(id);
            else
                throw new Error('variable not found: ' + id);
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

            //reset stored viewStates
            this._variableViewStates = {};
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
