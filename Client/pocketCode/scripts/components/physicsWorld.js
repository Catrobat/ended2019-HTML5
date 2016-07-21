/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.PhysicsWorld = (function () {
    PhysicsWorld.extends(SmartJs.Core.Component);

    function PhysicsWorld(gameEngine) {
        this._physicsSprites = {};
        this._registeredCollisions = {};
        this._gravity = 1;
        //todo maybe just ge?
        this._collisionManager = gameEngine.collisionManager;
    }

    //properties
    Object.defineProperties(PhysicsWorld.prototype, {
        gravity: {
            set: function (value) {
                this._gravity = value;
            }
        }
    });

    //events
    Object.defineProperties(PhysicsWorld.prototype, {

    });

    //methods
    PhysicsWorld.prototype.merge({
        setProjectScreen: function (width, height) {
            this._projectScreenWidth = width;
            this._projectScreenHeight = height;
        },
        subscribe: function (){
        },
        subscribeCollision: function (sprite1, sprite2, listener) {
            //console.log(sprite1, sprite2, listener);
            if(!sprite1 || !sprite2)
                return;

            if(this._registeredCollisions[sprite2.id] && this._registeredCollisions[sprite2.id][sprite1.id]){
                this._registeredCollisions[sprite2.id][sprite1.id].push(listener);
                return;
            } else if (this._registeredCollisions[sprite1.id] && this._registeredCollisions[sprite1.id][sprite2.id]){
                this._registeredCollisions[sprite1.id][sprite2.id].push(listener);
                return;
            }

            this._registeredCollisions[sprite1.id] || (this._registeredCollisions[sprite1.id] = {});
            this._registeredCollisions[sprite1.id][sprite2.id] || (this._registeredCollisions[sprite1.id][sprite2.id] = []);
            this._registeredCollisions[sprite1.id][sprite2.id].push(listener);
            this.checkPotentialCollisions();

        },
        _handleDetectedCollision: function (listeners) {
            //todo typecheck
            for(var i = 0, l = listeners.length; i < l; i++){
                //console.log(i, listeners[i]);
                listeners[i].handler.call(listeners[i].scope, {});
            }
        },
        checkPotentialCollisions: function () {
            for (var spriteId1 in this._registeredCollisions){
                if (!this._registeredCollisions.hasOwnProperty(spriteId1))
                    continue;

                for (var spriteId2 in this._registeredCollisions[spriteId1]) {
                    if (!this._registeredCollisions[spriteId1].hasOwnProperty(spriteId2))
                        continue;

                    if (spriteId2 === 'any'){
                        for (var physicsSprite in this._physicsSprites){
                            if (!this._physicsSprites.hasOwnProperty(physicsSprite))
                                continue;
                            if (this._collisionManager.checkSpriteCollision(spriteId1, physicsSprite)){
                                this._handleDetectedCollision(this._registeredCollisions[spriteId1][spriteId2]);
                            }
                        }
                    } else if (this._collisionManager.checkSpriteCollision(spriteId1, spriteId2)) {
                        this._handleDetectedCollision(this._registeredCollisions[spriteId1][spriteId2]);
                    }
                }
            }
        }
    });


    return PhysicsWorld;
})();
