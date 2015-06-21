/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

QUnit.module("device.js");


QUnit.test("[missing]", function (assert) {

    var sm = new PocketCode.SoundManager();
    var dev = new PocketCode.Device(sm);

    assert.ok(dev instanceof PocketCode.Device, "instance check");

    assert.ok(true, "TODO: (Armend)");

});

