/**
 * Created by alexandra on 16.03.17.
 */
/// <reference path="../core.js" />
/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../ui/canvas.js" />
'use strict';

PocketCode.Ui.CodeViewportView = (function () {
    CodeViewportView.extends(SmartJs.Ui.Control, false);

    //ctr
    function CodeViewportView() {

        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-playerViewportView' });
       // this._dom.dir = 'ltr';  //canvas text positions are always ltr

        this._originalWidth = 200;  //default: until set
        this._originalHeight = 380;
        this.__resizeLocked = false;
        this._axesVisible = false;
        this._activeAskDialog = undefined;

        this._canvas = new PocketCode.Ui.Canvas();
        this._appendChild(this._canvas);

        this._onResize.addEventListener(new SmartJs.Event.EventListener(function () {
            window.setTimeout(this._updateCanvasSize.bind(this), 120);
        }, this));
    }


    //methods
    CodeViewportView.prototype.merge({
        _windowOrientationChangeHandler: function (e) {
            var canvas = this._canvas;
            canvas.style.left = Math.floor((e.width - canvas.width) * 0.5) + 'px';
        },
        _updateCanvasSize: function () {
            if (this.__resizeLocked)
                return;
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
        //ask
        showAskDialog: function (question, callback) {
            var dialog = new PocketCode.Ui.AskDialog(question);
            this._activeAskDialog = dialog;
            dialog.onSubmit.addEventListener(new SmartJs.Event.EventListener(function (e) {
                e.target.dispose();
                if (SmartJs.Device.isMobile) {
                    this._mobileResizeLocked = false;
                }
                callback(e.answer);
            }, this));

            if (SmartJs.Device.isMobile) {
                window.setTimeout(function () {
                    this._appendChild(dialog);
                    this._updateCanvasSize();
                    this._mobileResizeLocked = true;
                    dialog.focusInputField();
                }.bind(this), 500); //wait before show to make sure the UI gets time to update during two calls (hide/show online keyboard)
            }
            else {
                this._appendChild(dialog);
                dialog.focusInputField();
            }
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
        _redrawCanvas: function () {
            this._redrawRequired = false;
            this._canvas.render();
            this._redrawInProgress = false;
            if (this._redrawRequired)
                this.render();
        },
        //clear: function () {
        //    this._canvas.clear();
        //},
        dispose: function () {
            SmartJs.Ui.Window.onResize.removeEventListener(new SmartJs.Event.EventListener(this._windowOrientationChangeHandler, this));
            this.onResize.dispose();
            SmartJs.Ui.Control.prototype.dispose.call(this);
        },

    });

    return CodeViewportView;
})();