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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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
    //var done1 = assert.async();
    //var done2 = assert.async();
    //var done3 = assert.async();

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);

    var x = JSON.parse('{"type":"NUMBER","value":"20","right":null,"left":null}');
    var y = JSON.parse('{"type":"NUMBER","value":"50","right":null,"left":null}');
    var duration = JSON.parse('{"type":"NUMBER","value":"5","right":null,"left":null}');

    var b = new PocketCode.Bricks.GlideToBrick(device, sprite, { x: x, y: y, duration: duration });

    assert.ok(b._device === device && b._sprite === sprite && b._x instanceof PocketCode.Formula && b._y instanceof PocketCode.Formula && b._duration instanceof PocketCode.Formula, "brick created and properties set correctly");  // && b._duration === "duration" -> duration is parsed as formula 
    assert.ok(b instanceof PocketCode.Bricks.GlideToBrick, "instance check");
    assert.ok(b.objClassName === "GlideToBrick", "objClassName check");

    //alert(b._duration.calculate);
    assert.equal(b._duration.calculate(), 5, "formula created correctly");


    //TODO: 
    return;



    var asyncHandler1 = function (e) {
        assert.equal(e.loopDelay, false, "loop delay event arg");
        assert.equal(e.id, "waitPlease", "loop delay id");
        done1();

        test2();
    };
    var l1 = new SmartJs.Event.EventListener(asyncHandler1, this);
    b.execute(l1, "waitPlease");

    //multiple calls
    var s1, s2, s3, s4;
    var asyncHandler2 = function (e) {

        switch (e.id) {
            case "s1":
                s1 = new Date();
                break;
            case "s2":
                s2 = new Date();
                break;
            case "s3":
                s3 = new Date();
                break;
            case "s4":
                s4 = new Date();
                break;
        }

        if (s1 != undefined && s2 != undefined && s3 != undefined && s4 != undefined) {
            s1 = new Date() - s1;
            s2 = new Date() - s2;
            s3 = new Date() - s3;
            s4 = new Date() - s4;

            assert.ok(s1 < s2 && s2 < s3 && s3 < s4, "testing threaded calls");
            done2();

        }
    };

    l1 = new SmartJs.Event.EventListener(asyncHandler2, this);

    var test2 = function () {
        b.execute(l1, "s1");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"400","right":null,"left":null}'));
        b.execute(l1, "s2");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"300","right":null,"left":null}'));
        b.execute(l1, "s3");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"200","right":null,"left":null}'));
        b.execute(l1, "s4");

        //test pause
        b.pause();
        var po = b._pendingOps;
        var set = true;
        for (var o in po) {
            set = set && po[o].timer._paused;
        }
        assert.ok(set, "all timers paused");

        b.resume();
        var set = false;
        for (var o in po) {
            set = set || po[o].timer._paused;
        }
        assert.ok(!set, "all timers resumed");

    };

    //var count = 0;
    var b2 = new PocketCode.Bricks.WaitBrick(device, sprite, { duration: duration });
    var asyncHandler3 = function (e) {
        //count++;
        b2.stop();

        assert.ok(false, "brick NOT stopped");
        done3();    //this will throw an error if called more than once
    };

    var l2 = new SmartJs.Event.EventListener(asyncHandler3, this);

    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"50","right":null,"left":null}'));
    b2.execute(l2, "s1");
    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"45","right":null,"left":null}'));
    b2.execute(l2, "s2");
    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"43","right":null,"left":null}'));
    b2.execute(l2, "s3");
    //b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"100","right":null,"left":null}'));
    //b2.execute(l1, "s4");
    b2.stop();

    var timeoutId = undefined;
    var po = b2._pendingOps;
    for (var o in po) {
        timeoutId = timeoutId || po[o].timer._timeoutId;
    }

    assert.ok(timeoutId === undefined, "all timers stopped");
    //assert.ok(true, "brick stopped");
    done3();    //this will throw an error if called more than once

});

QUnit.test("GoBackBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var program = new PocketCode.Model.Program();
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
    var program = new PocketCode.Model.Program();
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


