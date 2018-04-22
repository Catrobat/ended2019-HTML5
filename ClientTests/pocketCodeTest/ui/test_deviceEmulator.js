/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/ui/deviceEmulator.js" />
"use strict";

QUnit.module("ui/deviceEmulator.js");


QUnit.test("DeviceEmulator UI: Expander tests", function (assert) {

    var device = new PocketCode.DeviceEmulator();
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);

    var expanderBody = deviceEmulator._container.__container;

    //instance check
    assert.ok(deviceEmulator instanceof PocketCode.Ui.DeviceEmulator && deviceEmulator instanceof SmartJs.Ui.Control, "instance check");

    //open & close check
    assert.equal(expanderBody.className, "pc-expanderBody", "DeviceEmulator closed by default");
    deviceEmulator._container._onChangeHandler({checked: true});
    assert.equal(expanderBody.className, "pc-expanderBody pc-bodyVisible", "DeviceEmulator opened by click");
    deviceEmulator._container._onChangeHandler({checked: false});
    assert.equal(expanderBody.className, "pc-expanderBody", "DeviceEmulator closed by click");

    //Resize change test
    var dom = document.getElementById("qunit-fixture");
    dom.appendChild(deviceEmulator.dom);

    deviceEmulator.dispose();
    assert.ok(deviceEmulator._disposed, "deviceEmulator disposed");
});


QUnit.test("DeviceEmulator UI: Slider tests", function (assert) {

    var device = new PocketCode.DeviceEmulator();
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);
    var accSlider = deviceEmulator._accSlider;
    var maxDegreeSlider = deviceEmulator._maxSlider;
    //var flashSlider = deviceEmulator._flashSlider;

    //instance Checks for sliders
    assert.ok(accSlider instanceof PocketCode.Ui.Slider, "Acceleration slider instance check");
    assert.ok(maxDegreeSlider instanceof PocketCode.Ui.Slider, "Degree slider instance check");

   //accSlider event check
    assert.ok(accSlider.onChange instanceof SmartJs.Event.Event, "Acceleration slider: event accessor check");
    //maxSlider event check
    assert.ok(maxDegreeSlider.onChange instanceof SmartJs.Event.Event, "Degree slider: event accessor check");

    //check for change event for Degree slider

    assert.equal(maxDegreeSlider.value, 65, "onChange Event not triggered: no Degree change");
    deviceEmulator._maxDegreeChangeHandler({value: 45});

    assert.equal(deviceEmulator._device.inclinationMinMax, 45, "onChange Event triggered: Degree Slider change");

    //check of change event for Acceleration slider
    assert.equal(accSlider.value, 46, "onChange Event not triggered: no Acceleration change");
    deviceEmulator._maxAccChangeHandler({value: 10});

    assert.equal(deviceEmulator._device.inclinationChangePerSec, 10, "onChange Event triggered: Acceleration Slider change");
});


QUnit.test("DeviceEmulator UI: image Transformation tests", function (assert) {

    var device = new PocketCode.DeviceEmulator();
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);

    //imgTransformation test
    var done = assert.async();

    var validateSingleKeyLeft = function () {
        deviceEmulator._updateImageTransformation();
        assert.ok(deviceEmulator._device._keyDownDateTime, "image Transformation: key pressed");
        deviceEmulator._device._keyUp({keyCode: device._keyCode.LEFT});
        deviceEmulator._updateImageTransformation();
        assert.equal(deviceEmulator._device.inclinationX, 0, "reset image Transformation: key released");
        done();
    }
    deviceEmulator._device._keyDown({keyCode: device._keyCode.LEFT});
    setTimeout(validateSingleKeyLeft, 20);

});
