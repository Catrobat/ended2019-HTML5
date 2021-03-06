﻿/// <reference path="_resources/test.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
/// <reference path="../../Client/smartJs/sj-communication.js" />
'use strict';

QUnit.module("sj-communication.js");

QUnit.test("SmartJs.Communication: ServiceRequest", function (assert) {

	var req = new SmartJs.Communication.ServiceRequest();
	assert.equal(req.url, "", "ctr without url + getter");
	assert.ok(req instanceof SmartJs.Communication.ServiceRequest && req instanceof SmartJs.Core.EventTarget, "instance check");

	req = new SmartJs.Communication.ServiceRequest("myUrl");
	assert.equal(req.url, "myUrl", "ctr with url + getter");

	req.url = "myNewUrl";
	assert.equal(req.url, "myNewUrl", "url setter");

	assert.ok(req.onLoadStart instanceof SmartJs.Event.Event && req.onLoad instanceof SmartJs.Event.Event &&
		req.onError instanceof SmartJs.Event.Event && req.onProgressChange instanceof SmartJs.Event.Event &&
		req.onProgressSupportedChange instanceof SmartJs.Event.Event, "event initialization and getter");

	assert.equal(req.method, SmartJs.RequestMethod.GET, "request method: default");
	req.method = 'DELETE';
	assert.equal(req.method, SmartJs.RequestMethod.DELETE, "request method: setter");

	assert.equal(req.progressSupported, false, "progress supported: default");
	req.progressSupported = true;
	assert.equal(req.progressSupported, true, "progress supported: setter");

	req.dispose();
	assert.equal(req._disposed, true, "disposed");
	req = new SmartJs.Communication.ServiceRequest("myUrl");
	assert.ok(req instanceof SmartJs.Communication.ServiceRequest && req instanceof SmartJs.Core.EventTarget, "recheck instance after dispose and recreate");
	assert.ok(req.onLoadStart instanceof SmartJs.Event.Event && req.onLoad instanceof SmartJs.Event.Event &&
		req.onError instanceof SmartJs.Event.Event && req.onProgressChange instanceof SmartJs.Event.Event &&
		req.onProgressSupportedChange instanceof SmartJs.Event.Event, "recheck event initialization after dispose");

});


