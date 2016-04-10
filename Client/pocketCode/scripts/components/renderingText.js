/// <reference path="../components/sprite.js" />

//PocketCode.FabricText = fabric.util.createClass(fabric.Text, {
//    //type: 'sprite',

//    initialize: function (/*text, options*/) {
//        //options || (options = {});

//        this.callSuper('initialize', ''/*text*/, {}/*options*/);

//        this.set({
//            id: options.id,
//            name: options.name,
//            perPixelTargetFind: true, // only pixels inside item area trigger click
//            selectable: false,
//            hasControls: false,
//            hasBorders: false,
//            hasRotatingPoint: false,
//            originX: "left",
//            originY: "top",
//            positionX: options.x,
//            positionY: options.y,
//            fontFamily: 'Arial',
//            fontSize: 12,
//            fontWeight: 'bold',
//            fill: 'rgb(b,b,b)',
//            visible: false,
//            //flipX = flipH: false, //already a property and false (default)
//            //flipy = flipV: false, //already a property and false (default)
//            //filters: [],
//            //opacity: 1.0
//        });

//        //this.setAngle(options.angle);
//        //this.setOpacity(options.opacity);
//    },

//    //toObject: function () {
//    //    return fabric.util.object.extend(this.callSuper('toObject'), {
//    //        id: this.get('id'),
//    //        name: this.get('name')
//    //    });
//    //},

//    //_render: function (ctx) {
//    //    this.callSuper('_render', ctx);
//    //},
//});

PocketCode.RenderingText = (function () {

    function RenderingText(propObject) {    //{ id: v, text: vars[v].toString(), x: 0, y: 0, visible: false }
        
        if (typeof propObject !== 'object')
            throw new Error('The rendering text has to be initialized using a variable or text parameter object');
        this._fabricText = new fabric.Text(propObject.text, {
            id: propObject.id,
            //name: options.name,
            //perPixelTargetFind: true, // only pixels inside item area trigger click
            selectable: false,
            hasControls: false,
            hasBorders: false,
            hasRotatingPoint: false,
            originX: "left",
            originY: "top",
            positionX: propObject.x,
            positionY: propObject.y,
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            //fill: 'rgb(b,b,b)',
            visible: propObject.visible,
            //flipX = flipH: false, //already a property and false (default)
            //flipy = flipV: false, //already a property and false (default)
            //filters: [],
            //opacity: 1.0
        });

        this._viewportScaling = 1.0;
    }

    //properties
    Object.defineProperties(RenderingText.prototype, {
        //object: {
        //    get: function () {
        //        return this._fabricImage;
        //    },
        //},
        id: {
            //set: function (value) {   //cannot be changed
            //    this._id = value;
            //},
            get: function () {
                return this._id; //this._fabricImage.id;
            },
        },
        x: {
            set: function (value) {
                this._x = value;
                //this._positionX = value;// + this._length * Math.cos(this._angle);
                this._fabricText.left = value * this._viewportScaling;  //avoid sub-pixel rendering
            },
        },
        y: {
            set: function (value) {
                this._y = value;
                //this._positionY = value;// + this._length * Math.sin(this._angle);
                this._fabricText.top = value * this._viewportScaling;
            },
        },
        //direction: {
        //    set: function (value) {
        //        //return this._fabricImage;
        //    },
        //},
        //rotationStyle: {
        //    set: function (value) {
        //        //return this._fabricImage;
        //    },
        //},
        //look: {
        //    set: function (value) {
        //        //return this._fabricImage;
        //    },
        //},
        //size: {
        //    set: function (value) {
        //        //return this._fabricImage;
        //    },
        //},
        text: {
            set: function (value) {
                this._fabricText.setText(value.toString());
            },
        },
        visible: {
            set: function (value) {
                this._fabricText.visible = value;
            },
        },
        //transparency: {
        //    set: function (value) {
        //        //return this._fabricImage;
        //    },
        //},
        //brightness: {
        //    set: function (value) {
        //        //return this._fabricImage;
        //    },
        //},
    });

    //methods
    RenderingText.prototype.merge({
        draw: function (context, viewportScaling) {
            if (this._viewportScaling !== viewportScaling) {
                this._viewportScaling = viewportScaling;
                //apply viewport scaling
                this._fabricText.left = this._x * viewportScaling;
                this._fabricText.top = this._y * viewportScaling;
                this._fabricText.scaleX = viewportScaling;
                this._fabricText.scaleY = viewportScaling;
            }
            //render
            this._fabricText.render(context);//, scaling); //TODO: maybe a good idea if we move that logic here-  from canvas.renderAll()
        },
        //setAngle: function (direction) {
        //    this.angle = direction - 90;
        //},
        //setOpacity: function (transparency) {
        //    this.opacity = +(1 - transparency / 100).toFixed(2);
        //},
        //applyBrightness: function (brightness) {
        //    var bright = +((255 / 100) * (brightness - 100)).toFixed(0);
        //    var brightnessFilter = new fabric.Image.filters.Brightness({ brightness: bright });

        //    var overwriteFilter = false;
        //    for (var i = 0; i < this.filters.length; i++) {
        //        if (this.filters[i].type == "Brightness") {
        //            this.filters[i] = brightnessFilter;
        //            overwriteFilter = true;
        //        }
        //    }

        //    if (!overwriteFilter)
        //        this.filters.push(brightnessFilter);

        //    var replacement = fabric.util.createImage();
        //    var imgEl = this._originalElement;
        //    var canvasEl = fabric.util.createCanvasElement();
        //    var _this = this;

        //    canvasEl.width = imgEl.width;
        //    canvasEl.height = imgEl.height;
        //    canvasEl.getContext('2d').drawImage(imgEl, 0, 0, imgEl.width, imgEl.height);


        //    brightnessFilter.applyTo(canvasEl);

        //    replacement.width = canvasEl.width;
        //    replacement.height = canvasEl.height;

        //    _this._element = replacement;
        //    _this._filteredEl = replacement;
        //    replacement.src = canvasEl.toDataURL('image/png');
        //}
    });

    return RenderingText;
})();