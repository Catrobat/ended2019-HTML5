/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.CollisionManager = (function () {

    function CollisionManager(projectScreenWidth, projectScreenHeight, sprites) {

        this._projectScreenWidth = projectScreenWidth;
        this._projectScreenHeight = projectScreenHeight;
        //todo check if array
        this._sprites = sprites;
        this._registeredCollisions = {};

        //this._onCollision = new SmartJs.Event.Event(this);  //maybe another event strategy is neede here, e.g. subscribe with handler?
    }

    //events
    //Object.defineProperties(CollisionManager.prototype, {
    //    onCollision: {
    //        get: function () {
    //            return this._onCollision;
    //        },
    //    },
    //});

    //methods
    CollisionManager.prototype.merge({
        setProjectScreen: function (width, height) {
            this._projectScreenWidth = width;
            this._projectScreenHeight = height;
        },
        subscribe: function (sprite1, sprite2, handler) {
            if(!sprite1 || !sprite2)
                return;

            if(this._registeredCollisions[sprite2.id] && this._registeredCollisions[sprite2.id][sprite1.id]){
                this._registeredCollisions[sprite2.id][sprite1.id].push(handler);
                return;
            } else if (this._registeredCollisions[sprite1.id] && this._registeredCollisions[sprite1.id][sprite2.id]){
                this._registeredCollisions[sprite1.id][sprite2.id].push(handler);
                return;
            }

            this._registeredCollisions[sprite1.id] || (this._registeredCollisions[sprite1.id] = {});
            this._registeredCollisions[sprite1.id][sprite2.id] || (this._registeredCollisions[sprite1.id][sprite2.id] = []);
            this._registeredCollisions[sprite1.id][sprite2.id].push(handler);

            //todo what happens if collisions are turned off? check physics type in collision check or unreg?

            //TODO: subscribe a collisions check: make sure (sprite1 vs sprite2) -> handler1 & (sprite2 vs sprite1) -> handler2 does not check the collision twice before calling both handlers
        },
        _publish: function () {
            //private here: call registered handlers on collisions
        },
        _getSprite: function (spriteId) {
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].id === spriteId)
                    return sprites[i];
            }
            throw new Error('unknown sprite with id: ' + spriteId);
        },
        checkRegisteredCollisions: function (/* TODO */) {    //called to periodically check registered collisions after movements
            for (var spriteId1 in this._registeredCollisions){
                if(this._registeredCollisions.hasOwnProperty(spriteId1)){
                    var sprite1 = this._getSprite(spriteId1);
                    for(var spriteId2 in this._registeredCollisions[spriteId1]){
                        if(this._registeredCollisions[spriteId1].hasOwnProperty(spriteId2)){
                            var sprite2 = this._getSprite(spriteId2);
                            this.checkSpriteCollision(sprite1, sprite2);
                        }
                    }
                }
            }
        },
        checkSpritePointerCollision: function (sprite) {
            //TODO
            return false;
        },
        checkSpriteEdgeCollision: function (x, y, spriteBoundary) {
            //returns { occurs: true/false, overflow: { top: ?, right: ?, bottom: ?, left: ? } }
            var sw2 = this._projectScreenWidth / 2.0,
                sh2 = this._projectScreenHeight / 2.0,
                collision = { occurs: false, overflow: {} };

            //check
            if (y + spriteBoundary.top > sh2 ||
                x + spriteBoundary.right > sw2 ||
                y + spriteBoundary.bottom < -sh2 ||
                x + spriteBoundary.left < -sw2)
                collision.occurs = true;

            if (!spriteBoundary.pixelAccuracy)  //we do not calculate the overflow if pixelAccuracy not set
                return collision;

            collision.overflow = { 
                top: y + spriteBoundary.top - sh2,
                right: x + spriteBoundary.right - sw2,
                bottom: -y - spriteBoundary.bottom - sh2,
                left: -x - spriteBoundary.left - sw2
            };
            return collision;
        },
        checkSpriteCollision: function (sprite1, sprite2) {
            //TODO
            return false;
        },
        checkSpriteColorCollision: function (sprite, color) {
            //TODO
            return false;
        },
        checkColorColorCollision: function (color1, color2) {
            //TODO
            return false;
        },
    });


    return CollisionManager;
})();
