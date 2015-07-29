/// <reference path="../model/userVariable.js" />

/*
 * this is a base class for sprite and gameEngine introduced to avoid duplicated code for handling variables and lists
 */

PocketCode.UserVariableHost = (function () {
    UserVariableHost.extends(SmartJs.Core.Component);

    function UserVariableHost(scope, globalLookupHost) {
        //if (!scope || scope !== PocketCode.UserVariableScope.LOCAL || scope !== PocketCode.UserVariableScope.GLOBAL)
        //    throw new Error('invalid argument: scope');

        if (globalLookupHost && !(globalLookupHost instanceof PocketCode.UserVariableHost))
            throw new Error('invalid argument: global lookup host: expectet type = PocketCode.UserVariableHost');

        this.__variablesSimple = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.SIMPLE, scope);
        this.__variablesList = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.LIST, scope);

        this.__variableScope = scope;
        this.__variableLookupHost = globalLookupHost;

        //this._variables = {};
        //this._variableNames = {};

        //if (!(varArray instanceof Array))
        //    throw new Error('variable setter expects type Array');



        //if (globalLookup)
        //    this.globalLookup = globalLookup;

    }

    //properties
    Object.defineProperties(UserVariableHost.prototype, {
        _variables: {
            set: function (value) {
                this.__variablesSimple.initVariableList(value);
            },
            //enumerable: false,
            //configurable: true,
        },
        _lists: {
            set: function (value) {
                this.__variablesList.initVariableList(value);
            },
            //enumerable: false,
            //configurable: true,
        },
    });


    UserVariableHost.prototype.merge({
        getVariable: function (id) {
            var tmp = this.__variablesSimple.getVariableById(id);
            if (!tmp && !this.__variableLookupHost)
                throw new Error('variable with id ' + id + ' not found');

            if (tmp || !this.__variableLookupHost)
                return tmp;

            return this.__variableLookupHost.getVariable(id);
        },
        getAllVariables: function () {
            var tmp = {};
            tmp[this.__variableScope] = this.__variablesSimple.getVariables();
            if (this.__variableLookupHost)
                tmp[PocketCode.UserVariableScope.GLOBAL] = this.__variableLookupHost.getAllVariables();

            return tmp;
        },
        getList: function (id) {
            var tmp = this.__variablesList.getVariableById(id);
            if (tmp || !this.__variableLookupHost)
                return tmp;

            return this.__variableLookupHost.getList(id);
        },
        getAllLists: function () {
            var tmp = {};
            tmp[this.__variableScope] = this.__variablesList.getVariables();
            if (this.__variableLookupHost)
                tmp[PocketCode.UserVariableScope.GLOBAL] = this.__variableLookupHost.getAllLists();

            return tmp;
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


