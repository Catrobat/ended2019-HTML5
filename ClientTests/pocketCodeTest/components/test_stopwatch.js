/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/stopwatch.js" />
'use strict';

QUnit.module("components/stopwatch.js");


QUnit.test("Stopwatch", function (assert) {

    var done = assert.async();

    var sw = new PocketCode.Stopwatch();
    assert.equal(sw._pausedTimespan, 0.0, "ctr parameters set");
    assert.ok(sw instanceof PocketCode.Stopwatch && sw instanceof SmartJs.Core.Component, "instance check");
    assert.ok(sw.objClassName === "Stopwatch", "objClassName check");

    sw.dispose();
    assert.ok(sw._disposed, "disposed: inherited");

    var sw = new PocketCode.Stopwatch();
    assert.equal(sw.value, 0, "initial: starts with 0");

    sw.start();
    window.setTimeout(started, 625);

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
        assert.ok(sw._pausedTimespan == 0.0 && sw._startDateTime == undefined && sw._lastPausedDateTime == undefined, "reinit on stop");
        sw.start();
        assert.ok(delay > sw.value && sw.value < 100.0, "reset after restart");
        done();
    };

});