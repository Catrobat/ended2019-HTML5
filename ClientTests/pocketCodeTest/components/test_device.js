/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

QUnit.module("components/device.js");


QUnit.test("Device", function (assert) {

    var sm = new PocketCode.SoundManager();
    assert.throws(function () { var dev = new PocketCode.Device("sm"); }, Error, "ERROR: invalid cntr argument");
    var dev = new PocketCode.Device(sm);

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

    assert.equal(dev.loudness, sm.volume, "loudness getter");
    
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
    assert.notEqual(sm._disposed, true, "sound manager not disposed during dispose");

    dev = new PocketCode.Device(sm);  //recreate to check if there are any side effects

});


QUnit.test("Device: Touch", function (assert) {

    var sm = new PocketCode.SoundManager();
    var dev = new PocketCode.Device(sm);

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
    var sm = new PocketCode.SoundManager();
    var dev = new PocketCode.Device(sm);

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

    var sm = new PocketCode.SoundManager();
    var dev = new PocketCode.MediaDevice(sm);

    assert.ok(dev instanceof PocketCode.Device && dev instanceof PocketCode.MediaDevice, "instance check");

    dev._features.CAMERA.inUse = false;
    assert.equal(dev.selectedCamera, PocketCode.CameraType.BACK, "selected camera: default selected");
    assert.ok(dev._features.CAMERA.inUse, "camera inUser: after getter");
    dev._features.CAMERA.inUse = false;
    assert.throws(function () { dev.selectedCamera = "OTHER"; }, Error, "ERROR: camera setter: invalid value");
    assert.notOk(dev._features.CAMERA.inUse, "camera inUser: after invalid setter");
    dev._features.CAMERA.inUse = false;
    dev.selectedCamera = PocketCode.CameraType.FRONT;
    assert.ok(dev._features.CAMERA.inUse, "camera inUser: after setter");
    assert.equal(dev.selectedCamera, PocketCode.CameraType.FRONT, "selected camera: getter/setter");

    assert.equal(dev.cameraOn, false, "cameraOn: default");
    dev._features.CAMERA.inUse = false;
    assert.throws(function () { dev.cameraOn = "OTHER"; }, Error, "ERROR: cameraOn setter: invalid value");
    assert.notOk(dev._features.CAMERA.inUse, "cameraOn: camera inUser: after invalid setter");
    dev._features.CAMERA.inUse = false;
    dev.cameraOn = true;
    assert.ok(dev._features.CAMERA.inUse, "camera inUser: after setter");
    assert.ok(dev.cameraOn, "selected camera: getter/setter");

    dev._features.CAMERA.inUse = false;
    assert.ok(typeof dev.faceDetected === 'boolean', "faceDetected getter");
    assert.ok(dev._features.CAMERA.inUse, "camera inUser: after getter");
    assert.ok(!isNaN(dev.faceSize), "faceSize getter");
    assert.ok(!isNaN(dev.facePositionX), "facePositionX getter");
    assert.ok(!isNaN(dev.facePositionY), "facePositionY getter");


    assert.ok(false, "TODO");
});


