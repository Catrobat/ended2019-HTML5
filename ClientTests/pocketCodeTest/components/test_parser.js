/// <reference path="../../qunit/qunit-1.18.0.js" />
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
/// <reference path="../../../Client/pocketCode/scripts/component/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/component/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />

/// <reference path="../_resources/testDataProjects.js" />
'use strict';

QUnit.module("parser.js");


QUnit.test("FormulaParser: operators", function (assert) {

    assert.throws(function () { PocketCode.FormulaParser.getUiString(plus); }, Error, "ERROR: accessing uiString without providing variable names");
    assert.throws(function () { var parser = new PocketCode.FormulaParser(); }, Error, "ERROR: static, no class definition/constructor");
    assert.throws(function () { PocketCode.FormulaParser instanceof PocketCode.FormulaParser }, Error, "ERROR: static class: no instanceof allowed");

    //disposing without efect on the object
    var isStatic = PocketCode.FormulaParser._isStatic;
    PocketCode.FormulaParser.dispose()
    assert.ok(PocketCode.FormulaParser._isStatic != undefined && PocketCode.FormulaParser._isStatic === isStatic, "dispose: no effect");

    assert.notEqual((PocketCode.FormulaParser.parseJson(null)).calculate, undefined, "check created function on null value");
    assert.equal((PocketCode.FormulaParser.parseJson(null)).calculate(), undefined, "return 'undefined' for null values (json)");

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    program._sprites.push(sprite);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.throws(function () { f.json = unknown_type; }, Error, "ERROR: unknown type");
    assert.throws(function () { f.json = unknown_operator; }, Error, "ERROR: unknown operator");
    assert.throws(function () { f.json = unknown_function; }, Error, "ERROR: unknown function");
    assert.throws(function () { f.json = unknown_sensor; }, Error, "ERROR: unknown sensor");

    //interfaces: device + sprite
    assert.ok(device.accelerationX !== undefined && device.accelerationY !== undefined && device.accelerationZ !== undefined && device.compassDirection !== undefined && device.inclinationX !== undefined && device.inclinationY !== undefined && device.loudness !== undefined && device.faceDetected !== undefined && device.faceSize !== undefined && device.facePositionX !== undefined && device.facePositionY !== undefined, "interface: device");
    assert.ok(sprite.brightness !== undefined && sprite.transparency !== undefined && sprite.layer !== undefined && sprite.direction !== undefined && sprite.size !== undefined && sprite.positionX !== undefined && sprite.positionY !== undefined, "interface: sprite");


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
    assert.equal(f.uiString, "5 ÷ 2.5", "string divide: int");    //string compare does not work- parsed correctly
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

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = sin;
    assert.equal(Math.round(f.calculate() * 100) / 100, 1, "calc sin (deg)");
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
    assert.equal(f.uiString, "tan(pi ÷ 2)", "string tan"); //checked and ok-> ÷ compare failed
    assert.ok(f.uiString.substr(0, 7), "tan(pi ", "string tan");

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

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

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
    sprite._variables = [{ id: "s11", name: "variableName" }];
    sprite.__variablesSimple._variables.s11.value = s11;  //test length operation

    f.json = length;    //hello world
    assert.equal(f.calculate(), 11, "string length");
    assert.equal(f.isStatic, true, "string length: isStatic");
    assert.equal(f.uiString, "length('hello world')", "string length: toString");

    f.json = length2;   //now we use s11
    assert.equal(f.calculate(), 21, "string length from variable: " + f.calculate());
    assert.equal(f.isStatic, false, "string length from variable: isStatic");
    assert.equal(f.uiString, "length(\"variableName\")", "string length from variable: toString");

    f.json = length3;
    assert.equal(f.calculate(), 0, "string length from empty string: " + f.calculate());
    assert.equal(f.isStatic, true, "string length from empty string: isStatic");
    assert.equal(f.uiString, "length()", "string length from empty string: toString");

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

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    program._sprites.push(sprite);
    //init sprite: test data
    sprite._positionX = 3;
    sprite._positionY = 4;
    sprite._transparency = 46;
    sprite._brightness = 123;
    sprite._size = 84;
    sprite._direction = 34;


    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = object_x;
    assert.equal(f.calculate(), 6, "OBJECT_X: formula");
    assert.equal(f.isStatic, false, "OBJECT_X: isStatic");
    assert.equal(f.uiString, "position_x x (1 + 1.00)", "OBJECT_X: toString");

    f.json = object_y;
    assert.equal(f.calculate(), 6, "OBJECT_Y: formula");
    assert.equal(f.isStatic, false, "OBJECT_Y: isStatic");
    assert.equal(f.uiString, "position_y + 2", "OBJECT_Y: toString");

    f.json = ghostEffect;
    assert.equal(f.calculate(), 0.46, "transparency: formula");
    assert.equal(f.isStatic, false, "transparency: isStatic");
    assert.equal(f.uiString, "transparency ÷ 100", "transparency: toString");

    f.json = brightness;
    assert.equal(f.calculate(), 246, "brightness: formula");
    assert.equal(f.isStatic, false, "brightness: isStatic");
    assert.equal(f.uiString, "brightness x 2", "brightness: toString");

    f.json = object_size;
    assert.equal(f.calculate(), 0.84, "object_size: formula");
    assert.equal(f.isStatic, false, "object_size: isStatic");
    assert.equal(f.uiString, "size ÷ 100", "object_size: toString");

    f.json = object_rotation;
    assert.equal(f.calculate(), -56, "object_rotation: formula");
    assert.equal(f.isStatic, false, "object_rotation: isStatic");
    assert.equal(f.uiString, "direction - 90", "object_rotation: toString");

    f.json = object_rotation2;
    assert.equal(f.calculate(), 394, "object_rotation > 360: formula");
    assert.equal(f.isStatic, false, "object_rotation > 360: isStatic");
    assert.equal(f.uiString, "direction + 360", "object_rotation > 360: toString");

    f.json = object_layer;
    assert.equal(f.calculate(), 1.5, "object_layer: formula");
    assert.equal(f.isStatic, false, "object_layer: isStatic");
    assert.equal(f.uiString, "layer x 1.5", "object_layer: toString");

});

