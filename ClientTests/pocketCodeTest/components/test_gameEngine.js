/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("gameEngine.js");


QUnit.test("GameEngine", function (assert) {

    var program = new PocketCode.GameEngine();
    assert.ok(program instanceof PocketCode.GameEngine, "instance check");

    assert.throws(function(){program.images = "invalid argument"}, Error, "ERROR: passed invalid arguments to program.images.");
    assert.throws(function(){program.sounds = "invalid argument"}, Error, "ERROR: passed invalid arguments to program.sounds.");
    assert.throws(function(){program.variables = "invalid argument"}, Error, "ERROR: passed invalid arguments to program.variables.");
    assert.throws(function(){program.broadcasts = "invalid argument"}, Error, "ERROR: passed invalid arguments to program.broadcasts.");

    var images = [{id:"1"},{id:"2"},{id:"3"}];
    program.images = images;
    assert.ok(program._images["1"] === images[0] && program._images["2"] === images[1] && program._images["3"] === images[2], "images set correctly");

    program._soundManager.init = function(){
        this.soundManagerInitCalled = true;
    };

    var sounds = [{id:"id1", url:"src"},{id:"id2", url:"src"},{id:"id3", url:"src"}];
    program.sounds = sounds;
    assert.ok(program._sounds["id1"] === sounds[0] && program._sounds["id2"] === sounds[1] && program._sounds["id3"] === sounds[2], "sounds set correctly");
    assert.ok(program._soundManager.soundManagerInitCalled, "Called SoundManagers init Function");

    var variables = [{id:"1", name:"name1"},{id:"2", name:"name2"},{name:"name3",id:"3"}];
    program.variables = variables;
    assert.ok(program._variables["1"] === variables[0] && program._variables["2"] === variables[1] && program._variables["3"] === variables[2], "variables set correctly");
    assert.ok(program._variableNames["1"].name === "name1" && program._variableNames["2"].name === "name2" && program._variableNames["3"].name === "name3", "varableNames set correctly");

    assert.deepEqual(program.getGlobalVariable("1"), variables[0], "Calling getNewVariable returned correct variable");
    assert.deepEqual(program.getGlobalVariableNames(), program._variableNames, "getGlobalVariableNames returns program._variableNames");
    assert.throws(function(){program.getGlobalVariable("invalid")},Error, "ERROR: invalid argument used for getGlobalVariable");

    var broadcasts =  [{id:"1"},{id:"2"},{id:"3"}];
    program._broadcastMgr.init = function(){
        this.initCalled = true;
    };
    program.broadcasts = broadcasts;
    assert.ok(program._broadcastMgr.initCalled, "Called BroadcastManagers init function");
    assert.equal(program._broadcasts, broadcasts, "broadcasts set correctly");

    program.programReady = true;
    assert.equal(program._executionState, PocketCode.ExecutingState.STOPPED, "Created program not started");
    assert.throws(function(){program.execute()}, Error, "ERROR: Tried to start program without any sprites.");
    program.programReady = false;
    assert.throws(function(){program.execute()}, Error, "ERROR: Program not ready.");
    program.programReady = true;

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


    program._soundManager.pauseSounds = function () {
        this.status = PocketCode.ExecutingState.PAUSED;
    };

    program._soundManager.resumeSounds = function () {
        this.status = PocketCode.ExecutingState.RUNNING;
    };

    program._soundManager.timesStopped = 0;
    program._soundManager.stopAllSounds = function () {
        this.status = PocketCode.ExecutingState.STOPPED;
        this.timesStopped++;
    };

    program.background = new TestSprite(program);
    program.sprites.push(new TestSprite(program));
    program.sprites.push(new TestSprite(program));
    program.sprites.push(new TestSprite(program));

    var programStartEvent = 0;
    program.onProgramStart.addEventListener(new SmartJs.Event.EventListener(function(){
        programStartEvent++;
    }));

    program.execute();
    assert.deepEqual(programStartEvent, 1, "Called onProgramStart.");

    var allSpritesStarted = true;
    for(var i = 0; i < program.sprites.length; i++){
        if(program.sprites[i].status !== PocketCode.ExecutingState.RUNNING){
            allSpritesStarted = false;
        }
    }
    assert.ok(allSpritesStarted, "All sprites start methods called.");
    assert.deepEqual(program.background.status, PocketCode.ExecutingState.RUNNING, "Called backgrounds start method.");
    assert.deepEqual(program._executionState, PocketCode.ExecutingState.RUNNING, "Set programs execution state to RUNNING on start.");

    program.execute();
    assert.deepEqual(programStartEvent, 1, "Did not attempt to start running program.");

    program.pause();
    var allSpritesPaused = true;
    for(i = 0; i < program.sprites.length; i++){
        if(program.sprites[i].status !== PocketCode.ExecutingState.PAUSED){
            allSpritesPaused = false;
        }
    }
    assert.ok(allSpritesPaused, "All sprites pause methods called.");
    assert.deepEqual(program.background.status, PocketCode.ExecutingState.PAUSED, "Called backgrounds pause method.");
    assert.deepEqual(program._executionState, PocketCode.ExecutingState.PAUSED, "Set programs execution state to PAUSED on calling pause.");
    assert.deepEqual(program._soundManager.status, PocketCode.ExecutingState.PAUSED, "Called soundManagers pauseSounds function.");

    program.resume();
    allSpritesStarted = true;
    for(i = 0; i < program.sprites.length; i++){
        if(program.sprites[i].status !== PocketCode.ExecutingState.RUNNING){
            allSpritesStarted = false;
        }
    }
    assert.ok(allSpritesStarted, "All sprites running after resume.");
    assert.deepEqual(program.background.status, PocketCode.ExecutingState.RUNNING, "Called backgrounds resume method.");
    assert.deepEqual(program._executionState, PocketCode.ExecutingState.RUNNING, "Set programs execution state to RUNNING on calling resume.");
    assert.deepEqual(program._soundManager.status, PocketCode.ExecutingState.RUNNING, "Called soundManagers resumeSounds function.");

    program.stop();
    var allSpritesStopped = true;
    for(i = 0; i < program.sprites.length; i++){
        if(program.sprites[i].status !== PocketCode.ExecutingState.STOPPED){
            allSpritesStopped = false;
        }
    }
    assert.ok(allSpritesStarted, "All sprites stopped.");
    assert.deepEqual(program.background.status, PocketCode.ExecutingState.STOPPED, "Called backgrounds stop method.");
    assert.deepEqual(program._executionState, PocketCode.ExecutingState.STOPPED, "Set programs execution state to STOP on calling stop.");
    assert.deepEqual(program._soundManager.status, PocketCode.ExecutingState.STOPPED, "Called soundManagers stop function.");

    program.resume();
    assert.deepEqual(program._executionState, PocketCode.ExecutingState.STOPPED, "Did not resume stopped program.");

    program.pause();
    assert.deepEqual(program._executionState, PocketCode.ExecutingState.STOPPED, "Did not attempt to pause stopped program.");

    var spritesStarted = program.sprites[0].timesStarted;
    var spritesStopped = program.sprites[0].timesStopped;
    var bgStarted = program.background.timesStarted;
    var bgStopped = program.background.timesStopped;

    program.restart();
    assert.ok(program.sprites[0].timesStopped === spritesStopped + 1 && program.background.timesStopped === bgStopped + 1, "Stopped all sprites when restarting.");
    assert.ok(program.sprites[0].timesStarted === spritesStarted + 1 && program.background.timesStarted === bgStarted + 1, "Started all sprites when restarting.");
    assert.ok(program._soundManager.status === PocketCode.ExecutingState.STOPPED, "Called SoundManagers stopAllSounds when restarting program.");

    var sprite1 = new PocketCode.Model.Sprite(program);
    sprite1.id = "spriteId1";
    sprite1.name = "spriteName1";
    program.sprites.push(sprite1);
    assert.ok(program.getSprite("spriteId1") === sprite1, "Correct sprite returned by getSprite.");

    var spriteChanges = 0;
    program._onSpriteChange.addEventListener(new SmartJs.Event.EventListener(function() {
        spriteChanges++;
        //TODO tests for event
    }));

    var numberOfSprites = program.sprites.length;
    var currentSpriteLayer = program.getSpriteLayer("spriteId1");
    assert.deepEqual(program.getSpriteLayer("spriteId1"), numberOfSprites + program.backgroundOffset - 1, "Correct Sprite Layer returned by getSpriteLayer.");
    program.setSpriteLayerBack("spriteId1",2);
    assert.deepEqual(program.getSpriteLayer("spriteId1"), currentSpriteLayer - 2, "Set sprite layer two Layers back with setSpriteLayerBack.");

    assert.ok(program.setSpriteLayerBack("spriteId1",1), "Setting Sprite layer back returns true.");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event triggered every time layer got set back.");
    assert.ok(!program.setSpriteLayerBack("spriteId1",1),"Setting Sprite layer back returns false if Sprite is already on the bottom layer");
    assert.deepEqual(spriteChanges, 2, "Sprite Change Event did not trigger when attempting to set sprite a layer back that was already in last position.");

    spriteChanges = 0;

    assert.ok(program.setSpriteLayerToFront("spriteId1"), "Bringing Layer to front returns true if layers are changed.");
    assert.ok(!program.setSpriteLayerToFront("spriteId1"), "Bringing Layer to front returns false if no layers are changed.");
    assert.deepEqual(spriteChanges, 1, "Sprite Change Event triggered once.");
    assert.deepEqual(program.getSpriteLayer("spriteId1"), program.sprites.length - 1 + program.backgroundOffset,"Brought Layer to front.");

    //todo migrate tests to parser
    var testProject = projectSounds;
    program.loadProject(testProject);

    assert.equal(program.background.id, testProject.background.id,"Correct Background set.");
    assert.equal(program.sprites.length, testProject.sprites.length, "No excess sprites left.");

    var spritesMatch = true;
    var bricksMatch = true;
    var looksMatch = true;
    var varsMatch = true;
    var l;
    for(i = 0, l = program.sprites.length; i < l; i++){
        if(program.sprites[i].id !== testProject.sprites[i].id ||
            program.sprites[i].name !== testProject.sprites[i].name)
            spritesMatch = false;

        for(var j = 0, length = testProject.sprites[i].variables.length; j < length; j++){
            console.log(program.sprites[i]._variables[testProject.sprites[i].variables[j].id]);
            if(!program.sprites[i]._variables[testProject.sprites[i].variables[j].id])
                varsMatch = false;
        }

        for(j = 0, length = testProject.sprites[i].bricks.length; j < length; j++){
            if(program.sprites[i].bricks[j].id !== testProject.sprites[i].bricks[j].id)
                bricksMatch = false;
        }

        for(j = 0, length = testProject.sprites[i].looks.length; j < length; j++){
            if(program.sprites[i]._looks[j].id !== testProject.sprites[i].looks[j].id)
                looksMatch = false;
        }
    }

    assert.ok(spritesMatch, "Sprites created correctly.");
    assert.ok(looksMatch, "Sprites looks set correctly.");
    //todo currently no sprite variables in the project
    assert.ok(varsMatch, "Sprite variables set correctly.");
    assert.ok(bricksMatch, "Sprite bricks set correctly.");

    varsMatch = true;
    for(i = 0, l = testProject.variables.length; i < l; i++){
        if(!program._variables[testProject.variables[i].id]){
            varsMatch = false;
        }
    }
    assert.ok(varsMatch, "Varibales set correctly.");

    var soundsMatch = true;
    for(i = 0, l = testProject.sounds.length; i < l; i++){
        if(!program._sounds[testProject.sounds[i].id]){
            soundsMatch = false;
        }
    }
    assert.ok(soundsMatch, "Sounds set correctly.");

    var imagesMatch = true;
    for(i = 0, l = testProject.images.length; i < l; i++){
        if(!program._images[testProject.images[i].id]){
            imagesMatch = false;
        }
    }
    assert.ok(imagesMatch, "Images set correctly.");
});