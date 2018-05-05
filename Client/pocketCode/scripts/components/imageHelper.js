/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
'use strict';

/**
 * GraphicEffects
 * @type {{COLOR: string, FISHEYE: string, WHIRL: string, PIXELATE: string, MOSAIC: string, BRIGHTNESS: string, GHOST: string}}
 */
PocketCode.GraphicEffect = {
    WHIRL: 'whirl',
    FISHEYE: 'fisheye',
    PIXELATE: 'pixelate',
    MOSAIC: 'mosaic',
    COLOR: 'color',
    BRIGHTNESS: 'brightness',
    GHOST: 'ghost',     //opacity, transparency
    /*
    GRAYSCALE: 'grayscale',
    THRESHOLD: 'threshold',
    
    NEGATIVE: 'negative',
    COMIC: 'comic',
    DUPLICATE: 'duplicate',
    CONFETTI: 'confetti',
    */
};

PocketCode.ImageFilter = {

    /*
     * TODO:
     * following methods include the source code of scratch filters (action script)
     * you can find them at: https://github.com/LLK/scratch-flash/tree/5cff62b909856b7d7b3d116a5dcc2b4f03de8482/src/filters
     * these filters are not included in the latest version of scratch HTML5 player (which is currently deprecated?)
     * If you're not familiar with flash/action script you should read the resource/s below to undestand the implementation :
     *   http://www.adobe.com/devnet/flex/articles/pixel_bender_basics_flex_air.html
     * even more information can be found here:
     *   https://www.adobe.com/content/dam/Adobe/en/devnet/pixelbender/pdfs/pixelbender_reference.pdf
     *   https://www.adobe.com/content/dam/Adobe/en/devnet/pixelbender/pdfs/pixelbender_guide.pdf
     * 
     * TODO: (for each filter)
     * - define input parameters (check correctness of existing parameters)
     * - set default values for input parameters if undefined
     * - validate input parameters
     * - iterate over pixel array: example:
     *   var r, g, b, a;
     *   for (var i = 0, l = p.length; i < l; i += 4) {
     *     r = p[i];
     *     g = p[i + 1];
     *     b = p[i + 2];
     *     a = p[i + 3];
     * 
     *     //IMPLEMENT FILTER LOGIC HERE
     *   }
     * 
     * - implementation
     * - tests
     * - cleanup: delete action script comments when done
     * 
     * GLOBAL TODO: 
     * - implement ImageHelper.setFilter: basic and untested implementation right now
     *   make sure all method parameters are passed correcty
     * - implement unit-tests (if done for the filters already this shouldn't be much work)
     */
    whirl: function (p, whirlRadians, center, radius, scale) {  //scale = {x:?, y:?}
        //// range: -infinity..infinity
        //var radians:Number = (Math.PI * filterDict["whirl"]) / 180;
        //var scaleX:Number, scaleY:Number
        //if (srcWidth > srcHeight) {
        //    scaleX = srcHeight / srcWidth;
        //    scaleY = 1;
        //} else {
        //    scaleX = 1;
        //    scaleY = srcWidth / srcHeight;
        //}
        //whirlShader.data.whirlRadians.value = [radians];
        //whirlShader.data.center.value = [srcWidth * 0.5, srcHeight * 0.5];
        //whirlShader.data.radius.value = [Math.min(srcWidth, srcHeight) * 0.5];
        //whirlShader.data.scale.value = [scaleX, scaleY];
        //newFilters.push(new ShaderFilter(whirlShader));

    //    kernel Whirl
    //    <	vendor : "MIT Media Laboratory";
    //    namespace : "filters";
    //    version : 1;
    //    description : "Scratch Whirl";
    //    >
    //    {
    //        parameter float whirlRadians
    //        <
    //    minValue: float(-100.0);
    //    maxValue: float(100.0);
    //    defaultValue: float(0);
    //    >;
    //    parameter float2 center
    //    <
    //    minValue:float2(0, 0);
    //    maxValue:float2(1000, 1000);
    //    defaultValue:float2(100, 100);
    //    >;
    //    parameter float radius
    //    <
    //    minValue: float(0);
    //    maxValue: float(500);
    //    defaultValue: float(100);
    //    >;
    //    parameter float2 scale
    //    <
    //    minValue:float2(0, 0);
    //    maxValue:float2(10, 10);
    //    defaultValue:float2(1, 1);
    //    >;

    //    input image4 src;
    //    output float4 dst;

    //    void evaluatePixel() {
    //        float2 vec = scale * (outCoord() - center);
    //        float d = length(vec);
    //        float factor = 1.0 - (d / radius);
    //        float a = whirlRadians * (factor * factor);
    //        // matrix to rotate the vector from the center
    //        float sinAngle = sin(a);
    //        float cosAngle = cos(a);
    //        float2x2 rotationMat = float2x2(
    //            cosAngle,	-sinAngle,
    //            sinAngle,	 cosAngle
    //        );
    //        // rotate, unscale, and compute source point
    //        float2 p = ((rotationMat * vec) / scale) + center;
    //        dst = sampleNearest(src, p);
    //        if (d > radius) dst = sampleNearest(src, outCoord());
    //    }
    //}
        return p;
    },
    fisheye: function (p, scaledPower, center) {
        //// range: -100..infinity
        //n = Math.max(0, (filterDict["fisheye"] + 100) / 100);
        //fisheyeShader.data.scaledPower.value = [n];
        //fisheyeShader.data.center.value = [srcWidth * 0.5, srcHeight * 0.5];
        //newFilters.push(new ShaderFilter(fisheyeShader));

    //    kernel Fisheye
    //    <	vendor : "MIT Media Laboratory";
    //    namespace : "filters";
    //    version : 1;
    //    description : "Scratch Fisheye";
    //    >
    //    {
    //        parameter float scaledPower
    //        <
    //    minValue:float(0);
    //    maxValue:float(10);
    //    defaultValue:float(1);
    //    >;
    //    parameter float2 center
    //    <
    //    minValue:float2(0, 0);
    //    maxValue:float2(1000, 1000);
    //    defaultValue:float2(100, 100);
    //    >;

    //    input image4 src;
    //    output float4 dst;

    //    void evaluatePixel() {
    //        float2 p = outCoord();
    //        float2 vec = (p - center) / center;
    //        float r = pow(length(vec), scaledPower);
    //        float angle = atan(vec[1], vec[0]);

    //        p = center + (r * float2(cos(angle), sin(angle)) * center);
    //        if (r > 1.0) p = outCoord();
    //        dst = sample(src, p);
    //    }
    //}
        return p;
    },
    pixelate: function (p, pixelSize/*, stagePane*/) {
        //// range of absolute value: 0..(10 * min(w, h))
        //n = (Math.abs(filterDict["pixelate"]) / 10) + 1;
        //if (targetObj == Scratch.app.stagePane) n *= Scratch.app.stagePane.scaleX;
        //n = Math.min(n, Math.min(srcWidth, srcHeight));
        //pixelateShader.data.pixelSize.value = [n];
        //newFilters.push(new ShaderFilter(pixelateShader));

    //    kernel Pixelate
    //    <	vendor : "MIT Media Laboratory";
    //    namespace : "filters";
    //    version : 1;
    //    description : "Scratch Pixelate";
    //    >
    //    {
    //        parameter float pixelSize
    //        <
    //    minValue: 1.0;
    //    maxValue: 100.0;
    //    defaultValue: 1.0;
    //    >;

    //    input image4 src;
    //    output pixel4 dst;

    //    void evaluatePixel() {
    //        float2 p = floor(outCoord() / pixelSize) * pixelSize;
    //        dst = sampleNearest(src, p);
    //    }
    //}
        return p;
    },
    mosaic: function (p, count, srcWidth, srcHeight) {
        //// range of absolute value: 0..(10 * min(w, h))
        //n = Math.round((Math.abs(filterDict["mosaic"]) + 10) / 10);
        //n = Math.max(1, Math.min(n, Math.min(srcWidth, srcHeight)));
        //mosaicShader.data.count.value = [n];
        //mosaicShader.data.widthAndHeight.value = [srcWidth, srcHeight];
        //newFilters.push(new ShaderFilter(mosaicShader));

    //    kernel Mosaic
    //    <	vendor : "MIT Media Laboratory";
    //    namespace : "filters";
    //    version : 1;
    //    description : "Scratch Mosaic";
    //    >
    //    {
    //        // number of copies of the original
    //        parameter float count
    //        <
    //    minValue: 1.0;
    //    maxValue: 100.0;
    //    defaultValue: 1.0;
    //    >;

    //    // width and height of the input image
    //    parameter float2 widthAndHeight
    //    <
    //    minValue: float2(1.0, 1.0);
    //    maxValue: float2(2000.0, 2000.0);
    //    defaultValue: float2(200.0, 200.0);
    //    >;

    //    input image4 src;
    //    output pixel4 dst;

    //    void evaluatePixel() {
    //        dst = sampleNearest(src, mod(outCoord() * count, widthAndHeight));
    //    }
    //}
        return p;
    },
    color: function (p, hueShift) {
        if(!hueShift)
            return;

        //convert to pocketCode interval
        hueShift = hueShift % 200;
        if(hueShift < 0)
            hueShift += 200;

        hueShift = hueShift / 200 * 360;

        for (var i = 0, l = p.length; i < l; i += 4) {
            var r = p[i],
                g = p[i + 1],
                b = p[i + 2];

            var hsv = PocketCode.ImageHelper.rgbToHsv(r, g, b);
            var h = hsv.h;
            var s = hsv.s;
            var v = hsv.v;

            h = (h + hueShift) % 360;
            // if (h < 0)
            //     h += 360;

            var rgb = PocketCode.ImageHelper.hsvToRgb(h, s, v);

            p[i] = rgb.r;
            p[i + 1] = rgb.g;
            p[i + 2] = rgb.b;
        }
        return p;

        //// brightness range is -100..100
        ////			n = Math.max(-100, Math.min(filterDict["brightness"], 100));
        ////			hsvShader.data.brightnessShift.value = [n];
        //hsvShader.data.brightnessShift.value = [0];

        //// hue range: -infinity..infinity
        //n = ((360.0 * filterDict["color"]) / 200.0) % 360.0;
        //hsvShader.data.hueShift.value = [n];
        //newFilters.push(new ShaderFilter(hsvShader));

    //    kernel HSV
    //    <	vendor : "MIT Media Laboratory";
    //    namespace : "filters";
    //    version : 1;
    //    description : "Scratch HSV";
    //    >
    //    {
    //        parameter float hueShift
    //        <
    //    minValue: float(-500.0);
    //    maxValue: float(500.0);
    //    defaultValue: float(0);
    //    >;
    //    parameter float brightnessShift
    //    <
    //    minValue: float(-100.0);
    //    maxValue: float(100.0);
    //    defaultValue: float(0);
    //    >;

    //    input image4 src;
    //    output float4 dst;

    //    void evaluatePixel() {
    //        dst = sampleNearest(src, outCoord());
    //        float r = dst.r;
    //        float g = dst.g;
    //        float b = dst.b;
    //        // compute h, s, v
    //        float h, s;
    //        float v = max(r, max(g, b));
    //        float span = v - min(r, min(g, b));
    //        if (span == 0.0) {
    //            h = s = 0.0; // grayscale
    //        } else {
    //            if (r == v) h = 60.0 * ((g - b) / span);
    //            else if (g == v) h = 120.0 + (60.0 * ((b - r) / span));
    //            else if (b == v) h = 240.0 + (60.0 * ((r - g) / span));
    //            s = span / v;
    //        }

    //        if (hueShift != 0.0) {
    //            // this code forces grayscale values to be slightly saturated
    //            // so that some slight change of hue will be visible
    //            if (v < 0.11) { v = 0.11; s = 1.0; } // force black to dark gray, fully-saturated
    //            if (s < 0.09) s = 0.09; // make saturation at least 0.09
    //            if ((v == 0.11) || (s == 0.09)) h = 0.0; // use same tint for all grays
    //        }

    //        // apply h, s, v shifts
    //        h = mod(h + hueShift, 360.0);
    //        if (h < 0.0) h += 360.0;
    //        s = max(0.0, min(s, 1.0));
    //        v = max(0.0, min(v + (brightnessShift / 100.0), 1.0));

    //        // convert hsv to rgb and save pixel
    //        int i = int(floor(h / 60.0));
    //        float f = (h / 60.0) - float(i);
    //        float p = v * (1.0 - s);
    //        float q = v * (1.0 - (s * f));
    //        float t = v * (1.0 - (s * (1.0 - f)));

    //        if ((i == 0) || (i == 6)) dst.rgb = float3(v, t, p);
    //        else if (i == 1) dst.rgb = float3(q, v, p);
    //        else if (i == 2) dst.rgb = float3(p, v, t);
    //        else if (i == 3) dst.rgb = float3(p, q, v);
    //        else if (i == 4) dst.rgb = float3(t, p, v);
    //        else if (i == 5) dst.rgb = float3(v, p, q);
    //    }
    //}
    },
    brightness: function (p, value) {
        if (value !== 0) {
            value = Math.round(2.55 * value);   //255 = 100% of this color [0..255]
            for (var i = 0, l = p.length; i < l; i += 4) {
                p[i] += value;
                p[i + 1] += value;
                p[i + 2] += value;
            }
        }
        return p;
    },

    /* filtes below currently not supported- do not delete */
    /*
    grayscale: function(p, args) {
        var r, g, b;
        for (var i = 0, l = p.length; i < l; i += 4) {
            r = p[i];
            g = p[i+1];
            b = p[i+2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126*r + 0.7152*g + 0.0722*b;
            p[i] = p[i+1] = p[i+2] = v
        }
        return p;
    },
    threshold: function(p, threshold) {
        var r, g, b, v;
        for (var i = 0, l = p.length; i < l; i += 4) {
            r = p[i];
            g = p[i+1];
            b = p[i+2];
            v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
            p[i] = p[i+1] = p[i+2] = v
        }
        return p;
    },

    negative: function (p, value) {
        var rcom, gcom, bcom;
        if (value !== 0) {
            for (var i = 0, l = p.length; i < l; i += 4) {
                rcom = 255 - p[i];
                gcom = 255 - p[i + 1];
                bcom = 255 - p[i + 2];

                if (p[i] < rcom) { //compare to the complement
                    p[i] += value;
                } else if (p[i] > rcom) {
                    p[i] -= value;
                }
                if (p[i + 1] < gcom) {
                    p[i + 1] += value;
                } else if (p[i + 1] > gcom) {
                    p[i + 1] -= value;
                }
                if (p[i + 2] < bcom) {
                    p[i + 2] += value;
                } else if (p[i + 2] > bcom) {
                    p[i + 2] -= value;
                }
            }
        }
        return p;
    },
    comic: function (p, value) {
        if (value !== 0) {
            for (var i = 0, l = p.length; i < l; i += 4) {
                p[i] += Math.sin(i * value) * 127 + 128;
                p[i + 1] += Math.sin(i * value) * 127 + 128;
                p[i + 2] += Math.sin(i * value) * 127 + 128;
            }
        }
        return p;
    },
    duplicate: function (p, value) {
        if (value !== 0) {
            for (var i = 0, l = p.length; i < l; i += 4) {
                p[i] = p[i * value];
                p[i + 1] = p[i * value + 1];
                p[i + 2] = p[i * value + 2];
                p[i + 3] = p[i * value + 3];
            }
        }
        return p;
    },
    confetti: function (p, value) {
        if (value !== 0) {
            for (var i = 0, l = p.length; i < l; i += 1) {
                p[i] = Math.sin(value * p[i]) * 127 + p[i];
            }
        }
        return p;
    },
    */
};

