/// <reference path="../qunit/qunit-2.4.0.js" />
/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
'use strict';

QUnit.module("sj-components.js");

QUnit.test("SmartJs.Components.Application", function (assert) {

    var app = new SmartJs.Components.Application();
    assert.ok(app instanceof SmartJs.Components.Application && app instanceof SmartJs.Core.EventTarget, "instance + inheritance check");
    assert.ok(app.objClassName === "Application", "objClassName check");

    //TODO: assert.ok(app.onConnectionStatusChange instanceof SmartJs.Event.Event, "onConnectionStatusChange event");

    var lastEvent;
    var onConnectionStatusChangeHandler = function (e) {
        lastEvent = e;
    };
    //TODO: app.onConnectionStatusChange.addEventListener(new SmartJs.Event.EventListener(onConnectionStatusChangeHandler, this));
    //simulate events
    //app._offlineHandler();
    //assert.equal(app._online, false, "check offline");
    //assert.equal(lastEvent.online, false, "check event arguments");

    //app._onlineHandler();
    //assert.equal(app._online, true, "check online");
    //assert.equal(lastEvent.online, true, "check event argument: online");

    try {
        app.dispose();
    }
    catch (e) {
        assert.ok(false, "calling dispose");
        return;
    }
    assert.ok(true, "calling dispose");
    assert.equal(app._disposed, true, "disposed correctly");
});


QUnit.test("SmartJs.Components.Timer", function (assert) {

    //assert.expect(15);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var done5 = assert.async();
    var done6 = assert.async();
    var done7 = assert.async();
    var done8 = assert.async();
    //added tests after changing constructor and adding remainingTime
    var done9 = assert.async();
    var done10 = assert.async();
    //var done11 = assert.async();


    var testHandler1 = function (e) {
        assert.ok(true, "constructor + event dispatched");

        var timer = e.target;
        timer.dispose();
        assert.ok(timer._disposed, "disposing and recreate");
        done1();
    };
    var testHandler2 = function () {
        assert.ok(true, "oveerride instance while running");
        done2();
    };
    var testHandler3 = function () {
        assert.ok(true, "timeout = 0ms");
        done3();
    };

    var t = new SmartJs.Components.Timer(800, new SmartJs.Event.EventListener(testHandler1, this), true);
    assert.ok(t instanceof SmartJs.Components.Timer && t instanceof SmartJs.Core.Component, "instance check");
    assert.throws(function () { t = new SmartJs.Components.Timer(800.1, new SmartJs.Event.EventListener(testHandler1, this), true); }, Error, "ERROR: invalid argument: ctr");

    t = new SmartJs.Components.Timer(500, new SmartJs.Event.EventListener(testHandler2, this), true);

    var i = new SmartJs.Components.Timer(0, new SmartJs.Event.EventListener(testHandler3, this), true);

    //test: pause & resume
    var start = Date.now();
    var testFinished = false;
    var pauseCount = 0, resumeCount = 0;

    var testHandler4 = function () {
        testFinished = true;
        assert.equal(pauseCount, 4, "pause");
        done4();
        assert.equal(resumeCount, 4, "resume");
        done5();

        var time = 1400 + 4 * 300;
        assert.ok((Date.now() - start) >= (time - 100) && (Date.now() - start) <= (time + 100), "pause resume: total time (" + (Date.now() - start) + "ms) == 2600 ms +/- 100ms");
        done6();
        //console.log("pauseCount: " + pauseCount + ", resumeCount: " + resumeCount);
        //console.log("finished after: " + (Date.now() - start));
    };
    var p = new SmartJs.Components.Timer(1400, new SmartJs.Event.EventListener(testHandler4, this), true);

    var pauseHandler = function () {
        //console.log("pause after: " + (Date.now() - start));
        if (testFinished)
            return;
        p.pause();
        pauseCount++;
        var t = window.setTimeout(resumeHandler, 300);//*0.96);
    };
    var resumeHandler = function () {
        //console.log("resume after: " + (Date.now() - start));
        if (testFinished)
            return;
        p.resume();
        resumeCount++;
        var t = window.setTimeout(pauseHandler, 300);// * 0.96);
    };
    var t = window.setTimeout(pauseHandler, 300);// * 0.96);


    //argument callback argmument
    //assert.ok(true, "test");
    //done7();
    var testHandler6 = function (e) {
        assert.ok(e.threadId === 25, "callback with constructor argument");
        done7();
    };

    var p1 = new SmartJs.Components.Timer(20, new SmartJs.Event.EventListener(testHandler6, this), true, { threadId: 25 });

    //stop start
    var testHandler7 = function (e) {   //this funciton should never be called due to stop()
        assert.ok(false, "stop timer: handler called");
    };

    p1 = new SmartJs.Components.Timer(20, new SmartJs.Event.EventListener(testHandler7, this), true, { threadId: 25 });
    p1.stop();

    assert.ok(true, "stop timer: see handler called message if timer was stopped"); //^^ test will fail if handler is called
    done8();

    //after changing ctr & adding remainingTime
    var testHandler9 = function (e) {
        assert.equal(e.target, p9, "event attached and dispatched: event args target check");
        done9();
    };

    var p9 = new SmartJs.Components.Timer(20);
    p9.onExpire.addEventListener(new SmartJs.Event.EventListener(testHandler9, this));

    p9.start();
    var remainingRunning = p9.remainingTime;
    //console.log(remainingRunning);
    p9.pause();
    var remaining = p9.remainingTime;
    //console.log(remaining);
    assert.ok(remainingRunning >= remaining, "remaining at runtime");
    assert.ok(remaining >= 0 && remaining <= 20, "reamining timer on pause");
    p9.pause();
    assert.equal(remaining, p9.remainingTime, "timer change when pause() is calaled more than once");
    p9.resume();
    p9.resume();

    var p10 = new SmartJs.Components.Timer(30);
    var testHandler10 = function (e) {
        var diff = Date.now() - startTime;
        assert.ok(diff >= 40, diff + " >= 25, check pause time part of full time");
        done10();
    };
    p10.onExpire.removeEventListener(new SmartJs.Event.EventListener(testHandler9, this));
    p10.onExpire.addEventListener(new SmartJs.Event.EventListener(testHandler10, this));

    var restart = function () {
        assert.ok(remainingRunning <= 19, remainingRunning + " <= 12, test paused timer remaining time");
        window.setTimeout(function () { p10.resume(); }, 10);
    };

    var startTime = Date.now();
    p10.start();
    window.setTimeout(function () { remainingRunning = p10.remainingTime; p10.pause(); restart(); }, 15);

    //done11();

});


