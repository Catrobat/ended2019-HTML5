/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksSound.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("bricksSound.js");


QUnit.test("PlaySoundBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var soundId = "soundId";

    var b = new PocketCode.Bricks.PlaySoundBrick(device, sprite, { soundId: soundId });

    assert.ok(b._device === device && b._sprite === sprite && b._soundId === soundId, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.PlaySoundBrick, "instance check");
    assert.ok(b.objClassName === "PlaySoundBrick", "objClassName check");


});

QUnit.test("StopAllSoundsBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.StopAllSoundsBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.StopAllSoundsBrick, "instance check");
    assert.ok(b.objClassName === "StopAllSoundsBrick", "objClassName check");


});

QUnit.test("SetVolumeBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var percentage = JSON.parse('{"type":"NUMBER","value":"80","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetVolumeBrick(device, sprite, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetVolumeBrick, "instance check");
    assert.ok(b.objClassName === "SetVolumeBrick", "objClassName check");


});

QUnit.test("ChangeVolumeBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var value = JSON.parse('{"type":"NUMBER","value":"15","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeVolumeBrick(device, sprite, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeVolumeBrick, "instance check");
    assert.ok(b.objClassName === "ChangeVolumeBrick", "objClassName check");


});

QUnit.test("SpeakBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Bricks.SpeakBrick(device, sprite, { text: text });

    assert.ok(b._device === device && b._sprite === sprite && b._text instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SpeakBrick, "instance check");
    assert.ok(b.objClassName === "SpeakBrick", "objClassName check");


});


