/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/userVariable.js" />
'use strict';

QUnit.module("model/userVariable.js");


QUnit.test("UserVariableCollection", function (assert) {

    //var done = assert.async();
    //var done2 = assert.async();

    var uvc = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.SIMPLE, PocketCode.UserVariableScope.LOCAL);
    assert.ok(uvc instanceof PocketCode.Model.UserVariableCollection, "instance check");
    assert.ok(uvc.onVariableChange instanceof SmartJs.Event.Event, "variable change event");

    assert.ok(uvc._scope === PocketCode.UserVariableScope.LOCAL && uvc._type == PocketCode.UserVariableType.SIMPLE, "created and properties set correctly");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.SIMPLE, "wrong"); }, Error, "ERROR: invalid scope property");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableCollection("wrong", PocketCode.UserVariableScope.GLOBAL); }, Error, "ERROR: invalid type property");

    var testVars = [
        { id: "1", name: "2", value: 3 },
        { id: "4", name: "5", value: 6 },
        { id: "7", name: "8" }];

    assert.throws(function () { uvc.initVariableList("error"); }, Error, "ERROR: initVariableList() argument");
    uvc.initVariableList(testVars);

    //reset: simple
    uvc.reset();
    assert.equal(uvc.getVariableById("1").value, 0, "var 1 = 0 (init state) after reset");
    assert.equal(uvc.getVariableById("4").value, 0, "var 4 = 0 (init state) after reset");
    assert.equal(uvc.getVariableById("7").value, 0, "var 7 = 0 (init state) after reset");

    uvc.initVariableList(testVars);
    assert.ok(uvc.getVariableById("1") instanceof PocketCode.Model.UserVariableSimple && uvc.getVariableById("4") instanceof PocketCode.Model.UserVariableSimple && uvc.getVariableById("7") instanceof PocketCode.Model.UserVariableSimple, "sdimple: variable getter: instance check");
    assert.ok(uvc.getVariableById("4")._id === "4" && uvc.getVariableById("4").name === "5" && uvc.getVariableById("4")._value === 6, "simple: variable created correctly");
    assert.ok(uvc.getVariables()["7"]._id === "7" && uvc.getVariables()["7"].name === "8" && uvc.getVariables()["7"]._value === 0, "simple: variable created correctly (init value)");
    assert.equal(uvc.getVariableById("7").value, 0, "var initialized with = 0");

    var first = uvc.getVariableById("1");
    assert.ok(first._id === "1" && first.name === "2" && first._value === 3 && first.value === 3, "getById check + value accessor");

    var varChangeCalled = 0;
    var varChangeHandler = function (e) {
        varChangeCalled++;
        assert.equal(e.target, first, "variable as event target");
        assert.equal(e.id, 1, "variable setter/getter");
        //done();
    };
    uvc.onVariableChange.addEventListener(new SmartJs.Event.EventListener(varChangeHandler, this));
    first.value = 23;
    assert.equal(varChangeCalled, 1, "var change: event handler called");

    uvc.initVariableList([]);
    assert.deepEqual(uvc.getVariables(), {}, "initVariableList: clear existing vars");

    assert.ok(uvc.getVariableById(null) instanceof PocketCode.Model.UserVariableSimple, "get a new instance (simple): based on a pocketcode bug");

    //using lists
    uvc = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.LIST, PocketCode.UserVariableScope.GLOBAL);
    testVars = [
        { id: 1, name: "2", value: [3, 13, 23] },
        { id: 4, name: "5", value: [6, 16, 26] },
        { id: 7, name: "8" }];

    uvc.initVariableList(testVars);
    assert.ok(uvc.getVariables()[1] instanceof PocketCode.Model.UserVariableList && uvc.getVariables()[4] instanceof PocketCode.Model.UserVariableList && uvc.getVariables()[7] instanceof PocketCode.Model.UserVariableList, "lists: variable getter: instance check");
    var test = uvc.getVariables()[4];
    assert.deepEqual(test._value, [6, 16, 26], "lists: variable created correctly");
    assert.ok(uvc.getVariables()[7]._id === 7 && uvc.getVariables()[7].name === "8" && uvc.getVariables()[7].length === 0, "lists: variable created correctly (init value) + length");

    assert.equal(uvc.getVariableById(4).name, 5, "get list var by id");
    assert.ok(uvc.getVariableById(null) instanceof PocketCode.Model.UserVariableList, "get a new instance (list): based on a pocketcode bug");

    //reset: list
    uvc.reset();
    assert.equal(uvc.getVariableById(1).length, 0, "var 1: empty list after reset");
    assert.equal(uvc.getVariableById(4).length, 0, "var 4: empty list after reset");
    assert.equal(uvc.getVariableById(7).length, 0, "var 7: empty list after reset");

});


