/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-communication.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/proxy.js" />
'use strict';

QUnit.module("components/proxy.js");


QUnit.test("ServiceRequest", function (assert) {

    assert.throws(function () { var sr = new PocketCode.ServiceRequest("PROJECT", SmartJs.RequestMethod.GET, {}); }, Error, "ERROR: invalid (unknown) service endpoint");
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

    var url = PocketCode.Services.PROJECT;// + "?pr1={prop1}";
    sr = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, { id: "newId", prop1: "prop_1", prop2: "prop_2" });
    assert.equal(sr.url, PocketCode._serviceEndpoint + "projects/newId?prop1=prop_1&prop2=prop_2", "url created correctly: complex");

});

QUnit.test("TestRequestSingleProjectWithCertainID", function(assert) {

  var url = PocketCode.Services.PROJECT;
  var id = "825";
  var requestSingleProject = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {id: id});
  assert.ok(requestSingleProject instanceof PocketCode.ServiceRequest && requestSingleProject instanceof SmartJs.Communication.ServiceRequest, "created: successful");

  var onLoadProjectHandler = function(e)
  {
    var project825received = e.responseJson;
    assert.ok(project825received instanceof Object, "project received object is valid");
    assert.equal(project825received.id, id, "correct project id");
  };

  requestSingleProject.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadProjectHandler, this));
  PocketCode.Proxy.send(requestSingleProject);
});

QUnit.test("TestRequestLimitedNrOfProjects", function(assert) {
  var url = PocketCode.Services.PROJECT_SEARCH;
  var limit = 15;
  var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {limit: limit});
  assert.ok(srAllProjects instanceof PocketCode.ServiceRequest && srAllProjects instanceof SmartJs.Communication.ServiceRequest, "created: successful");

  var ids = [];

  var onLoadSingleProjectHandler = function(e, id)
  {
    var receivedProject = e.responseJson;
    assert.ok(receivedProject instanceof Object, 'project [' + receivedProject.id + ']: received object is valid');
    assert.ok(ids.indexOf(receivedProject.id) != -1, 'received project (' + receivedProject.id + ') was requested');
    ids.splice(receivedProject.id);
    assert.notOk(ids.indexOf(receivedProject.id) == -1, 'received project (' + receivedProject.id + ') handeled... finish!')
  };

  //var onLoadAllProjectsHandler = function(e)
  //{
  //  var receivedAllProjects = e.responseJson;
  //  assert.ok(receivedAllProjects instanceof Object, 'all projects received object is valid');
  //  //console.log(receivedAllProjects);

  //  var projectCount = receivedAllProjects.items.length;    //make sure only delivered projects are counted
  //  //console.log(projectCount);
  //  assert.equal(projectCount, limit, 'correct nr (' + limit + ') of projects');

  //  var mask = receivedAllProjects.mask;
  //  //console.log(mask);
  //  assert.equal(mask, 'recent', 'correct mask: recent');

  //  var projects = receivedAllProjects.items;
  //  //console.log(projects);
  //  assert.ok(projects instanceof Array, 'array of projects');

  //  for(var i = 0; i < projectCount; i++)
  //  {
  //    var project = projects[i];
  //    var urlSingleProject = PocketCode.Services.PROJECT;
  //    var params = { id : project['id'] };
  //    ids.push(parseInt(project['id']));
  //    var srSingleProject = new PocketCode.ServiceRequest(urlSingleProject, SmartJs.RequestMethod.GET, params);
  //    srSingleProject.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadSingleProjectHandler, this));
  //    //console.log('requesting project [' + project['id'] + ']: ' + project['title']);
  //    PocketCode.Proxy.send(srSingleProject);
  //  }
  //};

  //srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadAllProjectsHandler, this));
  //PocketCode.Proxy.send(srAllProjects);
});



