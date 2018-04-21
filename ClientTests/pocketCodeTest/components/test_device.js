/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

QUnit.module("components/device.js");


QUnit.test("Device", function (assert) {

    var dev = new PocketCode.Device();
    assert.ok(dev instanceof PocketCode.Device, "instance check");
    assert.ok(dev.onSpaceKeyDown instanceof SmartJs.Event.Event, "onSpaceKeyDown event check");

    assert.ok(dev.onInit instanceof SmartJs.Event.Event &&
        dev.onInactive instanceof SmartJs.Event.Event &&
        dev.onSpaceKeyDown instanceof SmartJs.Event.Event, "event check");

    assert.equal(dev.initialized, true, "initialized getter");   //geo location not in use
    assert.equal(dev.hasActiveFeatures, false, "hasActiveFeatures getter");   //no feature running
    assert.equal(dev.isMobile, SmartJs.Device.isMobile, "isMobile: accessor");
    assert.equal(dev.isTouch, SmartJs.Device.isTouch, "isMobile: accessor");

    assert.ok(typeof dev.mobileLockRequired == 'boolean', "mobileLockRequired: accessor"); //poor tests as we cannot set isMobile here

    assert.equal(dev.unsupportedFeatureDetected, false, "unsupported feature detected: initial = false");
    assert.equal(dev.unsupportedFeatures.length, 0, "unsupported features: initial = []");

    var vs = dev.viewState;
    assert.ok(vs.VIBRATE != undefined && vs.INCLINATION == undefined, "viewState getter including only elements that have a viewState");
    vs.VIBRATE.remainingTime = 1;   //replace time to validate setter
    assert.ok(dev.viewState.VIBRATE.remainingTime != 1, "viewState not influenced by changing the vs object");
    dev.viewState = vs; //no assert possible for setter as the device does not support vibration

    assert.ok(!isNaN(dev.accelerationX), "accelerationX getter");
    assert.ok(!isNaN(dev.accelerationY), "accelerationY getter");
    assert.ok(!isNaN(dev.accelerationZ), "accelerationZ getter");
    assert.ok(!isNaN(dev.compassDirection), "compassDirection getter");
    assert.ok(!isNaN(dev.inclinationX), "inclinationX getter");
    assert.ok(!isNaN(dev.inclinationY), "inclinationY getter");

    dev._features.FLASH.inUse = false;
    assert.equal(dev.flashOn, false, "flashOn getter");
    assert.ok(dev._features.FLASH.inUse, "flashOn: flash inUser: after getter");
    dev._features.FLASH.inUse = false;
    dev.flashOn = true;
    assert.ok(dev._features.FLASH.inUse, "flashOn: flash inUser: after setter");
    assert.equal(dev.flashOn, true, "flashOn getter/setter");
    assert.throws(function () { dev.flashOn = ""; }, Error, "ERROR: invlalid setter: flash on");

    //lego nxt
    assert.ok(!isNaN(dev.nxt1), "nxt1 getter");
    assert.ok(!isNaN(dev.nxt2), "nxt2 getter");
    assert.ok(!isNaN(dev.nxt3), "nxt3 getter");
    assert.ok(!isNaN(dev.nxt4), "nxt4 getter");

    //phiro
    assert.ok(!isNaN(dev.phiroFrontLeft), "phiroFrontLeft getter");
    assert.ok(!isNaN(dev.phiroFrontRight), "phiroFrontRight getter");
    assert.ok(!isNaN(dev.phiroSideLeft), "phiroSideLeft getter");
    assert.ok(!isNaN(dev.phiroSideRight), "phiroSideRight getter");
    assert.ok(!isNaN(dev.phiroBottomLeft), "phiroBottomLeft getter");
    assert.ok(!isNaN(dev.phiroBottomRight), "phiroBottomRight getter");

    // geo location
    assert.ok(!isNaN(dev.geoLatitude), "geoLatitude getter");
    assert.ok(!isNaN(dev.geoLongitude), "geoLongitude getter");
    assert.ok(!isNaN(dev.geoAltitude), "geoAltitude getter");
    assert.ok(!isNaN(dev.geoAccuracy), "geoAccuracy getter");

    //arduino
    assert.ok(!isNaN(dev.getArduinoAnalogPin()), "Arduino analog getter");
    assert.ok(!isNaN(dev.getArduinoDigitalPin()), "Arduino digital getter");

    assert.equal(dev.vibrate(''), false, "vibrate call without valid parameter");
    dev._features.VIBRATE._supported = false; //disabled internal
    assert.notOk(dev.vibrate("10"), "vibrate: invalid argument");
    assert.equal(dev.vibrate(10), false, "vibrate call with parameter");

    assert.equal(dev.emulationInUse, false, "emulationInUse getter: should always return false");

    assert.equal(dev.unsupportedFeatureDetected, true, "unsupported feature detected");
    assert.equal(dev.unsupportedFeatures.length, 9, "unsupported features: all");

    //dispose
    dev.dispose();
    assert.equal(dev._disposed, true, "dispose");

    dev = new PocketCode.Device();  //recreate to check if there are any side effects

});


