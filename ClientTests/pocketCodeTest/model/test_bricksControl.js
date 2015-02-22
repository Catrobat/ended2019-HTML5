/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/broadcastManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/program.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksControl.js" />
'use strict';

QUnit.module("bricksControl.js");


QUnit.test("ProgramStartBrick", function (assert) {

    //assert.expect(11);   //init async asserts (to wait for)
    var done1 = assert.async();

    var program = new PocketCode.Model.Program();
    program.background = "background";  //to avoid error on start

    var b = new PocketCode.Bricks.ProgramStartBrick("device", program, "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ProgramStartBrick, "instance check");
    assert.ok(b.objClassName === "ProgramStartBrick", "objClassName check");

    //test empty container
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler, this));
    program.start();
    assert.ok(handlerCalled === 1, "executed handler called (once)");

    //add a brick container
    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                var _self = this;
                window.setTimeout(function () { _self._return(id, false) }, 100);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));

    b.bricks = new PocketCode.Bricks.BrickContainer(bricks);    //container including bricks

    b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler, this));

    var asyncHandler = function () {
        assert.ok(true, "onExecuted called: including threaded bricks");
        done1();
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    program.start();

});

QUnit.test("WhenActionBrick", function (assert) {

    var done1 = assert.async();

    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program, {});
    var b = new PocketCode.Bricks.WhenActionBrick("device", program, sprite, { action: "action" });

    assert.ok(b._device === "device" && b._sprite === sprite && b._action === "action", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.WhenActionBrick, "instance check");
    assert.ok(b.objClassName === "WhenActionBrick", "objClassName check");

    //test empty container
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler, this));
    program._onTabbedAction.dispatchEvent({sprite: sprite});
    assert.ok(handlerCalled === 1, "executed handler called (once)");

    //add a brick container
    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                var _self = this;
                window.setTimeout(function () { _self._return(id, false) }, 100);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));

    b.bricks = new PocketCode.Bricks.BrickContainer(bricks);    //container including bricks

    b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler, this));

    var asyncHandler = function () {
        assert.ok(true, "onExecuted called: including threaded bricks");
        done1();
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    program._onTabbedAction.dispatchEvent({ sprite: sprite });

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

    var done1 = assert.async();
    var done2 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Bricks.BroadcastReceive("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.BroadcastReceive, "instance check");
    assert.ok(b.objClassName === "BroadcastReceive", "objClassName check");

    //test empty container
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler, this));
    broadcastMgr.publish("s12");
    assert.ok(handlerCalled === 1, "executed handler called (once)");

    //add a brick container
    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                var _self = this;
                window.setTimeout(function () { _self._return(id, true) }, 100);
                //this._return(id, false);    //LOOP DELAY = TRUE
            },
        });

        return TestBrick2;
    })();

    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));

    b.bricks = new PocketCode.Bricks.BrickContainer(bricks);    //container including bricks

    b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler, this));

    var asyncHandler = function () {
        assert.ok(true, "onExecuted called: including threaded bricks");
        done1();
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    broadcastMgr.publish("s12");

    //broadcastAndWait event handling: b.onExecuted is not dispatched the publish event arguments include the return handler
    handlerCalled = 0;
    //b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    //^^ leaving the listener attached will give you an error on done1() called twice
    var asyncHandler2 = function (e) {
        assert.ok(true, "broadcastWait: onExecuted called: including threaded bricks");
        assert.equal(e.id, "broadcastWaitId", "broadcastWait: return id check");
        assert.equal(e.loopDelay, true, "broadcastWait: loopDelay check");

        done2();
    };
    broadcastMgr.publish("s12", new SmartJs.Event.EventListener(asyncHandler2, this), "broadcastWaitId");

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


