/// <reference path="../core.js" />
/// <reference path="../view/programViewportView.js" />
'use strict';

PocketCode.PlayerViewportController = (function () {
    PlayerViewportController.extends(PocketCode.BaseController, false);

    function PlayerViewportController() {
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerViewportView());

        this._renderingSprite = [];
        this._renderingTexts = [];

        //init default values
        this._projectScreenWidth = 200;
        this._projectScreenHeight = 380;
        this._zoomToFit = false;    //TODO: set canvas scaling
    }

    //properties
    Object.defineProperties(PlayerViewportController.prototype, {
        renderingSprites: {
            set: function (rimgs) {
                if (!(rimgs instanceof Array))
                    throw new Error('invalid argument: rendering images');

                this._renderingSprite = rimgs;
                this._view.renderingSprites = rimgs;
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
        zoomToFit: {
            set: function (bool) {
                this._zoomToFit = bool;    //TODO: set canvas scaling
            },
        },
    });

    //events
    Object.defineProperties(PlayerViewportController.prototype, {
        onUserAction: {
            get: function () {
                return this._view.onUserAction;
            },
        },

        onCanvasSizeUpdated: {
            get: function(){
                return this._view._onCanvasSizeUpdated;
            }
        }

    });

    //methods
    PlayerViewportController.prototype.merge({
        updateSprite: function (spriteId, properties) {
            var img,
                imgs = this._renderingSprite,
                visible;

            if (properties.showAskDialog !== undefined) {
                if (properties.showAskDialog) {
                    this._view.showAskDialog(properties.question, properties.callback);
                    delete properties.question;
                    delete properties.callback;
                }
                else {
                    this._view.hideAskDialog();
                }
                delete properties.showAskDialog;
                if (Object.keys(properties).length == 0)
                    return;
            }
            else if (properties.hasOwnProperty('penX') || properties.hasOwnProperty('penY')) {
                this._view.movePen(spriteId, properties.penX, properties.penY);
            }
            else if (properties.hasOwnProperty('drawStamp') && properties.drawStamp) {
                this._view.drawStamp(spriteId);
                delete properties.drawStamp;
            }
            else if (properties.hasOwnProperty('clearBackground') && properties.clearBackground) {
                this._view.clearCurrentPenStampCache();
                delete properties.clearBackground;
            }

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
        updateVariable: function (scopeId, variableId, value, viewState) {  //properties: { visible: , x: , y: }
            var _text,
                _texts = this._renderingTexts,
                _visible;

            for (var i = 0, l = _texts.length; i < l; i++) {
                _text = _texts[i];
                _visible = _text.visible;
                if (_text.scopeId == scopeId && _text.id === variableId) {
                    _text.value = value;
                    _text.merge(viewState);
                    if (_text.visible != false || _visible != _text.visible)   //visible or visibility changed
                        this._view.render();
                    break;
                }
            }
        },

        updateCameraUse: function (e) {    //TODO: params
            this._view.updateCameraUse(e);
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
        initScene: function (id, screenSize, reinit) {
            this._view.initScene(id, screenSize, reinit);
        },
        clearViewport: function () {
            this._view.clear();
        },
        takeScreenshot: function () {
            return this._view.getCanvasDataURL();
        },
    });

    return PlayerViewportController;
})();
