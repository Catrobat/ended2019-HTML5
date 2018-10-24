/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="device.js" />
'use strict';


PocketCode.DeviceFeature = (function () {
    DeviceFeature.extends(SmartJs.Core.EventTarget);

    function DeviceFeature(i18nKey, supported) {
        if (!i18nKey)
            throw new Error('invalid cntr argument: i18nKey');
        this._i18nKey = i18nKey.toString();
        this._supported = supported != undefined ? !!supported : false;
        this._inUse = false;
        this._initialized = false;
        this._isActive = false;

        //events
        this._onInit = new SmartJs.Event.Event(this);
        this._onInactive = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(DeviceFeature.prototype, {
        onInit: {   //used for onLoad event
            get: function () {
                return this._onInit;
            },
        },
        onInactive: {   //used for onExecuted event
            get: function () {
                return this._onInactive;
            },
        },
    });

    //properties
    Object.defineProperties(DeviceFeature.prototype, {
        i18nKey: {
            get: function () {
                return this._i18nKey;
            },
        },
        inUse: {
            get: function () {
                return this._inUse;
            },
        },
        supported: {
            get: function () {
                return this._supported;
            },
        },
        initialized: {
            get: function () {
                return !this.inUse || this._initialized ? true : false;
            },
        },
        isActive: {
            get: function () {
                return this._isActive;
            },
        },
        viewState: {
            get: function () {
                return this._getViewState();
            },
            set: function (viewState) {
                return this._setViewState(viewState);
            },
        },
    });

    //methods
    DeviceFeature.prototype.merge({
        disable: function () {
            this._supported = false;
        },
        //abstract
        pause: function () {
            //this method should be overridden in the inherited classes
            throw new Error('abstract: missing override');
        },
        resume: function () {
            //this method should be overridden in the inherited classes
            throw new Error('abstract: missing override');
        },
        reset: function () {
            //this method should be overridden in the inherited classes
            throw new Error('abstract: missing override');
        },
        _getViewState: function () {
            //this method should be overridden in the inherited classes
            throw new Error('abstract: missing override');
        },
        _setViewState: function (viewState) {
            //this method should be overridden in the inherited classes
            throw new Error('abstract: missing override');
        },
        dispose: function () {
            this.reset();
            SmartJs.Core.EventTarget.prototype.dispose.call(this);
        },
    });

    return DeviceFeature;
})();


PocketCode.merge({

    DeviceVibration: (function () {
        DeviceVibration.extends(PocketCode.DeviceFeature, false);

        function DeviceVibration() {
            var supported = SmartJs.Device.isMobile && !!(navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate);
            PocketCode.DeviceFeature.call(this, 'lblDeviceVibrate', supported);

            this._timer = new SmartJs.Components.Timer();
            this._timer.onExpire.addEventListener(new SmartJs.Event.EventListener(this._timerExpiredHandler, this));
        }

        //methods
        DeviceVibration.prototype.merge({
            _timerExpiredHandler: function () {
                if (!this._isActive)   //notifies device that vibration has stopped (not called if vibrate is not supported)
                    return;
                this._isActive = false;
                this._onInactive.dispatchEvent();
            },
            _vibrate: function () {
                return true;    //add an empty method to avoid errors and keep testability
            },
            start: function (duration) {
                if (!this._inUse) {
                    this._inUse = true;
                    var vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
                    if (vibrate) {
                        var fnct = vibrate.bind(navigator);
                        try {
                            if (fnct(0))    //may throw an error due to mobile restrictions or return false if not inside of a user click event handled
                                this._vibrate = fnct;
                        }
                        catch (e) { }
                    }
                    this._initialized = true;
                }
                if (!this._supported)
                    return false;
                if (typeof duration != 'number')
                    return false;
                if (duration == 0)
                    this.reset();

                var timespan = duration * 1000;
                if (this._vibrate(timespan)) {    //started
                    this._timer.delay = timespan;
                    this._timer.start();
                    this._isActive = true;
                    return true;
                }
                return false;
            },
            /*override*/
            pause: function () {
                this._timer.pause();
                this._vibrate(0);
            },
            resume: function () {
                this._vibrate(this._timer.remainingTime);
                this._timer.resume();
            },
            reset: function () {
                this._vibrate(0);
                this._timer.stop();
                this._isActive = false;
            },
            _getViewState: function () {
                var timespan = this._timer.remainingTime;
                return { remainingTime: timespan > 0 ? (timespan / 1000.0) : undefined };
            },
            _setViewState: function (viewState) {
                if (!this._supported)
                    return;
                this.reset();
                if (viewState && viewState.remainingTime) {
                    this.start(viewState.remainingTime);
                }
            },
            //dispose: function () {
            //    this.reset();
            //    this._timer.dispose();
            //    PocketCode.DeviceFeature.prototype.dispose.call(this);
            //}
        });

        return DeviceVibration;
    })(),


    CameraType: {
        BACK: 0,
        FRONT: 1,
    },

    Camera: (function () {
        Camera.extends(PocketCode.DeviceFeature, false);

        function Camera() {
            this._video = document.createElement('video');
            var supported = false;  //currently disabled// this._getUserMedia && ('srcObject' in this._video || 'mozSrcObject' in this._video || window.URL || window.webkitURL);
            PocketCode.DeviceFeature.call(this, 'lblDeviceCamera', supported);

            this._cameraStream = undefined;
            this._front = {
                facingMode: 'user',
                inUse: false,   //selected by brick
                deviceId: undefined,
            };
            this._back = {
                facingMode: { exact: 'environment' },
                inUse: false,   //selected by brick
                deviceId: undefined,
            };
            this._on = false;
            this._mediaDevices = {
                supported: this._supported && !!navigator.mediaDevices,
                devices: [],
                //ids, features (facing mode), 
                supportedConstraints: {},
            };
            this._selected = PocketCode.CameraType.FRONT;   //default
            this._constraints = { video: true, audio: false };
            //this._indistinguishableCameras = true;
            //    initFaceDetection: false,   //set to true if faceDetection is called before cameraOn (wait for initalization until we know a camera is used)
            //this._initialized = false;  //if true: do not dispatch onInit

            if (this._mediaDevices.supported) {
                if (navigator.mediaDevices.getSupportedConstraints)
                    this._mediaDevices.supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

                this._getMediaDevices();
            }

            this._videoInitializedListener = this._addDomListener(this._video, 'loadedmetadata', this._videoInitializedHandler);

            this._onChange = new SmartJs.Event.Event(this);
            //this._onIndistinguishableCameras = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(Camera.prototype, {
            onInit: {   //used for onLoad event
                get: function () {
                    return this._onInit;
                },
            },
            onChange: {
                get: function () {
                    return this._onChange;
                },
            },
            //onIndistinguishableCameras: {
            //    get: function () {
            //        return this._onIndistinguishableCameras;
            //    },
            //},
        });

        //properties
        Object.defineProperties(Camera.prototype, {
            //active: {
            //    get: function () {
            //        return this._on;
            //    },
            //},
            video: {
                get: function () {
                    return this._video;
                },
            },

            indistinguishableCameras: {
                get: function () {
                    return this._indistinguishableCameras;
                },
            },
            /* override */
            supported: {
                get: function () {
                    return this._supported;
                },
                set: function (value) {
                    if (typeof value != 'boolean')
                        throw new Error('invalid setter: supported');

                    if (!value)
                        this._stopStream();
                    this._supported = value;
                },
            },
            inUse: {
                get: function () {
                    return this._inUse;
                },
                set: function (value) {
                    if (typeof value != 'boolean')
                        throw new Error('invalid setter: inUse');

                    if (!value)
                        this._stopStream();
                    this._inUse = value;
                },
            },
        });

        //methods
        Camera.prototype.merge({
            _getUserMedia: function () {
                var userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
                if (userMedia)
                    return userMedia.bind(navigator);
            }(),
            _getMediaDevices: function () {
                if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {    //devices
                        var devices = [];
                        for (var i = 0, l = deviceInfos.length; i < l; i++) {
                            var deviceInfo = deviceInfos[i];
                            if (deviceInfo.kind === 'videoinput')
                                devices.push({ id: deviceInfo.deviceId, label: deviceInfo.label });

                            if (deviceInfo.label.indexOf('FRONT') >= 0 || deviceInfo.label.indexOf('front') >= 0) {
                                this._front.deviceId = deviceInfo.deviceId;
                            }

                            if (deviceInfo.label.indexOf('BACK') >= 0 || deviceInfo.label.indexOf('back') >= 0) {
                                this._back.deviceId = deviceInfo.deviceId;
                            }

                        }

                        //if (!this._front.deviceId && !this._back.deviceId) {
                        //    this._indistinguishableCameras = true;

                        //}
                        this._mediaDevices.devices = devices;

                        if (devices.length == 0) {
                            this._supported = false;  //no camera found
                            if (this._initialized)
                                return;
                            this._initialized = true;
                            this._onInit.dispatchEvent();
                        }

                        if (this._mediaDevices.devices.length == 1) {
                            this._front.deviceId = this._mediaDevices.devices[0].deviceId;
                        }
                    }.bind(this)).catch(function (error) {
                        this._supported = false;
                        if (this._initialized)
                            return;
                        this._initialized = true;
                        this._onInit.dispatchEvent();
                    }.bind(this));
                }
            },
            _initStream: function (stream) {
                //stream.oninactive = this._streamInactiveHandler.bind(this);
                this._addDomListener(stream, 'inactive', this._streamInactiveHandler);    //TODO:
                //this._addDomListener(stream, 'ended', this._streamInactiveHandler);    //TODO:
                //this._addDomListener(stream, 'ended', this._streamEndedHandler);

                this._cameraStream = stream;
                var video = this._video;
                if ('srcObject' in video) {
                    video.srcObject = stream;
                }
                else if (navigator.mozGetUserMedia) {
                    video.mozSrcObject = stream;
                }
                else {
                    var _url = window.URL || window.webkitURL;
                    video.src = _url.createObjectURL(stream);
                }
                //this._videoInitializedHandler(); //try to start
            },
            _streamInactiveHandler: function (e) {
                if (this._disposed)
                    return;
                //var cam = this._cam;
                //if (this._on) {   //stream broken by e.g. camera plugged out
                //this._onChange.dispatchEvent({ on: false });
                // this._supported = false;  //make sure no error occurs on further usage
                //}
            },

            _selectMediaDevice: function (deviceId) {

            },

            _stopStream: function () {
                this.stop();
                var video = this._video;
                if (video.srcObject)
                    video.srcObject = null;
                if (video.mozSrcObject)
                    video.mozSrcObject = null;
                video.src = '';

                if (this._cameraStream) {
                    if (this._cameraStream.getTracks) {   //TODO: VideoStreamTrack has properties id, kind, label
                        var tracks = this._cameraStream.getTracks();
                        for (var i = 0, l = tracks.length; i < l; i++)
                            tracks[i].stop();
                    }
                    else {
                        this._cameraStream.stop();  //this will stop all tracks- deprecated
                    }
                    this._cameraStream = undefined;
                }
                this._on = false;
                this._onChange.dispatchEvent({ on: false, src: this._video });
            },
            //_streamEndedHandler: function (e) {
            //    //TODO
            //},
            _init: function (reinit) {
                //var cam = this._cam;
                if (!this._supported || (this._inUse && !reinit)) {
                    this._inUse = true;
                    return; //already initialized
                }
                this._inUse = true;

                this._front.inUse = true; //as soon the camera is used we have to set the default inUse

                this._supported = true;  //make sure firefox makes onSuccess call
                var onSuccess = function (stream) {
                    this._supported = true;
                    this._getMediaDevices();    //getting names as well (permissions granted)

                    this._initStream(stream);
                }.bind(this),
                    onError = function (error) {
                        //supported already set to false if an error occurs
                        if (this._initialized)
                            return;
                        this._initialized = true;
                        this._onInit.dispatchEvent();
                    }.bind(this);

                if (this._mediaDevices.supported)
                    navigator.mediaDevices.getUserMedia(this._constraints).then(onSuccess).catch(onError);
                else
                    this._getUserMedia(this._constraints, onSuccess, onError);
            },
            _videoInitializedHandler: function (e) {
                var video = this._video;
                if (!video.paused)
                    return;
                if (this._startCameraStreamOnInit) {
                    video.play();
                    this._startCameraStreamOnInit = false;
                    this._on = true;
                    //var orientation = ((window.orientation!==undefined)?window.orientation:((window.screen!==undefined)?window.screen.orientation.angle:undefined)) || 0;
                    this._onChange.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth });
                }

                if (this._initialized)
                    return;
                this._initialized = true;
                this._onInit.dispatchEvent();
            },
            setInUse: function (cameraType) {
                //notifies device this cam is used/set during the project
                if (cameraType == PocketCode.CameraType.FRONT)
                    this._front.inUse = true;
                else if (cameraType == PocketCode.CameraType.BACK)
                    this._back.inUse = true;
            },
            setType: function (cameraType) {
                var found = false;
                for (var type in PocketCode.CameraType) {
                    if (PocketCode.CameraType[type] == cameraType) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    throw new Error('invalid parameter: expected type \'cameraType\'');

                //var cam = this._cam;
                if (this._selected == cameraType)
                    return false;

                this._selected = cameraType;
                if (!this._supported)
                    return false;

                if (this._mediaDevices.supported) {   //new constraints?
                    var cameraTypeObject;

                    if (cameraType == PocketCode.CameraType.BACK) {
                        cameraTypeObject = this._back;
                        this._front.inUse = false;
                    }
                    else {
                        cameraTypeObject = this._front;
                        this._back.inUse = false;
                    }

                    if (this._mediaDevices.supportedConstraints.facingMode) {
                        this._constraints = { audio: false, video: { facingMode: cameraTypeObject.facingMode } };
                        this._init();
                    }
                    else {
                        if (cameraTypeObject.deviceId) {
                            cameraTypeObject.inUse = true;
                            this._constraints = {
                                video: {
                                    optional: [{ sourceId: cameraTypeObject.deviceId }]
                                }
                            };
                            this._init();
                        }
                    }
                    if (cameraTypeObject.deviceId) {
                        cameraTypeObject.inUse = true;
                        this._constraints = {
                            video: {
                                optional: [{ sourceId: cameraTypeObject.deviceId }]
                            }
                        };
                        this._init();
                    }
                }

                if (!this._on)
                    return false;

                //TODO: stop, change source restart?
                return true;
            },
            start: function () {   //or resume

                //var cam = this._cam;//,
                //supported = cam.supported;
                this._inUse = true;
                if (!this._supported || this._on)
                    return false;
                var video = this._video;
                if (this._cameraStream) {
                    video.play();
                    this._on = true;
                    this._onChange.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth });
                }
                else {
                    this._startCameraStreamOnInit = true;
                    this._init();
                    if (!this._supported) //this may change during init
                        return false;
                }
                return true;
            },
            stop: function () {
                this._init();
                //var cam = this._cam;
                if (!this._on && !this._cameraStream)  //even if camera not started but stream available
                    return false;
                this._on = false;
                this._video.pause();
                this._onChange.dispatchEvent({ on: false });
                return true;
            },
            pause: function () {
                if (this._on) {
                    this._onChange.dispatchEvent({ on: false, src: this._video });
                }

            },
            resume: function () {
                if (this._on) {
                    this._onChange.dispatchEvent({ on: true, src: this._video });
                }

            },
            reset: function () {   //called at program-restart
                if (!this._inUse)
                    return;
                //this.stopCamera();
                this._stopStream();
                this._init(true);

                this._selected = PocketCode.CameraType.FRONT;   //default
            },

            /*override*/
            _getViewState: function () {
                return {};//TODO: selected cam?, active?
            },
            _setViewState: function () {
                //TODO: selected cam?, active? + reinit
            },
            dispose: function () {
                //this.stop();
                //this._stopStream();
                this._removeDomListener(this._video, 'loadedmetadata', this._videoInitializedListener);
                //this._removeDomListener(window, 'orientationchange', this._orientationListener);

                //this._video = undefined;
                //this._onChange.removeEventListener(new SmartJs.Event.EventListener(this._onChangeHandler, this));
                PocketCode.DeviceFeature.prototype.dispose.call(this);
            },
        });

        return Camera;
    })(),

    /* CREDITS
     * face detection makses use of algorithms and code by
     * popscan.blogspot.fr/2012/08/skin-detection-in-digital-images.html
     * Eugene Zatepyakin: inspirit.ru/ (based on github.com/mtschirs/js-objectdetect)
     * Benjamin Jung: github.com/auduno (based on libspark.org/browser/as3/FaceIt)
     */
    FaceDetection: (function () {
        FaceDetection.extends(PocketCode.DeviceFeature, false);

        function FaceDetection(device) {
            var supported = !!(window.Worker && (window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder));
            PocketCode.DeviceFeature.call(this, 'lblDeviceFaceDetection', supported);

            if (!(device instanceof PocketCode.Device))
                throw new Error('invalid argument: device');

            this._device = device;
            this._src = undefined;    //this can be an image, video, canvas- an element that can be used with ctx.drawImage()

            this._scaling = 1.0;
            this._maxRendering = 180;
            this._canvas = document.createElement('canvas');
            this._ctx = this._canvas.getContext('2d');
            this._haarCanvas = document.createElement('canvas');
            this._haarCtx = this._haarCanvas.getContext('2d');

            this._tracking = {
                modelHist: undefined,
                searchWindow: { x: 0, y: 0, w: 0, h: 0 },
                trackObj: { x: 0, y: 0, w: 0, h: 0 },
            };

            this._on = false;
            this._foundDate = Date.now();
            this._recognitionDelay = 300;

            this._faceSize = 0;
            this._facePositionX = 0;
            this._facePositionY = 0;

            this._initialized = true;
            //this._features.FACE_DETECTION = {
            //    cache: {},
            //    defaultOrientation: 0,  //used if inclination noch supported (no gamma)
            //    foundDate: Date.now(),
            //    recognitionDelay: 240,  //ms a value is valid
            //    positionX: 0,
            //    positionY: 0,
            //    size: 0,
            //    //video: { width: 0, height: 0 },
            //    //parallel: window.Worker && (window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder),
            //    //canvas: {},
            //    //initOnCameraUse: false,  //determines if cam is used -> set inUse
            //};
        }

        //properties
        Object.defineProperties(FaceDetection.prototype, {
            _classifier: {
                value: { complex: [{ simple: [{ f: [[3, 7, 14, 4, -1], [3, 9, 14, 2, 2]], t: 4.0141958743E-3, r: 0.8378106951, l: 0.0337941907 }, { f: [[1, 2, 18, 4, -1], [7, 2, 6, 4, 3]], t: 0.0151513395, r: 0.7488812208, l: 0.1514132022 }, { f: [[1, 7, 15, 9, -1], [1, 10, 15, 3, 3]], t: 4.2109931819E-3, r: 0.6374819874, l: 0.0900492817 }], t: 0.8226894140 }, { simple: [{ f: [[5, 6, 2, 6, -1], [5, 9, 2, 3, 2]], t: 1.6227109590E-3, r: 0.7110946178, l: 0.0693085864 }, { f: [[7, 5, 6, 3, -1], [9, 5, 2, 3, 3]], t: 2.2906649392E-3, r: 0.6668692231, l: 0.1795803010 }, { f: [[4, 0, 12, 9, -1], [4, 3, 12, 3, 3]], t: 5.0025708042E-3, r: 0.6554006934, l: 0.1693672984 }, { f: [[6, 9, 10, 8, -1], [6, 13, 10, 4, 2]], t: 7.9659894108E-3, r: 0.0914145186, l: 0.5866332054 }, { f: [[3, 6, 14, 8, -1], [3, 10, 14, 4, 2]], t: -3.5227010957E-3, r: 0.6031895875, l: 0.1413166970 }, { f: [[14, 1, 6, 10, -1], [14, 1, 3, 10, 2]], t: 0.0366676896, r: 0.7920318245, l: 0.3675672113 }, { f: [[7, 8, 5, 12, -1], [7, 12, 5, 4, 3]], t: 9.3361474573E-3, r: 0.2088509947, l: 0.6161385774 }, { f: [[1, 1, 18, 3, -1], [7, 1, 6, 3, 3]], t: 8.6961314082E-3, r: 0.6360273957, l: 0.2836230993 }, { f: [[1, 8, 17, 2, -1], [1, 9, 17, 1, 2]], t: 1.1488880263E-3, r: 0.5800700783, l: 0.2223580926 }, { f: [[16, 6, 4, 2, -1], [16, 7, 4, 1, 2]], t: -2.1484689787E-3, r: 0.5787054896, l: 0.2406464070 }, { f: [[5, 17, 2, 2, -1], [5, 18, 2, 1, 2]], t: 2.1219060290E-3, r: 0.1362237036, l: 0.5559654831 }, { f: [[14, 2, 6, 12, -1], [14, 2, 3, 12, 2]], t: -0.0939491465, r: 0.4717740118, l: 0.8502737283 }, { f: [[4, 0, 4, 12, -1], [4, 0, 2, 6, 2], [6, 6, 2, 6, 2]], t: 1.3777789426E-3, r: 0.2834529876, l: 0.5993673801 }, { f: [[2, 11, 18, 8, -1], [8, 11, 6, 8, 3]], t: 0.0730631574, r: 0.7060034275, l: 0.4341886043 }, { f: [[5, 7, 10, 2, -1], [5, 8, 10, 1, 2]], t: 3.6767389974E-4, r: 0.6051574945, l: 0.3027887940 }, { f: [[15, 11, 5, 3, -1], [15, 12, 5, 1, 3]], t: -6.0479710809E-3, r: 0.5675256848, l: 0.1798433959 }], t: 6.9566087722 }, { simple: [{ f: [[5, 3, 10, 9, -1], [5, 6, 10, 3, 3]], t: -0.0165106896, r: 0.1424857974, l: 0.6644225120 }, { f: [[9, 4, 2, 14, -1], [9, 11, 2, 7, 2]], t: 2.7052499353E-3, r: 0.1288477033, l: 0.6325352191 }, { f: [[3, 5, 4, 12, -1], [3, 9, 4, 4, 3]], t: 2.8069869149E-3, r: 0.6193193197, l: 0.1240288019 }, { f: [[4, 5, 12, 5, -1], [8, 5, 4, 5, 3]], t: -1.5402400167E-3, r: 0.5670015811, l: 0.1432143002 }, { f: [[5, 6, 10, 8, -1], [5, 10, 10, 4, 2]], t: -5.6386279175E-4, r: 0.5905207991, l: 0.1657433062 }, { f: [[8, 0, 6, 9, -1], [8, 3, 6, 3, 3]], t: 1.9253729842E-3, r: 0.5738824009, l: 0.2695507109 }, { f: [[9, 12, 1, 8, -1], [9, 16, 1, 4, 2]], t: -5.0214841030E-3, r: 0.5782774090, l: 0.1893538981 }, { f: [[0, 7, 20, 6, -1], [0, 9, 20, 2, 3]], t: 2.6365420781E-3, r: 0.5695425868, l: 0.2309329062 }, { f: [[7, 0, 6, 17, -1], [9, 0, 2, 17, 3]], t: -1.5127769438E-3, r: 0.5956642031, l: 0.2759602069 }, { f: [[9, 0, 6, 4, -1], [11, 0, 2, 4, 3]], t: -0.0101574398, r: 0.5522047281, l: 0.1732538044 }, { f: [[5, 1, 6, 4, -1], [7, 1, 2, 4, 3]], t: -0.0119536602, r: 0.5559014081, l: 0.1339409947 }, { f: [[12, 1, 6, 16, -1], [14, 1, 2, 16, 3]], t: 4.8859491944E-3, r: 0.6188849210, l: 0.3628703951 }, { f: [[0, 5, 18, 8, -1], [0, 5, 9, 4, 2], [9, 9, 9, 4, 2]], t: -0.0801329165, r: 0.5475944876, l: 0.0912110507 }, { f: [[8, 15, 10, 4, -1], [13, 15, 5, 2, 2], [8, 17, 5, 2, 2]], t: 1.0643280111E-3, r: 0.5711399912, l: 0.3715142905 }, { f: [[3, 1, 4, 8, -1], [3, 1, 2, 4, 2], [5, 5, 2, 4, 2]], t: -1.3419450260E-3, r: 0.3318097889, l: 0.5953313708 }, { f: [[3, 6, 14, 10, -1], [10, 6, 7, 5, 2], [3, 11, 7, 5, 2]], t: -0.0546011403, r: 0.5602846145, l: 0.1844065934 }, { f: [[2, 1, 6, 16, -1], [4, 1, 2, 16, 3]], t: 2.9071690514E-3, r: 0.6131715178, l: 0.3594244122 }, { f: [[0, 18, 20, 2, -1], [0, 19, 20, 1, 2]], t: 7.4718717951E-4, r: 0.3459562957, l: 0.5994353294 }, { f: [[8, 13, 4, 3, -1], [8, 14, 4, 1, 3]], t: 4.3013808317E-3, r: 0.6990845203, l: 0.4172652065 }, { f: [[9, 14, 2, 3, -1], [9, 15, 2, 1, 3]], t: 4.5017572119E-3, r: 0.7801457047, l: 0.4509715139 }, { f: [[0, 12, 9, 6, -1], [0, 14, 9, 2, 3]], t: 0.0241385009, r: 0.1319826990, l: 0.5438212752 }], t: 9.4985427856 }, { simple: [{ f: [[5, 7, 3, 4, -1], [5, 9, 3, 2, 2]], t: 1.9212230108E-3, r: 0.6199870705, l: 0.1415266990 }, { f: [[9, 3, 2, 16, -1], [9, 11, 2, 8, 2]], t: -1.2748669541E-4, r: 0.1884928941, l: 0.6191074252 }, { f: [[3, 6, 13, 8, -1], [3, 10, 13, 4, 2]], t: 5.1409931620E-4, r: 0.5857927799, l: 0.1487396955 }, { f: [[12, 3, 8, 2, -1], [12, 3, 4, 2, 2]], t: 4.1878609918E-3, r: 0.6359239816, l: 0.2746909856 }, { f: [[8, 8, 4, 12, -1], [8, 12, 4, 4, 3]], t: 5.1015717908E-3, r: 0.2175628989, l: 0.5870851278 }, { f: [[11, 3, 8, 6, -1], [15, 3, 4, 3, 2], [11, 6, 4, 3, 2]], t: -2.1448440384E-3, r: 0.2979590892, l: 0.5880944728 }, { f: [[7, 1, 6, 19, -1], [9, 1, 2, 19, 3]], t: -2.8977119363E-3, r: 0.5876647233, l: 0.2373327016 }, { f: [[9, 0, 6, 4, -1], [11, 0, 2, 4, 3]], t: -0.0216106791, r: 0.5194202065, l: 0.1220654994 }, { f: [[3, 1, 9, 3, -1], [6, 1, 3, 3, 3]], t: -4.6299318782E-3, r: 0.5817409157, l: 0.2631230950 }, { f: [[8, 15, 10, 4, -1], [13, 15, 5, 2, 2], [8, 17, 5, 2, 2]], t: 5.9393711853E-4, r: 0.5698544979, l: 0.3638620078 }, { f: [[0, 3, 6, 10, -1], [3, 3, 3, 10, 2]], t: 0.0538786612, r: 0.7559366226, l: 0.4303531050 }, { f: [[3, 4, 15, 15, -1], [3, 9, 15, 5, 3]], t: 1.8887349870E-3, r: 0.5613427162, l: 0.2122603058 }, { f: [[6, 5, 8, 6, -1], [6, 7, 8, 2, 3]], t: -2.3635339457E-3, r: 0.2642767131, l: 0.5631849169 }, { f: [[4, 4, 12, 10, -1], [10, 4, 6, 5, 2], [4, 9, 6, 5, 2]], t: 0.0240177996, r: 0.2751705944, l: 0.5797107815 }, { f: [[6, 4, 4, 4, -1], [8, 4, 2, 4, 2]], t: 2.0543030404E-4, r: 0.5752568840, l: 0.2705242037 }, { f: [[15, 11, 1, 2, -1], [15, 12, 1, 1, 2]], t: 8.4790197433E-4, r: 0.2334876954, l: 0.5435624718 }, { f: [[3, 11, 2, 2, -1], [3, 12, 2, 1, 2]], t: 1.4091329649E-3, r: 0.2063155025, l: 0.5319424867 }, { f: [[16, 11, 1, 3, -1], [16, 12, 1, 1, 3]], t: 1.4642629539E-3, r: 0.3068861067, l: 0.5418980717 }, { f: [[3, 15, 6, 4, -1], [3, 15, 3, 2, 2], [6, 17, 3, 2, 2]], t: 1.6352549428E-3, r: 0.6112868189, l: 0.3695372939 }, { f: [[6, 7, 8, 2, -1], [6, 8, 8, 1, 2]], t: 8.3172752056E-4, r: 0.6025236248, l: 0.3565036952 }, { f: [[3, 11, 1, 3, -1], [3, 12, 1, 1, 3]], t: -2.0998890977E-3, r: 0.5362827181, l: 0.1913982033 }, { f: [[6, 0, 12, 2, -1], [6, 1, 12, 1, 2]], t: -7.4213981861E-4, r: 0.5529310107, l: 0.3835555016 }, { f: [[9, 14, 2, 3, -1], [9, 15, 2, 1, 3]], t: 3.2655049581E-3, r: 0.7101895809, l: 0.4312896132 }, { f: [[7, 15, 6, 2, -1], [7, 16, 6, 1, 2]], t: 8.9134991867E-4, r: 0.6391963958, l: 0.3984830975 }, { f: [[0, 5, 4, 6, -1], [0, 7, 4, 2, 3]], t: -0.0152841797, r: 0.5433713793, l: 0.2366732954 }, { f: [[4, 12, 12, 2, -1], [8, 12, 4, 2, 3]], t: 4.8381411470E-3, r: 0.3239189088, l: 0.5817500948 }, { f: [[6, 3, 1, 9, -1], [6, 6, 1, 3, 3]], t: -9.1093179071E-4, r: 0.2911868989, l: 0.5540593862 }, { f: [[10, 17, 3, 2, -1], [11, 17, 1, 2, 3]], t: -6.1275060288E-3, r: 0.5196629166, l: 0.1775255054 }, { f: [[9, 9, 2, 2, -1], [9, 10, 2, 1, 2]], t: -4.4576259097E-4, r: 0.5533593893, l: 0.3024170100 }, { f: [[7, 6, 6, 4, -1], [9, 6, 2, 4, 3]], t: 0.0226465407, r: 0.6975377202, l: 0.4414930939 }, { f: [[7, 17, 3, 2, -1], [8, 17, 1, 2, 3]], t: -1.8804960418E-3, r: 0.5497952103, l: 0.2791394889 }, { f: [[10, 17, 3, 3, -1], [11, 17, 1, 3, 3]], t: 7.0889107882E-3, r: 0.2385547012, l: 0.5263199210 }, { f: [[8, 12, 3, 2, -1], [8, 13, 3, 1, 2]], t: 1.7318050377E-3, r: 0.6983600854, l: 0.4319379031 }, { f: [[9, 3, 6, 2, -1], [11, 3, 2, 2, 3]], t: -6.8482700735E-3, r: 0.5390920042, l: 0.3082042932 }, { f: [[3, 11, 14, 4, -1], [3, 13, 14, 2, 2]], t: -1.5062530110E-5, r: 0.3120366036, l: 0.5521922111 }, { f: [[1, 10, 18, 4, -1], [10, 10, 9, 2, 2], [1, 12, 9, 2, 2]], t: 0.0294755697, r: 0.1770603060, l: 0.5401322841 }, { f: [[0, 10, 3, 3, -1], [0, 11, 3, 1, 3]], t: 8.1387329846E-3, r: 0.1211019009, l: 0.5178617835 }, { f: [[9, 1, 6, 6, -1], [11, 1, 2, 6, 3]], t: 0.0209429506, r: 0.3311221897, l: 0.5290294289 }, { f: [[8, 7, 3, 6, -1], [9, 7, 1, 6, 3]], t: -9.5665529370E-3, r: 0.4451968967, l: 0.7471994161 }], t: 18.4129695892 }, { simple: [{ f: [[1, 0, 18, 9, -1], [1, 3, 18, 3, 3]], t: -2.8206960996E-4, r: 0.6076732277, l: 0.2064086049 }, { f: [[12, 10, 2, 6, -1], [12, 13, 2, 3, 2]], t: 1.6790600493E-3, r: 0.1255383938, l: 0.5851997137 }, { f: [[0, 5, 19, 8, -1], [0, 9, 19, 4, 2]], t: 6.9827912375E-4, r: 0.5728961229, l: 0.0940184295 }, { f: [[7, 0, 6, 9, -1], [9, 0, 2, 9, 3]], t: 7.8959012171E-4, r: 0.5694308876, l: 0.1781987994 }, { f: [[5, 3, 6, 1, -1], [7, 3, 2, 1, 3]], t: -2.8560499195E-3, r: 0.5788664817, l: 0.1638399064 }, { f: [[11, 3, 6, 1, -1], [13, 3, 2, 1, 3]], t: -3.8122469559E-3, r: 0.5508564710, l: 0.2085440009 }, { f: [[5, 10, 4, 6, -1], [5, 13, 4, 3, 2]], t: 1.5896620461E-3, r: 0.1857215017, l: 0.5702760815 }, { f: [[11, 3, 6, 1, -1], [13, 3, 2, 1, 3]], t: 0.0100783398, r: 0.2189770042, l: 0.5116943120 }, { f: [[4, 4, 12, 6, -1], [4, 6, 12, 2, 3]], t: -0.0635263025, r: 0.4043813049, l: 0.7131379842 }, { f: [[15, 12, 2, 6, -1], [15, 14, 2, 2, 3]], t: -9.1031491756E-3, r: 0.5463973283, l: 0.2567181885 }, { f: [[9, 3, 2, 2, -1], [10, 3, 1, 2, 2]], t: -2.4035000242E-3, r: 0.5590974092, l: 0.1700665950 }, { f: [[9, 3, 3, 1, -1], [10, 3, 1, 1, 3]], t: 1.5226360410E-3, r: 0.2619054019, l: 0.5410556793 }, { f: [[1, 1, 4, 14, -1], [3, 1, 2, 14, 2]], t: 0.0179974399, r: 0.6535220742, l: 0.3732436895 }, { f: [[9, 0, 4, 4, -1], [11, 0, 2, 2, 2], [9, 2, 2, 2, 2]], t: -6.4538191072E-3, r: 0.5537446141, l: 0.2626481950 }, { f: [[7, 5, 1, 14, -1], [7, 12, 1, 7, 2]], t: -0.0118807600, r: 0.5544745922, l: 0.2003753930 }, { f: [[19, 0, 1, 4, -1], [19, 2, 1, 2, 2]], t: 1.2713660253E-3, r: 0.3031975924, l: 0.5591902732 }, { f: [[5, 5, 6, 4, -1], [8, 5, 3, 4, 2]], t: 1.1376109905E-3, r: 0.5646508932, l: 0.2730407118 }, { f: [[9, 18, 3, 2, -1], [10, 18, 1, 2, 3]], t: -4.2651998810E-3, r: 0.5461820960, l: 0.1405909061 }, { f: [[8, 18, 3, 2, -1], [9, 18, 1, 2, 3]], t: -2.9602861031E-3, r: 0.5459290146, l: 0.1795035004 }, { f: [[4, 5, 12, 6, -1], [4, 7, 12, 2, 3]], t: -8.8448226451E-3, r: 0.2809219956, l: 0.5736783146 }, { f: [[3, 12, 2, 6, -1], [3, 14, 2, 2, 3]], t: -6.6430689767E-3, r: 0.5503826141, l: 0.2370675951 }, { f: [[10, 8, 2, 12, -1], [10, 12, 2, 4, 3]], t: 3.9997808635E-3, r: 0.3304282128, l: 0.5608199834 }, { f: [[7, 18, 3, 2, -1], [8, 18, 1, 2, 3]], t: -4.1221720166E-3, r: 0.5378993153, l: 0.1640105992 }, { f: [[9, 0, 6, 2, -1], [11, 0, 2, 2, 3]], t: 0.0156249096, r: 0.2288603931, l: 0.5227649211 }, { f: [[5, 11, 9, 3, -1], [5, 12, 9, 1, 3]], t: -0.0103564197, r: 0.4252927899, l: 0.7016193866 }, { f: [[9, 0, 6, 2, -1], [11, 0, 2, 2, 3]], t: -8.7960809469E-3, r: 0.5355830192, l: 0.2767347097 }, { f: [[1, 1, 18, 5, -1], [7, 1, 6, 5, 3]], t: 0.1622693985, r: 0.7442579269, l: 0.4342240095 }, { f: [[8, 0, 4, 4, -1], [10, 0, 2, 2, 2], [8, 2, 2, 2, 2]], t: 4.5542530715E-3, r: 0.2582125067, l: 0.5726485848 }, { f: [[3, 12, 1, 3, -1], [3, 13, 1, 1, 3]], t: -2.1309209987E-3, r: 0.5361018776, l: 0.2106848061 }, { f: [[8, 14, 5, 3, -1], [8, 15, 5, 1, 3]], t: -0.0132084200, r: 0.4552468061, l: 0.7593790888 }, { f: [[5, 4, 10, 12, -1], [5, 4, 5, 6, 2], [10, 10, 5, 6, 2]], t: -0.0659966766, r: 0.5344039797, l: 0.1252475976 }, { f: [[9, 6, 9, 12, -1], [9, 10, 9, 4, 3]], t: 7.9142656177E-3, r: 0.5601043105, l: 0.3315384089 }, { f: [[2, 2, 12, 14, -1], [2, 2, 6, 7, 2], [8, 9, 6, 7, 2]], t: 0.0208942797, r: 0.2768838107, l: 0.5506049990 }], t: 15.3241395950 }, { simple: [{ f: [[4, 7, 12, 2, -1], [8, 7, 4, 2, 3]], t: 1.1961159761E-3, r: 0.6156241297, l: 0.1762690991 }, { f: [[7, 4, 6, 4, -1], [7, 6, 6, 2, 2]], t: -1.8679830245E-3, r: 0.1832399964, l: 0.6118106842 }, { f: [[4, 5, 11, 8, -1], [4, 9, 11, 4, 2]], t: -1.9579799845E-4, r: 0.5723816156, l: 0.0990442633 }, { f: [[3, 10, 16, 4, -1], [3, 12, 16, 2, 2]], t: -8.0255657667E-4, r: 0.2377282977, l: 0.5579879879 }, { f: [[0, 0, 16, 2, -1], [0, 1, 16, 1, 2]], t: -2.4510810617E-3, r: 0.5858935117, l: 0.2231457978 }, { f: [[7, 5, 6, 2, -1], [9, 5, 2, 2, 3]], t: 5.0361850298E-4, r: 0.5794103741, l: 0.2653993964 }, { f: [[3, 2, 6, 10, -1], [3, 2, 3, 5, 2], [6, 7, 3, 5, 2]], t: 4.0293349884E-3, r: 0.2484865039, l: 0.5803827047 }, { f: [[10, 5, 8, 15, -1], [10, 10, 8, 5, 3]], t: -0.0144517095, r: 0.5484204888, l: 0.1830351948 }, { f: [[3, 14, 8, 6, -1], [3, 14, 4, 3, 2], [7, 17, 4, 3, 2]], t: 2.0380979403E-3, r: 0.6051092743, l: 0.3363558948 }, { f: [[14, 2, 2, 2, -1], [14, 3, 2, 1, 2]], t: -1.6155190533E-3, r: 0.5441246032, l: 0.2286642044 }, { f: [[1, 10, 7, 6, -1], [1, 13, 7, 3, 2]], t: 3.3458340913E-3, r: 0.2392338067, l: 0.5625913143 }, { f: [[15, 4, 4, 3, -1], [15, 4, 2, 3, 2]], t: 1.6379579901E-3, r: 0.5964621901, l: 0.3906993865 }, { f: [[2, 9, 14, 6, -1], [2, 9, 7, 3, 2], [9, 12, 7, 3, 2]], t: 0.0302512105, r: 0.1575746983, l: 0.5248482227 }, { f: [[5, 7, 10, 4, -1], [5, 9, 10, 2, 2]], t: 0.0372519902, r: 0.6748418807, l: 0.4194310903 }, { f: [[6, 9, 8, 8, -1], [6, 9, 4, 4, 2], [10, 13, 4, 4, 2]], t: -0.0251097902, r: 0.5473451018, l: 0.1882549971 }, { f: [[14, 1, 3, 2, -1], [14, 2, 3, 1, 2]], t: -5.3099058568E-3, r: 0.5227110981, l: 0.1339973062 }, { f: [[1, 4, 4, 2, -1], [3, 4, 2, 2, 2]], t: 1.2086479691E-3, r: 0.6109635829, l: 0.3762088119 }, { f: [[11, 10, 2, 8, -1], [11, 14, 2, 4, 2]], t: -0.0219076797, r: 0.5404006838, l: 0.2663142979 }, { f: [[0, 0, 5, 3, -1], [0, 1, 5, 1, 3]], t: 5.4116579703E-3, r: 0.2232273072, l: 0.5363578796 }, { f: [[2, 5, 18, 8, -1], [11, 5, 9, 4, 2], [2, 9, 9, 4, 2]], t: 0.0699463263, r: 0.2453698068, l: 0.5358232855 }, { f: [[6, 6, 1, 6, -1], [6, 9, 1, 3, 2]], t: 3.4520021290E-4, r: 0.5376930236, l: 0.2409671992 }, { f: [[19, 1, 1, 3, -1], [19, 2, 1, 1, 3]], t: 1.2627709656E-3, r: 0.3155693113, l: 0.5425856709 }, { f: [[7, 6, 6, 6, -1], [9, 6, 2, 6, 3]], t: 0.0227195098, r: 0.6597865223, l: 0.4158405959 }, { f: [[19, 1, 1, 3, -1], [19, 2, 1, 1, 3]], t: -1.8111000536E-3, r: 0.5505244731, l: 0.2811253070 }, { f: [[3, 13, 2, 3, -1], [3, 14, 2, 1, 3]], t: 3.3469670452E-3, r: 0.1891465038, l: 0.5260028243 }, { f: [[8, 4, 8, 12, -1], [12, 4, 4, 6, 2], [8, 10, 4, 6, 2]], t: 4.0791751234E-4, r: 0.3344210088, l: 0.5673509240 }, { f: [[5, 2, 6, 3, -1], [7, 2, 2, 3, 3]], t: 0.0127347996, r: 0.2395612001, l: 0.5343592166 }, { f: [[6, 1, 9, 10, -1], [6, 6, 9, 5, 2]], t: -7.3119727894E-3, r: 0.4022207856, l: 0.6010890007 }, { f: [[0, 4, 6, 12, -1], [2, 4, 2, 12, 3]], t: -0.0569487512, r: 0.4543190896, l: 0.8199151158 }, { f: [[15, 13, 2, 3, -1], [15, 14, 2, 1, 3]], t: -5.0116591155E-3, r: 0.5357710719, l: 0.2200281023 }, { f: [[7, 14, 5, 3, -1], [7, 15, 5, 1, 3]], t: 6.0334368608E-3, r: 0.7181751132, l: 0.4413081109 }, { f: [[15, 13, 3, 3, -1], [15, 14, 3, 1, 3]], t: 3.9437441155E-3, r: 0.2791733145, l: 0.5478860735 }, { f: [[6, 14, 8, 3, -1], [6, 15, 8, 1, 3]], t: -3.6591119132E-3, r: 0.3989723920, l: 0.6357867717 }, { f: [[15, 13, 3, 3, -1], [15, 14, 3, 1, 3]], t: -3.8456181064E-3, r: 0.5300664901, l: 0.3493686020 }, { f: [[2, 13, 3, 3, -1], [2, 14, 3, 1, 3]], t: -7.1926261298E-3, r: 0.5229672789, l: 0.1119614988 }, { f: [[4, 7, 12, 12, -1], [10, 7, 6, 6, 2], [4, 13, 6, 6, 2]], t: -0.0527989417, r: 0.5453451275, l: 0.2387102991 }, { f: [[9, 7, 2, 6, -1], [10, 7, 1, 6, 2]], t: -7.9537667334E-3, r: 0.4439376890, l: 0.7586917877 }, { f: [[8, 9, 5, 2, -1], [8, 10, 5, 1, 2]], t: -2.7344180271E-3, r: 0.5489321947, l: 0.2565476894 }, { f: [[8, 6, 3, 4, -1], [9, 6, 1, 4, 3]], t: -1.8507939530E-3, r: 0.4252474904, l: 0.6734347939 }, { f: [[9, 6, 2, 8, -1], [9, 10, 2, 4, 2]], t: 0.0159189198, r: 0.2292661964, l: 0.5488352775 }, { f: [[7, 7, 3, 6, -1], [8, 7, 1, 6, 3]], t: -1.2687679845E-3, r: 0.4022389948, l: 0.6104331016 }, { f: [[11, 3, 3, 3, -1], [12, 3, 1, 3, 3]], t: 6.2883910723E-3, r: 0.1536193042, l: 0.5310853123 }, { f: [[5, 4, 6, 1, -1], [7, 4, 2, 1, 3]], t: -6.2259892001E-3, r: 0.5241606235, l: 0.1729111969 }, { f: [[5, 6, 10, 3, -1], [5, 7, 10, 1, 3]], t: -0.0121325999, r: 0.4325182139, l: 0.6597759723 }], t: 21.0106391906 }, { simple: [{ f: [[7, 3, 6, 9, -1], [7, 6, 6, 3, 3]], t: -3.9184908382E-3, r: 0.1469330936, l: 0.6103435158 }, { f: [[6, 7, 9, 1, -1], [9, 7, 3, 1, 3]], t: 1.5971299726E-3, r: 0.5896466970, l: 0.2632363140 }, { f: [[2, 8, 16, 8, -1], [2, 12, 16, 4, 2]], t: 0.0177801102, r: 0.1760361939, l: 0.5872874259 }, { f: [[14, 6, 2, 6, -1], [14, 9, 2, 3, 2]], t: 6.5334769897E-4, r: 0.5596066117, l: 0.1567801982 }, { f: [[1, 5, 6, 15, -1], [1, 10, 6, 5, 3]], t: -2.8353091329E-4, r: 0.5732036232, l: 0.1913153976 }, { f: [[10, 0, 6, 9, -1], [10, 3, 6, 3, 3]], t: 1.6104689566E-3, r: 0.5623080730, l: 0.2914913892 }, { f: [[6, 6, 7, 14, -1], [6, 13, 7, 7, 2]], t: -0.0977506190, r: 0.5648233294, l: 0.1943476945 }, { f: [[13, 7, 3, 6, -1], [13, 9, 3, 2, 3]], t: 5.5182358482E-4, r: 0.5504639744, l: 0.3134616911 }, { f: [[1, 8, 15, 4, -1], [6, 8, 5, 4, 3]], t: -0.0128582203, r: 0.5760142803, l: 0.2536481916 }, { f: [[11, 2, 3, 10, -1], [11, 7, 3, 5, 2]], t: 4.1530239395E-3, r: 0.3659774065, l: 0.5767722129 }, { f: [[3, 7, 4, 6, -1], [3, 9, 4, 2, 3]], t: 1.7092459602E-3, r: 0.5918939113, l: 0.2843191027 }, { f: [[13, 3, 6, 10, -1], [15, 3, 2, 10, 3]], t: 7.5217359699E-3, r: 0.6183109283, l: 0.4052427113 }, { f: [[5, 7, 8, 10, -1], [5, 7, 4, 5, 2], [9, 12, 4, 5, 2]], t: 2.2479810286E-3, r: 0.3135401010, l: 0.5783755183 }, { f: [[4, 4, 12, 12, -1], [10, 4, 6, 6, 2], [4, 10, 6, 6, 2]], t: 0.0520062111, r: 0.1916636973, l: 0.5541312098 }, { f: [[1, 4, 6, 9, -1], [3, 4, 2, 9, 3]], t: 0.0120855299, r: 0.6644591093, l: 0.4032655954 }, { f: [[11, 3, 2, 5, -1], [11, 3, 1, 5, 2]], t: 1.4687820112E-5, r: 0.5709382891, l: 0.3535977900 }, { f: [[7, 3, 2, 5, -1], [8, 3, 1, 5, 2]], t: 7.1395188570E-6, r: 0.5610269904, l: 0.3037444949 }, { f: [[10, 14, 2, 3, -1], [10, 15, 2, 1, 3]], t: -4.6001640148E-3, r: 0.4580326080, l: 0.7181087136 }, { f: [[5, 12, 6, 2, -1], [8, 12, 3, 2, 2]], t: 2.0058949012E-3, r: 0.2953684031, l: 0.5621951818 }, { f: [[9, 14, 2, 3, -1], [9, 15, 2, 1, 3]], t: 4.5050270855E-3, r: 0.7619017958, l: 0.4615387916 }, { f: [[4, 11, 12, 6, -1], [4, 14, 12, 3, 2]], t: 0.0117468303, r: 0.1772529035, l: 0.5343837141 }, { f: [[11, 11, 5, 9, -1], [11, 14, 5, 3, 3]], t: -0.0583163388, r: 0.5340772271, l: 0.1686245948 }, { f: [[6, 15, 3, 2, -1], [6, 16, 3, 1, 2]], t: 2.3629379575E-4, r: 0.6026803851, l: 0.3792056143 }, { f: [[11, 0, 3, 5, -1], [12, 0, 1, 5, 3]], t: -7.8156180679E-3, r: 0.5324323773, l: 0.1512867063 }, { f: [[5, 5, 6, 7, -1], [8, 5, 3, 7, 2]], t: -0.0108761601, r: 0.5319945216, l: 0.2081822007 }, { f: [[13, 0, 1, 9, -1], [13, 3, 1, 3, 3]], t: -2.7745519764E-3, r: 0.5210328102, l: 0.4098246991 }, { f: [[3, 2, 4, 8, -1], [3, 2, 2, 4, 2], [5, 6, 2, 4, 2]], t: -7.8276381827E-4, r: 0.3478842079, l: 0.5693274140 }, { f: [[13, 12, 4, 6, -1], [13, 14, 4, 2, 3]], t: 0.0138704096, r: 0.2257698029, l: 0.5326750874 }, { f: [[3, 12, 4, 6, -1], [3, 14, 4, 2, 3]], t: -0.0236749108, r: 0.5200707912, l: 0.1551305055 }, { f: [[13, 11, 3, 4, -1], [13, 13, 3, 2, 2]], t: -1.4879409718E-5, r: 0.3820176124, l: 0.5500566959 }, { f: [[4, 4, 4, 3, -1], [4, 5, 4, 1, 3]], t: 3.6190641112E-3, r: 0.6639748215, l: 0.4238683879 }, { f: [[7, 5, 11, 8, -1], [7, 9, 11, 4, 2]], t: -0.0198171101, r: 0.5382357835, l: 0.2150038033 }, { f: [[7, 8, 3, 4, -1], [8, 8, 1, 4, 3]], t: -3.8154039066E-3, r: 0.4215297102, l: 0.6675711274 }, { f: [[9, 1, 6, 1, -1], [11, 1, 2, 1, 3]], t: -4.9775829538E-3, r: 0.5386328101, l: 0.2267289012 }, { f: [[5, 5, 3, 3, -1], [5, 6, 3, 1, 3]], t: 2.2441020701E-3, r: 0.6855735778, l: 0.4308691024 }, { f: [[0, 9, 20, 6, -1], [10, 9, 10, 3, 2], [0, 12, 10, 3, 2]], t: 0.0122824599, r: 0.3467479050, l: 0.5836614966 }, { f: [[8, 6, 3, 5, -1], [9, 6, 1, 5, 3]], t: -2.8548699337E-3, r: 0.4311453998, l: 0.7016944885 }, { f: [[11, 0, 1, 3, -1], [11, 1, 1, 1, 3]], t: -3.7875669077E-3, r: 0.5224946141, l: 0.2895345091 }, { f: [[4, 2, 4, 2, -1], [4, 3, 4, 1, 2]], t: -1.2201230274E-3, r: 0.5481644868, l: 0.2975570857 }, { f: [[12, 6, 4, 3, -1], [12, 7, 4, 1, 3]], t: 0.0101605998, r: 0.8182697892, l: 0.4888817965 }, { f: [[5, 0, 6, 4, -1], [7, 0, 2, 4, 3]], t: -0.0161745697, r: 0.5239992737, l: 0.1481492966 }, { f: [[9, 7, 3, 8, -1], [10, 7, 1, 8, 3]], t: 0.0192924607, r: 0.7378190755, l: 0.4786309897 }, { f: [[9, 7, 2, 2, -1], [10, 7, 1, 2, 2]], t: -3.2479539513E-3, r: 0.4470643997, l: 0.7374222874 }, { f: [[6, 7, 14, 4, -1], [13, 7, 7, 2, 2], [6, 9, 7, 2, 2]], t: -9.3803480267E-3, r: 0.5537996292, l: 0.3489154875 }, { f: [[0, 5, 3, 6, -1], [0, 7, 3, 2, 3]], t: -0.0126061299, r: 0.5315443277, l: 0.2379686981 }, { f: [[13, 11, 3, 4, -1], [13, 13, 3, 2, 2]], t: -0.0256219301, r: 0.5138769745, l: 0.1964688003 }, { f: [[4, 11, 3, 4, -1], [4, 13, 3, 2, 2]], t: -7.5741496402E-5, r: 0.3365853130, l: 0.5590522885 }, { f: [[5, 9, 12, 8, -1], [11, 9, 6, 4, 2], [5, 13, 6, 4, 2]], t: -0.0892108827, r: 0.5162634849, l: 0.0634046569 }, { f: [[9, 12, 1, 3, -1], [9, 13, 1, 1, 3]], t: -2.7670480776E-3, r: 0.4490706026, l: 0.7323467731 }, { f: [[10, 15, 2, 4, -1], [10, 17, 2, 2, 2]], t: 2.7152578695E-4, r: 0.5985518097, l: 0.4114834964 }], t: 23.9187908172 }, { simple: [{ f: [[7, 7, 6, 1, -1], [9, 7, 2, 1, 3]], t: 1.4786219689E-3, r: 0.6643316745, l: 0.2663545012 }, { f: [[12, 3, 6, 6, -1], [15, 3, 3, 3, 2], [12, 6, 3, 3, 2]], t: -1.8741659587E-3, r: 0.2518512904, l: 0.6143848896 }, { f: [[0, 4, 10, 6, -1], [0, 6, 10, 2, 3]], t: -1.7151009524E-3, r: 0.2397463023, l: 0.5766341090 }, { f: [[8, 3, 8, 14, -1], [12, 3, 4, 7, 2], [8, 10, 4, 7, 2]], t: -1.8939269939E-3, r: 0.2529144883, l: 0.5682045817 }, { f: [[4, 4, 7, 15, -1], [4, 9, 7, 5, 3]], t: -5.3006052039E-3, r: 0.5556079745, l: 0.1640675961 }, { f: [[12, 2, 6, 8, -1], [15, 2, 3, 4, 2], [12, 6, 3, 4, 2]], t: -0.0466625317, r: 0.4762830138, l: 0.6123154163 }, { f: [[2, 2, 6, 8, -1], [2, 2, 3, 4, 2], [5, 6, 3, 4, 2]], t: -7.9431332414E-4, r: 0.2839404046, l: 0.5707858800 }, { f: [[2, 13, 18, 7, -1], [8, 13, 6, 7, 3]], t: 0.0148916700, r: 0.6006367206, l: 0.4089672863 }, { f: [[4, 3, 8, 14, -1], [4, 3, 4, 7, 2], [8, 10, 4, 7, 2]], t: -1.2046529445E-3, r: 0.2705289125, l: 0.5712450742 }, { f: [[18, 1, 2, 6, -1], [18, 3, 2, 2, 3]], t: 6.0619381256E-3, r: 0.3262225985, l: 0.5262504220 }, { f: [[9, 11, 2, 3, -1], [9, 12, 2, 1, 3]], t: -2.5286648888E-3, r: 0.4199256896, l: 0.6853830814 }, { f: [[18, 1, 2, 6, -1], [18, 3, 2, 2, 3]], t: -5.9010218828E-3, r: 0.5434812903, l: 0.3266282081 }, { f: [[0, 1, 2, 6, -1], [0, 3, 2, 2, 3]], t: 5.6702760048E-3, r: 0.2319003939, l: 0.5468410849 }, { f: [[1, 5, 18, 6, -1], [1, 7, 18, 2, 3]], t: -3.0304100364E-3, r: 0.2708238065, l: 0.5570667982 }, { f: [[0, 2, 6, 7, -1], [3, 2, 3, 7, 2]], t: 2.9803649522E-3, r: 0.5890625715, l: 0.3700568974 }, { f: [[7, 3, 6, 14, -1], [7, 10, 6, 7, 2]], t: -0.0758405104, r: 0.5419948101, l: 0.2140070050 }, { f: [[3, 7, 13, 10, -1], [3, 12, 13, 5, 2]], t: 0.0192625392, r: 0.2726590037, l: 0.5526772141 }, { f: [[11, 15, 2, 2, -1], [11, 16, 2, 1, 2]], t: 1.8888259364E-4, r: 0.6017209887, l: 0.3958011865 }, { f: [[2, 11, 16, 4, -1], [2, 11, 8, 2, 2], [10, 13, 8, 2, 2]], t: 0.0293695498, r: 0.1435758024, l: 0.5241373777 }, { f: [[13, 7, 6, 4, -1], [16, 7, 3, 2, 2], [13, 9, 3, 2, 2]], t: 1.0417619487E-3, r: 0.5929983258, l: 0.3385409116 }, { f: [[6, 10, 3, 9, -1], [6, 13, 3, 3, 3]], t: 2.6125640142E-3, r: 0.3021597862, l: 0.5485377907 }, { f: [[14, 6, 1, 6, -1], [14, 9, 1, 3, 2]], t: 9.6977467183E-4, r: 0.5532032847, l: 0.3375276029 }, { f: [[5, 10, 4, 1, -1], [7, 10, 2, 1, 2]], t: 5.9512659208E-4, r: 0.3359399139, l: 0.5631743073 }, { f: [[3, 8, 15, 5, -1], [8, 8, 5, 5, 3]], t: -0.1015655994, r: 0.5230425000, l: 0.0637350380 }, { f: [[1, 6, 5, 4, -1], [1, 8, 5, 2, 2]], t: 0.0361566990, r: 0.1029528975, l: 0.5136963129 }, { f: [[3, 1, 17, 6, -1], [3, 3, 17, 2, 3]], t: 3.4624140243E-3, r: 0.5558289289, l: 0.3879320025 }, { f: [[6, 7, 8, 2, -1], [10, 7, 4, 2, 2]], t: 0.0195549800, r: 0.1875859946, l: 0.5250086784 }, { f: [[9, 7, 3, 2, -1], [10, 7, 1, 2, 3]], t: -2.3121440317E-3, r: 0.4679641127, l: 0.6672028899 }, { f: [[8, 7, 3, 2, -1], [9, 7, 1, 2, 3]], t: -1.8605289515E-3, r: 0.4334670901, l: 0.7163379192 }, { f: [[8, 9, 4, 2, -1], [8, 10, 4, 1, 2]], t: -9.4026362057E-4, r: 0.5650203227, l: 0.3021360933 }, { f: [[8, 8, 4, 3, -1], [8, 9, 4, 1, 3]], t: -5.2418331615E-3, r: 0.5250256061, l: 0.1820009052 }, { f: [[9, 5, 6, 4, -1], [9, 5, 3, 4, 2]], t: 1.1729019752E-4, r: 0.5445973277, l: 0.3389188051 }, { f: [[8, 13, 4, 3, -1], [8, 14, 4, 1, 3]], t: 1.1878840159E-3, r: 0.6253563165, l: 0.4085349142 }, { f: [[4, 7, 12, 6, -1], [10, 7, 6, 3, 2], [4, 10, 6, 3, 2]], t: -0.0108813596, r: 0.5700082778, l: 0.3378399014 }, { f: [[8, 14, 4, 3, -1], [8, 15, 4, 1, 3]], t: 1.7354859737E-3, r: 0.6523038744, l: 0.4204635918 }, { f: [[9, 7, 3, 3, -1], [9, 8, 3, 1, 3]], t: -6.5119052305E-3, r: 0.5428143739, l: 0.2595216035 }, { f: [[7, 4, 3, 8, -1], [8, 4, 1, 8, 3]], t: -1.2136430013E-3, r: 0.3977893888, l: 0.6165143847 }, { f: [[10, 0, 3, 6, -1], [11, 0, 1, 6, 3]], t: -0.0103542404, r: 0.5219504833, l: 0.1628028005 }, { f: [[6, 3, 4, 8, -1], [8, 3, 2, 8, 2]], t: 5.5858830455E-4, r: 0.5503574013, l: 0.3199650943 }, { f: [[14, 3, 6, 13, -1], [14, 3, 3, 13, 2]], t: 0.0152996499, r: 0.6122388243, l: 0.4103994071 }, { f: [[8, 13, 3, 6, -1], [8, 16, 3, 3, 2]], t: -0.0215882100, r: 0.5197384953, l: 0.1034912988 }, { f: [[14, 3, 6, 13, -1], [14, 3, 3, 13, 2]], t: -0.1283462941, r: 0.4893102943, l: 0.8493865132 }, { f: [[0, 7, 10, 4, -1], [0, 7, 5, 2, 2], [5, 9, 5, 2, 2]], t: -2.2927189711E-3, r: 0.5471575260, l: 0.3130157887 }, { f: [[14, 3, 6, 13, -1], [14, 3, 3, 13, 2]], t: 0.0799151062, r: 0.6073989272, l: 0.4856320917 }, { f: [[0, 3, 6, 13, -1], [3, 3, 3, 13, 2]], t: -0.0794410929, r: 0.4624533057, l: 0.8394674062 }, { f: [[9, 1, 4, 1, -1], [9, 1, 2, 1, 2]], t: -5.2800010889E-3, r: 0.5306698083, l: 0.1881695985 }, { f: [[8, 0, 2, 1, -1], [9, 0, 1, 1, 2]], t: 1.0463109938E-3, r: 0.2583065927, l: 0.5271229147 }, { f: [[10, 16, 4, 4, -1], [12, 16, 2, 2, 2], [10, 18, 2, 2, 2]], t: 2.6317298761E-4, r: 0.5735440850, l: 0.4235304892 }, { f: [[9, 6, 2, 3, -1], [10, 6, 1, 3, 2]], t: -3.6173160187E-3, r: 0.4495444893, l: 0.6934396028 }, { f: [[4, 5, 12, 2, -1], [8, 5, 4, 2, 3]], t: 0.0114218797, r: 0.4138193130, l: 0.5900921225 }, { f: [[8, 7, 3, 5, -1], [9, 7, 1, 5, 3]], t: -1.9963278900E-3, r: 0.4327239990, l: 0.6466382741 }], t: 24.5278797149 }, { simple: [{ f: [[6, 4, 8, 6, -1], [6, 6, 8, 2, 3]], t: -9.9691245704E-3, r: 0.2482212036, l: 0.6142324209 }, { f: [[9, 5, 2, 12, -1], [9, 11, 2, 6, 2]], t: 7.3073059320E-4, r: 0.2321965992, l: 0.5704951882 }, { f: [[4, 6, 6, 8, -1], [4, 10, 6, 4, 2]], t: 6.4045301405E-4, r: 0.5814933180, l: 0.2112251967 }, { f: [[12, 2, 8, 5, -1], [12, 2, 4, 5, 2]], t: 4.5424019917E-3, r: 0.5866311788, l: 0.2950482070 }, { f: [[0, 8, 18, 3, -1], [0, 9, 18, 1, 3]], t: 9.2477443104E-5, r: 0.5791326761, l: 0.2990990877 }, { f: [[8, 12, 4, 8, -1], [8, 16, 4, 4, 2]], t: -8.6603146046E-3, r: 0.5635542273, l: 0.2813029885 }, { f: [[0, 2, 8, 5, -1], [4, 2, 4, 5, 2]], t: 8.0515816807E-3, r: 0.6054757237, l: 0.3535369038 }, { f: [[13, 11, 3, 4, -1], [13, 13, 3, 2, 2]], t: 4.3835240649E-4, r: 0.2731510996, l: 0.5596532225 }, { f: [[5, 11, 6, 1, -1], [7, 11, 2, 1, 3]], t: -9.8168973636E-5, r: 0.3638561069, l: 0.5978031754 }, { f: [[11, 3, 3, 1, -1], [12, 3, 1, 1, 3]], t: -1.1298790341E-3, r: 0.5432729125, l: 0.2755252122 }, { f: [[7, 13, 5, 3, -1], [7, 14, 5, 1, 3]], t: 6.4356150105E-3, r: 0.7069833278, l: 0.4305641949 }, { f: [[11, 11, 7, 6, -1], [11, 14, 7, 3, 2]], t: -0.0568293295, r: 0.5294997096, l: 0.2495242953 }, { f: [[2, 11, 7, 6, -1], [2, 14, 7, 3, 2]], t: 4.0668169967E-3, r: 0.2497723996, l: 0.5478553175 }, { f: [[12, 14, 2, 6, -1], [12, 16, 2, 2, 3]], t: 4.8164798499E-5, r: 0.5706356167, l: 0.3938601016 }, { f: [[8, 14, 3, 3, -1], [8, 15, 3, 1, 3]], t: 6.1795017682E-3, r: 0.7394766807, l: 0.4407606124 }, { f: [[11, 0, 3, 5, -1], [12, 0, 1, 5, 3]], t: 6.4985752105E-3, r: 0.2479152977, l: 0.5445243120 }, { f: [[6, 1, 4, 9, -1], [8, 1, 2, 9, 2]], t: -1.0211090557E-3, r: 0.5338971018, l: 0.2544766962 }, { f: [[10, 3, 6, 1, -1], [12, 3, 2, 1, 3]], t: -5.4247528314E-3, r: 0.5324069261, l: 0.2718858122 }, { f: [[8, 8, 3, 4, -1], [8, 10, 3, 2, 2]], t: -1.0559899965E-3, r: 0.5534508824, l: 0.3178288042 }, { f: [[8, 12, 4, 2, -1], [8, 13, 4, 1, 2]], t: 6.6465808777E-4, r: 0.6558194160, l: 0.4284219145 }, { f: [[5, 18, 4, 2, -1], [5, 19, 4, 1, 2]], t: -2.7524109464E-4, r: 0.3810262978, l: 0.5902860760 }, { f: [[2, 1, 18, 6, -1], [2, 3, 18, 2, 3]], t: 4.2293202131E-3, r: 0.5709385871, l: 0.3816489875 }, { f: [[6, 0, 3, 2, -1], [7, 0, 1, 2, 3]], t: -3.2868210691E-3, r: 0.5259544253, l: 0.1747743934 }, { f: [[13, 8, 6, 2, -1], [16, 8, 3, 1, 2], [13, 9, 3, 1, 2]], t: 1.5611879643E-4, r: 0.5725612044, l: 0.3601722121 }, { f: [[6, 10, 3, 6, -1], [6, 13, 3, 3, 2]], t: -7.3621381488E-6, r: 0.3044497072, l: 0.5401858091 }, { f: [[0, 13, 20, 4, -1], [10, 13, 10, 2, 2], [0, 15, 10, 2, 2]], t: -0.0147672500, r: 0.5573434829, l: 0.3220770061 }, { f: [[7, 7, 6, 5, -1], [9, 7, 2, 5, 3]], t: 0.0244895908, r: 0.6518812775, l: 0.4301528036 }, { f: [[11, 0, 2, 2, -1], [11, 1, 2, 1, 2]], t: -3.7652091123E-4, r: 0.5598236918, l: 0.3564583063 }, { f: [[1, 8, 6, 2, -1], [1, 8, 3, 1, 2], [4, 9, 3, 1, 2]], t: 7.3657688517E-6, r: 0.5561897754, l: 0.3490782976 }, { f: [[0, 2, 20, 2, -1], [10, 2, 10, 1, 2], [0, 3, 10, 1, 2]], t: -0.0150999398, r: 0.5335299968, l: 0.1776272058 }, { f: [[7, 14, 5, 3, -1], [7, 15, 5, 1, 3]], t: -3.8316650316E-3, r: 0.4221394062, l: 0.6149687767 }, { f: [[7, 13, 6, 6, -1], [10, 13, 3, 3, 2], [7, 16, 3, 3, 2]], t: 0.0169254001, r: 0.2166585028, l: 0.5413014888 }, { f: [[9, 12, 2, 3, -1], [9, 13, 2, 1, 3]], t: -3.0477850232E-3, r: 0.4354617893, l: 0.6449490785 }, { f: [[16, 11, 1, 6, -1], [16, 13, 1, 2, 3]], t: 3.2140589319E-3, r: 0.3523217141, l: 0.5400155186 }, { f: [[3, 11, 1, 6, -1], [3, 13, 1, 2, 3]], t: -4.0023201145E-3, r: 0.5338417291, l: 0.2774524092 }, { f: [[4, 4, 14, 12, -1], [11, 4, 7, 6, 2], [4, 10, 7, 6, 2]], t: 7.4182129465E-3, r: 0.3702817857, l: 0.5676739215 }, { f: [[5, 4, 3, 3, -1], [5, 5, 3, 1, 3]], t: -8.8764587417E-3, r: 0.4583688974, l: 0.7749221920 }, { f: [[12, 3, 3, 3, -1], [13, 3, 1, 3, 3]], t: 2.7311739977E-3, r: 0.3996661007, l: 0.5338721871 }, { f: [[6, 6, 8, 3, -1], [6, 7, 8, 1, 3]], t: -2.5082379579E-3, r: 0.3777498900, l: 0.5611963272 }, { f: [[12, 3, 3, 3, -1], [13, 3, 1, 3, 3]], t: -8.0541074275E-3, r: 0.5179182887, l: 0.2915228903 }, { f: [[3, 1, 4, 10, -1], [3, 1, 2, 5, 2], [5, 6, 2, 5, 2]], t: -9.7938813269E-4, r: 0.3700192868, l: 0.5536432862 }, { f: [[5, 7, 10, 2, -1], [5, 7, 5, 2, 2]], t: -5.8745909482E-3, r: 0.5679376125, l: 0.3754391074 }, { f: [[8, 7, 3, 3, -1], [9, 7, 1, 3, 3]], t: -4.4936719350E-3, r: 0.4480949938, l: 0.7019699215 }, { f: [[15, 12, 2, 3, -1], [15, 13, 2, 1, 3]], t: -5.4389229044E-3, r: 0.5313386917, l: 0.2310364991 }, { f: [[7, 8, 3, 4, -1], [8, 8, 1, 4, 3]], t: -7.5094640487E-4, r: 0.4129343032, l: 0.5864868760 }, { f: [[13, 4, 1, 12, -1], [13, 10, 1, 6, 2]], t: 1.4528800420E-5, r: 0.5619621276, l: 0.3732407093 }, { f: [[4, 5, 12, 12, -1], [4, 5, 6, 6, 2], [10, 11, 6, 6, 2]], t: 0.0407580696, r: 0.2720521986, l: 0.5312091112 }, { f: [[7, 14, 7, 3, -1], [7, 15, 7, 1, 3]], t: 6.6505931317E-3, r: 0.6693493723, l: 0.4710015952 }, { f: [[3, 12, 2, 3, -1], [3, 13, 2, 1, 3]], t: 4.5759351924E-3, r: 0.1637275964, l: 0.5167819261 }, { f: [[3, 2, 14, 2, -1], [10, 2, 7, 1, 2], [3, 3, 7, 1, 2]], t: 6.5269311890E-3, r: 0.2938531935, l: 0.5397608876 }, { f: [[0, 1, 3, 10, -1], [1, 1, 1, 10, 3]], t: -0.0136603796, r: 0.4532200098, l: 0.7086488008 }, { f: [[9, 0, 6, 5, -1], [11, 0, 2, 5, 3]], t: 0.0273588690, r: 0.3589231967, l: 0.5206481218 }, { f: [[5, 7, 6, 2, -1], [8, 7, 3, 2, 2]], t: 6.2197551596E-4, r: 0.5441123247, l: 0.3507075905 }, { f: [[7, 1, 6, 10, -1], [7, 6, 6, 5, 2]], t: -3.3077080734E-3, r: 0.4024891853, l: 0.5859522819 }, { f: [[1, 1, 18, 3, -1], [7, 1, 6, 3, 3]], t: -0.0106311095, r: 0.4422602951, l: 0.6743267178 }, { f: [[16, 3, 3, 6, -1], [16, 5, 3, 2, 3]], t: 0.0194416493, r: 0.1797904968, l: 0.5282716155 }], t: 27.1533508300 }, ], size: [20, 20] },
                writable: false,
            },
            faceDetected: {
                get: function () {
                    this._inUse = true;
                    if (!this._on || !this._supported)
                        return false;

                    var delay = Date.now() - this._foundDate;
                    if (delay < this._recognitionDelay)
                        return true;
                    return false;
                },
            },
            faceSize: {
                get: function () {
                    this._inUse = true;
                    if (!this._on || !this._supported)
                        return 0.0;

                    var delay = Date.now() - this._foundDate;
                    if (delay < this._recognitionDelay)
                        return this._faceSize;
                    return 0.0;
                },
            },
            facePositionX: {
                get: function () {
                    this._inUse = true;
                    if (!this._on || !this._supported)
                        return 0.0;

                    var delay = Date.now() - this._foundDate;
                    if (delay < this._recognitionDelay)
                        return this._facePositionX;
                    return 0.0;
                },
            },
            facePositionY: {
                get: function () {
                    this._inUse = true;
                    if (!this._on || !this._supported)
                        return 0.0;

                    var delay = Date.now() - this._foundDate;
                    if (delay < this._recognitionDelay)
                        return this._facePositionY;
                    return 0.0;
                },
            },
            /* override */
            inUse: {
                get: function () {
                    return this._inUse;
                },
                set: function (value) {
                    if (typeof value != 'boolean')
                        throw new Error('invalid setter: inUse');

                    if (value == this._inUse)
                        return;
                    else if (!value)
                        this.stop();
                    else if (this._supported && this._device.isMobile)
                        var inc = this._device.inclinationX;    //make sure sonsors get initialized

                    this._inUse = value;
                    //if (value)
                    //    this._initialized = true;
                },
            },
            /* override */
            supported: {
                get: function () {
                    return this._supported;
                },
                set: function (value) {
                    if (typeof value != 'boolean')
                        throw new Error('invalid setter: supported');

                    if (!value)
                        this.stop();
                    this._supported = value;
                },
            },
        });

        //methods
        FaceDetection.prototype.merge({
            //notifyOnCameraChange: function (e) {    //handling camera change events
            //    if (!e.on) {
            //        this.stop();
            //        return;
            //    }

            //    var video = this._src,
            //        scaling;
            //    if (e.width != video.width || e.height != video.height) {
            //        video.width = e.width;
            //        video.height = e.height;
            //        this._scaling = e.width > e.height ? this._maxRendering / e.width : this._maxRendering / e.height;   //TODO
            //        this._canvas.width = Math.floor(e.width * this._scaling);
            //        this._canvas.height = Math.floor(e.height * this._scaling);
            //    }
            //    //this._defaultOrientation = e.orientation;

            //    this.start();
            //},
            //_init: function () {
            //    if (this.isMobile && this._features.INCLINATION.supported)
            //        var tmp = this.inclinationX;    //make sure sonsors get initialized

            //    if (!this._supported || this._inUse)
            //        return; //not supported or already initialized

            //    if (!this._inUse) {
            //        this._initFaceDetection = true; //init on camera init
            //        return;
            //    }

            //    this._inUse = true;
            //    //this._cache = {    //the work canvas resolution is either 180x135 or 135x180: so a matrix may change, the pixel arrays do not
            //    //    gsImg: Uint8Array ? new Uint8Array(w * h) : new Array(w * h),
            //    //    iiSum: Int32Array ? new Int32Array((w + 1) * (h + 1)) : new Array((w + 1) * (h + 1)),
            //    //    iiSqSum: Int32Array ? new Int32Array((w + 1) * (h + 1)) : new Array((w + 1) * (h + 1)),
            //    //};

            //    //this._onChange.addEventListener(new SmartJs.Event.EventListener(this._faceDetectionCameraHandler, this));
            //},
            //_faceDetectionCameraHandler: function (e) {
            //    //var tmp = { on: e.on, height: e.height, width: e.width, orientation: e.orientation, transparency: 50? };
            //    //console.log('TODO: ' + JSON.stringify(tmp));

            //    if (!e.on) {
            //        this._pauseFaceDetection();
            //        return;
            //    }

            //    var fd = this._fd,
            //        scaling;
            //    if (e.width != this._src.width || e.height != this._src.height) {
            //        this._src.width = e.width;
            //        this._src.height = e.height;
            //        this._scaling = e.width > e.height ? this._maxRendering / e.width : this._maxRendering / e.height;
            //        this._canvas.width = Math.floor(e.width * this._scaling);
            //        this._canvas.height = Math.floor(e.height * this._scaling);
            //    }
            //    this._defaultOrientation = e.orientation;

            //    this._startFaceDetection();
            //},
            __detectFace: function () { //should not be called directly (even  internal)
                if (this._disposed)
                    return; //TODO
                var ctx = this._ctx,
                    testStart = Date.now();

                var w = this._canvas.width,
                    h = this._canvas.height;

                ctx.clearRect(0, 0, w, h);
                ctx.save();
                //var gsImg,// = Uint8Array ? new Uint8Array(w * h) : new Array(w * h),  //cache.gsImg,//
                //    iiSum,// = Int32Array ? new Int32Array((w + 1) * (h + 1)) : new Array((w + 1) * (h + 1)),  //cache.iiSum,//
                //    iiSqSum;// = Int32Array ? new Int32Array((w + 1) * (h + 1)) : new Array((w + 1) * (h + 1));    //cache.iiSqSum;//

                var radRotation = this.isMobile && this._features.INCLINATION.supported ? this._gamma : this._defaultOrientation;
                if (radRotation != 0) {
                    var tw = w * 0.5,
                        th = h * 0.5;
                    ctx.translate(tw, th);
                    ctx.rotate(-radRotation * Math.PI / 180.0);
                    ctx.translate(-tw, -th);
                }
                ctx.scale(this._scaling, this._scaling);
                ctx.drawImage(this._src, 0, 0);
                ctx.restore();

                //get data
                var imgData = ctx.getImageData(0, 0, w, h),
                    data = imgData.data;

                //calc color map
                var cMap = new Array(w),
                    colSum = ('Uint8Array' in window) ? new Uint8Array(w) : new Array(w),
                    row, sum, p;

                var _r, _g, _b;
                for (var c = 0, cl = w; c < cl; c++) {
                    row = ('Uint8Array' in window) ? new Uint8Array(h) : new Array(h);
                    sum = 0;
                    for (var r = 0, rl = h; r < rl; r++) {
                        p = (r * w + c) * 4;
                        _r = data[p];
                        _g = data[p + 1];
                        _b = data[p + 2];
                        if (data[p + 3] > 0 && (_r > 95) && (_g > 40) && (_b > 20)
                         && (_r > _g) && (_r > _b) && (_r - Math.min(_g, _b) > 15)
                         && (Math.abs(_r - _g) > 15)) {
                            row[r] = 1;
                            sum++;
                        }
                        else {
                            row[r] = 0;
                        }
                    }
                    cMap[c] = row;
                    colSum[c] = sum;
                }

                var rois = [],
                    roi = {},
                    cond = 8;
                for (var c = 0, l = colSum.length; c < l; c += 2) {
                    if (!roi.x && colSum[c] > cond) {
                        roi.x = c;
                    }
                    else if (roi.x && colSum[c] < cond) {
                        roi.w = c - roi.x;
                        if (roi.w > cond)
                            rois.push(roi);
                        roi = {};
                    }
                }
                if (roi.x) {    //end on image border
                    roi.w = w - roi.x;
                    if (roi.w > cond)
                        rois.push(roi);
                }

                //cond = roi.w / 2;
                for (var i = 0, l = rois.length; i < l; i++) {
                    roi = rois[0];  //always remove first and instert with push
                    rois.remove(roi);

                    //roi.y = 0;
                    for (var r = 0; r < h; r++) {
                        sum = 0;
                        for (var c = roi.x, cl = c + roi.w; c < cl; c += 2) {
                            if (cMap[c][r])
                                sum++;
                            if (sum > cond)
                                break;
                        }
                        if (!roi.y && sum > cond) {
                            roi.y = r;
                        }
                        else if (roi.y && sum < cond) {
                            roi.h = r - roi.y;
                            if (roi.h > cond)
                                rois.push(roi);
                            roi = {
                                x: roi.x,
                                w: roi.w
                            };
                        }
                    }
                    if (roi.y) {    //end on image border
                        roi.h = h - roi.y;
                        if (roi.h > cond)
                            rois.push(roi);
                    }

                    //roi.h = h;
                    //for (var r = h; r > roi.y; r -= 2) {
                    //    sum = 0;
                    //    for (var c = roi.x, cl = c + roi.w; c < cl; c += 2) {
                    //        if (cMap[c][r])
                    //            sum++;
                    //    }
                    //    if (sum < cond)
                    //        roi.h = r - roi.y;
                    //    else
                    //        break;
                    //}
                }

                var roiLength = rois.length;
                if (roiLength > 1) {
                    var x = w * .5, y = h * .25;
                    for (var i = 0; i < roiLength; i++) {
                        roi = rois[i];
                        roi.confidence = (roi.w * roi.h) / Math.max(100, Math.pow(roi.x + roi.w * .5 - x, 2) + Math.pow(roi.y + roi.h * .5 - y, 2));
                    }
                    rois.sort(function (a, b) { return a.confidence < b.confidence; });
                }

                if (roiLength == 0) {   //use the whole screen
                    rois.push({ x: 0, y: 0, w: w, h: h });
                    roiLength = 1;
                }

                var face,
                    faceFactor = 1.25,
                    tmp, offset,
                    hx, hy, hw, hh,    //haar roi
                    gsImg,
                    iiSum,
                    iiSqSum;

                for (var roiIdx = 0; roiIdx < roiLength && !face; roiIdx++) {
                    roi = rois[roiIdx];
                    if (roi.h / roi.w > faceFactor) {
                        hh = roi.h;
                        hy = roi.y;
                        hw = roi.h / faceFactor;
                        hx = roi.x - (hw - roi.w) * 0.5;
                    }
                    else {
                        hw = roi.w;
                        hx = roi.x;
                        hh = roi.w * faceFactor;
                        hy = roi.y - (hh - roi.h) * 0.5;
                    }
                    tmp = Math.max(0, hx - hw * 0.15 >> 0);  //x
                    offset = hx - tmp;
                    hx = tmp;
                    hw = Math.min(w - hx, offset + hw * 1.15 >> 0);

                    tmp = Math.max(0, hy - hh * 0.15 >> 0); //y
                    offset = hy - tmp;
                    hy = tmp;
                    hh = Math.min(h - hy, offset + hh * 1.15 >> 0);

                    //custom scaling
                    var rw, rh; //current rendering width/height
                    var hScaling = this._scaling;
                    var hData;
                    var c = this._haarCanvas;
                    if (hh < h && hw < 55) {   //custom scaling
                        var customScaling = Math.min(h / hh, 55 / hw);
                        hScaling *= customScaling;
                        c.width = hw * customScaling >> 0;
                        c.height = hh * customScaling >> 0;

                        var haarCtx = this._haarCtx;
                        haarCtx.save();
                        //TODO rotation
                        //haarCtx.scale(hScaling, hScaling); - this is done automatically by drawImage
                        haarCtx.drawImage(this._src, hx / this._scaling >> 0, hy / this._scaling >> 0, hw / this._scaling >> 0, hh / this._scaling >> 0, 0, 0, c.width, c.height);
                        haarCtx.restore();

                        rw = c.width;
                        rh = c.height;
                        hData = haarCtx.getImageData(0, 0, rw, rh).data;
                    }
                    else if (hh > 90) {
                        var customScaling = Math.min(100 / hh, w / hw);
                        hScaling *= customScaling;
                        c.width = hw * customScaling >> 0;
                        c.height = hh * customScaling >> 0;

                        var haarCtx = this._haarCtx;
                        haarCtx.save();
                        //TODO rotation
                        //haarCtx.scale(hScaling, hScaling); - this is done automatically by drawImage
                        haarCtx.drawImage(this._src, hx / this._scaling >> 0, hy / this._scaling >> 0, hw / this._scaling >> 0, hh / this._scaling >> 0, 0, 0, c.width, c.height);
                        haarCtx.restore();

                        rw = c.width;
                        rh = c.height;
                        hData = haarCtx.getImageData(0, 0, rw, rh).data;
                    }
                    else {  //use the default scaling
                        rw = hw;
                        rh = hh;
                        hData = ctx.getImageData(hx, hy, rw, rh).data;
                    }

                    //if (hx + hw > w || hy + hh > h)
                    //    alert("");
                    //if (hw < 20 || hh < 20) //only process if we can get a match (with required confidence)
                    //    continue;

                    var size = rw * rh;
                    gsImg = ('Uint8Array' in window) ? new Uint8Array(size) : new Array(size);
                    size = (rw + 1) * (rh + 1);
                    iiSum = ('Int32Array' in window) ? new Int32Array(size) : new Array(size),
                    iiSqSum = ('Int32Array' in window) ? new Int32Array(size) : new Array(size);

                    this._grayscale(hData, rw, rh, gsImg);
                    this._getIntegral(gsImg, rw, rh, iiSum, iiSqSum);

                    //var rects = [];
                    var rects = this._getHaarRects(iiSum, iiSqSum, rw, rh, this._classifier, 1.19, Math.max(.9/*0.65*/, rw * 0.02)); //TODO: options.scale_factor, options.min_scale); - custom scaling
                    //TODO: classifier defined in other script file as public - move!

                    //evaluate rects
                    var foundLength = rects.length;
                    //apply original size and  x/y = center/center
                    for (var i = 0; i < foundLength; i++) {
                        match = rects[i];
                        match.w = match.h /= hScaling;
                        match.x = hx / this._scaling + match.x / hScaling + match.w * .5;
                        match.y = hy / this._scaling + match.y / hScaling + match.h * .5;
                    }

                    if (foundLength >= 4) {
                        var valRadius = 0,
                            sumConf = 0,
                            valX = 0,
                            valY = 0,
                            match;

                        for (var i = 0; i < foundLength; i++) {
                            match = rects[i];
                            valRadius += match.w;
                            sumConf += match.confidence;
                            valX += match.x * match.confidence;
                            valY += match.y * match.confidence;
                        }
                        valRadius = valRadius / foundLength * 0.25;
                        valX /= sumConf;
                        valY /= sumConf;

                        //evaluate center
                        var valid = 0;
                        for (var i = 0; i < foundLength; i++) {
                            match = rects[i];
                            if (match.x < valX + valRadius && match.x > valX - valRadius &&
                                match.y < valY + valRadius && match.y > valY - valRadius)
                                valid++;
                        }

                        if (valid / foundLength > 0.74) {
                            face = { x: valX, y: valY, w: valRadius * 4, h: valRadius * 4 };
                            //TODO: calc size based on imgMap (optimization)
                            this._foundDate = Date.now();
                            this._positionX = face.x;  //TODO edit positions & size based on video and scene size
                            this._positionY = face.y;
                            this._size = face.w;
                            this._initTrackingObject();
                        }
                    }
                    //no roi: not found

                    //Stöcker, Taschenbuch mathematischer Formeln und modernder Verfahren, Harri Deutsch Verlag, 4. Auflage, Seite 331:
                    //Schwerpunkt eines Systems materieller Punkte M_i(x_i,y_i) mit den Massen m_i(i=1,2,...,n): 
                    //x=sum(m_i*x_i)/sum(m_i) 
                    //y=sum(m_i*y_i)/sum(m_i)

                    //test
                    var delay = Date.now() - testStart;
                    // if (cycleTime != undefined ){
                    //   cycleTime.innerText = delay;
                    //}


                    //for (c = hx, cl = c + hw; c < cl; c++) {
                    //    for (r = hy, rl = r + hh; r < rl; r++) {
                    //        p = (c + r * w) * 4;
                    //        if (cMap[c][r]) {
                    //            data[p] = 255; data[p + 1] = 0; data[p + 2] = 0; data[p + 2] = 128;
                    //        }
                    //        else
                    //            data[p] = data[p + 1] = data[p + 2] = 0; data[p + 2] = 128;
                    //    }
                    //}
                    //ctx.putImageData(imgData, 0, 0);

                    //draw rects
                    //ctx.strokeStyle = "rgb(0,255,0)";
                    //for (var i = 0, l = rects.length; i < l; i++) {
                    //    //if (l > 5) {
                    //    //    var breakpoint = true;
                    //    //}
                    //    var r = rects[i];
                    //    //ctx.strokeRect((r.x * scaling) | 0, (r.y * scaling) | 0, (r.width * scaling) | 0, (r.height * scaling) | 0);
                    //    //var sca = this._scaling / scaling;
                    //    ctx.strokeRect((r.x - r.w * .5) * this._scaling, hy + (r.y - r.h * .5) * this._scaling, r.w * this._scaling, r.h * this._scaling);
                    //    //face = r;  //TODO
                    //}
                    if (face) {
                        ctx.strokeStyle = "rgb(255,0,0)";
                        ctx.strokeRect((face.x - face.w * .5) * this._scaling, (face.y - face.h * .5) * this._scaling, face.w * this._scaling, face.h * this._scaling);
                    }

                }   //end: handle rois

                //test
                if (this._on)
                    window.setTimeout(this.__detectFace.bind(this), 100);   //TODO: dispose my break this
            },
            _grayscale: function (data, w, h, out) {
                var x = 0, y = 0, i = 0, j = 0, ir = 0, jr = 0;
                var coeff_r = 4899, coeff_g = 9617, coeff_b = 1868, cn = 4;

                var cs = 4, cn2 = 8, cn3 = 12;

                for (var y = 0; y < h; ++y, j += w, i += w * cn) {
                    for (x = 0, ir = i, jr = j; x <= w - 4; x += 4, ir += cn << 2, jr += 4) {
                        out[jr] = (data[ir] * coeff_r + data[ir + 1] * coeff_g + data[ir + 2] * coeff_b + 8192) >> 14;
                        out[jr + 1] = (data[ir + cn] * coeff_r + data[ir + cn + 1] * coeff_g + data[ir + cn + 2] * coeff_b + 8192) >> 14;
                        out[jr + 2] = (data[ir + cn2] * coeff_r + data[ir + cn2 + 1] * coeff_g + data[ir + cn2 + 2] * coeff_b + 8192) >> 14;
                        out[jr + 3] = (data[ir + cn3] * coeff_r + data[ir + cn3 + 1] * coeff_g + data[ir + cn3 + 2] * coeff_b + 8192) >> 14;
                    }
                    for (; x < w; ++x, ++jr, ir += cn) {
                        out[jr] = (data[ir] * coeff_r + data[ir + 1] * coeff_g + data[ir + 2] * coeff_b + 8192) >> 14;
                    }
                }
            },
            _getIntegral: function (data, w, h, outSum, outSqSum) {
                // out_(type) size should be cols = data.cols+1, rows = data.rows+1
                var w1 = (w + 1) | 0;
                var s = 0,
                    s2 = 0,
                    p = 0,
                    pup = 0,
                    i = 0,
                    j = 0,
                    v = 0,
                    k = 0;

                if (outSum && outSqSum) {
                    for (; i < w1; ++i) {
                        outSum[i] = 0, outSqSum[i] = 0;
                    }
                    p = (w1 + 1) | 0, pup = 1;
                    for (i = 0, k = 0; i < h; ++i, ++p, ++pup) {
                        s = s2 = 0;
                        for (j = 0; j <= w - 2; j += 2, k += 2, p += 2, pup += 2) {
                            v = data[k];
                            s += v, s2 += v * v;
                            outSum[p] = outSum[pup] + s;
                            outSqSum[p] = outSqSum[pup] + s2;

                            v = data[k + 1];
                            s += v, s2 += v * v;
                            outSum[p + 1] = outSum[pup + 1] + s;
                            outSqSum[p + 1] = outSqSum[pup + 1] + s2;
                        }
                        for (; j < w; ++j, ++k, ++p, ++pup) {
                            v = data[k];
                            s += v, s2 += v * v;
                            outSum[p] = outSum[pup] + s;
                            outSqSum[p] = outSqSum[pup] + s2;
                        }
                    }
                }
            },
            _getHaarRects: function (iiSum, iiSqSum, w, h, classifier, scale_factor, scale_min) {
                //if (typeof scale_factor === "undefined") { scale_factor = 1.2; }
                //if (typeof scale_min === "undefined") { scale_min = 1.0; }
                var win_w = classifier.size[0],
                    win_h = classifier.size[1],
                    maxW = w > 60 ? w * 0.85 : w,
                    maxH = h > 60 ? h * 0.85 : h;
                var rects = [];

                while (scale_min * win_w < maxW && scale_min * win_h < maxH) {
                    rects = rects.concat(this.__getSingleScaleHaarRects(iiSum, iiSqSum, w, h, classifier, scale_min));
                    scale_min *= scale_factor;
                }
                return rects;
            },
            //detecting for single scale
            __getSingleScaleHaarRects: function (iiSum, iiSqSum, w, h, classifier, scale) {
                var win_w = (classifier.size[0] * scale) | 0,
                    win_h = (classifier.size[1] * scale) | 0,
                    step = (0.5 * scale + 1.5) | 0;//,
                //step_y = step_x;
                var i, j, k, x, y, ex = (w - win_w) | 0, ey = (h - win_h) | 0;
                var w1 = (w + 1) | 0, edge_dens, mean, variance, std;
                var inv_area = 1.0 / (win_w * win_h);
                var stages, stage, trees, tree, sn, tn, fn, found = true, stage_thresh, stage_sum, tree_sum, feature, features;
                var fi_a, fi_b, fi_c, fi_d, fw, fh;

                var ii_a = 0, ii_b = win_w, ii_c = win_h * w1, ii_d = ii_c + win_w;
                var edges_thresh = ((win_w * win_h) * 0xff * 0.12) | 0; //edges_density = 0.17
                // if too much gradient we also can skip
                //var edges_thresh_high = ((win_w*win_h) * 0xff * 0.3)|0;

                var rects = [];
                for (y = 0; y < ey; y += step) {
                    ii_a = y * w1;
                    for (x = 0; x < ex; x += step, ii_a += step) {

                        mean = iiSum[ii_a]
                                - iiSum[ii_a + ii_b]
                                - iiSum[ii_a + ii_c]
                                + iiSum[ii_a + ii_d];

                        mean *= inv_area;
                        variance = (iiSqSum[ii_a]
                                    - iiSqSum[ii_a + ii_b]
                                    - iiSqSum[ii_a + ii_c]
                                    + iiSqSum[ii_a + ii_d]) * inv_area - mean * mean;

                        std = variance > 0. ? Math.sqrt(variance) : 1;

                        stages = classifier.complex;//classifiers;
                        sn = stages.length;
                        found = true;
                        for (i = 0; i < sn; ++i) {
                            stage = stages[i];
                            stage_thresh = stage.threshold;
                            trees = stage.simple;//classifiers;
                            tn = trees.length;
                            stage_sum = 0;
                            for (j = 0; j < tn; ++j) {
                                tree = trees[j];
                                tree_sum = 0;
                                features = tree.f;//features;
                                fn = features.length;
                                for (k = 0; k < fn; ++k) {
                                    feature = features[k];
                                    fi_a = ~~(x + feature[0] * scale) + ~~(y + feature[1] * scale) * w1;
                                    fw = ~~(feature[2] * scale);
                                    fh = ~~(feature[3] * scale);
                                    fi_c = fh * w1;

                                    tree_sum += (iiSum[fi_a]
                                                - iiSum[fi_a + fw]
                                                - iiSum[fi_a + fi_c]
                                                + iiSum[fi_a + fi_c + fw]) * feature[4];
                                }
                                stage_sum += (tree_sum * inv_area < tree.t * std) ? tree.l : tree.r;
                            }
                            if (stage_sum < stage_thresh) {
                                found = false;
                                break;
                            }
                        }

                        if (found && stage_sum > 28.55) {
                            rects.push({
                                "x": x,
                                "y": y,
                                "w": win_w,
                                "h": win_h,
                                "confidence": stage_sum
                            });
                            x += step, ii_a += step;
                        }
                    }
                }
                return rects;
            },
            start: function (src, width, height, orientation) { //TODO
                /* if (!src || !width || !height)
                       throw new Error('invalid arguments: start()');
   
                       if (this._on)
                           this.stop();
   
                       this._src = src;
                       var c = this._canvas;
                           this._scaling = width > height ? this._maxRendering / width : this._maxRendering / height;   //TODO
                           c.width = Math.floor(width * this._scaling);
                           c.height = Math.floor(height * this._scaling);
   
                  if (this._on)
                       return;
                   this._on = true;
                   this.__detectFace(); */
            },
            stop: function () {
                this._inUse = true;
                this._on = false;   //TODO: handle async
            },
            //pause: function () {
            //},
            //resume: function () {
            //},
            //reset: function () {   //called at program-restart
            //    if (!this._inUse)
            //        return;

            //    //TODO
            //    alert();
            //    if (this._inUse)
            //        cam.initFaceDetection = true;
            //    this._initCamera(true);

            //},

            //tracking
            _initTrackingObject: function () {  //imgData, x, y, w, h) {
                var //fd = this._fd,
                    scaling = this._scaling,
                    x = this._positionX * scaling >> 0,
                    y = this._positionY * scaling >> 0,
                    w = this._size * scaling;
                var h = w;

                var imgData = this._ctx.getImageData(x, y, w, h);
                this._tracking = {
                    modelHist: new SimpleHistogram(imgData),
                    searchWindow: { x: x, y: y, w: w, h: h },
                    trackObj: { x: 0, y: 0, w: 0, h: 0 },
                };

                //TODO

            },
            _findTrackingObject: function (imgData, w, h) {
                //var fd = this._fd;
                if (!this._tracking)
                    return;
                var tracking = this._tracking;

                var curHist = new SimpleHistogram(imgData);

                //var weights = getWeights(_modelHist, curHist);  //=(selectedAreaHist, completeCanvasHist)- Verhältnisse[] von frame zu image Histogram
                // Return an array of the probabilities of each histogram color bins
                var weights = [];
                //var p;

                // iterate over the entire histogram and compare
                for (var i = 0, p = 0; i < 2048; i++) {
                    if (curHist.bin[i] != 0) {
                        p = Math.min(tracking.modelHist.bin[i] / curHist.bin[i], 1);
                    } else {
                        p = 0;
                    }
                    weights.push(p);
                }

                //***

                //color probabilities distributions: get back-projection data
                var ppd = new Array(w);   //pixel probability data for current searchwindow
                var r, g, b, pos;
                var a;// = [];

                // TODO : typed arrays here
                // but we should then do a compatibilitycheck

                for (var x = 0; x < w; x++) {
                    a = new Array(h);       //per column
                    for (var y = 0; y < h; y++) {   //for each pixel in frame
                        pos = ((y * w) + x) * 4;
                        r = imgData[pos] >> 5;
                        g = imgData[pos + 1] >> 5;
                        b = imgData[pos + 2] >> 5;
                        a[y] = weights[r << 6 | g << 3 | b];
                    }
                    ppd[x] = a;  //data[col][row] including propabilities
                }
                //_pdf = data;

                //***

                var meanShiftIterations = 10; // maximum number of iterations

                // store initial searchwindow
                var searchWindow = tracking.searchWindow,
                    prevx = searchWindow.x,
                    prevy = searchWindow.y;

                // Locate by iteration the maximum of density into the probability distributions
                var m, wadx, wady, wadw, wadh;
                for (var i = 0; i < meanShiftIterations; i++) {
                    // get searchwindow from ppd:
                    wadx = Math.max(searchWindow.x, 0);
                    wady = Math.max(searchWindow.y, 0);
                    wadw = Math.min(wadx + searchWindow.w, w);
                    wadh = Math.min(wady + searchWindow.h, h);

                    m = new Moments(ppd, wadx, wady, wadw, wadh, (i == meanShiftIterations - 1));

                    searchWindow.x += ((m.xc - searchWindow.w / 2) >> 0);    //truncat, faster than Math.floor (only 32bit)
                    searchWindow.y += ((m.yc - searchWindow.h / 2) >> 0);

                    // if we have reached maximum density, get second moments and stop iterations
                    if (searchWindow.x == prevx && searchWindow.y == prevy) {
                        m = new Moments(ppd, wadx, wady, wadw, wadh, true);
                        break;
                    } else {
                        prevx = searchWindow.x;
                        prevy = searchWindow.y;
                    }
                }

                searchWindow.x = Math.max(0, Math.min(searchWindow.x, w));
                searchWindow.y = Math.max(0, Math.min(searchWindow.y, h));

                var trackObj = tracking.trackObj;
                trackObj.w = Math.sqrt(m.mu20 * m.invM00) << 2;
                trackObj.h = Math.sqrt(m.mu02 * m.invM00) << 2;

                //check if tracked object is into the limit
                trackObj.x = Math.floor(Math.max(0, Math.min(searchWindow.x + searchWindow.w / 2, w)));
                trackObj.y = Math.floor(Math.max(0, Math.min(searchWindow.y + searchWindow.h / 2, h)));

                //new search window size
                searchWindow.w = Math.floor(1.1 * trackObj.w);
                searchWindow.h = Math.floor(1.1 * trackObj.h);
            },

            /*override*/
            reset: function () {
                  //TODO: faceDetection 
            },
            _getViewState: function () {
                return {};  //TODO: faceDetection on/off?
            },
            _setViewState: function () {
                //TODO: faceDetection on/off?   + init()?
            },
            dispose: function () {
                this.stop();
                this._device = undefined;
                this._src = undefined;
                PocketCode.DeviceFeature.prototype.dispose.call(this);
            },
        });

        //internal helper classes
        var SimpleHistogram = (function () {

            function SimpleHistogram(imgData) {
                this._size = 2048;

                if ('Uint8Array' in window) {
                    this._bins = new Uint8Array(this._size);
                }
                else {
                    this._bins = new Array(this._size);
                    //initialize bins
                    for (var i = 0, l = this._size; i < l; i++) {
                        this._bins[0] = 0;
                    }
                }

                //add histogram data
                if (!(imgData instanceof Array))
                    return;
                var r, g, b;
                for (var i = 0, l = imgData.length; i < l; i += 4) {
                    r = imgData[i + 0] >> 5; // round down
                    g = imgData[i + 1] >> 5;
                    b = imgData[i + 2] >> 5;
                    this._bins[r << 6 | g << 3 | b] += 1;
                }
            }

            Object.defineProperties(SimpleHistogram.prototype, {
                bins: {
                    get: function () {
                        return this._bins;
                    }
                }
            });
            //this.getBin = function (index) {
            //    return bins[index];
            //}

            return SimpleHistogram;
        })();

        var Moments = (function () {

            function Moments(data, x, y, w, h, second) {
                this._m00 = 0;
                this._m01 = 0;
                this._m10 = 0;
                this._m11 = 0;
                this.m02 = 0;//public
                this.m20 = 0;//public

                var val, vx, vy;
                var a = [];
                for (var i = x; i < w; i++) {
                    a = data[i];
                    vx = i - x;

                    for (var j = y; j < h; j++) {
                        val = a[j];

                        vy = j - y;
                        this._m00 += val;
                        this._m01 += vy * val;
                        this._m10 += vx * val;
                        if (second) {
                            this._m11 += vx * vy * val;
                            this.m02 += vy * vy * val;
                            this.m20 += vx * vx * val;
                        }
                    }
                }

                this.invM00 = 1 / this._m00;//public
                this.xc = this._m10 * this.invM00;//public
                this.yc = this._m01 * this.invM00;//public
                //this.mu00 = this._m00;
                //this.mu01 = 0;
                //this.mu10 = 0;

                if (second) {
                    this.mu20 = this.m20 - this._m10 * this.xc;//public
                    this.mu02 = this.m02 - this._m01 * this.yc;//public
                    //this.mu11 = this._m11 - this._m01 * this.xc;
                }
            }

            //Object.defineProperties(Moments.prototype, {

            //});

            return Moments;
        })();
        //^^ internal helper classes

        return FaceDetection;
    })(),

});
