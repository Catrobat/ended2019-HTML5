﻿﻿/// <reference path="../../../smartJs/sj.js" />
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

        this._renderingSprites = [];
        this._renderingTexts = [];
        this._scalingX = 1.0;
        this._scalingY = 1.0;
        this._penStampCache = {}; //register here with { id: { elem: ?, ctx: ? } } on first use
        this._currentSceneCache = undefined;


        this._camera = {
            on : false,
            stream: null,
            setIdealResolution: null,
            renderingWidth: 0,
            renderingHeight: 0,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            flipped: false
        }
        //handling click/touch/multi-touch
        this._activeTouchEvents = [];

        this._helperCanvasEl = document.createElement('canvas');
        this._helperCanvasCtx = this._helperCanvasEl.getContext('2d');

        this._cameraCanvasEl = document.createElement('canvas');
        this._cameraCanvasCtx = this._cameraCanvasEl.getContext('2d');

        this._backgroundCanvasEl = document.createElement('canvas');
        this._backgroundCanvasCtx = this._backgroundCanvasEl.getContext('2d');

        this._translation = {
            x: Math.round(this._backgroundCanvasEl.width * 0.5),
            y: Math.round(this._backgroundCanvasEl.height * 0.5)
        };

        this._penStampCanvasEl = document.createElement('canvas');
        this._penStampCanvasCtx = this._penStampCanvasEl.getContext('2d');

        this._spritesCanvasEl = document.createElement('canvas');
        this._spritesCanvasCtx = this._spritesCanvasEl.getContext('2d');

        this._bubblesCanvasEl = document.createElement('canvas');
        this._bubblesCanvasCtx = this._bubblesCanvasEl.getContext('2d');

        this._upperCanvasEl = document.createElement('canvas');
        this._upperCanvasCtx = this._upperCanvasEl.getContext('2d');
        this._scaleFactor = 1;

        // TODO think about order of elements!
        this._dom.appendChild(this._cameraCanvasEl);
        this._dom.appendChild(this._backgroundCanvasEl);
        this._dom.appendChild(this._penStampCanvasEl);
        this._dom.appendChild(this._spritesCanvasEl);
        this._dom.appendChild(this._bubblesCanvasEl);
        this._dom.appendChild(this._upperCanvasEl);

        //events
        this._onRenderingSpriteTouched = new SmartJs.Event.Event(this);

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

    //events
    Object.defineProperties(Canvas.prototype, {
        onRenderingSpriteTouched: {
            get: function () {
                return this._onRenderingSpriteTouched;
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

    //properties
    Object.defineProperties(Canvas.prototype, {
        contextTop: {
            get: function () {
                return this._upperCanvasCtx;
            },
        },
        renderingSprites: {
            set: function (list) {
                if (!(list instanceof Array))
                    throw new Error('invalid argument: expectes type: list');
                this._renderingSprites = list;
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
                return this._backgroundCanvasEl.width;
            },
            set: function (value) {
                if (typeof value !== 'number')
                    throw new Error('invalid argument: expected "value" typeof "number" (px)');

                this._dom.style.width = (value + 'px');
                this._backgroundCanvasEl.width = value;
                this._penStampCanvasEl.width = value;

                this._spritesCanvasEl.width = value;
                this._bubblesCanvasEl.width = value;
                this._upperCanvasEl.width = value;

                this._helperCanvasEl.width = value;
                if(this._setIdealCameraResolution){
                    this._setIdealCameraResolution(this.width, this.height);
                }
                this.updateCameraSize();
                this._translation = { x: Math.round(value * 0.5), y: Math.round(this.height * 0.5) };
            },
        },
        /* override */
        height: {
            get: function () {
                return this._backgroundCanvasEl.height;
            },
            set: function (value) {
                if (typeof value !== 'number')
                    throw new Error('invalid argument: expected "value" typeof "number" (px)');

                this._dom.style.height = (value + 'px');
                this._backgroundCanvasEl.height = value;
                this._penStampCanvasEl.height = value;



                this._spritesCanvasEl.height = value;
                this._bubblesCanvasEl.height = value;
                this._upperCanvasEl.height = value;

                this._helperCanvasEl.height = value;
                this.updateCameraSize();
                this._translation = { x: Math.round(this.width * 0.5), y: Math.round(value * 0.5) };
            },
        },
        //camera
        cameraStream: {
            set: function (cameraStream) {
                this._camera.stream  = cameraStream;
            },
            get: function () {
                return this._camera.stream;
            }
        },
        cameraOn: {
            set: function (cameraOn) {
                this._camera.on = cameraOn;
                this.renderCamera();
            },
            get: function () {
                return this._camera.on;
            }
        },
        cameraContext: {
            get: function () {
                return this._cameraCanvasCtx;
            }
        },


    });

    //methods
    Canvas.prototype.merge({
        initScene: function (id, screenSize) {
            if (this._penStampCache[id]) {
                this._currentSceneCache = this._penStampCache[id];
                return;
            }

            var penStampCacheCanvasEl = document.createElement('canvas');
            penStampCacheCanvasEl.height = screenSize.height;
            penStampCacheCanvasEl.width = screenSize.width;

            var ctx = penStampCacheCanvasEl.getContext('2d');
            ctx.translate(screenSize.width * 0.5, screenSize.height * 0.5);

            this._penStampCache[id] = {
                element: penStampCacheCanvasEl,
                ctx: ctx
            };
            this._currentSceneCache = this._penStampCache[id];
        },
        setDimensions: function (width, height, scalingX, scalingY) {
            width = Math.floor(width * 0.5) * 2.0;  //make sure its an even number
            height = Math.floor(height * 0.5) * 2.0;

            this.height = height;
            this.width = width;

            this.scale(scalingX, scalingY);
        },
        scale: function (x, y) {
            this._scalingX = x;
            this._scalingY = y;
            this.render();
        },

        updateCamera: function(e)
        {
            this._camera.on = e.on;
            this._camera.stream = e.src;
            this.updateCameraSize();
            this.renderCamera();
        },

        updateCameraSize: function(){
            if(this.cameraStream){
                if(this._camera.stream.videoHeight && this._camera.stream.videoWidth){
                    if( this.height > this.width){

                        this._camera.scale=this.height /  this.cameraStream.videoHeight ;

                        this._camera.renderingWidth = this._camera.stream.videoWidth*  this._camera.scale;
                        this._camera.renderingHeight = this._camera.stream.videoHeight * this._camera.scale;
                        this._cameraCanvasEl.width = this.width;
                        this._cameraCanvasEl.height = this.height;
                       this._camera.offsetX =  (this.width - this._camera.renderingWidth) / 2;
                       this._camera.offsetY =   (this.height - this._camera.renderingHeight) / 2;
                    }


                else {

                        this._camera.scale=this.width /  this.cameraStream.videoHeight ;

                        this._camera.renderingWidth = this._camera.stream.videoWidth*  this._camera.scale;
                        this._camera.renderingHeight = this._camera.stream.videoHeight * this._camera.scale;
                        this._cameraCanvasEl.width = this.width;
                        this._cameraCanvasEl.height = this.height;
                        this._camera.offsetX =  (this.width - this._camera.renderingWidth) / 2;
                        this._camera.offsetY =   (this.height - this._camera.renderingHeight) / 2;
                    }
                }

            }

            else {
                this._cameraCanvasEl.width = this.width;
                this._cameraCanvasEl.height = this.height;
            }

        },
        clear: function () {
            this._upperCanvasCtx.clearRect(0, 0, this.width, this.height);
            this._bubblesCanvasCtx.clearRect(0, 0, this.width, this.height);
            this._spritesCanvasCtx.clearRect(0, 0, this.width, this.height);
            this._cameraCanvasCtx.clearRect(0, 0, this.width, this.height);
            this._backgroundCanvasCtx.clearRect(0, 0, this.width, this.height);
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

            if (e.cancelable)
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
                        this._onRenderingSpriteTouched.dispatchEvent(touchData[i].merge({ targetId: target.id }));
                    }
                }
            return false;
        },
        _touchMoveHandler: function (e) {
            if (e.cancelable)
                e.preventDefault();
            e.stopPropagation();

            if (!e.changedTouches && !e.which && isNaN(e.button))
                return; //move event, no button pressed

            var touchData = this._getTouchData(e);
            if (!e.touches) {   //get all data for mouse events
                var mouseData = [];
                for (var i = 0, l = this._activeTouchEvents.length; i < l; i++) {
                    var id = this._activeTouchEvents[i];
                    if (id[0] == 'm')
                        mouseData.push({ id: id, x: touchData[0].x, y: touchData[0].y });
                }
                touchData = mouseData;
            }
            for (var i = 0, l = touchData.length; i < l; i++) {
                if (Math.abs(touchData[i].x) > this._backgroundCanvasEl.width * 0.5 / this._scalingX ||
                  Math.abs(touchData[i].y) > this._backgroundCanvasEl.height * 0.5 / this._scalingY) {  //ouside
                    this._touchEndHandler(e);
                    continue;
                }
                if (this._activeTouchEvents.indexOf(touchData[i].id) >= 0)
                    this._onTouchMove.dispatchEvent(touchData[i]);
            }
            return false;
        },
        _touchEndHandler: function (e) {
            if (e.cancelable)
                e.preventDefault();
            e.stopPropagation();

            var touchData = this._getTouchData(e);
            if (!e.touches) {   //get all data for mouse events
                var mouseData = [];
                for (var i = 0, l = this._activeTouchEvents.length; i < l; i++) {
                    var id = this._activeTouchEvents[i];
                    if (id[0] == 'm')
                        mouseData.push({ id: id, x: touchData[0].x, y: touchData[0].y });
                }
                touchData = mouseData;
            }
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
            var boundingClientRect = this._backgroundCanvasEl.getBoundingClientRect();

            if (touch != undefined) {
                pointerX = touch.clientX != undefined ? touch.clientX - boundingClientRect.left - this._translation.x : e.clientX - this._translation.x;
                pointerY = -(touch.clientY != undefined ? touch.clientY - boundingClientRect.top - this._translation.y : e.clientY - this._translation.y);
            }
            else {
                //boundingClientRect = this._backgroundCanvasEl.getBoundingClientRect();
                pointerX = e.clientX != undefined ? e.clientX - boundingClientRect.left - this._translation.x : -this._translation.x;    //TODO: use .offsetX for mouse events (check support)
                pointerY = -(e.clientY != undefined ? e.clientY - boundingClientRect.top - this._translation.y : -this._translation.y);  //or: include scroll offsets to make sure this control also works in another app/page
            }

            var pointer = {
                x: pointerX / this._scalingX,
                y: pointerY / this._scalingY,
            };

            return pointer;
        },
        _getTargetAt: function (point) {
            var objects = this._renderingSprites;
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
            var ctx = this._helperCanvasCtx;
            ctx.clearRect(0, 0, this._helperCanvasEl.width, this._helperCanvasEl.height);
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
            var backgroundCtx = this._backgroundCanvasCtx;
            var ctx = this._spritesCanvasCtx;

            backgroundCtx.clearRect(0, 0, this.width, this.height);
            backgroundCtx.save();
            backgroundCtx.translate(this._translation.x, this._translation.y);
            backgroundCtx.scale(this._scalingX, this._scalingY);

            ctx.clearRect(0, 0, this.width, this.height);
            ctx.save();
            ctx.translate(this._translation.x, this._translation.y);
            ctx.scale(this._scalingX, this._scalingY);

            var ro = this._renderingSprites;

            // draw all sprites
            for (var i = 0, l = ro.length; i < l; i++) {
                if (ro[i].isBackground)
                    ro[i].draw(backgroundCtx);
                else
                    ro[i].draw(ctx);
            }

            //draw rendering texts
            ro = this._renderingTexts;
            for (var i = 0, l = ro.length; i < l; i++) {
                ro[i].draw(ctx);
            }

            // draw current PenStampCanvas
            this._drawPenStampCacheCanvas();

            backgroundCtx.restore();
            ctx.restore();
        },
        //camera
        renderCamera: function () {
            if (this._camera.on && this._camera.stream) {
                // firefox mobile flips image upside down
                var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                var is_android = navigator.platform.toLowerCase().indexOf("android") > -1;

                    if(is_firefox && SmartJs.Device.isMobile ) {
                        this._cameraCanvasCtx.translate(0, this.height);
                        this._cameraCanvasCtx.scale(1, -1);
                    }
                this._cameraCanvasCtx.drawImage(
                    this._camera.stream,
                    this._camera.offsetX,
                    this._camera.offsetY,
                    this._camera.renderingWidth,
                    this._camera.renderingHeight);

                    if(is_firefox && SmartJs.Device.isMobile) {
                        this._cameraCanvasCtx.translate(0, this.height);
                        this._cameraCanvasCtx.scale(1, -1);
                    }




                setTimeout(this.renderCamera.bind(this), 10);
            }
        },
        //pen, stamp
        clearPenStampCanvas: function () {
            if (!this._currentSceneCache)
                return;
            var ctx = this._currentSceneCache.ctx;
            ctx.clearRect(0, 0, this.width, this.height);
        },
        clearCurrentPenStampCache: function () {
            //clear background
            var ctx = this._penStampCanvasCtx,
                el = this._penStampCanvasEl;
            ctx.clearRect(0, 0, el.width, el.height);

            //clear cache ctx
            var c = this._currentSceneCache,
                e = c.element;
            if (!c)
                return;
            var ctx = c.ctx;
            ctx.clearRect(-e.width * 0.5, -e.height * 0.5, e.width, e.height);
        },
        clearPenStampCache: function () {
            //clear background
            var ctx = this._penStampCanvasCtx,
                el = this._penStampCanvasEl;
            ctx.clearRect(0, 0, el.width, el.height);

            //remove cache items
            this._currentSceneCache = undefined;

            for (var id in this._penStampCache) {
                delete this._penStampCache[id];
            }
        },
        movePen: function (renderingSpriteId, toX, toY) {
            var ro = this._renderingSprites,
                ri;
            for (var i = 0, l = ro.length; i < l; i++) {
                ri = ro[i];
                if (ri.id === renderingSpriteId) {
                    if (!ri.penDown)
                        return;

                    var ctx = this._currentSceneCache.ctx;
                    ctx.beginPath();
                    ctx.moveTo(ri.penX, -ri.penY);
                    ctx.lineTo(toX, -toY);
                    ctx.strokeStyle = "rgb( " + ri.penColor.r + ", " + ri.penColor.g + ", " + ri.penColor.b + " )";
                    ctx.lineWidth = ri._penSize;
                    ctx.stroke();
                    ctx.closePath();

                    this._drawPenStampCacheCanvas();
                    break;
                }
            }
        },
        drawStamp: function (renderingSpriteId) {
            var ro = this._renderingSprites;
            for (var i = 0, l = ro.length; i < l; i++) {
                if (ro[i].id === renderingSpriteId) {
                    ro[i].draw(this._currentSceneCache.ctx);
                    this._drawPenStampCacheCanvas();
                    break;
                }
            }
        },
        _drawPenStampCacheCanvas: function () {
            if (!this._currentSceneCache)
                return;
            var ctx = this._penStampCanvasCtx,
                el = this._penStampCanvasEl,
                cache_element = this._currentSceneCache.element,

                destWidth = el.width / this._scalingX, destHeight = el.height / this._scalingY,
                sourceWidth = cache_element.width, sourceHeight = cache_element.height;

            ctx.clearRect(0, 0, el.width, el.height);
            ctx.save();
            ctx.translate((destWidth - sourceWidth) * 0.5, (destHeight - sourceHeight) * 0.5);
            ctx.scale(this._scalingX, this._scalingY);

            ctx.drawImage(cache_element, 0, 0, sourceWidth, sourceHeight);
            ctx.restore();
        },
        //screenshot
        toDataURL: function (width, height) {
            console.log("toDataURL");
            var currentWidth = this.width,
                currentHeight = this.height;

            this._helperCanvasEl.width = width;
            this._helperCanvasEl.height = height;

            var ctx = this._helperCanvasCtx;
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.translate(width * 0.5, height * 0.5);
            ctx.scale(width * this._scalingX / currentWidth, height * this._scalingY / currentHeight);

            var ro = this._renderingSprites;

            //camera
            if ( this._camera.stream) {
                console.log("drawing camera");


                var cameraScale = height /  currentHeight;

                var cameraWidth = this._camera.renderingWidth*  cameraScale;
                var cameraHeight  = this._camera.renderingHeight* cameraScale;
                var cameraOffsetX =  (this._camera.offsetX* cameraScale) -width * 0.5 ;
                var cameraOffsetY =   (this._camera.offsetY * cameraScale) - height * 0.5;
                ctx.drawImage(
                    this._camera.stream,
                    cameraOffsetX ,
                    cameraOffsetY,
                    cameraWidth , cameraHeight);
            }
            //background
            for (var i = 0, l = ro.length; i < l; i++) {
                if (ro[i].isBackground) {
                    ro[i].draw(ctx);
                    break;
                }
            }

            //pen stamp
            ctx.drawImage(this._currentSceneCache.element, - width * 0.5, -height * 0.5);

            //sprites
            for (var i = 0, l = ro.length; i < l; i++)
                if (!ro[i].isBackground)
                    ro[i].draw(ctx);

            //text
            ro = this._renderingTexts;
            for (var i = 0, l = ro.length; i < l; i++)
                ro[i].draw(ctx);
            ctx.restore();
            //bubbles
            //TODO

            var data = this._helperCanvasEl.toDataURL('image/png');
            this._helperCanvasEl.width = currentWidth;
            this._helperCanvasEl.height = currentHeight;

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
