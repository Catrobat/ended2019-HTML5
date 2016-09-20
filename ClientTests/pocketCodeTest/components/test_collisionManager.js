/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/collisionManager.js" />
'use strict';

QUnit.module("components/collisionManager.js");


QUnit.test("checkSpriteEdgeCollision", function (assert) {

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
    assert.deepEqual(collision, {occurs: false, overflow: {}}, "simple check without collision: center");

    collision = cm.checkSpriteEdgeCollision(-5, 9, boundary);
    assert.deepEqual(collision, {occurs: false, overflow: {}}, "check without collision: top left");
    collision = cm.checkSpriteEdgeCollision(4, 9, boundary);
    assert.deepEqual(collision, {occurs: false, overflow: {}}, "check without collision: top right");
    collision = cm.checkSpriteEdgeCollision(-5, -10, boundary);
    assert.deepEqual(collision, {occurs: false, overflow: {}}, "check without collision: bottom left");
    collision = cm.checkSpriteEdgeCollision(4, -10, boundary);
    assert.deepEqual(collision, {occurs: false, overflow: {}}, "check without collision: bottom right");

    //without pixelAccuracy
    collision = cm.checkSpriteEdgeCollision(-5, 10, boundary);
    assert.deepEqual(collision, {occurs: true, overflow: {}}, "check with collision: top");
    collision = cm.checkSpriteEdgeCollision(5, 9, boundary);
    assert.deepEqual(collision, {occurs: true, overflow: {}}, "check with collision: right");
    collision = cm.checkSpriteEdgeCollision(-5, -11, boundary);
    assert.deepEqual(collision, {occurs: true, overflow: {}}, "check with collision: bottom");
    collision = cm.checkSpriteEdgeCollision(-6, -10, boundary);
    assert.deepEqual(collision, {occurs: true, overflow: {}}, "check with collision: left");

    //with pixelAccuracy
    boundary.pixelAccuracy = true;
    collision = cm.checkSpriteEdgeCollision(-6, 11, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: {top: 2, right: -10, bottom: -21, left: 1}
    }, "check with collision incl. pixelAccuracy: top left");
    collision = cm.checkSpriteEdgeCollision(5, 11, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: {top: 2, right: 1, bottom: -21, left: -10}
    }, "check with collision incl. pixelAccuracy: top right");
    collision = cm.checkSpriteEdgeCollision(-6, -12, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: {top: -21, right: -10, bottom: 2, left: 1}
    }, "check with collision incl. pixelAccuracy: bottom left");
    collision = cm.checkSpriteEdgeCollision(5, -12, boundary);
    assert.deepEqual(collision, {
        occurs: true,
        overflow: {top: -21, right: 1, bottom: 2, left: -10}
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
        overflow: {top: 1, right: 2, bottom: 3, left: 4}
    }, "check with collision incl. pixelAccuracy: all sides");
});

//------------------------------------------------------------------------------------------------------------------
QUnit.test("checkSpriteCollision: simple", function (assert) {

    var cm2 = new PocketCode.CollisionManager(10,20);

    var boundary1 = {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
    };
    var sprite1 = {
        visible: true,
        transparency: 100.0,
        positionX: 0,
        positionY: 0,
        currentLook: {
            getBoundary: function() {
                return boundary2;
            },
            canvas: document.createElement("canvas"),//.getContext('2d'),
        },
        renderingImage: {
            x: 0.0,
            y: 0.0,
            rotation: 0.0,
            scaling: 1.0,
            flipX: false,
        },
    };
    var boundary2 = {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
    };
    var sprite2 = {
        visible: true,
        transparency: 100.0,
        positionX: 0,
        positionY: 0,
        currentLook: {
            getBoundary: function() {
                return boundary2;
            },
            canvas: document.createElement("canvas"),//.getContext('2d'),
        },
        renderingImage: {
            x: 0.0,
            y: 0.0,
            rotation: 0.0,
            scaling: 1.0,
            flipX: false,
        },
    };

    var collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    //Visibility and Transparency Tests
    assert.deepEqual(collisionSprite, 3, "Both Sprites visible and not transparent - no collision");
    sprite1.visible = false;
    sprite2.visible = false;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 1, "Both Sprite invisible");
    sprite2.visible = true;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 1, "Sprite1 is invisible");
    sprite1.visible = true;
    sprite2.visible = false;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 1, "Sprite2 is invisible");
    sprite1.transparency = 0.0;
    sprite2.visible = true;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 1, "Sprite1 is transparent");
    sprite1.transparency = 10.0;
    sprite2.transparency = 0.0;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 1, "Sprite2 is transparent");
    sprite1.transparency = 0.0;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 1, "Both Sprites transparent");
    sprite1.transparency = 100.0;
    sprite2.transparency = 100.0;

    //CurrentLook Tests
    var sL1, sL2;
    assert.throws(function () { cm2.checkSpriteCollision(sL1, sL2); }, Error,"Sprites undefined");
    assert.throws(function () { cm2.checkSpriteCollision(sL1, sprite2); }, Error,"Sprite1 undefined");
    assert.throws(function () { cm2.checkSpriteCollision(sprite1, sL2); }, Error,"Sprite2 undefined");

    //Collision Tests
    sprite2.positionY = 3;
    boundary1 = {
        top: 5,
        right: 5,
        bottom: 1,
        left: 1,
        };
    boundary2 = {
        top: 2,
        right: 2,
        bottom: 1,
        left: 1,
    };
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 4, "Collision Top");
    sprite2.positionX = 3;
    sprite2.positionY = 0;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 4, "Collision Right");
    sprite2.positionX = 0;
    sprite2.positionY = -3;
    boundary2 = {
        top: 5,
        right: 5,
        bottom: 1,
        left:1
    };
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 4, "Collision Bottom");
    sprite2.positionX = -3;
    sprite2.positionY = 0;
    collisionSprite = cm2.checkSpriteCollision(sprite1, sprite2);
    assert.deepEqual(collisionSprite, 4, "Collision Left");

});

QUnit.test("checkSpriteCollision: complex", function (assert) {

    var done = assert.async();

    var cm3 = new PocketCode.CollisionManager(10, 20);
    //test only
    document.body.appendChild(cm3._canvas);

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

    var gameEngine = new PocketCode.GameEngine();
    //var canvas = document.createElement("canvas");

    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runTests));
    is.loadImages(baseUrl, images);

    function runTests() {
        assert.ok(true, "TEST");

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

        var sprite1 = new PocketCode.Model.Sprite(gameEngine, { id: "sp1", name: "myName" });
        sprite1._looks = [ l1, l2 ];
        sprite1._currentLook = l1;
        //sprite1.setDirection(45);
        sprite1.setSize(200);

        //sprite1._visible = true;
        //sprite1._transparency = 100.0;
        //gameEngine._sprites.push(sprite1);
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, { id: "sp2", name: "myName" });
        sprite2._looks = [ l1, l2 ];
        sprite2._currentLook = l1;
        //sprite2.setDirection(45);
        sprite2.setSize(200);

        //sprite2._visible = true;
        //sprite2._transparency = 100.0;
        //gameEngine._sprites.push(sprite2);

        var test = cm3.checkSpriteCollision(sprite1, sprite2);

        assert.deepEqual(test, 4, "Collision");
            done();
    }


});