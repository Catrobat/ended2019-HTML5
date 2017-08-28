/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
"use strict";

QUnit.module("ui/deviceEmulator.js");

QUnit.test("DeviceEmulator UI", function (assert) {

    var soundmanager = new PocketCode.SoundManager();
    var device = new PocketCode.DeviceEmulator(soundmanager);
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);
    var accSlider = deviceEmulator._accSlider;
    var maxSlider = deviceEmulator._maxSlider;

    //instance check
    assert.ok(deviceEmulator instanceof PocketCode.Ui.DeviceEmulator && deviceEmulator instanceof SmartJs.Ui.Control, "instance check");

    //closed deviceEmulator menu check
    assert.ok(deviceEmulator.hidden, "DeviceEmulator is closed by default");

    console.log(deviceEmulator);
    //opened deviceEmulator menu check
    //deviceEmulator._openCloseHandler();
    //assert.notOk(deviceEmulator.hidden, "DeviceEmulator opened by click");
    //deviceEmulator._openCloseHandler();
    //assert.ok(deviceEmulator.hidden, "DeviceEmulator closed by click");
    //deviceEmulator._openCloseHandler();
    //deviceEmulator.close()
    //assert.ok(deviceEmulator.hidden, "DeviceEmulator closed by method call");

    //slider change events
    //accSlider event check
    assert.ok(accSlider.onChange instanceof SmartJs.Event.Event, "accSlider: event accessor");
    //maxSlider event check
    assert.ok(maxSlider.onChange instanceof SmartJs.Event.Event, "maxSlider: event accessor");


    //check for change event for Degree slider
    assert.equal(maxSlider.value, 90, "onChange Event not triggered: no Degree change");

    deviceEmulator._maxDegreeChangeHandler({target: {value: 20}});

    assert.notEqual(maxSlider.value, 90, "onChange Event triggered: Degree Slider change");

    //check of change event for Acceleration slider
    assert.equal(accSlider.value, 5, "onChange Event not triggered: no Acceleration change");

    deviceEmulator._maxAccChangeHandler({target: {value: 34}});

    assert.notEqual(accSlider.value, 5, "onChange Event triggered: Acceleration Slider change");



    //imgTransformation test
    var done = assert.async();

    var validateSingleKeyLeft = function () {
        assert.ok(device.inclinationX < 0, "image Transformation: key pressed");
        device._keyUp({keyCode: device._keyCode.LEFT});
        assert.equal(device.inclinationX, 0, "No image Transformation: key released");
        done();
    }
    //deviceEmulator._imgTransformation();
    setTimeout(validateSingleKeyLeft, 20);

    assert.ok(false, "TODO");

});
