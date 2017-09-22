/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksEvent.js");


QUnit.test("WhenProgramStartBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._collisionManager = new PocketCode.CollisionManager(400, 200);  //make sure collisionMrg is initialized before calling an onStart event
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var b = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", { x: 1, y: 2 }, scene.onStart);

    assert.throws(function () {new PocketCode.WhenProgramStartBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.WhenProgramStartBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenProgramStartBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenProgramStartBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When program starts", "text \"When program starts\" added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
});

QUnit.test("WhenActionBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);    //add to receive events

    var b = new PocketCode.Model.WhenActionBrick("device", sprite, { action: PocketCode.UserActionType.SPRITE_TOUCHED }, { spriteTouched: scene.onSpriteTappedAction });

    assert.throws(function () {new PocketCode.WhenActionBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.WhenActionBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenActionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenActionBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When screen is touched", "text \"When screen is touched\" added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");

    var b = new PocketCode.Model.WhenActionBrick("device", sprite, { action: PocketCode.UserActionType.TOUCH_START }, {touchStart: scene.onSpriteTappedAction});
    var brick = new PocketCode.WhenActionBrick(b, false);

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When tapped", "text \"When tapped\" added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
});

QUnit.test("WhenBroadcastReceiveBrick", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    assert.throws(function () {new PocketCode.WhenBroadcastReceiveBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false), Error, "ERRROR: Invalid argument Model"});

    var b = new PocketCode.Model.WhenBroadcastReceiveBrick("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });

    var brick = new PocketCode.WhenBroadcastReceiveBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenBroadcastReceiveBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenBroadcastReceiveBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When you receive", "text \"When you receive\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
});

QUnit.test("BroadcastBrick", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastId: "s12", andWait: false });

    assert.throws(function () {new PocketCode.BroadcastBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.BroadcastBrick(b, false);

    assert.ok(brick instanceof PocketCode.BroadcastBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "BroadcastBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Broadcast", "text \"Broadcast\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");

    //andWait
    b = new PocketCode.Model.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastId: "s12", andWait: true });
    brick = new PocketCode.BroadcastBrick(b, false);

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Broadcast and wait", "text \"Broadcast and wait\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
});

QUnit.test("WhenConditionMetBrick", function (assert) {

    var cond = JSON.parse('{"type":"NUMBER","value":"0","right":null,"left":null}');

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.WhenConditionMetBrick("device", sprite, 24, { condition: cond }, scene.onStart);

    assert.throws(function () {new PocketCode.WhenConditionMetBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var formula = { type: "NUMBER", value: 4};
    var brick = new PocketCode.WhenConditionMetBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.WhenConditionMetBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenConditionMetBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When", "text \"When\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "becomes true", "text \"becomes true\" added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
});

QUnit.test("WhenCollisionBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var physicsWorld = new PocketCode.PhysicsWorld(scene);
    var sprite = { id: "id1" };
    var spriteId2 = "id2";
    var b = new PocketCode.Model.WhenCollisionBrick("device", sprite, physicsWorld, { spriteId: spriteId2 });

    assert.throws(function () {new PocketCode.WhenCollisionBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.WhenCollisionBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenCollisionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenCollisionBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When physical collision with", "text \"When physical collision with\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
});

QUnit.test("WhenBackgroundChangesToBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.BackgroundSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.WhenBackgroundChangesToBrick(device, sprite, scene, { lookId: "lookId" });

    assert.throws(function () {new PocketCode.WhenBackgroundChangesToBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.WhenBackgroundChangesToBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenBackgroundChangesToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenBackgroundChangesToBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When background changes to", "text \"When background changes to\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
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
    assert.throws(function () {new PocketCode.WhenStartAsCloneBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.WhenStartAsCloneBrick(b, false);

    assert.ok(brick instanceof PocketCode.WhenStartAsCloneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WhenStartAsCloneBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "When I start as a clone", "text \"When I start as a clone\" added");
    assert.ok(brick._view._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "", "endContent added");
});