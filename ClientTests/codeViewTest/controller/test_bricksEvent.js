/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksEvent.js");


QUnit.test("WhenProgramStartBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._collisionManager = new PocketCode.CollisionManager(400, 200);  //make sure collisionMrg is initialized before calling an onStart event
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var b = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", { x: 1, y: 2 }, scene.onStart);

    var brick = new PocketCode.WhenProgramStartBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenProgramStartBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenProgramStartBrick", "objClassName check");
});

QUnit.test("WhenActionBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);    //add to receive events

    var b = new PocketCode.Model.WhenActionBrick("device", sprite, { action: PocketCode.UserActionType.SPRITE_TOUCHED }, { spriteTouched: scene.onSpriteTappedAction });

    var brick = new PocketCode.WhenActionBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenActionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenActionBrick", "objClassName check");
});

QUnit.test("WhenTouchBrick", function (assert) {

    assert.ok(false, "todo");
});

QUnit.test("WhenBroadcastReceiveBrick", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.WhenBroadcastReceiveBrick("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });

    var brick = new PocketCode.WhenBroadcastReceiveBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenBroadcastReceiveBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenBroadcastReceiveBrick", "objClassName check");
});

QUnit.test("BroadcastBrick", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastId: "s12" });

    var brick = new PocketCode.BroadcastBrick(b, false);

    assert.ok(brick instanceof PocketCode.BroadcastBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "BroadcastBrick", "objClassName check");
});

QUnit.test("BroadcastAndWaitBrick", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.BroadcastAndWaitBrick("device", "sprite", broadcastMgr, { broadcastId: "s12" });

    var brick = new PocketCode.BroadcastAndWaitBrick(b, false);

    assert.ok(brick instanceof PocketCode.BroadcastAndWaitBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "BroadcastAndWaitBrick", "objClassName check");
});

QUnit.test("WhenConditionMetBrick", function (assert) {

    var cond = JSON.parse('{"type":"NUMBER","value":"0","right":null,"left":null}');

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.WhenConditionMetBrick("device", sprite, 24, { condition: cond }, scene.onStart);

    var brick = new PocketCode.WhenConditionMetBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenConditionMetBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenConditionMetBrick", "objClassName check");
});

QUnit.test("WhenCollisionBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var physicsWorld = new PocketCode.PhysicsWorld(scene);
    var sprite = { id: "id1" };
    var spriteId2 = "id2";
    var b = new PocketCode.Model.WhenCollisionBrick("device", sprite, physicsWorld, { spriteId: spriteId2 });

    var brick = new PocketCode.WhenCollisionBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenCollisionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenCollisionBrick", "objClassName check");
});

QUnit.test("WhenBackgroundChangesToBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.BackgroundSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.WhenBackgroundChangesToBrick(device, sprite, scene, { lookId: "lookId" });

    var brick = new PocketCode.WhenBackgroundChangesToBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenBackgroundChangesToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenBackgroundChangesToBrick", "objClassName check");
});

QUnit.test("WhenStartAsCloneBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, "device", "soundManager", [], 20);
    assert.ok(scene.onSpriteUiChange instanceof SmartJs.Event.Event, "mock scene interface check");
    var mockScene = {
        onSpriteUiChange: new SmartJs.Event.Event(this)
    };
    var sprite = new PocketCode.Model.Sprite(gameEngine, mockScene, { id: "spriteId", spriteId: "1", name: "spriteName" });

    //tests using a sprite
    var b = new PocketCode.Model.WhenStartAsCloneBrick("device", sprite, { id: "spriteId" });
    var brick = new PocketCode.WhenStartAsCloneBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenStartAsCloneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenStartAsCloneBrick", "objClassName check");
});