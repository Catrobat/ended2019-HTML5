/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/publishSubscribe.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksControl.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksControl.js");


QUnit.test("WaitBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var b = new PocketCode.Model.WaitBrick(device, sprite, { duration: duration });

    assert.ok(b._device === device && b._sprite === sprite && b._duration instanceof PocketCode.Formula, "brick created and properties set correctly");  // && b._duration === "duration" -> duration is parsed as formula 
    assert.ok(b instanceof PocketCode.Model.WaitBrick, "instance check");
    assert.ok(b.objClassName === "WaitBrick", "objClassName check");

    //alert(b._duration.calculate);
    assert.equal(b._duration.calculate(), 0.5, "formula created correctly");

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
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"0.4","right":null,"left":null}'));
        b.execute(l1, "s2");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"0.3","right":null,"left":null}'));
        b.execute(l1, "s3");
        b._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"0.2","right":null,"left":null}'));
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
    var b2 = new PocketCode.Model.WaitBrick(device, sprite, { duration: duration });
    var asyncHandler3 = function (e) {
        //count++;
        b2.stop();

        assert.ok(false, "brick NOT stopped");
        done3();    //this will throw an error if called more than once
    };

    var l2 = new SmartJs.Event.EventListener(asyncHandler3, this);

    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"0.05","right":null,"left":null}'));
    b2.execute(l2, "s1");
    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"0.045","right":null,"left":null}'));
    b2.execute(l2, "s2");
    b2._duration = new PocketCode.Formula(device, sprite, JSON.parse('{"type":"NUMBER","value":"0.043","right":null,"left":null}'));
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


//currently not supported by android
//QUnit.test("ResetTimerBrick", function (assert) {

//    assert.ok(false, "TODO: add tests for ResetTimerBrick as soon as this brick is supported");
//});


QUnit.test("NoteBrick", function (assert) {

    var b = new PocketCode.Model.NoteBrick("device", "sprite", { text: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._text === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.NoteBrick, "instance check");
    assert.ok(b.objClassName === "NoteBrick", "objClassName check");

    var id;
    var loopDelay;
    var h = function (e) {
        id = e.id;
        loopDelay = e.loopDelay;
    };

    b.execute(new SmartJs.Event.EventListener(h, this), "sdf");

    assert.equal(id, "sdf", "return handler dispatcht and id set correctly");
    assert.equal(loopDelay, undefined, "loop delay set correctly");
});


QUnit.test("ForeverBrick", function (assert) {

    assert.expect(7);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();

    var b = new PocketCode.Model.ForeverBrick("device", "sprite", 50, { id: "id" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._minLoopCycleTime === 50, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.ForeverBrick, "instance check");
    assert.ok(b.objClassName === "ForeverBrick", "objClassName check");

    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
            this.executed = 0;
            //this._delay = 100;
            this.loopDelay = false;

            this.onTestFinished = new SmartJs.Event.Event(this);
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                if (this.executed === 5) {  //helper to terminate this loop, inlcuding 5 waits
                    this.onTestFinished.dispatchEvent();
                }
                //var _self = this;
                //window.setTimeout(function () { _self._return(id, this.loopDelay) }, _self._delay);
                this._return(id, this.loopDelay);    //LOOP DELAY = FALSE
            },
            start: function () {
                this._stopped = false;
            },
            stop: function () {
                this._stopped = true;
            }
        });

        return TestBrick2;
    })();

    //test empty not possible
    //loop delay = false
    var bca = [];
    var tb = new TestBrick2("device", "sprite", { id: "id" });

    bca.push(tb);
    var neverCalled = function () {
        assert.ok(false, "forever loop does not call executed listener");
    };
    //without delay
    var testFinishedHandler1 = function (e) {
        b.stop();   //stop forever loop

        //async
        var finishTime = new Date();
        assert.equal(tb.executed, 5, "loop running continuously");
        var delay = finishTime - startTime;
        //console.log("running loop 5 times without loop delay = " + delay + "ms");
        assert.ok(delay < 50 /*&& delay <= 35*/, "threading: without loop delay");
        done1();
    };

    b.bricks = new PocketCode.Model.BrickContainer(bca);
    tb.onTestFinished.addEventListener(new SmartJs.Event.EventListener(testFinishedHandler1, this));
    var startTime = new Date();
    b.execute(new SmartJs.Event.EventListener(neverCalled, this), "forever");

    //with delay
    var testFinishedHandler2 = function (e) {
        b2.stop();  //stop forever loop

        //async
        var finishTime = new Date();
        assert.equal(tb.executed, 5, "loop delay: loop running continuously");
        var delay = finishTime - startTime;
        //console.log("running loop 5 times without loop delay = " + delay + "ms");
        assert.ok(delay >= 50 /*&& delay <= 120*/, "loop delay: execution time");
        done2();
    };

    var b2 = new PocketCode.Model.ForeverBrick("device", "sprite", 25, { id: "id" });
    var tb2 = new TestBrick2("device", "sprite", { id: "id" });
    tb2.loopDelay = true;
    bca = [];
    bca.push(tb2);
    b2.bricks = new PocketCode.Model.BrickContainer(bca);
    //var removed = tb.onTestFinished.removeEventListener(new SmartJs.Event.EventListener(testFinishedHandler1, this));
    //console.log("removed handler: " + removed);
    tb2.onTestFinished.addEventListener(new SmartJs.Event.EventListener(testFinishedHandler2, this));

    startTime = new Date();
    b2.execute(new SmartJs.Event.EventListener(neverCalled, this), "forever");

});


