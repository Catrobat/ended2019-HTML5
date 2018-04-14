/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/deviceFeature.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

QUnit.module("components/deviceFeature.js");


QUnit.test("DeviceFeature", function (assert) {

    var df = new PocketCode.DeviceFeature("key");
    assert.ok(df instanceof PocketCode.DeviceFeature && df instanceof SmartJs.Core.EventTarget, "instance check");
    assert.ok(df.onInit instanceof SmartJs.Event.Event, "onInit event accessor");

    assert.throws(function () { df = new PocketCode.DeviceFeature(); }, Error, "ERROR: invalid cntr argument");

    assert.equal(df.supported, false, "supported = false (default)");
    assert.equal(df.i18nKey, "key", "i18nKey getter");
    assert.notOk(df.inUse, "inUser = false: default");

    df = new PocketCode.DeviceFeature("key", true);
    assert.ok(df.supported, "supported getter");

    assert.ok(df.initialized, "initialized = true: default (because not in Use)");

    df.disable();
    assert.notOk(df.supported, "disable: supported set to false");

    assert.throws(function () { df.pause(); }, Error, "ERROR: pause(): override required");
    assert.throws(function () { df.resume(); }, Error, "ERROR: resume(): override required");
    assert.throws(function () { df.reset(); }, Error, "ERROR: reset(): override required");

    assert.throws(function () { df.viewState; }, Error, "ERROR: viewState setter: override required");
    assert.throws(function () { df.viewState = {}; }, Error, "ERROR: viewState getter: override required");
});


QUnit.test("DeviceFeature: DeviceVibration", function (assert) {

    var done = assert.async();

    var v = new PocketCode.DeviceVibration();
    assert.ok(v instanceof PocketCode.DeviceVibration && v instanceof PocketCode.DeviceFeature, "instance check");

    if (!v.supported) {
        var started = v.start(39);
        assert.notOk(started, "start(): not started because it's not supported");
        var vs = v.viewState;
        assert.equal(vs.remainingTime, undefined, "returns viewstate without remainingTime");
        v.viewState = vs;   //just to make sure a incomplete viewstate object does not throw an error
        vs.remainingTime = 2;
        v.viewState = vs;   //try to set viewState again
        //check if started
        vs = v.viewState;
        assert.equal(vs.remainingTime, undefined, "viewstate setter on unsupported feature (no remainingTime)");

        //assert.ok(false, "unit tests on device vibration aborted due to missing browser support: please run the tests in another browser or using mobile settings (developer toolbar)");
        //done();
        //return;
    }

    //mock supported
    v = new PocketCode.DeviceVibration();
    v._supported = true;

    assert.ok(v.supported, "DeviceVibration supported");

    //the only way to test the feature on desktop is to check for the remaining time
    function getRemainingTime() {
        return v.viewState.remainingTime;
    }

    var started = v.start();    //seconds
    assert.notOk(started, "unsuccessful start returns true: missing argument");
    started = v.start("2");    //seconds
    assert.notOk(started, "unsuccessful start returns true: invlaid argument");

    started = v.start(20);    //seconds
    assert.ok(started, "successful start returns true");

    var vs = v.viewState,
        remainingTime;
    window.setTimeout(validateStarted, 3);

    function validateStarted() {
        remainingTime = getRemainingTime();
        assert.ok(remainingTime > 0 && remainingTime < 20, "viewState getter");

        vs.remainingTime = 18;
        v.viewState = vs;

        window.setTimeout(validateViewStateSetter, 3);
    }

    function validateViewStateSetter() {
        remainingTime = getRemainingTime();
        assert.ok(remainingTime > 0 && remainingTime < 18, "viewState setter");

        v.start(0);
        assert.equal(getRemainingTime(), undefined, "start(0) calls reset() and sets remainingTime to undefined");

        v.start(3);
        assert.ok(getRemainingTime() > 0, "started again");
        v.pause();
        remainingTime = getRemainingTime();
        window.setTimeout(validatePause, 3);
    }

    function validatePause() {
        assert.equal(remainingTime, getRemainingTime(), "pause(): remaining time does not change during pause");
        v.resume();

        window.setTimeout(validateResume, 3);
    }

    function validateResume() {
        assert.ok(remainingTime > getRemainingTime(), "resume(): remaining time decreases after resume");

        v.reset();
        assert.equal(getRemainingTime(), undefined, "reset() sets remainingTime to undefined");

        v.dispose();
        assert.ok(v._disposed, "disposed");
        assert.equal(v._timer, undefined, "super() dispse called and object destroyed");

        done();
    }

});


QUnit.test("DeviceFeature: Camera", function (assert) {

    var df = new PocketCode.Camera();

    assert.ok(false, "TODO");
});


QUnit.test("DeviceFeature: Face Detection", function (assert) {

    var device = new PocketCode.MediaDevice();
    var df = new PocketCode.FaceDetection(device);

    assert.ok(false, "TODO");
});

