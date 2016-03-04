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
                this._initialized = true;
            else
                throw new Error('The static image helper class uses the DOM and cannot be used until loading completed');
        },
        setImageSmoothing: function (ctx, bool) {
            ctx.imageSmoothingEnabled = bool;
            ctx.webkitImageSmoothingEnabled = bool;
            ctx.mozImageSmoothingEnabled = bool;
            ctx.msImageSmoothingEnabled = bool;
            ctx.oImageSmoothingEnabled = bool;
        },
        scale: function (element, scalingFactor) {
            this._checkInitialized();
            var h, w;
            if (element instanceof HTMLImageElement) {
                h = element.naturalHeight;
                w = element.naturalWidth;
            }
            else if (element instanceof HTMLCanvasElement) {
                h = element.height;
                w = element.width;
            }
            else
                throw new Error('invalid paramter: element, expected: typeof HTMLImageElement or HTMLCanvasElement');

            var canvas = document.createElement('canvas');

            if (typeof scalingFactor !== 'number')
                throw new Error('invalid argument: scalingFactor: expected type: number');
            else if (scalingFactor === 0) {
                canvas.height = 0;
                canvas.width = 0;
                return canvas;
            }

            var ih = h * scalingFactor,
                iw = w * scalingFactor;
            var ch = Math.ceil(ih),
                cw = Math.ceil(iw)

            canvas.height = ch;
            canvas.width = cw;

            var ctx = canvas.getContext('2d');
            ctx.scale(scalingFactor, scalingFactor);
            ctx.drawImage(element, (cw - iw) / 2, (ch - ih) / 2);
            return canvas;
        },
        /* rotation center x & y are defined as used in scratch: from the top-left corner of the image to the rc 
           please notice that the axes are defined as: right & bottom = positive */
        adjustCenterAndTrim: function (element, rotationCenterX, rotationCenterY, includeBoundingCorners) {
            this._checkInitialized();
            var h, w;
            if (element instanceof HTMLImageElement) {
                h = element.naturalHeight;
                w = element.naturalWidth;
            }
            else if (element instanceof HTMLCanvasElement) {
                h = element.height;
                w = element.width;
            }
            else
                throw new Error('invalid paramter: element, expected: typeof HTMLImageElement or HTMLCanvasElement');

            var centerOffsetX = 0,
                centerOffsetY = 0;
            var trimOffsets = this.getElementTrimOffsets(element, 1, 0);

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

            var canvas = document.createElement('canvas');
            //check for transparent images
            if (ch <= 0 || cw <= 0) {
                canvas.width = 0;
                canvas.height = 0;
                var returnValue = { canvas: canvas, center: { length: 0, angle: 0 } };
                if (includeBoundingCorners)
                    returnValue.merge({ center: { length: 0, angle: 0 }, tl: { length: 0, angle: 0 }, tr: { length: 0, angle: 0 }, bl: { length: 0, angle: 0 }, br: { length: 0, angle: 0 } });
                return returnValue;
            }

            canvas.height = ch;
            canvas.width = cw;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(element, -trimOffsets.left, -trimOffsets.top);
            var returnValue = { canvas: canvas };
            returnValue.center = { length: Math.sqrt(Math.pow(centerOffsetX, 2) + Math.pow(centerOffsetY, 2)), angle: Math.atan2(centerOffsetY, centerOffsetX) };

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
        getDataTrimOffsets: function (imageData, top, right, bottom, left) {
            if (!(imageData instanceof ImageData))
                throw new Error('invalid argument: imageData, expected type: ImageData');

            var data = imageData.data,
                w = imageData.width,
                h = imageData.height,
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
        getElementTrimOffsets: function (element, scaling, rotation) {
            this._checkInitialized();
            var h, w;
            if (element instanceof HTMLImageElement) {
                h = element.naturalHeight;
                w = element.naturalWidth;
            }
            else if (element instanceof HTMLCanvasElement) {
                h = element.height;
                w = element.width;
            }
            else
                throw new Error('invalid paramter: element, expected: typeof HTMLImageElement or HTMLCanvasElement');

            var offsets;
            if (element instanceof HTMLCanvasElement && (rotation === undefined || rotation == 0)) {
                var ctx = element.getContext('2d');
                offsets = this.getDataTrimOffsets(ctx.getImageData(0, 0, w, h), true, true, true, true);
            }
            else {
                var renderedSize = rotation ? this.getBoundingSize(element, 1, rotation) : { height: h, width: w };

                var ch = Math.ceil(renderedSize.height),
                    cw = Math.ceil(renderedSize.width);

                var canvas = document.createElement('canvas');
                canvas.height = ch;
                canvas.width = cw;

                var ctx = canvas.getContext('2d');
                ctx.translate(cw / 2, ch / 2);
                if (rotation)
                    ctx.rotate(rotation * Math.PI / 180);
                ctx.drawImage(element, -w / 2, -h / 2);

                offsets = this.getDataTrimOffsets(ctx.getImageData(0, 0, cw, ch), true, true, true, true);
            }

            //apply scaling if defined and not included right now
            if (scaling) {
                offsets.top = Math.floor(offsets.top * scaling);
                offsets.right = Math.floor(offsets.right * scaling);
                offsets.bottom = Math.floor(offsets.bottom * scaling);
                offsets.left = Math.floor(offsets.left * scaling);
            }
            return offsets;
        },
        getBoundingSize: function (element, scaling, rotation) {
            var h, w;
            if (element instanceof HTMLImageElement) {
                h = element.naturalHeight;
                w = element.naturalWidth;
            }
            else if (element instanceof HTMLCanvasElement) {
                h = element.height;
                w = element.width;
            }
            else
                throw new Error('invalid paramter: element, expected: typeof HTMLImageElement or HTMLCanvasElement');

            var phi = 0;
            var newH = h,
                newW = w;
            if (rotation) {
                phi = rotation * Math.PI / 180;
                var absCos = Math.abs(Math.cos(phi)),
                    absSin = Math.abs(Math.sin(phi));
                newH = w * absSin + h * absCos;
                newW = w * absCos + h * absSin;
            }

            return { height: newH * scaling, width: newW * scaling };
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return ImageHelper;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.ImageHelper = new PocketCode.ImageHelper();