QUnit.test("UserVariable", function (assert) {

    var uv = new PocketCode.Model.UserVariable(1, "2");
    assert.ok(uv instanceof PocketCode.Model.UserVariable, "instance check");
    assert.ok(uv.onChange instanceof SmartJs.Event.Event, "onChange event accessor");

    assert.ok(uv._id == 1 && uv.name === "2", "properties set correctly: value initialized");

});


QUnit.test("UserVariableSimple", function (assert) {

    var uv = new PocketCode.Model.UserVariableSimple(1, "2");
    assert.ok(uv instanceof PocketCode.Model.UserVariableSimple && uv instanceof PocketCode.Model.UserVariable, "instance check");

    assert.ok(uv._id == 1 && uv.name === "2" && uv._value === 0, "properties set correctly: value initialized");
    var changeCount = 0;
    var changeHandler = function () {
        changeCount++;
    };
    uv.onChange.addEventListener(new SmartJs.Event.EventListener(changeHandler, this));
    uv.value = "new val";
    assert.ok(uv._value === "new val" && uv.value === "new val", "value accessor: string");
    assert.equal(changeCount, 1, "event dispatched during change;");
    uv.value = "new val";
    assert.equal(changeCount, 1, "event not dispatched if new value equal existing;");

    uv = new PocketCode.Model.UserVariableSimple(1, "2", 0);
    assert.equal(uv.value, 0, "ctr setter value: 0 as value");

    uv = new PocketCode.Model.UserVariableSimple(1, "name", "2");
    assert.equal(uv.value, 2, "2 (string) as number = 2");

    uv = new PocketCode.Model.UserVariableSimple(1, "2", "3.4");
    assert.ok(uv._id == 1 && uv.name === "2" && uv._value === 3.4 && uv.value === 3.4, "properties set correctly: including value");

    var uv2 = new PocketCode.Model.UserVariableSimple(1, "2", uv);
    assert.equal(uv.value, 3.4, "assign user variable");
    var uvl = new PocketCode.Model.UserVariableList(1, "2", [3.4, 3.5, 3.6]);
    uv2.value = uvl;
    assert.equal(uv2.value, "3.43.53.6", "list is added as string");

    uvl = new PocketCode.Model.UserVariableList(1, "2", [3.4]);
    uv2.value = uvl;
    assert.equal(uv2.value, 3.4, "list is added as string- single item casted");

    changeCount = 0;
    uv2.onChange.addEventListener(new SmartJs.Event.EventListener(changeHandler, this));
    uv2.reset();
    assert.equal(uv2.value, 0, "reset: to 0 (reinitialized)");
    assert.equal(changeCount, 0, "reset: onChange not dispatched");

});


