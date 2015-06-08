/// <reference path="../core.js" />
/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
'use strict';

PocketCode.Ui.PlayerViewport = (function () {
    PlayerViewport.extends(SmartJs.Ui.Control, false);

    //ctr
    function PlayerViewport(originalWidth, originalHeight) {
        var props = {width:originalWidth, height:originalHeight};
        SmartJs.Ui.Control.call(this, 'div', props);

        this._canvas = document.createElement('canvas');
        this._canvas.className = 'pc-canvas';
        var cheight = 460;
        var cwidth = 320;
        var cvprops = {width: cwidth, height: cheight,containerClass:'canvas-container', selection: false, skipTargetFind: false,perPixelTargetFind: true, renderOnAddRemove: false, stateful: false};

        this._fabricCanvas = new fabric.Canvas(this._canvas,  cvprops);

        // draw frame
        this._fabricCanvas.add(new fabric.Rect({selectable:false,fill:'', stroke:'black', width: cwidth-1, height:cheight-1, top: 0, left: 0 }));

        this._fabricCanvas.selection = false;
        this._dom.appendChild(this._fabricCanvas.wrapperEl);
        //this._dom.appendChild(this._canvas);

        this.className = 'pc-playerViewport';

        if (!originalHeight || !originalWidth)
            throw new Error('invalid argument: missing hight and/or width property of original app screen');

        this._originalHight = originalHeight;
        this._originalWidth = originalWidth;

        this._context = this._fabricCanvas.getContext('2d');
        this._axesVisible = false;

        //this._scalingFactor = 1;  //set when added to DOM (onResize)

        //this._canvas.onResize.addEventListener(new SmartJs.Event.EventListener(this._updateScaling, this));
        var _self = this;

        window.addEventListener('resize', this._updateScaling.bind(this)); // remove bind
        //this.onResize.addEventListener(new SmartJs.Event.EventListener(this._onResizeHandler, this));
        this._fabricCanvas.on('mouse:down', function(e) {
            if(typeof e.target != 'undefined'){
                _self.onSpriteClicked.dispatchEvent({id: e.target.id});
            }
        });
        this._onSpriteClicked = new SmartJs.Event.Event(this);
        this._fabricCanvas.on('after:render', this._drawAxes.bind(this));
        this._updateScaling();

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
        fabricCanvas: {
            get: function (value) {
                return this._fabricCanvas;
            }
            //enumerable: false,
            //configurable: true,
        }
    });

    // events
    Object.defineProperties(PlayerViewport.prototype, {
        onResize: {
            get: function () {
                return this._onResize;
            }
        },
            //enumerable: false,
            //configurable: true,
        onSpriteClicked: {
            get: function () {
                return this._onSpriteClicked;
            }
        },
        });

    //methods
    PlayerViewport.prototype.merge({
        _onResizeHandler: function() {
            console.log('onresizehandler');
            // TODO set height, width of canvas
            // TODO rerender canvas
        },

        _updateScaling: function () {
            this._scalingFactor = Math.min(this.height / this._originalHight, this.width / this._originalWidth);

            //update ui layout
            this._canvasHeight = Math.floor(this._originalHeight * this._scalingFactor);
            this._canvasWidth = Math.floor(this._originalWidth * this._scalingFactor);
            //this.width = window.innerWidth;
            //this.height = window.innerHeight;
            //this.style.margin = 0;
            this._canvasWidth = this._fabricCanvas.width;
            this._canvasHeight = this._fabricCanvas.height;



            var style = this._fabricCanvas.wrapperEl.style;
            style.position = 'absolute';
            //style.top = '50%';
            //style.left = '50%';
            style.height = this._canvasHeight + 'px';
            style.width = this._canvasWidth + 'px';
            //style.marginTop = -Math.floor((this._canvasHeight) / 2) + 'px';
            //style.marginLeft = -Math.floor((this._canvasWidth) / 2) + 'px';

            console.log("update");
            this.render();
        },
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
            this._drawAxes();
        },
        hideAxes: function () {
            if (!this._axesVisible)
                return;
            this._axesVisible = false;
            this.render();
        },
        _drawAxes: function () {
            var ctx = this._context;
            var width = this._fabricCanvas.getWidth();
            var height = this._fabricCanvas.getHeight();
            var color = 'red';
            //ctx.stroke();
            ctx.save();

            ctx.beginPath();
            ctx.moveTo(width/2, 0);
            ctx.lineTo(width/2, height);

            ctx.moveTo(0, height/2);
            ctx.lineTo(width, height/2);

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;

            ctx.font="13px Arial";
            ctx.fillStyle= color;
            //center
            ctx.fillText("0",width/2 + 10,height/2 +15);
            //width
            ctx.fillText("-" + width/2, 5 ,height/2 +15);
            ctx.fillText(width/2,width - 25,height/2 +15);
            //height
            ctx.fillText("-" + height/2,width/2 +10, 15);
            ctx.fillText(height/2,width/2 + 10 , height -5);

            ctx.stroke();
            ctx.restore();
            //console.log('draw axes');
        },
        render: function () {
            //TODO: rendering

            this._fabricCanvas.renderAll();
            //console.log('render');
            if (this.showAxes())
                this._drawAxes();
        },
    });

    return PlayerViewport;
})();


