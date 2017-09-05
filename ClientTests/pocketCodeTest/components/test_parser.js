/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/core.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/publishSubscribe.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/parser.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksControl.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksLook.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksMotion.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksSound.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksData.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/userVariableHost.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />

/// <reference path="../_resources/testDataProjects.js" />
'use strict';

QUnit.module("components/parser.js");


QUnit.test("FormulaParser: operators", function (assert) {

    assert.throws(function () { PocketCode.FormulaParser.parsei18nJson(plus); }, Error, "ERROR: accessing uiString without providing variable names");
    assert.throws(function () { PocketCode.FormulaParser.parsei18nJson(plus, ""); }, Error, "ERROR: accessing uiString without providing variable names as object");

    assert.throws(function () { PocketCode.FormulaParser.parsei18nJson(plus, {}); }, Error, "ERROR: accessing uiString without providing list names");
    assert.throws(function () { PocketCode.FormulaParser.parsei18nJson(plus, {}, ""); }, Error, "ERROR: accessing uiString without providing list names as object");

    assert.throws(function () { var parser = new PocketCode.FormulaParser(); }, Error, "ERROR: static, no class definition/constructor");
    assert.throws(function () { PocketCode.FormulaParser instanceof PocketCode.FormulaParser }, Error, "ERROR: static class: no instanceof allowed");

    //disposing without effect on the object
    var isStatic = PocketCode.FormulaParser._isStatic;
    PocketCode.FormulaParser.dispose();
    assert.ok(PocketCode.FormulaParser._isStatic != undefined && PocketCode.FormulaParser._isStatic === isStatic, "dispose: no effect");

    assert.notEqual((PocketCode.FormulaParser.parseJson(null)).calculate, undefined, "check created function on null value");
    assert.equal((PocketCode.FormulaParser.parseJson(null)).calculate(), undefined, "return 'undefined' for null values (json)");

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.throws(function () { f.json = unknown_type; }, Error, "ERROR: unknown type");
    assert.throws(function () { f.json = unknown_operator; }, Error, "ERROR: unknown operator");
    assert.throws(function () { f.json = unknown_function; }, Error, "ERROR: unknown function");
    assert.throws(function () { f.json = unknown_sensor; }, Error, "ERROR: unknown sensor");

    //interfaces: device + sprite
    assert.ok(device.accelerationX !== undefined && device.accelerationY !== undefined && device.accelerationZ !== undefined && device.compassDirection !== undefined && device.inclinationX !== undefined && device.inclinationY !== undefined && device.loudness !== undefined && device.faceDetected !== undefined && device.faceSize !== undefined && device.facePositionX !== undefined && device.facePositionY !== undefined, "interface: device");
    assert.ok(sprite.brightness !== undefined && sprite.transparency !== undefined && sprite.layer !== undefined && sprite.direction !== undefined && sprite.size !== undefined && sprite.positionX !== undefined && sprite.positionY !== undefined, "interface: sprite");

    //string to number conversion
    f.json = number2;
    assert.equal(f.calculate(), 5, "test with invalid number: string to number conversion");

    //operators
    f.json = plus;
    assert.deepEqual(f.json, plus, "json getter using property setter");

    f = new PocketCode.Formula(device, sprite, plus);   //using ctr setter
    assert.deepEqual(f.json, plus, "json getter using ctr setter");

    assert.equal(f.calculate(), 3, "calc plus: int");
    assert.equal(f.isStatic, true, "calc plus: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_plus", "PLUS i18nKey added");

    f.json = plus2;
    assert.equal(Math.round(f.calculate() * 100) / 100, 3.6, "plus: float");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_plus", "PLUS2 i18nKey added");

    //todo, not working
    //assert.throws(f.json = plus3, Error, "ERROR: string to number conversion failed");

    f.json = signed;
    assert.equal(Math.round(f.calculate() * 100) / 100, -3.6, "signed (negative)");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_plus", "PLUS2 i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_minus", "MINUS i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_operator_minus", "MINUS2 i18nKey added");

    f.json = minus;
    assert.equal(f.calculate(), 1, "calc minus: int");
    assert.equal(f.isStatic, true, "calc minus: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_minus", "MINUS3 i18nKey added");

    f.json = minus2;
    assert.equal(Math.round(f.calculate() * 100) / 100, 1.2, "calc minus: float");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_minus", "MINUS4 i18nKey added");

    f.json = divide;
    assert.equal(f.calculate(), 2, "calc divide");
    assert.equal(f.isStatic, true, "calc divide: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_divide", "DIVIDE i18nKey added");

    f.json = mult;
    assert.equal(f.calculate(), 1, "calc mult");
    assert.equal(f.isStatic, true, "calc mult: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_mult", "MULT i18nKey added");

    f.json = mult2;
    assert.equal(f.calculate(), 1.5, "calc mult with brackets");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_mult", "MULT2 i18nKey added");
    assert.equal(f.json.right.right.i18nKey, "formula_editor_operator_plus", "MULT2 PLUS i18nKey added");
    assert.equal(f.json.right.right.left.i18nKey, "formula_editor_operator_minus", "MULT2 MINUS i18nKey added");
    assert.equal(f.json.right.right.right.i18nKey, "formula_editor_operator_mult", "MULT2 MULT i18nKey added");
});


