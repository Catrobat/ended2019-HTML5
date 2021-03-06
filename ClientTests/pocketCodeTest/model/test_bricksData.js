﻿/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksData.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksData.js");


QUnit.test("SetVariableBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "var1name", 0);//{ id: "var1", name: "var1name", value: 0 };

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.SetVariableBrick("device", sprite, { resourceId: "var1", value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._varId == "var1" && b._value instanceof PocketCode.Formula , "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetVariableBrick, "instance check");
    assert.ok(b.objClassName === "SetVariableBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formual calculation (value to set)");

    //local var
    var executedHandler = function (e) {
        assert.equal(e.id, "setVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(sprite.getVariable("var1").value, 1.0, "variable set correctly (local)");
        done1();
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "setVar");

    //global
    sprite._variables = []; //please notice: the ref ist stored in the brick even if the global var is cleared
    gameEngine.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "var1name", 0);
    b = new PocketCode.Model.SetVariableBrick("device", sprite, { resourceId: "var1", value: value });

    var executedHandler2 = function (e) {
        assert.equal(e.id, "setGlobalVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(gameEngine.getVariable("var1").value, 1.0, "variable set correctly (global)");
        assert.equal(sprite.getVariable("var1"), gameEngine.getVariable("var1"), "global == local lookup instance");
        done2();
    };
    b.execute(new SmartJs.Event.EventListener(executedHandler2, this), "setGlobalVar");

});


QUnit.test("ChangeVariableBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);
    sprite.__variablesSimple._variables.varUnset = new PocketCode.Model.UserVariableSimple("varUnset", "name");

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.ChangeVariableBrick("device", sprite, { resourceId: "var1", value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._varId == "var1" && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeVariableBrick, "instance check");
    assert.ok(b.objClassName === "ChangeVariableBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formual calculation (value to add)");

    //local var
    var executedHandler = function (e) {
        assert.equal(e.id, "changeVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(sprite.getVariable("var1").value, 2.0, "variable set correctly (local)");
        done1();
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "changeVar");

    //change with not numeric
    value = JSON.parse('{ "type": "FUNCTION", "value": "TRUE", "right": null, "left": null }');
    b = new PocketCode.Model.ChangeVariableBrick("device", sprite, { resourceId: "varUnset", value: value });
    var executedHandlerBool = function (e) {
        assert.equal(sprite.getVariable("varUnset").value, true, "variable set correctly: change with not numeric");
        done2();
    };
    b.execute(new SmartJs.Event.EventListener(executedHandlerBool, this), "id");

    //global
    sprite._variables = [];
    gameEngine.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);
    b = new PocketCode.Model.ChangeVariableBrick("device", sprite, { resourceId: "var1", value: value });

    var executedHandler2 = function (e) {
        assert.equal(e.id, "changeGlobalVar", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        assert.equal(gameEngine.getVariable("var1").value, 2.0, "variable set correctly (global)");
        assert.equal(sprite.getVariable("var1"), gameEngine.getVariable("var1"), "global == local lookup instance");
        done3();
    };
    b.execute(new SmartJs.Event.EventListener(executedHandler2, this), "changeGlobalVar");
});


QUnit.test("ShowVariableBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);//{ id: "var1", value: 1 };

    var x = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}'),
        y = JSON.parse('{"type":"NUMBER","value":"2.0","right":null,"left":null}');

    var b = new PocketCode.Model.ShowVariableBrick("device", sprite, { resourceId: "var1", x: x, y: y });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._varId == "var1" && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.BaseBrick && b instanceof PocketCode.Model.ShowVariableBrick, "instance check");
    assert.ok(b.objClassName === "ShowVariableBrick", "objClassName check");

    //check and override sprite interface
    assert.ok(typeof sprite.showVariableAt === "function", "brick sprite interface checked");
    var methodCalled;
    sprite.showVariableAt = function (id, positionX, positionY) {
        methodCalled = { id: id, x: positionX, y: positionY };
    };

    var executedHandler = function (e) {
        assert.equal(e.id, "showText", "event args id correct");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "showText");

    assert.equal(methodCalled.id, "var1", "sprite interface called: id checked");
    assert.equal(methodCalled.x, 1, "sprite interface called: positionX checked");
    assert.equal(methodCalled.y, 2, "sprite interface called: positionY checked");

    done2();

});


