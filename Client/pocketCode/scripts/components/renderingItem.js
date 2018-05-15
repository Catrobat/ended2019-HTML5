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

            this._scopeId = propObject.scopeId;   //var ids not unique due to cloning: the id is the sprite (local scope) or project (global scope) id
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
                else {  //split lines and words to fit maxLineWidth
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
                                    var chars = Math.max(1, Math.floor(maxLineWidth / metrics.width * words[n].length * 0.97)), //-3% to make sure the resulting word fits
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
                block.height = Math.ceil(block.lines.length * this.lineHeight);// - (this.lineHeight - this.fontSize) * 0.5);
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
                ctx.textAlign = 'left'; //always left even if set to 'center'
                var textBlock = this._getTextBlock(string);
                canvas.width = textBlock.width;//resize sets ctx to default
                canvas.height = textBlock.height;

                ctx.save();
                //apply settings again (due to canvas resize)
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
                        text = '\u202E' + line.text;    //force to RTL text
                        if (this._textAlign != 'center')
                            offset = textBlock.width - line.width;  //make sure all texts are visible and aligned correctly
                    }
                    else
                        text = line.text;

                    //text may be centered (for bubbles)
                    if (this._textAlign == 'center')
                        offset = (textBlock.width - line.width) * 0.5;  //works much better (RTL) than ctx.translate(textBlock.width * 0.5, 0);

                    ctx.fillText(text, offset, this.lineHeight * (i + 0.5));
                }
                ctx.restore();
                this._onCacheUpdate.dispatchEvent({ size: { width: textBlock.width, height: textBlock.height } });
            },
            _onLanguageChangeHandler: function () {
                //wait for the i18nStrings to updated and then redraw the cache: timeout needed because this handler may be called first
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
        RenderingBubble.extends(PocketCode.RenderingItem);

        function RenderingBubble() {

            this._lineWidth = 8;
            this._strokeStyle = '#a0a0a0';
            this._fillStyle = '#ffffff';
            this._type = PocketCode.Ui.BubbleType.SPEECH;
            this._orientation = PocketCode.BubbleOrientation.TOPRIGHT;

            this._radius = 15;
            this._minHeight = 50;
            this._minWidth = 75;

            this._textObject = new PocketCode.RenderingText({ fontWeight: 'normal', fontSize: 31, lineHeight: 36, textAlign: 'center', maxLineWidth: 270 });
            this._textObject.onCacheUpdate.addEventListener(new SmartJs.Event.EventListener(this._redrawCache, this));
            //propObject = propObject || {};
           // this._offsetX = 0;
            //this._offsetY = 0;

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
            _bubblePadding: {
                value: {
                    top:10,
                    bottom:10,
                    left:10,
                    right:10,
                },

            },
            _tail: {
                value : {
                    height : 20,
                    offset : 10,
                    indent : 5,
                    width : 10,
                },
            },
            _thinkBubbles : {
                value: {
                    height : 30,
                    radiusBottom : 4,
                    radiusTop : 7,
                    scaleBottom : 2.1,
                    scaleTop : 2.1,
                    offsetXBottom : 0,
                    offsetXTop : 0,
                    offsetYBottom : 20,
                    offsetYTop : 8,
                    offsetTopBubble : 15

                },
            }



            //,
           /* offsetX: {
                get: function () {
                    return this._offsetX;
                }
            },*/
           /* offsetY: {
                get: function () {
                    return this._offsetY;
                }
            }*/
            ,
            content: {
                //Todo:
                set: function (value) {
                    this._textObject.value = value;
                    //this._redrawCache();
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

                var type = this._type,
                    ctx = this._cacheCanvas;
                //var bX = this.bubblePositionX.get();
                //var bY = this.bubblePositionY.get();

                if (type === PocketCode.Ui.BubbleType.SPEECH) {
                    this._drawSpeechBubble();
                }
                else if (type === PocketCode.Ui.BubbleType.THINK) {
                    this._drawThinkBubble();
                }

                //Todo: empty bubbles not shown: this._textObject.width == 0 || this._textObject.height == 0
                //      bricksLook.js handled in bubble bricks


            },
            _drawThinkBubble: function () {

                var radius = this._radius,
                    minHeight = this._minHeight,
                    minWidth = this._minWidth,
                    orientation = this._orientation,
                    canvas = this._cacheCanvas,
                    ctx = this._cacheCtx;

                var to = this._textObject,
                    bubbleHeight = to.height,
                    bubbleWidth = to.width;

                var height = Math.max(minHeight, bubbleHeight);
                var width = Math.max(minWidth, bubbleWidth);

                var x = this._lineWidth,
                    y = this._lineWidth + radius;
                var pi2 = Math.PI * 2; //Needed for 360 degree



                canvas.width = width + this._lineWidth;
                canvas.height = height + this._thinkBubbles.height  + this._lineWidth;


                if(orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT){

                    height = Math.max(minHeight, bubbleWidth);
                    width = Math.max(minWidth, bubbleHeight);

                    canvas.height = width + this._lineWidth;
                    canvas.width = height + this._thinkBubbles.height  + this._lineWidth + (this._thinkBubbles.radiusBottom + this._thinkBubbles.radiusTop) *0.5;
                    //ctx.save();
                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.rotate(pi2 * 90 / 360);

                    if(orientation === PocketCode.BubbleOrientation.LEFT){
                        ctx.scale(1,-1);
                    }

                    // Move registration point back to the top left corner of canvas
                    ctx.translate(-canvas.height/2 + radius * 0.3, -canvas.width/2+ this._lineWidth * 0.5);

                }else if( orientation === PocketCode.BubbleOrientation.TOPLEFT){

                    //ctx.save();
                    ctx.setTransform(-1,0,0,1,canvas.width ,0);
                    ctx.translate(4,  7);
                }else{
                    //ctx.save();

                    ctx.translate(this._lineWidth * 0.5, radius * 0.5);
                }
                radius = radius - this._lineWidth *0.5;
                ctx.fillStyle = this._fillStyle;
                ctx.strokeStyle= this._strokeStyle;
                ctx.lineWidth = this._lineWidth;
                ctx.save();

                //Bubble
                ctx.beginPath();

                ctx.arc(radius, radius, radius,pi2*0.5 , pi2*0.75);
                ctx.arc(width-radius, radius, radius,  pi2*0.75, pi2);
                ctx.arc(width-radius, height-radius, radius, 0, pi2*0.25);
                ctx.arc(radius, height-radius, radius, pi2*0.25, pi2*0.5);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();



                //Ellipse Bubbles

                ctx.translate(this._thinkBubbles.offsetTopBubble, height+this._thinkBubbles.offsetYTop);

                if(orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT){

                    ctx.rotate(pi2 * 90 / 360);
                }


                // scale context horizontally
                ctx.scale(this._thinkBubbles.scaleTop, 1);

                // draw circle which will be stretched into an oval
                ctx.beginPath();
                ctx.arc(this._thinkBubbles.radiusTop, this._thinkBubbles.radiusTop, this._thinkBubbles.radiusTop, 0, pi2);


                // restore to original state
                ctx.restore();
                ctx.fill();
                ctx.lineWidth = (this._lineWidth*0.5) / Math.max(this._thinkBubbles.scaleTop, this._thinkBubbles.scaleBottom);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();



                //ctx.translate(0, height+this._thinkBubbles.offsetYBottom);

                if(orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT){

                    ctx.translate(28, height+this._thinkBubbles.offsetYBottom);
                    ctx.rotate(pi2 * 90 / 360);
                }else{
                    ctx.translate(0, height+this._thinkBubbles.offsetYBottom);
                }



                ctx.scale(this._thinkBubbles.scaleBottom ,1);
                ctx.beginPath();
                ctx.arc(this._thinkBubbles.radiusBottom, this._thinkBubbles.radiusBottom, this._thinkBubbles.radiusBottom, 0, pi2);
                //End ellispse bubbles
                ctx.closePath();
                // restore to original state
                ctx.restore();
                ctx.fill();
                ctx.stroke();


                //TODO : Add text on Think bubbles
                ctx.restore();
                ctx.save();
                ctx.translate(x + this._bubblePadding.top ,y - this._bubblePadding.left);
                to.draw(ctx);
                ctx.save()
                ctx.restore();








            },
            _drawSpeechBubble: function () {

                var radius = this._radius,
                    minHeight = this._minHeight,
                    minWidth = this._minWidth,
                    orientation = this._orientation,
                    canvas = this._cacheCanvas,
                    ctx = this._cacheCtx;

                var to = this._textObject,
                    bubbleHeight = to.height + this._bubblePadding.top+ this._bubblePadding.bottom,
                    bubbleWidth = to.width + this._bubblePadding.left+ this._bubblePadding.right ;

                var height = Math.max(minHeight, bubbleHeight);
                var width = Math.max(minWidth, bubbleWidth);

                var x = this._lineWidth,
                    y = this._lineWidth + radius;
                var pi2 = Math.PI * 2; //Needed for 360 degree



                 canvas.width = width + this._lineWidth;
                 canvas.height = height + this._tail.height  + this._lineWidth + this._tail.width;


                if(orientation === PocketCode.BubbleOrientation.LEFT || orientation === PocketCode.BubbleOrientation.RIGHT){

                    height = Math.max(minHeight, bubbleWidth);
                    width = Math.max(minWidth, bubbleHeight);

                    canvas.height = width + this._lineWidth;
                    canvas.width = height + this._tail.height  + this._lineWidth + this._tail.width;
                    ctx.save();
                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.rotate(pi2 * 90 / 360);

                    if(orientation === PocketCode.BubbleOrientation.LEFT){
                        ctx.scale(1,-1);
                    }

                    // Move registration point back to the top left corner of canvas
                    ctx.translate(-canvas.height/2 + radius * 0.3, -canvas.width/2+ this._lineWidth * 0.5);

                    this._tail.indent = -(this._tail.indent*4);


                }else if( orientation === PocketCode.BubbleOrientation.TOPLEFT){

                    ctx.save();
                    ctx.setTransform(-1,0,0,1,canvas.width ,0);
                    ctx.translate(4,  7);
                }else{
                    ctx.save();

                    ctx.translate(this._lineWidth * 0.5, radius * 0.5);
                }

                ctx.fillStyle = this._fillStyle;
                ctx.strokeStyle= this._strokeStyle;
                ctx.lineWidth = this._lineWidth;

                radius = radius - this._lineWidth *0.5;
                    //Bubble
                    ctx.beginPath();

                    ctx.arc(radius, radius, radius,pi2*0.5 , pi2*0.75);
                    ctx.arc(width-radius, radius, radius,  pi2*0.75, pi2);
                    ctx.arc(width-radius, height-radius, radius, 0, pi2*0.25);

                    //Tail
                    ctx.lineTo(this._tail.offset + this._tail.width, height);
                    ctx.lineTo( this._tail.offset - this._tail.indent , height + this._tail.height);
                    ctx.lineTo(this._tail.offset  , height);

                    ctx.arc(radius, height-radius, radius, pi2*0.25, pi2*0.5);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();

                    //Text
                    //TODO : improve text layout for LEFT and RIGHT
                    ctx.restore();
                    ctx.save();
                if(orientation === PocketCode.BubbleOrientation.RIGHT) {

                    ctx.translate(x + this._bubblePadding.top + this._tail.height ,y - this._bubblePadding.left);
                }else{

                    ctx.translate(x + this._bubblePadding.top ,y - this._bubblePadding.left);
                }
                    to.draw(ctx);
                    ctx.restore();

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

                ctx.drawImage(this._cacheCanvas, 10,10);


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

            this._penColor = {}; //= { r: undefined, g: undefined, b: undefined };  //default values are only defined on sprite/bricks
            this._shadow = false;

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

                    if (width == 0 || height == 0)  //to avoid errors when drawing an image mit height/width = 0
                        return;

                    cache.width = width;
                    cache.height = height;
                    //reseet image cache to original iamge and re-apply filters 
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
                    this.scaling * (this.flipX ? -1.0 : 1.0),
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