QUnit.test("SmartJs.Components.Stopwatch", function (assert) {

    var done = assert.async();

    var sw = new SmartJs.Components.Stopwatch();
    assert.ok(sw instanceof SmartJs.Components.Stopwatch && sw instanceof SmartJs.Core.Component, "instance check");
    assert.ok(sw.objClassName === "Stopwatch", "objClassName check");

    sw.dispose();
    assert.ok(sw._disposed, "disposed: inherited");

    var sw = new SmartJs.Components.Stopwatch();
    assert.equal(sw.value, 0, "initial: starts with 0");

    sw.start();
    window.setTimeout(initial, 25);

    function initial() {
        var timestamp = sw.startTimestamp;
        assert.ok(timestamp > 0 && timestamp < Date.now() - 22, "startTimestamp accessor");
        sw.resume();
        assert.equal(sw.startTimestamp, timestamp, "resume without effect if not paused");
        sw.reset();
        assert.ok(sw.startTimestamp > timestamp, "reset() on running stopwatch");

        window.setTimeout(started, 5);
    }

    var pauseTimespan;
    function started() {
        var delay = sw.value;
        assert.ok(delay > 0, "started");
        assert.ok(typeof delay == "number", "value is numeric");
        var string = delay + "";
        assert.ok(string.length <= 5, "number format (1/1000)");

        sw.pause();
        pauseTimespan = sw.value;
        window.setTimeout(paused, 25);
    };

    function paused() {
        var delay = sw.value;
        assert.equal(delay, pauseTimespan, "not changed during pause");
        sw.reset();
        assert.equal(sw.value, 0, "reset() during pause");
        sw.resume();
        window.setTimeout(resumed, 18);
    };

    function resumed() {
        var delay = sw.value;
        assert.ok(sw.value > pauseTimespan, "increased after pause");
        sw.pause();
        pauseTimespan = sw.value;
        window.setTimeout(paused2nd, 37);
    };

    function paused2nd() {
        var delay = sw.value;
        assert.equal(delay, pauseTimespan, "not changed during pause (2nd)");
        sw.stop();
        assert.ok(sw._startDateTime == undefined && sw._lastPausedDateTime == undefined, "reinit on stop");
        sw.start();
        assert.ok(delay > sw.value && sw.value < 100.0, "reset after restart");
        sw.reset();
        assert.equal(sw.value, 0, "reset: starts with 0");
        assert.ok(sw.startTimestamp != undefined && sw._pausedDateTime === undefined, "reset(): when running");

        done();
    };
});


