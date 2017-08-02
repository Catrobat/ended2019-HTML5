/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("ui/playerStartScreen.js");


QUnit.test("PlayerStartScreen", function (assert) {

    var scr = new PocketCode.Ui.PlayerStartScreen();
    assert.ok(scr instanceof PocketCode.Ui.PlayerStartScreen, "Dialog: instance check");

    scr = new PocketCode.Ui.PlayerStartScreen("title", "imgSrc");
    assert.equal(scr.title, "title", "title getter");
    scr.title = "new title";
    assert.throws(function () { scr.title = 1; }, Error, "ERROR: invalid title argument");
    assert.equal(scr.title, "new title", "title getter/setter");

    assert.ok(scr.onStartClicked instanceof SmartJs.Event.Event, "event instance check");

    var clicked = 0;
    var clickHandler = function (e) {
        clicked++;
    };
    scr.onStartClicked.addEventListener(new SmartJs.Event.EventListener(clickHandler, this));
    scr._startClickHandler();   //dispatch click manually
    assert.equal(clicked, 1, "event dispatched");

    scr.progressText = "new progress";
    assert.equal(scr._progressTextNode.text, "new progress", "progress text setter");

    assert.throws(function () { scr.startEnabled = "enabled"; }, Error, "ERROR: invalid argument: startEnabled")
    scr.startEnabled = true;
    assert.equal(scr._startButton.disabled, false, "button enabled");
    
    assert.throws(function () { scr.setProgress("10.0"); }, Error, "ERROR: invalid argument: not numeric")
    assert.throws(function () { scr.setProgress(100.1); }, Error, "ERROR: invalid argument: >100")
    assert.throws(function () { scr.setProgress(-0.1); }, Error, "ERROR: invalid argument: <0")
    scr.setProgress(10.0);  //code coverage

    scr._onResizeHandler();  //code coverage
});



