/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/collisionManager.js" />
'use strict';

QUnit.module("components/collisionManager.js");


QUnit.test("CollisionManager", function (assert) {
    
    var sprites = [];
    var cm = new PocketCode.CollisionManager(sprites, 10, 20);
    assert.ok(cm._projectScreenWidth == 10 && cm._projectScreenHeight == 20, "ctr parameters set");
    assert.ok(cm instanceof PocketCode.CollisionManager && cm instanceof SmartJs.Core.Component, "instance check");
    assert.ok(cm.objClassName === "CollisionManager", "objClassName check");

    cm.dispose();
    assert.ok(cm._disposed, "disposed: inherited");

    //recreate
    cm = new PocketCode.CollisionManager(sprites, 10, 20);

    //checkSpriteEdgeCollision
    var boundary = {
        top: 1,
        right: 1,
        bottom: 0,
        left: 0,
    };
    var collision = cm.checkSpriteEdgeCollision(0, 0, boundary);
    assert.deepEqual(collision, { occurs: false, overflow: {} }, "simple check without collision: center");

    collision = cm.checkSpriteEdgeCollision(-5, 9, boundary);
    assert.deepEqual(collision, { occurs: false, overflow: {} }, "check without collision: top left");
    collision = cm.checkSpriteEdgeCollision(4, 9, boundary);
    assert.deepEqual(collision, { occurs: false, overflow: {} }, "check without collision: top right");
    collision = cm.checkSpriteEdgeCollision(-5, -10, boundary);
    assert.deepEqual(collision, { occurs: false, overflow: {} }, "check without collision: bottom left");
    collision = cm.checkSpriteEdgeCollision(4, -10, boundary);
    assert.deepEqual(collision, { occurs: false, overflow: {} }, "check without collision: bottom right");

    //without pixelAccuracy
    collision = cm.checkSpriteEdgeCollision(-5, 10, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: {} }, "check with collision: top");
    collision = cm.checkSpriteEdgeCollision(5, 9, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: {} }, "check with collision: right");
    collision = cm.checkSpriteEdgeCollision(-5, -11, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: {} }, "check with collision: bottom");
    collision = cm.checkSpriteEdgeCollision(-6, -10, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: {} }, "check with collision: left");

    //with pixelAccuracy
    boundary.pixelAccuracy = true;
    collision = cm.checkSpriteEdgeCollision(-6, 11, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: { top: 2, right: -10, bottom: -21, left: 1 } }, "check with collision incl. pixelAccuracy: top left");
    collision = cm.checkSpriteEdgeCollision(5, 11, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: { top: 2, right: 1, bottom: -21, left: -10 } }, "check with collision incl. pixelAccuracy: top right");
    collision = cm.checkSpriteEdgeCollision(-6, -12, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: { top: -21, right: -10, bottom: 2, left: 1 } }, "check with collision incl. pixelAccuracy: bottom left");
    collision = cm.checkSpriteEdgeCollision(5, -12, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: { top: -21, right: 1, bottom: 2, left: -10 } }, "check with collision incl. pixelAccuracy: bottom right");

    //all edges
    boundary = {
        top: 11,
        right: 7,
        bottom: -13,
        left: -9,
        pixelAccuracy: true,
    };
    collision = cm.checkSpriteEdgeCollision(0, 0, boundary);
    assert.deepEqual(collision, { occurs: true, overflow: { top: 1, right: 2, bottom: 3, left: 4 } }, "check with collision incl. pixelAccuracy: all sides");

    assert.ok(false, "TODO");

});
