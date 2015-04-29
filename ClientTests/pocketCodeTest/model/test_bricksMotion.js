/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksMotion.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("bricksMotion.js");


QUnit.test("PlaceAtBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.PlaceAtBrick(device, sprite, { x: x, y: y });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.PlaceAtBrick, "instance check");
    assert.ok(b.objClassName === "PlaceAtBrick", "objClassName check");

    //execute
    var handler = function(e) {
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetXBrick(device, sprite, { value: x });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetXBrick, "instance check");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.SetYBrick(device, sprite, { value: y });

    assert.ok(b._device === device && b._sprite === sprite && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.SetYBrick, "instance check");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var x = JSON.parse('{"type":"NUMBER","value":"3","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeXBrick(device, sprite, { value: x });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeXBrick, "instance check");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var y = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.ChangeYBrick(device, sprite, { value: y });

    assert.ok(b._device === device && b._sprite === sprite && b._y instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ChangeYBrick, "instance check");
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

QUnit.test("IfOnEdgeBounceBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.IfOnEdgeBounceBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.IfOnEdgeBounceBrick, "instance check");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var steps = JSON.parse('{"type":"NUMBER","value":"14","right":null,"left":null}');

    var b = new PocketCode.Bricks.MoveNStepsBrick(device, sprite, { steps: steps });

    assert.ok(b._device === device && b._sprite === sprite && b._steps instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.MoveNStepsBrick, "instance check");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var degrees = JSON.parse('{"type":"NUMBER","value":"45","right":null,"left":null}');

    var b = new PocketCode.Bricks.TurnLeftBrick(device, sprite, { degrees: degrees });

    assert.ok(b._device === device && b._sprite === sprite && b._degrees instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.TurnLeftBrick, "instance check");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var degrees = JSON.parse('{"type":"NUMBER","value":"30","right":null,"left":null}');

    var b = new PocketCode.Bricks.TurnRightBrick(device, sprite, { degrees: degrees });

    assert.ok(b._device === device && b._sprite === sprite && b._degrees instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.TurnRightBrick, "instance check");
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

QUnit.test("PointInDirectionBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var degrees = JSON.parse('{"type":"NUMBER","value":"0","right":null,"left":null}');

    var b = new PocketCode.Bricks.PointInDirectionBrick(device, sprite, { degrees: degrees });

    assert.ok(b._device === device && b._sprite === sprite && b._degrees instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.PointInDirectionBrick, "instance check");
    assert.ok(b.objClassName === "PointInDirectionBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("PointToBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var spriteId = "spriteId";

    var b = new PocketCode.Bricks.PointToBrick(device, sprite, { spriteId: spriteId });

    assert.ok(b._device === device && b._sprite === sprite && b._spriteId === spriteId, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.PointToBrick, "instance check");
    assert.ok(b.objClassName === "PointToBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});

QUnit.test("GlideToBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    //^^ initialized with x/y = 0/0
    sprite._positionX = -10;
    sprite._positionY = -30;

    var x = JSON.parse('{"type":"NUMBER","value":"20","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"50","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');

    var b = new PocketCode.Bricks.GlideToBrick(device, sprite, { x: x, y: y, duration: duration });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula && b._duration instanceof PocketCode.Formula, "brick created and properties set correctly");  // && b._duration === "duration" -> duration is parsed as formula 
    assert.ok(b instanceof PocketCode.Bricks.GlideToBrick, "instance check");
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
        assert.ok(delay > 990, "execution time check: 1s = 1000ms, real: " + delay);
        assert.equal(sprite.positionX, 20, "x end position check");
        assert.equal(sprite.positionY, 50, "y end position check");

        done1();
    };
    var l1 = new SmartJs.Event.EventListener(asyncHandler1, this);

    var start = new Date();
    b.execute(l1, "gliding");

    //test position updates
    var spriteMock = new PocketCode.Model.Sprite(program);
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

    var b2 = new PocketCode.Bricks.GlideToBrick(device, spriteMock, { x: x, y: y, duration: duration });

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
    };
    var l2 = new SmartJs.Event.EventListener(asyncHandler2, this);

    var start = new Date();
    b2.execute(l2, "gliding2");

    //pause, resume, stop
    var spriteMock2 = new PocketCode.Model.Sprite(program);
    spriteMock2._positionX = -10;
    spriteMock2._positionY = -30;

    var b3 = new PocketCode.Bricks.GlideToBrick(device, spriteMock2, { x: x, y: y, duration: duration });

    var asyncHandler3 = function (e) {
        //handler not called because the animation is stopped
        assert.ok(false, "stop was not called correctly");
        done3();
    };
    var l3 = new SmartJs.Event.EventListener(asyncHandler3, this);


    var x, y;

    var test_pause = function () {
        b3.pause();
        assert.ok(spriteMock2._positionX > -10, "pause: x position test");
        assert.ok(spriteMock2._positionY > -30, "pause: y position test");

        x = spriteMock2._positionX;
        y = spriteMock2._positionY;
        window.setTimeout(function () { test_resume(); }, 200);
    };

    var test_resume = function () {
        assert.equal(x, spriteMock2._positionX, "resume: x not changed during paused state");
        assert.equal(y, spriteMock2._positionY, "resume: y not changed during paused state");
        b3.resume();

        window.setTimeout(function () { test_stop(); }, 200);
    };

    var test_stop = function () {
        b3.stop();
        assert.ok(spriteMock2._positionX > x, "stop: x position test");
        assert.ok(spriteMock2._positionY > y, "stop: y position test");

        done3();
        b3.resume();  //should not work on stoped brick
    };

    b3.execute(l3, "gliding3");
    window.setTimeout(function () { test_pause(); }, 200);

});

QUnit.test("GoBackBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var layers = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');

    var b = new PocketCode.Bricks.GoBackBrick(device, sprite, { layers: layers });

    assert.ok(b._device === device && b._sprite === sprite && b._layers instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.GoBackBrick, "instance check");
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
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);

    var b = new PocketCode.Bricks.ComeToFrontBrick(device, sprite);

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.ComeToFrontBrick, "instance check");
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

    var device = new PocketCode.Device(new PocketCode.SoundManager("ID"));
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program);
    var duration = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.VibrationBrick(device, sprite, {duration: duration});

    assert.ok(b._device === device && b._sprite === sprite && b._duration instanceof PocketCode.Formula, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Bricks.VibrationBrick, "instance check");
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
