/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/core.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/broadcastManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/parser.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// 
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksControl.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksLook.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksMotion.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksSound.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksVariable.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/program.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />

/// <reference path="../tests_testDataProjects.js" />
'use strict';

QUnit.module("parser.js");


QUnit.test("FormulaParser: JSON", function (assert) {

    var p = PocketCode.FormulaParser;   //this is not a constructor but a singleton
    assert.ok(true, "TODO:");

});

QUnit.test("FormulaParser: UI String", function (assert) {

    var p = PocketCode.FormulaParser;   //this is not a constructor but a singleton
    assert.ok(true, "TODO:");

});

QUnit.test("BrickFactory", function (assert) {

    var allBricksProject = project1;    //using tests_testData.js
    //^^ includes all types of bricks 

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager(allBricksProject.id, []);

    var device = new PocketCode.Device();
    var program = new PocketCode.Model.Program(allBricksProject.id);
    var sprite = new PocketCode.Model.Sprite(program);

    var bf = new PocketCode.BrickFactory(device, program, broadcastMgr, soundMgr, allBricksProject.header.bricksCount);
    assert.ok(bf instanceof PocketCode.BrickFactory, "instance created");

    assert.ok(bf._device === device && bf._program === program && bf._broadcastMgr === broadcastMgr && bf._soundMgr === soundMgr && bf._total === allBricksProject.header.bricksCount, "properties set correctly");

    var progress = [];
    var progressHandler = function (e) {
        progress.push(e.progress);
    };

    bf.onProgressChange.addEventListener(new SmartJs.Event.EventListener(progressHandler, this));

    var unsupportedBricks = [];
    var unsupportedCalled = 0;
    var unsupportedHandler = function (e) {
        unsupportedCalled++;
        unsupportedBricks = e.unsupportedBricks;
    };

    bf.onUnsupportedBricksFound.addEventListener(new SmartJs.Event.EventListener(unsupportedHandler, this));

    var controlBricks = [];
    var soundBricks = [];
    var motionBricks = [];
    var lookBricks = [];
    var variableBricks = [];
    var otherBricks = [];

    //background:
    var count = 0;
    var bricks = allBricksProject.background.bricks;
    for (var i = 0, l = bricks.length; i < l; i++) {
        controlBricks.push(bf.create(sprite, bricks[i]));
        count++;
    }

    //all other sprites
    //we add all bricks to the same sprite as this makes no difference in this bricks factory test
    var currentSprite;
    for (var i = 0, l = allBricksProject.sprites.length; i < l; i++) {
        currentSprite = allBricksProject.sprites[i];
        var bricks = otherBricks;
        switch (i) {
            case 0:
                bricks = soundBricks;
                break;
            case 1:
                bricks = motionBricks;
                break;
            case 2:
                bricks = lookBricks;
                break;
            case 3:
                bricks = variableBricks;
                break;
        }

        for (var j = 0, k = currentSprite.bricks.length; j < k; j++) {
            bricks.push(bf.create(sprite, currentSprite.bricks[j]));
            count++;
        }
    }
    
    assert.equal(bf._parsed, allBricksProject.header.bricksCount, "all bricks created");
    assert.ok(progress.length > 0, "progress handler called");
    assert.equal(progress[progress.length - 1], 100, "progress reached 100%");
    assert.ok(progress.length <= 20, "limited progress events");

    assert.equal(unsupportedCalled, 0, "unsupported bricks not found, handler not called");
    assert.equal(unsupportedBricks.length, 0, "no unsupported found");


    //TEST INCLUDING UNSUPPORTED
    var allBricksProject = project1;    //using tests_testData.js
    //^^ includes all types of bricks 
    //adding unsupported brick
    //{"broadcastMsgId":"s50","type":"BroadcastAndWaitUnknown"} //client detect
    //{"broadcastMsgId":"s50","type":"Unsupported"}             //server detect
    sprite = new PocketCode.Model.Sprite(program);

    allBricksProject.background.bricks.push({ "broadcastMsgId": "s50", "type": "BroadcastAndWaitUnknown" });
    allBricksProject.background.bricks.push({ "broadcastMsgId": "s51", "type": "Unsupported" });
    allBricksProject.header.bricksCount += 2;

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager(allBricksProject.id, []);

    var device = new PocketCode.Device();
    var program = new PocketCode.Model.Program(allBricksProject.id);
    var sprite = new PocketCode.Model.Sprite(program);

    var bf = new PocketCode.BrickFactory(device, program, broadcastMgr, soundMgr, allBricksProject.header.bricksCount);
    assert.ok(bf instanceof PocketCode.BrickFactory, "instance created");

    assert.ok(bf._device === device && bf._program === program && bf._broadcastMgr === broadcastMgr && bf._soundMgr === soundMgr && bf._total === allBricksProject.header.bricksCount, "properties set correctly");

    var progress = [];
    var progressHandler = function (e) {
        progress.push(e.progress);
    };

    bf.onProgressChange.addEventListener(new SmartJs.Event.EventListener(progressHandler, this));

    var unsupportedBricks = [];
    var unsupportedCalled = 0;
    var unsupportedHandler = function (e) {
        unsupportedCalled++;
        unsupportedBricks = e.unsupportedBricks;
    };

    bf.onUnsupportedBricksFound.addEventListener(new SmartJs.Event.EventListener(unsupportedHandler, this));

    var controlBricks = [];
    var soundBricks = [];
    var motionBricks = [];
    var lookBricks = [];
    var variableBricks = [];
    var otherBricks = [];

    //background:
    var count = 0;
    var bricks = allBricksProject.background.bricks;
    for (var i = 0, l = bricks.length; i < l; i++) {
        controlBricks.push(bf.create(sprite, bricks[i]));
        count++;
    }

    //all other sprites
    //we add all bricks to the same sprite as this makes no difference in this bricks factory test
    var currentSprite;
    for (var i = 0, l = allBricksProject.sprites.length; i < l; i++) {
        currentSprite = allBricksProject.sprites[i];
        var bricks = otherBricks;
        switch (i) {
            case 0:
                bricks = soundBricks;
                break;
            case 1:
                bricks = motionBricks;
                break;
            case 2:
                bricks = lookBricks;
                break;
            case 3:
                bricks = variableBricks;
                break;
        }

        for (var j = 0, k = currentSprite.bricks.length; j < k; j++) {
            bricks.push(bf.create(sprite, currentSprite.bricks[j]));
            count++;
        }
    }

    assert.equal(bf._parsed, allBricksProject.header.bricksCount, "unsupported: all bricks created");
    assert.ok(progress.length > 0, "unsupported: progress handler called");
    assert.equal(progress[progress.length - 1], 100, "unsupported: progress reached 100%");
    assert.ok(progress.length <= 20, "unsupported: limited progress events");

    assert.equal(unsupportedCalled, 1, "unsupported: unsupported bricks found, handler called once");
    assert.equal(unsupportedBricks.length, 2, "unsupported: 2 found");


});

QUnit.test("ProgramParser", function (assert) {

    var p = new PocketCode.ProgramParser();
    assert.ok(true, "TODO:");

});