QUnit.test("DeviceEmulator", function (assert) {

    var sm = new PocketCode.SoundManager();
    var dev = new PocketCode.DeviceEmulator(sm);

    assert.ok(dev instanceof PocketCode.MediaDevice && dev instanceof PocketCode.DeviceEmulator, "instance check");

    assert.equal(dev.unsupportedFeatureDetected, false, "unsupported feature detected: initial = false");
    assert.equal(dev.unsupportedFeatures.length, 0, "unsupported features: initial = []");

    //dispose
    dev.dispose();
    assert.equal(dev._disposed, true, "dispose");
    assert.notEqual(sm._disposed, true, "sound manager not disposed during dispose");

    dev = new PocketCode.DeviceEmulator(sm);  //recreate to check if there are any side effects
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


QUnit.test("DeviceEmulator Key Events Left/Right", function (assert) {

    var done = assert.async();

    var soundmanager = new PocketCode.SoundManager();
    var deviceEmulator = new PocketCode.DeviceEmulator(soundmanager);

    //Left key
    var validateSingleKeyLeft = function () {
        assert.ok(deviceEmulator.inclinationX > 0, "Left Key pressed: inclination to the left");
        deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
        assert.equal(deviceEmulator.inclinationX, 0, "Left Key released: no inclination");
        testLeftAlt();
    }
    deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
    setTimeout(validateSingleKeyLeft, 5);

    //Left key alternative
    function testLeftAlt() {
        var validateSingleKeyLeftAlternative = function () {
            assert.ok(deviceEmulator.inclinationX > 0, "Alternative Left Key pressed: inclination to the left");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
            assert.equal(deviceEmulator.inclinationX, 0, "Alternative Left Key released: no inclination");
            testRight();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
        setTimeout(validateSingleKeyLeftAlternative, 5);
    }

    //Right key
    function testRight() {
        var validateSingleKeyRight = function () {
            assert.ok(deviceEmulator.inclinationX < 0, "Right Key pressed: inclination to the right");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
            assert.equal(deviceEmulator.inclinationX, 0, "Right Key released: no inclination");
            testRightAlt();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
        setTimeout(validateSingleKeyRight, 5);
    }

    //Right key alternative
    function testRightAlt() {
        var validateSingleKeyRightAlternative = function () {
            assert.ok(deviceEmulator.inclinationX < 0, "Alternative Right Key pressed: inclination to the right");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
            assert.equal(deviceEmulator.inclinationX, 0, "Alternative Right Key released: no inclination");
            testLeftRight();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
        setTimeout(validateSingleKeyRightAlternative, 5);
    }

    //Left and Right pressed
    function testLeftRight() {
        var validateTwoKeysLeftRight = function () {
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
            assert.equal(deviceEmulator._keyPress.LEFT, deviceEmulator._keyPress.RIGHT, "Left and Right Key pressed: inclination hold");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
            assert.equal(deviceEmulator.inclinationX, 0, "Left and Right Key released: no inclination");
            testLeftRightAlt();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
        setTimeout(validateTwoKeysLeftRight, 5);
    }

    //Alternative Left and Right pressed
    function testLeftRightAlt() {
        var validateTwoKeysLeftRightAlternative = function () {
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
            assert.equal(deviceEmulator._keyPress.LEFT, deviceEmulator._keyPress.RIGHT, "Alternative Left and Right Key pressed: inclination hold");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
            assert.equal(deviceEmulator.inclinationX, 0, "Alternative Left and Right Key released: no inclination");
            testFirstKeyDownLeft();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
        setTimeout(validateTwoKeysLeftRightAlternative, 5);
    }

    //Left(first) and Right pressed --> left released, reset of inclination
    function testFirstKeyDownLeft() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
            assert.ok(tmpIncl1 > 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 < 0, "left key released, inclination reseted and inclination to the right");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
                testFirstKeyDownLeftAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Left(first) and Right pressed --> left released, reset of inclination
    function testFirstKeyDownLeftAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
            assert.ok(tmpIncl1 > 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 < 0, "alternative left key released, inclination reseted and inclination to the right");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
                testFirstKeyDownRight();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //Left and Right(first) pressed --> right released, reset of inclination
    function testFirstKeyDownRight() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
            assert.ok(tmpIncl1 < 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 > 0, "right key released, inclination reseted and inclination to the left");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
                testFirstKeyDownRightAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Left and Right(first) pressed --> right released, reset of inclination
    function testFirstKeyDownRightAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
            assert.ok(tmpIncl1 < 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 > 0, "alternative right key released, inclination reseted and inclination to the left");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
                testCorrectFirstLeft();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown Left test: both keys pressed, first released, first pressed again
    function testCorrectFirstLeft() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
            assert.ok(tmpIncl1 > 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 < 0, "left key released, inclination reseted and inclination to the right");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
                assert.equal(deviceEmulator._firstKeyDown.RIGHT, true, "left pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
                testCorrectFirstLeftAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown alternative Left test: both keys pressed, first released, first pressed again
    function testCorrectFirstLeftAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
            assert.ok(tmpIncl1 > 0, "alternative left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "alternative left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 < 0, "alternative left key released, inclination reseted and inclination to the right");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
                assert.equal(deviceEmulator._firstKeyDown.RIGHT, true, "alternative left pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
                testCorrectFirstRight()
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown Right test: both keys pressed, first released, first pressed again
    function testCorrectFirstRight() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
            assert.ok(tmpIncl1 < 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 > 0, "left key released, inclination reseted and inclination to the right");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
                assert.equal(deviceEmulator._firstKeyDown.LEFT, true, "left pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
                testCorrectFirstRightAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown alternative Right test: both keys pressed, first released, first pressed again
    function testCorrectFirstRightAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationX;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
            assert.ok(tmpIncl1 < 0, "left and right key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationX;
                assert.equal(tmpIncl1, tmpIncl2, "left and right key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationX;
                assert.ok(tmpIncl3 > 0, "left key released, inclination reseted and inclination to the right");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
                assert.equal(deviceEmulator._firstKeyDown.LEFT, true, "left pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
                testInclinationMaxLeft();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
        setTimeout(validateFirstKeyDown, 1000);
    }
    function testInclinationMaxLeft() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationX;
            assert.equal(tmpMaxIncl, deviceEmulator.degreeChangeMax, "Left: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.LEFT});
            testInclinationMaxLeftAlt();
        }
        deviceEmulator.degreeChangeValue = 80;
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.LEFT});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testInclinationMaxLeftAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationX;
            assert.equal(tmpMaxIncl, deviceEmulator.degreeChangeMax, "Alternative Left: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
            testInclinationMaxRight();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.LEFT});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testInclinationMaxRight() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationX;
            assert.equal(tmpMaxIncl, -deviceEmulator.degreeChangeMax, "Right: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.RIGHT});
            testInclinationMaxRightAlt();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.RIGHT});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testInclinationMaxRightAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationX;
            assert.equal(tmpMaxIncl, -deviceEmulator.degreeChangeMax, "Alternative Right: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
            testSpace();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.RIGHT});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testSpace() {
        var validateKeySpace = function () {
            assert.ok(deviceEmulator._keyPress.SPACE, "Space key pressed");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.SPACE});
            assert.notOk(deviceEmulator._keyPress.SPACE, "Space Key released");
            testDisposed();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.SPACE});
        setTimeout(validateKeySpace, 5);
    }

    //dispose
    function testDisposed() {
        var testDispose = function () {
            deviceEmulator.dispose();
            assert.equal(deviceEmulator._disposed, true, "dispose");
            assert.notEqual(soundmanager._disposed, true, "sound manager not disposed during dispose");
            done();
        }
        setTimeout(testDispose, 5);
    }

});

QUnit.test("DeviceEmulator Key Events Up/Down", function (assert) {

    var done = assert.async();

    var soundmanager = new PocketCode.SoundManager();
    var deviceEmulator = new PocketCode.DeviceEmulator(soundmanager);

    //Up key
    var validateSingleKeyUp = function () {
        assert.ok(deviceEmulator.inclinationY < 0, "Up Key pressed: inclination to the top");
        deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
        assert.equal(deviceEmulator.inclinationY, 0, "Up Key released: no inclination");
        testUpAlt();
    }
    deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
    setTimeout(validateSingleKeyUp, 5);

    //Up key alternative
    function testUpAlt() {
        var validateSingleKeyUpAlternative = function () {
            assert.ok(deviceEmulator.inclinationY < 0, "Alternative Up Key pressed: inclination to the top");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
            assert.equal(deviceEmulator.inclinationY, 0, "Alternative Up Key released: no inclination");
            testDown();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.UP});
        setTimeout(validateSingleKeyUpAlternative, 5);
    }

    //Down key
    function testDown() {
        var validateSingleKeyDown = function () {
            assert.ok(deviceEmulator.inclinationY > 0, "Down Key pressed: inclination to the bottom");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
            assert.equal(deviceEmulator.inclinationY, 0, "Down Key released: no inclination");
            testDownAlt();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
        setTimeout(validateSingleKeyDown, 5);
    }

    //Down key alternative
    function testDownAlt() {
        var validateSingleKeyDownAlternative = function () {
            assert.ok(deviceEmulator.inclinationY > 0, "Alternative Down Key pressed: inclination to the bottom");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
            assert.equal(deviceEmulator.inclinationY, 0, "Alternative Down Key released: no inclination");
            testUpDown();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
        setTimeout(validateSingleKeyDownAlternative, 5);
    }

    //Up and Down pressed
    function testUpDown() {
        var validateTwoKeysUpDown = function () {
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
            assert.equal(deviceEmulator._keyPress.UP, deviceEmulator._keyPress.DOWN, "Up and Down Key pressed: inclination hold");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
            assert.equal(deviceEmulator.inclinationY, 0, "Up and Down Key released: no inclination");
            testUpDownAlt();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
        setTimeout(validateTwoKeysUpDown, 5);
    }

    //Alternative Up and Down pressed
    function testUpDownAlt() {
        var validateTwoKeysUpDownAlternative = function () {
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
            assert.equal(deviceEmulator._keyPress.UP, deviceEmulator._keyPress.DOWN, "Alternative Up and Down Key pressed: inclination hold");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
            assert.equal(deviceEmulator.inclinationY, 0, "Alternative Up and Down Key released: no inclination");
            testFirstKeyDownUp();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
        setTimeout(validateTwoKeysUpDownAlternative, 5);
    }

    //Up(first) and Down pressed --> up released, reset of inclination
    function testFirstKeyDownUp() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
            assert.ok(tmpIncl1 < 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 > 0, "up key released, inclination reseted and inclination to the bottom");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
                testFirstKeyDownUpAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Up(first) and Down pressed --> up released, reset of inclination
    function testFirstKeyDownUpAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
            assert.ok(tmpIncl1 < 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 > 0, "alternative up key released, inclination reseted and inclination to the bottom");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
                testFirstKeyDownDown();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.UP});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //Up and Down(first) pressed --> down released, reset of inclination
    function testFirstKeyDownDown() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
            assert.ok(tmpIncl1 > 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 < 0, "down key released, inclination reseted and inclination to the top");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
                testFirstKeyDownDownAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
        setTimeout(validateFirstKeyDown, 1000);
    }

    //Alternative Up and Down(first) pressed --> left released, reset of inclination
    function testFirstKeyDownDownAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.UP});
            assert.ok(tmpIncl1 > 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 < 0, "down key released, inclination reseted and inclination to the top");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
                testCorrectFirstUp();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown Up test: both keys pressed, first released, first pressed again
    function testCorrectFirstUp() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
            assert.ok(tmpIncl1 < 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 > 0, "up key released, inclination reseted and inclination to the bottom");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
                assert.equal(deviceEmulator._firstKeyDown.DOWN, true, "up pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
                testCorrectFirstUpAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown alternative Up test: both keys pressed, first released, first pressed again
    function testCorrectFirstUpAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
            assert.ok(tmpIncl1 < 0, "alternative up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "alternative up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 > 0, "alternative up key released, inclination reseted and inclination to the bottom");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.UP});
                assert.equal(deviceEmulator._firstKeyDown.DOWN, true, "alternative up pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
                testCorrectFirstDown();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.UP});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown Down test: both keys pressed, first released, first pressed again
    function testCorrectFirstDown() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
            assert.ok(tmpIncl1 > 0, "up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 < 0, "down key released, inclination reseted and inclination to the bottom");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
                assert.equal(deviceEmulator._firstKeyDown.UP, true, "down pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
                deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
                testCorrectFirstDownAlt();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
        setTimeout(validateFirstKeyDown, 1000);
    }
    //FirstKeyDown alternative Down test: both keys pressed, first released, first pressed again
    function testCorrectFirstDownAlt() {
        var validateFirstKeyDown = function () {
            var tmpIncl1 = deviceEmulator.inclinationY;
            deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.UP});
            assert.ok(tmpIncl1 > 0, "alternative up and down key pressed");
            var holdIncl = function () {
                var tmpIncl2 = deviceEmulator.inclinationY;
                assert.equal(tmpIncl1, tmpIncl2, "alternative up and down key hold inclination");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
                setTimeout(resetIncl, 200);
            }
            setTimeout(holdIncl, 200);
            var resetIncl = function () {
                var tmpIncl3 = deviceEmulator.inclinationY;
                assert.ok(tmpIncl3 < 0, "alternative down key released, inclination reseted and inclination to the bottom");
                setTimeout(pressFirstKeyAgain, 200);
            }
            var pressFirstKeyAgain = function () {
                deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
                assert.equal(deviceEmulator._firstKeyDown.UP, true, "alternative down pressed again: correct FirstKeyDown value");
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
                deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
                testInclinationMaxUp();
            }
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
        setTimeout(validateFirstKeyDown, 1000);
    }
    function testInclinationMaxUp() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationY;
            assert.equal(tmpMaxIncl, -deviceEmulator.degreeChangeMax, "Up: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.UP});
            testInclinationMaxUpAlt();
        }
        deviceEmulator.degreeChangeValue = 80;
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.UP});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testInclinationMaxUpAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationY;
            assert.equal(tmpMaxIncl, -deviceEmulator.degreeChangeMax, "Alternative Up: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.UP});
            testInclinationMaxDown();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.UP});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testInclinationMaxDown() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationY;
            assert.equal(tmpMaxIncl, deviceEmulator.degreeChangeMax, "Down: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.DOWN});
            testInclinationMaxDownAlt();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.DOWN});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testInclinationMaxDownAlt() {
        var waitForMaxInclination = function () {
            var tmpMaxIncl = deviceEmulator.inclinationY;
            assert.equal(tmpMaxIncl, deviceEmulator.degreeChangeMax, "Alternative Down: Max Inclination reached");
            deviceEmulator._keyUp({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
            testSpace();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._alternativeKeyCode.DOWN});
        setTimeout(waitForMaxInclination, 5000);
    }
    function testSpace() {
        var validateKeySpace = function () {
            assert.ok(deviceEmulator._keyPress.SPACE, "Space key pressed");
            deviceEmulator._keyUp({keyCode: deviceEmulator._keyCode.SPACE});
            assert.notOk(deviceEmulator._keyPress.SPACE, "Space Key released");
            testDisposed();
        }
        deviceEmulator._keyDown({keyCode: deviceEmulator._keyCode.SPACE});
        setTimeout(validateKeySpace, 5);
    }

    //dispose
    function testDisposed() {
        var testDispose = function () {
            deviceEmulator.dispose();
            assert.equal(deviceEmulator._disposed, true, "dispose");
            assert.notEqual(soundmanager._disposed, true, "sound manager not disposed during dispose");
            done();
        }
        setTimeout(testDispose, 5);
    }
});