/*
 * this class is a helper class including image manipulation logic
 */
PocketCode._ImageHelper = (function () {

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
        setFilters: function (canvas, filters) {
            if (!(canvas instanceof HTMLCanvasElement))
                throw new Error('invalid argument: canvas');
            if (!(filters instanceof Array))
                throw new Error('invalid argument: filters[]');

            if (filters.length == 0|| canvas.width == 0 || canvas.height == 0)
                return;
            var _effects = {},
                filter;
            for (var i = 0, l = filters.length; i < l; i++) {
                filter = filters[i];
                if (!filter.effect)
                    throw new Error('invalid argument: effects[' + i + ']');
                if(filter.value)
                    _effects[filter.effect] = filter.value;
            }

            var ctx = canvas.getContext("2d");
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var pixels = imageData.data;

            //TODO: call filter operations using correct parameters (example only)
            var ge = PocketCode.GraphicEffect,
                imgf = PocketCode.ImageFilter;
            if (_effects[ge.WHIRL]) { //make sure filters are applied in correct order
                pixels = imgf.whirl(pixels, _effects[ge.WHIRL]);
            }
            if (_effects[ge.FISHEYE]) {
                pixels = imgf.fisheye(pixels, _effects[ge.FISHEYE]);
            }
            if (_effects[ge.PIXELATE]) {
                pixels = imgf.pixelate(pixels, _effects[ge.PIXELATE]);
            }
            if (_effects[ge.MOSAIC]) {
                pixels = imgf.mosaic(pixels, _effects[ge.MOSAIC]);
            }
            if (_effects[ge.COLOR]) {
                pixels = imgf.color(pixels, _effects[ge.COLOR]);
            }
            if (_effects[ge.BRIGHTNESS]) {
                pixels = imgf.brightness(pixels, _effects[ge.BRIGHTNESS]);
            }
            if(_effects[ge.GHOST]){
            }
            //.. for all filters

            //the last object will have all the transformations done on it
            var newImageData = ctx.createImageData(imageData); //make imgdata object
            newImageData.data.set(pixels); //add transformed pixels
            ctx.putImageData(newImageData, 0, 0);
        },
        setImageSmoothing: function (ctx, bool) {
            ctx.imageSmoothingEnabled = bool;
            //ctx.webkitImageSmoothingEnabled = bool;   //deprecated
            ctx.mozImageSmoothingEnabled = bool;
            ctx.msImageSmoothingEnabled = bool;
            ctx.oImageSmoothingEnabled = bool;
        },
        scale: function (element, scalingFactor) {
            scalingFactor = scalingFactor != undefined ? scalingFactor : 1.0;
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
            else if (scalingFactor <= 0) {
                canvas.height = 0;
                canvas.width = 0;
                return canvas;
            }

            var ih = h * scalingFactor,
                iw = w * scalingFactor;
            var ch = Math.ceil(ih),
                cw = Math.ceil(iw);

            canvas.height = ch;
            canvas.width = cw;

            var ctx = canvas.getContext('2d');
            ctx.scale(scalingFactor, scalingFactor);
            ctx.drawImage(element, (cw - iw) / 2, (ch - ih) / 2);
            return canvas;
        },
        /* rotation center x & y are defined as used in scratch: from the top-left corner of the image to the rc 
           please notice that the axes are defined as: right & bottom = positive */
        adjustCenterAndTrim: function (element, /*rotationCenterX, rotationCenterY,*/ includeBoundingCorners) {
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
            var trimOffsets = this.getElementTrimOffsets(element, 0);

            //if (rotationCenterX !== undefined || rotationCenterY !== undefined) {
            //    if (typeof rotationCenterX !== 'number' || typeof rotationCenterY !== 'number')
            //        throw new Error('if applied, both, rotationCenterX & rotationCenterY have to be numeric');

            //    centerOffsetX = w * 0.5 - rotationCenterX;
            //    centerOffsetY = -h * 0.5 + rotationCenterY;
            //}

            centerOffsetX += (trimOffsets.left - trimOffsets.right) * 0.5;    //offsets between old and new rotation center
            centerOffsetY += (trimOffsets.bottom - trimOffsets.top) * 0.5;

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

                var mx = cw * 0.5,    //new rotation center
                    my = ch * 0.5,
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
        getElementTrimOffsets: function (element, rotation, /*optional*/ precision) {
            this._checkInitialized();
            var h, w;
            precision = precision || 1.0;
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

                var ch = Math.ceil(renderedSize.height / precision),
                    cw = Math.ceil(renderedSize.width / precision);

                var canvas = document.createElement('canvas');
                canvas.height = ch;
                canvas.width = cw;
                var ctx = canvas.getContext('2d');
                ctx.translate(cw * 0.5, ch * 0.5);
                ctx.scale(1.0 / precision, 1.0 / precision);

                if (rotation)
                    ctx.rotate(rotation * Math.PI / 180);
                ctx.drawImage(element, -w * 0.5, -h * 0.5);
                offsets = this.getDataTrimOffsets(ctx.getImageData(0, 0, cw, ch), true, true, true, true);
            }

            return {
                top: Math.floor(offsets.top * precision),
                right: Math.floor(offsets.right * precision),
                bottom: Math.floor(offsets.bottom * precision),
                left: Math.floor(offsets.left * precision),
            };
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

        hsvToRgb: function(h, s, v){
            h = h % 360;
            var i = Math.floor(h / 60.0);
            var f = ((h / 60.0) - i);
            var p = Math.round(v * (1.0 - s));
            var q = Math.round(v * (1.0 - (s * f)));
            var t = Math.round(v * (1.0 - (s * (1.0 - f))));

            switch(i){
                case 0: return {r: v, g: t, b: p};
                case 1: return {r: q, g: v, b: p};
                case 2: return {r: p, g: v, b: t};
                case 3: return {r: p, g: q, b: v};
                case 4: return {r: t, g: p, b: v};
                case 5: return {r: v, g: p, b: q};
            }
        },

        // ranges
        // h: 0 - 360
        // s: 0 - 1
        // v: 0 - 255
        rgbToHsv: function(r, g, b){
            var h, s, v;
            v = Math.max(r, g, b);
            var span = v - Math.min(r, g, b);
            if(!span){
                h = 0;
                s = 0;
            } else {
                if (r === v)
                    h = 60.0 * ((g - b) / span);
                else if (g === v)
                    h = 120.0 + (60.0 * ((b - r) / span));
                else if (b === v)
                    h = 240.0 + (60.0 * ((r - g) / span));

                h = h.toFixed(2);
                h = h % 360;
                if(h < 0)
                    h += 360;

                s = +(span / v).toFixed(2);
            }

            return {h: h, s: s, v: v};
        },

        //findObjects: function(pixels){
        //    var equivilentRegions = [];
        //    var regionCount = 0;

        //    var currentPixel, alpha, currentGroup;

        //    for (var row = 0, rowLength = pixels.length; row < rowLength; row++){
        //        for (var col = 0, colLength = pixels[row].length; col < colLength; col++){

        //            currentPixel = pixels[row][col];
        //            alpha = currentPixel[3];

        //            if(alpha){
        //                currentGroup = pixels[row][col - 1][4]
        //                    || pixels[row - 1][col - 1][4]
        //                    || pixels[row - 1][col][4];

        //                //todo equivilent requions?
        //                currentPixel = currentGroup || regionCount++;
        //            }
        //        }
        //    }

        //},

        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return ImageHelper;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.ImageHelper = new PocketCode._ImageHelper();
