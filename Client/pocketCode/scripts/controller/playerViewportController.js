/// <reference path="../core.js" />
/// <reference path="../view/programViewportView.js" />
'use strict';

PocketCode.PlayerViewportController = (function () {
    PlayerViewportController.extends(PocketCode.BaseController, false);

    function PlayerViewportController() {
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerViewportView());
        this._renderingImages = [];
        this._renderingTexts = [];
        this._redrawRequired = false;
        this._redrawInProgress = false;

        //init default values
        this._projectScreenWidth = 200;
        this._projectScreenHeight = 380;
    }

    //properties
    Object.defineProperties(PlayerViewportController.prototype, {
        renderingImages: {
            set: function (rimgs) {
                if (!(rimgs instanceof Array))
                    throw new Error('invalid argument: rendering images');

                this._renderingImages = rimgs;
                this._view.renderingImages = rimgs;
            },
        },
        renderingTexts: {
            set: function (texts) {
                if (!(texts instanceof Array))
                    throw new Error('invalid argument: texts');

                this._renderingTexts = texts;
                this._view.renderingTexts = texts;
            },
        },
        dimensions: {
            get: function () {
                return {
                    width: this._projectScreenWidth,
                    height: this._projectScreenHeight
                };
            },
        },
    });

    //events
    Object.defineProperties(PlayerViewportController.prototype, {
        onSpriteClicked: {
            get: function () {
                return this._view.onSpriteClicked;
            },
        },
    });

    //methods
    PlayerViewportController.prototype.merge({
        updateSprite: function (spriteId, properties) {
            var img,
                imgs = this._renderingImages,
                visible;

            for (var i = 0, l = imgs.length; i < l; i++) {
                img = imgs[i];
                if (img.id === spriteId) {
                    visible = img.visible;
                    img.merge(properties);

                    if (properties.layer !== undefined) {
                        var layer = properties.layer;
                        imgs.remove(img);
                        if (layer > imgs.length)
                            imgs.push(img);
                        else if (layer < 1)         //ignore background = idx[0]
                            imgs.insert(1, img);    //this may change as soon we support the camera
                        imgs.insert(layer, img);
                    }
                    if (img.visible || visible != img.visible)   //visible or visibility changed
                        this._view.render();
                    break;
                }
            }
        },
        updateVariable: function (varId, properties) {  //properties: {text: , x: , y: , visible: }
            var _text,
                _texts = this._renderingTexts,
                _visible;

            for (var i = 0, l = _texts.length; i < l; i++) {
                _text = _texts[i];
                _visible = _text.visible;
                if (_text.id === varId) {
                    _text.merge(properties);
                    if (_text.visible != false || _visible != _text.visible)   //visible or visibility changed
                        this._view.render();
                    break;
                }
            }
        },
        setProjectScreenSize: function (width, height) {
            this._projectScreenWidth = width;
            this._projectScreenHeight = height;
            this._view.setOriginalViewportSize(width, height);
        },
        showAxes: function () {
            this._view.showAxes();
        },
        hideAxes: function () {
            this._view.hideAxes();
        },
        takeScreenshot: function () {
            return this._view.getCanvasDataURL();
        },
    });

    return PlayerViewportController;
})();
