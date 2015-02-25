/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksLook.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("bricksLook.js");


QUnit.test("SetLookBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.SetLookBrick(device, sprite, { id: "lookId" });

    assert.ok(b._device === device && b._sprite === sprite && b._lookId === "lookId", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetLookBrick, "instance check");
    assert.ok(b.objClassName === "SetLookBrick", "objClassName check");


});

QUnit.test("NextLookBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.NextLookBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.NextLookBrick, "instance check");
    assert.ok(b.objClassName === "NextLookBrick", "objClassName check");


});

QUnit.test("SetSizeToBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetSizeToBrick(device, sprite, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetSizeToBrick, "instance check");
    assert.ok(b.objClassName === "SetSizeToBrick", "objClassName check");


});

QUnit.test("ChangeSizeBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeSizeBrick(device, sprite, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeSizeBrick, "instance check");
    assert.ok(b.objClassName === "ChangeSizeBrick", "objClassName check");


});

QUnit.test("HideBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.HideBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.HideBrick, "instance check");
    assert.ok(b.objClassName === "HideBrick", "objClassName check");


});

QUnit.test("ShowBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.ShowBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ShowBrick, "instance check");
    assert.ok(b.objClassName === "ShowBrick", "objClassName check");


});

QUnit.test("SetTransparencyBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetTransparencyBrick(device, sprite, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetTransparencyBrick, "instance check");
    assert.ok(b.objClassName === "SetTransparencyBrick", "objClassName check");


});

QUnit.test("ChangeTransparencyBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeTransparencyBrick(device, sprite, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeTransparencyBrick, "instance check");
    assert.ok(b.objClassName === "ChangeTransparencyBrick", "objClassName check");


});

QUnit.test("SetBrightnessBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetBrightnessBrick(device, sprite, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetBrightnessBrick, "instance check");
    assert.ok(b.objClassName === "SetBrightnessBrick", "objClassName check");


});

QUnit.test("ChangeBrightnessBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeBrightnessBrick(device, sprite, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeBrightnessBrick, "instance check");
    assert.ok(b.objClassName === "ChangeBrightnessBrick", "objClassName check");


});

QUnit.test("ClearGraphicEffectBrick", function (assert) {

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.ClearGraphicEffectBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ClearGraphicEffectBrick, "instance check");
    assert.ok(b.objClassName === "ClearGraphicEffectBrick", "objClassName check");


});

