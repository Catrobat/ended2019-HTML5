/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="soundManager.js" />
'use strict';

PocketCode.Device = (function () {
    Device.extends(SmartJs.Core.EventTarget);

    function Device(soundManager) {
        if (!(soundManager instanceof PocketCode.SoundManager))
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
                supported: false,   //temporarely disabled- missing functionality on pause/resume //!!(navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate),
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
                supported: false,   //temporarely disabled navigator.geolocation ? true : false,
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
            initialized: false,
            latitude: 0,
            longitude: 0,
            altitude: 0,
            accuracy: 0,
        };

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
        this._onInit = new SmartJs.Event.Event(this);
        this._onSpaceKeyDown = new SmartJs.Event.Event(this);
        //this._onSupportChange = new SmartJs.Event.Event(this);  //this event is triggered if a sensor is used that is not supported
    }

    //events
    Object.defineProperties(Device.prototype, {
        onInit: {   //used for onLoad event
            get: function () {
                return this._onInit;
            },
        },
        onSpaceKeyDown: {
            get: function () {
                return this._onSpaceKeyDown;
            },
        },
    });

    //properties
    Object.defineProperties(Device.prototype, {
        initialized: {
            get: function () {
                var geo = this._features.GEO_LOCATION;
                return (geo.supported && geo.inUse) ? this._geoLocationData.initialized : true;
            },
        },
        isMobile: {
            value: SmartJs.Device.isMobile,
        },
        isTouch: {
            value: SmartJs.Device.isTouch,
        },
        emulationInUse: {
            get: function () {
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
        //features: {
        //    get: function () {

        //    },
        //},
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
                return this._geoLocationData.latitude;
            },
        },
        geoLongitude: {
            get: function () {
                this._getGeoLocationData();
                return this._geoLocationData.longitude;
            },
        },
        geoAltitude: {
            get: function () {
                this._getGeoLocationData();
                return this._geoLocationData.altitude;
            },
        },
        geoAccuracy: {
            get: function () {
                this._getGeoLocationData();
                return this._geoLocationData.accuracy;
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
                            initialized: true,
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            altitude: coords.altitude,  //already in meters
                            accuracy: coords.accuracy,  //already in meters
                        };
                    }.bind(this),
                    function () {   //error handler
                        if (/*window.location.host != 'localhost' && */window.location.protocol != "https:")
                            this._features.GEO_LOCATION.supported = false;  //chrome only allows access over http
                    }.bind(this)
                );
        },
        vibrate: function (duration) {
            this._features.VIBRATE.inUse = true;
            if (!this._features.VIBRATE.supported || typeof duration != 'number' || duration == 0) //isNaN('') = false
                return false;

            //TODO: as soon as html supports this feature
            //var time = duration * 1000;
            if (navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate) {
                var vibrate = (navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate).bind(navigator);
                vibrate(duration * 1000);   //TODO: pause/resume

                return true;
            }
            return false;
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
        getLatestActiveTouchPosition: function () {
            var e,
                history = this._touchEvents.history,
                pos = {};
            if (Object.keys(this._touchEvents.active).length == 0)   //quick check
                return pos;

            for (var i = history.length - 1; i >= 0; i--) {
                if (history[i].active)
                    return history[i];
            }

            return pos;
        },
        isTouched: function (idx) {
            if (isNaN(idx))
                return false;
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

        pause: function () {
            //TODO: vibration
        },
        resume: function () {
            //TODO: vibration
        },
        reset: function () {
            //clear touch history
            this._touchEvents = {
                active: {},
                history: [],
            };
            //TODO: vibration
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

PocketCode.MediaDevice = (function () {
    MediaDevice.extends(PocketCode.Device, false);

    function MediaDevice(soundManager) {
        PocketCode.Device.call(this, soundManager);

        this._cameraTransparency = 50.0;    //default

        //camera
        this._features.CAMERA = new PocketCode.Camera();
        this._cam = this._features.CAMERA;  //shortcut
        this._cam.onInit.addEventListener(new SmartJs.Event.EventListener(this._featureInitializedHandler, this));
        this._cam.onChange.addEventListener(new SmartJs.Event.EventListener(this._cameraChangeHandler, this));
        this._camStatus = { on: false };

        this._orientationListener = this._addDomListener(window, 'orientationchange', this._orientationHandler);

        //face detection
        this._features.FACE_DETECTION = new PocketCode.FaceDetection(this, this._cam.video);
        this._fd = this._features.FACE_DETECTION;   //shortcut

        //this._initialized = this._cam.initialized && this._fd.initialized;  //this is true before features are set inUse!

        //events
        this._onCameraChange = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(MediaDevice.prototype, {
        onCameraChange: {
            get: function () {
                return this._onCameraChange;
            },
        },
    });

    //properties
    Object.defineProperties(MediaDevice.prototype, {
        faceDetected: {
            get: function () {
                return this._fd.faceDetected;
            },
        },
        faceSize: {
            get: function () {
                return this._fd.faceSize;
            },
        },
        facePositionX: {
            get: function () {
                return this._fd.facePositionX;
            },
        },
        facePositionY: {
            get: function () {
                return this._fd.facePositionY;
            },
        },
        /* override */
        initialized: {
            get: function () {
                var features = this._features;
                return ((!features.GEO_LOCATION.supported || !features.GEO_LOCATION.inUse || this._geoLocationData.initialized) &&
                    (!features.CAMERA.supported || !features.CAMERA.inUse || this._cam.initialized) &&
                    (!features.FACE_DETECTION.supported || !features.FACE_DETECTION.inUse || this._fd.initialized));
            },
        },
    });

    //methods
    MediaDevice.prototype.merge({
        _featureInitializedHandler: function (e) {
            //if (this._initialized)
            //    return;
            //this._initialized = this._cam.initialized && this._fd.initialized;
            if (this.initialized)
                this._onInit.dispatchEvent();
        },
        _orientationHandler: function (e) {
            if (this.isMobile)
                this._cameraChangeHandler();
        },
        _cameraChangeHandler: function (e) {
            e = e || this._camStatus;
            e.merge({ orientation: window.orientation || 0, transparency: this._cameraTransparency });
            this._camStatus = e;
            /**  if (e.on && e.width && e.height && e.src)
                  this._fd.start(e.src, e.width, e.height, e.orientation);
              else
                  this._fd.stop(); **/
            this._onCameraChange.dispatchEvent(e);
        },
        /* override */
        pause: function () {
            this._fd.stop();
            this._cam.pause();

            PocketCode.Device.prototype.pause.call(this);   //call super()
        },
        resume: function () {
            this._cam.resume();
            var e = this._camStatus;
            this._fd.start(e.src, e.width, e.height, e.orientation);

            PocketCode.Device.prototype.resume.call(this);   //call super()
        },
        reset: function () {   //called at program-restart
            //this._initialized = false;
            this._cameraTransparency = 50.0;    //default

            this._fd.stop();
            this._cam.reset();   //default

            PocketCode.Device.prototype.reset.call(this);   //call super()
        },

        //camera
        setSceneSize: function (width, height) { //TODO: set wehen scene gets loaded: try to set the camera contraints and reload the stream (reinit)
            //TODO: needed for position/size calculations for face detection too
            //needed to calculate camera rotation (portrait or landscape project)

            //    var video = this._cameraVideo;
            //    video.width = width;
            //    video.height = height;
            //    if (this._cam.on)
            //        this._onCameraChange.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth, orientation: window.orientation || 0, transparency: this._cameraTransparency });
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
                this._onCameraChange.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth, orientation: window.orientation || 0, transparency: value });
                return true;
            }
            return false;
        },
        setCameraInUse: function (cameraType) {
            //used for notification during loading without changing the selected cam
            this._cam.setInUse(cameraType);
        },
        setCameraType: function (cameraType) {
            return this._cam.setType(cameraType);
        },
        startCamera: function () {   //or resume
            var started = this._cam.start();
            //this._fd.start(); - will be started on update event
            return started;
        },
        stopCamera: function () {   //also called during parsing to set camera inUse
            //this._fd.stop(); - will be stopped on update event
            return this._cam.stop();
        },
        disableCamera: function () {    //set by user (dialog) if he/she doesn't want to use the camera
            this._cam.supported = false;    //override
            this._fd.supported = false;     //override
        },

        dispose: function () {
            this._removeDomListener(window, 'orientationchange', this._orientationListener);
            this._fd.dispose();
            this._cam.onInit.removeEventListener(new SmartJs.Event.EventListener(this._featureInitializedHandler, this));
            this._cam.onChange.removeEventListener(new SmartJs.Event.EventListener(this._cameraChangeHandler, this));
            this._cam.dispose();

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
            MIN: 1,
            MAX: 80,
            DEFAULT: 65,
        };
        this.degreeChangeValue = this._inclinationLimits.DEFAULT;

        this._accelerationLimits = {
            MIN: 1,
            MAX: 100,
            DEFAULT: 46,
        };
        this.accelerationChangeValue = this._accelerationLimits.DEFAULT;

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

        this._keyDownDateTime = {
            LEFT: 0,
            RIGHT: 0,
            UP: 0,
            DOWN: 0,
        };
        this._elapsedTime = {
            LEFT: 0,
            RIGHT: 0,
            UP: 0,
            DOWN: 0,
        };
        this._firstKeyDown = {
            LEFT: false,
            RIGHT: false,
            UP: false,
            DOWN: false,
        };

        this._inclinationIncrTmp = {
            X: 0.0,
            Y: 0.0,
        };

        this._resetInclinationX();
        this._resetInclinationY();

    }

    //properties
    Object.defineProperties(DeviceEmulator.prototype, {
        degreeChangeMin: {
            get: function () {
                return this._inclinationLimits.MIN;
            }
        },
        degreeChangeMax: {
            get: function () {
                return this._inclinationLimits.MAX;
            }
        },
        degreeChangeValue: {
            value: 0,
            writable: true,
        },
        accelerationChangeMin: {
            get: function () {
                return this._accelerationLimits.MIN;
            }
        },
        accelerationChangeMax: {
            get: function () {
                return this._accelerationLimits.MAX;
            }
        },
        accelerationChangeValue: {
            value: 0,
            writable: true,
        },
        inclinationX: {
            get: function () {
                if (!this._features.INCLINATION.inUse)
                {
                    this._features.INCLINATION.inUse = true;
                    this._keyDownListener = this._addDomListener(document, 'keydown', this._keyDown);
                    this._keyUpListener = this._addDomListener(document, 'keyup', this._keyUp);
                }
                this._updateInclination();

                return this._sensorData.X_INCLINATION;
            },
        },
        inclinationY: {
            get: function () {
                if (!this._features.INCLINATION.inUse)
                {
                    this._features.INCLINATION.inUse = true;
                    this._keyDownListener = this._addDomListener(document, 'keydown', this._keyDown);
                    this._keyUpListener = this._addDomListener(document, 'keyup', this._keyUp);
                }
                this._updateInclination();

                return this._sensorData.Y_INCLINATION;
            },
        },
        /* override */
        emulationInUse: {
            get: function () {
                if (this._features.INCLINATION.inUse)
                    return true;
                return false;
            },
        },
    });

    //methods
    DeviceEmulator.prototype.merge({
        _keyDown: function (e) {
            switch (e.keyCode) {
                case this._alternativeKeyCode.LEFT:
                case this._keyCode.LEFT:
                    if (!this._firstKeyDown.LEFT && !this._firstKeyDown.RIGHT)
                    {
                        this._firstKeyDown.LEFT = true;
                    }
                    if (this._keyPress.RIGHT && this._firstKeyDown.LEFT)
                    {
                        this._firstKeyDown.LEFT = false;
                        this._firstKeyDown.RIGHT = true;
                    }
                    if (!this._keyDownDateTime.LEFT)
                    {
                        this._keyDownDateTime.LEFT = Date.now();
                    }
                    this._keyPress.LEFT = true;
                    break;
                case this._alternativeKeyCode.RIGHT:
                case this._keyCode.RIGHT:
                    if (!this._firstKeyDown.LEFT && !this._firstKeyDown.RIGHT)
                    {
                        this._firstKeyDown.RIGHT = true;
                    }
                    if (this._keyPress.LEFT && this._firstKeyDown.RIGHT)
                    {
                        this._firstKeyDown.LEFT = true;
                        this._firstKeyDown.RIGHT = false;
                    }
                    if (!this._keyDownDateTime.RIGHT)
                    {
                        this._keyDownDateTime.RIGHT = Date.now();
                    }
                    this._keyPress.RIGHT = true;
                    break;
                case this._alternativeKeyCode.UP:
                case this._keyCode.UP:
                    if (!this._firstKeyDown.UP && !this._firstKeyDown.DOWN)
                    {
                        this._firstKeyDown.UP = true;
                    }
                    if (this._keyPress.DOWN && this._firstKeyDown.UP)
                    {
                        this._firstKeyDown.UP = false;
                        this._firstKeyDown.DOWN = true;
                    }
                    if (!this._keyDownDateTime.UP)
                    {
                        this._keyDownDateTime.UP = Date.now();
                    }
                    this._keyPress.UP = true;
                    break;
                case this._alternativeKeyCode.DOWN:
                case this._keyCode.DOWN:
                    if (!this._firstKeyDown.UP && !this._firstKeyDown.DOWN)
                    {
                        this._firstKeyDown.DOWN = true;
                    }
                    if (this._keyPress.UP && this._firstKeyDown.DOWN)
                    {
                        this._firstKeyDown.UP = true;
                        this._firstKeyDown.DOWN = false;
                    }
                    if (!this._keyDownDateTime.DOWN)
                    {
                        this._keyDownDateTime.DOWN = Date.now();
                    }
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
            this._calculateInclination();
        },
        _calculateInclination: function () {
            var inclinationDuration = this.degreeChangeValue / this.accelerationChangeValue;
            var inclinationPerStep = inclinationDuration / this.accelerationChangeValue;

            this._inclinationIncrTmp.X = inclinationDuration / inclinationPerStep;
            this._inclinationIncrTmp.Y = inclinationDuration / inclinationPerStep;
        },
        _keyUp: function (e) {
            switch (e.keyCode) {
                case this._alternativeKeyCode.LEFT:
                case this._keyCode.LEFT:
                    this._keyPress.LEFT = false;
                    if (this._firstKeyDown.LEFT)
                    {
                        this._firstKeyDown.LEFT = false;
                        this._resetInclinationX();
                        if (this._keyDownDateTime.RIGHT)
                            this._keyDownDateTime.RIGHT = Date.now() - Math.max(0, (this._keyDownDateTime.LEFT - this._keyDownDateTime.RIGHT));
                    }
                    if (!this._firstKeyDown.LEFT && this._keyDownDateTime.RIGHT)
                    {
                        this._keyDownDateTime.RIGHT = Date.now() - Math.max(0, (this._keyDownDateTime.LEFT - this._keyDownDateTime.RIGHT));
                    }
                    this._keyDownDateTime.LEFT = 0;
                    if (!this._keyPress.RIGHT)
                        this._resetInclinationX();
                    break;
                case this._alternativeKeyCode.RIGHT:
                case this._keyCode.RIGHT:
                    this._keyPress.RIGHT = false;
                    if (this._firstKeyDown.RIGHT)
                    {
                        this._firstKeyDown.RIGHT = false;
                        this._resetInclinationX();
                        if (this._keyDownDateTime.LEFT)
                            this._keyDownDateTime.LEFT = Date.now() - Math.max(0, (this._keyDownDateTime.RIGHT - this._keyDownDateTime.LEFT));
                    }
                    if (!this._firstKeyDown.RIGHT && this._keyDownDateTime.LEFT)
                    {
                        this._keyDownDateTime.LEFT = Date.now() - Math.max(0, (this._keyDownDateTime.RIGHT - this._keyDownDateTime.LEFT));
                    }
                    this._keyDownDateTime.RIGHT = 0;
                    if (!this._keyPress.LEFT)
                        this._resetInclinationX();
                    break;
                case this._alternativeKeyCode.UP:
                case this._keyCode.UP:
                    this._keyPress.UP = false;
                    if (this._firstKeyDown.UP)
                    {
                        this._firstKeyDown.UP = false;
                        this._resetInclinationY();
                        if (this._keyDownDateTime.DOWN)
                            this._keyDownDateTime.DOWN = Date.now() - Math.max(0, (this._keyDownDateTime.UP - this._keyDownDateTime.DOWN));
                    }
                    if (!this._firstKeyDown.UP && this._keyDownDateTime.DOWN)
                    {
                        this._keyDownDateTime.DOWN = Date.now() - Math.max(0, (this._keyDownDateTime.UP - this._keyDownDateTime.DOWN));
                    }
                    this._keyDownDateTime.UP = 0;
                    if (!this._keyPress.DOWN)
                        this._resetInclinationY();
                    break;
                case this._alternativeKeyCode.DOWN:
                case this._keyCode.DOWN:
                    this._keyPress.DOWN = false;
                    if (this._firstKeyDown.DOWN)
                    {
                        this._firstKeyDown.DOWN = false;
                        this._resetInclinationY();
                        if (this._keyDownDateTime.UP)
                            this._keyDownDateTime.UP = Date.now() - Math.max(0, (this._keyDownDateTime.DOWN - this._keyDownDateTime.UP));
                    }
                    if (!this._firstKeyDown.DOWN && this._keyDownDateTime.UP)
                    {
                        this._keyDownDateTime.UP = Date.now() - Math.max(0, (this._keyDownDateTime.DOWN - this._keyDownDateTime.UP));
                    }
                    this._keyDownDateTime.DOWN = 0;
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
        _updateInclination: function () {
            if (this._disposed)
                return;
            if (this._keyPress.LEFT && !this._keyPress.RIGHT) {
                // left
                this._elapsedTime.LEFT = (Date.now() - this._keyDownDateTime.LEFT) / 1000;
                var inclDateTimeLeft = this._inclinationIncrTmp.X * this._elapsedTime.LEFT;
                this._sensorData.X_INCLINATION += inclDateTimeLeft;
                if (this._sensorData.X_INCLINATION > this.degreeChangeValue)
                    this._sensorData.X_INCLINATION = this.degreeChangeValue;
            }
            else if (!this._keyPress.LEFT && this._keyPress.RIGHT) {
                // right
                this._elapsedTime.RIGHT = (Date.now() - this._keyDownDateTime.RIGHT) / 1000;
                var inclDateTimeRight = this._inclinationIncrTmp.X * this._elapsedTime.RIGHT;
                this._sensorData.X_INCLINATION -= inclDateTimeRight;
                if (this._sensorData.X_INCLINATION < this.degreeChangeValue * -1)
                    this._sensorData.X_INCLINATION = this.degreeChangeValue * -1;
            }
            if (this._keyPress.UP && !this._keyPress.DOWN) {
                // up
                this._elapsedTime.UP = (Date.now() - this._keyDownDateTime.UP) / 1000;
                var inclDateTimeUp = this._inclinationIncrTmp.Y * this._elapsedTime.UP;
                this._sensorData.Y_INCLINATION -= inclDateTimeUp;
                if (this._sensorData.Y_INCLINATION < this.degreeChangeValue * -1)
                    this._sensorData.Y_INCLINATION = this.degreeChangeValue * -1;
            }
            else if (!this._keyPress.UP && this._keyPress.DOWN) {
                // down
                this._elapsedTime.DOWN = (Date.now() - this._keyDownDateTime.DOWN) / 1000;
                var inclDateTimeDown = this._inclinationIncrTmp.Y * this._elapsedTime.DOWN;
                this._sensorData.Y_INCLINATION += inclDateTimeDown;
                if (this._sensorData.Y_INCLINATION > this.degreeChangeValue)
                    this._sensorData.Y_INCLINATION = this.degreeChangeValue;
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
                            initialized: true,
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            altitude: coords.altitude,  //already in meters
                            accuracy: coords.accuracy,  //already in meters
                        };
                    }.bind(this),
                    function () {   //error handler
                        if (/*window.location.host != 'localhost' && */window.location.protocol != "https:")
                            this._features.GEO_LOCATION.supported = false;  //chrome only allows access over http
                    }.bind(this)
                );
        },
        /* override */
        reset: function () {   //called at program-restart
            this._resetInclinationX();
            this._resetInclinationY();

            PocketCode.MediaDevice.prototype.reset.call(this);   //call super()
        },
        dispose: function () {
            //window.clearInterval(this._inclinationTimer);
            if (this._keyDownListener)
                this._removeDomListener(document, 'keydown', this._keyDownListener);
            if (this._keyUpListener)
                this._removeDomListener(document, 'keyup', this._keyUpListener);

            PocketCode.MediaDevice.prototype.dispose.call(this);    //call super()
        },
    });

    return DeviceEmulator;
})();
