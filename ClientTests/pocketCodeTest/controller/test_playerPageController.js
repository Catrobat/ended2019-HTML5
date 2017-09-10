/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("controller/playerPageController.js");


QUnit.test("PlayerPageController", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();


    var controller = new PocketCode.PlayerPageController();
    var gameEngine = new PocketCode.GameEngine();

    assert.ok(controller instanceof PocketCode.PlayerPageController, "Instance check");
    assert.ok(controller._playerViewportController instanceof PocketCode.PlayerViewportController, "Instance check playerViewPortController");
    assert.ok(controller._axesVisible == false && controller._playerViewportController._projectScreenHeight == 320 && controller._playerViewportController._projectScreenWidth == 200, "_axesVisible, _projectScreenHeight, _projectScreenWitdh set");

    // ********************* properties *********************
    var menu = controller.menu;
    assert.equal(menu, controller._view._menu, "menu getter");

    controller._view._startScreen = new PocketCode.Ui.PlayerStartScreen();
    var json = { title: "json1", thumbnailUrl: "null", baseUrl: "" };
    controller.projectDetails = json;
    assert.ok(controller._view._startScreen.title == "json1" && controller._view._startScreen._previewImage.src == "https://share.catrob.at/images/default/screenshot.png", "projectDetails")

    assert.throws(function () { controller.project = 0; }, Error, "Set gameEngine not instanceof PocketCode.GameEngine");
    controller.project = gameEngine;
    assert.equal(gameEngine, controller._gameEngine, "gameEngine set");
    controller.project = gameEngine;
    assert.equal(gameEngine, controller._gameEngine, "gameEngine not changed");
    var gameEngine2 = new PocketCode.GameEngine();
    controller.project = gameEngine2;
    assert.equal(gameEngine2, controller._gameEngine, "gameEngine set 2");


    // ********************* methods *********************

    var soundManager = new PocketCode.SoundManager();
    var scene = new PocketCode.Model.Scene(gameEngine2, undefined, soundManager, []);
    scene._id = "1";
    gameEngine2._scenes = ({ "1": scene });
    gameEngine2._currentScene = scene;

    var dialog = new PocketCode.Ui.Dialog();
    var dialog2 = new PocketCode.Ui.Dialog();
    controller._dialogs = [dialog, dialog2];
    controller._gameEngine._executionState = 1;
    controller._gameEngine._currentScene._executionState = 1;

    //loadViewState
    controller.loadViewState(3, 1);
    assert.ok(controller._dialogs.length == 1, "loadViewState: one dialog disposed");
    assert.ok(scene._executionState == 3, "loadViewState: scene executionstate: paused");
    assert.ok(controller._view.executionState == 3, "loadViewState: playerPageView executionstate: paused");

    controller.loadViewState(1, 1);
    assert.ok(scene._executionState == 0, "loadViewState: scene executionstate: stopped");
    assert.ok(controller._view.executionState == 1, "loadViewState: playerPageView executionstate: 1");

    //enableView
    controller._view._toolbar._backButtonDisabled = false;
    controller._view._toolbar._screenshotButtonDisabled = false;
    controller.enableView();
    assert.ok(controller._view._toolbar._backButton.disabled == false &&
        controller._view._toolbar._restartButton.disabled == false &&
        controller._view._toolbar._screenshotButton.disabled == false &&
        controller._view._startScreen._startButton.disabled == false &&
        controller._view._startScreen._previewImage.className == "", "enableView");

    //actionOnGlobalError
    controller._view._toolbar._backButtonDisabled = true;
    controller._view._toolbar._screenshotButtonDisabled = true;
    controller.actionOnGlobalError();
    assert.ok(controller._view._toolbar._backButton.disabled == true &&
        controller._view._toolbar._restartButton.disabled == true &&
        controller._view._toolbar._screenshotButton.disabled == true &&
        controller._view._startScreen._startButton.disabled == true &&
        controller._view._startScreen._previewImage.className == "disabled", "actionOnGlobalError");


    var sprites = [];
    var variables = [];
    sprites.push(new PocketCode.Model.Sprite(gameEngine2, scene, { id: "id1", name: "sprite1" }).renderingSprite);
    variables.push(new PocketCode.RenderingText({ id: "id1", x: 1, y: 3, text: "placeholder", visible: true }));
    var param = { visible: false, reinit: false, screenSize: { width: 40, height: 50 }, renderingSprites: sprites, renderingTexts: variables, id: "1" };

    //_visibilityChangeHandler
    scene._executionState = 5;
    controller._visibilityChangeHandler(param);
    assert.ok(controller._view.executionState == 3, "_visibilityChangeHandler: playerPageView executionState: paused");

    //_beforeProjectStartHandler
    controller._beforeProjectStartHandler(param);
    assert.ok(controller._view._startScreen._dom.style.display == 'none', "_beforeProjectStartHandler: display: none");

    //sceneChangedHandler
    controller._sceneChangedHandler(param);
    assert.ok(controller._playerViewportController._renderingSprite.length == 1 &&
        controller._playerViewportController._renderingTexts.length == 1 &&
        controller._playerViewportController._projectScreenWidth == 40 &&
        controller._playerViewportController._projectScreenHeight == 50, "sceneChangedHandler, set renderingSprite, rengeringTexts, projectScrrenWidth/Height");

    //_projectExecutedHandler
    controller._projectExecutedHandler();
    assert.ok(controller._view.executionState == 0, "_projectExecutedHandler: playerPageView executionstate: stopped");

    //_showScreenshotDialog
    var screenshotDialog = new PocketCode.Ui.ScreenshotDialog();
    var oldId = screenshotDialog.id;
    controller._screenshotDialog = screenshotDialog;
    var imageSrc = "https://share.catrob.at/images/logo/logo_text.png";
    var length_childs = controller._view._container._childs.length;
    controller._showScreenshotDialog(imageSrc);
    assert.ok(controller._screenshotDialog.id != oldId, "new screenshotdialog set");

    assert.ok(controller._dialogs.length === 2, "add dialog at _showScreenshotDialog");
    var lastElem = controller._view._container._childs.length - 1;
    assert.ok(controller._view._container._childs.length === length_childs + 1 && controller._view._container._childs[lastElem] instanceof PocketCode.Ui.Dialog, "appendChild in _showScreenshotDialog");
    assert.ok(controller._screenshotDialog._onDownload._listeners.length == 1 &&
        controller._screenshotDialog._onCancel._listeners.length == 1, "add EventListener at _showScreenshotDialog");

    //_buttonClickedHandler
    controller._view.executionState = 1;
    param = { command: PocketCode.Ui.PlayerBtnCommand.PAUSE };
    controller._buttonClickedHandler(param);
    assert.ok(controller._view.executionState == 3, "_buttonClickedHandler PAUSE: playerPageView executionState: paused");

    controller._view.executionState = 1;
    var oldId = controller._screenshotDialog.id;
    param = { command: PocketCode.Ui.PlayerBtnCommand.SCREENSHOT };
    controller._buttonClickedHandler(param);
    assert.ok(controller._view.executionState == 3, "_buttonClickedHandler SCREENSHOT: playerPageView executionState: paused");
    assert.ok(controller._screenshotDialog.id != oldId, "_buttonClickedHandler: new screenshotDialog");

    param = { command: PocketCode.Ui.PlayerBtnCommand.AXES };
    controller._buttonClickedHandler(param);
    assert.ok(controller._playerViewportController._view._axesVisible == true &&
        controller._view._toolbar._axesButton.checked == true &&
        controller._axesVisible == true, "_buttonClickedHandler: show axes");
    controller._buttonClickedHandler(param);
    assert.ok(controller._playerViewportController._view._axesVisible == false &&
        controller._view._toolbar._axesButton.checked == false &&
        controller._axesVisible == false, "_buttonClickedHandler: hide axes");

    //_menuActionHandler
    param = { command: PocketCode.Player.MenuCommand.FULLSCREEN, checked: true };
    controller._menuActionHandler(param);
    assert.ok(controller._playerViewportController._zoomToFit == true, "_menuActionHandler FULLSCREEN, zoomToFit = true");

    var languageChangeHandler = function (e) {
        assert.equal(e.language, "en", "_menuActionHandler LANGUAGE_CHANGE, language changed");
        done2();
    };
    param = { command: PocketCode.Player.MenuCommand.LANGUAGE_CHANGE, languageCode: "en-GB" };
    controller._menuActionHandler(param);
    PocketCode.I18nProvider.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(languageChangeHandler, this));

    //_onUserActionHandler
    var scene2 = new PocketCode.Model.Scene(gameEngine2, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine2, scene2, { id: "spriteId", name: "spriteName" });
    gameEngine2._currentScene = scene2;
    scene2._sprites.push(sprite);

    function spriteTapped(e) {
        assert.equal(true, true, "sprite tapped dispatched");
        assert.deepEqual(e.sprite, scene2._sprites[0], "correct sprite passed in on sprite clicked");
        disposed();
    }

    scene2._onSpriteTappedAction.addEventListener(new SmartJs.Event.EventListener(spriteTapped));
    controller._onUserActionHandler({ action: PocketCode.UserActionType.SPRITE_TOUCHED, targetId: scene2._sprites[0].id });

    //dispose
    function disposed() {
        controller.dispose();
        assert.ok(controller._disposed == true, "controller disposed");
        done1();
    }

});
