'use strict';

PocketCode._LoggingProvider = (function (propObject) {

    function LoggingProvider() {
        this._disabled = false;

        this._onLogMessageSent = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(LoggingProvider.prototype, {
        disabled: {
            get: function () {
                return this._disabled;
            },
            set: function (bool) {
                if (typeof bool !== 'boolean')
                    throw new Error('invalid parameter: expected type \'boolean\'');
                this._disabled = bool;
            },
        },
    });

    //events
    Object.defineProperties(LoggingProvider.prototype, {
        onLogMessageSent: {
            get: function () {
                return this._onLogMessageSent;
            },
        },
    });

    //methods
    LoggingProvider.prototype.merge({
        sendMessage: function (jsonError, projectId, type) {
            if (this._disabled)
                return;

            this._message = '';
            this._projectId = projectId || '0';
            this._type = type || 'ERROR';
            if (typeof jsonError == 'object') {
                for (var prop in jsonError) {    //JSON.stringify does not work here due to object dependencies
                    this._message += prop + ': ' + jsonError[prop] + ', \n';
                }
            }
            else {
                this._message = jsonError + ' \n';
            }

            this._requestNewId();
        },
        _requestNewId: function () {
            try {
                var req = new PocketCode.ServiceRequest(PocketCode.Services.LOGGING_ID, SmartJs.RequestMethod.GET);
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._newIdReceivedHandler, this));
                req.onError.addEventListener(new SmartJs.Event.EventListener(function (e) {
                    this._onLogMessageSent.dispatchEvent({ success: false });
                }, this));
                PocketCode.Proxy.send(req);
            }
            catch (e) {
                this._onLogMessageSent.dispatchEvent({ success: false }); //make sure an error does not trigger recursive calls
            }
        },
        _newIdReceivedHandler: function (e) {
            try {
                var navigatorString = 'location: ' + window.location + ', \n';
                navigatorString += 'isMobile: ' + SmartJs.Device.isMobile + ', \n';
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
                    this._onLogMessageSent.dispatchEvent(e.responseJson);
                }, this));
                req.onError.addEventListener(new SmartJs.Event.EventListener(function (e) {
                    this._onLogMessageSent.dispatchEvent({ success: false });
                }, this));
                PocketCode.Proxy.send(req);
            }
            catch (e) {
                this._onLogMessageSent.dispatchEvent({ success: false }); //make sure an error does not trigger recursive calls
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
PocketCode.LoggingProvider = new PocketCode._LoggingProvider();
