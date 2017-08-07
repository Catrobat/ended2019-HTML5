/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksMotion.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksMotion.js");


QUnit.test("GoToPositionBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.GoToPositionBrick(device, sprite, { x: x, y: y });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.GoToPositionBrick, "instance check");
    assert.ok(b.objClassName === "GoToPositionBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetXBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.SetXBrick(device, sprite, { value: x });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetXBrick, "instance check");
    assert.ok(b.objClassName === "SetXBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetYBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetYBrick(device, sprite, { value: y });

    assert.ok(b._device === device && b._sprite === sprite && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetYBrick, "instance check");
    assert.ok(b.objClassName === "SetYBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ChangeXBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeXBrick(device, sprite, { value: x });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeXBrick, "instance check");
    assert.ok(b.objClassName === "ChangeXBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ChangeYBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.ChangeYBrick(device, sprite, { value: y });

    assert.ok(b._device === device && b._sprite === sprite && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ChangeYBrick, "instance check");
    assert.ok(b.objClassName === "ChangeYBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("GoToBrick", function (assert) {
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var soundMgr = new PocketCode.SoundManager();
    var device = new PocketCode.MediaDevice(soundMgr);
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, device, soundMgr, []);
    scene._originalScreenWidth = 300; //set internal: used for random position calculation 
    scene._originalScreenHeight = 800;

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var sprite2 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "id", name: "spriteName2" });
    scene._sprites = [sprite, sprite2];  //add to scene to set position

    var b = new PocketCode.Model.GoToBrick(device, sprite, scene, { destinationType: "sprite", spriteId: "id" });
    var c = new PocketCode.Model.GoToBrick(device, sprite, scene, { destinationType: "pointer", spriteId: "id" });
    var d = new PocketCode.Model.GoToBrick(device, sprite, scene, { destinationType: "random", spriteId: "id" });

    assert.ok(b._device === device && b._sprite === sprite , "SPRITE brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.GoToBrick, " SPRITE instance check");
    assert.ok(b.objClassName === "GoToBrick", "SPRITE objClassName check");

    b.dispose();
    assert.ok(b._disposed && !scene._disposed, "disposed without disposing scene");
    //recreate
    b = new PocketCode.Model.GoToBrick(device, sprite, scene, { destinationType: "sprite", spriteId: "id" });

    assert.ok(c._device === device && c._sprite === sprite , "POINTER brick created and properties set correctly");
    assert.ok(c instanceof PocketCode.Model.GoToBrick, "POINTER instance check");
    assert.ok(c.objClassName === "GoToBrick", "POINTER objClassName check");

    assert.ok(d._device === device && d._sprite === sprite , "RANDOM brick created and properties set correctly");
    assert.ok(d instanceof PocketCode.Model.GoToBrick, "RANDOM instance check");
    assert.ok(d.objClassName === "GoToBrick", "RANDOM objClassName check");

    //execute
    var handlerSprite = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "TODO loopDelay received"); //-> missing implementation scene.setSpritePosition
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    var handlerPointer = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "TODO loopDelay received"); //-> missing implementation scene.setSpritePosition
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done2();
    };
    var handlerRandom = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "TODO loopDelay received"); //-> missing implementation scene.setSpritePosition
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done3();
    };
    b.execute(new SmartJs.Event.EventListener(handlerSprite, this), "thread_id");
    c.execute(new SmartJs.Event.EventListener(handlerPointer, this), "thread_id");
    d.execute(new SmartJs.Event.EventListener(handlerRandom, this), "thread_id");
});


