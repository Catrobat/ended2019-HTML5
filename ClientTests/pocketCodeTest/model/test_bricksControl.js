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

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var sprite = "sprite";
    var duration = JSON.parse('{"type":"NUMBER","value":"500","right":null,"left":null}');
    var b = new PocketCode.Bricks.WaitBrick(device, sprite, { duration: duration });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");  // && b._duration === "duration" -> duration is parsed as formula 
    assert.ok(b instanceof PocketCode.Bricks.WaitBrick, "instance check");
    assert.ok(b.objClassName === "WaitBrick", "objClassName check");

    //alert(b._duration.calculate);
    assert.equal(b._duration.calculate(), 500, "formula created correctly");

    var asyncHandler1 = function (e) {
        assert.equal(e.loopDelay, false, "loop delay event arg");
        assert.equal(e.id, "waitPlease", "loop delay id");
        done1();

        test2();
    };
    var l1 = new SmartJs.Event.EventListener(asyncHandler1, this);
    b.execute(l1, "waitPlease");

    //multiple calls
    var s1, s2, s3, s4;
    var asyncHandler2 = function (e) {

        switch (e.id) {
            case "s1":
                s1 = new Date();
                break;
            case "s2":
                s2 = new Date();
                break;
            case "s3":
                s3 = new Date();
                break;
            case "s4":
                s4 = new Date();
                break;
        }

        if (s1 != undefined && s2 != undefined && s3 != undefined && s4 != undefined) {
            s1 = new Date() - s1;
            s2 = new Date() - s2;
            s3 = new Date() - s3;
            s4 = new Date() - s4;

            assert.ok(s1 < s2 && s2 < s3 && s3 < s4, "testing threaded calls");
            done2();

        }
    };

    l1 = new SmartJs.Event.EventListener(asyncHandler2, this);

    var test2 = function () {
        b.execute(l1, "s1");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"400","right":null,"left":null}'));
        b.execute(l1, "s2");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"300","right":null,"left":null}'));
        b.execute(l1, "s3");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"200","right":null,"left":null}'));
        b.execute(l1, "s4");

        //test pause
        b.pause();
        var po = b._pendingOps;
        var set = true;
        for (var o in po) {
            set = set && po[o].timer._paused;
        }
        assert.ok(set, "all timers paused");

        b.resume();
        var set = false;
        for (var o in po) {
            set = set || po[o].timer._paused;
        }
        assert.ok(!set, "all timers resumed");

    };

    //var count = 0;
    var b2 = new PocketCode.Bricks.WaitBrick(device, sprite, { duration: duration });
    var asyncHandler3 = function (e) {
        //count++;
        b2.stop();

        assert.ok(false, "brick NOT stopped");
        done3();    //this will throw an error if called more than once
    };

    var l2 = new SmartJs.Event.EventListener(asyncHandler3, this);

    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"50","right":null,"left":null}'));
    b2.execute(l2, "s1");
    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"45","right":null,"left":null}'));
    b2.execute(l2, "s2");
    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"43","right":null,"left":null}'));
    b2.execute(l2, "s3");
    //b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"100","right":null,"left":null}'));
    //b2.execute(l1, "s4");
    b2.stop();

    var timeoutId = undefined;
    var po = b2._pendingOps;
    for (var o in po) {
        timeoutId = timeoutId || po[o].timer._timeoutId;
    }

    assert.ok(timeoutId === undefined, "all timers stopped");
    //assert.ok(true, "brick stopped");
    done3();    //this will throw an error if called more than once

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

    var id;
    var loopDelay;
    var h = function (e) {
        id = e.id;
        loopDelay = e.loopDelay;
    };
    var count = 0;
    var h2 = function () { //for broadcastMrg listener
        count++;
    };

    broadcastMgr.subscribe("s12", new SmartJs.Event.EventListener(h2, this));
    b.execute(new SmartJs.Event.EventListener(h, this), "sdf");

    assert.equal(id, "sdf", "return handler dispatched and id set correctly");
    assert.equal(loopDelay, undefined, "loop delay set correctly");

    assert.equal(count, 1, "broadcast was handled by broadcast manager");
});

