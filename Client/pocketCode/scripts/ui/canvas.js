/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.Canvas = (function () {
    Canvas.extends(SmartJs.Ui.Control, false);

    function Canvas(args) {
        args = args || { className: 'pc-canvasContainer' };
        SmartJs.Ui.Control.call(this, 'div', args);

        this._lowerCanvasEl = document.createElement('canvas');
        this._dom.appendChild(this._lowerCanvasEl);
        this._contextContainer = this._lowerCanvasEl.getContext('2d');

        this._upperCanvasEl = document.createElement('canvas');
        this._dom.appendChild(this._upperCanvasEl);
        this._contextTop = this._upperCanvasEl.getContext('2d');

        this._cacheCanvasEl = document.createElement('canvas');
        this._contextCache = this._cacheCanvasEl.getContext('2d');

        this._onMouseDown = new SmartJs.Event.Event(this);
        this._addDomListener(this._upperCanvasEl, 'mousedown', this.__onMouseDown);
        this._addDomListener(this._upperCanvasEl, 'touchstart', this.__onMouseDown);

        this._renderingObjects = [];
        this._renderingTexts = [];
        this._scalingX = 1.0;
        this._scalingY = 1.0;
    }

    //properties
    Object.defineProperties(Canvas.prototype, {
        contextTop: {
            get: function () {
                return this._contextTop;
            },
        },
        renderingImages: {
            set: function (list) {
                this._renderingObjects = list;  //TODO: exception handling, argument check
            },
        },
        renderingTexts: {
            set: function (list) {
                this._renderingTexts = list;  //TODO: exception handling, argument check
            },
        },
    });

    //events
    Object.defineProperties(Canvas.prototype, {
        onMouseDown: {
            get: function () {
                return this._onMouseDown;
            },
        }
    });

    //methods
    Canvas.prototype.merge({

        setDimensions: function (width, height, scalingX, scalingY) {
            width = Math.floor(width / 2.0) * 2.0;
            height = Math.floor(height / 2.0) * 2.0;

            this.height = height;
            this.width = width;

            this._lowerCanvasEl.height = height;
            this._lowerCanvasEl.width = width;
            this._upperCanvasEl.height = height;
            this._upperCanvasEl.width = width;

            this._scalingX = scalingX;
            this._scalingY = scalingY;

            this._cacheCanvasEl.setAttribute('width', width / scalingX);
            this._cacheCanvasEl.setAttribute('height', height / scalingY);
        },

        scale: function(x, y) {
            this._scalingX = x;
            this._scalingY = y;
            this.render();
        },

        clear: function () {
            this._contextTop.clearRect(0, 0, this.width, this.height);
            this._contextContainer.clearRect(0, 0, this.width, this.height);
        },

        __onMouseDown: function (e) {
            var isLeftClick = 'which' in e ? e.which === 1 : e.button === 1;

            if (!isLeftClick && !SmartJs.Device.isTouch) {
                return;
            }

            var pointerX, pointerY;
            var boundingClientRect = this._lowerCanvasEl.getBoundingClientRect();

            if (SmartJs.Device.isTouch && (e.touches && e.touches[0])){
                var touch = e.touches[0];
                pointerX = (touch.clientX ? touch.clientX - boundingClientRect.left : e.clientX);
                pointerY = (touch.clientY ? touch.clientY - boundingClientRect.top : e.clientY);
            } else {
                boundingClientRect = this._lowerCanvasEl.getBoundingClientRect();
                pointerX = e.clientX ? e.clientX - boundingClientRect.left : 0;
                pointerY = e.clientY ? e.clientY - boundingClientRect.top : 0;
            }

            var target = this._getTargetAtPosition(pointerX, pointerY);
            if (target){
                this._onMouseDown.dispatchEvent({ id: target.id });
            }
        },

        _isTargetTransparent: function (target, x, y) {
            this._contextCache.clearRect(0, 0, this._cacheCanvasEl.width, this._cacheCanvasEl.height);
            this._contextCache.save();
            target.draw(this._contextCache);
            this._contextCache.restore();

            //imageData.data contains rgba values - here we look at the alpha value
            var imageData = this._contextCache.getImageData(Math.floor(x), Math.floor(y), 1, 1);
            var hasTransparentAlpha = !imageData.data || !imageData.data[3];

            //clear
            imageData = null;
            this._contextCache.clearRect(0, 0, this._cacheCanvasEl.width, this._cacheCanvasEl.height);
            return hasTransparentAlpha;
        },

        _getTargetAtPosition: function (x, y) {
            var pointer = { x: x / this._scalingX, y: y / this._scalingY };
            var objects = this._renderingObjects;
            var i = objects.length;
            var object, target;

            while (i--){
                object = objects[i];
                if (object && object.visible && object.containsPoint(pointer) && !this._isTargetTransparent(object, pointer.x, pointer.y)) {
                    target = object;
                    break;
                }
            }
            return target;
        },

        render: function () {
            var ctx = this._contextContainer;
            ctx.clearRect(0, 0, this.width, this.height);

            var ro = this._renderingObjects;
            ctx.save();
            ctx.scale(this._scalingX, this._scalingY);

            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);

            ro = this._renderingTexts;
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);

            ctx.restore();
        },

        toDataURL: function (width, height) {
            var currentWidth = this.width,
                currentHeight = this.height,
                currentScaleX = this._scalingX,
                currentScaleY = this._scalingY;

            this.setDimensions(width, height, this._scalingX, this._scalingY);
            this._cacheCanvasEl.width = width;
            this._cacheCanvasEl.height = height;

            this.scale(width * this._scalingX / currentWidth, height * this._scalingY / currentHeight);

            this._contextCache.save();
            this._contextCache.fillStyle = "#ffffff";
            this._contextCache.fillRect(0,0, this.width, this.height);

            this._contextCache.drawImage(this._lowerCanvasEl, 0, 0);

            var data = this._cacheCanvasEl.toDataURL('image/png');

            this._contextCache.restore();
            this.setDimensions(currentWidth, currentHeight, this._scalingX, this._scalingY);
            this.scale(currentScaleX, currentScaleY);

            return data;
        },
        dispose: function () {
            this._removeDomListener(this._upperCanvasEl, 'mousedown', this.__onMouseDown);
            this._removeDomListener(this._upperCanvasEl, 'touchstart', this.__onMouseDown);
            SmartJs.Ui.Control.prototype.dispose.call(this);    //call super
        }
    });

    return Canvas;
})();

