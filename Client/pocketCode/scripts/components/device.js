/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="soundManager.js" />
'use strict';

PocketCode.Device = (function () {
    Device.extends(SmartJs.Core.EventTarget);

    function Device(soundManager) {
        if (!soundManager instanceof PocketCode.SoundManager)
            throw new Error('invalid cntr call: sound manager');
        this._soundMgr = soundManager;

        this._flashOn = false;      //TODO: temp solution until flash supported

        this._compass = 0;
        this._alpha = 0;
        this._beta = 0;
        this._gamma = 0;

        this._x = 0;
        this._y = 0;
        this._z = 0;

        this._windowOrientation = 0;

        //sensor support
        this._features = {
            ACCELERATION: {
                i18nKey: 'lblDeviceAcceleration',
                inUse: false,
                supported: false,
            },
            COMPASS: {
                i18nKey: 'lblDeviceCompass',
                inUse: false,
                supported: false,
            },
            INCLINATION: {
                i18nKey: 'lblDeviceInclination',
                inUse: false,
                supported: false,
            },
            FLASH: {
                i18nKey: 'lblDeviceFlash',
                inUse: false,
                supported: false,
            },
            VIBRATE: {
                i18nKey: 'lblDeviceVibrate',
                inUse: false,
                supported: !!(navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate),
            },
            LEGO_NXT: {
                i18nKey: 'lblDeviceLegoNXT',
                inUse: false,
                supported: false,
            },
            PHIRO: {
                i18nKey: 'lblDevicePhiro',
                inUse: false,
                supported: false,
            },
            ARDUINO: {
                i18nKey: 'lblDeviceArduino',
                inUse: false,
                supported: false,
            },
            GEO_LOCATION: {
                i18nKey: 'lblDeviceGeoLocation',
                inUse: false,
                supported: navigator.geolocation ? true : false,
            },
        };

        this._sensorData = {
            X_ACCELERATION: 0.0,  //we make sure no null-values are returned as this may break our formula calculations
            Y_ACCELERATION: 0.0,
            Z_ACCELERATION: 0.0,
            COMPASS_DIRECTION: 0.0,
            X_INCLINATION: 0.0,
            Y_INCLINATION: 0.0,
            //X_ROTATION_RATE: 0.0,
            //Y_ROTATION_RATE: 0.0,
            //LOUDNESS: 0.0,
        };

        this._geoLocationData = {
            INITIALIZED: false,
            LATITUDE: 0,
            LONGITUDE: 0,
            ALTITUDE: 0,
            ACCURACY: 0,
        },

        this._touchEvents = {
            active: {},
            history: [],
        };

        //bind events
        if (!isNaN(window.orientation)) {
            if (window.DeviceOrientationEvent)
                this._initDeviceOrientationListener = this._addDomListener(window, 'deviceorientation', this._initDeviceOrientationHandler);

            if (window.DeviceMotionEvent)
                this._initDeviceMotionListener = this._addDomListener(window, 'devicemotion', this._initDeviceMotionHandler);

            this._orientationChangeListener = this._addDomListener(window, 'orientationchange', this._orientationChangeHandler);
            this._windowOrientation = window.orientation;
        }

        //events
        this._onSpaceKeyDown = new SmartJs.Event.Event(this);
        //this._onSupportChange = new SmartJs.Event.Event(this);  //this event is triggered if a sensor is used that is not supported
    }

    //events
    Object.defineProperties(Device.prototype, {
        onSpaceKeyDown: {
            get: function () {
                return this._onSpaceKeyDown;
            },
        },
    });

    //properties
    Object.defineProperties(Device.prototype, {
        isMobile: {
            value: SmartJs.Device.isMobile,
        },
        isTouch: {
            value: SmartJs.Device.isTouch,
        },
        emulationInUse: {
            get: function () {
                if (this instanceof PocketCode.DeviceEmulator && this._features.INCLINATION.inUse)
                    return true;
                return false;
            },
        },
        mobileLockRequired: {
            get: function () {
                if (!this.isMobile)
                    return false;
                var tmp = this._features
                if (tmp.ACCELERATION.inUse || tmp.COMPASS.inUse || tmp.INCLINATION.inUse)
                    return true;
                return false;
            },
        },
        unsupportedFeatureDetected: {
            get: function () {
                var tmp;
                for (var f in this._features) {
                    tmp = this._features[f];
                    if (tmp.inUse && !tmp.supported)
                        return true;
                }
                return false;
            },
        },
        unsupportedFeatures: {
            get: function () {
                var unsupported = [], tmp;
                for (var f in this._features) {
                    tmp = this._features[f];
                    if (tmp.inUse && !tmp.supported)
                        unsupported.push(tmp.i18nKey);  //return i18nKeys only
                }
                return unsupported;
            },
        },
        accelerationX: {
            get: function () {
                if (this._deviceMotionListener) { //supported
                    switch (this._windowOrientation) {
                        case 0:
                            return this._x;
                        case -90:
                            return this._y;
                        case 180:
                            return -this._x;
                        case 90:
                            return -this._y;
                    }
                }
                else if (this._features.ACCELERATION.supported) {
                    this._features.ACCELERATION.inUse = true;
                    this._deviceMotionListener = this._addDomListener(window, 'devicemotion', this._deviceMotionChangeHandler);
                    return this.accelerationX;
                }

                this._features.ACCELERATION.inUse = true;
                return this._sensorData.X_ACCELERATION;
            },
        },
        accelerationY: {
            get: function () {
                if (this._deviceMotionListener) { //supported
                    switch (this._windowOrientation) {
                        case 0:
                            return this._y;
                        case -90:
                            return -this._x;
                        case 180:
                            return -this._y;
                        case 90:
                            return this._x;
                    }
                }
                else if (this._features.ACCELERATION.supported) {
                    this._features.ACCELERATION.inUse = true;
                    this._deviceMotionListener = this._addDomListener(window, 'devicemotion', this._deviceMotionChangeHandler);
                    return this.accelerationY;
                }

                this._features.ACCELERATION.inUse = true;
                return this._sensorData.Y_ACCELERATION;
            },
        },
        accelerationZ: {
            get: function () {
                if (this._deviceMotionListener) { //supported
                    return this._z; // z is orientation independent.
                }
                else if (this._features.ACCELERATION.supported) {
                    this._features.ACCELERATION.inUse = true;
                    this._deviceMotionListener = this._addDomListener(window, 'devicemotion', this._deviceMotionChangeHandler);
                    return this.accelerationZ;
                }

                this._features.ACCELERATION.inUse = true;
                return this._sensorData.Z_ACCELERATION;
            },
        },
        compassDirection: {
            get: function () {
                if (this._deviceOrientationListener) { //supported
                    return this._compass;   //wrong + todo: compass initialization needed?
                }
                else if (this._features.COMPASS.supported) {
                    this._features.COMPASS.inUse = true;
                    this._deviceOrientationListener = this._addDomListener(window, 'deviceorientation', this._deviceOrientationChangeHandler);
                    return this.compassDirection;
                }

                this._features.COMPASS.inUse = true;
                return this._sensorData.COMPASS_DIRECTION;
            },
        },
        inclinationX: {
            get: function () {
                if (this._deviceOrientationListener) { //supported
                    return this._getInclinationX(this._beta, this._gamma);
                }
                else if (this._features.INCLINATION.supported) {
                    this._features.INCLINATION.inUse = true;
                    this._deviceOrientationListener = this._addDomListener(window, 'deviceorientation', this._deviceOrientationChangeHandler);
                    return this._getInclinationX(this._beta, this._gamma);
                }

                this._features.INCLINATION.inUse = true;
                return this._sensorData.X_INCLINATION;
            },
        },
        inclinationY: {
            get: function () {
                if (this._deviceOrientationListener) { //supported
                    return this._getInclinationY(this._beta, this._gamma);
                }
                else if (this._features.INCLINATION.supported) {
                    this._features.INCLINATION.inUse = true;
                    this._deviceOrientationListener = this._addDomListener(window, 'deviceorientation', this._deviceOrientationChangeHandler);
                    return this._getInclinationY(this._beta, this._gamma);
                }

                this._features.INCLINATION.inUse = true;
                return this._sensorData.Y_INCLINATION;
            },
        },
        //rotationRateX: {
        //	get: function () {
        //		if (this._features.INCLINATION.supported && this._rotationRate) {
        //			return this._getInclinationX(this._rotationRate.beta, this._rotationRate.gamma);
        //		}
        //		return this._sensorData.X_ROTATION_RATE;
        //	},
        //},
        //rotationRateY: {
        //	get: function () {
        //		if (this._features.INCLINATION.supported && this._rotationRate) {
        //			return this._getInclinationY(this._rotationRate.beta, this._rotationRate.gamma);
        //		}
        //		return this._sensorData.Y_ROTATION_RATE;
        //	},
        //},
        loudness: {
            get: function () {
                return this._soundMgr.volume;
            },
        },
        //touch
        lastTouchIndex: {
            get: function () {
                return this._touchEvents.history.length;
            },
        },

        //flash: state not shown but stored
        flashOn: {
            get: function () {
                this._features.FLASH.inUse = true;
                return this._flashOn;
            },
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid parameter: expected type \'boolean\'');
                this._features.FLASH.inUse = true;

                this._flashOn = value;
                //TODO: https://developer.mozilla.org/en-US/docs/Web/API/CameraControl/flashMode
            },
        },
        //lego nxt
        nxt1: {
            get: function () {
                this._features.LEGO_NXT.inUse = true;
                return 0.0; //not supported
            },
        },
        nxt2: {
            get: function () {
                this._features.LEGO_NXT.inUse = true;
                return 0.0; //not supported
            },
        },
        nxt3: {
            get: function () {
                this._features.LEGO_NXT.inUse = true;
                return 0.0; //not supported
            },
        },
        nxt4: {
            get: function () {
                this._features.LEGO_NXT.inUse = true;
                return 0.0; //not supported
            },
        },
        //phiro
        phiroFrontLeft: {
            get: function () {
                this._features.PHIRO.inUse = true;
                return 0.0; //not supported
            },
        },
        phiroFrontRight: {
            get: function () {
                this._features.PHIRO.inUse = true;
                return 0.0; //not supported
            },
        },
        phiroSideLeft: {
            get: function () {
                this._features.PHIRO.inUse = true;
                return 0.0; //not supported
            },
        },
        phiroSideRight: {
            get: function () {
                this._features.PHIRO.inUse = true;
                return 0.0; //not supported
            },
        },
        phiroBottomLeft: {
            get: function () {
                this._features.PHIRO.inUse = true;
                return 0.0; //not supported
            },
        },
        phiroBottomRight: {
            get: function () {
                this._features.PHIRO.inUse = true;
                return 0.0; //not supported
            },
        },
        //geo location
        geoLatitude: {
            get: function () {
                this._getGeoLocationData();
                return this._geoLocationData.LATITUDE;
            },
        },
        geoLongitude: {
            get: function () {
                this._getGeoLocationData();
                return this._geoLocationData.LONGITUDE;
            },
        },
        geoAltitude: {
            get: function () {
                this._getGeoLocationData();
                return this._geoLocationData.ALTITUDE;
            },
        },
        geoAccuracy: {
            get: function () {
                this._getGeoLocationData();
                return this._geoLocationData.ACCURACY;
            },
        },
    });

    //methods
    Device.prototype.merge({
        _getInclinationX: function (beta, gamma) {
            var x;
            if (this._windowOrientation == 0 || this._windowOrientation == -180) {
                x = gamma;
                //if(beta > 90)
                //	x = -x;
            }
            else {
                x = beta;
            }
            if (this._windowOrientation >= 0)  // = to be consistent with Catroid
                return -x;
            return x;
        },
        _getInclinationY: function (beta, gamma) {
            var y;
            if (this._windowOrientation == 0 || this._windowOrientation == -180)
                y = beta;
            else
                y = gamma;

            if (this._windowOrientation > 0)
                return -y;
            return y;
        },
        _initDeviceOrientationHandler: function (e) {
            if (this._initDeviceOrientationListener) {
                this._removeDomListener(window, 'deviceorientation', this._initDeviceOrientationListener);
                delete this._initDeviceOrientationListener;

                this._alpha = e.alpha;
                this._beta = e.beta;
                this._gamma = e.gamma;

                if (this._gamma != 0 || this._alpha != 0 || this._beta != 0) { //checks if there is sensor data- if not sensors are not supported
                    this._features.COMPASS.supported = true;
                    this._features.INCLINATION.supported = true;
                }
            }
        },
        _initDeviceMotionHandler: function (e) {
            if (this._initDeviceMotionListener) {
                this._removeDomListener(window, 'devicemotion', this._initDeviceMotionListener);
                delete this._initDeviceMotionListener;

                this._features.ACCELERATION.supported = true;
            }
        },
        _deviceOrientationChangeHandler: function (e) {
            //check for iOS property
            if (e.webkitCompassHeading) {
                this._compass = -e.webkitCompassHeading;    //direction is reversed for iOS
            }
            else
                this._compass = e.alpha;

            this._alpha = e.alpha;
            this._beta = e.beta;
            this._gamma = e.gamma;
        },
        _deviceMotionChangeHandler: function (e) {
            if (e.acceleration) {   //choose linear acceleration by default (conform andriod app)
                var acc = e.acceleration;
                this._x = acc.x;
                this._y = acc.y;
                this._z = acc.z;
            }
            else if (e.accelerationIncludingGravity) {
                var acc = e.accelerationIncludingGravity;
                this._x = acc.x;
                this._y = acc.y;
                this._z = acc.z;
            }

            //this._rotationRate = e.rotationRate;
        },
        _orientationChangeHandler: function () {
            this._windowOrientation = window.orientation;
        },
        _getGeoLocationData: function () {
            this._features.GEO_LOCATION.inUse = true;

            if (this._features.GEO_LOCATION.supported)
                navigator.geolocation.getCurrentPosition(
                    function (position) {   //success handler
                        var coords = position.coords;
                        this._geoLocationData = {
                            INITIALIZED: true,
                            LATITUDE: coords.latitude,
                            LONGITUDE: coords.longitude,
                            ALTITUDE: coords.altitude,  //already in meters
                            ACCURACY: coords.accuracy,  //already in meters
                        };
                    },
                    function () {   //error handler
                        if (/*window.location.host != 'localhost' && */window.location.protocol != "https:")
                            this._features.GEO_LOCATION.supported = false;  //chrome only allows access over http
                    }
                );
        },
        vibrate: function (duration) {
            this._features.VIBRATE.inUse = true;
            if (!this._features.VIBRATE.supported || typeof duration != 'number') //isNaN('') = false
                return false;

            //TODO: as soon as html supports this feature
            //var time = duration * 1000;
            var vibrate = (navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate).bind(navigator);
            vibrate(duration * 1000);   //TODO: pause/resume

            return true;
        },
        //touch
        updateTouchEvent: function (type, id, x, y) {
            switch (type) {
                case PocketCode.UserActionType.TOUCH_START:
                    var e = { active: true, x: x, y: y };
                    this._touchEvents.active[id] = e;
                    this._touchEvents.history.push(e);
                    break;
                case PocketCode.UserActionType.TOUCH_MOVE:
                    var e = this._touchEvents.active[id];
                    e.x = x;
                    e.y = y;
                    break;
                case PocketCode.UserActionType.TOUCH_END:
                    var e = this._touchEvents.active[id];
                    e.active = false;
                    delete this._touchEvents.active[id];
                    break;
            }
        },
        clearTouchHistory: function () {
            this._touchEvents = {
                active: {},
                history: [],
            };
        },
        getTouchX: function (idx) {
            idx--;  //mapping ind = 1..n to 0..(n-1)
            if (idx < 0 || idx >= this._touchEvents.history.length)
                return 0.0;
            return this._touchEvents.history[idx].x;
        },
        getTouchY: function (idx) {
            idx--;
            if (idx < 0 || idx >= this._touchEvents.history.length)
                return 0.0;
            return this._touchEvents.history[idx].y;
        },
        isTouched: function (idx) {
            idx--;
            if (idx < 0 || idx >= this._touchEvents.history.length)
                return false;
            return this._touchEvents.history[idx].active;
        },

        //arduino
        getArduinoAnalogPin: function (pin) {
            this._features.ARDUINO.inUse = true;
            return 0.0; //not supported
        },
        getArduinoDigitalPin: function (pin) {
            this._features.ARDUINO.inUse = true;
            return 0.0; //not supported
        },

        /* override */
        dispose: function () {
            this._soundMgr = undefined; //make sure it does not get disposed as well

            if (this._initDeviceOrientationListener) {
                this._removeDomListener(window, 'deviceorientation', this._initDeviceOrientationListener);
                //delete this._initDeviceOrientationListener;
            }
            if (this._initDeviceMotionListener) {
                this._removeDomListener(window, 'devicemotion', this._initDeviceMotionListener);
                //delete this._initDeviceMotionListener;
            }
            if (this._orientationChangeListener) {
                this._removeDomListener(window, 'orientationchange', this._orientationChangeListener);
                //delete this._orientationChangeListener;
            }

            if (this._deviceOrientationListener)
                this._removeDomListener(window, 'deviceorientation', this._deviceOrientationListener);
            if (this._deviceMotionListener)
                this._removeDomListener(window, 'devicemotion', this._deviceMotionListener);


            SmartJs.Core.EventTarget.prototype.dispose.call(this);    //call super()
        },
    });

    return Device;
})();

