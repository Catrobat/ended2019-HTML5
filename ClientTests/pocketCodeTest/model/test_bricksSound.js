/// <reference path="../../qunit/qunit-2.4.0.js" />
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
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "soundId";

    var b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: soundId, wait: false, commentedOut: false });
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: soundId, wait: false, commentedOut: false });

    assert.ok(b._device === device && b._sprite === sprite && b._soundId === soundId && b._wait === false, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PlaySoundBrick, "instance check");
    assert.ok(b.objClassName === "PlaySoundBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(e.loopDelay === undefined || e.loopDelay === false, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        
        test_withoutSoundId();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

    function test_withoutSoundId() {
        var handler2 = function (e) {
            assert.ok(true, "executed wihtour sound ID");
            done1();
        }

        b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: null, wait: false, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id");
    }
});


QUnit.test("PlaySoundBrick (and wait)", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "soundId";

    var b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: soundId, wait: true, commentedOut: false });
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: soundId, wait: true, commentedOut: false });

    //assert.ok(b._device === device && b._sprite === sprite && b._soundId === soundId, "brick created and properties set correctly");
    //assert.ok(b instanceof PocketCode.Model.PlaySoundAndWaitBrick, "instance check");
    //assert.ok(b.objClassName === "PlaySoundAndWaitBrick", "objClassName check");

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
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopAllSoundsBrick(device, sprite, scene, { id: "id", commentedOut: false });
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.StopAllSoundsBrick(device, sprite, scene, { id: "id", commentedOut: false });

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
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"80","right":null,"left":null}');

    var b = new PocketCode.Model.SetVolumeBrick(device, sprite, { percentage: percentage, commentedOut: false });
    assert.ok(b.volumeFormula instanceof PocketCode.Formula, "formula accessor");
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.SetVolumeBrick(device, sprite, { percentage: percentage, commentedOut: false });

    assert.ok(b._device === device && b._sprite === sprite && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
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
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"15","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeVolumeBrick(device, sprite, { value: value, commentedOut: false });
    assert.ok(b.volumeFormula instanceof PocketCode.Formula, "formula accessor");
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.ChangeVolumeBrick(device, sprite, { value: value, commentedOut: false });

    assert.ok(b._device === device && b._sprite === sprite &&  b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
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
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"hello world","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: false, commentedOut: false });
    assert.ok(b.textFormula instanceof PocketCode.Formula, "formula accessor");
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });   //TODO:move AndWait tests

    assert.ok(b._device === device && b._sprite === sprite && b._text instanceof PocketCode.Formula && b._wait == true, "brick created and properties set correctly");
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
        var b2 = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: false, commentedOut: false });

        var handler2 = function (e) {
            assert.ok(true, "dynamic text: executed");
            assert.equal(e.id, "thread_id2", "dynamic text: threadId handled correctly");

            done1();
        };
        b2.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id2");
    }
});


QUnit.test("SpeakBrick (and wait)", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });
    b.dispose();
    assert.ok(b._disposed && !soundManager._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });

    //assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    //assert.ok(b._text instanceof PocketCode.Formula, "sound file: formula parameter set");
    //assert.ok(b instanceof PocketCode.Model.SpeakAndWaitBrick, "instance check");
    //assert.ok(b.objClassName === "SpeakAndWaitBrick", "objClassName check");

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
        var b2 = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });

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