QUnit.test("BroadcastAndWaitBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Bricks.BroadcastAndWaitBrick("device", "sprite", broadcastMgr, { broadcastMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._broadcastMsgId === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.BroadcastAndWaitBrick, "instance check");
    assert.ok(b.objClassName === "BroadcastAndWaitBrick", "objClassName check");

    var h = function (e) {  //async
        assert.equal(e.id, "sdf", "return handler dispatched and id set correctly");
        assert.equal(e.loopDelay, true, "loop delay set correctly");

        //assert.ok(broadcastMgr._pendingBW[)
        done1();
    };

    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
            this._delay = 100;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                var _self = this;
                window.setTimeout(function () { _self._return(id, true) }, _self._delay);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    //one subscriber
    var tb1 = new TestBrick2();

    var _returnHandler = function (e) {
        tb1.execute(e.listener, e.id);
    };

    broadcastMgr.subscribe("s12", new SmartJs.Event.EventListener(_returnHandler, this));
    b.execute(new SmartJs.Event.EventListener(h, this), "sdf");

});

QUnit.test("NoteBrick", function (assert) {

    var b = new PocketCode.Bricks.NoteBrick("device", "sprite", { text: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._text === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.NoteBrick, "instance check");
    assert.ok(b.objClassName === "NoteBrick", "objClassName check");

    var id;
    var loopDelay;
    var h = function (e) {
        id = e.id;
        loopDelay = e.loopDelay;
    };

    b.execute(new SmartJs.Event.EventListener(h, this), "sdf");

    assert.equal(id, "sdf", "return handler dispatcht and id set correctly");
    assert.equal(loopDelay, undefined, "loop delay set correctly");
});

QUnit.test("ForeverBrick", function (assert) {

    assert.expect(7);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();

    var b = new PocketCode.Bricks.ForeverBrick("device", "sprite");

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ForeverBrick, "instance check");
    assert.ok(b.objClassName === "ForeverBrick", "objClassName check");

    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
            this._delay = 100;
            this.loobDelay = false;

            this.onTestFinished = new SmartJs.Event.Event(this);
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                if (this.executed === 6) {  //helper to terminate this loop, inlcuding 5 waits
                    this.onTestFinished.dispatchEvent();
                    return;
                }
                var _self = this;
                //window.setTimeout(function () { _self._return(id, true) }, _self._delay);
                this._return(id, this.loobDelay);    //LOOP DELAY = FALSE
            },
            start: function() {
                this._stopped = false;
            },
            stop: function () {
                this._stopped = true;
            }
        });

        return TestBrick2;
    })();

    //test empty not possible
    //loop delay = false
    var bca = [];
    var tb = new TestBrick2("device", "sprite");
    
    bca.push(tb);
    var neverCalled = function() {
        return;
    };
    //without delay
    var testFinishedHandler1 = function (e) {
        //async
        var finishTime = new Date();
        assert.equal(tb.executed, 6, "loop running continously");
        var delay = finishTime - startTime;
        //console.log("running loop 6 times without loop delay = " + delay + "ms");
        assert.ok(delay >= 12 /*&& delay <= 35*/, "threading: without loop delay");
        done1();
    };

    b.bricks = new PocketCode.Bricks.BrickContainer(bca);
    tb.onTestFinished.addEventListener(new SmartJs.Event.EventListener(testFinishedHandler1, this));
    var startTime = new Date();
    b.execute(new SmartJs.Event.EventListener(neverCalled, this), "forever");

    //with delay
    var testFinishedHandler2 = function (e) {
        //async
        var finishTime = new Date();
        assert.equal(tb.executed, 6, "loop running continously");
        var delay = finishTime - startTime;
        //console.log("running loop 6 times without loop delay = " + delay + "ms");
        assert.ok(delay >= 90 /*&& delay <= 120*/, "threading: including loop delay");
        done2();
    };

    var b2 = new PocketCode.Bricks.ForeverBrick("device", "sprite");
    var tb2 = new TestBrick2("device", "sprite");
    bca = [];
    bca.push(tb2);
    b2.bricks = new PocketCode.Bricks.BrickContainer(bca);
    //var removed = tb.onTestFinished.removeEventListener(new SmartJs.Event.EventListener(testFinishedHandler1, this));
    //console.log("removed handler: " + removed);
    tb2.onTestFinished.addEventListener(new SmartJs.Event.EventListener(testFinishedHandler2, this));

    tb2.loobDelay = true;
    b2.execute(new SmartJs.Event.EventListener(neverCalled, this), "forever");

});

