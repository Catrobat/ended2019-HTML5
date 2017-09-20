/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksControl.js");


QUnit.test("WaitBrick", function (assert) {

    var device = "device";
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var b = new PocketCode.Model.WaitBrick(device, "sprite", {duration: duration});
    var formula = { type: "NUMBER", value: 5}

    assert.throws(function () {new PocketCode.WaitBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.WaitBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.WaitBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WaitBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Wait", "text \"Wait\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "second/s", "text \"second/s\" added");


});

QUnit.test("NoteBrick", function (assert) {

    var device = "device";
    var b = new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" });
    var formula = { "type": "FUNCTION", "value": "SIN", "right": null,
        "left": { "type": "NUMBER", "value": "90", "right": null, "left": null } };
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var c = new PocketCode.Model.WaitBrick(device, "sprite", {duration: duration});

    assert.throws(function () {new PocketCode.NoteBrick(c, false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.NoteBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.NoteBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "NoteBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Note", "text \"Note\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length == 4, "childs added to brick formula");
});

QUnit.test("ForeverBrick", function (assert) {

    var device = "device";
    var b = new PocketCode.Model.ForeverBrick(device, "sprite", 50, { id: "id" });

    assert.throws(function () {new PocketCode.ForeverBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.ForeverBrick(b, false);

    assert.ok(brick instanceof PocketCode.ForeverBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ForeverBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Forever", "text \"Forever\" added");
    assert.equal(brick._view._childs[3]._childs[0]._textNode._text, "End of loop", "text \"End of loop\" added");
    assert.equal(brick._view._childs.length, 4, "length childs");

});

QUnit.test("IfThenElseBrick", function (assert) {

    var device = "device";
    var condTrue = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
    var b = new PocketCode.Model.IfThenElseBrick(device, "sprite", { condition: condTrue });
    var formula = { type: "NUMBER", value: 5}

    assert.throws(function () {new PocketCode.IfThenElseBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.IfThenElseBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.IfThenElseBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "IfThenElseBrick", "objClassName check");

    assert.equal(brick._view._childs.length, 5, "length childs");
});

QUnit.test("WaitUntilBrick", function (assert) {

    var device = "device";
    var conditionTrue = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
    var b = new PocketCode.Model.WaitUntilBrick(device, "sprite", 24, { condition: conditionTrue });
    var formula = { type: "NUMBER", value: 5}

    assert.throws(function () {new PocketCode.WaitUntilBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.WaitUntilBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.WaitUntilBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "WaitUntilBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Wait until", "text \"Wait until\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "is true", "text \"is true\" added");
});

QUnit.test("RepeatBrick", function (assert) {

    var device = "device";
    var nTimes = JSON.parse('{"type":"NUMBER","value":"6","right":null,"left":null}');
    var b = new PocketCode.Model.RepeatBrick(device, "sprite", 24, { x: 1, y: 2, timesToRepeat: nTimes });
    var formula = { type: "NUMBER", value: 5}

    assert.throws(function () {new PocketCode.RepeatBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.RepeatBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.RepeatBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "RepeatBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Repeat", "text \"Repeat\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "time/s", "text \"time/s\" added");
});

QUnit.test("RepeatUntilBrick", function (assert) {

    var device = "device";
    var conditionFalse = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"2","right":null,"left":null}}');
    var b = new PocketCode.Model.RepeatUntilBrick(device, "sprite", 24, { condition: conditionFalse });
    var formula = { type: "NUMBER", value: 5}

    assert.throws(function () {new PocketCode.RepeatUntilBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.RepeatUntilBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.RepeatUntilBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "RepeatUntilBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Repeat until", "text \"Repeat until\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "is true", "text \"is true\" added");

});

QUnit.test("SceneTransitionBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var b = new PocketCode.Model.SceneTransitionBrick(device, "sprite", gameEngine, { sceneId: "s2" });

    assert.throws(function () {new PocketCode.SceneTransitionBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.SceneTransitionBrick(b, false);

    assert.ok(brick instanceof PocketCode.SceneTransitionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SceneTransitionBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Continue scene", "text \"Continue scene\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});

QUnit.test("StartSceneBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var b = new PocketCode.Model.StartSceneBrick(device, "sprite",  gameEngine, { sceneId: "s2" });

    assert.throws(function () {new PocketCode.StartSceneBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.StartSceneBrick(b, false);

    assert.ok(brick instanceof PocketCode.StartSceneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "StartSceneBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Start scene", "text \"Start scene\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

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

    assert.throws(function () {new PocketCode.CloneBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.CloneBrick(b, false);

    assert.ok(brick instanceof PocketCode.CloneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "CloneBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Create clone of", "text \"Create clone of\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});

QUnit.test("DeleteCloneBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, gameEngine._soundManager, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.DeleteCloneBrick(device, sprite, scene, { id: "2" });

    assert.throws(function () {new PocketCode.DeleteCloneBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.DeleteCloneBrick(b, false);

    assert.ok(brick instanceof PocketCode.DeleteCloneBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "DeleteCloneBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Delete this clone", "text \"Delete this clone\" added");

});

QUnit.test("StopBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, gameEngine._soundManager, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { stopType: PocketCode.StopType.THIS_SCRIPT });

    assert.throws(function () {new PocketCode.StopBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.StopBrick(b, false);

    assert.ok(brick instanceof PocketCode.StopBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "StopBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Stop script/s", "text \"Stop script/s\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});