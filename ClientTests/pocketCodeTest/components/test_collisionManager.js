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

    cm.subscribe(cm._sprites[2], cm._sprites[0]);
    assert.ok(cm._registeredCollisions[cm._sprites[2].id], "added subscribed sprite to registered sprites");
    assert.ok(cm._registeredCollisions[cm._sprites[2].id].indexOf(cm._sprites[0].id) >= 0, "added subscribed sprite to registered sprites");

    cm.subscribe(cm._sprites[0], cm._sprites[2]);
    assert.ok(!cm._registeredCollisions[cm._sprites[0].id], "duplicate subscription not added");

    cm.subscribe(cm._sprites[0], cm._sprites[1]);
    assert.ok(cm._registeredCollisions[cm._sprites[0].id], "added non duplicate subscribed sprite to registered sprites");
    assert.ok(cm._registeredCollisions[cm._sprites[0].id].indexOf(cm._sprites[1].id) >= 0, "added subscribed sprite to registered sprites");

    cm.subscribe(cm._sprites[0], cm._sprites[3]);
    assert.equal(cm._registeredCollisions[cm._sprites[0].id].length, 2, "further collision added to the correct sprite");

    cm.unsubscribe(cm._sprites[0], cm._sprites[2]);
    assert.ok(!cm._registeredCollisions[cm._sprites[2]], "Sprite with no registered collisions removed from registered collisions");
    assert.equal(cm._registeredCollisions[cm._sprites[0].id].length, 2, "collisions that are still needed are not removed");

});
