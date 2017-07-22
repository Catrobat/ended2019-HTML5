/// <reference path="i18nProvider.js" />
'use strict';

PocketCode.RenderingItem = (function () {

    function RenderingItem(propObject) {    //{ id: s01, x: 0, y: 0, visible: false }

        propObject = propObject || {};
        //if (!propObject || !propObject.id)
        //    throw new Error('The rendering item has to be initialized using an id');

        this._id = propObject.id;
        delete propObject.id;
        this.x = propObject.x || 0.0;
        this.y = propObject.y || 0.0;
        this.visible = propObject.visible != undefined ? propObject.visible : true;

        this._cacheCanvas = document.createElement('canvas');
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
                return;
            this._draw(ctx);
        },
        _draw: function (ctx) {
            var canvas = this._cacheCanvas,
                width = canvas.width,
                height = canvas.height;
            if (width === 0 && height === 0)
                return; //drawing a canvas with size = 0 will throw an error

            ctx.save();
            ctx.translate(this.x, -this.y);
            ctx.drawImage(canvas, 0, 0, width, height);
            ctx.restore();
        },
    });

    return RenderingItem;
})();


PocketCode.merge({

    RenderingText: (function () {
        RenderingText.extends(PocketCode.RenderingItem, false);

        function RenderingText(propObject) {    //{ id: v, text: vars[v].toString(), x: 0, y: 0, visible: false }
            PocketCode.RenderingItem.call(this, propObject);

            propObject = propObject || {};
            this._UNDEFINED_TEXT = '';  //add a string to show if text (variable) is undefined/uninitialized
            //^^ this may be a PocketCode.Core.I18nString Object to support i18n
            this._objectId = propObject.objectId;   //var ids not unique due to cloning: the id is the sprite (local scope) or project (global scope) id
            delete propObject.objectId;
            this._textAlign = propObject.textAlign || 'left';
            delete propObject.textAlign;

            this.merge(propObject);
            //this.text = propObject.text;
            //this._fontFamily = 'Arial';
            //this._fontSize = 46;
            //this._fontWeight = 'bold';
            //this._fontStyle = '';
            //this._lineHeight = 54;
        }

        //properties
        Object.defineProperties(RenderingText.prototype, {
            objectId: {
                get: function () {
                    return this._objectId;
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
            text: {
                //get: function (value) {
                //    return this._text;
                //},
                set: function (value) {
                    var text = this._UNDEFINED_TEXT.toString();
                    if (value)
                        text = value.toString();

                    if (this._text == text)
                        return;
                    this._text = text;
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
                value: undefined,
                writable: true,
            },
            //textAlign: {
            //    value: 'left',
            //    writable: true,
            //},
        });

        //methods
        RenderingText.prototype.merge({
            _getTextBlock: function () {
                var block = {
                    width: 0,
                    height: 0,
                    lines: [],
                };
                var ctx = this._cacheCtx,
                    maxLineWidth = this.maxLineWidth,
                    textLines = this._text.split(/\r?\n/),
                    line,// = '',
                    metrics;

                if (!maxLineWidth) {
                    for (var i = 0, l = textLines.length; i < l; i++) {
                        line = textLines[i].trim();
                        metrics = ctx.measureText(line);
                        block.lines.push(line);
                        block.width = Math.max(block.width, metrics.width);
                    }

                }
                else {  //split lines and words to fit maxLineWidth
                    var words,
                        testLine = '';

                    for (var i = 0, l = textLines.length; i < l; i++) {
                        line = textLines[i].trim();
                        if (line.length == 0) { //empty lines
                            block.lines.push(line);
                            continue;
                        }

                        words = line.split(' ');
                        for (var n = 0, wl = words.length; n < wl; n++) {
                            testLine += words[n];
                            metrics = ctx.measureText(testLine);
                            if (metrics.width < maxLineWidth) {
                                line = testLine;
                                testLine += ' ';
                            }
                            else if (line == '') {  //word does not fit but line is empty: break word
                                var chars = Math.floor(maxLineWidth / metrics.width * testLine.length) - 3, //-3 to make sure the resulting word fits
                                    splitWord = testLine.substr(0, chars);
                                block.lines.push(splitWord);
                                metrics = ctx.measureText(splitWord);
                                block.width = Math.max(block.width, metrics.width);
                                words[n] = testLine.substring(chars + 1, testLine.length);
                                n--;
                                testLine = '';
                            }
                            else {
                                block.lines.push(line);
                                block.width = Math.max(block.width, metrics.width);
                                testLine = '';
                            }

                        }
                    }
                }

                block.height = block.lines.length * this.lineHeight - (this.lineHeight - this.fontSize);
                return block;
            },
            //_drawTextBlock: function (ctx, maxWidth, x, y) {
            //    x = x || this.x;
            //    y = -y || -this.y;
            //    var newLines = this._text.split(/\r?\n/),
            //        line = '',
            //        //lineWidth = 0,
            //        testLine = '',
            //        metrics;//,
            //    //maxLineWidth = 0;

            //    for (var i = 0, l = newLines.length; i < l; i++) {
            //        var words = newLines[i].trim().split(' ');

            //        var wl = words.length;
            //        if (wl > 0) {
            //            for (var n = 0; n < wl; n++) {
            //                testLine += words[n];// + ' ');
            //                metrics = ctx.measureText(testLine);
            //                //preLineWidth = lineWidth;

            //                if (!maxWidth || maxWidth && metrics.width < maxWidth || line.length == 0) {
            //                    line = (testLine += ' ');
            //                    //lineWidth = metrics.width;
            //                    //maxLineWidth = Math.max(maxLineWidth, lineWidth);
            //                }
            //                else {
            //                    ctx.fillText(line.trim(), x, y);
            //                    //maxLineWidth = Math.max(maxLineWidth, lineWidth);
            //                    //lineWidth = metrics.width - lineWidth;
            //                    y -= this._lineHeight;
            //                    line = testLine = words[n] + ' ';
            //                    //testLine = '';
            //                    //lineWidth = metrics.width;
            //                }
            //                //lineWidth = metrics.width;
            //            }
            //            ctx.fillText(line.trim(), x, y);
            //            //maxLineWidth = Math.max(maxLineWidth, lineWidth);
            //            //lineWidth = 0;
            //            testLine = '';
            //        }
            //        y -= this._lineHeight;
            //    }
            //    //return { width: Math.ceil(maxLineWidth), height: y - lineHeight };
            //},
            _redrawCache: function () {
                var canvas = this._cacheCanvas,
                    ctx = this._cacheCtx;

                ctx.save();
                ctx.textBaseline = 'top';   //'hanging';
                ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + 'px' + ' ' + this.fontFamily;

                var textBlock = this._getTextBlock(); //{ width: ?, height: ?, lines: [] }
                canvas.width = textBlock.width;
                canvas.height = textBlock.height;

                var dir = PocketCode.I18nProvider.getTextDirection(this._text);
                canvas.dir = dir;
                //if(this._textAlign == 'center')
                //    ctx.moveTo(textBlock.width * 0.5, 0);
                /*else*/ if (dir == PocketCode.Ui.Direction.RTL) {
                    //ctx.moveTo(textBlock.width, 0);
                    ctx.translate(textBlock.width, 0);
                    ctx.textAlign = 'right';
                }

                //draw
                var textLines = textBlock.lines,
                    yOffset;
                for (var i = 0, l = textLines.length; i < l; i++) //{
                    //yOffset = /*this._fontSize * */this._lineHeight * i;
                    ctx.fillText(textLines[i], 0, this._lineHeight * i);
                //    ctx.fillText(textLines[i], this.x, -this.y - heightOfLine);
                //}
                ctx.restore();
            },
            /* override */
            //_draw: function (ctx, maxWidth) {
            //    if (this._text === '')
            //        return;

            //    ctx.textBaseline = 'top';   //'hanging';
            //    ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + 'px' + ' ' + this.fontFamily;

            //    var text = this._text;
            //    var lineFeeds = text.split(/\r?\n/).length > 1,
            //        rtl = PocketCode.I18nProvider.getTextDirection(text) == PocketCode.Ui.Direction.RTL;

            //    if (lineFeeds || maxWidth) {
            //        //if (rtl) {
            //        //    var size = this._getTextBlockSize(ctx, maxWidth, rtl);
            //        //    this._drawTextBlock(ctx, maxWidth, rtl, this.x + size.width);
            //        //}
            //        //else
            //        this._drawTextBlock(ctx, maxWidth);
            //    }
            //    else //draw in one line
            //        ctx.fillText(text, this.x, -this.y);

            //    //if maxWidth: check for breaks
            //    //if rtl: and breaks

            //    //// wrap lines
            //    //var newline = /\r?\n/;
            //    //var textLines = this._text.split(newline);

            //    //for (var i = 0, len = textLines.length; i < len; i++) {
            //    //    var heightOfLine = this._fontSize * this._lineHeight * i;
            //    //    ctx.fillText(textLines[i], this.x, -this.y - heightOfLine);
            //    //}
            //},
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
        RenderingBubble.extends(PocketCode.RenderingItem/*, false*/);

        function RenderingBubble() {
            //PocketCode.RenderingItem.call(this);

            //definition
            this._lineWidth = 6,
            this._strokeStyle = '#a0a0a0',
            this._fillStyle = '#ffffff';
            this._type = PocketCode.Ui.BubbleType.SPEECH;
            this._orientation = PocketCode.BubbleOrientation.TOPRIGHT;

            this._textObject = new PocketCode.RenderingText({ fontWeight: 'normal', fontSize: 31, lineHeight: 36, textAlign: 'center', maxLineWidth: 270 });
            //propObject = propObject || {};
            this._offsetX = 0;
            this._offsetY = 0;

            //Todo: offset scaling
            //this._positionX = 0;
            //this._positionY = 0;
            //this._width = 0;
            //this._height = 0;

        }

        //properties
        Object.defineProperties(RenderingBubble.prototype, {
            screenSize: {
                value: { width: 0, height: 0 },
                writable: true,
            },
            type: {
                set: function (value) {
                    this._type = type;
                    this._redrawCache();
                },
            },
            orientation: {
                set: function (value) {
                    this._orientation = type;
                    this._redrawCache();
                },
            },
            offsetX: {
                get: function () {
                    return this._offsetX;
                }
            },
            offsetY: {
                get: function () {
                    return this._offsetY;
                }
            },
            text: {
                //Todo:
                set: function (value) {
                    this._textObject.text = value;
                    this._redrawCache();
                    //if (!value)
                    //  this._text = this._UNDEFINED_TEXT.toString();
                    //else if (typeof value == 'number' && Math.round(value) == value)
                    //    this._text = value.toString() + '.0';   //include 1 decimal for integers
                    //else
                    //  this._text = value.toString();
                },
            },
            /*
            bubblePosition: {
                set: function (x, y) {
                    //Todo:
                    if (isNaN(x) || isNaN(y))
                        throw new Error('invalid argument: position');
    
                    this._positionX = x;
                    this._positionY = y;
                },
    
            },
            orientation: {
                set: function (orientation) {
                    this._orientation = orientation;
                },
                get: function () {
                    return this._orientation;
                }
            },
            //unnötig wenn an recalculateBubbleposition canvas übergeben wird
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
            },
            
            bubblePositionX: {
                get: function () {
                    return this._positionX;
                }
            },
            bubblePositionY: {
                get: function () {
                    return this._positionY;
                }
            },*/
        });

        //methods
        RenderingBubble.prototype.merge({
            _redrawCache: function () {
                //Todo: type Abfrage und think oder speak aufrufen
                //var bType = this.bubbleType.get();
                var type = this._type;
                //var bX = this.bubblePositionX.get();
                //var bY = this.bubblePositionY.get();

                if (type === PocketCode.Ui.BubbleType.SPEECH) {
                    this._drawSpeechBubble();
                }
                else if (type === PocketCode.Ui.BubbleType.THINK) {
                    this._drawThinkBubble();
                }

                //Todo: leere Bubbles werden nicht angezeigt
                //      bricksLook.js behandelt das


            },
            _drawThinkBubble: function (canvas) {

                var radius = 15;
                var minHeight = 50;
                var minWidth = 75;

                var orientation = this._orientation;

                var bubbleHeight = canvas.height;
                var bubbleWidth = canvas.width;

                var height = Math.max(minHeight, bubbleHeight);
                var width = Math.max(minWidth, bubbleWidth);

                var offsetSide = 3 * radius + 2 * canvas.lineWidth;
                var offsetBottom = 2 * radius + 2 * canvas.lineWidth;

                //Todo
                if (orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT) {
                    canvas.width = width;
                    canvas.height = height + offsetBottom;

                    var ctx = canvas.getContext('2d');

                    if (orientation === PocketCode.BubbleOrientation.RIGHT) {
                        //Spiegeln
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }
                    //Start
                    ctx.beginPath();
                    //Path Begin Top Left Curve
                    ctx.moveTo(0, radius);
                    ctx.quadraticCurveTo(0, ctx.lineWidth, radius, ctx.lineWidth);
                    //Line to Top Right Curve
                    ctx.lineTo(width - radius + ctx.lineWidth, ctx.lineWidth);
                    ctx.quadraticCurveTo(width + ctx.lineWidth, ctx.lineWidth, width + ctx.lineWidth, radius);
                    //Line to Bottom Right Curve
                    ctx.lineTo(width + ctx.lineWidth, height - radius + ctx.lineWidth);
                    ctx.quadraticCurveTo(width + ctx.lineWidth, height + ctx.lineWidth, width - radius + ctx.lineWidth, height + ctx.lineWidth);
                    //Line to left site
                    ctx.lineTo(radius, height + ctx.lineWidth);
                    //Last Curve and Ending Line for Think Bubble
                    ctx.quadraticCurveTo(0, height + ctx.lineWidth, 0, height - radius + ctx.lineWidth);
                    ctx.lineTo(0, radius);

                    ctx.stroke();
                    ctx.closePath();

                    ctx.save();
                    ctx.scale(0.75, 0.5);
                    ctx.beginPath();
                    ctx.arc(width * (3 / 8) + radius, height * (17 / 8) + radius, radius, Math.PI * 2, false);
                    ctx.restore();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.save();
                    ctx.scale(0.75, 0.5);
                    ctx.beginPath();
                    ctx.arc(width * (1 / 8) + radius / 2, height * (20 / 8) + radius, radius / 2, Math.PI * 2, false);
                    ctx.restore();
                    ctx.stroke();
                    ctx.closePath();
                    //ctx.fillText();
                }
                else {
                    canvas.width = width + offsetSide;
                    canvas.height = height;

                    var ctx = canvas.getContext('2d');

                    if (orientation === PocketCode.BubbleOrientation.TOPRIGHT) {
                        //Spiegeln
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }
                    //Start
                    ctx.beginPath();
                    //Path Begin Top Left Curve
                    ctx.moveTo(radius * (5 / 2), radius);
                    ctx.quadraticCurveTo(radius * (5 / 2), ctx.lineWidth, radius * (7 / 2), ctx.lineWidth);
                    //Line to Top Right Curve
                    ctx.lineTo(width + radius * (5 / 2) - radius + ctx.lineWidth, ctx.lineWidth);
                    ctx.quadraticCurveTo(width + radius * (5 / 2) + ctx.lineWidth, ctx.lineWidth, width + radius * (5 / 2) + ctx.lineWidth, radius);
                    //Line to Bottom Right Curve
                    ctx.lineTo(width + radius * (5 / 2) + ctx.lineWidth, height - radius + ctx.lineWidth);
                    ctx.quadraticCurveTo(width + radius * (5 / 2) + ctx.lineWidth, height + ctx.lineWidth, width + radius * (5 / 2) - radius + ctx.lineWidth, height + ctx.lineWidth);
                    //Line to left site
                    ctx.lineTo(radius * (7 / 2), height + ctx.lineWidth);
                    //Last Curve and Ending Line for Think Bubble
                    ctx.quadraticCurveTo(radius * (5 / 2), height + ctx.lineWidth, radius * (5 / 2), height - radius + ctx.lineWidth);
                    ctx.lineTo(radius * (5 / 2), radius);
                    ctx.stroke();
                    ctx.closePath();

                    if (height <= 50) {
                        ctx.save();
                        ctx.scale(0.75, 0.5);
                        ctx.beginPath();
                        ctx.arc(radius * (17 / 8), radius / 2 + height * (3 / 8), radius, Math.PI * 2, false);
                        ctx.restore();
                        ctx.stroke();
                        ctx.closePath();

                        ctx.save();
                        ctx.scale(0.75, 0.5);
                        ctx.beginPath();
                        ctx.arc(radius * (6 / 8), radius / 2 + height * (6 / 8), radius / 2, Math.PI * 2, false);
                        ctx.restore();
                        ctx.stroke();
                        ctx.closePath();
                    }
                    else {
                        ctx.save();
                        ctx.scale(0.75, 0.5);
                        ctx.beginPath();
                        ctx.arc(radius * (17 / 8), radius / 2 + height * (3 / 8), radius, Math.PI * 2, false);
                        ctx.restore();
                        ctx.stroke();
                        ctx.closePath();

                        ctx.save();
                        ctx.scale(0.75, 0.5);
                        ctx.beginPath();
                        ctx.arc(radius * (6 / 8), radius / 2 + height * (4 / 8), radius / 2, Math.PI * 2, false);
                        ctx.restore();
                        ctx.stroke();
                        ctx.closePath();
                    }
                    //ctx.fillText();
                }
            },
            _drawSpeechBubble: function (canvas) {

                var radius = 15;
                var minHeight = 50;
                var minWidth = 75;

                var orientation = this._orientation;

                var bubbleHeight = canvas.height;
                var bubbleWidth = canvas.width;

                var height = Math.max(minHeight, bubbleHeight);
                var width = Math.max(minWidth, bubbleWidth);

                var offsetSide = radius / 2 + 2 * ctx.lineWidth;
                var offsetBottom = radius + 2 * ctx.lineWidth;

                //Todo
                if (orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT) {
                    canvas.width = width;
                    canvas.height = height + offsetBottom;

                    var ctx = canvas.getContext('2d');

                    if (orientation === PocketCode.BubbleOrientation.RIGHT) {
                        //Spiegeln
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }
                    //Start
                    ctx.beginPath();
                    //Path Begin Top Left Curve
                    ctx.moveTo(0, radius);
                    ctx.quadraticCurveTo(0, 0, radius, 0);
                    //Line to Top Right Curve
                    ctx.lineTo(width - radius, 0);
                    ctx.quadraticCurveTo(width, 0, width, radius);
                    //Line to Bottom Right Curve
                    ctx.lineTo(width, height - radius);
                    ctx.quadraticCurveTo(width, height, width - radius, height);
                    //Mini Line before Think edge
                    ctx.lineTo(width * (3 / 8) + radius / 2, height);
                    ctx.lineTo(width * (3 / 8) - radius * (5 / 4), height + radius);
                    ctx.lineTo(width * (2 / 8) + radius / 2, height);
                    ctx.lineTo(radius, height);
                    //Last Curve and Ending Line for Think Bubble
                    ctx.quadraticCurveTo(0, height, 0, height - radius);
                    ctx.lineTo(0, radius);
                    ctx.stroke();
                    //ctx.fillText();
                }
                else {
                    canvas.width = width + offsetSide;
                    canvas.height = height;

                    var ctx = canvas.getContext('2d');

                    if (orientation === PocketCode.BubbleOrientation.TOPRIGHT) {
                        //Spiegeln
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }
                    //Start
                    ctx.beginPath();
                    //Path Begin Top Left Curve
                    ctx.moveTo(radius * (3 / 2), radius);
                    ctx.quadraticCurveTo(radius * (3 / 2), 0, radius * (5 / 2), 0);
                    //Line to Top Right Curve
                    ctx.lineTo(width + radius * (3 / 2) - radius, 0);
                    ctx.quadraticCurveTo(width + radius * (3 / 2), 0, width + radius * (3 / 2), radius);
                    //Line to Bottom Right Curve
                    ctx.lineTo(width + radius * (3 / 2), height - radius);
                    ctx.quadraticCurveTo(width + radius * (3 / 2), height, width + radius * (3 / 2) - radius, height);
                    //Line to left site
                    ctx.lineTo(radius * (5 / 2), height);
                    //Last Curve and Ending Line for Think Bubble
                    ctx.quadraticCurveTo(radius * (3 / 2), height, radius * (3 / 2), height - radius);

                    if (height <= 50) {
                        ctx.lineTo(0, height);
                        ctx.lineTo(radius * (3 / 2), radius);
                    }
                    else {
                        ctx.lineTo(radius * (3 / 2), height * (3 / 8));
                        ctx.lineTo(0, height * (3 / 8) + radius);
                        ctx.lineTo(radius * (3 / 2), radius);
                    }
                    ctx.stroke();
                    //ctx.fillText();
                }
            },

            _recalculateBubblePosition: function (screenSize, boundary, canvas) {

                //Screensize
                var screenWidth = screenSize.width(),
                    screenHeight = screenSize.height();
                //x/y coordinates of Boundary top
                var topY = boundary.top(),
                    bottomY = boundary.bottom(),
                    rightX = boundary.right(),
                    leftX = boundary.left();

                //unnötig wenn canvas übergeben wird
                //this._calculateBubbleSize(textWidth, textHeight);

                var bWidth = canvas.width,
                    bHeight = canvas.height;

                /*
                //Sprite size
                var sWidth, sHeight;
        
                if (leftX > 0 && rightX > 0)
                    sWidth = rightX - leftX;
                else if (rightX < 0 && leftX < 0)
                    sWidth = Math.abs(leftX) - Math.abs(rightX);
                else
                    sWidth = Math.abs(rightX) + Math.abs(leftX);
        
                if (bottomY > 0 && topY > 0)
                    sHeight = topY - bottomY;
                else if (topY < 0 && bottomY < 0)
                    sHeight = Math.abs(bottomY) - Math.abs(topY);
                else
                    sHeight = Math.abs(topY) + Math.abs(bottomY);
                */

                //Offset for bubbles
                var bOffsetSide,
                    bOffsetBottom,
                    radius = 15,
                    type = this._type;

                if (type === PocketCode.Ui.BubbleType.THINK) {
                    bOffsetSide = 3 * radius + 2 * 2; //radius + linewidth
                    bOffsetBottom = 2 * radius + 2 * 2;
                }
                if (type === PocketCode.Ui.BubbleType.SPEECH) {
                    bOffsetSide = radius / 2 + 2 * 2;
                    bOffsetBottom = radius + 2 * 2;
                }

                var bPosition = {
                    x: 0,
                    y: 0,
                };

                //Checks to get the Position and Orientation
                //Height & width checks standard
                if ((topY > 0 && (topY + bHeight) < (screenHeight / 2)) || (topY < 0 && (topY + bHeight) < screenHeight)) {
                    //right
                    if (rightX > 0 && (rightX + bWidth) < (screenWidth / 2)) {
                        this.orientation = PocketCode.BubbleOrientation.LEFT;
                        bPosition.x = rightX + bWidth / 2;
                        bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
                    }
                        //right screenWidth überschritten
                    else if ((rightX + bWidth) > (screenWidth / 2)) {
                        this.orientation = PocketCode.BubbleOrientation.RIGHT;
                        bPosition.x = leftX - bWidth / 2;
                        bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
                    }
                        //left
                    else if (leftX < 0 && (Math.abs(leftX) + bWidth) < (screenWidth / 2)) {
                        this.orientation = PocketCode.BubbleOrientation.RIGHT;
                        bPosition.x = leftX - bWidth / 2;
                        bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
                    }
                        //left screenWidth überschritten
                    else if ((Math.abs(leftX) + bWidth) > (screenWidth / 2)) {
                        this.orientation = PocketCode.BubbleOrientation.LEFT;
                        bPosition.x = rightX + bWidth / 2;
                        bPosition.y = (bHeight + bOffsetBottom) / 2 + (topY - bOffsetBottom);
                    }
                }
                    //Height & width checks, bubbleHeight > screen
                else if (topY > 0 && (topY + bHeight) >= (screenHeight / 2)) {
                    if (((rightX + bOffsetSide + bWidth) < (screenWidth / 2)) && rightX > 0) {
                        this.orientation = PocketCode.BubbleOrientation.TOPLEFT;
                        bPosition.x = rightX + (bWidth + bOffsetSide) / 2;
                        bPosition.y = (5 / 8) * topY;
                    }
                    else if ((rightX + bOffsetSide + bWidth) < (screenWidth / 2)) {
                        this.orientation = PocketCode.BubbleOrientation.TOPRIGHT;
                        bPosition.x = leftX - (bWidth + bOffsetSide) / 2;
                        bPosition.y = (5 / 8) * topY;
                    }
                    else if (leftX < 0 && (Math.abs(leftX) + bOffsetSide + bWidth) < (screenWidth / 2)) {
                        this.orientation = PocketCode.BubbleOrientation.TOPRIGHT;
                        bPosition.x = leftX - (bWidth + bOffsetSide) / 2;
                        bPosition.y = (5 / 8) * topY;
                    }
                    else if ((Math.abs(leftX) + bOffsetSide + bWidth) > (screenWidth / 2)) {
                        this.orientation = PocketCode.BubbleOrientation.TOPLEFT;
                        bPosition.x = rightX + (bWidth + bOffsetSide) / 2;
                        bPosition.y = (5 / 8) * topY;
                    }
                }

                //Position of bubble with offset
                //TODO this.bubblePosition.set(bPosition.x, bPosition.y);
                this.x = bPosition.x;
                this.y = bPosition.y;
            },

            /*
            _calculateBubbleSize: function (textWidth, textHeight) {
        
                var radius = 15;
                var minHeight = 50;
                var minWidth = 75;
        
                var tmpHeight = textHeight + radius * 2;
                var tmpWidth = textWidth + radius * 2;
        
                var height = Math.max(minHeight, tmpHeight),
                    width = Math.max(minWidth, tmpWidth);
        
                this.bubbleWidth.set(width);
                this.bubbleHeight.set(height);
        
            },*/

            /* override */
            _draw: function (ctx, maxWidth) {
                //TODO: have a look at our prototyping branch for a speech bubble example


            },
        });

        return RenderingBubble;
    })(),

    RenderingSprite: (function () {
        RenderingSprite.extends(PocketCode.RenderingItem, false);

        function RenderingSprite(propObject) {
            PocketCode.RenderingItem.call(this, propObject);

            this._width = 0;
            this._height = 0;

            //this._scaling = 1.0;
            this._flipX = false;
            //this._rotation = 0.0;
            this._shadow = false;

            this.penDown = false;
            this._penColor; //= { r: undefined, g: undefined, b: undefined };  //default values are only defined on sprite/bricks

            this.graphicEffects = propObject.graphicEffects || [];

            this._bubble = new PocketCode.RenderingBubble();
            delete propObject.id;   //already set, deleted to avaoid error on merge as id isn't a public property
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

                    cache.width = width;
                    cache.height = height;
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
                value: undefined,   //default calues are defined on sprite/bricks only
                writable: true,
            },
            penColor: { //providing a setter/getter is important to make sure the object is merged correctly
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
                set: function (value) { //{ bubble: { type: type, text: text, visible: true } }
                    this._bubble.merge(value);
                    ////TOdo set bubble properties
                    //this._bubble.visible = value.visible;
                    //if (value.visible) {
                    //    //Todo

                    //}
                    //if (value.text)
                    //    this._bubble.text = value.text;
                    //this._bubble.type = value.type;
                }
            }
        });

        //methods
        RenderingSprite.prototype.merge({
            containsPoint: function (point) {
                if (!this._originalCanvas || !this.visible || (this._width === 0 && this._height === 0))
                    return false;

                var w2 = this.scaling * this._width * 0.5,
                    h2 = this.scaling * this._height * 0.5,
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
                //please notice: toFixed() is a string formatting function and returns a string- try not to convert numbers to strings to number during calculations
            },
            /* override */
            _draw: function (ctx) {
                if (!this._originalCanvas || (this._width === 0 && this._height === 0))
                    return;

                ctx.save();
                ctx.translate(this.x, -this.y);

                ctx.rotate(this.rotation * Math.PI / 180.0);
                ctx.scale(
                    this.scaling * (this._flipX ? -1.0 : 1.0),
                    this.scaling
                );

                ctx.globalAlpha = this._cacheCtx.globalAlpha;
                if (this._shadow) {
                    ctx.shadowOffsetX = 6;
                    ctx.shadowOffsetY = 6;
                    ctx.shadowBlur = 0.5;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                }
                /*this._cacheCanvas && */ctx.drawImage(this._cacheCanvas, -this._width * 0.5, -this._height * 0.5, this._width, this._height);  //TODO: TopLeft2PhysicsCenter
                ctx.restore();
            },
        });

        return RenderingSprite;
    })(),

});
