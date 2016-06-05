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

                //todo color
                if (this._filters.brightness !== 0) {
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
                            this._filters.brightness = effects[i].value;
                            applyFilterNeeded = true;
                            break;
                        case PocketCode.GraphicEffect.COLOR:
                            //todo check if value or look changed
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

        //todo move helper method
        hsvToRgb: function(h, s, v){
            h = h % 360;

            var i = (Math.floor(h / 60.0));
            var f = (h / 60.0) - i;
            var p = v * (1.0 - s);
            var q = v * (1.0 - (s * f));
            var t = v * (1.0 - (s * (1.0 - f)));

            switch(i){
                case 0: return {r: v, g: t, b: p};
                case 1: return {r: q, g: v, b: p};
                case 2: return {r: p, g: v, b: t};
                case 3: return {r: p, g: q, b: v};
                case 4: return {r: t, g: p, b: v};
                case 5: return {r: v, g: p, b: q};
            }

            return {r: 0, g: 0, b: 0}
        },

        //todo move helper method
        // ranges
        // h: 0 - 360
        // s: 0 - 1
        // v: 0 - 255
        rgbToHsv: function(r, g, b){
            var h, s, v;
            v = Math.max(r, g, b);
            var span = v - Math.min(r, g, b);
            if(!span){
                h = 0;
                s = 0;
            } else {
                if (r === v)
                    h = 60.0 * ((g - b) / span);
                else if (g === v)
                    h = 120.0 + (60.0 * ((b - r) / span));
                else if (b === v)
                    h = 240.0 + (60.0 * ((r - g) / span));
                s = span / v;
            }

            return {h: h, s: s, v: v};
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

            var i, l,
                context = canvasEl.getContext('2d'),
                imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                data = imageData.data;

            if(filters.brightness){
                var brightness = Math.round(filters.brightness * 2.55);
                for (i = 0, l = data.length; i < l; i += 4) {
                    data[i] += brightness;
                    data[i + 1] += brightness;
                    data[i + 2] += brightness;
                }
                context.putImageData(imageData, 0, 0);
            }

            if(filters.color){
                for (i = 0, l = data.length; i < l; i += 4) {
                    var r = data[i],
                        g = data[i + 1],
                        b = data[i + 2];

                    var hsv = this.rgbToHsv(r, g, b);
                    var h = hsv.h;
                    var s = hsv.s;
                    var v = hsv.v;

                    h = (h + filters.color) % 360;
                    if (h < 0)
                        h += 360;
                    s = Math.max(0, Math.min(s, 1.0));
                    v = Math.max(0, Math.min(v, 255.0));

                    var rgb = this.hsvToRgb(h, s, v);

                    data[i] = rgb.r;
                    data[i + 1] = rgb.g;
                    data[i + 2] = rgb.b;
                }
                context.putImageData(imageData, 0, 0);
            }
            this._element = canvasEl;
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