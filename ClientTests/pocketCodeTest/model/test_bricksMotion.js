/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("bricksMotion.js");


QUnit.test("GlideToBrick", function (assert) {


    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var program = new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(program);
    var duration = JSON.parse('{"type":"NUMBER","value":"500","right":null,"left":null}');
    var b = new PocketCode.Bricks.WaitBrick(device, sprite, { duration: duration });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite, "brick created and properties set correctly");  // && b._duration === "duration" -> duration is parsed as formula 
    assert.ok(b instanceof PocketCode.Bricks.WaitBrick, "instance check");
    assert.ok(b.objClassName === "WaitBrick", "objClassName check");

    //alert(b._duration.calculate);
    assert.equal(b._duration.calculate(), 500, "formula created correctly");

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