QUnit.test("FormulaParser: functions", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = sin;
    assert.equal(Math.round(f.calculate() * 100) / 100, 1, "calc sin (deg)");
    assert.equal(f.isStatic, true, "calc sin (deg): isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_sin", "SIN i18nKey added");

    f.json = cos;
    assert.equal(Math.round(f.calculate() * 100) / 100, -0.07, "calc cos (rad)");
    assert.equal(f.isStatic, true, "calc cos (rad): isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_cos", "COS i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_mult", "COS mult i18nKey added");
    assert.equal(f.json.left.left.i18nKey, "formula_editor_function_pi", "COS pi i18nKey added");

    f.json = cos2;
    assert.equal(f.calculate(), -1, "calc cos (deg)");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_cos", "COS2 i18nKey added");

    f.json = tan;
    assert.equal(Math.round(f.calculate() * 100) / 100, 0.03, "calc tan (rad)");
    assert.equal(f.isStatic, true, "calc tan (rad): isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_tan", "TAN i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_divide", "TAN divide i18nKey added");
    assert.equal(f.json.left.left.i18nKey, "formula_editor_function_pi", "TAN pi i18nKey added");

    f.json = tan2;
    assert.equal(Math.round(f.calculate() * 100) / 100, 0.03, "calc tan (deg)");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_tan", "TAN2 i18nKey added");

    f.json = arcsin;
    assert.equal(Math.round(f.calculate() * 100) / 100, 80.06, "calc arcsin");
    assert.equal(f.isStatic, true, "calc arcsin: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_arcsin", "ARCSIN i18nKey added");

    f.json = arccos;
    assert.equal(Math.round(f.calculate() * 100) / 100, 60, "calc arccos");
    assert.equal(f.isStatic, true, "calc arccos: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_arccos", "ARCCOS i18nKey added");

    f.json = arctan;
    assert.equal(Math.round(f.calculate() * 100) / 100, 14.04, "calc arctan");
    assert.equal(f.isStatic, true, "calc arctan: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_arctan", "ARCTAN i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_plus", "ARCTAN plus i18nKey added");
    assert.equal(f.json.left.left.i18nKey, "formula_editor_operator_mult", "ARCTAN mult i18nKey added");
    assert.equal(f.json.left.right.right.i18nKey, "formula_editor_operator_plus", "ARCTAN plus i18nKey added");
    assert.equal(f.json.left.right.right.left.i18nKey, "formula_editor_operator_minus", "ARCTAN minus i18nKey added");

    f.json = ln;
    assert.equal(Math.round(f.calculate() * 100) / 100, 2.3, "calc ln");
    assert.equal(f.isStatic, true, "calc ln: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_ln", "LN i18nKey added");

    f.json = log;
    assert.equal(Math.round(f.calculate() * 100) / 100, 2, "calc log");
    assert.equal(f.isStatic, true, "calc log: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_log", "LOG i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_mult", "LOG mult i18nKey added");

    f.json = pi;
    assert.equal(f.calculate(), Math.PI, "calc pi");
    assert.equal(f.isStatic, true, "calc pi: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_pi", "PI i18nKey added");

    f.json = sqrt;
    assert.equal(Math.round(f.calculate() * 100) / 100, 3, "calc sqrt");
    assert.equal(f.isStatic, true, "calc sqrt: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_sqrt", "SQRT i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_plus", "SQRT plus i18nKey added");
    assert.equal(f.json.left.right.i18nKey, "formula_editor_operator_mult", "SQRT mult i18nKey added");
    assert.equal(f.json.left.left.i18nKey, "formula_editor_operator_minus", "SQRT minus i18nKey added");
    assert.equal(f.json.left.left.left.i18nKey, "formula_editor_operator_mult", "SQRT mult i18nKey added");

    f.json = random;
    var val = f.calculate();
    assert.ok(val >= 0.8 && val <= 3.2, "calc random");
    assert.equal(f.isStatic, false, "calc random: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_rand", "RAND i18nKey added");
    assert.notEqual(f.json.left, undefined, "RAND left is not undefined");
    assert.notEqual(f.json.right, undefined, "RAND right is not undefined");

    f.json = random2;
    val = f.calculate();
    assert.ok(val === 5 || val === 6 || val === 7 || val === 8, "val=" + val + ", calc random (switched arguments)");
    assert.equal(f.isStatic, false, "calc random (switched arguments): isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_rand", "RAND i18nKey added");
    assert.equal(f.json.left.value, 8, "RAND left change value");
    assert.equal(f.json.right.value, 5, "RAND right change value");

    f.json = random3;
    val = f.calculate();
    assert.ok(val >= 1 && val <= 1.01, "calc random (float)");
    assert.equal(f.isStatic, false, "calc random (float): isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_rand", "RAND i18nKey added");

    f.json = randomCombined;
    val = f.calculate();
    assert.ok(val === 1 || val === 3 || val === 7 || val === 9, "val=" + val + ", multiple random values added together");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_plus", "RANDCOMB plus i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_operator_mult", "RANDCOMB mult i18nKey added");
    assert.equal(f.json.right.right.i18nKey, "formula_editor_function_rand", "RANDCOMB rand i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_plus", "RANDCOMB plus i18nKey added");
    assert.equal(f.json.left.left.i18nKey, "formula_editor_operator_mult", "RANDCOMB mult i18nKey added");
    assert.equal(f.json.left.left.right.i18nKey, "formula_editor_function_rand", "RANDCOMB rand i18nKey added");

    f.json = abs;
    assert.equal(f.calculate(), 3.2, "calc abs");
    assert.equal(f.isStatic, true, "calc abs: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_abs", "ABS  i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_minus", "ABS minus i18nKey added");

    f.json = round;
    assert.equal(f.calculate(), -3, "calc round");
    assert.equal(f.isStatic, true, "calc round: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_round", "ROUND i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_minus", "ROUND minus i18nKey added");

    f.json = mod;
    assert.equal(Math.round(f.calculate() * 100) / 100, 0.2, "calc mod");
    assert.equal(f.isStatic, true, "calc mod: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_mod", "MOD i18nKey added");

    f.json = exp;
    assert.equal(Math.round(f.calculate() * 100) / 100, 1.65, "calc exp");
    assert.equal(f.isStatic, true, "calc exp: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_exp", "EXP i18nKey added");
    assert.notEqual(f.json.left, undefined, "EXP left not undefined");
    assert.equal(f.json.right, undefined, "EXP right undefined");

    f.json = power;
    assert.equal(f.calculate(), 9, "calc powere");
    assert.equal(f.isStatic, true, "calc power: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_power", "POWER i18nKey added");

    f.json = floor;
    assert.equal(f.calculate(), -4, "calc floor");
    assert.equal(f.isStatic, true, "calc floor: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_floor", "FLOOR i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_minus", "FLOOR minus i18nKey added");

    f.json = ceil;
    assert.equal(f.calculate(), -3, "calc ceil");
    assert.equal(f.isStatic, true, "calc ceil: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_ceil", "CEIL i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_minus", "CEIL minus i18nKey added");

    f.json = max;
    assert.equal(f.calculate(), 18, "calc max");
    assert.equal(f.isStatic, true, "calc max: isStatic");//f.toString();
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_max", "MAX i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_operator_mult", "MAX mult i18nKey added");
    assert.equal(f.json.left.right.right.i18nKey, "formula_editor_operator_plus", "MAX plus i18nKey added");

    f.json = max_NaN_left;
    assert.equal(f.calculate(), 1, "calc max: left = NaN");
    f.json = max_NaN_right;
    assert.equal(f.calculate(), 1, "calc max: right = NaN");
    f.json = max_NaN;
    assert.equal(f.calculate(), undefined, "calc max: both arguments are NaN");

    //f.json = exp2;
    //assert.equal(f.calculate(), 1, "calc exp");
    //assert.equal(f.isStatic, true, "calc exp: isStatic");
    //assert.equal(f.toString(), "2 - 1", "string exp");

    f.json = min;
    assert.equal(f.calculate(), -1, "calc min");
    assert.equal(f.isStatic, true, "calc min: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_min", "MIN i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_operator_minus", "MIN minus i18nKey added");
    assert.equal(f.json.right.left.i18nKey, "formula_editor_operator_plus", "MIN plus i18nKey added");
    assert.equal(f.json.right.left.left.i18nKey, "formula_editor_operator_minus", "MIN minus i18nKey added");

    f.json = min_NaN_left;
    assert.equal(f.calculate(), 2, "calc min: left = NaN");
    f.json = min_NaN_right;
    assert.equal(f.calculate(), 2, "calc min: right = NaN");
    f.json = min_NaN;
    assert.equal(f.calculate(), undefined, "calc min: both arguments are NaN");

    f.json = arduino_analog_pin;
    assert.equal(f.calculate(), 0, "calc arduino_analog_pin");
    assert.equal(f.isStatic, false, "calc arduino_analog_pin: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_arduino_read_pin_value_analog", "ARDUINO ANALOG i18nKey added");

    f.json = arduino_digital_pin;
    assert.equal(f.calculate(), 0, "calc arduino_digital_pin");
    assert.equal(f.isStatic, false, "calc arduino_digital_pin: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_arduino_read_pin_value_digital", "ARDUINO DIGITAL i18nKey added");
});