QUnit.test("TestDefaultServiceSettings", function(assert) {
    var defaultLimit = 20;
    var defaultOffset = 0;
    var defaultMaxFeaturedProjects = 3;
    var defaultMask = "recent";


    var url = PocketCode.Services.PROJECT_SEARCH;
    var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET);
    assert.ok(srAllProjects instanceof PocketCode.ServiceRequest && srAllProjects instanceof SmartJs.Communication.ServiceRequest, "created: successful");


    var onLoadAllProjectsHandler = function(e)
    {
        var receivedAllProjects = e.responseJson;
        assert.ok(receivedAllProjects instanceof Object, 'all projects received object is valid');
        //console.log(receivedAllProjects);

        var projectCount = receivedAllProjects.limit;
        var projectOffset = receivedAllProjects.offset;
        var featuredProjects = receivedAllProjects.featured;
        var projectMask = receivedAllProjects.mask;

        assert.ok(projectCount == defaultLimit, 'correct nr (' + defaultLimit + ') of projects');
        assert.ok(projectOffset == defaultOffset, 'correct offset value (' + defaultOffset + ')');
        assert.ok(featuredProjects.length <= defaultMaxFeaturedProjects, 'valid amount of featured projects (' + featuredProjects.length + ')');
        assert.ok(projectMask == defaultMask, 'correct mask key word (' + defaultMask + ')');

        var projects = receivedAllProjects.items;
        assert.ok(projects instanceof Array, 'items is an array of projects');

        var featured = receivedAllProjects.featured;
        assert.ok(featured instanceof Array, 'featured is an array of projects');
    };

    srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadAllProjectsHandler, this));
    PocketCode.Proxy.send(srAllProjects);
});



QUnit.test("TestRequestInvalidProjectLimit", function(assert) {

  var url = PocketCode.Services.PROJECT_SEARCH;
  var limit = 'a';
  var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {limit: limit});
  assert.ok(srAllProjects instanceof PocketCode.ServiceRequest && srAllProjects instanceof SmartJs.Communication.ServiceRequest, "created: successful");

  var onLoadAllProjectsHandler = function(e) {

      var projectCount = e.responseJson.items.length;
      assert.ok(projectCount == projectCount, 'correct nr (' + projectCount + ') of projects');
  };

  srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadAllProjectsHandler, this));
  PocketCode.Proxy.send(srAllProjects);
});

QUnit.test("TestRequestInvalidMask", function(assert) {
    var mask = 'invalid_value';

    var defaultType = "ServiceNotImplementedException";
    var defaultMessage = "mask '" + mask + "' not supported!";
    var defaultCode = 0;

    var url = PocketCode.Services.PROJECT_SEARCH;
    var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {mask: mask});
    assert.ok(srAllProjects instanceof PocketCode.ServiceRequest && srAllProjects instanceof SmartJs.Communication.ServiceRequest, "created: successful");


    var onErrorAllProjectsHandler = function(e)
    {
        if (e.responseJson == undefined) {
            assert.ok(false, "Did not receive exception an client- CORS problem?");
            return;
        }

        var receivedAllProjects = e.responseJson;
        assert.ok(receivedAllProjects instanceof Object, 'received object is valid');
        //console.log(receivedAllProjects);

        var requestType = receivedAllProjects.type;
        var requestMessage = receivedAllProjects.message;
        var requestCode = receivedAllProjects.code;

        assert.ok(defaultType == requestType, 'correct type (' + defaultType + ')');
        assert.ok(defaultMessage == requestMessage, 'correct message (' + defaultMessage + ')');
        assert.ok(defaultCode == requestCode, 'correct code (' + defaultCode + ')');
    };


    srAllProjects._onError.addEventListener(new SmartJs.Event.EventListener(onErrorAllProjectsHandler, this));
    PocketCode.Proxy.send(srAllProjects);
});


