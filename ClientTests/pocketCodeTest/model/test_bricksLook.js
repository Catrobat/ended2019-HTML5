/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/component/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksLook.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("bricksLook.js");


QUnit.test("SetLookBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Bricks.SetLookBrick(device, sprite, { id: "lookId" });

    assert.ok(b._device === device && b._sprite === sprite && b._lookId === "lookId", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetLookBrick, "instance check");
    assert.ok(b.objClassName === "SetLookBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("NextLookBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Bricks.NextLookBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.NextLookBrick, "instance check");
    assert.ok(b.objClassName === "NextLookBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("SetSizeToBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetSizeToBrick(device, sprite, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetSizeToBrick, "instance check");
    assert.ok(b.objClassName === "SetSizeToBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("ChangeSizeBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeSizeBrick(device, sprite, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeSizeBrick, "instance check");
    assert.ok(b.objClassName === "ChangeSizeBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("HideBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Bricks.HideBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.HideBrick, "instance check");
    assert.ok(b.objClassName === "HideBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("ShowBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Bricks.ShowBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ShowBrick, "instance check");
    assert.ok(b.objClassName === "ShowBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("SetTransparencyBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetTransparencyBrick(device, sprite, { value: percentage, effect: PocketCode.GraphicEffect.GHOST });
    //^^ effect is set server side

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetTransparencyBrick, "instance check");
    assert.ok(b.objClassName === "SetTransparencyBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("ChangeTransparencyBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeTransparencyBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.GHOST });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeTransparencyBrick, "instance check");
    assert.ok(b.objClassName === "ChangeTransparencyBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("SetBrightnessBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetBrightnessBrick(device, sprite, { value: percentage, effect: PocketCode.GraphicEffect.BRIGHTNESS });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetBrightnessBrick, "instance check");
    assert.ok(b.objClassName === "SetBrightnessBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("ChangeBrightnessBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeBrightnessBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.BRIGHTNESS });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeBrightnessBrick, "instance check");
    assert.ok(b.objClassName === "ChangeBrightnessBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("ClearGraphicEffectBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Bricks.ClearGraphicEffectBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ClearGraphicEffectBrick, "instance check");
    assert.ok(b.objClassName === "ClearGraphicEffectBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("LedOnBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.Device(new PocketCode.SoundManager());
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Bricks.LedOnBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.LedOnBrick, "instance check");
    assert.ok(b.objClassName === "LedOnBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("LedOffBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.Device(new PocketCode.SoundManager());
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Bricks.LedOffBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.LedOffBrick, "instance check");
    assert.ok(b.objClassName === "LedOffBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});