QUnit.test("FormulaParser: sensors", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    //manual tests required as values cannot be compared (change at any time if supported)
    //tests check on numeric values only, but tests should fail on uiString if properties are not available (wrong mapping) 
    f.json = acceleration_x;
    assert.ok(typeof f.calculate() === 'number', "X_ACCELERATION: formula return type");
    assert.equal(f.isStatic, false, "X_ACCELERATION: isStatic");
    assert.equal(f.uiString, "acceleration_x x (1 + 1 - 1)", "X_ACCELERATION: toString");

    f.json = acceleration_y;
    assert.ok(typeof f.calculate() === 'number', "Y_ACCELERATION: formula return type");
    assert.equal(f.isStatic, false, "Y_ACCELERATION: isStatic");
    assert.equal(f.uiString, "acceleration_y x 1", "Y_ACCELERATION: toString");

    f.json = acceleration_z;
    assert.ok(typeof f.calculate() === 'number', "Z_ACCELERATION: formula return type");
    assert.equal(f.isStatic, false, "Z_ACCELERATION: isStatic");
    assert.equal(f.uiString, "acceleration_z x 1", "Z_ACCELERATION: toString");

    f.json = compass;
    assert.ok(typeof f.calculate() === 'number', "COMPASS_DIRECTION: formula return type");
    assert.equal(f.isStatic, false, "COMPASS_DIRECTION: isStatic");
    assert.equal(f.uiString, "compass_direction x 1.0", "COMPASS_DIRECTION: toString");

    f.json = inclination_x;
    assert.ok(typeof f.calculate() === 'number', "X_INCLINATION: formula return type");
    assert.equal(f.isStatic, false, "X_INCLINATION: isStatic");
    assert.equal(f.uiString, "inclination_x x 1.0 + 2", "X_INCLINATION: toString");

    f.json = inclination_y;
    assert.ok(typeof f.calculate() === 'number', "Y_INCLINATION: formula return type");
    assert.equal(f.isStatic, false, "Y_INCLINATION: isStatic");
    assert.equal(f.uiString, "inclination_y x (1.0 + 2.5)", "Y_INCLINATION: toString");

    f.json = loudness;
    assert.ok(typeof f.calculate() === 'number', "LOUDNESS: formula return type");
    assert.equal(f.isStatic, false, "LOUDNESS: isStatic");
    assert.equal(f.uiString, "loudness x (1.0 - 0.5)", "LOUDNESS: toString");

    //face detection
    f.json = face_detect;
    assert.ok(typeof f.calculate() === 'boolean', "FACE_DETECTED: formula return type");
    assert.equal(f.isStatic, false, "FACE_DETECTED: isStatic");
    assert.equal(f.uiString, "is_face_detected AND TRUE", "FACE_DETECTED: toString");

    f.json = face_size;
    assert.ok(typeof f.calculate() === 'number', "FACE_SIZE: formula return type");
    assert.equal(f.isStatic, false, "FACE_SIZE: isStatic");
    assert.equal(f.uiString, "face_size x 1.0", "FACE_SIZE: toString");

    f.json = face_pos_x;
    assert.ok(typeof f.calculate() === 'number', "FACE_X_POSITION: formula return type");
    assert.equal(f.isStatic, false, "FACE_X_POSITION: isStatic");
    assert.equal(f.uiString, "face_x_position x 1.0", "FACE_X_POSITION: toString");

    f.json = face_pos_y;
    assert.ok(typeof f.calculate() === 'number', "FACE_Y_POSITION: formula return type");
    assert.equal(f.isStatic, false, "FACE_Y_POSITION: isStatic");
    assert.equal(f.uiString, "face_y_position + (3 x 3 - 9)", "FACE_Y_POSITION: toString");

    //TODO: assert.ok(false, "MISSING: led on/of + vibration?");
    //TODO: recheck sensor strings
});

