/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("gameEngine.js");


QUnit.test("GameEngine", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    assert.ok(gameEngine instanceof PocketCode.GameEngine, "instance check");

    assert.throws(function(){gameEngine.images = "invalid argument"}, Error, "ERROR: passed invalid arguments to images.");
    assert.throws(function(){gameEngine.sounds = "invalid argument"}, Error, "ERROR: passed invalid arguments to sounds.");
    assert.throws(function(){gameEngine.variables = "invalid argument"}, Error, "ERROR: passed invalid arguments to variables.");
    assert.throws(function(){gameEngine.broadcasts = "invalid argument"}, Error, "ERROR: passed invalid arguments to broadcasts.");
    assert.throws(function(){gameEngine.setSpriteLayerBack("invalidId",5)}, Error, "ERROR: passed invalid id to setSpriteLayerBack.");
    assert.throws(function(){gameEngine.setSpriteLayerToFront("invalidId")}, Error, "ERROR: passed invalid id to setSpriteLayerToFront.");
    assert.throws(function(){gameEngine.getSprite("invalidId")}, Error, "ERROR: passed invalid id to getSprite.");
    assert.throws(function(){gameEngine.getSpriteLayer("invalidId")}, Error, "ERROR: passed invalid id to getSpriteLayer.");

    var images = [{id:"1"},{id:"2"},{id:"3"}];
    gameEngine.images = images;
    assert.ok(gameEngine._images["1"] === images[0] && gameEngine._images["2"] === images[1] && gameEngine._images["3"] === images[2], "images set correctly");

    gameEngine._soundManager.init = function(){
        this.soundManagerInitCalled = true;
    };

    var sounds = [{id:"id1", url:"src"},{id:"id2", url:"src"},{id:"id3", url:"src"}];
    gameEngine.sounds = sounds;
    assert.ok(gameEngine._sounds["id1"] === sounds[0] && gameEngine._sounds["id2"] === sounds[1] && gameEngine._sounds["id3"] === sounds[2], "sounds set correctly");
    assert.ok(gameEngine._soundManager.soundManagerInitCalled, "Called SoundManagers init Function");

    var variables = [{id:"1", name:"name1"},{id:"2", name:"name2"},{name:"name3",id:"3"}];
    gameEngine.variables = variables;
    assert.ok(gameEngine._variables["1"] === variables[0] && gameEngine._variables["2"] === variables[1] && gameEngine._variables["3"] === variables[2], "variables set correctly");
    assert.ok(gameEngine._variableNames["1"].name === "name1" && gameEngine._variableNames["2"].name === "name2" && gameEngine._variableNames["3"].name === "name3", "varableNames set correctly");

    assert.deepEqual(gameEngine.getGlobalVariable("1"), variables[0], "Calling getNewVariable returned correct variable");
    assert.deepEqual(gameEngine.getGlobalVariableNames(), gameEngine._variableNames, "getGlobalVariableNames returns gameEngine._variableNames");
    assert.throws(function(){gameEngine.getGlobalVariable("invalid")},Error, "ERROR: invalid argument used for getGlobalVariable");

    var broadcasts =  [{id:"1"},{id:"2"},{id:"3"}];
    gameEngine._broadcastMgr.init = function(){
        this.initCalled = true;
    };
    gameEngine.broadcasts = broadcasts;
    assert.ok(gameEngine._broadcastMgr.initCalled, "Called BroadcastManagers init function");
    assert.equal(gameEngine._broadcasts, broadcasts, "broadcasts set correctly");

    gameEngine.projectReady = true;
    assert.equal(gameEngine._executionState, PocketCode.ExecutingState.STOPPED, "Created gameEngine not started");
    assert.throws(function(){gameEngine.execute()}, Error, "ERROR: Tried to start gameEngine without any sprites.");
    gameEngine.projectReady = false;
    assert.throws(function(){gameEngine.execute()}, Error, "ERROR: Program not ready.");
    gameEngine.projectReady = true;

    //Mock GameEngine and SoundManagers start, pause, stop methods
    var TestSprite = (function () {
        TestSprite.extends(PocketCode.Model.Sprite, false);

        function TestSprite(program) {
            PocketCode.Model.Sprite.call(this, program);
            this.status = PocketCode.ExecutingState.STOPPED;
        }

        TestSprite.prototype.merge({
            timesStopped: 0,
            timesStarted: 0,
            execute: function () {
                this.status = PocketCode.ExecutingState.RUNNING;
                this.timesStarted++;
            },
            pause: function(){
                this.status = PocketCode.ExecutingState.PAUSED;
            },
            resume: function(){
                this.status = PocketCode.ExecutingState.RUNNING;
            },
            stop: function(){
                this.status = PocketCode.ExecutingState.STOPPED;
                this.timesStopped++;
            }
        });

        return TestSprite;
    })();


    gameEngine._soundManager.pauseSounds = function () {
        this.status = PocketCode.ExecutingState.PAUSED;
    };

    gameEngine._soundManager.resumeSounds = function () {
        this.status = PocketCode.ExecutingState.RUNNING;
    };

    gameEngine._soundManager.timesStopped = 0;
    gameEngine._soundManager.stopAllSounds = function () {
        this.status = PocketCode.ExecutingState.STOPPED;
        this.timesStopped++;
    };

    gameEngine.background = new TestSprite(gameEngine);
    gameEngine.sprites.push(new TestSprite(gameEngine));
    gameEngine.sprites.push(new TestSprite(gameEngine));
    gameEngine.sprites.push(new TestSprite(gameEngine));

    var layers = gameEngine.layerObjectList;
    assert.equal(layers[0], gameEngine.background, "Background in correct position in layer list.");
    var spriteOrderCorrect = true;
    for(i = 0, l = gameEngine.sprites.length; i < l; i++){
        if(gameEngine.sprites[i] !== layers[i + 1]){
            spriteOrderCorrect = false;
        }
    }
    assert.ok(spriteOrderCorrect, "Sprites in correct position in layer list.");

    var programStartEvent = 0;
    gameEngine.onProgramStart.addEventListener(new SmartJs.Event.EventListener(function(){
        programStartEvent++;
    }));

    gameEngine.execute();
    assert.deepEqual(programStartEvent, 1, "Called onProgramStart.");

    var allSpritesStarted = true;
    for(var i = 0, l = gameEngine.sprites.length; i < l; i++){
        if(gameEngine.sprites[i].status !== PocketCode.ExecutingState.RUNNING){
            allSpritesStarted = false;
        }
    }
    assert.ok(allSpritesStarted, "All sprites start methods called.");
    assert.deepEqual(gameEngine.background.status, PocketCode.ExecutingState.RUNNING, "Called backgrounds start method.");
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutingState.RUNNING, "Set programs execution state to RUNNING on start.");

    gameEngine.execute();
    assert.deepEqual(programStartEvent, 1, "Did not attempt to start running gameEngine.");

    gameEngine.pause();
    var allSpritesPaused = true;
    for(i = 0; i < gameEngine.sprites.length; i++){
        if(gameEngine.sprites[i].status !== PocketCode.ExecutingState.PAUSED){
            allSpritesPaused = false;
        }
    }
    assert.ok(allSpritesPaused, "All sprites pause methods called.");
    assert.deepEqual(gameEngine.background.status, PocketCode.ExecutingState.PAUSED, "Called backgrounds pause method.");
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutingState.PAUSED, "Set programs execution state to PAUSED on calling pause.");
    assert.deepEqual(gameEngine._soundManager.status, PocketCode.ExecutingState.PAUSED, "Called soundManagers pauseSounds function.");

    gameEngine.resume();
    allSpritesStarted = true;
    for(i = 0; i < gameEngine.sprites.length; i++){
        if(gameEngine.sprites[i].status !== PocketCode.ExecutingState.RUNNING){
            allSpritesStarted = false;
        }
    }
    assert.ok(allSpritesStarted, "All sprites running after resume.");
    assert.deepEqual(gameEngine.background.status, PocketCode.ExecutingState.RUNNING, "Called backgrounds resume method.");
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutingState.RUNNING, "Set programs execution state to RUNNING on calling resume.");
    assert.deepEqual(gameEngine._soundManager.status, PocketCode.ExecutingState.RUNNING, "Called soundManagers resumeSounds function.");

    gameEngine.stop();
    var allSpritesStopped = true;
    for(i = 0; i < gameEngine.sprites.length; i++){
        if(gameEngine.sprites[i].status !== PocketCode.ExecutingState.STOPPED){
            allSpritesStopped = false;
        }
    }
    assert.ok(allSpritesStarted, "All sprites stopped.");
    assert.deepEqual(gameEngine.background.status, PocketCode.ExecutingState.STOPPED, "Called backgrounds stop method.");
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutingState.STOPPED, "Set programs execution state to STOP on calling stop.");
    assert.deepEqual(gameEngine._soundManager.status, PocketCode.ExecutingState.STOPPED, "Called soundManagers stop function.");

    gameEngine.resume();
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutingState.STOPPED, "Did not resume stopped gameEngine.");

    gameEngine.pause();
    assert.deepEqual(gameEngine._executionState, PocketCode.ExecutingState.STOPPED, "Did not attempt to pause stopped gameEngine.");

    var spritesStarted = gameEngine.sprites[0].timesStarted;
    var spritesStopped = gameEngine.sprites[0].timesStopped;
    var bgStarted = gameEngine.background.timesStarted;
    var bgStopped = gameEngine.background.timesStopped;

    gameEngine.restart();
    assert.ok(gameEngine.sprites[0].timesStopped === spritesStopped + 1 && gameEngine.background.timesStopped === bgStopped + 1, "Stopped all sprites when restarting.");
    assert.ok(gameEngine.sprites[0].timesStarted === spritesStarted + 1 && gameEngine.background.timesStarted === bgStarted + 1, "Started all sprites when restarting.");
    assert.ok(gameEngine._soundManager.status === PocketCode.ExecutingState.STOPPED, "Called SoundManagers stopAllSounds when restarting gameEngine.");

    var sprite1 = new PocketCode.Model.Sprite(gameEngine);
    sprite1.id = "spriteId1";
    sprite1.name = "spriteName1";
    gameEngine.sprites.push(sprite1);
    assert.ok(gameEngine.getSprite("spriteId1") === sprite1, "Correct sprite returned by getSprite.");

    var spriteChanges = 0;
    gameEngine._onSpriteChange.addEventListener(new SmartJs.Event.EventListener(function() {
        spriteChanges++;
        //TODO tests for event
    }));

    var numberOfSprites = gameEngine.sprites.length;
    var currentSpriteLayer = gameEngine.getSpriteLayer("spriteId1");
    assert.deepEqual(gameEngine.getSpriteLayer("spriteId1"), numberOfSprites + gameEngine.backgroundOffset - 1, "Correct Sprite Layer returned by getSpriteLayer.");
    gameEngine.setSpriteLayerBack("spriteId1",2);
    assert.deepEqual(gameEngine.getSpriteLayer("spriteId1"), currentSpriteLayer - 2, "Set sprite layer two Layers back with setSpriteLayerBack.");

    assert.ok(gameEngine.setSpriteLayerBack("spriteId1",1), "Setting Sprite layer back returns true.");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event triggered every time layer got set back.");
    assert.ok(!gameEngine.setSpriteLayerBack("spriteId1",1),"Setting Sprite layer back returns false if Sprite is already on the bottom layer");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event did not trigger when attempting to set sprite a layer back that was already in last position.");

    spriteChanges = 0;

    assert.ok(gameEngine.setSpriteLayerToFront("spriteId1"), "Bringing Layer to front returns true if layers are changed.");
    assert.ok(!gameEngine.setSpriteLayerToFront("spriteId1"), "Bringing Layer to front returns false if no layers are changed.");
    assert.deepEqual(spriteChanges, 1, "Sprite Change Event triggered once.");
    assert.deepEqual(gameEngine.getSpriteLayer("spriteId1"), gameEngine.sprites.length - 1 + gameEngine.backgroundOffset,"Brought Layer to front.");

    var spriteBeforeLast = gameEngine.sprites[1];
    spriteBeforeLast.id = "uniqueId";
    gameEngine.setSpriteLayerBack(spriteBeforeLast.id,2);
    assert.equal(gameEngine.getSpriteLayer(spriteBeforeLast.id),1,"Sprite positioned at first layer if when trying to set back more layers than currently available.");

    var projectWithNoSounds = project1;
    gameEngine.loadProject(projectWithNoSounds);
    assert.ok(gameEngine.soundsLoaded, "SoundsLoaded set true if there are no sounds");

    var testProject = projectSounds;
    var loadingHandled = assert.async();

    gameEngine.loadProject(testProject);

    gameEngine._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(function(e){
        if(e.progress !== 100){
            assert.ok(!gameEngine.soundsLoaded && !gameEngine.projectReady, "Program not ready if sounds are not loaded");
            return;
        }else{
            assert.ok(gameEngine.soundsLoaded, "Set soundsLoaded to true when loading sounds is done");
            assert.ok(gameEngine.projectReady, "Program ready set to true after loading is done");
        }
        loadingHandled();

        var gameEngine2 = new PocketCode.GameEngine;
        //gameEngine2.loadProject(strProject14);


    }));
    assert.equal(gameEngine.background.id, testProject.background.id,"Correct Background set.");
    assert.equal(gameEngine.sprites.length, testProject.sprites.length, "No excess sprites left.");

    var spritesMatch = true;
    for(i = 0, l = gameEngine.sprites.length; i < l; i++){
        if(gameEngine.sprites[i].id !== testProject.sprites[i].id)
            spritesMatch = false;
    }
    assert.ok(spritesMatch, "Sprites created correctly.");

    var varsMatch = true;
    for(i = 0, l = testProject.variables.length; i < l; i++){
        if(!gameEngine._variables[testProject.variables[i].id]){
            varsMatch = false;
        }
    }
    assert.ok(varsMatch, "Variables set correctly.");

    var soundsMatch = true;
    for(i = 0, l = testProject.sounds.length; i < l; i++){
        if(!gameEngine._sounds[testProject.sounds[i].id]){
            soundsMatch = false;
        }
    }
    assert.ok(soundsMatch, "Sounds set correctly.");

    var imagesMatch = true;
    for(i = 0, l = testProject.images.length; i < l; i++){
        if(!gameEngine._images[testProject.images[i].id]){
            imagesMatch = false;
        }
    }
    assert.ok(imagesMatch, "Images set correctly.");

    //finish async tests if browser does not support sounds
    if(!gameEngine._soundManager.supported)
        loadingHandled();

});