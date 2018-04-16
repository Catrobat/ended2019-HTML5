/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

QUnit.module("components/device.js");


QUnit.test("Device", function (assert) {

    var dev = new PocketCode.Device();
    assert.ok(dev instanceof PocketCode.Device, "instance check");
    assert.ok(dev.onSpaceKeyDown instanceof SmartJs.Event.Event, "onSpaceKeyDown event check");

    assert.ok(dev.onInit instanceof SmartJs.Event.Event && dev.onSpaceKeyDown instanceof SmartJs.Event.Event, "event check");

    assert.ok(dev.initialized, "initialized getter");   //geo location not in use
    assert.equal(dev.isMobile, SmartJs.Device.isMobile, "isMobile: accessor");
    assert.equal(dev.isTouch, SmartJs.Device.isTouch, "isMobile: accessor");

    assert.equal(dev.unsupportedFeatureDetected, false, "unsupported feature detected: initial = false");
    assert.equal(dev.unsupportedFeatures.length, 0, "unsupported features: initial = []");

    assert.ok(typeof dev.mobileLockRequired == 'boolean', "mobileLockRequired: accessor"); //poor tests as we cannot set isMobile here

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

    //arduino
    assert.ok(!isNaN(dev.getArduinoAnalogPin()), "Arduino analog getter");
    assert.ok(!isNaN(dev.getArduinoDigitalPin()), "Arduino digital getter");

    assert.equal(dev.vibrate(''), false, "vibrate call without valid parameter");
    dev._features.VIBRATE.supported = false; //disable
    assert.notOk(dev.vibrate("10"), "vibrate: invalid argument");
    assert.equal(dev.vibrate(10), false, "vibrate call with parameter");

    assert.equal(dev.emulationInUse, false, "emulationInUse getter: should always return false");

    assert.equal(dev.unsupportedFeatureDetected, true, "unsupported feature detected");
    assert.equal(dev.unsupportedFeatures.length, 8, "unsupported features: all");

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
    dev._touchEvents.history = [{active: true, x: 1, y: 2}, {active: true, x: 3, y: 4}];
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


QUnit.test("MediaDevice", function (assert) {

    var dev = new PocketCode.MediaDevice();

    assert.ok(dev instanceof PocketCode.Device && dev instanceof PocketCode.MediaDevice, "instance check");

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

    var sm = new PocketCode.SoundManager();
    var devEm = new PocketCode.DeviceEmulator(sm);


    assert.ok(devEm instanceof PocketCode.Device && devEm instanceof PocketCode.DeviceEmulator, "instance check");
    assert.equal(devEm.unsupportedFeatureDetected, false, "unsupported feature detected: initial = false");
    assert.equal(devEm.unsupportedFeatures.length, 0, "unsupported features: initial = []");
    assert.equal(devEm.emulationInUse, false, "emulationInUse getter: false on init")
    assert.ok(!isNaN(devEm.inclinationX), "inclinationX getter");
    assert.ok(!isNaN(devEm.inclinationY), "inclinationY getter");
    assert.equal(devEm.emulationInUse, true, "emulationInUse getter: true after inclination in use");
    assert.ok(!isNaN(devEm.inclinationX), "inclinationX getter");
    assert.ok(!isNaN(devEm.inclinationY), "inclinationY getter");
    assert.equal(devEm.emulationInUse, true, "emulationInUse getter: true after inclination in use");
    assert.equal(devEm.unsupportedFeatureDetected, false, "unsupported feature detected: inclination emulation = false");
    assert.equal(devEm.unsupportedFeatures.length, 0, "unsupported features: inclination emulation = []");
    assert.ok(!isNaN(devEm.accelerationX), "accelerationX getter");
    assert.equal(devEm.unsupportedFeatureDetected, true, "unsupported feature detected: acceleration");
    assert.equal(devEm.unsupportedFeatures.length, 1, "unsupported features: acceleration");
    devEm.unsupportedFeatures[0] = "deviceFeatureAccelerationNEW";
    assert.equal(devEm.unsupportedFeatures[0], "lblDeviceAcceleration", "property and access check");

    assert.ok(devEm.timestamp == undefined);
    devEm._keyDown({keyCode: devEm._keyCode.LEFT});
    assert.ok(devEm.timestamp != 0);
    devEm._resetInclination();
    assert.ok(devEm.timestamp == undefined);
    devEm._keyDown({keyCode: devEm._keyCode.LEFT});
    assert.ok(devEm.timestamp != 0);
    devEm._keyUp({keyCode: devEm._keyCode.LEFT});
    assert.ok(devEm.timestamp == undefined);

    // //dispose
    // devEm.dispose();
    // assert.equal(devEm._disposed, true, "dispose");
    // assert.notEqual(sm._disposed, true, "sound manager not disposed during dispose");

});


QUnit.test("DeviceEmulator Key Events Left/Right", function (assert) {

    var done = assert.async();
    var sm = new PocketCode.SoundManager();
    var devEm = new PocketCode.DeviceEmulator(sm);


    //Left key
    var validateSingleKeyLeft = function () {
        assert.ok(devEm.inclinationX > 0, "Left Key pressed: inclination to the left");
        devEm._keyUp({keyCode: devEm._keyCode.LEFT});
        assert.equal(devEm.inclinationX, 0, "Left Key released: no inclination");
        testLeftAlt();
    }
    devEm._keyDown({keyCode: devEm._keyCode.LEFT});
    setTimeout(validateSingleKeyLeft, 5);

    //Left key alternative
    function testLeftAlt() {
        var validateSingleKeyLeftAlternative = function () {
            assert.ok(devEm.inclinationX > 0, "Alternative Left Key pressed: inclination to the left");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.LEFT});
            assert.equal(devEm.inclinationX, 0, "Alternative Left Key released: no inclination");
            testRight();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.LEFT});
        setTimeout(validateSingleKeyLeftAlternative, 5);
    }

    //Right key
    function testRight() {
        var validateSingleKeyRight = function () {
            assert.ok(devEm.inclinationX < 0, "Right Key pressed: inclination to the right");
            devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
            assert.equal(devEm.inclinationX, 0, "Right Key released: no inclination");
            testRightAlt();
        }
        devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
        setTimeout(validateSingleKeyRight, 5);
    }

    //Right key alternative
    function testRightAlt() {
        var validateSingleKeyRightAlternative = function () {
            assert.ok(devEm.inclinationX < 0, "Alternative Right Key pressed: inclination to the right");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.RIGHT});
            assert.equal(devEm.inclinationX, 0, "Alternative Right Key released: no inclination");
            testLeftRight();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.RIGHT});
        setTimeout(validateSingleKeyRightAlternative, 5);
    }

    //Left and Right pressed
    function testLeftRight() {
        var validateTwoKeysLeftRight = function () {
            devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
            var firstPressInclination = devEm.inclinationX; //should test
            devEm._keyDown({keyCode: devEm._keyCode.LEFT});
            assert.equal(devEm.inclinationX, firstPressInclination, "Left and Right Key pressed: inclination hold");
            devEm._keyUp({keyCode: devEm._keyCode.LEFT});
            devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
            assert.equal(devEm.inclinationX, 0, "Left and Right Key released: no inclination");
            testLeftRightAlt();
        }
        devEm._keyDown({keyCode: devEm._keyCode.LEFT});
        setTimeout(validateTwoKeysLeftRight, 5);
    }

    //Alternative Left and Right pressed
    function testLeftRightAlt() {
        var validateTwoKeysLeftRightAlternative = function () {
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.RIGHT});
            var firstPressInclination = devEm.inclinationX; //should test
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.LEFT});
            assert.equal(devEm.inclinationX, firstPressInclination, "Alternative Left and Right Key pressed: inclination hold");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.LEFT});
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.RIGHT});
            assert.equal(devEm.inclinationX, 0, "Alternative Left and Right Key released: no inclination");
            testFirstKeyDownLeft();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.LEFT});
        setTimeout(validateTwoKeysLeftRightAlternative, 5);
    }

    //Left(first) and Right pressed --> left released, reset of inclination
    function testFirstKeyDownLeft() {
        var validateFirstKeyDown = function () {
            devEm._keyDown({keyCode: devEm._keyCode.LEFT});
            var tmpIncl1 = devEm.inclinationX;
            devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
            assert.ok(tmpIncl1 > 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                devEm._keyUp({keyCode: devEm._keyCode.LEFT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationX;
                assert.ok(tmpIncl3 < 0, "left key released, inclination reseted and inclination to the right");
                devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
                testFirstKeyDownLeftAlt();
            }
        }
        devEm._keyDown({keyCode: devEm._keyCode.LEFT});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Left(first) and Right pressed --> left released, reset of inclination
    function testFirstKeyDownLeftAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = devEm.inclinationX;
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.RIGHT});
            assert.ok(tmpIncl1 > 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.LEFT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationX;
                assert.ok(tmpIncl3 < 0, "alternative left key released, inclination reseted and inclination to the right");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.RIGHT});
                testFirstKeyDownRight();
            }
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.LEFT});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Left and Right(first) pressed --> right released, reset of inclination
    function testFirstKeyDownRight() {
        var validateFirstKeyDown = function () {
            devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
            var tmpIncl1 = devEm.inclinationX;
            devEm._keyDown({keyCode: devEm._keyCode.LEFT});
            assert.ok(tmpIncl1 < 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationX;
                assert.ok(tmpIncl3 > 0, "right key released, inclination reseted and inclination to the left");
                devEm._keyUp({keyCode: devEm._keyCode.LEFT});
                testFirstKeyDownRightAlt();
            }
        }
        devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Left and Right(first) pressed --> right released, reset of inclination
    function testFirstKeyDownRightAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = devEm.inclinationX;
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.LEFT});
            assert.ok(tmpIncl1 < 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.RIGHT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationX;
                assert.ok(tmpIncl3 > 0, "alternative right key released, inclination reseted and inclination to the left");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.LEFT});
                testInclinationMaxLeft();
            }
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.RIGHT});
        setTimeout(validateFirstKeyDown, 1000);
    }

    function testInclinationMaxLeft() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationX;
            assert.equal(tmpMaxIncl, devEm.inclinationMinMaxRange.MAX, "Left: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._keyCode.LEFT});
            testInclinationMaxLeftAlt();
        }
        devEm.inclinationMinMax = 65;
        devEm._keyDown({keyCode: devEm._keyCode.LEFT});
        setTimeout(waitForMaxInclination, 1500);
    }

    function testInclinationMaxLeftAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationX;
            assert.equal(tmpMaxIncl, devEm.inclinationMinMaxRange.MAX, "Alternative Left: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.LEFT});
            testInclinationMaxRight();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.LEFT});
        setTimeout(waitForMaxInclination, 1500);
    }

    function testInclinationMaxRight() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationX;
            assert.equal(tmpMaxIncl, -devEm.inclinationMinMaxRange.MAX, "Right: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
            testInclinationMaxRightAlt();
        }
        devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
        setTimeout(waitForMaxInclination, 1500);
    }

    function testInclinationMaxRightAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationX;
            assert.equal(tmpMaxIncl, -devEm.inclinationMinMaxRange.MAX, "Alternative Right: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.RIGHT});
            done();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.RIGHT});
        setTimeout(waitForMaxInclination, 1500);
        //testDisposed();
    }


    // //dispose
    // function testDisposed() {
    //     var testDispose = function () {
    //         devEm.dispose();
    //         assert.equal(devEm._disposed, true, "dispose");
    //         assert.notEqual(sm._disposed, true, "sound manager not disposed during dispose");
    //
    //     }
    //     setTimeout(testDispose, 5);
    // }

});

