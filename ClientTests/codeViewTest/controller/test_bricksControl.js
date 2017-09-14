/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksControl.js");


QUnit.test("WaitBrick", function (assert) {

    var device = "device";
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var b = new PocketCode.Model.WaitBrick(device, "sprite", {duration: duration});

    var brick = new PocketCode.WaitBrick(b, false);

    assert.ok(brick instanceof PocketCode.WaitBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WaitBrick", "objClassName check");
});

QUnit.test("NoteBrick", function (assert) {

    var device = "device";
    var b = new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" });

    var brick = new PocketCode.NoteBrick(b, false);

    assert.ok(brick instanceof PocketCode.NoteBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "NoteBrick", "objClassName check");
});

QUnit.test("ForeverBrick", function (assert) {

    var device = "device";
    var b = new PocketCode.Model.ForeverBrick(device, "sprite", 50, { id: "id" });

    var brick = new PocketCode.ForeverBrick(b, false);

    assert.ok(brick instanceof PocketCode.ForeverBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ForeverBrick", "objClassName check");
});

QUnit.test("IfThenElseBrick", function (assert) {

    var device = "device";
    var condTrue = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
    var b = new PocketCode.Model.IfThenElseBrick(device, "sprite", { condition: condTrue });

    var brick = new PocketCode.IfThenElseBrick(b, false);

    assert.ok(brick instanceof PocketCode.IfThenElseBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "IfThenElseBrick", "objClassName check");
});

QUnit.test("WaitUntilBrick", function (assert) {

    var device = "device";
    var conditionTrue = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
    var b = new PocketCode.Model.WaitUntilBrick(device, "sprite", 24, { condition: conditionTrue });

    var brick = new PocketCode.WaitUntilBrick(b, false);

    assert.ok(brick instanceof PocketCode.WaitUntilBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WaitUntilBrick", "objClassName check");
});

QUnit.test("RepeatBrick", function (assert) {

    var device = "device";
    var nTimes = JSON.parse('{"type":"NUMBER","value":"6","right":null,"left":null}');
    var b = new PocketCode.Model.RepeatBrick(device, "sprite", 24, { x: 1, y: 2, timesToRepeat: nTimes });

    var brick = new PocketCode.RepeatBrick(b, false);

    assert.ok(brick instanceof PocketCode.RepeatBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "RepeatBrick", "objClassName check");
});

QUnit.test("RepeatUntilBrick", function (assert) {

    var device = "device";
    var conditionFalse = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"2","right":null,"left":null}}');
    var b = new PocketCode.Model.RepeatUntilBrick(device, "sprite", 24, { condition: conditionFalse });

    var brick = new PocketCode.RepeatUntilBrick(b, false);

    assert.ok(brick instanceof PocketCode.RepeatUntilBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "RepeatUntilBrick", "objClassName check");
});

QUnit.test("SceneTransitionBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var b = new PocketCode.Model.SceneTransitionBrick(device, "sprite", gameEngine, { sceneId: "s2" });

    var brick = new PocketCode.SceneTransitionBrick(b, false);

    assert.ok(brick instanceof PocketCode.SceneTransitionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SceneTransitionBrick", "objClassName check");
});

QUnit.test("StartSceneBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var b = new PocketCode.Model.StartSceneBrick(device, "sprite",  gameEngine, { sceneId: "s2" });

    var brick = new PocketCode.StartSceneBrick(b, false);

    assert.ok(brick instanceof PocketCode.StartSceneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "StartSceneBrick", "objClassName check");
});

QUnit.test("CloneBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();

    var latestCloneId;
    var mockScene = {
        cloneSprite: function (id) {
            latestCloneId = id;
        },
        onSpriteUiChange: new SmartJs.Event.Event(this)
    };

    var sprite = new PocketCode.Model.Sprite(gameEngine, mockScene, { id: "1", name: "spriteName", scripts: [] });

    var b = new PocketCode.Model.CloneBrick(device, sprite,  mockScene, { spriteId: "23" });

    var brick = new PocketCode.CloneBrick(b, false);

    assert.ok(brick instanceof PocketCode.CloneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "CloneBrick", "objClassName check");
});

QUnit.test("DeleteCloneBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, gameEngine._soundManager, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.DeleteCloneBrick(device, sprite, scene, { id: "2" });

    var brick = new PocketCode.DeleteCloneBrick(b, false);

    assert.ok(brick instanceof PocketCode.DeleteCloneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "DeleteCloneBrick", "objClassName check");
});

QUnit.test("StopBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, gameEngine._soundManager, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { stopType: PocketCode.StopType.THIS_SCRIPT });

    var brick = new PocketCode.StopBrick(b, false);

    assert.ok(brick instanceof PocketCode.StopBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "StopBrick", "objClassName check");
});