PocketCode.CameraType = {
    BACK: 0,
    FRONT: 1,
};

PocketCode.MediaDevice = (function () {
    MediaDevice.extends(PocketCode.Device, false);

    function MediaDevice(soundManager) {
        PocketCode.Device.call(this, soundManager);

        this._cameraTransparency = 50.0;    //default
        this._cameraVideo = document.createElement('video');
        //document.body.appendChild(this._cameraVideo);
        //this._addDomListener(this._cameraVideo, 'canplay', this._cameraInitializedHandler);
        //this._cameraVideo.autoplay = true;
        this._cameraInitializedListener = this._addDomListener(this._cameraVideo, 'loadedmetadata', this._cameraInitializedHandler);
        this._cameraOrientationListener = this._addDomListener(window, 'orientationchange', this._cameraOrientationHandler);

        this._cameraStream = undefined;
        this._startCameraStreamOnInit = false;
        //this._cameraVideo.addEventListener('canplay', this._cameraInitializedHandler.bind(this), false);
        //this._cameraVideo.setAttribute('playsinline', true);

        this._features.CAMERA = {
            i18nKey: 'lblDeviceCamera',
            inUse: false,   //startCamera called
            front: {
                facingMode: 'user',
                selected: false,   //selected by brick
                deviceId: undefined,
            },
            back: {
                facingMode: 'environment',
                selected: false,   //selected by brick
                deviceId: undefined,
            },
            supported: this._getUserMedia && ('srcObject' in this._cameraVideo || 'mozSrcObject' in this._cameraVideo || window.URL || window.webkitURL),
            on: false,
            mediaDevices: {
                supported: !!navigator.mediaDevices,
                devices: [],
                //ids, features (facing mode), 
                supportedConstraints: {},
            },
            selected: PocketCode.CameraType.FRONT,  //default
            constraints: { video: true, audio: false },
            initFaceDetection: false,   //set to true if faceDetection is called before cameraOn (wait for initalization until we know a camera is used)
            initialized: false, //if true: do not dispatch onInit
        };
        this._cam = this._features.CAMERA;  //shortcut

        if (this._cam.mediaDevices.supported) {
            if (navigator.mediaDevices.getSupportedConstraints)
                this._cam.mediaDevices.supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

            this._getMediaDevices();
        }

        //events
        this._onInit = new SmartJs.Event.Event(this);
        this._onCameraUsageChanged = new SmartJs.Event.Event(this);


        //face detection
        this._features.FACE_DETECTION = {
            i18nKey: 'lblDeviceFaceDetection',
            inUse: false,
            supported: window.Worker && (window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder),
            //parallel: window.Worker && (window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder),
            //canvas: {},
            //initOnCameraUse: false,  //determines if cam is used -> set inUse
        };

        this._onCameraUsageChanged.addEventListener(new SmartJs.Event.EventListener(this._faceDetectionCameraHandler, this));
    }

    //events
    Object.defineProperties(MediaDevice.prototype, {
        onInit: {
            get: function () {
                return this._onInit;
            },
        },
        onCameraUsageChanged: {
            get: function () {
                return this._onCameraUsageChanged;
            },
        },
    });

    //properties
    Object.defineProperties(MediaDevice.prototype, {
        faceDetected: {
            get: function () {
                this._initFaceDetection();

                if (!this._cam.on || !this._features.FACE_DETECTION.supported)
                    return false;

                //TODO
            },
        },
        faceSize: {
            get: function () {
                this._initFaceDetection();

                if (!this._cam.on || !this._features.FACE_DETECTION.supported)
                    return 0.0;

                //TODO
            },
        },
        facePositionX: {
            get: function () {
                this._initFaceDetection();

                if (!this._cam.on || !this._features.FACE_DETECTION.supported)
                    return 0.0;

                //TODO
            },
        },
        facePositionY: {
            get: function () {
                this._initFaceDetection();

                if (!this._cam.on || !this._features.FACE_DETECTION.supported)
                    return 0.0;

                //TODO
            },
        },

    });

    //methods
    MediaDevice.prototype.merge({
        //device
        reInit: function () {   //called at program-restart
            this.stopCamera();
            this._stopStream();
            this._cameraTransparency = 50.0;    //default
            this._cam.selected = PocketCode.CameraType.FRONT;   //default
            this._initCamera(true);

            this._initFaceDetection();      //TODO: 

            //TODO: set defaults like selectedCamera (should be called onRestart)
        },
        pause: function () {
            if (this._cam.on)
                this._cameraVideo.pause();
            //TODO: stream, face detection, vibrate (call super for vibrate or move to media device?)

            this._pauseFaceDetection();
        },
        resume: function () {
            if (this._cam.on)
                this._cameraVideo.play();
            //TODO

            this._resumeFaceDetection();
        },

        //camera
        setSceneSize: function (width, height) { //TODO: set wehen scene gets loaded: try to set the camera contraints and reload the stream (reinit)
            //TODO: needed for position/size calculations for face detection too

            //    var video = this._cameraVideo;
            //    video.width = width;
            //    video.height = height;
            //    if (this._cam.on)
            //        this._onCameraUsageChanged.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth, orientation: window.orientation || 0, transparency: this._cameraTransparency });
        },
        setCameraTransparency: function (value) {
            if (value < 0.0)
                value = 0.0;
            if (value > 100.0)
                value = 100.0;

            if (this._cameraTransparency === value)
                return false;

            this._cameraTransparency = value;
            if (this._cam.on) {
                this._onCameraUsageChanged.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth, orientation: window.orientation || 0, transparency: value });
                return true;
            }
            return false;
        },
        disableCamera: function () {    //set by user (dialog) if he/she doesn't want to use the camera
            this.stopCamera();
            this._cam.supported = false;    //override
        },
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
                    }
                    this._cam.mediaDevices.devices = devices;
                    if (devices.length == 0) {
                        this._cam.supported = false;  //no camera found
                        if (!this._cam.initialized)
                            this._onInit.dispatchEvent();
                    }
                }.bind(this)).catch(function (error) {
                    this._cam.supported = false;
                    if (!this._cam.initialized)
                        this._onInit.dispatchEvent();
                }.bind(this));
            }
        },
        _initStream(stream) {
            //stream.oninactive = this._streamInactiveHandler.bind(this);
            this._addDomListener(stream, 'inactive', this._streamInactiveHandler);    //TODO:
            //this._addDomListener(stream, 'ended', this._streamInactiveHandler);    //TODO:
            //this._addDomListener(stream, 'ended', this._streamEndedHandler);

            this._cameraStream = stream;
            var video = this._cameraVideo;
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
            //this._cameraInitializedHandler(); //try to start
        },
        _streamInactiveHandler: function (e) {
            if (this._disposed)
                return;
            var cam = this._cam;
            if (cam.on) {   //stream broken by e.g. camera plugged out
                cam.on = false;
                this._onCameraUsageChanged.dispatchEvent({ on: false });
                cam.supported = false;  //make sure no error occurs on further usage
            }
        },
        _stopStream: function () {
            var video = this._cameraVideo;
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
        },
        //_streamEndedHandler: function (e) {
        //    //TODO
        //},
        _initCamera: function (reinit) {
            var cam = this._cam;
            if (!cam.supported || (cam.inUse && !reinit))
                return; //already initialized

            cam.inUse = true;
            cam.supported = false;  //make sure firefox makes onSuccess call
            var onSuccess = function (stream) {
                this._cam.supported = true;
                this._getMediaDevices();    //getting names as well (permissions granted)

                this._initStream(stream);
            }.bind(this),
            onError = function (error) {
                //supported already set to false if an error occurs
                if (!this._cam.initialized)
                    this._onInit.dispatchEvent();
            }.bind(this);

            if (cam.mediaDevices.supported)
                navigator.mediaDevices.getUserMedia(cam.constraints).then(onSuccess).catch(onError);
            else
                this._getUserMedia(cam.constraints, onSuccess, onError);

            if (reinit || cam.initFaceDetection) {
                this._initFaceDetection();
                cam.initFaceDetection = false;
            }
        },
        _cameraInitializedHandler: function (e) {
            if (!this._cameraVideo.paused)
                return;
            if (this._startCameraStreamOnInit) {
                var video = this._cameraVideo;
                video.play();
                this._startCameraStreamOnInit = false;
                this._cam.on = true;
                //console.log(video.videoHeight + ', ' + video.videoWidth);
                //var orientation = window.orientation || 0;
                this._onCameraUsageChanged.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth, orientation: window.orientation || 0, transparency: this._cameraTransparency });
            }

            if (!this._cam.initialized)
                this._onInit.dispatchEvent();
        },
        _cameraOrientationHandler: function (e) {
            if (SmartJs.Device.isMobile && this._cam.on) {
                this._onCameraUsageChanged.dispatchEvent({ on: true, src: video, height: this._cameraVideo.videoHeight, width: this._cameraVideo.videoWidth, orientation: window.orientation || 0, transparency: this._cameraTransparency });
            }
        },
        setCameraInUse: function (cameraType) {
            //notifies device this cam is used/set during the project
            if (cameraType == PocketCode.CameraType.FRONT)
                this._cam.front.selected = true;
            else if (cameraType == PocketCode.CameraType.FRONT)
                this._cam.back.selected = true;
        },
        setCameraType: function (cameraType) {
            var found = false;
            for (var type in PocketCode.CameraType) {
                if (PocketCode.CameraType[type] == cameraType) {
                    found = true;
                    break;
                }
            }
            if (!found)
                throw new Error('invalid parameter: expected type \'cameraType\'');

            var cam = this._cam;
            if (cam.selected == cameraType)
                return false;

            cam.selected = cameraType;
            if (!cam.supported)
                return false;

            if (cam.MediaDevices.supported) {   //new constraints?
                //TODO: cam.constraints = {};
            }

            if (!cam.on)
                return false;

            //TODO: stop, change source restart?
            return true;
        },
        startCamera: function () {   //or resume
            var cam = this._cam;//,
            //supported = cam.supported;
            if (!cam.supported || cam.on)
                return false;

            var video = this._cameraVideo;
            if (this._cameraStream && video.paused) {
                this._cameraVideo.play();
                cam.on = true;
                this._onCameraUsageChanged.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth, orientation: window.orientation || 0, transparency: this._cameraTransparency });
            }
            else {
                this._startCameraStreamOnInit = true;
                this._initCamera();
                if (!cam.supported) //this may change during init
                    return false;
            }
            return true;
        },
        stopCamera: function () {
            this._initCamera();
            var cam = this._cam;
            if (!cam.supported || (!cam.on && !this._cameraStream))  //even if camera not started but stream available
                return;
            cam.on = false;
            this._cameraVideo.pause();
            this._onCameraUsageChanged.dispatchEvent({ on: false });
        },

        //face detection
        _initFaceDetection: function () {
            var fd = this._features.FACE_DETECTION;
            if (!fd.supported || fd.inUse)
                return; //not supported or already initialized

            if (!this._cam.inUse) {
                this._cam.initFaceDetection = true; //init on camera init
                return;
            }

            fd.inUse = true;
            //init  //TODO


        },
        _faceDetectionCameraHandler: function (e) {
            //var tmp = { on: e.on, height: e.height, width: e.width, orientation: e.orientation };
            //console.log('TODO: ' + JSON.stringify(tmp));

            if (!e.on) {
                this._pauseFaceDetection();
                return;
            }


        },
        _startFaceDetection: function () {

        },
        _pauseFaceDetection: function () {

        },
        _resumeFaceDetection: function () {

        },
        dispose: function () {
            this.stopCamera();
            this._stopStream();
            this._removeDomListener(this._cameraVideo, 'loadedmetadata', this._cameraInitializedListener);
            this._removeDomListener(window, 'orientationchange', this._cameraOrientationListener);

            this._onCameraUsageChanged.removeEventListener(new SmartJs.Event.EventListener(this._faceDetectionCameraHandler, this));

            PocketCode.Device.prototype.dispose.call(this);
        },
    });

    return MediaDevice;
})();

