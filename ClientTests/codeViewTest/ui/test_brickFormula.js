/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/ui/brickFormula.js");


QUnit.test("BrickFormula", function (assert) {

    var i18nKey = { type: "NUMBER", value: 5};

    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.ok(ctrl instanceof PocketCode.CodeView.Ui.BrickFormula && ctrl instanceof PocketCode.Ui.Button, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "BrickFormula", "objClassName check");
});


QUnit.test("BrickFormula _goThroughObject", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);
    var f = new PocketCode.Formula(device, sprite);

    //type OPERATOR
    f.json = { "type": "OPERATOR", "value": "PLUS", "right": { "type": "STRING", "value": "fghw", "right": null,
        "left": null }, "left": { "type": "STRING", "value": "fgh", "right": null, "left": null } }
    f.toString();
    i18nKey = f.json;
    ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "fgh", "type OPERATOR");
    assert.equal(ctrl._childs[1]._textNode._text, "+", "type OPERATOR 2");
    assert.equal(ctrl._childs[2]._textNode._text, "fghw", "type OPERATOR 3");

    f.json = { "type": "OPERATOR", "value": "MINUS", "right": { "type": "NUMBER", "value": "3.025",
        "right": null, "left": null }, "left": null }
    f.toString();
    i18nKey = f.json;
    ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "-", "type OPERATOR (left: NULL)");
    assert.equal(ctrl._childs[1]._textNode._text, "3.025", "type OPERATOR 2 (left: NULL)");

    //type NUMBER
    i18nKey = { type: "NUMBER", value: 5};
    ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, 5, "type NUMBER");

    //type SENSOR
    var i18nKey = { type: "SENSOR", i18nKey: "formula_editor_object_x"};
    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "position_x", "type SENSOR");

    //type USER_VARIABLE
    gameEngine._variables = [{ id: "s11", name: "global1" }, { id: "s12", name: "global2" }]; //global
    gameEngine.getVariable("s11").value = "global";
    sprite._variables = [{ id: "s13", name: "local1" }, { id: "s14", name: "local2" }]; //local
    //var uvh = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, sprite);
    //uvh._variables = [{ id: "s15", name: "proc1" }, { id: "s16", name: "proc2" }]; //procedure

    f.json = { "type": "USER_VARIABLE", "value": "s11", "right": null, "left": null };
    f.toString();
    i18nKey = f.json;
    ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "\"", "type USER_VARIABLE ");
    assert.equal(ctrl._childs[1]._textNode._text, "s11", "type USER_VARIABLE 2");
    assert.equal(ctrl._childs[2]._textNode._text, "\"", "type USER_VARIABLE 3");

    //type USER_LIST
    var lst = [];
    lst.push(1);
    sprite._lists = [{ id: "s22", name: "listName" }];
    sprite.getList("s22")._value = lst;

    f.json = { "type": "USER_LIST", "value": "s22", "left": null, "right": null };
    f.toString();
    i18nKey = f.json;
    ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "*", "type USER_LIST ");
    assert.equal(ctrl._childs[1]._textNode._text, "s22", "type USER_LIST 2");
    assert.equal(ctrl._childs[2]._textNode._text, "*", "type USER_LIST 3");

    //type BRACKET

    f.json = { "type": "BRACKET", "value": "", "right": { "type": "OPERATOR", "value": "PLUS",
        "right": { "type": "NUMBER", "value": "8", "right": null, "left": null },
        "left": { "type": "NUMBER", "value": "1", "right": null, "left": null } }, "left": null }

    f.toString();
    i18nKey = f.json;
    ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);

    assert.equal(ctrl._childs[0]._textNode._text, "(", "type BRACKET ");
    assert.equal(ctrl._childs[1]._textNode._text, "1", "type BRACKET (operator)");
    assert.equal(ctrl._childs[2]._textNode._text, "+", "type BRACKET (operator) 2");
    assert.equal(ctrl._childs[3]._textNode._text, "8", "type BRACKET (operator) 3");
    assert.equal(ctrl._childs[4]._textNode._text, ")", "type BRACKET 2");

    //type STRING
    i18nKey = { type: "STRING", value: "string_test"};
    ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "string_test", "type STRING");

    assert.ok(false, "TODO type COLLISION_FORMULA"); //todo: scene in COLLISION_FORMULA

});

QUnit.test("BrickFormula _addTypeFunction", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.MediaDevice(soundManager);
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);
    var f = new PocketCode.Formula(device, sprite);


    //left != undefined && right == undefined
    f.json = { "type": "FUNCTION", "value": "SIN", "right": null,
        "left": { "type": "NUMBER", "value": "90", "right": null, "left": null } };

    f.toString();
    var i18nKey = f.json;
    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "sin", "type FUNCTION (right = undefined)");
    assert.equal(ctrl._childs[1]._textNode._text, "(", "type FUNCTION (right = undefined) 2");
    assert.equal(ctrl._childs[2]._textNode._text, "90", "type FUNCTION (right = undefined) 3");
    assert.equal(ctrl._childs[3]._textNode._text, ")", "type FUNCTION (right = undefined) 4");


    //left != undefined && right != undefined
    f.json = { "type": "FUNCTION", "value": "MOD", "right": { "type": "NUMBER", "value": "2.2",
        "right": null, "left": null }, "left": { "type": "NUMBER", "value": "9", "right": null, "left": null } }

    f.toString();
    var i18nKey = f.json;
    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "mod", "type FUNCTION ");
    assert.equal(ctrl._childs[1]._textNode._text, "(", "type FUNCTION 2");
    assert.equal(ctrl._childs[2]._textNode._text, "9", "type FUNCTION  3");
    assert.equal(ctrl._childs[3]._textNode._text, ",", "type FUNCTION  4");
    assert.equal(ctrl._childs[4]._textNode._text, "2.2", "type FUNCTION  5");
    assert.equal(ctrl._childs[5]._textNode._text, ")", "type FUNCTION 6");

    //left & right == undefined
    f.json = { "type": "FUNCTION", "value": "PI", "right": null, "left": null };
    f.toString();
    var i18nKey = f.json;
    var ctrl = new PocketCode.CodeView.Ui.BrickFormula(i18nKey);
    assert.equal(ctrl._childs[0]._textNode._text, "pi", "type FUNCTION (right & left = undefined)");

});