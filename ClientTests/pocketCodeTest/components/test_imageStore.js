/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/imageStore.js" />
'use strict';

QUnit.module("imageStore.js");


QUnit.test("ImageStore: init and loading", function (assert) {

	var done1 = assert.async();
	var done2 = assert.async();

	var is = new PocketCode.ImageStore();

	assert.ok(is instanceof PocketCode.ImageStore && is instanceof SmartJs.Core.EventTarget, "instance check");
	assert.ok(is.onLoad === is._resourceLoader.onLoad && is.onLoadingError === is._resourceLoader.onError &&
		is.onLoadingProgress instanceof SmartJs.Event.Event, "event binding and accessors");

	//init tests
	var baseUrl = "_resources/images/",
	images = [
		{ id: "s1", url: "imgHelper1.png", size: 2 },
		{ id: "s2", url: "imgHelper2.png", size: 8 },
	];

	var onLoadCount = 0,
		onErrorCount = 0,
		onProgressCount = 0;
	var onProgressInfo = [],
		onErrorInfo = undefined;

	var onLoadHandler = function (e) {
		onLoadCount++;

		assert.ok(onLoadCount === 1 && onProgressCount === 2 && onErrorCount === 0, "events fired correctly: load");
		assert.ok(onProgressInfo[0].progress == 20 && onProgressInfo[1].progress == 100, "progress information received: load");

		done1();
		startTest2();
	};
	var onErrorHandler = function (e) {
		onErrorCount++;
		onErrorInfo = e;

		assert.ok(onLoadCount === 0 && onProgressCount === 1 && onErrorCount === 1, "events fired correctly: load");
		assert.ok(onProgressInfo[0].progress == 20 && onProgressInfo.length == 1, "progress information received: load");
		assert.equal(onErrorInfo.file, images[1], "error event file info");
		done2();
	};
	var onProgressHandler = function (e) {
		onProgressCount++;
		onProgressInfo.push(e);
	};

	assert.throws(function () { is.loadImages("", "list"); }, Error, "invalid fiel list");

	//add listeners
	is.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(onProgressHandler));
	is.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler));
	is.onLoadingError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler));

	//test with progress and onLoad
	var startTest1 = function () {

		is.loadImages(baseUrl, images);
	};


	//test with error
	var startTest2 = function () {

		onLoadCount = 0,
		onErrorCount = 0,
		onProgressCount = 0,
		onProgressInfo = [];
		images = [
			{ id: "s1", url: "imgHelper1.png", size: 2 },
			{ id: "s2", url: "imgHelperFAIL.png", size: 8 },
		];

		is.loadImages(baseUrl, images);
	};

	startTest1();

});

