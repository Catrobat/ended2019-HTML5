/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksPen.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksPen.js");

QUnit.test("PenDownBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.PenDownBrick(device, sprite, {});

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PenDownBrick, "instance check");
    assert.ok(b.objClassName === "PenDownBrick", "objClassName check");

    ///execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("PenUpBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.PenUpBrick(device, sprite, {});

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PenUpBrick, "instance check");
    assert.ok(b.objClassName === "PenUpBrick", "objClassName check");

    ///execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("SetPenSizeBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.SetPenSizeBrick(device, sprite, { value: x });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetPenSizeBrick, "instance check");
    assert.ok(b.objClassName === "SetPenSizeBrick", "objClassName check");

    ///execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("SetPenColorBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });
    var blue = JSON.parse('{"type":"NUMBER","value":"200","right":null,"left":null}');
    var red = JSON.parse('{"type":"NUMBER","value":"145","right":null,"left":null}');
    var green = JSON.parse('{"type":"NUMBER","value":"33","right":null,"left":null}');

    var b = new PocketCode.Model.SetPenColorBrick(device, sprite, { blue: blue, red: red, green: green });

    assert.ok(b._device === device && b._sprite === sprite && b._penColorBlue  instanceof PocketCode.Formula && b._penColorRed  instanceof PocketCode.Formula
        && b._penColorGreen  instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetPenColorBrick, "instance check");
    assert.ok(b.objClassName === "SetPenColorBrick", "objClassName check");

    ///execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});