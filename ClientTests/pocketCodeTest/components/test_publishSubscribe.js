/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/publishSubscribe.js" />
'use strict';

QUnit.module("components/publishSubscribe.js");

QUnit.test("PublishSubscribeBroker", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var done5 = assert.async();

    var psb = new PocketCode.PublishSubscribeBroker();

    //subscribe
    assert.throws(function () { psb.subscribe(1, handler1); }, Error, "ERROR: invalid subscription id");
    assert.throws(function () { psb.subscribe("id1", "handler1"); }, Error, "ERROR: invalid subscription handler");

    var handlerCalled = 0;
    var handler1 = function (e) {
        handlerCalled++;
        assert.equal(handlerCalled, 1, "subscribed handler called once: id1");
        done1();
    }
    psb.subscribe("id1", handler1);

    var handler2Called = 0;
    var handler2 = function (e) {
        handler2Called++;
        assert.equal(handler2Called, 1, "subscribed handler called once: id2");
        done2();
    }
    psb.subscribe("id2", handler2);

    assert.ok(psb._subscriptions["id1"].length == 1 && psb._subscriptions["id2"].length == 1, "handler registered correctly");

    //unsubscribe
    assert.throws(function () { psb.unsubscribe(1, handler1); }, Error, "ERROR: invalid unsubscribe id");
    assert.throws(function () { psb.unsubscribe("id1", "handler1"); }, Error, "ERROR: invalid unsubscribe handler");

    psb.unsubscribe("id1", handler2);   //try to remove wrong handler
    assert.ok(psb._subscriptions["id1"].length == 1 && psb._subscriptions["id2"].length == 1, "handler not removed- not found");

    psb.unsubscribe("id1", handler1);   //correct handler
    assert.ok(psb._subscriptions["id1"].length == 0 && psb._subscriptions["id2"].length == 1, "handler removed");

    psb.subscribe("id1", handler1); //subscribe again

    //publish
    assert.throws(function () { psb.publish(1); }, Error, "ERROR: invalid publish id");
    assert.throws(function () { psb.publish("id1", "handler1"); }, Error, "ERROR: invalid publish callback");

    psb.publish("id1");
    psb.publish("id2");
    psb.publish("id3"); //try to publish unknown id

    //publish including wait callback
    var psb2 = new PocketCode.PublishSubscribeBroker();

    var callbackExecuted = 0,
        latestCallbackArguments;
    var callback = function (e) {
        callbackExecuted++;
        latestCallbackArguments = e;

        assert.equal(callbackExecuted, 1, "callback called on unknown id");
        assert.equal(latestCallbackArguments, false, "callback returns false (loopDelay) on publishing unknown id");
        done3();
        dispose1stPsb();
    };
    psb2.publish("id2", callback); //try to publish unknown id

    var asyncHandler1 = function (dispatchedAt, onExecutedListener, threadId) {
        window.setTimeout(function () {
            onExecutedListener.handler.call(onExecutedListener.scope, {
                id: threadId,
                loopDelay: false
            });
        }, 20);
    };
    psb2.subscribe("id1", asyncHandler1);
    var asyncHandler2 = function (dispatchedAt, onExecutedListener, threadId) {
        window.setTimeout(function () {
            onExecutedListener.handler.call(onExecutedListener.scope, {
                id: threadId,
                loopDelay: true
            });
        }, 20);
    };
    psb2.subscribe("id1", asyncHandler2);

    var asyncCallback = function (loopDelay) {
        assert.ok(loopDelay, "loopDelay true because one of the called handler returns true");
        done5();    //end
    };
    psb2.publish("id1", asyncCallback); //calling twice: first one is stopped
    psb2.publish("id1", asyncCallback);


    //dispose
    function dispose1stPsb() {
        psb.dispose();
        assert.deepEqual(psb._subscriptions, {}, "disposed: subscriptions deleted");
        done4();
    }

});


QUnit.test("BroadcastManager", function (assert) {

    var done1 = assert.async();

    var bm = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);

    assert.ok(bm instanceof PocketCode.BroadcastManager, "instance check");
    assert.ok(typeof bm._subscriptions.s12 === "object" && bm._subscriptions.s12 instanceof Array, "init broadcast dictionary");

    //subscribe
    var asyncHandler1 = function (dispatchedAt, onExecutedListener, threadId) {
        window.setTimeout(function () {
            onExecutedListener.handler.call(onExecutedListener.scope, {
                id: threadId,
                loopDelay: false
            });
        }, 20);
    };
    bm.subscribe("s12", asyncHandler1);
    var asyncHandler2 = function (dispatchedAt, onExecutedListener, threadId) {
        window.setTimeout(function () {
            onExecutedListener.handler.call(onExecutedListener.scope, {
                id: threadId,
                loopDelay: true
            });
        }, 5);
    };
    bm.subscribe("s12", asyncHandler2);

    var asyncCallback = function (loopDelay) {
        assert.ok(loopDelay, "loopDelay true because one of the called handler returns true");
        done1();    //end
    };

    assert.throws(function () { bm.subscribe(12, new SmartJs.Event.EventListener(asyncHandler1, this)); }, Error, "ERROR: subscribe: invalid argument: broadcast id");

    //publish
    assert.throws(function () { bm.publish(13); }, Error, "ERROR: publish: id invalid");

    bm.publish("s12", asyncCallback); //calling twice: first one is stopped
    bm.publish("s12", asyncCallback);

});
