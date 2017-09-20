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
    var formula = { type: "NUMBER", value: 5};

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.SetVariableBrick("device", sprite, { resourceId: "var1", value: value });

    assert.throws(function () {new PocketCode.SetVariableBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.SetVariableBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.SetVariableBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "SetVariableBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Set variable", "text \"Set variable\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "to", "text \"to\" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("ChangeVariableBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);
    sprite.__variablesSimple._variables.varUnset = new PocketCode.Model.UserVariableSimple("varUnset", "name");
    var formula = { type: "NUMBER", value: 5};

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.ChangeVariableBrick("device", sprite, { resourceId: "var1", value: value });

    assert.throws(function () {new PocketCode.ChangeVariableBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.ChangeVariableBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.ChangeVariableBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ChangeVariableBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Change variable", "text \"Change variable\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "by", "text \"by\" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("ShowVariableBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite.__variablesSimple._variables.var1 = new PocketCode.Model.UserVariableSimple("var1", "name", 1);//{ id: "var1", value: 1 };

    var x = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}'),
        y = JSON.parse('{"type":"NUMBER","value":"2.0","right":null,"left":null}');
    var formulaX = { type: "NUMBER", value: 5};
    var formulaY = { type: "NUMBER", value: 6};


    var b = new PocketCode.Model.ShowVariableBrick("device", sprite, { resourceId: "var1", x: x, y: y });

    assert.throws(function () {new PocketCode.ShowVariableBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");
    var brick = new PocketCode.ShowVariableBrick(b, false, formulaX, formulaY);

    assert.ok(brick instanceof PocketCode.ShowVariableBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ShowVariableBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Show variable", "text \"Show variable\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "at ", "text \"at\" added");
    assert.equal(brick._view._childs[1]._childs[6]._textNode._text, "X: ", "text \"X: \" added");
    assert.ok(brick._view._childs[1]._childs[7]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[8]._textNode._text, "Y: ", "text \"Y: \" added");
    assert.ok(brick._view._childs[1]._childs[9]._childs.length >= 1, "childs added to brick formula");
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

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Hide variable", "text \"Hide variable\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
});

QUnit.test("AppendToListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];
    var formula = { type: "NUMBER", value: 5};

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Model.AppendToListBrick("device", sprite, { resourceId: "list1", value: value });

    assert.throws(function () {new PocketCode.AppendToListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.AppendToListBrick(b, false, formula);

    assert.ok(brick instanceof PocketCode.AppendToListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "AppendToListBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Add", "text \"Add\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "to list", "text \"to list\" added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[5] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");

});

QUnit.test("DeleteAtListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];
    var formula = { type: "NUMBER", value: 5};

    var idx = JSON.parse('{"type":"NUMBER","value":"2","right":null,"left":null}');
    var b = new PocketCode.Model.DeleteAtListBrick("device", sprite, { resourceId: "list1", index: idx });

    assert.throws(function () {new PocketCode.DeleteAtListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.DeleteAtListBrick(b, false,formula);

    assert.ok(brick instanceof PocketCode.DeleteAtListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "DeleteAtListBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Delete item from list", "text \"Delete item from list\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "at position", "text \"at position\" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("InsertAtListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];
    var formula = { type: "NUMBER", value: 4};
    var formulaPos = { type: "NUMBER", value: 5};

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var idx = JSON.parse('{"type":"NUMBER","value":"2","right":null,"left":null}');
    var b = new PocketCode.Model.InsertAtListBrick("device", sprite, { resourceId: "list1", index: idx, value: value });

    assert.throws(function () {new PocketCode.InsertAtListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.InsertAtListBrick(b, false, formula, formulaPos);

    assert.ok(brick instanceof PocketCode.InsertAtListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "InsertAtListBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Insert", "text \"Insert\" added");
    assert.ok(brick._view._childs[1]._childs[2]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[3]._textNode._text, "into list", "text \"into list\" added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[5] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[1]._childs[6] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[7]._textNode._text, "at position", "text \"at position\" added");
    assert.ok(brick._view._childs[1]._childs[8]._childs.length >= 1, "childs added to brick formula");
});

QUnit.test("ReplaceAtListBrick", function (assert) {

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._background = "background";  //to avoid error on start
    gameEngine._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "list1", name: "list1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];
    var formulaValue = { type: "NUMBER", value: 4};
    var formulaPos = { type: "NUMBER", value: 5};
    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var idx = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var b = new PocketCode.Model.ReplaceAtListBrick("device", sprite, { resourceId: "list1", index: idx, value: value });

    assert.throws(function () {new PocketCode.ReplaceAtListBrick(new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" }), false) }, Error, "ERRROR: Invalid argument Model");

    var brick = new PocketCode.ReplaceAtListBrick(b, false, formulaPos, formulaValue);

    assert.ok(brick instanceof PocketCode.ReplaceAtListBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "ReplaceAtListBrick", "objClassName check");

    assert.equal(brick._view._childs[1]._childs[1]._textNode._text, "Replace item in list", "text \"Replace item in list\" added");
    assert.ok(brick._view._childs[1]._childs[2] instanceof SmartJs.Ui.Control, "lf added");
    assert.ok(brick._view._childs[1]._childs[3] instanceof PocketCode.CodeView.Ui.BrickDropdown, "dropdown added");
    assert.ok(brick._view._childs[1]._childs[4] instanceof SmartJs.Ui.Control, "lf added");
    assert.equal(brick._view._childs[1]._childs[5]._textNode._text, "at position ", "text \"at position \" added");
    assert.ok(brick._view._childs[1]._childs[6]._childs.length >= 1, "childs added to brick formula");
    assert.equal(brick._view._childs[1]._childs[7]._textNode._text, "with ", "text \"with \" added");
    assert.ok(brick._view._childs[1]._childs[8]._childs.length >= 1, "childs added to brick formula");
});