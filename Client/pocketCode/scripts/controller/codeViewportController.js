/// <reference path="../core.js" />
/// <reference path="../view/programViewportView.js" />
'use strict';

PocketCode.CodeViewportController = (function () {
    CodeViewportController.extends(PocketCode.BaseController, false);

    function CodeViewportController() {
        PocketCode.BaseController.call(this, new PocketCode.Ui.CodeViewportView());

        //init default values
        this._projectScreenWidth = 200;
        this._projectScreenHeight = 380;
        this._zoomToFit = false;    //TODO: set canvas scaling
    }

    //properties
    Object.defineProperties(CodeViewportController.prototype, {
        dimensions: {
            get: function () {
                return {
                    width: this._projectScreenWidth,
                    height: this._projectScreenHeight
                };
            },
        },
        zoomToFit: {
            set: function (bool) {
                this._zoomToFit = bool;    //TODO: set canvas scaling
            },
        },
    });

    //methods
    CodeViewportController.prototype.merge({
        setProjectScreenSize: function (width, height) {
            this._projectScreenWidth = width;
            this._projectScreenHeight = height;
            this._view.setOriginalViewportSize(width, height);
        },
    });

    return CodeViewportController;
})();
