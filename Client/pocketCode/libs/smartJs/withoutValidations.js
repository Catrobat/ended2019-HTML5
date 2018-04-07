

'use strict';
/**
 * Object.merge provides a simple way to merge an existing object with another
 * All ixisting and writeable oject properties will be replaced, missing properties added
 * @param o: object that is merged into the original object
 */
Object.prototype.merge = function (o) {
    if (typeof o !== 'object')
        return this;

    for (var m in o) {
        if (o.hasOwnProperty(m)) {
            if (typeof this[m] === 'object' && typeof o[m] === 'object' && !(o[m] instanceof Array ))
                this[m].merge(o[m]);
            else
                this[m] = o[m];
        }
    }
    return this;
};
Object.defineProperty(Object.prototype, 'merge', { enumerable: false });

/**
 * Function.extends implements inheritance
 * A given class definition function is manipulatet to inherit from superClass
 * @param {function} superClass: class definition to inherit from
 * @param {boolean} [execSuperCtor=true] - should super contructor be called during inheritance
 */
Function.prototype.extends = function (superClass, execSuperCtor) {
    execSuperCtor = execSuperCtor !== false ? true : false;

    //for (var p in superClass) if (superClass.hasOwnProperty(p)) this[p] = superClass[p];
    var _proto = this.prototype;

    if (execSuperCtor)
        this.prototype = new superClass();
    else
        this.prototype = Object.create(superClass.prototype);

    this.prototype.constructor = _proto.constructor;
    //Object.defineProperties(this.prototype, {
    //    _super: {
    //        value: superClass.prototype,
    //    },
    //});
    //this.prototype._superCtor = function () { superClass.apply(this, arguments) };
};
Object.defineProperty(Function.prototype, 'extends', { enumerable: false });

/**
 * Array.insert inserts an object o into an array at a given index idx
 * @param {Array} o
 * @param {number} idx
 */
Array.prototype.insert = function (idx, o) {
    this.splice(idx, 0, o);
};
Object.defineProperty(Array.prototype, 'insert', { enumerable: false });

/**
 * Array.remove removes an object o from an (cut out)
 * @param o
 */
Array.prototype.remove = function (o) {
    var idx, counter = 0;
    while ((idx = this.indexOf(o)) !== -1) {
        this.splice(idx, 1);
        counter++;
    }

    return counter;
};
Object.defineProperty(Array.prototype, 'remove', { enumerable: false });

/**
 * Array.dispose disposes an Array by cutting out all items after trying to call dispose on them
 */
Array.prototype.dispose = function () {

    for (var i = this.length - 1; i >= 0; i--) {// in this) {
        if (this[i] && typeof this[i].dispose === 'function') { //&& this[i].dispose 
            this[i].dispose();
        }
    }
    this.length = 0;  //deletes all entries
};
Object.defineProperty(Array.prototype, 'dispose', { enumerable: false });


/* smart js infrastructure */

