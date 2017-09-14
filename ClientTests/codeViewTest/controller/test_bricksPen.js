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

    var brick = new PocketCode.PenDownBrick(b, false);

    assert.ok(brick instanceof PocketCode.PenDownBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "PenDownBrick", "objClassName check");
});

QUnit.test("PenUpBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.PenUpBrick(device, sprite, {});

    var brick = new PocketCode.PenUpBrick(b, false);

    assert.ok(brick instanceof PocketCode.PenUpBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "PenUpBrick", "objClassName check");
});

QUnit.test("SetPenSizeBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.SetPenSizeBrick(device, sprite, { size: x });

    var brick = new PocketCode.SetPenSizeBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetPenSizeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetPenSizeBrick", "objClassName check");
});

QUnit.test("SetPenColorBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var blue = JSON.parse('{"type":"NUMBER","value":"200.0","right":null,"left":null}');
    var red = JSON.parse('{"type":"NUMBER","value":"145.0","right":null,"left":null}');
    var green = JSON.parse('{"type":"NUMBER","value":"33.0","right":null,"left":null}');

    var b = new PocketCode.Model.SetPenColorBrick(device, sprite, { b: blue, r: red, g: green });

    var brick = new PocketCode.SetPenColorBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetPenColorBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetPenColorBrick", "objClassName check");
});

QUnit.test("StampBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StampBrick(device, sprite, {});

    var brick = new PocketCode.StampBrick(b, false);

    assert.ok(brick instanceof PocketCode.StampBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "StampBrick", "objClassName check");
});

QUnit.test("ClearBackgroundBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.ClearBackgroundBrick(device, sprite, scene, {});

    var brick = new PocketCode.ClearBackgroundBrick(b, false);

    assert.ok(brick instanceof PocketCode.ClearBackgroundBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ClearBackgroundBrick", "objClassName check");
});