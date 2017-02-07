/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/ui/dialog.js" />
'use strict';

QUnit.module("ui/dialog.js");


QUnit.test("Dialog (Base Class)", function (assert) {
    var d = new PocketCode.Ui.Dialog(PocketCode.Ui.DialogType.WARNING, "not found");
    assert.ok(d instanceof PocketCode.Ui.Dialog, "Dialog: instance check");
    assert.equal(d.type, PocketCode.Ui.DialogType.WARNING, "type: getter + ctr");
    assert.equal(d.i18nCaptionKey, "[not found]", "caption getter + ctr");

    d.type = PocketCode.Ui.DialogType.DEFAULT;
    d.type = PocketCode.Ui.DialogType.ERROR;
    assert.equal(d.type, PocketCode.Ui.DialogType.ERROR, "type: getter + setter");
    assert.throws(function () { d.type = "invalid"; }, Error, "ERROR: invalid type");

    d.i18nCaptionKey = "new";
    assert.equal(d.i18nCaptionKey, "[new]", "caption getter + setter");
    assert.throws(function () { d.i18nCaptionKey = { id: 12 }; }, Error, "ERROR: caption not string");

    //d.bodyInnerHTML = "<p>html</p>";
    //assert.equal(d.bodyInnerHTML, "<p>html</p>", "inner html getter + setter");

    var btn1 = new PocketCode.Ui.Button();
    var btn2 = new PocketCode.Ui.Button();
    var btn3 = new PocketCode.Ui.Button();
    assert.throws(function () { d.addButton(""); }, Error, "ERROR: invalid button control");
    d.addButton(btn1);
    d.addButton(btn2);
    assert.throws(function () { d.addButton(btn3); }, Error, "ERROR: more than 2 buttons");

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


QUnit.test("Dialog: Ask", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);    //this should trigger a resize- code coverage

    var d = new PocketCode.Ui.AskDialog();
    assert.ok(d instanceof PocketCode.Ui.AskDialog && d instanceof PocketCode.Ui.Dialog, "AskDialog: instance check");
    assert.ok(d.onSubmit instanceof SmartJs.Event.Event, "AskDialog: events");

    container.appendChild(d);   //for access tests only

    d._answerInput.dom.value = "test";
    assert.equal(d.answer, "test", "answer getter");

    var submitted = 0;
    var submitHandler = function (e) {
        submitted++;
        assert.equal(e.answer, "test", "event argument check: answer");
    };
    d.onSubmit.addEventListener(new SmartJs.Event.EventListener(submitHandler));
    d._btnSubmit._dom.click();   //simulate button click
    assert.equal(submitted, 1, "dialog submitted once");

    var input = d._answerInput;
    assert.notEqual(document.activeElement.id, input.id, "not focused on create");
    d.focusInputField();
    assert.equal(document.activeElement.id, input.id, "set focused");

});


QUnit.test("Dialog: error", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);    //this should trigger a resize- code coverage

    var d = new PocketCode.Ui.ErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ErrorDialog, "ErrorDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "ErrorDialog: events");

    container.appendChild(d);   //for access tests only
    d.logMsgVisible = false;
    d.closeMsgVisible = false;

    //check for innerText: innerHTML will increase due to css visibilit=hidden
    var length = dom.innerText.length;
    d.logMsgVisible = true;
    assert.ok(dom.innerText.length > length, "show log message");
    d.logMsgVisible = false;
    assert.equal(dom.innerText.length, length, "hide log message");

    var _dom = dom.innerText;
    d.closeMsgVisible = true;
    assert.ok(dom.innerText.length > length, "show close message");
    d.closeMsgVisible = false;
    assert.equal(dom.innerText.length, length, "hide close message");

});