QUnit.test("IfThenElseBrick", function (assert) {

    var cond = JSON.parse('{"type":"NUMBER","value":"500","right":null,"left":null}');
    var b = new PocketCode.Bricks.IfThenElseBrick("device", "sprite", { condition: cond });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");  //condition is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Bricks.IfThenElseBrick, "instance check");
    assert.ok(b.objClassName === "IfThenElseBrick", "objClassName check");


});

QUnit.test("RepeatBrick", function (assert) {

    //assert.expect(7);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();

    var nTimes = JSON.parse('{"type":"NUMBER","value":"6","right":null,"left":null}');
    var b = new PocketCode.Bricks.RepeatBrick("device", "sprite", { timesToRepeat: nTimes });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");   //timesToRepeat is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Bricks.RepeatBrick, "instance check");
    assert.ok(b.objClassName === "RepeatBrick", "objClassName check");

    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);
            this.executed = 0;
            this._delay = 10;
            this.loobDelay = false;

            //this.onTestFinished = new SmartJs.Event.Event(this);
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                //this.executed++;
                //if (this.executed === 6) {  //helper to terminate this loop, inlcuding 5 waits
                //    this.onTestFinished.dispatchEvent();
                //    return;
                //}
                var _self = this;
                window.setTimeout(function () { _self._return(id, true) }, _self._delay);
                //this._return(id, this.loobDelay);    //LOOP DELAY = FALSE
            },
            start: function () {
                this._stopped = false;
            },
            stop: function () {
                this._stopped = true;
            }
        });

        return TestBrick2;
    })();
    /*
    //test empty not possible
    //loop delay = false
    var bca = [];
    var tb = new TestBrick2("device", "sprite");

    bca.push(tb);
    //without delay
    var testFinishedHandler1 = function (e) {
        //async
        var finishTime = new Date();
        //assert.equal(tb.executed, 6, "loop running continously");
        var delay = finishTime - startTime;
        //console.log("running loop 6 times without loop delay = " + delay + "ms");
        assert.ok(delay >= 12, "threading: without loop delay");
        assert.equal(e.id, "n_times", "id returned correctly");
        assert.equal(e.loopDelay, false, "id returned correctly");

        done1();
    };

    b.bricks = new PocketCode.Bricks.BrickContainer(bca);
    var startTime = new Date();
    b.execute(new SmartJs.Event.EventListener(testFinishedHandler1, this), "n_times");
    
    //with delay
    var testFinishedHandler2 = function (e) {
        //async
        var finishTime = new Date();
        //assert.equal(tb.executed, 6, "loop running continously");
        var delay = finishTime - startTime;
        //console.log("running loop 6 times without loop delay = " + delay + "ms");
        assert.ok(delay >= 90, "threading: including loop delay");
        assert.equal(e.id, "n_times2", "id returned correctly");
        assert.equal(e.loopDelay, true, "id returned correctly");

        done2();
    };

    var b2 = new PocketCode.Bricks.RepeatBrick("device", "sprite", { timesToRepeat: nTimes });
    var tb2 = new TestBrick2("device", "sprite");
    bca = [];
    bca.push(tb2);
    b2.bricks = new PocketCode.Bricks.BrickContainer(bca);
    //var removed = tb.onTestFinished.removeEventListener(new SmartJs.Event.EventListener(testFinishedHandler1, this));
    //console.log("removed handler: " + removed);
    //tb2.onTestFinished.addEventListener(new SmartJs.Event.EventListener(testFinishedHandler2, this));

    tb2.loobDelay = true;
    b2.execute(new SmartJs.Event.EventListener(testFinishedHandler2, this), "n_times2");
*/
    done1();
    done2();
});