QUnit.test("Device: Touch", function (assert) {

    var dev = new PocketCode.Device();

    assert.equal(dev.lastTouchIndex, 0, "initial: no touch");
    dev.updateTouchEvent(PocketCode.UserActionType.TOUCH_START, "m1", 0, 0);
    assert.equal(dev.lastTouchIndex, 1, "touch added on touch start");
    dev.updateTouchEvent(PocketCode.UserActionType.TOUCH_MOVE, "m1", 1, 1);
    dev.updateTouchEvent(PocketCode.UserActionType.TOUCH_END, "m1", 2, 2);
    assert.equal(dev.lastTouchIndex, 1, "no touch added on move/end");

    dev.reset();
    assert.equal(dev.lastTouchIndex, 0, "initial: no touch (after clear/restart)");

    dev.updateTouchEvent(PocketCode.UserActionType.TOUCH_START, "m1", 0, 1);
    dev.updateTouchEvent(PocketCode.UserActionType.TOUCH_MOVE, "m1", 2, 3);

    assert.ok(dev.isTouched(1), "active touch");
    dev.updateTouchEvent(PocketCode.UserActionType.TOUCH_END, "m1", 4, 5);
    assert.notOk(dev.isTouched(1), "active touch = false");

    assert.equal(dev.getTouchX(1), 2, "x position, last edit (touch end positions ignored)");
    assert.equal(dev.getTouchY(1), 3, "y position, last edit (touch end positions ignored)");

    //out of range
    assert.notOk(dev.isTouched(2), "isTouched: out of range (idx >= length)");

    assert.equal(dev.getTouchX(2), 0.0, "x position: out of range (idx >= length)");
    assert.equal(dev.getTouchY(2), 0.0, "y position: out of range (idx >= length)");

    assert.notOk(dev.isTouched(0), "isTouched: out of range (idx <= 0)");

    assert.equal(dev.getTouchX(0), 0.0, "x position: out of range (idx <= 0)");
    assert.equal(dev.getTouchY(0), 0.0, "y position: out of range (idx <= 0)");

    //getLatestActiveTouchPosition
    assert.deepEqual(dev.getLatestActiveTouchPosition(), {}, "touch position: return empty object if not touch is active");
    dev._touchEvents.active["test"] = {}; //to make sure the quick check does not return an empty object
    dev._touchEvents.history = [{ active: true, x: 1, y: 2 }, { active: true, x: 3, y: 4 }];
    var pos = dev.getLatestActiveTouchPosition();
    assert.ok(pos.x == 3 && pos.y == 4, "latest active touch position");

    //geoLocation
    var dev = new PocketCode.Device();

    //setting internal values
    dev._geoLocationData.latitude = 1;
    dev._geoLocationData.longitude = 2;
    dev._geoLocationData.altitude = 3;
    dev._geoLocationData.accuracy = 4;

    assert.equal(dev.geoLatitude, 1, "latitude getter");
    assert.equal(dev.geoLongitude, 2, "longitude getter");
    assert.equal(dev.geoAltitude, 3, "altitude getter");
    assert.equal(dev.geoAccuracy, 4, "accuracy getter");

});

