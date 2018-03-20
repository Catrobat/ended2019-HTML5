/// <reference path="sj.js" />
/// <reference path="sj-core.js" />
/// <reference path="sj-event.js" />
/// <reference path="sj-communication.js" />
/// <reference path="sj-ui.js" />
'use strict';

SmartJs.Components = {

    Application: (function () {
        Application.extends(SmartJs.Core.EventTarget);

        function Application(viewport) {
            this._viewport = viewport;

            this._onConnectionStatusChange = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);

            this._online = navigator.onLine;
            this._offlineListener = this._addDomListener(window, 'offline', this._offlineHandler);
            this._onlineListener = this._addDomListener(window, 'online', this._onlineHandler);
            this._errorListener = this._addDomListener(window, 'error', this._errorHandler);
        }

        //Object.defineProperties(Application.prototype, {  //the application object doesn't need any public properties or events
        //    onConnectionStatusChange: {
        //        get: function () { return this._onConnectionStatusChange; },
        //        //enumerable: false,
        //        //configurable: true,
        //    },
        //    onError: {
        //        get: function () { return this._onError; },
        //    },
        //});

        Application.prototype.merge({
            _offlineHandler: function () {
                if (!this._online) return;
                this._online = false;
                this._onConnectionStatusChange.dispatchEvent({ online: false });
            },
            _onlineHandler: function () {
                if (this._online) return;
                this._online = true;
                this._onConnectionStatusChange.dispatchEvent({ online: true });
            },
            _errorHandler: function (e) {//error, fileName, lineNo) {
                //console.log('SmartJs.Components.Application: global error: ' + error + ', ' + fileName + ', ' + lineNo);
                this._onError.dispatchEvent({ error: e });//{ error: error, file: fileName, lineNo: lineNo });
            },
            dispose: function () {
                this._removeDomListener(window, 'offline', this._offlineListener);
                this._removeDomListener(window, 'online', this._onlineListener);
                this._removeDomListener(window, 'error', this._errorListener);
                //if (this._viewport)
                //    this._viewport.dispose();
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return Application;
    })(),

    Timer: (function () {
        Timer.extends(SmartJs.Core.Component);

        function Timer(delay, listener, startOnInit, callbackArgs) {
            if (isNaN(delay) || parseInt(delay) !== delay)
                throw new Error('invalid argument delay: expected type: int');
            this._delay = delay;
            //this._remainingTime = delay;  //init on start()
            this._callBackArgs = callbackArgs;  //introduced to enable threaded timer identification
            this._paused = false;

            //events
            this._onExpire = new SmartJs.Event.Event(this);
            if (listener)
                this._onExpire.addEventListener(listener);

            if (startOnInit)
                this.start();
        }

        //events + properties
        Object.defineProperties(Timer.prototype, {
            onExpire: {
                get: function () { return this._onExpire; },
                //enumerable: false,
                //configurable: true,
            },
            remainingTime: {
                get: function () {
                    if (this._paused || this._remainingTime === 0)
                        return this._remainingTime;
                    else
                        return this._remainingTime - (Date.now() - this._startTime);
                },
                //enumerable: false,
                //configurable: true,
            },
        });

        //methods
        Timer.prototype.merge({
            start: function () {
                this._clearTimeout();

                this._startTime = Date.now();
                this._remainingTime = this._delay;
                if (this._remainingTime === 0) {
                    this._onExpire.dispatchEvent(this._callBackArgs);
                    return;
                }
                this._setTimeout(this._delay);
                this._paused = false;
            },
            pause: function () {
                if (this._paused)
                    return;

                this._clearTimeout();
                this._remainingTime -= (Date.now() - this._startTime);
                if (this._remainingTime < 0)    //
                    this._remainingTime = 0;
                this._paused = true;
            },
            resume: function () {
                if (!this._paused)
                    return;

                this._startTime = Date.now();
                this._setTimeout(this._remainingTime);
                this._paused = false;
            },
            stop: function () {
                this._clearTimeout();
                this._remainingTime = 0;
                this._paused = false;
            },
            _dispatchExpire: function () {
                this._remainingTime = 0;
                this._onExpire.dispatchEvent(this._callBackArgs);
            },
            _setTimeout: function (delay) {
                this._clearTimeout();

                //var callback = this._dispatchExpire;
                this._timeoutId = window.setTimeout(this._dispatchExpire.bind(this), delay);
            },
            _clearTimeout: function () {
                if (this._timeoutId) {
                    window.clearTimeout(this._timeoutId);
                    this._timeoutId = undefined;
                }
            },
            dispose: function () {
                this.stop();
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return Timer;
    })(),

    Stopwatch: (function () {
        Stopwatch.extends(SmartJs.Core.Component);

        function Stopwatch(device, sprite, jsonStopwatch) {
            this._init();
        }

        //accessors
        Object.defineProperties(Stopwatch.prototype, {
            value: {
                get: function () {
                    var ms = 0.0;
                    if (!this._startDateTime)
                        return ms;
                    if (this._pausedDateTime)   //currently paused
                        ms = (this._pausedDateTime - this._startDateTime) - this._pausedTimespan;
                    else
                        ms = (Date.now() - this._startDateTime) - this._pausedTimespan;
                    return ms / 1000.0;
                },
            },
        });

        //methods
        Stopwatch.prototype.merge({
            _init: function () {
                this._startDateTime = undefined;
                this._pausedDateTime = undefined;   //only set if currently paused
                this._pausedTimespan = 0.0;
            },
            start: function () {
                this._init();
                this._startDateTime = Date.now();
            },
            reset: function () {
                this._init();
            },
            pause: function () {
                this._pausedDateTime = Date.now();
            },
            resume: function () {
                this._pausedTimespan += Date.now() - this._pausedDateTime;
                this._pausedDateTime = undefined;
            },
            stop: function () {
                this._init();
            },
            dispose: function () {
                this.stop();
                SmartJs.Core.Component.prototype.dispose.call(this);
            }
        });

        return Stopwatch;
    })(),

    WebWorker: (function () {
        WebWorker.extends(SmartJs.Core.EventTarget);

        function WebWorker(scope, workerMethod, helperMethods) {

            if (!(scope instanceof Object))
                throw new Error('invalid argument: scope');
            this._scope = scope;
            if (!(workerMethod instanceof Function))
                throw new Error('invalid argument: workerMethod');
            this._workerMethod = workerMethod;

            this._running = false;
            if (helperMethods && !(helperMethods instanceof Object))
                throw new Error('invalid argument: helperMethods');

            //create web worker internal code
            var internalCode = ['onmessage=', this._internalOnMessage/*.toString()*/, '; var workerMethod=', this._workerMethod];
            if (helperMethods) {
                for (var prop in helperMethods) {
                    if (!(helperMethods[prop] instanceof Function))
                        throw new Error('invalid argument: helper methods {functionName: Function}');
                    internalCode = internalCode.concat([', ', prop, '=', helperMethods[prop]]);
                }
            }
            internalCode.push(';');

            //create inline worker
            try {   //supported
                var blobURL = URL.createObjectURL(new Blob(internalCode), { type: "text/javascript" });
                this._worker = new Worker(blobURL);
                URL.revokeObjectURL(blobURL);

                this._onMessageListener = this._addDomListener(this._worker, 'message', this._onMessageHandler);
                this._onErrorListener = this._addDomListener(this._worker, 'error', this._onErrorHandler);
                this._onMessageErrorListener = this._addDomListener(this._worker, 'messageerror', this._onMessageErrorHandler);
            }
            catch (e) { //not supported
                this._worker = undefined;
            }

            //events
            this._onExecuted = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(WebWorker.prototype, {
            onExecuted: {
                get: function () { return this._onExecuted; },
            },
            onError: {
                get: function () { return this._onError; },
            },
        });

        //properties
        Object.defineProperties(WebWorker.prototype, {
            isRunning: {
                get: function () {
                    return this._running;
                },
            },
        });

        //methods
        WebWorker.prototype.merge({
            /*code below is injected to run inside the worker*/
            _internalOnMessage: function (e) {
                var data = e.data,
                    returnValue = this.workerMethod.apply(this, data.arguments);

                if (data.buffer)
                    this.postMessage(returnValue, [returnValue.data.buffer]);
                else
                    this.postMessage(returnValue);
                //this.close();
            },
            /*code above is injected to run inside the worker*/

            execute: function (/*arguments*/) {
                if (!this._worker) {
                    this._onExecuted.dispatchEvent({ result: this._workerMethod.apply(this._scope, [].slice.call(arguments)), async: false });
                    return;// this._workerMethod.apply(this._scope, arguments);    //TODO dispatch event
                }

                if (this._running)
                    throw new Error('worker currently in use');
                this._running = true;
                this._worker.postMessage({ arguments: [].slice.call(arguments), buffer: false });    //post as argument array
            },
            executeImageData: function (imageData) {
                if (!(imageData instanceof ImageData))
                    throw new Error('invalid argument: imageData');
                if (!this._worker) {
                    this._onExecuted.dispatchEvent({ result: this._workerMethod.call(this._scope, imageData), async: false });
                    return;// this._workerMethod.apply(this._scope, arguments);    //TODO dispatch event
                }

                if (this._running)
                    throw new Error('worker currently in use');
                this._running = true;
                this._worker.postMessage({ arguments: [imageData], buffer: true }, [imageData.data.buffer]);
            },
            _onMessageHandler: function (e) {
                this._running = false;
                this._onExecuted.dispatchEvent({ result: e.data, async: true }); //TODO
            },
            _onErrorHandler: function (e) {
                this._running = false;
                this._onError.dispatchEvent({ error: e }); //TODO
            },
            _onMessageErrorHandler: function (e) {
                this._running = false;
                this._onError.dispatchEvent({ error: e }); //TODO
            },
            terminate: function () {
                if (this._worker)
                    this._worker.terminate();
            },
            /*override*/
            dispose: function () {
                if (this._worker) {
                    this._worker.terminate();

                    this._removeDomListener(this._worker, 'message', this._onMessageListener);
                    this._removeDomListener(this._worker, 'error', this._onErrorListener);
                    this._removeDomListener(this._worker, 'messageerror', this._onMessageErrorListener);
                }
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return WebWorker;
    })(),

    StorageAdapter: (function () {
        StorageAdapter.extends(SmartJs.Core.Component);

        function StorageAdapter() {
            this._onChange = new SmartJs.Event.Event(this);
            this._supported = false;
        }

        //events
        Object.defineProperties(StorageAdapter.prototype, {
            onChange: {
                get: function () {
                    return this._onChange;
                },
            },
        });

        //properties
        Object.defineProperties(StorageAdapter.prototype, {
            supported: {
                get: function () {
                    return this._supported;
                },
            },
        });

        //methods
        StorageAdapter.prototype.merge({
            _validate: function (key) {
                if (!key || typeof key != 'string')
                    throw new Error('invalid argument: key, expected type = string');
                if (!this._supported)
                    throw new Error('Adapter not supported');
                return true;
            },
            getValue: function (key) {
                this._validate(key);

                var item = this._getValue(key);
                if (item) {
                    item = JSON.parse(item);    //this may throw an error if it's not a value set by this adapter
                    if (item.type == 'object')
                        return JSON.parse(item.value);
                    else if (item.type == 'number')
                        return parseFloat(item.value);
                    else if (item.type == 'boolean')
                        return item.value == 'true' ? true : false;

                    return item.value;
                }
                return undefined;
            },
            _getValue: function (key) {
                //to override in derived classes
            },
            setValue: function (key, value) {
                this._validate(key);
                var oldValue = this.getValue(key),
                    isObject = typeof value == 'object',
                    item = {
                        type: typeof value,
                        value: isObject ? JSON.stringify(value) : value.toString(),
                    };

                this._setValue(key, JSON.stringify(item));
                if ((isObject && JSON.stringify(this.getValue(key)) != item.value) ||   //using string compare for objects
                    (!isObject && this.getValue(key) !== value))
                    throw new Error('Adapter: value not set correctly');

                this._onChange.dispatchEvent({
                    key: key,
                    oldValue: oldValue,
                    newValue: value,
                });
            },
            _setValue: function (key, value) {
                //to override in derived classes
            },
            deleteKey: function (key) {
                this._validate(key);
                try {
                    var oldValue = this.getValue(key);
                }
                catch (e) {
                    return false;
                }

                this._deleteKey(key);
                this._onChange.dispatchEvent({
                    key: key,
                    oldValue: oldValue,
                    newValue: undefined,
                });
                return true;
            },
            _deleteKey: function (key) {
                //to override in derived classes
            },
            clear: function () {
                if (!this._supported)
                    throw new Error('Adapter not supported');
                this._clear();
            },
            _clear: function () {
                //to override in derived classes
            },
        });

        return StorageAdapter;
    })(),

};

SmartJs.Components.merge({

    //adapters
    CookieAdapter: (function () {
        CookieAdapter.extends(SmartJs.Components.StorageAdapter, false);

        function CookieAdapter(daysUntilExpire) {
            SmartJs.Components.StorageAdapter.call(this);

            if (daysUntilExpire && typeof daysUntilExpire != 'number')
                throw new Error('invalid argument: expected type: daysUntilExpire = number');

            daysUntilExpire || (daysUntilExpire = 365);  //default: in one year
            this._expires = new Date().getTime() + 1000 * 60 * 60 * 24 * daysUntilExpire;
            this._supported = ('cookie' in document && (document.cookie.length > 0 ||
                              (document.cookie = 'test').indexOf.call(document.cookie, 'test') > -1)) && !!JSON;
        }

        //methods
        CookieAdapter.prototype.merge({
            _setValue: function (key, value) {
                document.cookie = key + '=' + value + '; path=/; expires=' + this._expires;
            },
            _getValue: function (key) {
                var result = (document.cookie.match('(^|; )' + key + '=([^;]*)') || 0)[2];

                if (result)
                    return result;
                return undefined;
            },
            _deleteKey: function (key) {
                document.cookie = key + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            },
            _clear: function () {
                var cookies = document.cookie.split(';'),
                    cookie;
                for (var i = 0; i < cookies.length; i++) {
                    cookie = cookies[i].trim();
                    var splitPos = cookie.indexOf('=');
                    if (splitPos > -1)
                        this.deleteKey(cookie.substr(0, splitPos));
                }
            },
        });

        return CookieAdapter;
    })(),

    //SessionStorageAdapter: (function () {
    //    SessionStorageAdapter.extends(SmartJs.Core.Component);

    //    function SessionStorageAdapter() {
    //    }
    //    //supported:
    //    //get: function(key){},
    //    //set: function(key, value){},
    //    //delete
    //    return SessionStorageAdapter;
    //})(),

    LocalStorageAdapter: (function () {
        LocalStorageAdapter.extends(SmartJs.Components.StorageAdapter, false);

        function LocalStorageAdapter() {
            SmartJs.Components.StorageAdapter.call(this);

            try {   //check read/write access to handle brosers private mode
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                this._supported = true;
            }
            catch (e) {
                this._supported = false;
            }
        }

        LocalStorageAdapter.prototype.merge({
            _setValue: function (key, value) {
                localStorage.setItem(key, value);
            },
            _getValue: function (key) {
                return localStorage.getItem(key);
                //return undefined;
            },
            _deleteKey: function (key) {
                localStorage.removeItem(key);
            },
            _clear: function () {
                //localStorage.clear(); //we want individual events
                var keys = [];
                for (var i = 0, l = localStorage.length; i < l; i++)
                    keys.push(localStorage.key(i));

                for (var i = 0, l = keys.length; i < l; i++)
                    this.deleteKey(keys[i]);
            },
        });

        return LocalStorageAdapter;
    })(),

});

/*
 * 
 * example: https://jsbin.com/civemiruho/edit?js,console
 * 
var a = function() {return 2;}
function run(fn) {
  console.log(a.toString());
  return new Worker(URL.createObjectURL(new Blob(['onmessage=',fn,'; var a=',a.toString(),';'])), { type: "text/javascript" });
}

const worker = run(function(d) {
  
  setTimeout(postMessage(JSON.stringify(d.data) + ', ' + this.a()), 10000)
  //postMessage(JSON.stringify(this));
  
  //this.close();
});

worker.onmessage = (event) => console.log(event.data);
setTimeout(worker.postMessage({a:1}), 5000);
 */