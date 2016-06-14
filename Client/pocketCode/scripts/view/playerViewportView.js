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
    }

    //properties
    Object.defineProperties(PlayerViewportView.prototype, {
        axisVisible: {
            get: function () {
                return this._axesVisible;
            }
            //enumerable: false,
            //configurable: true,
        },
        renderingImages: {
            set: function (value) {
                this._canvas.renderingImages = value;
            },
        },
        renderingVariables: {
            set: function (value) {
                this._canvas.renderingTexts = value;
            },
        },
    });

    // events
    Object.defineProperties(PlayerViewportView.prototype, {
        onSpriteClicked: {
            get: function () {
                return this._canvas.onMouseDown;
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
                cw = Math.floor(ow * scaling / 2.0) * 2.0,
                ch = Math.floor(oh * scaling / 2.0) * 2.0;
            canvas.setDimensions(cw, ch, scaling);
            canvas.style.left = Math.floor((w - cw) / 2.0) + 'px';
            canvas.style.top = Math.floor((h - ch) / 2.0) + 'px';

            //this.onResize.dispatchEvent();
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
            ctx.moveTo(Math.round(width / 2), 0);   //avoid sub pixel rendering
            ctx.lineTo(Math.round(width / 2), height);

            ctx.moveTo(0, Math.round(height / 2));
            ctx.lineTo(width, Math.round(height / 2));

            ctx.strokeStyle = color;
            ctx.lineWidth = pixelRatio;
            ctx.font = (12 * pixelRatio) + 'px Arial';
            ctx.fillStyle = color;
            //center
            ctx.fillText('0', width / 2 + 5, height / 2 + 15);
            //width
            ctx.fillText('-' + this._originalWidth / 2, 5, height / 2 + 15);
            ctx.fillText(this._originalWidth / 2, width - 25, height / 2 + 15);
            //height
            ctx.fillText(this._originalHeight / 2, width / 2 + 5, 15);
            ctx.fillText('-' + this._originalHeight / 2, width / 2 + 5, height - 5);

            ctx.stroke();
            ctx.restore();
        },
        getCanvasDataURL: function () {
            var url = this._canvas.toDataURL(this._originalWidth, this._originalHeight);
            this._drawAxes();   // a resize may be triggered and upper canvas cleared
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


