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

        if (jsonLook.rotationCenterX)   //required to initialize as undefined even if the values are "null"
            this._rotationCenterX = jsonLook.rotationCenterX;
        if (jsonLook.rotationCenterY)
            this._rotationCenterY = jsonLook.rotationCenterY;

        this._initialScaling = 1.0;
        //this._canvas = PocketCode.ImageHelper.scale(imgElement, this._initialScaling);
        //this._cache = {};
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
        initialScaling: {
            get: function () {
                return this._initialScaling;
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
        init: function (img, initialScaling) {
            this._initialScaling = initialScaling;
            this._canvas = PocketCode.ImageHelper.scale(img, initialScaling);

            var adjusted;
            if (!this._rotationCenterX && !this._rotationCenterY)
                adjusted = PocketCode.ImageHelper.adjustCenterAndTrim(this._canvas, undefined, undefined, true);
            else if (typeof this._rotationCenterX === 'number' && typeof this._rotationCenterY === 'number')
                adjusted = PocketCode.ImageHelper.adjustCenterAndTrim(this._canvas, this._rotationCenterX * this._initialScaling, this._rotationCenterY * this._initialScaling, true);
            else
                throw new Error('both rotation center arguments are required (typeof number)');

            this._canvas = adjusted.canvas;
            this._center = adjusted.center;
            this._tl = adjusted.tl;
            this._tr = adjusted.tr;
            this._bl = adjusted.bl;
            this._br = adjusted.br;
        },
        getBoundary: function (scaling, rotation, flipX, pixelAccuracy) {
            /* returns the looks offsets based on the looks rotation centre = image center */

            /*  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            /*  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            /*  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            /*  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to increase performance)
            */
            var cache = this._cache || {},
                retB;
            if (cache.scaling === scaling && cache.rotation === rotation && (!pixelAccuracy || pixelAccuracy && cache.pixelAccuracy)) {
                retB = {
                    top: cache.top,
                    right: cache.right,
                    bottom: cache.bottom,
                    left: cache.left,
                    pixelAccuracy: cache.pixelAccuracy,
                };   //make sure the cache cannot be overwritten from outside
                //if (flipX)
                //    return this._flipXBoundary(ret);
                //return ret;
            }
            else {
                //cache.scaling = scaling;
                //cache.rotation = rotation;
                retB = this._calcBoundary(scaling, rotation, pixelAccuracy);//lookId, scaling, rotation, pixelAccuracy, cache);
                //cache.merge(retB);
                this._cache = retB;
            }
            if (flipX) {
                var tmp = retB.left
                retB.left = -retB.right;
                retB.right = -tmp;
                return retB;
            }
            return retB;
        },
        _calcBoundary: function (scaling, rotation, pixelAccuracy) {//imageId, scaling, rotation, pixelAccuracy, existingBoundary) {
            var scalingFactor = scaling !== undefined ? scaling / this._initialScaling : 1.0 / this._initialScaling,
                rotationRad = rotation ? rotation * Math.PI / 180.0 : 0.0;//,
                //initialLook = this._looks[imageId]; //the id may change as soon as looks get an id
            //{ canvas: canvas,                                 //minmized image (clipped + scaled initial) 
            //center: { length: undefined, angle: undefined },  //rotation point to look center
            //tl: { length: undefined, angle: undefined },      //rotation point to corner vectors
            //tr: { length: undefined, angle: undefined }, 
            //bl: { length: undefined, angle: undefined }, 
            //br: { length: undefined, angle: undefined } };

            var boundary = this._cache;//{};
            //if (this._cache)
            //    boundary = this._cache;
            //else {
            if (!boundary) {
                boundary = {};
                var calc = {},
                length = this.tl.length * scalingFactor,
                angle = this.tl.angle - rotationRad;    //notice: we have different rotation directions here: polar: counterclockwise, rendering: clockwise
                calc.tl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = this.tr.length * scalingFactor;
                angle = this.tr.angle - rotationRad;
                calc.tr = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = this.bl.length * scalingFactor;
                angle = this.bl.angle - rotationRad;
                calc.bl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = this.br.length * scalingFactor;
                angle = this.br.angle - rotationRad;
                calc.br = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                //var boundary;
                if (rotation)
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

            if (!pixelAccuracy || boundary.pixelAccuracy) {
                return boundary;
            }
            //calc pixel-exact values
            var trimOffsets = PocketCode.ImageHelper.getElementTrimOffsets(this.canvas, scaling, rotation);
            boundary.top -= Math.floor(trimOffsets.top / this._initialScaling);
            boundary.right -= Math.floor(trimOffsets.right / this._initialScaling);
            boundary.bottom += Math.ceil(trimOffsets.bottom / this._initialScaling);
            boundary.left += Math.ceil(trimOffsets.left / this._initialScaling);
            boundary.pixelAccuracy = true;

            return boundary;
        },
        //_flipBoundaryX: function (boundary) {
        //    var tmp = boundary.left
        //    boundary.left = -boundary.right;
        //    boundary.right = -tmp;
        //    return boundary;
        //},
        //    dispose: function () {
        //    },
    });

    return Look;
})();
