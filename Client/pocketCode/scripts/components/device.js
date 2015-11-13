/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Device = (function () {
    Device.extends(SmartJs.Core.EventTarget);

    function Device(soundManager) {
		console.log("Device constructor");
        this._soundMgr = soundManager;

        this._flashlightOn = false;
        this.sensorEmulation = false;

        this.isMobile = SmartJs.Device.isMobile;
        this.isTouch = SmartJs.Device.isTouch;

        //events
        //this._onSupportChange = new SmartJs.Event.Event(this);  //this event is triggered if a sensor is used that is not supported

        //init state variables: http://www.html5rocks.com/en/tutorials/device/orientation/
        this._compass = null;
        this._alpha = null;
        this._beta = null;
        this._gamma = null;

        this._x = null;
        this._y = null;
        this._z = null;

        this._windowOrientation = 0;
        this._rotationRate = null;

        //Event Handler for Initialisation
        this._initDeviceOrientationHandler = null;
        this._initDeviceMotionHandler = null;

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
            X_ACCELERATION: 0,  //we make sure no null-values are returned as this may break our formula calculations
            Y_ACCELERATION: 0,
            Z_ACCELERATION: 0,
            COMPASS_DIRECTION: 0,
            X_INCLINATION: 0,
            Y_INCLINATION: 0,
            X_ROTATION_RATE: 0,
            Y_ROTATION_RATE: 0,
            //LOUDNESS: 0
        };

        //bind events
        if (window.DeviceOrientationEvent) {
            this._initDeviceOrientationHandler = this._addDomListener(window, 'deviceorientation', this._deviceorientationChangeHandler);
            //console.log("add device orientation Handler");
        }
        else {
            //console.log("DeviceOrientationEvent not supported");
        }
        if (window.DeviceMotionEvent) {
            this._initDeviceMotionHandler = this._addDomListener(window, 'devicemotion', this._devicemotionChangeHandler);
        }
        if (!isNaN(window.orientation)) {
            this._addDomListener(window, 'orientationchange', this._orientationChangeHandler);
            this._windowOrientation = window.orientation;
        }
        else {
            //console.log("window orientation not supported!");
        }
    }

    //properties
    Object.defineProperties(Device.prototype, {
        unsupportedFeatureDetected: {
            value: false,
            writable: true,
        },
        unsupportedFeatureInfo: {
            value: {
                sensor: false, //true = not supported
            },
            writable: true,
        },
        accelerationX: {
            get: function () {
                if (this._sensorSupport.X_ACCELERATION) {
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

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.X_ACCELERATION;
            },
        },
        accelerationY: {
            get: function () {
                if (this._sensorSupport.Y_ACCELERATION) {
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

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.Y_ACCELERATION;
            },
        },
        accelerationZ: {
            get: function () {
                if (this._sensorSupport.Z_ACCELERATION)
                    return this._z; // z is orientation independent.

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.Z_ACCELERATION;
            },
        },
        compassDirection: {
            get: function () {
                if (this._sensorSupport.COMPASS_DIRECTION)
                    return this._compass;   //wrong + todo: compass initialization needed?

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.COMPASS_DIRECTION;
            },
        },
        inclinationX: {
            get: function () {
                if (this._sensorSupport.X_INCLINATION) {
                    return this._getInclinationX(this._beta, this._gamma);
                }

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.X_INCLINATION;
            },
        },
        inclinationY: {
            get: function () {
                if (this._sensorSupport.Y_INCLINATION) {
                    return this._getInclinationY(this._beta, this._gamma);
                }

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.Y_INCLINATION;
            },
        },
        rotationRateX: {
            get: function () {
                if (this._sensorSupport.X_INCLINATION && this._rotationRate) {
                    return this._getInclinationX(this._rotationRate.beta, this._rotationRate.gamma);
                }

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.X_ROTATION_RATE;
            },
        },
        rotationRateY: {
            get: function () {
                if (this._sensorSupport.Y_INCLINATION && this._rotationRate) {
                    return this._getInclinationY(this._rotationRate.beta, this._rotationRate.gamma);
                }

                this.unsupportedFeatureDetected = true;
                this.unsupportedFeatureInfo.sensor = true;
                return this._sensorEmulatedData.Y_ROTATION_RATE;
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
                return this._flashlightOn;
            },
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid parameter: expected type \'boolean\'');

                this._flashlightOn = value;

                //TODO: https://developer.mozilla.org/en-US/docs/Web/API/CameraControl/flashMode
            }
        },
    });

    //events

    //methods
    Device.prototype.merge({
        _getInclinationX: function (beta, gamma) {
            var x;
            if (this._windowOrientation == 0 || this._windowOrientation == -180) {
                x = gamma;
                //if(beta > 90)
                //	x = x * -1;
            }
            else {
                x = beta;
            }
            if (this._windowOrientation >= 0)  // = to be consistent with Catroid
                return x * -1;
            return x;
        },
        _getInclinationY: function (beta, gamma) {
            var y;
            if (this._windowOrientation == 0 || this._windowOrientation == -180) {
                y = beta;
            }
            else
                y = gamma;
            if (this._windowOrientation > 0)
                return y * -1;
            return y;
        },
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

            if (this._initDeviceOrientationHandler) {
                if (this._gamma != null || this._alpha != null || this._beta != null) { //checks if there is sensor data if not sensors are not supported
                    this._sensorSupport.COMPASS_DIRECTION = true;
                    this._sensorSupport.X_INCLINATION = true;
                    this._sensorSupport.Y_INCLINATION = true;
                }
                this._removeDomListener(window, 'orientationchange', this._initDeviceOrientationHandler);
                //console.log("remove device orientation Handler");
                this._initDeviceOrientationHandler = null;
            }
        },
        _orientationChangeHandler: function () {
            this._windowOrientation = window.orientation;
        },
        _devicemotionChangeHandler: function (e) {

            if (this._initDeviceMotionHandler) {
                this._removeDomListener(window, 'devicemotion', this._initDeviceMotionHandler);
                this._initDeviceMotionHandler = null;
                this._sensorSupport.X_ACCELERATION = true;
                this._sensorSupport.Y_ACCELERATION = true;
                this._sensorSupport.Z_ACCELERATION = true;
            }
            if (e.acceleration) {   //choose linear acceleration by default (conform andriod app)
                this._x = e.acceleration.x;
                this._y = e.acceleration.y;
                this._z = e.acceleration.z;
            }
            else if (e.accelerationIncludingGravity) {
                this._x = e.accelerationIncludingGravity.x;
                this._y = e.accelerationIncludingGravity.y;0
                this._z = e.accelerationIncludingGravity.z;
            }

            this._rotationRate = e.rotationRate;
        },
        setSensorInUse: function (sensor) {
            if (this._sensorSupport[sensor]) {
                var supported = this._sensorSupport[sensor];
                if (!supported && !this.sensorEmulation) {
                    this.sensorEmulation = true;
                    //this._onSupportChange.dispatchEvent();
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

PocketCode.DeviceEmulatior = (function() {
	DeviceEmulatior.extends(PocketCode.Device);
	
	function DeviceEmulatior(soundManager) {
		this._defaultInclination = {
			X: 0,
			Y: 0
		};
		this._inclinationLimits = {
			X_MIN: -90,
			X_MAX: 90,
			Y_MIN: -90,
			Y_MAX: 90
		};
		this._inclinationIncr = {
			X: 15,
			Y: 15
		};
		this.inclinationTimer = 100;
		
		// Arrow Keys 
		this._keyCode = {
			LEFT: 37,
			RIGHT: 39,
			UP: 38,
			DOWN: 40
		};
		
		/* Alternative Keys
		this._keyCode = {
			LEFT: 188, // ,
			RIGHT: 189, // -
			UP: 192,  // .
			DOWN: 190 // ö
		};*/
		
		//key down
        this._keyPress = {
            LEFT: false,
            RIGHT: false,
            UP: false,
			DOWN: false
		};
		
		this._resetInclinationX();
		this._resetInclinationY();
        this._addDomListener(window, 'keydown', this._keyDown);
		this._addDomListener(window, 'keyup', this._keyUp);
		
		setInterval(
			(function(self) {         //Self-executing func which takes 'this' as self
				return function() {   //Return a function in the context of 'self'
					self._inclinationTimerTick(); //Thing you wanted to run as non-window 'this'
				}
			})(this), this.inclinationTimer     //normal interval, 'this' scope not impacted here.
		); 
	}
	//properties
	
	//methods
    DeviceEmulatior.prototype.merge({
        _keyDown: function (e) {
			switch(e.keyCode)
			{
				case this._keyCode.LEFT:
					this._keyPress.LEFT = true;
					break;
				case this._keyCode.RIGHT:
					this._keyPress.RIGHT = true;
					break;
				case this._keyCode.UP:
					this._keyPress.UP = true;
					break;
				case this._keyCode.DOWN:
					this._keyPress.DOWN = true;
					break;
			}
        },
		_keyUp: function (e) {
			switch(e.keyCode)
			{
				case this._keyCode.LEFT:
					this._keyPress.LEFT = false;
					if(!this._keyPress.RIGHT)
						this._resetInclinationX();
					break;
				case this._keyCode.RIGHT:
					this._keyPress.RIGHT = false;
					if(!this._keyPress.LEFT)
						this._resetInclinationX();
					break;
				case this._keyCode.UP:
					this._keyPress.UP = false;
					if(!this._keyPress.DOWN)
						this._resetInclinationY();
					break;
				case this._keyCode.DOWN:
					this._keyPress.DOWN = false;
					if(!this._keyPress.UP)
						this._resetInclinationY();
					break;
			}
        },
		_resetInclinationX: function() {
			this._sensorEmulatedData.X_INCLINATION = this._defaultInclination.X;
		},
		_resetInclinationY: function() {
			this._sensorEmulatedData.Y_INCLINATION = this._defaultInclination.Y;
		},
		_inclinationTimerTick: function() {
			if(this._keyPress.LEFT && !this._keyPress.RIGHT) {
				// left
				this._sensorEmulatedData.X_INCLINATION += this._inclinationIncr.X;
				if(this._sensorEmulatedData.X_INCLINATION > this._inclinationLimits.X_MAX)
					this._sensorEmulatedData.X_INCLINATION = this._inclinationLimits.X_MAX;
			}
			else if(this._keyPress.RIGHT && !this._keyPress.LEFT) {
				// right
				this._sensorEmulatedData.X_INCLINATION -= this._inclinationIncr.X;
				if(this._sensorEmulatedData.X_INCLINATION < this._inclinationLimits.X_MIN)
					this._sensorEmulatedData.X_INCLINATION = this._inclinationLimits.X_MIN;
			}
			if(this._keyPress.UP && !this._keyPress.DOWN) {
				// up
				this._sensorEmulatedData.Y_INCLINATION += this._inclinationIncr.Y;
				if(this._sensorEmulatedData.Y_INCLINATION > this._inclinationLimits.Y_MAX)
					this._sensorEmulatedData.Y_INCLINATION = this._inclinationLimits.Y_MAX;

			}
			else if(!this._keyPress.UP && this._keyPress.DOWN) {
				// down
				this._sensorEmulatedData.Y_INCLINATION -= this._inclinationIncr.Y;
					if(this._sensorEmulatedData.Y_INCLINATION < this._inclinationLimits.Y_MIN)
				this._sensorEmulatedData.Y_INCLINATION = this._inclinationLimits.Y_MIN;
			}
		}
	});
	return DeviceEmulatior;
})();
