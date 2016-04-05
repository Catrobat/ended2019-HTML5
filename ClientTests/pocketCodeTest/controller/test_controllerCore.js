/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/controller/controllerCore.js" />
'use strict';

QUnit.module("controllerCore.js");


QUnit.test("BaseController", function (assert) {

    var view = new PocketCode.Ui.I18nControl('div');    //any control derived from SmartJs.Ui.Control
    var ctl = new PocketCode.BaseController(view);
    assert.ok(ctl instanceof PocketCode.BaseController, "instance check");

    assert.throws(function () { var test = new PocketCode.BaseController('!!'); }, Error, "ERROR: invalid view");

    assert.equal(ctl._view, view, "view set");

    ctl.hideView();
    assert.ok(view.hidden, "hide method test");
    ctl.showView();
    assert.ok(!view.hidden, "show method test");
});


QUnit.test("PageController", function (assert) {

    assert.ok(true, "TODO:");
    //var view = new PocketCode.Ui.I18nControl('div');    //any control derived from SmartJs.Ui.Control
    //var ctl = new PocketCode.BaseController(view);
    //assert.ok(ctl instanceof PocketCode.CoreController, "instance check");

    //assert.throws(function () { var test = new PocketCode.BaseController('!!'); }, Error, "ERROR: invalid view");

    //assert.equal(ctl._view, view, "view set");

    //ctl.hideView();
    //assert.ok(view.hidden, "hide method test");
    //ctl.showView();
    //assert.ok(!view.hidden, "show method test");
});


