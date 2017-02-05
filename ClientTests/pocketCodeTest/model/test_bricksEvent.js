/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksEvent.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />
'use strict';

QUnit.module("model/bricksEvent.js");


QUnit.test("WhenProgramStartBrick", function (assert) {

    //assert.expect(11);   //init async asserts (to wait for)
    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    gameEngine._collisionManager = new PocketCode.CollisionManager(400, 200);  //make sure collisionMrg is initialized before calling an onStart event
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    gameEngine.__currentScene = scene; //set internal: tests only
    gameEngine._startScene = scene;

    gameEngine._background = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });  //to avoid error on start
    gameEngine.projectReady = true;

    var b = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", { x: 1, y: 2 }, scene.onStart);
    b.dispose();
    assert.equal(b._disposed, true, "disposed");

    b = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", { x: 1, y: 2 }, scene.onStart);
    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenProgramStartBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenProgramStartBrick", "objClassName check");

    //test empty container
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
    };

    scene.onStart.addEventListener(new SmartJs.Event.EventListener(handler, this));
    //simulate project loaded for tests
    gameEngine._resourcesLoaded = true;
    gameEngine._scenesLoaded = true;

    gameEngine.runProject();
    //scene.start();
    assert.ok(handlerCalled === 1, "executed handler called (once)");
    //TODO: following line should be removed!!!
    scene._executionState = 0;   //scene does not terminate

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

    b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler, this));

    var asyncHandler = function () {
        assert.ok(true, "onExecuted called: including threaded bricks");
        done1();
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    //stop so that gameEngine can be started again
    gameEngine.stopProject();

    gameEngine.runProject();

});


QUnit.test("WhenActionBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    var b = new PocketCode.Model.WhenActionBrick("device", sprite, { x: 1, y: 2, action: "action" }, scene.onSpriteTappedAction);

    b.dispose();
    assert.equal(b._disposed, true, "dispose called");

    b = new PocketCode.Model.WhenActionBrick("device", sprite, { x: 1, y: 2, action: "action" }, scene.onSpriteTappedAction);
    assert.ok(b._device === "device" && b._sprite === sprite && b._onAction instanceof SmartJs.Event.Event, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenActionBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenActionBrick", "objClassName check");

    //test empty container
    var handler = function () {
        assert.ok(true, "executed handler called (once)");
        b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler));
        done1();
        runTest2();
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler));
    scene.onSpriteTappedAction.dispatchEvent({ sprite: sprite });

    function runTest2() {
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
            assert.ok(true, "onExecuted called: including threaded bricks");
            done2();
        };
        b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler));
        scene.onSpriteTappedAction.dispatchEvent({ sprite: sprite });
    }
});


QUnit.test("WhenBroadcastReceiveBrick", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.WhenBroadcastReceiveBrick("device", "sprite", broadcastMgr, { receiveMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenBroadcastReceiveBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenBroadcastReceiveBrick", "objClassName check");

    //test empty container
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler, this));
    broadcastMgr.publish("s12");
    assert.ok(handlerCalled === 1, "executed handler called (once)");

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

    b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler, this));

    var asyncHandler = function () {
        assert.ok(true, "onExecuted called: including threaded bricks");
        done1();
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    broadcastMgr.publish("s12");

    //broadcastAndWait event handling: b.onExecuted is not dispatched the publish event arguments include the return handler
    handlerCalled = 0;
    //b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    //^^ leaving the listener attached will give you an error on done1() called twice
    var asyncHandler2 = function (e) {
        assert.ok(true, "broadcastWait: onExecuted called: including threaded bricks");
        assert.equal(e.id, "broadcastWaitId", "broadcastWait: return id check");
        assert.equal(e.loopDelay, true, "broadcastWait: loopDelay check");

        done2();
    };

    assert.ok(false, "TODO");
    done2();
    return;

    broadcastMgr.publish("s12", new SmartJs.Event.EventListener(asyncHandler2, this), "broadcastWaitId");

});


