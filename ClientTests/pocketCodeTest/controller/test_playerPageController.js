/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("controller/playerPageController.js");


QUnit.test("PlayerPageController", function (assert) {

    var controller = new PocketCode.PlayerPageController();
    var gameEngine = new PocketCode.GameEngine();

    assert.ok(controller instanceof PocketCode.PlayerPageController, "Instance check");
    assert.ok(controller._playerViewportController instanceof PocketCode.PlayerViewportController , "Instance check playerViewPortController");
    assert.ok(controller._axesVisible == false && controller._playerViewportController._projectScreenHeight == 320 && controller._playerViewportController._projectScreenWidth == 200, "_axesVisible, _projectScreenHeight, _projectScreenWitdh set");

    //properties
    var menu = controller.menu;
    assert.equal(menu,  controller._view._menu, "menu getter");

    controller._view._startScreen = new PocketCode.Ui.PlayerStartScreen();
    var json = {title: "json1", thumbnailUrl: "null", baseUrl:""};

    controller.projectDetails = json;
    assert.ok(controller._view._startScreen.title == "json1" && controller._view._startScreen._previewImage == "https://share.catrob.at//images/default/screenshot.png", "projectDetails")


    assert.throws(function () { controller.project = 0; }, Error, "Set gameEngine not instanceof PocketCode.GameEngine");
    controller.project = gameEngine;
    assert.equal(gameEngine, controller._gameEngine, "gameEngine set");
    controller.project = gameEngine;
    assert.equal(gameEngine, controller._gameEngine, "gameEngine not changed");
    var gameEngine2 = new PocketCode.GameEngine();
    controller.project = gameEngine2;
    assert.equal(gameEngine2, controller._gameEngine, "gameEngine set 2");

    //methods

});