QUnit.test("Device: GeoLocation", function (assert) {
    // geo location navigator load handler check
    var dev = new PocketCode.Device();
    var geoPosition = {
        coords: {
            latitude: 1,
            longitude: 2,
            altitude: 3,
            accuracy: 4
        }
    };
    assert.ok(!dev._geoLocationData.initialized, "initialized before load check");
    assert.ok(!dev._features.GEO_LOCATION.supported, "supported before load check");
    dev._geoNavigatorLoadHandler(geoPosition);
    assert.equal(dev.geoLatitude, 1, "latitude getter");
    assert.equal(dev.geoLongitude, 2, "longitude getter");
    assert.equal(dev.geoAltitude, 3, "altitude getter");
    assert.equal(dev.geoAccuracy, 4, "accuracy getter");
    assert.ok(dev._features.GEO_LOCATION.supported, "supported after load check");
    assert.ok(dev._geoLocationData.initialized, "initialized after load check");

    // geo location navigator error handler check
    dev = new PocketCode.Device();
    assert.ok(!dev._geoLocationData.initialized, "initialized before check");
    assert.ok(!dev._features.GEO_LOCATION.supported, "supported before load check");
    dev._geoNavigatorErrorHandler();
    assert.ok(!dev._features.GEO_LOCATION.supported, "supported after load check");
    assert.ok(dev._geoLocationData.initialized, "initialized after check");

    // geo location service load handler check
    dev = new PocketCode.Device();
    var serviceRequestPosition = {
        responseJson: {
            latitude: 1,
            longitude: 2,
            altitude: 3,
            accuracy: 4
        }
    };
    assert.ok(!dev._geoLocationData.initialized, "initialized before load check");
    assert.ok(!dev._features.GEO_LOCATION.supported, "supported before load check");
    dev._geoServiceLoadHandler(serviceRequestPosition);
    assert.equal(dev.geoLatitude, 1, "latitude getter");
    assert.equal(dev.geoLongitude, 2, "longitude getter");
    assert.equal(dev.geoAltitude, 3, "altitude getter");
    assert.equal(dev.geoAccuracy, 4, "accuracy getter");
    assert.ok(dev._features.GEO_LOCATION.supported, "supported after load check");

    // geo location service error handler check
    dev = new PocketCode.Device();
    assert.ok(!dev._geoLocationData.initialized, "initialized before check");
    assert.ok(!dev._features.GEO_LOCATION.supported, "supported before load check");
    dev._geoServiceErrorHandler();
    assert.ok(!dev._features.GEO_LOCATION.supported, "supported after load check");

    // geo location service and navigator check
    dev = new PocketCode.Device();
    assert.ok(!dev._geoLocationData.initialized, "initialized before load check");
    assert.ok(!dev._features.GEO_LOCATION.supported, "supported before load check");
    dev._getGeoLocationData();
    assert.ok(dev._features.GEO_LOCATION.inUse, "inUse check");
});


QUnit.test("MediaDevice", function (assert) {

    var dev = new PocketCode.MediaDevice();

    // instance checks
    assert.ok(dev instanceof PocketCode.Device && dev instanceof PocketCode.MediaDevice, "instance check");
    assert.ok(dev._features.CAMERA instanceof PocketCode.Camera, "camera instance check");
    assert.ok(dev._features.FACE_DETECTION instanceof PocketCode.FaceDetection, "face detection instance check");

    // default value check
    assert.ok(!dev._camStatus.on, "cam status check");

    // event check
    assert.ok(dev.onCameraChange instanceof SmartJs.Event.Event, "onCameraChange event check");

    assert.ok(false, "TODO");
});