QUnit.test("FormulaParser: functions (strings)", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = stringPlus;    //TODO: catrobat does not allow a string cocatenation using a + operator showing an error but allowing to save this
    //unless this isn't changes we allow this operation on strings too
    assert.equal(f.calculate(), 'fghfghw', "string concat using + operator: allowed");
    assert.equal(f.isStatic, true, "string concat using + operator: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_plus", "STRING PLUS i18nKey added");

    f.json = string;    //simple definition
    assert.equal(f.calculate(), "test length operation", "string definition");
    assert.equal(f.isStatic, true, "string definition: isStatic");
    f.toString();
    assert.equal(f.json.left, undefined, "STRING left undefined");
    assert.equal(f.json.right, undefined, "STRING right undefined");

    var s11 = f.calculate();    //store in var to enable access
    sprite._variables = [{ id: "s11", name: "variableName" }];
    sprite.getVariable("s11").value = s11;

    f.json = length;    //hello world
    assert.equal(f.calculate(), 11, "string length");
    assert.equal(f.isStatic, true, "string length: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added");

    f.json = length2;   //now we use s11 = "test length operation"
    assert.equal(f.calculate(), 21, "string length from variable: " + f.calculate());
    assert.equal(f.isStatic, false, "string length from variable: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added");
    assert.equal(f.json.left.objRef.type, "1", "objRef.type = local (1)");
    assert.equal(f.json.left.objRef.name, "variableName", "objRef.name = variableName");
    assert.equal(f.json.left.objRef.id, "s11", "objRef.id = s11");


    f.json = length3;
    assert.equal(f.calculate(), 0, "string length from empty string: " + f.calculate());
    assert.equal(f.isStatic, true, "string length from empty string: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added");

    f.json = letter;
    assert.equal(f.calculate(), "w", "letter");
    assert.equal(f.isStatic, true, "letter: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_letter", "LETTER i18nKey added");

    f.json = letter2;
    assert.equal(f.calculate(), "t", "letter from var");
    assert.equal(f.isStatic, false, "letter from var: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_letter", "LETTER2 i18nKey added");
    assert.equal(f.json.right.objRef.type, "1", "objRef.type = local (1)");

    f.json = stringJoin;
    assert.equal(f.calculate(), "hello-work", "string join");
    assert.equal(f.isStatic, true, "string join: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_join", "JOIN i18nKey added");

    f.json = stringJoin2;
    assert.equal(f.calculate(), "hello20", "string join: including formula");
    assert.equal(f.isStatic, true, "string join: including formula: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_join", "JOIN2 i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_operator_plus", "JOIN2 plus i18nKey added");
    assert.equal(f.json.right.left.i18nKey, "formula_editor_operator_mult", "JOIN2 mult i18nKey added");

    f.json = number;
    var nr = f.calculate();
    var lst = [];
    lst.push(nr);
    sprite._lists = [{ id: "s22", name: "listName" }];
    sprite.getList("s22")._value = lst;

    gameEngine._lists = [{ id: "s23", name: "global23" }]; //global
    gameEngine.getList("s23").value = "global";
    gameEngine.getList("s23")._value = lst;

    var uvh2 = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, sprite);
    uvh2._lists = [{ id: "s24", name: "procedure24" }]; //procedure
    uvh2.getList("s24").value = "procedure";
    uvh2.getList("s24")._value = lst;

    f.json = numberOfItems;
    assert.equal(f.calculate(), 1, "number of list elements");
    assert.equal(f.isStatic, false, "number of elements: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_number_of_items", "NUMBER OF ITEMS i18nKey added");
    assert.equal(f.json.left.objRef.type, "1", "objRef.type = local (1)");

    f.json = numberOfItems2;
    assert.equal(f.calculate(), 1, "number of list elements");
    assert.equal(f.isStatic, false, "number of elements: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_number_of_items", "NUMBER OF ITEMS i18nKey added");
    assert.equal(f.json.left.objRef.type, "2", "objRef.type = global (2)");

    //todo not working. procedure/lists
    //f.json = numberOfItems3;
    //assert.equal(f.calculate(), 1, "number of list elements");
    //f.toString();
    //assert.equal(f.json.i18nKey, "formula_editor_function_number_of_items", "NUMBER OF ITEMS i18nKey added");
    //assert.equal(f.json.left.objRef.type, "3", "objRef.type = procedure (3)");

    f.json = listItem;
    assert.equal(f.calculate(), 1.0, "get list element at position");
    assert.equal(f.isStatic, false, "get list element: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_list_item", "LIST ITEMS i18nKey added");
    assert.equal(f.json.right.objRef.type, "1", "objRef.type = local (1)");

    f.json = contains;
    assert.equal(f.calculate(), true, "check if list contains element");
    assert.equal(f.isStatic, false, "list contains: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_contains", "CONTAINS i18nKey added");
    assert.equal(f.json.left.objRef.type, "1", "objRef.type = local (1)");

    //lookup variable names
    //global
    gameEngine._variables = [{ id: "s11", name: "global1" }, { id: "s12", name: "global2" }]; //global
    gameEngine.getVariable("s11").value = "global";
    sprite._variables = [{ id: "s13", name: "local1" }, { id: "s14", name: "local2" }]; //local
    var uvh = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, sprite);
    uvh._variables = [{ id: "s15", name: "proc1" }, { id: "s16", name: "proc2" }]; //procedure

    f.json = length4;   //use s11 //todo? (gleichen object in testDataFormula)
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added, global var lookup (from sprite)");
    assert.equal(f.json.left.objRef.type, "2", "objRef.type = global (2)");
    assert.equal(f.calculate(), 6, "call calculate local with global lookup");
    f.json = length5;
    f.toString(uvh);
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added, global var lookup (from procedure)");
    assert.equal(f.json.left.objRef.type, "2", "objRef.type = global (2)");
    assert.equal(f.calculate(uvh), 6, "call calculate with procedure uvh: global lookup");

    sprite._variables = [{ id: "s11", name: "local1" }, { id: "s12", name: "global2" }]; //local
    uvh.getVariable("s11").value = "local";
    f.json = length6;
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added, local var lookup (from sprite)");
    assert.equal(f.json.left.objRef.type, "1", "objRef.type = local (1)");
    assert.equal(f.calculate(), 5, "call calculate local");
    f.json = length7;
    f.toString(uvh);
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added, local var lookup (from procedure)");
    assert.equal(f.json.left.objRef.type, "1", "objRef.type = local (1)");
    assert.equal(f.calculate(uvh), 5, "call calculate with procedure uvh with locallookup");

    uvh._variables = [{ id: "s11", name: "procedure1" }, { id: "s12", name: "global2" }]; //procedure
    uvh.getVariable("s11").value = "procedure";
    f.json = length8;
    f.toString(uvh);
    assert.equal(f.json.i18nKey, "formula_editor_function_length", "LENGTH i18nKey added, procedure var lookup (from procedure)");
    assert.equal(f.json.left.objRef.type, "3", "objRef.type = prodedure (3)");
    assert.equal(f.calculate(uvh), 9, "call calculate with procedure uvh: get variable from parameters");

});


