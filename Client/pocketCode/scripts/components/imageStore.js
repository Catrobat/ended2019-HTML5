/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-communication.js" />
/// <reference path="ImageHelper.js" />
'use strict';

/*
 * this class is used inside the gameEngine to load, cache, .. images + do some pre-optimizations (e.g. trim)
 */
PocketCode.ImageStore = (function () {
    ImageStore.extends(SmartJs.Core.EventTarget);   //img onload?

    //ctr
    function ImageStore() {
        this._initialScaling = 1;
        this._images = {};      //original image objects including the image element
        this._looks = {};       //look objects including a canvas object (clipped image) + vectors used for calculations and rendering
        this._lookCache = {};   //{spriteId: {imageId: { caching items } } }: this will change as soon as lookIDs are availanle

        this._resourceLoader = new SmartJs.Communication.ResourceLoader();
        this._resourceLoader.useSizeForProgressCalculation = true;
        this._resourceLoader.crossoriginProperty = "anonymous";

        this._onLoadingProgressChange = new SmartJs.Event.Event(this);

        //bind events
        this._resourceLoader.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._resourceLoaderProgressHandler, this));
    }

    //properties
    Object.defineProperties(ImageStore.prototype, {
    });

    //events
    Object.defineProperties(ImageStore.prototype, {
        onLoadingProgressChange: {
            get: function () {
                return this._onLoadingProgressChange;
            },
        },
        onLoad: {
            get: function () {
                return this._resourceLoader.onLoad;
            },
        },
        onLoadingError: {
            get: function () {
                return this._resourceLoader.onError;
            },
        },
    });

    //methods
    ImageStore.prototype.merge({
        loadImages: function (resourceBaseUrl, imgArray, initialScaling) {  //[{ id: , url: , size: }, { .. }, ..]
            if (!(imgArray instanceof Array))
                throw new Error('invalid parameter image array: expected type Array');

            if (initialScaling !== undefined)
                this._initialScaling = initialScaling;
            var images = [];
            var img;
            for (var i = 0, l = imgArray.length; i < l; i++) {
                img = imgArray[i];
                img.url = resourceBaseUrl + img.url;
                img.type = 'img';
                images.push(img);
            }
            this._resourceLoader.load(images);
        },
        abortLoading: function() {
            this._resourceLoader.abortLoading();
        },
        _resourceLoaderProgressHandler: function (e) {
            var imgObject = e.file,
                imgElement = e.element,
                look = {};
            imgObject.image = imgElement;
            
            //register in store: this._images.ID = { id: , url: , size: , img: };
            look.canvas = PocketCode.ImageHelper.scale(imgElement, this._initialScaling);
            this._looks[imgObject.id] = look;
            this._images[imgObject.id] = imgObject;
            this._looks[imgObject.id] = this._initLook(imgObject.id);
            this._onLoadingProgressChange.dispatchEvent({ progress: e.progress });
        },
        _initLook: function (lookId, rotationCenterX, rotationCenterY) {
            var look = this._looks[lookId];//.look;
            var canvas = look.canvas;
            var ih = PocketCode.ImageHelper;

            if (rotationCenterX === undefined && rotationCenterY === undefined)
                return ih.adjustCenterAndTrim(canvas, undefined, undefined, true);
            else if (typeof rotationCenterX === 'number' && typeof rotationCenterY === 'number')
                return ih.adjustCenterAndTrim(canvas, rotationCenterX * this._initialScaling, rotationCenterY * this._initialScaling, true);
            throw new Error('both rotation center arguments are required (typeof number)');
        },
        getLook: function (lookId) {
            //returns a look object including its imageObject -> please notice that this can differ from the original image, e.g. resized due to rotationCenter position, 
            var look = this._looks[lookId];
            if (look) {
                return { canvas: look.canvas, center: { length: look.center.length, angle: look.center.angle }, initialScaling: this._initialScaling };
            }
            throw new Error('requested look could not be found: ' + id);
        },
        _calcLookBoundary: function (imageId, scaling, rotation, pixelAccuracy, existingBoundary) {
            var scalingFactor = scaling !== undefined ? scaling / this._initialScaling : 1 / this._initialScaling,
                rotationRad = rotation ? rotation * Math.PI / 180 : 0,
                initialLook = this._looks[imageId]; //the id may change as soon as looks get an id
            //{ canvas: canvas,                                 //minmized image (clipped + scaled initial) 
            //center: { length: undefined, angle: undefined },  //rotation point to look center
            //tl: { length: undefined, angle: undefined },      //rotation point to corner vectors
            //tr: { length: undefined, angle: undefined }, 
            //bl: { length: undefined, angle: undefined }, 
            //br: { length: undefined, angle: undefined } };

            var boundary = {};
            if (existingBoundary)
                boundary = existingBoundary;
            else {
                var calc = {},
                length = initialLook.tl.length * scalingFactor,
                angle = initialLook.tl.angle - rotationRad;    //notice: we have different rotation directions here: polar: counterclockwise, rendering: clockwise
                calc.tl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = initialLook.tr.length * scalingFactor;
                angle = initialLook.tr.angle - rotationRad;
                calc.tr = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = initialLook.bl.length * scalingFactor;
                angle = initialLook.bl.angle - rotationRad;
                calc.bl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = initialLook.br.length * scalingFactor;
                angle = initialLook.br.angle - rotationRad;
                calc.br = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                var boundary;
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
            var trimOffsets = PocketCode.ImageHelper.getElementTrimOffsets(initialLook.canvas, scaling, rotation);
            boundary.top -= Math.floor(trimOffsets.top / this._initialScaling);
            boundary.right -= Math.floor(trimOffsets.right / this._initialScaling);
            boundary.bottom += Math.ceil(trimOffsets.bottom / this._initialScaling);
            boundary.left += Math.ceil(trimOffsets.left / this._initialScaling);
            boundary.pixelAccuracy = true;

            return boundary;
        },
        /* notice: this function is only correct because all corners got aligned already after rotation */
        _flipXBoundary: function (boundary) {
            var tmp = boundary.left
            boundary.left = -boundary.right;
            boundary.right = -tmp;
            return boundary;
        },
        getLookBoundary: function (spriteId, lookId, scaling, rotation, flipX, pixelAccuracy) {
            /* returns the looks offsets depending on the looks rotation centre = image center */

            /*  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            /*  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            /*  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            /*  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to inclrease performance)
            */
            var //initialLook = this._images[spriteId].look,
                lc = this._lookCache,
                cachedSprite = lc[spriteId],
                cachedLook;

            if (!cachedSprite) {//lc[spriteId] && lc[spriteId][lookId])
                lc[spriteId] = {};
                cachedSprite = lc[spriteId];
            }
            cachedLook = cachedSprite[lookId];

            if (cachedLook) { //cachedLook: {scaling: , rotation: , top: , right: , bottom: , left: , pixelAccuracy: }
                if (cachedLook.scaling === scaling && cachedLook.rotation === rotation) {
                    if (pixelAccuracy && !cachedLook.pixelAccuracy) {
                        var boundary = this._calcLookBoundary(lookId, scaling, rotation, pixelAccuracy, cachedLook);
                        cachedLook.scaling = scaling;
                        cachedLook.rotation = rotation;
                        cachedLook.merge(boundary);
                        if (flipX)
                            return this._flipXBoundary(boundary);
                        return boundary;
                    }
                    var ret = { top: cachedLook.top, right: cachedLook.right, bottom: cachedLook.bottom, left: cachedLook.left, pixelAccuracy: cachedLook.pixelAccuracy };   //make sure the cache cannot be overwritten from outside
                    if (flipX)
                        return this._flipXBoundary(ret);
                    return ret;
                }
                else {
                    var boundary = this._calcLookBoundary(lookId, scaling, rotation, pixelAccuracy);
                    cachedLook.scaling = scaling;
                    cachedLook.rotation = rotation;
                    cachedLook.merge(boundary);
                    if (flipX)
                        return this._flipXBoundary(boundary);
                    return boundary;
                }
            }
            else {
                cachedSprite[lookId] = { scaling: scaling, rotation: rotation };
                var boundary = this._calcLookBoundary(lookId, scaling, rotation, pixelAccuracy);
                cachedSprite[lookId].merge(boundary);
                if (flipX)
                    return this._flipXBoundary(boundary);
                return boundary;
            }
        },
        dispose: function () {
            this.abortLoading();
            this._resourceLoader.onProgressChange.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoaderProgressHandler, this));

            SmartJs.Core.EventTarget.prototype.dispose.call(this);
        },
    });

    return ImageStore;
})();
