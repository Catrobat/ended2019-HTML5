/// <reference path='../components/sprite.js' />

PocketCode.RenderingImage = (function () {

    function RenderingImage(args) {

        if (!args || !(typeof args === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        this._width = 0;
        this._height = 0;

        //if (args.look) { //TODO: this is a quickfix to get the test up and running: what if there is no look defined in a sprite -> lokk = undefined
        //    var canvas = args.look;
        //    this._width = canvas.width;
        //    this._height = canvas.height;

        //    this._element = document.createElement('canvas'); //canvas;     //wrong: if you assign the control to both vars.. the reference stored id the same and the element will get overwritten
        //    this._originalElement = canvas;
        //}
        //else {
        //    this._width = 0;
        //    this._height = 0;

        //    this._element = document.createElement('canvas');
        //    this._originalElement = document.createElement('canvas');
        //}

        //this._id = args.id;
        //this.length = 0.0;
        this._scaleX = 1.0; //a rendering Image should only have one scaling = sprite.size equivalent: scaleX/Y should be set on the canvas element
        this._scaleY = 1.0;
        this._scaling = 1.0;
        this.opacity = 1.0; //should be part of graphicEffects & why public?
        this._flipX = false;
        this._visible = true;
        this._x = 0.0;
        this._y = 0.0;
        this._rotation = 0.0;

        this._filters = {   //should be part of graphicEffects
            brightness: 0,
            color: 0,
        };
        //this.graphicEffects = args.graphicEffects || [];    //TODO: store effects and use canvas = ImageHelper.setFilters(canvas filter[]);
        //                                                    //does not support transparency right now: move/add filter logic to imageHelper.js -> PocketCode.ImageFilter
        this.merge(args);   //NOTICE: all parameters have the same names as the public interface of this object- merge will set all ogf these
    }

    //properties
    Object.defineProperties(RenderingImage.prototype, {
        object: {
            get: function () {
                return this._element;
            },
        },
        id: {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
            },
        },
        look: {
            set: function (value) {
                if (!value) {   //TODO: test setting value = undefined, should we check for undefined or HTMLCanvasElement (validation?)
                    this._element = document.createElement('canvas');
                    this._originalElement = document.createElement('canvas');

                    this._width = 0.0;
                    this._height = 0.0;
                    return;
                }
                this._element = value;
                this._originalElement = value;

                this._width = value.width;
                this._height = value.height;

                if (this._filters.brightness || this._filters.color) {
                    this.applyFilters();
                }
            },
        },
        //width: {
        //    get: function () {
        //        return this._width;
        //    },
        //},
        //height: {
        //    get: function () {
        //        return this._height;
        //    },
        //},
        x: {
            set: function (value) {
                this._x = value;
            },
            get: function () {
                return this._x;
            }
        },
        y: {
            set: function (value) {
                this._y = value;
            },

            get: function () {
                return this._y;
            }
        },
        scaling: {
            set: function (value) {
                this._scaling = value;
                this._scaleX = value;
                this._scaleY = value;
            },
        },
        scaleX: {
            set: function (value) {
                this._scaleX = value;
            },
            get: function () {
                return this._scaleX;
            }
        },
        scaleY: {
            set: function (value) {
                this._scaleY = value;
            },
            get: function () {
                return this._scaleY;
            }
        },
        rotation: {
            set: function (value) {
                this._rotation = value;
            }
        },
        flipX: {
            set: function (value) {
                this._flipX = value;
            }
        },
        visible: {
            set: function (value) {
                this._visible = value;
            },
            get: function () {
                return this._visible;
            }
        },

        graphicEffects: {
            set: function (effects) {
                if (!(effects instanceof Array))
                    throw new Error('invalid argument: effects');

                var applyFilterNeeded = false;
                for (var i = 0, l = effects.length; i < l; i++) {
                    switch (effects[i].effect) {
                        case PocketCode.GraphicEffect.GHOST:
                            this.opacity = 1 - effects[i].value / 100.0;
                            break;
                        case PocketCode.GraphicEffect.BRIGHTNESS:
                            if (this._filters.brightness === effects[i].value)
                                break;

                            this._filters.brightness = effects[i].value;
                            applyFilterNeeded = true;
                            break;
                        case PocketCode.GraphicEffect.COLOR:
                            if (this._filters.color === effects[i].value)
                                break;

                            this._filters.color = effects[i].value;
                            applyFilterNeeded = true;
                            break;
                    }
                }
                if(applyFilterNeeded)
                    this.applyFilters();
            }
        },
    });

    //methods
    RenderingImage.prototype.merge({
        containsPoint: function(point){
            var tl = { x: (this.x - this.scaleX * this._width / 2), y: (this.y - this.scaleY * this._height / 2) };
            var bl = { x: (this.x - this.scaleX * this._width / 2), y: (this.y + this.scaleY * this._height / 2) };
            var tr = { x: (this.x + this.scaleX * this._width / 2), y: (this.y - this.scaleY * this._height / 2) };

            if(!this._rotation){
                return (point.x >= tl.x && point.x <= tr.x &&
                        point.y >= tl.y && point.y <= bl.y);
            }

            //rotate point back
            var rad = -(this._rotation * (Math.PI / 180.0));
            var centerToPoint = { x: point.x - this.x, y: point.y - this.y };
            point = {x: centerToPoint.x * Math.cos(rad) - centerToPoint.y * Math.sin(rad) + this.x,
                y: centerToPoint.x * Math.sin(rad) + centerToPoint.y * Math.cos(rad) + this.y};

            return (point.x.toFixed(4) >= tl.x && point.x.toFixed(4) <= tr.x && point.y.toFixed(4) >= tl.y && point.y.toFixed(4) <= bl.y);
        },

        applyFilters: function(){
            var filters = this._filters;
            var imgElement = this._originalElement;

            if (!filters.brightness && !filters.color) {
                this._element = this._originalElement;
                return;
            }

            var canvasEl = document.createElement('canvas');
            canvasEl.width = imgElement.width;
            canvasEl.height = imgElement.height;
            canvasEl.getContext('2d').drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            var context = canvasEl.getContext('2d'),
                imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                data = imageData.data;

            this.applyBrightnessFilter(data);
            this.applyColorFilter(data);

            context.putImageData(imageData, 0, 0);

            this._element = canvasEl;
        },

        applyBrightnessFilter: function (data) {
            if(!this._filters.brightness)
                return;

            var brightness = Math.round(this._filters.brightness * 2.55);
            for (var i = 0, l = data.length; i < l; i += 4) {
                data[i] += brightness;
                data[i + 1] += brightness;
                data[i + 2] += brightness;
            }
        },

        applyColorFilter: function (data) {
            if(!this._filters.color)
                return;

            for (var i = 0, l = data.length; i < l; i += 4) {
                var r = data[i],
                    g = data[i + 1],
                    b = data[i + 2];

                var hsv = PocketCode.ImageHelper.rgbToHsv(r, g, b);
                var h = hsv.h;
                var s = hsv.s;
                var v = hsv.v;

                h = (h + this._filters.color) % 360;
                if (h < 0)
                    h += 360;
                s = Math.max(0, Math.min(s, 1.0));
                v = Math.max(0, Math.min(v, 255.0));

                var rgb = PocketCode.ImageHelper.hsvToRgb(h, s, v);

                data[i] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
            }
        },
        
        draw: function (context) {
            if ((this._width === 0 && this._height === 0) || !this.visible) {
                return;
            }

            context.save();
            context.translate(this.x, this.y);

            context.rotate(this._rotation * (Math.PI / 180));
            context.scale(
                this.scaleX * (this._flipX ? -1 : 1),
                this.scaleY
            );

            context.globalAlpha *= this.opacity;

            var x = -this._width / 2;
            var y = -this._height / 2;

            this._element && context.drawImage(this._element, x, y, this._width, this._height);

            context.restore();
        }
    });

    return RenderingImage;
})();