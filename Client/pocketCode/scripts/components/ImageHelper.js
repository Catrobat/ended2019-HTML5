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

            return { boundingHeight: h * scalingFactor, boundingWidth: w * scalingFactor };
        },
        trimAndScale: function (img, scalingFactor) {//, symmetrical) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            var offsets = this.getTrimOffsets(img, 1, 0, /*false, false, */true, true, true, true);
            scalingFactor = scalingFactor || 1;
            if (scalingFactor <= 0)
                return { img: new Image(), /*boundingHeight: 0, boundingWidth: 0, */offsetX: 0, offsetY: 0, scaled: 0 };

            //this._canvas.style.merge({ height: (img.naturalHeight - offsets.top - offsets.bottom) + 'px', width: (img.naturalWidth - offsets.left - offsets.right) + 'px' });
            //var h = img.naturalHeight - offsets.top - offsets.bottom,
            //    w = img.naturalWidth - offsets.left - offsets.right;
            //TODO: as all images get rotatet using the image center we can only trim the images symmetrical using their minimum offsets: this may change due to scratch incompatibility
            //      -> using fabric.util.rotatePoint
            var offsetX = Math.min(offsets.left, offsets.right),
                offsetY = Math.min(offsets.top, offsets.bottom),
                ih = img.naturalHeight,
                iw = img.naturalWidth;
            var ch = ih - 2 * offsetY,   //canvas hight/width
                cw = iw - 2 * offsetX;

            //check for transparent images
            if (ch <= 0 || cw <= 0)
                return { img: new Image(), /*boundingHeight: 0, boundingWidth:0, */offsetX: 0, offsetY: 0, scaled: 0 };

            ch = Math.ceil(ch * scalingFactor);
            cw = Math.ceil(cw * scalingFactor);
            this._canvas.height = ch;
            this._canvas.width = cw;
            //recalculate the image position offset due to roundings: this may not have a big effect but we want to keep it exact
            var chOffset = (ch - (ih - 2 * offsetY) * scalingFactor) / 2 / scalingFactor,
                cwOffset = (cw - (iw - 2 * offsetX) * scalingFactor) / 2 / scalingFactor;

            var ctx = this._ctx;
            ctx.save();
            ctx.scale(scalingFactor, scalingFactor);
            //ctx.clearRect(0, 0, w, h);
            //ctx.drawImage(img, -offsets.left, -offsets.top);
            ctx.drawImage(img, cwOffset - offsetX, chOffset - offsetY);
            var img = new Image();
            img.src = this._canvas.toDataURL();
            ctx.restore();
            //return { img: img, offsetX: offsets.left, offsetY: offsets.top };
            return { img: img, /*boundingHeight: ch, boundingWidth: cw, */offsetX: offsetX, offsetY: offsetY, scaled: scalingFactor };
        },
        //please notice: the rotaiton angle is in degree here and not eqal to the sprite direction: it depends on the diection + rotationStyle
        //positive angle means clockwise rotation
        getTrimOffsets: function (img, scalingFactor, rotationAngle, /*flipH, flipV, */top, right, bottom, left) {
            this._checkInitialized();
            if (!(img instanceof HTMLImageElement))
                throw new Error('invalid paramter: img: expected type: HTMLImageElement');

            var offsets = { boundingHeight: 0, boundingWidth: 0, top: undefined, right: undefined, bottom: undefined, left: undefined };

            var imgHeight = img.naturalHeight,
                imgWidth = img.naturalWidth,
                boundingSize = this.getBoundingSize(img, 1, rotationAngle);//,
                //scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
                //scaleV = flipV ? -1 : 1; // Set verical scale to -1 if flip vertical

            var h = boundingSize.boundingHeight,  //canvas height,width
                w = boundingSize.boundingWidth;

            //include the real measurements in return value
            offsets.boundingHeight = Math.ceil(h * scalingFactor);
            offsets.boundingWidth = Math.ceil(w * scalingFactor);

            //trim offsets between the original image size and the canvas size (changes on rotate): if rotated, the bounding box gets bigger->offsets can be negative as well
            //values may be floats but get rounded when applied
            var imgCanvasOffsetX = (imgWidth - w) / 2,
                imgCanvasOffsetY = (imgHeight - h) / 2;

            var c = this._canvas;
            c.height = h;
            c.width = w;

            var ctx = this._ctx
            ctx.save();
            //draw
            //ctx.scale(1, 1);    //make sure o scaling is applied
            //ctx.clearRect(0, 0, w, h);  //TODO: necessary
            ctx.translate(w / 2, h / 2);
            if (rotationAngle)
                ctx.rotate(rotationAngle * Math.PI / 180);
            ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            //ctx.scale(scaleH, scaleV);
            //ctx.drawImage(img, -imgWidth / 2 + -imgWidth / 2 * (flipH ? -1 : 0), -imgHeight / 2 + -imgHeight / 2 * (flipV ? -1 : 0));

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