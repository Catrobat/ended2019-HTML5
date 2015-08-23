/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
'use strict';

/*
 * this class is a helper class including image manipulation logic
 */
PocketCode.ImageHelper = (function () {

    //ctr
    function ImageHelper() {
        this._initialized = false;  //as a static class using DOM elements it's waiting on the first use to initialize
    }

    //methods
    ImageHelper.prototype.merge({
        _checkInitialized: function () {
            if (this._initialized)
                return;

            if (document.readyState === 'complete')
                this._init();
            else
                throw new Error('The static image helper class uses the DOM and cannot be used until loading completed');
        },
        _init: function (e) {
            var canvas = document.createElement('canvas');
            this._canvas = canvas;
            this._ctx = canvas.getContext('2d');

            this._initialized = true;
        },
        scale: function (img, scalingFactor) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            if (!scalingFactor) //=0 is not allowed here
                return img;
            else if (typeof scalingFactor !== 'number')
                throw new Error('invalid paramter: scalingFactor: expected type: number');

            var ih = img.naturalHeight * scalingFactor,
                iw = img.naturalWidth * scalingFactor;
            var ch = Math.ceil(ih),
                cw = Math.ceil(iw)
            this._canvas.height = ch;
            this._canvas.width = cw;

            var ctx = this._ctx;
            ctx.save();
            ctx.scale(scalingFactor, scalingFactor);
            ctx.drawImage(img, (cw - iw) / 2, (ch - ih) / 2);
            var img = new Image();
            img.src = this._canvas.toDataURL();
            ctx.restore();

            return img;
        },
        adjustCenterAndTrim: function (img, /*imgScaling, */rotationCenterX, rotationCenterY, includeBoundingCorners) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            var h = img.naturalHeight,
                w = img.naturalWidth,
                centerOffsetX = 0,
                centerOffsetY = 0,
                trimOffsets = this.getImageTrimOffsets(img, 1, 0, true, true, true, true),
                drawingOffset = { top: 0, right: 0, bottom: 0, left: 0 };

            if (rotationCenterX !== undefined || rotationCenterY !== undefined) {   //handle
                if (typeof rotationCenterX !== 'number' || typeof rotationCenterY !== 'number')
                    throw new Error('if applied, both, rotationCenterX & rotationCenterY have to be numeric');

                centerOffsetX = rotationCenterX - h / 2;
                centerOffsetY = rotationCenterY - w / 2;
                ////rotationCenterX *= imgScaling;
                ////rotationCenterY *= imgScaling;
                //if (rotationCenterX !== w / 2 || rotationCenterY !== h / 2) {   //resize only if dimensions are different

                //    var h2 = h / 2,
                //        w2 = w / 2;

                //    var imgSize = { //resulting image
                //        h: (h2 + Math.abs(rotationCenterY - h2)) * 2,
                //        w: (w2 + Math.abs(rotationCenterX - w2)) * 2,
                //    };
                //    var canvasSize = {
                //        h: Math.ceil(imgSize.h),
                //        w: Math.ceil(imgSize.w),
                //    };
                //    //this._canvas.height = canvasSize.h;
                //    //this._canvas.width = canvasSize.w;
                //    var roundingError = {   //not sure this is really necessary
                //        x: (canvasSize.w - imgSize.w) / 2,
                //        y: (canvasSize.h - imgSize.h) / 2,
                //    };
                //    drawingOffset = {
                //        top: (rotationCenterY < h2 ? imgSize.h - h : 0) + roundingError.y,
                //        right: (rotationCenterX > w2 ? imgSize.w - w : 0) + roundingError.x,
                //        bottom: (rotationCenterY > h2 ? imgSize.h - h : 0) + roundingError.y,
                //        left: (rotationCenterX < w2 ? imgSize.w - w : 0) + roundingError.x,
                //    };

                //    //var ctx = this._ctx;  //TODO: do not draw but store offsets to include them in final drawing positions
                //    //ctx.save();
                //    //ctx.drawImage(img, drawingOffset.left, drawingOffset.top);
                //    //img = new Image();
                //    //img.src = this._canvas.toDataURL();
                //    //ctx.restore();

                //    //update size
                //    h = canvasSize.h;
                //    w = canvasSize.w;

                //    //combine trim offsets
                //    trimOffsets.top += Math.floor(drawingOffset.top);
                //    trimOffsets.left += Math.floor(drawingOffset.left);
                //    trimOffsets.bottom += Math.floor(drawingOffset.bottom);
                //    trimOffsets.right += Math.floor(drawingOffset.right);
                //}
            }

            centerOffsetX += (trimOffsets.left - trimOffsets.right) / 2;
            centerOffsetY += (trimOffsets.bottom - trimOffsets.top) / 2;

            var ch = h - trimOffsets.top - trimOffsets.bottom,
                cw = w - trimOffsets.left - trimOffsets.right;
            this._canvas.height = ch;
            this._canvas.width = cw;

            var ctx = this._ctx;
            ctx.save();
            ctx.drawImage(img, -trimOffsets.left, -trimOffsets.top, cw, ch);
            img = new Image();
            img.src = this._canvas.toDataURL();
            ctx.restore();
            var returnValue = { image: img, centerOffsetX: centerOffsetX, centerOffsetY: centerOffsetY };


            //var offsetX = Math.min(trimOffsets.left, trimOffsets.right),    //we cut symmetrical to keep the rotation point
            //    offsetY = Math.min(trimOffsets.top, trimOffsets.bottom);

            //var ch = h - 2 * offsetY,   //canvas hight/width
            //    cw = w - 2 * offsetX;
            //if (ch <= 0 || cw <= 0)     //check for transparent images
            //    return new Image();

            //this._canvas.height = ch;
            //this._canvas.width = cw;

            //var ctx = this._ctx;
            //ctx.save();
            //ctx.drawImage(img, -offsetX + drawingOffset.left, -offsetY + drawingOffset.top);//, cw, ch);
            //img = new Image();
            //img.src = this._canvas.toDataURL();
            //ctx.restore();
            //var returnValue = { image: img };

            if (includeBoundingCorners) {
                //{ image: img, 
                //tl: { length: undefined, angle: undefined },
                //tr: { length: undefined, angle: undefined }, 
                //bl: { length: undefined, angle: undefined }, 
                //br: { length: undefined, angle: undefined } };

                //offsets changed due to cuttings: make sure 2 values are == 0 right now.. otherwise there was an error
                //trimOffsets.top -= offsetY;
                //trimOffsets.left -= offsetX;
                //trimOffsets.bottom -= offsetY;
                //trimOffsets.right -= offsetX;
                //if (trimOffsets.top > 0 && trimOffsets.bottom > 0 || trimOffsets.left > 0 && trimOffsets.right > 0)
                //    throw new Error('for testing only: should be removed. error calculating offsets');
                var mx = cw / 2,    //rotation center
                    my = ch / 2,
                    x = centerOffsetX - mx,//-mx + trimOffsets.left,
                    y = centerOffsetY - my;//-my + trimOffsets.top;
                returnValue.tl = { length: Math.sqrt(Math.pow(x) + Math.pow(y)), angle: Math.atan2(y, x) };
                x = centerOffsetX + mx;//mx - trimOffsets.right;
                returnValue.tr = { length: Math.sqrt(Math.pow(x) + Math.pow(y)), angle: Math.atan2(y, x) };
                y = centerOffsetY + my;//my - trimOffsets.bottom;
                returnValue.br = { length: Math.sqrt(Math.pow(x) + Math.pow(y)), angle: Math.atan2(y, x) };
                x = centerOffsetX - mx;//-mx + trimOffsets.left;
                returnValue.bl = { length: Math.sqrt(Math.pow(x) + Math.pow(y)), angle: Math.atan2(y, x) };
            }
            return returnValue;
        },
        getDataTrimOffsets: function (data, imgHeight, imgWidth, top, right, bottom, left) {
            if (!(data instanceof Uint8ClampedArray) || typeof imgHeight !== 'number' || typeof imgWidth !== 'number')
                throw new Error('invalid argument');

            var h = imgHeight,
                w = imgWidth,
                rowOffset = 0,
                offsets = { top: undefined, right: undefined, bottom: undefined, left: undefined };

            //top
            if (top) {
                for (var y = 0; y < h; y++) {
                    rowOffset = y * w * 4;

                    for (var x = 0; x < w; x++) {
                        //alpha = data[rowOffset + x * 4 + 3];
                        if (data[rowOffset + x * 4 + 3] !== 0) {
                            offsets.top = y;
                            break;
                        }
                    }
                    if (offsets.top !== undefined)
                        break;
                }
                if (offsets.top === undefined)
                    offsets.top = ch;

                //offsets.top += imgCanvasOffsetY;
                //offsets.top = Math.floor(offsets.top * scalingFactor);
            }

            //bottom
            var _topIdx = 0;
            if (offsets.top)
                _topIdx = offsets.top;
            //^^ inner height to present errors on completely transparent images and avoid searching the corner areas twice

            if (bottom) {
                for (var y = h - 1; y >= _topIdx; y--) {
                    rowOffset = y * w * 4;

                    for (var x = 0; x < w; x++) {
                        //alpha = data[rowOffset + x * 4 + 3];
                        if (data[rowOffset + x * 4 + 3] !== 0) {
                            offsets.bottom = h - (y + 1);
                            break;
                        }
                    }
                    if (offsets.bottom !== undefined)
                        break;
                }
                if (offsets.bottom === undefined)
                    offsets.bottom = ch;

                //offsets.bottom += imgCanvasOffsetY;
                //offsets.bottom = Math.floor(offsets.bottom * scalingFactor);
            }

            var _bottomIdx = h - 1;
            if (offsets.bottom)
                _bottomIdx -= offsets.bottom;

            //left
            if (left) {
                for (var x = 0; x < w; x++) {
                    for (var y = _topIdx; y <= _bottomIdx; y++) {
                        //alpha = y * w * 4 + colOffset + 3;
                        if (data[(y * w + x) * 4 + 3] !== 0) {
                            offsets.left = x;
                            break;
                        }
                    }
                    if (offsets.left !== undefined)
                        break;
                }
                if (offsets.left === undefined)
                    offsets.left = cw;

                //offsets.left += imgCanvasOffsetX;
                //offsets.left = Math.floor(offsets.left * scalingFactor);
            }

            //right
            if (right) {
                for (var x = w - 1; x >= 0; x--) {
                    for (var y = _topIdx; y <= _bottomIdx; y++) {
                        //alpha = y * w * 4 + colOffset + 3;
                        if (data[(y * w + x) * 4 + 3] !== 0) {
                            offsets.right = w - (x + 1);
                            break;
                        }
                    }
                    if (offsets.right !== undefined)
                        break;
                }
                if (offsets.right === undefined)
                    offsets.right = cw;

                //offsets.right += imgCanvasOffsetX;
                //offsets.right = Math.floor(offsets.right * scalingFactor);
            }

            return offsets;
        },
        getImageTrimOffsets: function (img, scaling, rotation, top, right, bottom, left) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid argument: img: expected type: HTMLImageElement');

            var h = img.naturalHeight,
                w = img.naturalWidth,
                renderedSize = rotation ? this.getBoundingSize(img, 1, rotationAngle) : { height: h, width: w };

            var useScaling = scaling && scaling < 1 ? true : false;    //we do not upscale-> performance
            var ch = useScaling ? Math.ceil(renderedSize.height * scaling) : Math.ceil(renderedSize.height),
                cw = useScaling ? Math.ceil(renderedSize.width * scaling) : Math.ceil(renderedSize.width);
            this._canvas.height = ch;
            this._canvas.width = cw;

            var ctx = this._ctx;
            if (useScaling)
                ctx.scale(scaling, scaling);
            //ctx.clearRect(0, 0, w, h);  //TODO: necessary?
            ctx.translate(cw / 2, ch / 2);
            if (rotation)
                ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(img, -renderedSize.width / 2, -renderedSize.height / 2);

            //search for offsets
            //var offsets = { top: undefined, right: undefined, bottom: undefined, left: undefined };
            var pixels = ctx.getImageData(0, 0, cw, ch);
            ctx.restore();

            //var data = pixels.data, rowOffset = 0;
            var offsets = this.getDataTrimOffsets(pixels.data, ch, cw, top, right, bottom, left);
            ////top
            //if (top) {
            //    for (var y = 0; y < h; y++) {
            //        rowOffset = y * w * 4;

            //        for (var x = 0; x < w; x++) {
            //            //alpha = data[rowOffset + x * 4 + 3];
            //            if (data[rowOffset + x * 4 + 3] !== 0) {
            //                offsets.top = y;
            //                break;
            //            }
            //        }
            //        if (offsets.top !== undefined)
            //            break;
            //    }
            //    if (offsets.top === undefined)
            //        offsets.top = ch;

            //    //offsets.top += imgCanvasOffsetY;
            //    //offsets.top = Math.floor(offsets.top * scalingFactor);
            //}

            ////bottom
            //var _topIdx = 0;
            //if (offsets.top)
            //    _topIdx = offsets.top;
            ////^^ inner height to present errors on completely transparent images and avoid searching the corner areas twice

            //if (bottom) {
            //    for (var y = h - 1; y >= _topIdx; y--) {
            //        rowOffset = y * w * 4;

            //        for (var x = 0; x < w; x++) {
            //            //alpha = data[rowOffset + x * 4 + 3];
            //            if (data[rowOffset + x * 4 + 3] !== 0) {
            //                offsets.bottom = h - (y + 1);
            //                break;
            //            }
            //        }
            //        if (offsets.bottom !== undefined)
            //            break;
            //    }
            //    if (offsets.bottom === undefined)
            //        offsets.bottom = ch;

            //    //offsets.bottom += imgCanvasOffsetY;
            //    //offsets.bottom = Math.floor(offsets.bottom * scalingFactor);
            //}

            //var _bottomIdx = h - 1;
            //if (offsets.bottom)
            //    _bottomIdx -= offsets.bottom;

            ////left
            //if (left) {
            //    for (var x = 0; x < w; x++) {
            //        for (var y = _topIdx; y <= _bottomIdx; y++) {
            //            //alpha = y * w * 4 + colOffset + 3;
            //            if (data[(y * w + x) * 4 + 3] !== 0) {
            //                offsets.left = x;
            //                break;
            //            }
            //        }
            //        if (offsets.left !== undefined)
            //            break;
            //    }
            //    if (offsets.left === undefined)
            //        offsets.left = cw;

            //    //offsets.left += imgCanvasOffsetX;
            //    //offsets.left = Math.floor(offsets.left * scalingFactor);
            //}

            ////right
            //if (right) {
            //    for (var x = w - 1; x >= 0; x--) {
            //        for (var y = _topIdx; y <= _bottomIdx; y++) {
            //            //alpha = y * w * 4 + colOffset + 3;
            //            if (data[(y * w + x) * 4 + 3] !== 0) {
            //                offsets.right = w - (x + 1);
            //                break;
            //            }
            //        }
            //        if (offsets.right !== undefined)
            //            break;
            //    }
            //    if (offsets.right === undefined)
            //        offsets.right = cw;

            //    //offsets.right += imgCanvasOffsetX;
            //    //offsets.right = Math.floor(offsets.right * scalingFactor);
            //}

            //apply scaling if defined and not included right now
            if (scaling && scaling > 1) {
                offsets.top = Math.floor(offsets.top * scalingFactor);
                offsets.right = Math.floor(offsets.right * scalingFactor);
                offsets.bottom = Math.floor(offsets.bottom * scalingFactor);
                offsets.left = Math.floor(offsets.left * scalingFactor);
            }
            return offsets;
        },
        //getDiagonal: function(img) {
        //    var h = img.naturalHeight,
        //        w = img.naturalWidth;

        //    return { length: Math.ceil(Math.sqrt(Math.pow(h, 2) + Math.pow(w, 2))), angle: -Math.asin(h / w) };
        //},
        getBoundingSize: function (img, scalingFactor, rotationAngle) {
            var imgHeight = img.naturalHeight,
                imgWidth = img.naturalWidth;

            var phi = 0;
            var h = imgHeight,
                w = imgWidth;
            if (rotationAngle) {
                phi = rotationAngle * Math.PI / 180;
                var absCos = Math.abs(Math.cos(phi)),
                    absSin = Math.abs(Math.sin(phi));
                h = /*Math.ceil(*/imgWidth * absSin + imgHeight * absCos/*)*/;
                w = /*Math.ceil(*/imgWidth * absCos + imgHeight * absSin/*)*/;
            }

            return { height: h * scalingFactor, width: w * scalingFactor };
        },
        //trimAndScale: function (img, scalingFactor, rotationCenterX, rotationCenterY) { //TODO: use alternative rotation center if provided
        //    this._checkInitialized();
        //    if (!(img instanceof HTMLImageElement))
        //        throw new Error('invalid paramter: img: expected type: HTMLImageElement');

        //    var offsets = this.getTrimOffsets(img, 1, 0, /*false, false, */true, true, true, true);
        //    scalingFactor = scalingFactor || 1;
        //    if (scalingFactor <= 0)
        //        return { img: new Image(), /*boundingHeight: 0, boundingWidth: 0, */offsetX: 0, offsetY: 0, scaled: 0 };

        //    //this._canvas.style.merge({ height: (img.naturalHeight - offsets.top - offsets.bottom) + 'px', width: (img.naturalWidth - offsets.left - offsets.right) + 'px' });
        //    //var h = img.naturalHeight - offsets.top - offsets.bottom,
        //    //    w = img.naturalWidth - offsets.left - offsets.right;
        //    //TODO: as all images get rotatet using the image center we can only trim the images symmetrical using their minimum offsets: this may change due to scratch incompatibility
        //    //      -> using fabric.util.rotatePoint
        //    var offsetX = Math.min(offsets.left, offsets.right),
        //        offsetY = Math.min(offsets.top, offsets.bottom),
        //        ih = img.naturalHeight,
        //        iw = img.naturalWidth;
        //    var ch = ih - 2 * offsetY,   //canvas hight/width
        //        cw = iw - 2 * offsetX;

        //    //check for transparent images
        //    if (ch <= 0 || cw <= 0)
        //        return { img: new Image(), /*boundingHeight: 0, boundingWidth:0, */offsetX: 0, offsetY: 0, scaled: 0 };

        //    ch = Math.ceil(ch * scalingFactor);
        //    cw = Math.ceil(cw * scalingFactor);
        //    this._canvas.height = ch;
        //    this._canvas.width = cw;
        //    //recalculate the image position offset due to roundings: this may not have a big effect but we want to keep it exact
        //    var chOffset = (ch - (ih - 2 * offsetY) * scalingFactor) / 2 / scalingFactor,
        //        cwOffset = (cw - (iw - 2 * offsetX) * scalingFactor) / 2 / scalingFactor;

        //    var ctx = this._ctx;
        //    ctx.save();
        //    ctx.scale(scalingFactor, scalingFactor);
        //    //ctx.clearRect(0, 0, w, h);
        //    //ctx.drawImage(img, -offsets.left, -offsets.top);
        //    ctx.drawImage(img, cwOffset - offsetX, chOffset - offsetY);
        //    var img = new Image();
        //    img.src = this._canvas.toDataURL();
        //    ctx.restore();
        //    //return { img: img, offsetX: offsets.left, offsetY: offsets.top };
        //    return { img: img, /*boundingHeight: ch, boundingWidth: cw, */offsetX: offsetX, offsetY: offsetY, scaled: scalingFactor };
        //},
        //please notice: the rotaiton angle is in degree here and not eqal to the sprite direction: it depends on the direction + rotationStyle
        //positive angle means clockwise rotation
        //getTrimOffsets: function (img, scalingFactor, rotationAngle, /*flipH, flipV, */top, right, bottom, left) {  //TODO:optional parameter: boundingSize (so we do not have to recalculate this)
        //    this._checkInitialized();
        //    if (!(img instanceof HTMLImageElement))
        //        throw new Error('invalid paramter: img: expected type: HTMLImageElement');

        //    var offsets = { boundingHeight: 0, boundingWidth: 0, top: undefined, right: undefined, bottom: undefined, left: undefined };

        //    var imgHeight = img.naturalHeight,
        //        imgWidth = img.naturalWidth,
        //        boundingSize = this.getBoundingSize(img, 1, rotationAngle);//,
        //    //scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
        //    //scaleV = flipV ? -1 : 1; // Set verical scale to -1 if flip vertical

        //    var h = boundingSize.height,  //canvas height,width
        //        w = boundingSize.width;

        //    //include the real measurements in return value
        //    offsets.height = Math.ceil(h * scalingFactor);
        //    offsets.width = Math.ceil(w * scalingFactor);

        //    //trim offsets between the original image size and the canvas size (changes on rotate): if rotated, the bounding box gets bigger->offsets can be negative as well
        //    //values may be floats but get rounded when applied
        //    var imgCanvasOffsetX = (imgWidth - w) / 2,
        //        imgCanvasOffsetY = (imgHeight - h) / 2;

        //    var c = this._canvas;
        //    c.height = h;
        //    c.width = w;

        //    var ctx = this._ctx
        //    ctx.save();
        //    //draw
        //    //ctx.scale(1, 1);    //make sure o scaling is applied
        //    //ctx.clearRect(0, 0, w, h);  //TODO: necessary
        //    ctx.translate(w / 2, h / 2);
        //    if (rotationAngle)
        //        ctx.rotate(rotationAngle * Math.PI / 180);
        //    ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        //    //ctx.scale(scaleH, scaleV);
        //    //ctx.drawImage(img, -imgWidth / 2 + -imgWidth / 2 * (flipH ? -1 : 0), -imgHeight / 2 + -imgHeight / 2 * (flipV ? -1 : 0));

        //    //now let's search for offsets
        //    var pixels = ctx.getImageData(0, 0, w, h);
        //    ctx.restore();

        //    var data = pixels.data, rowOffset = 0, alpha = 255;

        //    //top
        //    if (top) {
        //        for (var y = 0; y < h; y++) {
        //            rowOffset = y * w * 4;

        //            for (var x = 0; x < w; x++) {
        //                //alpha = data[rowOffset + x * 4 + 3];
        //                if (data[rowOffset + x * 4 + 3] !== 0) {
        //                    offsets.top = y;
        //                    break;
        //                }
        //            }
        //            if (offsets.top !== undefined)
        //                break;
        //        }
        //        if (offsets.top === undefined)
        //            offsets.top = h;

        //        offsets.top += imgCanvasOffsetY;
        //        offsets.top = Math.floor(offsets.top * scalingFactor);
        //    }

        //    //bottom
        //    var _topIdx = 0;
        //    if (offsets.top)
        //        _topIdx = offsets.top;
        //    //^^ inner height to present errors on completely transparent images and avoid searching the corner areas twice

        //    if (bottom) {
        //        for (var y = h - 1; y >= _topIdx; y--) {
        //            rowOffset = y * w * 4;

        //            for (var x = 0; x < w; x++) {
        //                //alpha = data[rowOffset + x * 4 + 3];
        //                if (data[rowOffset + x * 4 + 3] !== 0) {
        //                    offsets.bottom = h - (y + 1);
        //                    break;
        //                }
        //            }
        //            if (offsets.bottom !== undefined)
        //                break;
        //        }
        //        if (offsets.bottom === undefined)
        //            offsets.bottom = h;

        //        offsets.bottom += imgCanvasOffsetY;
        //        offsets.bottom = Math.floor(offsets.bottom * scalingFactor);
        //    }

        //    var _bottomIdx = h - 1;
        //    if (offsets.bottom)
        //        _bottomIdx -= offsets.bottom;

        //    //left
        //    if (left) {
        //        for (var x = 0; x < w; x++) {
        //            for (var y = _topIdx; y <= _bottomIdx; y++) {
        //                //alpha = y * w * 4 + colOffset + 3;
        //                if (data[(y * w + x) * 4 + 3] !== 0) {
        //                    offsets.left = x;
        //                    break;
        //                }
        //            }
        //            if (offsets.left !== undefined)
        //                break;
        //        }
        //        if (offsets.left === undefined)
        //            offsets.left = w;

        //        offsets.left += imgCanvasOffsetX;
        //        offsets.left = Math.floor(offsets.left * scalingFactor);
        //    }

        //    //right
        //    if (right) {
        //        for (var x = w - 1; x >= 0; x--) {
        //            for (var y = _topIdx; y <= _bottomIdx; y++) {
        //                //alpha = y * w * 4 + colOffset + 3;
        //                if (data[(y * w + x) * 4 + 3] !== 0) {
        //                    offsets.right = w - (x + 1);
        //                    break;
        //                }
        //            }
        //            if (offsets.right !== undefined)
        //                break;
        //        }
        //        if (offsets.right === undefined)
        //            offsets.right = w;

        //        offsets.right += imgCanvasOffsetX;
        //        offsets.right = Math.floor(offsets.right * scalingFactor);
        //    }

        //    return offsets;
        //},
    });

    return ImageHelper;
})();
//static class: constructor override (keeping code coverage enabled)
PocketCode.ImageHelper = new PocketCode.ImageHelper();