QUnit.test("IfThenElseBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var condTrue = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
    var b = new PocketCode.Model.IfThenElseBrick("device", sprite, { condition: condTrue });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite, "brick created and properties set correctly");  //condition is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Model.IfThenElseBrick, "instance check");
    assert.ok(b.objClassName === "IfThenElseBrick", "objClassName check");

    assert.throws(function () { b.ifBricks = []; }, Error, "ERROR: validating if-bricks setter");
    assert.throws(function () { b.elseBricks = []; }, Error, "ERROR: validating else-bricks setter");

    //check the condition is valid: only for this test case
    assert.ok(b._condition.calculate(), "condition checked -> always true");

    //execute empty containers: if
    var handler1Called = false;
    var handler1LoopDelay = false;
    var handler1CallId = undefined;

    var handler1 = function (e) {
        handler1Called = true;
        handler1LoopDelay = handler1LoopDelay || e.loopDelay;
        handler1CallId = e.id;
    };

    b.execute(new SmartJs.Event.EventListener(handler1, this), "if");
    assert.ok(handler1Called, "if bricks: empty  executed");
    assert.equal(handler1CallId, "if", "if: return id");
    assert.equal(handler1LoopDelay, false, "if: return loopDelay");

    //execute empty containers: else

    //re-init
    handler1Called = false;
    handler1LoopDelay = false;
    handler1CallId = undefined;
    var condFalse = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"2","right":null,"left":null}}');
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    //check the condition is valid: only for this test case
    b = new PocketCode.Model.IfThenElseBrick("device", sprite, { condition: condFalse });
    assert.equal(b._condition.calculate(), false, "2nd condition checked -> now false");

    b.execute(new SmartJs.Event.EventListener(handler1, this), "else");
    assert.ok(handler1Called, "else bricks: empty executed");
    assert.equal(handler1CallId, "else", "else: return id");
    assert.equal(handler1LoopDelay, false, "else: return loopDelay");


    //threaded bricks
    var ifBricks = [];
    var elseBricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                window.setTimeout(function () { this._return(id, true) }.bind(this), 100);
                //this._return(id, true);    //LOOP DELAY = FALSE
            },
            pause: function () {
                this.paused = true;
            },
            resume: function () {
                this.paused = false;
            },
            stop: function () {
                this.stopped = true;
            },
        });

        return TestBrick2;
    })();

    ifBricks.push(new TestBrick2("", "", {}));
    ifBricks.push(new TestBrick2("", "", {}));
    ifBricks.push(new TestBrick2("", "", {}));
    ifBricks.push(new TestBrick2("", "", {}));

    var b2 = new PocketCode.Model.IfThenElseBrick("device", sprite, { showElse: true, condition: condFalse });
    var bc = new PocketCode.Model.BrickContainer(ifBricks);    //container including bricks
    b2.ifBricks = bc;

    var asyncHandler = function (e) {
        assert.equal(e.id, "ifthenelse", "if-then-else: executed");
        assert.equal(e.loopDelay, true, "if-then-else: loop delay check");
        assert.deepEqual(b._pendingOps, {}, "pending ops cleared after onExecute");

        b2.execute(new SmartJs.Event.EventListener(function () { }, this), "ifthenelse");
        b2.stop();
        assert.equal(b2._ifBricks._bricks[0].stopped, true, "paused");  //our testbrick doesn't really stop, we verify if stop is called

        done1();
    };

    elseBricks = [];
    elseBricks.push(new TestBrick2("", "", {}));
    elseBricks.push(new TestBrick2("", "", {}));
    var bc2 = new PocketCode.Model.BrickContainer(elseBricks);
    b2.elseBricks = bc2;

    assert.equal(b2._ifBricks, bc, "if-bricks setter");
    assert.equal(b2._elseBricks, bc2, "else-bricks setter");

    b2.execute(new SmartJs.Event.EventListener(asyncHandler, this), "ifthenelse");
    b2.pause();
    assert.equal(b2._ifBricks._bricks[0].paused, true, "paused");
    b2.resume();
    assert.equal(!b2._ifBricks._bricks[1].paused, true, "resumed");

    //test without else path
    var b3 = new PocketCode.Model.IfThenElseBrick("device", sprite, { showElse: false, condition: condFalse });
    var elseBricks2 = [];
    elseBricks2.push(new TestBrick2("", "", {}));
    elseBricks2.push(new TestBrick2("", "", {}));
    var bc2 = new PocketCode.Model.BrickContainer(elseBricks2);
    b3.elseBricks = bc2;

    var returnHandler = function (e) {
        assert.equal(e.id, "ifThenWithoutElse", "if-then-else: executed (with disabled else path)");
        assert.equal(e.loopDelay, false, "if-then-else: loop delay check (with disabled else path)");
        assert.deepEqual(b._pendingOps, {}, "pending ops cleared after onExecute (with disabled else path)");
        done2();
    }
    b3.execute(new SmartJs.Event.EventListener(returnHandler, this), "ifThenWithoutElse");

});


