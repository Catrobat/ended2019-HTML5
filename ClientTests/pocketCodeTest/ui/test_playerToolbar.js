/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/core.js" />
/// <reference path="../../../Client/pocketCode/scripts/ui/playerToolbar.js" />
'use strict';

QUnit.module("ui/playerToolbar.js");


QUnit.test("PlayerToolbar", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);    //this should trigger a resize- code coverage

    assert.throws(function () { new PocketCode.Ui.PlayerToolbar(); }, Error, "ERROR: invalaid ctr call");
    var tb = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.DESKTOP);
    assert.ok(tb instanceof PocketCode.Ui.PlayerToolbar && tb instanceof SmartJs.Ui.Control, "instance created correctly");
    assert.ok(tb.onButtonClicked instanceof SmartJs.Event.Event, "event accessor check: onButtonClicked");
    tb.dispose();
    assert.equal(tb._disposed, true, "disposed incl. inheritance");

    tb = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS);
    tb.executionState = PocketCode.ExecutionState.ERROR;    //TODO
    tb.executionState = PocketCode.ExecutionState.RUNNING;
    tb.executionState = PocketCode.ExecutionState.PAUSED;

    tb.executionState = PocketCode.ExecutionState.INITIALIZED;
    tb.executionState = PocketCode.ExecutionState.RUNNING;
    assert.equal(tb.executionState, PocketCode.ExecutionState.RUNNING, "execution state: getter");

    assert.throws(function () { tb.disabled = "invalid"; }, Error, "ERROR: invalaid argument: disabled");
    tb.disabled = true;
    tb.disabled = false;
    tb.backButtonDisabled = true;   //TODO: check this
    tb.screenshotButtonDisabled = true;
    tb.axesButtonDisabled = true;
    tb.disabled = true;
    tb.disabled = false;

    assert.throws(function () { tb.axesButtonChecked = "invalid"; }, Error, "ERROR: invalaid argument: axesButtonChecked");
    tb.axesButtonChecked = true;
    tb.axesButtonChecked = false;

    assert.throws(function () { tb.axesButtonDisabled = "invalid"; }, Error, "ERROR: invalaid argument: axesButtonDisabled");
    tb.axesButtonDisabled = true;
    tb.axesButtonDisabled = false;

    assert.throws(function () { tb.backButtonDisabled = "invalid"; }, Error, "ERROR: invalaid argument: backButtonDisabled");
    tb.backButtonDisabled = true;
    tb.backButtonDisabled = false;

    assert.throws(function () { tb.screenshotButtonDisabled = "invalid"; }, Error, "ERROR: invalaid argument: screenshotButtonDisabled");
    tb.screenshotButtonDisabled = true;
    tb.screenshotButtonDisabled = false;

    container.appendChild(tb);

});



