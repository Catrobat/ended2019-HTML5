 /// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksMotion.js");


QUnit.test("GoToPositionBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');
    var formulaX = { type: "NUMBER", value: 4};
    var formulaY = { type: "NUMBER", value: 5};
    var b = new PocketCode.Model.GoToPositionBrick(device, sprite, { x: x, y: y });
    assert.throws(function () {new PocketCode.GoToPositionBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.GoToPositionBrick(b, false, formulaX, formulaY);

    assert.ok(brick instanceof PocketCode.GoToPositionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GoToPositionBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Go to", "text \"Go to\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "X: ", "text \"X: \" added");
    assert.ok(brick._view._childs[1]._childs[4]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "Y: ", "text \"Y: \" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");

});

QUnit.test("SetXBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.SetXBrick(device, sprite, { value: x });
    assert.throws(function () {new PocketCode.SetXBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.SetXBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetXBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetXBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set X to ", "text \"Set X to \" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");

});

QUnit.test("SetYBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.SetYBrick(device, sprite, { value: y });

    assert.throws(function () {new PocketCode.SetYBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetYBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetYBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetYBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set Y to ", "text \"Set Y to \" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("ChangeXBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeXBrick(device, sprite, { value: x });
    var formula = { type: "NUMBER", value: 5};

    assert.throws(function () {new PocketCode.ChangeXBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ChangeXBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.ChangeXBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeXBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Change X by ", "text \"Change X by \" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("ChangeYBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.ChangeYBrick(device, sprite, { value: y });

    assert.throws(function () {new PocketCode.ChangeYBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ChangeYBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.ChangeYBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeYBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Change Y by ", "text \"Change Y by \" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("SetRotionStyleBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetRotionStyleBrick(device, sprite, { id: "id" });

    assert.throws(function () {new PocketCode.SetRotionStyleBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetRotionStyleBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetRotionStyleBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetRotionStyleBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set rotation style ", "text \"Set rotation style \" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});


QUnit.test("SetRotationSpeedBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var deg = JSON.parse('{"type":"NUMBER","value":"35","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    //clockwise
    var b = new PocketCode.Model.SetRotationSpeedBrick(device, sprite, { degreesPerSec: deg, ccw: false });

    assert.throws(function () {new PocketCode.SetRotationSpeedBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetRotationSpeedBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetRotationSpeedBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetRotationSpeedBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Rotate right ", "text \"Rotate right \" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "degrees/second", "text \"degrees/second\" added");

    var b = new PocketCode.Model.SetRotationSpeedBrick(device, sprite, { degreesPerSec: deg, ccw: true });
    var brick = new PocketCode.SetRotationSpeedBrick(b, false, formula);

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Rotate left ", "text \"Rotate left \" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "degrees/second", "text \"degrees/second\" added");

});

QUnit.test("GoToBrick", function (assert) {

    var soundMgr = new PocketCode.SoundManager();
    var device = new PocketCode.MediaDevice(soundMgr);
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, device, soundMgr, []);
    scene._originalScreenWidth = 300; //set internal: used for random position calculation
    scene._originalScreenHeight = 800;

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var sprite2 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "id", name: "spriteName2" });
    scene._sprites = [sprite, sprite2];  //add to scene to set position

    var b = new PocketCode.Model.GoToBrick(device, sprite, scene, { destinationType: "sprite", spriteId: "id" });

    assert.throws(function () {new PocketCode.GoToBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.GoToBrick(b, false);

    assert.ok(brick instanceof PocketCode.GoToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GoToBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Go to", "text \"Go to\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});

QUnit.test("IfOnEdgeBounceBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.IfOnEdgeBounceBrick(device, sprite, { id: "id" });

    assert.throws(function () {new PocketCode.IfOnEdgeBounceBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.IfOnEdgeBounceBrick(b, false);

    assert.ok(brick instanceof PocketCode.IfOnEdgeBounceBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "IfOnEdgeBounceBrick", "objClassName check");
    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "If on edge, bounce", "text \"If on edge, bounce\" added");

});

QUnit.test("MoveNStepsBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var steps = JSON.parse('{"type":"NUMBER","value":"14","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.MoveNStepsBrick(device, sprite, 24, { steps: steps });

    assert.throws(function () {new PocketCode.MoveNStepsBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.MoveNStepsBrick(b, false,formula);

    assert.ok(brick instanceof PocketCode.MoveNStepsBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "MoveNStepsBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Move", "text \"Move\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "step/s", "text \"step/s\" added");

});

QUnit.test("TurnLeftBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"45","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.TurnLeftBrick(device, sprite, { degrees: degrees });

    assert.throws(function () {new PocketCode.TurnLeftBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.TurnLeftBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.TurnLeftBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "TurnLeftBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Turn left", "text \"Turn left\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "degrees", "text \"degrees\" added");
});

QUnit.test("TurnRightBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"30","right":null,"left":null}');

    var b = new PocketCode.Model.TurnRightBrick(device, sprite, { degrees: degrees });
    var formula = { type: "NUMBER", value: 5};

    assert.throws(function () {new PocketCode.TurnRightBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.TurnRightBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.TurnRightBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "TurnRightBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Turn right", "text \"Turn right\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "degrees", "text \"degrees\" added");
});

QUnit.test("SetDirectionBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"0","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.SetDirectionBrick(device, sprite, { degrees: degrees });

    assert.throws(function () {new PocketCode.SetDirectionBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetDirectionBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetDirectionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetDirectionBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Point in direction", "text \"Point in direction\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "degrees", "text \"degrees\" added")
});

QUnit.test("SetDirectionToBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var spriteId = "spriteId";
    sprite._id = spriteId;
    scene._sprites.push(sprite);
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.SetDirectionToBrick(device, sprite, { spriteId: spriteId });

    assert.throws(function () {new PocketCode.SetDirectionToBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetDirectionToBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetDirectionToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetDirectionToBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Point towards", "text \"Point towards\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("GlideToBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._positionX = -10;
    sprite._positionY = -30;
    var formulaTime = { type: "NUMBER", value: 5};
    var formulaX = { type: "NUMBER", value: 5};
    var formulaY = { type: "NUMBER", value: 5};

    var x = JSON.parse('{"type":"NUMBER","value":"20","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"50","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');

    var b = new PocketCode.Model.GlideToBrick(device, sprite, { x: x, y: y, duration: duration });

    assert.throws(function () {new PocketCode.GlideToBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.GlideToBrick(b, false, formulaTime, formulaX, formulaY);

    assert.ok(brick instanceof PocketCode.GlideToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GlideToBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Glide", "text \"Glide\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "second/s", "text \"second/s\" added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "to X:", "text \"to X:\" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[7]._textNode._text, "Y: ", "text \"Y: \" added");
    assert.ok(brick._view._childs[1]._childs[8]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("GoBackBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);
    var layers = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.GoBackBrick(device, sprite, { layers: layers });

    assert.throws(function () {new PocketCode.GoBackBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.GoBackBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.GoBackBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GoBackBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Go back", "text \"Go back\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "layer/s", "text \"layer/s\" added")
});

QUnit.test("ComeToFrontBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);

    var b = new PocketCode.Model.ComeToFrontBrick(device, sprite, { commentedOut: false });

    assert.throws(function () {new PocketCode.ComeToFrontBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ComeToFrontBrick(b, false);

    assert.ok(brick instanceof PocketCode.ComeToFrontBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ComeToFrontBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Go to front", "text \"Go to front\" added");

});

QUnit.test("VibrationBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var duration = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.VibrationBrick(device, sprite, { duration: duration });

    assert.throws(function () {new PocketCode.VibrationBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var formula = { type: "NUMBER", value: 5};

    var brick = new PocketCode.VibrationBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.VibrationBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "VibrationBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Vibrate for", "text \"Vibrate for\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "second/s", "text \"second/s\" added")
});

QUnit.test("SetPhysicsObjectTypeBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var physicsWorld = new PocketCode.PhysicsWorld(scene);
    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetPhysicsObjectTypeBrick(device, sprite, physicsWorld, { id: "id" });

    assert.throws(function () {new PocketCode.SetPhysicsObjectTypeBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetPhysicsObjectTypeBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetPhysicsObjectTypeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetPhysicsObjectTypeBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set motion type to", "text \"Set motion type to\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});

QUnit.test("SetVelocityBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');
    var formulaX = { type: "NUMBER", value: 5};
    var formulaY = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.SetVelocityBrick(device, sprite, { x: x, y: y });

    assert.throws(function () {new PocketCode.SetVelocityBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetVelocityBrick(b, false, formulaX, formulaY);

    assert.ok(brick instanceof PocketCode.SetVelocityBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetVelocityBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set velocity to ", "text \"Set velocity to\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "X: ", "text \"X:\" added");
    assert.ok(brick._view._childs[1]._childs[4]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "Y: ", "text \"Y:\" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[7]._textNode._text, "steps/second", "text \"steps/second\" added")
});

QUnit.test("SetGravityBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"23","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"34","right":null,"left":null}');
    var formulaX = { type: "NUMBER", value: 5};
    var formulaY = { type: "NUMBER", value: 5};
    var b = new PocketCode.Model.SetGravityBrick(device, sprite, scene, { x: x, y: y });

    assert.throws(function () {new PocketCode.SetGravityBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetGravityBrick(b, false, formulaX, formulaY);

    assert.ok(brick instanceof PocketCode.SetGravityBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetGravityBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set gravity for all objects to ", "text \"Set gravity for all objects to \" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "X: ", "text \"X:\" added");
    assert.ok(brick._view._childs[1]._childs[4]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "Y: ", "text \"Y:\" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[7]._textNode._text, "steps/second²", "text \"steps/second²\" added")

});

QUnit.test("SetMassBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });    //PhysicsSprite
    var mass = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 5};

    var b = new PocketCode.Model.SetMassBrick(device, sprite, { value: mass });

    assert.throws(function () {new PocketCode.SetMassBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetMassBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetMassBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetMassBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set mass to ", "text \"Set mass to \" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "kilogram", "text \"kilogram\" added");

});

QUnit.test("SetBounceFactorBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"71","right":null,"left":null}');

    var b = new PocketCode.Model.SetBounceFactorBrick(device, sprite, { percentage: percentage });
    var formula = { type: "NUMBER", value: 5};

    assert.throws(function () {new PocketCode.SetBounceFactorBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SetBounceFactorBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetBounceFactorBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetBounceFactorBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set bounce factor to ", "text \"Set bounce factor to \" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "%", "text \"%\" added");
});

QUnit.test("SetFrictionBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var friction = JSON.parse('{"type":"NUMBER","value":"53","right":null,"left":null}');

    var b = new PocketCode.Model.SetFrictionBrick(device, sprite, { percentage: friction });

    assert.throws(function () {new PocketCode.SetFrictionBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var formula = { type: "NUMBER", value: 5};

    var brick = new PocketCode.SetFrictionBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetFrictionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetFrictionBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set friction to ", "text \"Set friction to \" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "%", "text \"%\" added");
});