PocketCode.DeviceEmulator = (function () {
    DeviceEmulator.extends(PocketCode.MediaDevice, false);

    function DeviceEmulator(soundManager) {
        PocketCode.MediaDevice.call(this, soundManager);

        this._features.INCLINATION.supported = true;
        this._defaultInclination = {
            X: 0.0,
            Y: 0.0,
        };
        this._inclinationLimits = {
            X_MIN: -36.0, //-90,
            X_MAX: 36.0, //90,
            Y_MIN: -36.0, //-90,
            Y_MAX: 36.0, //90,
        };
        this._inclinationIncr = {
            X: 6.0, //10,
            Y: 6.0, //10
        };
        this._inclinationTimerDuration = 200;

        // Arrow Keys 
        this._keyCode = {
            LEFT: 37,
            RIGHT: 39,
            UP: 38,
            DOWN: 40,
            SPACE: 32,
        };

        // Alternative Keys
        this._alternativeKeyCode = {
            LEFT: 188, // ,
            RIGHT: 189, // -
            UP: 192,  // .
            DOWN: 190, // oe
            SPACE: 32,
        };

        //key down
        this._keyPress = {
            LEFT: false,
            RIGHT: false,
            UP: false,
            DOWN: false,
            SPACE: false,
        };

        //key down time
        this._keyDownTime = {
            LEFT: 0.0,
            RIGHT: 0.0,
            UP: 0.0,
            DOWN: 0.0,
        };

        this._keyDownTimeDefault = 3;

        this._resetInclinationX();
        this._resetInclinationY();

        //this._keyDownListener = this._addDomListener(document, 'keydown', this._keyDown);
        //this._keyUpListener = this._addDomListener(document, 'keyup', this._keyUp);
        //this._inclinationTimer = window.setInterval(this._inclinationTimerTick.bind(this), this._inclinationTimerDuration);
    }

    //properties
    Object.defineProperties(DeviceEmulator.prototype, {
        inclinationX: {
            get: function () {
                this._features.INCLINATION.inUse = true;
                if (!this._inclinationTimer) {  //init on use
                    this._keyDownListener = this._addDomListener(document, 'keydown', this._keyDown);
                    this._keyUpListener = this._addDomListener(document, 'keyup', this._keyUp);
                    this._inclinationTimer = window.setInterval(this._inclinationTimerTick.bind(this), this._inclinationTimerDuration);
                }
                return this._sensorData.X_INCLINATION;
            },
        },
        inclinationY: {
            get: function () {
                this._features.INCLINATION.inUse = true;
                if (!this._inclinationTimer) {  //init on use
                    this._keyDownListener = this._addDomListener(document, 'keydown', this._keyDown);
                    this._keyUpListener = this._addDomListener(document, 'keyup', this._keyUp);
                    this._inclinationTimer = window.setInterval(this._inclinationTimerTick.bind(this), this._inclinationTimerDuration);
                }
                return this._sensorData.Y_INCLINATION;
            },
        },
    });

    //methods
    DeviceEmulator.prototype.merge({
        _keyDown: function (e) {
            switch (e.keyCode) {
                case this._alternativeKeyCode.LEFT:
                case this._keyCode.LEFT:
                    this._keyDownTime.LEFT = this._keyDownTimeDefault;
                    this._keyPress.LEFT = true;
                    break;
                case this._alternativeKeyCode.RIGHT:
                case this._keyCode.RIGHT:
                    this._keyDownTime.RIGHT = this._keyDownTimeDefault;
                    this._keyPress.RIGHT = true;
                    break;
                case this._alternativeKeyCode.UP:
                case this._keyCode.UP:
                    this._keyDownTime.UP = this._keyDownTimeDefault;
                    this._keyPress.UP = true;
                    break;
                case this._alternativeKeyCode.DOWN:
                case this._keyCode.DOWN:
                    this._keyDownTime.DOWN = this._keyDownTimeDefault;
                    this._keyPress.DOWN = true;
                    break;
                case this._alternativeKeyCode.SPACE:
                case this._keyCode.SPACE:
                    if (this._keyPress.SPACE)
                        break;
                    this._keyPress.SPACE = true;
                    this._onSpaceKeyDown.dispatchEvent();
                    break;
            }
        },
        _keyUp: function (e) {
            switch (e.keyCode) {
                case this._alternativeKeyCode.LEFT:
                case this._keyCode.LEFT:
                    this._keyPress.LEFT = false;
                    if (!this._keyPress.RIGHT)
                        this._resetInclinationX();
                    break;
                case this._alternativeKeyCode.RIGHT:
                case this._keyCode.RIGHT:
                    this._keyPress.RIGHT = false;
                    if (!this._keyPress.LEFT)
                        this._resetInclinationX();
                    break;
                case this._alternativeKeyCode.UP:
                case this._keyCode.UP:
                    this._keyPress.UP = false;
                    if (!this._keyPress.DOWN)
                        this._resetInclinationY();
                    break;
                case this._alternativeKeyCode.DOWN:
                case this._keyCode.DOWN:
                    this._keyPress.DOWN = false;
                    if (!this._keyPress.UP)
                        this._resetInclinationY();
                    break;
                case this._alternativeKeyCode.SPACE:
                case this._keyCode.SPACE:
                    this._keyPress.SPACE = false;
                    break;
            }
        },
        _resetInclinationX: function () {
            this._sensorData.X_INCLINATION = this._defaultInclination.X;
        },
        _resetInclinationY: function () {
            this._sensorData.Y_INCLINATION = this._defaultInclination.Y;
        },
        _inclinationTimerTick: function () {
            if (this._disposed)
                return;
            if (this._keyPress.LEFT && !this._keyPress.RIGHT) {
                // left
                this._keyDownTime.LEFT += 1.0;
                this._sensorData.X_INCLINATION += this._inclinationIncr.X;
                if (this._sensorData.X_INCLINATION > this._inclinationLimits.X_MAX)
                    this._sensorData.X_INCLINATION = this._inclinationLimits.X_MAX;
            }
            else if (this._keyPress.RIGHT && !this._keyPress.LEFT) {
                // right
                this._keyDownTime.RIGHT += 1.0;
                this._sensorData.X_INCLINATION -= this._inclinationIncr.X;
                if (this._sensorData.X_INCLINATION < this._inclinationLimits.X_MIN)
                    this._sensorData.X_INCLINATION = this._inclinationLimits.X_MIN;
            }
            if (this._keyPress.UP && !this._keyPress.DOWN) {
                // up
                this._keyDownTime.UP += 1.0;
                this._sensorData.Y_INCLINATION -= this._inclinationIncr.Y;
                if (this._sensorData.Y_INCLINATION < this._inclinationLimits.Y_MIN)
                    this._sensorData.Y_INCLINATION = this._inclinationLimits.Y_MIN;
            }
            else if (!this._keyPress.UP && this._keyPress.DOWN) {
                // down
                this._keyDownTime.DOWN += 1.0;
                this._sensorData.Y_INCLINATION += this._inclinationIncr.Y;
                if (this._sensorData.Y_INCLINATION > this._inclinationLimits.Y_MAX)
                    this._sensorData.Y_INCLINATION = this._inclinationLimits.Y_MAX;
            }
        },
        /* override */
        _getGeoLocationData: function () {
            this._features.GEO_LOCATION.inUse = true;

            if (this._features.GEO_LOCATION.supported && !this._geoLocationData.INITIALIZED)    //we only request the geoLocation once on desktop
                navigator.geolocation.getCurrentPosition(
                    function (position) {   //success handler
                        var coords = position.coords;
                        this._geoLocationData = {
                            INITIALIZED: true,
                            LATITUDE: coords.latitude,
                            LONGITUDE: coords.longitude,
                            ALTITUDE: coords.altitude,  //already in meters
                            ACCURACY: coords.accuracy,  //already in meters
                        };
                    },
                    function () {   //error handler
                        if (/*window.location.host != 'localhost' && */window.location.protocol != "https:")
                            this._features.GEO_LOCATION.supported = false;  //chrome only allows access over http
                    }
                );
        },
        /* override */
        dispose: function () {
            window.clearInterval(this._inclinationTimer);
            if (this._keyDownListener)
                this._removeDomListener(document, 'keydown', this._keyDownListener);
            if (this._keyUpListener)
                this._removeDomListener(document, 'keyup', this._keyUpListener);

            PocketCode.MediaDevice.prototype.dispose.call(this);    //call super()
        },
    });

    return DeviceEmulator;
})();
