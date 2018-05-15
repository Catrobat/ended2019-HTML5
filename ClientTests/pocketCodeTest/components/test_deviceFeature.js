/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/deviceFeature.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

QUnit.module("components/deviceFeature.js");


QUnit.test("DeviceFeature", function (assert) {

    var df = new PocketCode.DeviceFeature("key");
    assert.ok(df instanceof PocketCode.DeviceFeature && df instanceof SmartJs.Core.EventTarget, "instance check");
    assert.ok(df.onInit instanceof SmartJs.Event.Event && df.onInactive instanceof SmartJs.Event.Event, "event accessors");

    assert.throws(function () { df = new PocketCode.DeviceFeature(); }, Error, "ERROR: invalid cntr argument");

    assert.equal(df.supported, false, "supported = false (default)");
    assert.equal(df.i18nKey, "key", "i18nKey getter");
    assert.equal(df.inUse, false, "inUser = false: default");
    assert.equal(df.isActive, false, "isActive = false: default");

    df = new PocketCode.DeviceFeature("key", true);
    assert.ok(df.supported, "supported getter");

    assert.ok(df.initialized, "initialized = true: default (because not in Use)");

    df.disable();
    assert.equal(df.supported, false, "disable: supported set to false");

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
        assert.equal(v._timer, undefined, "super() dispose called and object destroyed");

        done();
    }

});


