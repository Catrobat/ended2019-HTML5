/// <reference path='../components/sprite.js' />

PocketCode.FabricImage = fabric.util.createClass(fabric.Image, {
    //type: 'sprite',

    initialize: function (element, options) {
        if (!element)
            return;
        options || (options = {});
        //console.log('element',element);
        this.callSuper('initialize', element/*.canvas*/, options);
        this.set({
            id: options.id,
            name: options.name,
            perPixelTargetFind: true, // only pixels inside item area trigger click
            selectable: false,
            hasControls: false,
            hasBorders: false,
            hasRotatingPoint: false,
            originX: 'center',
            originY: 'center',
            centeredScaling: true,  //TODO: I'm not sure we need this if the origin is center
            width: element.width,//canvas.width,
            height: element.height,//canvas.height,
            // flipX = flipH: false, //already a property and false (default)
            // flipy = flipV: false, //already a property and false (default)
            //filters: [],  //default
            //opacity: 1.0  //default
        });

        //this.setAngle(options.angle);   //property angle -> should be set by sprite position: please notice: the looks center.angle is a polar coord angle to recalculate the current position
        //^^ has to be set based on direction and rotationStyle
        //this.setOpacity(options.opacity); //TODO:
    },

    //toObject: function () { //TODO: in use?
    //    return fabric.util.object.extend(this.callSuper('toObject'), {
    //        id: this.get('id'),
    //        name: this.get('name')
    //    });
    //},

    //_render: function (ctx, noTransform) {
    //    var x, y, imageMargins = this._findMargins();//, elementToDraw;

    //    x = (noTransform ? this.left : -this.width / 2);
    //    //x *= this._viewportScaling;
    //    y = (noTransform ? this.top : -this.height / 2);
    //    //y *= this._viewportScaling;

    //    //this.scaleX *= this._viewportScaling;
    //    //this.scaleY *= this._viewportScaling;

    //    //if (this.meetOrSlice === 'slice') {
    //    //    ctx.beginPath();
    //    //    ctx.rect(x, y, this.width, this.height);
    //    //    ctx.clip();
    //    //}

    //    //if (this.isMoving === false && this.resizeFilters.length && this._needsResize()) {
    //    //    this._lastScaleX = this.scaleX;
    //    //    this._lastScaleY = this.scaleY;
    //    //    elementToDraw = this.applyFilters(null, this.resizeFilters, this._filteredEl || this._originalElement, true);
    //    //}
    //    //else {
    //    //    elementToDraw = this._element;
    //    //}
    //    //elementToDraw &&
    //    ctx.drawImage(/*elementToDraw*/this._element,
    //                                   x + imageMargins.marginX,
    //                                   y + imageMargins.marginY,
    //                                   imageMargins.width,
    //                                   imageMargins.height
    //                                  );

    //    //        this._renderStroke(ctx);
    //},
    //render: function (ctx) {//, scaling) {
    //    //    //alert('override scaling of fabric image');
    //    //this._viewportScaling = scaling;
    //    this.callSuper('render', ctx);
    //},
});