QUnit.test("JsonpRequest", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    //var done4 = assert.async();

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
        assert.equal(e.target, req, "onLoadStart target check: request 1");
        //console.log('onLoadStart ');
    };
    var onLoadStartHandler2 = function (e) {
        onLoadStart++;
        assert.equal(e.target, req2, "onLoadStart target check: request 2");
        //console.log('onLoadStart ');
    };
    var onLoadStartHandler3 = function (e) {
        onLoadStart++;
        assert.equal(e.target, req3, "onLoadStart target check: request 3");
        //console.log('onLoadStart ');
    };
    //var onLoadStartHandler4 = function (e) {
    //    onLoadStart++;
    //    assert.equal(e.target, req4, "onLoadStart target check: request 4");
    //    //console.log('onLoadStart ');
    //};
    var onLoadHandler = function (e) {
        onLoad++;
        assert.equal(e.target, req, "onLoad target check");
        //console.log('onLoad ');
        assert.ok(onLoadStart === 1 && onProgressChange === 0 && onProgressSupportedChange === 1 && onLoad === 1 && onError === 0, "jsonp request: success");
        assert.ok(e.target.responseText.length > 0, "response text received");
        var parsed = JSON.parse(e.target.responseText); //this will throw an error if the string is not parsable
        //assert.ok(e.target.statusCode == 200, "status code = ok");
        assert.ok(e.target._script === undefined, "script tag revomed from DOM");
        done1();

        runTest2();
    };
    var onErrorHandler = function (e) {
        assert.ok(false, "WARNING: onErrorHandler: cors call to https://share.catrob.at/html5/rest/v0.3/projects/824/details failed - this may be an error caused by the server");
        done1();

        runTest2();
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

    var req = new PocketCode.JsonpRequest("https://web-test.catrob.at/html5/rest/v0.3/projects/824/details");//, SmartJs.RequestMethod.GET, { id: "824", prop1: "prop_1", prop2: "prop_2" });

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
        assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "jsonp request: fail (server error: not found)");
        //^^ onProgressChange > 0 && onLoad === 1 && on some browsers ?
        done2();

        runTest3();
    };

    var req2;
    var runTest2 = function () {
        onLoadStart = 0;
        onLoad = 0;
        onProgressChange = 0;

        req2 = new PocketCode.JsonpRequest("https://web-test.catrob.at/html5/rest/v0.3/projects/8744/details");

        req2.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler2, this));
        req2.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler2, this));
        req2.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler2, this));
        //req2.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
        req2.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler2, this));
        req2.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler2, this));

        req2.send({ deleteId: 123 }, SmartJs.RequestMethod.DELETE, "https://web-test.catrob.at/html5/rest/v0.3/projects/8744/details");
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

        req3 = new PocketCode.JsonpRequest("https://pocketcode.org/images/logo/logo_text.png");//"/ClientTests/pocketCodeTest/_resources/notExisting.json");

        req3.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler3, this));
        req3.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler3, this));
        req3.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler3, this));
        //req3.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
        req3.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler3, this));
        req3.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler3, this));

        req3.sendData({ prop1: "string", prop2: 3 }, "GET", "</script>");
    };

    //response: server error
    //var req4;

    //var onErrorHandler4 = function (e) {
    //    onError++;
    //    assert.equal(e.target, req4, "onError target check (server error)");
    //    //console.log('onError ');
    //    assert.ok(onLoadStart === 1 && onLoad === 0 && onError === 1, "jsonp request: fail (server error internal)");
    //    //^^ && onProgressChange > 0 && onLoad === 1  on some browsers ?
    //    done4();
    //};
    //var onLoadHandler4 = function (e) {
    //    //onLoad++;
    //    assert.ok(false, "onLoad for request 4 (valid but server error) should not be called");
    //    //console.log('onLoad ');
    //};

    //var runTest4 = function () {
    //    onLoadStart = 0;
    //    onLoad = 0;
    //    onProgressChange = 0;
    //    onError = 0;

    //    req4 = new PocketCode.JsonpRequest("https://web-test.catrob.at/html5/rest/v0.3/projects/8744/details");

    //    req4.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler4, this));
    //    req4.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler4, this));
    //    req4.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler4, this));
    //    //req4.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
    //    //req4.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler2, this));
    //    //req4.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler2, this));

    //    req4.send(SmartJs.RequestMethod.GET, "https://web-test.catrob.at/html5/rest/v0.3/projects/817");
    //};


    //start async tests
    req.send();
    assert.throws(function () { req.send(); }, Error, "ERROR: calling request twice");
});


