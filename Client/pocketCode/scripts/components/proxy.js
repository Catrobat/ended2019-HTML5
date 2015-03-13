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
        I18N: 'i18n/{language}',
        TTS: 'tts/{string}',
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

                //check: same origin policy
                //check CORS
                //create smartJs request object	(ajax, cors, jsonp)
                //check: method PUT/DELETE -> method=POST + modify request properties
                //connect events or add handler to pocketCode._jsonpClientEndpoint
                //send
            },
            _sendUsingAjax: function () {
                //TODO: 
            },
            _sendUsingCors: function () {
                //TODO: 
            },
            _sendUsingJsonp: function () {
                //TODO: 
            },
        });

        return Proxy;
    })()),
});


