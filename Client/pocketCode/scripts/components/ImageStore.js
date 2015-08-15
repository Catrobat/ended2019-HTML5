/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
'use strict';

/*
 * this class is used inside the gameEngine to load, cache, .. images + do some pre-optimizations (e.g. trim)
 */
PocketCode.ImageStore = (function () {
    ImageStore.extends(SmartJs.Core.EventTarget);

    //ctr
    function ImageStore(scope, globalLookupHost) {
    }

    //properties
    Object.defineProperties(ImageStore.prototype, {
    });

    //events
    Object.defineProperties(ImageStore.prototype, {
    });

    //methods
    ImageStore.prototype.merge({
    });

    return ImageStore;
})();