QUnit.test("WaitUntilBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var conditionTrue = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
    var conditionFalse = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"2","right":null,"left":null}}');
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.WaitUntilBrick("device", sprite, 24, { condition: conditionTrue });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._delay === 24, "brick created and properties set correctly");   //timesToRepeat is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Model.WaitUntilBrick && b instanceof PocketCode.Model.ThreadedBrick, "instance check");
    assert.ok(b.objClassName === "WaitUntilBrick", "objClassName check");

    //validation = false
    var dateTime;

    var testFinishedHandler1 = function (e) {   //simulating 1st thread
        assert.equal(e.id, "id_1", "thread 1: event argument: id");
        assert.equal(e.loopDelay, false, "thread 1: event argument: loopDelay");
        done1();
    };
    var testFinishedHandler2 = function (e) {   //simulating 1st thread
        assert.equal(e.id, "id_1", "thread 1: event argument: id");
        assert.equal(e.loopDelay, false, "thread 1: event argument: loopDelay");
        done2();
    };
    b.execute(new SmartJs.Event.EventListener(testFinishedHandler1, this), "id_1");

    //condition = false
    b._condition = new PocketCode.Formula("device", sprite, conditionFalse);
    var testFinishedHandler3 = function (e) {   //simulating 2nd thread
        assert.equal(e.id, "id_2", "thread 2: event argument: id");
        assert.equal(e.loopDelay, false, "thread 2: event argument: loopDelay");
        assert.ok((new Date() - dateTime) > 50, "paused and resumed");

        b._condition = new PocketCode.Formula("device", sprite, conditionFalse);    //make sure both threads get executed even the condition is not met any more
        done3();
    };
    b.execute(new SmartJs.Event.EventListener(testFinishedHandler2, this), "id_1");
    b.execute(new SmartJs.Event.EventListener(testFinishedHandler3, this), "id_2");

    window.setTimeout(function () {
        b.pause();
        //set condition back to true: terminate both waiting conditions on resume
        b._condition = new PocketCode.Formula("device", sprite, conditionTrue);
    }, 10);

    dateTime = new Date();
    //window.setTimeout(function () {
    //    //set Condition to true: internally
    //    //var formulaTrue = new PocketCode.Formula("device", sprite, conditionTrue);

    //    //b._condition = formulaTrue;
    //}, 20);

    window.setTimeout(function () {
        b.resume();
    }, 50);

});


