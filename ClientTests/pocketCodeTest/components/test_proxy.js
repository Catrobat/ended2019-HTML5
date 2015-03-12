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
    assert.ok(sr instanceof PocketCode.ServiceRequest, "created: successfull");
    assert.ok(sr.method === "GET" && sr._progressSupported === true, "check constructor setters");
    assert.equal(sr._service, "projects/newId?prop1=prop_1&prop2=prop_2", "service url created correctly: properties already used removed");

    sr.data = "new data";
    assert.equal(sr.data, "new data", "data accessor");
    sr.method = SmartJs.RequestMethod.POST;
    assert.equal(sr.method, "POST", "method accessor");

    assert.equal(sr.url, PocketCode._serviceEndpoint + "projects/newId?prop1=prop_1&prop2=prop_2", "url created correctly: properties already used removed");
    assert.equal(sr.progressSupported, true, "progressSupport accessor");

    assert.ok(sr.onLoadStart instanceof SmartJs.Event.Event && sr.onLoad instanceof SmartJs.Event.Event && sr.onError instanceof SmartJs.Event.Event &&
        sr.onAbort instanceof SmartJs.Event.Event && sr.onProgressChange instanceof SmartJs.Event.Event && sr.onProgressSupportedChange instanceof SmartJs.Event.Event, "events: accessors");

});


QUnit.test("Proxy", function (assert) {

    assert.throws(function () { var propy = new PocketCode.Proxy(); }, Error, "ERROR: no class definition/constructor");
    assert.throws(function () { PocketCode.Proxy.send({}); }, Error, "ERROR: sending request not typeof PocketCode.ServiceRequest");


});