QUnit.test("FormulaParser: object (sprite)", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);

    //init sprite: test data
    sprite._positionX = 3;
    sprite._positionY = 4;
    sprite._transparency = 46;
    sprite._brightness = 123;
    sprite._colorEffect = 126;
    sprite._scaling = 0.84;
    sprite._direction = 34;


    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = object_x;
    assert.equal(f.calculate(), 6, "OBJECT_X: formula");
    assert.equal(f.isStatic, false, "OBJECT_X: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_operator_mult", "OBJECTX mult i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_object_x", "OBJECTX i18nKey added");

    f.json = object_y;
    assert.equal(f.calculate(), 6, "OBJECT_Y: formula");
    assert.equal(f.isStatic, false, "OBJECT_Y: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_object_y", "OBJECTY i18nKey added");

    f.json = ghostEffect;
    assert.equal(f.calculate(), 0.46, "transparency: formula");
    assert.equal(f.isStatic, false, "transparency: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_object_transparency", "TRANSPARENCY i18nKey added");

    f.json = colorEffect;
    assert.equal(f.calculate(), 126, "colorEffect: formula");
    assert.equal(f.isStatic, false, "transparency: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_object_color", "COLOR i18nKey added");

    f.json = brightness;
    assert.equal(f.calculate(), 246, "brightness: formula");
    assert.equal(f.isStatic, false, "brightness: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_object_brightness", "BRIGHTNESS i18nKey added");

    f.json = object_size;
    assert.equal(f.calculate(), 0.84, "object_size: formula");
    assert.equal(f.isStatic, false, "object_size: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_object_size", "SIZE i18nKey added");

    f.json = object_rotation;
    assert.equal(f.calculate(), -56, "object_rotation: formula");
    assert.equal(f.isStatic, false, "object_rotation: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_object_rotation", "ROTATION i18nKey added");

    f.json = object_rotation2;
    assert.equal(f.calculate(), 394, "object_rotation > 360: formula");
    assert.equal(f.isStatic, false, "object_rotation > 360: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_object_rotation", "ROTATION2 i18nKey added");

    f.json = object_layer;
    assert.equal(f.calculate(), 1.5, "object_layer: formula");
    assert.equal(f.isStatic, false, "object_layer: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_object_layer", "LAYER i18nKey added");
});


