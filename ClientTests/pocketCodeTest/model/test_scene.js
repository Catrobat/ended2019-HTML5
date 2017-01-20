/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/scene.js" />
'use strict';

QUnit.module("model/scene.js");


QUnit.test("Scene", function (assert) {
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    assert.ok(scene instanceof PocketCode.Model.Scene && scene instanceof SmartJs.Core.Component, "instance check");
    assert.ok(scene.objClassName === "Scene", "objClassName check");

    assert.equal(scene._executionState, PocketCode.ExecutionState.INITIALIZED, "Created scene: status initialized");

    //init tests todo
    var gameEngine = "gameEngine";
    var projectTimer = {
        started: 0,
        start: function () {
            this.started++;
        }
    };
    //scene.init(gameEngine, projectTimer);


    var sceneStarted = 0;
    scene.onStart.addEventListener(new SmartJs.Event.EventListener(function() { sceneStarted++; }, this));

    scene._background = "background";
    scene.start();
    assert.equal(sceneStarted, 1, "scene started triggers start event");

    assert.ok(false, "TODO");
});