/// <reference path="sj.js" />
/// <reference path="sj-core.js" />
/// <reference path="sj-event.js" />
'use strict';


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

                //console.log("onloadend ");
                //if (this._error) {
                //    this._onError.dispatchEvent(this._error);
                //    //console.log("error1 ");
                //}
                //else {
                if (this._xhr.status !== 200) { //this._loaded && 
                    //console.log("error2 ");
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
                    //console.log("loaaaaaded, " + this._xhr.readyState + ", " + this._xhr.status);
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

                if (!this._url)
                    throw new Error('servicec url not specified');

                if (data && typeof data !== 'object')
                    throw new Error('invalid argument: expected: data typeof object');

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
                                //this._xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                                var form = "";
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

                if (!this._url)
                    throw new Error('service url not specified');

                if (data && typeof data !== 'object')
                    throw new Error('invalid argument: expected: data typeof object');

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
                                //this._xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                                var form = "";
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
                        //this._xhr.setRequestHeader("Referer", window.location);
                        this._xhr.send();
                    }
                }
                catch (e) {
                    //console.log("internal: error");
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
                    if (this._loading)
                        throw new Error('switching progress calculation not allowed during loading');
                    
                    if (typeof value !== 'boolean')
                        throw new Error('invalid argument: useSizeForProgressCalculation: expected type boolean');
                    this._useSizeForProgressCalculation = value;
                },
            },
            crossoriginProperty: {
                set: function(value) {
                    this._crossoriginProperty = value;
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
                if (this._loading)
                    throw new Error('loading in progress: files cannot be registered');
                if (!(files instanceof Array))
                    throw new Error('invalid argument: files, expected type: Array');

                var file;
                this._registeredFiles = [];
                this._totalSize = 0;
                for (var i = 0, l = files.length; i < l; i++) {
                    file = files[i];
                    this._registeredFiles.push(file);
                    if (this.useSizeForProgressCalculation) {
                        if (typeof file.size !== 'number')
                            throw new Error('invalid size definition');
                        this._totalSize += file.size;
                    }
                }
            },
            load: function(files) {
                if (files)
                    this.registerFiles(files);
                else if (this._loading)
                    throw new Error('loading in progress: you have to wait');

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
                var oHead = document.head || document.getElementsByTagName("head")[0];
                var file = this._registeredFiles[fileIndex];

                var tag = document.getElementById(file.url);
                if (tag) {    //make sure files files are not loaded more than once (inserted in DOM)
                    this._fileSuccessHandler({ fileIndex: fileIndex, element: tag });
                    return;
                }

                switch (file.type) {
                    case 'js':
                        var oScript = document.createElement("script");
                        oScript.async = false;  //ensure execution order after async download
                        this._addDomListener(oScript, 'error', this._fileErrorHandler, { fileIndex: fileIndex, element: oScript });

                        var loaded = false;
                        oScript.onload = oScript.onreadystatechange = function (e) {
                            if (!loaded && (!oScript.readyState || oScript.readyState === "loaded" || oScript.readyState === "complete")) {
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
                        var oCss = document.createElement("link");
                        oCss.type = "text/css";
                        oCss.rel = "stylesheet";
                        oCss.id = file.url;
                        oHead.appendChild(oCss);

                        var oCssSim = new Image();
                        this._addDomListener(oCssSim, 'error', this._fileSuccessHandler, { fileIndex: fileIndex, element: oCss });
                        oCssSim.src = file.url;
                        break;
                    case 'img':
                        var oImg = new Image();
                        if (this._crossoriginProperty)
                            oImg.crossOrigin = this._crossoriginProperty;//'anonymous';
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
        });

        return ResourceLoader;
    })(),
});



//file: http://www.binaryintellect.net/articles/859d32c8-945d-4e5d-8c89-775388598f62.aspx
//form data: http://www.matlus.com/html5-file-upload-with-progress/

/*
    var xhr = new XMLHttpRequest();
    var data = new FormData();
    var files = $("#FileUpload1").get(0).files;
    for (var i = 0; i < files.length; i++) {
      data.append(files[i].name, files[i]);
    }
    xhr.upload.addEventListener("progress", function (evt) {
    if (evt.lengthComputable) {
      var progress = Math.round(evt.loaded * 100 / evt.total);
      $("#progressbar").progressbar("value", progress);
    }
    }, false);
    xhr.open("POST", "UploadHandler.ashx");
    xhr.send(data);

    $("#progressbar").progressbar({
      max: 100,
      change: function (evt, ui) {
        $("#progresslabel").text($("#progressbar").progressbar("value") + "%");
      },
      complete: function (evt, ui) {
        $("#progresslabel").text("File upload successful!");
      }
    });
    evt.preventDefault();
  });
SmartJs.Communication.AjaxUpload = (function () {
    AjaxUpload.extends(SmartJs.Core.EventTarget);

    function AjaxUpload() {

    }

    return AjaxUpload;
})();
*/


