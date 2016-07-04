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
        this._lowerCanvasCtx = this._lowerCanvasEl.getContext('2d');
        this._translation = { x: Math.round(this._lowerCanvasEl.width / 2.0), y: Math.round(this._lowerCanvasEl.height / 2.0) };

        this._upperCanvasEl = document.createElement('canvas');
        this._dom.appendChild(this._upperCanvasEl);
        this._upperCanvasCtx = this._upperCanvasEl.getContext('2d');

        this._cacheCanvasEl = document.createElement('canvas');
        this._cacheCanvasCtx = this._cacheCanvasEl.getContext('2d');

        this._onMouseDown = new SmartJs.Event.Event(this);
        this._addDomListener(this._upperCanvasEl, 'mousedown', this.__onMouseDown);
        this._addDomListener(this._upperCanvasEl, 'touchstart', this.__onMouseDown);

        this._renderingImages = [];
        this._renderingTexts = [];
        this._scalingX = 1.0;
        this._scalingY = 1.0;
    }

    //properties
    Object.defineProperties(Canvas.prototype, {
        contextTop: {
            get: function () {
                return this._upperCanvasCtx;
            },
        },
        renderingImages: {
            set: function (list) {
                this._renderingImages = list;  //TODO: exception handling, argument check
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
            this._translation = { x: Math.round(width / 2.0), y: Math.round(height / 2.0) };
            this._upperCanvasEl.height = height;
            this._upperCanvasEl.width = width;
            this._cacheCanvasEl.height = height;
            this._cacheCanvasEl.width = width;
            
            this.scale(scalingX, scalingY);
        },
        scale: function (x, y) {
            this._scalingX = x;
            this._scalingY = y;
            this.render();
        },
        clear: function () {
            this._upperCanvasCtx.clearRect(0, 0, this.width, this.height);
            this._lowerCanvasCtx.clearRect(0, 0, this.width, this.height);
        },
        __onMouseDown: function (e) {
            var isLeftClick = 'which' in e ? e.which === 1 : e.button === 1;

            if (!isLeftClick && !SmartJs.Device.isTouch) {
                return;
            }

            var pointerX,// = this._lowerCanvasEl.width / 2.0,
                pointerY;// = this._lowerCanvasEl.height / 2.0;
            var boundingClientRect = this._lowerCanvasEl.getBoundingClientRect();

            if (SmartJs.Device.isTouch && (e.touches && e.touches[0])) {
                var touch = e.touches[0];
                pointerX = touch.clientX ? touch.clientX - boundingClientRect.left - this._translation.x : e.clientX - this._translation.x;
                pointerY = -(touch.clientY ? touch.clientY - boundingClientRect.top - this._translation.y : e.clientY - this._translation.y);
            }
            else {
                boundingClientRect = this._lowerCanvasEl.getBoundingClientRect();
                pointerX = e.clientX ? e.clientX - boundingClientRect.left - this._translation.x : -this._translation.x;
                pointerY = -(e.clientY ? e.clientY - boundingClientRect.top - this._translation.y : -this._translation.y);
            }

            var target = this._getTargetAtPosition(pointerX, pointerY);
            if (target) {
                this._onMouseDown.dispatchEvent({ id: target.id });
            }
        },
        _getTargetAtPosition: function (x, y) {
            var pointer = { x: x / this._scalingX, y: y / this._scalingY };
            var objects = this._renderingImages;
            var object, target;

            for (var i = objects.length - 1; i >= 0; i--) {
                object = objects[i];
                if (object.visible && object.containsPoint(pointer) && !this._isTargetTransparent(object, x, y)) {
                    target = object;
                    break;
                }
            }
            return target;
        },
        _isTargetTransparent: function (target, x, y) {
            //this._cacheCanvasEl.width, this._cacheCanvasEl.height
            //document.body.appendChild(this._cacheCanvasEl);
            //this._cacheCanvasEl.style.position = 'absolute';
            var ctx = this._cacheCanvasCtx;
            ctx.clearRect(0, 0, this._cacheCanvasEl.width, this._cacheCanvasEl.height);
            ctx.save();
            ctx.translate(this._translation.x, this._translation.y);
            ctx.scale(this._scalingX, this._scalingY);
            target.draw(ctx);
            ctx.restore();

            //imageData.data contains rgba values - here we look at the alpha value
            var imageData = ctx.getImageData(this._translation.x + Math.floor(x), this._translation.y - Math.floor(y), 1, 1);
            var hasTransparentAlpha = !imageData.data || !imageData.data[3];

            //clear
            imageData = undefined;
            //this._cacheCanvasCtx.clearRect(0, 0, this._cacheCanvasEl.width, this._cacheCanvasEl.height);
            return hasTransparentAlpha;
        },
        render: function () {
            var ctx = this._lowerCanvasCtx;
            ctx.clearRect(0, 0, this.width, this.height);

            ctx.save();
            ctx.translate(this._translation.x, this._translation.y);
            ctx.scale(this._scalingX, this._scalingY);

            var ro = this._renderingImages;
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);

            ro = this._renderingTexts;
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);

            ctx.restore();
        },

        toDataURL: function (width, height) {
            var currentWidth = this.width,
                currentHeight = this.height;

            this._cacheCanvasEl.width = width;
            this._cacheCanvasEl.height = height;

            var ctx = this._cacheCanvasCtx;
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.translate(width / 2.0, height / 2.0);
            ctx.scale(width * this._scalingX / currentWidth, height * this._scalingY / currentHeight);

            var ro = this._renderingImages;
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);

            ro = this._renderingTexts;
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);
            ctx.restore();

            var data = this._cacheCanvasEl.toDataURL('image/png');
            this._cacheCanvasEl.width = currentWidth;
            this._cacheCanvasEl.height = currentHeight;

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

