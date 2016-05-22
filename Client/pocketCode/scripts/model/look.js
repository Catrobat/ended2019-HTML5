/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Model.Look = (function () {

    function Look(jsonLooks) {
        this._id = jsonLooks.id;
        this._imageId = jsonLooks.imageId;
        this._name = jsonLooks.name;

        this._rotationCenterX = jsonLooks.rotationCenterX;
        this._rotationCenterY = jsonLooks.rotationCenterY;
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
    });

    //Look.prototype.merge({
    //    dispose: function () {
    //    },
    //});

    return Look;
})();
