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
        this.document = document;

        this.wrapperEl = this.document.createElement('div');
        this.wrapperEl.className = 'canvas-container';

        this.lowerCanvasEl = this._createCanvasElement('lower-canvas', this.wrapperEl);
        this.contextContainer = this.lowerCanvasEl.getContext('2d');
        this.lowerCanvasEl.style.backgroundColor = 'rgba(255, 255, 255, 1)';

        this.upperCanvasEl = this._createCanvasElement('upper-canvas', this.wrapperEl);
        this._contextTop = this.upperCanvasEl.getContext('2d');

        this.cacheCanvasEl = this.document.createElement('canvas');
        this.contextCache = this.cacheCanvasEl.getContext('2d');

        this._width = this.lowerCanvasEl.width;
        this._height = this.lowerCanvasEl.height;

        this._onMouseDown = new SmartJs.Event.Event(this);
        this.__onMouseDown = this.__onMouseDown.bind(this);
        this.upperCanvasEl.addEventListener('mousedown', this.__onMouseDown, false);
        this.upperCanvasEl.addEventListener('touchstart', this.__onMouseDown, false);

        this._renderingObjects = [];
        this._renderingTexts = [];
        this._scaling = 1.0;   //initial
        this._scalingX = 1.0;
        this._scalingY = 1.0;
        //TODO: throw exception if internal canvas list changes and set as a public property: including methods?

        this.setDimensions(this.lowerCanvasEl.width, this.lowerCanvasEl.height, this.scaling);

        args = args || {};
        SmartJs.Ui.Control.call(this, this.wrapperEl, args); //the wrapper div becomes our _dom root element
    }

    //properties
    Object.defineProperties(Canvas.prototype, {
        height: {
            set: function(height){
                this._height = height;
            },
            get: function () {
                return this._height;
            },
        },
        width: {
            set: function(width){
                this._width = width;
            },
            get: function () {
                return this._width;
            },
        },
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
        scaling: {
            set: function (value) {
                this._scaling = value;
                this._scalingX = value;
                this._scalingY = value;
            },
            get: function () {
                return this._scaling;
            }
        },
        scalingX: {
            set: function (value) {
                this._scalingX = value;
            },
            get: function () {
                return this._scalingX;
            }
        },
        scalingY: {
            set: function (value) {
                this._scalingY = value;
            },
            get: function () {
                return this._scalingY;
            }
        }
    });

    //events
    Object.defineProperties(Canvas.prototype, {
        onMouseDown: {
            get: function () {
                return this._onMouseDown;
            },
        },
        //onAfterRender: {
        //    get: function () {
        //        return this._onAfterRender;
        //    },
        //},
    });

    //methods
    Canvas.prototype.merge({

        _createCanvasElement: function (name, parentElement) {

            var canvasElement = this.document.createElement('canvas');
            if (name && typeof name === 'string')
                canvasElement.className = name;

            canvasElement.style.position = 'absolute';
            canvasElement.style.left = 0;
            canvasElement.style.top = 0;
            canvasElement.style.border = 0;

            //todo typecheck
            if(parentElement){
                parentElement.appendChild(canvasElement);
            }

            return canvasElement;
        },

        setDimensions: function (width, height, scaling) {   //without rerendering
            width = Math.floor(width / 2.0) * 2.0;
            height = Math.floor(height / 2.0) * 2.0;

            this.lowerCanvasEl.height = height;
            this.lowerCanvasEl.width = width;
            this.upperCanvasEl.height = height;
            this.upperCanvasEl.width = width;

            this._height = height;
            this._width = width;

            this.scaling = scaling;

            this.cacheCanvasEl.setAttribute('width', this._width / this.scaling);
            this.cacheCanvasEl.setAttribute('height', this._height / this.scaling);
        },

        clear: function () {
            this._contextTop.clearRect(0, 0, this._width, this._height);
            this.contextContainer.clearRect(0, 0, this._width, this._height);
        },

        __onMouseDown: function (e) {
            var isLeftClick = 'which' in e ? e.which === 1 : e.button === 1;

            if (!isLeftClick && !SmartJs.Device.isTouch) {
                return;
            }

            var pointerX, pointerY;
            var boundingClientRect = this.lowerCanvasEl.getBoundingClientRect();

            if (SmartJs.Device.isTouch && (e.touches && e.touches[0])){
                var touch = e.touches[0];
                pointerX = (touch.clientX ? touch.clientX - boundingClientRect.left : e.clientX);
                pointerY = (touch.clientY ? touch.clientY - boundingClientRect.top : e.clientY);
            } else {
                boundingClientRect = this.lowerCanvasEl.getBoundingClientRect();
                pointerX = e.clientX ? e.clientX - boundingClientRect.left : 0;
                pointerY = e.clientY ? e.clientY - boundingClientRect.top : 0;
            }

            var target = this._getTargetAtPosition(pointerX, pointerY);
            if (target){
                this._onMouseDown.dispatchEvent({ id: target.id });
            }
        },

        _isTargetTransparent: function (target, x, y) {
            this.contextCache.clearRect(0, 0, this.cacheCanvasEl.width, this.cacheCanvasEl.height);
            this.contextCache.save();
            target.draw(this.contextCache);
            this.contextCache.restore();

            //imageData.data contains rgba values - here we look at the alpha value
            var imageData = this.contextCache.getImageData(Math.floor(x), Math.floor(y), 1, 1);
            var hasTransparentAlpha = !imageData.data || !imageData.data[3];
            //console.log('data: ' + imageData.data);

            //clear
            imageData = null;
            this.contextCache.clearRect(0, 0, this.cacheCanvasEl.width, this.cacheCanvasEl.height);
            return hasTransparentAlpha;
        },

        _getTargetAtPosition: function (x, y) {
            var pointer = { x: x / this.scalingX, y: y / this.scalingY };
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

        render: function (viewportScaling) {

            var ctx = this.contextContainer;

            ctx.clearRect(0, 0, this._width, this._height);

            var ro = this._renderingObjects,
                scaling = viewportScaling || this.scaling;
            ctx.save();
            ctx.scale(scaling, scaling);
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);

            ro = this._renderingTexts;
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);

            ctx.restore();
            // this.fire('after:render');
        },

        toDataURL: function (width, height) {
            var cw = this.width,
                ch = this.height;

            this.setDimensions(width, height, this.scaling);
            this.cacheCanvasEl.width = width;
            this.cacheCanvasEl.height = height;

            this.render(width * this.scaling / cw);

            this.contextCache.save();
            this.contextCache.fillStyle = "#ffffff";
            this.contextCache.fillRect(0,0, this.width, this.height);

            this.contextCache.drawImage(this.lowerCanvasEl, 0, 0);

            var data = this.cacheCanvasEl.toDataURL('image/png');

            this.contextCache.restore();
            this.setDimensions(cw, ch, this.scaling);
            this.render();

            return data;
        }
    });

    return Canvas;
})();

