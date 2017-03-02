/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/scene.js" />
'use strict';

QUnit.module("model/scene.js");

var TestSprite = (function () {
    TestSprite.extends(PocketCode.Model.Sprite, false);

    function TestSprite(program, scene, args) {
        PocketCode.Model.Sprite.call(this, program, scene, args);
        this.status = PocketCode.ExecutionState.STOPPED;
        //this.MOCK = true;   //flag makes debugging much easier
        this.initCalled = 0;
        this.initLooksCalled = 0;
        this.setLookCounter =0;
        this.subscribeOnLookChangeCounter =0;
        this.unsubscribeFroLookChangeCounter =0;
        this.setPositionCounter=0;
    }

    TestSprite.prototype.merge({
        //execute: function () {
        //    this.status = PocketCode.ExecutionState.RUNNING;
        //    this.timesStarted++;
        //},
        pauseScripts: function () {
            this.status = PocketCode.ExecutionState.PAUSED;
        },
        resumeScripts: function () {
            this.status = PocketCode.ExecutionState.RUNNING;
        },
        stopAllScripts: function () {
            this.status = PocketCode.ExecutionState.STOPPED;
        },
        init: function () {
            this.initCalled++;
            return true;    //required to test stop/restart
        },
        initLooks: function() {
            this.initLooksCalled++;
            return true;
        },

        setLook: function() {
            this.setLookCounter++;
        },

        subscribeOnLookChange: function() {
            this.subscribeOnLookChangeCounter++;
        },

        unsubscribeFromLookChange: function() {
            this.unsubscribeFroLookChangeCounter++;
        },
        setPosition: function(){
            this.setPositionCounter ++;
        }
    });



    return TestSprite;
})();
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

        // testing scene load
        scene2.load(cloneScene); //global ressource defined in _resources/testDataProject

        assert.equal(scene2.id, cloneScene.id, "id is set correctly");
        assert.equal(scene2.screenSize.height, cloneScene.screenHeight, "height is set correctly");
        assert.equal(scene2.screenSize.width, cloneScene.screenWidth, "width is set correctly");
        assert.equal(scene2.name, cloneScene.name , " name is set correctly" );
        assert.equal(scene2._sprites.length, cloneScene.sprites.length, "correct number of sprites");

        for (var i=0; i< scene2._sprites.length; i++){
            assert.notEqual(scene2._sprites[i], null, "sprite is not null");
        }
        assert.notEqual(scene2._background, undefined, "background is defined");
        assert.deepEqual(scene2._sprites, scene2._originalSpriteOrder, "original sprite order is preserved");

        var spriteInitCounter =0;
        var spriteInitLooksCounter =0;
        var backgroundInitCounter =0;
        var backgroundInitLooksCounter =0;

        // mocking sprites
        scene2._sprites = scene2._sprites.map(function(sprite, ind){
            var testSprite = new TestSprite(gameEngine, scene2, cloneScene.sprites[ind]);
            return testSprite;
        });
        scene2._background = new TestSprite(gameEngine, scene2, cloneScene.background);

        scene2._soundManager = {
            resumeSounds: function(id){
                assert.equal(true, true, "resume sounds called");
            },
            pauseSounds: function(id){
                assert.equal(true, true, "pause sounds called");
            }
        }



        // testing sprite initialization
        scene2.initializeSprites();  //images already loaded- initilaze look objects

        for (var i=0; i< scene2._sprites.length; i++){
            spriteInitCounter += scene2._sprites[i].initCalled;
            spriteInitLooksCounter += scene2._sprites[i].initLooksCalled;
        }

        assert.equal(spriteInitCounter, scene2._sprites.length, " init has to be called for every scene");
        assert.equal(spriteInitLooksCounter, scene2._sprites.length, "initLooks() called for every sprite");
        assert.equal(scene2._background.initCalled, 1 , "background init() has been called");
        assert.equal(scene2._background.initLooksCalled, 1, "background initLooks() has been called");

        var onStartDispatched = false;
        function onStart(e){
            onStartDispatched = true;

        }

        scene2._onStart.addEventListener(new SmartJs.Event.EventListener(onStart));
        var result = scene2.start();
        assert.equal(onStartDispatched, true, "onStart event dispatched");
        assert.equal(result, true, "start() should return true if not already running");
        var results = scene2.start();
        assert.equal(result, true, "start() returned false because scene was already running");


        // pause and resume
        scene2.pause(true);
        assert.equal(scene2._executionState , PocketCode.ExecutionState.PAUSED_USERINTERACTION, " paused for user interaction");
        var allScriptsPaused =true;
        for ( var i=0; i< scene2._sprites.length; i++){
            if(scene2._sprites[i].status != PocketCode.ExecutionState.PAUSED){
                allScriptsPaused = false;
            }
        }
        assert.equal(allScriptsPaused, true, "all scripts are paused");
        assert.equal(scene2._background.status, PocketCode.ExecutionState.PAUSED, "background scripts are paused");
        scene2.resume(true);

        var allScriptsResumed =0;
        for ( var i=0; i< scene2._sprites.length; i++){
            if(scene2._sprites[i].status != PocketCode.ExecutionState.RUNNING){
                allScriptsResumed = false;
            }
        }
        assert.equal(scene2._executionState, PocketCode.ExecutionState.RUNNING, " scene resumed");
        assert.equal(allScriptsResumed, true, "all scripts are resumed");
        scene2.pause(false);

        assert.equal(scene2._executionState, PocketCode.ExecutionState.PAUSED, " scene paused ");


        function spriteTapped(e){
            assert.equal(true, true, "sprite tapped dispatched");
            assert.deepEqual(e.sprite, scene2._sprites[0], "correct sprite passed in on sprite clicked");
        }

        function spriteTouchStarted(e){
            assert.equal(true, true, "sprite touch event dispatched");
        }
        // handle user action
        scene2._device = {
            updateTouchEvent: function(){
                assert.equal(true, true, "updateTouchEvent in device called!");
            }
        }
        scene2._onSpriteTappedAction.addEventListener(new SmartJs.Event.EventListener(spriteTapped));
        scene2._onTouchStartAction.addEventListener(new SmartJs.Event.EventListener(spriteTouchStarted));
        scene2.handleUserAction({ action: PocketCode.UserActionType.SPRITE_CLICKED, targetId: scene2._sprites[0].id});
        scene2.handleUserAction({ action: PocketCode.UserActionType.TOUCH_START, targetId: scene2._sprites[0].id});

        // getSpriteById

        var sprite = scene2.getSpriteById(scene2._sprites[0].id);
        assert.deepEqual(sprite, scene2._sprites[0], " getSpriteById returns correct sprite");
        var backgroundSprite = scene2.getSpriteById(scene2._background.id);
        assert.deepEqual(backgroundSprite, scene2._background, "background correctly returned");


        // getSpriteByName
        sprite = scene2.getSpriteByName(scene2._sprites[0].name);
        assert.equal(sprite.id, scene2._sprites[0].id, " correct sprite returned by getSpriteByName");
        backgroundSprite = scene2.getSpriteByName(scene2._background.name);
        assert.deepEqual(backgroundSprite  , scene2._background  , "correct background by getSpriteByName");


        // setBackground
        function setBackgroundCallback() {
            assert.equal(true, true , " setBackground callback has been called");
        }
        var backgroundTmp = scene2._background;
        scene2._background = null;
        scene2.setBackground(1,setBackgroundCallback );
        scene2._background = backgroundTmp;
        scene2.setBackground(1, setBackgroundCallback );
        assert.equal(scene2._background.setLookCounter,1, "background setLook called");

        // subscribeToBackgroundChange
        scene2.subscribeToBackgroundChange(1, function(){});
        assert.equal(scene2._background.subscribeOnLookChangeCounter, 1, " subscribeToBackgroundChange: subscribeOnLookChange called");

        // unsubscribeToBackgroundChange
        scene2.unsubscribeFromBackgroundChange(1, function(){});
        assert.equal(scene2._background.unsubscribeFroLookChangeCounter, 1, "unsubscribeFromBackgroundChange:  unsubscribeFromLookChange called!");


        // getSpriteLayer
        var layer = scene2.getSpriteLayer(scene2._sprites[0]);
        assert.equal(layer, 1, "correct sprite layer returned");
        var backgroundLayer = scene2.getSpriteLayer(scene2._background);
        assert.equal(backgroundLayer, 0, "correct backgroundLayer returned");

        // setSpriteLayerBack
        var testSpriteJson = JSON.parse(JSON.stringify(cloneScene.sprites[0]));
        testSpriteJson.id = "s7";
        var testSprite = new TestSprite(gameEngine, scene2, testSpriteJson);
        scene2._sprites.push(testSprite);
        var oldLayer = scene2.getSpriteLayer(testSprite);

        function setLayerBackUIChange(){
            assert.equal(true, true, "setLayerBack triggered spriteUIChange");
        }
        scene2._onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(setLayerBackUIChange));
        scene2.setSpriteLayerBack(testSprite, 1);
        scene2._onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(setLayerBackUIChange));
        var newLayer = scene2.getSpriteLayer(testSprite);
        assert.equal(newLayer, oldLayer-1, "setSpriteLayerBack works correctly");
        oldLayer = scene2.getSpriteLayer(testSprite);

        function setLayerFrontUIChange(){
            assert.equal(true, true, "setSpriteLayerToFront triggered onSpriteUIChange");
        }

        scene2._onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(setLayerFrontUIChange));
        scene2.setSpriteLayerToFront(testSprite,1 );
        newLayer = scene2.getSpriteLayer(testSprite);
        scene2._onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(setLayerFrontUIChange));
        assert.equal(newLayer, oldLayer+1,"setSpriteLayerToFront works correctly");

        // setSpritePosition

        scene2.setSpritePosition(testSprite.id, PocketCode.Model.GoToType.RANDOM, null);
        assert.equal(testSprite.setPositionCounter,1, "setSpritePosition:set position called on RANDOM");
        scene2.setSpritePosition(testSprite.id, PocketCode.Model.GoToType.SPRITE, scene2._sprites[0].id);
        assert.equal(testSprite.setPositionCounter, 2, "setSpritePosition: setPosition called on SPRITE");
        scene2._device = {
            getLatestActiveTouchPosition: function(){
                return { x: 0.1, y : 0.2 };
            }
        };
        scene2.setSpritePosition(testSprite.id , PocketCode.Model.GoToType.POINTER, null);
        assert.equal(testSprite.setPositionCounter, 3, "setSpritePosition: setPosition called on POINTER");
        scene2.setSpritePosition(testSprite.id, 6, null);
        assert.equal(testSprite.setPositionCounter, 3 , "setSpritePosition : setPosition not called with wrong type");

        // showAskDialog
        function showAskDialogEvent(e){
            assert.equal(e.properties.showAskDialog, true, "showAskDialog event dispatched with correct properties");
            assert.equal(e.properties.question, "How are you?", "showAskDialog event dispatched with correct question");
        }
        scene2._onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(showAskDialogEvent));
        scene2.showAskDialog("How are you?", function(){});
        scene2._onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(showAskDialogEvent));

        //clearPenStampBackground
        function clearPenStampEvent(e){
            assert.equal(e.properties.clearBackground, true, "clear penStamp event dispatched with correct parameters")
        }
        scene2._onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(clearPenStampEvent));
        scene2.clearPenStampBackground();

        //setGravity

        scene2._physicsWorld = {
            setGravity: function(x, y){
                assert.equal(true, true, "Set gravity called in physicsWorld");
            }
        };

        scene2.setGravity(2, 2);

















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
});
