/// <reference path="../../../Client/pocketCode/scripts/ui/dialog.js" />
'use strict';

QUnit.module("dialog.js");


QUnit.test("Dialog (Base Class)", function (assert) {
    var d = new PocketCode.Ui.Dialog(PocketCode.Ui.DialogType.WARNING, "header");
    assert.ok(d instanceof PocketCode.Ui.Dialog, "Dialog: instance check");
    assert.equal(d.type, PocketCode.Ui.DialogType.WARNING, "type: getter + ctr");
    assert.equal(d.caption, "header", "caption getter + ctr");

    d.type = PocketCode.Ui.DialogType.DEFAULT;
    d.type = PocketCode.Ui.DialogType.ERROR;
    assert.equal(d.type, PocketCode.Ui.DialogType.ERROR, "type: getter + setter");
    assert.throws(function () { d.type = "invalid"; }, Error, "ERROR: invalid type");

    d.caption = "new";
    assert.equal(d.caption, "new", "caption getter + setter");
    assert.throws(function () { d.caption = {id: 12}; }, Error, "ERROR: caption not string");

    d.bodyInnerHTML = "<p>html</p>";
    assert.equal(d.bodyInnerHTML, "<p>html</p>", "inner html getter + setter");

    var btn1 = new PocketCode.Ui.Button();
    var btn2 = new PocketCode.Ui.Button();
    var btn3 = new PocketCode.Ui.Button();
    assert.throws(function () { d.addButton(""); }, Error, "ERROR: invalid button control");
    d.addButton(btn1);
    d.addButton(btn2);
    assert.throws(function () { d.addButton(btn3); }, Error, "ERRORO: more than 2 buttons");

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl();
    dom.appendChild(container._dom);

    container.appendChild(d);    //this should trigger a resize- code coverage
    //container.removeChild(d);
    d.dispose();    //removed on dispose

    d = new PocketCode.Ui.Dialog(PocketCode.Ui.DialogType.WARNING, "after dispose");
    d.execDefaultBtnAction();   //just to make sure no error is thrown

    //^^ create a new one to make sure dispose() does not have effects on prototype structure
    d.addButton(btn1);
    container.appendChild(d);
    d.dispose();    //removed on dispose

});

QUnit.test("Various Dialogs", function (assert) {

    var d = new PocketCode.Ui.GlobalErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.GlobalErrorDialog, "GlobalErrorDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "GlobalErrorDialog: events");

    d = new PocketCode.Ui.BrowserNotSupportedDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.BrowserNotSupportedDialog, "BrowserNotSupportedDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "BrowserNotSupportedDialog: events");

    var historyBackCounter = 0;
    var okHandler = function () {
        historyBackCounter++;
    };
    d.onOK.addEventListener(new SmartJs.Event.EventListener(okHandler, this));
    d.execDefaultBtnAction();
    assert.equal(historyBackCounter, 1, "button event dispatched: onOK");

    d = new PocketCode.Ui.MobileRestrictionDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.MobileRestrictionDialog, "MobileRestrictionDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onConfirm instanceof SmartJs.Event.Event, "MobileRestrictionDialog: events");

    historyBackCounter = 0;
    var cancelHandler = function () {
        historyBackCounter++;
    };
    d.onCancel.addEventListener(new SmartJs.Event.EventListener(cancelHandler, this));
    d.execDefaultBtnAction();
    assert.equal(historyBackCounter, 1, "button event dispatched: onCancel");

    d = new PocketCode.Ui.ExitWarningDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ExitWarningDialog, "ExitWarningDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onExit instanceof SmartJs.Event.Event, "ExitWarningDialog: events");

    historyBackCounter = 0;
    var exitHandler = function () {
        historyBackCounter++;
    };
    d.onCancel.addEventListener(new SmartJs.Event.EventListener(exitHandler, this));
    d.execDefaultBtnAction();
    assert.equal(historyBackCounter, 1, "button event dispatched: onExit");

    d = new PocketCode.Ui.ProjectNotFoundDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ProjectNotFoundDialog, "ProjectNotFoundDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "ProjectNotFoundDialog: events");

    d = new PocketCode.Ui.ProjectNotValidDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ProjectNotValidDialog, "ProjectNotValidDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "ProjectNotValidDialog: events");

    d = new PocketCode.Ui.ParserErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ParserErrorDialog, "ParserErrorDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "ParserErrorDialog: events");

    d = new PocketCode.Ui.InternalServerErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.InternalServerErrorDialog, "InternalServerErrorDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "InternalServerErrorDialog: events");

    d = new PocketCode.Ui.ServerConnectionErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ServerConnectionErrorDialog, "ServerConnectionErrorDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onRetry instanceof SmartJs.Event.Event, "ServerConnectionErrorDialog: events");

    d = new PocketCode.Ui.UnsupportedSoundFileDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.UnsupportedSoundFileDialog, "UnsupportedSoundFileDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onContinue instanceof SmartJs.Event.Event, "UnsupportedSoundFileDialog: events");
    
    d = new PocketCode.Ui.UnsupportedDeviceFeatureDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.UnsupportedDeviceFeatureDialog, "UnsupportedDeviceFeatureDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onContinue instanceof SmartJs.Event.Event, "UnsupportedDeviceFeatureDialog: events");

    d = new PocketCode.Ui.ScreenshotDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ScreenshotDialog, "ScreenshotDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onDownload instanceof SmartJs.Event.Event, "ScreenshotDialog: events");

});

