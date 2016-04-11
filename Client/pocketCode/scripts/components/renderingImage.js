/// <reference path='../components/sprite.js' />

PocketCode.RenderingImage = (function () {

    function RenderingImage(imageProperties) {
        if (!imageProperties || !(typeof imageProperties === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        var canvas = imageProperties.look;
        this._fabricImage = new fabric.Image(canvas, {
            perPixelTargetFind: true, // only pixels inside item area trigger click
            selectable: false,
            hasControls: false,
            hasBorders: false,
            hasRotatingPoint: false,
            originX: 'center',
            originY: 'center',
            centeredScaling: true,
            width: canvas.width,
            height: canvas.height,
            // flipX = flipH: false, //already a property and false (default)
            // flipy = flipV: false, //already a property and false (default)
            //filters: [],  //default
            //opacity: 1.0  //default
        });
        this._brightnesFilter = new fabric.Image.filters.Brightness({
            brightness: 0,
        });

        //this._fabricImage.filters.push(this._brightnesFilter);
        //this._rotationStyle = PocketCode.RotationStyle.ALL_AROUND;

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
                this._fabricImage.id = value;
            },
            get: function () {
                return this._fabricImage.id;
            },
        },
        look: {
            set: function (value) {
                this._fabricImage.setElement(value);
            },
        },
        x: {
            set: function (value) {
                this._fabricImage.left = value;
            },
            get: function () {
                return this._x;
            }
        },
        y: {
            set: function (value) {
                this._y = value;
                this._fabricImage.top = value;
            },

            get: function () {
                return this._y;
            }
        },
        scaling: {
            set: function (value) {
                this._scaling = value;
                this._fabricImage.scaleX = value;
                this._fabricImage.scaleY = value;
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
        visible: {
            set: function (value) {
                this._fabricImage.visible = value;
            },
            get: function () {
                return this._fabricImage.visible;
            }
        },
        graphicEffects: {
            set: function (effects) {
                if (!(effects instanceof Array))
                    throw new Error('invalid argument: effects');

                for (var i = 0, l = effects.length; i < l; i++) {
                    switch (effects[i].effect) {
                        case PocketCode.GraphicEffect.GHOST:
                            //opacity: 1.0  //default
                            this._fabricImage.opacity = 1 - effects[i].value / 100.0;
                            break;
                        case PocketCode.GraphicEffect.BRIGHTNESS:
                            var val = effects[i].value;
                            if (val) {  //!= 0
                                this._brightnesFilter.brightness = Math.round(val * 2.55);
                                if (this._fabricImage.filters.indexOf(this._brightnesFilter) == -1) //not in list
                                    this._fabricImage.filters.push(this._brightnesFilter);
                                this._fabricImage.applyFilters();
                            }
                            else if (this._fabricImage.filters.indexOf(this._brightnesFilter) !== -1) { //remove
                                this._fabricImage.filters.remove(this._brightnesFilter);
                                this._fabricImage.applyFilters();
                            }
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
        draw: function (context) {
            this._fabricImage.render(context);
        },
    });

    return RenderingImage;
})();
