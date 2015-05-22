/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/program.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksVariable.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("bricksVariable.js");


QUnit.test("SetVariableBrick", function (assert) {

    var program = new PocketCode.GameEngine();
    program.background = "background";  //to avoid error on start
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Bricks.SetVariableBrick("device", sprite, { referenceId: "var1", value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._varId === "var1" && b._value instanceof PocketCode.Formula , "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetVariableBrick, "instance check");
    assert.ok(b.objClassName === "SetVariableBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formual calculation (value to set)");

    //local var
    var executedHandler = function (e) {
        assert.equal(e.id, "setVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(sprite._variables.var1.value, 1.0, "variable set correctly (local)");
    };
    //var not found
    assert.throws(function () { b.execute(new SmartJs.Event.EventListener(executedHandler, this), "setVar"); }, Error, "ERROR: unknown variable");

    sprite._variables.var1 = { id: "var1", value: 0 };
    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "setVar");

    //global
    sprite._variables = {};
    program._variables.var1 = { id: "var1", value: 0 };
    var executedHandler2 = function (e) {
        assert.equal(e.id, "setGlobalVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(program._variables.var1.value, 1.0, "variable set correctly (global)");
    };
    b.execute(new SmartJs.Event.EventListener(executedHandler2, this), "setGlobalVar");

});

QUnit.test("ChangeVariableBrick", function (assert) {

    var program = new PocketCode.GameEngine();
    program.background = "background";  //to avoid error on start
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Bricks.ChangeVariableBrick("device", sprite, { referenceId: "var1", value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._varId === "var1" && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeVariableBrick, "instance check");
    assert.ok(b.objClassName === "ChangeVariableBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formual calculation (value to add)");

    //local var
    var executedHandler = function (e) {
        assert.equal(e.id, "changeVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(sprite._variables.var1.value, 2.0, "variable set correctly (local)");
    };
    //var not found
    assert.throws(function () { b.execute(new SmartJs.Event.EventListener(executedHandler, this), "changeVar"); }, Error, "ERROR: unknown variable");

    sprite._variables.var1 = { id: "var1", value: 1 };
    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "changeVar");

    //global
    sprite._variables = {};
    program._variables.var1 = { id: "var1", value: 1 };
    var executedHandler2 = function (e) {
        assert.equal(e.id, "changeGlobalVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(program._variables.var1.value, 2.0, "variable set correctly (global)");
    };
    b.execute(new SmartJs.Event.EventListener(executedHandler2, this), "changeGlobalVar");
});

