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
        this._images = {};
        this._lookCache = {};

        this._canvas = document.createElement('canvas');    //TODO: this was added so I can connect to in for visual debug output
        this._context = this._canvas.getContext('2d');

        this._resourceLoader = new SmartJs.Communication.ResourceLoader();
        this._resourceLoader.useSizeForProgressCalculation = true;
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
        _resourceLoaderProgressHandler: function (e) {
            var file = e.file;
            var img = e.element;
            //register in store: this._images.ID = { id: , url: , size: , img: };
            file.merge({ image: PocketCode.ImageHelper.scale(img, this._initialScaling) });
            this._images[file.id] = file;
            //image preprocessing: //TODO: make sure to edit this per look if supporting scratch (different rotation center information per look)
            this._images[file.id].look = this._initLook(file.id);
            this._onLoadingProgressChange.dispatchEvent({ progress: e.progress });
        },
        _initLook: function (imgId, rotationCenterX, rotationCenterY) {
            var img = this._images[imgId].image;
            var ih = PocketCode.ImageHelper;

            if (rotationCenterX === undefined && rotationCenterY === undefined)
                return PocketCode.ImageHelper.adjustCenterAndTrim(img, undefined, undefined, true);
            else if (typeof rotationCenterX === 'number' && typeof rotationCenterY === 'number')
                return PocketCode.ImageHelper.adjustCenterAndTrim(img, rotationCenterX * this._initialScaling, rotationCenterY * this._initialScaling, true);
            throw new Error('both rotation center arguments are required (typeof number)');
        },
        getLook: function(imageId) {
            //returns a look object including its imageObject -> please notice that this can differ from the original image, e.g. resized due to rotationCenter position, 
            //including image.initialScaling
            var img = this._images[imageId];
            if (img && img.look)
                return img.look.merge({ initialScaling: this._initialScaling });
            throw new Error('requested look could not be found: ' + id);
        },
        _calcLookBoundary: function(imageId, scaling, rotation, pixelAccuracy, /*top, right, bottom, left,*/ existingBoundings) {
            var scalingFactor = scaling / this._initialScaling,
                rotation = rotation * Math.PI / 180,
                initialLook = this._images[imageId].look;  //this may change as soon as looks get an id
            //{ image: img, 
            //tl: { length: undefined, angle: undefined }, //TODO: length /= scaling!!!
            //tr: { length: undefined, angle: undefined }, 
            //bl: { length: undefined, angle: undefined }, 
            //br: { length: undefined, angle: undefined } };

            var boundings = {};
            if (existingBoundings)
                boundings = existingBoundings;
            else {
                var calc = {},
                    length = initialLook.tl.length * scalingFactor,
                    angle = initialLook.tl.angle + rotation;

                calc.tl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = initialLook.tr.length * scalingFactor;
                angle = initialLook.tr.angle + rotation;
                calc.tr = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = initialLook.bl.length * scalingFactor;
                angle = initialLook.bl.angle + rotation;
                calc.bl = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                length = initialLook.br.length * scalingFactor;
                angle = initialLook.br.angle + rotation;
                calc.br = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

                var boundings = {   //due to rotation every corner can become a max/min value
                    top: Math.ceil(Math.max(calc.tl.y, calc.tr.y, calc.bl.y, calc.br.y)),
                    right: Math.ceil(Math.max(calc.tl.x, calc.tr.x, calc.bl.x, calc.br.x)),
                    bottom: Math.floor(Math.min(calc.tl.y, calc.tr.y, calc.bl.y, calc.br.y)),
                    left: Math.floor(Math.min(calc.tl.x, calc.tr.x, calc.bl.x, calc.br.x)),
                };
            }

            if (!pixelAccuracy) {
                return boundings;
            }
            //calc pixel-exact values
            var trimOffsets = PocketCode.ImageHelper.getImageTrimOffsets(initialLook.image, scaling, rotation);//, true, true, true, true);//, right, bottom, left);
            boundings.top -= Math.floor(trimOffsets.top / this._initialScaling);
            boundings.right -= Math.floor(trimOffsets.right / this._initialScaling);
            boundings.bottom += Math.ceil(trimOffsets.bottom / this._initialScaling);
            boundings.left += Math.ceil(trimOffsets.left / this._initialScaling);

            return boundings;
        },
        _flipXBoundary: function(boundary) {
            var tmp = boundary.left
            boundary.left = -boundary.right;
            boundary.right = -tmp;
        },
        getLookBoundary: function(spriteId, lookId, scaling, rotation, flipX, pixelAccuracy) {
            /* returns the looks offsets depending on the looks rotation centre = image center */

            /*  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            /*  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            /*  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            /*  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to inclrease performance)
            */
            var //initialLook = this._images[spriteId].look,
                lc = this._lookCache,
                sprite = lc[spriteId],
                look;
            
            if (!sprite)//lc[spriteId] && lc[spriteId][lookId])
                lc[spriteId] = {};

            look = sprite[lookId];
            //if (!look)
            //    sprite[lookId] = {};

            if (look) { //look: {scaling: , rotation: , top: , right: , bottom: , left: , pixelAccuracy: }
                if (look.scaling === scaling && look.rotation === rotation) {
                    if (pixelAccuracy && !look.pixelAccuracy) {
                        var boundary = this._calcLookBoundary(lookId, scaling, rotation, pixelAccuracy, look);
                        look.merge(boundary);
                        if (flipX)
                            return this._flipXBoundary(boundary);
                        return boundary;
                    }
                    var ret = { top: look.top, right: look.right, bottom: look.bottom, left: look.left, pixelAccuracy: look.pixelAccuracy };   //make sure the cache cannot be overwritten from outside
                    if (flipX)
                        return this._flipXBoundary(ret);
                    return ret;
                }
                else {
                    var boundary = this._calcLookBoundary(lookId, scaling, rotation, pixelAccuracy);
                    look.merge(boundary);
                    if (flipX)
                        return this._flipXBoundary(boundary);
                    return boundary;
                }
            }
            else {
                sprite[lookId] = { scaling: scaling, rotation: rotation };
                var boundary = this._calcLookBoundary(lookId, scaling, rotation, pixelAccuracy);
                sprite[lookId].merge(boundary);
                if (flipX)
                    return this._flipXBoundary(boundary);
                return boundary;
            }
        },
    });

    return ImageStore;
})();
