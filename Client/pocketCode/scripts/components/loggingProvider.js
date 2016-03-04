'use strict';

PocketCode.LoggingProvider = (function (propObject) {
    LoggingProvider.extends(SmartJs.Core.Component, false);

    function LoggingProvider() {//propObject) {
        //SmartJs.Core.Component.call(this, propObject);

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
        sendMessage: function (jsonError, projectId, type) {
            this._type = type || 'ERROR';
            this._projectId = projectId || '0';
            if (typeof (jsonError) == 'object') {
                //this._message = JSON.stringify(jsonError);
                for (var prop in jsonError) {    //Json.stringify does/may not work here
                    this._message += prop + ': ' + jsonError[prop] + ', \n';
                }
            }
            else {
                this._message = jsonError;
            }

            this._requestNewId();
        },
        _requestNewId: function () {
            try {
                var req = new PocketCode.ServiceRequest(PocketCode.Services.LOGGING_ID, SmartJs.RequestMethod.GET);
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._newIdReceivedHandler, this));
                req.onError.addEventListener(new SmartJs.Event.EventListener(function (e) {
                    this._onLoggingMsgSent.dispatchEvent({ success: false });
                }, this));
                PocketCode.Proxy.send(req);
            }
            catch (e) {
                this._onLoggingMsgSent.dispatchEvent({ success: false }); //make sure an error does not trigger recursive calls
            }
        },
        _newIdReceivedHandler: function (e) {
            try {
                var navigatorString = '';
                for (var prop in window.navigator) {    //Json.stringify does/may not work here
                    navigatorString += prop + ': ' + window.navigator[prop] + ', \n';
                }
                var req = new PocketCode.ServiceRequest(PocketCode.Services.LOGGING, SmartJs.RequestMethod.POST, {
                    sid: e.responseJson.sid,
                    id: e.responseJson.uuid,
                    projectId: this._projectId,
                    type: this._type,
                    navigator: decodeURIComponent(navigatorString),
                    jsonError: decodeURIComponent(this._message),
                });
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(function (e) {
                    this._onLoggingMsgSent.dispatchEvent(e.responseJson);
                }, this));
                req.onError.addEventListener(new SmartJs.Event.EventListener(function (e) {
                    this._onLoggingMsgSent.dispatchEvent({ success: false });
                }, this));
                PocketCode.Proxy.send(req);
            }
            catch (e) {
                this._onLoggingMsgSent.dispatchEvent({ success: false }); //make sure an error does not trigger recursive calls
            }
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return LoggingProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.LoggingProvider = new PocketCode.LoggingProvider();
