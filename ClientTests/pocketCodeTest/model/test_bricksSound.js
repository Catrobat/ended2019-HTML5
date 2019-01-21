/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksSound.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksSound.js");


QUnit.test("PlaySoundBrick", function (assert) {

    var done1 = assert.async();

    //resources
    var resourceBaseUrl1 = "_resources/";
    var sounds1 = [
        { id: "s19", url: "sounds/3ec79f9addcf5055e069ec794db954e8_c.mp3", size: 11140 },
        { id: "s16", url: "sounds/8586959b14c74023b91e2c17da40cab4_c#.mp3", size: 11140 },
        { id: "s18", url: "sounds/152badadc1a428c7a89b46cf6d82a43b_e.ogg", size: 11140 },   //invalid
        { id: "s17", url: "sounds/dbdd35220c46b04c7ace3f04af185702_f.mp3", size: 11140 },
        { id: "s20", url: "sounds/e2b1d3b4f3d65de8f6468539ad695e94_g.mp3", size: 11140 }
    ];

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    soundManager.onLoad.addEventListener(new SmartJs.Event.EventListener(soundsLoadHandler, this));
    soundManager.loadSounds(resourceBaseUrl1, sounds1);

    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "s18";

    var b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: soundId, wait: false, commentedOut: false });
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sprite (audio player)");

    //recreate
    b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: soundId, wait: false, commentedOut: false });

    assert.ok(b._device === device && b._sprite === sprite && b._soundId === soundId && b._wait === false, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PlaySoundBrick, "instance check");
    assert.ok(b.objClassName === "PlaySoundBrick", "objClassName check");

    //start sound tests: onLoad
    function soundsLoadHandler() {

        //execute with invalid sound
        var handler = function (e) {
            assert.ok(true, "executed with invalid sound Id");
            assert.ok(e.loopDelay === undefined || e.loopDelay === false, "loopDelay received");
            assert.equal(e.id, "thread_id", "threadId handled correctly");

            test_withoutSoundId();
        };
        b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

    }

    function test_withoutSoundId() {
        var handler2 = function (e) {
            assert.ok(true, "executed with invalid sound file");
            test_validSoundId();
        }

        b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: null, wait: false, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id");
    }

    function test_validSoundId() {
        var handler2 = function (e) {
            assert.ok(true, "executed with valid sound file");
            done1();
        }

        b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: "s19", wait: false, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id");
    }

});

QUnit.test("PlaySoundBrick (and wait)", function (assert) {

    var done1 = assert.async();

    //resources
    var resourceBaseUrl1 = "_resources/";
    var sounds1 = [
        { id: "s19", url: "sounds/3ec79f9addcf5055e069ec794db954e8_c.mp3", size: 11140 },
        { id: "s16", url: "sounds/8586959b14c74023b91e2c17da40cab4_c#.mp3", size: 11140 },
        { id: "s18", url: "sounds/152badadc1a428c7a89b46cf6d82a43b_e.ogg", size: 11140 },   //invalid
        { id: "s17", url: "sounds/dbdd35220c46b04c7ace3f04af185702_f.mp3", size: 11140 },
        { id: "s20", url: "sounds/e2b1d3b4f3d65de8f6468539ad695e94_g.mp3", size: 11140 }
    ];

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var soundManager = gameEngine._soundManager;
    soundManager.onLoad.addEventListener(new SmartJs.Event.EventListener(soundsLoadHandler, this));
    soundManager.loadSounds(resourceBaseUrl1, sounds1);

    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var soundId = "s18";

    //create
    var b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: soundId, wait: true, commentedOut: false });

    //start sound tests: onLoad
    function soundsLoadHandler() {

        //execute with invalid sound
        var handler = function (e) {
            assert.ok(true, "executed with invalid sound Id");
            assert.ok(e.loopDelay === undefined || e.loopDelay === false, "loopDelay received");
            assert.equal(e.id, "thread_id", "threadId handled correctly");

            test_withoutSoundId();
        };
        b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

    }

    function test_withoutSoundId() {
        var handler2 = function (e) {
            assert.ok(true, "executed with invalid sound file");
            test_validSoundId();
        }

        b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: null, wait: true, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id");
    }

    function test_validSoundId() {
        var handler2 = function (e) {
            assert.ok(true, "executed with valid sound file");
            test_stopSound();
        }

        b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: "s19", wait: true, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id");
    }

    function test_stopSound() {
        var handler2 = function (e) {
            assert.ok(false, "executed handler called on stop() => Error");
        }

        b = new PocketCode.Model.PlaySoundBrick(device, sprite, { resourceId: "s16", wait: true, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id");

        window.setTimeout(function () {
            b.stop();
            assert.deepEqual(b._pendingOps, {}, "sound stopped");
            done1();
        }, 500);
    }

});


