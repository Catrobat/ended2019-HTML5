/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="E:/Programmieren/Test/817.catrobat" />
'use strict';

QUnit.module("components/gameEngine.js");


QUnit.test("GameEngine", function (assert) {

    //dispose: testing dispose first should notify us on errors caused by disposing some core (prototype) properties or events
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    gameEngine.__currentScene = scene;

    assert.ok(gameEngine instanceof PocketCode.GameEngine && gameEngine instanceof SmartJs.Core.Component, "instance check");
    assert.ok(gameEngine.objClassName === "GameEngine", "objClassName check");

    gameEngine.dispose();
    assert.equal(gameEngine._disposed, true, "disposed completely");

    //dispose test: on finished
    var testDispose = function () {
        gameEngine.dispose();
        assert.ok(gameEngine._disposed, "disposed correctly");
        assert.ok(gameEngine.__images == undefined && gameEngine.__sounds == undefined && gameEngine.__variablesSimple == undefined && gameEngine.__variablesList == undefined && gameEngine._sprites == undefined, "dispose: resources disposed");
        disposedHandled();
    };

    gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    gameEngine.__currentScene = scene;
    assert.ok(gameEngine instanceof PocketCode.GameEngine && gameEngine instanceof PocketCode.Model.UserVariableHost && gameEngine instanceof SmartJs.Core.Component, "instance check");


    assert.throws(function () { gameEngine._sounds = "invalid argument" }, Error, "ERROR: passed invalid arguments to sounds");
    assert.throws(function () { gameEngine._variables = "invalid argument" }, Error, "ERROR: passed invalid arguments to variables");

    //Hardcoded image Test
    var images = [{ id: "id1" }, { id: "id2" }, { id: "id3" }];
    gameEngine._images = images;
    assert.ok(gameEngine._images["id1"] === images[0]._id && gameEngine._images["id2"] === images[1]._id && gameEngine._images["id3"] === images[2]._id, "images set correctly (hardcoded)");

    //Test loading using new imageStore
    var testProject = strProject11; //has no sounds
    var imagesMatch = true;
    var imageObjectsCreatedCorrectly = true;

    for (var i = 0, l = testProject.images.length; i < l; i++) {
        if (gameEngine._images[testProject.images[i]._id] !== testProject.images[i]._id) {
            imagesMatch = false;
        }

        if (gameEngine._images[testProject.images[i].id._size] !== testProject.images[i]._size /*|| testProject.images[i].imageObject.getAttribute("src") !== gameEngine._images[testProject.images[i]._id].url*/) {
            imageObjectsCreatedCorrectly = false;
        }
    }
    assert.ok(imagesMatch, "Images set correctly");
    assert.ok(imageObjectsCreatedCorrectly === true, "All images have an imageObject with matching criteria");

    //Tests for sounds and variables
    gameEngine._soundManager.init = function () {
        this.soundManagerInitCalled = true;
    };

    //Hardcoded sound Tests
    var sounds = [{ id: "id1", url: "src", size: 1 }, { id: "id2", url: "src", size: 2 }, { id: "id3", url: "src", size: 3 }];
    gameEngine._resourceBaseUrl = "";
    gameEngine._sounds = sounds;
    assert.ok(gameEngine.__sounds["id1"] === sounds[0] && gameEngine.__sounds["id2"] === sounds[1] && gameEngine.__sounds["id3"] === sounds[2], "sounds set correctly (hardcoded)");
    gameEngine._soundManager.init();
    assert.ok(gameEngine._soundManager.soundManagerInitCalled, "Called SoundManagers init Function");

    //Hardcoded variable Test
    var variables = [{ id: "id1", name: "name1" }, { id: "id2", name: "name2" }, { id: "id3", name: "name3" }];
    gameEngine._variables = variables;
    assert.ok(gameEngine.__variablesSimple["id1"] === variables[0]._id && gameEngine.__variablesSimple["id2"] === variables[1]._id && gameEngine.__variablesSimple["id3"] === variables[2]._id, "variables set correctly (hardcoded)");


    var testProjectSounds = strProject719;
    var varsMatch = true;
    for (var i = 0, l = testProjectSounds.variables.length; i < l; i++) {
        if (gameEngine.__variablesSimple._variables[testProjectSounds.variables[i]._id] !== testProjectSounds.variables[i]._id) {
            varsMatch = false;
        }
    }
    assert.ok(varsMatch, "Variables set correctly");

    var soundsMatch = true;
    var soundMgr = gameEngine._soundManager;
    for (var i = 0, l = testProjectSounds.sounds.length; i < l; i++) {
        if (soundMgr._registeredFiles[testProjectSounds.sounds[i].id] !== testProjectSounds.sounds[i]._id) {
            soundsMatch = false;
        }
        soundMgr._registeredFiles[i] = testProjectSounds.sounds[i];
    }

    assert.ok(soundsMatch, "Sounds set correctly");
    assert.equal(soundMgr._registeredFiles.length, testProjectSounds.sounds.length, "sounds loaded: list length compare only");

    return;

});


