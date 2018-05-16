/// <reference path="../core.js" />
/// <reference path="i18nProvider.js" />
'use strict';

PocketCode.RenderingItem = (function () {

    function RenderingItem(propObject) {    //{ id: s01, x: 0, y: 0, visible: false }

        propObject = propObject || {};

        this._id = propObject.id;
        delete propObject.id;
        this.x = propObject.x || 0.0;
        this.y = propObject.y || 0.0;
        this.visible = propObject.visible != undefined ? propObject.visible : true;

        this._cacheCanvas = document.createElement('canvas');
        this._cacheCanvas.height = this._cacheCanvas.width = 0; //empty
        this._cacheCtx = this._cacheCanvas.getContext('2d');
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
        draw: function (ctx) {
            if (!this.visible)
                return false;
            return this._draw(ctx);
        },
        _draw: function (ctx) {
            var canvas = this._cacheCanvas;
            if (!canvas)    //disposed
                return false;
            var width = canvas.width,
                height = canvas.height;
            if (width == 0 || height == 0)
                return false; //drawing a canvas with size = 0 will throw an error

            ctx.save();
            ctx.translate(this.x, -this.y);
            ctx.drawImage(canvas, 0, 0, width, height);
            ctx.restore();
            return true;
        },
        dispose: function () {
            this.visible = false;
            this._cacheCanvas = undefined;
        },
    });

    return RenderingItem;
})();

