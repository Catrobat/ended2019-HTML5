/// <reference path="../core.js" />
/// <reference path="../view/programViewportView.js" />
'use strict';

PocketCode.PlayerViewportController = (function () {
    PlayerViewportController.extends(PocketCode.BaseController, false);

    function PlayerViewportController() {
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerViewportView());
        this._renderingImages = [];
        this._renderingVariables = [];
        this._redrawRequired = false;
        this._redrawInProgress = false;

        //init default values
        this._projectScreenWidth = 200;
        this._projectScreenHeight = 380;
    }

    //properties
    Object.defineProperties(PlayerViewportController.prototype, {
        renderingImages: {
            get: function () {
                return this._renderingImages;
            },
        },
        renderingVariables: {
            get: function () {
                return this._renderingVariables;
            },
        },
        dimensions: {
            get: function () {
                return {width: this._projectScreenWidth,
                        height: this._projectScreenHeight}
            }
        }
    });

    //events
    Object.defineProperties(PlayerViewportController.prototype, {
        onSpriteClicked: {
            get: function () {
                return this._view.onSpriteClicked;
            }
        }
    });

    //methods
    PlayerViewportController.prototype.merge({
        _transformXCoordinate : function(wx) {
            return wx + this._projectScreenWidth / 2.0;
        },
        _transformYCoordinate : function(wy) {
            return this._projectScreenHeight / 2. - wy;
        },
        initRenderingImages: function (sprites) {
            if (!(sprites instanceof Array))
                throw new Error('invalid argument: sprites');
            //var renderingImages = [];
            var sprite;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprite = sprites[i];
                sprite.x = this._transformXCoordinate(sprite.x);
                sprite.y = this._transformYCoordinate(sprite.y);

                //update positions: top/left positioning
                if (sprite.look)    //there are sprites without look
                    this._renderingImages.push(new PocketCode.RenderingImage(sprite));//r);
            }

            this._view.renderingImages = this._renderingImages;
        },
        updateSprite: function (spriteId, properties) {
            var img,
                imgs = this._renderingImages,
                visible;

            //update positions: top/left positioning
            if (properties.x !== undefined)
                properties.x = this._transformXCoordinate(properties.x);
            if (properties.y !== undefined){
                properties.y = this._transformYCoordinate(properties.y);
            }

            for (var i = 0, l = imgs.length; i < l; i++) {
                img = imgs[i];
                if (img.id === spriteId) {
                    visible = img.visible;
                    img.merge(properties);

                    if (properties.layer !== undefined) {
                        imgs.remove(img);
                        imgs.insert(properties.layer, img);
                    }
                    if (img.visible || visible != img.visible)   //visible or visibility changed
                        this._view.render();
                    break;
                }
            }
        },
        initRenderingVariables: function (variables) {
            if (!(variables instanceof Array))
                throw new Error('invalid argument: variables');
            var _var;
            for (var i = 0, l = variables.length; i < l; i++) {
                _var = variables[i];
                _var.x = this._transformXCoordinate(_var.x);
                _var.y = this._transformYCoordinate(_var.y);
                this._renderingVariables.push(new PocketCode.RenderingText(_var));
            }
            this._view.renderingVariables = this._renderingVariables;
        },
        updateVariable: function (varId, properties) {  //properties: {text: , x: , y: , visible: }
            var _var,
                _vars = this._renderingVariables,
                _visible;
            //update positions: top/left positioning
            if (properties.x !== undefined)
                properties.x = this._transformXCoordinate(properties.x);
            if (properties.y !== undefined)
                properties.y = this._transformYCoordinate(properties.y);

            for (var i = 0, l = _vars.length; i < l; i++) {
                _var = _vars[i];
                _visible = _var.visible;
                if (_var.id === varId) {
                    _var.merge(properties);
                    if (_var.visible != false || _visible != _var.visible)   //visible or visibility changed
                        this._view.render(); //this.render();
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