QUnit.test("SmartJs.Communication: XmlHttp", function (assert) {

	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();

	var req = new SmartJs.Communication.XmlHttpRequest();
	assert.equal(req.url, "", "ctr without url + getter");
	assert.ok(req instanceof SmartJs.Communication.XmlHttpRequest && req instanceof SmartJs.Communication.ServiceRequest, "instance check");

	assert.throws(function () { req.send(); }, Error, "ERROR: send without specified url");
	assert.throws(function () { req.sendData("invalid data", "GET", "url"); }, Error, "ERROR: send with invlaid data, != object");

	req = new SmartJs.Communication.XmlHttpRequest("http://www.pocketcodeTest.org");    //using a non existing domain
	assert.equal(req.url, "http://www.pocketcodeTest.org", "ctr with url + getter");
	assert.equal(req.supported, false, "support: checks external domain");

	req.dispose();
	assert.equal(req._disposed, true, "disposed");

	req = new SmartJs.Communication.XmlHttpRequest();
	assert.throws(function () { req.send(); }, Error, "ERROR: service url not specified");
	assert.throws(function () { req.sendData("eins", SmartJs.RequestMethod.POST); }, Error, "ERROR: invalid post data");

	req = new SmartJs.Communication.XmlHttpRequest(window.location);
	if (!req.supported) {
		assert.ok(false, "WARNING (no error): not all tests were executed due to browser incompatibility")
		done1();
		done2();
		done3();
		return;
	}

	//continue if supported
	assert.equal(req.supported, true, "support: same domain");

	//request
	var onLoadStart = 0,
		onLoad = 0,
		onError = 0,
		onAbort = 0,
		onProgressChange = 0,
		onProgressSupportedChange = 0;

	var onLoadStartHandler = function (e) {
		onLoadStart++;
		//validate request url
		assert.equal(req._url, "_resources/test.js?a=eins&b=2", "valid  request url params: GET");
		assert.equal(e.target, req, "onLoadStart target check");
		//console.log('onLoadStart ');
	};
	var onLoadStartHandler2 = function (e) {
		onLoadStart++;
		assert.equal(e.target, req2, "onLoadStart target check");
		//console.log('onLoadStart ');
	};
	var onLoadStartHandler3 = function (e) {
		onLoadStart++;
		assert.equal(e.target, req3, "onLoadStart target check");
		//console.log('onLoadStart ');
	};
	var onLoadHandler = function (e) {
		onLoad++;
		assert.equal(e.target, req, "onLoad target check");
		//console.log('onLoad ');
		//alert(onLoadStart + ", " + onProgressChange + ", " + onLoad + ", " + onError);
		if (e.target.progressSupported)
			assert.ok(onLoadStart === 1 && onProgressChange > 0 && onLoad === 1 && onError === 0, "ajax request: success: make sure you run the test on a server (including localhost) and not from local file system");
		else
			assert.ok(onLoadStart === 1 && onProgressChange == 0 && onLoad === 1 && onError === 0, "ajax request: success: make sure you run the test on a server (including localhost) and not from local file system");
		assert.ok(e.target.responseText.length > 0, "response text received");
		done1();

		runTest2();
	};
	var onErrorHandler = function (e) {
		onError++;
		assert.equal(e.target, req, "onError target check");
		//console.log('onError ');
	};
	//var onAbortHandler = function (e) {
	//    onAbort++;
	//    //console.log('onAbort ');
	//};
	var onProgressChangeHandler = function (e) {
		onProgressChange++;
		assert.equal(e.target, req, "onProgressChange target check");
		//console.log('onProgressChange ' + e.progress);
	};
	var onProgressChangeHandler2 = function (e) {
		onProgressChange++;
		assert.equal(e.target, req2, "onProgressChange target check");
		//console.log('onProgressChange ' + e.progress);
	};
	var onProgressChangeHandler3 = function (e) {
		onProgressChange++;
		assert.equal(e.target, req3, "onProgressChange target check");
		//console.log('onProgressChange ' + e.progress);
	};
	var onProgressSupportedChangeHandler = function (e) {
		onProgressSupportedChange++;
		assert.equal(e.target, req, "onProgressSupportedChange target check");
		//console.log('onProgressSupportedChange ' + e.progressSupport);
	};
	var onProgressSupportedChangeHandler2 = function (e) {
		onProgressSupportedChange++;
		assert.equal(e.target, req2, "onProgressSupportedChange target check");
		//console.log('onProgressSupportedChange ' + e.progressSupport);
	};
	var onProgressSupportedChangeHandler3 = function (e) {
		onProgressSupportedChange++;
		assert.equal(e.target, req3, "onProgressSupportedChange target check");
		//console.log('onProgressSupportedChange ' + e.progressSupport);
	};

	req = new SmartJs.Communication.XmlHttpRequest("_resources/test.js");

	req.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler, this));
	req.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
	req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler, this));
	//req.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
	req.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler, this));
	req.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler, this));

	//req.send();   -> moved to end of tests to assure all scripts were loaded

	//request fail: same origin
	var onLoadHandler2 = function (e) {
		onLoad++;
		assert.equal(e.target, req2, "onLoad target check");
		//console.log('onLoad ');
	};
	var onErrorHandler2 = function (e) {
		onError++;
		assert.equal(e.target, req2, "onError target check");
		//console.log('onError ');
		//alert(onLoadStart + ", " + onLoad + ", " + onError);
		assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "ajax request: fail (same origin policy)");
		//^^ onProgressChange > 0 && onLoad === 1 && on some browsers ?
		done2();

		runTest3();
	};

	var req2;

	var runTest2 = function () {
		onLoadStart = 0;
		onLoad = 0;
		onProgressChange = 0;
		//onError = 0;

		req2 = new SmartJs.Communication.XmlHttpRequest("https://www.w3schools.com/ajax/demo_get.asp");

		req2.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler2, this));
		req2.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler2, this));
		req2.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler2, this));
		//req2.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
		req2.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler2, this));
		req2.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler2, this));

		req2.send();
	};

	//request fail: missing endpoint
	var onLoadHandler3 = function (e) {
		onLoad++;
		assert.equal(e.target, req3, "onLoad target check");
		//console.log('onLoad ');
		//assert.ok(onLoadStart === 1 && onLoad === 1 && onError === 0, "ajax request: fail (missing endpoint)- no onError");
		//^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
		//done3();
	};
	var onErrorHandler3 = function (e) {
		onError++;
		assert.equal(e.target, req3, "onError target check");
		//console.log('onError ');
		assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "ajax request: fail (missing endpoint)");
		//^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
		done3();
	};

	var req3;
	var runTest3 = function () {
		onLoadStart = 0;
		onLoad = 0;
		onProgressChange = 0;
		onError = 0;

		req3 = new SmartJs.Communication.XmlHttpRequest("_resources/notExisting.json");

		req3.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler3, this));
		req3.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler3, this));
		req3.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler3, this));
		//req3.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
		req3.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler3, this));
		req3.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler3, this));

		req3.send();
	};

	req.sendData({ a: "eins", b: 2 }, SmartJs.RequestMethod.GET, "_resources/test.js"); //start async requests 
	//req.send(SmartJs.RequestMethod.GET, "_resources/test.js"); //start async requests 

	//var req5 = new SmartJs.Communication.CorsRequest();
	//assert.throws(function () { req5.send(); }, Error, "ERROR: service url not specified");
	//req5._url = "http://server.cors-api.appspot.com/server?id=5180691&enable=true&status=200&credentials=false&methods=GET%2C%20POST";
	//assert.throws(function () { req5.sendData("eins", SmartJs.RequestMethod.POST); }, Error, "ERROR: invalid post data");

});


