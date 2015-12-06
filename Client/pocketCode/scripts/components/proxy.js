/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-communication.js" />
/// <reference path="../core.js" />
'use strict';


PocketCode.merge({

    //_serviceEndpoint: 'https://share.catrob.at/html5/rest/v0.1/',    //TODO:
    //_serviceEndpoint: 'https://web-test.catrob.at/html5/rest/v0.1/',   //TODO:
    //_serviceEndpoint: 'http://localhost/html5/rest/v0.1/',  //TODO:
    _serviceEndpoint: function () {
        switch (window.location.hostname) {
            case "localhost":
                // To test with local projects
                //return 'http://localhost/html5/rest/v0.1/';
            case "web-test.catrob.at":
                return 'https://web-test.catrob.at/html5/rest/v0.1/';
            default:
                return 'https://share.catrob.at/html5/rest/v0.1/';
        }
    }(),

    Services: {
        PROJECT_SEARCH: 'projects',
        PROJECT: 'projects/{id}',
        PROJECT_DETAILS: 'projects/{id}/details',
        //I18N: 'i18n/{language}',
        TTS: 'file/tts?text={text}',    ///{string}',
        SCREENSHOT: 'file/screenshot'
        //TODO:
    },

    _jsonpClientEndpoint: {},

    ServiceRequest: (function () {
        ServiceRequest.extends(SmartJs.Communication.ServiceRequest, false);

        //ctr
        function ServiceRequest(service, method, properties) {
            SmartJs.Communication.ServiceRequest.call(this, PocketCode._serviceEndpoint);

            this._responseText = '';
            this._responseJson = {};

            var validService = false;
            for (var p in PocketCode.Services)
                if (PocketCode.Services[p] === service) {
                    validService = true;
                    break;
                }
            if (!validService)
                throw new Error('unknown service: not part of PocketCode.Services');

            this._service = service.replace(/{([^}]*)}/g, function (prop) {
                var key = prop.substr(1, prop.length - 2);
                if (properties[key]) {
                    var value = properties[key];
                    delete properties[key];     //do not include property more than once
                    return encodeURIComponent(value);
                }
                else
                    throw new Error('missing required service property "' + key + '" in property collection');
            });

            //add properties to request url
            var firstProp = (this._service.indexOf('?') === -1);
            for (var p in properties) {
                if (properties.hasOwnProperty(p) && properties[p] !== undefined) {
                    this._service += (firstProp ? '?' : '&');
                    firstProp = false;
                    this._service += (encodeURIComponent(p) + '=' + encodeURIComponent(properties[p]));
                }
            }

            this._progressSupported = true;     //default for our services
            this.method = method;

            //bind to events
            this._onError.addEventListener(new SmartJs.Event.EventListener(this._storeResponseData, this));
            this._onLoad.addEventListener(new SmartJs.Event.EventListener(this._storeResponseData, this));
        }

        //properties
        Object.defineProperties(ServiceRequest.prototype, {
            url: {
                get: function () {
                    return this._url + this._service;
                }
            },
            data: {
                value: undefined,
                writable: true
            },
            progressSupported: {
                get: function () { return this._progressSupported; }
                //enumerable: false,
                //configurable: true,
            },
            responseText: {
                get: function () { return this._responseText; }
                //enumerable: false,
                //configurable: true,
            },
            responseJson: {
                get: function () { return this._responseJson; }
                //enumerable: false,
                //configurable: true,
            },
        });

        //events
        //Object.defineProperties(ServiceRequest.prototype, {
        //    onProgressSupportedChange: {
        //        get: function () { return this._onProgressSupportedChange; },
        //        //enumerable: false,
        //        //configurable: true,
        //    },
        //});

        //methods
        ServiceRequest.prototype.merge({
            _storeResponseData: function (e) {
                if (e.responseText)
                    this._responseText = e.responseText;
                if (e.responseJson)
                    this._responseJson = e.responseJson;
            },
        });

        return ServiceRequest;
    })(),

    JsonpRequest: (function () {
        JsonpRequest.extends(SmartJs.Communication.ServiceRequest, false);

        function JsonpRequest(url) {
            SmartJs.Communication.ServiceRequest.call(this, url);
            //this._pendingRequest = false;
            //this._xhr = new XMLHttpRequest();
            this.progressSupported = false;
            this._id = SmartJs.getNewId();
        }

        //properties
        Object.defineProperties(JsonpRequest.prototype, {
            responseText: {
                get: function () {
                    return this._xhr.responseText;
                }
            }
        });

        //methods
        JsonpRequest.prototype.merge({
            _onErrorHandler: function (e) {
                this._deleteServiceEndpoint();
                this._onError.dispatchEvent({}.merge(e));
            },
            _createServiceEndpoint: function () {
                PocketCode._jsonpClientEndpoint[this._id] = this._handleResponse.bind(this);//, responseText, statusCode);//new Function('responseText', 'statusCode', '');
            },
            _deleteServiceEndpoint: function () {
                //delete tag and service endpoint
                delete PocketCode._jsonpClientEndpoint[this._id];
                if (!this._script)
                    return;

                var head = document.head || document.getElementsByTagName("head")[0];
                //var script = document.getElementById(this._script);
                head.removeChild(this._script);
                this._script = undefined;
            },
            //this method is bound using .bind(this) to keep the requests scope: it's not covered by code coverage!
            _handleResponse: function (responseText, statusCode) {
                this._deleteServiceEndpoint();

                this._xhr = { status: statusCode, responseText: JSON.stringify(responseText) };
                if (statusCode !== 200) { //this._loaded && 
                    var e = new Error();
                    e.responseText = JSON.stringify(responseText);
                    e.responseJson = JSON.parse(e.responseText);
                    e.statusCode = statusCode;
                    this._onError.dispatchEvent(e);
                }
                else
                    this._onLoad.dispatchEvent();
            },
            send: function (method, url) {
                this.sendData(undefined, method, url);
            },
            sendData: function (data, method, url) {

                if (this._script)
                    throw new Error('this is an asynchronous request: you\'re not allowed to send it twice (simultanously). Create another instance');

                if (method)
                    this.method = method;

                if (url)
                    this._url = url;
                else
                    url = this._url;

                var firstProp = (this._url.indexOf('?') === -1);
                if (this.method !== SmartJs.RequestMethod.GET) {
                    url = this._url + (firstProp ? '?' : '&');
                    url += 'method=' + method;
                    firstProp = false;
                }

                url += this._service + firstProp ? '?' : '&';
                firstProp = false;
                url += 'jsonpCallback=PocketCode._jsonpClientEndpoint.' + this._id;

                //handle data
                if (data) {
                    if (typeof data !== 'object')
                        throw new Error('invalid argument: expected: data typeof object');

                    for (var prop in data) {
                        url += '&' + prop + '=' + data[prop];
                    }

                }

                this._onLoadStart.dispatchEvent();
                this._onProgressSupportedChange.dispatchEvent({ progressSupport: false });

                try {
                    this._createServiceEndpoint();
                    //throw new Error("Test only");

                    var head = document.head || document.getElementsByTagName("head")[0];
                    var script = document.createElement("script");
                    this._script = script;
                    //oScript.type = "text\/javascript";    //type optional in HTML5 -> default: "text\/javascript" 
                    script.async = false;  //ensure execution order after async download
                    //var _self = this;   //TODO: ???
                    script.onerror = this._onErrorHandler.bind(this);//_onError.dispatchEvent.call(this);//, e);
                    //script.onload = oScript.onreadystatechange = function () {
                    //    if (!this._loaded && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    //        this._loaded = true;
                    //        oScript.onload = oScript.onreadystatechange = null;
                    //        _self._onLoad.dispatchEvent();
                    //    }
                    //};
                    head.appendChild(script);
                    //oHead.insertBefore(oScript, oHead.firstChild);    //alternative
                    //script.id = 
                    script.src = url;
                    //break;
                }
                catch (e) {
                    this._onErrorHandler(e.merge({ statusCode: 0 }));//_onError.dispatchEvent(e.merge({ statusCode: 0 }));
                }
            }
        });

        return JsonpRequest;
    })(),

    Proxy: (function () {
        //each single request has its events, the proxy only maps this events to internal strong typed requests and triggers send()

        //ctr
        function Proxy() {
        }

        //methods
        Proxy.prototype.merge({
            send: function (request) {
                //alert('send');
                if (!(request instanceof PocketCode.ServiceRequest))
                    throw new Error('invalid argument, expected: request type of PocketCode.ServiceRequest');

                //handle methods not equal POST or GET
                var method = request.method;
                if (method !== 'GET' && method !== 'POST') {
                    method = 'GET';
                    var url = request.url;
                    url += (this._service.indexOf('?') === -1) ? '?' : '&';
                    url += 'method=' + request.method;
                }

                if (this._sendUsingXmlHttp(request, method, url))
                    return true;
                else if (this._sendUsingCors(request, method, url))
                    return true;
                else
                    return this._sendUsingJsonp(request, method, url);
            },
            _mapEventsToStrongTypedRequest: function (req, requestObject) {
                //we inject the requests events to the 'real' request (xmlHttp, cors, jsonp) object: as there is no public interface we override the private objects
                req._onLoadStart = requestObject._onLoadStart;
                req.onLoadTarget = requestObject;   //store request object in strong typed request to trigger the original event onLoad
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._onLoadHandler, this));
                req._onError = requestObject._onError;
                //req._onAbort = requestObject._onAbort;
                req._onProgressChange = requestObject._onProgressChange;
                req._onProgressSupportedChange = requestObject._onProgressSupportedChange;
            },
            _onLoadHandler: function (e) {
                //check for serverside error -> dispach onerror or onload
                var textResult = '', jsonResult = {}, exc = {};
                try {
                    //console.log(e.target.responseText);
                    //result = e.target.responseText;
                    //result = result.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");    //escape the string
                    textResult = e.target.responseText;
                    jsonResult = JSON.parse(textResult);
                }
                catch (ex) {
                    //throw(ex);
                    exc = ex;
                    jsonResult.type = 'InvalidJsonFormatException';
                }
                if (jsonResult.type && jsonResult.type.indexOf('Exception') !== -1) {
                    var err = new Error();
                    err.merge(exc);
                    err.json = jsonResult || {};
                    e.target._onError.dispatchEvent(err);
                    return;
                }
                e.target.onLoadTarget.onLoad.dispatchEvent({ responseText: textResult, responseJson: jsonResult }); //get original target and trigger on this target
            },
            _sendUsingXmlHttp: function (request, method, url) {
                var req = new SmartJs.Communication.XmlHttpRequest(url || request.url);
                if (!req.supported)
                    return false;

                this._mapEventsToStrongTypedRequest(req, request);
                req.sendData(request.data, method || request.method);
                return true;
            },
            _sendUsingCors: function (request, method, url) {
                var req = new SmartJs.Communication.CorsRequest(url || request.url);
                if (!req.supported)
                    return false;

                this._mapEventsToStrongTypedRequest(req, request);
                req.sendData(request.data, method || request.method);
                return true;
            },
            _sendUsingJsonp: function (request, method, url) {
                var req = new PocketCode.JsonpRequest(url || request.url);

                this._mapEventsToStrongTypedRequest(req, request);
                req.sendData(request.data, method || request.method);
                return true;
            },
            dispose: function () {
                //override as a static class cannot be disposed
            },
        });

        return Proxy;
    })()

});

//static class: constructor override (keeping code coverage enabled)
PocketCode.Proxy = new PocketCode.Proxy();