QUnit.test("FormulaParser: sensors", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    //manual tests required as values cannot be compared (change at any time if supported)
    //tests check on numeric values only, but tests should fail on uiString if properties are not available (wrong mapping) 
    f.json = acceleration_x;
    assert.ok(typeof f.calculate() === 'number', "X_ACCELERATION: formula return type");
    assert.equal(f.isStatic, false, "X_ACCELERATION: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_x_acceleration", "X_ACCELERATION i18nKey added");

    f.json = acceleration_y;
    assert.ok(typeof f.calculate() === 'number', "Y_ACCELERATION: formula return type");
    assert.equal(f.isStatic, false, "Y_ACCELERATION: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_y_acceleration", "Y_ACCELERATION i18nKey added");

    f.json = acceleration_z;
    assert.ok(typeof f.calculate() === 'number', "Z_ACCELERATION: formula return type");
    assert.equal(f.isStatic, false, "Z_ACCELERATION: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_z_acceleration", "Z_ACCELERATION i18nKey added");

    f.json = compass;
    assert.ok(typeof f.calculate() === 'number', "COMPASS_DIRECTION: formula return type");
    assert.equal(f.isStatic, false, "COMPASS_DIRECTION: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_compass_direction", "COMPASS_DIRECTION i18nKey added");

    f.json = inclination_x;
    assert.ok(typeof f.calculate() === 'number', "X_INCLINATION: formula return type");
    assert.equal(f.isStatic, false, "X_INCLINATION: isStatic");
    f.toString();
    assert.equal(f.json.left.left.i18nKey, "formula_editor_sensor_x_inclination", "X_INCLINATION i18nKey added");

    f.json = inclination_y;
    assert.ok(typeof f.calculate() === 'number', "Y_INCLINATION: formula return type");
    assert.equal(f.isStatic, false, "Y_INCLINATION: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_y_inclination", "Y_INCLINATION i18nKey added");

    f.json = loudness;
    assert.ok(typeof f.calculate() === 'number', "LOUDNESS: formula return type");
    assert.equal(f.isStatic, false, "LOUDNESS: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_loudness", "LOUDNESS i18nKey added");

    //face detection
    f.json = face_detect;
    assert.ok(typeof f.calculate() === 'boolean', "FACE_DETECTED: formula return type");
    assert.equal(f.isStatic, false, "FACE_DETECTED: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_and", "AND i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_face_detected", "FACE_DETECTED i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_function_true", "TRUE i18nKey added");

    f.json = face_size;
    assert.ok(typeof f.calculate() === 'number', "FACE_SIZE: formula return type");
    assert.equal(f.isStatic, false, "FACE_SIZE: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_face_size", "FACE_SIZE i18nKey added");

    f.json = face_pos_x;
    assert.ok(typeof f.calculate() === 'number', "FACE_X_POSITION: formula return type");
    assert.equal(f.isStatic, false, "FACE_X_POSITION: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_face_x_position", "FACE_X_POSITION i18nKey added");

    f.json = face_pos_y;
    assert.ok(typeof f.calculate() === 'number', "FACE_Y_POSITION: formula return type");
    assert.equal(f.isStatic, false, "FACE_Y_POSITION: isStatic");
    f.toString();
    assert.equal(f.json.left.i18nKey, "formula_editor_sensor_face_y_position", "FACE_Y_POSITION i18nKey added");

    //nxt, phiro
    f.json = NXT_1;
    assert.equal(f.calculate(), 0, "NXT_1: formula return type");
    assert.equal(f.isStatic, false, "NXT_1: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_sensor_lego_nxt_1", "NXT_1 i18nKey added");

    f.json = NXT_2;
    assert.equal(f.calculate(), 0, "NXT_2: formula return type");
    assert.equal(f.isStatic, false, "NXT_2: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_sensor_lego_nxt_2", "NXT_2 i18nKey added");

    f.json = NXT_3;
    assert.equal(f.calculate(), 0, "NXT_3: formula return type");
    assert.equal(f.isStatic, false, "NXT_3: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_sensor_lego_nxt_3", "NXT_3 i18nKey added");

    f.json = NXT_4;
    assert.equal(f.calculate(), 0, "NXT_4: formula return type");
    assert.equal(f.isStatic, false, "NXT_4: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_sensor_lego_nxt_4", "NXT_4 i18nKey added");

    f.json = phiro_front_left;
    assert.equal(f.calculate(), 0, "phiro_front_left: formula return type");
    assert.equal(f.isStatic, false, "phiro_front_left: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_phiro_sensor_front_left", "PHIRO_FRONT_LEFT i18nKey added");

    f.json = phiro_front_right;
    assert.equal(f.calculate(), 0, "phiro_front_right: formula return type");
    assert.equal(f.isStatic, false, "phiro_front_right: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_phiro_sensor_front_right", "PHIRO_FRONT_RIGHT i18nKey added");

    f.json = phiro_side_left;
    assert.equal(f.calculate(), 0, "phiro_side_left: formula return type");
    assert.equal(f.isStatic, false, "phiro_side_left: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_phiro_sensor_side_left", "PHIRO_SIDE_LEFT i18nKey added");

    f.json = phiro_side_right;
    assert.equal(f.calculate(), 0, "phiro_side_right: formula return type");
    assert.equal(f.isStatic, false, "phiro_side_right: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_phiro_sensor_side_right", "PHIRO_SIDE_RIGHT i18nKey added");

    f.json = phiro_bottom_left;
    assert.equal(f.calculate(), 0, "phiro_bottom_left: formula return type");
    assert.equal(f.isStatic, false, "phiro_bottom_left: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_phiro_sensor_bottom_left", "PHIRO_BOTTOM_LEFT i18nKey added");

    f.json = phiro_bottom_right;
    assert.equal(f.calculate(), 0, "phiro_bottom_right: formula return type");
    assert.equal(f.isStatic, false, "phiro_bottom_right: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_phiro_sensor_bottom_right", "PHIRO_BOTTOM_RIGHT i18nKey added");


    //TODO: assert.ok(false, "MISSING: led on/of + vibration?");
    //TODO: recheck sensor strings
});


