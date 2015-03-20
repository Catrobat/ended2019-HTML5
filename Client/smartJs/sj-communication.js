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

    XmlHttpRequest: (function () {
        XmlHttpRequest.extends(SmartJs.Core.EventTarget);

        function XmlHttpRequest(url) {
            if (url)
                this._url = url;
            //this._pendingRequest = false;
            //this._xhr = new XMLHttpRequest();

            //events
            this._onLoadStart = new SmartJs.Event.Event(this);
            this._onLoad = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
            this._onAbort = new SmartJs.Event.Event(this);
            this._onProgressChange = new SmartJs.Event.Event(this);

            var xhr = this._xhr;
            this._addDomListener(xhr, 'loadstart', function (e) { this._onLoadStart.dispatchEvent(e); });
            this._addDomListener(xhr, 'load', function (e) { this._onLoad.dispatchEvent(e); });
            /*
if (xhr.readyState === 4) { 
      if (xhr.status === 200) {
        callback.apply(xhr, args);
      } else {
        console.error(xhr.statusText);
      }
    }            */
            this._addDomListener(xhr, 'error', function (e) { this._onError.dispatchEvent(e); });
            this._addDomListener(xhr, 'abort', function (e) { this._onAbort.dispatchEvent(e); });
            this._addDomListener(xhr, 'progress', function (e) { if (e.lengthComputable) this._onProgressChange.dispatchEvent(e); });

            xhr = xhr.upload;
            this._addDomListener(xhr, 'loadstart', function (e) { this._onLoadStart.dispatchEvent(e); });
            this._addDomListener(xhr, 'load', function (e) { this._onLoad.dispatchEvent(e); });
            this._addDomListener(xhr, 'error', function (e) { this._onError.dispatchEvent(e); });
            this._addDomListener(xhr, 'abort', function (e) { this._onAbort.dispatchEvent(e); });
            this._addDomListener(xhr, 'progress', function (e) { if (e.lengthComputable) this._onProgressChange.dispatchEvent(e); });
        }

        //properties
        Object.defineProperties(XmlHttpRequest.prototype, {
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
            timeout: {
                get: function () {
                    return this._xhr.timeout;
                },
                set: function (value) {
                    this._xhr.timeout = value;
                },
                //enumerable: false,
                //configurable: true,
            },
            //openend: {
            //    get: function () {
            //        return this._xhr.OPENED;
            //    },
            //},
            response: {
                get: function () {
                    return this._xhr.response;
                },
            },
            responseBody: {
                get: function () {
                    return this._xhr.responseBody;
                },
            },
            responseText: {
                get: function () {
                    return this._xhr.responseText;
                },
            },
            responseType: {
                get: function () {
                    return this._xhr.responseType;
                },
            },
            responseXML: {
                get: function () {
                    return this._xhr.responseXML;
                },
            },
            progressSupported: {
                get: function () {
                    return true;//return this._xhr.responseXML;
                },
            },
        });

        //events
        Object.defineProperties(XmlHttpRequest.prototype, {
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
        });

        //methods
        XmlHttpRequest.prototype.merge({
            send: function (url, method, data) {
                //TODO:
            },
            post: function (url, data) {
                //TODO: check for this._pendingRequest
                if (url)
                    this._url = url;

                var xhr = this._xhr;

                //if (data instanceof File && xhr.setRequestHeader) {
                //    xhr.setRequestHeader('Content-type', data.type);
                //    xhr.setRequestHeader('X_FILE_NAME', data.name);
                //}

                xhr.open('POST', this._url);
                xhr.send(data);
            },
            get: function (url) {
                if (url)
                    this._url = url;

                var xhr = this._xhr;
                xhr.open('GET', url);
                xhr.send();
            },
            //__send: function() {
            //},
            dispose: function () {
                this._xhr.abort();
                SmartJs.Core.EventTarget.prototype.dispose.call(this);
            },
        });

        return XmlHttpRequest;
    })(),


    CorsRequest: (function () {     //http://www.html5rocks.com/en/tutorials/cors/, http://www.eriwen.com/javascript/how-to-cors/
        CorsRequest.extends(SmartJs.Core.EventTarget);

        function CorsRequest(url) {
            if (url)
                this._url = url;
            //this._pendingRequest = false;
            //this._xhr = new XMLHttpRequest();

            //events
            this._onLoadStart = new SmartJs.Event.Event(this);
            this._onLoad = new SmartJs.Event.Event(this);
            this._onError = new SmartJs.Event.Event(this);
            this._onAbort = new SmartJs.Event.Event(this);
            this._onProgressChange = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(CorsRequest.prototype, {
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
        });

        //methods
        CorsRequest.prototype.merge({
            send: function (url, method, data) {
                //TODO:
            },
        });

        return CorsRequest;
    })(),

    //TODO: change binding to get an strong typed event target

    //TODO: add event injection property & setter for event objects

    //TODO: change namespace (using core namespace)

    //TOD: add jsonp request?

    //TOD: add resource loader
};


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


