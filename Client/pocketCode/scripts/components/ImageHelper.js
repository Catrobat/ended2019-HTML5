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

            if (scalingFactor === undefined)
                return img;
            else if (typeof scalingFactor !== 'number')
                throw new Error('invalid paramter: scalingFactor: expected type: number');
            else if (scalingFactor === 0)
                return new Image();

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
        /* rotation center x & y are defined as used in scratch: from the top-left corner of the image to the rc 
           please notice that the axes are defined as: right & bottom = positive */
        adjustCenterAndTrim: function (img, rotationCenterX, rotationCenterY, includeBoundingCorners) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            var h = img.naturalHeight,
                w = img.naturalWidth,
                centerOffsetX = 0,
                centerOffsetY = 0,
                trimOffsets = this.getImageTrimOffsets(img, 1, 0);

            if (rotationCenterX !== undefined || rotationCenterY !== undefined) {
                if (typeof rotationCenterX !== 'number' || typeof rotationCenterY !== 'number')
                    throw new Error('if applied, both, rotationCenterX & rotationCenterY have to be numeric');

                centerOffsetX = w / 2 - rotationCenterX;
                centerOffsetY = -h / 2 + rotationCenterY;
            }

            centerOffsetX += (trimOffsets.left - trimOffsets.right) / 2;    //offsets between old and new rotation center
            centerOffsetY += (trimOffsets.bottom - trimOffsets.top) / 2;

            var ch = h - trimOffsets.top - trimOffsets.bottom,
                cw = w - trimOffsets.left - trimOffsets.right;

            //check for transparent images
            if (ch <= 0 || cw <= 0) {
                var returnVal = { image: new Image(), m: { length: 0, angle: 0 } };
                if (includeBoundingCorners)
                    returnVal.merge({ m: { length: 0, angle: 0 }, tl: { length: 0, angle: 0 }, tr: { length: 0, angle: 0 }, bl: { length: 0, angle: 0 }, br: { length: 0, angle: 0 } });
                return returnVal;
            }

            this._canvas.height = ch;
            this._canvas.width = cw;

            var ctx = this._ctx;
            ctx.save();
            ctx.drawImage(img, -trimOffsets.left, -trimOffsets.top, cw, ch);
            img = new Image();
            img.src = this._canvas.toDataURL();
            ctx.restore();
            var returnValue = { image: img };
            returnValue.m = { length: Math.sqrt(Math.pow(centerOffsetX, 2) + Math.pow(centerOffsetY, 2)), angle: Math.atan2(centerOffsetY, centerOffsetX) };

            if (includeBoundingCorners) {
                //{ image: img, 
                //tl: { length: undefined, angle: undefined },
                //tr: { length: undefined, angle: undefined }, 
                //bl: { length: undefined, angle: undefined }, 
                //br: { length: undefined, angle: undefined } };

                var mx = cw / 2,    //new rotation center
                    my = ch / 2,
                    x = centerOffsetX - mx,
                    y = centerOffsetY + my;
                returnValue.tl = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                x = centerOffsetX + mx;
                returnValue.tr = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                y = centerOffsetY - my;
                returnValue.br = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                x = centerOffsetX - mx;
                returnValue.bl = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
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
                    offsets.top = h;
            }

            //bottom
            var _topIdx = 0;
            if (offsets.top)
                _topIdx = offsets.top;
            //^^ inner height to prevent errors on completely transparent images and avoid searching the corner areas twice

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
                    offsets.bottom = h;
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
                    offsets.left = w;
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
                    offsets.right = w;
            }

            return offsets;
        },
        getImageTrimOffsets: function (img, scaling, rotation) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid argument: img: expected type: HTMLImageElement');

            var h = img.naturalHeight,
                w = img.naturalWidth,
                renderedSize = rotation ? this.getBoundingSize(img, 1, rotation) : { height: h, width: w };

            var ch = Math.ceil(renderedSize.height),// * internalScaling),
                cw = Math.ceil(renderedSize.width);// * internalScaling);

            this._canvas.height = ch;
            this._canvas.width = cw;

            var ctx = this._ctx;
            ctx.translate(cw / 2, ch / 2);
            if (rotation)
                ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(img, -w / 2, -h / 2);

            //search for offsets
            var pixels = ctx.getImageData(0, 0, cw, ch);
            ctx.restore();

            var offsets = this.getDataTrimOffsets(pixels.data, ch, cw, true, true, true, true);//, top, right, bottom, left);

            //apply scaling if defined and not included right now
            if (scaling) {
                offsets.top = Math.floor(offsets.top * scaling);
                offsets.right = Math.floor(offsets.right * scaling);
                offsets.bottom = Math.floor(offsets.bottom * scaling);
                offsets.left = Math.floor(offsets.left * scaling);
            }
            return offsets;
        },
        getBoundingSize: function (img, scaling, rotation) {
            var imgHeight = img.naturalHeight,
                imgWidth = img.naturalWidth;

            var phi = 0;
            var h = imgHeight,
                w = imgWidth;
            if (rotation) {
                phi = rotation * Math.PI / 180;
                var absCos = Math.abs(Math.cos(phi)),
                    absSin = Math.abs(Math.sin(phi));
                h = imgWidth * absSin + imgHeight * absCos;
                w = imgWidth * absCos + imgHeight * absSin;
            }

            return { height: h * scaling, width: w * scaling };
        },

    });

    return ImageHelper;
})();
//static class: constructor override (keeping code coverage enabled)
PocketCode.ImageHelper = new PocketCode.ImageHelper();