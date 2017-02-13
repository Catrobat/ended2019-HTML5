/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksSound.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksSound.js");


QUnit.test("PlaySoundBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "soundId";

    var b = new PocketCode.Model.PlaySoundBrick(device, sprite, scene.id, gameEngine._soundManager, { resourceId: soundId });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === gameEngine._soundManager && b._soundId === soundId, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PlaySoundBrick, "instance check");
    assert.ok(b.objClassName === "PlaySoundBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(e.loopDelay === undefined || e.loopDelay === false, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("PlaySoundAndWaitBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "soundId";

    var b = new PocketCode.Model.PlaySoundAndWaitBrick(device, sprite, scene.id, gameEngine._soundManager, { resourceId: soundId });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === gameEngine._soundManager && b._soundId === soundId, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PlaySoundAndWaitBrick, "instance check");
    assert.ok(b.objClassName === "PlaySoundAndWaitBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(e.loopDelay === undefined || e.loopDelay === false, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        
        runTest2();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

    //pause, resume, stop
    function runTest2() {

        assert.ok(false, "TODO");
        done1();
    }

});


QUnit.test("StopAllSoundsBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopAllSoundsBrick(device, sprite, scene.id, gameEngine._soundManager, { id: "id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.StopAllSoundsBrick, "instance check");
    assert.ok(b.objClassName === "StopAllSoundsBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, undefined, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetVolumeBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"80","right":null,"left":null}');

    var b = new PocketCode.Model.SetVolumeBrick(device, sprite, gameEngine._soundManager, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === gameEngine._soundManager && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetVolumeBrick, "instance check");
    assert.ok(b.objClassName === "SetVolumeBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, undefined, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ChangeVolumeBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"15","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeVolumeBrick(device, sprite, gameEngine._soundManager, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === gameEngine._soundManager && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeVolumeBrick, "instance check");
    assert.ok(b.objClassName === "ChangeVolumeBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, undefined, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SpeakBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"hello world","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakBrick(device, sprite, scene.id, gameEngine._soundManager, { text: text });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === gameEngine._soundManager, "brick created and properties set correctly");
    assert.ok(b._text instanceof PocketCode.Formula, "sound file: formula parameter set");
    assert.ok(b instanceof PocketCode.Model.SpeakBrick, "instance check");
    assert.ok(b.objClassName === "SpeakBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.notOk(e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        
        runTest2();
    };
    window.setTimeout(function () { b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id"); }, 1000); //wait until sound was loaded (cntr)

    function runTest2() {
        //test: using text generated at runtime (not static)
        //sprite.__variablesSimple._variables.s15 = { id: "s15", name: "var_name", value: "dynamic points" };
        sprite.__variablesSimple._variables.s15 = new PocketCode.Model.UserVariableSimple("s15", "var_name", 94);
        //^^ pretty difficult to set a variable for a test case.. maybe we should rewrite this

        text = join;    //using testDataFormula.js
        var b2 = new PocketCode.Model.SpeakBrick(device, sprite, scene.id, gameEngine._soundManager, { text: text });

        var handler2 = function (e) {
            assert.ok(true, "dynamic text: executed");
            assert.equal(e.id, "thread_id2", "dynamic text: threadId handled correctly");

            done1();
        };
        b2.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id2");
    }
});


QUnit.test("SpeakAndWaitBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakAndWaitBrick(device, sprite, scene.id, gameEngine._soundManager, { text: text });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === gameEngine._soundManager, "brick created and properties set correctly");
    assert.ok(b._text instanceof PocketCode.Formula, "sound file: formula parameter set");
    assert.ok(b instanceof PocketCode.Model.SpeakAndWaitBrick, "instance check");
    assert.ok(b.objClassName === "SpeakAndWaitBrick", "objClassName check");

    //execute a preloaded sound (static formula)
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.notOk(e.loopDelay, "loopDelay received");
        assert.equal(e.id, "t_id", "threadId handled correctly");
        done1();

        assert.ok(false, "FIX IN SOUND MANAGER REQUIRED");
        done2();
        done3();
        return;
        runTest2();
        runTest3();
    };
    window.setTimeout(function () { b.execute(new SmartJs.Event.EventListener(handler, this), "t_id"); }, 1000);

    //execute a sound loaded on the fly
    function runTest2() {
        //test: using text generated at runtime (not static)
        //sprite.__variablesSimple._variables.s15 = { id: "s15", name: "var_name", value: "dynamic points" };
        sprite.__variablesSimple._variables.s15 = new PocketCode.Model.UserVariableSimple("s15", "var_name", 94);
        //^^ pretty difficult to set a variable for a test case.. maybe we should rewrite this

        text = join;    //using testDataFormula.js
        var b2 = new PocketCode.Model.SpeakAndWaitBrick(device, sprite, scene.id, gameEngine._soundManager, { text: text });

        var handler2 = function (e) {
            assert.ok(true, "dynamic text: executed");
            assert.equal(e.id, "t_id2", "dynamic text: threadId handled correctly");
            done2();

        };
        b2.execute(new SmartJs.Event.EventListener(handler2), "t_id2");
    }

    //including pause/resume/stop
    function runTest3() {
        var handler3 = function (e) {
            assert.ok(false, "handler3 not called- brick stopped");
        };
        b.execute(new SmartJs.Event.EventListener(handler3), "t_id");

        window.setTimeout(function () { b.pause(); }, 300);
        window.setTimeout(function () { b.resume(); }, 800);
        window.setTimeout(function () { b.stop(); }, 1200);
        window.setTimeout(function () {
            done3();
        }, 1500);
    }
});

