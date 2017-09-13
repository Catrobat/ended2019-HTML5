/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/ui/brickFormula.js");


QUnit.test("BrickFormula", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);
    var f = new PocketCode.Formula(device, sprite);

    f.json = { "type": "SENSOR", "value": "OBJECT_X", "right": null, "left": null };
    f.toString();
    i18nKey = f.json;

    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.ok(ctrl instanceof PocketCode.CodeView.Ui.BrickFormula && ctrl instanceof PocketCode.Ui.Button, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "BrickFormula", "objClassName check");

    assert.equal(ctrl._childs[0]._textNode._text, "position_x", "type SENSOR");

    var i18nKey = { type: "NUMBER", value: 5};
    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, 5, "type NUMBER");

    i18nKey = { type: "STRING", value: "string_test"};
    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "string_test", "type STRING");

});