QUnit.test("IfOnEdgeBounceBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.IfOnEdgeBounceBrick(device, sprite, { id: "id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.IfOnEdgeBounceBrick, "instance check");
    assert.ok(b.objClassName === "IfOnEdgeBounceBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("MoveNStepsBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var steps = JSON.parse('{"type":"NUMBER","value":"14","right":null,"left":null}');

    var b = new PocketCode.Model.MoveNStepsBrick(device, sprite, 24, { steps: steps });

    assert.ok(b._device === device && b._sprite === sprite && b._steps instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.MoveNStepsBrick, "instance check");
    assert.equal(b._minLoopCycleTime, 24, "property set");
    assert.ok(b.objClassName === "MoveNStepsBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("TurnLeftBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"45","right":null,"left":null}');

    var b = new PocketCode.Model.TurnLeftBrick(device, sprite, { degrees: degrees });

    assert.ok(b._device === device && b._sprite === sprite && b._degrees instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.TurnLeftBrick, "instance check");
    assert.ok(b.objClassName === "TurnLeftBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("TurnRightBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"30","right":null,"left":null}');

    var b = new PocketCode.Model.TurnRightBrick(device, sprite, { degrees: degrees });

    assert.ok(b._device === device && b._sprite === sprite && b._degrees instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.TurnRightBrick, "instance check");
    assert.ok(b.objClassName === "TurnRightBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetDirectionBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var degrees = JSON.parse('{"type":"NUMBER","value":"0","right":null,"left":null}');

    var b = new PocketCode.Model.SetDirectionBrick(device, sprite, { degrees: degrees });

    assert.ok(b._device === device && b._sprite === sprite && b._degrees instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetDirectionBrick, "instance check");
    assert.ok(b.objClassName === "SetDirectionBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetDirectionToBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var spriteId = "spriteId";
    sprite._id = spriteId;
    scene._sprites.push(sprite);


    var b = new PocketCode.Model.SetDirectionToBrick(device, sprite, { spriteId: spriteId });

    assert.ok(b._device === device && b._sprite === sprite && b._spriteId === spriteId, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetDirectionToBrick, "instance check");
    assert.ok(b.objClassName === "SetDirectionToBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetRotionStyleBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetRotionStyleBrick(device, sprite, { id: "id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetRotionStyleBrick, "instance check");
    assert.ok(b.objClassName === "SetRotionStyleBrick", "objClassName check");

    assert.ok(b._style == PocketCode.RotationStyle.ALL_AROUND, "default style: all around: not defined");
    b = new PocketCode.Model.SetRotionStyleBrick(device, sprite, { selected: 0 });
    assert.ok(b._style == PocketCode.RotationStyle.LEFT_TO_RIGHT, "style: left to right");
    b = new PocketCode.Model.SetRotionStyleBrick(device, sprite, { selected: 2 });
    assert.ok(b._style == PocketCode.RotationStyle.DO_NOT_ROTATE, "style: don't rotate");
    b = new PocketCode.Model.SetRotionStyleBrick(device, sprite, { selected: 10 });
    assert.ok(b._style == PocketCode.RotationStyle.ALL_AROUND, "default style: all around: not listet in enum");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetRotationSpeedBrick", function (assert) {

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var deg = JSON.parse('{"type":"NUMBER","value":"35","right":null,"left":null}');

    //clockwise
    var b = new PocketCode.Model.SetRotationSpeedBrick(device, sprite, { degreesPerSec: deg, ccw: false });

    assert.ok(b._device === device && b._sprite === sprite && b._degreesPerSecond instanceof PocketCode.Formula && typeof b._ccw == "boolean", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetRotationSpeedBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SetRotationSpeedBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(e.loopDelay == false || e.loopDelay == undefined, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");
    assert.ok(sprite._rotationSpeed, 35, "rotation speed set correctly");

    //counterclockwise
    deg = JSON.parse('{"type":"NUMBER","value":"24","right":null,"left":null}');
    b = new PocketCode.Model.SetRotationSpeedBrick(device, sprite, { degreesPerSec: deg, ccw: true });
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");
    assert.ok(sprite._rotationSpeed, -24, "rotation speed set correctly: ccw");

});


QUnit.test("GlideToBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    //^^ initialized with x/y = 0/0
    sprite._positionX = -10;
    sprite._positionY = -30;

    var x = JSON.parse('{"type":"NUMBER","value":"20","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"50","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');

    var b = new PocketCode.Model.GlideToBrick(device, sprite, { x: x, y: y, duration: duration });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula && b._duration instanceof PocketCode.Formula, "brick created and properties set correctly");  // && b._duration === "duration" -> duration is parsed as formula 
    assert.ok(b instanceof PocketCode.Model.GlideToBrick, "instance check");
    assert.ok(b.objClassName === "GlideToBrick", "objClassName check");

    //alert(b._duration.calculate);
    assert.equal(b._x.calculate(), 20, "formula x created correctly");
    assert.equal(b._y.calculate(), 50, "formula y created correctly");
    assert.equal(b._duration.calculate(), 1, "formula duration created correctly");

    var asyncHandler1 = function (e) {
        var end = new Date();
        assert.equal(e.loopDelay, true, "loop delay event arg");
        assert.equal(e.id, "gliding", "loop delay id");

        var delay = end - start;
        assert.ok(delay > 980 || delay < 1020, "execution time check: 1s = 1000ms, real: " + delay);
        assert.equal(sprite.positionX, 20, "x end position check");
        assert.equal(sprite.positionY, 50, "y end position check");

        done1();

        startTest2();
    };

    var start = new Date();
    b.execute(new SmartJs.Event.EventListener(asyncHandler1, this), "gliding");

    function startTest2() {
        //test position updates
        var spriteMock = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
        spriteMock._positionX = -10;
        spriteMock._positionY = -30;

        var positions = [];
        //override function
        spriteMock.setPosition = function (x, y) {
            //store positions
            positions.push({ x: x, y: y });
            this._positionX = x;
            this._positionY = y;
        };

        var b2 = new PocketCode.Model.GlideToBrick(device, spriteMock, { x: x, y: y, duration: duration });

        var asyncHandler2 = function (e) {
            var end = new Date();
            assert.equal(e.loopDelay, true, "check positions: loop delay event arg");
            assert.equal(e.id, "gliding2", "check positions: loop delay id");

            var delay = end - start;
            assert.ok(delay > 990 && delay < 1200, "check positions: execution time check: 1s = 1000ms, real: " + delay);
            assert.equal(sprite.positionX, 20, "check positions: x end position check");
            assert.equal(sprite.positionY, 50, "check positions: y end position check");

            var passed = true;
            for (var i = 1, l = positions.length; i < l; i++) {
                if (positions[i].x < positions[i - 1].x || positions[i].y < positions[i - 1].y) //I do not check for array length < 1 because this should never happen
                    passed = false;
            }
            //console.log(positions);
            assert.ok(passed, "check positions: continuous coordinates: " + JSON.stringify(positions));
            assert.ok(positions.length > 40, "amount of updates > 40: " + positions.length + " (this might not be an error on slow devices)");
            
            done2();

            startTest3();
        };

        var start = new Date();
        b2.execute(new SmartJs.Event.EventListener(asyncHandler2, this), "gliding2");
    }

    function startTest3() {
        //pause, resume, stop
        var spriteMock2 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
        spriteMock2._positionX = -10;
        spriteMock2._positionY = -30;

        var b3 = new PocketCode.Model.GlideToBrick(device, spriteMock2, { x: x, y: y, duration: duration });

        var asyncHandler3 = function (e) {
            //handler not called because the animation is stopped
            assert.ok(false, "stop was not called correctly");
            done3();
        };

        var sx, sy;
        var test_pause = function () {
            b3.pause();
            assert.ok(spriteMock2._positionX > -10, "pause: x position test");
            assert.ok(spriteMock2._positionY > -30, "pause: y position test");

            sx = spriteMock2._positionX;
            sy = spriteMock2._positionY;
            window.setTimeout(function () { test_resume(); }, 200);
        };

        var test_resume = function () {
            assert.equal(sx, spriteMock2._positionX, "resume: x not changed during paused state");
            assert.equal(sy, spriteMock2._positionY, "resume: y not changed during paused state");
            b3.resume();

            window.setTimeout(function () { test_stop(); }, 200);
        };

        var test_stop = function () {
            b3.stop();
            assert.ok(spriteMock2._positionX > sx, "stop: x position test");
            assert.ok(spriteMock2._positionY > sy, "stop: y position test");

            done3();
            b3.resume();  //should not work on stoped brick
        };

        b3.execute(new SmartJs.Event.EventListener(asyncHandler3, this), "gliding3");
        window.setTimeout(function () { test_pause(); }, 200);
    }

});


QUnit.test("GoBackBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);
    var layers = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');

    var b = new PocketCode.Model.GoBackBrick(device, sprite, { layers: layers });

    assert.ok(b._device === device && b._sprite === sprite && b._layers instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.GoBackBrick, "instance check");
    assert.ok(b.objClassName === "GoBackBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("ComeToFrontBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);

    var b = new PocketCode.Model.ComeToFrontBrick(device, sprite, { commentedOut: false });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ComeToFrontBrick, "instance check");
    assert.ok(b.objClassName === "ComeToFrontBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("VibrationBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var duration = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.VibrationBrick(device, sprite, { duration: duration });

    assert.ok(b._device === device && b._sprite === sprite && b._duration instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.VibrationBrick, "instance check");
    assert.ok(b.objClassName === "VibrationBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


/* PHYSICS BRICKS */
QUnit.test("SetPhysicsObjectTypeBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var physicsWorld = new PocketCode.PhysicsWorld(scene);
    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.SetPhysicsObjectTypeBrick(device, sprite, physicsWorld, { id: "id" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetPhysicsObjectTypeBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SetPhysicsObjectTypeBrick", "objClassName check");

    assert.equal(b._physicsType, PocketCode.PhysicsType.NONE, "default style: no bouncing: not defined");
    b = new PocketCode.Model.SetPhysicsObjectTypeBrick(device, sprite, physicsWorld, { physicsType: "FIXED" });
    assert.equal(b._physicsType, PocketCode.PhysicsType.FIXED, "style: fixed");
    b = new PocketCode.Model.SetPhysicsObjectTypeBrick(device, sprite, physicsWorld, { physicsType: "DYNAMIC" });
    assert.equal(b._physicsType, PocketCode.PhysicsType.DYNAMIC, "style: dynamic");
    b = new PocketCode.Model.SetPhysicsObjectTypeBrick(device, sprite, physicsWorld, { physicsType: "non-existent type" });
    assert.equal(b._physicsType, PocketCode.PhysicsType.NONE, "default style: no bouncing: non-existent type");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(!e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetVelocityBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetVelocityBrick(device, sprite, { x: x, y: y });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetVelocityBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SetVelocityBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(!e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetGravityBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var x = JSON.parse('{"type":"NUMBER","value":"23","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"34","right":null,"left":null}');

    var b = new PocketCode.Model.SetGravityBrick(device, sprite, scene, { x: x, y: y });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetGravityBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SetGravityBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(!e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetMassBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });    //PhysicsSprite
    var mass = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Model.SetMassBrick(device, sprite, { value: mass });

    assert.ok(b._device === device && b._sprite === sprite && b._mass instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetMassBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SetMassBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(!e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetBounceFactorBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var percentage = JSON.parse('{"type":"NUMBER","value":"71","right":null,"left":null}');

    var b = new PocketCode.Model.SetBounceFactorBrick(device, sprite, { percentage: percentage });

    assert.ok(b._device === device && b._sprite === sprite && b._bounceFactor instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetBounceFactorBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SetBounceFactorBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(!e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("SetFrictionBrick", function (assert) {

    var done1 = assert.async();

    var device = new PocketCode.MediaDevice(new PocketCode.SoundManager());
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);

    var sprite = new PocketCode.Model.PhysicsSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var friction = JSON.parse('{"type":"NUMBER","value":"53","right":null,"left":null}');

    var b = new PocketCode.Model.SetFrictionBrick(device, sprite, { percentage: friction });

    assert.ok(b._device === device && b._sprite === sprite && b._friction instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SetFrictionBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SetFrictionBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.ok(!e.loopDelay, "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

