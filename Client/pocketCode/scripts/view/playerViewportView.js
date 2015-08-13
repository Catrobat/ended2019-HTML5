/// <reference path="../core.js" />
/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
'use strict';

PocketCode.Ui.PlayerViewportView = (function () {
    PlayerViewportView.extends(SmartJs.Ui.Control, false);

    //ctr
    function PlayerViewportView(originalWidth, originalHeight) {
        //var props = {width:originalWidth, height:originalHeight};
        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-playerViewportView' });

        this._canvas = document.createElement('canvas', { className: 'pc-canvas' });
        //this._canvas.className = 'pc-canvas';
        var cheight = 920.0;
        var cwidth = 640.0;
        var cvprops = {
            width: cwidth,
            height: cheight,
            containerClass: 'canvas-container',
            selection: false,
            skipTargetFind: false,
            perPixelTargetFind: true,
            renderOnAddRemove: false,
            preserveObjectStacking: true,   //enable fast rendering
            stateful: false
        };

        this._fabricCanvas = new fabric.Canvas(this._canvas, cvprops);

        // draw frame
        //this._framerect = new fabric.Rect({selectable:false,fill:'', stroke:'black', width: cwidth-1, height:cheight-1, top: 0, left: 0 });
        //this._fabricCanvas.add(this._framerect);

        this._dom.appendChild(this._fabricCanvas.wrapperEl);

        //this.className = 'pc-PlayerViewportView';

        //TODO: originalHeight, originalWidth may not be defined here
        //if (!originalHeight || !originalWidth)
        //    throw new Error('invalid argument: missing hight and/or width property of original app screen');

        //this._originalHeight = cheight;
        //this._originalWidth = cwidth;

        this._ratio = cheight / cwidth;

        this._context = this._fabricCanvas.getContext('2d');
        this._axesVisible = false;
        //this._showGrid = false;

        //this._scalingFactor = 1;  //set when added to DOM (onResize)

        //this._canvas.onResize.addEventListener(new SmartJs.Event.EventListener(this._updateScaling, this));
        var _self = this;

        //window.addEventListener('resize', this._updateScaling.bind(this)); // remove bind
        this.onResize.addEventListener(new SmartJs.Event.EventListener(this._updateScaling, this));
        this._onSpriteClicked = new SmartJs.Event.Event(this);
        //console.log('cl1');
        this._fabricCanvas.on('mouse:down', function (e) {
            if (typeof e.target != 'undefined') {
                //console.log('cl2');
                _self.onSpriteClicked.dispatchEvent({ id: e.target.id });
            }
        });
        this._fabricCanvas.on('after:render', this._drawAxes.bind(this));
        this._renderingObjects = [];
        //this._updateScaling();
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
        originalHight: {
            //get: function () {
            //    return this._originalHight;
            //},
            set: function (value) {
                if (this._originalHight === value)
                    return;
                this._originalHight = value;
                this._updateScaling();//Factor();
            }
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
                this._originalWidth = value;
                this._updateScaling();//Factor();
            }
            //enumerable: false,
            //configurable: true,
        },
        renderingObjects: {
            set: function (value) {
                this._renderingObjects = value;
                this.render();
            },
            get: function () {
                return this._renderingObjects;
            }
            //enumerable: false,
            //configurable: true,
        },
        fabricCanvas: {
            get: function (value) {
                return this._fabricCanvas;
            }
            //enumerable: false,
            //configurable: true,
        }
    });

    // events
    Object.defineProperties(PlayerViewportView.prototype, {
        //onResize: {
        //    get: function () {
        //        return this._onResize;
        //    }
        //},
        //enumerable: false,
        //configurable: true,
        onSpriteClicked: {
            get: function () {
                return this._onSpriteClicked;
            }
        }
    });

    //methods
    PlayerViewportView.prototype.merge({
        _onResizeHandler: function () {
            console.log('onresizehandler');
            // TODO set height, width of canvas
            // TODO rerender canvas
        },

        _updateScaling: function () {
            var height = this.height;// || window.innerHeight;
            var width = this.width;// || window.innerWidth;

            this._scalingFactor = Math.min(height / this._originalHeight, width / this._originalWidth) || 1;
            var factor = this._scalingFactor;
            console.log('sfact: ' + this._scalingFactor);
            //update ui layout
            this._fabricCanvas.setHeight(Math.floor(this._originalHeight * this._scalingFactor));
            this._fabricCanvas.setWidth(Math.floor(this._originalWidth * this._scalingFactor));
            this._fabricCanvas.calcOffset();

            this._fabricCanvas.forEachObject(function (obj) {
                if (obj.id != undefined) {
                    obj.scaleX = factor;
                    obj.scaleY = factor;
                    obj.scaledPositionX = obj.positionX * factor;
                    obj.scaledPositionY = obj.positionY * factor;
                    obj.setCoords();
                }
            });

            this._canvas.width = this._fabricCanvas.width;
            this._canvas.height = this._fabricCanvas.height;
            //this._fabricCanvas.style.position = 'static';

            var style = this._fabricCanvas.wrapperEl.style;
            style.position = 'absolute';
            //style.height = this._fabricCanvas.height + 'px';
            //style.width = this._fabricCanvas.width + 'px';
            style.top = Math.floor((height - this._fabricCanvas.height) / 2.0) + 'px';
            style.left = Math.floor((width - this._fabricCanvas.width) / 2.0) + 'px';

            //this._framerect.width = this._fabricCanvas.width - 1;
            //this._framerect.height = this._fabricCanvas.height -1;
            console.log("update");
            this.render();
        },

        showAxes: function () {
            if (this._axesVisible)
                return;
            this._axesVisible = true;
            //this._showGrid = true;
            this._drawAxes();
        },

        hideAxes: function () {
            if (!this._axesVisible)
                return;
            this._axesVisible = false;
            //this._showGrid = false;
            this.render();
        },

        _drawAxes: function () {
            //if (this._showGrid) {
            if (this._axesVisible) {
                var ctx = this._context;
                var width = this._fabricCanvas.getWidth();
                var height = this._fabricCanvas.getHeight();
                var color = 'red';
                //ctx.stroke();
                ctx.save();

                ctx.beginPath();
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);

                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);

                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.font = "13px Arial";
                ctx.fillStyle = color;
                //center
                ctx.fillText("0", width / 2 + 10, height / 2 + 15);
                //width
                ctx.fillText("-" + this._originalWidth / 2, 5, height / 2 + 15);
                ctx.fillText(this._originalWidth / 2, width - 25, height / 2 + 15);
                //height
                ctx.fillText("-" + this._originalHeight / 2, width / 2 + 10, 15);
                ctx.fillText(this._originalHeight / 2, width / 2 + 10, height - 5);

                ctx.stroke();
                ctx.restore();

            }
        },

        // clears the canvas and then renders all items inside the renderingObjects list
        render: function () {
            this.clear();
            for (var i = 0; i < this._renderingObjects.length; i++) {
                this._fabricCanvas.add(this._renderingObjects[i]);
            }
            this._fabricCanvas.renderAll();
        },

        clear: function () {
            this._fabricCanvas.clear();
        }
    });

    return PlayerViewportView;
})();


