/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksList.js" />
'use strict';

QUnit.module("bricksList.js");


QUnit.test("AppendToListBrick", function (assert) {

    var program = new PocketCode.GameEngine();
    program._background = "background";  //to avoid error on start
    program._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];

    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "var1", name: "var1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Bricks.AppendToListBrick("device", sprite, { referenceId: "var1", value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Sprite && b._list === sprite.getList("var1") && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Bricks.AppendToListBrick, "instance check");
    assert.ok(b.objClassName === "AppendToListBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formual calculation (value to set)");

    //execute
    var executedHandler = function (e) {
        assert.equal(e.id, "AppendToList", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        //TODO: assert.equal(sprite.getVariable("var1").value, 1.0, "variable set correctly (local)");
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "AppendToList");

});

QUnit.test("InsertAtListBrick", function (assert) {

    var program = new PocketCode.GameEngine();
    program._background = "background";  //to avoid error on start
    program._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];

    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "var1", name: "var1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Bricks.InsertAtListBrick("device", sprite, { referenceId: "var1", index: 2, value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Sprite && b._list === sprite.getList("var1") && b._idx == 2 && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Bricks.InsertAtListBrick, "instance check");
    assert.ok(b.objClassName === "InsertAtListBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formual calculation (value to set)");

    //execute
    var executedHandler = function (e) {
        assert.equal(e.id, "AppendToList", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        //TODO: assert.equal(sprite.getVariable("var1").value, 1.0, "variable set correctly (local)");
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "AppendToList");

});

QUnit.test("ReplaceAtListBrick", function (assert) {

    var program = new PocketCode.GameEngine();
    program._background = "background";  //to avoid error on start
    program._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];

    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "var1", name: "var1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var value = JSON.parse('{"type":"NUMBER","value":"1.0","right":null,"left":null}');
    var b = new PocketCode.Bricks.ReplaceAtListBrick("device", sprite, { referenceId: "var1", index: 2, value: value });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Sprite && b._list === sprite.getList("var1") && b._idx == 2 && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Bricks.ReplaceAtListBrick, "instance check");
    assert.ok(b.objClassName === "ReplaceAtListBrick", "objClassName check");

    //check value
    assert.equal(b._value.calculate(), 1.0, "formual calculation (value to set)");

    //execute
    var executedHandler = function (e) {
        assert.equal(e.id, "AppendToList", "return id check");
        var loopDelay = e.loopDelay ? e.loopDelay : false;
        assert.equal(loopDelay, false, "loop delay check");

        //TODO: assert.equal(sprite.getVariable("var1").value, 1.0, "variable set correctly (local)");
    };

    b.execute(new SmartJs.Event.EventListener(executedHandler, this), "AppendToList");

});

QUnit.test("DeleteAtListBrick", function (assert) {

    var program = new PocketCode.GameEngine();
    program._background = "background";  //to avoid error on start
    program._lists = [{ id: "var3", name: "var3name", value: ["6", "7px", "asd"] }, ];

    var sprite = new PocketCode.Sprite(program, { id: "spriteId", name: "spriteName" });
    sprite._lists = [{ id: "var1", name: "var1name", value: [0, 1, "2"] }, { id: "var2", name: "var2name", value: [3, "4", 5] }, ];

    var b = new PocketCode.Bricks.DeleteAtListBrick("device", sprite, { referenceId: "var1", index: 2 });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Sprite && b._list === sprite.getList("var1") && b._idx == 2, "brick created and properties set correctly");
    assert.ok(b._list instanceof PocketCode.Model.UserVariableList, "variable found: type ok");
    assert.ok(b instanceof PocketCode.Bricks.DeleteAtListBrick, "instance check");
    assert.ok(b.objClassName === "DeleteAtListBrick", "objClassName check");

    //execute


});

