/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksEvent.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksEvent.js");


QUnit.test("WhenProgramStartBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._collisionManager = new PocketCode.CollisionManager(400, 200);  //make sure collisionMrg is initialized before calling an onStart event
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    gameEngine._scenes["id"] = scene;   //necessary to stop scene
    gameEngine._currentScene = scene; //set internal: tests only
    gameEngine._startScene = scene;

    scene._background = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });  //to avoid error on start
    gameEngine.projectReady = true;

    var b = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", { x: 1, y: 2 }, scene.onStart);
    b.dispose();
    assert.equal(b._disposed, true, "disposed");

    b = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", { id: "testId", x: 1, y: 2 }, scene.onStart);
    scene._background._scripts.push(b);
    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenProgramStartBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenProgramStartBrick", "objClassName check");

    //test empty container
    var listener;
    var handlerCalled = 0;
    var handler = function (e) {
        handlerCalled++;
        if (e.executionState == PocketCode.ExecutionState.RUNNING) {
            assert.ok(true, "onExecutionStateChange called: running");
        }
        else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
            assert.ok(true, "onExecutionStateChange called: stopped");
            assert.equal(handlerCalled, 2, "both onExecutionStateChange events called");
            runAsyncTests();
        }
        else
            assert.ok(false, "wrong executionState");
    };

    listener = new SmartJs.Event.EventListener(handler, this);
    b.onExecutionStateChange.addEventListener(listener);

    //simulate project loaded for tests
    gameEngine._resourcesLoaded = true;
    gameEngine._scenesLoaded = true;
    gameEngine.runProject();


    //runAsyncTests();
    function runAsyncTests() {
        //reinit 
        b.onExecutionStateChange.removeEventListener(listener);
        gameEngine.stopProject();

        //add a brick container
        var bricks = [];
        var TestBrick2 = (function () {
            TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

            function TestBrick2(device, sprite) {
                PocketCode.Model.ThreadedBrick.call(this, device, sprite, { commentedOut: false });
                this.executed = 0;
            }

            TestBrick2.prototype.merge({
                _execute: function (id) {
                    this.executed++;
                    window.setTimeout(function () { this._return(id, false) }.bind(this), 100);
                    //this._return(id, false);    //LOOP DELAY = FALSE
                },
            });

            return TestBrick2;
        })();

        bricks.push(new TestBrick2("", ""));
        bricks.push(new TestBrick2("", ""));
        bricks.push(new TestBrick2("", ""));
        bricks.push(new TestBrick2("", ""));

        b.bricks = new PocketCode.Model.BrickContainer(bricks);    //container including bricks

        var asyncHandlerCalled = 0,
            asyncHandler = function (e) {
                asyncHandlerCalled++;
                if (e.executionState == PocketCode.ExecutionState.RUNNING) {
                    assert.ok(true, "onExecutionStateChange called: running");
                }
                else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
                    assert.ok(true, "onExecutionStateChange called: stopped");
                    assert.equal(asyncHandlerCalled, 2, "both onExecutionStateChange events called");
                    done1();
                }
                else
                    assert.ok(false, "wrong executionState");
            };

        b.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));

        gameEngine.runProject();

        //gameEngine.stopProject();

        //gameEngine.runProject();
    }

});