QUnit.test("RepeatBrick", function (assert) {

    assert.expect(9);   //init async asserts (to wait for)
    var done1 = assert.async();
    var done2 = assert.async();

    var nTimes = JSON.parse('{"type":"NUMBER","value":"6","right":null,"left":null}');
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.RepeatBrick("device", sprite, 24, { x: 1, y: 2, timesToRepeat: nTimes });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._minLoopCycleTime === 24, "brick created and properties set correctly");   //timesToRepeat is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Model.RepeatBrick, "instance check");
    assert.ok(b.objClassName === "RepeatBrick", "objClassName check");

    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
            this.executed = 0;
            this._delay = 10;
            this.loopDelay = false;

            //this.onTestFinished = new SmartJs.Event.Event(this);
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                //this.executed++;
                //if (this.executed === 6) {  //helper to terminate this loop, inlcuding 5 waits
                //    this.onTestFinished.dispatchEvent();
                //    return;
                //}
                //var _self = this;
                //window.setTimeout(function () { _self._return(id, true) }, _self._delay);
                this._return(id, this.loopDelay);
            },
            start: function () {
                this._stopped = false;
            },
            stop: function () {
                this._stopped = true;
            }
        });

        return TestBrick2;
    })();

    //test empty not possible
    //loop delay = false
    var bca = [];
    var tb = new TestBrick2("device", sprite, { id: "id" });

    bca.push(tb);
    //without delay
    var testFinishedHandler1 = function (e) {
        //async
        var finishTime = new Date();
        //assert.equal(tb.executed, 6, "loop running continuously");
        var delay = finishTime - startTime;
        //console.log("running loop 6 times without loop delay (5 delays) = " + delay + "ms");
        assert.ok(delay >= 10, "threading: without loop delay");
        assert.equal(e.id, "n_times", "id returned correctly");
        assert.equal(e.loopDelay, false, "loopDelay returned correctly");

        done1();
    };

    b.bricks = new PocketCode.Model.BrickContainer(bca);
    var startTime = new Date();
    b.execute(new SmartJs.Event.EventListener(testFinishedHandler1, this), "n_times");

    //with delay
    var testFinishedHandler2 = function (e) {
        //async
        var finishTime = new Date();
        //assert.equal(tb.executed, 6, "loop running continuously");
        var delay = finishTime - startTime;
        //console.log("running loop 6 times without loop delay (5 delays) = " + delay + "ms");
        assert.ok(delay >= 50, "loop delay: threading: including loop delay");
        assert.equal(e.id, "n_times2", "loop delay: id returned correctly");
        assert.ok(!e.loopDelay, "loop delay: delay returned correctly: handles correctly but return value is always false or undefined");

        done2();
    };

    var b2 = new PocketCode.Model.RepeatBrick("device", sprite, 25, { timesToRepeat: nTimes });
    var tb2 = new TestBrick2("device", "sprite", { id: "id" });
    tb2.loopDelay = true;
    bca = [];
    bca.push(tb2);
    b2.bricks = new PocketCode.Model.BrickContainer(bca);
    //var removed = tb.onTestFinished.removeEventListener(new SmartJs.Event.EventListener(testFinishedHandler1, this));
    //console.log("removed handler: " + removed);
    //tb2.onTestFinished.addEventListener(new SmartJs.Event.EventListener(testFinishedHandler2, this));

    b2.execute(new SmartJs.Event.EventListener(testFinishedHandler2, this), "n_times2");

});


