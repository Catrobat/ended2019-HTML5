/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/player/scripts/playerApplication.js" />
'use strict';

QUnit.module("scripts/playerApplication.js");


QUnit.test("Application", function (assert) {

    var ctrl = new PocketCode.Player.Application();
    assert.ok(false, "TODO");

    //_buttonClickedHandler
    //controller._view.executionState = 1;
    //param = { command: PocketCode.Ui.PlayerBtnCommand.PAUSE };
    //controller._buttonClickedHandler(param);
    //assert.ok(controller._view.executionState == 3, "_buttonClickedHandler PAUSE: playerPageView executionState: paused");

    //controller._view.executionState = 1;
    //var oldId = controller._screenshotDialog.id;
    //param = { command: PocketCode.Ui.PlayerBtnCommand.SCREENSHOT };
    //controller._buttonClickedHandler(param);
    //assert.ok(controller._view.executionState == 3, "_buttonClickedHandler SCREENSHOT: playerPageView executionState: paused");
    //assert.ok(controller._screenshotDialog.id != oldId, "_buttonClickedHandler: new screenshotDialog");

    //param = { command: PocketCode.Ui.PlayerBtnCommand.AXES };
    //controller._buttonClickedHandler(param);
    //assert.ok(controller._playerViewportController._view._axesVisible == true &&
    //    controller._view._toolbar._axesButton.checked == true &&
    //    controller._axesVisible == true, "_buttonClickedHandler: show axes");
    //controller._buttonClickedHandler(param);
    //assert.ok(controller._playerViewportController._view._axesVisible == false &&
    //    controller._view._toolbar._axesButton.checked == false &&
    //    controller._axesVisible == false, "_buttonClickedHandler: hide axes");

    //_menuActionHandler
    //param = { command: PocketCode.Player.MenuCommand.FULLSCREEN, checked: true };
    //controller._menuActionHandler(param);
    //assert.ok(controller._playerViewportController._zoomToFit == true, "_menuActionHandler FULLSCREEN, zoomToFit = true");

    //var languageChangeHandler = function (e) {
    //    assert.equal(e.language, "en", "_menuActionHandler LANGUAGE_CHANGE, language changed");
    //    done2();
    //};
    //param = { command: PocketCode.Player.MenuCommand.LANGUAGE_CHANGE, languageCode: "en-GB" };
    //controller._menuActionHandler(param);
    //PocketCode.I18nProvider.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(languageChangeHandler, this));


});

