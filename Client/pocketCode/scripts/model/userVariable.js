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
                            var tmp = new PocketCode.Model.UserVariableSimple(this._scope, variable.id, variable.name);
                            break;

                        case PocketCode.UserVariableType.LIST:
                            var tmp = new PocketCode.Model.UserVariableList(this._scope, variable.id, variable.name);
                            break;

                    }
                    this._variables[variable.id] = tmp;
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