PocketCode.RenderingImage = (function () {

    function RenderingImage(imageProperties) {
        if (!imageProperties || !(typeof imageProperties === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        //this.type = 'sprite';
        this._fabricImage = new PocketCode.FabricImage(imageProperties.look);
        this._brightnesFilter = new fabric.Image.filters.Brightness({
            brightness: 0,
        });
        this._fabricImage.filters.push(this._brightnesFilter);

        //this._length = imageProperties.look.center.length;
        //this._angle = imageProperties.look.center.angle;
        //this._initialScaling = imageProperties.look.initialScaling;
        //this._viewportScaling = 1;
        this._rotationStyle = PocketCode.RotationStyle.ALL_AROUND;
        this._x = 0;
        this._y = 0;
        this._scaling = 1;
        this._viewportScaling = 1;
        //this._id

        this.merge(imageProperties);
    }

    //properties
    Object.defineProperties(RenderingImage.prototype, {
        object: {
            get: function () {
                return this._fabricImage;
            },
        },
        id: {
            set: function (value) {
                this._fabricImage.id = value; //this._id = value;   //internally needed to find sprite when clicked?
            },
            get: function () {
                return this._fabricImage.id; //return this._id; //this._fabricImage.id;
            },
        },
        //viewportScaling: {
        //    set: function (value) {
        //        this._viewportScaling = value;
        //        this.size = this._size;
        //    },
        //},
        look: {
            set: function (value) {
                this._fabricImage.setElement(value);//.canvas);
                //this._length = value.center.length;
                //this._angle = value.center.angle;
                ////update positions
                //this.positionX = this._positionX;
                //this.positionY = this._positionY;
                ////size does not have to be updated as our initial scaling is used for all objects and does not change
            },
        },
        x: {
            set: function (value) {
                this._x = value;
                //this._positionX = value;// + this._length * Math.cos(this._angle);
                this._fabricImage.left = value * this._viewportScaling;  //avoid sub-pixel rendering
            },
            get: function () {
                return this._x;
            }
        },
        y: {
            set: function (value) {
                this._y = value;
                //this._positionY = value;// + this._length * Math.sin(this._angle);
                this._fabricImage.top = value * this._viewportScaling;
            },

            get: function () {
                return this._y;
            }
        },
        scaling: {
            set: function (value) {
                this._scaling = value;
                // TODO apply to with, height?
                //this._size = value;// / 100.0 / this._initialScaling;
                this._fabricImage.scaleX = value * this._viewportScaling;
                this._fabricImage.scaleY = value * this._viewportScaling;
            },
        },
        //rotationStyle: {
        //    set: function (value) {
        //        if (value == this._rotationStyle)
        //            return;
        //        this._rotationStyle = value;
        //        this.direction = this._direction;
        //    },
        //},
        rotation: {
            set: function (value) {
                this._fabricImage.angle = value;
            }
        },
        flipX: {
            set: function (value) {
                this._fabricImage.flipX = value;
            }
        },
        //direction: {
        //    set: function (value) {
        //        console.log('CHANGE DIR', value);
        //        this._
        //
        //
        //
        // ction = value;
        //        switch (this.rotationStyle) {
        //            case PocketCode.RotationStyle.DO_NOT_ROTATE:
        //                this._fabricImage.angle = 0;
        //                break;
        //            case PocketCode.RotationStyle.LEFT_TO_RIGHT:
        //                this._fabricImage.angle = 0;
        //                this._fabricImage.flipX = (value < 0);
        //                break;
        //            case PocketCode.RotationStyle.ALL_AROUND:
        //                this._fabricImage.angle = value - 90;
        //                break;
        //        }
        //    },
        //},
        visible: {
            set: function (value) {
                this._fabricImage.visible = value;
            },
            get: function () {
                return this._fabricImage.visible;
            }
        },
        //transparency: {
        //    set: function (value) {
        //        //todo opacity 250 to 100 convert apply filter in contructor
        //        // this._fabricImage.opacity = (100 - value) / 100.;
        //    },
        //},
        //brightness: {
        //    set: function (value) {
        //        //return this._fabricImage;
        //    },
        //},
        graphicEffects: {
            set: function (effects) {
                if (!(effects instanceof Array))
                    throw new Error ('invalid argument: effects');
                for (var i = 0, l = effects.length; i < l; i++) {
                    switch (effects[i].effect) {
                        case PocketCode.GraphicEffect.GHOST:
                            this._fabricImage.opacity = 1 - effects[i].value / 100.0;
                            break;
                        case PocketCode.GraphicEffect.BRIGHTNESS:
                            this._brightnesFilter.brightness = effects[i].value * 2.55;
                            this._fabricImage.applyFilters();
                            break;
                            //default:
                            //throw? unknown effect? -> we ignore it as we have not implemented all scratch effects
                    }
                }
            }
        },
    });

    //methods
    RenderingImage.prototype.merge({
        draw: function (context, viewportScaling) {
            if (this._viewportScaling !== viewportScaling) {
                this._viewportScaling = viewportScaling;
                //apply viewport scaling
                this._fabricImage.left = this._x * viewportScaling;
                this._fabricImage.top = this._y * viewportScaling;
                this._fabricImage.scaleX = this._scaling * viewportScaling;
                this._fabricImage.scaleY = this._scaling * viewportScaling;
            }
            this._fabricImage.setCoords();
            //render
            this._fabricImage.render(context);//, scaling); //TODO: maybe a good idea if we move that logic here-  from canvas.renderAll()
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
        //        if (this.filters[i].type == 'Brightness') {
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

    return RenderingImage;
})();
