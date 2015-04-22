/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Device = (function () {
    Device.extends(SmartJs.Core.EventTarget);

    function Device(soundManager) {
        this._soundMgr = soundManager;

        this.sensorEmulation = false;

        this.isMobile = SmartJs.Device.isMobile;
        this.isTouch = SmartJs.Device.isTouch;

        //events
        this._onKeypress = new SmartJs.Event.Event(this);
        this._onSupportChange = new SmartJs.Event.Event(this);  //this event is triggered if a sensor is used that is not supported

        //init state variables: http://www.html5rocks.com/en/tutorials/device/orientation/
        this._compass = 0;
        this._alpha = 0;
        this._beta = 0;
        this._gamma = 0;

        this._x = 0;
        this._y = 0;
        this._z = 0;

        this._rotationRate = 0;

        //sensor support
        this._sensorSupport = {
            X_ACCELERATION: false,
            Y_ACCELERATION: false,
            Z_ACCELERATION: false,
            COMPASS_DIRECTION: false,
            X_INCLINATION: false,
            Y_INCLINATION: false,
            //LOUDNESS: false    //notify?
        };
        this._sensorEmulatedData = {
            X_ACCELERATION: 0,
            Y_ACCELERATION: 0,
            Z_ACCELERATION: 0,
            COMPASS_DIRECTION: 0,
            X_INCLINATION: 0,
            Y_INCLINATION: 0,
            //LOUDNESS: 0
        };

        //bind events
        if (window.DeviceOrientationEvent) {    //TODO: (Armend) this should not be executed on desktop -> it is on e.g. Firefox
            this._addDomListener(window, 'deviceorientation', this._deviceorientationChangeHandler);
            this._sensorSupport.COMPASS_DIRECTION = true;
            //TODO: (Armend) set supported sensons to true (like compass above)
        }
        if (window.DeviceMotionEvent) {    //TODO: (Armend) this should not be executed on desktop -> it is on e.g. Firefox
            this._addDomListener(window, 'devicemotion', this._devicemotionChangeHandler);
            //TODO: (Armend) set supported sensons
        }

    }

    //properties
    Object.defineProperties(Device.prototype, {
        accelerationX: {
            get: function () {
                if (this._sensorSupport.X_ACCELERATION)
                    return 0;   //TODO: (Armend) calculate return value based on alpha, beta, gamma, rotation, x, y, z
                return this._sensorEmulatedData.X_ACCELERATION;
            },
        },
        accelerationY: {
            get: function () {
                if (this._sensorSupport.Y_ACCELERATION)
                    return 0;   //TODO: (Armend) calculate return value based on alpha, beta, gamma, rotation, x, y, z
                return this._sensorEmulatedData.Y_ACCELERATION;
            },
        },
        accelerationZ: {
            get: function () {
                if (this._sensorSupport.Z_ACCELERATION)
                    return 0;   //TODO: (Armend) calculate return value based on alpha, beta, gamma, rotation, x, y, z
                return this._sensorEmulatedData.Z_ACCELERATION;
            },
        },
        compassDirection: {
            get: function () {
                if (this._sensorSupport.COMPASS_DIRECTION)
                    return this._compass;
                return this._sensorEmulatedData.COMPASS_DIRECTION;
            },
        },
        inclinationX: {
            get: function () {
                if (this._sensorSupport.X_INCLINATION)
                    return 0;   //TODO: (Armend) calculate return value based on alpha, beta, gamma, rotation, x, y, z
                return this._sensorEmulatedData.X_INCLINATION;
            },
        },
        inclinationY: {
            get: function () {
                if (this._sensorSupport.Y_INCLINATION)
                    return 0;   //TODO: (Armend) calculate return value based on alpha, beta, gamma, rotation, x, y, z
                return this._sensorEmulatedData.Y_INCLINATION;
            },
        },
        loudness: {
            get: function () {
                return this._soundMgr.volume;
            },
        },
        faceDetected: {
            get: function () {
                return false; //TODO: 
            },
        },
        faceSize: {
            get: function () {
                return 0; //TODO: 
            },
        },
        facePositionX: {
            get: function () {
                return 0; //TODO: 
            },
        },
        facePositionY: {
            get: function () {
                return 0; //TODO: 
            },
        },
        flashlightOn: {
            get: function () {
                return false; //TODO: 
            },
            set: function (on) {
                if (typeof on !== 'boolean')
                    throw new Error('invalid parameter: expected type \'boolean\'');

                //TODO: https://developer.mozilla.org/en-US/docs/Web/API/CameraControl/flashMode
            }
        },
    });

    //events
    Object.defineProperties(Device.prototype, {
        onKeypress: {
            get: function () { return this._onKeypress; },
            //enumerable: false,
            //configurable: true,
        },
        onSupportChange: {
            get: function () { return this._onSupportChange; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    Device.prototype.merge({
        _deviceorientationChangeHandler: function (e) {
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
        _devicemotionChangeHandler: function (e) {
            if (e.acceleration) {   //choose linear acceleration by default (conform andriod app)
                this._x = e.acceleration.x;
                this._y = e.acceleration.y;
                this._z = e.acceleration.z;
            }
            else if (e.accelerationIncludingGravity) {
                this._x = e.accelerationIncludingGravity.x;
                this._y = e.accelerationIncludingGravity.y;
                this._z = e.accelerationIncludingGravity.z;
            }
            this._rotationRate = e.rotationRate;
        },
        setSensorInUse: function (sensor) {
            if (this._sensorSupport[sensor]) {
                var supported = this._sensorSupport[sensor];
                if (!supported && !this.sensorEmulation) {
                    this.sensorEmulation = true;
                    this._onSupportChange.dispatchEvent();
                }
            }
            else    //unknown sensor
                throw new Error('device: unknown sensor: ' + sensor);
        },
        vibrate: function (duration) {
            var time = duration * 1000;
            return true;
            //TODO:
        }
    });

    return Device;
})();