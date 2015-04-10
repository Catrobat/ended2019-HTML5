/// <reference path="../core.js" />
/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
'use strict';

PocketCode.Ui.PlayerViewport = (function () {
    PlayerViewport.extends(SmartJs.Ui.Control, false);

    //ctr
    function PlayerViewport(originalHight, originalWidth) {
        SmartJs.Ui.Control.call(this, 'div', propObject);
        this._canvas = document.createElement('canvas');
        this._dom.appendChild(this._canvas);

        this.className = 'pc-playerViewport';

        if (!originalHight || !originalWidth)
            throw new Error('invalid argument: missing hight and/or width property of original app screen');

        this._originalHight = originalHight;
        this._originalWidth = originalWidth;
        this._renderingObjects = [];

        this._context = this._canvas.getContext('2d');
        this._axesVisible = false;

        //this._scalingFactor = 1;  //set when added to DOM (onResize)

        this.onResize.addEventListener(new SmartJs.Event.EventListener(this._updateScaling, this));
    }

    //properties
    Object.defineProperties(PlayerViewport.prototype, {
        axisVisible: {
            get: function () {
                return this._axesVisible;
            },
            //enumerable: false,
            //configurable: true,
        },
        originalHight: {
            //get: function () {
            //    return this._originalHight;
            //},
            set: function (value) {
                if (this._originalHight === value)
                    return;
                this._originalHight = value;
                this._updateScaling();//Factor();
            },
            //enumerable: false,
            //configurable: true,
        },
        originalWidth: {
            //get: function () {
            //    return this._originalWidth;
            //},
            set: function (value) {
                if (this._originalWidth === value)
                    return;
                return this._originalWidth = value;
                this._updateScaling();//Factor();
            },
            //enumerable: false,
            //configurable: true,
        },
        renderingObjects: {
            set: function (value) {
                this._renderingObjects = value;
                this.render();
            },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    PlayerViewport.prototype.merge({
        _updateScaling: function () {
            //this._updateScalingFactor();
            this._scalingFactor = Math.min(this.height / this._originalHight, this.width / this._originalWidth);

            //update ui layout
            this._canvasHeight = Math.floor(this._originalHeight * this._scalingFactor);
            this._canvasWidth = Math.floor(this._originalWidth * this._scalingFactor);

            var style = this._canvas.style;
            style.height = this._canvasHeight + 'px';
            style.width = this._canvasWidth + 'px';
            style.marginTop = Math.floor((this.height - this._canvasHeight) / 2) + 'px';
            style.marginLeft = Math.floor((this.width - this._canvasWidth) / 2) + 'px';

            this.render();
        },
        //_updateScalingFactor: function () {
        //    this._scalingFactor = Math.min(this.height / this._originalHight, this.width / this._originalWidth);
        //},
        toDataUrl: function () {
            return this._canvas.toDataURL('image/png');
            //TODO: create a new canvas with original size and scaling=1 to get a screenshot in the original size

            // save canvas image as data url (png format by default)
            //var dataURL = this._dom.toDataURL('image/png');//.replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download)
            //window.location.href = image;
        },
        showAxes: function () {
            if (this._axesVisible)
                return;
            this._axesVisible = true;
            this.render();
        },
        hideAxes: function () {
            if (!this._axesVisible)
                return;
            this._axesVisible = false;
            this.render();
        },
        _drawAxes: function () {
            var cxt = this._context;
            cxt.strokeStyle = '#FF0000';
            cxt.lineWidth = 2 / this._scalingFactor;    //Math.max(2 / this._scalingFactor, 2);
            cxt.font = (10 / this._scalingFactor) + 'px Arial';    //, sans-serif';
            cxt.fillStyle = '#FF0000';

            var y2 = this._canvasHeight / 2;
            var x2 = this._canvasWidth / 2;
            var label_y2 = this._originalWidth / 2;
            var label_x2 = this._originalHeight / 2;

            //axis lines
            cxt.moveTo(x2, 0);
            cxt.lineTo(x2, this._canvasHeight);
            cxt.moveTo(0, y2);
            cxt.lineTo(this._canvasWidth, y2);

            //axes text
            cxt.fillText('0', x2 + 10, y2 + 15);
            cxt.fillText('-' + label_x2, 5, y2 + 15);
            cxt.fillText(label_x2, this._canvasWidth - 25, y2 + 15);
            cxt.fillText('-' + label_y2, x2 + 10, 15);
            cxt.fillText(label_y2, x2 + 10, this._canvasHeight - 5);

            cxt.stroke();
        },
        render: function () {
            //TODO: rendering

            if (this._axesVisible)
                this._drawAxes();
        },
    });

    return PlayerViewport;
})();

