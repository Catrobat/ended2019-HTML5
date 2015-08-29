/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("imageHelper.js");


QUnit.test("ImageHelper", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();

    //helper function to alimit rounding errors
    var round1000 = function (value) {
        return Math.round(value * 1000) / 1000;
    };

    var img1, img2, img3, img4, img5, img6, img7, img8, img9,
        ih = PocketCode.ImageHelper;

    var imgLoadCounter = 0;
    var imgLoadHandler = function () {
        imgLoadCounter++;
        if (imgLoadCounter == 9) //all loaded
            runTests_Scale();
    };

    //init images to use
    img1 = new Image();
    img1.addEventListener("load", imgLoadHandler);
    img1.src = "_resources/images/imgHelper1.png";

    img2 = new Image();
    img2.addEventListener("load", imgLoadHandler);
    img2.src = "_resources/images/imgHelper2.png";

    img3 = new Image();
    img3.addEventListener("load", imgLoadHandler);
    img3.src = "_resources/images/imgHelper3.png";

    img4 = new Image();
    img4.addEventListener("load", imgLoadHandler);
    img4.src = "_resources/images/imgHelper4.png";

    img5 = new Image();
    img5.addEventListener("load", imgLoadHandler);
    img5.src = "_resources/images/imgHelper5.png";

    img6 = new Image();
    img6.addEventListener("load", imgLoadHandler);
    img6.src = "_resources/images/imgHelper6.png";

    img7 = new Image();
    img7.addEventListener("load", imgLoadHandler);
    img7.src = "_resources/images/imgHelper7.png";

    img8 = new Image();
    img8.addEventListener("load", imgLoadHandler);
    img8.src = "_resources/images/imgHelper8.png";

    img9 = new Image();
    img9.addEventListener("load", imgLoadHandler);
    img9.src = "_resources/images/imgHelper9.png";


    //scale(img, scalingFactor)
    var runTests_Scale = function () {

        assert.throws(function () { ih.scale("image"); }, Error, "ERROR: scale: argument check: image");
        assert.throws(function () { ih.scale(new Image(), "asd"); }, Error, "ERROR: scale: argument check: scaling factor");
        assert.throws(function () { ih.scale(img8); }, Error, "ERROR: scale: argument check: scaling factor undefined");

        var oImg = ih.scale(img8, 0);
        assert.ok(oImg.width == 0 && oImg.height == 0, "scaling factor = 0");

        oImg = ih.scale(img8, 2);
        assert.ok(oImg.height == img8.height * 2 && oImg.width == img8.width * 2, "upscaling proportions: h:" + oImg.height + ", w:" + oImg.width);

        var oImg2 = ih.scale(img9, 0.3);
        assert.ok(oImg2.height == Math.ceil(img9.height * 0.3) && oImg2.width == Math.ceil(img9.width * 0.3), "upscaling proportions: rounding h:" + oImg2.height + ", w:" + oImg2.width);

        var canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 150;
        var c = ih.scale(canvas, 0.02);
        assert.ok(c.width == 1 && c.height == 3, "scaling canvas element");

        done1();
        runTests_getBoundingSize();
    };

    //getBoundingSize(element, scaling, rotation)
    var runTests_getBoundingSize = function () {

        assert.throws(function () { ih.getBoundingSize(""); }, Error, "ERROR: argument check");
        var canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 150;
        var size = ih.getBoundingSize(canvas, 0.5);
        assert.ok(size.height == canvas.height * 0.5 && size.width == canvas.width * 0.5, "bounding size without rotate");
        canvas.height = 50;
        var d = 2 * canvas.height / Math.sqrt(2);
        d *= 2; //apply scaling
        size = ih.getBoundingSize(canvas, 2, 45);
        assert.ok(round1000(size.height) == round1000(d) && round1000(size.width) == round1000(d), "bounding size including rotate");
        
        done2();
        runTests_getImageTrimOffsets();
    };

    //getElementTrimOffsets(img, scaling, rotation, top, right, bottom, left)
    var runTests_getImageTrimOffsets = function () {

        //argument check
        assert.throws(function () { ih.getElementTrimOffsets("image"); }, Error, "ERROR: argument check: getElementTrimOffsets");
        assert.throws(function () { ih.getDataTrimOffsets([], 12, 12); }, Error, "ERROR: argument check: getDataTrimOffsets");

        //simple
        var offsets = ih.getElementTrimOffsets(img1);
        assert.ok(offsets.top == 7 && offsets.right == 2 && offsets.bottom == 0 && offsets.left == 0, "simple: combined");
        offsets = ih.getElementTrimOffsets(img6);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "simple: filled");
        offsets = ih.getElementTrimOffsets(img7);  //transparent
        assert.ok(offsets.top == 8 && offsets.right == 10 && offsets.bottom == 8 && offsets.left == 10, "simple: transparent");
        offsets = ih.getElementTrimOffsets(img8);  //centered
        assert.ok(offsets.top == 2 && offsets.right == 3 && offsets.bottom == 2 && offsets.left == 3, "simple: centered");
        offsets = ih.getElementTrimOffsets(img9);
        assert.ok(offsets.top == 243 && offsets.right == 106 && offsets.bottom == 339 && offsets.left == 143, "simple: large");

        //scaled
        var offsets = ih.getElementTrimOffsets(img1, 0.5);
        assert.ok(offsets.top == 3 && offsets.right == 1 && offsets.bottom == 0 && offsets.left == 0, "scaled: combined");
        offsets = ih.getElementTrimOffsets(img6, 0.25);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "scaled: filled");
        offsets = ih.getElementTrimOffsets(img7, 2);  //transparent
        assert.ok(offsets.top == 16 && offsets.right == 20 && offsets.bottom == 16 && offsets.left == 20, "scaled: transparent");
        offsets = ih.getElementTrimOffsets(img8, 0.5);  //centered
        assert.ok(offsets.top == 1 && offsets.right == 1 && offsets.bottom == 1 && offsets.left == 1, "scaled: centered");
        offsets = ih.getElementTrimOffsets(img9, 0.1);
        assert.ok(offsets.top == 24 && offsets.right == 10 && offsets.bottom == 33 && offsets.left == 14, "scaled: large");

        //rotate: 90
        var offsets = ih.getElementTrimOffsets(img1, 1, 90);
        assert.ok(offsets.top == 0 && offsets.right == 7 && offsets.bottom == 2 && offsets.left == 0, "rotate: 90: combined");
        offsets = ih.getElementTrimOffsets(img6, 1, 90);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "rotate: 90: filled");
        offsets = ih.getElementTrimOffsets(img7, 1, 90);  //transparent
        assert.ok(offsets.top == 10 && offsets.right == 8 && offsets.bottom == 10 && offsets.left == 8, "rotate: 90: transparent");
        offsets = ih.getElementTrimOffsets(img8, 1, 90);  //centered
        assert.ok(offsets.top == 3 && offsets.right == 2 && offsets.bottom == 3 && offsets.left == 2, "rotate: 90: centered");
        offsets = ih.getElementTrimOffsets(img9, 1, 90);
        assert.ok(offsets.top == 143 && offsets.right == 243 && offsets.bottom == 106 && offsets.left == 339, "rotate: 90: large");

        //rotate:180 + scaled
        offsets = ih.getElementTrimOffsets(img1, 0.5, 180);
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 3 && offsets.left == 1, "rotate:180 + scaled: combined");
        offsets = ih.getElementTrimOffsets(img6, 0.25, 180);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "rotate:180 + scaled: filled");
        //this is a special case: due to roundings the image gets larger: 11*9 + scaling multiplies this effect, so the output can be 18 & 22
        offsets = ih.getElementTrimOffsets(img7, 2, 180);  //transparent:
        assert.ok(offsets.top == 18 && offsets.right == 22 && offsets.bottom == 18 && offsets.left == 22, "rotate:180 + scaled: transparent");
        offsets = ih.getElementTrimOffsets(img8, 0.5, 180);  //centered
        assert.ok(offsets.top == 1 && offsets.right == 1 && offsets.bottom == 1 && offsets.left == 1, "rotate:180 + scaled: centered");
        offsets = ih.getElementTrimOffsets(img9, 0.1, 180);
        assert.ok(offsets.top == 33 && offsets.right == 14 && offsets.bottom == 24 && offsets.left == 10, "rotate:180 + scaled: large");

        done3();
        runTests_adjustCenterAndTrim();
    };

    //adjustCenterAndTrim(img, rotationCenterX, rotationCenterY, includeBoundingCorners)
    var runTests_adjustCenterAndTrim = function () {

        //argument check
        assert.throws(function () { ih.adjustCenterAndTrim("image"); }, Error, "ERROR: invlaid image argument");
        assert.throws(function () { ih.adjustCenterAndTrim(img8, "a", 3); }, Error, "ERROR: invlaid rotationCenter argument");

        //simple
        var oImg9 = ih.adjustCenterAndTrim(img9, undefined, undefined, true);  //we start with the slowest and hope that loading time will not effect our tests
        var oImg8 = ih.adjustCenterAndTrim(img8, undefined, undefined, true);
        var oImg7 = ih.adjustCenterAndTrim(img7, undefined, undefined, true);
        var oImg6 = ih.adjustCenterAndTrim(img6, undefined, undefined, true);
        var oImg5 = ih.adjustCenterAndTrim(img5, undefined, undefined, true);
        var oImg4 = ih.adjustCenterAndTrim(img4, undefined, undefined, true);
        var oImg3 = ih.adjustCenterAndTrim(img3, undefined, undefined, true);
        var oImg2 = ih.adjustCenterAndTrim(img2, undefined, undefined, true);
        var oImg1 = ih.adjustCenterAndTrim(img1, undefined, undefined, true);

        var m = oImg1.center, //{ length: , angle: }
            img = oImg1.canvas,
            x = m.length * Math.cos(m.angle),
            y = m.length * Math.sin(m.angle),
            tl = oImg1.tl,
            tr = oImg1.tr,
            bl = oImg1.bl,
            br = oImg1.br;
        assert.ok(img.height == 1 && img.width == 8, "img1 cut");
        assert.ok(round1000(x) == - 1 && round1000(y) == -3.5, "img1 recentered");
        x = tl.length * Math.cos(tl.angle);
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == -3, "top left corner vector checked");
        x = tr.length * Math.cos(tr.angle);
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == 3 && round1000(y) == -3, "top right corner vector checked");
        x = bl.length * Math.cos(bl.angle);
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == -4, "bottom left corner vector checked");
        x = br.length * Math.cos(br.angle);
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == 3 && round1000(y) == -4, "bottom right corner vector checked");

        m = oImg2.center, //{ length: , angle: }
        img = oImg2.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle),
        tl = oImg2.tl,
        tr = oImg2.tr,
        bl = oImg2.bl,
        br = oImg2.br;
        assert.ok(img.height == 1 && img.width == 8, "img2 cut");
        assert.ok(round1000(x) == 1 && round1000(y) == 3.5, "img2 recentered");
        x = tl.length * Math.cos(tl.angle);
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == 4, "top left corner vector checked");
        x = tr.length * Math.cos(tr.angle);
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == 5 && round1000(y) == 4, "top right corner vector checked");
        x = bl.length * Math.cos(bl.angle);
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == 3, "bottom left corner vector checked");
        x = br.length * Math.cos(br.angle);
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == 5 && round1000(y) == 3, "bottom right corner vector checked");

        m = oImg3.center, //{ length: , angle: }
        img = oImg3.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 4 && img.width == 4, "img3 cut");
        assert.ok(round1000(x) == -1 && round1000(y) == 1, "img3 recentered");

        m = oImg4.center, //{ length: , angle: }
        img = oImg4.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 7 && img.width == 1, "img4 cut");
        assert.ok(round1000(x) == -4.5 && round1000(y) == 0.5, "img4 recentered");

        m = oImg5.center, //{ length: , angle: }
        img = oImg5.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 8 && img.width == 1, "img5 cut");
        assert.ok(round1000(x) == 4.5 && round1000(y) == 0, "img5 recentered");

        m = oImg6.center, //{ length: , angle: }
        img = oImg6.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 8 && img.width == 10, "img6 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img6 recentered");

        m = oImg7.center, //{ length: , angle: }
        img = oImg7.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 0 && img.width == 0, "img7 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img7 recentered");

        m = oImg8.center, //{ length: , angle: }
        img = oImg8.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 4 && img.width == 4, "img8 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img8 recentered");

        m = oImg9.center, //{ length: , angle: }
        img = oImg9.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 602 && img.width == 471, "img9 cut");
        assert.ok(round1000(x) == 18.5 && round1000(y) == 48, "img9 recentered");

        //quick check canvas call
        var c = ih.adjustCenterAndTrim(img);
        m = c.center,
        img = c.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 602 && img.width == 471, "calling method using canvas element: size- make sure there is no trim-area after first trim");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "calling method using canvas element: resized- make sure there is no trim-area after first trim");

        //individual rotation center applied
        oImg9 = ih.adjustCenterAndTrim(img9, img9.width / 2, img9.height / 2);
        oImg8 = ih.adjustCenterAndTrim(img8, img8.width, 0);
        oImg7 = ih.adjustCenterAndTrim(img7, 3, 3);
        oImg6 = ih.adjustCenterAndTrim(img6, img6.width, img6.height);
        oImg5 = ih.adjustCenterAndTrim(img5, 0, img5.height);
        oImg4 = ih.adjustCenterAndTrim(img4, 4, 3);

        m = oImg4.center, //{ length: , angle: }
        img = oImg4.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 7 && img.width == 1, "img4 cut (individual rotation center)");
        assert.ok(round1000(x) == -3.5 && round1000(y) == -0.5, "img4 recentered (individual rotation center)");

        m = oImg5.center, //{ length: , angle: }
        img = oImg5.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 8 && img.width == 1, "img5 cut (individual rotation center)");
        assert.ok(round1000(x) == 9.5 && round1000(y) == 4, "img5 recentered (individual rotation center)");

        m = oImg6.center, //{ length: , angle: }
        img = oImg6.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 8 && img.width == 10, "img6 cut (individual rotation center)");
        assert.ok(round1000(x) == -5 && round1000(y) == 4, "img6 recentered (individual rotation center)");

        m = oImg7.center, //{ length: , angle: }
        img = oImg7.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 0 && img.width == 0, "img7 cut (individual rotation center)");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img7 recentered (individual rotation center)");

        m = oImg8.center, //{ length: , angle: }
        img = oImg8.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 4 && img.width == 4, "img8 cut (individual rotation center)");
        assert.ok(round1000(x) == -5 && round1000(y) == -4, "img8 recentered (individual rotation center)");

        m = oImg9.center, //{ length: , angle: }
        img = oImg9.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 602 && img.width == 471, "img9 cut (individual rotation center)");
        assert.ok(round1000(x) == 18.5 && round1000(y) == 48, "img9 recentered (individual rotation center)");

        //include vectors to bounding corners
        oImg4 = ih.adjustCenterAndTrim(img4, undefined, undefined, true);
        var tl = oImg4.tl;
        x = tl.length * Math.cos(tl.angle),
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == 4, "img4: tl corner vector");
        var tr = oImg4.tr;
        x = tr.length * Math.cos(tr.angle),
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == -4 && round1000(y) == 4, "img4: tr corner vector");
        var bl = oImg4.bl;
        x = bl.length * Math.cos(bl.angle),
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == -3, "img4: bl corner vector");
        var br = oImg4.br;
        x = br.length * Math.cos(br.angle),
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == -4 && round1000(y) == -3, "img4: br corner vector");

        oImg3 = ih.adjustCenterAndTrim(img3, undefined, undefined, true);
        tl = oImg3.tl;
        x = tl.length * Math.cos(tl.angle),
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == 3, "img3: tl corner vector");
        tr = oImg3.tr;
        x = tr.length * Math.cos(tr.angle),
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == 1 && round1000(y) == 3, "img3: tr corner vector");
        bl = oImg3.bl;
        x = bl.length * Math.cos(bl.angle),
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == -1, "img3: bl corner vector");
        br = oImg3.br;
        x = br.length * Math.cos(br.angle),
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == 1 && round1000(y) == -1, "img3: br corner vector");

        oImg7 = ih.adjustCenterAndTrim(img7, undefined, undefined, true);   //check transparent
        tl = oImg7.tl;
        assert.ok(tl.length == 0 && tl.angle == 0, "check return value on transparent images");

        done4();
    };
});