QUnit.test("GameEngine: variable UI updates", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "id";
    gameEngine._scenes["id"] = scene;
    gameEngine._startScene = scene;
    assert.ok(gameEngine.onVariableUiChange instanceof SmartJs.Event.Event, "onVariableUiChange: event check");

    gameEngine.renderingTexts = [];
    var variables = gameEngine.renderingTexts;
    assert.ok(variables instanceof Array && variables.length == 0, "empty variable array");

    gameEngine._variables = [{ id: "g1", name: "var1", }, { id: "g2", name: "var2", }, ];   //global

    var handlerCount = 0,
        lastEventArgs;
    var onChangeHandler = function (e) {
        handlerCount++;
        lastEventArgs = e;
    };
    gameEngine.onVariableUiChange.addEventListener(new SmartJs.Event.EventListener(onChangeHandler, this));
    gameEngine.getVariable("g1").value = false;

    assert.equal(handlerCount, 0, "variable not visible");
    gameEngine.showVariableAt("g1", 1, 2);
    assert.equal(handlerCount, 1, "event on showVariableAt");
    assert.deepEqual(lastEventArgs.viewState, { visible: true, x: 1, y: 2 }, "viewState update triggered (show)");
    assert.equal(lastEventArgs.value, false, "value check in eventArgs");

    gameEngine.getVariable("g1").value = false;
    assert.equal(handlerCount, 1, "no event dispatched if value does not change");

    gameEngine.getVariable("g1").value = undefined;
    assert.equal(handlerCount, 2, "value changed (strong typed)");
    assert.equal(lastEventArgs.value, undefined, "value included in event args");

    gameEngine.hideVariable("g1");
    assert.deepEqual(lastEventArgs.viewState, { visible: false }, "viewState update triggered (hide)");

    handlerCount = 0;
    gameEngine.getVariable("g1").value = true;
    assert.equal(handlerCount, 0, "no event if hidden again");
});


