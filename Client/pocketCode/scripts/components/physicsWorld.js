/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.PhysicsWorld = (function () {
    PhysicsWorld.extends(SmartJs.Core.Component);

    function PhysicsWorld(scene) {
        this._physicsSprites = {};
        this._registeredCollisions = {};

        this._gravityX = 0.0;
        this._gravityY = -10.0;
        this._collisionManager = scene.collisionManager;
    }

    //properties
    Object.defineProperties(PhysicsWorld.prototype, {

    });

    //events
    Object.defineProperties(PhysicsWorld.prototype, {

    });

    //methods
    PhysicsWorld.prototype.merge({
        subscribe: function (spriteId, physicsEnabled){
            this._physicsSprites[spriteId] = physicsEnabled;
        },
        subscribeCollision: function (sprite1, sprite2, listener) {
            if(!sprite1 || !sprite2 || !listener)
                return;

            if(this._registeredCollisions[sprite2] && this._registeredCollisions[sprite2][sprite1]){
                this._registeredCollisions[sprite2][sprite1].push(listener);
                return;
            } else if (this._registeredCollisions[sprite1] && this._registeredCollisions[sprite1][sprite2]){
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

            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].handler.call(listeners[i].scope, {});
            }
        },
        _testCollisionWithAnyPhysicsSprite: function (spriteId) {
            for (var physicsSprite in this._physicsSprites){
                if (!this._physicsSprites.hasOwnProperty(physicsSprite))
                    continue;
                if (this._collisionManager.checkSpriteCollision(spriteId, physicsSprite)){
                    this._handleDetectedCollision(this._registeredCollisions[spriteId]['any']);
                }
            }
        },
        _checkPotentialCollisions: function () {
            for (var spriteId1 in this._registeredCollisions){
                if (!this._registeredCollisions.hasOwnProperty(spriteId1))
                    continue;

                for (var spriteId2 in this._registeredCollisions[spriteId1]) {
                    if (!this._registeredCollisions[spriteId1].hasOwnProperty(spriteId2))
                        continue;

                    if (spriteId2 === 'any'){
                        this._testCollisionWithAnyPhysicsSprite(spriteId1);
                    } else if (this._collisionManager.checkSpriteCollision(spriteId1, spriteId2)) {
                        this._handleDetectedCollision(this._registeredCollisions[spriteId1][spriteId2]);
                    }
                }
            }
        },
        setGravity: function (x, y) {
            this._gravityX = x;
            this._gravityY = y;
        }
    });


    return PhysicsWorld;
})();
