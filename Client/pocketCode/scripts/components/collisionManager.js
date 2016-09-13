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

        this._canvas = document.createElement('canvas');
        this._ctx = this._canvas.getContext('2d');

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
        checkSpriteCollision: function (sprite1, sprite2) {

            if (!sprite1.visible || !sprite2.visible || sprite1.transparency == 0.0 || sprite2.transparency == 0.0) //!visible, transparent
                return 1; // return false;

            var l1 = sprite1.currentLook,
                l2 = sprite2.currentLook;

            if (!l1 || !l2) //one of the sprites does not have a look
                return 2; //return false;

            var x1 = sprite1.positionX,
                y1 = sprite1.positionY,
                l1ri = l1.renderingImage,
                l1b = l1.getBoundary(l1ri.scaling, l1ri.flipX, false),  //we do not calculate exact boundaries- less performant
                x2 = sprite2.positionX,
                y2 = sprite2.positionY,
                l2ri = l2.renderingImage,
                l2b = l2.getBoundary(l2ri.scaling, l2ri.flipX, false);

            //l1 = {
            //    t: y1 + l1b.top,
            //    r: x1 + l1b.right,
            //    b: y1 + l1b.bottom,
            //    l: x1 + l1b.left,
            //    //canvas: l1.canvas,
            //};

            ////x = sprite2.positionX,
            ////y = sprite2.positionY;
            //l2 = {
            //    t: y2 + l2b.top,
            //    r: x2 + l2b.right,
            //    b: y2 + l2b.bottom,
            //    l: x2 + l2b.left,
            //    //canvas: l2.canvas,
            //};

            var area = {
                //t: Math.min(l1.t, l2.t),
                //r: Math.min(l1.r, l2.r),
                //b: Math.max(l1.b, l2.b),
                //l: Math.max(l1.l, l2.l),
                t: Math.min(y1 + l1b.top, y2 + l2b.top),
                r: Math.min(x1 + l1b.right, x2 + l2b.right),
                b: Math.max(y1 + l1b.bottom, y2 + l2b.bottom),
                l: Math.max(x1 + l1b.left, x2 + l2b.left),
            };

            if (area.t - area.b <= 0 || area.r - area.l <= 0)   //no overlapping
                return 3; //return false;

            //check pixels in range
            var precision = 2.0;    //means 2 pixel accuracy used for calculation
            if (SmartJs.Device.isMobile)
                precision *= 2.0;

            var width = Math.ceil((area.r - area.l) / precision),
                height = Math.ceil((area.t - area.b) / precision);
            this._canvas.width = width;
            this._canvas.height = height;

            //sprite1
            var ctx = this._ctx;
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.rotate(l1ri.rotation * (Math.PI / 180.0));
            ctx.scale(
                l1ri.scaling / precision * (l1ri.flipX ? -1.0 : 1.0),
                l1ri.scaling / precision
            );

            ctx.translate(-area.l, -area.t);

            //ctx.scale(
            //    1.0 / precision,
            //    1.0 / precision
            //);
            //draw sprite1
            //l1ri.draw(ctx);
            ctx.drawImage(l1ri, sx, sy, width, height, 0, 0, width, height);

            var imageData = ctx.getImageData(0, 0, width, height);
            var pixels1 = imageData.data;
            ctx.restore();

            //draw sprite2
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.rotate(l2ri.rotation * (Math.PI / 180.0));
            ctx.scale(
                l2ri.scaling / precision * (l2ri.flipX ? -1.0 : 1.0),
                l2ri.scaling / precision
            );

            ctx.translate(-area.l, -area.t);

            //l2ri.draw(ctx);
            ctx.drawImage(l2ri, sx, sy, width, height, 0, 0, width, height);
            imageData = ctx.getImageData(0, 0, width, height);
            var pixels2 = imageData.data;
            ctx.restore();

            //TODO: check transparent pixels in pixels1 & 2 and return true if as soon as the current are both "not transparent"

            //Length of the overlapping Rect
            var length = width * height;

            //Loop to fínd the collision
            for (var cnt = 0; cnt < length * 4; cnt += 4){

                if (pixels1[cnt] == pixels2[cnt]) {
                    return 4; // return true;
                }
            }

            return 5;
            //return false;



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
