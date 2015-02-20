/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("bricksCore.js");


QUnit.test("BaseBrick", function (assert) {

    var b = new PocketCode.Bricks.BaseBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.BaseBrick, "instance check");
    assert.ok(b.objClassName === "BaseBrick", "objClassName check");

    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function TestBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);
        }

        TestBrick.prototype.merge({
            _execute: function () {
                this._return(true);
            },
        });

        return TestBrick;
    })();

    var testBrick = new TestBrick("device", "sprite");
    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;
    }
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    assert.throws(function () { testBrick.execute(l1, 23); }, Error, "ERROR: simple argument error check");

    testBrick.execute(l1, "callId");
    assert.ok(handler1Called, "handler called");
    assert.ok(handler1LoopDelay, "loop delay handled corrrectly");
    assert.ok(handler1CallId === "callId", "call id handled corrrectly");

});

QUnit.test("ThreadedBrick", function (assert) {

    var b = new PocketCode.Bricks.ThreadedBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ThreadedBrick, "instance check");
    assert.ok(b.objClassName === "ThreadedBrick", "objClassName check");

    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
        }

        TestBrick.prototype.merge({
            _execute: function (id) {
                this._return(id, true);
            },
        });

        return TestBrick;
    })();

    var testBrick = new TestBrick("device", "sprite");
    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;
    }
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    assert.throws(function () { testBrick.execute(l1, 23); }, Error, "ERROR: simple argument error check");

    testBrick.execute(l1, "callId");
    assert.ok(handler1Called, "handler called");
    assert.ok(handler1LoopDelay, "loop delay handled corrrectly");
    assert.ok(handler1CallId === "callId", "call id handled corrrectly");

    var count = 0;
    for (p in testBrick._pendingOps)
        if (testBrick._pendingOps.hasOwnProperty(p))
            count++;
    assert.ok(count === 0, "pending operations removed from queue");

});

QUnit.test("BrickContainer", function (assert) {

    var bc = new PocketCode.Bricks.BrickContainer();
    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;
    }
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    assert.ok(bc._bricks.length === 0, "brick created and properties set correctly");   //initialized as array
    assert.ok(bc instanceof PocketCode.Bricks.BrickContainer, "instance check");

    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
        }

        TestBrick.prototype.merge({
            _execute: function (id) {
                this.executed++;
                this._return(id, true);     //LOOP DELAY = TRUE
            },
        });

        return TestBrick;
    })();

    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    var TestBrick3 = (function () {
        TestBrick3.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick3(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
        }

        TestBrick3.prototype.merge({
            _execute: function (id) {
                this.executed++;
                this._return(id);       //LOOP DELAY NOT SET
            },
        });

        return TestBrick3;
    })();

    bc = new PocketCode.Bricks.BrickContainer([new TestBrick("device", "sprite"), new TestBrick2("device", "sprite"), new TestBrick3("device", "sprite")]);

    assert.ok(bc._bricks.length === 3, "bricks array loaded");
    assert.throws(function () { bc.execute(l1, 23); }, Error, "ERROR: simple argument error check");

    bc.execute(l1, "newId");

    assert.ok(handler1Called, "handler called");
    assert.ok(handler1LoopDelay, "loop delay handled corrrectly");
    assert.ok(handler1CallId === "newId", "call id handled corrrectly");

    var count = 0;
    for (p in bc._pendingOps)
        if (testBrick._pendingOps.hasOwnProperty(p))
            count++;
    assert.ok(count === 0, "pending operations removed from queue");

    //all bricks executed
    assert.ok(bc._bricks[0].executed === 1 && bc._bricks[1].executed === 1 && bc._bricks[2].executed === 1, "all inner bricks executed (once)");

});

QUnit.test("LoopBrick", function (assert) {

    var b = new PocketCode.Bricks.LoopBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.LoopBrick, "instance check");
    assert.ok(b.objClassName === "LoopBrick", "objClassName check");


});

QUnit.test("UnsupportedBrick", function (assert) {

    var b = new PocketCode.Bricks.UnsupportedBrick("device", "sprite", { xml: "xml", brickType: "brickType" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._xml === "xml" && b._brickType === "brickType", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.UnsupportedBrick, "instance check");
    assert.ok(b.objClassName === "UnsupportedBrick", "objClassName check");


});

