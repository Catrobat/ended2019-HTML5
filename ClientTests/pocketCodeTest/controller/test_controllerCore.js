/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/controller/controllerCore.js" />
'use strict';

QUnit.module("controller/controllerCore.js");


QUnit.test("BaseController", function (assert) {

    var view = new PocketCode.Ui.I18nControl('div');    //any control derived from SmartJs.Ui.Control
    var ctl = new PocketCode.BaseController(view);
    assert.ok(ctl instanceof PocketCode.BaseController, "instance check");

    assert.throws(function () { var test = new PocketCode.BaseController('!!'); }, Error, "ERROR: invalid view");

    var view2 = ctl.view;
    assert.equal(view2, view, "view set");

    ctl.hideView();
    assert.ok(view.hidden, "hide method test");
    ctl.showView();
    assert.ok(!view.hidden, "show method test");
});


QUnit.test("PageController", function (assert) {

    var view = new PocketCode.Ui.PlayerPageView();
    var ctl = new PocketCode.PageController(view);
    assert.ok(ctl instanceof PocketCode.PageController, "instance check");

    assert.throws(function () { var test = new PocketCode.PageController('!!'); }, Error, "ERROR: invalid view");
    assert.ok(ctl._currentHistoryIdx === undefined && ctl._dialogs instanceof Array, "_currentHistoryIdx and _diaglos set correctly");

    //properties
    ctl.currentHistoryIdx = 2;
    assert.ok(ctl._currentHistoryIdx === 2, "currentHistoryIdx setter");
    assert.ok(ctl.hasOpenDialogs === false, "hasOpenDialogs getter (no dialogs included)");
    var dialog = new PocketCode.Ui.Dialog();
    var dialog2 = new PocketCode.Ui.Dialog();
    ctl._dialogs = [dialog, dialog2];
    assert.ok(ctl.hasOpenDialogs === true && ctl._dialogs.length === 2, "hasOpenDialogs getter (3 dialogs added)");

    //metohds
    ctl.loadViewState(0,1);
    assert.ok(ctl.hasOpenDialogs === true && ctl._dialogs.length === 1, "one dialog disposed");

    assert.throws(function () { ctl._showDialog(3); }, Error, "ERROR: invalid view");

    var dialog3 = new PocketCode.Ui.Dialog();
    var length_childs = ctl._view._container._childs.length;

    ctl._showDialog(dialog3);
    assert.ok(ctl._dialogs.length === 2, "add dialog at _showDialog");
    var lastElem = ctl._view._container._childs.length -1;
    assert.ok(ctl._view._container._childs.length === length_childs +1 && ctl._view._container._childs[lastElem] instanceof  PocketCode.Ui.Dialog, "appendChild in _showDialog");

   //execDialogDefaultOnEsc
    var dialog4 = new PocketCode.Ui.ScreenshotDialog();
    ctl._dialogs.push(dialog4);

    var onCancelCounter = 0;
    var cancelHandler = function () {
        onCancelCounter++;
        assert.ok(onCancelCounter == 1, "onCancelHandler called");
    };
    dialog4.onCancel.addEventListener(new SmartJs.Event.EventListener(cancelHandler, this));
    ctl.execDialogDefaultOnEsc();

    var dialog5 = new PocketCode.Ui.BrowserNotSupportedDialog();
    ctl._dialogs.push(dialog5);

    var onOkCounter = 0;
    var okHandler = function () {
        onOkCounter++;
        assert.ok(onOkCounter == 1, "onOkHandler called");
    };
    dialog5.onOK.addEventListener(new SmartJs.Event.EventListener(okHandler, this));
    ctl.execDialogDefaultOnEsc();

});


