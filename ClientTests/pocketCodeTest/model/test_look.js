/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/look.js" />
'use strict';

QUnit.module("model/look.js");

QUnit.test("Look", function (assert) {

    var jsonLook = { id: "id", resourceId: "imgId", name: "lookName", rotationCenterX: 1, rotationCenterY: 2 };
    var l = new PocketCode.Model.Look(jsonLook);

    assert.ok(l instanceof PocketCode.Model.Look, "instance created correctly");
    assert.equal(l.id, "id", "look id getter");
    assert.equal(l.imageId, "imgId", "image id getter");
    assert.equal(l.name, "lookName", "look name getter");
    assert.equal(l.id, "id", "look id getter");
    assert.ok(l._rotationCenterX == 1 && l._rotationCenterY == 2, "roationCenter: internal ctr setter");
    assert.deepEqual(l.center, { length: 0.0, angle: 0.0 }, "center initial and getter");

});

QUnit.test("Look: preprocessing & caching", function (assert) {

    var done1 = assert.async();
    var is = new PocketCode.ImageStore();

    //init tests
    var baseUrl = "_resources/images/",
	images = [
		{ id: "i1", url: "imgHelper1.png", size: 1 },
		{ id: "i2", url: "imgHelper2.png", size: 1 },
		{ id: "i3", url: "imgHelper3.png", size: 1 },
		{ id: "i4", url: "imgHelper4.png", size: 1 },
		{ id: "i5", url: "imgHelper5.png", size: 1 },
		{ id: "i6", url: "imgHelper6.png", size: 1 },
		{ id: "i7", url: "imgHelper7.png", size: 1 },
		{ id: "i8", url: "imgHelper8.png", size: 1 },
		{ id: "i9", url: "imgHelper9.png", size: 1 },
		{ id: "i11", url: "imgHelper11.png", size: 1 },
	];


    var onLoadCount = 0;
    var onLoadHandler = function (e) {
        onLoadCount++;

        startTest();
    };
    is.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler));
    is.loadImages(baseUrl, images);

    var startTest = function () {

        var jsonLook = { id: "id", resourceId: "i1", name: "lookName" };    //without rotationCenter
        var l = new PocketCode.Model.Look(jsonLook);

        var img = is.getImage("i1");
        l.init(img); //loading from image store directly instead of handling through GameEngine

        assert.equal(l.canvas, img.canvas, "canvas getter");
        assert.deepEqual(l.center, img.center, "center getter");
        assert.deepEqual(l.tl, img.tl, "top left getter");
        assert.deepEqual(l.tr, img.tr, "top right getter");
        assert.deepEqual(l.bl, img.bl, "bottom left getter");
        assert.deepEqual(l.br, img.br, "bottom right getter");

        l = new PocketCode.Model.Look({ id: "id", resourceId: "i1", name: "lookName", rotationCenterX: "a", rotationCenterY: 20 });
        assert.throws(function () { l.init(img); }, Error, "ERROR: init called with invalid rotation center set");

        l = new PocketCode.Model.Look({ id: "id", resourceId: "i1", name: "lookName", rotationCenterX: 10, rotationCenterY: 20 });
        l.init(img);    //now, the center and edges get adjusted due to an individual rotation center

        //check positions based on rotation center x/y: pointing from the image top left corner to its rotation center
        //TL: "rotationCenterX": 22, "rotationCenterY": 2
        //TR: "rotationCenterX": 71, "rotationCenterY": 18
        //BL: "rotationCenterX": 13, "rotationCenterY": 98
        //BR: "rotationCenterX": 76, "rotationCenterY": 100


        //look boundary: getBoundary(spriteId, lookId, scaling, rotation, flipX, pixelAccuracy)
        var l1 = new PocketCode.Model.Look(jsonLook);
        l1.init(is.getImage("i1"));
        var l2 = new PocketCode.Model.Look(jsonLook);
        l2.init(is.getImage("i2"));
        var l3 = new PocketCode.Model.Look(jsonLook);
        l3.init(is.getImage("i3"));
        var l4 = new PocketCode.Model.Look(jsonLook);
        l4.init(is.getImage("i4"));
        var l5 = new PocketCode.Model.Look(jsonLook);
        l5.init(is.getImage("i5"));
        var l6 = new PocketCode.Model.Look(jsonLook);
        l6.init(is.getImage("i6"));
        var l7 = new PocketCode.Model.Look(jsonLook);
        l7.init(is.getImage("i7"));
        var l8 = new PocketCode.Model.Look(jsonLook);
        l8.init(is.getImage("i8"));
        var l9 = new PocketCode.Model.Look(jsonLook);
        l9.init(is.getImage("i9"));

        var b = l1.getBoundary(1.0, 0.0);
        assert.ok(b.top >= -3 && b.right >= 3 && b.bottom <= -4 && b.left <= -5, "img1: corner check");
        b = l1.getBoundary(1.0, 90.0);
        assert.ok(b.top >= 5 && b.right >= -3 && b.bottom <= -3 && b.left <= -4, "img1: 90° corner check");
        b = l1.getBoundary(1.0, 180.0);
        assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= 3 && b.left <= -3, "img1: 180° corner check");
        b = l1.getBoundary(1.0, 360.0);
        assert.ok(b.top >= -3 && b.right >= 3 && b.bottom <= -4 && b.left <= -5, "img1: 360° corner check");

        b = l2.getBoundary(1.0, 0.0);
        assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= 3 && b.left <= -3, "img2: corner check");

        b = l3.getBoundary(1.0, 0.0);
        assert.ok(b.top >= 3 && b.right >= 1 && b.bottom <= -1 && b.left <= -3, "img3: corner check");

        b = l4.getBoundary(1.0, 0.0);
        assert.ok(b.top >= 5 && b.right >= -4 && b.bottom <= -4 && b.left <= -5, "img4: corner check");

        b = l5.getBoundary(1.0, 0.0);
        assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= -4 && b.left <= 4, "img5: corner check");

        b = l6.getBoundary(1.0, 0.0);   //full
        assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= -4 && b.left <= -5, "img6: corner check");

        b = l7.getBoundary(1.0, 0.0);   //transparent
        assert.ok(b.top >= 0 && b.right >= 0 && b.bottom <= 0 && b.left <= 0, "img7: corner check");

        b = l8.getBoundary(1.0, 0.0);
        assert.ok(b.top >= 2 && b.right >= 2 && b.bottom <= -2 && b.left <= -2, "img8: corner check");

        b = l9.getBoundary(1.0, 0.0);
        assert.ok(b.top >= 349 && b.right >= 254 && b.bottom <= -253 && b.left <= -217, "img9: corner check");
        //^^ I checked this with the mathematical measurements: there is a rounding error that is higher on small images (what's totally ok)
        //please notice that the offsets already include an offset caused by moving the rotation point (took me a while to figure out the differences when calculating the test data)

        //if not rotated, pixelAccuracy should be true
        assert.equal(b.pixelAccuracy, true, "pixelAccuracy set for unrotated objects");
        b = l1.getBoundary(1.0, 90.0);
        assert.equal(b.pixelAccuracy, false, "pixelAccuracy not set for rotated objects");

        //check lookCache
        var lookCache = l9._cache;//is._lookCache[spriteId]["i9"];
        assert.ok(lookCache.scaling !== undefined && lookCache.rotation !== undefined && lookCache.top !== undefined && lookCache.right !== undefined && lookCache.bottom !== undefined && lookCache.left !== undefined, "boundary lookCached correctly");
        b = l9.getBoundary(1.0, 0.0);   //loading from lookCache: pixelAccurancy = true
        assert.ok(b.top >= 349 && b.right >= 254 && b.bottom <= -253 && b.left <= -217, "img9 from cache: corner check (not rotated)");
        b = l1.getBoundary(1.0, 90.0);
        assert.ok(b.top >= 5 && b.right >= -3 && b.bottom <= -3 && b.left <= -4, "img1 from cache: corner check (rotated)");

        lookCache = l1._cache;//is._lookCache[spriteId]["i1"];
        assert.ok(lookCache.scaling == 1 && lookCache.rotation == 90 && lookCache.top !== undefined && lookCache.right !== undefined && lookCache.bottom !== undefined && lookCache.left !== undefined, "boundary lookCached correctly: update");

        //flipped horizontal
        b = l1.getBoundary(1.0, 90.0, true);
        assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X");
        //flipped horizontal (from cache)
        b = l1.getBoundary(1.0, 90.0, true);
        assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X (from cache)");
        assert.equal(b.pixelAccuracy, false, "pixelAccuracy not set for rotated objects");

        //pixelAccuracy: rotated
        b = l1.getBoundary(1.0, 90.0, false, true);
        assert.equal(b.pixelAccuracy, true, "pixelAccuracy set when requested (loaded init boundary from cache)");
        assert.ok(b.top >= 5 && b.right >= -3 && b.bottom <= -3 && b.left <= -4, "boundary not changed: 0, 90, 180, -90 will always return exact boundaries (even we search them)");

        //pixelAccuracy: flipped look
        //is._lookCache[spriteId]["i1"] = {}; //clear cache
        b = l1.getBoundary(1.0, 0.0, false);    //reset
        b = l1.getBoundary(1.0, 90.0, true, true);
        assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X: pixelAccuracy");
        b = l1.getBoundary(1.0, 90.0, true, true);
        assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X: pixelAccuracy (from cache)");
        b = l1.getBoundary(1.0, 180.0);    //reset
        b = l1.getBoundary(1.0, 180.0, true, true);
        assert.ok(b.top >= 4 && b.right >= 3 && b.bottom <= 3 && b.left <= -5, "img1: 180°, flipped + pixelAccurency");

        //img 11
        b = l1.getBoundary(1.0, 45.0, false, false);
        var b2 = l1.getBoundary(1.0, 45.0, false, true);
        assert.ok(b2.top < b.top && b2.bottom > b.bottom, "make sure pixel-based operation is successful");

        done1();
    };

});

