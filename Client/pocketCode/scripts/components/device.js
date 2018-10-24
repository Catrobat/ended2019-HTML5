/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="soundManager.js" />
'use strict';

PocketCode.Device = (function () {
    Device.extends(SmartJs.Core.EventTarget);

    function Device() {
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
                initialized: false,
            },
            COMPASS: {
                i18nKey: 'lblDeviceCompass',
                inUse: false,
                supported: false,
                initialized: false,
            },
            INCLINATION: {
                i18nKey: 'lblDeviceInclination',
                inUse: false,
                supported: false,
                initialized: false,
            },
            FLASH: {
                i18nKey: 'lblDeviceFlash',
                inUse: false,
                supported: false,
            },
            VIBRATE: new PocketCode.DeviceVibration(),
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
                supported: false,
                initialized: false,
            },
        };

        //attach device feature handler
        this._features.VIBRATE.onInactive.addEventListener(new SmartJs.Event.EventListener(this._featureInactiveHandler, this));

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
            navigatorSupport: false,
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
        if (window.hasOwnProperty('orientation')) {
            if (window.hasOwnProperty('DeviceOrientationEvent'))
                this._initDeviceOrientationListener = this._addDomListener(window, 'deviceorientation', this._initDeviceOrientationHandler);

            if (window.hasOwnProperty('DeviceMotionEvent'))
                this._initDeviceMotionListener = this._addDomListener(window, 'devicemotion', this._initDeviceMotionHandler);

            this._orientationChangeListener = this._addDomListener(window, 'orientationchange', this._orientationChangeHandler);
            this._windowOrientation = ((window.orientation!==undefined)?window.orientation:((window.screen!==undefined)?window.screen.orientation.angle:undefined));
        }
        else {  //initialized but no supported
            var features = this._features;
            features.ACCELERATION.initialized = true;
            features.COMPASS.initialized = true;
            features.INCLINATION.initialized = true;
        }

        //events
        this._onInit = new SmartJs.Event.Event(this);
        this._onInactive = new SmartJs.Event.Event(this);
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
        onInactive: {   //used for onExecuted event
            get: function () {
                return this._onInactive;
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
                var features = this._features;
                for (var f in features)
                    if (features[f].inUse && features[f].initialized == false)
                        return false;
                return true;
            },
        },
        hasActiveFeatures: {
            get: function () {
                var features = this._features;
                for (var f in features) {
                    if (features[f].isActive)
                        return true;
                }
                return false;
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
        viewState: {    //used for pause/resume scene
            get: function () {
                var features = this._features,
                    viewState = {},
                    featureVS;
                for (var p in features) {
                    featureVS = features[p].viewState;
                    if (featureVS)  //do not generate undefined properties
                        viewState[p] = features[p].viewState;
                }
                return viewState;
            },
            set: function (viewState) {
                var features = this._features;
                for (var p in viewState)
                    features[p].viewState = viewState[p];
                return viewState;
            },
        },

        //sensors
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
        _featureInitializedHandler: function (e) {  //note: reused by derived classes
            if (this.initialized)
                this._onInit.dispatchEvent();
        },
        _featureInactiveHandler: function (e) {  //note: reused by derived classes
            if (!this.hasActiveFeatures)
                this._onInactive.dispatchEvent();
        },
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
                    this._features.COMPASS.initialized = true;
                    this._features.COMPASS.supported = true;
                    this._features.INCLINATION.initialized = true;
                    this._features.INCLINATION.supported = true;

                    this._featureInitializedHandler();  //check if device initialized completly
                }
            }
        },
        _initDeviceMotionHandler: function (e) {
            if (this._initDeviceMotionListener) {
                this._removeDomListener(window, 'devicemotion', this._initDeviceMotionListener);
                delete this._initDeviceMotionListener;

                this._features.ACCELERATION.initialized = true;
                this._features.ACCELERATION.supported = true;

                this._featureInitializedHandler();  //check if device initialized completly
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
            this._windowOrientation = ((window.orientation!==undefined)?window.orientation:((window.screen!==undefined)?window.screen.orientation.angle:undefined));
        },
        //geo location
        _setGeoLocationInitialized: function () {
            var geo = this._features.GEO_LOCATION;
            if (geo.initialized)    //only set once
                return;
            geo.initialized = true;
            this._featureInitializedHandler();
        },
        _getGeoLocationData: function () {
            if (!this._features.GEO_LOCATION.inUse) {   //1st call: initialization
                this._features.GEO_LOCATION.inUse = true;
                //request IP lookup service
                var req = new PocketCode.ServiceRequest(PocketCode.Services.GEO_LOCATION, SmartJs.RequestMethod.GET);
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._geoServiceLoadHandler, this));
                req.onError.addEventListener(new SmartJs.Event.EventListener(this._geoServiceErrorHandler, this));
                PocketCode.Proxy.send(req);
            }
            else if (this.isMobile && this._geoLocationData.navigatorSupport) {   //update positions on mobile devices (in the background)
                this._geoLocationData.navigatorSupport = false; //avoid simutaneous calls and stops if popups are triggered and declined
                this._requestGeoNavigator();
            }
        },
        _geoServiceLoadHandler: function (response) {
            this._features.GEO_LOCATION.supported = true;

            var coords = response.responseJson;
            this._geoLocationData.merge({
                latitude: coords.latitude || 0,
                longitude: coords.longitude || 0,
                altitude: coords.altitude || 0,  //already in meters
                accuracy: coords.accuracy || 0  //already in meters
            });

            //try to fetch navigator data
            if (!this._requestGeoNavigator())
                this._setGeoLocationInitialized();
        },
        _geoServiceErrorHandler: function () {
            //try to fetch navigator data
            if (!this._requestGeoNavigator())
                this._setGeoLocationInitialized();
        },
        _requestGeoNavigator: function () {
            if (!navigator.geolocation)
                return false;

            navigator.geolocation.getCurrentPosition(
                this._geoNavigatorLoadHandler.bind(this),
                this._geoNavigatorErrorHandler.bind(this),
                {
                    //maximumAge:Infinity,
                    timeout: 12000,
                    //enableHighAccuracy:true
                }
            );
            return true;
        },
        _geoNavigatorLoadHandler: function (position) {
            this._features.GEO_LOCATION.supported = true;

            var coords = position.coords;
            this._geoLocationData.merge({
                navigatorSupport: true,
                latitude: coords.latitude || 0,
                longitude: coords.longitude || 0,
                altitude: coords.altitude || 0,  //already in meters
                accuracy: coords.accuracy || 0  //already in meters
            });

            this._setGeoLocationInitialized();
        },
        _geoNavigatorErrorHandler: function (error) {
            this._setGeoLocationInitialized();
        },
        vibrate: function (duration) {
            return this._features.VIBRATE.start(duration);
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
                    if (!e)
                        return;
                    e.x = x;
                    e.y = y;
                    break;
                case PocketCode.UserActionType.TOUCH_END:
                    var e = this._touchEvents.active[id];
                    if (!e)
                        return;
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

        pauseFeatures: function () {
            this._features.VIBRATE.pause();
        },
        resumeFeatures: function () {
            this._features.VIBRATE.resume();
        },
        reset: function () {
            //clear touch history
            this._touchEvents = {
                active: {},
                history: [],
            };
            //features
            this._features.VIBRATE.reset();
        },
        /* override */
        dispose: function () {
            //dispose features (stop them)
            for (var f in this._features)
                if (this._features[f].dispose)
                    this._features[f].dispose();

            if (this._initDeviceOrientationListener)
                this._removeDomListener(window, 'deviceorientation', this._initDeviceOrientationListener);
            if (this._initDeviceMotionListener)
                this._removeDomListener(window, 'devicemotion', this._initDeviceMotionListener);
            if (this._orientationChangeListener)
                this._removeDomListener(window, 'orientationchange', this._orientationChangeListener);

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

    function MediaDevice() {
        PocketCode.Device.call(this);

        //camera
        this._features.CAMERA = new PocketCode.Camera();
        this._cam = this._features.CAMERA;  //shortcut
        this._cam.onInit.addEventListener(new SmartJs.Event.EventListener(this._featureInitializedHandler, this));
        this._cam.onChange.addEventListener(new SmartJs.Event.EventListener(this._cameraChangeHandler, this));
        this._camStatus = { on: false };

        this._cameraTransparency = 50.0;    //default

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
    });

    //methods
    MediaDevice.prototype.merge({
        _orientationHandler: function (e) {
            if (this.isMobile)
                this._cameraChangeHandler();
        },
        _cameraChangeHandler: function (e) {
            e = e || this._camStatus;
            e.merge({ orientation: ((window.orientation!==undefined)?window.orientation:((window.screen!==undefined)?window.screen.orientation.angle:undefined)) || 0, transparency: this._cameraTransparency });
            this._camStatus = e;
            /**  if (e.on && e.width && e.height && e.src)
             this._fd.start(e.src, e.width, e.height, e.orientation);
             else
             this._fd.stop(); **/
            this._onCameraChange.dispatchEvent(e);
        },
        /* override */
        pauseFeatures: function () {
            this._fd.stop();
            this._cam.pause();

            PocketCode.Device.prototype.pauseFeatures.call(this);   //call super()
        },
        resumeFeatures: function () {
            this._cam.resume();
            var e = this._camStatus;
            this._fd.start(e.src, e.width, e.height, e.orientation);

            PocketCode.Device.prototype.resumeFeatures.call(this);   //call super()
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
            //        this._onCameraChange.dispatchEvent({ on: true, src: video, height: video.videoHeight, width: video.videoWidth, orientation: ((window.orientation!==undefined)?window.orientation:((window.screen!==undefined)?window.screen.orientation.angle:undefined)) || 0, transparency: this._cameraTransparency });
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
                this._onCameraChange.dispatchEvent({
                    on: true,
                    src: video,
                    height: video.videoHeight,
                    width: video.videoWidth,
                    orientation: ((window.orientation!==undefined)?window.orientation:((window.screen!==undefined)?window.screen.orientation.angle:undefined)) || 0,
                    transparency: value
                });
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

            //clear object references (to avoid errors during dispose)
            this._fd = undefined;
            this._cam = undefined;

            //not necessary- disposing features handled in base class
            //this._fd.dispose();
            //this._fd = undefined;
            //this._cam.onInit.removeEventListener(new SmartJs.Event.EventListener(this._featureInitializedHandler, this));
            //this._cam.onChange.removeEventListener(new SmartJs.Event.EventListener(this._cameraChangeHandler, this));
            //this._cam.dispose();
            //this._cam = undefined;

            PocketCode.Device.prototype.dispose.call(this);
        },
    });

    return MediaDevice;
})();

