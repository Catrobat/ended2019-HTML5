/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
'use strict';

QUnit.module("gameEngine.js");


QUnit.test("GameEngine", function (assert) {

    //dispose: testing dispose first should notify us on errors caused by disposing some core (prototype) properties or events
    var gameEngine = new PocketCode.GameEngine();
    gameEngine._executionState = PocketCode.ExecutionState.RUNNING; //should be stopped
    gameEngine.dispose();
    assert.equal(gameEngine.executionState, undefined, "gameEngine stopped during dispose- property deleted");
    assert.equal(gameEngine._disposed, true, "disposed completely");

    //dispose test: on finished
    var testDispose = function () {
        gameEngine.dispose();
        assert.ok(gameEngine._disposed, "disposed correctly");
        assert.ok(gameEngine.__images == undefined && gameEngine.__sounds == undefined && gameEngine.__variablesSimple == undefined && gameEngine.__variablesList == undefined && gameEngine._sprites == undefined, "dispose: resources disposed");
        console.log("dispose handled");
        disposedHandled();
    };

    gameEngine = new PocketCode.GameEngine();
    assert.ok(gameEngine instanceof PocketCode.GameEngine && gameEngine instanceof PocketCode.UserVariableHost && gameEngine instanceof SmartJs.Core.Component, "instance check");

    //assert.throws(function () { gameEngine._images = "invalid argument" }, Error, "ERROR: passed invalid arguments to images");
    assert.throws(function () { gameEngine._sounds = "invalid argument" }, Error, "ERROR: passed invalid arguments to sounds");
    assert.throws(function () { gameEngine._variables = "invalid argument" }, Error, "ERROR: passed invalid arguments to variables");
    assert.throws(function () { gameEngine.broadcasts = "invalid argument" }, Error, "ERROR: passed invalid arguments to broadcasts");
    assert.equal(gameEngine.setSpriteLayerBack("invalidId", 5), false, "ERROR: passed invalid object to setSpriteLayerBack");
    assert.equal(gameEngine.setSpriteLayerToFront("invalidId"), false, "ERROR: passed invalid object to setSpriteLayerToFront");
    assert.throws(function () { gameEngine.getSpriteById("invalidId") }, Error, "ERROR: passed invalid id to getSprite");
    assert.throws(function () { gameEngine.getSpriteLayer("invalidId") }, Error, "ERROR: passed invalid object to getSpriteLayer");

    //TODO: retest images using new imageStore
    //var images = [{ id: "1" }, { id: "2" }, { id: "3" }];
    //gameEngine._images = images;
    //assert.ok(gameEngine.__images["1"] === images[0] && gameEngine.__images["2"] === images[1] && gameEngine.__images["3"] === images[2], "images set correctly");

    gameEngine._soundManager.init = function () {
        this.soundManagerInitCalled = true;
    };

    //TODO:
    //var sounds = [{ id: "id1", url: "src", size: 1 }, { id: "id2", url: "src", size: 2 }, { id: "id3", url: "src", size: 3 }];
    //gameEngine._sounds = sounds;
    //assert.ok(gameEngine.__sounds["id1"] === sounds[0] && gameEngine.__sounds["id2"] === sounds[1] && gameEngine.__sounds["id3"] === sounds[2], "sounds set correctly");
    //assert.ok(gameEngine._soundManager.soundManagerInitCalled, "Called SoundManagers init Function");

    //var variables = [{ id: "1", name: "name1" }, { id: "2", name: "name2" }, { name: "name3", id: "3" }];
    //gameEngine._variables = variables;
    //assert.ok(gameEngine.__variablesSimple._variables["1"]._id === variables[0]._id && gameEngine.__variablesSimple._variables["2"]._id === variables[1]._id && gameEngine.__variablesSimple._variables["3"]._id === variables[2]._id, "variables set correctly");
    //TODO: ^^ this tests should be moved to base class: UserVariableHost including tests for lists (we shouldn't use private vars for assets - that much - either)

    //var names = gameEngine.getAllVariables();
    //names = names.global;
    //assert.ok(names["1"].name === "name1" && names["2"].name === "name2" && names["3"].name === "name3", "varableNames set correctly");

    //assert.ok(gameEngine.getVariable("1").name === "name1", "Calling getNewVariable returned correct variable");
    //assert.deepEqual(gameEngine.getAllVariables(), gameEngine._variableNames, "getGlobalVariableNames returns gameEngine._variableNames");
    //assert.throws(function () { gameEngine.getGlobalVariable("invalid") }, Error, "ERROR: invalid argument used for getGlobalVariable");

    var broadcasts = [{ id: "1" }, { id: "2" }, { id: "3" }];
    assert.ok(typeof gameEngine._broadcastMgr.init == "function", "broadcast mgr interface check");
    gameEngine._broadcastMgr.init = function () {   //override to test: mock
        this.initCalled = true;
    };
    gameEngine.broadcasts = broadcasts;
    assert.ok(gameEngine._broadcastMgr.initCalled, "Called BroadcastManagers init function");
    assert.equal(gameEngine._broadcasts, broadcasts, "broadcasts set correctly");

    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Created gameEngine not started");
    gameEngine._resourcesLoaded = false;
    assert.throws(function () { gameEngine.runProject() }, Error, "ERROR: Program not ready");
    gameEngine._resourcesLoaded = true; //project loaded
    gameEngine._spritesLoaded = true;

    //Mock: first we test if our Mocked interface still exist- change to sprite otherwise will not affect our tests
    var spriteInterface = new PocketCode.Model.Sprite(gameEngine, { id: "id", name: "name" });
    assert.ok(typeof spriteInterface.pauseScripts == "function" && typeof spriteInterface.resumeScripts == "function" && typeof spriteInterface.stopScripts == "function", "mock: valid sprite interface");

    //Mock GameEngine and SoundManagers start, pause, stop methods
    var TestSprite = (function () {
        TestSprite.extends(PocketCode.Model.Sprite, false);

        function TestSprite(program, args) {
            PocketCode.Model.Sprite.call(this, program, args);
            this.status = PocketCode.ExecutionState.STOPPED;
            //this.MOCK = true;   //flag makes debugging much easier
            this.timesStopped = 0;
            this.timesStarted = 0;
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
            stopScripts: function () {
                this.status = PocketCode.ExecutionState.STOPPED;
                this.timesStopped++;
            },
        });

        return TestSprite;
    })();


    gameEngine._soundManager.pauseSounds = function () {
        this.status = PocketCode.ExecutionState.PAUSED;
    };

    gameEngine._soundManager.resumeSounds = function () {
        this.status = PocketCode.ExecutionState.RUNNING;
    };

    gameEngine._soundManager.timesStopped = 0;
    gameEngine._soundManager.stopAllSounds = function () {
        this.status = PocketCode.ExecutionState.STOPPED;
        this.timesStopped++;
    };

    gameEngine._background = new TestSprite(gameEngine, {id: "mockId1", name: "spriteName1"});
    gameEngine._sprites.push(new TestSprite(gameEngine, { id: "mockId2", name: "spriteName2" }));
    gameEngine._sprites.push(new TestSprite(gameEngine, { id: "mockId3", name: "spriteName3" }));
    gameEngine._sprites.push(new TestSprite(gameEngine, { id: "mockId4", name: "spriteName4" }));

    //onExecutedEvent
    assert.ok(gameEngine.onProgramExecuted instanceof SmartJs.Event.Event, "onExecuted accessor check");
    var onExecutedCalled = 0;
    var onExecutedHandler = function () {
        onExecutedCalled++;
    };
    var onExecListener = new SmartJs.Event.EventListener(onExecutedHandler, this);
    gameEngine.onProgramExecuted.addEventListener(onExecListener);
    //simulate onExecuted dispatch
    gameEngine._spriteOnExecutedHandler();
    assert.equal(onExecutedCalled, 1, "onExecuted dispatched once");
    gameEngine.onProgramExecuted.removeEventListener(onExecListener);

    //layers
    var layers = [gameEngine._background].concat(gameEngine._sprites);//layerObjectList;
    assert.equal(layers[0], gameEngine._background, "Background in correct position in layer list");
    var spriteOrderCorrect = true;
    for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
        if (gameEngine._sprites[i] !== layers[i + 1]) {
            spriteOrderCorrect = false;
        }
    }
    assert.ok(spriteOrderCorrect, "Sprites in correct position in layer list");

    var programStartEvent = 0;
    gameEngine.onProgramStart.addEventListener(new SmartJs.Event.EventListener(function () {
        programStartEvent++;
    }));

    //simulate project loaded for tests
    gameEngine._resourcesLoaded = true;
    gameEngine._spritesLoaded = true;

    gameEngine.runProject();
    assert.equal(programStartEvent, 1, "Called onProgramStart");

    //var allSpritesStarted = true;
    //for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
    //    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.RUNNING) {
    //        allSpritesStarted = false;
    //    }
    //}
    //assert.ok(allSpritesStarted, "All sprites start methods called");
    //assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.RUNNING, "Called backgrounds start method");
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on start");

    gameEngine.runProject();
    assert.equal(programStartEvent, 1, "Did not attempt to start running gameEngine");

    gameEngine.pauseProject();
    var allSpritesPaused = true;
    for (var i = 0; i < gameEngine._sprites.length; i++) {
        if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.PAUSED) {
            allSpritesPaused = false;
        }
    }
    assert.ok(allSpritesPaused, "All sprites pause methods called");
    //assert.equal(gameEngine._background.status, PocketCode.ExecutionState.PAUSED, "Called backgrounds pause method");
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.PAUSED, "Set programs execution state to PAUSED on calling pause");
    assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.PAUSED, "Called soundManagers pauseSounds function");

    gameEngine.resumeProject();
    //allSpritesStarted = true;
    //for (var i = 0; i < gameEngine._sprites.length; i++) {
    //    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.RUNNING) {
    //        allSpritesStarted = false;
    //    }
    //}
    //assert.ok(allSpritesStarted, "All sprites running after resume");
    //assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.RUNNING, "Called backgrounds resume method");
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on calling resume");
    assert.deepEqual(gameEngine._soundManager.status, PocketCode.ExecutionState.RUNNING, "Called soundManagers resumeSounds function");

    gameEngine.stopProject();
    //var allSpritesStopped = true;
    //for (var i = 0; i < gameEngine._sprites.length; i++) {
    //    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.STOPPED) {
    //        allSpritesStopped = false;
    //    }
    //}
    //assert.ok(allSpritesStarted, "All sprites stopped");
    //assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.STOPPED, "Called backgrounds stop method");
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Set programs execution state to STOP on calling stop");
    assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.STOPPED, "Called soundManagers stop function");

    gameEngine.resumeProject();
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Did not resume stopped gameEngine");

    gameEngine.pauseProject();
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Did not attempt to pause stopped gameEngine");

    var spritesStarted = gameEngine._sprites[0].timesStarted;
    var spritesStopped = gameEngine._sprites[0].timesStopped;
    var bgStarted = gameEngine._background.timesStarted;
    var bgStopped = gameEngine._background.timesStopped;

    gameEngine.restartProject();
    assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped && gameEngine._background.timesStopped === bgStopped, "do not call stop on already stopped: all sprites when restarting");
    gameEngine.runProject();
    gameEngine.restartProject();
    assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped + 1 && gameEngine._background.timesStopped === bgStopped + 1, "Stopped all sprites when restarting");
    //assert.ok(gameEngine._sprites[0].timesStarted === spritesStarted + 1 && gameEngine._background.timesStarted === bgStarted + 1, "Started all sprites when restarting");
    assert.ok(gameEngine._soundManager.status === PocketCode.ExecutionState.STOPPED, "Called SoundManagers stopAllSounds when restarting gameEngine");

    var sprite1 = new PocketCode.Model.Sprite(gameEngine, { id: "newId", name: "myName" });
    sprite1._id = "spriteId1";
    //sprite1.name = "spriteName1";
    gameEngine._sprites.push(sprite1);
    assert.equal(gameEngine.getSpriteById("spriteId1"), sprite1, "Correct sprite returned by getSprite");

    var spriteChanges = 0;
    gameEngine._onSpriteChange.addEventListener(new SmartJs.Event.EventListener(function () {
        spriteChanges++;
        //TODO tests for event
    }));

    //var numberOfSprites = gameEngine._sprites.length;
    //var currentSpriteLayer = gameEngine.getSpriteLayer("spriteId1");    //avoid testing a method by using it -> this may cause wrong positive results
    var currentSpriteLayer = gameEngine._sprites.indexOf(sprite1) + 1;
    assert.deepEqual(gameEngine.getSpriteLayer(sprite1), currentSpriteLayer, "Correct Sprite Layer returned by getSpriteLayer");
    gameEngine.setSpriteLayerBack(sprite1, 2);
    assert.deepEqual(gameEngine.getSpriteLayer(sprite1), currentSpriteLayer - 2, "Set sprite layer two Layers back with setSpriteLayerBack");

    assert.ok(gameEngine.setSpriteLayerBack(sprite1, 1), "Setting Sprite layer back returns true");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event triggered every time layer got set back");
    assert.ok(!gameEngine.setSpriteLayerBack(sprite1, 1), "Setting Sprite layer back returns false if Sprite is already on the bottom layer");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event did not trigger when attempting to set sprite a layer back that was already in last position");

    spriteChanges = 0;

    assert.equal(gameEngine.setSpriteLayerToFront({ sprite: "invalidSprite object" }), false, "layer: return false if sprite not found");
    assert.ok(gameEngine.setSpriteLayerToFront(sprite1), "Bringing Layer to front returns true if layers are changed");
    assert.ok(!gameEngine.setSpriteLayerToFront(sprite1), "Bringing Layer to front returns false if no layers are changed");
    assert.deepEqual(spriteChanges, 1, "Sprite Change Event triggered once");
    assert.deepEqual(gameEngine.getSpriteLayer(sprite1), gameEngine._sprites.length, "Brought Layer to front");

    var spriteBeforeLast = gameEngine._sprites[1];
    //spriteBeforeLast.id = "uniqueId";
    gameEngine.setSpriteLayerBack(spriteBeforeLast, 2);
    assert.equal(gameEngine.getSpriteLayer(spriteBeforeLast), 1, "Sprite positioned at first layer if when trying to set back more layers than currently available");


    //var testProject = strProject11; //has no sounds
    //var testProject = strProject719;

    //add resource path to url
    var testProject = JSON.parse(JSON.stringify( strProject719));
    testProject.resourceBaseUrl = "";
    for(i = 0, l = testProject.sounds.length; i< l; i++){
        testProject.sounds[i].url = "_resources/"+testProject.sounds[i].url;
    }

    for(i = 0, l = testProject.images.length; i< l; i++){
        testProject.images[i].url = "_resources/"+testProject.images[i].url;
    }



    var loadingHandled = assert.async();
    var disposedHandled = assert.async();

    //make sure sounds not already loaded
    gameEngine._soundManager = new PocketCode.SoundManager();
    //internal bindings have to be reattached to guarantee loading flags are set
    gameEngine._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(gameEngine._resourceLoadingErrorHandler, gameEngine));
    gameEngine._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(gameEngine._resourceProgressChangeHandler, gameEngine));
    gameEngine._soundManager.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(gameEngine._spriteOnExecutedHandler, gameEngine));
    //check if project has finished executing

    // todo finsish on loading error and/or timeout
    var calledNotReadyTestOnce = false;
    gameEngine.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(function (e) {
        if (e.progress !== 100) {
            if (!calledNotReadyTestOnce) {
                assert.ok(!gameEngine.projectLoaded, "Program not ready if loading not done");
                calledNotReadyTestOnce = true;
            }
            return;
        }
    }));
    gameEngine.onLoad.addEventListener(new SmartJs.Event.EventListener(function (e) {
        // assert.ok(gameEngine._soundsLoaded, "Set soundsLoaded to true when loading sounds is done");
        assert.ok(gameEngine.projectLoaded, "Program ready set to true after loading is done");
        console.log("loading handled");
        loadingHandled();

        window.setTimeout(function () { testDispose(); }, 20);  //make sure the test gameEngine doesn't get disposed before all tests were finished
        //testDispose();

        //var gameEngine2 = new PocketCode.GameEngine();
        //gameEngine2.loadProject(strProject14);
    }));


    //make sure the testProject contains loadable sounds
    gameEngine.loadProject(testProject);

    assert.equal(gameEngine._background._id, testProject.background.id, "Correct Background set");
    assert.equal(gameEngine._sprites.length, testProject.sprites.length, "No excess sprites left");

    var spritesMatch = true;
    for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
        if (gameEngine._sprites[i]._id !== testProject.sprites[i].id)
            spritesMatch = false;
    }
    assert.ok(spritesMatch, "Sprites created correctly");

    //var varsMatch = true;
    //for (var i = 0, l = testProject.variables.length; i < l; i++) {
    //    if (gameEngine.__variablesSimple._variables[testProject.variables[i]._id] !== testProject.variables[i]) {
    //        varsMatch = false;
    //    }
    //}
    //assert.ok(varsMatch, "Variables set correctly");

    //var soundsMatch = true;
    var soundMgr = gameEngine._soundManager;
    //for (var i = 0, l = testProject.sounds.length; i < l; i++) {
    //    if (soundMgr._registeredFiles[testProject.sounds[i].id] !== testProject.sounds[i]) {
    //		soundsMatch = false;
    //	}
    //}
    //assert.ok(soundsMatch, "Sounds set correctly");
    //assert.equal(soundMgr._registeredFiles.length, testProject.sounds.length, "sounds loaded: list length compare only");


    //TODO: test loading using new imageStore
    //var imagesMatch = true;
    //var imageObjectsCreatedCorrectly = true;
    //for (var i = 0, l = testProject.images.length; i < l; i++) {
    //    if (gameEngine.__images[testProject.images[i].id] !== testProject.images[i]) {
    //        imagesMatch = false;
    //    }
    //    //console.log();    -> there shouldn't be a log when pushed
    //    if(gameEngine.__images[testProject.images[i].id].size !== testProject.images[i].size || testProject.images[i].imageObject.getAttribute("src") !== gameEngine.__images[testProject.images[i].id].url){
    //        imageObjectsCreatedCorrectly = false;
    //    }
    //}
    //assert.ok(imagesMatch, "Images set correctly");
    //assert.ok(imageObjectsCreatedCorrectly === true, "All images have an imageObject with matching criteria");

    //finish async tests if browser does not support sounds
    //TODO: QUICK FIX:if (!gameEngine._soundManager.supported) {
        loadingHandled();
        //window.setTimeout(function () { testDispose(); }, 20);  //make sure the test gameEngine doesn't get sidposed before all tests were finished
        testDispose();
    //}

});

