/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksPen.js");


QUnit.test("PenDownBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.PenDownBrick(device, sprite, {});

    assert.throws(function () {new PocketCode.PenDownBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.PenDownBrick(b, false);

    assert.ok(brick instanceof PocketCode.PenDownBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "PenDownBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Pen down", "text \"Pen down\" added");

});

QUnit.test("PenUpBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.PenUpBrick(device, sprite, {});

    assert.throws(function () {new PocketCode.PenUpBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.PenUpBrick(b, false);

    assert.ok(brick instanceof PocketCode.PenUpBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "PenUpBrick", "objClassName check");
    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Pen up", "text \"Pen up\" added");

});

QUnit.test("SetPenSizeBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.SetPenSizeBrick(device, sprite, { size: x });
    var formula = { type: "NUMBER", value: 4};

    assert.throws(function () {new PocketCode.SetPenSizeBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetPenSizeBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetPenSizeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetPenSizeBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set pen size to", "text \"Set pen size to\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");

});

QUnit.test("SetPenColorBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var blue = JSON.parse('{"type":"NUMBER","value":"200.0","right":null,"left":null}');
    var red = JSON.parse('{"type":"NUMBER","value":"145.0","right":null,"left":null}');
    var green = JSON.parse('{"type":"NUMBER","value":"33.0","right":null,"left":null}');
    var formulaBlue = { type: "NUMBER", value: 4};
    var formulaRed = { type: "NUMBER", value: 4};
    var formulaGreen = { type: "NUMBER", value: 4};

    var b = new PocketCode.Model.SetPenColorBrick(device, sprite, { b: blue, r: red, g: green });

    assert.throws(function () {new PocketCode.SetPenColorBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetPenColorBrick(b, false, formulaRed, formulaGreen, formulaBlue);

    assert.ok(brick instanceof PocketCode.SetPenColorBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetPenColorBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set pen color to", "text \"Set pen color to\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "Red", "text \"Red\" added");
    assert.ok(brick._view._childs[1]._childs[4]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "Green", "text \"Green\" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[7]._textNode._text, "Blue", "text \"Blue\" added");
    assert.ok(brick._view._childs[1]._childs[8]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("StampBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StampBrick(device, sprite, {});

    assert.throws(function () {new PocketCode.StampBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.StampBrick(b, false);

    assert.ok(brick instanceof PocketCode.StampBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "StampBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Stamp", "text \"Stamp\" added");

});

QUnit.test("ClearBackgroundBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.ClearBackgroundBrick(device, sprite, scene, {});

    assert.throws(function () {new PocketCode.ClearBackgroundBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ClearBackgroundBrick(b, false);

    assert.ok(brick instanceof PocketCode.ClearBackgroundBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ClearBackgroundBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Wipe painted away", "text \"Wipe painted away\" added");

});