PocketCode.DeviceEmulator = (function () {
    DeviceEmulator.extends(PocketCode.MediaDevice, false);

    function DeviceEmulator() {
        PocketCode.MediaDevice.call(this);

        this._features.INCLINATION.supported = true;
        //set defaults for sliders (ui configuration)
        this._inclinationMinMaxRange = {
            MIN: 1,
            MAX: 65,
            //DEFAULT: 65,
        };
        this.inclinationMinMax = 65;//this._inclinationMinMaxRange.DEFAULT;

        this._inclinationChangePerSecRange = {
            MIN: 1,
            MAX: 90,
            //DEFAULT: 46,
        };
        this.inclinationChangePerSec = 46;//this._inclinationChangePerSecRange.DEFAULT;

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

        //timestamps for inclination calculations are stored here
        this._keyDownDateTime = {
            LEFT: undefined,
            RIGHT: undefined,
            UP: undefined,
            DOWN: undefined,
        };
    }

    //properties
    Object.defineProperties(DeviceEmulator.prototype, {
        inclinationMinMaxRange: {
            get: function () {
                return this._inclinationMinMaxRange;
            }
        },
        inclinationMinMax: {   //TODO: setter only: also reset the current timestamps to avoid errors changing the slider and pressing keys at the same time
            value: 0,
            writable: true,
        },
        inclinationChangePerSecRange: {
            get: function () {
                return this._inclinationChangePerSecRange;
            }
        },
        inclinationChangePerSec: {  //TODO: setter online (like above)
            value: 0,
            writable: true,
        },
        inclinationX: {
            get: function () {
                if (!this._features.INCLINATION.inUse) {
                    this._features.INCLINATION.inUse = true;
                    this._keyDownListener = this._addDomListener(document, 'keydown', this._keyDown);
                    this._keyUpListener = this._addDomListener(document, 'keyup', this._keyUp);
                }

                var timestamp = this._keyDownDateTime;
                if (timestamp.LEFT && !timestamp.RIGHT) {
                    return Math.min((Date.now() - timestamp.LEFT) / 1000.0 * this.inclinationChangePerSec, this.inclinationMinMax);
                }
                else if (!timestamp.LEFT && timestamp.RIGHT) {
                    return Math.max((Date.now() - timestamp.RIGHT) / 1000.0 * -this.inclinationChangePerSec, -this.inclinationMinMax);
                }
                else if (timestamp.LEFT && timestamp.RIGHT) {
                    return Math.min(Math.max((timestamp.RIGHT - timestamp.LEFT) / 1000.0 * this.inclinationChangePerSec, -this.inclinationMinMax), this.inclinationMinMax);
                }
                return 0.0;
            },
        },
        inclinationY: {
            get: function () {
                if (!this._features.INCLINATION.inUse) {
                    this._features.INCLINATION.inUse = true;
                    this._keyDownListener = this._addDomListener(document, 'keydown', this._keyDown);
                    this._keyUpListener = this._addDomListener(document, 'keyup', this._keyUp);
                }

                var timestamp = this._keyDownDateTime;
                if (timestamp.UP && !timestamp.DOWN) {
                    return Math.max((Date.now() - timestamp.UP) / 1000.0 * -this.inclinationChangePerSec, -this.inclinationMinMax);
                }
                else if (!timestamp.UP && timestamp.DOWN) {
                    return Math.min((Date.now() - timestamp.DOWN) / 1000.0 * this.inclinationChangePerSec, this.inclinationMinMax);
                }
                else if (timestamp.UP && timestamp.DOWN) {
                    return Math.min(Math.max((timestamp.UP - timestamp.DOWN) / 1000.0 * this.inclinationChangePerSec, -this.inclinationMinMax), this.inclinationMinMax);
                }
                return 0.0;
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
            var timestamp = this._keyDownDateTime;
            switch (e.keyCode) {
                case this._alternativeKeyCode.LEFT:
                case this._keyCode.LEFT:
                    if (!timestamp.LEFT)    //event is triggered again as long as key is pressed
                        timestamp.LEFT = Date.now();
                    break;
                case this._alternativeKeyCode.RIGHT:
                case this._keyCode.RIGHT:
                    if (!timestamp.RIGHT)
                        timestamp.RIGHT = Date.now();
                    break;
                case this._alternativeKeyCode.UP:
                case this._keyCode.UP:
                    if (!timestamp.UP)
                        timestamp.UP = Date.now();
                    break;
                case this._alternativeKeyCode.DOWN:
                case this._keyCode.DOWN:
                    if (!timestamp.DOWN)
                        timestamp.DOWN = Date.now();
                    break;
                case this._alternativeKeyCode.SPACE:
                case this._keyCode.SPACE:
                    this._onSpaceKeyDown.dispatchEvent();
                    break;
            }
        },
        _keyUp: function (e) {
            var timestamp = this._keyDownDateTime;
            switch (e.keyCode) {
                case this._alternativeKeyCode.LEFT:
                case this._keyCode.LEFT:
                    if (timestamp.RIGHT)    //both keys were pressed
                        timestamp.RIGHT = Date.now() - Math.max(0, timestamp.LEFT - timestamp.RIGHT);
                    timestamp.LEFT = undefined;
                    break;
                case this._alternativeKeyCode.RIGHT:
                case this._keyCode.RIGHT:
                    if (timestamp.LEFT)
                        timestamp.LEFT = Date.now() - Math.max(0, timestamp.RIGHT - timestamp.LEFT);
                    timestamp.RIGHT = undefined;
                    break;
                case this._alternativeKeyCode.UP:
                case this._keyCode.UP:
                    if (timestamp.DOWN)
                        timestamp.DOWN = Date.now() - Math.max(0, timestamp.UP - timestamp.DOWN);
                    timestamp.UP = undefined;
                    break;
                case this._alternativeKeyCode.DOWN:
                case this._keyCode.DOWN:
                    if (timestamp.UP)
                        timestamp.UP = Date.now() - Math.max(0, timestamp.DOWN - timestamp.UP);
                    timestamp.DOWN = undefined;
                    break;
                    //case this._alternativeKeyCode.SPACE:
                    //case this._keyCode.SPACE:
                    //    break;
            }
        },
        _resetInclination: function () {
            this._keyDownDateTime = {
                LEFT: undefined,
                RIGHT: undefined,
                UP: undefined,
                DOWN: undefined,
            }
        },
        /* override */
        reset: function () {   //called at program-restart
            this._resetInclination();
            PocketCode.MediaDevice.prototype.reset.call(this);   //call super()
        },
        dispose: function () {
            if (this._keyDownListener)
                this._removeDomListener(document, 'keydown', this._keyDownListener);
            if (this._keyUpListener)
                this._removeDomListener(document, 'keyup', this._keyUpListener);

            PocketCode.MediaDevice.prototype.dispose.call(this);    //call super()
        },
    });

    return DeviceEmulator;
})();