var SmartJs = {

    _version: 0.1,
    _objectId: 0,
    /**
     * SmartJs.getNewId generates a new unique id (in this DOM instance only)
     */
    getNewId: function () { return 'sj' + this._objectId++; },

    /**
     * SmartJs.Device is a helper object to simply indicate if a device supports touch events and/or is a mobile device
     */
    Device: {
        isIOs: ((typeof window.orientation !== 'undefined') && navigator.userAgent.match(/iPad|iPhone|iPod/i) && !navigator.userAgent.match(/IEMobile|Windows Phone/i)),
        isFirefoxOS: (!!"mozApps" in navigator && navigator.userAgent.search("Mobile") != -1 && avigator.userAgent.search("Android") < 0),
        isTouch: ('ontouchstart' in window) || ('msMaxTouchPoints' in navigator && navigator.msMaxTouchPoints > 0) || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0),
        isMobile: (typeof window.orientation !== 'undefined') || !!navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Phone|ZuneWP7|WPDesktop|webOS/i),
    },

    /**
     * SmartJs.isBrowserCompatible() tests the browser for compatibility with SmartJs
     */
    isBrowserCompatible: function () {
        var _result = true;
        var _tests = {
            //navigator_OperaMini: function () {
            //    if (window.operamini) {
            //        _result = false;
            //        return false;
            //    }
            //}(),
            Object_getPrototypeOf: function() {
                if (!Object.getPrototypeOf) {
                    _result = false;
                    return false;
                }
                return true;
            }(),
            Object_defineProperty: function () {
                if (!Object.defineProperty) {
                    _result = false;
                    return false;
                }
                else {
                    var _x = {}; //IE8 will allow property definitions only on DOM objects
                    try {
                        Object.defineProperty(_x, 'a', {
                            value: 'test',
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                    }
                    catch (ex) {
                        _result = false;
                        return false;
                    }
                }
                return true;
            }(),
            Array_indexOf: function () {
                if ([].indexOf) return true;

                _result = false;
                return false;
            }(),
            document_addEventListener: function () {
                if (document.addEventListener)
                    return true;

                _result = false;
                return false;
            }(),
            event_stopPropagation: function () {
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', false, true);
                if (e.stopPropagation) return true;

                _result = false;
                return false;
            }(),
            //event_target: function () {   //checking on one property is enough
            //    var e = document.createEvent('MouseEvents');
            //    e.initEvent('click', false, true);
            //    if (e.target) return true;

            //    _result = false;
            //    return false;
            //}(),
            String_trim: function () {
                if (''.trim) return true;

                _result = false;
                return false;
            }(),
            window_getComputedStyle: function() {
                if (!window.getComputedStyle) {
                    _result = false;
                    return false;
                }
                return true;
            }(),
            cssBoxSizing_borderBox: function () {
                var box = document.createElement('div');
                //box.style = {
                //    position: 'absolute',
                //    top: '-20px',
                //    left: '-20px',
                //    boxSizing: 'border-box',
                //    border: 'solid 3px black',
                //    height: '10px',
                //    width: '10px',
                //};
                var style = box.style;
                style.position = 'absolute';
                style.top = '-200px';
                style.left = '-200px';
                style.boxSizing = 'border-box';
                style.border = 'solid 30px black';
                style.height = '100px';
                style.width = '100px';

                document.body.appendChild(box);
                var supported = box.offsetHeight == 100 && box.offsetWidth == 100;
                document.body.removeChild(box);
                box = undefined;

                if (supported)
                    return true;

                _result = false;
                return false;
            }(),
            xmlHttpRequest: function () {
                try {
                    var xhr = new XMLHttpRequest();
                }
                catch (e) {
                    _result = false;
                    return false;
                }
                return true;
            }(),

            //TODO: add tests if browser compatibility is unknown
        };

        return { result: _result, tests: _tests };
    },
};

/* smart js core namespace */
SmartJs.Core = {};

SmartJs.Core = {
    String: (function () {
        //ctr
        function Strg(string /*, arguments*/) {

            this._string = string;
            this._format = arguments;
        }

        //Object.defineProperties(Strg.prototype, {
        //});

        Strg.prototype.merge({
            toString: function () {
                return this._string.replace(/({)(\d+)(})/gi,
                        function ($1, $2, idx) {
                            var currentIdx = parseInt(idx) + 1;

                            return this._format[currentIdx].toString();
                        }.bind(this));
            },
        });

        return Strg;
    })(),

    Component: (function () {
        //ctr
        function Component(propObject) {
            if (propObject)
                this._mergeProperties(propObject);
        }

        Object.defineProperties(Component.prototype, {
            objClassName: {
                get: function () {
                    return this.constructor.toString().match(/function\s*(\w+)/)[1];
                },
            },

        });

        Component.prototype.merge({
            __dispose: function (protoDispose) {
                if (this._disposing || this._disposed) return;     //already disposed
                this._disposing = true;

                for (var prop in this) {
                    if (typeof this[prop] === 'function' || !this.hasOwnProperty(prop))
                        continue;

                    if (this[prop] && typeof this[prop].dispose === 'function' && (!this[prop]._disposing || !this[prop]._disposed)) {
                        this[prop].dispose();
                    }

                    if (typeof prop !== 'function' && prop !== '_disposing')
                        delete this[prop];
                }
                var _proto = Object.getPrototypeOf(this);
                if (typeof _proto.__dispose === 'function')
                    _proto.__dispose(true);

                if (!protoDispose)
                    this._disposed = true;
                delete this._disposing;
                //delete this;  //objects references (this) cannot be deleted or set to undefined
            },
            dispose: function () {
                this.__dispose();
                delete this.constructor;// = undefined;
                this._disposed = true;
            },
            _mergeProperties: function (propertyObject, object) {//, root) {
                if (!propertyObject) return;
                object = object || this;
                //root = (root === undefined) ? true : false; //map to DOM element


                for (var p in propertyObject) {

                    if (typeof propertyObject[p] === 'object' && !(propertyObject[p] instanceof Array)) {
                        this._mergeProperties(propertyObject[p], object[p]);
                    }
                    else {
                        //var ignore = (/color/i).test(p);  //we need this to make sure the setter has changed ignoring color conversion
                        var saved = object[p];  //as soon the value has changed it has been set: fix to avoid errors on color conversion
                        try {
                            object[p] = propertyObject[p];
                        }
                        catch (e) { }   //silent catch due to write protected properties
                    }
                }
            },
        });

        return Component;
    })(),
};

SmartJs.Core.EventTarget = (function () {
    EventTarget.extends(SmartJs.Core.Component, false);

    function EventTarget(propObject) {
        SmartJs.Core.Component.call(this, propObject);
    }

    EventTarget.prototype.merge({
        _addDomListener: function (target, eventName, eventHandler, args) {
            var handler = function (e) {
                e = e || {};
                if (args) {
                    if (args.hasOwnProperty('stopPropagation') && args.stopPropagation !== false)
                        e.stopPropagation();
                    e.merge(args);
                }
                return eventHandler.call(this, e);
            }.bind(this);
            if (target.addEventListener)
                target.addEventListener(eventName, handler, false);
            else
                target.attachEvent('on' + eventName, handler);
            return handler;
        },

        _removeDomListener: function (target, eventName, eventHandler) {
            if (target.removeEventListener)
                target.removeEventListener(eventName, eventHandler, false);
            else
                target.detachEvent('on' + eventName, eventHandler);
        },
    });

    return EventTarget;
})();

SmartJs.Event = {
    Event: (function () {
        Event.extends(SmartJs.Core.Component);

        function Event(target) {
            //if (!(target instanceof SmartJs.Core.Component))
            //    throw new Error('invalid argument: expected target type: SmartJs.Core.Component');

            this.target = target;
            this._listeners = [];
        };

        //properties
        Object.defineProperties(Event.prototype, {
            listenersAttached: {
                get: function () {
                    return this._listeners && this._listeners.length > 0;
                },
            },
        });

        //methods
        Event.prototype.merge({
            addEventListener: function (listener) {

                var idx = this.__listenerIndex(listener);
                if (idx == -1) {  //not found
                    this._listeners.push(listener);
                    return true;
                }
                return false;
            },
            removeEventListener: function (listener) {
                if (this._disposed)
                    return false;

                var idx = this.__listenerIndex(listener);
                if (idx >= 0) {
                    this._listeners.splice(idx, 1);
                    return true;
                }
                return false;
            },
            __listenerIndex: function (listener) {
                var idx = this._listeners.indexOf(listener);
                if (idx >= 0)
                    return idx;

                var li = this._listeners;
                var item;
                for (var i = 0, l = li.length; i < l; i++) {
                    item = li[i];
                    if (!item) {
                        this._listeners.splice(i, 1);
                        i--; l--;
                        continue;
                    }
                    if (item.handler === listener.handler && item.scope === listener.scope)
                        return i;
                }
                return -1;
            },
            dispatchEvent: function (args, target, bubbles) {

                var li = this._listeners || []; //necessary due to the fact that bound events may call a disposed event
                var item,
                    dispatchedAt = Date.now();
                for (var i = 0, l = li.length; i < l; i++) {
                    item = li[i];
                    if (!item || !item.handler || (item.scope && item.scope._disposed)) {
                        this._listeners.splice(i, 1);
                        l--;
                        i--;
                        continue;
                    }

                    var a = args || {};
                    //try {    //notice: params change if an event is passed as the properties are read only
                    a.target = target || this.target;
                    a.bubbles = bubbles || false;
                    a.dispatchedAt = dispatchedAt;
                    //}
                    //catch (e) {
                    //    a.sjTarget = target || this.target;
                    //    a.sjBubbles = bubbles || false;
                    //}

                    if (item instanceof SmartJs.Event.AsyncEventListener) {
                        if (item.scope)
                            setTimeout(item.handler.bind(item.scope, a), 0);
                        else
                            setTimeout(function () { item.handler(a); }, 0);
                    }
                    else {  //SmartJs.Event.EventListener
                        if (item.scope)
                            item.handler.call(item.scope, a);
                        else
                            item.handler(a);
                    }
                }
            },
            dispose: function () {
                //if (this._disposed)
                //    return;
                //clear cross reference: prevent dispose of 'linked' objects
                this.target = undefined;
                this._listeners = undefined;
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });
        return Event;
    })(),

    EventListener: (function () {
        function EventListener(handler, scope) {

            this.handler = handler;
            this.scope = scope;
        };

        //Event.prototype.merge({
        //    dispose: function () {
        //        //clear cross reference
        //        delete this.handler;
        //        delete this.scope;
        //    },
        //});
        return EventListener;
    })(),

};


SmartJs.Event.AsyncEventListener = (function () {
    AsyncEventListener.extends(SmartJs.Event.EventListener, false);

    function AsyncEventListener(handler, scope) {
        SmartJs.Event.EventListener.call(this, handler, scope);
    }

    return AsyncEventListener;
})();


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
            this._delay = 0;
            this.delay = this._remainingTime = delay || 0;

            this._callBackArgs = callbackArgs;  //introduced to enable threaded timer identification
            this._paused = false;

            //events
            this._onExpire = new SmartJs.Event.Event(this);
            if (listener)
                this._onExpire.addEventListener(listener);

            if (startOnInit)
                this.start();
        }

        //events
        Object.defineProperties(Timer.prototype, {
            onExpire: {
                get: function () { return this._onExpire; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //properties
        Object.defineProperties(Timer.prototype, {
            delay: {
                set: function (value) {
                    if (this._remainingTime === 0)   //not started
                        this._delay = value;
                    else {
                        this.stop();
                        this._delay = value;
                        this.start();
                    }
                },
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
                if (this._remainingTime < 0)
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

        function Stopwatch() {
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
                        ms = (this._pausedDateTime - this._startDateTime);
                    else
                        ms = (Date.now() - this._startDateTime);
                    return ms / 1000.0;
                },
            },
            startTimestamp: {
                get: function () {
                    return this._startDateTime;
                },
            },
        });

        //methods
        Stopwatch.prototype.merge({
            _init: function () {
                this._startDateTime = undefined;
                this._pausedDateTime = undefined;   //only set if currently paused
            },
            start: function (timestamp) {
                this._init();
                this._startDateTime = timestamp || Date.now();
            },
            reset: function () {    //sets current timer to 0 (even if stated or paused)
                var started = !!this._startDateTime,
                    paused = !!this._pausedDateTime;
                this._init();
                if (paused)
                    this._startDateTime = this._pausedDateTime = Date.now();
                else if (started)
                    this._startDateTime = Date.now();
            },
            pause: function () {
                this._pausedDateTime = Date.now();
            },
            resume: function () {
                if (!this._pausedDateTime)
                    return;
                this._startDateTime += Date.now() - this._pausedDateTime;
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

    InlineWorker: (function () {
        InlineWorker.extends(SmartJs.Core.EventTarget);

        function InlineWorker(scope, workerMethod, lookupObject) {

            this._scope = scope;
            this._workerMethod = workerMethod;

            this._busy = false;

            //create web worker internal code
            var internalCode = ['onmessage = ', this._internalOnMessage, '; var workerMethod = ', this._workerMethod, ', '];
            internalCode = internalCode.concat(this._parseLookupObject(lookupObject));
            internalCode.pop();    //remove last ', '
            internalCode.push(';');

            //create inline worker
            try {   //supported
                var blob;
                try {
                    blob = new Blob(internalCode);
                }
                catch (e) {
                    //older browsers like IE11
                    if (!window.BlobBuilder)
                        window.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                    if (window.BlobBuilder) {
                        var bb = new BlobBuilder();
                        bb.append(internalCode.join(''));
                        blob = bb.getBlob();
                    }
                }
                this._blobURL = URL.createObjectURL(blob, { type: "text/javascript" });
                this._worker = new Worker(this._blobURL);
                //URL.revokeObjectURL(this._blobURL); //IE needs the URL to successfully run the worker

                this._onMessageListener = this._addDomListener(this._worker, 'message', this._onMessageHandler);
                this._onErrorListener = this._addDomListener(this._worker, 'error', this._onErrorHandler);
                this._onMessageErrorListener = this._addDomListener(this._worker, 'messageerror', this._onMessageErrorHandler);
            }
            catch (e) { //not supported
                URL.revokeObjectURL(this._blobURL);
                this._worker = undefined;
            }

            //events
            this._onExecuted = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(InlineWorker.prototype, {
            onExecuted: {
                get: function () { return this._onExecuted; },
            },
            onError: {
                get: function () { return this._onError; },
            },
        });

        //properties
        Object.defineProperties(InlineWorker.prototype, {
            isBusy: {
                get: function () {
                    return this._busy;
                },
            },
        });

        //methods
        InlineWorker.prototype.merge({
            /*code below is injected to run inside the worker*/
            _internalOnMessage: function (e) {
                var data = e.data,
                    returnValue = this.workerMethod.apply(this, data.arguments);

                if (data.buffer)
                    this.postMessage(returnValue, [returnValue.data.buffer]);
                else
                    this.postMessage(returnValue);
            },
            /*code above is injected to run inside the worker*/

            _parseLookupObject: function (obj, recursive) {
                var code = [];
                if (obj) {
                    for (var prop in obj) {
                        code.push(prop);
                        code.push(recursive ? ': ' : ' = ');
                        if (typeof obj[prop] != 'object')
                            code.push(obj[prop]);
                        else {
                            code.push('{ ');
                            code = code.concat(this._parseLookupObject(obj[prop], true));
                            code.push(' }');
                        }
                        code.push(', ');
                    }
                }
                return code;
            },
            _checkFallback: function (args) {
                if (!this._worker) {
                    this._onExecuted.dispatchEvent({ result: this._workerMethod.apply(this._scope, args), async: false });
                    return true;
                }

                this._busy = true;
                return false;
            },
            execute: function (/*arguments*/) {
                var args = [].slice.call(arguments);
                if (!this._checkFallback(args))
                    this._worker.postMessage({ arguments: args, buffer: false });    //post as argument array
            },
            executeOnImageData: function (/*arguments*/) {    //1st has to be imageData
                var args = [].slice.call(arguments);
                if (!this._checkFallback(args))
                    this._worker.postMessage({ arguments: args, buffer: true }, [args[0].data.buffer]);
            },
            _onMessageHandler: function (e) {
                this._busy = false;
                this._onExecuted.dispatchEvent({ result: e.data, async: true });
            },
            _onErrorHandler: function (e) {
                this._busy = false;
                this._onError.dispatchEvent({ message: e.message });
            },
            _onMessageErrorHandler: function (e) {
                this._busy = false;
                this._onError.dispatchEvent({ message: e.message });
            },
            //terminate: function () {
            //    if (this._worker)
            //        this._worker.terminate();
            //    this._busy = false;
            //},
            /*override*/
            dispose: function () {
                if (this._worker) {
                    if (this._blobURL)
                        URL.revokeObjectURL(this._blobURL);
                    this._worker.terminate();
                    this._removeDomListener(this._worker, 'message', this._onMessageListener);
                    this._removeDomListener(this._worker, 'error', this._onErrorListener);
                    this._removeDomListener(this._worker, 'messageerror', this._onMessageErrorListener);
                }
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return InlineWorker;
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


            daysUntilExpire || (daysUntilExpire = 365);  //default: in one year
            var date = new Date();
            date.setTime(date.getTime() + (daysUntilExpire * 24 * 60 * 60 * 1000));
            this._expires = date.toUTCString();
            this._supported = ('cookie' in document && (document.cookie.length > 0 ||
                              (document.cookie = 'test').indexOf.call(document.cookie, 'test') > -1)) && !!JSON;
            if (this._supported)
                this._deleteKey('test');
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


SmartJs._AnimationFrame = (function () {

    function AnimationFrame() {
        this._frameId = undefined;

        //event (private)
        this._onUpdate = new SmartJs.Event.Event(this);
    }

    //methods
    AnimationFrame.prototype.merge({
        _request: function () {
            var request = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame;
            if (request)
                return request.bind(window);
            return function (callback) { return window.setTimeout(callback, 17); };   //~1000/60 (60fps)
        }(),
        _cancel: function () {
            var cancel = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelAnimationFrame;
            if (cancel)
                return cancel.bind(window);
            return function (id) { window.clearTimeout(id) };
        }(),
        _run: function () {
            this._onUpdate.dispatchEvent();
            this._frameId = this._request(this._run.bind(this));
        },
        addEventListener: function (listener) {
            var e = this._onUpdate,
                start = !e.listenersAttached;
            e.addEventListener(listener);
            if (start)
                this._frameId = this._request(this._run.bind(this));
        },
        removeEventListener: function (listener) {
            var e = this._onUpdate
            e.removeEventListener(listener);
            if (!e.listenersAttached) {
                this._cancel(this._frameId);
                this._frameId = undefined;
            }
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return AnimationFrame;
})();

//static class: constructor override (keeping code coverage enabled)
SmartJs.AnimationFrame = new SmartJs._AnimationFrame();


SmartJs.Animation = {

    Type: {
        LINEAR: function (progress) {
            //progress parameter = 0..1 as the time progress
            //returns the animation progress based on a animation function f(1) = 1
            return progress;
        },
        //QUAD: function (progress) {
        //    return Math.pow(progress, 2);
        //},
        LINEAR2D: function (progress) {
            return { x: progress, y: progress };
        },
    },

    Animation: (function () {
        Animation.extends(SmartJs.Core.Component);
        //ctr
        function Animation(start, end, time, /* function */ render/*, updateListener, startOnInit, callbackArgs*/) {


            this._callbackArgs = {};
            this._paused = false;

            this._start = start;
            this._end = end;
            //if (typeof start === 'number' && typeof end === 'number')
            this._diff = end - start;   //make sure this does work for inherited classes too (base ctr call)
            this._current = start;

            this._animationTime = time;
            this._render = render;  //the rendering function - SmartJs.Animation.TYPE

            this._timer = new SmartJs.Components.Timer(this._animationTime);
            this._afl = new SmartJs.Event.EventListener(this._executeAnimation, this);

            //events
            this._onUpdate = new SmartJs.Event.Event(this);
            this._onExecuted = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(Animation.prototype, {
            onUpdate: {
                get: function () { return this._onUpdate; },
                //enumerable: false,
                //configurable: true,
            },
            onExecuted: {
                get: function () { return this._onExecuted; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //methods
        Animation.prototype.merge({
            _updateValue: function (factor) {
                var value = this._start + factor * this._diff;
                if (factor == 1.0) {
                    this._current = this._end;
                    this._onUpdate.dispatchEvent({ value: this._end });
                    return;
                }
                if (Math.abs(this._current - value) < 1)  //makes sure we only trigger updates if pixels change
                    return;

                this._current = value;
                this._onUpdate.dispatchEvent({ value: value });
            },
            _executeAnimation: function () {
                if (this._paused)
                    return;

                var remaining = this._timer.remainingTime;
                var progress = Math.min(1.0, (this._animationTime - remaining) / this._animationTime);  //timers are not exact
                this._updateValue(this._render(progress));

                if (progress == 1.0) {
                    this.stop();
                    this._onExecuted.dispatchEvent(this._callbackArgs);
                }
            },
            start: function (callbackArgs) {
                if (callbackArgs) {
                    this._callbackArgs = callbackArgs;  //introduced to enable threaded animation identification
                }
                this._timer.start();
                SmartJs.AnimationFrame.addEventListener(this._afl);
            },
            pause: function () {
                this._timer.pause();
                this._paused = true;
            },
            resume: function () {
                this._timer.resume();
                this._paused = false;
            },
            stop: function () {
                this._timer.stop();
                SmartJs.AnimationFrame.removeEventListener(this._afl);
                this._paused = false;
            },
            dispose: function () {
                this.stop();
                this._timer.dispose();
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return Animation;
    })(),
};

SmartJs.Animation.Animation2D = (function () {
    Animation2D.extends(SmartJs.Animation.Animation, false);

    //ctr
    function Animation2D(start, end, time, /* function */ render/*, listener, startOnInit, callbackArgs*/) {
        SmartJs.Animation.Animation.call(this, 0, 0, time);//, render/*, listener, startOnInit, callbackArgs*/);

        this._render = render;

        this._start = start;
        this._end = end;

        this._diff = {
            x: end.x - start.x,
            y: end.y - start.y,
        };
        this._current = start;
    }

    //methods
    Animation2D.prototype.merge({
        /* override */
        _updateValue: function (factor) {
            var value = {
                x: this._start.x + factor.x * this._diff.x,  //makes sure we only trigger updates if pixels change
                y: this._start.y + factor.y * this._diff.y,
            };

            if (factor.x == 1.0 && factor.y == 1.0) {
                this._current = this._end;
                this._onUpdate.dispatchEvent({ value: this._end });
                return;
            }
            if ((Math.abs(this._current.x - value.x) < 1 && Math.abs(this._current.y - value.y) < 1))
                return;

            this._current = value;
            this._onUpdate.dispatchEvent({ value: value });
        },
    });

    return Animation2D;
}());

SmartJs.Animation.Rotation = (function () {
    Rotation.extends(SmartJs.Core.Component);

    //ctr
    function Rotation(angle) {
        this._startAngle = angle;
        this._rotationSpeed = 0.0;

        this._timer = new SmartJs.Components.Stopwatch();
        this._afl = new SmartJs.Event.EventListener(this._executeAnimation, this);
        this._paused = false;

        //events
        this._onUpdate = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(Rotation.prototype, {
        onUpdate: {
            get: function () { return this._onUpdate; },
        },
    });

    //properties
    Object.defineProperties(Rotation.prototype, {
        angle: {
            get: function () {
                var angle = (this._startAngle + this._timer.value * this._rotationSpeed) % 360.0;
                //modulo for negative numbers will return a negative number in js
                if (angle < 0)
                    angle += 360.0;
                return angle;
            },
            set: function (angle) {

                this._startAngle = angle;
                this._timer.reset();
                if (!this._timer.startTimestamp || this._paused)
                    this._onUpdate.dispatchEvent({ value: this.angle });
            },
        },
        rotationSpeed: {    //angle per second
            get: function () {
                return this._rotationSpeed;
            },
            set: function (value) {
                if (value == this._rotationSpeed)
                    return;
                this._startAngle = this.angle;  //new start angle due to change
                this._rotationSpeed = value;
                if (value == 0.0) {
                    this.stop();
                    this._onUpdate.dispatchEvent({ value: this.angle });
                }
                else if (this._paused)//reset timer
                    this._timer.reset();
                else
                    this._start();
            },
        },
    });

    Rotation.prototype.merge({
        _executeAnimation: function () {
            if (this._paused)
                return;
            this._onUpdate.dispatchEvent({ value: this.angle });
        },
        toObject: function () { //alows exact cloning
            return {
                startAngle: this._startAngle,
                startTimestamp: this._timer.startTimestamp,
                rotationSpeed: this._rotationSpeed,
            };
        },
        setObject: function (obj) { //alows exact cloning
            this._startAngle = obj.startAngle || 0.0;
            this._rotationSpeed = obj.rotationSpeed || 0.0;
            if (obj.startTimestamp && !!obj.rotationSpeed)
                this._start(obj.startTimestamp);
        },
        _start: function (startTimestamp) {   //or restart
            this._timer.start(startTimestamp);
            SmartJs.AnimationFrame.addEventListener(this._afl);
            this._paused = false;
        },
        pause: function () {
            this._timer.pause();
            window.cancelAnimationFrame(this._frameId);
            this._paused = true;
        },
        resume: function () {
            this._timer.resume();
            this._paused = false;
        },
        stop: function () {
            SmartJs.AnimationFrame.removeEventListener(this._afl);
            this._timer.stop();
            this._paused = false;
        },
        dispose: function () {
            this.stop();
            this._timer.dispose();
            SmartJs.Core.Component.prototype.dispose.call(this);
        },
    });

    return Rotation;
}());


SmartJs.RequestMethod = {
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
    DELETE: 'DELETE',
};

SmartJs.Communication = {
    ServiceRequest: (function () {
        ServiceRequest.extends(SmartJs.Core.EventTarget);

        function ServiceRequest(url) {
            this._url = url || '';
            //this._xhr = undefined;

            //events
            this._onLoadStart = new SmartJs.Event.Event(this);
            this._onLoad = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
            //this._onAbort = new SmartJs.Event.Event(this);
            this._onProgressChange = new SmartJs.Event.Event(this);
            this._onProgressSupportedChange = new SmartJs.Event.Event(this);
        }

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
            //onAbort: {
            //    get: function () { return this._onAbort; },
            //    //enumerable: false,
            //    //configurable: true,
            //},
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

        //properties
        Object.defineProperties(ServiceRequest.prototype, {
            url: {
                get: function () {
                    return this._url;
                },
                set: function (value) {
                    this._url = value;
                },
                //enumerable: false,
                //configurable: true,
            },
            method: {
                value: SmartJs.RequestMethod.GET,   //default
                writable: true,
            },
            progressSupported: {
                value: false,   //default
                writable: true,
            },
        });

        //methods
        ServiceRequest.prototype.merge({
            _onProgressHandler: function (e) {
                if (e.lengthComputable) {
                    //var percentComplete = e.loaded / e.total * 100;
                    if (this._onProgressChange)
                        this._onProgressChange.dispatchEvent({ progress: Math.round(e.loaded / e.total * 100) });//.merge(e));
                }
                else {
                    // Unable to compute progress information since the total size is unknown
                    if (this.progressSupported) {
                        this.progressSupported = false;
                        if (this._onProgressSupportedChange)
                            this._onProgressSupportedChange.dispatchEvent({ progressSupport: false });
                    }
                }
            },
            //_onLoadstartHandler: function (e) {
            //    //this._onLoadStart.dispatchEvent(e);
            //},
            //_onLoadHandler: function (e) {
            //    //this._loaded = true;
            //    //if (this._xmle.status !== 200)
            //    //this._onLoad.dispatchEvent(e);
            //},
            //_onErrorHandler: function (e) {
            //    //this._error = e;
            //    //this._onError.dispatchEvent(e);
            //},
            //_onAbortHandler: function (e) {
            //    this._onAbort.dispatchEvent(e);
            //},
            _onReadyStateChangeHandler: function (e) {
                if (!this._started && this._xhr.readyState === 1) {
                    this._started = true;   //make sure this event is only triggered oncec
                    this._onLoadStart.dispatchEvent();//{}.merge(e));
                }

                if (this._xhr.readyState !== 4)
                    return;

                //console.log('onloadend ');
                //if (this._error) {
                //    this._onError.dispatchEvent(this._error);
                //    //console.log('error1 ');
                //}
                //else {
                if (this._xhr.status !== 200) { //this._loaded && 
                    //console.log('error2 ');
                    var err = new Error();//this._xhr.responseText);
                    err.responseText = this._xhr.responseText;
                    try {
                        err.responseJson = JSON.parse(this._xhr.responseText);
                    }
                    catch (e) { }
                    err.statusCode = this._xhr.status;
                    this._onError.dispatchEvent(err);//{}.merge(e));
                }
                else
                    //console.log('loaaaaaded, ' + this._xhr.readyState + ', ' + this._xhr.status);
                    this._onLoad.dispatchEvent({}.merge(e.target));
                //}
            },
            dispose: function () {
                if (this._xhr)
                    this._xhr.abort();
                //this._onLoadStart = undefined;
                //this._onLoad = undefined;
                //this._onError = undefined;
                //this._onAbort = undefined;
                //this._onProgressChange = undefined;
                //this._onProgressSupportedChange = undefined;
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return ServiceRequest;
    })(),
};

SmartJs.Communication.merge({

    XmlHttpRequest: (function () {
        XmlHttpRequest.extends(SmartJs.Communication.ServiceRequest, false);

        function XmlHttpRequest(url) {
            SmartJs.Communication.ServiceRequest.call(this, url);
            //this._pendingRequest = false;
            this._xhr = new XMLHttpRequest();
            var xhr = this._xhr, xhru = xhr.upload;

            try {
                this.progressSupported = ('onprogress' in xhr);
                this._addDomListener(xhr, 'progress', this._onProgressHandler);
                if (xhru)
                    this._addDomListener(xhru, 'progress', this._onProgressHandler);
            }
            catch (e) {
                this.progressSupported = false;
            }

            //this._addDomListener(xhr, 'loadstart', this._onLoadstartHandler);
            //this._addDomListener(xhr, 'load', this._onLoadHandler);
            //this._addDomListener(xhr, 'error', this._onErrorHandler);
            //this._addDomListener(xhr, 'abort', this._onAbortHandler);
            this._addDomListener(xhr, 'readystatechange', this._onReadyStateChangeHandler); //loadend not supported by safari

            //this._addDomListener(xhru, 'loadstart', this._onLoadstartHandler);
            //this._addDomListener(xhru, 'load', this._onLoadHandler);
            //this._addDomListener(xhru, 'error', this._onErrorHandler);
            //this._addDomListener(xhru, 'abort', this._onAbortHandler);
            if (xhru)
                this._addDomListener(xhru, 'readystatechange', this._onReadyStateChangeHandler);
        }

        //properties
        Object.defineProperties(XmlHttpRequest.prototype, {
            supported: {
                get: function () {
                    if (!window.XMLHttpRequest)
                        return false;

                    //check: same origin policy
                    var loc = window.location, a = document.createElement('a');
                    a.href = this._url;
                    var port = loc.protocol == 'https:' ? '443' : loc.port;
                    var aPort = a.port; //safari fix
                    if (aPort == '0')
                        aPort = '';    
                    if (a.hostname != loc.hostname || (aPort != loc.port && aPort != port) || a.protocol != loc.protocol)  //TODO: check sub domains
                        return false;

                    return true;
                },
            },
            //timeout: {
            //    get: function () {
            //        return this._xhr.timeout;
            //    },
            //    set: function (value) {
            //        this._xhr.timeout = value;
            //    },
            //},
            //openend: {
            //    get: function () {
            //        return this._xhr.OPENED;
            //    },
            //},
            //response: {
            //    get: function () {
            //        return this._xhr.response;
            //    },
            //},
            //responseBody: {
            //    get: function () {
            //        return this._xhr.responseBody;
            //    },
            //},
            responseText: {
                get: function () {
                    return this._xhr.responseText;
                },
            },
            //responseType: {
            //    get: function () {
            //        return this._xhr.responseType;
            //    },
            //},
            //responseXML: {
            //    get: function () {
            //        return this._xhr.responseXML;
            //    },
            //},
        });

        //methods
        XmlHttpRequest.prototype.merge({
            send: function (method, url) {
                this.sendData(undefined, method, url);
            },
            sendData: function (data, method, url) {
                if (method)
                    this.method = method;

                if (url)
                    this._url = url;


                try {
                    if (data) {

                        if (this.method === SmartJs.RequestMethod.POST) {   //
                            if (data instanceof File && xhr.setRequestHeader) {
                                this._xhr.open(this.method, this._url);
                                //this._xhr.setRequestHeader('Content-type', data.type);
                                //this._xhr.setRequestHeader('X_FILE_NAME', data.name);
                                this._xhr.send(data);
                            }
                            else {
                                this._xhr.open(this.method, this._url);
                                //this._xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                                var form = '';
                                for (var prop in data)
                                    form += prop + '=' + data[prop] + '&';
                                this._xhr.send(form);
                            }
                        }
                        else {  //add data to request url
                            var firstProp = (this._url.indexOf('?') === -1);
                            for (var prop in data) {
                                this._url += (firstProp ? '?' : '&') + prop + '=' + data[prop];
                                firstProp = false;
                            }
                            this._xhr.open(this.method, this._url);
                            this._xhr.send();
                            //var e = 
                            //throw new Error('sending data requires RequestMethod.POST');
                            //this._onError.dispatchEvent(e);
                        }
                    }
                    else {
                        this._xhr.open(this.method, this._url);   //handle RequestMethod.PUT & DELETE outside this class if needed
                        this._xhr.send();
                    }
                }
                catch (e) {
                    this._onLoadStart.dispatchEvent();
                    e.statusCode = 0;
                    this._onError.dispatchEvent(e);//{ statusCode: 0 });//.merge(e));
                }
            },
            //dispose: function () {
            //    this._xhr.abort();
            //    SmartJs.Core.EventTarget.prototype.dispose.call(this);
            //},
        });

        return XmlHttpRequest;
    })(),

    CorsRequest: (function () {
        CorsRequest.extends(SmartJs.Communication.ServiceRequest, false);

        function CorsRequest(url) {
            SmartJs.Communication.ServiceRequest.call(this, url);

            if (!this.supported)
                return;

            if (!this._xhr) {
                this._xhr = new XMLHttpRequest();   //default
                //if (!('withCredentials' in this._xhr) && typeof XDomainRequest !== 'undefined') //this will not be called (XDomainRequest masked in this.supported to avoid errors)
                //    this._xhr = new XDomainRequest();
            }

            var xhr = this._xhr;
            //if (xhr.upload)
            //    var xhru = xhr.upload;

            try {
                this.progressSupported = ('onprogress' in xhr);
                this._addDomListener(xhr, 'progress', this._onProgressHandler);
                //if (xhru)
                //    this._addDomListener(xhru, 'progress', this._onProgressHandler);
            }
            catch (e) {
                this.progressSupported = false;
            }

            //if (this._xhr instanceof XMLHttpRequest) {
            this._addDomListener(xhr, 'readystatechange', this._onReadyStateChangeHandler); //loadend not supported by safari
            //xhr.onreadystatechange = function (e) { console.log('readystatechange event fired'); };//, false);
            //if (xhru)
            //    this._addDomListener(xhru, 'readystatechange', this._onReadyStateChangeHandler);
            //}
            //else {
            //    //this._addDomListener(xhr, 'loadstart', this._onLoadStart.dispatchEvent);
            //    this._addDomListener(xhr, 'load', this._onLoadHandler);
            //    this._addDomListener(xhr, 'error', this._onErrorHandler);
            //    //this._addDomListener(xhr, 'abort', this._onAbort.dispatchEvent);

            //    if (xhru) {
            //        //this._addDomListener(xhru, 'loadstart', this._onLoadStart.dispatchEvent);
            //        this._addDomListener(xhru, 'load', this._onLoadHandler);
            //        this._addDomListener(xhru, 'error', this._onErrorHandler);
            //        //this._addDomListener(xhru, 'abort', this._onAbort.dispatchEvent);
            //    }
            //}
        }

        //properties
        Object.defineProperties(CorsRequest.prototype, {
            //_onLoadHandler: function (e) {
            //    //this._loaded = true;              //TODO:
            //    //if (this._xmle.status !== 200)
            //    //this._onLoad.dispatchEvent(e);
            //},
            //_onErrorHandler: function (e) {
            //    //this._error = e;                  //TODO:
            //    //this._onError.dispatchEvent(e);
            //},
            supported: {
                get: function () {
                    if (!this._xhr)
                        this._xhr = new XMLHttpRequest();

                    if ('withCredentials' in this._xhr)
                        return true;
                    //if (typeof XDomainRequest !== undefined)  //disabled due to missing testing infrastructure
                    //    return true;

                    return false;
                },
            },
            responseText: {
                get: function () {
                    return this._xhr.responseText;
                },
            },
        });

        //methods
        CorsRequest.prototype.merge({
            send: function (method, url) {
                this.sendData(undefined, method, url);
            },
            sendData: function (data, method, url) {
                if (method)
                    this.method = method;

                if (url)
                    this._url = url;


                try {
                    //if (!(this._xhr instanceof XMLHttpRequest)) //IE: XDomainRequest
                    //    this._onLoadStart.dispatchEvent();  //should be triggered even on error

                    if (data) {
                        if (this.method === SmartJs.RequestMethod.POST) {   //
                            if (data instanceof File && xhr.setRequestHeader) {
                                this._xhr.open(this.method, this._url);
                                //this._xhr.setRequestHeader('Content-type', data.type);
                                //this._xhr.setRequestHeader('X_FILE_NAME', data.name);
                                this._xhr.send(data);
                            }
                            else {
                                this._xhr.open(this.method, this._url);
                                //this._xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                                var form = '';
                                for (var prop in data)
                                    form += prop + '=' + data[prop] + '&';
                                this._xhr.send(form);
                            }
                        }
                        else {  //add data to request url
                            var firstProp = (this._url.indexOf('?') === -1);
                            for (var prop in data) {
                                this._url += (firstProp ? '?' : '&') + prop + '=' + data[prop];
                                firstProp = false;
                            }
                            this._xhr.open(this.method, this._url);
                            this._xhr.send();
                            //var e = 
                            //throw new Error('sending data requires RequestMethod.POST');
                            //this._onError.dispatchEvent(e);
                        }
                    }
                    else {
                        this._xhr.open(this.method, this._url);   //handle RequestMethod.PUT & DELETE outside this class if needed
                        //this._xhr.setRequestHeader('Referer', window.location);
                        this._xhr.send();
                    }
                }
                catch (e) {
                    //console.log('internal: error');
                    e.statusCode = 0;
                    this._onError.dispatchEvent(e);//{ statusCode: 0 }.merge(e));
                }
            },
            //_onProgressHandler: function (e) {
            //    if (e.lengthComputable) {
            //        //var percentComplete = e.loaded / e.total * 100;
            //        this._onProgressChange.dispatchEvent({ progress: e.loaded / e.total * 100 });
            //    }
            //    else {
            //        // Unable to compute progress information since the total size is unknown
            //        if (this.progressSupported) {
            //            this.progressSupported = false;
            //            this._onProgressSupportedChange.dispatchEvent({ progressSupport: false });
            //        }
            //    }
            //},
            //__send: function() {
            //},
            //dispose: function () {
            //    if (this._xhr.abort)
            //        this._xhr.abort();
            //    SmartJs.Core.EventTarget.prototype.dispose.call(this);
            //},
        });

        return CorsRequest;
    })(),

    ResourceLoader: (function () {
        ResourceLoader.extends(SmartJs.Core.EventTarget);

        function ResourceLoader () {
            this._loading = false;      //loading in progress
            this._useSizeForProgressCalculation = false;
            this._totalSize = 0;        //calcualted size if useSizeForProgressCalculation == true
            this._loadedSize = 0;
            this._registeredFiles = []; //files to load

            //events
            this._onProgressChange = new SmartJs.Event.Event(this);
            this._onLoad = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(ResourceLoader.prototype, {
            useSizeForProgressCalculation: {    //otherwise: files.length is used (default)
                get: function() {
                    return this._useSizeForProgressCalculation;
                },
                set: function (value) {
                    if (value == this._useSizeForProgressCalculation)
                        return;
                    this._useSizeForProgressCalculation = value;
                },
            },
            crossOriginProperty: {
                set: function(value) {
                    this._crossOriginProperty = value;
                }
            }
        });

        //events
        Object.defineProperties(ResourceLoader.prototype, {
            onProgressChange: {
                get: function () {
                    return this._onProgressChange;
                },
            },
            onLoad: {
                get: function () {
                    return this._onLoad;
                },
            },
            onError: {
                get: function () {
                    return this._onError;
                },
            },
        });

        //methods
        ResourceLoader.prototype.merge({
            registerFiles: function (files) {

                var file;
                this._registeredFiles = [];
                this._totalSize = 0;
                for (var i = 0, l = files.length; i < l; i++) {
                    file = files[i];
                    this._registeredFiles.push(file);
                    if (this.useSizeForProgressCalculation) {
                        this._totalSize += file.size;
                    }
                }
            },
            load: function(files) {
                if (files)
                    this.registerFiles(files);

                this._loadedSize = 0;
                if (this._registeredFiles.length > 0) {
                    this._loading = true;
                    this._requestFile(0);
                }
                else
                    this._onLoad.dispatchEvent();
            },
            abortLoading: function () {
                this._loading = false;
            },
            _fileErrorHandler: function (e) {
                if (!this._loading)
                    return;
                this._loading = false;

                var idx = e.fileIndex;
                this._onError.dispatchEvent({ file: this._registeredFiles[e.fileIndex], element: e.element });
            },
            _fileSuccessHandler: function(e) {
                if (!this._loading) //aborted
                    return;
                var idx = e.fileIndex;
                if (this.useSizeForProgressCalculation) {
                    var file = this._registeredFiles[idx];
                    this._loadedSize += file.size;
                    this._onProgressChange.dispatchEvent({ progress: Math.round(this._loadedSize / this._totalSize * 100), file: this._registeredFiles[idx], element: e.element });
                }
                else
                    this._onProgressChange.dispatchEvent({ progress: Math.round((idx + 1) / this._registeredFiles.length * 100), file: this._registeredFiles[idx], element: e.element });
                if (idx + 1 == this._registeredFiles.length) {
                    this._loading = false;
                    this._onLoad.dispatchEvent();
                }
                else {
                    var loadNextFile = this._requestFile.bind(this, idx + 1);
                    window.setTimeout(loadNextFile, 20);    //make sure the ui gets rerendered
                }
            },
            _requestFile: function (fileIndex) {
                if (this._disposed)
                    return;
                var oHead = document.head || document.getElementsByTagName('head')[0];
                var file = this._registeredFiles[fileIndex];

                var tag = document.getElementById(file.url);
                if (tag) {    //make sure files files are not loaded more than once (inserted in DOM)
                    this._fileSuccessHandler({ fileIndex: fileIndex, element: tag });
                    return;
                }

                switch (file.type) {
                    case 'js':
                        var oScript = document.createElement('script');
                        oScript.async = false;  //ensure execution order after async download
                        this._addDomListener(oScript, 'error', this._fileErrorHandler, { fileIndex: fileIndex, element: oScript });

                        var loaded = false;
                        oScript.onload = oScript.onreadystatechange = function (e) {
                            if (!loaded && (!oScript.readyState || oScript.readyState === 'loaded' || oScript.readyState === 'complete')) {
                                loaded = true;
                                oScript.onload = oScript.onreadystatechange = null;
                                e = e || {};
                                e.merge({ fileIndex: fileIndex, element: oScript });
                                this._fileSuccessHandler(e);
                            }
                        }.bind(this);
                        oHead.appendChild(oScript);
                        oScript.id = oScript.src = file.url;
                        break;
                    case 'css':
                        var oCss = document.createElement('link');
                        oCss.type = 'text/css';
                        oCss.rel = 'stylesheet';
                        oCss.id = file.url;
                        oHead.appendChild(oCss);

                        var oCssSim = new Image();
                        this._addDomListener(oCssSim, 'error', this._fileSuccessHandler, { fileIndex: fileIndex, element: oCss });
                        oCssSim.src = file.url;
                        break;
                    case 'img':
                        var oImg = new Image();
                        if ('crossOrigin' in oImg && this._crossOriginProperty)
                            oImg.crossOrigin = this._crossOriginProperty;//'anonymous';
                        this._addDomListener(oImg, 'error', this._fileErrorHandler, { fileIndex: fileIndex, element: oImg});
                        this._addDomListener(oImg, 'load', this._fileSuccessHandler, { fileIndex: fileIndex, element: oImg });
                        oImg.src = file.url;
                        break;
                    default:
                        this._loading = false;
                        //this._onError.dispatchEvent({ target: this._registeredFiles[fileIndex], error: 'invalid fileType: ' + file.type });
                        throw new Error('invalid fileType: ' + file.type);
                }
            },
            dispose: function () {
                //this.abortLoading();
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return ResourceLoader;
    })(),
});


SmartJs.Ui = {};    //user interface namespace

SmartJs.Ui._Window = (function () {  //static class
    Window.extends(SmartJs.Core.EventTarget);

    //ctr
    function Window() {

        this._hiddenProperty = 'hidden';
        this._visible = true;

        //events
        //this._onLoad = new SmartJs.Event.Event(window);
        this._onResize = new SmartJs.Event.Event(window);
        this._onVisibilityChange = new SmartJs.Event.Event(window);

        //this._addDomListener(window, 'load', this._onLoadHandler);

        //var onResizeHandler = function () { };
        var resizeEventName = 'resize';
        if (window.orientationchange)
            resizeEventName = 'orientationchange';

        this._addDomListener(window, resizeEventName, function (e) { this._onResize.dispatchEvent({ height: this.height, width: this.width }); });
        //else
        //    this._resizeHandlerReference = this._addDomListener(window, 'resize', this._onResize.dispatchEvent({ height: this.height, width: this.width }));

        // Set the name of the hidden property and the change event for visibility
        var visibilityChangeEventName = '';
        if (typeof document.hidden !== undefined) { // Opera 12.10 and Firefox 18 and later support 
            this._hiddenProperty = 'hidden';
            visibilityChangeEventName = 'visibilitychange';
        }
        else if (typeof document.mozHidden !== undefined) {
            this._hiddenProperty = 'mozHidden';
            visibilityChangeEventName = 'mozvisibilitychange';
        }
        else if (typeof document.msHidden !== undefined) {
            this._hiddenProperty = 'msHidden';
            visibilityChangeEventName = 'msvisibilitychange';
        }
        else if (typeof document.webkitHidden !== undefined) {
            this._hiddenProperty = 'webkitHidden';
            visibilityChangeEventName = 'webkitvisibilitychange';
        }

        if (visibilityChangeEventName !== '') 
            this._addDomListener(document, visibilityChangeEventName, this._visibilityChangeHandler);

        if (visibilityChangeEventName == '' || SmartJs.Device.isIOs) {    //attach for iOs as well
            // IE 9 and lower:
            if ('onfocusin' in document) {
                //document.onfocusin = document.onfocusout = onchange;
                this._addDomListener(document, 'focusin', this._visibilityChangeHandler);
                this._addDomListener(document, 'focusout', this._visibilityChangeHandler);
            }
                // All others:
            else {
                //window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
                this._addDomListener(window, 'pageshow', this._visibilityChangeHandler);
                this._addDomListener(window, 'pagehide', this._visibilityChangeHandler);
                this._addDomListener(window, 'focus', this._visibilityChangeHandler);
                this._addDomListener(window, 'blur', this._visibilityChangeHandler);
            }
        }
    }

    //events
    Object.defineProperties(Window.prototype, {
        //onLoad: {
        //    get: function () { return this._onResize; },
        //    //enumerable: false,
        //    //configurable: true,
        //},
        onResize: {
            get: function () { return this._onResize; },
            //enumerable: false,
            //configurable: true,
        },
        onVisibilityChange: {
            get: function () { return this._onVisibilityChange; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //properties
    Object.defineProperties(Window.prototype, {
        title: {
            get: function () { return document.title; },
            set: function (value) { document.title = value; },
            //enumerable: false,
            //configurable: true,
        },
        visible: {
            get: function () {
                //if (document[this._hiddenProperty])
                //	return document[this._hiddenProperty];
                return this._visible;
            },
            //enumerable: false,
            //configurable: true,
        },
        height: {
            get: function () {
                if (window.innerHeight) {
                    return window.innerHeight;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    return document.documentElement.clientHeight;
                } else if (document.body.clientHeight) {
                    return document.body.clientHeight;
                }
                return 0;
            },
            //enumerable: false,
            //configurable: true,
        },
        width: {
            get: function () {
                if (window.innerWidth) {
                    return window.innerWidth;
                } else if (document.documentElement && document.documentElement.clientWidth) {
                    return document.documentElement.clientWidth;
                } else if (document.body.clientWidth) {
                    return document.body.clientWidth;
                }
                return 0;
            },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    Window.prototype.merge({
        //_onLoadHandler: function(e) {
        //    this._onLoad.dispatchEvent();
        //},
        _visibilityChangeHandler: function (e) {
            e = e || window.event;

            //if (e.target.visibilityState) {
            //    this._visible = e.target.visibilityState == 'visible' ? true : false;
            //}
            //else {
                //onfocusin and onfocusout are required for IE 9 and lower, while all others make use of onfocus and onblur, except for iOS, which uses onpageshow and onpagehide
                //var visible = {focus: true, focusin: true, pageshow: true};
                var hidden = { blur: false, focusout: false, pagehide: false };
                if (e.type in hidden)
                    this._visible = false;
                else
                    this._visible = document[this._hiddenProperty] === true ? false : true;//true;	//default
            //}
            this._onVisibilityChange.dispatchEvent({ visible: this._visible }.merge(e));
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return Window;
})();

//static class: constructor override (keeping code coverage enabled)
SmartJs.Ui.Window = new SmartJs.Ui._Window();


SmartJs.Ui.merge({
    TextNode: (function () {
        TextNode.extends(SmartJs.Core.Component);

        function TextNode(text) {
            this._text = text || '';
            this._dom = document.createTextNode(this._text);

            //events
            this._onResize = new SmartJs.Event.Event(this);
            this._onResize.addEventListener(new SmartJs.Event.EventListener(function (e) {
                var parent = this._parent;
                if (parent && parent !== e.caller)
                    this._parent.onLayoutChange.dispatchEvent({ caller: this });
            }, this));
        }

        //properties
        Object.defineProperties(TextNode.prototype, {
            text: {
                get: function () {
                    return this._text;
                },
                set: function (value) {
                    this._text = value;
                    this._dom.textContent = value;
                    this._onResize.dispatchEvent();
                },
            },
        });

        //methods
        TextNode.prototype.merge({
            hide: function () {
                this._dom.textContent = '';
                this._onResize.dispatchEvent();
            },
            show: function () {
                this._dom.textContent = this._text;
                this._onResize.dispatchEvent();
            },
            verifyResize: function () { //interface support only
            },
            dispose: function () {
                if (this._parent)
                    this._parent._removeChild(this);
                else if (document.body.contains(this._dom))
                    this._dom.parentNode.removeChild(this._dom);
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return TextNode;
    })(),

    Control: (function () {
        Control.extends(SmartJs.Core.EventTarget, false);

        function Control(element, propObject) {

            this._id = SmartJs.getNewId();

            if (element instanceof HTMLElement)
                this._dom = element;
            else if (typeof element === 'string')
                this._dom = document.createElement(element);


            this._dom.id = this._id;
            //this._innerDom = this._dom;

            this._parent = undefined;
            this._childs = [];
            this._cachedSize = { height: 0, width: 0, innerHeight: 0, innerWidth: 0 };
            //this._docked = false;

            //events
            this._onResize = new SmartJs.Event.Event(this);
            this._onResize.addEventListener(new SmartJs.Event.EventListener(function (e) {

                var size = this._cachedSize;// = { height: this.height, width: this.width };

                size.height = this.height;
                size.width = this.width;

                if (size.innerHeight !== this._innerHeight || size.innerWidth !== this._innerWidth) {
                    size.innerHeight = this._innerHeight;
                    size.innerWidth = this._innerWidth;

                    var childs = this._childs;
                    for (var i = 0, l = childs.length; i < l; i++)
                        childs[i].verifyResize(this);
                }

                var parent = this._parent;
                if (parent && parent !== e.caller)
                    this._parent.onLayoutChange.dispatchEvent({ caller: this });
            }, this));

            this._onLayoutChange = new SmartJs.Event.Event(this);
            this._onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                var childs = this._childs;
                for (var i = 0, l = childs.length; i < l; i++) {
                    var child = childs[i];
                    if (child !== e.caller)
                        child.verifyResize(this);
                }

            }, this));

            //base constructor has to be called after creating dom to avoid errors: propObject->style not available
            SmartJs.Core.EventTarget.call(this, propObject);
        }

        //properties
        Object.defineProperties(Control.prototype, {
            id: {
                get: function () {
                    return this._id;
                },
            },
            rendered: {
                get: function () {
                    if (!document.body)
                        return false;
                    //return (node === document.body) ? false : document.body.contains(node);
                    //if (this._dom)
                    return document.body.contains(this._dom);
                    //return false;
                },
            },
            style: {
                get: function () {
                    return this._dom.style; //returns a CSSStyleDeclaration object
                },
                set: function (value) {

                    var s = this._dom.style;
                    s.cssText = ''; //clear
                    for (var p in value) {
                        s[p] = value[p];
                    }
                    this.verifyResize();
                },
            },
            className: {
                get: function () {
                    return this._dom.className;
                },
                set: function (value) {
                    this._dom.className = value;
                    this.verifyResize();
                },
            },
            height: {
                get: function () {
                    if (!this.rendered)
                        return 0;

                    var _style = window.getComputedStyle(this._dom);
                    var height = this._dom.offsetHeight;
                    height += parseInt(_style.marginTop) || 0;  //returns NaN in e.g. Chrome
                    height += parseInt(_style.marginBottom) || 0;
                    return height;
                },
                set: function (value) {

                    var _style = window.getComputedStyle(this._dom);
                    if (_style.boxSizing !== 'border-box') {    //content-box or other
                        value -= parseInt(_style.paddingTop) || 0;
                        value -= parseInt(_style.paddingBottom) || 0;
                        value -= parseInt(_style.borderTopWidth) || 0;
                        value -= parseInt(_style.borderBottomWidth) || 0;
                    }

                    value -= parseInt(_style.marginTop) || 0;
                    value -= parseInt(_style.marginBottom) || 0;

                    value += 'px';
                    if (this.style.height !== value) {
                        this.style.height = value;
                        this.verifyResize();
                    }
                },
            },
            _innerHeight: {
                get: function () {
                    if (!this.rendered)
                        return 0;
                    var _style = window.getComputedStyle(this._dom);
                    var height = this._dom.clientHeight;
                    height -= parseInt(_style.paddingTop) || 0;
                    height -= parseInt(_style.paddingBottom) || 0;
                    return height;
                },
            },
            width: {
                get: function () {
                    if (!this.rendered)
                        return 0;
                    var _style = window.getComputedStyle(this._dom);
                    var width = this._dom.offsetWidth;
                    width += parseInt(_style.marginLeft) || 0;
                    width += parseInt(_style.marginRight) || 0;
                    return width;
                },
                set: function (value) {

                    var _style = window.getComputedStyle(this._dom);
                    if (_style.boxSizing !== 'border-box') {    //content-box or other
                        value -= parseInt(_style.paddingLeft) || 0;
                        value -= parseInt(_style.paddingRight) || 0;
                        value -= parseInt(_style.borderLeftWidth) || 0;
                        value -= parseInt(_style.borderRightWidth) || 0;
                    }

                    value -= parseInt(_style.marginLeft) || 0;
                    value -= parseInt(_style.marginRight) || 0;

                    value += 'px';
                    if (this.style.width !== value) {
                        this.style.width = value;
                        this.verifyResize();
                    }
                },
            },
            _innerWidth: {
                get: function () {
                    if (!this.rendered)
                        return 0;

                    var _style = window.getComputedStyle(this._dom);
                    var width = this._dom.clientWidth;
                    width -= parseInt(_style.paddingLeft) || 0;
                    width -= parseInt(_style.paddingRight) || 0;
                    return width;
                },
            },
            hidden: {
                get: function () {
                    var display = this._dom.style.display;
                    if (display === '' || display === 'block')
                        return false;
                    return true;
                },
            },
            clientRect: {
                get: function () {
                    return this._dom.getBoundingClientRect();
                },
            },
        });

        //events
        Object.defineProperties(Control.prototype, {
            onResize: {
                get: function () {
                    return this._onResize;
                },
            },
            onLayoutChange: {
                get: function () {
                    return this._onLayoutChange;
                },
            },
        });

        //methods
        Control.prototype.merge({
            verifyResize: function (caller) {
                if (this.hidden || !this.rendered) return;
                var size = this._cachedSize;

                if (size.height !== this.height || size.width !== this.width)
                    this.onResize.dispatchEvent({ caller: caller });
            },

            addClassName: function (className) {
                if (typeof className === undefined) return;

                this.__addClassName(this._dom.className, className);
                this.verifyResize(this);
            },
            __addClassName: function (classString, className) {
                var props = className.trim();
                if (props === '') return;

                props = props.split(/\s+/);
                var cls = classString.trim();
                if (cls === '')
                    cls = [];
                else
                    cls = cls.split(/\s+/);

                var val;
                for (var i = 0, l = props.length; i < l; i++) {
                    val = props[i];
                    cls.remove(val);
                    cls.push(val);
                }
                this._dom.className = cls.join(' ');
            },
            removeClassName: function (className) {
                if (typeof className === undefined) return;

                this._dom.className = this.__removeClassName(className, true);
                this.verifyResize(this);
            },
            __removeClassName: function (className) {
                var props = className.trim();
                if (props === '') return;

                props = props.split(/\s+/);
                var cls = this._dom.className.trim();
                if (cls === '')
                    return cls;
                else
                    cls = cls.split(/\s+/);

                for (var i = 0, l = props.length; i < l; i++)
                    cls.remove(props[i]);

                return cls.join(' ');
            },
            replaceClassName: function (existingClass, newClass) {  //replaces styles, triggeres dom update only once
                if (typeof existingClass === undefined) return;
                newClass = newClass || '';

                if (typeof newClass === undefined || newClass.trim() === '')
                    return this.removeClassName(existingClass);

                var domClasses = this._dom.className.split(/\s+/);
                var replaceClasses = existingClass.trim().split(/\s+/);
                var update = false;
                for (var i = 0, l = replaceClasses.length; i < l; i++)
                    if (domClasses.remove(replaceClasses[i]) > 0) {
                        update = true;  //found
                        break;
                    }

                if (!update)  //nothing found to replace
                    return;

                var classString = this.__removeClassName(existingClass);
                this.__addClassName(classString, newClass);
                this.verifyResize(this);
            },
            _appendChild: function (uiControl) {
                this._insertAt(this._childs.length, uiControl);
            },
            _insertAt: function (idx, uiControl) {

                var currentIdx = this._childs.indexOf(uiControl);
                //if (currentIdx === idx)    //already on this position
                //    return;

                var currentParent = uiControl._parent;
                currentIdx = -1;
                if (currentParent) {
                    currentIdx = currentParent._childs.indexOf(uiControl);
                    currentParent._removeChild(uiControl);
                    if (currentParent === this && currentIdx <= idx)
                        idx--;
                }
                else if (uiControl.rendered)    //an existing tag was used in an uiCOntrol Cntr
                    uiControl._dom.parentNode.removeChild(uiControl._dom);

                try {   //DOM manipulation
                    if (idx === this._childs.length)    //last position
                        this._dom.appendChild(uiControl._dom);
                    else
                        this._dom.insertBefore(uiControl._dom, this._childs[idx]._dom);
                }
                catch (e) {
                    if (currentParent)
                        currentParent._insertBefore(uiControl, currentParent._childs[currentIdx]);  //reappend to original parent or position on error
                    throw new Error(e.message + ', possibly caused by appending a control to one of its own child controls (recursion loop)');
                }
                uiControl._parent = this;
                this._childs.insert(idx, uiControl);

                uiControl.verifyResize(this);
                this.onLayoutChange.dispatchEvent({}, uiControl);
            },
            _insertBefore: function (newUiC, existingUiC) {

                var idx = this._childs.indexOf(existingUiC);

                this._insertAt(idx, newUiC);
            },
            _insertAfter: function (newUiC, existingUiC) {

                var idx = this._childs.indexOf(existingUiC);

                this._insertAt(idx + 1, newUiC);
            },
            _replaceChild: function (newUiC, existingUiC) {

                var idx = this._childs.indexOf(existingUiC);

                this._removeChild(existingUiC, true);
                this._insertAt(idx, newUiC);
            },
            _removeChild: function (uiControl, suppressResizeEvent) {

                if (uiControl._parent !== this) return;
                uiControl._parent = undefined;
                if (uiControl._disposed) return;

                if (this._childs.remove(uiControl) > 0) {  //found in Array
                    if (uiControl._dom.parentNode == this._dom)
                        this._dom.removeChild(uiControl._dom);
                    if (!suppressResizeEvent)
                        this.onLayoutChange.dispatchEvent();
                }
            },
            hide: function () {
                var style = this._dom.style;
                if (style.display === 'none')
                    return;

                this._styleBeforeHide = style.display;
                style.display = 'none';
                if (this._parent)
                    this._parent.onLayoutChange.dispatchEvent({}, this);
            },
            show: function () {
                var style = this._dom.style;
                if (style.display !== 'none')
                    return;

                style.display = this._styleBeforeHide || '';
                if (this._parent)
                    this._parent.onLayoutChange.dispatchEvent({}, this);
                this.verifyResize(this);
            },

            dispose: function () {
                if (this._parent)
                    this._parent._removeChild(this);
                else if (this.rendered)    //in DOM but no parent: rootElement (viewport)
                    this._dom.parentNode.removeChild(this._dom);

                //this._onResize.dispose();
                //this._onLayoutChange.dispose();

                //dispose childs first to avoid DOM level recursion error 
                //(deleting this._dom will delete all _dom sub elements as well)
                //var childs = this._childs;
                //if (childs) {
                //    for (var i = childs.length - 1; i >= 0; i--) {
                //        childs[i].dispose();
                //        childs.remove(childs[i]);
                //    }
                //}

                
                if (this._childs)
                //    this._childs.length = 0;   //do not dispose the ui DOM chain, as controls may be bound and reused
                    this._childs.dispose();

                //this._dom = undefined;
                this._disposed = true;
                //SmartJs.Core.EventTarget.prototype.dispose.call(this);  //super.dispose();
            },

        });

        return Control;
    })(),

});

SmartJs.Ui.merge({
    HtmlTag: (function () {
        HtmlTag.extends(SmartJs.Ui.Control, false);

        function HtmlTag(element, propObject) {
            SmartJs.Ui.Control.call(this, element, propObject);
        }

        //properties
        Object.defineProperties(HtmlTag.prototype, {
            dom: {
                get: function () {
                    return this._dom;
                },
            },
        });

        //methods
        HtmlTag.prototype.merge({
            setDomAttribute: function (key, value) {
                this._dom.setAttribute(key, value);
            },
            getDomAttribute: function (key) {
                return this._dom.getAttribute(key);
            },
            addDomListener: function (eventName, eventHandler, args) {
                return this._addDomListener(this._dom, eventName, eventHandler, args);
            },
            removeDomListener: function (eventName, eventHandler) {
                return this._removeDomListener(this._dom, eventName, eventHandler);
            },
            appendChild: function (uiControl) {
                return this._appendChild(uiControl);
            },
            insertAt: function (idx, uiControl) {
                return this._insertAt(idx, uiControl);
            },
            insertBefore: function (newUiC, existingUiC) {
                return this._insertBefore(newUiC, existingUiC);
            },
            insertAfter: function (newUiC, existingUiC) {
                return this._insertAfter(newUiC, existingUiC);
            },
            replaceChild: function (newUiC, existingUiC) {
                return this._replaceChild(newUiC, existingUiC);
            },
            removeChild: function (uiControl) {
                return this._removeChild(uiControl);
            },
        });

        return HtmlTag;
    })(),

    Image: (function () {
        Image.extends(SmartJs.Ui.Control, false);

        function Image(propObject) {

            var defaultArgs = { style: { width: 'auto', height: 'auto' } };
            if (propObject)
                defaultArgs.merge(propObject);
            SmartJs.Ui.Control.call(this, 'img', defaultArgs);
            this._addDomListener(this._dom, 'load', function (e) {
                //if ('complete' in e.target && !e.target.complete)
                //    return;
                this._onLoad.dispatchEvent();
            });

            this._onLoad = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(Image.prototype, {
            onLoad: {
                get: function () {
                    return this._onLoad;
                },
            },
        });

        //properties
        Object.defineProperties(Image.prototype, {
            src: {
                get: function () {
                    return this._dom.src;
                },
                set: function (value) {
                    this._dom.src = value;
                },
            },
            naturalWidth: {
                get: function () {
                    return this._dom.naturalWidth;
                },
            },
            naturalHeight: {
                get: function () {
                    return this._dom.naturalHeight;
                },
            },
            crossOrigin: {  //setting the crossOrigin property may trigger a new request even if the image was aleady loaded (NN)
                set: function (crossOriginProperty) {
                    if ('crossOrigin' in this._dom)
                        this._dom.crossOrigin = crossOriginProperty;
                },
            },
        });

        return Image;
    })(),

    ContainerControl: (function () {
        ContainerControl.extends(SmartJs.Ui.Control, false);

        function ContainerControl(propObject) {

            SmartJs.Ui.Control.call(this, 'div', propObject);
            this.__container = this;   //the inner container gets stored here
        }

        Object.defineProperties(ContainerControl.prototype, {
            _container: {
                set: function (control) {

                    this.__container = control;
                },
                get: function () {
                    return this.__container;    //needed to add to parent control in inherited classes
                },
            },
            /* override */
            _innerHeight: {
                get: function () {
                    if (this.__container !== this)
                        return this.__container._innerHeight;

                    if (!this.rendered)
                        return 0;
                    var _style = window.getComputedStyle(this._dom);
                    var height = this._dom.clientHeight;
                    height -= parseInt(_style.paddingTop) || 0;
                    height -= parseInt(_style.paddingBottom) || 0;
                    return height;
                },
            },
            _innerWidth: {
                get: function () {
                    if (this.__container !== this)
                        return this.__container._innerWidth;

                    if (!this.rendered)
                        return 0;
                    var _style = window.getComputedStyle(this._dom);
                    var width = this._dom.clientWidth;
                    width -= parseInt(_style.paddingLeft) || 0;
                    width -= parseInt(_style.paddingRight) || 0;
                    return width;
                },
            },
        });

        ContainerControl.prototype.merge({
            /* override */
            appendChild: function (uiControl) {
                var cont = this.__container;
                if (cont !== this)
                    return cont.appendChild(uiControl);
                return this._appendChild(uiControl);
            },
            insertAt: function(idx, uiControl) {
                var cont = this.__container;
                if (cont !== this)
                    return cont.insertAt(idx, uiControl);
                return this._insertAt(idx, uiControl);
            },
            insertBefore: function (newUiC, existingUiC) {
                var cont = this.__container;
                if (cont !== this)
                    return cont.insertBefore(newUiC, existingUiC);
                return this._insertBefore(newUiC, existingUiC);
            },
            insertAfter: function (newUiC, existingUiC) {
                var cont = this.__container;
                if (cont !== this)
                    return cont.insertAfter(newUiC, existingUiC);
                return this._insertAfter(newUiC, existingUiC);
            },
            replaceChild: function (newUiC, existingUiC) {
                var cont = this.__container;
                if (cont !== this)
                    return cont.replaceChild(newUiC, existingUiC);
                return this._replaceChild(newUiC, existingUiC);
            },
            removeChild: function (uiControl) {
                var cont = this.__container;
                if (cont !== this)
                    return cont.removeChild(uiControl);
                return this._removeChild(uiControl);
            },
        });

        return ContainerControl;
    })(),

    Viewport: (function () {
        Viewport.extends(SmartJs.Ui.Control, false);

        function Viewport(propObject) {
            SmartJs.Ui.Control.call(this, 'div', propObject || { style: { height: '100%', width: '100%' } });

            this._parentHtmlElement = undefined;
            this._window = SmartJs.Ui.Window;
            this._resizeListener = new SmartJs.Event.EventListener(this.verifyResize, this);
            this._window.onResize.addEventListener(this._resizeListener);
        }

        Viewport.prototype.merge({
            addToDom: function (parent) {
                parent = parent || document.body;
                if (this._parentHtmlElement === parent)
                    return;
                if (this._parentHtmlElement)
                    this._parentHtmlElement.removeChild(this._dom);
                parent.appendChild(this._dom);
                this._parentHtmlElement = parent; //save
                this.onResize.dispatchEvent();
            },
            dispose: function () {
                //if (this._disposed)
                //    return;
                this._window.onResize.removeEventListener(this._resizeListener);
                SmartJs.Ui.Control.prototype.dispose.call(this);  //super.dispose();
            },
        });

        return Viewport;
    })(),

});