QUnit.test("WhenActionBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._sprites.push(sprite);    //add to receive events
    assert.throws(function () { var b = new PocketCode.Model.WhenActionBrick("device", sprite, { action: "action" }, { spriteTouched: scene.onSpriteTappedAction }); }, Error, "ERROR: invalid action");
    assert.throws(function () { var b = new PocketCode.Model.WhenActionBrick("device", sprite, { action: "spriteTouched" }, { action: scene.onSpriteTappedAction }); }, Error, "ERROR: invalid action event");

    var b = new PocketCode.Model.WhenActionBrick("device", sprite, { action: PocketCode.UserActionType.SPRITE_TOUCHED }, { spriteTouched: scene.onSpriteTappedAction });

    b.dispose();
    assert.equal(b._disposed, true, "dispose called");

    var actions = {
        spriteTouched: scene.onSpriteTappedAction,
        touchStart: scene.onSpriteTappedAction, //we use the same event to make sure the listerners get removed when changing the action
    };
    b = new PocketCode.Model.WhenActionBrick("device", sprite, { action: "spriteTouched" }, actions);
    assert.ok(b._device === "device" && b._sprite === sprite && b._actionEvent instanceof SmartJs.Event.Event, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenActionBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenActionBrick", "objClassName check");

    assert.equal(b.action, PocketCode.UserActionType.SPRITE_TOUCHED, "action getter (setter tested within cntr)");
    b.action = PocketCode.UserActionType.SPRITE_TOUCHED; //to make sure
    assert.equal(b.action, PocketCode.UserActionType.SPRITE_TOUCHED, "action getter (same action)");
    b.action = PocketCode.UserActionType.TOUCH_START; //to make sure
    assert.equal(b.action, PocketCode.UserActionType.TOUCH_START, "action getter (other action)");

    //test empty container
    var executed = 0;
    var executionStateHandler = function () {
        executed++;
    };

    b.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(executionStateHandler, this));
    scene.onSpriteTappedAction.dispatchEvent({ sprite: sprite });
    assert.equal(executed, 2, "executionState handler called (twice: begin + end)");

    b.onExecutionStateChange.removeEventListener(new SmartJs.Event.EventListener(executionStateHandler, this));

    //add a brick container
    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, {});
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                //var _self = this;
                window.setTimeout(function () { this._return(id, false) }.bind(this), 100);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));

    b.bricks = new PocketCode.Model.BrickContainer(bricks);    //container including bricks

    var asyncHandler = function (e) {
        if (e.executionState == PocketCode.ExecutionState.RUNNING) {
            assert.ok(true, "onExecutionStateChange called: including threaded bricks (running)");
            done1();
        }
        else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
            assert.ok(true, "onExecutionStateChange called: including threaded bricks (stopped)");
            var check = true;
            for (var i = 0, l = bricks.length; i < l; i++)
                if (bricks[i].executed == 0)
                    check = false;

            assert.ok(check, "all inner bricks executed");
            done2();    //to make sure both events are dispatched
        }
        else
            assert.ok(false, "wrong executionState");
    };
    b.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    scene.onSpriteTappedAction.dispatchEvent({ sprite: sprite });
    //}
});


QUnit.test("WhenBroadcastReceiveBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.WhenBroadcastReceiveBrick("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenBroadcastReceiveBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenBroadcastReceiveBrick", "objClassName check");

    b.dispose();
    assert.ok(broadcastMgr._subscriptions["s12"].length == 0, "unsubscribe on dispose");
    assert.ok(b._disposed && !broadcastMgr._disposed, "disposed without disposing broadcast manager");

    //recreate brick
    b = new PocketCode.Model.WhenBroadcastReceiveBrick("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });

    //test empty container
    var listener;
    var handlerCalled = 0;
    var broadcastHandler = function (e) {
        if (e.executionState == PocketCode.ExecutionState.RUNNING) {
            assert.ok(true, "onExecutionStateChange called: including threaded bricks (running)");
            done1();
        }
        else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
            handlerCalled++;
            assert.ok(handlerCalled === 1, "executed handler called (once)");

            b.onExecutionStateChange.removeEventListener(listener);
            runTests2();
        }
        else
            assert.ok(false, "invalid executionstate detected");
    };
    listener = new SmartJs.Event.EventListener(broadcastHandler, this);
    b.onExecutionStateChange.addEventListener(listener);

    broadcastMgr.publish("s12");

    function runTests2() {
        //add a brick container
        var bricks = [];
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
                },
            });

            return TestBrick2;
        })();

        bricks.push(new TestBrick2("", "", {}));
        bricks.push(new TestBrick2("", "", {}));
        bricks.push(new TestBrick2("", "", {}));
        bricks.push(new TestBrick2("", "", {}));

        b.bricks = new PocketCode.Model.BrickContainer(bricks);    //container including bricks

        var listener;
        var asyncHandler = function (e) {
            if (e.executionState == PocketCode.ExecutionState.RUNNING)
                return;
            assert.equal(e.executionState, PocketCode.ExecutionState.STOPPED, "onExecutionStateChange called: including threaded bricks");

            b.onExecutionStateChange.removeEventListener(listener);
            done2();
            runTests3();
        };
        listener = new SmartJs.Event.EventListener(asyncHandler, this);
        b.onExecutionStateChange.addEventListener(listener);
        broadcastMgr.publish("s12");
    }

    //broadcast and wait
    function runTests3() {
        var asyncHandler2Called = 0;
        var listener;
        var asyncHandler2 = function (e) {
            if (e.executionState == PocketCode.ExecutionState.RUNNING)
                return;
            asyncHandler2Called++;  //only called on stopp
            assert.ok(true, "onExecutionStateChange called: including threaded bricks");

            b.onExecutionStateChange.removeEventListener(listener);
        };
        listener = new SmartJs.Event.EventListener(asyncHandler2, this);
        b.onExecutionStateChange.addEventListener(listener);

        var waitCallback = function (e) {
            assert.equal(asyncHandler2Called, 1, "wait callback called before executed handler");

            var valid = true,
                bricks = b._bricks._bricks; //in brick container
            for (var i = 0, l = bricks.length; i < l; i++)
                if (bricks[i].executed != 2)
                    valid = false;
            assert.equal(valid, true, "all bricks executed before calling broadcast-wait callback");
            assert.ok(true, "wait callback executed");
            done3();
        };
        broadcastMgr.publish("s12", waitCallback);
    }

});

