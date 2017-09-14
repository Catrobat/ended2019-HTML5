/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksLook.js");


QUnit.test("SetLookBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetLookBrick(device, sprite, { lookId: "lookId" });

    assert.throws(function () {new PocketCode.SetLookBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetLookBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetLookBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetLookBrick", "objClassName check");
});

QUnit.test("SetLookByIndexBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var looks = [
        new PocketCode.Model.Look({ id: "s01" }),
        new PocketCode.Model.Look({ id: "s02" }),
    ];
    sprite._looks = looks;

    var idxFormulaJson = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');;
    var b = new PocketCode.Model.SetLookByIndexBrick(device, sprite, { idx: idxFormulaJson });

    assert.throws(function () {new PocketCode.SetLookByIndexBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetLookByIndexBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetLookByIndexBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetLookByIndexBrick", "objClassName check");
});

QUnit.test("NextLookBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.NextLookBrick(device, sprite, { Id: "Id" });

    assert.throws(function () {new PocketCode.NextLookBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.NextLookBrick(b, false);

    assert.ok(brick instanceof PocketCode.NextLookBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "NextLookBrick", "objClassName check");
});

QUnit.test("PreviousLookBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.PreviousLookBrick(device, sprite, { Id: "Id" });

    assert.throws(function () {new PocketCode.PreviousLookBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.PreviousLookBrick(b, false);

    assert.ok(brick instanceof PocketCode.PreviousLookBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "PreviousLookBrick", "objClassName check");
});

QUnit.test("SetSizeBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetSizeBrick(device, sprite, { percentage: percentage });

    assert.throws(function () {new PocketCode.SetSizeBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetSizeBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetSizeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetSizeBrick", "objClassName check");
});

QUnit.test("ChangeSizeBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeSizeBrick(device, sprite, { value: value });

    assert.throws(function () {new PocketCode.ChangeSizeBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ChangeSizeBrick(b, false);

    assert.ok(brick instanceof PocketCode.ChangeSizeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeSizeBrick", "objClassName check");
});


QUnit.test("HideBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.HideBrick(device, sprite, { Id: "Id" });

    assert.throws(function () {new PocketCode.HideBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.HideBrick(b, false);

    assert.ok(brick instanceof PocketCode.HideBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "HideBrick", "objClassName check");
});

QUnit.test("ShowBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.ShowBrick(device, sprite, { Id: "Id" });

    assert.throws(function () {new PocketCode.ShowBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ShowBrick(b, false);

    assert.ok(brick instanceof PocketCode.ShowBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ShowBrick", "objClassName check");
});

QUnit.test("AskBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.AskBrick(device, sprite, scene, { question: { type: "STRING", value: "test", right: null, left: null }, resourceId: "s11" });

    assert.throws(function () {new PocketCode.AskBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.AskBrick(b, false);

    assert.ok(brick instanceof PocketCode.AskBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "AskBrick", "objClassName check");
});


QUnit.test("SayBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.SayBrick(device, sprite, { text: text });

    assert.throws(function () {new PocketCode.SayBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SayBrick(b, false);

    assert.ok(brick instanceof PocketCode.SayBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SayBrick", "objClassName check");
});

QUnit.test("SayForBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var b = new PocketCode.Model.SayForBrick(device, sprite, { text: text, duration: duration });

    assert.throws(function () {new PocketCode.SayForBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SayForBrick(b, false);

    assert.ok(brick instanceof PocketCode.SayForBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SayForBrick", "objClassName check");
});

QUnit.test("ThinkBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.ThinkBrick(device, sprite, { text: text });

    assert.throws(function () {new PocketCode.ThinkBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.ThinkBrick(b, false);

    assert.ok(brick instanceof PocketCode.ThinkBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ThinkBrick", "objClassName check");
});

QUnit.test("ThinkForBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"sdf","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');

    var b = new PocketCode.Model.ThinkForBrick(device, sprite, { text: text, duration: duration });

    assert.throws(function () {new PocketCode.ThinkForBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ThinkForBrick(b, false);

    assert.ok(brick instanceof PocketCode.ThinkForBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ThinkForBrick", "objClassName check");
});

QUnit.test("SetGraphicEffectBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetGraphicEffectBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.COLOR });

    assert.throws(function () {new PocketCode.SetGraphicEffectBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetGraphicEffectBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetGraphicEffectBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetGraphicEffectBrick", "objClassName check");
});

QUnit.test("ChangeGraphicEffectBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeGraphicEffectBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.COLOR });

    assert.throws(function () {new PocketCode.ChangeGraphicEffectBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ChangeGraphicEffectBrick(b, false);

    assert.ok(brick instanceof PocketCode.ChangeGraphicEffectBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeGraphicEffectBrick", "objClassName check");
});

QUnit.test("ClearGraphicEffectBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.ClearGraphicEffectBrick(device, sprite, { Id: "Id" });

    assert.throws(function () {new PocketCode.ClearGraphicEffectBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ClearGraphicEffectBrick(b, false);

    assert.ok(brick instanceof PocketCode.ClearGraphicEffectBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ClearGraphicEffectBrick", "objClassName check");
});

QUnit.test("SetBackgroundBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._background = sprite;
    var b = new PocketCode.Model.SetBackgroundBrick(device, sprite, scene, { lookId: "lookId" });

    assert.throws(function () {new PocketCode.SetBackgroundBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetBackgroundBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetBackgroundBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetBackgroundBrick", "objClassName check");
});

QUnit.test("SetBackgroundAndWaitBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetBackgroundAndWaitBrick(device, sprite, scene, { lookId: "lookId" });

    assert.throws(function () {new PocketCode.SetBackgroundAndWaitBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetBackgroundAndWaitBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetBackgroundAndWaitBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetBackgroundAndWaitBrick", "objClassName check");
});

QUnit.test("SetBackgroundByIndexBrick", function (assert) {

    assert.ok(false, "TODO");
});

QUnit.test("CameraBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.CameraBrick(device, sprite, { Id: "Id" });

    assert.throws(function () {new PocketCode.CameraBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.CameraBrick(b, false);

    assert.ok(brick instanceof PocketCode.CameraBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "CameraBrick", "objClassName check");
});

QUnit.test("SelectCameraBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    device._cam.supported = true;
    device._cam._on = true;

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SelectCameraBrick(device, sprite, { Id: "Id" });

    assert.throws(function () {new PocketCode.SelectCameraBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SelectCameraBrick(b, false);

    assert.ok(brick instanceof PocketCode.SelectCameraBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SelectCameraBrick", "objClassName check");
});

QUnit.test("FlashBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.FlashBrick(device, sprite, {
        "selected": "1",
        "type": "Flash"
    });

    assert.throws(function () {new PocketCode.FlashBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.FlashBrick(b, false);

    assert.ok(brick instanceof PocketCode.FlashBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "FlashBrick", "objClassName check");
});