QUnit.test("Proxy", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();

    assert.throws(function () { var propy = new PocketCode.Proxy(); }, Error, "ERROR: static, no class definition/constructor");
    assert.throws(function () { PocketCode.Proxy instanceof PocketCode.Proxy }, Error, "ERROR: static class: no instanceof allowed");
    assert.throws(function () { PocketCode.Proxy.send({}); }, Error, "ERROR: sending request not typeof PocketCode.ServiceRequest");

    //disposing without efect on the object
    //var corsEnabled = PocketCode.Proxy.corsEnabled;
    //PocketCode.Proxy.dispose()
    //assert.ok(PocketCode.Proxy.corsEnabled != undefined && PocketCode.Proxy.corsEnabled === corsEnabled, "dispose: no effect");

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
        assert.ok(onLoadStart === 1 && onProgressChange >= 0 && onLoad === 1 && onError === 0, "proxy request: success");
        //^^ progress >= 0 required by chrome
        assert.ok(e.responseText.length > 0, "response text received");
        assert.equal(e.responseText, e.target.responseText, "event response text equal target");
        assert.ok(typeof e.responseJson === 'object', "response text parsed to json");
        assert.equal(e.responseJson, e.target.responseJson, "event response json equal target");
        done1();

        runTest2();
    };
    var onErrorHandler = function (e) {
        assert.ok(false, "WARNING: onErrorHandler: call to https://web-test.catrob.at/html5/rest/v0.3/projects/824/details failed - this may be an error caused by the server");
        done1();

        runTest2();
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

    var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT_DETAILS, SmartJs.RequestMethod.GET, { id: "824", prop1: "prop_1", prop2: "prop_2" });
    //req._url = ""; //overwrite default URL to request local server
    //^^ the proxy works cross-origin and will select a service to get a response from our server
    //var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT_SEARCH, SmartJs.RequestMethod.GET, { id: "8744", prop1: "prop_1", prop2: "prop_2" });

    req.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler, this));
    req.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
    req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler, this));
    //req.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
    req.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler, this));
    req.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler, this));


    //test2: cors: error
    var onErrorHandler2 = function (e) {
        onError++;
        assert.equal(e.target, req, "onError target check");
        //console.log('onError ');
        assert.ok(e.responseText && e.responseText.length > 0, "error: response text received");
        assert.equal(e.responseText, e.target.responseText, "error: event response text equal target");
        assert.ok(typeof e.responseJson === 'object', "error: response text parsed to json");
        assert.equal(e.responseJson, e.target.responseJson, "error: event response json equal target");
        assert.ok(e.statusCode != 200, "status code != OK (200)");
        done2();
        runTest3();
    };

    var runTest2 = function () {

        req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT_DETAILS, SmartJs.RequestMethod.GET, { id: "0"});
        req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler2, this));
        PocketCode.Proxy.send(req);

        //done2();
        //runTest3();
    };

    //test3: jsonp
    var onLoadHandler3 = function (e) {
        onLoad++;
        assert.equal(e.target, req, "jsonp: onLoad target check");
        //console.log('onLoad ');
        assert.ok(onLoadStart === 1 && onProgressChange >= 0 && onLoad === 1 && onError === 0, "jsonp: proxy request: success");
        //^^ progress >= 0 required by chrome
        assert.ok(e.responseText.length > 0, "jsonp: response text received");
        assert.equal(e.responseText, e.target.responseText, "jsonp: event response text equal target");
        assert.ok(typeof e.responseJson === 'object', "jsonp: response text parsed to json");
        assert.equal(e.responseJson, e.target.responseJson, "jsonp: event response json equal target");

        done3();
        runTest4();
    };
    var onErrorHandler3 = function (e) {
        assert.ok(false, "WARNING: onErrorHandler3: call to https://web-test.catrob.at/html5/rest/v0.3/projects/824/details failed - this may be an error caused by the server");

        done3();
        runTest4();
    };

    var runTest3 = function () {

        onLoadStart = 0;
        onProgressChange = 0;
        onLoad = 0;
        onError = 0;

        PocketCode.Proxy._sendUsingCors = function () { return false; };    //simulate cors not supported
        req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: "824", prop1: "prop_1", prop2: "prop_2" });
        req.onLoadStart.addEventListener(new SmartJs.Event.EventListener(onLoadStartHandler, this));
        req.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler3, this));
        req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler3, this));
        //req.onAbort.addEventListener(new SmartJs.Event.EventListener(onAbortHandler, this));
        req.onProgressChange.addEventListener(new SmartJs.Event.EventListener(onProgressChangeHandler, this));
        req.onProgressSupportedChange.addEventListener(new SmartJs.Event.EventListener(onProgressSupportedChangeHandler, this));
        PocketCode.Proxy.send(req);

    };

    //test4: jsonp error

    var onErrorHandler4 = function (e) {
        onError++;
        assert.equal(e.target, req, "jsonp: onError target check");
        //console.log('onError ');
        assert.ok(e.responseText && e.responseText.length > 0, "jsonp: error: response text received");
        assert.equal(e.responseText, e.target.responseText, "jsonp: error: event response text equal target");
        assert.ok(typeof e.responseJson === 'object', "jsonp: error: response text parsed to json");
        assert.equal(e.responseJson, e.target.responseJson, "jsonp: error: event response json equal target");
        assert.ok(e.statusCode != 200, "jsonp: status code != OK (200)");

        done4();
    };

    var runTest4 = function () {

        PocketCode.Proxy._sendUsingCors = function () { return false; };    //simulate cors not supported
        req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: "0" });
        req.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler4, this));
        PocketCode.Proxy.send(req);

    };


    //start tests
    PocketCode.Proxy.send(req);

});