QUnit.test("FormulaParser: sensors: timer", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.ok(false, "TODO: sensors: timer");
});


QUnit.test("FormulaParser: sensors: touch", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = finger_x;
    assert.ok(typeof f.calculate() === 'number', "FINGER_X: formula return type");
    assert.equal(f.isStatic, false, "FINGER_X: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_finger_x", "FINGER_X i18nKey added");

    f.json = finger_y;
    assert.ok(typeof f.calculate() === 'number', "FINGER_Y: formula return type");
    assert.equal(f.isStatic, false, "FINGER_Y: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_finger_y", "FINGER_Y i18nKey added");

    f.json = finger_touched;
    assert.ok(typeof f.calculate() === 'boolean', "FINGER_TOUCHED: formula return type");
    assert.equal(f.isStatic, false, "FINGER_TOUCHED: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_is_finger_touching", "FINGER_TOUCHED i18nKey added");

    f.json = multi_finger_x;
    assert.ok(typeof f.calculate() === 'number', "MULTI_FINGER_X: formula return type");
    assert.equal(f.isStatic, false, "MULTI_FINGER_X: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_multi_finger_x", "MULTI_FINGER_X i18nKey added");

    f.json = multi_finger_y;
    assert.ok(typeof f.calculate() === 'number', "MULTI_FINGER_Y: formula return type");
    assert.equal(f.isStatic, false, "MULTI_FINGER_Y: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_multi_finger_y", "MULTI_FINGER_Y i18nKey added");

    f.json = multi_finger_touched;
    assert.ok(typeof f.calculate() === 'boolean', "MULTI_FINGER_TOUCHED: formula return type");
    assert.equal(f.isStatic, false, "MULTI_FINGER_TOUCHED: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_is_multi_finger_touching", "MULTI_FINGER_TOUCHED i18nKey added");

    f.json = last_finger_index;
    assert.ok(typeof f.calculate() === 'number', "LAST_FINGER_INDEX: formula return type");
    assert.equal(f.isStatic, false, "LAST_FINGER_INDEX: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_function_index_of_last_finger", "LAST_FINGER_INDEX i18nKey added");

});


