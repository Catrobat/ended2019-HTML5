/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/broadcastManager.js" />
/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("broadcastManager.js");


QUnit.test("BroadcastManager", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var b = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);

    assert.ok(typeof b._pendingBW === "object", "init pending operations");
    assert.ok(typeof b._subscriptions.s12 === "object" && b._subscriptions.s12 instanceof Array, "init broadcast dictionary");

    assert.ok(b instanceof PocketCode.BroadcastManager, "instance check");

    var handler1Called = false, handler2Called = false, handler3Called = false;
    var loopDelay, threadId;

    var handler1 = function (e) {
        handler1Called = true;
        loopDelay = e.loopDelay;
        threadId = e.id;
    };

    var handler2 = function (e) {
        handler2Called = true;
    };

    var handler3 = function (e) {
        handler3Called = true;
    };

    //BROADCAST (WITHOUT WAIT)

    //subscribe
    assert.throws(function () { b.subscribe(12, new SmartJs.Event.EventListener(handler1, this)); }, Error, "ERROR: subscribe: invalid argument: broadcast id");
    assert.throws(function () { b.subscribe("s12", new Function()); }, Error, "ERROR: subscribe: invalid argument: subscriber listener");
    assert.throws(function () { b.subscribe("s13", new SmartJs.Event.EventListener(handler1, this)); }, Error, "ERROR: subscribe: invalid argument: invalid (unknown) broadcast id");

    var l1 = new SmartJs.Event.EventListener(handler1, this);
    b.subscribe("s12", l1);
    assert.ok(b._subscriptions.s12[0] === l1, "single subscribe");

    var l2 = new SmartJs.Event.EventListener(handler2, this);
    b.subscribe("s12", l2);
    assert.equal(b._subscriptions.s12[1], l2, "multiple subscribe");

    //init
    b.init([{ id: "s12", name: "test" }, { id: "s13", name: "test2" }]);
    assert.ok(typeof b._pendingBW === "object", "re-init pending operations");
    assert.ok(typeof b._subscriptions.s12 === "object", "re-init broadcast dictionary");
    assert.ok(b._subscriptions.s12.length === 0, "re-init: subscriptions deleted");

    //publish
    //broadcast
    assert.throws(function () { b.publish(13); }, Error, "ERROR: broadcast: id invalid");

    assert.ok(function () { b.publish("s12"); return true; }(), "broadcast: on empty subscription list");

    b.subscribe("s12", l1);
    b.publish("s12");
    assert.ok(handler1Called, "broadcast: single subscriber");
    assert.equal(loopDelay, undefined, "loopDelay on empty subscription");
    assert.equal(threadId, undefined, "threadId on empty subscription");
    //reinit
    handler1Called = false;
    loopDelay = undefined;
    threadId = undefined;

    b.subscribe("s12", l2);
    var l3 = new SmartJs.Event.EventListener(handler3, this);
    b.subscribe("s13", l3);
    b.publish("s12");
    assert.ok(handler1Called && handler2Called && !handler3Called, "broadcast: multiple subscribers");

    handler1Called = false;
    handler2Called = false;


    //BROADCAST WAIT
    var b = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);

    //no subscribers
    b.publish("s12", new SmartJs.Event.EventListener(handler1, this), "thread_id");
    assert.ok(handler1Called, "broadcast wait: publisher feedback on empty subscription");
    assert.equal(loopDelay, undefined, "broadcast wait: loopDelay on empty subscription");
    assert.equal(threadId, "thread_id", "broadcast wait: threadId on empty subscription");

    b.init([{ id: "s12", name: "test" }, { id: "s13", name: "test" }]);

    assert.throws(function () { b.publish("s12", new Function(), "asd"); }, Error, "ERROR: broadcast wait: publisher listener invalid");
    assert.throws(function () { b.publish("s12", l1); }, Error, "ERROR: broadcast wait: missing thread id");

    //reinit
    handler1Called = false;
    loopDelay = undefined;
    threadId = undefined;

    //multiple subscribers
    b.init([{ id: "s12", name: "test" }, { id: "s13", name: "test2" }]);

    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Bricks.BroadcastReceive, false);

        function TestBrick2(device, sprite, broadcastMgr, broadcastMsgId) {
            PocketCode.Bricks.BroadcastReceive.call(this, device, sprite, broadcastMgr, broadcastMsgId);
            this.executed = 0;
            this.delay = 100;
            this.loopDelay = false;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                var _self = this;
                window.setTimeout(function () { _self._return(id, _self.loopDelay) }, this.delay);
            },
        });

        return TestBrick2;
    })();

    //create test bricks
    var brickUncalled = new TestBrick2("device", "sprite", b, { receiveMsgId: "s13" });
    var brick1 = new TestBrick2("device", "sprite", b, { receiveMsgId: "s12" });
    brick1.delay = 600;
    var brick2 = new TestBrick2("device", "sprite", b, { receiveMsgId: "s12" });
    var brick3 = new TestBrick2("device", "sprite", b, { receiveMsgId: "s12" });
    brick3.loopDelay = true;

    var startTime = new Date();
    var asyncHandler = function (e) {
        var time = new Date();
        assert.ok(time - startTime >= 600, "broadcast wait: multiple subscribers: waiting on last brick to be executed");
        assert.ok(brickUncalled.executed == 0, "broadcast wait: multiple subscribers: only bricks with correct msg id executed");
        assert.ok(brick1.executed == 1 && brick2.executed == 1 && brick3.executed == 1, "broadcast wait: multiple subscribers: all bricks executed");

        assert.equal(e.loopDelay, true, "broadcast wait: multiple subscribers: loopDelay");
        assert.equal(e.id, "thread_id", "broadcast wait: multiple subscribers: threadId");

        done1();
        //startComplexTest1();
    };

    b.publish("s12", new SmartJs.Event.EventListener(asyncHandler, this), "thread_id");


    //BROADCAST WAIT COMPLEX: 2 hierachies

    var b2 = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }, { id: "s13", name: "test2" }]);
    var brick01 = new TestBrick2("device", "sprite", b2, { receiveMsgId: "s13" });
    var brick11 = new TestBrick2("device", "sprite", b2, { receiveMsgId: "s12" });
    brick11.delay = 200;
    var brick21 = new TestBrick2("device", "sprite", b2, { receiveMsgId: "s12" });

    brick21.loopDelay = true;

    var TestBrick3 = (function () {
        TestBrick3.extends(PocketCode.Bricks.BroadcastReceive, false);

        function TestBrick3(device, sprite, broadcastMgr, broadcastMsgId) {
            PocketCode.Bricks.BroadcastReceive.call(this, device, sprite, broadcastMgr, broadcastMsgId);
            this.executed = 0;
            this.delay = 200;
            this.loopDelay = false;
        }

        TestBrick3.prototype.merge({
            _execHandler: function (e) {
                var _self = this;
                window.setTimeout(function () { _self._return(e.id, e.loopDelay) }, this.delay);
            },
            _execute: function (id) {
                this.executed++;
                var _self = this;

                b2.publish("s13", new SmartJs.Event.EventListener(this._execHandler, this), id);
            },
        });

        return TestBrick3;
    })();

    var brick31 = new TestBrick3("device", "sprite", b2, { receiveMsgId: "s12" });

    //^^ "s12" is executed waiting for 4 threads to complete, one of them starts another one and waits for int
    //we are waiting for 200 + 100ms -> 300ms: brick01-brick31 get executed
    var startTime1;// = new Date();
    var asyncHandler2 = function (e) {
        var time1 = new Date();
        //console.log(time1 - startTime1);
        assert.ok(time1 - startTime1 >= 300, "broadcast wait: complex: waiting for last brick to be executed");
        assert.ok(brick01.executed == 1 && brick11.executed == 1 && brick21.executed == 1 && brick31.executed == 1, "broadcast wait: complex: all bricks executed");

        assert.equal(e.loopDelay, true, "broadcast wait: complex: loopDelay");
        assert.equal(e.id, "thread_id2", "broadcast wait: complex: threadId");

        done2();
    };

    var startTime1 = new Date();
    b2.publish("s12", new SmartJs.Event.EventListener(asyncHandler2, this), "thread_id2");


    //BROADCAST WAIT COMPLEX: multiple self calls
    //TODO: looks like a container is needed here- built this test case using original BroadcastReceive Bricks including a custom wait brick
    done3();
    //var b3 = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }, { id: "s13", name: "test2" }]);
    //var brick02 = new TestBrick2("device", "sprite", b3, { receiveMsgId: "s13" });
    //var brick12 = new TestBrick2("device", "sprite", b3, { receiveMsgId: "s12" });
    //brick12.delay = 50;
    //var brick22 = new TestBrick2("device", "sprite", b3, { receiveMsgId: "s12" });

    //brick22.loopDelay = true;

    //var TestBrick4 = (function () {
    //    TestBrick4.extends(PocketCode.Bricks.BroadcastReceive, false);

    //    function TestBrick4(device, sprite, broadcastMgr, broadcastMsgId) {
    //        PocketCode.Bricks.BroadcastReceive.call(this, device, sprite, broadcastMgr, broadcastMsgId);
    //        this.executed = 0;
    //        this.delay = 70;
    //        this.loopDelay = false;
    //    }

    //    TestBrick4.prototype.merge({
    //        _execHandler: function (e) {
    //            //var _self = this;
    //            console.log("step:" + this.executed + ", delay: " + (new Date - this.startTime2));
    //            window.setTimeout(this._return.bind(this, e.id, e.loopDelay), this.delay);
    //        },
    //        execute:function(id) {
    //            console.log("execute:" + this.executed + ", delay: " + (new Date - this.startTime2));
    //            PocketCode.Bricks.BroadcastReceive.prototype.execute.call(this, id);
    //        },
    //        _execute: function (id) {
    //            this.executed++;
    //            //console.log("step:" + this.executed + ", delay: " + (new Date - this.startTime2));
    //            if (this.executed == 4) {
    //                //var _self = this;
    //                window.setTimeout(this._return.bind(this, id, false), this.delay);
    //                return;
    //            }

    //            //var _self = this;

    //            b3.publish("s12", new SmartJs.Event.EventListener(this._execHandler, this), id);
    //        },
    //    });

    //    return TestBrick4;
    //})();

    //var brick32 = new TestBrick4("device", "sprite", b3, { receiveMsgId: "s12" });

    ////we are waiting for 300 + 100ms -> 400ms: brick02-brick32 get executed
    //var startTime2;// = new Date();
    //var asyncHandler3 = function (e) {
    //    var time2 = new Date();
    //    console.log(time2 - startTime2);
    //    assert.ok(time2 - startTime2 >= 570, "broadcast wait: self call: waiting for last brick to be executed");
    //    assert.ok(brick02.executed == 0 && brick12.executed == 4 && brick22.executed == 4 && brick32.executed == 4, "broadcast wait: self call: all bricks executed");

    //    assert.equal(e.loopDelay, true, "broadcast wait: self call: loopDelay");
    //    assert.equal(e.id, "thread_id3", "broadcast wait: self call: threadId");

    //    done3();
    //};

    //var startTime2 = new Date();
    //brick32.startTime2 = startTime2;
    //b3.publish("s12", new SmartJs.Event.EventListener(asyncHandler3, this), "thread_id3");


});

