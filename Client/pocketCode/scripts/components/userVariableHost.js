/// <reference path="../model/userVariable.js" />

/*
 * this is a base class for sprite and gameEngine introduced to avoid duplicated code for handling variables and lists
 */
PocketCode.UserVariableHost = (function () {
    UserVariableHost.extends(SmartJs.Core.Component);

    //ctr
    function UserVariableHost(scope, globalLookupHost) {
        if (scope !== PocketCode.UserVariableScope.LOCAL && scope !== PocketCode.UserVariableScope.GLOBAL)
            throw new Error('invalid argument: scope');
        this.__variableScope = scope;

        if (globalLookupHost) {
            if (!(globalLookupHost instanceof PocketCode.UserVariableHost))
                throw new Error('invalid argument: global lookup host: expectet type = PocketCode.UserVariableHost');
            if (scope === PocketCode.UserVariableScope.GLOBAL)
                throw new Error('invalid argument: a global lookup host cannot refer to another global variable definition');
            if (globalLookupHost.__variableScope !== PocketCode.UserVariableScope.GLOBAL)
                throw new Error('invalid argument: a global lookup host has to have a global scope');
        }
        this.__variableLookupHost = globalLookupHost;

        this.__variablesSimple = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.SIMPLE, scope);
        this.__variablesList = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.LIST, scope);
    }

    //properties
    Object.defineProperties(UserVariableHost.prototype, {
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
            var tmp = {};
            tmp[this.__variableScope] = this.__variablesSimple.getVariables();
            if (this.__variableScope === PocketCode.UserVariableScope.LOCAL) {
                tmp[PocketCode.UserVariableScope.GLOBAL] = {};  //make sure a gloabl property exists
                if (this.__variableLookupHost)
                    tmp.merge(this.__variableLookupHost.getAllVariables());
            }
            return tmp;
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
            var tmp = {};
            tmp[this.__variableScope] = this.__variablesList.getVariables();
            if (this.__variableScope === PocketCode.UserVariableScope.LOCAL) {
                tmp[PocketCode.UserVariableScope.GLOBAL] = {};
                if (this.__variableLookupHost)
                    tmp.merge(this.__variableLookupHost.getAllLists());
            }
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