QUnit.test("DeviceEmulator Key Events Up/Down", function (assert) {

    var done = assert.async();

    var sm = new PocketCode.SoundManager();
    var devEm = new PocketCode.DeviceEmulator(sm);

    //Up key
    var validateSingleKeyUp = function () {
        assert.ok(devEm.inclinationY < 0, "Up Key pressed: inclination to the top");
        devEm._keyUp({keyCode: devEm._keyCode.UP});
        assert.equal(devEm.inclinationY, 0, "Up Key released: no inclination");
        testUpAlt();
    }
    devEm._keyDown({keyCode: devEm._keyCode.UP});
    setTimeout(validateSingleKeyUp, 5);

    //Up key alternative
    function testUpAlt() {
        var validateSingleKeyUpAlternative = function () {
            assert.ok(devEm.inclinationY < 0, "Alternative Up Key pressed: inclination to the top");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.UP});
            assert.equal(devEm.inclinationY, 0, "Alternative Up Key released: no inclination");
            testDown();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.UP});
        setTimeout(validateSingleKeyUpAlternative, 5);
    }

    //Down key
    function testDown() {
        var validateSingleKeyDown = function () {
            assert.ok(devEm.inclinationY > 0, "Down Key pressed: inclination to the bottom");
            devEm._keyUp({keyCode: devEm._keyCode.DOWN});
            assert.equal(devEm.inclinationY, 0, "Down Key released: no inclination");
            testDownAlt();
        }
        devEm._keyDown({keyCode: devEm._keyCode.DOWN});
        setTimeout(validateSingleKeyDown, 5);
    }

    //Down key alternative
    function testDownAlt() {
        var validateSingleKeyDownAlternative = function () {
            assert.ok(devEm.inclinationY > 0, "Alternative Down Key pressed: inclination to the bottom");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.DOWN});
            assert.equal(devEm.inclinationY, 0, "Alternative Down Key released: no inclination");
            testUpDown();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.DOWN});
        setTimeout(validateSingleKeyDownAlternative, 5);
    }

    //Up and Down pressed
    function testUpDown() {
        var validateTwoKeysUpDown = function () {
            devEm._keyDown({keyCode: devEm._keyCode.UP});
            var InclinationUp = devEm.inclinationY;
            devEm._keyDown({keyCode: devEm._keyCode.DOWN});
            var InclinationHold = devEm.inclinationY;
            assert.equal(InclinationUp, InclinationHold, "Up and Down Key pressed: inclination hold");
            devEm._keyUp({keyCode: devEm._keyCode.UP});
            devEm._keyUp({keyCode: devEm._keyCode.DOWN});
            assert.equal(devEm.inclinationY, 0, "Up and Down Key released: no inclination");
            testUpDownAlt();
        }
        devEm._keyDown({keyCode: devEm._keyCode.UP});
        setTimeout(validateTwoKeysUpDown, 5);
    }

    //Alternative Up and Down pressed
    function testUpDownAlt() {
        var validateTwoKeysUpDownAlternative = function () {
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.UP});
            var InclinationUp = devEm.inclinationY;
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.DOWN});
            var InclinationHold = devEm.inclinationY;
            assert.equal(InclinationUp, InclinationHold, "Alternative Up and Down Key pressed: inclination hold");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.UP});
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.DOWN});
            assert.equal(devEm.inclinationY, 0, "Alternative Up and Down Key released: no inclination");
            testFirstKeyDownUp();
        }
        setTimeout(validateTwoKeysUpDownAlternative, 5);
    }

    //Up(first) and Down pressed --> up released, reset of inclination
    function testFirstKeyDownUp() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = devEm.inclinationY;
            devEm._keyDown({keyCode: devEm._keyCode.DOWN});
            assert.ok(tmpIncl1 < 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                devEm._keyUp({keyCode: devEm._keyCode.UP});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationY;
                assert.ok(tmpIncl3 > 0, "up key released, inclination reseted and inclination to the bottom");
                devEm._keyUp({keyCode: devEm._keyCode.DOWN});
                testFirstKeyDownUpAlt();
            }
        }
        devEm._keyDown({keyCode: devEm._keyCode.UP});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Up(first) and Down pressed --> up released, reset of inclination
    function testFirstKeyDownUpAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = devEm.inclinationY;
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.DOWN});
            assert.ok(tmpIncl1 < 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.UP});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationY;
                assert.ok(tmpIncl3 > 0, "alternative up key released, inclination reseted and inclination to the bottom");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.DOWN});
                testFirstKeyDownDown();
            }
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.UP});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Up and Down(first) pressed --> down released, reset of inclination
    function testFirstKeyDownDown() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = devEm.inclinationY;
            devEm._keyDown({keyCode: devEm._keyCode.UP});
            assert.ok(tmpIncl1 > 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                devEm._keyUp({keyCode: devEm._keyCode.DOWN});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationY;
                assert.ok(tmpIncl3 < 0, "down key released, inclination reseted and inclination to the top");
                devEm._keyUp({keyCode: devEm._keyCode.UP});
                testFirstKeyDownDownAlt();
            }
        }
        devEm._keyDown({keyCode: devEm._keyCode.DOWN});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Up and Down(first) pressed --> left released, reset of inclination
    function testFirstKeyDownDownAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = devEm.inclinationY;
            devEm._keyDown({keyCode: devEm._alternativeKeyCode.UP});
            assert.ok(tmpIncl1 > 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = devEm.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.DOWN});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = devEm.inclinationY;
                assert.ok(tmpIncl3 < 0, "down key released, inclination reseted and inclination to the top");
                devEm._keyUp({keyCode: devEm._alternativeKeyCode.UP});
                testInclinationMaxUp();
            }
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.DOWN});
        setTimeout(validateFirstKeyDown, 1000);
    }


    function testInclinationMaxUp() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationY;
            assert.equal(tmpMaxIncl, -devEm.inclinationMinMaxRange.MAX, "Up: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._keyCode.UP});
            testInclinationMaxUpAlt();
        }
        devEm.inclinationMinMax = 65;
        devEm._keyDown({keyCode: devEm._keyCode.UP});
        setTimeout(waitForMaxInclination, 5000);
    }

    function testInclinationMaxUpAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationY;
            assert.equal(tmpMaxIncl, -devEm.inclinationMinMaxRange.MAX, "Alternative Up: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.UP});
            testInclinationMaxDown();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.UP});
        setTimeout(waitForMaxInclination, 5000);
    }

    function testInclinationMaxDown() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationY;
            assert.equal(tmpMaxIncl, devEm.inclinationMinMaxRange.MAX, "Down: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._keyCode.DOWN});
            testInclinationMaxDownAlt();
        }
        devEm._keyDown({keyCode: devEm._keyCode.DOWN});
        setTimeout(waitForMaxInclination, 5000);
    }

    function testInclinationMaxDownAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = devEm.inclinationY;
            assert.equal(tmpMaxIncl, devEm.inclinationMinMaxRange.MAX, "Alternative Down: Max Inclination reached");
            devEm._keyUp({keyCode: devEm._alternativeKeyCode.DOWN});
            done();
            //testSpace();
        }
        devEm._keyDown({keyCode: devEm._alternativeKeyCode.DOWN});
        setTimeout(waitForMaxInclination, 5000);
        // testDisposed();
    }

    // function testSpace() {
    //     var validateKeySpace = function () {
    //         assert.ok(deviceEmulator._keyPress.SPACE, "Space key pressed");
    //         deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.SPACE});
    //         assert.notOk(deviceEmulator._keyPress.SPACE, "Space Key released");
    //         testDisposed();
    //     }
    //     deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.SPACE});
    //     setTimeout(validateKeySpace, 5);
    // }

    // //dispose
    // function testDisposed() {
    //     var testDispose = function () {
    //         devEm.dispose();
    //         assert.equal(devEm._disposed, true, "dispose");
    //         assert.notEqual(sm._disposed, true, "sound manager not disposed during dispose");
    //         done();
    //     }
    //     setTimeout(testDispose, 5);
    // }

});
QUnit.test("DeviceEmulator Up,Down,Right,Left", function (assert) {
    var done = assert.async();
    var sm = new PocketCode.SoundManager();
    var devEm = new PocketCode.DeviceEmulator(sm);
//inclination values every press : left +  down +  right -  up -
//Up(first)key and Right Key
    var validateSingleKeyUpAndRight = function () {
        assert.ok(devEm.inclinationX < 0, "inclinationX minus degree");
        assert.ok(devEm.inclinationY < 0, "inclinationY minus degree");
        assert.equal(devEm.inclinationY, -devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//-65
        assert.equal(devEm.inclinationX, -devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//-65
        devEm._keyUp({keyCode: devEm._keyCode.UP});
        devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
        assert.equal(devEm.inclinationY, 0, "Up Key released: no inclination");
        assert.equal(devEm.inclinationX, 0, "RIGHT Key released: no inclination");
        goKeyUpAndLeft();
    }
    devEm._keyDown({keyCode: devEm._keyCode.UP});
    devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
    setTimeout(validateSingleKeyUpAndRight, 1500);


    //Up(first)key and Left Key
    function goKeyUpAndLeft() {
        var validateSingleKeyUpAndLeft = function () {
            assert.ok(devEm.inclinationX > 0, "inclinationX plus degree");
            assert.ok(devEm.inclinationY < 0, "inclinationY minus degree");
            assert.equal(devEm.inclinationY, -devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//-65
            assert.equal(devEm.inclinationX, devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//65
            devEm._keyUp({keyCode: devEm._keyCode.UP});
            devEm._keyUp({keyCode: devEm._keyCode.LEFT});
            assert.equal(devEm.inclinationY, 0, "Up Key released: no inclination");
            assert.equal(devEm.inclinationX, 0, "Right Key released: no inclination");
            goValidateWholeKey();
        }
        devEm._keyDown({keyCode: devEm._keyCode.UP});
        devEm._keyDown({keyCode: devEm._keyCode.LEFT});
        setTimeout(validateSingleKeyUpAndLeft, 1500);
    }


    //tried press whole key and released Whole key then turn zero.
    function goValidateWholeKey() {
        var validateWholeKey = function () {
            var holdInclinationX1 = devEm.inclinationX;
            var holdInclinationY1 = devEm.inclinationY;
            devEm._keyDown({keyCode: devEm._keyCode.DOWN});
            devEm._keyDown({keyCode: devEm._keyCode.LEFT});
            var holdInclinationX2 = devEm.inclinationX;
            var holdInclinationY2 = devEm.inclinationY;
            assert.equal(holdInclinationX1, holdInclinationX2, "inclinationX value nothing changed");
            assert.equal(holdInclinationY1, holdInclinationY2, "inclinationY value nothing changed");
            devEm._keyUp({keyCode: devEm._keyCode.UP});
            devEm._keyUp({keyCode: devEm._keyCode.DOWN});
            devEm._keyUp({keyCode: devEm._keyCode.LEFT});
            devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
            assert.ok(devEm.inclinationX == 0, "true");
            assert.equal(devEm.inclinationX, devEm.inclinationY, "inclination values turn zero");
            goDownAndLeft();
        }
        devEm._keyDown({keyCode: devEm._keyCode.UP});
        devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
        setTimeout(validateWholeKey, 300);
    }


    //Down(first)key and left keys pressed after released
    function goDownAndLeft() {
        var validateSingleKeyDownAndLeft = function () {
            assert.ok(devEm.inclinationX > 0, "inclinationX plus degree");
            assert.ok(devEm.inclinationY > 0, "inclinationY plus degree");
            assert.equal(devEm.inclinationY, devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//-65
            assert.equal(devEm.inclinationX, devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//65
            devEm._keyUp({keyCode: devEm._keyCode.DOWN});
            devEm._keyUp({keyCode: devEm._keyCode.LEFT});
            assert.equal(devEm.inclinationY, 0, "Down Key released: no inclination");
            assert.equal(devEm.inclinationX, 0, "Left Key released: no inclination");
            goDownAndRight();
        }
        devEm._keyDown({keyCode: devEm._keyCode.DOWN});
        devEm._keyDown({keyCode: devEm._keyCode.LEFT});
        setTimeout(validateSingleKeyDownAndLeft, 1500);
    }

    //Down(first)key and left keys pressed after released
    function goDownAndRight() {
        var validateSingleKeyDownAndRight = function () {
            assert.ok(devEm.inclinationX < 0, "inclinationX minus degree");
            assert.ok(devEm.inclinationY > 0, "inclinationY plus degree");
            assert.equal(devEm.inclinationY, devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//-65
            assert.equal(devEm.inclinationX, -devEm.inclinationMinMaxRange.MAX, "inclination Max Value");//65
            devEm._keyUp({keyCode: devEm._keyCode.DOWN});
            devEm._keyUp({keyCode: devEm._keyCode.RIGHT});
            assert.equal(devEm.inclinationY, 0, "Down Key released: no inclination");
            assert.equal(devEm.inclinationX, 0, "Right Key released: no inclination");
            done();
        }
        devEm._keyDown({keyCode: devEm._keyCode.DOWN});
        devEm._keyDown({keyCode: devEm._keyCode.RIGHT});
        setTimeout(validateSingleKeyDownAndRight, 1500);
    }

});




