/// <reference path='../components/sprite.js' />

PocketCode.RenderingImage = (function () {

    function RenderingImage(imageProperties) {

        if (!imageProperties || !(typeof imageProperties === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        var canvas = imageProperties.look;

        this.length = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._scaling = 1;
        this.opacity = 1;
        this._flipX = false;
        this._visible = true;
        this._x = 0;
        this._y = 0;
        this.width = canvas.width;
        this.height = canvas.height;

        this._element = canvas;
        this._originalElement = canvas;

        this._filters = {
            brightness: 0,
            color: 0
        };

        this.merge(imageProperties);
    }

    //properties
    Object.defineProperties(RenderingImage.prototype, {
        object: {
            get: function () {
                return this._element;
            },
        },
        id: {
            set: function (value) {
                this._id = value;
            },
            get: function () {
                return this._id;
            },
        },
        look: {
            set: function (value) {
                this._element = value;
                this._originalElement = value;

                this.width = value.width;
                this.height = value.height;

                if (this._filters.brightness || this._filters.color) {
                    this.applyFilters();
                }
            },
        },
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
                this._angle = value;
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
            var tl = { x: (this.x - this.scaleX * this.width / 2), y: (this.y - this.scaleY * this.height / 2) };
            var bl = { x: (this.x - this.scaleX * this.width / 2), y: (this.y + this.scaleY * this.height / 2) };
            var tr = { x: (this.x + this.scaleX * this.width / 2), y: (this.y - this.scaleY * this.height / 2) };

            if(!this._angle){
                return (point.x >= tl.x && point.x <= tr.x &&
                        point.y >= tl.y && point.y <= bl.y);
            }

            //rotate point back
            var rad = -(this._angle * (Math.PI / 180.0));
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
            if ((this.width === 0 && this.height === 0) || !this.visible) {
                return;
            }

            context.save();
            context.translate(this.x, this.y);

            context.rotate(this._angle * (Math.PI / 180));
            context.scale(
                this.scaleX * (this._flipX ? -1 : 1),
                this.scaleY
            );

            context.globalAlpha *= this.opacity;

            var x = -this.width / 2;
            var y = -this.height / 2;

            this._element && context.drawImage(this._element, x, y, this.width, this.height);

            context.restore();
        }
    });

    return RenderingImage;
})();