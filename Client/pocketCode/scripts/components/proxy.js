/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-communication.js" />
/// <reference path="../core.js" />
'use strict';


PocketCode.merge({

    _serviceEndpoint: '',    //TODO:

    Services: {
        PROJECT_SEARCH: 'projects',
        PROJECT: 'projects/{id}',
        PROJECT_DETAILS: 'projects/{id}/details',
        TTS: 'tts/{string}',
        I18N: 'i18n/{language}',
        //TODO:
    },

    _jsonpClientEndpoint: {},

    ServiceRequest: (function () {

        //ctr
        function ServiceRequest(service, method, properties) {
            //if (PocketCode._serviceEndpoint)
            this._url = PocketCode._serviceEndpoint;
            //else
            //    this._url = '';

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
            var first = true;
            for (var p in properties) {
                if (properties.hasOwnProperty(p) && properties[p] !== undefined) {
                    this._service += first ? '?' : '&';
                    first = false;
                    this._service += (encodeURIComponent(p) + '=' + encodeURIComponent(properties[p]));
                }
            }

            //check: method PUT/DELETE -> method=POST + modify request properties
            if (method === SmartJs.RequestMethod.PUT || method === SmartJs.RequestMethod.DELETE) {
                this.method = SmartJs.RequestMethod.POST;
                this._service += first ? '?' : '&';
                this._service += 'method=' + method;
            }
            else
                this.method = method;

            this._progressSupported = true;     //default for our services

            //events
            this._onLoadStart = new SmartJs.Event.Event(this);
            this._onLoad = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
            this._onAbort = new SmartJs.Event.Event(this);
            this._onProgressChange = new SmartJs.Event.Event(this);
            this._onProgressSupportedChange = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(ServiceRequest.prototype, {
            url: {
                get: function () {
                    return this._url + this._service;
                },
            },
            method: {
                value: SmartJs.RequestMethod.GET,   //default
                writable: true,
            },
            data: {
                value: "",  //{}?
                writable: true,
            },
            progressSupported: {
                get: function () { return this._progressSupported; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //events
        Object.defineProperties(ServiceRequest.prototype, {
            onLoadStart: {
                get: function () { return this._onLoadStart; },
                //enumerable: false,
                //configurable: true,
            },
            onLoad: {
                get: function () { return this._onLoad; },
                //enumerable: false,
                //configurable: true,
            },
            onError: {
                get: function () { return this._onError; },
                //enumerable: false,
                //configurable: true,
            },
            onAbort: {
                get: function () { return this._onAbort; },
                //enumerable: false,
                //configurable: true,
            },
            onProgressChange: {
                get: function () { return this._onProgressChange; },
                //enumerable: false,
                //configurable: true,
            },
            onProgressSupportedChange: {
                get: function () { return this._onProgressSupportedChange; },
                //enumerable: false,
                //configurable: true,
            },
        });

        return ServiceRequest;
    })(),


    Proxy: new ((function () {	//singleton
        //each single request has its events, the proxy only maps this events to internal strong typed requests and triggers send()

        //ctr
        function Proxy() {
            //this._total = totalCount;
            //this._parsed = 0;

            //this._updatePercentage = 0;
            //this._onProgressChange = new SmartJs.Event.Event(this);

        }

        //methods
        Proxy.prototype.merge({
            send: function (request) {
                if (!(request instanceof PocketCode.ServiceRequest))
                    throw new Error('invalid argument, expected: request type of PocketCode.ServiceRequest');

                if (this._xhrSupported(request.url))
                    this._sendUsingAjax(request);
                else if (this._corsSupported())
                    this._sendUsingCors(request);
                else
                    this._sendUsingJsonp(request);
            },
            _xhrSupported: function (url) {
                var l = window.location;
                var a = document.createElement('a');
                a.href = url;

                return a.hostname === l.hostname && a.port === l.port && a.protocol === l.protocol;
            },
            _corsSupported: function () {
                if ('withCredentials' in new XMLHttpRequest())
                    return true;
                else if (window.XDomainRequest) //IE specific
                    return true;
                return false;
            },
            _sendUsingAjax: function (request) {
                var xhr = new SmartJs.Communication.XmlHttpRequest();
                //bind events: as event objects are not public, we inject our request events into the SmartJs request
                xhr._onLoadStart = request.onLoadStart;
                xhr._onLoad = request.onLoad;
                xhr._onError = request.onError;
                xhr._onAbort = request.onAbort;
                xhr._onProgressChange = request.onProgressChange;
                //TODO: request.onProgressSupportedChange?
                //send
                xhr.send(request.url, request.method, request.data);
            },
            _sendUsingCors: function (request) {
                var cors = new SmartJs.Communication.CorsRequest();
                //bind events: as event objects are not public, we inject our request events into the SmartJs request
                cors._onLoadStart = request.onLoadStart;
                cors._onLoad = request.onLoad;
                cors._onError = request.onError;
                cors._onAbort = request.onAbort;
                cors._onProgressChange = request.onProgressChange;
                //TODO: request.onProgressSupportedChange?
                //send
                cors.send(request.url, request.method, request.data);
            },
            _sendUsingJsonp: function (request) {
                //settings
                //connect events
                //send
            },
        });

        return Proxy;
    })()),
});


