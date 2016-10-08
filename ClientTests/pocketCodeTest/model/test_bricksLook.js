/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksLook.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksLook.js");


QUnit.test("SetBackgroundBrick", function (assert) {
    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetBackgroundBrick(device, sprite, scene, {lookId: "lookId"});

    assert.ok(b._device === device && b._sprite === sprite && b._lookId === "lookId", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetBackgroundBrick, "instance check");
    assert.ok(b.objClassName === "SetBackgroundBrick", "objClassName check");

    //execute
   /* var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");*/
    done1();
});


QUnit.test("SetBackgroundAndWaitBrick", function (assert) {
    assert.ok(false, "TODO");
});


QUnit.test("SetLookBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetLookBrick(device, sprite, { lookId: "lookId" });

    assert.ok(b._device === device && b._sprite === sprite && b._lookId === "lookId", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetLookBrick, "instance check");
    assert.ok(b.objClassName === "SetLookBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("NextLookBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var called = false;
    sprite.nextLook = function () {
        called = true;
        return true;   //make sure to return a bool value: look changed
    };
    var b = new PocketCode.Model.NextLookBrick(device, sprite, { Id: "Id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.NextLookBrick, "instance check");
    assert.ok(b.objClassName === "NextLookBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, true, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        assert.ok(called, "sprite method called");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("PreviousLookBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var called = false;
    sprite.previousLook = function () {
        called = true;
        return false;   //make sure to return a bool value: look not changed
    };

    var b = new PocketCode.Model.PreviousLookBrick(device, sprite, { Id: "Id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.PreviousLookBrick, "instance check");
    assert.ok(b.objClassName === "PreviousLookBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, false, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        assert.ok(called, "sprite method called");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("AskBrick", function (assert) {
    assert.ok(false, "TODO");
});


QUnit.test("SelectCameraBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = new PocketCode.Device(new PocketCode.SoundManager());
    device.cameraOn = true;

    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SelectCameraBrick(device, sprite, { Id: "Id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SelectCameraBrick, "instance check");
    assert.ok(b.objClassName === "SelectCameraBrick", "objClassName check");

    assert.equal(b._selected, PocketCode.CameraType.BACK, "initial brick selection");
    b = new PocketCode.Model.SelectCameraBrick(device, sprite, { selected: 0 });
    assert.equal(b._selected, PocketCode.CameraType.BACK, "camera back selection");
    b = new PocketCode.Model.SelectCameraBrick(device, sprite, { selected: 1 });
    assert.equal(b._selected, PocketCode.CameraType.FRONT, "camera front selection");

    //execute
    var trueHandler = function (e) {
        assert.ok(true, "1 executed: true because devcie.cameraOn = true");
        assert.equal(e.loopDelay, true, "1 loopDelay received: true");
        assert.equal(e.id, "thread_id", " 1threadId handled correctly");
        done1();
    };
    var falseHandler = function (e) {
        assert.ok(true, "2 executed: not changed because set already");
        assert.equal(e.loopDelay, false, "2 loopDelay received: false");
        assert.equal(e.id, "thread_id2", "2 threadId handled correctly");
        done2();
    };
    b.execute(new SmartJs.Event.EventListener(trueHandler, this), "thread_id");     //true because devcie.cameraOn = true
    b.execute(new SmartJs.Event.EventListener(falseHandler, this), "thread_id2");   //false: not changed because set already

    device.cameraOn = false;
    b = new PocketCode.Model.SelectCameraBrick(device, sprite, { selected: 0 });
    var falseHandlerDisabled = function (e) {
        assert.ok(true, "3 executed: changed beck to back");
        assert.equal(e.loopDelay, false, "3 loopDelay = false: no effect because camera is turn off");
        assert.equal(e.id, "thread_id3", "3 threadId handled correctly");
        done3();
    };
    b.execute(new SmartJs.Event.EventListener(falseHandlerDisabled, this), "thread_id3");     //false: camera turned of so no effect on rendering

});


QUnit.test("CameraBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = new PocketCode.Device(new PocketCode.SoundManager());
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.CameraBrick(device, sprite, { Id: "Id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.CameraBrick, "instance check");
    assert.ok(b.objClassName === "CameraBrick", "objClassName check");

    assert.equal(b._selected, 0, "initial brick selection");
    b = new PocketCode.Model.CameraBrick(device, sprite, { selected: 0 });
    assert.equal(b._selected, 0, "initial brick selection");
    b = new PocketCode.Model.CameraBrick(device, sprite, { selected: 1 });
    assert.equal(b._selected, 1, "initial brick selection");

    //execute
    var onHandler = function (e) {
        assert.ok(true, "executed");
        assert.ok(e.loopDelay, "1: loopDelay true: switched to on");
        assert.equal(e.id, "thread_id", "1: threadId handled correctly");
        assert.ok(device.cameraOn, "1: device camera set to on");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(onHandler, this), "thread_id");

    var onHandler2 = function (e) {
        assert.ok(true, "2: executed");
        assert.notOk(e.loopDelay, "2: loopDelay = false: camera still on");
        assert.ok(device.cameraOn, "2: device camera still set to on");
        done2();
    };
    b.execute(new SmartJs.Event.EventListener(onHandler2, this), "thread_id2");

    b = new PocketCode.Model.CameraBrick(device, sprite, { Id: "Id" });   //default = off
    var offHandler = function (e) {
        assert.ok(e.loopDelay, "3: loopDelay true: switched to off");
        assert.notOk(device.cameraOn, "3: device camera set to off");
        done3();
    };
    b.execute(new SmartJs.Event.EventListener(offHandler, this), "thread_id3");

});


QUnit.test("SetCameraTransparencyBrick", function (assert) {

    var device = new PocketCode.Device(new PocketCode.SoundManager());
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetCameraTransparencyBrick(device, sprite, scene, { value: value });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetCameraTransparencyBrick, "instance check");
    assert.ok(b.objClassName === "SetCameraTransparencyBrick", "objClassName check");

    assert.ok(false, "TODO");
});


QUnit.test("SetSizeBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetSizeBrick(device, sprite, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._percentage instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetSizeBrick, "instance check");
    assert.ok(b.objClassName === "SetSizeBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ChangeSizeBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeSizeBrick(device, sprite, { value: value });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeSizeBrick, "instance check");
    assert.ok(b.objClassName === "ChangeSizeBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("HideBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.HideBrick(device, sprite, { Id: "Id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.HideBrick, "instance check");
    assert.ok(b.objClassName === "HideBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ShowBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.ShowBrick(device, sprite, { Id: "Id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ShowBrick, "instance check");
    assert.ok(b.objClassName === "ShowBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SayBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.SayBrick(device, sprite, { text: text });

    assert.ok(b._device === device && b._sprite === sprite && b._text instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SayBrick, "instance check");
    assert.ok(b.objClassName === "SayBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, true, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SayForBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var b = new PocketCode.Model.SayForBrick(device, sprite, { text: text, duration: duration });

    assert.ok(b._device === device && b._sprite === sprite && b._text instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SayForBrick, "instance check");
    assert.ok(b.objClassName === "SayForBrick", "objClassName check");

    var h = function (e) {  //async
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, true, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");

        done1();
    };

    b.execute(new SmartJs.Event.EventListener(h, this), "thread_id");

    var lastType, lastText;
    var spriteMock = {
        showBubble: function(type, text) {
            lastType = type;
            lastText = text;
        },
        hideBubble: function(type) {
            lastType = type;
        },
    };
    b = new PocketCode.Model.SayForBrick(device, spriteMock, { text: text, duration: duration });
    var mockHandler = function(e) {
        assert.equal(lastType, PocketCode.Model.BubbleType.SAY, "show bubble ok: type");
        done2();
    }
    b.execute(new SmartJs.Event.EventListener(mockHandler, this), "sdf");
    assert.equal(lastText, "good morning", "show bubble ok: text");
    assert.equal(lastType, PocketCode.Model.BubbleType.SAY, "show bubble ok: type");
    lastType = undefined;
});


QUnit.test("ThinkBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');

    var b = new PocketCode.Model.ThinkBrick(device, sprite, { text: text });

    assert.ok(b._device === device && b._sprite === sprite && b._text instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ThinkBrick, "instance check");
    assert.ok(b.objClassName === "ThinkBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, true, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");


});


QUnit.test("ThinkForBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var text = JSON.parse('{"type":"STRING","value":"sdf","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');

    var b = new PocketCode.Model.ThinkForBrick(device, sprite, { text: text, duration: duration });

    assert.ok(b._device === device && b._sprite === sprite && b._text instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ThinkForBrick, "instance check");
    assert.ok(b.objClassName === "ThinkForBrick", "objClassName check");

    var h = function (e) {  //async
        assert.ok(true, "executed");
        assert.equal(e.loopDelay, true, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");

        done1();
    };

    b.execute(new SmartJs.Event.EventListener(h, this), "thread_id");

    var lastType, lastText;
    var spriteMock = {
        showBubble: function(type, text) {
            lastType = type;
            lastText = text;
        },
        hideBubble: function(type) {
            lastType = type;
        },
    };
    b = new PocketCode.Model.ThinkForBrick(device, spriteMock, { text: text, duration: duration });
    var mockHandler = function(e) {
        assert.equal(lastType, PocketCode.Model.BubbleType.THINK, "show bubble ok: type");
        done2();
    }
    b.execute(new SmartJs.Event.EventListener(mockHandler, this), "sdf");
    assert.equal(lastText, "sdf", "show bubble ok: text");
    assert.equal(lastType, PocketCode.Model.BubbleType.THINK, "show bubble ok: type");
    lastType = undefined;
});


QUnit.test("SetTransparencyBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetTransparencyBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.GHOST });
    //^^ effect is set server side

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetTransparencyBrick, "instance check");
    assert.ok(b.objClassName === "SetTransparencyBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ChangeTransparencyBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeTransparencyBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.GHOST });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeTransparencyBrick, "instance check");
    assert.ok(b.objClassName === "ChangeTransparencyBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetBrightnessBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetBrightnessBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.BRIGHTNESS });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetBrightnessBrick, "instance check");
    assert.ok(b.objClassName === "SetBrightnessBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ChangeBrightnessBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeBrightnessBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.BRIGHTNESS });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeBrightnessBrick, "instance check");
    assert.ok(b.objClassName === "ChangeBrightnessBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetColorEffectBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetColorEffectBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.COLOR });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetColorEffectBrick, "instance check");
    assert.ok(b.objClassName === "SetColorEffectBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ChangeColorEffectBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });
    var value = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeColorEffectBrick(device, sprite, { value: value, effect: PocketCode.GraphicEffect.COLOR });

    assert.ok(b._device === device && b._sprite === sprite && b._value instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeColorEffectBrick, "instance check");
    assert.ok(b.objClassName === "ChangeColorEffectBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ClearGraphicEffectBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.ClearGraphicEffectBrick(device, sprite, { Id: "Id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ClearGraphicEffectBrick, "instance check");
    assert.ok(b.objClassName === "ClearGraphicEffectBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("FlashBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var device = new PocketCode.Device(new PocketCode.SoundManager());
    var program = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var sprite = new PocketCode.Model.Sprite(program, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.FlashBrick(device, sprite, {
        "selected": "1",
        "type": "Flash"
    });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.FlashBrick, "instance check");
    assert.ok(b.objClassName === "FlashBrick", "objClassName check");
    assert.strictEqual(b._on, true, "on setter in ctr: 1");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

    var c = new PocketCode.Model.FlashBrick(device, sprite, {
        "selected": "0",
        "type": "Flash"
    });
    assert.strictEqual(c._on, false, "on setter in ctr: 0");

    done2();
});


