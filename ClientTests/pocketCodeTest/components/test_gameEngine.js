/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
'use strict';

QUnit.module("components/gameEngine.js");


QUnit.test("GameEngine", function (assert) {

    //dispose: testing dispose first should notify us on errors caused by disposing some core (prototype) properties or events
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    gameEngine.__currentScene = scene;

    assert.ok(gameEngine instanceof PocketCode.GameEngine && gameEngine instanceof SmartJs.Core.Component, "instance check");
    assert.ok(gameEngine.objClassName === "GameEngine", "objClassName check");

    gameEngine._executionState = PocketCode.ExecutionState.RUNNING; //should be stopped
    gameEngine.dispose();
    assert.equal(gameEngine.executionState, undefined, "gameEngine stopped during dispose- property deleted");
    assert.equal(gameEngine._disposed, true, "disposed completely");

    //dispose test: on finished
    var testDispose = function () {
        gameEngine.dispose();
        assert.ok(gameEngine._disposed, "disposed correctly");
        assert.ok(gameEngine.__images == undefined && gameEngine.__sounds == undefined && gameEngine.__variablesSimple == undefined && gameEngine.__variablesList == undefined && gameEngine._sprites == undefined, "dispose: resources disposed");
        //console.log("dispose handled");
        disposedHandled();
    };

    gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    gameEngine.__currentScene = scene;
    assert.ok(gameEngine instanceof PocketCode.GameEngine && gameEngine instanceof PocketCode.UserVariableHost && gameEngine instanceof SmartJs.Core.Component, "instance check");

    //assert.throws(function () { gameEngine._images = "invalid argument" }, Error, "ERROR: passed invalid arguments to images");
    assert.throws(function () { gameEngine._sounds = "invalid argument" }, Error, "ERROR: passed invalid arguments to sounds");
    assert.throws(function () { gameEngine._variables = "invalid argument" }, Error, "ERROR: passed invalid arguments to variables");
    //assert.throws(function () { gameEngine.broadcasts = "invalid argument" }, Error, "ERROR: passed invalid arguments to broadcasts");
    //TODO
    //assert.equal(gameEngine.setSpriteLayerBack("invalidId", 5), false, "ERROR: passed invalid object to setSpriteLayerBack");
    //assert.equal(gameEngine.setSpriteLayerToFront("invalidId"), false, "ERROR: passed invalid object to setSpriteLayerToFront");
    //assert.throws(function () { gameEngine.getSpriteById("invalidId") }, Error, "ERROR: passed invalid id to getSprite");
    //assert.throws(function () { gameEngine.getSpriteLayer("invalidId") }, Error, "ERROR: passed invalid object to getSpriteLayer");

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


    return;
    //TODO: most of the tests below should be moved and rewritten for scenes

    var broadcasts = [{ id: "1" }, { id: "2" }, { id: "3" }];
    assert.ok(typeof gameEngine._broadcastMgr.init == "function", "broadcast mgr interface check");
    gameEngine._broadcastMgr.init = function () {   //override to test: mock
        this.initCalled = true;
    };
    gameEngine.broadcasts = broadcasts;
    assert.ok(gameEngine._broadcastMgr.initCalled, "Called BroadcastManagers init function");
    assert.equal(gameEngine._broadcasts, broadcasts, "broadcasts set correctly");

    assert.equal(gameEngine._executionState, PocketCode.ExecutionState.INITIALIZED, "Created gameEngine: status initialized");
    gameEngine._resourcesLoaded = false;
    assert.throws(function () { gameEngine.runProject() }, Error, "ERROR: Program not ready");
    gameEngine._resourcesLoaded = true; //project loaded
    gameEngine._spritesLoaded = true;

    //Mock: first we test if our Mocked interface still exist- change to sprite otherwise will not affect our tests
    var spriteInterface = new PocketCode.Model.Sprite(gameEngine, scene, { id: "id", name: "name" });
    assert.ok(typeof spriteInterface.pauseScripts == "function" && typeof spriteInterface.resumeScripts == "function" && typeof spriteInterface.stopAllScripts == "function", "mock: valid sprite interface");

    //Mock GameEngine and SoundManagers start, pause, stop methods
    var TestSprite = (function () {
        TestSprite.extends(PocketCode.Model.Sprite, false);

        function TestSprite(program, scene, args) {
            PocketCode.Model.Sprite.call(this, program, scene, args);
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
            stopAllScripts: function () {
                this.status = PocketCode.ExecutionState.STOPPED;
                this.timesStopped++;
            },
            init: function () {
                return true;    //required to test stop/restart
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

    scene._background = new TestSprite(gameEngine, scene, { id: "mockId1", name: "spriteName1" });
    scene._sprites.push(new TestSprite(gameEngine, scene, { id: "mockId2", name: "spriteName2" }));
    scene._sprites.push(new TestSprite(gameEngine, scene, { id: "mockId3", name: "spriteName3" }));
    scene._sprites.push(new TestSprite(gameEngine, scene, { id: "mockId4", name: "spriteName4" }));


    for (i = 0, l = scene._sprites.length; i < l; i++) {
        scene._originalSpriteOrder.push(scene._sprites[i]);      //TODO: add tests for reinit -> make sure order is correct after stop()
    }

    //onExecutedEvent
    assert.ok(gameEngine.onProgramExecuted instanceof SmartJs.Event.Event, "onExecuted accessor check");
    var onExecutedCalled = 0;
    var onExecutedHandler = function () {
        onExecutedCalled++;
        assert.equal(onExecutedCalled, 1, "onExecuted dispatched once");    //this will throw an error as soon as there is a second call
    };
    var onExecListener = new SmartJs.Event.EventListener(onExecutedHandler, this);
    gameEngine.onProgramExecuted.addEventListener(onExecListener);
    //simulate onExecuted dispatch
    gameEngine._spriteOnExecutedHandler();
    //gameEngine.onProgramExecuted.removeEventListener(onExecListener); //keep the event handler attached

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

    gameEngine.stopProject();
    gameEngine.runProject();
    assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped && gameEngine._background.timesStopped === bgStopped, "do not call stop on already stopped: all sprites when restarting");
    gameEngine.runProject();
    gameEngine.stopProject();
    gameEngine.runProject();
    assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped + 1 && gameEngine._background.timesStopped === bgStopped + 1, "Stopped all sprites when restarting");
    //assert.ok(gameEngine._sprites[0].timesStarted === spritesStarted + 1 && gameEngine._background.timesStarted === bgStarted + 1, "Started all sprites when restarting");
    assert.ok(gameEngine._soundManager.status === PocketCode.ExecutionState.STOPPED, "Called SoundManagers stopAllSounds when restarting gameEngine");

    var sprite1 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "newId", name: "myName" });
    sprite1._id = "spriteId1";
    //sprite1.name = "spriteName1";
    gameEngine._sprites.push(sprite1);
    assert.equal(gameEngine.getSpriteById("spriteId1"), sprite1, "Correct sprite returned by getSprite");

    var spriteChanges = 0;
    gameEngine.onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(function () {
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
        //console.log("loading handled");
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

QUnit.test("GameEngine: variable UI updates", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    gameEngine.__currentScene = scene;
    assert.ok(gameEngine.onVariableUiChange instanceof SmartJs.Event.Event, "onVariableUiChange: event check");

    var variables = gameEngine.renderingTexts;
    assert.ok(variables instanceof Array && variables.length == 0, "empty variable array");

    gameEngine._variables = [{ id: "g1", name: "var1", }, { id: "g2", name: "var2", }, ];   //gloable

    var bg = new PocketCode.Model.Sprite(gameEngine, scene, { id: "newId", name: "bg" });
    bg._variables = [{ id: "id1", name: "var1", }, { id: "id2", name: "var2", }, ]; //background

    return;
    //TODO: most of the tests below should be moved and rewritten for scenes

    gameEngine._background = bg;
    var sp1 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "newId2", name: "sp1" });
    sp1._variables = [{ id: "id3", name: "var1", }, { id: "id4", name: "var2", }, ];    //sprite 1
    var sp2 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "newId3", name: "sp2" });
    sp2._variables = [{ id: "id5", name: "var1", }, { id: "id6", name: "var2", }, ];    //sprite 2

    gameEngine._sprites.push(sp1);
    gameEngine._sprites.push(sp2);

    variables = gameEngine.renderingTexts;

    assert.equal(variables.length, 8, "array length (number of variables)");

    //make sure we get all update events
    var updates = 0,
        lastArgs;
    var onUpdate = function (e) {
        updates++;
        lastArgs = e;
    };
    gameEngine.onVariableUiChange.addEventListener(new SmartJs.Event.EventListener(onUpdate, this));
    //global
    gameEngine.getVariable("g1").value = 1;
    assert.ok(lastArgs.id == "g1" && lastArgs.properties.text == 1);
    bg.getVariable("id1").value = 2;
    assert.ok(lastArgs.id == "id1" && lastArgs.properties.text == 2);
    bg.getVariable("g2").value = 3; //set global from sprite
    assert.ok(lastArgs.id == "g2" && lastArgs.properties.text == 3);

    sp1.getVariable("id3").value = 4;   
    assert.ok(lastArgs.id == "id3" && lastArgs.properties.text == 4);

    sp2.getVariable("id5").value = 5;
    assert.ok(lastArgs.id == "id5" && lastArgs.properties.text == 5);

    assert.equal(updates, 5, "all updates triggerd an event");

});