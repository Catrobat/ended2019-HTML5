/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/broadcastManager.js" />
/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("broadcastManager.js");


QUnit.test("BroadcastManager", function (assert) {

    var done1 = assert.async();

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
        assert.ok(!brickUncalled.executed, "broadcast wait: multiple subscribers: only bricks with correct msg id executed");
        assert.ok(brick1.executed && brick2.executed && brick3.executed, "broadcast wait: multiple subscribers: all bricks executed");

        assert.equal(e.loopDelay, true, "broadcast wait: multiple subscribers: loopDelay on empty subscription");
        assert.equal(e.id, "thread_id", "broadcast wait: multiple subscribers: threadId on empty subscription");

        done1();
    };

    b.publish("s12", new SmartJs.Event.EventListener(asyncHandler, this), "thread_id");


});

