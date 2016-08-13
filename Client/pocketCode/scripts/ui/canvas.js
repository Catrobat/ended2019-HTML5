/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';


//TODO:
//helpful? http://www.html5rocks.com/de/mobile/touch/
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

        this._renderingImages = [];
        this._renderingTexts = [];
        this._scalingX = 1.0;
        this._scalingY = 1.0;

        //handling click/touch/multi-touch
        this._activeTouchEvents = [];

        //events
        this._onRenderingImageTouched = new SmartJs.Event.Event(this);
        this._onTouchStart = new SmartJs.Event.Event(this);
        this._addDomListener(this._upperCanvasEl, 'mousedown', this._touchStartHandler);
        this._addDomListener(this._upperCanvasEl, 'touchstart', this._touchStartHandler);

        this._onTouchMove = new SmartJs.Event.Event(this);
        this._addDomListener(this._upperCanvasEl, 'mousemove', this._touchMoveHandler);
        this._addDomListener(this._upperCanvasEl, 'touchmove', this._touchMoveHandler);

        this._onTouchEnd = new SmartJs.Event.Event(this);
        this._addDomListener(this._upperCanvasEl, 'mouseup', this._touchEndHandler);
        this._addDomListener(this._upperCanvasEl, 'mouseout', this._touchEndHandler);
        this._addDomListener(this._upperCanvasEl, 'touchend', this._touchEndHandler);
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
                if (!(list instanceof Array))
                    throw new Error('invalid argument: expectes type: list');
                this._renderingImages = list;
            },
        },
        renderingTexts: {
            set: function (list) {
                if (!(list instanceof Array))
                    throw new Error('invalid argument: expected type: list');
                this._renderingTexts = list;  //TODO: exception handling, argument check
            },
        },
        /* override: we do not calculate borders here, with/height are returned based on internal canvas elements even if control is not in DOM */
        width: {
            get: function () {
                return this._lowerCanvasEl.width;
            },
            set: function (value) {
                if (typeof value !== 'number')
                    throw new Error('invalid argument: expected "value" typeof "number" (px)');

                this._dom.style.width = (value + 'px');
                this._lowerCanvasEl.width = value;
                this._translation = { x: Math.round(value / 2.0), y: Math.round(this.height / 2.0) };
                this._upperCanvasEl.width = value;
                this._cacheCanvasEl.width = value;
            },
        },
        /* override */
        height: {
            get: function () {
                return this._lowerCanvasEl.height;
            },
            set: function (value) {
                if (typeof value !== 'number')
                    throw new Error('invalid argument: expected "value" typeof "number" (px)');

                this._dom.style.height = (value + 'px');
                this._lowerCanvasEl.height = value;
                this._translation = { x: Math.round(this.width / 2.0), y: Math.round(value / 2.0) };
                this._upperCanvasEl.height = value;
                this._cacheCanvasEl.height = value;
            },
        },
    });

    //events
    Object.defineProperties(Canvas.prototype, {
        onRenderingImageTouched: {
            get: function () {
                return this._onRenderingImageTouched;
            },
        },
        onTouchStart: {
            get: function () {
                return this._onTouchStart;
            },
        },
        onTouchMove: {
            get: function () {
                return this._onTouchMove;
            },
        },
        onTouchEnd: {
            get: function () {
                return this._onTouchEnd;
            },
        },
    });

    //methods
    Canvas.prototype.merge({
        setDimensions: function (width, height, scalingX, scalingY) {
            width = Math.floor(width / 2.0) * 2.0;
            height = Math.floor(height / 2.0) * 2.0;

            this.height = height;
            this.width = width;

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
        _getTouchData: function (e) {
            var pointer;
            if (!e.touches) {   //mouse event
                pointer = this._getTouchEventPosition(e);
                return [{ id: 'm' + (e.which || e.button), x: pointer.x, y: pointer.y }];
            }
            //else: touch event
            var touch,
                touches = e.changedTouches,
                touchData = [];
            for (var i = 0, l = touches.length; i < l; i++) {
                touch = touches[i];
                pointer = this._getTouchEventPosition(e, touch);
                touchData.push({ id: 't' + touch.identifier, x: pointer.x, y: pointer.y });
            }
            return touchData;
        },
        _touchStartHandler: function (e) {
            e.preventDefault();
            e.stopPropagation();    //TODO: use .offsetX for mouse events (check support)

            var touchData = this._getTouchData(e);
            for (var i = 0, l = touchData.length; i < l; i++) {
                this._activeTouchEvents.push(touchData[i].id);
                this._onTouchStart.dispatchEvent(touchData[i]);
            }

            if (e.touches || e.which == 1 || e.button == 0)
                for (var i = 0, l = touchData.length; i < l; i++) {
                    var target = this._getTargetAt({ x: touchData[i].x, y: touchData[i].y });
                    if (target) {
                        this._onRenderingImageTouched.dispatchEvent(touchData[i].merge({ targetId: target.id }));
                    }
                }

            return false;
        },

        _touchMoveHandler: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!e.touches && !(e.which || e.button))
                return; //move event, no button pressed

            var touchData = this._getTouchData(e);
            for (var i = 0, l = touchData.length; i < l; i++) {
                if (Math.abs(touchData[i].x) > this._lowerCanvasEl.width * 0.5 / this._scalingX ||
                    Math.abs(touchData[i].y) > this._lowerCanvasEl.height * 0.5 / this._scalingY) {  //ouside
                    this._touchEndHandler(e);
                    continue;
                }
                if (this._activeTouchEvents.indexOf(touchData[i].id) >= 0)
                    this._onTouchMove.dispatchEvent(touchData[i]);
            }
            return false;
        },
        _touchEndHandler: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var touchData = this._getTouchData(e);
            for (var i = 0, l = touchData.length; i < l; i++)
                if (this._activeTouchEvents.indexOf(touchData[i].id) >= 0) {
                    this._activeTouchEvents.remove(touchData[i].id);
                    this._onTouchEnd.dispatchEvent(touchData[i]);
                }

            return false;
        },

        _getTouchEventPosition: function (e, touch) {
            var pointerX,
                pointerY;
            var boundingClientRect = this._lowerCanvasEl.getBoundingClientRect();


            if (SmartJs.Device.isTouch && touch != undefined) {
                pointerX = touch.clientX ? touch.clientX - boundingClientRect.left - this._translation.x : e.clientX - this._translation.x;
                pointerY = -(touch.clientY ? touch.clientY - boundingClientRect.top - this._translation.y : e.clientY - this._translation.y);
            }
            else {
                boundingClientRect = this._lowerCanvasEl.getBoundingClientRect();
                pointerX = e.clientX ? e.clientX - boundingClientRect.left - this._translation.x : -this._translation.x;    //TODO: use .offsetX for mouse events (check support)
                pointerY = -(e.clientY ? e.clientY - boundingClientRect.top - this._translation.y : -this._translation.y);  //or: include scroll offsets to make sure this control also works in another app/page
            }

            var pointer = {
                x: pointerX / this._scalingX,
                y: pointerY / this._scalingY,
            };
            
            return pointer;
        },
        _getTargetAt: function (point) {
            var objects = this._renderingImages;
            var object, target;

            for (var i = objects.length - 1; i >= 0; i--) {
                object = objects[i];
                if (object.visible && object.containsPoint(point) && !this._isTargetTransparent(object, point)) {
                    target = object;
                    break;
                }
            }
            return target;
        },
        _isTargetTransparent: function (target, point) {
            var ctx = this._cacheCanvasCtx;
            ctx.clearRect(0, 0, this._cacheCanvasEl.width, this._cacheCanvasEl.height);
            ctx.save();
            ctx.translate(this._translation.x, this._translation.y);
            ctx.scale(this._scalingX, this._scalingY);
            target.draw(ctx);
            ctx.restore();

            //imageData.data contains rgba values - here we look at the alpha value
            var imageData = ctx.getImageData(this._translation.x + Math.floor(point.x * this._scalingX), this._translation.y - Math.floor(point.y * this._scalingY), 1, 1);
            var hasTransparentAlpha = !imageData.data || !imageData.data[3];

            //clear
            imageData = undefined;
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
            this._removeDomListener(this._upperCanvasEl, 'mousedown', this._touchStartHandler);
            this._removeDomListener(this._upperCanvasEl, 'touchstart', this._touchStartHandler);
            this._removeDomListener(this._upperCanvasEl, 'mousemove', this._touchMoveHandler);
            this._removeDomListener(this._upperCanvasEl, 'touchmove', this._touchMoveHandler);
            this._removeDomListener(this._upperCanvasEl, 'mouseup', this._touchEndHandler);
            this._removeDomListener(this._upperCanvasEl, 'mouseout', this._touchEndHandler);
            this._removeDomListener(this._upperCanvasEl, 'touchend', this._touchEndHandler);

            SmartJs.Ui.Control.prototype.dispose.call(this);    //call super
        }
    });

    return Canvas;
})();

