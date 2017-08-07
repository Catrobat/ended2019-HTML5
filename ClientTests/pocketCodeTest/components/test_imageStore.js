/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/imageStore.js" />
'use strict';

QUnit.module("components/imageStore.js");


QUnit.test("ImageStore: init and loading", function (assert) {

	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();

	var is = new PocketCode.ImageStore();

	assert.ok(is instanceof PocketCode.ImageStore && is instanceof SmartJs.Core.EventTarget, "instance check");
	assert.ok(is.onLoad === is._resourceLoader.onLoad && is.onLoadingError === is._resourceLoader.onError &&
		is.onLoadingProgress instanceof SmartJs.Event.Event, "event binding and accessors");

    //mappings
	assert.equal(is.onLoad, is._resourceLoader.onLoad, "mapping: onLoad");
	assert.equal(is.onLoadingError, is._resourceLoader.onError, "mapping: onLoadingError");

    //abort loading
	var aborted = false;
	is._resourceLoader.abortLoading = function () { //override for test
	    aborted = true;
	};
	is.abortLoading();
	assert.ok(aborted, "calling aborted");
	is = new PocketCode.ImageStore();   //recreate

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
		startTest3();
	};
	var onProgressHandler = function (e) {
		onProgressCount++;
		onProgressInfo.push(e);
	};

	assert.throws(function () { is.loadImages("", "list"); }, Error, "invalid file list");

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

    //image getter, dispose
	var startTest3 = function () {
	    var img = is.getImage("s1");
	    assert.ok(img.canvas instanceof HTMLCanvasElement, "image getter = object including canvas");
        assert.throws(function () { is.getImage("s1_NOT_FOUND"); }, Error, "ERROR: image not found");

        is.dispose();
        assert.ok(is._disposed, "disposed");
	    done3();
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
        var img;
        assert.throws(function () { img = is.getImage("i10"); }, Error, "ERROR: img not found");
        img = is.getImage("i1");
        assert.ok(img && img.canvas instanceof HTMLCanvasElement && img.center !== undefined && img !== is._images.i1.img, "make sure the delivered img is a copy and therefor cannot overwritten");

        done1();
    };

});