QUnit.test("SmartJs.Communication: Cors", function (assert) {

	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	var done4 = assert.async();

	var req = new SmartJs.Communication.CorsRequest();
	assert.equal(req.url, "", "ctr without url + getter");
	assert.ok(req instanceof SmartJs.Communication.CorsRequest && req instanceof SmartJs.Communication.ServiceRequest, "instance check");

	req = new SmartJs.Communication.CorsRequest("myUrl");
	assert.equal(req.url, "myUrl", "ctr with url + getter");

	req.dispose();
	assert.equal(req._disposed, true, "disposed");

	req = new SmartJs.Communication.CorsRequest();
	assert.throws(function () { req.send(); }, Error, "ERROR: service url not specified");
	req._url = "ERROR: service url not specified";
	assert.throws(function () { req.sendData("eins", SmartJs.RequestMethod.POST); }, Error, "ERROR: invalid post data");

	if (!req.supported) {
		assert.ok(false, "WARNING (no error): not all tests were executed due to browser incompatibility")
		done1();
		done2();
		done3();
		done4();
		return;
	}


	//if supported: request
	assert.equal(req.supported, true, "support: checks for true");

	var onLoadStart = 0,
		onLoad = 0,
		onError = 0,
		onAbort = 0,
		onProgressChange = 0,
		onProgressSupportedChange = 0;

	var onLoadStartHandler = function (e) {
		onLoadStart++;
		//validate request url
		assert.equal(req._url, "https://web-test.catrob.at/html5/rest/v0.3/projects/824/details?a=eins&b=2", "valid  request url params: GET");
		assert.equal(e.target, req, "onLoadStart target check");
		//console.log('onLoadStart ');
	};
	var onLoadStartHandler2 = function (e) {
		onLoadStart++;
		assert.equal(e.target, req2, "onLoadStart target check");
		//console.log('onLoadStart ');
	};
	var onLoadStartHandler3 = function (e) {
		onLoadStart++;
		assert.equal(e.target, req3, "onLoadStart target check");
		//console.log('onLoadStart ');
	};
	var onLoadStartHandler4 = function (e) {
		onLoadStart++;
		assert.equal(e.target, req4, "onLoadStart target check");
		//console.log('onLoadStart ');
	};
	var onLoadHandler = function (e) {
		onLoad++;
		assert.equal(e.target, req, "onLoad target check");
		//console.log('onLoad ');
		assert.ok(onLoadStart === 1 && (onProgressChange > 0 || onProgressSupportedChange > 0) && onLoad === 1 && onError === 0, "cors request: success (make sure you call the test on a server or localhost and not from local file system)");
		//                              ^^ if progress is supported the event will trigger (Firefox), otherwise the support-change event is triggered (IE, Chrome)
		assert.ok(e.target.responseText.length > 0, "response text received");
		done1();

		runTest2();
	};
	var onErrorHandler = function (e) {
		assert.ok(false, "WARNING: cors call to https://web-test.catrob.at/html5/rest/v0.3/projects/824/details failed - this may be an error caused by the server");
		done1();

		runTest2();
	};
	//var onAbortHandler = function (e) {
	//    onAbort++;
	//    ////console.log('onAbort ');
	//};
	var onProgressChangeHandler = function (e) {
		onProgressChange++;
		assert.equal(e.target, req, "onProgressChange target check");
		//console.log('onProgressChange ' + e.progress);
	};
	var onProgressChangeHandler2 = function (e) {
		onProgressChange++;
		assert.equal(e.target, req2, "onProgressChange target check");
		//console.log('onProgressChange ' + e.progress);
	};
	var onProgressChangeHandler3 = function (e) {
		onProgressChange++;
		assert.equal(e.target, req3, "onProgressChange target check");
		//console.log('onProgressChange ' + e.progress);
	};
	var onProgressChangeHandler4 = function (e) {
		onProgressChange++;
		assert.equal(e.target, req4, "onProgressChange target check");
		//console.log('onProgressChange ' + e.progress);
	};
	var onProgressSupportedChangeHandler = function (e) {
		onProgressSupportedChange++;
		assert.equal(e.target, req, "onProgressSupportedChange target check");
		//console.log('onProgressSupportedChange ' + e.progressSupport);
	};
	var onProgressSupportedChangeHandler2 = function (e) {
		onProgressSupportedChange++;
		assert.equal(e.target, req2, "onProgressSupportedChange target check");
		//console.log('onProgressSupportedChange ' + e.progressSupport);
	};
	var onProgressSupportedChangeHandler3 = function (e) {
		onProgressSupportedChange++;
		assert.equal(e.target, req3, "onProgressSupportedChange target check");
		//console.log('onProgressSupportedChange ' + e.progressSupport);
	};
	var onProgressSupportedChangeHandler4 = function (e) {
		onProgressSupportedChange++;
		assert.equal(e.target, req4, "onProgressSupportedChange target check");
		//console.log('onProgressSupportedChange ' + e.progressSupport);
	};

	req = new SmartJs.Communication.CorsRequest("https://web-test.catrob.at/html5/rest/v0.3/projects/824/details");  //public service

	req.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler, this));
	req.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
	req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler, this));
	//req.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
	req.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler, this));
	req.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler, this));

	//req.send();   -> moved to end of tests to assure all scripts were loaded

	//request fail: same origin
	var onLoadHandler2 = function (e) {
		onLoad++;
		assert.equal(e.target, req2, "onLoad target check 2");
		//console.log('onLoad ');
	};
	var onErrorHandler2 = function (e) {
		onError++;
		assert.equal(e.target, req2, "onError target check 2");
		//console.log('onError ');
		assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "cors request: fail (cors not enabled)");
		//^^ onProgressChange > 0 && onLoad === 1 && on some browsers ?
		done2();

		runTest3();
	};

	var req2;
	var runTest2 = function () {
		onLoadStart = 0;
		onLoad = 0;
		onProgressChange = 0;

		req2 = new SmartJs.Communication.CorsRequest("https://www.w3schools.com/ajax/demo_get.asp");

		req2.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler2, this));
		req2.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler2, this));
		req2.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler2, this));
		//req2.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
		req2.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler2, this));
		req2.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler2, this));

		req2.send();
	};

	//request fail: missing endpoint
	var onLoadHandler3 = function (e) {
		onLoad++;
		assert.equal(e.target, req3, "onLoad target check 3");
		//console.log('onLoad ');
		//assert.ok(onLoadStart === 1 && onLoad === 1 && onError === 0, "ajax request: fail (missing endpoint)- no onError");
		//^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
		//done3();
	};
	var onErrorHandler3 = function (e) {
		onError++;
		assert.equal(e.target, req3, "onError target check 3");
		//console.log('onError ');
		assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "cors request: fail (missing endpoint)");
		//^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
		done3();

		runTest4();
	};

	var req3;
	var runTest3 = function () {
		onLoadStart = 0;
		onLoad = 0;
		onProgressChange = 0;
		onError = 0;

		req3 = new SmartJs.Communication.CorsRequest("_resources/notExisting.json");

		req3.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler3, this));
		req3.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler3, this));
		req3.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler3, this));
		//req3.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
		req3.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler3, this));
		req3.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler3, this));

		req3.send();
	};


	//cors to our service
	var onLoadHandler4 = function (e) {
		onLoad++;
		assert.equal(e.target, req4, "onLoad target check 4");
		//console.log('onLoad ');
		assert.ok(onLoadStart === 1 && onLoad === 1 && onError === 0, "cors request: consuming our service (https://web-test.catrob.at/)");
		var res = JSON.parse(e.target.responseText);
		assert.equal(res.id, 825, "response check");
		//^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
		done4();
	};
	var onErrorHandler4 = function (e) {
		//onError++;
		//assert.equal(e.target, req4, "onError target check 4");
		assert.ok(false, "WARNING: cors call to https://web-test.catrob.at/html5/rest/v0.3/projects/824/details failed - this may be an error caused by the server");
		done4();
		//console.log('onError ');
		//assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "cors request: fail (missing endpoint)");
		//^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
		//done4();
	};

	var req4;
	var runTest4 = function () {
		onLoadStart = 0;
		onLoad = 0;
		onProgressChange = 0;
		onError = 0;

		req4 = new SmartJs.Communication.CorsRequest();//"https://web-test.catrob.at/html5/rest/v0.3/projects/825");

		req4.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler4, this));
		req4.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler4, this));
		req4.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler4, this));
		//req4.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
		req4.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler4, this));
		req4.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler4, this));

		req4.send(SmartJs.RequestMethod.GET, "https://web-test.catrob.at/html5/rest/v0.3/projects/825");
	};



	//start async
	req.sendData({ a: "eins", b: 2 }, SmartJs.RequestMethod.GET, "https://web-test.catrob.at/html5/rest/v0.3/projects/824/details"); //start async requests 

	//var req5 = new SmartJs.Communication.CorsRequest();
	//assert.throws(function () { req5.send(); }, Error, "ERROR: service url not specified");
	//req5._url = "ERROR: service url not specified";
	//assert.throws(function () { req5.sendData("eins", SmartJs.RequestMethod.POST); }, Error, "ERROR: invalid post data");
});


