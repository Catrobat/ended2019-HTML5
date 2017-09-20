/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksSound.js");


QUnit.test("PlaySoundBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "soundId";

    var b = new PocketCode.Model.PlaySoundBrick(device, sprite, scene.id, soundManager, { resourceId: soundId });

    assert.throws(function () {new PocketCode.PlaySoundBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.PlaySoundBrick(b, false);

    assert.ok(brick instanceof PocketCode.PlaySoundBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "PlaySoundBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Start sound", "text \"Start sound\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});

QUnit.test("PlaySoundAndWaitBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "soundId";

    var b = new PocketCode.Model.PlaySoundAndWaitBrick(device, sprite, scene.id, soundManager, { resourceId: soundId });

    assert.throws(function () {new PocketCode.PlaySoundAndWaitBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.PlaySoundAndWaitBrick(b, false);

    assert.ok(brick instanceof PocketCode.PlaySoundAndWaitBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "PlaySoundAndWaitBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Start sound and wait", "text \"Start sound and wait\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});

QUnit.test("StopAllSoundsBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopAllSoundsBrick(device, sprite, scene.id, soundManager, { id: "id" });

    assert.throws(function () {new PocketCode.StopAllSoundsBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.StopAllSoundsBrick(b, false);

    assert.ok(brick instanceof PocketCode.StopAllSoundsBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "StopAllSoundsBrick", "objClassName check");
    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Stop all sounds", "text \"Stop all sounds\" added");

});

QUnit.test("SetVolumeBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"80","right":null,"left":null}');

    var b = new PocketCode.Model.SetVolumeBrick(device, sprite, soundManager, { percentage: percentage });

    assert.throws(function () {new PocketCode.SetVolumeBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var formula = { type: "NUMBER", value: 4};

    var brick = new PocketCode.SetVolumeBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetVolumeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetVolumeBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set volume to", "text \"Set volume to\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");

});

QUnit.test("ChangeVolumeBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"15","right":null,"left":null}');
    var formula = { type: "NUMBER", value: 4};

    var b = new PocketCode.Model.ChangeVolumeBrick(device, sprite, soundManager, { value: value });

    assert.throws(function () {new PocketCode.ChangeVolumeBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ChangeVolumeBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.ChangeVolumeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeVolumeBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Change volume by", "text \"Change volume by\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
});


QUnit.test("SpeakBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"hello world","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakBrick(device, sprite, scene.id, soundManager, { text: text });
    var formula ={ type: "STRING", value: "fgh"};

    assert.throws(function () {new PocketCode.SpeakBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.SpeakBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SpeakBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SpeakBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Speak", "text \"Speak\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("SpeakAndWaitBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakAndWaitBrick(device, sprite, scene.id, soundManager, { text: text });

    assert.throws(function () {new PocketCode.SpeakAndWaitBrick(new PocketCode.Model.NoteBrick(device, "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var formula ={ type: "STRING", value: "fgh"};

    var brick = new PocketCode.SpeakAndWaitBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SpeakAndWaitBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SpeakAndWaitBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Speak", "text \"Speak\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "and wait", "text \"and wait\" added");

});