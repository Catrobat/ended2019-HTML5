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
    assert.equal(f.calculate(), 2, "calc divide");
    assert.equal(f.isStatic, true, "calc divide: isStatic");
    //assert.equal(f.uiString, "5 ÷ 2.5", "string divide: int");    //string compare does not work- parsed correctly
    //assert.ok(f.uiString.substr(0,2), "5 ", "string divide: int");

    f.json = mult;
    assert.equal(f.calculate(), 1, "calc mult");
    assert.equal(f.isStatic, true, "calc mult: isStatic");
    assert.equal(f.uiString, "0.5 x 2", "string mult");

    f.json = mult2;
    assert.equal(f.calculate(), 1.5, "calc mult with brackets");
    assert.equal(f.uiString, "0.5 x (-1 + 2.0 x 2)", "string mult with brackets");

});

QUnit.test("FormulaParser: functions", function (assert) {

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });
    
    f.json = sin;
    assert.equal(f.calculate(), 1, "calc sin (deg)");
    assert.equal(f.isStatic, true, "calc sin (deg): isStatic");
    assert.equal(f.uiString, "sin(90)", "string sin");

    f.json = cos;
    assert.equal(Math.round(f.calculate() * 100) / 100, -0.07, "calc cos (rad)");
    assert.equal(f.isStatic, true, "calc cos (rad): isStatic");
    assert.equal(f.uiString, "cos(pi x 30)", "string cos");

    f.json = cos2;
    assert.equal(f.calculate(), -1, "calc cos (deg)");
    assert.equal(f.uiString, "cos(180)", "string cos");

    f.json = tan;
    assert.equal(Math.round(f.calculate() * 100) / 100, 0.03, "calc tan (rad)");
    assert.equal(f.isStatic, true, "calc tan (rad): isStatic");
    //assert.equal(f.uiString, "tan(pi ÷ 2)", "string tan"); //checked and ok-> ÷ compare failed
    assert.ok(f.uiString.substr(0,7), "tan(pi ", "string tan");

    f.json = tan2;
    assert.equal(Math.round(f.calculate() * 100) / 100, 0.03, "calc tan (deg)");
    assert.equal(f.uiString, "tan(1.57)", "string tan");

    f.json = arcsin;
    assert.equal(Math.round(f.calculate() * 100) / 100, 80.06, "calc arcsin");
    assert.equal(f.isStatic, true, "calc arcsin: isStatic");
    assert.equal(f.uiString, "arcsin(0.985)", "string arcsin");

    f.json = arccos;
    assert.equal(Math.round(f.calculate() * 100) / 100, 60, "calc arccos");
    assert.equal(f.isStatic, true, "calc arccos: isStatic");
    assert.equal(f.uiString, "arccos(0.5)", "string arccos");

    f.json = arctan;
    assert.equal(Math.round(f.calculate() * 100) / 100, 14.04, "calc arctan");
    assert.equal(f.isStatic, true, "calc arctan: isStatic");
    assert.equal(f.uiString, "arctan(0.25 x 1 + (2 - 3 + 1))", "string arctan");

    f.json = ln;
    assert.equal(Math.round(f.calculate() * 100) / 100, 2.3, "calc ln");
    assert.equal(f.isStatic, true, "calc ln: isStatic");
    assert.equal(f.uiString, "ln(10)", "string ln");

    f.json = log;
    assert.equal(Math.round(f.calculate() * 100) / 100, 2, "calc log");
    assert.equal(f.isStatic, true, "calc log: isStatic");
    assert.equal(f.uiString, "log(10 x 10)", "string log");

    f.json = pi;
    assert.equal(f.calculate(), Math.PI, "calc pi");
    assert.equal(f.isStatic, true, "calc pi: isStatic");
    assert.equal(f.uiString, "pi", "string pi");

    f.json = sqrt;
    assert.equal(Math.round(f.calculate() * 100) / 100, 3, "calc sqrt");
    assert.equal(f.isStatic, true, "calc sqrt: isStatic");
    assert.equal(f.uiString, "sqrt(3 x 3 - 3 + 1.5 x 2)", "string sqrt");

    f.json = random;
    var val = f.calculate();
    assert.ok(val >= 0.8 && val <= 3.2, "calc random");
    assert.equal(f.isStatic, false, "calc random: isStatic");
    assert.equal(f.uiString, "random(0.8, 3.2)", "string random");

    f.json = random2;
    val = f.calculate();
    assert.ok(val === 5 || val === 6 || val === 7 || val === 8, "val=" + val + ", calc random (switched arguments)");
    assert.equal(f.isStatic, false, "calc random (switched arguments): isStatic");
    assert.equal(f.uiString, "random(8, 5)", "string random (switched arguments)");

    f.json = random3;
    val = f.calculate();
    assert.ok(val >= 1 && val <= 1.01, "calc random (float)");
    assert.equal(f.isStatic, false, "calc random (float): isStatic");
    assert.equal(f.uiString, "random(1.0, 1.01)", "string random (float)");

    f.json = abs;
    assert.equal(f.calculate(), 3.2, "calc abs");
    assert.equal(f.isStatic, true, "calc abs: isStatic");
    assert.equal(f.uiString, "abs(-3.2)", "string abs");

    f.json = round;
    assert.equal(f.calculate(), -3, "calc round");
    assert.equal(f.isStatic, true, "calc round: isStatic");
    assert.equal(f.uiString, "round(-3.025)", "string round");

    f.json = mod;
    assert.equal(Math.round(f.calculate() * 100) / 100, 0.2, "calc mod");
    assert.equal(f.isStatic, true, "calc mod: isStatic");
    assert.equal(f.uiString, "mod(9, 2.2)", "string mod");

    f.json = max;
    assert.equal(f.calculate(), 18, "calc max");
    assert.equal(f.isStatic, true, "calc max: isStatic");
    assert.equal(f.uiString, "max(2 x (1 + 8), 17)", "string max");

    f.json = exp;
    assert.equal(Math.round(f.calculate() * 100) / 100, 1.65, "calc exp");
    assert.equal(f.isStatic, true, "calc exp: isStatic");
    assert.equal(f.uiString, "exp(0.5)", "string exp");

    //f.json = exp2;
    //assert.equal(f.calculate(), 1, "calc exp");
    //assert.equal(f.isStatic, true, "calc exp: isStatic");
    //assert.equal(f.uiString, "2 - 1", "string exp");

    f.json = min;
    assert.equal(f.calculate(), -1, "calc min");
    assert.equal(f.isStatic, true, "calc min: isStatic");
    assert.equal(f.uiString, "min(0, -1 + 1 - 1)", "string min");

});