QUnit.test("SmartJs.Components.StorageAdapter", function (assert) {

    var adapter = new SmartJs.Components.StorageAdapter();

    assert.ok(adapter.onChange instanceof SmartJs.Event.Event, "event check");
    assert.equal(adapter.supported, false, "getter: supported");

    assert.throws(function () { adapter.getValue(1); }, Error, "ERROR: invalid key on getValue");
    assert.throws(function () { adapter.getValue("key"); }, Error, "ERROR: unsupported");

    adapter._supported = true;    //override supported for tests
    assert.equal(adapter.getValue("key"), undefined, "getValue");
    assert.throws(function () { adapter.setValue("key", 1); }, Error, "ERROR: setValue (not successful");

    var handlerCalled = 0,
        handler = function (e) {
            handlerCalled++;
        };
    adapter.onChange.addEventListener(new SmartJs.Event.EventListener(handler, this));
    adapter.deleteKey("key");
    assert.equal(handlerCalled, 1, "onChange handler called on delete");

    adapter.clear();
    adapter._supported = false; //setting default
    assert.throws(function () { adapter.clear(); }, Error, "ERROR: unsupported (on clear)");
});


QUnit.test("SmartJs.Components.CookieAdapter", function (assert) {

    var adapter = new SmartJs.Components.CookieAdapter(25);
    assert.throws(function () { var a = new SmartJs.Components.CookieAdapter("25"); }, Error, "ERROR: invalid cntr argument");

    var delay = Math.abs(Date.parse(adapter._expires) - (new Date().getTime() + 1000 * 60 * 60 * 24 * 25));
    assert.ok(delay < 1000, "set individual expiration date");
    adapter.clear();    //clear cookie before running the tests

    assert.ok(adapter.onChange instanceof SmartJs.Event.Event, "event check");
    assert.equal(adapter.supported, true, "getter: supported");

    assert.throws(function () { adapter.getValue(1); }, Error, "ERROR: invalid key on getValue");
    assert.equal(adapter.getValue("key"), undefined, "key not found: undefined");

    var handlerCalled = 0,
        handlerEventArgs = undefined,
        handler = function (e) {
            handlerCalled++;
            handlerEventArgs = e;
        };
    adapter.onChange.addEventListener(new SmartJs.Event.EventListener(handler, this));

    //set/get
    adapter.setValue("keyNumber", 12);
    assert.equal(handlerCalled, 1, "handler called on set value");
    assert.equal(handlerEventArgs.key, "keyNumber", "handler event args: key");
    assert.equal(handlerEventArgs.oldValue, undefined, "handler event args: oldValue");
    assert.equal(handlerEventArgs.newValue, 12, "handler event args: newValue");
    assert.equal(adapter.getValue("keyNumber"), 12, "setValue/getValue: type number");

    adapter.setValue("keyString", "string");
    assert.equal(handlerCalled, 2, "handler called on set value");
    assert.equal(handlerEventArgs.newValue, "string", "handler event args: newValue (string)");
    assert.equal(adapter.getValue("keyString"), "string", "setValue/getValue: type string");

    adapter.setValue("keyBoolean", true);
    assert.equal(handlerCalled, 3, "handler called on set value");
    assert.equal(handlerEventArgs.newValue, true, "handler event args: newValue (boolean)");
    assert.equal(adapter.getValue("keyBoolean"), true, "setValue/getValue: type boolean");

    adapter.setValue("keyObject", { number: 12, string: "string", object: { nested: false } });
    assert.equal(handlerCalled, 4, "handler called on set value");
    assert.deepEqual(handlerEventArgs.newValue, { number: 12, string: "string", object: { nested: false } }, "handler event args: newValue (object)");
    assert.deepEqual(adapter.getValue("keyObject"), { number: 12, string: "string", object: { nested: false } }, "setValue/getValue: type object");

    //change
    adapter.setValue("keyObject", false);
    assert.equal(handlerCalled, 5, "handler called on set value");
    assert.deepEqual(handlerEventArgs.oldValue, { number: 12, string: "string", object: { nested: false } }, "handler event args: oldValue (change)");
    assert.equal(handlerEventArgs.newValue, false, "handler event args: oldValue (change)");
    assert.equal(adapter.getValue("keyObject"), false, "setValue/getValue: change");

    //delete
    handlerCalled = 0;
    adapter.deleteKey("key");
    assert.equal(handlerCalled, 1, "onChange handler called on delete");

    adapter.clear();
    assert.equal(handlerCalled, 5, "onChange handler called on clear");
});


