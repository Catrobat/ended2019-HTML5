/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
"use strict";

QUnit.module("ui/deviceEmulator.js");

QUnit.test("DeviceEmulator UI", function (assert) {

    var sm = new PocketCode.SoundManager();
    assert.throws(function () { var dev = new PocketCode.Device("sm"); }, Error, "ERROR: invalid cntr argument");
    var dev = new PocketCode.Device(sm);
    var dE = new PocketCode.DeviceEmulator(dev);

    assert.ok(false, "test");

});