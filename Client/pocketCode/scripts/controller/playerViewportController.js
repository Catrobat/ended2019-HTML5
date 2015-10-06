/// <reference path="../core.js" />
/// <reference path="../view/programViewportView.js" />
'use strict';

PocketCode.PlayerViewportController = (function () {
    PlayerViewportController.extends(PocketCode.BaseController, false);

    function PlayerViewportController() {
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerViewportView());
        this._viewportScaling = 1;
        this._view.onScalingChanged.addEventListener(new SmartJs.Event.EventListener(this._scalingChangedHandler, this));
    }

    //properties
    Object.defineProperties(PlayerViewportController.prototype, {
        //view: {
        //    get: function () {
        //        return this._view;
        //    },
        //},
        viewportScaling: {
            get: function () {
                return this._viewportScaling;
            },
        },
    });

    //events
    Object.defineProperties(PlayerViewportController.prototype, {
        //onScalingChanged: {
        //    get: function () {
        //        return this._view.onScalingChanged;
        //    },
        //},
        onSpriteClicked: {
            get: function () {
                return this._view.onSpriteClicked;
            }
        }
    });

    //methods
    PlayerViewportController.prototype.merge({
        _scalingChangedHandler: function (e) {
            this._viewportScaling = e.scaling;
            //TODO: renderAll
            this._view.canvasNeedsRedraw = true;
            //tested: console.log(this._viewportScaling);
        },
        load: function (images, sprites) {

        },
        setProjectScreenSize: function (width, height) {
            this._view.setOriginalViewportSize(width, height);
        },
        showAxes: function () {
            this._view.showAxes();
        },
        hideAxes: function () {
            this._view.hideAxes();
        },
        takeScreenshot: function () {
            var img = new Image();
            img.src = this._view.getCanvasDataURL(this._viewportScaling);
            return img;
        },

        spriteChanged: function (e) {
            this._view.canvasNeedsRedraw = true;
            this._view.handleSpriteChange(e.id, e.properties);
        },

        initRenderingImages: function(sprites) {
            var renderingImages = [];
            for (var i = 0, l = sprites.length; i < l; i++) {
                var r = new PocketCode.RenderingImage(sprites[i]);
                renderingImages.push(r);
            }

            this._view.renderingImages = renderingImages;
            this._view.render();
        },
    });

    return PlayerViewportController;
})();
