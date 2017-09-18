/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/deviceFeature.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

QUnit.module("components/deviceFeature.js");


QUnit.test("DeviceFeature", function (assert) {

    var df = new PocketCode.DeviceFeature();

    assert.ok(false, "TODO");
});


QUnit.test("DeviceFeature: Camera", function (assert) {

    var df = new PocketCode.Camera();

    assert.ok(false, "TODO");
});


QUnit.test("DeviceFeature: Face Detection", function (assert) {

    var device = new PocketCode.MediaDevice();
    var df = new PocketCode.FaceDetection(device);

    assert.ok(false, "TODO");
});