QUnit.test("BroadcastBrick", function (assert) {

    var done1 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastId: "s12", andWait: false });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._broadcastId === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.BroadcastBrick, "instance check");
    assert.ok(b.objClassName === "BroadcastBrick", "objClassName check");

    b.dispose();
    assert.ok(b._disposed && !broadcastMgr._disposed, "disposed without disposing the broadcast manager");
    b = new PocketCode.Model.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastId: "s12", andWait: false });

    var id;
    var loopDelay;
    var handler = function (e) {
        id = e.id;
        loopDelay = e.loopDelay;
    };
    var count = 0;
    var h2 = function () { //for broadcastMrg listener
        count++;
        assert.equal(count, 1, "broadcast was handled by broadcast manager");
        done1();
    };

    broadcastMgr.subscribe("s12", h2);
    b.execute(new SmartJs.Event.EventListener(handler, this), "sdf");

    assert.equal(id, "sdf", "return handler dispatched and id set correctly");
    assert.equal(loopDelay, false, "loop delay set correctly");
});


QUnit.test("BroadcastAndWaitBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);

    var b = new PocketCode.Model.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastId: "s12", andWait: true});

    var tb1 = new PocketCode.Model.WhenBroadcastReceiveBrick("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
            this.executed = 0;
            this._delay = 100;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                window.setTimeout(function () { this._return(id, true) }.bind(this), this._delay);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    //one subscriber
    var tb2 = new TestBrick2("", "", {});
    tb1._bricks = new PocketCode.Model.BrickContainer([tb2]);

    var handler = function (e) {  //async
        assert.equal(e.id, "sdf", "return handler dispatched and id set correctly");
        assert.equal(e.loopDelay, true, "loop delay set correctly");

        done1();
    };

    b.execute(new SmartJs.Event.EventListener(handler, this), "sdf");

});

