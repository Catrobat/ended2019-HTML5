/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/userVariable.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/userVariableHost.js" />
'use strict';

QUnit.module("model/userVariableHost.js");


QUnit.test("UserVariableHost", function (assert) {

    var uvhg = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.GLOBAL)
    var uvhl = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhg);
    var uvhp = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, uvhl);

    assert.ok(uvhl instanceof PocketCode.Model.UserVariableHost && uvhl instanceof SmartJs.Core.Component, "created: instance and inheritance check");

    //check cntr parameters
    assert.throws(function () { var test = new PocketCode.Model.UserVariableHost(); }, Error, "ERROR: missing scope");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.LOCAL, "string"); }, Error, "ERROR: invalid lookup");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.GLOBAL, uvhg); }, Error, "ERROR: lookup for global");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhl); }, Error, "ERROR: lookup host without global scope");

    assert.throws(function () { var test = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhp); }, Error, "ERROR: lookup to proocedure: lookup host without global scope");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, uvhp); }, Error, "ERROR: lookup host without local scope");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, uvhg); }, Error, "ERROR: procedure: lookup host not local scope");

    //setter: we have to test the private (in this case protected) methods as these are used by gameEngine and sprite internally
    var vars = [];
    var lists = [];

    uvhl._variables = vars;
    uvhl._lists = lists;

    uvhp._variables = [];
    uvhp._lists = [];

    assert.throws(function () { uvhp.getVariable("id"); }, Error, "ERROR: variable not found");
    assert.throws(function () { uvhp.getList("id"); }, Error, "ERROR: list not found");

    //add global
    vars = [{ id: "id1", name: "var1", }, ];
    lists = [{ id: "id1", name: "list1", }, ];
    uvhg._variables = vars;
    uvhg._lists = lists;

    assert.equal(uvhp.getVariable("id1").name, "var1", "getter: variable (with global lookup)");
    assert.equal(uvhp.getList("id1").name, "list1", "getter: list: list and var with same name (with global lookup)");

    //set local
    vars = [{ id: "id1", name: "var1local", }, ];
    lists = [{ id: "id1", name: "list1local", }, ];
    uvhl._variables = vars;
    uvhl._lists = lists;
    assert.equal(uvhl.getVariable("id1").name, "var1local", "getter: variable (with same ids: this should not happen in our app as ids are uniquely generated server-side)");
    assert.equal(uvhl.getList("id1").name, "list1local", "getter: list: local and global same ids");

    assert.equal(uvhp.getVariable("id1").name, "var1local", "getter (procedure): variable (with same ids: this should not happen in our app as ids are uniquely generated server-side)");
    assert.equal(uvhp.getList("id1").name, "list1local", "getter (procedure): list: local and global same ids");

    //reset
    uvhl.getVariable("id1").value = "new text";
    uvhl.getList("id1").append("list test");
    assert.ok(uvhl.getVariable("id1").value == "new text" && uvhl.getList("id1").length == 1, "init reset test");
    uvhl._resetVariables();
    assert.equal(uvhl.getVariable("id1").value, 0, "reset variable (to 0)");
    assert.equal(uvhl.getList("id1").length, 0, "reset list");

    uvhp.dispose();
    assert.ok(uvhp._disposed, "brick dispose");
    assert.deepEqual(uvhl.getVariable("id1").name, "var1local", "brick dispose: lookup host not disposed (avoid impact on sprite)");

    uvhl.dispose();
    assert.ok(uvhl._disposed, "dispose");
    assert.deepEqual(uvhg.getVariable("id1").name, "var1", "dispose: lookup host not disposed (avoid impact on gameEngine)");

    //check object: return all vars or lists
    var compareAndAssert = function (allVarsOrLists, outputString, localDefinition, globalDefinition) {

        var valid = true;
        var tmp;
        for (var i = 0, l = localDefinition.length; i < l; i++) {
            tmp = allVarsOrLists.local[localDefinition[i].id];
            if (!tmp) {
                valid = false;
                break;
            }
        }
        if (valid) {
            for (var i = 0, l = globalDefinition.length; i < l; i++) {
                tmp = allVarsOrLists.global[globalDefinition[i].id];
                if (!tmp) {
                    valid = false;
                    break;
                }
            }
        }
        assert.ok(valid, outputString + "check object integrity");
    };

    //recreate: no local settings 
    vars = [{ id: "id1", name: "var1", }, { id: "id2", name: "var2", }, ];
    lists = [{ id: "id1", name: "list1", }, { id: "id2", name: "list2", }, ];
    uvhg._variables = vars;
    uvhg._lists = lists;

    uvhl = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhg);
    uvhp = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, uvhl);
    var v = uvhl.getAllVariables();
    compareAndAssert(v, "var: no local: ", {}, vars);
    var l = uvhp.getAllLists();
    compareAndAssert(l, "list: no local: ", {}, lists);

    //recreate: no global settings 
    uvhl = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.LOCAL);
    uvhp = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, uvhl);
    uvhl._variables = vars;
    uvhl._lists = lists;
    v = uvhl.getAllVariables();
    compareAndAssert(v, "var: no global: ", vars, {});
    l = uvhp.getAllLists();
    compareAndAssert(l, "list: no global: ", lists, {});

    //recreate: local and global 
    uvhl = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhg);
    uvhp = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, uvhl);

    //vars = [{ id: "id1", name: "var1", }, ];
    //lists = [{ id: "id1", name: "list1", }, ];
    var varsl = [{ id: "id1", name: "var1local", }, { id: "id2", name: "var2local", }, ];
    var listsl = [{ id: "id1", name: "list1local", }, { id: "id2", name: "list2local", }, ];
    uvhl._variables = varsl;
    uvhl._lists = listsl;

    uvhl.getVariable("id1").value = "txt";
    v = uvhl.getAllVariables();
    compareAndAssert(v, "var: local and global: ", varsl, vars);
    l = uvhp.getAllLists();
    compareAndAssert(l, "list: local and global: ", listsl, lists);

    //test ui rendering + updates
    var renderingVars = uvhl._getRenderingVariables();
    var r0 = renderingVars[0],
        r1 = renderingVars[1];
    assert.ok(r1 instanceof PocketCode.RenderingText, "object instance check");
    assert.ok(r0.id === "id1" && r0._value === "txt" && r0.x === 0 && r0.y === 0 && r0.visible === false, "var0 id check (not initialized)");
    assert.ok(r1.id === "id2" && r1._value === 0 && r1.x === 0 && r1.y === 0 && r1.visible === false, "var1 id check (not initialized)");

    var varChangeCalled = 0;
    var onVarChange = function (e) {
        varChangeCalled++;
        assert.equal(e.variableId, "id1", "event args: id");
        assert.equal(e.value, "new text", "event args: text");
    };
    uvhl._onVariableChange.addEventListener(new SmartJs.Event.EventListener(onVarChange, this));
    var testVar = uvhl.getVariable("id1");
    testVar.value = "new text (not visible)";
    assert.equal(varChangeCalled, 0, "var change: event handler NOT called (not visisble)");
    uvhl._variableViewStates["id1"] = { visible: true, x: 2, y: 3 };   //set to visible
    testVar.value = "new text";
    assert.equal(varChangeCalled, 1, "var change: event handler called (visisble)");

    uvhl._onVariableChange.removeEventListener(new SmartJs.Event.EventListener(onVarChange, this));
    //show variable
    varChangeCalled = 0;
    var onVarChange = function (e) {
        varChangeCalled++;
        assert.equal(e.variableId, "id1", "event args: id (showVariableAt)");
        var vs = e.viewState;
        assert.ok(e.value = "new text" && vs.x == 20 && vs.y == 50 && vs.visible == true, "event args: viewState (showVariableAt)");
    };
    uvhl._onVariableChange.addEventListener(new SmartJs.Event.EventListener(onVarChange, this));
    assert.throws(function () { uvhl.showVariableAt("wrong id", 20, 50); }, Error, "ERRROR: id not found");
    assert.throws(function () { uvhl.showVariableAt("id1", "NaN", 50); }, Error, "ERRROR: wrong parameter x");
    assert.throws(function () { uvhl.showVariableAt("id1", 50, "NaN"); }, Error, "ERRROR: wrong parameter y");
    uvhl.showVariableAt("id1", 20, 50);
    assert.equal(varChangeCalled, 1, "var change: event handler called (showVariableAt)");

    uvhl._onVariableChange.removeEventListener(new SmartJs.Event.EventListener(onVarChange, this));
    //hide variable
    varChangeCalled = 0;
    var onVarChange = function (e) {
        varChangeCalled++;
        assert.equal(e.variableId, "id1", "event args: id (hideVariable)");
        var props = e.viewState;
        assert.ok(props.visible == false, "event args: viewState (hideVariable)");
    };
    uvhl._onVariableChange.addEventListener(new SmartJs.Event.EventListener(onVarChange, this));
    assert.throws(function () { uvhl.hideVariable("wrong id"); }, Error, "ERRROR: id not found");
    uvhl.hideVariable("id1");
    assert.equal(varChangeCalled, 1, "var change: event handler called (hideVariable)");

    //procedure scope without lookup
    uvhp = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE);
    var varsl = [{ id: "id1", name: "var1local", }, { id: "id2", name: "var2local", }, ];
    var listsl = [{ id: "id1", name: "list1local", }, { id: "id2", name: "list2local", }, ];
    uvhp._variables = varsl;
    uvhp._lists = listsl;

    uvhp.getVariable("id1").value = "txt";
    v = uvhp.getAllVariables();
    assert.ok(v.procedure !== undefined && v.local !== undefined && v.global !== undefined, "variables: object including procedure, local and global variables");
    l = uvhp.getAllLists();
    assert.ok(l.procedure !== undefined && l.local !== undefined && l.global !== undefined, "lists: object including procedure, local and global variables");

});


//------------------------------------------------------------------------------------------------------------------
//moved from test_gameEngine
//TODO: ^^ this tests should be moved to base class: UserVariableHost including tests for lists (we shouldn't use private vars for assets - that much - either)

//var names = gameEngine.getAllVariables();
//names = names.global;
//assert.ok(names["1"].name === "name1" && names["2"].name === "name2" && names["3"].name === "name3", "varableNames set correctly");

//assert.ok(gameEngine.getVariable("1").name === "name1", "Calling getNewVariable returned correct variable");
//assert.deepEqual(gameEngine.getAllVariables(), gameEngine._variableNames, "getGlobalVariableNames returns gameEngine._variableNames");
//assert.throws(function () { gameEngine.getGlobalVariable("invalid") }, Error, "ERROR: invalid argument used for getGlobalVariable");
//------------------------------------------------------------------------------------------------------------------
