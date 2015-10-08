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
        //var props = {width:originalWidth, height:originalHeight};
        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-playerViewportView' });

        this._originalWidth = 200;  //default: until set
        this._originalHeight = 380;
        this._axesVisible = false;
        //this._scaling = 1;
        //this._canvasNeedsRedraw = false;


        this._canvas = new PocketCode.Ui.Canvas();//{ className: 'pc-canvas' });
        this._appendChild(this._canvas);

        //events
        //this._onScalingChanged = new SmartJs.Event.Event(this);

        this.onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this)); //TODO: check if handling is necesary twice
        this._onResize.addEventListener(new SmartJs.Event.EventListener(function () { window.setTimeout(this._resizeHandler.bind(this, this), 120); }.bind(this), this));
        this._canvas.onAfterRender.addEventListener(new SmartJs.Event.EventListener(this._drawAxes, this));
        //this._onScalingChanged.addEventListener(new SmartJs.Event.EventListener(this._canvas.handleChangedScaling, this._canvas));

        //test
        //this._drawAxes();
        //this._canvas = document.createElement('canvas', { className: 'pc-canvas' });
        ////this._canvas.className = 'pc-canvas';
        //var cheight = 480.0;
        //var cwidth = 320.0;
        //var cvprops = {
        //    width: cwidth,
        //    height: cheight,
        //    containerClass: 'canvas-container',
        //    selection: false,
        //    skipTargetFind: false,
        //    perPixelTargetFind: true,
        //    renderOnAddRemove: false,
        //    preserveObjectStacking: true,   //enable fast rendering
        //    stateful: false
        //};

        //this._fabricCanvas = new fabric.Canvas(this._canvas, cvprops);

        //// draw frame
        ////this._framerect = new fabric.Rect({selectable:false,fill:'', stroke:'black', width: cwidth-1, height:cheight-1, top: 0, left: 0 });
        ////this._fabricCanvas.add(this._framerect);

        //this._dom.appendChild(this._fabricCanvas.wrapperEl);

        ////this.className = 'pc-PlayerViewportView';

        ////TODO: originalHeight, originalWidth may not be defined here
        ////if (!originalHeight || !originalWidth)
        ////    throw new Error('invalid argument: missing hight and/or width property of original app screen');

        //this._originalHeight = cheight;
        //this._originalWidth = cwidth;

        //this._ratio = cheight / cwidth;

        //this._context = this._fabricCanvas.getContext('2d');
        //this._axesVisible = false;
        ////this._showGrid = false;

        ////this._scalingFactor = 1;  //set when added to DOM (onResize)

        ////this._canvas.onResize.addEventListener(new SmartJs.Event.EventListener(this._updateScaling, this));
        //var _self = this;

        ////window.addEventListener('resize', this._updateScaling.bind(this)); // remove bind
        //this.onResize.addEventListener(new SmartJs.Event.EventListener(this._updateScaling, this));
        //this._onSpriteClicked = new SmartJs.Event.Event(this);

        //this._fabricCanvas.on('mouse:down', function (e) {
        //    if (typeof e.target != 'undefined') {
        //        _self.onSpriteClicked.dispatchEvent({ id: e.target.id });
        //    }
        //});
        //this._fabricCanvas.on('after:render', this._drawAxes.bind(this));
        //this._renderingObjects = [];
        ////this._updateScaling();
    }

    //properties
    Object.defineProperties(PlayerViewportView.prototype, {
        //canvasNeedsRedraw: {
        //  set: function (value) {
        //      this._canvasNeedsRedraw = value;
        //  }
        //},

        axisVisible: {
            get: function () {
                return this._axesVisible;
            }
            //enumerable: false,
            //configurable: true,
        },
        //originalHight: {
        //    //get: function () {
        //    //    return this._originalHight;
        //    //},
        //    set: function (value) {
        //        if (this._originalHight === value)
        //            return;
        //        this._originalHight = value;
        //        this._updateScaling();//Factor();
        //    }
        //    //enumerable: false,
        //    //configurable: true,
        //},
        //originalWidth: {
        //    //get: function () {
        //    //    return this._originalWidth;
        //    //},
        //    set: function (value) {
        //        if (this._originalWidth === value)
        //            return;
        //        this._originalWidth = value;
        //        this._updateScaling();//Factor();
        //    }
        //    //enumerable: false,
        //    //configurable: true,
        //},
        renderingImages: {
            set: function (value) {
                if (!(value instanceof Array))
                    throw new SmartJs.Error.InvalidArgumentException(typeof value, 'Array');

                this._canvas.renderingImages = value;
            },
            //get: function () {
            //    return this._renderingObjects;
            //}
            //enumerable: false,
            //configurable: true,
        },
        //fabricCanvas: {
        //    get: function (value) {
        //        return this._fabricCanvas;
        //    }
        //    //enumerable: false,
        //    //configurable: true,
        //}
    });

    // events
    Object.defineProperties(PlayerViewportView.prototype, {
        //onScalingChanged: {
        //    get: function () {
        //        return this._onScalingChanged;
        //    },
        //},
        //onResize: {
        //    get: function () {
        //        return this._onResize;
        //    }
        //},
        //enumerable: false,
        //configurable: true,
        onSpriteClicked: {
            get: function () {
                return this._canvas.onMouseDown;
            }
        },
        //onAfterRender: {
        //    get: function () {
        //        return this._canvas.onAfterRender;
        //    },
        //},
    });

    //methods
    PlayerViewportView.prototype.merge({
        _resizeHandler: function (e) {
            var w = this.width,// || window.innerWidth;
                h = this.height,// || window.innerHeight; // TODO fix this, height stays 0
                ow = this._originalWidth,
                oh = this._originalHeight,
                scaling;

            if (oh / ow >= h / w)   //aligned top/bottom
                scaling = h / oh;
            else
                scaling = w / ow;   //aligned left/right

            //var scaling = Math.min(this.height / oh, this.width / oh);
            //this._scaling = scaling;
            var canvas = this._canvas;
            var cw = Math.ceil(ow * scaling),
                ch = Math.ceil(oh * scaling);
            //canvas.width = cw;
            //canvas.height = ch;
            canvas.setDimensions(cw, ch, scaling);
            canvas.style.left = Math.floor((w - cw) / 2) + 'px';
            canvas.style.top = Math.floor((h - ch) / 2) + 'px';

            //this._onScalingChanged.dispatchEvent({ scaling: scaling });

            //this._scalingFactor = Math.min(height / this._originalHeight, width / this._originalWidth) || 1;
            //var factor = this._scalingFactor;
            ////console.log('sfact: ' + this._scalingFactor);
            ////update ui layout
            //this._fabricCanvas.setHeight(Math.floor(this._originalHeight * this._scalingFactor));
            //this._fabricCanvas.setWidth(Math.floor(this._originalWidth * this._scalingFactor));
            //this._fabricCanvas.calcOffset();

            //this._fabricCanvas.forEachObject(function (obj) {
            //    if (obj.id != undefined) {
            //        obj.scaleX = factor;
            //        obj.scaleY = factor;
            //        obj.scaledPositionX = obj.positionX * factor;
            //        obj.scaledPositionY = obj.positionY * factor;
            //        obj.setCoords();
            //    }
            //});

            //this._canvas.width = this._fabricCanvas.width;
            //this._canvas.height = this._fabricCanvas.height;
            //this._fabricCanvas.style.position = 'static';

            //var style = this._fabricCanvas.wrapperEl.style;
            //style.position = 'absolute';
            //style.height = this._fabricCanvas.height + 'px';
            //style.width = this._fabricCanvas.width + 'px';
            //style.top = Math.floor((height - this._fabricCanvas.height) / 2.0) + 'px';
            //style.left = Math.floor((width - this._fabricCanvas.width) / 2.0) + 'px';

            this.render();
        },
        setOriginalViewportSize: function(width, height) {
            this._originalWidth = width;
            this._originalHeight = height;
            this._resizeHandler();
        },
        showAxes: function () {
            if (this._axesVisible)
                return;
            //this._showGrid = true;
            this._axesVisible = true;
            this._drawAxes();
        },

        hideAxes: function () {
            if (!this._axesVisible)
                return;
            //this._showGrid = false;
            this._axesVisible = false;
            this.render();
        },

        _drawAxes: function () {
            //if (this._showGrid) {
            if (this._axesVisible) {
                var ctx = this._canvas.context,
                    width = this._canvas.width,
                    height = this._canvas.height,
                    color = 'red',
                    pixelRatio = 1;/*function () {
                        if (window.devicePixelRatio)
                            return Math.round(window.devicePixelRatio);
                        return 1;
                    }();*/
                //ctx.stroke();
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
            }
        },
        getCanvasDataURL: function () {
            return this._canvas.toDataURL();//this._scaling);
        },
        // clears the canvas and then renders all items inside the renderingObjects list    //TODO: far from optimal solution- concentrate on canvas implementing this
        render: function () {
            this._canvas.render();//this._scaling);
        },

        clear: function () {
            this._canvas.clear();
        },
        dispose: function () {
            this.onResize.dispose();
            //override: to make sure a view is disposed by it's controller
        },

        //handleSpriteChange: function (id, changes) {
        //    var item = this._canvas.findItemById(id);
        //    if (item) {
        //        item.merge(changes);
        //        this._canvas.applyScalingToObject(item, this._scaling);
        //        this._canvas.render();
        //    }
        //},
    });

    return PlayerViewportView;
})();


