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

        function UserVariableCollection(type, scope, varArray, globalLookup) {
            this._variables = {};
            this._variableNames = {};

            if (!(varArray instanceof Array))
                throw new Error('variable setter expects type Array');



            if (globalLookup)
                this.globalLookup = globalLookup;

        }

        UserVariableCollection.prototype = {
            getVariableById: function (id) {

            },
            getNames: function () { },  //TODO: property? how is it used?
        };

        return UserVariableCollection;
    })(),


    UserVariableSimple: (function () {

        function UserVariableSimple(scope, id, name, value) {
            this.scope = scope;
            this.id = id;
            this.name = name;
            if (value)
                this.value = value;
            else
                this.value = 0.0;   //init
        }

        UserVariableSimple.prototype = {
            toString: function () {
                return this.value.toString();   //TODO: ?
            },
        };

        return UserVariableSimple;
    })(),

});


PocketCode.Model.UserVariableList = (function () {
    UserVariableList.extends(PocketCode.Model.UserVariableSimple, false);

    function UserVariableList(scope, id, name, value) {
        PocketCode.Model.UserVariableSimple.call(this, scope, id, name);

        if (value)
            this.value = value;
        else
            this.value = [];   //init
    }

    UserVariableList.prototype.merge({
        //toString: function () {
        //    return this.value.toString();   //TODO: ?
        //},
        append: function (value) {
            this.value.push(value);
        },
        insertAt: function (idx, value) {
            this.value.insert(idx, value);
        },
        replaceAt: function (idx, value) {
            if (this.value[idx])
                this.value[idx] = value;
        },
        deleteAt: function (idx) {
            this._value.splice(idx, 1);
        },
    });

    return UserVariableList;
})();

