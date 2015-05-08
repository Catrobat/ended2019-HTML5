/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-communication.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/proxy.js" />
'use strict';

QUnit.module("proxy.js");


QUnit.test("ServiceRequest", function (assert) {

    assert.throws(function () { var sr = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, {}); }, Error, "ERROR: missing argument");

    var sr = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: "newId", prop1: "prop_1", prop2: "prop_2" });
    assert.ok(sr instanceof PocketCode.ServiceRequest && sr instanceof SmartJs.Communication.ServiceRequest, "created: successfull");
    assert.ok(sr.method === "GET" && sr._progressSupported === true, "check constructor setters");
    assert.equal(sr._service, "projects/newId?prop1=prop_1&prop2=prop_2", "service url created correctly: properties already used removed");

    sr.data = "new data";
    assert.equal(sr.data, "new data", "data accessor");
    sr.method = SmartJs.RequestMethod.POST;
    assert.equal(sr.method, "POST", "method accessor");

    assert.equal(sr.url, PocketCode._serviceEndpoint + "projects/newId?prop1=prop_1&prop2=prop_2", "url created correctly: properties already used removed");
    assert.equal(sr.progressSupported, true, "progressSupport accessor");

    assert.ok(sr.onLoadStart instanceof SmartJs.Event.Event && sr.onLoad instanceof SmartJs.Event.Event && sr.onError instanceof SmartJs.Event.Event &&
        sr.onProgressChange instanceof SmartJs.Event.Event && sr.onProgressSupportedChange instanceof SmartJs.Event.Event, "events: accessors");

    var url = PocketCode.Services.PROJECT + "?pr1={prop1}";
    sr = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, { id: "newId", prop1: "prop_1", prop2: "prop_2" });
    assert.equal(sr.url, PocketCode._serviceEndpoint + "projects/newId?pr1=prop_1&prop2=prop_2", "url created correctly: complex");

});


QUnit.test("JsonpRequest", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var req = new PocketCode.JsonpRequest("new_url");
    assert.ok(req instanceof PocketCode.JsonpRequest && req instanceof SmartJs.Communication.ServiceRequest, "instance create correctly");

    var onLoadStart = 0,
        onLoad = 0,
        onError = 0,
        onAbort = 0,
        onProgressChange = 0,
        onProgressSupportedChange = 0;

    var onLoadStartHandler = function (e) {
        onLoadStart++;
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
        assert.ok(onLoadStart === 1 && onProgressChange === 0 && onProgressSupportedChange === 1 && onLoad === 1 && onError === 0, "jsonp request: success");
        assert.ok(e.target.responseText.length > 0, "response text received");
        assert.ok(e.target._script === undefined, "script tag revomed from DOM");
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

    var req = new PocketCode.JsonpRequest("https://web-test.catrob.at/rest/v0.1/projects/874/details");//, SmartJs.RequestMethod.GET, { id: "8744", prop1: "prop_1", prop2: "prop_2" });

    req.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler, this));
    req.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
    req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler, this));
    //req.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
    req.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler, this));
    req.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler, this));


    //request fail: server error
    var onLoadHandler2 = function (e) {
        onLoad++;
        assert.equal(e.target, req2, "onLoad target check");
        //console.log('onLoad ');
    };
    var onErrorHandler2 = function (e) {
        onError++;
        assert.equal(e.target, req2, "onError target check");
        //console.log('onError ');
        assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "jsonp request: fail (server error)");
        //^^ onProgressChange > 0 && onLoad === 1 && on some browsers ?
        done2();

        runTest3();
    };

    var req2;
    var runTest2 = function () {
        onLoadStart = 0;
        onLoad = 0;
        onProgressChange = 0;

        req2 = new PocketCode.JsonpRequest("https://web-test.catrob.at/rest/v0.1/projects/8744/details");

        req2.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler2, this));
        req2.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler2, this));
        req2.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler2, this));
        //req2.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
        req2.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler2, this));
        req2.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler2, this));

        req2.send({ deleteId: 123 }, SmartJs.RequestMethod.DELETE, "https://web-test.catrob.at/rest/v0.1/projects/8744/details");
    };

    //invalid tag
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
        assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "jsonp request: fail (invalid endpoint)");
        //^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
        done3();

        //runTest4();
    };

    var req3
    var runTest3 = function () {
        onLoadStart = 0;
        onLoad = 0;
        onProgressChange = 0;
        onError = 0;

        req3 = new SmartJs.Communication.CorsRequest("https://pocketcode.org/images/logo/logo_text.png");//"/ClientTests/pocketCodeTest/_resources/notExisting.json");

        req3.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler3, this));
        req3.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler3, this));
        req3.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler3, this));
        //req3.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
        req3.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler3, this));
        req3.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler3, this));

        req3.send({ prop1: "string", prop2: 3 }, "GET", "</script>");
    };


    //start async tests
    req.send();
    assert.throws(function () { req.send(); }, Error, "ERROR: calling request twice");
});


QUnit.test("Proxy", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    assert.throws(function () { var propy = new PocketCode.Proxy(); }, Error, "ERROR: static, no class definition/constructor");
    assert.throws(function () { PocketCode.Proxy.send({}); }, Error, "ERROR: sending request not typeof PocketCode.ServiceRequest");

    //var p = PocketCode.Proxy;   //this is not a constructor but a static class -> instanceof is not valid here
    //assert.ok(p instanceof PocketCode.Proxy, "instance check");

    var onLoadStart = 0,
        onLoad = 0,
        onError = 0,
        onAbort = 0,
        onProgressChange = 0,
        onProgressSupportedChange = 0;

    var onLoadStartHandler = function (e) {
        onLoadStart++;
        assert.equal(e.target, req, "onLoadStart target check");
        //console.log('onLoadStart ');
    };
    var onLoadHandler = function (e) {
        onLoad++;
        assert.equal(e.target, req, "onLoad target check");
        //console.log('onLoad ');
        assert.ok(onLoadStart === 1 && onProgressChange > 0 && onLoad === 1 && onError === 0, "ajax request: success (make sure you call the test on a server or localhost and not from local file system)");
        assert.ok(e.responseText.length > 0, "response text received");
        assert.ok(typeof e.json  === 'object', "response text parsed to json");
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
    var onProgressSupportedChangeHandler = function (e) {
        onProgressSupportedChange++;
        assert.equal(e.target, req, "onProgressSupportedChange target check");

        //console.log('onProgressSupportedChange ' + e.progressSupport);
    };

    var req = new PocketCode.ServiceRequest("ClientTests/pocketCodeTest/_resources/testDataProjectJson.js", SmartJs.RequestMethod.GET, { id: "8744", prop1: "prop_1", prop2: "prop_2" });
    req._url = "/"; //overwrite default URL to request local server
    //var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: "8744", prop1: "prop_1", prop2: "prop_2" });

    req.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler, this));
    req.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
    req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler, this));
    //req.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
    req.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler, this));
    req.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler, this));


    //test2: cors
    var runTest2 = function () {

        //TODO:

        done2();
        runTest3();
    };

    //test3: jsonp
    var runTest3 = function () {

        PocketCode.Proxy._sendUsingCors = function () { return false; };    //simulate cors not supported

        //TODO:

        done3();
        
    };



    //start tests
    PocketCode.Proxy.send(req);

});

