/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/broadcastManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/program.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksControl.js" />
'use strict';

QUnit.module("bricksControl.js");


QUnit.test("ProgramStartBrick", function (assert) {

    var program = new PocketCode.Model.Program();
    var b = new PocketCode.Bricks.ProgramStartBrick("device", program, "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ProgramStartBrick, "instance check");
    assert.ok(b.objClassName === "ProgramStartBrick", "objClassName check");


});

QUnit.test("WhenActionBrick", function (assert) {

    var program = new PocketCode.Model.Program();
    var b = new PocketCode.Bricks.WhenActionBrick("device", program, "sprite", { action: "action" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._action === "action", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.WhenActionBrick, "instance check");
    assert.ok(b.objClassName === "WhenActionBrick", "objClassName check");


});

QUnit.test("WaitBrick", function (assert) {

    var duration = JSON.parse('{"type":"NUMBER","value":"500","right":null,"left":null}');
    var b = new PocketCode.Bricks.WaitBrick("device", "sprite", { duration: duration });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");  // && b._duration === "duration" -> duration is parsed as formula 
    assert.ok(b instanceof PocketCode.Bricks.WaitBrick, "instance check");
    assert.ok(b.objClassName === "WaitBrick", "objClassName check");

    //alert(b._duration.calculate);
    assert.equal(b._duration.calculate(), 500, "formula created correctly");

});

QUnit.test("BroadcastReceive", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Bricks.BroadcastReceive("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.BroadcastReceive, "instance check");
    assert.ok(b.objClassName === "BroadcastReceive", "objClassName check");

    this._bricks = new PocketCode.Bricks.BrickContainer([]);

});

QUnit.test("BroadcastBrick", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Bricks.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._broadcastMsgId === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.BroadcastBrick, "instance check");
    assert.ok(b.objClassName === "BroadcastBrick", "objClassName check");


});

QUnit.test("BroadcastAndWaitBrick", function (assert) {

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Bricks.BroadcastAndWaitBrick("device", "sprite", broadcastMgr, { broadcastMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._broadcastMsgId === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.BroadcastAndWaitBrick, "instance check");
    assert.ok(b.objClassName === "BroadcastAndWaitBrick", "objClassName check");


});

QUnit.test("NoteBrick", function (assert) {

    var b = new PocketCode.Bricks.NoteBrick("device", "sprite", { text: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._text === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.NoteBrick, "instance check");
    assert.ok(b.objClassName === "NoteBrick", "objClassName check");


});

QUnit.test("ForeverBrick", function (assert) {

    var b = new PocketCode.Bricks.ForeverBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ForeverBrick, "instance check");
    assert.ok(b.objClassName === "ForeverBrick", "objClassName check");


});

QUnit.test("IfThenElseBrick", function (assert) {

    var cond = JSON.parse('{"type":"NUMBER","value":"500","right":null,"left":null}');
    var b = new PocketCode.Bricks.IfThenElseBrick("device", "sprite", { condition: cond });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");  //condition is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Bricks.IfThenElseBrick, "instance check");
    assert.ok(b.objClassName === "IfThenElseBrick", "objClassName check");


});

QUnit.test("RepeatBrick", function (assert) {

    var nTimes = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');
    var b = new PocketCode.Bricks.RepeatBrick("device", "sprite", { timesToRepeat: nTimes });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");   //timesToRepeat is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Bricks.RepeatBrick, "instance check");
    assert.ok(b.objClassName === "RepeatBrick", "objClassName check");


});


