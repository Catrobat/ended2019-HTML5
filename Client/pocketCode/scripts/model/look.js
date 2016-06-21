/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Model.Look = (function () {
    Look.extends(SmartJs.Core.Component);

    function Look(jsonLook) {
        this._id = jsonLook.id;
        this._imageId = jsonLook.resourceId;
        this._name = jsonLook.name;

        if (jsonLook.rotationCenterX)   //required to initialize as undefined (even if the values are "null")
            this._rotationCenterX = jsonLook.rotationCenterX;
        if (jsonLook.rotationCenterY)
            this._rotationCenterY = jsonLook.rotationCenterY;

        //center defined to reduce test efford: testing interfaces without loading explicit images
        this._center = {
            length: 0.0,
            angle: 0.0,
        };
        this._cache = {};
    }

    //properties
    Object.defineProperties(Look.prototype, {
        id: {
            get: function () {
                return this._id;
            },
        },
        imageId: {
            get: function () {
                return this._imageId;
            },
        },
        name: {
            get: function () {
                return this._name;
            },
        },
        canvas: {
            get: function () {
                return this._canvas;
            },
        },
        center: {
            get: function () {
                return this._center;
            },
        },
        tl: {
            get: function () {
                return this._tl;
            },
        },
        tr: {
            get: function () {
                return this._tr;
            },
        },
        bl: {
            get: function () {
                return this._bl;
            },
        },
        br: {
            get: function () {
                return this._br;
            },
        },
    });

    Look.prototype.merge({
        init: function (img) {
            this._canvas = img.canvas;
            var center = img.center;
            this._center = center;
            this._tl = img.tl;
            this._tr = img.tr;
            this._bl = img.bl;
            this._br = img.br;

            if (this._rotationCenterX && this._rotationCenterY) {
                //pointing from the center (original center if clipped) to the upper left corner
                if (typeof this._rotationCenterX !== 'number' || typeof this._rotationCenterY !== 'number')
                    throw new Error('rotationCenterX & rotationCenterY have to be numeric');

                //adjust center vector
                var centerOffsetX = img.originalWidth / 2.0 - this._rotationCenterX,
                    centerOffsetY = -img.originalHeight / 2.0 - this._rotationCenterY;
                centerOffsetX += center.length * Math.cos(center.angle);// - centerOffsetX,
                centerOffsetY += center.length * Math.sin(center.angle);// + centerOffsetY;

                this._center = {
                    length: Math.sqrt(Math.pow(centerOffsetX, 2) + Math.pow(centerOffsetY, 2)),
                    angle: Math.atan2(centerOffsetY, centerOffsetX)
                };

                //adjust corner vectors
                var mx = this._canvas.width / 2.0,    //new rotation center
                    my = this._canvas.height / 2.0,
                    x = centerOffsetX - mx,
                    y = centerOffsetY + my;
                this._tl = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                x = centerOffsetX + mx;
                this._tr = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                y = centerOffsetY - my;
                this._br = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                x = centerOffsetX - mx;
                this._bl = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
            }
        },
        getBoundary: function (scaling, rotation, flipX, pixelAccuracy) {
            /* returns the looks offsets based on the looks rotation center = image center
            *
            *  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            *  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            *  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            *  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to increase performance)
            */
            var cache = this._cache;

            if (cache.scaling !== scaling || cache.rotation !== rotation || (pixelAccuracy && !cache.pixelAccuracy)) {
                this._calcAndCacheBoundary(scaling, rotation, pixelAccuracy);
                cache = this._cache;
            }

            //cache clone to avoid side effects on manipulations
            var retB = {
                top: cache.top,
                right: cache.right,
                bottom: cache.bottom,
                left: cache.left,
                pixelAccuracy: cache.pixelAccuracy,
            };

            if (flipX) {
                var tmp = retB.left
                retB.left = -retB.right;
                retB.right = -tmp;
                return retB;
            }
            return retB;
        },
        _calcAndCacheBoundary: function (scaling, rotation, pixelAccuracy) {
            scaling = scaling || 1.0;
            var rotationRad = rotation ? rotation * Math.PI / 180.0 : 0.0;
            var boundary = this._cache,
                boundary = {};

            if (boundary.scaling !== scaling || boundary.rotation !== rotation) {
                var calc = {},
                length = this.tl.length * scaling,
                angle = this.tl.angle - rotationRad;    //notice: we have different rotation directions here: polar: counterclockwise, rendering: clockwise
                calc.tl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = this.tr.length * scaling;
                angle = this.tr.angle - rotationRad;
                calc.tr = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = this.bl.length * scaling;
                angle = this.bl.angle - rotationRad;
                calc.bl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = this.br.length * scaling;
                angle = this.br.angle - rotationRad;
                calc.br = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                //var boundary;
                if (rotationRad != 0.0)
                    boundary = {   //due to rotation every corner can become a max/min value
                        top: Math.ceil(Math.max(calc.tl.y, calc.tr.y, calc.bl.y, calc.br.y)),
                        right: Math.ceil(Math.max(calc.tl.x, calc.tr.x, calc.bl.x, calc.br.x)),
                        bottom: Math.floor(Math.min(calc.tl.y, calc.tr.y, calc.bl.y, calc.br.y)),
                        left: Math.floor(Math.min(calc.tl.x, calc.tr.x, calc.bl.x, calc.br.x)),
                        pixelAccuracy: false,
                    };
                else {
                    boundary = {
                        top: Math.ceil(calc.tr.y),
                        right: Math.ceil(calc.tr.x),
                        bottom: Math.floor(calc.bl.y),
                        left: Math.floor(calc.bl.x),
                        pixelAccuracy: true,
                    };
                }
            }

            if (pixelAccuracy || !boundary.pixelAccuracy) {
                //calc pixel-exact offsets & include them 
                var trimOffsets = PocketCode.ImageHelper.getElementTrimOffsets(this.canvas, scaling, rotation);
                boundary.top -= Math.floor(trimOffsets.top);
                boundary.right -= Math.floor(trimOffsets.right);
                boundary.bottom += Math.ceil(trimOffsets.bottom);
                boundary.left += Math.ceil(trimOffsets.left);
                boundary.pixelAccuracy = true;
            }

            this._cache = boundary;
            return boundary;
        },
    });

    return Look;
})();