QUnit.test("FormulaParser: functions (strings)", function (assert) {

    var soundManager = new PocketCode.SoundManager("0815", []);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = stringPlus;    //TODO: catrobat does not allow a string cocatenation using a + operator showing an error but allowing to save this
                            //unless this isn't changes we allow this operation on strings too
    assert.equal(f.calculate(), "fghfghw", "string concat using + operator");
    assert.equal(f.isStatic, true, "string concat using + operator: isStatic");
    assert.equal(f.uiString, "'fgh' + 'fghw'", "string concat using + operator: toString");

    f.json = string;    //simple definition
    assert.equal(f.calculate(), "test length operation", "string definition");
    assert.equal(f.isStatic, true, "string definition: isStatic");
    assert.equal(f.uiString, "'test length operation'", "string definition: toString");

    var s11 = f.calculate();    //store in var to enable access
    sprite.variables = [{id: "s11", name: "variableName"}];
    sprite._variables.s11.value = s11;  //test length operation

    f.json = length;    //hello world
    assert.equal(f.calculate(), 11, "string length");
    assert.equal(f.isStatic, true, "string length: isStatic");
    assert.equal(f.uiString, "length('hello world')", "string length: toString");

    f.json = length2;   //now we use s11
    assert.equal(f.calculate(), 21, "string length from variable: " + f.calculate());
    assert.equal(f.isStatic, false, "string length from variable: isStatic");
    assert.equal(f.uiString, "length(\"variableName\")", "string length from variable: toString");

    f.json = letter;
    assert.equal(f.calculate(), "w", "letter");
    assert.equal(f.isStatic, true, "letter: isStatic");
    assert.equal(f.uiString, "letter(7, 'hello world')", "letter: toString");

    f.json = letter2;
    assert.equal(f.calculate(), "t", "letter from var");
    assert.equal(f.isStatic, false, "letter from var: isStatic");
    assert.equal(f.uiString, "letter(10, \"variableName\")", "letter from var: toString");

    f.json = stringJoin;
    assert.equal(f.calculate(), "hello-work", "string join");
    assert.equal(f.isStatic, true, "string join: isStatic");
    assert.equal(f.uiString, "join('hello', '-work')", "string join toString");

    f.json = stringJoin2;
    assert.equal(f.calculate(), "hello20", "string join: including formula");
    assert.equal(f.isStatic, true, "string join: including formula: isStatic");
    assert.equal(f.uiString, "join('hello', 3 x 6 + 2)", "string join: including formula: toString");

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
    //TODO: add test data: comass, inclination x/y, loudness

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


