/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/collisionManager.js" />
'use strict';

QUnit.module("components/collisionManager.js");


QUnit.test("checkSpriteEdgeCollision", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var cm = new PocketCode.CollisionManager(10, 20);

    assert.ok(cm._projectScreenWidth == 10 && cm._projectScreenHeight == 20, "ctr parameters set");
    assert.ok(cm instanceof PocketCode.CollisionManager && cm instanceof SmartJs.Core.Component, "instance check");
    assert.ok(cm.objClassName === "CollisionManager", "objClassName check");

    cm.dispose();
    assert.ok(cm._disposed, "disposed: inherited");

    //recreate
    cm = new PocketCode.CollisionManager(10, 20);

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
    assert.deepEqual(collision, {
        occurs: true,
        overflow: { top: 2, right: -10, bottom: -21, left: 1 }
    }, "check with collision incl. pixelAccuracy: top left");
    collision = cm.checkSpriteEdgeCollision(5, 11, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: { top: 2, right: 1, bottom: -21, left: -10 }
    }, "check with collision incl. pixelAccuracy: top right");
    collision = cm.checkSpriteEdgeCollision(-6, -12, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: { top: -21, right: -10, bottom: 2, left: 1 }
    }, "check with collision incl. pixelAccuracy: bottom left");
    collision = cm.checkSpriteEdgeCollision(5, -12, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: { top: -21, right: 1, bottom: 2, left: -10 }
    }, "check with collision incl. pixelAccuracy: bottom right");

    //all edges
    boundary = {
        top: 11,
        right: 7,
        bottom: -13,
        left: -9,
        pixelAccuracy: true,
    };
    collision = cm.checkSpriteEdgeCollision(0, 0, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: { top: 1, right: 2, bottom: 3, left: 4 }
    }, "check with collision incl. pixelAccuracy: all sides");
});


QUnit.test("checkSpriteCollision", function (assert) {

    var done = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);

    var cm = new PocketCode.CollisionManager(10, 20);
    //test only
    document.body.appendChild(cm._canvas);

    //init tests to start
    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper14.png", size: 1 },  //100% opaque red square
            { id: "s2", url: "imgHelper15.png", size: 1 }   //green square inside transparent area
        ];

    /*
    var imagesScaling = [
        { id: "s3", url: "imgHelper14.png", size: 1 },
        { id: "s4", url: "imgHelper15.png", size: 1 }];
    */

    //var canvas = document.createElement("canvas");

    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runTests));
    is.loadImages(baseUrl, images);

    function runTests() {

        //initializing looks
        var jsonLook1 = { id: "id1", resourceId: "s1", name: "lookName" };    //without rotationCenter
        var jsonLook2 = { id: "id2", resourceId: "s2", name: "lookName" };
        var l1 = new PocketCode.Model.Look(jsonLook1);
        //l1.init(gameEngine.getLookImage(l1.imageId));
        var l2 = new PocketCode.Model.Look(jsonLook2);
        //l2.init(gameEngine.getLookImage(l2.imageId));

        var img = is.getImage("s1");
        l1.init(img); //loading from image store directly instead of handling through GameEngine

        img = is.getImage("s2");
        l2.init(img); //loading from image store directly instead of handling through GameEngine

        var sprite1 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "sp1", name: "myName" });
        sprite1._looks = [l1, l2];
        sprite1._currentLook = l1;
        //sprite1.setDirection(45);
        sprite1.setSize(200);

        //sprite1._visible = true;
        //sprite1._transparency = 100.0;
        //gameEngine._sprites.push(sprite1);
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "sp2", name: "myName" });
        sprite2._looks = [l1, l2];
        sprite2._currentLook = l1;
        //sprite2.setDirection(45);
        sprite2.setSize(200);

        //sprite2._visible = true;
        //sprite2._transparency = 100.0;
        //gameEngine._sprites.push(sprite2);

        var sprite1Id, sprite2Id;
        cm._sprites[0] = sprite1;
        cm._sprites[1] = sprite2;
        sprite1Id = cm._sprites[0]._id;
        sprite2Id = cm._sprites[1]._id;

        var test = cm.checkSpriteCollision(sprite1Id, sprite2Id);

        assert.deepEqual(test, true, "Collision");

        //Visibility and Transparency Tests
        sprite1._visible = false;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, false, "Sprite1 invisible");
        sprite1._visible = true;
        sprite2._visible = false;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, false, "Sprite2 invisible");
        sprite1._visible = false;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, false, "Both Sprites invisible");

        sprite1._visible = true;
        sprite2._visible = true;
        sprite1._transparency = 100.0;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, false, "Sprite1 transparent");
        sprite1._transparency = 0.0;
        sprite2._transparency = 100.0;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, false, "Sprite2 transparent");
        sprite1._transparency = 100.0;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, false, "Both Sprites transparent");
        sprite1._transparency = 0.0;
        sprite2._transparency = 0.0;

        //CurrentLook Tests
        var sL1, sL2;
        assert.throws(function () { cm.checkSpriteCollision(sL1, sL2); }, Error, "Sprites undefined");
        assert.throws(function () { cm.checkSpriteCollision(sL1, sprite2Id); }, Error, "Sprite1 undefined");
        assert.throws(function () { cm.checkSpriteCollision(sprite1Id, sL2); }, Error, "Sprite2 undefined");

        //No Collision Test
        sprite1._positionX = 20;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, false, "Visible but no Collision");

        //Collision Right
        sprite1._positionX = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Right");

        //Collision Right Top
        sprite1._positionY = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Right Top");

        //Collision Right Bottom
        sprite1._positionY = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Right Bottom");

        sprite1._positionY = 0;

        //Collision Left
        sprite1._positionX = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Left");

        //Collision Left Top
        sprite1._positionY = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Left Top");

        //Collision Lef Bottom
        sprite1._positionY = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Left Bottom");

        sprite1._positionX = 0;
        sprite1._positionY = 0;

        //Collision Top
        sprite1._positionY = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Top");

        //Collision Bottom
        sprite1._positionY = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Bottom");

        //-----------------------------------------------------------
        //Sprite2 currentLook 2 Tests
        sprite1._positionX = 0;
        sprite1._positionY = 0;
        sprite2._currentLook = l2;
        sprite2.setSize(400);

        //Collision Right
        sprite1._positionX = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Right Look2");

        //Collision Right Top
        sprite1._positionY = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Right Top Look2");

        //Collision Right Bottom
        sprite1._positionY = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Right Bottom Look2");

        sprite1._positionY = 0;

        //Collision Left
        sprite1._positionX = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Left Look2");

        //Collision Left Top
        sprite1._positionY = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Left Top Look2");

        //Collision Lef Bottom
        sprite1._positionY = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Left Bottom Look2");

        sprite1._positionX = 0;
        sprite1._positionY = 0;

        //Collision Top
        sprite1._positionY = 5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Top Look2");

        //Collision Bottom
        sprite1._positionY = -5;
        test = cm.checkSpriteCollision(sprite1Id, sprite2Id);
        assert.deepEqual(test, true, "Collision Bottom Look2");

        done();
    }

});
