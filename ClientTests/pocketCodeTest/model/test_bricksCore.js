/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
'use strict';

QUnit.module("model/bricksCore.js");


QUnit.test("BrickContainer", function (assert) {

    assert.expect(17);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var doneFinal = assert.async();

    var bc = new PocketCode.Model.BrickContainer();
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
    assert.ok(bc instanceof PocketCode.Model.BrickContainer, "instance check");

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
        TestBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
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
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
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
        TestBrick3.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick3(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
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

    bc = new PocketCode.Model.BrickContainer([new TestBrick("device", "sprite", { id: "id" }), new TestBrick2("device", "sprite", { id: "id" }), new TestBrick3("device", "sprite", { id: "id" })]);

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

        testDispose();
    }

    function checkBricksDisposed(parentBrick) {
        //we only check the first hierachy here
        return parentBrick._disposed == true;
    }

    function testDispose() {
        //simulate pending ops
        bc._pendingOps.newID = { test: "only" };
        bc.dispose();
        assert.deepEqual(bc._pendingOps, {}, "pending operations cleared during dispose");
        var disposed = true;
        for (var i = 0, l = bc._bricks.length; i < l; i++) {
            disposed = disposed && checkBricksDisposed(bc._bricks[i])
            if (!disposed)
                break;
        }
        assert.ok(disposed, "all bricks (including sub bricks) disposed");

        bc.execute(l1, "newId");

        doneFinal();
    }
});


QUnit.test("BaseBrick", function (assert) {

    var b = new PocketCode.Model.BaseBrick("device", "sprite", { id: "id", commentedOut: false });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._commentedOut === false, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "BaseBrick", "objClassName check");

    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Model.BaseBrick, false);

        function TestBrick(device, sprite, propObjecct) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObjecct);
        }

        TestBrick.prototype.merge({
            _execute: function () {
                this._return(true);
            },
        });

        return TestBrick;
    })();

    var testBrick = new TestBrick("device", "sprite", { id: "id" });
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

    var b = new PocketCode.Model.ThreadedBrick("device", "sprite", { id: "id", commentedOut: false });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._commentedOut === false, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ThreadedBrick, "instance check");
    assert.ok(b.objClassName === "ThreadedBrick", "objClassName check");

    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
        }

        TestBrick.prototype.merge({
            _execute: function (id) {
                this._return(id, true);
            },
        });

        return TestBrick;
    })();

    var testBrick = new TestBrick("device", "sprite", { id: "id" });
    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = e.loopDelay;
        handler1CallId = e.id;
    };
    var l1 = new SmartJs.Event.EventListener(handler1, this);

    //run threaded brick: please notice that _execute() is a method to be overridden
    b.execute(l1, "initialId");
    assert.ok(handler1Called, "initial: handler called");
    assert.equal(handler1LoopDelay, false, "initial: loop delay (always false)");
    assert.equal(handler1CallId, "initialId", "initial: call id handled corrrectly");

    //run inherited brick
    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;
    assert.throws(function () { testBrick.execute(l1, 23); }, Error, "ERROR: simple argument error check");

    testBrick.execute(l1, "callId");
    assert.ok(handler1Called, "handler called");
    assert.ok(handler1LoopDelay, "loop delay handled corrrectly");
    assert.equal(handler1CallId, "callId", "call id handled corrrectly");

    var count = 0;
    for (p in testBrick._pendingOps)
        if (testBrick._pendingOps.hasOwnProperty(p))
            count++;
    assert.ok(count === 0, "pending operations removed from queue");

});


QUnit.test("SingleContainerBrick", function (assert) {

    assert.expect(12);   //init async asserts (to wait for)
    var done1 = assert.async();

    var b = new PocketCode.Model.SingleContainerBrick("device", "sprite", { id: "id", commentedOut: false });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._commentedOut === false, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SingleContainerBrick, "instance check");
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

    var cont = new PocketCode.Model.BrickContainer();  //empty conatiner
    b.bricks = cont;
    b.execute(l1, "sx23");
    assert.ok(handler1Called && !handler1LoopDelay && handler1CallId === "sx23", "call on empty container");

    //advanced tests using brick with delay

    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
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

    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));

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

    var bc = new PocketCode.Model.BrickContainer(bricks);    //container including bricks
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


