/// <reference path='../components/sprite.js' />

PocketCode.RenderingImage = (function () {

    function RenderingImage(imageProperties) {

        if (!imageProperties || !(typeof imageProperties === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        var canvas = imageProperties.look;

        this.length = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._scale = 1;
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
            brightness: 0
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
            //var br = { x: (this.x + this.scaleX * this.width / 2), y: (this.y + this.scaleY * this.height / 2) };

            if(!this._angle){
                return (point.x >= tl.x && point.x <= tr.x &&
                        point.y >= tl.y && point.y <= bl.y);
            }

            //rotate point back
            var rad = -(this._angle * (Math.PI / 180.0));
            var centerToPoint = { x: point.x - this.x, y: point.y - this.y };
            point = {x: centerToPoint.x * Math.cos(rad) - centerToPoint.y * Math.sin(rad) + this.x,
                y: centerToPoint.x * Math.sin(rad) + centerToPoint.y * Math.cos(rad) + this.y};

            // if(this.id === "s15" || this.id === "s17"){
            //     console.log(this.id + ": width: " + this.width * this.scaleX + ", height: " + this.height * this.scaleY + ", center: " + this.x + "," + this.y + ", angle: " + this._angle, rad);
            //     console.log(pointBefore, point, (point.x >= tl.x && point.x <= tr.x && point.y >= tl.y && point.y <= bl.y));
            // }

            // if(this.output){
            //     console.log(pointBefore, point, (point.x >= tl.x && point.x <= tr.x && point.y >= tl.y && point.y <= bl.y));
            // }
            return (point.x.toFixed(4) >= tl.x && point.x.toFixed(4) <= tr.x && point.y.toFixed(4) >= tl.y && point.y.toFixed(4) <= bl.y);

            // this would need correct tr tl bl br to work
            // var scalar = function(a, b){
            //     return a.x * b.x + a.y * b.y;
            // };
            //
            //
            //
            // var tltr = {x: tl.x - tr.x, y: tl.y - tr.y};
            // var tlp = {x: tl.x - point.x, y: tl.y - point.y};
            // var tlbl = {x: tl.x - bl.x, y: tl.y - bl.y};
            //
            // var pointInRect = ((0 < scalar(tlp, tltr)) && (scalar(tlp, tltr) < scalar(tltr, tltr))) ||  ((0 < scalar(tlp, tlbl)) && (scalar(tlp, tlbl) < scalar(tlbl, tlbl)));


            //
            // //rough estimate
            // var offsetTl = { x: tl.x - this.x, y: tl.y - this.y };
            // var offsetBl = { x: bl.x - this.x, y: bl.y - this.y };
            // var offsetTr = { x: tr.x - this.x, y: tr.y - this.y };
            // var offsetBr = { x: br.x - this.x, y: br.y - this.y };
            //
            // var theta = this._angle * (Math.PI / 180);
            //
            // tl.x = offset.tl.x * Math.cos(theta) - offsetTl.y * Math.sin(theta);
            // tl.y = offset.tl.x * Math.sin(theta) - offsetTl.y * Math.cos(theta);
            //
            // bl.x = offset.bl.x * Math.cos(theta) - offsetBl.y * Math.sin(theta);
            // bl.y = offset.bl.x * Math.sin(theta) - offsetBl.y * Math.cos(theta);
            //
            // tr.x = offset.tr.x * Math.cos(theta) - offsetTr.y * Math.sin(theta);
            // tr.y = offset.tr.x * Math.sin(theta) - offsetTr.y * Math.cos(theta);
            //
            // br.x = offset.br.x * Math.cos(theta) - offsetBr.y * Math.sin(theta);
            // br.y = offset.br.x * Math.sin(theta) - offsetBr.y * Math.cos(theta);
            //
            // var minX = Math.min(tl.x, bl.x, tr.x, br.x);
            // var minY = Math.min(tl.y, bl.y, tr.y, br.y);
            // var maxX = Math.max(tl.x, bl.x, tr.x, br.x);
            // var maxY = Math.max(tl.y, bl.y, tr.y, br.y);
            // console.log(!(point.x < minX || point.x > maxX || point.y < minY || point.y > maxY));
            //
            // return !(point.x < minX || point.x > maxX || point.y < minY || point.y > maxY);
        },
        
        applyFilters: function(){
            var filters = this._filters;
            var imgElement = this._originalElement;

            if (!filters.brightness) {
                this._element = this._originalElement;
                return;
            }

            var canvasEl = document.createElement('canvas');
            canvasEl.width = imgElement.width;
            canvasEl.height = imgElement.height;
            canvasEl.getContext('2d').drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            if(filters.brightness){
                var context = canvasEl.getContext('2d'),
                    imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                    data = imageData.data,
                    brightness = Math.round(filters.brightness * 2.55);

                for (var i = 0, len = data.length; i < len; i += 4) {
                    data[i] += brightness;
                    data[i + 1] += brightness;
                    data[i + 2] += brightness;
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
            //
            // scaling missing here
            // var tl = { x: this.x - this.width / 2, y: this.y - this.height / 2 };
            // var bl = { x: this.x - this.width / 2, y: this.y + this.height / 2 };
            // var tr = { x: this.x + this.width / 2, y: this.y - this.height / 2 };
            // var br = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            //
            //
            // context.strokeStyle="green";
            // //context.rect(this.left,this.top,5,5);
            // if(this.id === 's6'){
            //     console.log(this._scaling);
            //     context.rect(tl.x,tl.y,5,5);
            //     context.stroke();
            //
            // }
        }
    });

    return RenderingImage;
})();