QUnit.test("WhenConditionMetBrick", function (assert) {

    var done1 = assert.async();

    var cond = JSON.parse('{"type":"NUMBER","value":"0","right":null,"left":null}');

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.WhenConditionMetBrick("device", sprite, 24, { condition: cond }, scene.onStart);

    assert.ok(b._device === "device" && b._sprite instanceof PocketCode.Model.Sprite && b._cycleTime === 24, "brick created and properties set correctly");   //timesToRepeat is parsed to get a formula object
    assert.ok(b instanceof PocketCode.Model.WhenConditionMetBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenConditionMetBrick", "objClassName check");

    //assert.equal(b._condition.calculate(), false, "condition checked -> false");  //this will only check the formula = unnecessary assert

    cond = JSON.parse('{"type":"NUMBER","value":"1","right":null,"left":null}');
    b._condition = new PocketCode.Formula("device", sprite, cond);

    //assert.ok(b._condition.calculate(), "2nd condition checked -> true");

    //add a brick container
    var bricks = [];
    var TestBrick = (function () {
        TestBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick(device, sprite) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, { commentedOut: false });
            this.executed = 0;
        }

        TestBrick.prototype.merge({
            _execute: function (id) {
                this.executed++;
                window.setTimeout(function () { this._return(id, false) }.bind(this), 80);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick;
    })();

    var tb1 = new TestBrick("", "");
    bricks.push(tb1);

    b.bricks = new PocketCode.Model.BrickContainer(bricks);    //container including bricks

    scene.onStart.dispatchEvent();  //make sure brick is active

    window.setTimeout(function () {
        assert.equal(tb1.executed, 1, "executed");
        runPause();
    }, 30);

    function runPause() {
        b.pause();
        //tb1.executed = 0;
        b._previousMet = false;

        window.setTimeout(function () {
            assert.equal(tb1.executed, 1, "paused");
            runResume();
        }, 40);
    }

    function runResume() {
        b.resume();

        window.setTimeout(function () {
            assert.equal(tb1.executed, 2, "Resume executed");
            runStop();
        }, 50);


    }
    function runStop() {
        b.stop();
        tb1.executed = 0;
        window.setTimeout(function () {
            assert.equal(tb1.executed, 0, "Stop executed");
            done1();
        }, 40);

    }
});


QUnit.test("WhenCollisionBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var physicsWorld = new PocketCode.PhysicsWorld(scene);
    var sprite = { id: "id1" };
    var spriteId2 = "id2";
    var b = new PocketCode.Model.WhenCollisionBrick("device", sprite, physicsWorld, { spriteId: spriteId2 });

    assert.ok(b._device === "device" && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenCollisionBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenCollisionBrick", "objClassName check");

    //assert.ok(false, "TODO");
    //done1();
    //return;

    var listener;
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;

    };
    listener = new SmartJs.Event.EventListener(handler, this);
    b.onExecutionStateChange.addEventListener(listener);
    physicsWorld._handleDetectedCollision(physicsWorld._registeredCollisions[sprite.id][spriteId2]);

    assert.equal(handlerCalled, 2, "brick executed on detected collision");
    b.onExecutionStateChange.removeEventListener(listener);

    //add a brick container
    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                //var _self = this;
                window.setTimeout(function () { this._return(id, false) }.bind(this), 100);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));
    bricks.push(new TestBrick2("", "", {}));

    b.bricks = new PocketCode.Model.BrickContainer(bricks);    //container including bricks


    var asyncHandlerCalled = 0,
        asyncHandler = function () {
            asyncHandlerCalled++;
        };
    b.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    physicsWorld._handleDetectedCollision(physicsWorld._registeredCollisions[sprite.id][spriteId2]);

    assert.ok(true, "onExecutionStateChange called: including threaded bricks");
    done1();

});


QUnit.test("WhenBackgroundChangesToBrick", function (assert) {
    //assert.ok(false, "TODO");
    var done1 = assert.async();

    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.BackgroundSprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    scene._background = sprite;
    //gleiche lookid wie probOpject??????
    var lookId = "lookId";
    var b = new PocketCode.Model.WhenBackgroundChangesToBrick(device, sprite, scene, { lookId: "lookId" });

    assert.ok(b._device === device && b._sprite === sprite && b._lookId === "lookId", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenBackgroundChangesToBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenBackgroundChangesToBrick", "objClassName check");

    //test empty container
    var listener;
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
        assert.equal(handlerCalled, 1, "executed handler called (once)");
        b.onExecutionStateChange.removeEventListener(listener);
    };
    listener = new SmartJs.Event.EventListener(handler, this);
    b.onExecutionStateChange.addEventListener(listener);
    //TODO scene.onBackgroundChange.dispatchEvent({ lookId: lookId });

    //add a brick container
    var bricks = [];
    var TestBrick2 = (function () {
        TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

        function TestBrick2(device, sprite) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, {});
            this.executed = 0;
        }

        TestBrick2.prototype.merge({
            _execute: function (id) {
                this.executed++;
                //var _self = this;
                window.setTimeout(function () { this._return(id, false) }.bind(this), 100);
                //this._return(id, false);    //LOOP DELAY = FALSE
            },
        });

        return TestBrick2;
    })();

    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));
    bricks.push(new TestBrick2("", ""));

    b.bricks = new PocketCode.Model.BrickContainer(bricks);    //container including bricks


    var asyncHandler = function () {
        assert.ok(true, "onExecutionStateChange called: including threaded bricks");
        done1();
    };
    b.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    //TODO: scene.onBackgroundChange.dispatchEvent({ lookId: lookId });

    //TODO: scene.onBackgroundChange.dispatchEvent({ lookId: "lookId2" });
    done1();
    return;

    assert.ok(true, "not called, if no registred lookId");

});


