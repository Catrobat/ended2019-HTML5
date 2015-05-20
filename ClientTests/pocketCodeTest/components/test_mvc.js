/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("mvc.js");


QUnit.test("CoreView", function (assert) {

    var view = new PocketCode.Mvc.CoreView();
    assert.ok(view instanceof PocketCode.Mvc.CoreView, "instance check");
    assert.ok(view instanceof SmartJs.Ui.Control, "inheritance check");

    assert.ok(view.onHide instanceof SmartJs.Event.Event, "event accessor");

    var hidden = false;
    var onHideHandler = function (e) {
        hidden = true;
    };
    view.onHide.addEventListener(new SmartJs.Event.EventListener(onHideHandler, this));
    view.hide();
    assert.ok(hidden, "hide event dispatched");
});



QUnit.test("CoreController", function (assert) {

    var view = new PocketCode.Mvc.CoreView();
    var ctl = new PocketCode.Mvc.CoreController(view);
    assert.ok(ctl instanceof PocketCode.Mvc.CoreController, "instance check");

    assert.equal(ctl._view, view, "view set");

    ctl.hideView();
    assert.ok(view.hidden, "hide method test");
    ctl.showView();
    assert.ok(!view.hidden, "show method test");
});


