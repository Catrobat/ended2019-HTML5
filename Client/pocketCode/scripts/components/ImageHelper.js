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
        scale: function(img, scalingFactor) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            if (!scalingFactor) //=0 is not allowed here
                return img;
            this._canvas.height = Math.ceil(img.naturalHeight * scalingFactor);
            this._canvas.width = Math.ceil(img.naturalWidth * scalingFactor);

            var ctx = this._ctx;
            ctx.save();
            ctx.scale(scalingFactor, scalingFactor);
            ctx.drawImage(img, 0, 0);
            var img = new Image();
            img.src = this._canvas.toDataURL();
            ctx.restore();

            return img;
        },
        trimAndScale: function (img, scalingFactor) {//, symmetrical) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            var offsets = this.getTrimOffsets(img, 1, 0, true, true, true, true);
            scalingFactor = scalingFactor || 1;

            //this._canvas.style.merge({ height: (img.naturalHeight - offsets.top - offsets.bottom) + 'px', width: (img.naturalWidth - offsets.left - offsets.right) + 'px' });
            //var h = img.naturalHeight - offsets.top - offsets.bottom,
            //    w = img.naturalWidth - offsets.left - offsets.right;
            //TODO: as all images get rotatet using the image center we can only trim the images symmetrical using their minimum offsets: this may change due to scratch incompatibility
            //      -> using fabric.util.rotatePoint
            var offsetX = Math.min(offsets.left, offsets.right),
                offsetY = Math.min(offsets.top, offsets.bottom),
                h = img.naturalHeight - 2 * offsetY,
                w = img.naturalWidth - 2 * offsetX;

            //check for transparent images
            if (h <= 0 || w <= 0)
                return { img: new Image(), offsetX: 0, offsetY: 0 };

            this._canvas.height = Math.ceil(h * scalingFactor);
            this._canvas.width = Math.ceil(w * scalingFactor);

            var ctx = this._ctx;
            ctx.save();
            ctx.scale(scalingFactor, scalingFactor);
            //ctx.clearRect(0, 0, w, h);
            //ctx.drawImage(img, -offsets.left, -offsets.top);
            ctx.drawImage(img, -offsetX, -offsetY);
            var img = new Image();
            img.src = this._canvas.toDataURL();
            ctx.restore();
            //return { img: img, offsetX: offsets.left, offsetY: offsets.top };
            return { img: img, offsetX: offsetX, offsetY: offsetY };
        },
        //please notice: the rotaiton angle is in degree here and not eqal to the sprite direction: it depends on the diection + rotationStyle
        //positive angle means clockwise rotation
        getTrimOffsets: function (img, scalingFactor, rotationAngle, top, right, bottom, left) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            var offsets = { top: undefined, right: undefined, bottom: undefined, left: undefined };

            var phi = rotationAngle * Math.PI / 180;
            var absCos = Math.abs(Math.cos(phi)),
                absSin = Math.abs(Math.sin(phi));
            var imgWidth = img.naturalWidth,
                imgHeight = img.naturalHeight;
            var w = Math.ceil(imgWidth * absCos + imgHeight * absSin),
                w2 = Math.ceil(w / 2);
            w = w2 * 2; //make the canvas width/height an even number
            var h = Math.ceil(imgWidth * absSin + imgHeight * absCos),
                h2 = Math.ceil(h / 2);
            h = h2 * 2;

            //offsets between the original image size and the canvas size (changes on rotate)
            //values may be floats but get rounded when applied
            var imgCanvasOffsetX = (imgWidth - w) / 2,
                imgCanvasOffsetY = (imgHeight - h) / 2;

            var c = this._canvas;
            c.width = w;
            c.height = h;

            var ctx = this._ctx
            ctx.save();
            //draw
            //ctx.scale(1, 1);    //make sure o scaling is applied
            //ctx.clearRect(0, 0, w, h);
            ctx.translate(w2, h2);
            ctx.rotate(phi);
            ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2);

            //now let's search for offsets
            var pixels = ctx.getImageData(0, 0, w, h);
            ctx.restore();

            var data = pixels.data, rowOffset = 0, alpha = 255;

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

                offsets.top += imgCanvasOffsetY;
                offsets.top = Math.floor(offsets.top * scalingFactor);
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
                    offsets.bottom = h;

                offsets.bottom += imgCanvasOffsetY;
                offsets.bottom = Math.floor(offsets.bottom * scalingFactor);
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

                offsets.left += imgCanvasOffsetX;
                offsets.left = Math.floor(offsets.left * scalingFactor);
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

                offsets.right += imgCanvasOffsetX;
                offsets.right = Math.floor(offsets.right * scalingFactor);
            }

            return offsets;
        },
    });

    return ImageHelper;
})();
//static class: constructor override (keeping code coverage enabled)
PocketCode.ImageHelper = new PocketCode.ImageHelper();