QUnit.test("SmartJs.Components.LocalStorageAdapter", function (assert) {

    var adapter = new SmartJs.Components.LocalStorageAdapter();
    adapter.clear();    //clear cookie before running the tests

    assert.ok(adapter.onChange instanceof SmartJs.Event.Event, "event check");
    assert.equal(adapter.supported, true, "getter: supported");

    assert.throws(function () { adapter.getValue(1); }, Error, "ERROR: invalid key on getValue");
    assert.equal(adapter.getValue("key"), undefined, "key not found: undefined");

    var handlerCalled = 0,
        handlerEventArgs = undefined,
        handler = function (e) {
            handlerCalled++;
            handlerEventArgs = e;
        };
    adapter.onChange.addEventListener(new SmartJs.Event.EventListener(handler, this));

    //set/get
    adapter.setValue("keyNumber", 12);
    assert.equal(handlerCalled, 1, "handler called on set value");
    assert.equal(handlerEventArgs.key, "keyNumber", "handler event args: key");
    assert.equal(handlerEventArgs.oldValue, undefined, "handler event args: oldValue");
    assert.equal(handlerEventArgs.newValue, 12, "handler event args: newValue");
    assert.equal(adapter.getValue("keyNumber"), 12, "setValue/getValue: type number");

    adapter.setValue("keyString", "string");
    assert.equal(handlerCalled, 2, "handler called on set value");
    assert.equal(handlerEventArgs.newValue, "string", "handler event args: newValue (string)");
    assert.equal(adapter.getValue("keyString"), "string", "setValue/getValue: type string");

    adapter.setValue("keyBoolean", true);
    assert.equal(handlerCalled, 3, "handler called on set value");
    assert.equal(handlerEventArgs.newValue, true, "handler event args: newValue (boolean)");
    assert.equal(adapter.getValue("keyBoolean"), true, "setValue/getValue: type boolean");

    adapter.setValue("keyObject", { number: 12, string: "string", object: { nested: false } });
    assert.equal(handlerCalled, 4, "handler called on set value");
    assert.deepEqual(handlerEventArgs.newValue, { number: 12, string: "string", object: { nested: false } }, "handler event args: newValue (object)");
    assert.deepEqual(adapter.getValue("keyObject"), { number: 12, string: "string", object: { nested: false } }, "setValue/getValue: type object");

    //change
    adapter.setValue("keyObject", false);
    assert.equal(handlerCalled, 5, "handler called on set value");
    assert.deepEqual(handlerEventArgs.oldValue, { number: 12, string: "string", object: { nested: false } }, "handler event args: oldValue (change)");
    assert.equal(handlerEventArgs.newValue, false, "handler event args: oldValue (change)");
    assert.equal(adapter.getValue("keyObject"), false, "setValue/getValue: change");

    //delete
    handlerCalled = 0;
    adapter.deleteKey("key");
    assert.equal(handlerCalled, 1, "onChange handler called on delete");

    adapter.clear();
    assert.equal(handlerCalled, 5, "onChange handler called on clear");

});