PocketCode.merge({

    RenderingText: (function () {
        RenderingText.extends(PocketCode.RenderingItem, false);

        function RenderingText(propObject) {    //{ scopeId: , id: , value: vars[v].toString(), x: 0, y: 0, visible: false }
            PocketCode.RenderingItem.call(this, propObject);
            PocketCode.I18nProvider.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(this._onLanguageChangeHandler, this));

            propObject = propObject || {};
            this._value = undefined;
            this._maxLineWidth = undefined;

            this._scopeId = propObject.scopeId;   //var ids not unique due textObject cloning: the id is the sprite (local scope) or project (global scope) id
            delete propObject.scopeId;
            this._textAlign = propObject.textAlign || 'left';
            delete propObject.textAlign;

            //event
            this._onCacheUpdate = new SmartJs.Event.Event(this);

            this.merge(propObject);
        }

        //events
        Object.defineProperties(RenderingText.prototype, {
            onCacheUpdate: {
                get: function () { return this._onCacheUpdate },
            },
        });

        //properties
        Object.defineProperties(RenderingText.prototype, {
            scopeId: {
                get: function () {
                    return this._scopeId;
                },
            },
            width: {
                get: function () {
                    return this._cacheCanvas.width;
                },
            },
            height: {
                get: function () {
                    return this._cacheCanvas.height;
                },
            },
            value: {
                set: function (value) {
                    if (this._value === value)
                        return;
                    this._value = value;
                    this._redrawCache();
                },
            },
            fontFamily: {
                value: 'Arial',
                writable: true,
            },
            fontSize: {
                value: 46,
                writable: true,
            },
            fontWeight: {
                value: 'bold',
                writable: true,
            },
            fontStyle: {
                value: 'normal',
                writable: true,
            },
            lineHeight: {
                value: 54,
                writable: true,
            },
            maxLineWidth: {
                set: function (value) {
                    this._maxLineWidth = value;
                    if (this.width > value)
                        this._redrawCache();
                },
            },
        });

        //methods
        RenderingText.prototype.merge({
            _getTextBlock: function (string) {
                var block = {
                    width: 0,
                    height: 0,
                    lines: [],
                };

                var ctx = this._cacheCtx,
                    maxLineWidth = this._maxLineWidth,
                    textLines = string.split(/\r?\n/),
                    line,
                    metrics;

                if (!maxLineWidth) {
                    for (var i = 0, l = textLines.length; i < l; i++) {
                        line = textLines[i].trim();
                        metrics = ctx.measureText(line);
                        block.lines.push({ text: line, width: metrics.width });
                        block.width = Math.max(block.width, metrics.width);
                    }
                }
                else {  //split lines and words textObject fit maxLineWidth
                    var words,
                        testLine = '',
                        width;

                    for (var i = 0, l = textLines.length; i < l; i++) {
                        line = textLines[i].trim();
                        metrics = ctx.measureText(line),
                        width = metrics.width;

                        if (width > maxLineWidth) {//else {  //line.width > maxLineWidth -> split
                            words = line.split(/\s+/);
                            line = '';
                            width = 0;
                            for (var n = 0, wl = words.length; n < wl; n++) {
                                testLine += words[n];//.trim();
                                metrics = ctx.measureText(testLine);
                                if (metrics.width <= maxLineWidth) {
                                    width = metrics.width;
                                    line = testLine;
                                    testLine += ' ';
                                }
                                else if (line == '') {  //word does not fit but line is empty: split word
                                    var chars = Math.max(1, Math.floor(maxLineWidth / metrics.width * words[n].length * 0.97)), //-3% textObject make sure the resulting word fits
                                        splitWord = words[n].substr(0, chars);
                                    metrics = ctx.measureText(splitWord);
                                    block.lines.push({ text: splitWord, width: metrics.width });
                                    block.width = Math.max(block.width, metrics.width);
                                    words[n] = words[n].substring(chars, testLine.length);  //store remaining chars
                                    n--;
                                    testLine = '';
                                }
                                else {
                                    block.lines.push({ text: line, width: width });
                                    block.width = Math.max(block.width, width);
                                    n--;
                                    testLine = line = '';
                                }
                            }
                        }
                        //add line
                        block.lines.push({ text: line, width: width });
                        block.width = Math.max(block.width, width);
                        testLine = line = '';
                    }
                }

                block.width = Math.ceil(block.width);
                block.height = Math.ceil(block.lines.length * this.lineHeight);
                return block;
            },
            _redrawCache: function () {
                var canvas = this._cacheCanvas,
                    ctx = this._cacheCtx,
                    string = PocketCode.Math.Cast.toI18nString(this._value, PocketCode.I18nProvider.currentLanguage),
                    dir = PocketCode.I18nProvider.getTextDirection(string),
                    rtl = (dir == PocketCode.Ui.Direction.RTL),
                    translation = 0,
                    font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + 'px' + ' ' + this.fontFamily;

                if (string == '') {  //clear cache
                    canvas.width = canvas.height = 0;
                    return;
                }

                ctx.textBaseline = 'middle';
                ctx.font = font;
                ctx.textAlign = 'left'; //always left even if set textObject 'center'
                var textBlock = this._getTextBlock(string);
                canvas.width = textBlock.width;//resize sets ctx textObject default
                canvas.height = textBlock.height;

                ctx.save();
                //apply settings again (due textObject canvas resize)
                ctx.textBaseline = 'middle';
                ctx.font = font;
                ctx.textAlign = 'left';

                //draw
                var textLines = textBlock.lines,
                    line,
                    text,
                    offset = 0;
                for (var i = 0, l = textLines.length; i < l; i++) {
                    line = textLines[i];
                    if (rtl) {
                        //please notice: as our cache is not part of the DOM, rendering texts correctly is tricky
                        text = '\u202E' + line.text;    //force textObject RTL text
                        if (this._textAlign != 'center')
                            offset = textBlock.width - line.width;  //make sure all texts are visible and aligned correctly
                    }
                    else
                        text = line.text;

                    //text may be centered (for bubbles)
                    if (this._textAlign == 'center')
                        offset = (textBlock.width - line.width) * .5;  //works much better (RTL) than ctx.translate(textBlock.width * .5, 0);

                    ctx.fillText(text, offset, this.lineHeight * (i + .5));
                }
                ctx.restore();
                this._onCacheUpdate.dispatchEvent({ size: { width: textBlock.width, height: textBlock.height } });
            },
            _onLanguageChangeHandler: function () {
                //wait for the i18nStrings textObject updated and then redraw the cache: timeout needed because this handler may be called first
                window.setTimeout(this._redrawCache.bind(this), 0);
            },
            /* override */
            dispose: function () {
                PocketCode.I18nProvider.onLanguageChange.removeEventListener(new SmartJs.Event.EventListener(this._onLanguageChangeHandler, this));
                PocketCode.RenderingItem.prototype.dispose.call(this);
            }
        });

        return RenderingText;
    })(),

    BubbleOrientation: {
        LEFT: 0,
        RIGHT: 1,
        TOPLEFT: 2,
        TOPRIGHT: 3
    },

    RenderingBubble: (function () {
        RenderingBubble.extends(PocketCode.RenderingItem, false);

        function RenderingBubble() {
            PocketCode.RenderingItem.call(this);

            this._type = PocketCode.Ui.BubbleType.SPEECH;
            this._orientation = PocketCode.BubbleOrientation.TOPRIGHT;

            this._textObject = new PocketCode.RenderingText({ fontWeight: 'normal', fontSize: 51, lineHeight: 57, textAlign: 'center', maxLineWidth: 360 });
            this._textObject.onCacheUpdate.addEventListener(new SmartJs.Event.EventListener(this._redrawCache, this));
        }

        //properties
        Object.defineProperties(RenderingBubble.prototype, {
            //layout settings
            _lineWidth: {
                value: 9,
            },
            _strokeStyle: {
                value: '#a0a0a0',
            },
            _fillStyle: {
                value: '#ffffff',
            },
            _radius: {
                value: 30,
            },
            _minHeight: {
                value: 150,
            },
            _minWidth: {
                value: 225,
            },
            _textPadding: {
                value: {
                    top: 21,
                    right: 24,
                    bottom: 18,
                    left: 24,
                },
            },
            _tail: {
                value: {
                    height: 51,
                    offset: 45,
                    indent: 18,
                    width: 48,
                },
            },
            _thinkBubbles: {
                value: {
                    offsetX: 99,
                    offsetY: 78,
                    scalingX: 1.4,
                    bubbles: [{
                        top: {
                            x: 24,
                            y: 18,
                            radius: 12,
                        },
                        side: {
                            x: 12,
                            y: 99,
                            radius: 12,
                        },
                    },
                    {
                        top: {
                            x: 48,
                            y: 48,
                            radius: 21,
                        },
                        side: {
                            x: 30,
                            y: 63,
                            radius: 21,
                        },
                    }],
                },
            },
            type: {
                set: function (value) {
                    this._type = value;
                    this._redrawCache();
                },
            },
            orientation: {
                set: function (value) {
                    this._orientation = value;
                    this._redrawCache();
                },
            },
            content: {
                set: function (value) {
                    this._textObject.value = value;
                    this._redrawCache();
                },
            },
            /*bubblePosition: {
                set: function (x, y) {
                    //Todo:
                    if (isNaN(x) || isNaN(y))
                        throw new Error('invalid argument: position');
    
                    this._positionX = x;
                    this._positionY = y;
                },
    
            },
            bubbleWidth: {
                get: function () {
                    return this._width;
                },
                set: function (width) {
                    if (isNaN(width))
                        throw new Error('invalid argument: size');
    
                    this._width = width;
                }
            },
            bubbleHeight: {
                get: function () {
                    return this._height;
                },
                set: function (height) {
                    if (isNaN(height))
                        throw new Error('invalid argument: size');
    
                    this._height = height;
                }
            },*/
        });

        //methods
        RenderingBubble.prototype.merge({
            _redrawCache: function () {
                if (this._type === PocketCode.Ui.BubbleType.THINK)
                    this._drawThinkBubble();
                else    //default
                    this._drawSpeechBubble();
            },
            _drawThinkBubble: function () {

                var lineWidth = this._lineWidth,
                    radius = this._radius,
                    settings = this._thinkBubbles,
                    orientation = this._orientation,
                    canvas = this._cacheCanvas,
                    ctx = this._cacheCtx;

                var textObject = this._textObject,
                    bubbleWidth = Math.max(this._minWidth, textObject.width + this._textPadding.left + this._textPadding.right + 2 * lineWidth),
                    bubbleHeight = Math.max(this._minHeight, textObject.height + this._textPadding.top + this._textPadding.bottom + 2 * lineWidth);

                //set canvas size
                var width = bubbleWidth,
                    height = bubbleHeight + settings.offsetY;
                if (orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT) {
                    width = bubbleWidth + settings.offsetX;
                    height = bubbleHeight;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.save(); //save initial state

                //styles
                ctx.fillStyle = this._fillStyle;
                ctx.strokeStyle = this._strokeStyle;
                ctx.lineWidth = lineWidth;

                //flip X (horizontal)
                if (orientation == PocketCode.BubbleOrientation.LEFT || orientation == PocketCode.BubbleOrientation.TOPLEFT) {
                    ctx.translate(canvas.width + .5, 0);
                    ctx.scale(-1, 1);
                }

                //save translate 0/0
                ctx.save();

                //draw bubble
                if (orientation == PocketCode.BubbleOrientation.LEFT || orientation == PocketCode.BubbleOrientation.RIGHT)
                    ctx.translate(settings.offsetX + lineWidth * .5, lineWidth * .5);
                else
                    ctx.translate(lineWidth * .5, lineWidth * .5);

                ctx.beginPath();
                ctx.arc(radius, radius, radius, Math.PI, Math.PI * 1.5);
                ctx.arc(bubbleWidth - lineWidth - radius, radius, radius, Math.PI * 1.5, Math.PI * 2);
                ctx.arc(bubbleWidth - lineWidth - radius, bubbleHeight - lineWidth - radius, radius, 0, Math.PI * .5);
                ctx.arc(radius, bubbleHeight - lineWidth - radius, radius, Math.PI * .5, Math.PI);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                //restore translate 0/0
                ctx.restore();

                //draw small bubbles
                var type = (orientation == PocketCode.BubbleOrientation.TOPLEFT ||
                            orientation == PocketCode.BubbleOrientation.TOPRIGHT) ? 'top' : 'side';

                var bubble;
                ctx.save();
                ctx.scale(settings.scalingX, 1);
                ctx.lineWidth = lineWidth / settings.scalingX;

                for (var i = 0, l = settings.bubbles.length; i < l; i++) {
                    bubble = settings.bubbles[i][type];

                    ctx.beginPath();
                    if (type == 'top')   //offsets are calculated from the bottom
                        ctx.arc(bubble.x * settings.scalingX, height - bubble.y, bubble.radius, 0, Math.PI * 2);
                    else
                        ctx.arc(bubble.x * settings.scalingX, bubble.y, bubble.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                }
                ctx.restore();  //scaling

                //restore initial
                ctx.restore();

                //draw text
                ctx.save();
                if (orientation === PocketCode.BubbleOrientation.RIGHT)
                    ctx.translate(settings.offsetX + bubbleWidth * .5 - textObject.width * .5, bubbleHeight * .5 - textObject.height * .5);
                else //default
                    ctx.translate(bubbleWidth * .5 - textObject.width * .5, bubbleHeight * .5 - textObject.height * .5);

                textObject.draw(ctx);
                ctx.restore();

                //update rendering offsets
                bubble = settings.bubbles[0]['top'];
                var offsetX = bubble.x - (bubble.radius + lineWidth) * settings.scalingX;
                bubble = settings.bubbles[0]['side'];
                var offsetY = bubble.y + (bubble.radius + lineWidth);
                switch (orientation) {
                    case PocketCode.BubbleOrientation.RIGHT:
                        this.x = 0;
                        this.y = offsetY;
                        break;
                    case PocketCode.BubbleOrientation.LEFT:
                        this.x = -width;
                        this.y = offsetY;
                        break;
                    case PocketCode.BubbleOrientation.TOPRIGHT:
                        this.x = -offsetX;
                        this.y = height;
                        break;
                    case PocketCode.BubbleOrientation.TOPLEFT:
                        this.x = offsetX - width;
                        this.y = height;
                        break;
                }
            },
            _drawSpeechBubble: function () {

                var lineWidth = this._lineWidth,
                    radius = this._radius,
                    tail = this._tail,
                    orientation = this._orientation,
                    canvas = this._cacheCanvas,
                    ctx = this._cacheCtx;

                var textObject = this._textObject,
                    bubbleWidth = Math.max(this._minWidth, textObject.width + this._textPadding.left + this._textPadding.right + 2 * lineWidth),
                    bubbleHeight = Math.max(this._minHeight, textObject.height + this._textPadding.top + this._textPadding.bottom + 2 * lineWidth);

                //set canvas size
                var width = bubbleWidth,
                    height = bubbleHeight + tail.height;
                if (orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT) {
                    width = bubbleWidth + tail.height;
                    height = bubbleHeight;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.save(); //save initial state

                //styles
                ctx.fillStyle = this._fillStyle;
                ctx.strokeStyle = this._strokeStyle;
                ctx.lineWidth = lineWidth;

                //flip X (horizontal)
                if (orientation == PocketCode.BubbleOrientation.LEFT || orientation == PocketCode.BubbleOrientation.TOPLEFT) {
                    ctx.translate(canvas.width + .5, 0);
                    ctx.scale(-1, 1);
                }

                //draw bubble
                if (orientation == PocketCode.BubbleOrientation.LEFT || orientation == PocketCode.BubbleOrientation.RIGHT)
                    ctx.translate(tail.height + lineWidth * .5, lineWidth * .5);
                else
                    ctx.translate(lineWidth * .5, lineWidth * .5);

                ctx.beginPath();
                ctx.arc(radius, radius, radius, Math.PI, Math.PI * 1.5);
                ctx.arc(bubbleWidth - lineWidth - radius, radius, radius, Math.PI * 1.5, Math.PI * 2);
                ctx.arc(bubbleWidth - lineWidth - radius, bubbleHeight - lineWidth - radius, radius, 0, Math.PI * .5);

                if (orientation == PocketCode.BubbleOrientation.TOPLEFT || orientation == PocketCode.BubbleOrientation.TOPRIGHT) {
                    //draw tail at bottom left
                    ctx.lineTo(tail.offset + tail.width, bubbleHeight - lineWidth);
                    ctx.lineTo(tail.offset - tail.indent, height - lineWidth);
                    ctx.lineTo(tail.offset, bubbleHeight - lineWidth);
                }
                ctx.arc(radius, bubbleHeight - lineWidth - radius, radius, Math.PI * .5, Math.PI);

                if (orientation == PocketCode.BubbleOrientation.LEFT || orientation == PocketCode.BubbleOrientation.RIGHT) {
                    //draw tail at the left side
                    ctx.lineTo(0, tail.offset + tail.width);
                    ctx.lineTo(-tail.height, tail.offset + tail.width + tail.indent);
                    ctx.lineTo(0, tail.offset);
                }

                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                //restore initial
                ctx.restore();

                //draw text
                ctx.save();
                if (orientation === PocketCode.BubbleOrientation.RIGHT)
                    ctx.translate(tail.height + bubbleWidth * .5 - textObject.width * .5, bubbleHeight * .5 - textObject.height * .5);
                else //default
                    ctx.translate(bubbleWidth * .5 - textObject.width * .5, bubbleHeight * .5 - textObject.height * .5);

                textObject.draw(ctx);
                ctx.restore();

                //update rendering offsets
                var offsetX = tail.offset - tail.indent;
                var offsetY = tail.offset + tail.width + tail.indent;
                switch (orientation) {
                    case PocketCode.BubbleOrientation.RIGHT:
                        this.x = 0;
                        this.y = offsetY;
                        break;
                    case PocketCode.BubbleOrientation.LEFT:
                        this.x = -width;
                        this.y = offsetY;
                        break;
                    case PocketCode.BubbleOrientation.TOPRIGHT:
                        this.x = -offsetX;
                        this.y = height;
                        break;
                    case PocketCode.BubbleOrientation.TOPLEFT:
                        this.x = offsetX - width;
                        this.y = height;
                        break;
                }
            },
            //_recalculateBubblePosition: function (screenSize, boundary, canvas) {

            //    //Screensize
            //    var screenWidth = screenSize.width(),
            //        screenHeight = screenSize.height();
            //    //x/y coordinates of Boundary top
            //    var topY = boundary.top(),
            //        bottomY = boundary.bottom(),
            //        rightX = boundary.right(),
            //        leftX = boundary.left();

            //    //unnötig wenn canvas übergeben wird
            //    //this._calculateBubbleSize(textWidth, textHeight);

            //    var bWidth = canvas.width,
            //        bHeight = canvas.height;

            //    /*
            //    //Sprite size
            //    var sWidth, sHeight;

            //    if (leftX > 0 && rightX > 0)
            //        sWidth = rightX - leftX;
            //    else if (rightX < 0 && leftX < 0)
            //        sWidth = Math.abs(leftX) - Math.abs(rightX);
            //    else
            //        sWidth = Math.abs(rightX) + Math.abs(leftX);

            //    if (bottomY > 0 && topY > 0)
            //        sHeight = topY - bottomY;
            //    else if (topY < 0 && bottomY < 0)
            //        sHeight = Math.abs(bottomY) - Math.abs(topY);
            //    else
            //        sHeight = Math.abs(topY) + Math.abs(bottomY);
            //    */

            //    //Offset for bubbles
            //    var bOffsetSide,
            //        bOffsetBottom,
            //        radius = 15,
            //        type = this._type;

            //    if (type === PocketCode.Ui.BubbleType.THINK) {
            //        bOffsetSide = 3 * radius + 2 * 2; //radius + linewidth
            //        bOffsetBottom = 2 * radius + 2 * 2;
            //    }
            //    if (type === PocketCode.Ui.BubbleType.SPEECH) {
            //        bOffsetSide = radius / 2 + 2 * 2;
            //        bOffsetBottom = radius + 2 * 2;
            //    }

            //    var bPosition = {
            //        x: 0,
            //        y: 0,
            //    };

            //    //Checks textObject get the Position and Orientation
            //    //Height & width checks standard
            //    if ((topY > 0 && (topY + bHeight) < (screenHeight / 2)) || (topY < 0 && (topY + bHeight) < screenHeight)) {
            //        //right
            //        if (rightX > 0 && (rightX + bWidth) < (screenWidth / 2)) {
            //            this.orientation = PocketCode.BubbleOrientation.LEFT;
            //            bPosition.x = rightX + bWidth / 2;
            //            bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
            //        }
            //            //right screenWidth überschritten
            //        else if ((rightX + bWidth) > (screenWidth / 2)) {
            //            this.orientation = PocketCode.BubbleOrientation.RIGHT;
            //            bPosition.x = leftX - bWidth / 2;
            //            bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
            //        }
            //            //left
            //        else if (leftX < 0 && (Math.abs(leftX) + bWidth) < (screenWidth / 2)) {
            //            this.orientation = PocketCode.BubbleOrientation.RIGHT;
            //            bPosition.x = leftX - bWidth / 2;
            //            bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
            //        }
            //            //left screenWidth überschritten
            //        else if ((Math.abs(leftX) + bWidth) > (screenWidth / 2)) {
            //            this.orientation = PocketCode.BubbleOrientation.LEFT;
            //            bPosition.x = rightX + bWidth / 2;
            //            bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
            //        }
            //    }
            //        //Height & width checks, bubbleHeight > screen
            //    else if (topY > 0 && (topY + bHeight) >= (screenHeight / 2)) {
            //        if (((rightX + bOffsetSide + bWidth) < (screenWidth / 2)) && rightX > 0) {
            //            this.orientation = PocketCode.BubbleOrientation.TOPLEFT;
            //            bPosition.x = rightX + (bWidth + bOffsetSide) / 2;
            //            bPosition.y = (5 / 8) * topY;
            //        }
            //        else if ((rightX + bOffsetSide + bWidth) < (screenWidth / 2)) {
            //            this.orientation = PocketCode.BubbleOrientation.TOPRIGHT;
            //            bPosition.x = leftX - (bWidth + bOffsetSide) / 2;
            //            bPosition.y = (5 / 8) * topY;
            //        }
            //        else if (leftX < 0 && (Math.abs(leftX) + bOffsetSide + bWidth) < (screenWidth / 2)) {
            //            this.orientation = PocketCode.BubbleOrientation.TOPRIGHT;
            //            bPosition.x = leftX - (bWidth + bOffsetSide) / 2;
            //            bPosition.y = (5 / 8) * topY;
            //        }
            //        else if ((Math.abs(leftX) + bOffsetSide + bWidth) > (screenWidth / 2)) {
            //            this.orientation = PocketCode.BubbleOrientation.TOPLEFT;
            //            bPosition.x = rightX + (bWidth + bOffsetSide) / 2;
            //            bPosition.y = (5 / 8) * topY;
            //        }
            //    }

            //    //Position of bubble with offset
            //    //TODO this.bubblePosition.set(bPosition.x, bPosition.y);
            //    this.x = bPosition.x;
            //    this.y = bPosition.y;
            //},

            /* override */
            //_draw: function (ctx, maxWidth) {
            //    ctx.drawImage(this._cacheCanvas, -this._offsetX, -this._offsetY);
            //},
        });

        return RenderingBubble;
    })(),

    RenderingSprite: (function () {
        RenderingSprite.extends(PocketCode.RenderingItem, false);

        function RenderingSprite(propObject) {
            PocketCode.RenderingItem.call(this, propObject);

            this._width = 0;
            this._height = 0;

            this._penColor = {}; //= { r: undefined, g: undefined, b: undefined };  //default values are only defined on sprite/bricks
            this._shadow = false;

            this.graphicEffects = propObject.graphicEffects || [];

            this._bubble = new PocketCode.RenderingBubble();
            delete propObject.id;   //already set, deleted textObject avaoid error on merge as id isn't a public property
            this.merge(propObject); //all parameters have the same names as the public interface (setter)- merge will set them all
        }

        //properties
        Object.defineProperties(RenderingSprite.prototype, {
            isBackground: {
                value: false,
                writable: true,
            },
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
            boundary: {
                value: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                writable: true,
            },
            scaling: {
                value: 1.0,
                writable: true,
            },
            rotation: {
                value: 0.0,
                writable: true,
            },
            flipX: {
                value: false,
                writable: true,
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
                        ctx = this._cacheCtx;

                    if (width == 0 || height == 0)  //textObject avoid errors when drawing an image mit height/width = 0
                        return;

                    cache.width = width;
                    cache.height = height;
                    //reseet image cache textObject original iamge and re-apply filters 
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    if (filters.length > 0)
                        PocketCode.ImageHelper.setFilters(cache, filters);
                },
            },
            penDown: {
                value: false,
                writable: true,
            },
            penSize: {
                value: undefined,   //default values are defined on sprite/bricks only
                writable: true,
            },
            penColor: { //providing a setter/getter is important textObject make sure the object is merged correctly
                get: function () {
                    return this._penColor;
                },
                set: function (rgb) {
                    this._penColor = rgb;
                },
            },
            penX: {
                value: 0.0,
                writable: true,
            },
            penY: {
                value: 0.0,
                writable: true,
            },
            bubble: {
                set: function (value) {
                    this._bubble.merge(value);
                }
            }
        });

        //methods
        RenderingSprite.prototype.merge({
            containsPoint: function (point) {
                if (!this._originalCanvas || !this.visible || (this._width === 0 && this._height === 0))
                    return false;

                var w2 = this.scaling * this._width * .5,
                    h2 = this.scaling * this._height * .5,
                    top = this.y + h2,
                    right = this.x + w2,
                    bottom = this.y - h2,
                    left = this.x - w2;

                if (this.rotation) {
                    //rotate point back (instead of rotating image which will result in a bigger boundary
                    var rad = -this.rotation * (Math.PI / 180.0);
                    var centerToPoint = { x: point.x - this.x, y: point.y - this.y };
                    point = {
                        x: centerToPoint.x * Math.cos(rad) - centerToPoint.y * Math.sin(rad) + this.x,
                        y: centerToPoint.x * Math.sin(rad) + centerToPoint.y * Math.cos(rad) + this.y,
                    };
                }

                return (point.x >= left && point.x <= right && point.y <= top && point.y >= bottom);
                //please notice: toFixed() is a string formatting function and returns a string- try not textObject convert numbers textObject strings textObject number during calculations
            },
            drawBubble:function(ctx){
                ctx.save();
                var x = this.x + this.boundary.right,
                    y = -this.y - this.boundary.top;  //TODO: demo only

                ctx.translate(x, y); //move to sprites position
                //TODO: calc bubble tail position based on boundaries
                this._bubble.draw(ctx);
                ctx.restore();
            },
            /* override */
            _draw: function (ctx) {
                if (!this._originalCanvas || (this._width === 0 && this._height === 0))
                    return;

                ctx.save();
                ctx.translate(this.x, -this.y);

                ctx.rotate(this.rotation * Math.PI / 180.0);
                ctx.scale(
                    this.scaling * (this.flipX ? -1.0 : 1.0),
                    this.scaling
                );

                ctx.globalAlpha = this._cacheCtx.globalAlpha;
                if (this._shadow) {
                    ctx.shadowOffsetX = 6;
                    ctx.shadowOffsetY = 6;
                    ctx.shadowBlur = .5;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                }
                /*this._cacheCanvas && */ctx.drawImage(this._cacheCanvas, -this._width * .5, -this._height * .5, this._width, this._height);  //TODO: TopLeft2PhysicsCenter
                ctx.restore();
            },
        });

        return RenderingSprite;
    })(),

});