QUnit.test("RepeatUntilBrick", function (assert) {

    var done1 = assert.async();

    var conditionFalse = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"2","right":null,"left":null}}');
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.RepeatUntilBrick("device", sprite, 24, { condition: conditionFalse });

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._minLoopCycleTime === 24, "brick created and properties set correctly");   //timesToRepeat is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Model.RepeatUntilBrick && b instanceof PocketCode.Model.LoopBrick, "instance check");
    assert.ok(b.objClassName === "RepeatUntilBrick", "objClassName check");
    assert.ok(b._condition instanceof PocketCode.Formula, "formula created");

    b.dispose();
    assert.ok(b._disposed, "disposed");
    //recreate
    b = new PocketCode.Model.RepeatUntilBrick("device", sprite, 24, { condition: conditionFalse });

    //validation = false
    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
            this.executed = 0;
            this._delay = 10;
            this.loopDelay = false;
        }

        TestBrick.prototype.merge({
            _execute: function (id) {
                this.executed++;
                this._return(id, this.loopDelay);
            },
            start: function () {
                this._stopped = false;
            },
            stop: function () {
                this._stopped = true;
            }
        });

        return TestBrick;
    })();

    var testBrick1 = new TestBrick("device", sprite, { id: "id" });
    var innerBricks = [testBrick1, new TestBrick("device", sprite, { id: "id" })];
    b.bricks = new PocketCode.Model.BrickContainer(innerBricks);

    var testFinishedHandler1 = function (e) {
        assert.equal(e.id, "n_times", "event argument: id");
        assert.equal(e.loopDelay, false, "event argument: loopDelay");
        assert.ok(testBrick1.executed > 0, "inner bricks executed until condition = true");

        done1();
    };
    b.execute(new SmartJs.Event.EventListener(testFinishedHandler1, this), "n_times");

    window.setTimeout(function () {
        //set Condition to true: internally
        var conditionTrue = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
        var formulaTrue = new PocketCode.Formula("device", sprite, conditionTrue);

        b._condition = formulaTrue;
    }, 20);

});


QUnit.test("SceneTransitionBrick (continue scene)", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s1"; // current scene
    scene._soundManager = new PocketCode.SoundManager();    //needed for scene transition: calld in scene->soundManager.isPlaying

    var scene2 = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene2._id = "s2"; //scene to start
    scene2._soundManager = new PocketCode.SoundManager();    //needed for scene transition: calld in scene->soundManager.isPlaying
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    gameEngine.__currentScene = scene;
    gameEngine._scenes[scene2._id] = scene2;
    gameEngine._scenes[scene._id] = scene;

    var b = new PocketCode.Model.SceneTransitionBrick(device, sprite, gameEngine, { sceneId: "s2" });
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed && !scene._disposed && !scene2._disposed && !gameEngine._disposed, "disposed without changing other objects");

    //recreate
    b = new PocketCode.Model.SceneTransitionBrick(device, sprite, gameEngine, { sceneId: "s2" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.SceneTransitionBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "SceneTransitionBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("StartSceneBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene._id = "s1"; // current scene
    scene._soundManager = new PocketCode.SoundManager();    //needed for scene transition: calld in scene->soundManager.isPlaying

    var scene2 = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    scene2._id = "s2"; //scene to start
    scene2._soundManager = new PocketCode.SoundManager();    //needed for scene transition: calld in scene->soundManager.isPlaying

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    gameEngine.__currentScene = scene;
    gameEngine._scenes[scene2._id] = scene2;
    gameEngine._scenes[scene._id] = scene;

    var b = new PocketCode.Model.StartSceneBrick(device, sprite, gameEngine, { sceneId: "s2" });
    b.dispose();
    assert.ok(b._disposed && !sprite._disposed && !scene._disposed && !scene2._disposed && !gameEngine._disposed, "disposed without changing other objects");

    //recreate
    b = new PocketCode.Model.StartSceneBrick(device, sprite, gameEngine, { sceneId: "s2" });

    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.StartSceneBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "StartSceneBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        done1();
    };
    b.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");

});


