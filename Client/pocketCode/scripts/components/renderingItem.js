/// <reference path="i18nProvider.js" />
'use strict';

PocketCode.RenderingItem = (function () {

    function RenderingItem(propObject) {    //{ id: s01, x: 0, y: 0, visible: false }

        if (!propObject || !propObject.id)
            throw new Error('The rendering item has to be initialized using an id');

        this._id = propObject.id;
        this.x = propObject.x || 0.0;
        this.y = propObject.y || 0.0;
        this.visible = propObject.visible != undefined ? propObject.visible : true;

        this._cacheCanvas = document.createElement('canvas');
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
        draw: function (ctx, maxWidth) {
            if (!this.visible)
                return;
            this._draw(ctx, maxWidth);
        },
        _draw: function (ctx, maxWidth) {
            throw new Error('not implemented (abstract base class): override this method in inherited classes');
        },
    });

    return RenderingItem;
})();


PocketCode.merge({
    RenderingText: (function () {
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
            this._lineHeight = 54;
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
            _getTextBlockSize: function (ctx, maxWidth, rtl) {

            },
            _drawTextBlock: function (ctx, maxWidth, x, y) {
                x = x || this.x;
                y = y || this.y;
                var newLines = this._text.split(/\r?\n/),
                    line = '',
                    //lineWidth = 0,
                    testLine = '',
                    metrics;//,
                    //maxLineWidth = 0;

                for (var i = 0, l = newLines.length; i < l; i++) {
                    var words = newLines[i].trim().split(' ');

                    var wl = words.length;
                    if (wl > 0) {
                        for (var n = 0; n < wl; n++) {
                            testLine += words[n];// + ' ');
                            metrics = ctx.measureText(testLine);
                            //preLineWidth = lineWidth;


                            if (!maxWidth || maxWidth && metrics.width < maxWidth || line.length == 0) {
                                line = (testLine += ' ');
                                //lineWidth = metrics.width;
                                //maxLineWidth = Math.max(maxLineWidth, lineWidth);
                            }
                            else {
                                ctx.fillText(line.trim(), x, y);
                                //maxLineWidth = Math.max(maxLineWidth, lineWidth);
                                //lineWidth = metrics.width - lineWidth;
                                y += this._lineHeight;
                                line = testLine = words[n] + ' ';
                                //testLine = '';
                                //lineWidth = metrics.width;
                            }
                            //lineWidth = metrics.width;
                        }
                        ctx.fillText(line.trim(), x, y);
                        //maxLineWidth = Math.max(maxLineWidth, lineWidth);
                        //lineWidth = 0;
                        testLine = '';
                    }
                    y += this._lineHeight;
                }
                //return { width: Math.ceil(maxLineWidth), height: y - lineHeight };
            },
            /* oveerride */
            _draw: function (ctx, maxWidth) {
                if (this._text === '')
                    return;

                ctx.textBaseline = 'top';   //'hanging';
                ctx.font = this._fontStyle + ' ' + this._fontWeight + ' ' + this._fontSize + 'px' + ' ' + this._fontFamily;

                var text = this._text;
                var lineFeeds = text.split(/\r?\n/).length > 1,
                    rtl = PocketCode.I18nProvider.getTextDirection(text) == PocketCode.Ui.Direction.RTL;

                if (lineFeeds || maxWidth) {
                    //if (rtl) {
                    //    var size = this._getTextBlockSize(ctx, maxWidth, rtl);
                    //    this._drawTextBlock(ctx, maxWidth, rtl, this.x + size.width);
                    //}
                    //else
                    this._drawTextBlock(ctx, maxWidth);
                }
                else //draw in one line
                    ctx.fillText(text, this.x, this.y);

                //if maxWidth: check for breaks
                //if rtl: and breaks

                //// wrap lines
                //var newline = /\r?\n/;
                //var textLines = this._text.split(newline);

                //for (var i = 0, len = textLines.length; i < len; i++) {
                //    var heightOfLine = this._fontSize * this._lineHeight * i;
                //    ctx.fillText(textLines[i], this.x, -this.y - heightOfLine);
                //}
            },
        });

        return RenderingText;
    })(),

    RenderingSprite: (function () {
        RenderingSprite.extends(PocketCode.RenderingItem, false);

        function RenderingSprite(propObject) {
            PocketCode.RenderingItem.call(this, propObject);
            this._width = 0;
            this._height = 0;

            this._scaling = 1.0;
            this._flipX = false;
            this._rotation = 0.0;
            this._shadow = false;

            this.graphicEffects = propObject.graphicEffects || [];

            this._penDown = false;
            this._penSize = 4;
            this._penColorBlue = 255.0;
            this._penColorRed = 0.0;
            this._penColorGreen = 0.0;

            delete propObject.id;   //already set, deleted to avaoid error on merge as id isn't a public property
            this.merge(propObject); //all parameters have the same names as the public interface (setter)- merge will set them all
        }

        //properties
        Object.defineProperties(RenderingSprite.prototype, {
            look: {
                set: function (value) {
                    if (value && !(value instanceof HTMLCanvasElement))
                        throw new Error('invalid look setter: HTMLCanvasElement expected');
                    if (!value)
                        return;

                    this._originalCanvas = value;
                    this._width = value.width;
                    this._height = value.height;
                    this._cacheCanvas.width = value.width;
                    this._cacheCanvas.height = value.height;

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
                },
            },
            flipX: {
                set: function (value) {
                    this._flipX = value;
                },
            },
            shadow: {
                set: function (value) {
                    this._shadow = value;
                },
            },
            graphicEffects: {
                set: function (filters) {
                    if (!(filters instanceof Array))
                        throw new Error('invalid argument: effects');

                    this._graphicEffects = filters;
                    if (!this._originalCanvas)
                        return;

                    var img = this._originalCanvas,
                        width = img.width,
                        height = img.height,
                        cache = this._cacheCanvas,
                        ctx = cache.getContext('2d');

                    cache.width = width;
                    cache.height = height;
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    if (!filters.length)
                        PocketCode.ImageHelper.setFilters(cache, filters);
                },
            },
            penDown: {
                set: function (value) {
                    this._penDown = value;
                },
            },
            penSize: {
                set: function (value) {
                    this._penSize = value;
                },
            },
            penColorBlue: {
                set: function (value) {
                    this._penColorBlue = value;
                },
            },
            penColorRed: {
                set: function (value) {
                    this._penColorRed = value;
                },
            },
            penColorGreen: {
                set: function (value) {
                    this._penColorGreen = value;
                },
            },
        });

        //methods
        RenderingSprite.prototype.merge({
            containsPoint: function (point) {
                if (!this._originalCanvas || !this.visible || (this._width === 0 && this._height === 0))
                    return false;

                var w2 = this._scaling * this._width * 0.5,
                    h2 = this._scaling * this._height * 0.5,
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
            _draw: function (ctx) {
                if (!this._originalCanvas || (this._width === 0 && this._height === 0))
                    return;

                ctx.save();
                ctx.translate(this.x, -this.y);

                ctx.rotate(this._rotation * (Math.PI / 180.0));
                ctx.scale(
                    this._scaling * (this._flipX ? -1.0 : 1.0),
                    this._scaling
                );

                ctx.globalAlpha = this._cacheCanvas.getContext('2d').globalAlpha;
                if (this._shadow) {
                    ctx.shadowOffsetX = 6;
                    ctx.shadowOffsetY = 6;
                    ctx.shadowBlur = 0.5;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                }
                this._cacheCanvas && ctx.drawImage(this._cacheCanvas, -this._width * 0.5, -this._height * 0.5, this._width, this._height);
                ctx.restore();
            },
        });

        return RenderingSprite;
    })(),
});


PocketCode.merge({
    RenderingBubbleType: {
        SPEECH: 0,
        THOUGHT: 1,
    },

    /* TODO: 
     * -move cacheCanvas to base class to cache text rendering as well
     * -refactor renderingText for RTL support
     * -implement bubbles: make sure to get the latest UX designs, check for an existing android implementation, ...
     */
    RenderingBubble: (function () {
        RenderingBubble.extends(PocketCode.RenderingText, false);

        function RenderingBubble(propObject) {
            PocketCode.RenderingText.call(this, propObject);

            this._bubbleType = propObject.type || PocketCode.RenderingBubbleType.SPEECH;    //default
        }

        //properties
        //Object.defineProperties(RenderingBubble.prototype, {
        //});

        //methods
        RenderingBubble.prototype.merge({
            /* oveerride */
            _draw: function (ctx, maxWidth) {
                //TODO: have a look at our prototyping branch for a speech bubble example
            },
        });

        return RenderingBubble;
    })(),
});