/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("view/playerPageView.js");


QUnit.test("PlayerPageView", function (assert) {

    //var done1 = assert.async();

    var PlayerPageView = new PocketCode.Ui.PlayerPageView();
    assert.ok(PlayerPageView instanceof SmartJs.Ui.ContainerControl, "instance check");
    assert.ok(PlayerPageView._footer.hidden == true, "footer hidden");
    assert.ok(PlayerPageView._header.hidden == true, "header hidden");
    assert.ok(PlayerPageView.__container._childs[0] instanceof PocketCode.Ui.PlayerToolbar &&
        PlayerPageView.__container._childs[1] instanceof PocketCode.Ui.PlayerStartScreen, "add toolbar and startScreen to childs");
    assert.ok(PlayerPageView._onExit instanceof SmartJs.Event.Event, "add onExit Event");
    assert.ok(PlayerPageView._startScreen.hidden == true, "startScreen hidden");

    // ********************* properties *********************

    //menu
    var menu = PlayerPageView.menu;
    assert.equal(menu,  PlayerPageView._menu, "menu getter");

    //executionState
    PlayerPageView.executionState = 1;
    assert.ok(PlayerPageView._toolbar._startButton.hidden == true &&
        PlayerPageView._toolbar._pauseButton.hidden == false &&
        PlayerPageView._toolbar._executionState == 1, "set executionstate");

    var executionState = PlayerPageView.executionState;
    assert.equal(PlayerPageView._toolbar.executionState, executionState, "get executionstate");

    //disabled
    assert.ok(PlayerPageView._toolbar._backButton.disabled == true &&
        PlayerPageView._toolbar._restartButton.disabled == true &&
        PlayerPageView._toolbar._screenshotButton.disabled == true &&
        PlayerPageView._toolbar._axesButton.disabled == true &&
        PlayerPageView._startScreen._startButton.disabled == true, "disabled");

    PlayerPageView.disabled = false;
    assert.ok(PlayerPageView._toolbar._backButton.disabled == false &&
        PlayerPageView._toolbar._restartButton.disabled == false &&
        PlayerPageView._startScreen._startButton.disabled == false, "disabled 2");

    //axesButtonChecked
    PlayerPageView.axesButtonChecked = true;
    assert.ok(PlayerPageView._toolbar._axesButton.checked == true, "axesButtonChecked");
    PlayerPageView.axesButtonChecked = false;
    assert.ok(PlayerPageView._toolbar._axesButton.checked == false, "axesButtonChecked 2");

    //axesButtonDisabled
    PlayerPageView.axesButtonDisabled = false;
    assert.ok(PlayerPageView._toolbar._axesButtonDisabled == false &&
        PlayerPageView._toolbar._axesButton.disabled == false, "axesButtonDisabled");
    PlayerPageView.axesButtonDisabled = true;
    assert.ok(PlayerPageView._toolbar._axesButtonDisabled == true &&
        PlayerPageView._toolbar._axesButton.disabled == true, "axesButtonDisabled 2");

    //backButtonDisabled
    PlayerPageView.backButtonDisabled = true;
    assert.ok(PlayerPageView._toolbar._backButtonDisabled == true &&
        PlayerPageView._toolbar._backButton.disabled == true, "backButtonDisabled");
    PlayerPageView.backButtonDisabled = false;
    assert.ok(PlayerPageView._toolbar._backButtonDisabled == false &&
        PlayerPageView._toolbar._backButton.disabled == false, "backButtonDisabled 2");

    //screenshotButtonDisabled
    PlayerPageView.screenshotButtonDisabled = false;
    assert.ok(PlayerPageView._toolbar._screenshotButtonDisabled == false &&
        PlayerPageView._toolbar._screenshotButton.disabled == false, "screenshotButtonDisabled");
    PlayerPageView.screenshotButtonDisabled = true;
    assert.ok(PlayerPageView._toolbar._screenshotButtonDisabled == true &&
        PlayerPageView._toolbar._screenshotButton.disabled == true, "screenshotButtonDisabled 2");

    // ********************* events *********************

    assert.ok(PlayerPageView.onToolbarButtonClicked instanceof SmartJs.Event.Event, "onToolbarButtonClicked getter");
    assert.ok(PlayerPageView.onMenuAction instanceof SmartJs.Event.Event, "onMenuAction getter");
    assert.ok(PlayerPageView.onMenuOpen instanceof SmartJs.Event.Event, "onMenuOpen getter");
    assert.ok(PlayerPageView.onStartClicked instanceof SmartJs.Event.Event, "onStartClicked getter");
    assert.ok(PlayerPageView.onExitClicked instanceof SmartJs.Event.Event, "onExitClicked getter");

    // ********************* methods *********************

    //showStartScreen
    PlayerPageView.showStartScreen("title1", "null");
    assert.ok(PlayerPageView._startScreen.title == "title1" &&
        PlayerPageView._startScreen._previewImage.src == "https://share.catrob.at/images/default/screenshot.png" ||
        PlayerPageView._startScreen._previewImage.src == "https://web-test.catrob.at/images/default/screenshot.png", "title and previewImage set");
    assert.ok(PlayerPageView._startScreen.hidden == false, "not hidden after calling show()");

    //hideStartScreen
    PlayerPageView.hideStartScreen();
    assert.ok(PlayerPageView._startScreen.hidden == true, "startScreen hidden");
    assert.ok(PlayerPageView._startScreen._dom.style.display == "none", "display == 'none'");
    assert.ok(PlayerPageView._header.hidden == true, "header hidden");

    //setLoadingProgress
    PlayerPageView.setLoadingProgress(10.0);
    assert.ok(PlayerPageView._startScreen._progressBar.progressBar.style.width == "10%", "setLoadingProgress: width set to 10%");

    //closeMenu
    PlayerPageView.closeMenu();
    assert.ok(PlayerPageView._menu._subMenu._dom.style.display == "none", "close menu, submenu display: none");
});
