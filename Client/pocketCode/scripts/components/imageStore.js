/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-communication.js" />
/// <reference path="../core.js" />
/// <reference path="ImageHelper.js" />
'use strict';

/*
 * this class is used inside the gameEngine to load, cache, .. images
 */
PocketCode.ImageStore = (function () {
    ImageStore.extends(SmartJs.Core.EventTarget);

    //ctr
    function ImageStore() {
        this._images = {};      //original image objects including the image element

        this._resourceLoader = new SmartJs.Communication.ResourceLoader();
        this._resourceLoader.useSizeForProgressCalculation = true;
        var origin = PocketCode.crossOrigin;
        if (origin.initialized && origin.current && origin.supported)
            this._resourceLoader.crossOriginProperty = 'anonymous';

        this._onLoadingProgress = new SmartJs.Event.Event(this);

        //bind events
        this._resourceLoader.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._resourceLoaderProgressHandler, this));
    }

    //events
    Object.defineProperties(ImageStore.prototype, {
        onLoadingProgress: {
            get: function () {
                return this._onLoadingProgress;
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
        loadImages: function (resourceBaseUrl, imgArray) {
            if (!(imgArray instanceof Array))
                throw new Error('invalid parameter image array: expected type Array');

            var images = [];
            var img, url, idx;
            for (var i = 0, l = imgArray.length; i < l; i++) {
                img = imgArray[i];
                url = img.url.split('/');
                idx = url.length - 1;
                url[idx] = encodeURIComponent(url[idx]);

                img.url = resourceBaseUrl + url.join('/');
                img.type = 'img';
                images.push(img);
            }
            this._resourceLoader.load(images);
        },
        abortLoading: function() {
            this._resourceLoader.abortLoading();
        },
        _resourceLoaderProgressHandler: function (e) {
            var canvas = PocketCode.ImageHelper.scale(e.element);   //convert image to canvas elemetn

            var img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
            img.originalHeight = e.element.naturalHeight;
            img.originalWidth = e.element.naturalWidth;
            this._images[e.file.id] = img;

            this._onLoadingProgress.dispatchEvent({ progress: e.progress, file: e.file });
        },
        getImage: function (resourceId) {
            var img = this._images[resourceId];
            if (img)
                return img;
            throw new Error('requested resource image could not be found: ' + resourceId);
        },
        dispose: function () {
            this.abortLoading();
            this._resourceLoader.onProgressChange.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoaderProgressHandler, this));

            SmartJs.Core.EventTarget.prototype.dispose.call(this);
        },
    });

    return ImageStore;
})();
