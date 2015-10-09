/// <reference path="../core.js" />
/// <reference path="../view/programViewportView.js" />
'use strict';

PocketCode.PlayerViewportController = (function () {
    PlayerViewportController.extends(PocketCode.BaseController, false);

    function PlayerViewportController() {
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerViewportView());
        //this._viewportScaling = 1;
        this._renderingImages = [];
        this._renderingVariables = [];
        this._redrawRequired = false;
        this._redrawInProgress = false;

        //init default values
        this._projectScreenWidth = 200;
        this._projectScreenHeight = 380;
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
                imgs = this._renderingImages;//,
                //xOffset = this._projectScreenWidth / 2.0,
                //yOffset = this._projectScreenHeight / 2.0;

            //update positions: top/left positioning
            if (properties.x)
                properties.x += this._projectScreenWidth / 2.0;//xOffset;
            if (properties.y)
                properties.y = this._projectScreenHeight / 2.0 - properties.y;

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
        updateVariable: function (varId, properties) {
            var _var, _vars = this._renderingVariables;
            for (var i = 0, l = _vars.length; i < l; i++) {
                _var = _vars[i];
                if (_var.id === varId) {
                    _var.merge(properties);
                    break;
                }
            }
            this.render();
        },
        initRenderingImages: function (sprites) {
            if (!(sprites instanceof Array))
                throw new Error('invalid argument: sprites');
            //var renderingImages = [];
            var sprite;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprite = sprites[i];
                sprite.x += this._projectScreenWidth / 2.0;
                sprite.y = this._projectScreenHeight / 2.0 - sprite.y;
                //update positions: top/left positioning
                //var r = new PocketCode.RenderingImage(sprites[i]);
                if (sprite.look)    //there are sprites without look
                    this._renderingImages.push(new PocketCode.RenderingImage(sprite));//r);
            }

            //this._renderingImages = renderingImages;
            this._view.renderingImages = this._renderingImages;
            //this._view.render();  //we do not need this.. setting the items will not cause a rerender, but render() has to called at start
        },
        initRenderingVariables: function (variables) {
            if (!(variables instanceof Array))
                throw new Error('invalid argument: variables');
            for (var i = 0, l = variables.length; i < l; i++)
                this._renderingVariables.push(new PocketCode.RenderingText(spritevariables[i]));

            this._view.renderingVariables = this._renderingVariables;
        },
        //load: function (images, sprites) {

        //},
        render: function () {
            //TEST ONLY
            return this._view.render();
            //TEST ONLY

            //if (/*this._renderingImages.length == 0 ||*/ this._redrawRequired)
            //    return;
            this._redrawRequired = true;
            if (this._redrawInProgress)
                return;
            else
                window.requestAnimationFrame(this._redrawCanvas.bind(this));    //this works because we have already defined the function in sj-animation.js globally
            //this._redrawCanvas();
        },
        _redrawCanvas: function() {
            this._redrawRequired = false;
            this._redrawInProgress = true;
            this._view.render();
            this._redrawInProgress = false;
            if (this._redrawRequired)
                this.render();
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
            var img = new Image();
            img.src = this._view.getCanvasDataURL();//this._viewportScaling);
            return img;
        },
    });

    return PlayerViewportController;
})();
