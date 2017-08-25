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

    //instance check
    assert.ok(deviceEmulator instanceof PocketCode.Ui.DeviceEmulator && deviceEmulator instanceof SmartJs.Ui.Control, "instance check");


    //closed menu check
    assert.ok(deviceEmulator.hidden, "DeviceEmulator is closed");

    //open menu check
    //deviceEmulator._openCloseHandler();
    //assert.ok(!deviceEmulator.hidden, "DeviceEmulator is open");

    //slider change events
    var changeCount = 0;
    var changeEvents = function (e) {
        changeCount++;
    };

    deviceEmulator._accSlider.onChange.addEventListener(new SmartJs.Event.EventListener(changeEvents, this));
    deviceEmulator._maxSlider.onChange.addEventListener(new SmartJs.Event.EventListener(changeEvents, this));
    var e = { value: 34 };

    //check of change event for Acceleration slider
    assert.equal(changeCount, 0, "onChange Event not triggered: no Acceleration change");
    deviceEmulator._maxAccChangeHandler(e);
    assert.equal(changeCount, 1, "onChange Event triggered: Acceleration Slider change");

    //check for change event for Degree slider
    changeCount = 0;
    assert.equal(changeCount, 0, "onChange Event not triggered: no Degree change");
    deviceEmulator._maxDegreeChangeHandler(e);

    assert.equal(changeCount, 1, "onChange Event triggered: Degree Slider change");

    //imgTransformation test

    assert.ok(false, "test");

});