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

    var soundmanager = new PocketCode.SoundManager();
    var device = new PocketCode.DeviceEmulator(soundmanager);
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);

    //instance check
    assert.ok(deviceEmulator instanceof PocketCode.Ui.DeviceEmulator && deviceEmulator instanceof SmartJs.Ui.Control, "instance check");

    assert.notOk(deviceEmulator._container.hidden, "DeviceEmulator is opened by default");
    deviceEmulator.close();
    assert.ok(deviceEmulator._container.hidden, "DeviceEmulator closed by method call");
    deviceEmulator._openCloseHandler();
    assert.notOk(deviceEmulator._container.hidden, "DeviceEmulator opened by click");
    deviceEmulator._openCloseHandler();
    assert.ok(deviceEmulator._container.hidden, "DeviceEmulator closed by click");

    //Resize change test
    var dom = document.getElementById("qunit-fixture");
    dom.appendChild(deviceEmulator._dom);
    //assert.ok(false, "TODO");

    deviceEmulator.dispose();
    assert.ok(deviceEmulator._disposed, "deviceEmulator disposed");
});

QUnit.test("DeviceEmulator UI: Slider tests", function (assert) {

    var soundmanager = new PocketCode.SoundManager();
    var device = new PocketCode.DeviceEmulator(soundmanager);
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);
    var accSlider = deviceEmulator._accSlider;
    var maxDegreeSlider = deviceEmulator._maxSlider;

    /*console.log(deviceEmulator);
    console.log(deviceEmulator.device._inclinationLimits);
    console.log(deviceEmulator.device._inclinationIncr);
    console.log(accSlider);
    console.log(maxDegreeSlider);*/
    //instance Checks for sliders
    assert.ok(accSlider instanceof PocketCode.Ui.Slider, "Acceleration slider instance check");
    assert.ok(maxDegreeSlider instanceof PocketCode.Ui.Slider, "Degree slider instance check");
    //slider change events

    //accSlider event check
    assert.ok(accSlider.onChange instanceof SmartJs.Event.Event, "Acceleration slider: event accessor check");
    //maxSlider event check
    assert.ok(maxDegreeSlider.onChange instanceof SmartJs.Event.Event, "Degree slider: event accessor check");

    //check for change event for Degree slider
    assert.equal(maxDegreeSlider.value, 90, "onChange Event not triggered: no Degree change");
    //console.log(deviceEmulator.device._inclinationLimits);
    deviceEmulator._maxDegreeChangeHandler({target: {value: 45}});
    //console.log(deviceEmulator.device._inclinationLimits * (90 / 46));


    assert.notEqual(deviceEmulator.device._inclinationLimits * (90 / 46), 90, "onChange Event triggered: Degree Slider change");

    //check of change event for Acceleration slider
    assert.equal(accSlider.value, 5, "onChange Event not triggered: no Acceleration change");
    //console.log(deviceEmulator.device._inclinationIncr);
    deviceEmulator._maxAccChangeHandler({target: {value: 34}});
    //console.log(deviceEmulator.device._inclinationIncr * (5 / 8));

    assert.notEqual(deviceEmulator.device._inclinationIncr * (5 / 8), 5, "onChange Event triggered: Acceleration Slider change");

    assert.ok(false, "TODO slider");

    /*console.log(deviceEmulator);
    console.log(deviceEmulator.device._inclinationLimits);
    console.log(deviceEmulator.device._inclinationIncr);
    console.log(accSlider);
    console.log(maxDegreeSlider);*/
});

QUnit.test("DeviceEmulator UI: image Transformation tests", function (assert) {

    var soundmanager = new PocketCode.SoundManager();
    var device = new PocketCode.DeviceEmulator(soundmanager);
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);

    //imgTransformation test
    /*console.log(deviceEmulator._img);
    deviceEmulator._img._id = "sj69";
    console.log(deviceEmulator._img.id);
    console.log(deviceEmulator._childs[0]._childs[1]._childs[0]._childs[0]._childs[7]._childs[1].id);
    deviceEmulator._childs[0]._childs[1]._childs[0]._childs[0]._childs[7]._childs[1]._id = "sj73";
    console.log(deviceEmulator._childs[0]._childs[1]._childs[0]._childs[0]._childs[7]._childs[1].id);
    console.log(deviceEmulator._childs[0]._childs[1]._childs[0]._childs[0]._childs[8]._childs[1].id);
    deviceEmulator._childs[0]._childs[1]._childs[0]._childs[0]._childs[8]._childs[1]._id = "sj76";
    console.log(deviceEmulator._childs[0]._childs[1]._childs[0]._childs[0]._childs[8]._childs[1].id);
    */
    var done = assert.async();

    var validateSingleKeyLeft = function () {
        //deviceEmulator._imgTransformation();
        assert.ok(deviceEmulator.device._keyPress, "image Transformation: key pressed");
        deviceEmulator.device._keyUp({keyCode: device._keyCode.LEFT});
        //deviceEmulator._resetImgTransformation();
        assert.equal(deviceEmulator.device.inclinationX, 0, "Reset image Transformation: key released");
        done();
    }
    deviceEmulator.device._keyDown({keyCode: device._keyCode.LEFT});
    setTimeout(validateSingleKeyLeft, 20);

    assert.ok(false, "TODO image transformation");

});
