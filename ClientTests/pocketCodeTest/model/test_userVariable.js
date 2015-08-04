/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/userVariable.js" />
'use strict';

QUnit.module("userVariable.js");


QUnit.test("UserVariableCollection", function (assert) {

    var uvc = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.SIMPLE, PocketCode.UserVariableScope.LOCAL);
    assert.ok(uvc instanceof PocketCode.Model.UserVariableCollection, "instance check");

    assert.ok(uvc._scope === PocketCode.UserVariableScope.LOCAL && uvc._type == PocketCode.UserVariableType.SIMPLE, "created and properties set correctly");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableCollection(PocketCode.UserVariableType.SIMPLE, "wrong"); }, Error, "ERROR: invalid scope property");
    assert.throws(function () { var test = new PocketCode.Model.UserVariableCollection("wrong", PocketCode.UserVariableScope.GLOBAL); }, Error, "ERROR: invalid type property");

    var testVars = [
        { id: 1, name: "2", value: 3 },
        { id: 4, name: "5", value: 6 },
        { id: 7, name: "8" }];

    assert.throws(function () { uvc.initVariableList("error"); }, Error, "ERROR: initVariableList() argument");
    uvc.initVariableList(testVars);

    assert.ok(uvc.getVariables()[1] instanceof PocketCode.Model.UserVariableSimple && uvc.getVariables()[4] instanceof PocketCode.Model.UserVariableSimple && uvc.getVariables()[7] instanceof PocketCode.Model.UserVariableSimple, "sdimple: variable getter: instance check");
    assert.ok(uvc.getVariables()[4]._id === 4 && uvc.getVariables()[4].name === "5" && uvc.getVariables()[4]._value === 6, "simple: variable created correctly");
    assert.ok(uvc.getVariables()[7]._id === 7 && uvc.getVariables()[7].name === "8" && uvc.getVariables()[7]._value === undefined, "simple: variable created correctly (init value)");

    var first = uvc.getVariableById(1);
    assert.ok(first._id === 1 && first.name === "2" && first._value === 3 && first.value === 3, "getById check + value accessor");

    uvc.initVariableList([]);
    assert.deepEqual(uvc.getVariables(), {}, "initVariableList: clear existing vars");

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

});

QUnit.test("UserVariableSimple", function (assert) {

    var uv = new PocketCode.Model.UserVariableSimple(1, "2");
    assert.ok(uv instanceof PocketCode.Model.UserVariableSimple, "instance check");

    assert.ok(uv._id == 1 && uv.name === "2" && uv._value === undefined, "properties set correctly: value initialized");
    uv.value = "new val";
    assert.ok(uv._value === "new val" && uv.value === "new val", "value accessor");

    uv = new PocketCode.Model.UserVariableSimple(1, "2", 0);
    assert.equal(uv.value, 0, "ctr setter value: 0 as value");

    uv = new PocketCode.Model.UserVariableSimple(1, "2");
    assert.equal(uv.toString(), "", "toString: empty value");

    uv = new PocketCode.Model.UserVariableSimple(1, "2", 3.4);
    assert.ok(uv._id == 1 && uv.name === "2" && uv._value === 3.4 && uv.value === 3.4, "properties set correctly: including value");
    assert.equal(uv.toString(), "3.4", "toString(): value");

});

QUnit.test("UserVariableList", function (assert) {

    var uv = new PocketCode.Model.UserVariableList(1, "2");
    assert.ok(uv instanceof PocketCode.Model.UserVariableList, "instance check");

    assert.ok(uv._id == 1 && uv.name === "2" && uv.length === 0, "properties set correctly: value initialized");
    assert.equal(uv.toString(), "", "toString: empty value");

    assert.throws(function () { var test = new PocketCode.Model.UserVariableList(1, "2", 0); }, Error, "ERROR: invalid argument: value");

    uv = new PocketCode.Model.UserVariableList(1, "2", [3.4, 3.5, 3.6]);
    assert.ok(uv._id == 1 && uv.name === "2" && uv.length === 3, "properties set: check for list length");
    assert.deepEqual(uv.value, [3.4, 3.5, 3.6], "properties set: check on equal");
    assert.equal(uv.toString(), "3.4 3.5 3.6", "toString(): value");

    //length
    assert.equal(uv.length, 3, "length");

    //value at
    assert.equal(uv.valueAt(2), 3.5, "value at: 2");
    assert.equal(uv.valueAt(3), 3.6, "value at: 3");
    assert.equal(uv.valueAt(0), undefined, "value at: 0");
    assert.equal(uv.valueAt(-1), undefined, "value at: < 0");
    assert.equal(uv.valueAt(uv.length + 1), undefined, "value at: length + 1");

    //append
    uv.append("12");
    assert.deepEqual(uv.value, [3.4, 3.5, 3.6, "12"], "append()");

    //insertAt
    uv.insertAt(2, true);
    assert.deepEqual(uv.value, [3.4, true, 3.5, 3.6, "12"], "insertAt(): simple");
    uv.insertAt(0, "invalidindex");
    assert.deepEqual(uv.value, [3.4, true, 3.5, 3.6, "12"], "insertAt(): position 0 - not allowed");
    uv.insertAt(-1, "invalidindex");
    assert.deepEqual(uv.value, [3.4, true, 3.5, 3.6, "12"], "insertAt(): negative position - not allowed");
    uv.insertAt(6, "invalidindex?");
    assert.deepEqual(uv.value, [3.4, true, 3.5, 3.6, "12", "invalidindex?"], "insertAt(): length + 1 - allowed (appended)");

    uv.insertAt(8, "validIndex");
    assert.deepEqual(uv.value, [3.4, true, 3.5, 3.6, "12", "invalidindex?"], "insertAt(): > length + 1 - not allowed");

    //replaceAt
    uv.replaceAt(2, false);
    assert.deepEqual(uv.value, [3.4, false, 3.5, 3.6, "12", "invalidindex?"], "replaceAt(): valid index");
    uv.replaceAt(0, false);
    assert.deepEqual(uv.value, [3.4, false, 3.5, 3.6, "12", "invalidindex?"], "replaceAt(): invalid index: 0");
    uv.replaceAt(7, false);
    assert.deepEqual(uv.value, [3.4, false, 3.5, 3.6, "12", "invalidindex?"], "replaceAt(): invalid index: > length");

    //deleteAt
    uv.deleteAt(6);
    assert.deepEqual(uv.value, [3.4, false, 3.5, 3.6, "12"], "deleeteAt(): valid index");
    uv.deleteAt(0);
    assert.deepEqual(uv.value, [3.4, false, 3.5, 3.6, "12"], "deleteAt(): invalid index: 0");
    uv.deleteAt(6);
    assert.deepEqual(uv.value, [3.4, false, 3.5, 3.6, "12"], "deleteAt(): invalid index: > length");

    //contains
    assert.equal(uv.contains(undefined), false, "contains: undefined");
    assert.equal(uv.contains("12"), true, "contains: string");
    assert.equal(uv.contains(false), true, "contains: bool");
    assert.equal(uv.contains(3.5), true, "contains: number");

});