QUnit.test("StopAllSoundsBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { stopType: PocketCode.StopType.ALL_SOUNDS });
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { stopType: PocketCode.StopType.ALL_SOUNDS });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.StopBrick, "instance check");
    assert.ok(b.objClassName === "StopBrick", "objClassName check");

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

    var b = new PocketCode.Model.VolumeBrick(device, sprite, { value: percentage, commentedOut: false, opType: PocketCode.OpType.SET });
    assert.ok(b.volumeFormula instanceof PocketCode.Formula, "formula accessor");
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.VolumeBrick(device, sprite, { value: percentage, commentedOut: false, opType: PocketCode.OpType.SET });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.VolumeBrick, "instance check");
    assert.ok(b.objClassName === "VolumeBrick", "objClassName check");

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

    var b = new PocketCode.Model.VolumeBrick(device, sprite, { value: value, commentedOut: false, opType: PocketCode.OpType.CHANGE });
    assert.ok(b.volumeFormula instanceof PocketCode.Formula, "formula accessor");
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sound manager");
    //recreate
    b = new PocketCode.Model.VolumeBrick(device, sprite, { value: value, commentedOut: false, opType: PocketCode.OpType.CHANGE });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.VolumeBrick, "instance check");
    assert.ok(b.objClassName === "VolumeBrick", "objClassName check");

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
    var text = JSON.parse('{"type":"STRING","value":"sound brick","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: false, commentedOut: false });
    assert.ok(b.textFormula instanceof PocketCode.Formula, "formula accessor");
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed, "disposed without disposing sprite (audio player)");
    //recreate
    b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: false, commentedOut: false });

    assert.ok(b._device === device && b._sprite === sprite && b._text instanceof PocketCode.Formula && b._wait == false, "brick created and properties set correctly");
    assert.ok(b._text instanceof PocketCode.Formula, "sound file: formula parameter set");
    assert.ok(b instanceof PocketCode.Model.SpeakBrick, "instance check");
    assert.ok(b.objClassName === "SpeakBrick", "objClassName check");

    //execute (including caching)
    var handler = function (e) {
        assert.ok(true, "executed: cached tts file");
        assert.notOk(e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");

        test_emptyString();
    };
    window.setTimeout(function () { b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id"); }, 1000); //wait until sound was loaded (cntr)

    function test_emptyString() {
        var handler = function (e) {
            assert.ok(true, "executed: empty string");
            assert.notOk(e.loopDelay, "loopDelay received");
            assert.equal(e.id, "thread_id", "threadId handled correctly");

            test_dynamicText();
        };
        
        text = JSON.parse('{"type":"STRING","value":"","right":null,"left":null}');
        b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: false, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");
    }

    function test_dynamicText() {
        //test: using text generated at runtime (not static)
        //sprite.__variablesSimple._variables.s15 = { id: "s15", name: "var_name", value: "dynamic points" };
        sprite.__variablesSimple._variables.s15 = new PocketCode.Model.UserVariableSimple("s15", "var_name", 94);
        //^^ pretty difficult to set a variable for a test case.. maybe we should rewrite this

        text = join;    //using testDataFormula.js
        var b2 = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: false, commentedOut: false });

        var handler2 = function (e) {
            assert.ok(true, "executed: non static string (played onLoad)");
            assert.equal(e.id, "thread_id2", "dynamic text: threadId handled correctly");

            done1();
        };
        b2.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id2");
    }
});

QUnit.test("SpeakBrick (and wait)", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "s01";
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"sound brick","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });

    //execute (including caching)
    var handler = function (e) {
        assert.ok(true, "executed: cached tts file");
        assert.notOk(e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");

        test_emptyString();
    };
    window.setTimeout(function () { b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id"); }, 1000); //wait until sound was loaded (cntr)

    function test_emptyString() {
        var handler = function (e) {
            assert.ok(true, "executed: empty string");
            assert.notOk(e.loopDelay, "loopDelay received");
            assert.equal(e.id, "thread_id", "threadId handled correctly");

            test_dynamicText();
        };

        text = JSON.parse('{"type":"STRING","value":"","right":null,"left":null}');
        b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");
    }

    function test_dynamicText() {
        //test: using text generated at runtime (not static)
        //sprite.__variablesSimple._variables.s15 = { id: "s15", name: "var_name", value: "dynamic points" };
        sprite.__variablesSimple._variables.s15 = new PocketCode.Model.UserVariableSimple("s15", "var_name", 94);
        //^^ pretty difficult to set a variable for a test case.. maybe we should rewrite this

        text = join;    //using testDataFormula.js
        var b2 = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });

        var handler2 = function (e) {
            assert.ok(true, "executed: non static string (played onLoad)");
            assert.equal(e.id, "thread_id2", "dynamic text: threadId handled correctly");

            test_stopSound();
        };
        b2.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id2");
    }

    function test_stopSound() {
        var handler2 = function (e) {
            assert.ok(false, "executed handler called on stop() => Error");
        }

        b = new PocketCode.Model.SpeakBrick(device, sprite, { text: text, wait: true, commentedOut: false });
        b.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id");

        window.setTimeout(function () {
            b.stop();
            assert.deepEqual(b._pendingOps, {}, "sound stopped");
            done1();
        }, 500);
    }
});