QUnit.test("MediaDevice: Camera", function (assert) {

    var dev = new PocketCode.MediaDevice();

    //dev._features.CAMERA.inUse = false;
    //assert.equal(dev.selectedCamera, PocketCode.CameraType.BACK, "selected camera: default selected");
    //assert.ok(dev._features.CAMERA.inUse, "camera inUser: after getter");
    //dev._features.CAMERA.inUse = false;
    //assert.throws(function () { dev.selectedCamera = "OTHER"; }, Error, "ERROR: camera setter: invalid value");
    //assert.notOk(dev._features.CAMERA.inUse, "camera inUser: after invalid setter");
    //dev._features.CAMERA.inUse = false;
    //dev.selectedCamera = PocketCode.CameraType.FRONT;
    //assert.ok(dev._features.CAMERA.inUse, "camera inUser: after setter");
    //assert.equal(dev.selectedCamera, PocketCode.CameraType.FRONT, "selected camera: getter/setter");

    //assert.equal(dev.cameraOn, false, "cameraOn: default");
    //dev._features.CAMERA.inUse = false;
    //assert.throws(function () { dev.cameraOn = "OTHER"; }, Error, "ERROR: cameraOn setter: invalid value");
    //assert.notOk(dev._features.CAMERA.inUse, "cameraOn: camera inUser: after invalid setter");
    //dev._features.CAMERA.inUse = false;
    //dev.cameraOn = true;
    //assert.ok(dev._features.CAMERA.inUse, "camera inUser: after setter");
    //assert.ok(dev.cameraOn, "selected camera: getter/setter");

    assert.ok(false, "TODO: geolocation + onInit");
});


QUnit.test("MediaDevice: Face Detection", function (assert) {

    var dev = new PocketCode.MediaDevice();

    dev._features.CAMERA.inUse = false;
    assert.ok(typeof dev.faceDetected === 'boolean', "faceDetected getter");
    //assert.ok(dev._features.CAMERA.inUse, "camera inUser: after getter");
    assert.ok(!isNaN(dev.faceSize), "faceSize getter");
    assert.ok(!isNaN(dev.facePositionX), "facePositionX getter");
    assert.ok(!isNaN(dev.facePositionY), "facePositionY getter");

    assert.ok(false, "TODO");
});


QUnit.test("DeviceEmulator", function (assert) {

    var dev = new PocketCode.DeviceEmulator();

    assert.ok(dev instanceof PocketCode.MediaDevice && dev instanceof PocketCode.DeviceEmulator, "instance check");

    assert.equal(dev.unsupportedFeatureDetected, false, "unsupported feature detected: initial = false");
    assert.equal(dev.unsupportedFeatures.length, 0, "unsupported features: initial = []");

    //dispose
    dev.dispose();
    assert.equal(dev._disposed, true, "dispose");

    dev = new PocketCode.DeviceEmulator();  //recreate to check if there are any side effects
    assert.equal(dev.emulationInUse, false, "emulationInUse getter: false on init");
    assert.ok(!isNaN(dev.inclinationX), "inclinationX getter");
    assert.ok(!isNaN(dev.inclinationY), "inclinationY getter");
    assert.equal(dev.emulationInUse, true, "emulationInUse getter: true after inclination in use");

    assert.equal(dev.unsupportedFeatureDetected, false, "unsupported feature detected: inclination emulation = false");
    assert.equal(dev.unsupportedFeatures.length, 0, "unsupported features: inclination emulation = []");

    assert.ok(!isNaN(dev.accelerationX), "accelerationX getter");
    assert.equal(dev.unsupportedFeatureDetected, true, "unsupported feature detected: acceleration");
    assert.equal(dev.unsupportedFeatures.length, 1, "unsupported features: acceleration");
    dev.unsupportedFeatures[0] == "deviceFeatureAccelerationNEW";
    assert.equal(dev.unsupportedFeatures[0], "lblDeviceAcceleration", "property and access check");

});

