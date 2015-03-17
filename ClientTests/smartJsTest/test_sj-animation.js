/// <reference path="../qunit/qunit-1.16.0.js" />
/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
/// <reference path="../../Client/smartJs/sj-animation.js" />
'use strict';

QUnit.module("sj-animation.js");

QUnit.test("SmartJs.Animation.Animation", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var a = new SmartJs.Animation.Animation(10, 20, 320, SmartJs.Animation.Type.LINEAR);
    assert.ok(a instanceof SmartJs.Animation.Animation, "instance check");

    assert.throws(function () { var b = new SmartJs.Animation.Animation(10, "20", 1000, SmartJs.Animation.Type.LINEAR); }, Error, "ERROR: simple argument check");
    assert.throws(function () { var b = new SmartJs.Animation.Animation(10, 20, 1000, function (progress) { return 2 * progress; }); }, Error, "ERROR: render function argument check");

    var events = [];
    var startTime;
    var updateEventHandler = function (e) {
        events.push({ delay: (new Date() - startTime), value: e.value });
    };
    var executedEventHandler = function (e) {
        assert.ok(events.length > 0, "update event handler dispatched correctly");
        assert.ok(true, "executed event handler dispatched correctly");
        assert.equal(e.callId, "validArgs", "callback arguments passed correctly");

        assert.ok(events.length <= 10, events.length + ": max one update per step");
        var error = false;
        //console.log("Animation:");
        for (var i = 1, l = events.length; i < l; i++) {
            //console.log(events[i - 1].delay + ': ' + events[i - 1].value);
            if (events[i - 1].value < events[i].value)
                continue;

            error = true;
            break;
        }
        //console.log(events[events.length - 1].delay + ': ' + events[events.length - 1].value);
        assert.ok(!error, "continuous event & value update");
        done1();
    }
    a.onUpdate.addEventListener(new SmartJs.Event.EventListener(updateEventHandler, this));
    a.onExecuted.addEventListener(new SmartJs.Event.EventListener(executedEventHandler, this));

    startTime = new Date();
    a.start({ callId: "validArgs" });

    var b = new SmartJs.Animation.Animation(10, 20, 320, SmartJs.Animation.Type.LINEAR);
    var count = 0;
    var executedEventHandler2 = function (e) {
        count++;
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(executedEventHandler2, this));
    b.start();
    assert.ok(true, "start without argument");

    b.stop();
    window.setTimeout(function () {
        assert.equal(count, 0, "animation stopped");
        done2();
    }, 400);

});

QUnit.test("SmartJs.Animation.Animation2D", function (assert) {

    var done1 = assert.async();

    var a = new SmartJs.Animation.Animation2D({ x: 10, y: 10 }, { x: 20, y: 20 }, 500, SmartJs.Animation.Type.LINEAR2D);
    assert.ok(a instanceof SmartJs.Animation.Animation && a instanceof SmartJs.Animation.Animation2D, "instance check");

    assert.throws(function () { var b = new SmartJs.Animation.Animation2D({ x: 10, y: 20 }, 20, 1000, SmartJs.Animation.Type.LINEAR2D); }, Error, "ERROR: simple argument check");
    assert.throws(function () { var b = new SmartJs.Animation.Animation2D({ x: 10, y: 20 }, { x: 20, y: 20 }, 1000, function (progress) { return { x: 2 * progress, y: progress }; }); }, Error, "ERROR: render function argument check");

    var events = [];
    var startTime;
    var updateEventHandler = function (e) {
        events.push({ delay: (new Date() - startTime), value: e.value });
    };
    var executedEventHandler = function (e) {
        var stopTime = new Date();

        assert.ok(events.length > 0, "update event handler dispatched correctly");
        assert.ok(true, "executed event handler dispatched correctly");
        assert.equal(e.callId, "validArgs", "callback arguments passed correctly");
        assert.ok(events.length <= 20, events.length + ": max one update per step"); 
        //ok: events.length >= 10 && events.length <= 20.. x & y value can change on different times (in theory: for other animation type)

        var errorX = false;
        var errorY = false;
        //no check on events.length == 0 because this only happens on error
        //console.log("Animation2D:");
        for (var i = 1, l = events.length; i < l; i++) {
            //console.log(events[i - 1].delay + ': ' + events[i - 1].value.x + ", " + events[i - 1].value.y);
            if (events[i - 1].value.x >= events[i].value.x) {
                errorX = true;
            }
            if (events[i - 1].value.y >= events[i].value.y) {
                errorY = true;
            }
        }
        //console.log(events[events.length - 1].delay + ': ' + events[events.length - 1].value.x + ", " + events[events.length - 1].value.y);
        assert.ok(!errorX, "continuous event & x value update");
        assert.ok(!errorX, "continuous event & y value update");

        assert.ok(stopTime - startTime > 600, "pause/resume checked");
        done1();
    }
    a.onUpdate.addEventListener(new SmartJs.Event.EventListener(updateEventHandler, this));
    a.onExecuted.addEventListener(new SmartJs.Event.EventListener(executedEventHandler, this));

    assert.throws(function () { a.start("errorArgs"); }, Error, "ERROR: validation callback args");
    startTime = new Date();
    a.start({ callId: "validArgs" });

    window.setTimeout(function () { a.pause(); }, 120);
    window.setTimeout(function () { a.resume(); }, 220);

});

