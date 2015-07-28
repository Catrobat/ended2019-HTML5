
/*
 * this is a base class for sprite and gameEngine introduced to avoid duplicated code for handling variables and lists
 */

PocketCode.UserVariableHost = (function () {
    UserVariableHost.extends(SmartJs.Core.Component);

    function UserVariableHost() {//type, scope, varArray, globalLookup) {
        //this._variables = {};
        //this._variableNames = {};

        //if (!(varArray instanceof Array))
        //    throw new Error('variable setter expects type Array');



        //if (globalLookup)
        //    this.globalLookup = globalLookup;

    }

    UserVariableHost.prototype.merge({
        //getVariableById: function (id) {

        //},
        //getNames: function () { },  //TODO: property? how is it used?
    });

    return UserVariableHost;
})();


