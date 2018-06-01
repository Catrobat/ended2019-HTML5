/// <reference path="../qunit/qunit-2.4.0.js" />
/// <reference path="../../Client/player/pocketCodeWeb.js" />
'use strict';

QUnit.module("player/pocketCodeWeb.js");
//IMPORTANT: most of the code is executed before the framework (all scripts) are loaded: make sure to adapt the tests to use default javascript only

QUnit.test("PocketCodePlayer: global properties", function (assert) {

    assert.ok(false, "TODO");
});

QUnit.test("PocketCodePlayer: PocketCode.Web.FullscreenApi", function (assert) {

    var ctrl = PocketCode.Web.FullscreenApi;    //not a construktor: static
    assert.ok(false, "TODO");
});

QUnit.test("PocketCodePlayer: PocketCode.Web.ExitButton", function (assert) {

    var ctrl = new PocketCode.Web.ExitButton();
    assert.ok(false, "TODO");
});

QUnit.test("PocketCodePlayer: PocketCode.Web.WebOverlay", function (assert) {

    var ctrl = new PocketCode.Web.WebOverlay();
    assert.ok(false, "TODO");
});

QUnit.test("PocketCodePlayer: PocketCode.Web.LoadingIndicator", function (assert) {

    var ctrl = new PocketCode.Web.LoadingIndicator();
    assert.ok(false, "TODO");
});

QUnit.test("PocketCodePlayer: PocketCode.Web.SplashScreen", function (assert) {

    var ctrl = new PocketCode.Web.SplashScreen();
    assert.ok(false, "TODO");
});

QUnit.test("PocketCodePlayer: PocketCode.Web.ResourceLoader", function (assert) {

    var ctrl = new PocketCode.Web.ResourceLoader(PocketCode.Web.resources);
    assert.ok(false, "TODO");
});