QUnit.test("CloneBrick", function (assert) {

    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();

    var latestCloneId;
    var mockScene = {
        cloneSprite: function (id) {
            latestCloneId = id;
        },
        onSpriteUiChange: new SmartJs.Event.Event(this)
    };

    var sprite = new PocketCode.Model.Sprite(gameEngine, mockScene, { id: "1", name: "spriteName", scripts: [] });

    var cloneBrick = new PocketCode.Model.CloneBrick(device, sprite, mockScene, { spriteId: "23" });

    assert.ok(cloneBrick._device === device && cloneBrick._sprite === sprite, "brick created and properties set correctly");
    assert.ok(cloneBrick instanceof PocketCode.Model.CloneBrick, "instance check");
    assert.ok(cloneBrick.objClassName === "CloneBrick", "objClassName check");

    //execute
    var handler = function (e) {
        assert.ok(true, "executed");
        //assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
        assert.equal(e.id, "thread_id", "threadId handled correctly");
        assert.equal(latestCloneId, "23");
        done1();
    };
    cloneBrick.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");
});


QUnit.test("DeleteCloneBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, gameEngine._soundManager, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var cloneBrick = new PocketCode.Model.DeleteCloneBrick(device, sprite, scene, { id: "2" });

    assert.ok(cloneBrick._device === device && cloneBrick._sprite === sprite, "brick created and properties set correctly");
    assert.ok(cloneBrick instanceof PocketCode.Model.DeleteCloneBrick && cloneBrick instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(cloneBrick.objClassName === "DeleteCloneBrick", "objClassName check");

    var deleteCloneHandlerOnSprite = function (e) {
        assert.equal(e.id, "thread_id", "call delete clone on sprite: threadId");
        assert.ok(e.loopDelay == undefined || e.loopDelay == false, "call delete clone on sprite: loopDelay");
        done1();
    };
    cloneBrick.execute(new SmartJs.Event.EventListener(deleteCloneHandlerOnSprite, this), "thread_id");

    cloneBrick.dispose();
    assert.ok(cloneBrick._disposed && !sprite._disposed && !scene._disposed && !gameEngine._disposed, "dispose without inpact on other objects");

    //recreate brick with sprite instanceof SpriteClone
    sprite = new PocketCode.Model.SpriteClone(gameEngine, scene, { id: "spriteId", name: "spriteName" }, {});
    cloneBrick = new PocketCode.Model.DeleteCloneBrick(device, sprite, scene, { id: "2" });

    var is = new PocketCode.ImageStore();   //recreate
    gameEngine._imageStore = is;

    //init tests
    var baseUrl = "_resources/images/",
    images = [
        { id: "s4", url: "imgHelper15.png", size: 2 },
        { id: "s5", url: "imgHelper16.png", size: 2 },
    ];

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(startTest));
    is.loadImages(baseUrl, images);

    var clone, sprite;
    function startTest() {
        scene.load(cloneScene); //global ressource defined in _resources/testDataProject
        scene.initializeSprites();  //images already loaded- initilaze look objects
        sprite = scene._sprites[0];

        scene.start();
        setTimeout(validateClone, 10);
    }

    function validateClone() {
        clone = scene._sprites[0];

        assert.equal(scene._sprites.length, 2, "clone added to list");
        var deleteCloneBrick = new PocketCode.Model.DeleteCloneBrick(device, clone, scene, { id: "2" });

        //execute
        var handler = function (e) {
            window.setTimeout(function () {
                assert.ok(clone._disposed, "disposed on delete (with delay)");
                done3();
            }, 100);
            //assert.equal(typeof e.loopDelay, "boolean", "loopDelay received");
            assert.equal(scene._sprites.length, 1, "clone deleted from list");
            done2();
        };
        deleteCloneBrick.execute(new SmartJs.Event.EventListener(handler, this), "thread_id");
    }

});


