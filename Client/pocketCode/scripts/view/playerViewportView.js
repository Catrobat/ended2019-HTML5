/// <reference path="../core.js" />
/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../ui/canvas.js" />
'use strict';

PocketCode.Ui.PlayerViewportView = (function () {
    PlayerViewportView.extends(SmartJs.Ui.Control, false);

    //ctr
    function PlayerViewportView() {

        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-playerViewportView' });
        this._dom.dir = 'ltr';  //canvas text positions are always ltr

        this._originalWidth = 200;  //default: until set
        this._originalHeight = 380;
        this._axesVisible = false;

        this._canvas = new PocketCode.Ui.Canvas();
        this._appendChild(this._canvas);

        //TODO: check if handling is necesary twice
        //this.onResize.addEventListener(new SmartJs.Event.EventListener(this._updateCanvasSize, this));
        this._onResize.addEventListener(new SmartJs.Event.EventListener(function () {
            window.setTimeout(this._updateCanvasSize.bind(this), 120);
        }, this));

        //canvas events
        this._onUserAction = new SmartJs.Event.Event(this);
        this._canvas.onRenderingImageTouched.addEventListener(new SmartJs.Event.EventListener(function (e) {
            this._onUserAction.dispatchEvent(e.merge({ action: PocketCode.UserActionType.SPRITE_CLICKED }));
        }, this));
        this._canvas.onTouchStart.addEventListener(new SmartJs.Event.EventListener(function (e) {
            this._onUserAction.dispatchEvent(e.merge({ action: PocketCode.UserActionType.TOUCH_START }));
        }, this));
        this._canvas.onTouchMove.addEventListener(new SmartJs.Event.EventListener(function (e) {
            this._onUserAction.dispatchEvent(e.merge({ action: PocketCode.UserActionType.TOUCH_MOVE }));
        }, this));
        this._canvas.onTouchEnd.addEventListener(new SmartJs.Event.EventListener(function (e) {
            this._onUserAction.dispatchEvent(e.merge({ action: PocketCode.UserActionType.TOUCH_END }));
        }, this));
    }

    //properties
    Object.defineProperties(PlayerViewportView.prototype, {
        axisVisible: {
            get: function () {
                return this._axesVisible;
            },
        },
        renderingImages: {
            set: function (value) {
                this._canvas.renderingImages = value;
            },
        },
        renderingTexts: {
            set: function (value) {
                this._canvas.renderingTexts = value;
            },
        },
    });

    // events
    Object.defineProperties(PlayerViewportView.prototype, {
        onUserAction: {
            get: function () {
                return this._onUserAction;
            }
        },
    });

    //methods
    PlayerViewportView.prototype.merge({
        _updateCanvasSize: function (e) {
            var w = this.width,
                h = this.height,
                ow = this._originalWidth,
                oh = this._originalHeight,
                scaling;

            if (!w || !h || !ow || !oh) //any =0 values
                return;
            if (oh / ow >= h / w)   //aligned top/bottom
                scaling = h / oh;
            else
                scaling = w / ow;   //aligned left/right


            //size = even int number: without white border (background visible due to sub-pixel rendering)
            var canvas = this._canvas,
                cw = Math.ceil(ow * scaling * 0.5) * 2.0,
                ch = Math.ceil(oh * scaling * 0.5) * 2.0;
            canvas.setDimensions(cw, ch, scaling, scaling);
            //canvas.style.margin = 'auto'
            if (SmartJs.Device.isMobile) {  //canvas != viewport
                canvas.style.left = Math.floor((w - cw) * 0.5) + 'px';  //including border
                canvas.style.top = Math.floor((h - ch) * 0.5) + 'px';
            }

            this.render();
            this._drawAxes();
        },
        setOriginalViewportSize: function (width, height) {
            this._originalWidth = width;
            this._originalHeight = height;
            this._updateCanvasSize();
        },
        showAxes: function () {
            if (this._axesVisible)
                return;
            this._axesVisible = true;
            this._drawAxes();
        },
        hideAxes: function () {
            if (!this._axesVisible)
                return;
            this._axesVisible = false;
            this.clear();
            this.render();
        },
        initCanvas: function(ids) {
            this._canvas.init(ids);
        },
        _drawAxes: function () {
            if (!this._axesVisible)
                return;

            var ctx = this._canvas.contextTop,
                    width = this._canvas.width,
                    height = this._canvas.height,
                    color = 'red',
                    pixelRatio = 1;

            ctx.save();

            ctx.beginPath();
            ctx.moveTo(Math.round(width * 0.5), 0);   //avoid sub pixel rendering
            ctx.lineTo(Math.round(width * 0.5), height);

            ctx.moveTo(0, Math.round(height * 0.5));
            ctx.lineTo(width, Math.round(height * 0.5));

            ctx.strokeStyle = color;
            ctx.lineWidth = pixelRatio;
            ctx.font = (12 * pixelRatio) + 'px Arial';
            ctx.fillStyle = color;
            //center
            ctx.fillText('0', width * 0.5 + 5, height * 0.5 + 15);
            //width
            ctx.fillText('-' + this._originalWidth * 0.5, 5, height * 0.5 + 15);
            ctx.fillText(this._originalWidth * 0.5, width - 25, height * 0.5 + 15);
            //height
            ctx.fillText(this._originalHeight * 0.5, width * 0.5 + 5, 15);
            ctx.fillText('-' + this._originalHeight * 0.5, width * 0.5 + 5, height - 5);

            ctx.stroke();
            ctx.restore();
        },
        getCanvasDataURL: function () {
            var url = this._canvas.toDataURL(this._originalWidth, this._originalHeight);
            return url;
        },

        render: function () {
            this._redrawRequired = true;
            if (this._redrawInProgress)
                return;
            //this works because we have already defined the function in sj-animation.js globally
            this._redrawInProgress = window.requestAnimationFrame(this._redrawCanvas.bind(this));
        },
        _redrawCanvas: function ()
        {
            this._redrawRequired = false;
            this._canvas.render();
            this._redrawInProgress = false;
            if (this._redrawRequired)
                this.render();
        },
        clear: function () {
            this._canvas.clear();
        },
        dispose: function () {
            this.onResize.dispose();
            //override: to make sure a view is disposed by it's controller
        },

    });

    return PlayerViewportView;
})();