QUnit.test("FormulaParser: logic", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = equal;
    assert.equal(f.calculate(), true, "EQUAL int: formula");
    assert.equal(f.isStatic, true, "EQUAL int: isStatic");
    assert.equal(f.uiString, "2 = (2 x 1)", "EQUAL int: toString");

    f.json = equal2;
    assert.equal(f.calculate(), false, "EQUAL float: formula");
    //assert.equal(f.isStatic, false, "EQUAL float: isStatic");
    assert.equal(f.uiString, "2 = (2 x 2.02 - 2)", "EQUAL float: toString");

    f.json = equal3;
    assert.equal(f.calculate(), false, "EQUAL bool: formula");
    //assert.equal(f.isStatic, false, "EQUAL bool: isStatic");
    assert.equal(f.uiString, "TRUE = FALSE", "EQUAL bool: toString");

    f.json = not_equal;
    assert.equal(f.calculate(), true, "NOT_EQUAL: formula");
    assert.equal(f.isStatic, true, "NOT_EQUAL: isStatic");
    assert.equal(f.uiString, "TRUE ≠ FALSE", "NOT_EQUAL: toString");

    f.json = greater_than;
    assert.equal(f.calculate(), true, "GREATER_THAN: formula");
    assert.equal(f.isStatic, true, "GREATER_THAN: isStatic");
    assert.equal(f.uiString, "1.0001 > 1", "GREATER_THAN: toString");

    f.json = smaller_than;
    assert.equal(f.calculate(), false, "SMALLER_THAN: formula");
    assert.equal(f.isStatic, true, "SMALLER_THAN: isStatic");
    assert.equal(f.uiString, "1.0001 < 1", "SMALLER_THAN: toString");

    f.json = smallerOrEqual;
    assert.equal(f.calculate(), true, "SMALLER_OR_EQUAL: formula");
    assert.equal(f.isStatic, true, "SMALLER_OR_EQUAL: isStatic");
    assert.equal(f.uiString, "0.0 ≤ 0", "SMALLER_OR_EQUAL: toString");

    f.json = logicalAnd;
    assert.equal(f.calculate(), false, "LOGICAL_AND: formula");
    assert.equal(f.isStatic, true, "LOGICAL_AND: isStatic");
    assert.equal(f.uiString, "FALSE AND FALSE", "LOGICAL_AND: toString");

    f.json = logicalOr;
    assert.equal(f.calculate(), true, "LOGICAL_OR: formula");
    assert.equal(f.isStatic, true, "LOGICAL_OR: isStatic");
    assert.equal(f.uiString, "TRUE OR TRUE", "LOGICAL_OR: toString");

    f.json = not;
    assert.equal(f.calculate(), true, "LOGICAL_NOT: formula");
    assert.equal(f.isStatic, true, "LOGICAL_NOT: isStatic");
    assert.equal(f.uiString, "TRUE ≠  NOT TRUE", "LOGICAL_NOT: toString");

    f.json = greaterOrEqual;
    assert.equal(f.calculate(), true, "GREATER_OR_EQUAL: formula");
    assert.equal(f.isStatic, true, "GREATER_OR_EQUAL: isStatic");
    assert.equal(f.uiString, "6 ≥ 3", "GREATER_OR_EQUAL: toString");


});