QUnit.test("StopBrick", function (assert) {

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, gameEngine._soundManager, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var b = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { type: PocketCode.StopType.THIS_SCRIPT });
    assert.ok(b._device === device && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.StopBrick && b instanceof PocketCode.Model.BaseBrick, "instance check");
    assert.ok(b.objClassName === "StopBrick", "objClassName check");
    assert.equal(b._type, PocketCode.StopType.THIS_SCRIPT, "type set: THIS");

    //type accessor
    b.type = PocketCode.StopType.THIS_SCRIPT;
    assert.equal(b.type, PocketCode.StopType.THIS_SCRIPT, "getter type (after resetting existing stop script type)");

    b.type = PocketCode.StopType.OTHER_SCRIPTS;
    assert.equal(b.type, PocketCode.StopType.OTHER_SCRIPTS, "setter/getter type (change type)");
    assert.throws(function () { b.type = 24; }, Error, "ERROR: invalid type (at setter)");

    b.dispose();
    assert.ok(b._disposed, "disposed");
    //recreate
    b = new PocketCode.Model.StopBrick(device, sprite, "first", "s01", { type: PocketCode.StopType.THIS_SCRIPT });

    assert.ok(typeof sprite.stopAllScripts == "function", "stopScripts: sprite interface check");
    var stopScriptsCalled = 0,
        stoppedScriptsExceptId;
    sprite.stopAllScripts = function (id) { //override
        stopScriptsCalled++;
        stoppedScriptsExceptId = id;
    }

    var c = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { type: PocketCode.StopType.ALL });
    assert.equal(c._type, PocketCode.StopType.ALL, "type set: ALL");

    var d = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { type: PocketCode.StopType.OTHER_SCRIPTS });
    assert.equal(d._type, PocketCode.StopType.OTHER_SCRIPTS, "type set: OTHER");

    //execute
    var valid = 0;
    var handlerThis = function (e) {
        assert.ok(true, "THIS: executed");
        assert.ok(e.loopDelay == undefined || typeof e.loopDelay == "boolean", "THIS: loopDelay received");
        assert.equal(e.id, "thread_id", "THIS; threadId handled correctly");
    };
    var handlerAll = function (e) {
        valid++;
    };
    var handlerOther = function (e) {
        assert.ok(true, "OTHER: executed");
        assert.ok(e.loopDelay == undefined || typeof e.loopDelay == "boolean", "OTHER: loopDelay received");
        assert.equal(e.id, "thread_id", "OTHER: threadId handled correctly");
    };
    b.execute(new SmartJs.Event.EventListener(handlerThis, this), "thread_id");

    c.execute(new SmartJs.Event.EventListener(handlerAll, this), "thread_id");
    assert.equal(valid, 0, "ALL: script stopped: no executed handler called");

    d.execute(new SmartJs.Event.EventListener(handlerOther, this), "thread_id");

});