QUnit.test("ScriptBlock", function (assert) {

    var done1 = assert.async();

    var b = new PocketCode.Model.ScriptBlock("device", "sprite", { id: "newId", commentedOut: false }); //, x: 10, y: 20 });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._commentedOut === false, "brick created and properties set correctly"); // && b._x == 10 && b._y == 20
    assert.ok(b instanceof PocketCode.Model.ScriptBlock && b instanceof PocketCode.Model.SingleContainerBrick, "instance and inheritance check");
    assert.ok(b.objClassName === "ScriptBlock", "objClassName check");

    assert.equal(b.id, "newId", "id accessor");
    assert.equal(b.executionState, PocketCode.ExecutionState.STOPPED, "exec state initial");

    //advanced tests using brick with delay
    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
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

    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));

    var bc = new PocketCode.Model.BrickContainer(bricks);    //container including bricks
    b.bricks = bc;

    assert.equal(b._bricks, bc, "bricks setter");

    var exec = 0;
    var executedHandler = function (e) {
        exec++;
        assert.equal(exec, 1, "custom event onExecuted dispatched (once)");
        done1();
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(executedHandler, this));
    b.execute();
    assert.equal(b.executionState, PocketCode.ExecutionState.RUNNING, "exec state: execute");
    var execState = b.executionState;
    b.pause();
    assert.equal(b.executionState, execState, "exec state: not updated on pause()");
    assert.ok(b._bricks._bricks[0].paused && b._bricks._bricks[1].paused && b._bricks._bricks[2].paused && b._bricks._bricks[3].paused, "super call: pause");
    b.resume();
    assert.equal(b.executionState, PocketCode.ExecutionState.RUNNING, "exec state: resume");
    assert.ok(!b._bricks._bricks[0].paused && !b._bricks._bricks[1].paused && !b._bricks._bricks[2].paused && !b._bricks._bricks[3].paused, "super call: resume");
    b.stop();
    assert.equal(b.executionState, PocketCode.ExecutionState.STOPPED, "exec state: stop");
    assert.ok(b._bricks._bricks[0].stopped && b._bricks._bricks[1].stopped && b._bricks._bricks[2].stopped && b._bricks._bricks[3].stopped, "super call: stop");
    b.execute();

});


QUnit.test("SingleInstanceScriptBlock", function (assert) {
    assert.ok(false, "TODO");
});


QUnit.test("LoopBrick", function (assert) {

    //assert.expect(4);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var b = new PocketCode.Model.LoopBrick("device", "sprite", 24, { id: "id", commentedOut: false });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._commentedOut === false && b._minLoopCycleTime === 24, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.LoopBrick, "instance check");
    assert.ok(b.objClassName === "LoopBrick", "objClassName check");

    //empty loop
    var startTime = new Date();
    var handler1 = function (e) {
        assert.equal(e.id, "loopId", "loop id returned correctly");

        //var execTime = new Date() - startTime;
        //assert.ok(execTime >= 3 && execTime <= 50, "execution minimum delay (3ms) on loops for threading simulation: loopDelay is not set");
        //^^ test case removed: only a recalled loop has a delay, a single cycle is not delayed
        done1();
    };
    var l1 = new SmartJs.Event.EventListener(handler1, this);
    b.execute(l1, "loopId");

    //loops including brick
    var device = new PocketCode.MediaDevice("soundManager");
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var testBrick2 = new PocketCode.Model.WaitBrick(device, sprite, { duration: { type: "NUMBER", value: 0.2, right: null, left: null } });

    //pause on inactive loop
    var b2 = new PocketCode.Model.LoopBrick("device", "sprite", 24, { id: "id" });
    b2.bricks = new PocketCode.Model.BrickContainer([testBrick2]);    //add brick to loop
    b2._loopCount = 3;
    b2._loopConditionMet = function (id) { this._loopCount--; return this._loopCount !== 0; };   //override to simulate running
    var called = 0;
    var handler2 = function (e) {
        called++;
        done2();
    };
    var l2 = new SmartJs.Event.EventListener(handler2, this);
    b2.pause();
    assert.ok(b2._paused, "loop set paused");
    b2.execute(l2, "pausedId");
    //window.setTimeout(function () { b.resume(); }, 50);
    b2.resume();

    //pause on active loop
    var testBrick3 = new PocketCode.Model.WaitBrick(device, sprite, { duration: { type: "NUMBER", value: 0.1, right: null, left: null } });
    var b3 = new PocketCode.Model.LoopBrick("device", "sprite", 24, { id: "id" });
    b3.bricks = new PocketCode.Model.BrickContainer([testBrick3]);    //add brick to loop

    var handler3 = function (e) {
        b.stop();
        done3();
    };
    var l3 = new SmartJs.Event.EventListener(handler3, this);
    b3._loopCount = 3;
    b3._loopConditionMet = function (id) { this._loopCount--; return this._loopCount !== 0; };   //override to simulate running
    b3.execute(l3, "id");
    b3.pause();
    assert.notDeepEqual(b3._pendingOps, {}, "loop running- paused after start");
    assert.ok(testBrick3._paused, "internal brick paused and running");

    b3.resume();

});


QUnit.test("UnsupportedBrick", function (assert) {

    var b = new PocketCode.Model.UnsupportedBrick("device", "sprite", { id: "id", commentedOut: false, xml: "xml", brickType: "brickType" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._commentedOut === false && b._xml === "xml" && b._brickType === "brickType", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.UnsupportedBrick, "instance check");
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

