/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/scene.js" />
'use strict';

QUnit.module("model/scene.js");


QUnit.test("Scene", function (assert) {
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    assert.ok(scene instanceof PocketCode.Model.Scene && scene instanceof SmartJs.Core.Component, "instance check");
    assert.ok(scene.objClassName === "Scene", "objClassName check");

    assert.equal(scene._executionState, PocketCode.ExecutionState.INITIALIZED, "Created scene: status initialized");

    //init tests todo
    //var gameEngine = "gameEngine";
    var projectTimer = {
        started: 0,
        start: function () {
            this.started++;
        }
    };
    //scene.init(gameEngine, projectTimer);


    var sceneStarted = 0;
    scene.onStart.addEventListener(new SmartJs.Event.EventListener(function() { sceneStarted++; }, this));

    scene._background = "background";
    scene.start();
    assert.equal(sceneStarted, 1, "scene started triggers start event");


    //test cloneSprite
    var scene2 = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var device = "device";

    var is = new PocketCode.ImageStore();   //recreate
    gameEngine._imageStore = is;

    //init tests
    var baseUrl = "_resources/images/",
        images = [
            { id: "s4", url: "imgHelper15.png", size: 2 },
            { id: "s5", url: "imgHelper16.png", size: 2 },
        ];

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(startTest));
    is.loadImages(baseUrl, images);

    var clone, sprite;
    function startTest() {
        scene2.load(cloneScene); //global ressource defined in _resources/testDataProject
        scene2.initializeSprites();  //images already loaded- initilaze look objects
        sprite = scene2._sprites[0];
        scene2.start();
        setTimeout(validate, 10);
    }

    function validate() {
        clone = scene2._sprites[0];
        assert.ok(clone instanceof PocketCode.Model.SpriteClone, "clone create successful");

        var b = new PocketCode.Model.WhenStartAsCloneBrick("device", clone, {id: "spriteId"});

        var handlerCalled = 0;

        function handler(e) {
            handlerCalled++;
            assert.equal(handlerCalled, 1, "dispatchEvent onCloneStart");
            runTest2();
        }

        b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler));
        clone.onCloneStart.dispatchEvent();

        function runTest2() {
            b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler));

            handlerCalled = 0;
             function handler2(e) {
             handlerCalled++;
             assert.equal(handlerCalled, 1, "dispatchEvent _onUiChange");
             runTest3();
             }

             //b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler2));
             //scene2.onChange.dispatchEvent();
         }

        function runTest3() {
            b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler2));
        }
    }



    assert.ok(false, "TODO");
});