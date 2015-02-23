/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
'use strict';

QUnit.module("bricksCore.js");


QUnit.test("BrickContainer", function (assert) {

    assert.expect(15);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var doneFinal = assert.async();

    var bc = new PocketCode.Bricks.BrickContainer();
    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;

        assert.ok(handler1Called, "handler called");
        done1();
        assert.ok(handler1LoopDelay, "loopDelay handled corrrectly");
        done2();
        assert.ok(handler1CallId === "newId", "call id handled corrrectly");
        done3();

        proceedTests();
    };
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    assert.ok(bc._bricks.length === 0, "brick created and properties set correctly");   //initialized as array
    assert.ok(bc instanceof PocketCode.Bricks.BrickContainer, "instance check");

    var handler2 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;
    };
    bc.execute(new SmartJs.Event.EventListener(handler2, this), "pc234");    //call on empty container
    assert.ok(handler1Called, "empty container: handler called");
    assert.ok(!handler1LoopDelay, "empty container: loopDelay handled corrrectly");
    assert.ok(handler1CallId === "pc234", "empty container: call id handled corrrectly");

    //renint
    handler1Called = false;
    handler1LoopDelay = false;
    handler1CallId = undefined;


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
                var _self = this;
                window.setTimeout(function () { _self._return(id, false) }, 300);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
            pause: function () {
                this.paused = true;
            },
            resume: function () {
                this.paused = false;
            },
            stop: function () {
                this.stopped = true;
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


    function proceedTests() {
        var count = 0;
        for (p in bc._pendingOps)
            if (testBrick._pendingOps.hasOwnProperty(p))
                count++;
        assert.ok(count === 0, "pending operations removed from queue");

        //all bricks executed
        assert.ok(bc._bricks[0].executed === 1 && bc._bricks[1].executed === 1 && bc._bricks[2].executed === 1, "all inner bricks executed (once)");

        bc.pause();
        assert.equal(bc._bricks[1].paused, true, "bricks paused");
        bc.resume();
        assert.equal(bc._bricks[1].paused, false, "bricks resumed");
        bc.stop();
        assert.equal(bc._bricks[1].stopped, true, "bricks stopped");

        doneFinal();
    }
});

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
    };
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
    };
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

QUnit.test("SingleContainerBrick", function (assert) {

    assert.expect(12);   //init async asserts (to wait for)
    var done1 = assert.async();

    var b = new PocketCode.Bricks.SingleContainerBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SingleContainerBrick, "instance check");
    assert.ok(b.objClassName === "SingleContainerBrick", "objClassName check");

    assert.throws(function () { b.bricks = []; }, Error, "ERROR: validating bricks setter");

    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;
    };
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    var cont = new PocketCode.Bricks.BrickContainer();  //empty conatiner
    b.bricks = cont;
    b.execute(l1, "sx23");
    assert.ok(handler1Called && !handler1LoopDelay && handler1CallId === "sx23", "call on empty container");

    //advanced tests using brick with delay

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
            pause: function () {
                this.paused = true;
            },
            resume: function () {
                this.paused = false;
            },
            stop: function () {
                this.stopped = true;
            },
        });

        return TestBrick2;
    })();

    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));

    //re-init vars
    handler1Called = false;
    handler1LoopDelay = false;
    handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;

        assert.equal(handler1CallId, "newTID", "bricks executed");
        assert.equal(b._pendingOps["newTID"], undefined, "pending ops cleared");
        done1();
    };
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    var bc= new PocketCode.Bricks.BrickContainer(bricks);    //container including bricks
    b.bricks = bc;

    assert.equal(b._bricks, bc, "bricks setter");

    //simulate pending operation
    b._pendingOps["sim"] = { is: "anything" };
    b.pause();
    assert.ok(b._bricks._bricks[0].paused && b._bricks._bricks[1].paused && b._bricks._bricks[2].paused && b._bricks._bricks[3].paused, "brick pause");
    b.resume();
    assert.ok(!b._bricks._bricks[0].paused && !b._bricks._bricks[1].paused && !b._bricks._bricks[2].paused && !b._bricks._bricks[3].paused, "brick resume");
    b.stop();
    assert.ok(b._bricks._bricks[0].stopped && b._bricks._bricks[1].stopped && b._bricks._bricks[2].stopped && b._bricks._bricks[3].stopped, "brick stop");
    assert.ok(!b._pendingOps["sim"], "delete pending ops when stop() is called");
    b.execute(l1, "newTID");
    
});

QUnit.test("RootContainerBrick", function (assert) {

    var b = new PocketCode.Bricks.RootContainerBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.RootContainerBrick, "instance check");
    assert.ok(b.objClassName === "RootContainerBrick", "objClassName check");

    var exec = 0;
    var executedHandler = function (e) {
        exec++;
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(executedHandler, this));

    //var handler1Called = false;
    //var handler1LoopDelay = false;
    //var handler1CallId = undefined;

    //var handler1 = function (e) {
    //    handler1Called = true;
    //    handler1LoopDelay = e.loopDelay;
    //    handler1CallId = e.id;
    //};
    //var l1 = new SmartJs.Event.EventListener(handler1, this);

    b.bricks = new PocketCode.Bricks.BrickContainer();  //empty conatiner
    b.execute();
    //assert.ok(handler1Called && !handler1LoopDelay && handler1CallId === "rootcont", "call on empty container");
    assert.equal(exec, 1, "custom event onExecuted dispatched (once)");

    //assert.throws(function () { b.execute(l1, "rootcont"); }, Error, "ERROR: on call execute()");

});

QUnit.test("LoopBrick", function (assert) {

    assert.expect(4);   //init async asserts (to wait for)
    var done1 = assert.async();

    var b = new PocketCode.Bricks.LoopBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.LoopBrick, "instance check");
    assert.ok(b.objClassName === "LoopBrick", "objClassName check");

    //the only test case we can trigger here is an empty loop due to the fact the return handler is always called from inside a specific loop implementation
    var startTime = new Date();
    var handler1 = function (e) {
        assert.equal(e.id, "loopId", "loop id returned correctly");

        var execTime = new Date() - startTime;
        //assert.ok(execTime >= 3 && execTime <= 50, "execution minimum delay (3ms) on loops for threading simulation: loopDelay is not set");
        //^^ test case removed: only a recalled loop has a delay, a single cycle is not delayed
        done1();
    };
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    b.execute(l1, "loopId");

});

QUnit.test("UnsupportedBrick", function (assert) {

    var b = new PocketCode.Bricks.UnsupportedBrick("device", "sprite", { xml: "xml", brickType: "brickType" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._xml === "xml" && b._brickType === "brickType", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.UnsupportedBrick, "instance check");
    assert.ok(b.objClassName === "UnsupportedBrick", "objClassName check");

    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;
    };
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    b.execute(l1, "s23");
    assert.ok(handler1Called && !handler1LoopDelay && handler1CallId === "s23", "executed correctly");
});