QUnit.test("ImageStore: preprocessing & caching", function (assert) {

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
	is.loadImages(baseUrl, images, 0.5); //do not apply an initial scaling as this has an impact on corner calculations

	var startTest = function () {
		//init look: please notice: as we do not have individual look objects right now, but individual rotation centers are supported right now, I have to test the private method here
		//this should be changed as soon as look objects get introduced
		assert.throws(function () { is._initLook("i1", 0, "not a number"); }, Error, "ERROR: invalid parameter: rotation center");
		var look = is._initLook("i1", 0, 0);
		assert.ok(look && look.canvas instanceof HTMLCanvasElement && look.center !== undefined, "quick check on look return: data check already handled in imageHelper.js");

		assert.throws(function () { look = is.getLook("i10"); }, Error, "ERROR: look not found");
		look = is.getLook("i1");
		assert.ok(look && look.canvas instanceof HTMLCanvasElement && look.center !== undefined && look !== is._images.i1.look, "make sure the delivered look is a copy and therefor cannot overwritten");

		//look boundary: getLookBoundary(spriteId, lookId, scaling, rotation, flipX, pixelAccuracy)
		var spriteId = "test";
		var b = is.getLookBoundary(spriteId, "i1", 1, 0);
		assert.ok(b.top >= -3 && b.right >= 3 && b.bottom <= -4 && b.left <= -5, "img1: corner check");
		b = is.getLookBoundary(spriteId, "i1", 1, 90);
		assert.ok(b.top >= 5 && b.right >= -3 && b.bottom <= -3 && b.left <= -4, "img1: 90° corner check");
		b = is.getLookBoundary(spriteId, "i1", 1, 180);
		assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= 3 && b.left <= -3, "img1: 180° corner check");
		b = is.getLookBoundary(spriteId, "i1", 1, 360);
		assert.ok(b.top >= -3 && b.right >= 3 && b.bottom <= -4 && b.left <= -5, "img1: 360° corner check");

		b = is.getLookBoundary(spriteId, "i2", 1, 0);
		assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= 3 && b.left <= -3, "img2: corner check");

		b = is.getLookBoundary(spriteId, "i3", 1, 0);
		assert.ok(b.top >= 3 && b.right >= 1 && b.bottom <= -1 && b.left <= -3, "img3: corner check");

		b = is.getLookBoundary(spriteId, "i4", 1, 0);
		assert.ok(b.top >= 5 && b.right >= -4 && b.bottom <= -4 && b.left <= -5, "img4: corner check");

		b = is.getLookBoundary(spriteId, "i5", 1, 0);
		assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= -4 && b.left <= 4, "img5: corner check");

		b = is.getLookBoundary(spriteId, "i6", 1, 0);   //full
		assert.ok(b.top >= 4 && b.right >= 5 && b.bottom <= -4 && b.left <= -5, "img6: corner check");

		b = is.getLookBoundary(spriteId, "i7", 1, 0);   //transparent
		assert.ok(b.top >= 0 && b.right >= 0 && b.bottom <= 0 && b.left <= 0, "img7: corner check");

		b = is.getLookBoundary(spriteId, "i8", 1, 0);
		assert.ok(b.top >= 2 && b.right >= 2 && b.bottom <= -2 && b.left <= -2, "img8: corner check");

		b = is.getLookBoundary(spriteId, "i9", 1, 0);
		assert.ok(b.top >= 349 && b.right >= 254 && b.bottom <= -253 && b.left <= -217, "img9: corner check");
		//^^ I checked this with the mathematical measurements: there is a rounding error that is higher on small images (what's totally ok)
		//please notice that the offsets already include an offset caused by moving the rotation point (took me a while to figure out the differences when calculating the test data)

		//if not rotated, pixelAccuracy should be true
		assert.equal(b.pixelAccuracy, true, "pixelAccuracy set for unrotated objects");
		b = is.getLookBoundary(spriteId, "i1", 1, 90);
		assert.equal(b.pixelAccuracy, false, "pixelAccuracy not set for rotated objects");

		//check lookCache
		var lookCache = is._lookCache[spriteId]["i9"];
		assert.ok(lookCache.scaling !== undefined && lookCache.rotation !== undefined && lookCache.top !== undefined && lookCache.right !== undefined && lookCache.bottom !== undefined && lookCache.left !== undefined, "boundary lookCached correctly");
		b = is.getLookBoundary(spriteId, "i9", 1, 0);   //loading from lookCache: pixelAccurancy = true
		assert.ok(b.top >= 349 && b.right >= 254 && b.bottom <= -253 && b.left <= -217, "img9 from cache: corner check (not rotated)");
		b = is.getLookBoundary(spriteId, "i1", 1, 90);
		assert.ok(b.top >= 5 && b.right >= -3 && b.bottom <= -3 && b.left <= -4, "img1 from cache: corner check (rotated)");

		var lookCache = is._lookCache[spriteId]["i1"];
		assert.ok(lookCache.scaling == 1 && lookCache.rotation == 90 && lookCache.top !== undefined && lookCache.right !== undefined && lookCache.bottom !== undefined && lookCache.left !== undefined, "boundary lookCached correctly: update");

		//flipped horizontal
		b = is.getLookBoundary(spriteId, "i1", 1, 90, true);
		assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X");
		//flipped horizontal (from cache)
		b = is.getLookBoundary(spriteId, "i1", 1, 90, true);
		assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X (from cache)");
		assert.equal(b.pixelAccuracy, false, "pixelAccuracy not set for rotated objects");

	    //pixelAccuracy: rotated
		b = is.getLookBoundary(spriteId, "i1", 1, 90, false, true);
		assert.equal(b.pixelAccuracy, true, "pixelAccuracy set when requested (loaded init boundary from cache)");
		assert.ok(b.top >= 5 && b.right >= -3 && b.bottom <= -3 && b.left <= -4, "boundary not changed: 0, 90, 180, -90 will always return exact boundaries (even we search them)");

	    //pixelAccuracy: flipped look
		//is._lookCache[spriteId]["i1"] = {}; //clear cache
		b = is.getLookBoundary(spriteId, "i1", 1, 0, false);    //reset
		b = is.getLookBoundary(spriteId, "i1", 1, 90, true, true);
		assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X: pixelAccuracy");
		b = is.getLookBoundary(spriteId, "i1", 1, 90, true, true);
		assert.ok(b.top >= 5 && b.right >= 4 && b.bottom <= -3 && b.left <= 3, "img1: 90° flipped X: pixelAccuracy (from cache)");
		b = is.getLookBoundary(spriteId, "i1", 1, 180);    //reset
		b = is.getLookBoundary(spriteId, "i1", 1, 180, true, true);
		assert.ok(b.top >= 4 && b.right >= 3 && b.bottom <= 3 && b.left <= -5, "img1: 180°, flipped + pixelAccurency");

	    //img 11
		b = is.getLookBoundary(spriteId, "i11", 1, 45, false, false);
		var b2 = is.getLookBoundary(spriteId, "i11", 1, 45, false, true);
		assert.ok(b2.top < b.top && b2.bottom > b.bottom, "make sure pixel-based operation is successful");


		done1();
	};

});