QUnit.test("FormulaParser: sensors: geo location", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.ok(false, "TODO: sensors: geo location");
});


QUnit.test("FormulaParser: sensors: physics", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.ok(false, "TODO: sensors: physics");
});


QUnit.test("FormulaParser: logic", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    f.json = equal;
    assert.equal(f.calculate(), true, "EQUAL int: formula");
    assert.equal(f.isStatic, true, "EQUAL int: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_equal", "EQUAL i18nKey added");

    /*f.json = equal2;
    assert.equal(f.calculate(), false, "EQUAL float: formula");
    //assert.equal(f.isStatic, false, "EQUAL float: isStatic");
    assert.equal(f.toString(), "2 = (2 x 2.02 - 2)", "EQUAL float: toString");
*/
    f.json = equal3;
    assert.equal(f.calculate(), false, "EQUAL bool: formula");
    //assert.equal(f.isStatic, false, "EQUAL bool: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_equal", "EQUAL i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_function_true", "EQUAL true i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_function_false", "EQUAL false i18nKey added");

    f.json = not_equal;
    assert.equal(f.calculate(), true, "NOT_EQUAL: formula");
    assert.equal(f.isStatic, true, "NOT_EQUAL: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_notequal", "EQUAL i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_function_true", "EQUAL true i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_function_false", "EQUAL false i18nKey added");

    f.json = greater_than;
    assert.equal(f.calculate(), true, "GREATER_THAN: formula");
    assert.equal(f.isStatic, true, "GREATER_THAN: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_greaterthan", "GREATER_THAN i18nKey added");

    f.json = smaller_than;
    assert.equal(f.calculate(), false, "SMALLER_THAN: formula");
    assert.equal(f.isStatic, true, "SMALLER_THAN: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_lesserthan", "SMALLER_THAN i18nKey added");

    f.json = smallerOrEqual;
    assert.equal(f.calculate(), true, "SMALLER_OR_EQUAL: formula");
    assert.equal(f.isStatic, true, "SMALLER_OR_EQUAL: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_leserequal", "SMALLER_OR_EQUAL i18nKey added");

    f.json = logicalAnd;
    assert.equal(f.calculate(), false, "LOGICAL_AND: formula");
    assert.equal(f.isStatic, true, "LOGICAL_AND: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_and", "LOGICAL_AND i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_function_false", "LOGICAL_AND false i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_function_false", "LOGICAL_AND false i18nKey added");

    f.json = logicalOr;
    assert.equal(f.calculate(), true, "LOGICAL_OR: formula");
    assert.equal(f.isStatic, true, "LOGICAL_OR: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_or", "LOGICAL_OR i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_function_true", "LOGICAL_OR true i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_function_true", "LOGICAL_OR true i18nKey added");

    f.json = not;
    assert.equal(f.calculate(), true, "LOGICAL_NOT: formula");
    assert.equal(f.isStatic, true, "LOGICAL_NOT: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_notequal", "LOGICAL_NOT not equal i18nKey added");
    assert.equal(f.json.left.i18nKey, "formula_editor_function_true", "LOGICAL_NOT true i18nKey added");
    assert.equal(f.json.right.i18nKey, "formula_editor_logic_not", "LOGICAL_NOT i18nKey added");
    assert.equal(f.json.right.right.i18nKey, "formula_editor_function_true", "LOGICAL_NOT true i18nKey added");

    f.json = greaterOrEqual;
    assert.equal(f.calculate(), true, "GREATER_OR_EQUAL: formula");
    assert.equal(f.isStatic, true, "GREATER_OR_EQUAL: isStatic");
    f.toString();
    assert.equal(f.json.i18nKey, "formula_editor_logic_greaterequal", "GREATER_OR_EQUAL i18nKey added");


});

QUnit.test("FormulaParser: collision formula", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite);//, { "type": "NUMBER", "value": "20", "right": null, "left": null });

    assert.ok(false, "TODO: collision formula");
});