QUnit.test("StopBrick: type THIS_SCRIPT: interaction with bricks after the stop & the current script block", function (assert) {
    //stopscript THIS works like a retur statement in common programming languages: the brick stops all bricks 
    //coming afterward in the same script block from getting executed. The script itself have to trigger a return 
    //to notify waiting bricks like BroadcastAndWait, ChangeBackgroundAndWait, .. to continue executing

    var done1 = assert.async();

    //to verify if this brick gets executed
    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Model.BaseBrick, false);

        function TestBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, { commentedOut: false });
            this.executed = 0;
        }

        TestBrick.prototype.merge({
            _execute: function () {
                this.executed++;
                this._return(true);
            },
        });

        return TestBrick;
    })();


    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, gameEngine._soundManager, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var script = new PocketCode.Model.ScriptBlock(device, sprite, { commentedOut: false });
    var bricks = script._bricks._bricks;
    bricks.push(new TestBrick(device, sprite));
    var b = new PocketCode.Model.StopBrick(device, sprite, scene, "s01", { type: PocketCode.StopType.THIS_SCRIPT });
    bricks.push(b);
    bricks.push(new TestBrick(device, sprite));

    var onExecHandler = function (e) {
        assert.ok(true, "executed called if stopScript is part of the script");
        assert.equal(e.loopDelay, true, "loopDelay");   //defined as true in our test brick
        assert.equal(bricks[0].executed, true, "brevious (bricks before) are executed");
        assert.equal(bricks[2].executed, false, "next (bricks after) are NOT executed");

        done1();
    }
    script.execute(new SmartJs.Event.EventListener(onExecHandler, this), "_id");

});


QUnit.test("StopBrick: type OTHER_SCRIPTS: simultaneous startet scripts", function (assert) {
    //behavior: two scripts are started at the same time by dispatching an event or callback from publish-subsribe-broker
    //one of the scripts include a stop OTHER brick.. test makes sure all scripts (even if not started executing) are notified 
    //about the stop

    var done1 = assert.async();

    //to verify if this brick gets executed
    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Model.BaseBrick, false);

        function TestBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, { commentedOut: false });
            this.executed = 0;
        }

        TestBrick.prototype.merge({
            _execute: function () {
                this.executed++;
                this._return(true);
            },
        });

        return TestBrick;
    })();


    var gameEngine = new PocketCode.GameEngine();
    gameEngine._collisionManager = new PocketCode.CollisionManager(400, 200);  //make sure collisionMrg is initialized before calling an onStart event
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    gameEngine._scenes["id"] = scene;   //necessary to stop scene
    gameEngine._currentScene = scene; //set internal: tests only
    gameEngine._startScene = scene;

    scene._background = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });  //to avoid error on start
    //simulate project loaded for tests
    gameEngine._resourcesLoaded = true;
    gameEngine._scenesLoaded = true;
    gameEngine.projectReady = true;

    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });

    var script1 = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", {}, scene.onStart);
    var bricks1 = script1._bricks._bricks;
    var b = new PocketCode.Model.StopBrick("device", sprite, scene, "s01", { type: PocketCode.StopType.OTHER_SCRIPTS });
    bricks1.push(b);
    bricks1.push(new TestBrick("device", "sprite"));

    var script2 = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", {}, scene.onStart);
    var bricks2 = script2._bricks._bricks;
    bricks2.push(new TestBrick("device", "sprite"));

    //add scripts to sprite to make sure stop() is called
    sprite._scripts.push(script1);
    sprite._scripts.push(script2);

    var onExecHandler1 = function (e) {
        if (e.executionState == PocketCode.ExecutionState.RUNNING) {
            assert.ok(true, "script1 stated executing");
        }
        else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
            assert.ok(true, "script1 stopped executing");
        }
    }
    script1.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(onExecHandler1, this), "_id1");

    var onExecHandler2 = function (e) {
        if (e.executionState == PocketCode.ExecutionState.RUNNING) {
            assert.ok(true, "script2 stated executing");
        }
        else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
            assert.ok(true, "script2 stopped executing");
            assert.equal(bricks2[0].executed, 0, "bricks in 2nd scripts are stopped before execution");

            done1();
        }
    }
    script2.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(onExecHandler2, this), "_id1");

    gameEngine.runProject();

});