QUnit.test("BroadcastBrick", function (assert) {

    var done1 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.BroadcastBrick("device", "sprite", broadcastMgr, { broadcastMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._broadcastMsgId === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.BroadcastBrick, "instance check");
    assert.ok(b.objClassName === "BroadcastBrick", "objClassName check");

    var id;
    var loopDelay;
    var h = function (e) {
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
    b.execute(new SmartJs.Event.EventListener(h, this), "sdf");

    assert.equal(id, "sdf", "return handler dispatched and id set correctly");
    assert.equal(loopDelay, undefined, "loop delay set correctly");

});


QUnit.test("BroadcastAndWaitBrick", function (assert) {

    //assert.expect(10);   //init async asserts (to wait for)
    var done1 = assert.async();

    var broadcastMgr = new PocketCode.BroadcastManager([{ id: "s12", name: "test" }]);
    var b = new PocketCode.Model.BroadcastAndWaitBrick("device", "sprite", broadcastMgr, { broadcastMsgId: "s12" });

    assert.ok(b._device === "device" && b._sprite === "sprite" && b._broadcastMsgId === "s12", "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.BroadcastAndWaitBrick, "instance check");
    assert.ok(b.objClassName === "BroadcastAndWaitBrick", "objClassName check");

    var h = function (e) {  //async
        assert.equal(e.id, "sdf", "return handler dispatched and id set correctly");
        assert.equal(e.loopDelay, true, "loop delay set correctly");

        //assert.ok(broadcastMgr._pendingBW[)
        done1();
    };

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
    var tb1 = new TestBrick2("", "", {});

    var _returnHandler = function (e) {
        tb1.execute(e.listener, e.id);
    };

    assert.ok(false, "TODO");
    done1();
    return;

    broadcastMgr.subscribe("s12", _returnHandler);
    b.execute(new SmartJs.Event.EventListener(h, this), "sdf");

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

    assert.ok(false, "TODO:");
    done1();
    return;

    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler, this));
    physicsWorld._handleDetectedCollision(physicsWorld._registeredCollisions[sprite.id][spriteId2]);

    assert.equal(handlerCalled, 1, "brick executed on detected collision");

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

    b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler, this));

    var asyncHandler = function () {
        assert.ok(true, "onExecuted called: including threaded bricks");
        done1();
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    physicsWorld._handleDetectedCollision(physicsWorld._registeredCollisions[sprite.id][spriteId2]);

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
    var handlerCalled = 0;
    var handler = function () {
        handlerCalled++;
    };

    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler, this));
    //TODO scene.onBackgroundChange.dispatchEvent({ lookId: lookId });
    assert.equal(handlerCalled, 1, "executed handler called (once)");

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

    b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler, this));

    var asyncHandler = function () {
        assert.ok(true, "onExecuted called: including threaded bricks");
        done1();
    };
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler, this));
    //TODO: scene.onBackgroundChange.dispatchEvent({ lookId: lookId });

    //TODO: scene.onBackgroundChange.dispatchEvent({ lookId: "lookId2" });
    done1();
    return;

    assert.ok(true, "not called, if no registred lookId");


});


QUnit.test("WhenStartAsCloneBrick", function (assert) {
    var done1 = assert.async();

    var gameEngine = new PocketCode.GameEngine();
    var mockScene = {
        onSpriteUiChange: new SmartJs.Event.Event(this)
    };
    var sprite = new PocketCode.Model.SpriteClone(gameEngine, mockScene, { id: "spriteId", spriteId: "1", name: "spriteName" }, {});

    var b = new PocketCode.Model.WhenStartAsCloneBrick("device", sprite, { id: "spriteId" });
    b.bricks = new PocketCode.Model.BrickContainer([]);  //init brick container
    b.dispose();
    assert.equal(b._disposed, true, "disposed");

    b = new PocketCode.Model.WhenStartAsCloneBrick("device", sprite, { id: "spriteId" });
    assert.ok(b._device === "device" && b._sprite === sprite, "brick created and properties set correctly");
    assert.ok(b instanceof PocketCode.Model.WhenStartAsCloneBrick && b instanceof PocketCode.Model.ScriptBlock, "instance check");
    assert.ok(b.objClassName === "WhenStartAsCloneBrick", "objClassName check");

    //test empty container
    var handlerCalled = 0;
    function handler(e) {
        handlerCalled++;
        assert.equal(handlerCalled, 1, "execute empty container");
        runTest2();
    }
    b.onExecuted.addEventListener(new SmartJs.Event.EventListener(handler));
    sprite.onCloneStart.dispatchEvent();

    function runTest2() {
        b.onExecuted.removeEventListener(new SmartJs.Event.EventListener(handler));

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

        var asyncHandler = function () {
            assert.ok(true, "onExecuted called: including threaded bricks");
            done1();
        };

        b.onExecuted.addEventListener(new SmartJs.Event.EventListener(asyncHandler));

        sprite.onCloneStart.dispatchEvent();
    }
});
