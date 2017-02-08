/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.PhysicsWorld = (function () {
    PhysicsWorld.extends(SmartJs.Core.Component);

    function PhysicsWorld(collisionManager) {
        this._physicsSprites = {};
        this._registeredCollisions = {};

        this._gravityX = 0.0;
        this._gravityY = -10.0;
        this._collisionManager = collisionManager;
    }

    ////properties
    //Object.defineProperties(PhysicsWorld.prototype, {

    //});

    ////events
    //Object.defineProperties(PhysicsWorld.prototype, {

    //});

    //methods
    PhysicsWorld.prototype.merge({
        subscribe: function (spriteId, physicsEnabled) {
            this._physicsSprites[spriteId] = physicsEnabled;
        },
        subscribeCollision: function (sprite1, sprite2, listener) {
            if (!sprite1 || !sprite2  || !(listener instanceof SmartJs.Event.EventListener))   //TODO: if (!sprite2)   => 'any', does this mean any physics or any (all)
                throw new Error('invalid argument(s): subscribe collision');

            if (this._registeredCollisions[sprite2] && this._registeredCollisions[sprite2][sprite1]) {
                this._registeredCollisions[sprite2][sprite1].push(listener);
                return;
            } else if (this._registeredCollisions[sprite1] && this._registeredCollisions[sprite1][sprite2]) {
                this._registeredCollisions[sprite1][sprite2].push(listener);
                return;
            }

            this._registeredCollisions[sprite1] || (this._registeredCollisions[sprite1] = {});
            this._registeredCollisions[sprite1][sprite2] || (this._registeredCollisions[sprite1][sprite2] = []);
            this._registeredCollisions[sprite1][sprite2].push(listener);
        },
        _handleDetectedCollision: function (listeners) {
            if (!(listeners instanceof Array))
                throw new Error('invalid argument: expected listeners type of array');

            var listener;
            for (var i = 0, l = listeners.length; i < l; i++) {
                listener = listeners[i];
                if (listener instanceof SmartJs.Event.AsyncEventListener)
                    window.setTimeout(listener.handler.bind(listener.scope, { dispatchedAt: new Date() }), 0);
                else
                    listener.handler.call(listener.scope, {});
            }
        },
        _testCollisionWithAnyPhysicsSprite: function (spriteId) {
            for (var physicsSprite in this._physicsSprites) {
                if (!this._physicsSprites.hasOwnProperty(physicsSprite))    //wrong??? TODO: string?
                    continue;
                if (this._collisionManager.checkSpriteCollision(spriteId, physicsSprite)) {
                    this._handleDetectedCollision(this._registeredCollisions[spriteId]['any']);
                }
            }
        },
        //_checkPotentialCollisions: function () {
        //    for (var spriteId1 in this._registeredCollisions) {
        //        if (!this._registeredCollisions.hasOwnProperty(spriteId1))
        //            continue;

        //        for (var spriteId2 in this._registeredCollisions[spriteId1]) {
        //            if (!this._registeredCollisions[spriteId1].hasOwnProperty(spriteId2))
        //                continue;

        //            if (spriteId2 === 'any') {
        //                this._testCollisionWithAnyPhysicsSprite(spriteId1);
        //            } else if (this._collisionManager.checkSpriteCollision(spriteId1, spriteId2)) {
        //                this._handleDetectedCollision(this._registeredCollisions[spriteId1][spriteId2]);
        //            }
        //        }
        //    }
        //},
        setGravity: function (x, y) {
            this._gravityX = x;
            this._gravityY = y;
        }
    });


    return PhysicsWorld;
})();