QUnit.test("GameEngine: ifOnEdgeBounce", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var /*newSpritePositionX, newSpritePositionY, newSpriteDirection,*/ newSpritePositionTriggerUpdate;
    var spriteMock = {
        id: "spriteId_test",
        direction: 90,
        rotationStyle: PocketCode.RotationStyle.DO_NOT_ROTATE, /*.ALL_AROUND,*/
        positionX: -10,
        positionY: -10,
        size: 100,
        setPosition: function (x, y, triggerUpdate) {
            spriteMock.positionX = x;
            spriteMock.positionY = y;
            newSpritePositionTriggerUpdate = triggerUpdate;
        },
        setDirection: function(dir) {
            spriteMock.direction = dir;
        },
        currentLook: {
            imageId: "i1",
        },
    };
    var ga = new PocketCode.GameEngine();
    ga._originalScreenHeight = 100;
    ga._originalScreenWidth = 50;
    var sh2 = ga._originalScreenHeight / 2,
        sw2 = ga._originalScreenWidth / 2;
    var is = new PocketCode.ImageStore();
    //inject image store to load test images directly
    ga._imageStore = is;

    //init tests
    var baseUrl = "_resources/images/",
    images = [
        { id: "i1", url: "imgHelper1.png", size: 1 },
        //{ id: "i2", url: "imgHelper2.png", size: 1 },
        //{ id: "i3", url: "imgHelper3.png", size: 1 },
        //{ id: "i4", url: "imgHelper4.png", size: 1 },
        //{ id: "i5", url: "imgHelper5.png", size: 1 },
        //{ id: "i6", url: "imgHelper6.png", size: 1 },
        //{ id: "i7", url: "imgHelper7.png", size: 1 },
        //{ id: "i8", url: "imgHelper8.png", size: 1 },
        { id: "i9", url: "imgHelper9.png", size: 1 },
        { id: "i10", url: "imgHelper10.png", size: 1 },
        { id: "i11", url: "imgHelper11.png", size: 1 },
    ];


    var onLoadCount = 0;
    var onLoadHandler = function (e) {
        onLoadCount++;

        startTest();
    };
    is.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler));
    is.loadImages(baseUrl, images, 0.5);

    var lastUpdateEventArgs;
    var onSpriteUpdate = function (e) {
        lastUpdateEventArgs = e;
    };
    ga.onSpriteChange.addEventListener(new SmartJs.Event.EventListener(onSpriteUpdate));

    var opReturn, boundary;//, overflow;

    var startTest = function () {

        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.ok(opReturn == false && lastUpdateEventArgs == undefined, "simple: no change");
        assert.equal(ga.ifSpriteOnEdgeBounce(), false, "no change if no sprite is passed to method");

        //simple movements in one direction
        //left
        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: left overflow");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY === undefined && lastUpdateEventArgs.id == "spriteId_test", "left overflow: event argument check");
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
        var overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.equal(overflowLeft, 0, "simple: left overflow: aligned after bounce");
        assert.equal(spriteMock.direction, 90, "left: direction not changed");
        assert.equal(spriteMock.positionY, 0, "left without direction change: y pos does not change");

        //directions
        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        spriteMock.direction = -170;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 170, "left: direction changed (-170 -> 170)");

        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        spriteMock.direction = -90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 90, "left: direction changed (180 turn around)");

        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        spriteMock.direction = -40;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 40, "left: direction changed (-40 -> 40)");

        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        spriteMock.direction = 0;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 0, "left: direction not changed (0 = sprite direction parallel to handled edge)");

        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        spriteMock.direction = 180;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 180, "left: direction not changed (180 = sprite direction parallel to handled edge)");


        //right
        spriteMock.positionX = 40;
        spriteMock.positionY = 0;
        spriteMock.direction = 90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: right overflow");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY === undefined && lastUpdateEventArgs.id == "spriteId_test", "right overflow: event argument check");
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
        var overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.equal(overflowRight, 0, "simple: right overflow: aligned after bounce");
        assert.equal(spriteMock.direction, -90, "right: direction changed");
        //directions
        spriteMock.positionX = 40;
        spriteMock.positionY = 0;
        spriteMock.direction = 10;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, -10, "right: direction changed (10 -> -10)");

        spriteMock.positionX = 40;
        spriteMock.positionY = 0;
        spriteMock.direction = 150;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, -150, "right: direction changed (150 -> -150)");

        spriteMock.positionX = 40;
        spriteMock.positionY = 0;
        spriteMock.direction = 0;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 0, "right: direction not changed (0)");
        assert.equal(spriteMock.positionY, 0, "right without direction change: y pos does not change");

        spriteMock.positionX = 40;
        spriteMock.positionY = 0;
        spriteMock.direction = 180;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 180, "right: direction not changed (180)");


        //top
        spriteMock.positionX = 0;
        spriteMock.positionY = 70;
        spriteMock.direction = 0;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: top overflow");
        assert.ok(lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.positionX === undefined && lastUpdateEventArgs.id == "spriteId_test", "top overflow: event argument check");
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
        var overflowTop = spriteMock.positionY + boundary.top - sh2;
        assert.equal(overflowTop, 0, "simple: top overflow: aligned after bounce");
        assert.equal(spriteMock.direction, 180, "top: direction changed");
        //directions
        spriteMock.positionX = 0;
        spriteMock.positionY = 70;
        spriteMock.direction = -90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, -90, "top: direction not changed (-90 = sprite direction parallel to handled edge)");
        assert.equal(spriteMock.positionX, 0, "top without direction change: x pos does not change");

        spriteMock.positionX = 0;
        spriteMock.positionY = 70;
        spriteMock.direction = 90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 90, "top: direction not changed (90 = sprite direction parallel to handled edge)");

        spriteMock.positionX = 0;
        spriteMock.positionY = 70;
        spriteMock.direction = -20;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, -160, "top: direction changed (-20 -> -160)");

        spriteMock.positionX = 0;
        spriteMock.positionY = 70;
        spriteMock.direction = 40;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 140, "top: direction changed (40 -> 140)");

        //bottom
        spriteMock.positionX = 0;
        spriteMock.positionY = -70;
        spriteMock.direction = 180;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: bottom overflow");
        assert.ok(lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.positionX === undefined && lastUpdateEventArgs.id == "spriteId_test", "bottom overflow: event argument check");
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
        var overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        assert.equal(overflowBottom, 0, "simple: bottom overflow: aligned after bounce");
        assert.equal(spriteMock.direction, 0, "bottom: direction changed");
        //directions
        spriteMock.positionX = 0;
        spriteMock.positionY = -70;
        spriteMock.direction = 90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 90, "bottom: direction not changed (90 = sprite direction parallel to handled edge)");
        assert.equal(spriteMock.positionX, 0, "bottom without direction change: x pos does not change");

        spriteMock.positionX = 0;
        spriteMock.positionY = -70;
        spriteMock.direction = -90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, -90, "bottom: direction not changed (-90 = sprite direction parallel to handled edge)");

        spriteMock.positionX = 0;
        spriteMock.positionY = -70;
        spriteMock.direction = 100;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, 80, "bottom: direction not changed (100 -> 80)");

        spriteMock.positionX = 0;
        spriteMock.positionY = -70;
        spriteMock.direction = -170;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(spriteMock.direction, -10, "bottom: direction not changed (-170 -> -10)");

        //including rotation
        spriteMock.rotationStyle = PocketCode.RotationStyle.ALL_AROUND;
        //left
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(lastUpdateEventArgs, undefined, "rotation: left but without overflow: no event triggered");

        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.equal(overflowLeft, 0, "rotation: left overflow: aligned after bounce");

        //right
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(lastUpdateEventArgs, undefined, "rotation: right but without overflow: no event triggered");

        spriteMock.positionX = 40;
        spriteMock.positionY = 0;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.equal(overflowRight, 0, "rotation: right overflow: aligned after bounce");

        //top
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(lastUpdateEventArgs, undefined, "rotation: top but without overflow: no event triggered");

        spriteMock.positionX = 0;
        spriteMock.positionY = 70;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        assert.equal(overflowTop, 0, "rotation: top overflow: aligned after bounce");

        //bottom
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        assert.equal(lastUpdateEventArgs, undefined, "rotation: bottom but without overflow: no event triggered");

        spriteMock.positionX = 0;
        spriteMock.positionY = -70;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        assert.equal(overflowBottom, 0, "rotation: bottom overflow: aligned after bounce");

        //overflow on two sides without conflicts (look size > viewport size)
        //top right: one edge in direction
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 40;
        spriteMock.positionY = 70;
        spriteMock.direction = -5;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowTop == 0 && overflowRight == 0, "top/right: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "top/right: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, -175, "top/right: direction after bounce");
        //top right: both edges in direction
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 40;
        spriteMock.positionY = 70;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowTop == 0 && overflowRight == 0, "top/right: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "top/right: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, -135, "top/right: direction after bounce");


        //top left: one edge in direction
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = -40;
        spriteMock.positionY = 70;
        spriteMock.direction = 15;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowTop == 0 && overflowLeft == 0, "top/left: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "top/left: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, 165, "top/left: direction after bounce");
        //top left: both edges in direction
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = -40;
        spriteMock.positionY = 70;
        spriteMock.direction = -5;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowTop == 0 && overflowLeft == 0, "top/left: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "top/left: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, 175, "top/left: direction after bounce");

        //bottom right: one edge in direction
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 40;
        spriteMock.positionY = -70;
        spriteMock.direction = 5;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowBottom == 0 && overflowRight == 0, "bottom/right: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "bottom/right: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, -5, "bottom/right: direction after bounce");
        //bottom right: both edges in direction
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 40;
        spriteMock.positionY = -70;
        spriteMock.direction = 105;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowBottom == 0 && overflowRight == 0, "bottom/right: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "bottom/right: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, -75, "bottom/right: direction after bounce");

        //bottom left
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = -40;
        spriteMock.positionY = -70;
        spriteMock.direction = -95;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowBottom == 0 && overflowLeft == 0, "bottom/left: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "bottom/left: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, 85, "bottom/left: direction after bounce");

        //flipX
        spriteMock.rotationStyle = PocketCode.RotationStyle.LEFT_TO_RIGHT;
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 40;
        spriteMock.positionY = -70;
        spriteMock.direction = 105;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, true, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowBottom == 0 && overflowRight == 0, "flipX: bottom/right: 2 sides + rotation: aligned after bounce");
        assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.direction !== undefined, "flipX: bottom/right: 2 sides + rotation: event args check");
        assert.equal(spriteMock.direction, -75, "flipX: bottom/right: direction after bounce");

        
        complexTests();
        done1();
    };

    var complexTests = function () {
        //complex cases: overflow on opposite edges (before/after rotate)

        spriteMock.currentLook = {
            imageId: "i9",
        };
        spriteMock.rotationStyle = PocketCode.RotationStyle.ALL_AROUND;

        //overflow on all sides: the sprite should bounce from the top/right corner(direction = 90)
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = 90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i9", 1, spriteMock.direction - 90, false, true);
        var overflowTop = spriteMock.positionY + boundary.top - sh2;
        var overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowTop == 0 && overflowRight == 0, "complex: bounce from top/right");

        //overflow on all sides: the sprite should bounce from the bottom/right corner (direction = 100)
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = 100;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i9", 1, spriteMock.direction - 90, false, true);
        var overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowBottom == 0 && overflowRight == 0, "complex: bounce from bottom/right");

        //overflow on all sides: the sprite should bounce from the top/left corner(direction = -90)
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = -90;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i9", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        var overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowTop == 0 && overflowLeft == 0, "complex: bounce from top/left");

        //overflow on all sides: the sprite should bounce from the bottom/left corner (direction = -100)
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 0;
        spriteMock.direction = -100;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i9", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowBottom == 0 && overflowLeft == 0, "complex: bounce from bottom/left");

        //overflow on three sides
        spriteMock.currentLook = {
            imageId: "i10",
        };
        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = 100;
        spriteMock.direction = 0;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i10", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowTop == 0 && overflowRight == 0, "complex (3 sides): bounce from top/right");

        lastUpdateEventArgs = undefined;
        spriteMock.positionX = 0;
        spriteMock.positionY = -100;
        spriteMock.direction = 0;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i10", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowBottom == 0 && overflowRight == 0, "complex (3 sides): bounce from bottom/right");

        //take care of overflows that occur during bounce
        spriteMock.positionX = -100;
        spriteMock.positionY = 0;
        spriteMock.direction = -105;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i10", 1, spriteMock.direction - 90, false, true);
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowLeft == 0, "complex (overflow during bounce): left");

        //test on top/bottom: landscape
        ga._originalScreenHeight = 50;
        ga._originalScreenWidth = 100;
        sh2 = ga._originalScreenHeight / 2,
        sw2 = ga._originalScreenWidth / 2;
        //spriteMock.size = 200;

        spriteMock.positionX = 100;
        spriteMock.positionY = 0;
        spriteMock.direction = 80;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i10", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        //overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowTop == 0 && overflowRight == 0, "complex: overflow during bounce (after rotate) from top/bottom");

        //imagge11: diagonal
        spriteMock.currentLook = {
            imageId: "i11",
        };
        ga._originalScreenHeight = 50;
        ga._originalScreenWidth = 50;
        sh2 = ga._originalScreenHeight / 2,
        sw2 = ga._originalScreenWidth / 2;
        //top
        spriteMock.positionX = 0;
        spriteMock.positionY = 40;
        spriteMock.direction = 45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i11", 1, spriteMock.direction - 90, false, true);
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        assert.ok(overflowTop == 0 && overflowRight == 0, "complex: overflow during bounce (after rotate) from left/right: 45");
        //bottom
        spriteMock.positionX = 0;
        spriteMock.positionY = -40;
        spriteMock.direction = -135;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i11", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowBottom == 0 && overflowLeft == 0, "complex: overflow during bounce (after rotate) from left/right: -135");
        //right
        spriteMock.positionX = 40;
        spriteMock.positionY = 0;
        spriteMock.direction = 135;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i11", 1, spriteMock.direction - 90, false, true);
        overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        //overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowRight = spriteMock.positionX + boundary.right - sw2;
        //overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowBottom == 0 && overflowRight == 0, "complex: overflow during bounce (after rotate) from top/bottom: 135");
        //left
        spriteMock.positionX = -40;
        spriteMock.positionY = 0;
        spriteMock.direction = -45;
        opReturn = ga.ifSpriteOnEdgeBounce(spriteMock);
        boundary = is.getLookBoundary("spriteId_test", "i11", 1, spriteMock.direction - 90, false, true);
        //overflowBottom = -spriteMock.positionY - boundary.bottom - sh2;
        overflowTop = spriteMock.positionY + boundary.top - sh2;
        overflowLeft = -spriteMock.positionX - boundary.left - sw2;
        assert.ok(overflowTop == 0 && overflowLeft == 0, "complex: overflow during bounce (after rotate) from top/bottom: -135");


        done2();
    };

});
