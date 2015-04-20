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

            //events
            this._onLoadStart = new SmartJs.Event.Event(this);
            this._onLoad = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
            this._onAbort = new SmartJs.Event.Event(this);
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
                this._addDomListener(xhr, 'progress', this._onProgressHandler);//function (e) { if (e.lengthComputable) this._onProgressChange.dispatchEvent(e); });
                this._addDomListener(xhru, 'progress', this._onProgressHandler);//function (e) { if (e.lengthComputable) this._onProgressChange.dispatchEvent(e); });
            }
            catch (e) {
                this.progressSupported = false;
            }
            
            this._addDomListener(xhr, 'loadstart', function (e) { this._onLoadStart.dispatchEvent(e); });
            this._addDomListener(xhr, 'load', function (e) { this._onLoad.dispatchEvent(e); });
            this._addDomListener(xhr, 'error', function (e) { this._onError.dispatchEvent(e); });
            this._addDomListener(xhr, 'abort', function (e) { this._onAbort.dispatchEvent(e); });

            this._addDomListener(xhru, 'loadstart', function (e) { this._onLoadStart.dispatchEvent(e); });
            this._addDomListener(xhru, 'load', function (e) { this._onLoad.dispatchEvent(e); });
            this._addDomListener(xhru, 'error', function (e) { this._onError.dispatchEvent(e); });
            this._addDomListener(xhru, 'abort', function (e) { this._onAbort.dispatchEvent(e); });

            /*
if (xhr.readyState === 4) { 
      if (xhr.status === 200) {
        callback.apply(xhr, args);
      } else {
        console.error(xhr.statusText);
      }
    }            */
        }

        //properties
        Object.defineProperties(XmlHttpRequest.prototype, {
            supported: {
                get: function() {
                    if (typeof XmlHttpRequest === 'undefined')
                        return false;
                    
                    //check: same origin policy
                    var loc = window.location, a = document.createElement('a');
                    a.href = this._url;
                    if (a.hostname !== loc.hostname || a.port !== loc.port || a.protocol !== loc.protocol)  //TODO: check sub domains
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
            send: function (url, method, data) {
                if (url)
                    this._url = url;

                if (method)
                    this.method = method;

                if (this.method === SmartJs.RequestMethod.POST && data) {
                    if (data instanceof File && xhr.setRequestHeader) {
                        xhr.setRequestHeader('Content-type', data.type);
                        xhr.setRequestHeader('X_FILE_NAME', data.name);
                    }

                    this._xhr.open(SmartJs.RequestMethod.POST, this._url);
                    this._xhr.send(data);
                }
                else {
                    this._xhr.open(this.method, this._url);   //handle RequestMethod.PUT & DELETE outside this class if needed
                    this._xhr.send();
                }
            },
            _onProgressHandler: function(e) {
                if (e.lengthComputable) {
                    //var percentComplete = e.loaded / e.total * 100;
                    this._onProgressChange.dispatchEvent({ progress: e.loaded / e.total * 100 });
                }
                else {
                    // Unable to compute progress information since the total size is unknown
                    if (this.progressSupported) {
                        this.progressSupported = false;
                        this._onProgressSupportedChange.dispatchEvent({ progressSupport: false });
                    }
                }
            },
            dispose: function () {
                this._xhr.abort();
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return XmlHttpRequest;
    })(),


    CorsRequest: (function () {     //http://www.html5rocks.com/en/tutorials/cors/, http://www.eriwen.com/javascript/how-to-cors/
        CorsRequest.extends(SmartJs.Communication.ServiceRequest, false);

        function CorsRequest(url) {
            SmartJs.Communication.ServiceRequest.call(this, url);

            if (this.supported) {
                this._xhr = new XMLHttpRequest();   //default
                if (!('withCredentials' in this._xhr) && typeof XDomainRequest !== 'undefined')
                    this._xhr = new XDomainRequest();
            }

            var xhr = this._xhr;
            if (xhr.upload)
                var xhru = xhr.upload;

            try {
                this.progressSupported = ('onprogress' in xhr);
                this._addDomListener(xhr, 'progress', this._onProgressHandler);
                if (xhru)
                    this._addDomListener(xhru, 'progress', this._onProgressHandler);
            }
            catch (e) {
                this.progressSupported = false;
            }

            this._addDomListener(xhr, 'loadstart', function (e) { this._onLoadStart.dispatchEvent(e); });
            this._addDomListener(xhr, 'load', function (e) { this._onLoad.dispatchEvent(e); });
            this._addDomListener(xhr, 'error', function (e) { this._onError.dispatchEvent(e); });
            this._addDomListener(xhr, 'abort', function (e) { this._onAbort.dispatchEvent(e); });

            if (xhru) {
                this._addDomListener(xhru, 'loadstart', function (e) { this._onLoadStart.dispatchEvent(e); });
                this._addDomListener(xhru, 'load', function (e) { this._onLoad.dispatchEvent(e); });
                this._addDomListener(xhru, 'error', function (e) { this._onError.dispatchEvent(e); });
                this._addDomListener(xhru, 'abort', function (e) { this._onAbort.dispatchEvent(e); });
            }
        }

        //properties
        Object.defineProperties(CorsRequest.prototype, {
            supported: {
                get: function () {
                    var xhr = new XMLHttpRequest();
                    if ('withCredentials' in xhr)
                        return true;
                    if (typeof XDomainRequest !== undefined)
                        return true;

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
            send: function (url, method, data) {
                if (url)
                    this._url = url;

                if (method)
                    this.method = method;

                this._xhr.open(this.method, this._url);   //handle RequestMethod.PUT & DELETE outside this class if needed
                this._xhr.send(data);
            },
            _onProgressHandler: function (e) {
                if (e.lengthComputable) {
                    //var percentComplete = e.loaded / e.total * 100;
                    this._onProgressChange.dispatchEvent({ progress: e.loaded / e.total * 100 });
                }
                else {
                    // Unable to compute progress information since the total size is unknown
                    if (this.progressSupported) {
                        this.progressSupported = false;
                        this._onProgressSupportedChange.dispatchEvent({ progressSupport: false });
                    }
                }
            },
            //__send: function() {
            //},
            dispose: function () {
                if (this._xhr.abort)
                    this._xhr.abort();
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return CorsRequest;
    })(),

});


//TODO: add resource loader

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


