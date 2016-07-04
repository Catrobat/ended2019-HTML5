/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/collisionManager.js" />
'use strict';

QUnit.module("components/collisionManager.js");


QUnit.test("CollisionManager", function (assert) {
    
    var cm = new PocketCode.CollisionManager();

    cm._sprites = [
        {id: "s1"},
        {id: "s2"},
        {id: "s3"},
        {id: "s4"}
    ];

    cm.subscribe();
    assert.deepEqual({}, cm._registeredCollisions, "Subscribe does nothing if no sprites passed");

    cm.subscribe(cm._sprites[2], cm._sprites[0]);
    assert.ok(cm._registeredCollisions[cm._sprites[2].id], "added subscribed sprite to registered sprites");
    assert.ok(cm._registeredCollisions[cm._sprites[2].id][cm._sprites[0].id], "added subscribed sprite to registered sprites");

    cm.subscribe(cm._sprites[0], cm._sprites[2]);
    assert.ok(!cm._registeredCollisions[cm._sprites[0].id], "duplicate subscription not added");

    cm.subscribe(cm._sprites[0], cm._sprites[1]);
    assert.ok(cm._registeredCollisions[cm._sprites[0].id], "added non duplicate subscribed sprite to registered sprites");
    assert.ok(cm._registeredCollisions[cm._sprites[0].id][cm._sprites[1].id], "added subscribed sprite to registered sprites");

    var handlerReturnValue = "h1";
    var handler = function() { return handlerReturnValue; };
    cm.subscribe(cm._sprites[0], cm._sprites[3], handler);
    assert.ok(cm._registeredCollisions[cm._sprites[0].id][cm._sprites[3].id], "further collision added to the correct sprite");
    assert.equal(cm._registeredCollisions[cm._sprites[0].id][cm._sprites[3].id][0](), handlerReturnValue, "correct handler added");

    var handlerReturnValue2 = "h2";
    var handler2 = function() { return handlerReturnValue2; };
    cm.subscribe(cm._sprites[0], cm._sprites[3], handler2);
    assert.equal(cm._registeredCollisions[cm._sprites[0].id][cm._sprites[3].id][1](), handlerReturnValue2, "correct handler added to same collision");

    cm.subscribe();

    assert.equal(cm._getSprite("s4"), cm._sprites[3], "getSpriteById");

    assert.throws(function() {cm._getSprite()}, Error, "getSprite missing argument");
    assert.throws(function() {cm._getSprite("noSprite")}, Error, "getSprite sprite not found");

});