QUnit.test("BrickFactory", function (assert) {

    var allBricksProject = project1;    //using _resources/testDataProjects.js
    //^^ includes all types of bricks (once!!! take care if this is still correct)

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager();

    var soundManager = new PocketCode.SoundManager();
    var device = new PocketCode.MediaDevice(soundManager);
    var gameEngine = new PocketCode.GameEngine(allBricksProject.id);
    gameEngine._variables = allBricksProject.variables;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var minLoopCycleTime = 14;

    var bf = new PocketCode.BrickFactory(device, gameEngine, scene, broadcastMgr, soundMgr, minLoopCycleTime);//, allBricksProject.header.bricksCount, 0, minLoopCycleTime);   //TODO: check loadedCount
    assert.ok(bf instanceof PocketCode.BrickFactory, "instance created");

    assert.ok(bf._device === device && bf._project === gameEngine && bf._broadcastMgr === broadcastMgr && bf._soundMgr === soundMgr && bf._total === allBricksProject.header.bricksCount && bf._minLoopCycleTime === 14, "properties set correctly");

    var progress = [];
    var progressHandler = function (e) {
        progress.push(e.progress);
    };

    //TODO bf.onProgressChange.addEventListener(new SmartJs.Event.EventListener(progressHandler, this));

    var unsupportedBricks = [];
    var unsupportedCalled = 0;
    var unsupportedHandler = function (e) {
        unsupportedCalled++;
        unsupportedBricks = e.unsupportedBricks;
    };

    bf.onUnsupportedBrickFound.addEventListener(new SmartJs.Event.EventListener(unsupportedHandler, this));

    var controlBricks = [];
    var soundBricks = [];
    var motionBricks = [];
    var lookBricks = [];
    var dataBricks = [];
    var otherBricks = [];

    //background:
    sprite._variables = allBricksProject.background.variables;

    var count = 0;
    var bricks = allBricksProject.background.scripts;
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
                bricks = dataBricks;
                break;
        }

        for (var j = 0, k = currentSprite.scripts.length; j < k; j++) {
            bricks.push(bf.create(sprite, currentSprite.scripts[j]));
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
    //{"broadcastId":"s50","type":"BroadcastAndWaitUnknown"} //client detect
    //{"broadcastId":"s50","type":"Unsupported"}             //server detect
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    allBricksProject.background.scripts.push({ "broadcastId": "s50", "type": "BroadcastAndWaitUnknown" });
    allBricksProject.background.scripts.push({ "broadcastId": "s51", "type": "Unsupported" });
    allBricksProject.header.bricksCount += 2;

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager([]);

    var device = new PocketCode.MediaDevice(soundManager);
    var gameEngine = new PocketCode.GameEngine(allBricksProject.id);
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var bf = new PocketCode.BrickFactory(device, gameEngine, scene, broadcastMgr, soundMgr, 26);//allBricksProject.header.bricksCount, 26);
    assert.ok(bf instanceof PocketCode.BrickFactory, "instance created");

    assert.ok(bf._device === device && bf._project === gameEngine && bf._broadcastMgr === broadcastMgr && bf._soundMgr === soundMgr && bf._total === allBricksProject.header.bricksCount && bf._minLoopCycleTime === 26, "properties set correctly");

    var progress = [];
    var progressHandler = function (e) {
        progress.push(e.progress);
    };

    //TODO bf.onProgressChange.addEventListener(new SmartJs.Event.EventListener(progressHandler, this));

    var unsupportedBricks = [];
    var unsupportedCalled = 0;
    var unsupportedHandler = function (e) {
        unsupportedCalled++;
        unsupportedBricks.push(e.unsupportedBricks);
    };

    bf.onUnsupportedBrickFound.addEventListener(new SmartJs.Event.EventListener(unsupportedHandler, this));

    var controlBricks = [];
    var soundBricks = [];
    var motionBricks = [];
    var lookBricks = [];
    var dataBricks = [];
    var otherBricks = [];

    //background:
    var count = 0;
    var bricks = allBricksProject.background.scripts;
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
                bricks = dataBricks;
                break;
        }

        for (var j = 0, k = currentSprite.scripts.length; j < k; j++) {
            bricks.push(bf.create(sprite, currentSprite.scripts[j]));
            count++;
        }
    }

    assert.equal(bf._parsed, allBricksProject.header.bricksCount, "unsupported: all bricks created");
    assert.ok(progress.length > 0, "unsupported: progress handler called");
    assert.equal(progress[progress.length - 1], 100, "unsupported: progress reached 100%");
    assert.ok(progress.length <= 20, "unsupported: limited progress events");

    assert.equal(unsupportedCalled, 2, "unsupported: unsupported bricks found, handler called once");
    assert.equal(unsupportedBricks.length, 2, "unsupported: 2 found");

});


QUnit.test("SpriteFactory", function (assert) {

    var allBricksProject = project1;    //using tests_testData.js
    //^^ includes all types of bricks 

    var broadcastMgr = new PocketCode.BroadcastManager(allBricksProject.broadcasts);
    var soundMgr = new PocketCode.SoundManager();

    var device = new PocketCode.MediaDevice(soundMgr);
    var gameEngine = new PocketCode.GameEngine(allBricksProject.id);
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    //var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var sf = new PocketCode.SpriteFactory(device, gameEngine, soundMgr, 25);//allBricksProject.header.bricksCount);

    assert.ok(sf instanceof PocketCode.SpriteFactory, "instance check");
    assert.ok(sf._brickFactory instanceof PocketCode.BrickFactory, "brick factory created");
    assert.equal(sf._program, gameEngine, "gameEngine set correctly");

    //assert.equal(sf.onProgressChange, sf._brickFactory.onProgressChange, "onProgressChange event mapped");
    //assert.equal(sf.onUnsupportedBricksFound, sf._brickFactory.onUnsupportedBricksFound, "onUnsupportedBricksFound event mapped");

    assert.throws(function () { sf.create(scene, broadcastMgr, []); }, Error, "ERROR: invalid argument: array");
    assert.throws(function () { sf.create(scene, broadcastMgr, ""); }, Error, "ERROR: invalid argument: no object");

    sf.dispose();
    assert.equal(sf.onProgressChange, undefined, "dispose: properties removed");
    assert.equal(sf._disposed, true, "disposed: true");

    //recreate after dispose
    sf = new PocketCode.SpriteFactory(device, gameEngine, soundMgr, 18);//allBricksProject.header.bricksCount);
    
    var sprite2 = sf.create(scene, broadcastMgr, spriteTest2);
    assert.ok(sprite2 instanceof PocketCode.Model.Sprite, "Sprite successfully created");

});