QUnit.test("Dialog: ProjectLoadingAlert", function (assert) {

    var d = new PocketCode.Ui.ProjectLoadingAlertDialog(['aTestKey']);
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ProjectLoadingAlertDialog, "ProjectLoadingAlertDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onContinue instanceof SmartJs.Event.Event, "ProjectLoadingAlertDialog: events");
    assert.equal(d.onContinue.target, d, "event target check: needed for dispose on continue");

    assert.equal(d.type, PocketCode.Ui.DialogType.DEFAULT, "type set correctly: default");

    assert.throws(function () { d = new PocketCode.Ui.ProjectLoadingAlertDialog(); }, Error, "empty ctr args: alerts");
    assert.throws(function () { d = new PocketCode.Ui.ProjectLoadingAlertDialog([], 'x'); }, Error, "invalid ctr args: warnings");

    d = new PocketCode.Ui.ProjectLoadingAlertDialog([], ['aTestKey']);
    d = new PocketCode.Ui.ProjectLoadingAlertDialog(['aTestKey'], ['aTestKey']);
    assert.equal(d.type, PocketCode.Ui.DialogType.WARNING, "type set correctly: warning");

});

QUnit.test("Dialog: Screenshot", function (assert) {

    var d = new PocketCode.Ui.ScreenshotDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ScreenshotDialog, "ScreenshotDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onDownload instanceof SmartJs.Event.Event, "ScreenshotDialog: events");

    d.imageSrc = "https://share.catrob.at/images/logo/logo_text.png";
    assert.equal(d._screenshotImage.src, "https://share.catrob.at/images/logo/logo_text.png", "img source setter");

    assert.ok(typeof d.download == 'function', "download method available");
    //d.download(); //cannot be testet as a post will lead to a reload or redirect

});

QUnit.test("Dialogs: (various)", function (assert) {

    var d = new PocketCode.Ui.GlobalErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.ErrorDialog && d instanceof PocketCode.Ui.GlobalErrorDialog, "GlobalErrorDialog: instance check");
    assert.ok(d.onOK instanceof SmartJs.Event.Event, "GlobalErrorDialog: events");


    d = new PocketCode.Ui.BrowserNotSupportedDialog();
    assert.ok(d instanceof PocketCode.Ui.ErrorDialog && d instanceof PocketCode.Ui.BrowserNotSupportedDialog, "BrowserNotSupportedDialog: instance check");
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
    assert.ok(d instanceof PocketCode.Ui.ErrorDialog && d instanceof PocketCode.Ui.ProjectNotFoundDialog, "ProjectNotFoundDialog: instance check");
    //assert.ok(d.onOK instanceof SmartJs.Event.Event, "ProjectNotFoundDialog: events");


    d = new PocketCode.Ui.ProjectNotValidDialog();
    assert.ok(d instanceof PocketCode.Ui.ErrorDialog && d instanceof PocketCode.Ui.ProjectNotValidDialog, "ProjectNotValidDialog: instance check");
    //assert.ok(d.onOK instanceof SmartJs.Event.Event, "ProjectNotValidDialog: events");


    d = new PocketCode.Ui.ParserErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.ErrorDialog && d instanceof PocketCode.Ui.ParserErrorDialog, "ParserErrorDialog: instance check");
    //assert.ok(d.onOK instanceof SmartJs.Event.Event, "ParserErrorDialog: events");


    d = new PocketCode.Ui.InternalServerErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.ErrorDialog && d instanceof PocketCode.Ui.InternalServerErrorDialog, "InternalServerErrorDialog: instance check");
    //assert.ok(d.onOK instanceof SmartJs.Event.Event, "InternalServerErrorDialog: events");


    d = new PocketCode.Ui.ServerConnectionErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ServerConnectionErrorDialog, "ServerConnectionErrorDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onRetry instanceof SmartJs.Event.Event, "ServerConnectionErrorDialog: events");


    d = new PocketCode.Ui.ProjectLoadingErrorDialog();
    assert.ok(d instanceof PocketCode.Ui.Dialog && d instanceof PocketCode.Ui.ProjectLoadingErrorDialog, "ProjectLoadingErrorDialog: instance check");
    assert.ok(d.onCancel instanceof SmartJs.Event.Event && d.onRetry instanceof SmartJs.Event.Event, "ProjectLoadingErrorDialog: events");

});

