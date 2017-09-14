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

    var b = new PocketCode.Model.GoToPositionBrick(device, sprite, { x: x, y: y });
    var brick = new PocketCode.GoToPositionBrick(b, false);

    assert.ok(brick instanceof PocketCode.GoToPositionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GoToPositionBrick", "objClassName check");
});

QUnit.test("SetXBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.SetXBrick(device, sprite, { value: x });

    var brick = new PocketCode.SetXBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetXBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetXBrick", "objClassName check");
});

QUnit.test("SetYBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetYBrick(device, sprite, { value: y });

    var brick = new PocketCode.SetYBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetYBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetYBrick", "objClassName check");
});

QUnit.test("ChangeXBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeXBrick(device, sprite, { value: x });

    var brick = new PocketCode.ChangeXBrick(b, false);

    assert.ok(brick instanceof PocketCode.ChangeXBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeXBrick", "objClassName check");
});

QUnit.test("ChangeYBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeYBrick(device, sprite, { value: y });

    var brick = new PocketCode.ChangeYBrick(b, false);

    assert.ok(brick instanceof PocketCode.ChangeYBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeYBrick", "objClassName check");
});

QUnit.test("SetRotionStyleBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetRotionStyleBrick(device, sprite, { id: "id" });

    var brick = new PocketCode.SetRotionStyleBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetRotionStyleBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetRotionStyleBrick", "objClassName check");
});


QUnit.test("SetRotationSpeedBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var deg = JSON.parse('{"type":"NUMBER","value":"35","right":null,"left":null}');

    //clockwise
    var b = new PocketCode.Model.SetRotationSpeedBrick(device, sprite, { degreesPerSec: deg, ccw: false });

    var brick = new PocketCode.SetRotationSpeedBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetRotationSpeedBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetRotationSpeedBrick", "objClassName check");
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

    var brick = new PocketCode.GoToBrick(b, false);

    assert.ok(brick instanceof PocketCode.GoToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GoToBrick", "objClassName check");
});

QUnit.test("IfOnEdgeBounceBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.IfOnEdgeBounceBrick(device, sprite, { id: "id" });

    var brick = new PocketCode.IfOnEdgeBounceBrick(b, false);

    assert.ok(brick instanceof PocketCode.IfOnEdgeBounceBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "IfOnEdgeBounceBrick", "objClassName check");
});

QUnit.test("MoveNStepsBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var steps = JSON.parse('{"type":"NUMBER","value":"14","right":null,"left":null}');

    var b = new PocketCode.Model.MoveNStepsBrick(device, sprite, 24, { steps: steps });

    var brick = new PocketCode.MoveNStepsBrick(b, false);

    assert.ok(brick instanceof PocketCode.MoveNStepsBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "MoveNStepsBrick", "objClassName check");
});

QUnit.test("TurnLeftBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"45","right":null,"left":null}');

    var b = new PocketCode.Model.TurnLeftBrick(device, sprite, { degrees: degrees });

    var brick = new PocketCode.TurnLeftBrick(b, false);

    assert.ok(brick instanceof PocketCode.TurnLeftBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "TurnLeftBrick", "objClassName check");
});

QUnit.test("TurnRightBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"30","right":null,"left":null}');

    var b = new PocketCode.Model.TurnRightBrick(device, sprite, { degrees: degrees });

    var brick = new PocketCode.TurnRightBrick(b, false);

    assert.ok(brick instanceof PocketCode.TurnRightBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "TurnRightBrick", "objClassName check");
});

QUnit.test("SetDirectionBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"0","right":null,"left":null}');

    var b = new PocketCode.Model.SetDirectionBrick(device, sprite, { degrees: degrees });

    var brick = new PocketCode.SetDirectionBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetDirectionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetDirectionBrick", "objClassName check");
});

QUnit.test("SetDirectionToBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var spriteId = "spriteId";
    sprite._id = spriteId;
    scene._sprites.push(sprite);

    var b = new PocketCode.Model.SetDirectionToBrick(device, sprite, { spriteId: spriteId });

    var brick = new PocketCode.SetDirectionToBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetDirectionToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetDirectionToBrick", "objClassName check");
});

QUnit.test("GlideToBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._positionX = -10;
    sprite._positionY = -30;

    var x = JSON.parse('{"type":"NUMBER","value":"20","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"50","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');

    var b = new PocketCode.Model.GlideToBrick(device, sprite, { x: x, y: y, duration: duration });

    var brick = new PocketCode.GlideToBrick(b, false);

    assert.ok(brick instanceof PocketCode.GlideToBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GlideToBrick", "objClassName check");
});

QUnit.test("GoBackBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);
    var layers = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');

    var b = new PocketCode.Model.GoBackBrick(device, sprite, { layers: layers });

    var brick = new PocketCode.GoBackBrick(b, false);

    assert.ok(brick instanceof PocketCode.GoBackBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "GoBackBrick", "objClassName check");
});

QUnit.test("ComeToFrontBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);

    var b = new PocketCode.Model.ComeToFrontBrick(device, sprite, { commentedOut: false });

    var brick = new PocketCode.ComeToFrontBrick(b, false);

    assert.ok(brick instanceof PocketCode.ComeToFrontBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ComeToFrontBrick", "objClassName check");
});

QUnit.test("VibrationBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var duration = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.VibrationBrick(device, sprite, { duration: duration });

    var brick = new PocketCode.VibrationBrick(b, false);

    assert.ok(brick instanceof PocketCode.VibrationBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "VibrationBrick", "objClassName check");
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

    var brick = new PocketCode.SetPhysicsObjectTypeBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetPhysicsObjectTypeBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetPhysicsObjectTypeBrick", "objClassName check");
});

QUnit.test("SetVelocityBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetVelocityBrick(device, sprite, { x: x, y: y });

    var brick = new PocketCode.SetVelocityBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetVelocityBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetVelocityBrick", "objClassName check");
});

QUnit.test("RotationSpeedLeftBrick", function (assert) {

    assert.ok(false, "TODO");
});

QUnit.test("RotationSpeedRightBrick", function (assert) {

    assert.ok(false, "TODO");
});

QUnit.test("SetGravityBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"23","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"34","right":null,"left":null}');

    var b = new PocketCode.Model.SetGravityBrick(device, sprite, scene, { x: x, y: y });

    var brick = new PocketCode.SetGravityBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetGravityBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetGravityBrick", "objClassName check");
});

QUnit.test("SetMassBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });    //PhysicsSprite
    var mass = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetMassBrick(device, sprite, { value: mass });

    var brick = new PocketCode.SetMassBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetMassBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetMassBrick", "objClassName check");
});

QUnit.test("SetBounceFactorBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"71","right":null,"left":null}');

    var b = new PocketCode.Model.SetBounceFactorBrick(device, sprite, { percentage: percentage });

    var brick = new PocketCode.SetBounceFactorBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetBounceFactorBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetBounceFactorBrick", "objClassName check");
});

QUnit.test("SetFrictionBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var friction = JSON.parse('{"type":"NUMBER","value":"53","right":null,"left":null}');

    var b = new PocketCode.Model.SetFrictionBrick(device, sprite, { percentage: friction });

    var brick = new PocketCode.SetFrictionBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetFrictionBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetFrictionBrick", "objClassName check");
});