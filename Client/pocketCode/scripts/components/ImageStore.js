/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
'use strict';

/*
 * this class is used inside the gameEngine to load, cache, .. images + do some pre-optimizations (e.g. trim)
 */
PocketCode.ImageStore = (function () {
    ImageStore.extends(SmartJs.Core.EventTarget);   //img onload?

    //ctr
    function ImageStore() {
        this._imageCache = {};

        this._onLoadingProgress = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(ImageStore.prototype, {
        scaling: {
            value: 1,
            writeable: true,
        },
    });

    //events
    Object.defineProperties(ImageStore.prototype, {
        onLoadingProgress: {
            get: function () {
                return this._onLoadingProgress;
            },
        },
    });

    //methods
    ImageStore.prototype.merge({
        load: function (resourceBaseUrl, imgArray, totalSize) {  //[{ id: , url: , size: }, { .. }, ..]
            //TODO: load + progressEvents
            //store in _imageCache.id: {img: , offsetX: , offsetY: }
            //using the global scaling factor and the imageHelper class
        },
        getImage: function (id) {
            //TODO: returns an image object as {img: , offsetX: , offsetY: }
            //make sure to refactor the spriteChangeEvents to seld the current image object as look instead of the lookOrImage id
        },
    });

    return ImageStore;
})();