QUnit.test("WhenStartAsCloneBrick", function (assert) {

    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, "device", "soundManager", [], 20);
    assert.ok(scene.onSpriteUiChange instanceof SmartJs.Event.Event, "mock scene interface check");
    var mockScene = {
        onSpriteUiChange: new SmartJs.Event.Event(this)
    };
    var sprite = new PocketCode.Model.Sprite(gameEngine, mockScene, { id: "spriteId", spriteId: "1", name: "spriteName" });
    var clone = new PocketCode.Model.SpriteClone(gameEngine, mockScene, { id: "spriteId", spriteId: "1", name: "spriteName" }, {});

    //tests using a sprite
    var b = new PocketCode.Model.WhenStartAsCloneBrick("device", sprite, { id: "spriteId" });
    assert.ok(true, "no error if brick created in a sprite");

    b.dispose();
    assert.ok(b._disposed && !sprite._disposed && !scene._disposed && !gameEngine._disposed, "disposed without disposing other objects");

    //using clone
    b = new PocketCode.Model.WhenStartAsCloneBrick("device", clone, { id: "spriteId" });
    b.bricks = new PocketCode.Model.BrickContainer([]);  //init brick container
    assert.ok(b._device === "device" && b._sprite === clone, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenStartAsCloneBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenStartAsCloneBrick", "objClassName check");

    //test empty container
    var listener,
        handlerCalled = 0;
    var handler = function (e) {
        handlerCalled++;
        if (e.executionState == PocketCode.ExecutionState.RUNNING) {
            assert.ok(true, "onExecutionStateChange called: running");
        }
        else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
            assert.ok(handlerCalled === 2, "onExecutionStateChange called: stopped");

            b.onExecutionStateChange.removeEventListener(listener);
            runTest2();
        }
        else
            assert.ok(false, "invalid executionstate detected");
    }

    listener = new SmartJs.Event.EventListener(handler, this);
    b.onExecutionStateChange.addEventListener(listener);
    clone.onCloneStart.dispatchEvent();

    function runTest2() {
        //add a brick container
        var bricks = [];
        var TestBrick2 = (function () {
            TestBrick2.extends(PocketCode.Model.ThreadedBrick, false);

            function TestBrick2(device, clone) {
                PocketCode.Model.ThreadedBrick.call(this, device, clone, { commentedOut: false });
                this.executed = 0;
            }

            TestBrick2.prototype.merge({
                _execute: function (id) {
                    this.executed++;
                    window.setTimeout(function () {
                        this._return(id, false)
                    }.bind(this), 100);
                    //this._return(id, false);    //LOOP DELAY = FALSE
                },
            });

            return TestBrick2;
        })();

        bricks.push(new TestBrick2("", ""));
        bricks.push(new TestBrick2("", ""));
        bricks.push(new TestBrick2("", ""));
        bricks.push(new TestBrick2("", ""));

        b._bricks = new PocketCode.Model.BrickContainer(bricks);    //container including bricks

        var asyncHandlerCalled = 0,
            asyncHandler = function (e) {
                asyncHandlerCalled++;
                if (e.executionState == PocketCode.ExecutionState.RUNNING) {
                    assert.ok(true, "onExecutionStateChange called (including threaded bricks): running");
                }
                else if (e.executionState == PocketCode.ExecutionState.STOPPED) {
                    assert.ok(handlerCalled === 2, "onExecutionStateChange called (including threaded bricks): stopped");

                    done1();
                }
                else
                    assert.ok(false, "invalid executionstate detected");
            };

        b.onExecutionStateChange.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
        clone.onCloneStart.dispatchEvent();
    }

});
