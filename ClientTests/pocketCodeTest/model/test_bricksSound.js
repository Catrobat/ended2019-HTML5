/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/component/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksSound.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("bricksSound.js");


QUnit.test("PlaySoundBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });
    var soundId = "soundId";

    var b = new PocketCode.Model.PlaySoundBrick(device, sprite, program._soundManager, { soundId: soundId });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === program._soundManager && b._soundId === soundId, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PlaySoundBrick, "instance check");
    assert.ok(b.objClassName === "PlaySoundBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, undefined, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("StopAllSoundsBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopAllSoundsBrick(device, sprite, program._soundManager);

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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"80","right":null,"left":null}');

    var b = new PocketCode.Model.SetVolumeBrick(device, sprite, program._soundManager, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === program._soundManager && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"15","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeVolumeBrick(device, sprite, program._soundManager, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === program._soundManager && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
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
    var done2 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.SpeakBrick(device, sprite, program._soundManager, { text: text });

    assert.ok(b._device === device && b._sprite === sprite && b._soundManager === program._soundManager, "brick created and properties set correctly");
    assert.ok(b._soundId === undefined && b._text instanceof PocketCode.Formula || typeof b._soundId === "string" && typeof b._text === "string", "sound file parameters set");
    assert.ok(b instanceof PocketCode.Model.SpeakBrick, "instance check");
    assert.ok(b.objClassName === "SpeakBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, undefined, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");


    //test: using text generated at runtime (not static)
    //sprite.__variablesSimple._variables.s15 = { id: "s15", name: "var_name", value: "dynamic points" };
    sprite.__variablesSimple._variables.s15 = new PocketCode.Model.UserVariableSimple("s15", "var_name", 94);
    //^^ pretty difficult to set a variable for a test case.. maybe we should rewrite this

    text = join;    //using testDataFormula.js
    var b2 = new PocketCode.Model.SpeakBrick(device, sprite, program._soundManager, { text: text });

    var handler2 = function (e) {
        assert.ok(true, "dynamic text: executed");
        assert.equal(e.id, "thread_id2", "dynamic text: threadId handled correctly");
        done2();
    };
    b2.execute(new SmartJs.Event.EventListener(handler2, this), "thread_id2");

});


