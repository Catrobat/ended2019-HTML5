'use strict';

PocketCode.RenderingItem = (function () {

    function RenderingItem(propObject) {    //{ id: s01, x: 0, y: 0, visible: false }

        if (!propObject || !propObject.id)
            throw new Error('The rendering item has to be initialized using an id');

        this._id = propObject.id;
        this.x = propObject.x || 0.0;
        this.y = propObject.y || 0.0;
        this.visible = propObject.visible != undefined ? propObject.visible : true;
    }

    //properties
    Object.defineProperties(RenderingItem.prototype, {
        id: {
            get: function () {
                return this._id;
            },
        },
        x: {
            value: 0.0,
            writable: true,
        },
        y: {
            value: 0.0,
            writable: true,
        },
        visible: {
            value: true,
            writable: true,
        },
    });

    //methods
    RenderingItem.prototype.merge({
        draw: function (context) {
            if (!this.visible)
                return;
            this._draw(context);
        },
        _draw: function (context) {
            throw new Error('not implemented (abstract base class): override this method in inherited classes');
        },
    });

    return RenderingItem;
})();

PocketCode.RenderingText = (function () {
    RenderingText.extends(PocketCode.RenderingItem, false);

    function RenderingText(propObject) {    //{ id: v, text: vars[v].toString(), x: 0, y: 0, visible: false }
        PocketCode.RenderingItem.call(this, propObject);

        this._UNDEFINED_TEXT = '';  //add a string to show if text (variable) is undefined/uninitilaized
        //^^ this may be a PocketCode.Core.I18nString Object to support i18n
        this.text = propObject.text;

        this._fontFamily = 'Arial';
        this._fontSize = 46;
        this._fontWeight = 'bold';
        this._fontStyle = '';
        this._lineHeight = 1.31;
    }

    //properties
    Object.defineProperties(RenderingText.prototype, {
        text: {
            //get: function (value) {
            //    return this._text;
            //},
            set: function (value) {
                if (!value)
                    this._text = this._UNDEFINED_TEXT.toString();
                else if (typeof value == 'number' && Math.round(value) == value)
                    this._text = value.toString() + '.0';   //include 1 decimal for integers
                else
                    this._text = value.toString();
            },
        },
    });

    //methods
    RenderingText.prototype.merge({
        /* oveerride */
        _draw: function (context) {
            if (this._text === '')
                return;

            context.textBaseline = 'top';
            context.font = this._fontStyle + ' ' + this._fontWeight + ' ' + this._fontSize + 'px' + ' ' + this._fontFamily;

            // wrap lines
            var newline = /\r?\n/;
            var textLines = this._text.split(newline);

            for (var i = 0, len = textLines.length; i < len; i++) {
                var heightOfLine = this._fontSize * this._lineHeight * i;
                context.fillText(textLines[i], this.x, -this.y - heightOfLine);
            }
        },
    });

    return RenderingText;
})();


PocketCode.RenderingImage = (function () {
    RenderingImage.extends(PocketCode.RenderingItem, false);

    function RenderingImage(propObject) {
        PocketCode.RenderingItem.call(this, propObject);

        if (!propObject || !(typeof propObject === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        this._width = 0;
        this._height = 0;

        this._scaling = 1.0;
        this._flipX = false;
        this._rotation = 0.0;

        this.graphicEffects = propObject.graphicEffects || [];

        delete propObject.id;   //already set, deleted to avaoid error on merge as id isn't a public property
        this.merge(propObject); //all parameters have the same names as the public interface (setter)- merge will set them all
    }

    //properties
    Object.defineProperties(RenderingImage.prototype, {
        look: {
            set: function (value) {
                if (value && !(value instanceof HTMLCanvasElement))
                    throw new Error('invalid look setter: HTMLCanvasElement expected');

                this._cacheCanvas = value;
                this._originalCanvas = value;

                if (!value)
                    return;
                this._width = value.width;
                this._height = value.height;

                //restore graphicEffects to new look
                this.graphicEffects = this._graphicEffects;
            },
        },
        scaling: {
            set: function (value) {
                this._scaling = value;
            },
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
        graphicEffects: {
            set: function (filters) {
                if (!(filters instanceof Array))
                    throw new Error('invalid argument: effects');

                this._graphicEffects = filters;
                if (!this._originalCanvas || filters.length == 0)
                    return;

                if (!this._cacheCanvas || !filters.length)
                    return;

                var imageElement = this._originalCanvas;
                var canvasElement = document.createElement('canvas');
                canvasElement.width = imageElement.width;
                canvasElement.height = imageElement.height;
                canvasElement.getContext('2d').drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);

                PocketCode.ImageHelper.setFilters(canvasElement, filters);
                this._cacheCanvas = canvasElement;
            }
        },
    });

    //methods
    RenderingImage.prototype.merge({
        containsPoint: function (point) {
            if (!this._originalCanvas || !this.visible || (this._width === 0 && this._height === 0))
                return false;

            var w2 = this._scaling * this._width / 2.0,
                h2 = this._scaling * this._height / 2.0,
                top = this.y + h2,
                right = this.x + w2,
                bottom = this.y - h2,
                left = this.x - w2;

            if (this._rotation) {
                //rotate point back (instead of rotating image which will result in a bigger boundary
                var rad = -this._rotation * (Math.PI / 180.0);
                var centerToPoint = { x: point.x - this.x, y: point.y - this.y };
                point = {
                    x: centerToPoint.x * Math.cos(rad) - centerToPoint.y * Math.sin(rad) + this.x,
                    y: centerToPoint.x * Math.sin(rad) + centerToPoint.y * Math.cos(rad) + this.y
                };
            }

            return (point.x >= left && point.x <= right && point.y <= top && point.y >= bottom);
            //please notice: toFixed() is a string formatting function and returns a string- try not to convert numbers to strings to number during calculations
        },
        /* override */
        _draw: function (context) {
            if (!this._originalCanvas || (this._width === 0 && this._height === 0))
                return;

            context.save();
            context.translate(this.x, -this.y);

            context.rotate(this._rotation * (Math.PI / 180.0));
            context.scale(
                this._scaling * (this._flipX ? -1.0 : 1.0),
                this._scaling
            );

            context.globalAlpha = this._cacheCanvas.getContext('2d').globalAlpha;
            this._cacheCanvas && context.drawImage(this._cacheCanvas, -this._width / 2.0, -this._height / 2.0, this._width, this._height);
            context.restore();
        }
    });

    return RenderingImage;
})();
