/// <reference path="../core.js" />
/// <reference path="../view/programViewportView.js" />
'use strict';

PocketCode.PlayerViewportController = (function () {
    PlayerViewportController.extends(PocketCode.BaseController, false);

    function PlayerViewportController() {
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerViewportView());
        //this._viewportScaling = 1;
        this._renderingImages = [];
        this._redrawRequired = false;

        //this._view.onScalingChanged.addEventListener(new SmartJs.Event.EventListener(this._scalingChangedHandler, this));
    }

    ////properties
    //Object.defineProperties(PlayerViewportController.prototype, {
    //    //view: {
    //    //    get: function () {
    //    //        return this._view;
    //    //    },
    //    //},
    //    viewportScaling: {
    //        get: function () {
    //            return this._viewportScaling;
    //        },
    //    },
    //});

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
        //_scalingChangedHandler: function (e) {
        //    this._viewportScaling = e.scaling;

        //    var imgs = this._renderingImages;
        //    for (var i = 0, l = imgs.length; i < l; i++)
        //        imgs[i].viewportScaling = e.scaling;
        //    //        obj.object.left = obj._positionX * scaling + canvas.width / 2.0;
        //    //        obj.object.top = canvas.height - (obj._positionY * scaling + canvas.height / 2.0);
        //    //        obj.object.scaleX = obj._size * scaling / obj._initialScaling;
        //    //        obj.object.scaleY = obj._size * scaling / obj._initialScaling;
        //    //        obj.object.setCoords();

        //    this.render();
        //    //TODO: renderAll
        //    //this._view.canvasNeedsRedraw = true;
        //    //tested: console.log(this._viewportScaling);
        //},
        //spriteChanged: function (e) {
        //    this._view.canvasNeedsRedraw = true;
        //    this._view.handleSpriteChange(e.id, e.properties);
        //},
        updateSprite: function (spriteId, properties) {
            var img,
                imgs = this._renderingImages;
            for (var i = 0, l = imgs.length; i < l; i++) {
                img = imgs[i];
                if (img.id === spriteId) {
                    img.merge(properties);
                    if (properties.layer) {
                        imgs.remove(img);
                        imgs.insert(properties.layer, img);
                    }
                    break;
                }
            }
            this.render();
        },
        initRenderingImages: function (sprites) {
            //var renderingImages = [];
            for (var i = 0, l = sprites.length; i < l; i++)// {
                //var r = new PocketCode.RenderingImage(sprites[i]);
                this._renderingImages.push(new PocketCode.RenderingImage(sprites[i]));//r);
            //}

            //this._renderingImages = renderingImages;
            this._view.renderingImages = this._renderingImages;
            //this._view.render();  //we do not need this.. setting the items will not cause a rerender, but render() has to called at start
        },
        //load: function (images, sprites) {

        //},
        render: function() {
            if (this._renderingImages.length == 0 || this._redrawRequired)
                return;
            this._redrawRequired = true;
            window.requestAnimationFrame(this._redrawCanvas.bind(this));    //this works because we have already defined the function in sj-animation.js globally
            //this._redrawCanvas();
        },
        _redrawCanvas: function() {
            this._redrawRequired = false;
            this._view.render();
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
            img.src = this._view.getCanvasDataURL();//this._viewportScaling);
            return img;
        },
    });

    return PlayerViewportController;
})();