QUnit.test("BrickFactory", function (assert) {

    var allBricksProject = project1;    //using tests_testData.js
    //^^ includes all types of bricks 

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager([]);

    var device = new PocketCode.Device();
    var program = new PocketCode.GameEngine(allBricksProject.id);
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var bf = new PocketCode.BrickFactory(device, program, broadcastMgr, soundMgr, allBricksProject.header.bricksCount);
    assert.ok(bf instanceof PocketCode.BrickFactory, "instance created");

    assert.ok(bf._device === device && bf._gameEngine === program && bf._broadcastMgr === broadcastMgr && bf._soundMgr === soundMgr && bf._total === allBricksProject.header.bricksCount, "properties set correctly");

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
    sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    allBricksProject.background.bricks.push({ "broadcastMsgId": "s50", "type": "BroadcastAndWaitUnknown" });
    allBricksProject.background.bricks.push({ "broadcastMsgId": "s51", "type": "Unsupported" });
    allBricksProject.header.bricksCount += 2;

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager([]);

    var device = new PocketCode.Device();
    var program = new PocketCode.GameEngine(allBricksProject.id);
    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var bf = new PocketCode.BrickFactory(device, program, broadcastMgr, soundMgr, allBricksProject.header.bricksCount);
    assert.ok(bf instanceof PocketCode.BrickFactory, "instance created");

    assert.ok(bf._device === device && bf._gameEngine === program && bf._broadcastMgr === broadcastMgr && bf._soundMgr === soundMgr && bf._total === allBricksProject.header.bricksCount, "properties set correctly");

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

QUnit.test("SpriteFactory", function (assert) {

    var allBricksProject = project1;    //using tests_testData.js
    //^^ includes all types of bricks 

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager([]);

    var device = new PocketCode.Device();
    var program = new PocketCode.GameEngine(allBricksProject.id);
    //var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });

    var sf = new PocketCode.SpriteFactory(device, program, broadcastMgr, soundMgr, allBricksProject.header.bricksCount);

    assert.ok(sf instanceof PocketCode.SpriteFactory, "instance check");
    assert.ok(sf._brickFactory instanceof PocketCode.BrickFactory, "brick factory created");
    assert.equal(sf._program, program, "program set correctly");

    assert.equal(sf.onProgressChange, sf._brickFactory.onProgressChange, "onProgressChange event mapped");
    assert.equal(sf.onUnsupportedBricksFound, sf._brickFactory.onUnsupportedBricksFound, "onUnsupportedBricksFound event mapped");

    assert.throws(function () { sf.create([]); }, Error, "ERROR: invalid argument");
});


