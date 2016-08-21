/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.CollisionManager = (function () {
    CollisionManager.extends(SmartJs.Core.Component);

    function CollisionManager(projectScreenWidth, projectScreenHeight) {
        this._sprites = [];
        this._background = undefined;
        this._projectScreenWidth = projectScreenWidth;
        this._projectScreenHeight = projectScreenHeight;
        this._registeredCollisions = {};

        //this._onCollision = new SmartJs.Event.Event(this);  //maybe another event strategy is neede here, e.g. subscribe with handler?
    }

    //properties
    Object.defineProperties(CollisionManager.prototype, {
        background: {
            set: function (bg) {
                //TODO: validation
                this._background = bg;
            },
        },
        sprites: {
            set: function (sprites) {
                //TODO: validation
                this._sprites = sprites;
                
                //TODO: add event listener to onSpriteUiChange: this is a shared event between gameEngine and sprite- maybe we have to rethink our implementation
                //we have to check for spriteId, look, visible, rotation, x, y, ? event arguments in the handler
            },
        },
    });

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
        checkSpritePointerCollision: function (sprite) {
            //TODO
            return false;
        },
        checkSpriteEdgeCollision: function (x, y, spriteBoundary) {
            //returns { occurs: true/false, overflow: { top: ?, right: ?, bottom: ?, left: ? } }
            var sw2 = this._projectScreenWidth * 0.5,
                sh2 = this._projectScreenHeight * 0.5,
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
        //-------------------------------------------------------------------------------------
        checkSpriteCollision: function (sprite1, sprite2) {
            var collision = {occurs: false, overflow: {} };

            //check if any edge of the sprites are colliding
            if (//Sprite2 in Sprite1
            (sprite1.top >= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left >= sprite2.left) ||
            //Sprite1 in Sprite2
            (sprite1.top <= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left <= sprite2.left) ||

            //Sprite2 collides with top side of Sprite1
            (sprite1.top <= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left >= sprite2.left) ||
            //Sprite1 collides with top side of Sprite2
            (sprite1.top >= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left <= sprite2.left) ||

            //Sprite2 collides with right side of Sprite1
            (sprite1.top >= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left >= sprite2.left) ||
            //Sprite1 collides with right side of Sprite2
            (sprite1.top <= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left <= sprite2.left) ||

            //Sprite2 collides with right side of Sprite1 above top side
            (sprite1.top <= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left >= sprite2.left) ||
            //Sprite2 collides with right side of Sprite1  under bottom side
            (sprite1.top >= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left >= sprite2.left) ||

            //Sprite1 collides with right side of Sprite2 above top side
            (sprite1.top >= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left <= sprite2.left) ||
            //Sprite1 collides with right side of Sprite2 under bottom side
            (sprite1.top <= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left <= sprite2.left) ||

            //Sprite2 collides with bottom side of Sprite1
            (sprite1.top >= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left >= sprite2.left) ||
            //Sprite1 collides with bottom side of Sprite2
            (sprite1.top <= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left <= sprite2.left) ||

            //Sprite2 collides with left side of Sprite1
            (sprite1.top >= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left <= sprite2.left) ||
            //Sprite1 collides with left side of Sprite2
            (sprite1.top <= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left >= sprite2.left) ||

            //Sprite2 collides with left side of Sprite1 above top side
            (sprite1.top <= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left <= sprite2.left) ||
            //Sprite2 collides with left side of Sprite1  under bottom side
            (sprite1.top >= sprite2.top & sprite1.right >= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left <= sprite2.left) ||

            //Sprite1 collides with left side of Sprite2 above top side
            (sprite1.top >= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom <= sprite2.bottom & sprite1.left >= sprite2.left) ||
            //Sprite1 collides with left side of Sprite2 under bottom side
            (sprite1.top <= sprite2.top & sprite1.right <= sprite2.right &
            sprite1.bottom >= sprite2.bottom & sprite1.left >= sprite2.left))
                collision.occurs = true;

            /*
            //Check if no collision occurs
            if (sprite1.top > sprite2.bottom || sprite1.right < sprite2.left ||
                sprite1.bottom < sprite2.top || sprite1. left < sprite2.right)
                collision.occurs = false;
            else
                collision.occurs = true;
             */

            return collision;
        },
        //-------------------------------------------------------------------------------------
        checkSpriteColorCollision: function (sprite, color) {
            //TODO
            return false;
        },
        checkColorColorCollision: function (sprite1, color1, color2) {
            //TODO
            return false;
        },
        /* override */
        dispose: function () {
            //do not dispose sprites
            this._background = undefined;
            this._sprites = [];

            SmartJs.Core.Component.prototype.dispose.call(this);    //call super
        },
    });

    return CollisionManager;
})();
