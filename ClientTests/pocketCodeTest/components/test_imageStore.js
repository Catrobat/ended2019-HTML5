/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/imageStore.js" />
'use strict';

QUnit.module("imageStore.js");


QUnit.test("ImageStore: ctr & loading", function (assert) {

	var done1 = assert.async();
	var done2 = assert.async();

	var is = new PocketCode.ImageStore();
	assert.ok(is instanceof PocketCode.ImageStore && is instanceof SmartJs.Core.EventTarget, "instance check");
	assert.ok(is.onLoad === is._resourceLoader.onLoad && is.onLoadingError === is._resourceLoader.onError &&
		is.onLoadingProgressChange instanceof SmartJs.Event.Event, "event binding and accessors");

	//init tests
	var baseUrl = "_resources/images/",
	images = [  { "id": "s1", "url": "imgHelper1.png", "size": 2 },
				{ "id": "s2", "url": "imgHelper2.png", "size": 8 }
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

	//add listeners
	is.onLoadingProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressHandler));
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
		images = [{ "id": "s1", "url": "imgHelper1.png", "size": 2 },
				{ "id": "s2", "url": "imgHelperFAIL.png", "size": 8 }
		];

		is.loadImages(baseUrl, images);
	};

	startTest1();
});

QUnit.test("ImageStore: preprocessing", function (assert) {

	assert.ok(true, "TODO");
});

QUnit.test("ImageStore: caching", function (assert) {

	assert.ok(true, "TODO");
});



