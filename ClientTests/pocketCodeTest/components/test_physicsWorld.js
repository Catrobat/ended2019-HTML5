/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/physicsWorld.js" />
'use strict';

QUnit.module("components/physicsWorld.js");

QUnit.test("PhysicsWorld", function (assert) {
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene();
    var physicsWorld = new PocketCode.PhysicsWorld(scene);

    var spriteIds = ["s1", "s2", "s3", "s4"];
    var id = spriteIds[0];
    physicsWorld.subscribe(id, true);
    assert.ok(physicsWorld._physicsSprites[id], "sprite subscription with physics");
    physicsWorld.subscribe(id, false);
    assert.ok(!physicsWorld._physicsSprites[id], "sprite subscription deactivating physics");

    id = spriteIds[2];
    physicsWorld.subscribe(id, true);
    assert.ok(physicsWorld._physicsSprites[id], "sprite subscription with physics");

    physicsWorld.subscribeCollision();
    assert.deepEqual(physicsWorld._registeredCollisions, {}, "no collision registered if no sprites given");

    var listener = "listener";
    physicsWorld.subscribeCollision(spriteIds[2], spriteIds[0], listener);
    assert.ok(physicsWorld._registeredCollisions[spriteIds[2]], "added subscribed sprite to registered sprites");
    assert.ok(physicsWorld._registeredCollisions[spriteIds[2]][spriteIds[0]], "added subscribed sprite to registered sprites");
    assert.equal(physicsWorld._registeredCollisions[spriteIds[2]][spriteIds[0]][0], listener, "added listener");

    var listener2 = "listener2";
    physicsWorld.subscribeCollision(spriteIds[0], spriteIds[2], listener2);
    assert.ok(!physicsWorld._registeredCollisions[spriteIds[0]], "subscribed sprite not added as combination already exists");
    assert.equal(physicsWorld._registeredCollisions[spriteIds[2]][spriteIds[0]][1], listener2, "added listener to existing combination");

    var listener3 = "listener2";
    physicsWorld.subscribeCollision(spriteIds[2], spriteIds[0], listener2);
    assert.ok(!physicsWorld._registeredCollisions[spriteIds[0]], "subscribed sprite not added as combination already exists");
    assert.equal(physicsWorld._registeredCollisions[spriteIds[2]][spriteIds[0]][2], listener3, "added listener to existing combination");

    assert.throws(function() { physicsWorld._handleDetectedCollision('a') }, "invalid argument for handlers");

    var handlerCalled = 0;
    var collisionListener = {
        handler: function () {
            handlerCalled++;
        }
    };

    var listeners = [];
    var numberOfListeners = 3;
    for(var i = 0; i < numberOfListeners; i++){
        listeners.push(collisionListener);
    }

    physicsWorld._handleDetectedCollision(listeners);
    assert.equal(handlerCalled, numberOfListeners, "handlers for all listeners called by _handleDetectedCollisions");

    physicsWorld._physicsSprites = {};
    var numberOfPhysicsSprites = 4;
    for (i = 0; i < numberOfPhysicsSprites; i++)
        physicsWorld._physicsSprites["id"+i] = true;

    var mockFunctionTrue = function () {
        return true;
    };

    physicsWorld._collisionManager.checkSpriteCollision = mockFunctionTrue;
    handlerCalled = 0;
    var spriteId = "spriteId";
    physicsWorld.subscribeCollision(spriteId, "any", collisionListener);

    physicsWorld._testCollisionWithAnyPhysicsSprite(spriteId);
    assert.equal(handlerCalled, numberOfPhysicsSprites, "_testCollisionWithAnyPhysicsSprite checks for collisions with all physicssprites and calls handler");

    var mockFunctionFalse = function(){
        return false;
    };

    physicsWorld._collisionManager.checkSpriteCollision = mockFunctionFalse;
    handlerCalled = 0;
    physicsWorld._testCollisionWithAnyPhysicsSprite("a");
    assert.equal(handlerCalled, 0, "_testCollisionWithAnyPhysicsSprite does not call handler if no collison is detected by collsionmanager");


    physicsWorld._registeredCollisions = {};
    var numberOfAnyHandlers = 2;
    for(i = 0; i < numberOfAnyHandlers; i++){
        physicsWorld.subscribeCollision("id"+i, "any", collisionListener);
        physicsWorld.subscribeCollision("id"+i, "any", collisionListener);
    }

    physicsWorld._physicsSprites = { "id": false };
    numberOfPhysicsSprites = 4;
    for (i = 0; i < numberOfPhysicsSprites; i++)
        physicsWorld._physicsSprites["id"+i] = true;

    var testCollisionWithAnyCalled = 0;
    physicsWorld._testCollisionWithAnyPhysicsSprite = function(){
        testCollisionWithAnyCalled++;
    };

    physicsWorld._checkPotentialCollisions();
    assert.equal(testCollisionWithAnyCalled , numberOfAnyHandlers, "tested collision with each sprite for each time a collision with any is needed");

    physicsWorld._collisionManager.checkSpriteCollision = mockFunctionTrue;
    var collisions = 5;
    for(i = 0; i < collisions; i++){
        physicsWorld.subscribeCollision("id"+i, "id" + i + 1, collisionListener);
    }

    handlerCalled = 0;
    physicsWorld._checkPotentialCollisions();
    assert.equal(handlerCalled, collisions, "all collisions detected and handler called, checkCollisions -> true");

    handlerCalled = 0;
    physicsWorld._collisionManager.checkSpriteCollision = mockFunctionFalse;

    physicsWorld._checkPotentialCollisions();
    assert.equal(handlerCalled, 0, "no handler called by collision detection, checkCollisions -> false");

    var x = 24;
    var y = 30;
    physicsWorld.setGravity(x, y);
    assert.equal(physicsWorld._gravityX, x, "gravityX set correctly");
    assert.equal(physicsWorld._gravityY, y, "gravityY set correctly");
});
