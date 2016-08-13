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
