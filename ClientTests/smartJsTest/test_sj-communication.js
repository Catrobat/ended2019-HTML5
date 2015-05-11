/// <reference path="../qunit/qunit-1.16.0.js" />
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

    req = new SmartJs.Communication.XmlHttpRequest("http://www.pocketcodeTest.org");    //using a non existing domain
    assert.equal(req.url, "http://www.pocketcodeTest.org", "ctr with url + getter");
    assert.equal(req.supported, false, "support: checks external domain");

    req.dispose();
    assert.equal(req._disposed, true, "disposed");

    req = new SmartJs.Communication.XmlHttpRequest(window.location);
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
        assert.equal(req._url, "/ClientTests/pocketCodeTest/_resources/testDataProjects.js?a=eins&b=2", "valid  request url params: GET");
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
        assert.ok(onLoadStart === 1 && onProgressChange > 0 && onLoad === 1 && onError === 0, "ajax request: success (make sure you call the test on a server or localhost and not from local file system)");
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

    req = new SmartJs.Communication.XmlHttpRequest("/ClientTests/pocketCodeTest/_resources/testDataProjects.js");

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

        req2 = new SmartJs.Communication.XmlHttpRequest("http://www.w3schools.com/ajax/demo_get.asp");

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

        req3 = new SmartJs.Communication.XmlHttpRequest("/ClientTests/pocketCodeTest/_resources/notExisting.json");

        req3.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler3, this));
        req3.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler3, this));
        req3.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler3, this));
        //req3.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
        req3.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler3, this));
        req3.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler3, this));

        req3.send();
    };

    req.send({ a: "eins", b: 2 }, SmartJs.RequestMethod.GET, "/ClientTests/pocketCodeTest/_resources/testDataProjects.js"); //start async requests 

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

    assert.equal(req.supported, true, "checks for true- this test may fail in older browsers");

    req.dispose();
    assert.equal(req._disposed, true, "disposed");

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
        assert.equal(req._url, "http://server.cors-api.appspot.com/server?id=5180691&enable=true&status=200&credentials=false&methods=GET%2C%20POST&a=eins&b=2", "valid  request url params: GET");
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
        onError++;
        assert.equal(e.target, req, "onError target check");
        //console.log('onError ');
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

    req = new SmartJs.Communication.CorsRequest("http://server.cors-api.appspot.com/server?id=5180691&enable=true&status=200&credentials=false&methods=GET%2C%20POST");  //public service

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

        req2 = new SmartJs.Communication.CorsRequest("http://www.w3schools.com/ajax/demo_get.asp");

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

        req3 = new SmartJs.Communication.CorsRequest("/ClientTests/pocketCodeTest/_resources/notExisting.json");

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
        assert.equal(e.target, req4, "onLoad target check");
        //console.log('onLoad ');
        assert.ok(onLoadStart === 1 && onLoad === 1 && onError === 0, "cors request: consuming out test service");
        var res = JSON.parse(e.target.responseText);
        assert.equal(res.id, 874, "response check");
        //^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
        done4();
    };
    var onErrorHandler4 = function (e) {
        onError++;
        assert.equal(e.target, req4, "onError target check");
        //console.log('onError ');
        //assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "cors request: fail (missing endpoint)");
        //^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
    };

    var req4;
    var runTest4 = function () {
        onLoadStart = 0;
        onLoad = 0;
        onProgressChange = 0;
        onError = 0;

        req4 = new SmartJs.Communication.CorsRequest("https://web-test.catrob.at/rest/v0.1/projects/874");

        req4.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler4, this));
        req4.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler4, this));
        req4.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler4, this));
        //req4.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
        req4.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler4, this));
        req4.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler4, this));

        req4.send();
    };



    //start async
    req.send({ a: "eins", b: 2 }, SmartJs.RequestMethod.GET, "http://server.cors-api.appspot.com/server?id=5180691&enable=true&status=200&credentials=false&methods=GET%2C%20POST"); //start async requests 

});

//QUnit.test("SmartJs.Communication: Jsonp", function (assert) {

//    assert.ok(true, "TODO: ");

//});

//QUnit.test("SmartJs.Communication: ResourceLoader", function (assert) {

//    assert.ok(true, "TODO: ");

//});

