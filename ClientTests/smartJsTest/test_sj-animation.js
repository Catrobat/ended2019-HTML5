/// <reference path="../qunit/qunit-1.16.0.js" />
/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
/// <reference path="../../Client/smartJs/sj-animation.js" />
'use strict';

QUnit.module("sj-animation.js");

QUnit.test("SmartJs.Animation.Animation", function (assert) {

    var a = new SmartJs.Animation.Animation(10, 20, 1000, SmartJs.Animation.Type.LINEAR);
    assert.ok(a instanceof SmartJs.Animation.Animation, "instance check");

    assert.ok(true, "TODO");



});

QUnit.test("SmartJs.Animation.Animation2D", function (assert) {

    var a = new SmartJs.Animation.Animation2D({ x: 10, y: 10 }, { x: 20, y: 20 }, 1000, SmartJs.Animation.Type.LINEAR2D);
    assert.ok(a instanceof SmartJs.Animation.Animation && a instanceof SmartJs.Animation.Animation2D, "instance check");

    assert.ok(true, "TODO");



});

