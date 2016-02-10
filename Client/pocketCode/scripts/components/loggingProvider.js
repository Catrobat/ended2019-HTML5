'use strict';

PocketCode.LoggingProvider = (function (propObject) {
    LoggingProvider.extends(SmartJs.Core.Component, false);

    function LoggingProvider(propObject) {
        SmartJs.Core.Component.call(this, propObject);

        this._proxy = PocketCode.Proxy;
        //this._onIdReceived = new SmartJs.Event.Event(this);
        //this._onIdReceived.addEventListener(new SmartJs.Event.EventListener(this._newIdReceivedHandler, this));
        this._onLoggingMsgSent = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(LoggingProvider.prototype, {
        onLoggingMsgSent: {
            get: function () {
                return this._onLoggingMsgSent;
            },
        },
    });

    //methods
    LoggingProvider.prototype.merge({
        sendMsg: function (type, projectId, jsonError) {
            this._type = type || 'ERROR';
            this._projectId = projectId || '0';
            if (typeof(jsonError) == 'object') {
                jsonError.navigator = window.navigator;
                this._message = JSON.stringify(jsonError);
            }
            else {
                this._message = jsonError + ', navigator: ' + window.navigator;
            }
            
            this._requestNewId();
        },
        _requestNewId: function () {
            var req = new PocketCode.ServiceRequest(PocketCode.Services.LOGGING_ID, SmartJs.RequestMethod.GET);
            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._newIdReceivedHandler, this));         //TODO: handle onError ???
            this._proxy.send(req);
        },
        _newIdReceivedHandler: function(e) {
            var req = new PocketCode.ServiceRequest(PocketCode.Services.LOGGING, SmartJs.RequestMethod.GET, {id: e.uuid, projectId: this._projectId, type: this._type, jsonError: this._message});
            req.onLoad.addEventListener(new SmartJs.Event.EventListener(function(e){ this._onLoggingMsgSent.dispatch(e); }, this));
            this._proxy.send(req);
        },
        //_msgSentHandler: function(e) {
        //    this
        //},
        
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return LoggingProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.LoggingProvider = new PocketCode.LoggingProvider();
