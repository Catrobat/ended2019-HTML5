/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksData.js");


QUnit.test("SetVariableBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "var1name", 0);//{ id: "var1", name: "var1name", value: 0 };

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.SetVariableBrick("device", sprite, { resourceId: "var1", value: value });

    assert.throws(function () {new PocketCode.SetVariableBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.SetVariableBrick(b, false);

    assert.ok(brick instanceof PocketCode.SetVariableBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetVariableBrick", "objClassName check");
});

QUnit.test("ChangeVariableBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);
    sprite.__variablesSimple._variables.varUnset = new PocketCode.Model.UserVariableSimple("varUnset", "name");

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.ChangeVariableBrick("device", sprite, { resourceId: "var1", value: value });

    assert.throws(function () {new PocketCode.ChangeVariableBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.ChangeVariableBrick(b, false);

    assert.ok(brick instanceof PocketCode.ChangeVariableBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeVariableBrick", "objClassName check");
});

QUnit.test("ShowVariableBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);//{ id: "var1", value: 1 };

    var x = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}'),
        y = JSON.parse('{"type":"NUMBER","value":"2.0","right":null,"left":null}');

    var b = new PocketCode.Model.ShowVariableBrick("device", sprite, { resourceId: "var1", x: x, y: y });

    assert.throws(function () {new PocketCode.ShowVariableBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.ShowVariableBrick(b, false);

    assert.ok(brick instanceof PocketCode.ShowVariableBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ShowVariableBrick", "objClassName check");
});

QUnit.test("HideVariableBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);//{ id: "var1", value: 1 };

    var b = new PocketCode.Model.HideVariableBrick("device", sprite, { resourceId: "var1" });

    assert.throws(function () {new PocketCode.HideVariableBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.HideVariableBrick(b, false);

    assert.ok(brick instanceof PocketCode.HideVariableBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "HideVariableBrick", "objClassName check");
});

QUnit.test("AppendToListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.AppendToListBrick("device", sprite, { resourceId: "list1", value: value });

    assert.throws(function () {new PocketCode.AppendToListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.AppendToListBrick(b, false);

    assert.ok(brick instanceof PocketCode.AppendToListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "AppendToListBrick", "objClassName check");
});

QUnit.test("DeleteAtListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var idx = JSON.parse('{"type":"NUMBER","value":"2","right":null,"left":null}');
    var b = new PocketCode.Model.DeleteAtListBrick("device", sprite, { resourceId: "list1", index: idx });

    assert.throws(function () {new PocketCode.DeleteAtListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.DeleteAtListBrick(b, false);

    assert.ok(brick instanceof PocketCode.DeleteAtListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "DeleteAtListBrick", "objClassName check");
});

QUnit.test("InsertAtListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var idx = JSON.parse('{"type":"NUMBER","value":"2","right":null,"left":null}');
    var b = new PocketCode.Model.InsertAtListBrick("device", sprite, { resourceId: "list1", index: idx, value: value });

    assert.throws(function () {new PocketCode.InsertAtListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.InsertAtListBrick(b, false);

    assert.ok(brick instanceof PocketCode.InsertAtListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "InsertAtListBrick", "objClassName check");
});

QUnit.test("ReplaceAtListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var idx = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var b = new PocketCode.Model.ReplaceAtListBrick("device", sprite, { resourceId: "list1", index: idx, value: value });

    assert.throws(function () {new PocketCode.ReplaceAtListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ReplaceAtListBrick(b, false);

    assert.ok(brick instanceof PocketCode.ReplaceAtListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ReplaceAtListBrick", "objClassName check");
});