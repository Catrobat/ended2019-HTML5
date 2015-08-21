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

        this._resourceLoader = new SmartJs.Communication.ResourceLoader();
        this._resourceLoader.useSizeForProgressCalculation = true;
        this._onLoadingProgressChange = new SmartJs.Event.Event(this);
        //this._onLoad = new SmartJs.Event.Event(this);
        //this._onLoadingError = new SmartJs.Event.Event(this);

        //bind events
        this._resourceLoader.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._resourceLoaderProgressHandler, this));
        //this._resourceLoader.onLoad.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onLoad.dispatchEvent(); }, this));
        //this._resourceLoader.onError.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onLoadingError.dispatchEvent(e); }, this));
    }

    //properties
    Object.defineProperties(ImageStore.prototype, {
        //initialScaling: {     //should not be used for rendering, as it's included in the looks already
        //    get: function () {
        //        return this._initialScaling;
        //    }
        //},
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
            this._images[file.id] = file;//TODO:.merge({ img: PocketCode.ImageHelper.scale(img, this._initialScaling) });
            //image preprocessing: //TODO: make sure to edit this per look if supporting scratch (different rotation center information per look)
            this._images[file.id].look = this._initLook(file.id);
            this._onLoadingProgressChange.dispatchEvent({ progress: e.progress });
        },
        _initLook: function (imgId, rotationCenterX, rotationCenterY) {
            var img = this._images[imgId].img;
            //var ih = PocketCode.ImageHelper;
            var look = new Image();//TODO: PocketCode.ImageHelper.adjustCenterAndTrim(img, /*this._initialScaling, */rotationCenterX / this._initialScaling, rotationCenterY / this._initialScaling, true);
            return look;
        },
        //getImage: function (id) {
            //TODO: returns an image object as {img: , offsetX: , offsetY: , scaled: }
            //make sure to refactor the spriteChangeEvents to seld the current image object as look instead of the lookOrImage id
        //},
        getLook: function(id) {
            //returns a look object including its imageObject -> please notice that this can differ from the original image, e.g. resized due to rotationCenter position, 
            //including image.initialScaling
            if (this._images.id)
                return { imgObject: this._images.id.look, initialScaling: this._initialScaling };
            throw new Error('requested look could not be found: ' + id);
        },
        getLookBoundary: function(spriteId, lookId, scalingFactor, rotationAngle, flipX, pixelAccuracy) {
            //TODO: move logic:
            /*  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            /*  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            /*  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            /*  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to inclrease performance)
            */
            return { top: 0, right: 0, bottom: 0, left: 0, pixelAccuracy: true };
        },
        getViewportOverflow: function (viewportHeight, viewportWidth, spriteId, imgId, scalingFactor, rotationAngle, flipX, posX, posY, boundings) {    //TODO: change bounding param
            //TODO: spriteId is used for cache- lookup
            //the boundings property indicates what we have to look for: only properties != 0, but this time we have to include negative offsets as well

            var spriteSize = this._getCachedImageSize(imgId, scalingFactor, rotationAngle);
            var includeNegativeValues = boundings ? true : false;

            var h2 = Math.ceil(spriteSize.height / 2),  //TODO: take care of the spriteSize.pixelAccuracy property
                w2 = Math.ceil(spriteSize.width / 2),
                top, right, bottom, left;


            //check boundings
            if (boundings) {
                var tmp;
                if (flipX) {    //ok.. this is not beautiful but we have to switch properties as flipX, flipY is currently not supported (please include this in imgHelper)
                    tmp = boundings.left;
                    boundings.left = boundings.right;
                    boundings.right = tmp;
                }
                if (flipY) {
                    tmp = boundings.top;
                    boundings.top = boundings.bottom;
                    boundings.bottom = tmp;
                }

                if (boundings.top)
                    top = true;
                if (boundings.right)
                    right = true;
                if (boundings.bottom)
                    bottom = true;
                if (boundings.left)
                    left = true;
            }
            else {
                if (posY - h2 < 0)
                    top = true;
                if (posX + w2 > viewportWidth)
                    right = true;
                if (posY + h2 > viewportHeight)
                    bottom = true;
                if (posX - w2 < 0)
                    left = true;
            }

            //check pixels
            var os = this._getCachedImageOffsets(imgId, scalingFactor, rotationAngle, top, right, bottom, left);
            var tmp = 0;
            if (top) {
                tmp = posY - h2 + os.top;
                if (tmp < 0)
                    os.top = -tmp;   //override with pixels to move
            }
            else
                os.top = 0;
            if (right) {
                tmp = posX + w2 - os.right;
                if (tmp > viewportWidth)
                    os.right = viewportWidth - tmp;   //override with pixels to move
            }
            else
                os.right = 0;
            if (bottom) {
                tmp = posY + h2 - os.bottom;
                if (tmp > viewportHeight)
                    os.bottom = viewportHeight - tmp;   //override with pixels to move
            }
            else
                os.bottom = 0;
            if (left) {
                tmp = posX - h2 + os.left;
                if (tmp < 0)
                    os.left = tmp;   //override with pixels to move
            }
            else
                os.left = 0;

            if (!includeNegativeValues) {
                if (os.top && as.top <= 0)
                    os.top = undefined;
                if (os.right && as.right <= 0)
                    os.right = undefined;
                if (os.bottom && as.bottom<= 0)
                    os.bottom = undefined;
                if (os.left && as.left <= 0)
                    os.left = undefined;
            }

            //TODO: 
            //flipX: we do not care about it during calculation, just switch the left/right numbers //TODO???
            //if a rotated image get's flipped we (might) have a serious propblem in the future.. we should include it in the rendering process

            if (flipX) {    //make sure the return value includes the right offsets: switch back
                var tmp = os.left;
                os.left = os.right;
                os.right = tmp;
            }
            if (flipY) {
                var tmp = os.top;
                os.top = os.bottom;
                os.bottom = tmp;
            }

            return os;
        },
        _getCachedImageSize: function (id, scalingFactor, rotationAngle) {
            var size = { height: undefined, width: undefined, pixelAccuracy: false };

            //use: getBoundingSize for first check or calculate boundings exactly on first try? (to cache them)

            //TODO: calculate bounding size (no pixel based detection) using imaeHelper (if not in cache)
            //      think of caching this or caching relevant data like the diagonal: caching has to be done on imgId + spriteId as images can be used in more than one look
            //      make sure pixel size returnd is int (Math.ceil())

            //the return property "pixelAccuracy" will notify you if the size is based on the bounding box or already takes care of trimOffsets: 
            //^^ if they are in cache they should be included to avoid double-checking in the ifSpriteOnEdgeBounce method
            return size;
        },
        _getCachedImageOffsets: function (id, scalingFactor, rotationAngle, top, left, bottom, right) {
            //TODO: caching and lookup
            //^^ caching seams important here as bounce back is mainly used in loops -> several checks before one bounce
            
            return PocketCode.ImageHelper.getTrimOffsets(this.getImage(id), scalingFactor, rotationAngle, top, right, bottom, left);
        },
    });

    return ImageStore;
})();
