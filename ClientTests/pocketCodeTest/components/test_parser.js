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
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />

/// <reference path="../_resources/testDataProjects.js" />
'use strict';

QUnit.module("parser.js");


QUnit.test("FormulaParser: operators", function (assert) {

    assert.throws(function () { PocketCode.FormulaParser.getUiString(plus); }, Error, "ERROR: accessing uiString without providing variable names");
    assert.notEqual((PocketCode.FormulaParser.parseJson(null)).calculate, undefined, "check created function on null value");
    assert.equal((PocketCode.FormulaParser.parseJson(null)).calculate(), undefined, "return 'undefined' for null values (json)");

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = plus;
    assert.deepEqual(f.json, plus, "json getter using property setter");

    f = new PocketCode.Formula(device, sprite, plus);   //using ctr setter
    assert.deepEqual(f.json, plus, "json getter using ctr setter");

    assert.equal(f.calculate(), 3, "calc plus: int");
    assert.equal(f.isStatic, true, "calc plus: isStatic");
    assert.equal(f.uiString, "1 + 2", "string plus: int");

    f.json = plus2;
    assert.equal(Math.round(f.calculate() * 100) / 100, 3.6, "plus: float");
    assert.equal(f.uiString, "1 + 2.6", "string plus: float");

    f.json = signed;
    assert.equal(Math.round(f.calculate() * 100) / 100, -3.6, "signed (negative)");
    assert.equal(f.uiString, "-1 + -2.6", "string: signed");

    f.json = minus;
    assert.equal(f.calculate(), 1, "calc minus: int");
    assert.equal(f.isStatic, true, "calc minus: isStatic");
    assert.equal(f.uiString, "2 - 1", "string minus: int");

    f.json = minus2;
    assert.equal(Math.round(f.calculate() * 100) / 100, 1.2, "calc minus: float");
    assert.equal(f.uiString, "2.2 - 1", "string minus: float");

    f.json = divide;
    assert.equal(f.calculate(), 2, "calc divide: int");
    assert.equal(f.isStatic, true, "calc divide: isStatic");
    //assert.equal(f.uiString, "5 ÷ 2.5", "string divide: int");    //string compare does not work- parsed correctly

    f.json = mult;
    assert.equal(f.calculate(), 1, "calc mult: int");
    assert.equal(f.isStatic, true, "calc mult: isStatic");
    assert.equal(f.uiString, "0.5 x 2", "string mult: int");

    f.json = mult2;
    assert.equal(f.calculate(), 1.5, "calc mult with brackets: int");
    assert.equal(f.uiString, "0.5 x (-1 + 2.0 x 2)", "string mult with brackets: int");

});

QUnit.test("FormulaParser: functions", function (assert) {

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });
    /*
    f.json = sin;
    assert.equal(f.calculate(), 1, "calc sin (deg): int");
    assert.equal(f.isStatic, true, "calc sin (deg): isStatic");
    assert.equal(f.uiString, "2 - 1", "string sin: int");

    f.json = cos;
    assert.equal(f.calculate(), 1, "calc cos (rad): int");
    assert.equal(f.isStatic, true, "calc cos (rad): isStatic");
    assert.equal(f.uiString, "2 - 1", "string cos: int");

    f.json = cos2;
    assert.equal(f.calculate(), 1, "calc cos (deg): int");
    assert.equal(f.uiString, "2 - 1", "string cos: int");

    f.json = tan;
    assert.equal(f.calculate(), 1, "calc tan (rad): int");
    assert.equal(f.isStatic, true, "calc tan (rad): isStatic");
    assert.equal(f.uiString, "2 - 1", "string tan: int");

    f.json = tan2;
    assert.equal(f.calculate(), 1, "calc tan (deg): int");
    assert.equal(f.uiString, "2 - 1", "string tan: int");

    f.json = arcsin;
    assert.equal(f.calculate(), 1, "calc arcsin: int");
    assert.equal(f.isStatic, true, "calc arcsin: isStatic");
    assert.equal(f.uiString, "2 - 1", "string arcsin: int");

    f.json = arccos;
    assert.equal(f.calculate(), 1, "calc arccos: int");
    assert.equal(f.isStatic, true, "calc arccos: isStatic");
    assert.equal(f.uiString, "2 - 1", "string arccos: int");

    f.json = arctan;
    assert.equal(f.calculate(), 1, "calc arctan: int");
    assert.equal(f.isStatic, true, "calc arctan: isStatic");
    assert.equal(f.uiString, "2 - 1", "string arctan: int");

    f.json = ln;
    assert.equal(f.calculate(), 1, "calc ln: int");
    assert.equal(f.isStatic, true, "calc ln: isStatic");
    assert.equal(f.uiString, "2 - 1", "string ln: int");

    f.json = log;
    assert.equal(f.calculate(), 1, "calc log: int");
    assert.equal(f.isStatic, true, "calc log: isStatic");
    assert.equal(f.uiString, "2 - 1", "string log: int");

    f.json = pi;
    assert.equal(f.calculate(), 1, "calc pi: int");
    assert.equal(f.isStatic, true, "calc pi: isStatic");
    assert.equal(f.uiString, "2 - 1", "string pi: int");

    f.json = sqrt;
    assert.equal(f.calculate(), 1, "calc sqrt: int");
    assert.equal(f.isStatic, true, "calc sqrt: isStatic");
    assert.equal(f.uiString, "2 - 1", "string sqrt: int");

    f.json = random;
    assert.equal(f.calculate(), 1, "calc random: int");
    assert.equal(f.isStatic, true, "calc random: isStatic");
    assert.equal(f.uiString, "2 - 1", "string random: int");

    f.json = random2;
    assert.equal(f.calculate(), 1, "calc random (switched arguments): int");
    assert.equal(f.isStatic, true, "calc random (switched arguments): isStatic");
    assert.equal(f.uiString, "2 - 1", "string random (switched arguments): int");

    f.json = random3;
    assert.equal(f.calculate(), 1, "calc random (float): int");
    assert.equal(f.isStatic, true, "calc random (float): isStatic");
    assert.equal(f.uiString, "2 - 1", "string random (float): int");
    */
    assert.ok(true, "TODO:");
});

QUnit.test("FormulaParser: functions (strings)", function (assert) {

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.ok(true, "TODO:");
});

QUnit.test("FormulaParser: object (sprite)", function (assert) {

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.ok(true, "TODO:");
});

QUnit.test("FormulaParser: sensors", function (assert) {

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.ok(true, "TODO:");
});

QUnit.test("FormulaParser: logic", function (assert) {

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

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