QUnit.test("GameEngine: execution state", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "id";
    gameEngine._scenes["id"] = scene;
    gameEngine._startScene = scene;

    assert.equal(gameEngine.executionState, PocketCode.ExecutionState.INITIALIZED, "Created gameEngine: status initialized");
    gameEngine._resourcesLoaded = false;
    assert.throws(function () { gameEngine.runProject() }, Error, "ERROR: Program not ready");

    var programStartEvent = 0;
    gameEngine.onBeforeProgramStart.addEventListener(new SmartJs.Event.EventListener(function () {
        programStartEvent++;
    }));

    //simulate project loaded for tests
    gameEngine._resourcesLoaded = true;
    gameEngine._scenesLoaded = true;
    gameEngine.projectReady = true;
    gameEngine._device = new PocketCode.MediaDevice();    //created during loading

    gameEngine.runProject();
    assert.equal(programStartEvent, 1, "Called onProgramStart");
    assert.equal(gameEngine.executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on start");

    gameEngine.runProject();
    assert.equal(programStartEvent, 1, "Did not attempt to start running gameEngine");

    gameEngine.pauseProject();
    assert.equal(gameEngine.executionState, PocketCode.ExecutionState.PAUSED, "Set programs execution state to PAUSED on calling pause");
    gameEngine._soundManager.status = 3;
    assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.PAUSED, "Called soundManagers pauseSounds function");

    gameEngine.resumeProject();
    assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on calling resume");
    gameEngine._soundManager.status = 1;
    assert.deepEqual(gameEngine._soundManager.status, PocketCode.ExecutionState.RUNNING, "Called soundManagers resumeSounds function");

    gameEngine.stopProject();
    assert.equal(gameEngine.executionState, PocketCode.ExecutionState.STOPPED, "Set programs execution state to STOP on calling stop");
    gameEngine._soundManager.status = 0;
    assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.STOPPED, "Called soundManagers stop function");

    gameEngine.resumeProject();
    assert.equal(gameEngine.executionState, PocketCode.ExecutionState.STOPPED, "Did not resume stopped gameEngine");

    gameEngine.pauseProject();
    assert.equal(gameEngine.executionState, PocketCode.ExecutionState.STOPPED, "Did not attempt to pause stopped gameEngine");

    gameEngine.stopProject();
    gameEngine.runProject();

    assert.ok(gameEngine._soundManager.status === PocketCode.ExecutionState.STOPPED, "Called SoundManagers stopAllSounds when restarting gameEngine");

});


QUnit.test("GameEngine: tests with a testProject", function (assert) {

    var done = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var onLoadHandler = function () {
        assert.ok(gameEngine.projectLoaded, "Project Loaded");
        runTests();
    };

    gameEngine.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
    gameEngine.loadProject(strProject817);

    function runTests() {
        assert.ok(gameEngine._startScene, "start scene initialized");
        gameEngine.startScene("s1");

        assert.equal(gameEngine._currentScene, gameEngine._scenes["s1"], "current scene set");
        assert.equal(gameEngine._currentScene.executionState, PocketCode.ExecutionState.RUNNING, "scene running");
        gameEngine.runProject();
        assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.RUNNING, "runProject: Project running");

        //gameEngine.restartProject();
        //assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.STOPPED, "restartProject: Project restarted");

        gameEngine.runProject();
        gameEngine.pauseProject();
        assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.PAUSED, "pausedProject: Project paused");

        gameEngine.resumeProject();
        assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.RUNNING, "resumeProject: Project resumed");

        gameEngine.stopProject();
        assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.STOPPED, "stoppedProject: Project stopped");

        gameEngine.runProject();
        gameEngine.resumeOrStartScene("s1");
        assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.RUNNING, "resumeOrStartScene: Scene already running");

        gameEngine.pauseProject();
        gameEngine.resumeOrStartScene("s1");
        assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.RUNNING, "resumeOrStartScene: resuming Scene");

        gameEngine.stopProject();
        gameEngine.resumeOrStartScene("s1");
        assert.deepEqual(gameEngine.executionState, PocketCode.ExecutionState.RUNNING, "resumeOrStartScene: starting Scene");

        gameEngine.dispose();   //make sure the listeners to internal (static) classes are removed to avoid side effects with other tests
        done();
    };

    /*
    assert.ok(gameEngine.onLoadingProgress, "onLoadingProgress");
    assert.ok(gameEngine.onSceneChange, "onSceneChange");
    assert.ok(gameEngine.onLoadingError, "onLoadingError");
    assert.ok(gameEngine.onBeforeProgramStart, "onBeforeProgramStart");
    assert.ok(gameEngine.onProgramExecuted, "onProgramExecuted");
    */
    return;
});