QUnit.test("HideVariableBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);//{ id: "var1", value: 1 };

    var b = new PocketCode.Model.HideVariableBrick("device", sprite, { resourceId: "var1" });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._varId == "var1", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.BaseBrick && b instanceof PocketCode.Model.HideVariableBrick, "instance check");
    assert.ok(b.objClassName === "HideVariableBrick", "objClassName check");

    //check and override sprite interface
    assert.ok(typeof sprite.hideVariable === "function", "brick sprite interface checked");
    var methodCalledId = false;
    sprite.hideVariable = function (id) {
        methodCalledId = id;
    };

    var executedHandler = function (e) {
        assert.equal(e.id, "hideText", "event args id correct");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "hideText");

    assert.equal(methodCalledId, "var1", "sprite interface called");

    done2();

});


QUnit.test("AppendToListBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.AppendToListBrick("device", sprite, { resourceId: "list1", value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._listId == "list1" && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    //assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Model.AppendToListBrick, "instance check");
    assert.ok(b.objClassName === "AppendToListBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formula calculation (value to set)");

    //execute
    var executedHandler = function (e) {
        assert.equal(e.id, "AppendToList", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        var list = sprite.getList("list1");
        assert.equal(list.valueAt(4), 1.0, "list append");
        done1();
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "AppendToList");

});


QUnit.test("DeleteAtListBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var idx = JSON.parse('{"type":"NUMBER","value":"2","right":null,"left":null}');
    var b = new PocketCode.Model.DeleteAtListBrick("device", sprite, { resourceId: "list1", index: idx });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._listId == "list1" && b._idx instanceof PocketCode.Formula, "brick created and properties set correctly");
    //assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Model.DeleteAtListBrick, "instance check");
    assert.ok(b.objClassName === "DeleteAtListBrick", "objClassName check");

    //execute
    var executedHandler = function (e) {
        assert.equal(e.id, "DeleteAt", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        var list = sprite.getList("list1");
        assert.equal(list.valueAt(1), 0, "list delete: 1st item");
        assert.equal(list.valueAt(2), 2, "list delete: 2nd item: moved 3rd to 2nd (+ cast to number)");
        assert.equal(list.length, 2, "list length after delete");
        done1();
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "DeleteAt");

});


QUnit.test("InsertAtListBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var idx = JSON.parse('{"type":"NUMBER","value":"2","right":null,"left":null}');
    var b = new PocketCode.Model.InsertAtListBrick("device", sprite, { resourceId: "list1", index: idx, value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._listId == "list1" && b._idx instanceof PocketCode.Formula && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    //assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Model.InsertAtListBrick, "instance check");
    assert.ok(b.objClassName === "InsertAtListBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formula calculation (value to set)");

    //execute
    var executedHandler = function (e) {
        assert.equal(e.id, "InsertAt", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        var list = sprite.getList("list1");
        assert.equal(list.valueAt(2), 1.0, "list insert");
        assert.equal(list.length, 4, "list length after insert");
        done1();
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "InsertAt");

});


QUnit.test("ReplaceAtListBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var idx = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var b = new PocketCode.Model.ReplaceAtListBrick("device", sprite, { resourceId: "list1", index: idx, value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._listId == "list1" && b._idx instanceof PocketCode.Formula && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    //assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Model.ReplaceAtListBrick, "instance check");
    assert.ok(b.objClassName === "ReplaceAtListBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formula calculation (value to set)");

    //execute
    var executedHandler = function (e) {
        assert.equal(e.id, "ReplaceAt", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        var list = sprite.getList("list1");
        assert.equal(list.valueAt(3), 1.0, "list replace");
        assert.equal(list.length, 3, "list length after replace");
        done1();
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "ReplaceAt");

});

