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

        //var h = img8.naturalHeight,
        //    w = img8.naturalWidth;

        var oImg = ih.scale(img8, 2);
        assert.ok(oImg.naturalHeight == img8.naturalHeight * 2 && oImg.naturalWidth == img8.naturalWidth * 2, "upscaling proportions: h:" + oImg.naturalHeight + ", w:" + oImg.naturalWidth);

        var oImg2 = ih.scale(img9, 0.3);
        assert.ok(oImg2.naturalHeight == Math.ceil(img9.naturalHeight * 0.3) && oImg2.naturalWidth == Math.ceil(img9.naturalWidth * 0.3), "upscaling proportions: rounding h:" + oImg2.naturalHeight + ", w:" + oImg2.naturalWidth);

        done1();
        runTests_getImageTrimOffsets();
    };
    //helper function to alimit rounding errors
    var round1000 = function (value) {
        return Math.round(value * 1000) / 1000; 
    };

    //getImageTrimOffsets(img, scaling, rotation, top, right, bottom, left)
    var runTests_getImageTrimOffsets = function () {

        //simple
        var offsets = ih.getImageTrimOffsets(img1);
        assert.ok(offsets.top == 7 && offsets.right == 2 && offsets.bottom == 0 && offsets.left == 0, "simple: combined");
        offsets = ih.getImageTrimOffsets(img6);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "simple: filled");
        offsets = ih.getImageTrimOffsets(img7);  //transparent
        assert.ok(offsets.top == 8 && offsets.right == 10 && offsets.bottom == 8 && offsets.left == 10, "simple: transparent");
        offsets = ih.getImageTrimOffsets(img8);  //centered
        assert.ok(offsets.top == 2 && offsets.right == 3 && offsets.bottom == 2 && offsets.left == 3, "simple: centered");
        offsets = ih.getImageTrimOffsets(img9);
        assert.ok(offsets.top == 243 && offsets.right == 106 && offsets.bottom == 339 && offsets.left == 143, "simple: large");

        //scaled
        var offsets = ih.getImageTrimOffsets(img1, 0.5);
        assert.ok(offsets.top == 3 && offsets.right == 1 && offsets.bottom == 0 && offsets.left == 0, "scaled: combined");
        offsets = ih.getImageTrimOffsets(img6, 0.25);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "scaled: filled");
        offsets = ih.getImageTrimOffsets(img7, 2);  //transparent
        assert.ok(offsets.top == 16 && offsets.right == 20 && offsets.bottom == 16 && offsets.left == 20, "scaled: transparent");
        offsets = ih.getImageTrimOffsets(img8, 0.5);  //centered
        assert.ok(offsets.top == 1 && offsets.right == 1 && offsets.bottom == 1 && offsets.left == 1, "scaled: centered");
        offsets = ih.getImageTrimOffsets(img9, 0.1);
        assert.ok(offsets.top == 24 && offsets.right == 10 && offsets.bottom == 33 && offsets.left == 14, "scaled: large");

        //rotate: 90
        var offsets = ih.getImageTrimOffsets(img1, 1, 90);
        assert.ok(offsets.top == 0 && offsets.right == 7 && offsets.bottom == 2 && offsets.left == 0, "rotate: 90: combined");
        offsets = ih.getImageTrimOffsets(img6, 1, 90);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "rotate: 90: filled");
        offsets = ih.getImageTrimOffsets(img7, 1, 90);  //transparent
        assert.ok(offsets.top == 10 && offsets.right == 8 && offsets.bottom == 10 && offsets.left == 8, "rotate: 90: transparent");
        offsets = ih.getImageTrimOffsets(img8, 1, 90);  //centered
        assert.ok(offsets.top == 3 && offsets.right == 2 && offsets.bottom == 3 && offsets.left == 2, "rotate: 90: centered");
        offsets = ih.getImageTrimOffsets(img9, 1, 90);
        assert.ok(offsets.top == 143 && offsets.right == 243 && offsets.bottom == 106 && offsets.left == 339, "rotate: 90: large");

        //rotate:180 + scaled
        offsets = ih.getImageTrimOffsets(img1, 0.5, 180);
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 3 && offsets.left == 1, "rotate:180 + scaled: combined");
        offsets = ih.getImageTrimOffsets(img6, 0.25, 180);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "rotate:180 + scaled: filled");
        //this is a special case: due to roundings the image gets larger: 11*9 + scaling multiplies this effect, so the output can be 18 & 22
        offsets = ih.getImageTrimOffsets(img7, 2, 180);  //transparent:
        assert.ok(offsets.top == 18 && offsets.right == 22 && offsets.bottom == 18 && offsets.left == 22, "rotate:180 + scaled: transparent");
        offsets = ih.getImageTrimOffsets(img8, 0.5, 180);  //centered
        assert.ok(offsets.top == 1 && offsets.right == 1 && offsets.bottom == 1 && offsets.left == 1, "rotate:180 + scaled: centered");
        offsets = ih.getImageTrimOffsets(img9, 0.1, 180);
        assert.ok(offsets.top == 33 && offsets.right == 14 && offsets.bottom == 24 && offsets.left == 10, "rotate:180 + scaled: large");

        done2();
        runTests_adjustCenterAndTrim();
    };

    //adjustCenterAndTrim(img, rotationCenterX, rotationCenterY, includeBoundingCorners)
    var runTests_adjustCenterAndTrim = function () {

        //simple
        var oImg9 = ih.adjustCenterAndTrim(img9);  //we start with the slowest and hope that loading time will not effect our tests
        var oImg8 = ih.adjustCenterAndTrim(img8);
        var oImg7 = ih.adjustCenterAndTrim(img7);
        var oImg6 = ih.adjustCenterAndTrim(img6);
        var oImg5 = ih.adjustCenterAndTrim(img5);
        var oImg4 = ih.adjustCenterAndTrim(img4);
        var oImg3 = ih.adjustCenterAndTrim(img3);
        var oImg2 = ih.adjustCenterAndTrim(img2);
        var oImg1 = ih.adjustCenterAndTrim(img1);

        var m = oImg1.m, //{ length: , angle: }
            img = oImg1.image,
            x = m.length * Math.cos(m.angle),
            y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 1 && img.naturalWidth == 8, "img1 cut");
        assert.ok(round1000(x) == - 1 && round1000(y) == -3.5, "img1 recentered");

        m = oImg2.m, //{ length: , angle: }
        img = oImg2.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 1 && img.naturalWidth == 8, "img2 cut");
        assert.ok(round1000(x) == 1 && round1000(y) == 3.5, "img2 recentered");

        m = oImg3.m, //{ length: , angle: }
        img = oImg3.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 4 && img.naturalWidth == 4, "img3 cut");
        assert.ok(round1000(x) == -1 && round1000(y) == 1, "img3 recentered");

        m = oImg4.m, //{ length: , angle: }
        img = oImg4.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 7 && img.naturalWidth == 1, "img4 cut");
        assert.ok(round1000(x) == -4.5 && round1000(y) == 0.5, "img4 recentered");

        m = oImg5.m, //{ length: , angle: }
        img = oImg5.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 8 && img.naturalWidth == 1, "img5 cut");
        assert.ok(round1000(x) == 4.5 && round1000(y) == 0, "img5 recentered");

        m = oImg6.m, //{ length: , angle: }
        img = oImg6.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 8 && img.naturalWidth == 10, "img6 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img6 recentered");

        m = oImg7.m, //{ length: , angle: }
        img = oImg7.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 0 && img.naturalWidth == 0, "img7 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img7 recentered");

        m = oImg8.m, //{ length: , angle: }
        img = oImg8.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 4 && img.naturalWidth == 4, "img8 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img8 recentered");

        m = oImg9.m, //{ length: , angle: }
        img = oImg9.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 602 && img.naturalWidth == 471, "img9 cut");
        assert.ok(round1000(x) == 18.5 && round1000(y) == 48, "img9 recentered");

        //individual rotation center applied
        oImg9 = ih.adjustCenterAndTrim(img9, img9.naturalWidth / 2, img9.naturalHeight / 2);
        oImg8 = ih.adjustCenterAndTrim(img8, img8.naturalWidth, 0);
        oImg7 = ih.adjustCenterAndTrim(img7, 3, 3);
        oImg6 = ih.adjustCenterAndTrim(img6, img6.naturalWidth, img6.naturalHeight);
        oImg5 = ih.adjustCenterAndTrim(img5, 0, img5.naturalHeight);
        oImg4 = ih.adjustCenterAndTrim(img4, 4, 3);

        m = oImg4.m, //{ length: , angle: }
        img = oImg4.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 7 && img.naturalWidth == 1, "img4 cut (individual rotation center)");
        assert.ok(round1000(x) == -3.5 && round1000(y) == -0.5, "img4 recentered (individual rotation center)");

        m = oImg5.m, //{ length: , angle: }
        img = oImg5.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 8 && img.naturalWidth == 1, "img5 cut (individual rotation center)");
        assert.ok(round1000(x) == 9.5 && round1000(y) == 4, "img5 recentered (individual rotation center)");

        m = oImg6.m, //{ length: , angle: }
        img = oImg6.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 8 && img.naturalWidth == 10, "img6 cut (individual rotation center)");
        assert.ok(round1000(x) == -5 && round1000(y) == 4, "img6 recentered (individual rotation center)");

        m = oImg7.m, //{ length: , angle: }
        img = oImg7.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 0 && img.naturalWidth == 0, "img7 cut (individual rotation center)");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img7 recentered (individual rotation center)");

        m = oImg8.m, //{ length: , angle: }
        img = oImg8.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 4 && img.naturalWidth == 4, "img8 cut (individual rotation center)");
        assert.ok(round1000(x) == -5 && round1000(y) == -4, "img8 recentered (individual rotation center)");

        m = oImg9.m, //{ length: , angle: }
        img = oImg9.image,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.naturalHeight == 602 && img.naturalWidth == 471, "img9 cut (individual rotation center)");
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

        done3();
    };
});



