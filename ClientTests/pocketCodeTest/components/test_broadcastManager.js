/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/broadcastManager.js" />
/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("broadcastManager.js");


QUnit.test("BroadcastManager", function (assert) {

    /**
     *
     * @type {PocketCode.BroadcastManager}
     */
    var b = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);

    assert.ok(typeof b._pendingBW === "object", "init pending operations");
    assert.ok(typeof b._subscriptions.s12 === "object", "init broadcast dictionary");

    assert.ok(b instanceof PocketCode.BroadcastManager, "instance check");

    var handler1Called = false, handler2Called = false, handler3Called = false;

    var handler1 = function (e) {
        handler1Called = true;
    };

    var handler2 = function (e) {
        handler2Called = true;
    };

    var handler3 = function (e) {
        handler3Called = true;
    };    
    //pending broadcast
    assert.deepEqual(b._pendingBW,{}, "empty pending broadcasts");
     
    //no subscribers
    assert.ok(b._subscriptions.s12.length == 0, "no subscribers yet");
       
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
    b.init([{ id: "s12", name: "test" }, { id: "s13", name: "test" }]);
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

    handler1Called = false;
    b.subscribe("s12", l2);
    var l3 = new SmartJs.Event.EventListener(handler3, this);
    b.subscribe("s13", l3);
    b.publish("s12");
    assert.ok(handler1Called && handler2Called && !handler3Called, "broadcast: multiple subscribers");

    handler1Called = false;
    handler2Called = false;

    //broadcast wait
    b.init([{ id: "s12", name: "test" }, { id: "s13", name: "test" }]);

    assert.throws(function () { b.publish("s12", new Function(), "asd"); }, Error, "ERROR: broadcast wait: publisher listener invalid");
    assert.throws(function () { b.publish("s12", l1); }, Error, "ERROR: broadcast wait: missing thread id");

    //b.publish("s12");
    //assert.ok(handler1Called, "single subscriber, simple broadcast");

    
    //broadcastWait calls broadcastWait

});

