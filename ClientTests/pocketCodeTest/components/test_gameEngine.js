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

    gameEngine = new PocketCode.GameEngine();
    assert.ok(gameEngine instanceof PocketCode.GameEngine, "instance check");

    assert.throws(function () { gameEngine._images = "invalid argument" }, Error, "ERROR: passed invalid arguments to images.");
    assert.throws(function () { gameEngine._sounds = "invalid argument" }, Error, "ERROR: passed invalid arguments to sounds.");
    assert.throws(function () { gameEngine._variables = "invalid argument" }, Error, "ERROR: passed invalid arguments to variables.");
    assert.throws(function () { gameEngine.broadcasts = "invalid argument" }, Error, "ERROR: passed invalid arguments to broadcasts.");
    assert.equal(gameEngine.setSpriteLayerBack("invalidId", 5), false, "ERROR: passed invalid object to setSpriteLayerBack.");
    assert.equal(gameEngine.setSpriteLayerToFront("invalidId"), false, "ERROR: passed invalid object to setSpriteLayerToFront.");
    assert.throws(function () { gameEngine.getSpriteById("invalidId") }, Error, "ERROR: passed invalid id to getSprite.");
    assert.throws(function () { gameEngine.getSpriteLayer("invalidId") }, Error, "ERROR: passed invalid object to getSpriteLayer.");

    var images = [{ id: "1" }, { id: "2" }, { id: "3" }];
    gameEngine._images = images;
    assert.ok(gameEngine.__images["1"] === images[0] && gameEngine.__images["2"] === images[1] && gameEngine.__images["3"] === images[2], "images set correctly");

    gameEngine._soundManager.init = function () {
        this.soundManagerInitCalled = true;
    };

    var sounds = [{ id: "id1", url: "src" }, { id: "id2", url: "src" }, { id: "id3", url: "src" }];
    gameEngine._sounds = sounds;
    assert.ok(gameEngine.__sounds["id1"] === sounds[0] && gameEngine.__sounds["id2"] === sounds[1] && gameEngine.__sounds["id3"] === sounds[2], "sounds set correctly");
    assert.ok(gameEngine._soundManager.soundManagerInitCalled, "Called SoundManagers init Function");

    var variables = [{ id: "1", name: "name1" }, { id: "2", name: "name2" }, { name: "name3", id: "3" }];
    gameEngine._variables = variables;
    assert.ok(gameEngine.__variables["1"] === variables[0] && gameEngine.__variables["2"] === variables[1] && gameEngine.__variables["3"] === variables[2], "variables set correctly");
    assert.ok(gameEngine._variableNames["1"].name === "name1" && gameEngine._variableNames["2"].name === "name2" && gameEngine._variableNames["3"].name === "name3", "varableNames set correctly");

    assert.deepEqual(gameEngine.getGlobalVariable("1"), variables[0], "Calling getNewVariable returned correct variable");
    assert.deepEqual(gameEngine.getGlobalVariableNames(), gameEngine._variableNames, "getGlobalVariableNames returns gameEngine._variableNames");
    assert.throws(function () { gameEngine.getGlobalVariable("invalid") }, Error, "ERROR: invalid argument used for getGlobalVariable");

    var broadcasts = [{ id: "1" }, { id: "2" }, { id: "3" }];
    assert.ok(typeof gameEngine._broadcastMgr.init == "function", "broadcast mgr interface check");
    gameEngine._broadcastMgr.init = function () {   //override to test: mock
        this.initCalled = true;
    };
    gameEngine.broadcasts = broadcasts;
    assert.ok(gameEngine._broadcastMgr.initCalled, "Called BroadcastManagers init function");
    assert.equal(gameEngine._broadcasts, broadcasts, "broadcasts set correctly");

    gameEngine.projectReady = true;
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Created gameEngine not started");
    assert.throws(function () { gameEngine.runProject() }, Error, "ERROR: Tried to start gameEngine without any sprites.");
    gameEngine.projectReady = false;
    assert.throws(function () { gameEngine.runProject() }, Error, "ERROR: Program not ready.");
    gameEngine.projectReady = true;

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
            }
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
    assert.ok(gameEngine.onExecuted instanceof SmartJs.Event.Event, "onExecuted accessor check");
    var onExecutedCalled = 0;
    var onExecutedHandler = function () {
        onExecutedCalled++;
    };
    var onExecListener = new SmartJs.Event.EventListener(onExecutedHandler, this);
    gameEngine.onExecuted.addEventListener(onExecListener);
    //simulate onExecuted dispatch
    gameEngine._spriteOnExecutedHandler();
    assert.equal(onExecutedCalled, 1, "onExecuted dispatched once");
    gameEngine.onExecuted.removeEventListener(onExecListener);

    //layers
    var layers = gameEngine.layerObjectList;
    assert.equal(layers[0], gameEngine._background, "Background in correct position in layer list.");
    var spriteOrderCorrect = true;
    for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
        if (gameEngine._sprites[i] !== layers[i + 1]) {
            spriteOrderCorrect = false;
        }
    }
    assert.ok(spriteOrderCorrect, "Sprites in correct position in layer list.");

    var programStartEvent = 0;
    gameEngine.onProgramStart.addEventListener(new SmartJs.Event.EventListener(function () {
        programStartEvent++;
    }));

    gameEngine._projectLoaded = true;  //simulate project loaded for tests
    gameEngine.runProject();
    assert.equal(programStartEvent, 1, "Called onProgramStart.");

    //var allSpritesStarted = true;
    //for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
    //    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.RUNNING) {
    //        allSpritesStarted = false;
    //    }
    //}
    //assert.ok(allSpritesStarted, "All sprites start methods called.");
    //assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.RUNNING, "Called backgrounds start method.");
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on start.");

    gameEngine.runProject();
    assert.equal(programStartEvent, 1, "Did not attempt to start running gameEngine.");

    gameEngine.pauseProject();
    var allSpritesPaused = true;
    for (var i = 0; i < gameEngine._sprites.length; i++) {
        if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.PAUSED) {
            allSpritesPaused = false;
        }
    }
    assert.ok(allSpritesPaused, "All sprites pause methods called.");
    //assert.equal(gameEngine._background.status, PocketCode.ExecutionState.PAUSED, "Called backgrounds pause method.");
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.PAUSED, "Set programs execution state to PAUSED on calling pause.");
    assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.PAUSED, "Called soundManagers pauseSounds function.");

    gameEngine.resumeProject();
    //allSpritesStarted = true;
    //for (var i = 0; i < gameEngine._sprites.length; i++) {
    //    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.RUNNING) {
    //        allSpritesStarted = false;
    //    }
    //}
    //assert.ok(allSpritesStarted, "All sprites running after resume.");
    //assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.RUNNING, "Called backgrounds resume method.");
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on calling resume.");
    assert.deepEqual(gameEngine._soundManager.status, PocketCode.ExecutionState.RUNNING, "Called soundManagers resumeSounds function.");

    gameEngine.stopProject();
    //var allSpritesStopped = true;
    //for (var i = 0; i < gameEngine._sprites.length; i++) {
    //    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.STOPPED) {
    //        allSpritesStopped = false;
    //    }
    //}
    //assert.ok(allSpritesStarted, "All sprites stopped.");
    //assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.STOPPED, "Called backgrounds stop method.");
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Set programs execution state to STOP on calling stop.");
    assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.STOPPED, "Called soundManagers stop function.");

    gameEngine.resumeProject();
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Did not resume stopped gameEngine.");

    gameEngine.pauseProject();
    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Did not attempt to pause stopped gameEngine.");

    var spritesStarted = gameEngine._sprites[0].timesStarted;
    var spritesStopped = gameEngine._sprites[0].timesStopped;
    var bgStarted = gameEngine._background.timesStarted;
    var bgStopped = gameEngine._background.timesStopped;

    gameEngine.restartProject();
    assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped && gameEngine._background.timesStopped === bgStopped, "do not call stop on already stopped: all sprites when restarting.");
    gameEngine.runProject();
    gameEngine.restartProject();
    assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped + 1 && gameEngine._background.timesStopped === bgStopped + 1, "Stopped all sprites when restarting.");
    //assert.ok(gameEngine._sprites[0].timesStarted === spritesStarted + 1 && gameEngine._background.timesStarted === bgStarted + 1, "Started all sprites when restarting.");
    assert.ok(gameEngine._soundManager.status === PocketCode.ExecutionState.STOPPED, "Called SoundManagers stopAllSounds when restarting gameEngine.");

    var sprite1 = new PocketCode.Model.Sprite(gameEngine, { id: "newId", name: "myName" });
    sprite1.id = "spriteId1";
    //sprite1.name = "spriteName1";
    gameEngine._sprites.push(sprite1);
    assert.equal(gameEngine.getSpriteById("spriteId1"), sprite1, "Correct sprite returned by getSprite.");

    var spriteChanges = 0;
    gameEngine._onSpriteChange.addEventListener(new SmartJs.Event.EventListener(function () {
        spriteChanges++;
        //TODO tests for event
    }));

    //var numberOfSprites = gameEngine._sprites.length;
    //var currentSpriteLayer = gameEngine.getSpriteLayer("spriteId1");    //avoid testing a method by using it -> this may cause wrong positive results
    var currentSpriteLayer = gameEngine._sprites.indexOf(sprite1) + gameEngine._backgroundOffset;
    assert.deepEqual(gameEngine.getSpriteLayer(sprite1), currentSpriteLayer, "Correct Sprite Layer returned by getSpriteLayer.");
    gameEngine.setSpriteLayerBack(sprite1, 2);
    assert.deepEqual(gameEngine.getSpriteLayer(sprite1), currentSpriteLayer - 2, "Set sprite layer two Layers back with setSpriteLayerBack.");

    assert.ok(gameEngine.setSpriteLayerBack(sprite1, 1), "Setting Sprite layer back returns true.");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event triggered every time layer got set back.");
    assert.ok(!gameEngine.setSpriteLayerBack(sprite1, 1), "Setting Sprite layer back returns false if Sprite is already on the bottom layer");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event did not trigger when attempting to set sprite a layer back that was already in last position.");

    spriteChanges = 0;

    assert.equal(gameEngine.setSpriteLayerToFront({ sprite: "invlaidSprite object" }), false, "layer: return fals if sprite not found");
    assert.ok(gameEngine.setSpriteLayerToFront(sprite1), "Bringing Layer to front returns true if layers are changed.");
    assert.ok(!gameEngine.setSpriteLayerToFront(sprite1), "Bringing Layer to front returns false if no layers are changed.");
    assert.deepEqual(spriteChanges, 1, "Sprite Change Event triggered once.");
    assert.deepEqual(gameEngine.getSpriteLayer(sprite1), gameEngine._sprites.length - 1 + gameEngine._backgroundOffset, "Brought Layer to front.");

    var spriteBeforeLast = gameEngine._sprites[1];
    //spriteBeforeLast.id = "uniqueId";
    gameEngine.setSpriteLayerBack(spriteBeforeLast, 2);
    assert.equal(gameEngine.getSpriteLayer(spriteBeforeLast), 1, "Sprite positioned at first layer if when trying to set back more layers than currently available.");

    var projectWithNoSounds = project1;
    gameEngine.loadProject(projectWithNoSounds);
    assert.ok(gameEngine._soundsLoaded, "SoundsLoaded set true if there are no sounds");

    var testProject = projectSounds;
    var loadingHandled = assert.async();

    gameEngine.loadProject(testProject);

    gameEngine._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(function (e) {
        if (e.progress !== 100) {
            assert.ok(!gameEngine._soundsLoaded && !gameEngine.projectReady, "Program not ready if sounds are not loaded");
            return;
        } else {
            assert.ok(gameEngine._soundsLoaded, "Set soundsLoaded to true when loading sounds is done");
            assert.ok(gameEngine.projectReady, "Program ready set to true after loading is done");
        }
        loadingHandled();

        var gameEngine2 = new PocketCode.GameEngine();
        //gameEngine2.loadProject(strProject14);

    }));

    assert.equal(gameEngine._background.id, testProject.background.id, "Correct Background set.");
    assert.equal(gameEngine._sprites.length, testProject.sprites.length, "No excess sprites left.");

    var spritesMatch = true;
    for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
        if (gameEngine._sprites[i].id !== testProject.sprites[i].id)
            spritesMatch = false;
    }
    assert.ok(spritesMatch, "Sprites created correctly.");

    var varsMatch = true;
    for (var i = 0, l = testProject.variables.length; i < l; i++) {
        if (gameEngine.__variables[testProject.variables[i].id] !== testProject.variables[i]) {
            varsMatch = false;
        }
    }
    assert.ok(varsMatch, "Variables set correctly.");

    var soundsMatch = true;
    for (var i = 0, l = testProject.sounds.length; i < l; i++) {
        if (gameEngine.__sounds[testProject.sounds[i].id] !== testProject.sounds[i]) {
            soundsMatch = false;
        }
    }
    assert.ok(soundsMatch, "Sounds set correctly.");

    var imagesMatch = true;
    for (var i = 0, l = testProject.images.length; i < l; i++) {
        if (gameEngine.__images[testProject.images[i].id] !== testProject.images[i]) {
            imagesMatch = false;
        }
    }
    assert.ok(imagesMatch, "Images set correctly.");

    //finish async tests if browser does not support sounds
    if (!gameEngine._soundManager.supported)
        loadingHandled();

});