QUnit.test("DeviceFeature: Camera", function (assert) {
    var done = assert.async();
    var executionTimer = setTimeout(allTestsNotExecuted, 15000);
    var stage = "";

    var df = new PocketCode.Camera();
    assert.ok(df.onInit instanceof SmartJs.Event.Event, "onInit should be instance of Event");
    assert.ok(df.onChange instanceof SmartJs.Event.Event, "onChange should be instance of Event");
    assert.ok(typeof df.supported === "boolean", " supported should be boolean");
    assert.equal(df.selected, PocketCode.CameraType.FRONT, "front camera should be used by default" );
    df.onChange.addEventListener(new SmartJs.Event.EventListener(onCameraStarted, this));
    df.start();
    function onCameraStarted(e) {
        stage = "onCameraStarted";
        df.onChange.removeEventListener(new SmartJs.Event.EventListener(onCameraStarted, this));
        var result = df.start();
        assert.equal(result, false, "should do nothing on start() if the camera is already started");
        assert.ok(true, "camera onChange has been triggered");
        assert.ok(e.src instanceof HTMLVideoElement, "event src should be HTMLVideoElement");
        assert.ok(e.src.srcObject instanceof MediaStream, "video src should be MediaStream");
        assert.ok(e.on , true, "camera should be on");
        assert.ok(df.initialized, "camera should be initialized");
        assert.equal(df.inUse, true, "camera is in use");
        assert.ok( e.src.videoHeight >0 , "video element should have height");
        assert.ok(e.src.videoWidth >0, "video element should have width");
        assert.equal(e.src.paused, false, "video should not be paused");
        df.pause();
        assert.equal(df.video.paused, true, " video should be paused after pause()");
        assert.equal(df.on, false, " camera should not be on after pause()");
        df.resume();
        assert.equal(df.video.paused, false, "video should be resumed after resume()");
        assert.equal(df.on, true, "camera should be on after resume");
        var result =df.setType(PocketCode.CameraType.FRONT);
        assert.equal(result, false, "should not reinitialize if the same camera type is selected");
        df.onChange.addEventListener(new SmartJs.Event.EventListener(onCameraTypeChanged, this));
        var result = df.setType(PocketCode.CameraType.BACK);
        assert.ok(result, "camera type should be changed");

    }


    function onCameraTypeChanged(e){
        stage = "onCameraTypeChanged";
        df.onChange.removeEventListener(new SmartJs.Event.EventListener(onCameraTypeChanged, this));
        assert.ok(e.on, "camera should still be on after type change");
        assert.ok(e.src instanceof HTMLVideoElement, "camera source should still be video element after type change");
        assert.ok(e.src.srcObject instanceof MediaStream, "video element should still use MediaStream after type change");
        assert.equal(e.src.paused, false, "video should not be paused after type change");
        assert.equal(df.selected, PocketCode.CameraType.BACK , "back camera should be selected");
        df.onChange.addEventListener(new SmartJs.Event.EventListener(onCameraStopped, this));
        df.stop();

    }

    function onCameraStopped(e){
        stage = "onCameraStopped";
        df.onChange.removeEventListener(new SmartJs.Event.EventListener(onCameraStopped, this));
        assert.equal(e.on , false, "camera should not be on after stop()");
        assert.equal(e.src.srcObject,null, " video srcObject should be null after stop()");
        assert.equal(e.src.paused, true, "video should be paused on stop()");
        df.onChange.addEventListener(new SmartJs.Event.EventListener(onCameraStartedAgain, this));
        df.start();

    }


    function onCameraStartedAgain(e){
        stage = "onCameraStartedAgain";
        df.onChange.removeEventListener(new SmartJs.Event.EventListener(onCameraStartedAgain, this));
        assert.equal(e.on,true, "camera should be on again if start() called after stop");
        assert.ok(e.src instanceof HTMLVideoElement, "video element should be valid if start() called after stop()");
        assert.ok(e.src.srcObject instanceof MediaStream, "video src should be MediaStream if start() called after stop()");
        df.onChange.addEventListener(new SmartJs.Event.EventListener(onCameraReset, this));
        df.reset();
    }



    function onCameraReset(e){
        stage = "onCameraReset";
        df.onChange.removeEventListener(new SmartJs.Event.EventListener(onCameraReset, this));
        assert.equal(e.on, true, "camera should be enabled after reset");
        assert.ok(e.src.srcObject instanceof  MediaStream, "video should use MediaStream after reset");
        df.onChange.addEventListener(new SmartJs.Event.EventListener(onCameraSupportDisabled, this));
        df.supported = false;
    }


    function onCameraSupportDisabled(e){
        stage = "onCameraSupportDisabled";
        df.onChange.removeEventListener(new SmartJs.Event.EventListener(onCameraSupportDisabled, this));
        stage = "onCameraSupportedDisabled";
        assert.ok(true, "onChange should be triggered if camera support is disabled");
        assert.equal(df.supported, false, "camera should not be supported after support disabled");
        assert.equal(df.on , false, "camera should be disabled if support is disabled");
        df.onChange.addEventListener(new SmartJs.Event.EventListener(onCameraError, this));
        df.supported = true;
        df.setIdealResolution(800, 600, false);
        assert.equal(df.constraints.video.height.ideal, 600, "should set correct ideal height");
        assert.equal(df.constraints.video.width.ideal, 800 , "should set correct ideal width");
        df.setMinimumResolution(10000, 10000, true); // intentional overconstrain to force error
    }

    function onCameraError(e){
        stage = "onCameraError";
        df.onInit.removeEventListener(new SmartJs.Event.EventListener(onCameraError, this));
        assert.equal(e.on, false, "camera should not be on if there was an error");
        assert.equal(df.supported, false, "camera should not be supported if there was an error");
        assert.ok(e.error.name === "ConstraintNotSatisfiedError" || e.error.name === "OverconstrainedError", " correct error dispatched on change" );
        df.dispose();
        assert.equal(df.on, false, "camera should not be on after dispose()");
        assert.notOk(df.video.srcObject instanceof MediaStream , "camera should not use mediaStream after dispose()");
        clearTimeout(executionTimer);
        done();
    }




    function allTestsNotExecuted(){
        assert.ok(false, "test execution stopped at "+ stage+ ". not all tests are completed , possibly because some events are not triggered");
        clearTimeout(executionTimer);
        done();
    }
});


QUnit.test("DeviceFeature: Face Detection", function (assert) {

    var device = new PocketCode.MediaDevice();
    var df = new PocketCode.FaceDetection(device);

    assert.ok(false, "TODO");
});

