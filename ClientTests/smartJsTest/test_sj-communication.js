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
        req.onError instanceof SmartJs.Event.Event && req.onAbort instanceof SmartJs.Event.Event && 
        req.onProgressChange instanceof SmartJs.Event.Event && req.onProgressSupportedChange instanceof SmartJs.Event.Event, "event initialization and getter");

    assert.equal(req.method, SmartJs.RequestMethod.GET, "request method: default");
    req.method = 'DELETE';
    assert.equal(req.method, SmartJs.RequestMethod.DELETE, "request method: setter");

    assert.equal(req.progressSupported, false, "progress supported: default");
    req.progressSupported = true;
    assert.equal(req.progressSupported, true, "progress supported: setter");
});

QUnit.test("SmartJs.Communication: XmlHttp", function (assert) {

    var req = new SmartJs.Communication.XmlHttpRequest();
    assert.equal(req.url, "", "ctr without url + getter");
    assert.ok(req instanceof SmartJs.Communication.XmlHttpRequest && req instanceof SmartJs.Communication.ServiceRequest, "instance check");

    req = new SmartJs.Communication.XmlHttpRequest("http://www.pocketcode.org");
    assert.equal(req.url, "http://www.pocketcode.org", "ctr with url + getter");
    assert.equal(req.supported, false, "support: checks external domain");

    req.dispose();
    assert.equal(req._disposed, true, "disposed");
    var test = req.onAbort;
    req = new SmartJs.Communication.XmlHttpRequest(window.location);
    assert.equal(req.supported, true, "support: same domain");
});

QUnit.test("SmartJs.Communication: Cors", function (assert) {

    var done1 = assert.async();

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

    var onLoadStartHandler = function () {
        onLoadStart++;
    };
    var onLoadHandler = function () {
        onLoad++;
        done1();
    };
    var onErrorHandler = function () {
        onError++;
    };
    var onAbortHandler = function () {
        onAbort++;
    };
    var onProgressChangeHandler = function () {
        onProgressChange++;
    };
    var onProgressSupportedChangeHandler = function () {
        onProgressSupportedChange++;
    };

    req = new SmartJs.Communication.CorsRequest("http://bar.other/resources/public-data/");
    req.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler, this));
    req.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
    req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler, this));
    req.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
    req.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler, this));
    req.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler, this));

    req.send(SmartJs.RequestMethod.GET);

});

//QUnit.test("SmartJs.Communication: Jsonp", function (assert) {

//    assert.ok(true, "TODO: ");

//});

//QUnit.test("SmartJs.Communication: ResourceLoader", function (assert) {

//    assert.ok(true, "TODO: ");

//});