QUnit.test("SmartJs.Communication: ResourceLoader", function (assert) {

	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	var done4 = assert.async();

	var rl = new SmartJs.Communication.ResourceLoader();
	assert.equal(rl.useSizeForProgressCalculation, false, "ctr without url + getter");
	assert.ok(rl instanceof SmartJs.Communication.ResourceLoader && rl instanceof SmartJs.Core.EventTarget, "instance check");
	assert.equal(rl.objClassName, "ResourceLoader", "objClassName check");

	assert.equal(rl._crossOriginProperty, undefined, "cross origin not set");
	rl.crossOriginProperty = "anonymous";
	assert.equal(rl._crossOriginProperty, "anonymous", "cross origin setter");
	//rl.crossOriginProperty = undefined;

	assert.throws(function () { rl.useSizeForProgressCalculation = "false"; }, Error, "ERROR: useSizeForProgressCalculation setter");
	rl.useSizeForProgressCalculation = true;
	assert.ok(rl.useSizeForProgressCalculation, "useSizeForProgressCalculation: getter + setter");

	assert.ok(rl.onProgressChange instanceof SmartJs.Event.Event && rl.onLoad instanceof SmartJs.Event.Event && rl.onError instanceof SmartJs.Event.Event, "event accessors");

	//simulate loading
	rl._loading = true;
	try {
		rl.useSizeForProgressCalculation = true;
		assert.ok(true, "size can be set but not changed during loading");
	}
	catch (e) {
		assert.ok(false, "size can be set but not changed during loading");
	}
	assert.throws(function () { rl.useSizeForProgressCalculation = false; }, Error, "ERROR: changing useSizeForProgressCalculation during loading");
	assert.throws(function () { rl.load(); }, Error, "ERROR: loading in progress- ");
	rl._loading = false;


	var onLoadCount = 0,
		onErrorCount = 0,
		onProgressCount = 0;
	var onProgressInfo = [],
		onErrorInfo = undefined;

	var onLoadHandler = function (e) {
		onLoadCount++;
	};
	var onErrorHandler = function (e) {
		onErrorCount++;
		onErrorInfo = e;
	};
	var onProgressHandler = function (e) {
		onProgressCount++;
		onProgressInfo.push(e);
	};

	var onLoadListener = new SmartJs.Event.EventListener(onLoadHandler),
		onErrorListener = new SmartJs.Event.EventListener(onErrorHandler),
		onProgressListener = new SmartJs.Event.EventListener(onProgressHandler);

	rl.onLoad.addEventListener(onLoadListener);
	rl.onError.addEventListener(onErrorListener);
	rl.onProgressChange.addEventListener(onProgressListener);

	//empty list
	var files = [];
	rl.load(files);
	assert.ok(onLoadCount == 1 && onErrorCount == 0 && onProgressCount == 0, "loading empty list");
	onLoadCount = 0;

	rl.useSizeForProgressCalculation = false;
	files = [{ type: 'mp3', url: '_resources/test.js' }];
	assert.throws(function () { rl.load(files); }, Error, "ERROR: unsupported file type");

	rl.useSizeForProgressCalculation = true;
	files = [{ type: 'js', url: '_resources/test.js' }];
	assert.throws(function () { rl.registerFiles("files"); }, Error, "ERROR: invalid list argument");
	assert.throws(function () { rl.registerFiles(files); }, Error, "ERROR: useSizeForProgressCalculation set but no size provided");
	rl.useSizeForProgressCalculation = false;

	files = [{ type: 'js', url: '_resources/test.js', size: 12 },
			 { type: 'js', url: '_resources/test2.js', size: 24 }];
	rl.registerFiles(files);
	assert.ok(rl._registeredFiles[0] === files[0] && rl._registeredFiles[1] === files[1], "file loaded");
	assert.equal(rl._totalSize, 0, "file size not set: useSizeForProgressCalculation == false");

	//load
	files = [{ type: 'js', url: '_resources/test.js', size: 12 }];

	var onLoadHandler2 = function () {
		onLoadCount++;
		assert.ok(onProgressCount === 1 && onLoadCount === 1, "file loaded");
		assert.ok(onProgressInfo[0].progress === 100 && onProgressInfo[0].target === rl && onProgressInfo[0].element instanceof HTMLElement && onProgressInfo[0].file == files[0], "file loaded: progress information");
		done1();

		//cleanup: DOM
		for (var i = 0, l = onProgressInfo.length; i < l; i++) {
			try {
				document.removeChild(onProgressInfo[i].element);
			}
			catch (e) { }
		}
		window.setTimeout(function () { runTests2(); }, 20);
	};

	rl.onLoad.removeEventListener(onLoadListener);
	onLoadListener = new SmartJs.Event.EventListener(onLoadHandler2);
	rl.onLoad.addEventListener(onLoadListener);

	rl.load(files);
	assert.throws(function () { rl.registerFiles(files); }, Error, "ERROR: register files during load");

	//abort loading
	var runTests2 = function () {
		onLoadCount = 0,
		onErrorCount = 0,
		onProgressCount = 0,
		onProgressInfo = [],
		onErrorInfo = undefined;

		files = [{ type: 'js', url: '_resources/test.js', size: 12 },
				{ type: 'js', url: '_resources/test.js', size: 12 },
				{ type: 'js', url: '_resources/test2.js', size: 12 },
				{ type: 'css', url: '_resources/test.css', size: 12 },
				{ type: 'css', url: '_resources/test2.css', size: 12 },
				{ type: 'css', url: '_resources/test.css', size: 12 },
				{ type: 'img', url: '_resources/img1.png', size: 12 },
				{ type: 'img', url: '_resources/img2.png', size: 12 },
		];
		var onLoadHandler3 = function (e) {
			onLoadCount++;
		};
		rl.onLoad.removeEventListener(onLoadListener);
		onLoadListener = new SmartJs.Event.EventListener(onLoadHandler3);
		rl.onLoad.addEventListener(onLoadListener);

		rl.load(files);
		rl.abortLoading();

		assert.ok(/*onProgressCount >= 0 && */onLoadCount == 0, "loading aborted");  //no events are triggered- if there is a timing issue onProgressCount will be set (error may occur on other tests?)
		onProgressCount = 0;
		done2();

		//cleanup: DOM
		for (var i = 0, l = onProgressInfo.length; i < l; i++) {
			try {
				document.removeChild(onProgressInfo[i].element);
			}
			catch (e) { }
		}
		window.setTimeout(function () { runTests3(); }, 20);
	};

	//combined example using size properties
	var runTests3 = function () {
		onLoadCount = 0,
		onErrorCount = 0,
		onProgressCount = 0,
		onProgressInfo = [],
		onErrorInfo = undefined;

		files = [{ type: 'js', url: '_resources/test.js', size: 3 },
				{ type: 'js', url: '_resources/test.js', size: 5 },
				{ type: 'js', url: '_resources/test2.js', size: 7 },
				{ type: 'css', url: '_resources/test.css', size: 13 },
				{ type: 'css', url: '_resources/test2.css', size: 15 },
				{ type: 'css', url: '_resources/test.css', size: 17 },
				{ type: 'img', url: '_resources/img1.png', size: 40 },
				{ type: 'img', url: '_resources/img2.png', size: 20 },
				{ type: 'img', url: '_resources/img3.png', size: 20 },
				{ type: 'img', url: '_resources/img4.png', size: 20 },
				{ type: 'img', url: '_resources/img5.png', size: 20 },
				{ type: 'img', url: '_resources/img2.png', size: 20 },
		];
		var onLoadHandler4 = function (e) {
			onLoadCount++;
			assert.ok(onLoadCount == 1 && onProgressCount == 12, "all files loaded");
			assert.equal(onProgressInfo[0].element, onProgressInfo[1].element, "files not added to DOM more than once");
			assert.equal(onProgressInfo[files.length - 1].progress, 100, "final progress = 100");
			done3();

			//cleanup: DOM
			for (var i = 0, l = onProgressInfo.length; i < l; i++) {
				try {
					document.removeChild(onProgressInfo[i].element);
				}
				catch (e) { }
			}
			runTests4();
		};
		rl.useSizeForProgressCalculation = true;
		rl.onLoad.removeEventListener(onLoadListener);
		onLoadListener = new SmartJs.Event.EventListener(onLoadHandler4);
		rl.onLoad.addEventListener(onLoadListener);

		//rl.useSizeForProgressCalculation = false;
		rl.load(files);
		assert.equal(rl._totalSize, 200, "internal: size calculated during initialization");
		assert.equal(rl._registeredFiles.length, 12, "all files registered");
	};


	////loading error
	var runTests4 = function () {
		onLoadCount = 0,
		onErrorCount = 0,
		onProgressCount = 0,
		onProgressInfo = [],
		onErrorInfo = undefined;

		files = [{ type: 'js', url: '_resources/test.js', size: 12 },
				{ type: 'js', url: '_resources/test.js', size: 12 },
				{ type: 'js', url: '_resources/testFAIL.js', size: 12 },
				//{ type: 'css', url: '_resources/testFAIL.css', size: 12 },  //missing css files are not detected
		];
		var onLoadHandler5 = function (e) {
			onLoadCount++;
		};
		var onErrorHandler5 = function (e) {
			onErrorCount++;
			onErrorInfo = e;

			//validate
			assert.ok(onProgressCount === 2 && onErrorCount == 1 && onLoadCount == 0, "events triggered correctly onError");
			assert.equal(onErrorInfo.file, files[2], "error event file info");
			assert.ok(onProgressInfo[0].progress == 33 && onProgressInfo[1].progress == 67, "progress information (received)");
			done4();
		};

		rl.onLoad.removeEventListener(onLoadListener);
		onLoadListener = new SmartJs.Event.EventListener(onLoadHandler5);
		rl.onLoad.addEventListener(onLoadListener);
		rl.onError.removeEventListener(onErrorListener);
		onErrorListener = new SmartJs.Event.EventListener(onErrorHandler5);
		rl.onError.addEventListener(onErrorListener);

		rl.load(files);
	};

	//dispose
	var rl_d = new SmartJs.Communication.ResourceLoader();
	rl_d.dispose();
	assert.equal(rl_d._disposed, true, "disposed correctly");
	
});