QUnit.test("UserVariableList", function (assert) {

    var uv = new PocketCode.Model.UserVariableList(1, "2");
    assert.ok(uv instanceof PocketCode.Model.UserVariableList && uv instanceof PocketCode.Model.UserVariable, "instance check");
    assert.ok(uv.onChange instanceof SmartJs.Event.Event, "onChange event check");

    assert.ok(uv._id == 1 && uv.name === "2" && uv.length === 0, "properties set correctly: value initialized");

    assert.throws(function () { var test = new PocketCode.Model.UserVariableList(1, "2", 0); }, Error, "ERROR: invalid argument: value");

    //var changeCount = 0;         //currently disabled for lists: we cannot show them
    //var latestChange;
    //var changeHandler = function (e) {
    //    latestChange = e;
    //    changeCount++;
    //};

    uv = new PocketCode.Model.UserVariableList(1, "2", [3.4, 3.5, "3.6", "string"]);
    //uv.onChange.addEventListener(new SmartJs.Event.EventListener(changeHandler, this));         //currently disabled for lists: we cannot show them

    assert.ok(uv._id == 1 && uv.name === "2" && uv.length === 4, "properties set: check for list length");
    assert.deepEqual(uv._value, [3.4, 3.5, 3.6, "string"], "properties set: check on equal");

    //length
    assert.equal(uv.length, 4, "length");

    //value at
    assert.equal(uv.valueAt(2), 3.5, "value at: 2");
    assert.equal(uv.valueAt(3), 3.6, "value at: 3");
    assert.equal(uv.valueAt(0), undefined, "value at: 0");
    assert.equal(uv.valueAt(-1), undefined, "value at: < 0");
    assert.equal(uv.valueAt(uv.length + 1), undefined, "value at: length + 1");
    assert.equal(uv.valueAt(2.0), 3.5, "value at: valid float index");
    assert.equal(uv.valueAt(2.9), 3.5, "value at: float index (floor)- like in Scratch");
    assert.equal(uv.valueAt(5.1), undefined, "value at: invalid float index - like in Scratch");
    assert.equal(uv.valueAt(true), 3.4, "value at boolean true: returns 1st - like in Scratch");
    var a, b;
    assert.equal(uv.valueAt(a*b), undefined, "value at NaN: returns undefined- like in Scratch");

    //append
    uv.append("12");
    assert.deepEqual(uv._value, [3.4, 3.5, 3.6, "string", 12], "append()");
    //assert.ok(latestChange.id === uv._id && latestChange.target === uv && changeCount == 1, "update event on append");         //currently disabled for lists: we cannot show them
    //latestChange = undefined;
    //changeCount = 0;

    //insertAt
    uv.insertAt(2, true);
    assert.deepEqual(uv._value, [3.4, true, 3.5, 3.6, "string", 12], "insertAt(): simple");
    uv.insertAt(0, "invalidindex");
    assert.deepEqual(uv._value, [3.4, true, 3.5, 3.6, "string", 12], "insertAt(): position 0 - not allowed");
    uv.insertAt(-1, "invalidindex");
    assert.deepEqual(uv._value, [3.4, true, 3.5, 3.6, "string", 12], "insertAt(): negative position - not allowed");
    //assert.equal(changeCount, 1, "change event only dispatched if list has changed");
    //changeCount = 0;

    uv.insertAt(7, "invalidindex?");
    assert.deepEqual(uv._value, [3.4, true, 3.5, 3.6, "string", 12, "invalidindex?"], "insertAt(): length + 1 - allowed (appended)");
    //assert.equal(changeCount, 1, "change event on insert at [length+1] = append");
    //changeCount = 0;

    uv.insertAt(9, "validIndex");
    assert.deepEqual(uv._value, [3.4, true, 3.5, 3.6, "string", 12, "invalidindex?"], "insertAt(): > length + 1 - not allowed");
    //assert.ok(latestChange.id === uv._id && latestChange.target === uv && changeCount == 0, "update event: no insert");         //currently disabled for lists: we cannot show them
    //latestChange = undefined;
    //changeCount = 0;

    //replaceAt
    uv.replaceAt(2, false);
    assert.deepEqual(uv._value, [3.4, false, 3.5, 3.6, "string", 12, "invalidindex?"], "replaceAt(): valid index");
    uv.replaceAt(0, false);
    assert.deepEqual(uv._value, [3.4, false, 3.5, 3.6, "string", 12, "invalidindex?"], "replaceAt(): invalid index: 0");
    uv.replaceAt(8, false);
    assert.deepEqual(uv._value, [3.4, false, 3.5, 3.6, "string", 12, "invalidindex?"], "replaceAt(): invalid index: > length");
    //assert.ok(latestChange.id === uv._id && latestChange.target === uv && changeCount == 1, "update event on replace");         //currently disabled for lists: we cannot show them
    //latestChange = undefined;
    //changeCount = 0;

    //deleteAt
    uv.deleteAt(7);
    assert.deepEqual(uv._value, [3.4, false, 3.5, 3.6, "string", 12], "deleeteAt(): valid index");
    uv.deleteAt(0);
    assert.deepEqual(uv._value, [3.4, false, 3.5, 3.6, "string", 12], "deleteAt(): invalid index: 0");
    uv.deleteAt(7);
    assert.deepEqual(uv._value, [3.4, false, 3.5, 3.6, "string", 12], "deleteAt(): invalid index: > length");
    //assert.ok(latestChange.id === uv._id && latestChange.target === uv && changeCount == 1, "update event on delete");         //currently disabled for lists: we cannot show them
    //latestChange = undefined;
    //changeCount = 0;

    //contains
    uv.append("string");
    assert.equal(uv.contains(undefined), false, "contains: undefined");
    assert.equal(uv.contains("string"), true, "contains: string");
    assert.equal(uv.contains("12,0"), false, "contains: string (number not converted)");
    assert.equal(uv.contains(false), true, "contains: bool");
    assert.equal(uv.contains(3.5), true, "contains: number");
    assert.equal(uv.contains("12"), true, "contains: string number");

    //add uservars & list
    var uvs = new PocketCode.Model.UserVariableSimple(1, "2", "13.2");
    uv.append(uvs);
    assert.equal(uv.valueAt(uv.length), 13.2, "append: user variable added and casted");

    uv.insertAt(1, uvs);
    assert.equal(uv.valueAt(1), 13.2, "insert: user variable added and casted");

    uv.replaceAt(2, uvs);
    assert.equal(uv.valueAt(2), 13.2, "replace: user variable added and casted");

    //lists: one test is enough as all setters are checked already
    var uv2 = new PocketCode.Model.UserVariableList(2, "new", [3.4]);
    uv.append(uv2);
    assert.ok(uv.valueAt(uv.length) === 3.4, "append: user list: added and casted");

    //reset
    //changeCount = 0;         //currently disabled for lists: we cannot show them
    //uv2.onChange.addEventListener(new SmartJs.Event.EventListener(changeHandler, this));
    uv2.reset();
    assert.equal(uv2.length, 0, "reset: empty list[]");
    //assert.equal(changeCount, 1, "change event on reset");
    uv2.reset();
    //assert.equal(changeCount, 1, "change not dispatch if list = empty already");
});
