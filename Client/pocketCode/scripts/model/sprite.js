/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/userVariableHost.js" />
/// <reference path="../components/renderingItem.js" />
/// <reference path="../model/scene.js" />
'use strict';

/**
 * RotationStyles
 * @type {{DO_NOT_ROTATE: string, LEFT_TO_RIGHT: string, ALL_AROUND: string}}
 */
PocketCode.RotationStyle = {
    DO_NOT_ROTATE: 'don\'t rotate',
    LEFT_TO_RIGHT: 'left-right',
    ALL_AROUND: 'all around',
};

PocketCode.PhysicsType = {
    NONE: 'no bouncing',
    FIXED: 'others bounce off it',
    DYNAMIC: 'bouncing with gravity'
};


PocketCode.Model.Sprite = (function () {
    Sprite.extends(PocketCode.UserVariableHost, false);

    /**
     * initialization of properties
     * @param gameEngine gameEngine instance as a reference
     * @param scene scene instance as a reference
     * @param propObject object which can contains properties
     */
    function Sprite(gameEngine, scene, propObject) {
        PocketCode.UserVariableHost.call(this, PocketCode.UserVariableScope.LOCAL, gameEngine);

        this._gameEngine = gameEngine;
        this._scene = scene;
        this._json = propObject;
        this._onChange = scene.onSpriteUiChange;    //mapping event (defined in scene)
        this._onVariableChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._gameEngine.onVariableUiChange.dispatchEvent(e); }, this)); //TODO: _scene: should we define this event in scene/gameEngine?

        this._sounds = [];
        this._scripts = [];

        //property initialization
        ////motion: set in init()
        this._positionX = 0.0;
        this._positionY = 0.0;
        this._rotationStyle = PocketCode.RotationStyle.ALL_AROUND;
        this._direction = 90.0; //pointing to right: 0 means up

        ////looks
        this._looks = [];
        this._lookOffsetX = 0.0;
        this._lookOffsetY = 0.0;
        this._currentLook = undefined;
        this._scaling = 1.0;
        this._visible = true;
        this._transparency = 0.0;
        this._brightness = 100.0;
        this._colorEffect = 0.0;

        //pen
        this._penDown = false;
        this._penSize = 4;
        this._penColor = { r: 0, g: 0, b: 255 };

        //events
        this._onExecuted = new SmartJs.Event.Event(this);

        if (!propObject || !propObject.id)
            throw new Error('missing ctr arguments: id and/or name in sprite');
        this._id = propObject.id;
        this.name = propObject.name || '';

        //looks: a sprite doesn't always have a look
        if (propObject.looks != undefined)
            this.looks = propObject.looks;

        //sounds
        if (propObject.sounds) {
            this.sounds = propObject.sounds;
        }

        //variables: a sprite may have no (local) variables
        this._variables = propObject.variables || [];
        this._lists = propObject.lists || [];
    }

    //events
    Object.defineProperties(Sprite.prototype, {
        /**
         * @event
         * indicates whether the sprite finished execution
         */
        onExecuted: {
            get: function () { return this._onExecuted; },
        },
    });

    //properties
    Object.defineProperties(Sprite.prototype, {
        renderingSprite: {   //rendering image is created but not stored!
            get: function () {
                return new PocketCode.RenderingSprite({
                    id: this._id,
                    x: this._positionX + this._lookOffsetX,
                    y: this._positionY + this._lookOffsetY,
                    rotation: this.rotationStyle === PocketCode.RotationStyle.ALL_AROUND ? this._direction - 90.0 : 0.0,
                    flipX: this.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && this.direction < 0,
                    look: this._currentLook ? this._currentLook.canvas : undefined,
                    scaling: this._scaling,
                    visible: this._visible,
                    graphicEffects: [
                        { effect: PocketCode.GraphicEffect.GHOST, value: this._transparency },
                        { effect: PocketCode.GraphicEffect.BRIGHTNESS, value: this._brightness - 100.0 },  //send +-100 instead of 0..200
                        { effect: PocketCode.GraphicEffect.COLOR, value: this._colorEffect },
                        //TODO: add other filters as soon as available
                    ],
                    penDown: this._penDown,
                    penSize: this._penSize,
                    penColor: this._penColor,
                    penX: this._positionX,
                    penY: this._positionY,
                    isBackground: this instanceof PocketCode.Model.BackgroundSprite,
                });
            },
        },
        id: {
            get: function () {
                return this._id;
            },
        },

        //motion
        positionX: {
            get: function () {
                return this._positionX;
            },
        },
        positionY: {
            get: function () {
                return this._positionY;
            },
        },
        direction: {
            get: function () {
                return this._direction;
            },
        },
        layer: {
            get: function () {
                return this._scene.getSpriteLayer(this);//.id);
            },
        },
        rotationStyle: {
            get: function () {
                return this._rotationStyle;
            },
        },

        //looks
        looks: {
            set: function (jsonLooks) {
                if (!(jsonLooks instanceof Array))
                    throw new Error('invalid argument: expected jsonLooks type of array');

                this._looks = [];
                var look;
                for (var i = 0, l = jsonLooks.length; i < l; i++) {
                    look = new PocketCode.Model.Look(jsonLooks[i]);
                    this._looks.push(look);
                }

                if (jsonLooks.length > 0)
                    this._currentLook = this._looks[0];
                else    //make sure its deleted on re-initialize
                    this._currentLook = undefined;
            },
            get: function () {
                return this._looks;
            },
        },
        currentLook: {
            get: function () {
                return this._currentLook;
            },
        },
        visible: {
            get: function () {
                return this._visible;
            },
        },
        size: {     //percentage
            get: function () {
                return Math.round(this._scaling * 100.0);
            },
        },
        transparency: {
            get: function () {
                return this._transparency;
            },
        },
        brightness: {
            get: function () {
                return this._brightness;
            },
        },
        colorEffect: {
            get: function () {
                return this._colorEffect;
            },
        },

        //sound
        sounds: {
            set: function (sounds) {
                if (!(sounds instanceof Array))
                    throw new Error('sounds setter expects type Array');

                this._sounds = sounds;
            },
            get: function () {
                return this._sounds;
            },
        },
        //pen & stamp
        penDown: {
            set: function (penDown) {
                if (this._penDown == penDown)
                    return;

                this._penDown = penDown;
                this._triggerOnChange({ penDown: this._penDown });
            },
        },
        penSize: {
            set: function (penSize) {
                if (this._penSize == penSize)
                    return;

                this._penSize = penSize;
                this._triggerOnChange({ penSize: this._penSize });
            },
        },
        penColor: {
            set: function (rgbObj) {
                if (typeof rgbObj !== 'object')
                    throw new Error('invalid setter: rgb object');

                var c = this._penColor;
                if (rgbObj.r == c.r && rgbObj.g == c.g && rgbObj.b == c.b)
                    return;

                this._penColor = { r: rgbObj.r, g: rgbObj.g, b: rgbObj.b };
                this._triggerOnChange({ penColor: this._penColor });
            },
        },
        //isBackground: {
        //    get: function () {
        //        return this._isBackground;
        //    },
        //},

        //projectTimerValue: {    //used in formula (gameEngine not accessible)
        //    get: function() {
        //        return this._gameEngine.projectTimer.value;
        //    },
        //},
        scripts: {
            set: function (scripts) {
                if (!(scripts instanceof Array))
                    throw new Error('scripts setter expects type Array');

                var script;
                for (var i = 0, l = scripts.length; i < l; i++) {
                    script = scripts[i];
                    //if (!(script instanceof PocketCode.Model.ScriptBlock))                               //this change breaks our tests: //TODO: 
                    //    throw new Error('invalid script block: every brick has to be inherited from ScriptBlock');
                    if (script.onExecuted)  //supported by all (root container) scripts
                        script.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._scriptOnExecuted, this));
                }
                this._scripts = scripts;
            },
            get: function () {
                return this._scripts;
            },
        },
        scriptsRunning: {
            get: function () {
                var scripts = this._scripts;
                var es;
                for (var i = 0, l = scripts.length; i < l; i++) {
                    es = scripts[i].executionState;
                    if (es == PocketCode.ExecutionState.PAUSED || es == PocketCode.ExecutionState.RUNNING) {
                        return true;
                    }
                }
                return false;
            },
        },
    });

    //methods
    Sprite.prototype.merge({
        initLooks: function () {    //is called before init() to load image canvas from image store
            var looks = this._looks;
            var look, img;

            for (var i = 0, l = looks.length; i < l; i++) {
                look = looks[i];
                img = this._gameEngine.getLookImage(look.imageId);
                look.init(img);
            }
        },
        init: function () {
            //property initialization
            //motion
            this._positionX = 0.0;
            this._positionY = 0.0;
            this._direction = 90.0; //pointing to right: 0 means up
            this._rotationStyle = PocketCode.RotationStyle.ALL_AROUND;

            //looks
            var looks = this._looks;
            this._currentLook = looks.length > 0 ? looks[0] : undefined;
            this._scaling = 1.0;
            this._visible = true;
            this._transparency = 0.0;
            this._brightness = 100.0;
            this._colorEffect = 0.0;
            this._recalculateLookOffsets();

            this._penDown = false;
            this._penSize = 4;
            this._penColor = { r: 0, g: 0, b: 255 };

            //variables
            this._resetVariables();
        },
        /**
         * calls pause() on every script as long as method is available
         */
        pauseScripts: function () {
            var scripts = this._scripts;
            for (var i = 0, l = scripts.length; i < l; i++) {
                if (scripts[i].pause)
                    scripts[i].pause();
            }
        },
        /**
         * calls resume() on every script as long as method is available
         */
        resumeScripts: function () {
            var scripts = this._scripts;
            for (var i = 0, l = scripts.length; i < l; i++) {
                if (scripts[i].resume)
                    scripts[i].resume();
            }
        },
        /**
         * calls stop() on every scripts
         */
        stopScript: function (scriptId) {
            var scripts = this._scripts;
            for (var i = 0, l = scripts.length; i < l; i++) {
                if (scripts[i].id === scriptId) {
                    scripts[i].stop();
                    return false;
                }
            }
        },
        stopAllScripts: function (exceptScriptId) {
            var scripts = this._scripts;
            for (var i = 0, l = scripts.length; i < l; i++) {
                if (scripts[i].id !== exceptScriptId)
                    scripts[i].stop();
            }
            return false;
        },
        /**
         * @event handler
         * @private
         */
        _scriptOnExecuted: function (e) {
            if (!this.scriptsRunning) {
                this._onExecuted.dispatchEvent();
            }
        },
        /**
         * @event helper
         * @param properties
         * @private
         */
        _triggerOnChange: function (properties) {
            for (var prop in properties) {
                if (properties[prop] != undefined && properties.hasOwnProperty(prop)) { //at least one item to update
                    if (properties.x || properties.y) { //include sprite positions for pen
                        properties.penX = this._positionX;
                        properties.penY = this._positionY;
                    }
                    this._onChange.dispatchEvent({ id: this._id, properties: properties }, this);
                    return true;
                }
            }
            return false;
        },
        _recalculateLookOffsets: function () {
            if (!this._currentLook) {
                this._lookOffsetX = 0.0;
                this._lookOffsetY = 0.0;
                return;
            }
            // bypass tests where looks were not loaded via the image store
            //try {
            //var look = this._currentLook;//this._gameEngine.getLookImage(this._currentLook.imageId);
            //} catch (err) {console.log('LOOK NOT FOUND, PROBABLY NOT YET LOADED.');return;}

            var rotationAngle = (this._rotationStyle == PocketCode.RotationStyle.ALL_AROUND) ? (90.0 - this._direction) * Math.PI / 180.0 : 0.0;
            var center = this._currentLook.center;
            this._lookOffsetX = center.length * this._scaling * Math.cos(center.angle + rotationAngle);
            if (this._rotationStyle == PocketCode.RotationStyle.LEFT_TO_RIGHT && this._direction < 0.0)
                this._lookOffsetX *= -1.0;
            this._lookOffsetY = center.length * this._scaling * Math.sin(center.angle + rotationAngle);
        },

        //motion: position
        /**
         * sets the position(x,y) of the sprite
         * @param {number} x
         * @param {number} y
         * @param {boolean} triggerEvent
         * @returns {boolean}
         */
        setPosition: function (x, y, triggerEvent, animationCancelCallback, velocity) {
            if (isNaN(x) || isNaN(y))
                throw new Error('invalid argument: position');

            if (this._animationCancelCallback && this._animationCancelCallback != animationCancelCallback)  //cancel pending updates caused by animations
                this._animationCancelCallback();
            if (animationCancelCallback) {   //used to cancel animations
                this._animationCancelCallback = animationCancelCallback;
                //TODO: velocity
            }

            if (this._positionX === x && this._positionY === y)
                return false;

            var ops = {};
            if (this._positionX != x) {
                this._positionX = x;
                ops.x = x + this._lookOffsetX;
            }
            if (this._positionY != y) {
                this._positionY = y;
                ops.y = y + this._lookOffsetY;
            }

            if (triggerEvent == false)
                return false;

            return this._triggerOnChange(ops);
        },
        /**
         * sets the x position of the sprite
         * @param {number} x
         * @returns {boolean}
         */
        setPositionX: function (x) {
            if (isNaN(x))
                throw new Error('invalid argument: position');

            if (this._animationCancelCallback)  //cancel pending updates caused by animations
                this._animationCancelCallback();
            if (this._positionX === x)
                return false;

            this._positionX = x;
            return this._triggerOnChange({ x: x + this._lookOffsetX });
        },
        /**
         * changes the x position of the sprite by a value
         * @param {number} value
         * @returns {boolean}
         */
        changePositionX: function (value) {
            if (isNaN(value))
                throw new Error('invalid argument: position');

            if (this._animationCancelCallback)  //cancel pending updates caused by animations
                this._animationCancelCallback();
            if (!value)
                return false;

            this._positionX += value;
            return this._triggerOnChange({ x: this._positionX + this._lookOffsetX });
        },
        /**
         * sets the y position of the sprite
         * @param {number} y
         * @returns {boolean}
         */
        setPositionY: function (y) {
            if (isNaN(y))
                throw new Error('invalid argument: position');

            if (this._animationCancelCallback)  //cancel pending updates caused by animations
                this._animationCancelCallback();
            if (this._positionY === y)
                return false;

            var center = { length: 0, angle: 0 };
            this._positionY = y;
            return this._triggerOnChange({ y: y + this._lookOffsetY });
        },
        /**
         * changes the y position of the sprite by a value
         * @param {number} value
         * @returns {boolean}
         */
        changePositionY: function (value) {
            if (isNaN(value))
                throw new Error('invalid argument: position');

            if (this._animationCancelCallback)  //cancel pending updates caused by animations
                this._animationCancelCallback();
            if (!value)
                return false;

            var center = { length: 0, angle: 0 };
            this._positionY += value;
            return this._triggerOnChange({ y: this._positionY + this._lookOffsetY });
        },
        /**
        /**
         * moves the sprite "value" steps in the direction of the current direction
         * @param {number} steps
         * @returns {boolean}
         */
        move: function (steps, velocity) {
            if (!steps || isNaN(steps))
                return false;

            var rad = (90.0 - this._direction) * Math.PI / 180.0;
            var offsetX = Math.cos(rad) * steps,
                offsetY = Math.sin(rad) * steps;

            return this.setPosition(this._positionX + offsetX, this._positionY + offsetY, true, undefined, velocity);
        },
        //motion:direction
        /**
         * turns the sprite "value" degree left
         * @param {number} degree
         * @returns {*}
         */
        turnLeft: function (degree) {
            if (!degree)
                return false;
            return this.setDirection(this._direction - degree);
        },
        /**
         * turns the sprite "value" degree right
         * @param degree
         * @returns {boolean}
         */
        turnRight: function (degree) {
            if (!degree)
                return false;
            return this.setDirection(this._direction + degree);
        },
        /**
         * sets the direction of the sprite to degree value
         * @param {number} degree
         * @param triggerEvent
         * @returns {boolean}
         */
        setDirection: function (degree, triggerEvent) {
            if (degree === undefined || this._direction === degree)
                return false;

            var nd = degree % 360.0;
            if (nd <= -180.0) {
                nd += 360.0;
            }
            if (nd > 180.0) {
                nd -= 360.0;
            }
            if (this._direction === nd)
                return false;

            //check if sprite rotation changed: e.g. flipped/rotation
            var old = this._direction;
            this._direction = nd;
            var props = {};

            if (this._rotationStyle == PocketCode.RotationStyle.DO_NOT_ROTATE)  //rotation == 0.0
                return false;
            else if (this._rotationStyle == PocketCode.RotationStyle.LEFT_TO_RIGHT) {
                if (old < 0.0 && nd >= 0.0 || old >= 0.0 && nd < 0.0)   //flipXChanged
                    props.flipX = nd < 0.0;
                else
                    return false;
            }
            else if (this._rotationStyle == PocketCode.RotationStyle.ALL_AROUND) {
                props.rotation = this._direction - 90.0;
            }

            this._recalculateLookOffsets();
            if (triggerEvent == false)
                return true;

            props.x = this._positionX + this._lookOffsetX;
            props.y = this._positionY + this._lookOffsetY;

            return this._triggerOnChange(props);
        },
        /**
         * sets the direction of current sprite so that it points to a given sprite
         * @param spriteId
         * @returns {boolean}
         */
        SetDirectionTo: function (spriteId) {
            if (!spriteId)
                return false;

            var SetDirectionTo = this._scene.getSpriteById(spriteId); //throws error if undefined

            var offsetX = SetDirectionTo.positionX - this.positionX;
            var offsetY = SetDirectionTo.positionY - this.positionY;

            if (offsetX === 0 && offsetY === 0)
                return false;

            return this.setDirection(90.0 - Math.atan2(offsetY, offsetX) * 180.0 / Math.PI);
        },
        //motion: layer
        /**
         * sets the sprite "value" layers back
         * @param {number} layers
         * @returns {*}
         */
        goBack: function (layers) {
            return this._scene.setSpriteLayerBack(this, layers);
        },
        /**
         * sets the layer of the sprite to the foremost one
         * @returns {*}
         */
        comeToFront: function () {
            return this._scene.setSpriteLayerToFront(this);
        },
        /**
         * sets the rotation style of the sprite (enum value)
         * @returns {*}
         */
        setRotationStyle: function (value) {
            var old = this._rotationStyle,
                props = {};
            if (this._rotationStyle == value)
                return false;
            this._rotationStyle = value;

            if (old == PocketCode.RotationStyle.LEFT_TO_RIGHT && this._direction < 0)
                props.flipX = false; //switched from

            switch (this._rotationStyle) {
                case PocketCode.RotationStyle.ALL_AROUND:
                    if (this._direction != 90.0) {  //rotation changed
                        this._recalculateLookOffsets();
                        props.rotation = this._direction - 90.0;
                        //props.x = Math.round(this._positionX + this._lookOffsetX);
                        //props.y = Math.round(this._positionY + this._lookOffsetY);
                    }
                    break;
                case PocketCode.RotationStyle.LEFT_TO_RIGHT:
                    if (this._direction < 0)
                        props.flipX = true; //switched to
                    if (this._direction != 90.0 && old == PocketCode.RotationStyle.ALL_AROUND) {
                        this._recalculateLookOffsets();
                        props.rotation = 0.0;
                        //props.x = Math.round(this._positionX + this._lookOffsetX);
                        //props.y = Math.round(this._positionY + this._lookOffsetY);
                    }
                    break;
                case PocketCode.RotationStyle.DO_NOT_ROTATE:
                    if (this._direction != 90.0 && old == PocketCode.RotationStyle.ALL_AROUND) {
                        this._recalculateLookOffsets();
                        props.rotation = 0.0;
                        //props.x = Math.round(this._positionX + this._lookOffsetX);
                        //props.y = Math.round(this._positionY + this._lookOffsetY);
                    }
                    break;
                default:
                    throw new Error('invalid argument: unknown rotation style');
            }

            props.x = this._positionX + this._lookOffsetX;
            props.y = this._positionY + this._lookOffsetY;

            if (props.flipX == undefined && props.rotation == undefined)
                return false;
            return this._triggerOnChange(props);
        },
        //looks
        /**
         * sets the look of the sprite
         * @param lookId
         * @returns {boolean}
         */
        setLook: function (lookId) {
            if (this._currentLook && this._currentLook.id === lookId || this._looks.length == 0)
                return false;

            var looks = this._looks,
                look, update;

            for (var i = 0, l = looks.length; i < l; i++) {
                look = looks[i];
                if (look.id === lookId) {
                    this._currentLook = look;
                    update = { look: look.canvas };

                    this._recalculateLookOffsets();
                    update.x = this._positionX + this._lookOffsetX;
                    update.y = this._positionY + this._lookOffsetY;
                    return this._triggerOnChange(update);
                }
            }
            throw new Error('look image with id ' + lookId + ' could not be found');
        },

        /**
         * sets the current look of the sprite to the previous one in the list
         * @returns {boolean}
         */
        previousLook: function () {
            if (this._currentLook == undefined || this._looks.length == 0)
                return false;

            var looks = this._looks,
                update;
            var count = looks.length;
            if (count < 2)
                return false;

            for (var i = 0; i < count; i++) {
                if (this._currentLook === looks[i]) {
                    if ((i - 1) >= 0)
                        this._currentLook = looks[i - 1];
                    else
                        this._currentLook = looks[count - 1];

                    this._recalculateLookOffsets();
                    update = { look: this._currentLook.canvas };
                    update.x = this._positionX + this._lookOffsetX;
                    update.y = this._positionY + this._lookOffsetY;
                    return this._triggerOnChange(update);
                }
            }
        },
        /**
         * sets the current look of the sprite to the next one in the list
         * @returns {boolean}
         */
        nextLook: function () {
            if (this._currentLook == undefined || this._looks.length == 0)
                return false;

            var looks = this._looks,
                update;
            var count = looks.length;
            if (count < 2)
                return false;

            for (var i = 0; i < count; i++) {
                if (this._currentLook === looks[i]) {
                    if ((i + 1) < count)
                        this._currentLook = looks[i + 1];
                    else
                        this._currentLook = looks[0];

                    this._recalculateLookOffsets();
                    update = { look: this._currentLook.canvas };
                    update.x = this._positionX + this._lookOffsetX;
                    update.y = this._positionY + this._lookOffsetY;
                    return this._triggerOnChange(update);
                }
            }
        },
        /**
         * sets the size of the sprite with percentage "value"
         * @param {number} percentage
         * @returns {boolean}
         */
        setSize: function (percentage) {
            if (percentage === undefined || isNaN(percentage) || percentage == null)
                throw new Error('invalid percentage ');

            var value = percentage / 100.0;
            if (this._scaling === value || (this._scaling === 0.0 && value <= 0.0))
                return false;

            if (value < 0.0)
                value = 0.0;
            this._scaling = value;
            this._recalculateLookOffsets();

            return this._triggerOnChange({
                scaling: this._scaling,
                x: this._positionX + this._lookOffsetX,
                y: this._positionY + this._lookOffsetY,
            });
        },
        /**
         * changes the current size by "value"
         * @param {number} value
         * @returns {boolean}
         */
        changeSize: function (value) {  //TODO: checkout default behaviour on <0
            if (value === undefined || isNaN(value) || value == null)
                throw new Error('invalid value');
            //if (!value)// || (this._scaling === 0 && (this._scaling * 100.0 + value) <= 0))
            //    return false;

            var size = this._scaling * 100.0 + value;
            if (size < 0)
                size = 0;

            var scaling = size / 100.0;
            if (this._scaling == scaling)
                return false;

            this._scaling = scaling;
            this._recalculateLookOffsets();

            return this._triggerOnChange({
                scaling: scaling,
                x: this._positionX + this._lookOffsetX,
                y: this._positionY + this._lookOffsetY,
            });
        },
        /**
         * sets the sprite as not visible
         * @returns {boolean}
         */
        hide: function () {
            if (!this._visible)
                return false;

            this._visible = false;
            return this._triggerOnChange({ visible: false });
        },
        /**
         * sets the sprite as visible
         * @returns {boolean}
         */
        show: function () {
            if (this._visible)
                return false;

            this._visible = true;
            return this._triggerOnChange({ visible: true });
        },
        /**
         * sets the graphicEffect of the sprite with a given effect and value of the effect
         * @param {PocketCode.GraphicEffect} effect
         * @param {number} value
         * @returns {*}
         */
        setGraphicEffect: function (effect, value) {
            if (value === undefined || isNaN(value))
                return false;

            switch (effect) {
                case PocketCode.GraphicEffect.GHOST:    //=transparency
                    return this._setTransparency(value);
                case PocketCode.GraphicEffect.BRIGHTNESS:
                    return this._setBrightness(value);
                case PocketCode.GraphicEffect.COLOR:
                    return this._setColorEffect(value);
                case PocketCode.GraphicEffect.FISHEYE:
                case PocketCode.GraphicEffect.MOSAIC:
                case PocketCode.GraphicEffect.PIXELATE:
                case PocketCode.GraphicEffect.WHIRL:
                    return false;   //currently not supported

                default:
                    throw new Error('unknown graphic effect: ' + effect);
            }
        },
        /**
         * changes the graphicEffect with a given effect and value of the effect
         * @param {PocketCode.GraphicEffect} effect
         * @param {number} value
         * @returns {*}
         */
        changeGraphicEffect: function (effect, value) {
            if (value === undefined || isNaN(value))
                return false;

            switch (effect) {
                case PocketCode.GraphicEffect.GHOST:    //=transparency
                    return this._setTransparency(this._transparency + value);
                case PocketCode.GraphicEffect.BRIGHTNESS:
                    return this._setBrightness(this._brightness + value);
                case PocketCode.GraphicEffect.COLOR:
                    return this._setColorEffect(this._colorEffect + value);
                case PocketCode.GraphicEffect.FISHEYE:
                case PocketCode.GraphicEffect.MOSAIC:
                case PocketCode.GraphicEffect.PIXELATE:
                case PocketCode.GraphicEffect.WHIRL:
                    return false;   //currently not supported

                default:
                    throw new Error('unknown graphic effect: ' + effect);
            }
        },
        /* set to private and called from set/change graphic effect*/
        /**
         * sets the transparency of the sprite by the "value" percentage
         * @param {number} percentage
         * @returns {boolean}
         * @private
         */
        _setTransparency: function (value) {
            if (value < 0.0)
                value = 0.0;
            if (value > 100.0)
                value = 100.0;

            if (this._transparency === value)
                return false;

            this._transparency = value;
            return this._triggerOnChange({ graphicEffects: [{ effect: PocketCode.GraphicEffect.GHOST, value: value }] });
        },
        /* set to private and called from set/change graphic effect*/
        /**
         * sets the brightness of the sprite by the "value" percentage
         * @param {number} percentage
         * @returns {boolean}
         * @private
         */
        _setBrightness: function (value) {
            if (value < 0.0)
                value = 0.0;
            if (value > 200.0)
                value = 200.0;

            if (this._brightness === value)
                return false;

            this._brightness = value;
            return this._triggerOnChange({ graphicEffects: [{ effect: PocketCode.GraphicEffect.BRIGHTNESS, value: value - 100.0 }] });  //send +-100 instead of 0..200
        },
        /* set to private and called from set/change graphic effect*/
        /**
         * sets the color effect of the sprite by the "value" percentage
         * @param {number} percentage
         * @returns {boolean}
         * @private
         */
        _setColorEffect: function (value) {
            while (value < 0.0)
                value += 200.0;
            while (value > 200.0)
                value -= 200.0;

            if (this._colorEffect === value)
                return false;

            this._colorEffect = value;
            return this._triggerOnChange({ graphicEffects: [{ effect: PocketCode.GraphicEffect.COLOR, value: value }] });
        },
        /**
         * clears all graphicEffects of the sprite
         * @returns {boolean}
         */
        clearGraphicEffects: function () {
            var graphicEffects = [];

            if (this._transparency != 0.0) {
                this._transparency = 0.0;
                graphicEffects.push({ effect: PocketCode.GraphicEffect.GHOST, value: 0.0 });
            }
            if (this._brightness != 100.0) {
                this._brightness = 100.0;
                graphicEffects.push({ effect: PocketCode.GraphicEffect.BRIGHTNESS, value: 100.0 });
            }
            if (this._colorEffect != 0.0) {
                this._colorEffect = 0.0;
                graphicEffects.push({ effect: PocketCode.GraphicEffect.COLOR, value: 0.0 });
            }
            //TODO: extend this when adding effects

            if (graphicEffects.length == 0)
                return false;
            return this._triggerOnChange({ graphicEffects: graphicEffects });
        },
        ///**
        // * checks if sprite flips at the edge
        // * @returns {*}
        // */
        ifOnEdgeBounce: function (vpEdges, changes) {

            if (!this._currentLook)   //no look defined (cannot be changed either): no need to handle this
                return false;

            var collisionMgr = this._scene.collisionManager;

            var x = this._positionX,
                y = this._positionY;

            var dir = this.direction;
            var look = this._currentLook,
                scaling = this._scaling,
                rotationCW = this.rotationStyle === PocketCode.RotationStyle.ALL_AROUND ? dir - 90.0 : 0.0,
                //^^ sprite has a direction but is not rotated
                flipX = this.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && dir < 0.0 ? true : false;

            var boundary,
                collision,
                overflow;
            if (vpEdges) {
                boundary = look.getBoundary(scaling, rotationCW, flipX, true);
                collision = collisionMgr.checkSpriteEdgeCollision(x, y, boundary);
                overflow = collision.overflow;
            }
            else {
                var boundary = look.getBoundary(scaling, rotationCW, flipX, false);
                //{top, right, bottom, left, pixelAccuracy} from look center to bounding area borders (may be negative as well, e.g. if the center is outside of visisble pixels)

                //quick check
                collision = collisionMgr.checkSpriteEdgeCollision(x, y, boundary);
                if (!collision.occurs)
                    return false;

                //check based on pixels if not already done
                if (!boundary.pixelAccuracy) {
                    boundary = look.getBoundary(scaling, rotationCW, flipX, true);
                    collision = collisionMgr.checkSpriteEdgeCollision(x, y, boundary);
                    if (!collision.occurs)
                        return false;
                }

                //handle bounce
                overflow = collision.overflow;
                vpEdges = { //viewport edges
                    top: {
                        overflow: overflow.top,
                        inWork: overflow.top > 0.0,
                        inDirection: Math.abs(dir) <= 90.0,
                        calcDirection: function (dir) { return dir >= 0.0 ? 180.0 - dir : -180.0 - dir; },    // //make sure we do not get an angle within +-180
                    },
                    right: {
                        overflow: overflow.right,
                        inWork: overflow.right > 0.0,
                        inDirection: dir >= 0.0,
                        calcDirection: function (dir) { return dir == 180.0 ? dir : -dir; },
                    },
                    bottom: {
                        overflow: overflow.bottom,
                        inWork: overflow.bottom > 0.0,
                        inDirection: Math.abs(dir) > 90.0,
                        calcDirection: function (dir) { return dir > 0.0 ? 180.0 - dir : -180.0 - dir; },
                    },
                    left: {
                        overflow: overflow.left,
                        inWork: overflow.left > 0.0,
                        inDirection: dir < 0.0,
                        calcDirection: function (dir) { return -dir; },
                    },
                };

                //handle conflics: if there is an overflow on both sides we always bounce from the side the sprites points to
                if (vpEdges.top.overflow > 0.0 && vpEdges.bottom.overflow > 0.0) {
                    if (Math.abs(dir) == 90.0) {
                        vpEdges.bottom.inWork = false;
                        vpEdges.top.inWork = false;
                    }
                    else if (Math.abs(dir) <= 90.0)
                        vpEdges.bottom.inWork = false;
                    else
                        vpEdges.top.inWork = false;
                }
                if (vpEdges.left.overflow > 0.0 && vpEdges.right.overflow > 0.0) {
                    if (dir == 0.0 || dir == 180.0) {
                        vpEdges.right.inWork = false;
                        vpEdges.left.inWork = false;
                    }
                    else if (dir < 0.0)
                        vpEdges.right.inWork = false;
                    else
                        vpEdges.left.inWork = false;
                }
            }

            //calc new positions and direction: we need this to compare new with existing properties to trigger the update event correctly
            var newDir = dir,
                newX = x,
                newY = y;

            //calc new direction
            for (var e in vpEdges) {
                var edge = vpEdges[e];
                if (edge.inWork && edge.inDirection)
                    newDir = edge.calcDirection(newDir);
            }

            //adjust the sprite to the edge before rotating
            var updateEdges = function (handled) {
                var correction;
                if (vpEdges.top.inWork) {
                    correction = overflow.top > 0 ? overflow.top : 0.0;
                    newY -= correction;
                    vpEdges.top.inWork = !handled;
                    vpEdges.top.overflow -= correction;
                    vpEdges.bottom.overflow = overflow.bottom + correction;
                }
                if (vpEdges.right.inWork) {
                    correction = overflow.right > 0 ? overflow.right : 0.0;
                    newX -= correction;
                    vpEdges.right.inWork = !handled;
                    vpEdges.right.overflow -= correction;
                    vpEdges.left.overflow = overflow.left + correction;
                }
                if (vpEdges.bottom.inWork) {
                    correction = overflow.bottom > 0 ? overflow.bottom : 0.0;
                    newY += correction;
                    vpEdges.bottom.inWork = !handled;
                    vpEdges.top.overflow = overflow.top + correction;
                    vpEdges.bottom.overflow -= correction;
                }
                if (vpEdges.left.inWork) {
                    correction = overflow.left > 0 ? overflow.left : 0.0;
                    newX += correction;
                    vpEdges.left.inWork = !handled;
                    vpEdges.right.overflow = overflow.right + correction;
                    vpEdges.left.overflow -= correction;
                }
            };
            updateEdges(newDir == dir || this.rotationStyle !== PocketCode.RotationStyle.ALL_AROUND);   //handled completely if not rotated in UI

            //handle rotate and flip
            var updateBoundary = false;
            if (newDir != dir) {
                if (this.rotationStyle == PocketCode.RotationStyle.ALL_AROUND) {
                    rotationCW = newDir - 90.0;
                    updateBoundary = true;
                }
                else if (this.rotationStyle == PocketCode.RotationStyle.LEFT_TO_RIGHT) {
                    rotationCW = 0.0;
                    if ((newDir >= 0.0 && dir < 0.0) || (newDir < 0.0 && dir >= 0.0)) { //flipX changed
                        flipX = !flipX;
                        updateBoundary = true;
                    }
                }
            }

            if (updateBoundary) {   //if flipped or rotated
                var centerOffset = {  //store the center position of the current area
                    x: (boundary.right + boundary.left) * 0.5,
                    y: (boundary.top + boundary.bottom) * 0.5,
                };

                //reposition: keep the AOI center
                boundary = look.getBoundary(scaling, rotationCW, flipX, true);
                newX += centerOffset.x - (boundary.right + boundary.left) * 0.5;
                newY += centerOffset.y - (boundary.top + boundary.bottom) * 0.5;

                //update overflows due to new center (x/y position)
                collision = collisionMgr.checkSpriteEdgeCollision(newX, newY, boundary);
                overflow = collision.overflow;
                vpEdges.top.overflow = overflow.top;
                vpEdges.right.overflow = overflow.right;
                vpEdges.bottom.overflow = overflow.bottom;
                vpEdges.left.overflow = overflow.left;

                updateEdges(true);  //adjust positions after rotate
            }

            //set sprite values: avoid triggering multiple onChange events
            var props = changes || {};
            this.setDirection(newDir, false);   //setDirection return true if an UI update is required (or was triggered), not when the direction is changed without UI update 
            if (this._direction !== dir) { //direction changed
                if (this._rotationStyle == PocketCode.RotationStyle.ALL_AROUND) {
                    props.rotation = Math.round(this._direction - 90.0);

                    //align sprite to edges not in directory: max correction = movement without triggering an overflow on the opposit edge
                    var correction;
                    if (vpEdges.top.overflow > 0.0 && !vpEdges.top.inDirection) {
                        correction = Math.min(vpEdges.top.overflow, -vpEdges.bottom.overflow);
                        if (correction > 0.0) {
                            newY -= correction;
                            vpEdges.top.overflow -= correction;
                            vpEdges.bottom.overflow += correction;
                        }
                    }
                    if (vpEdges.right.overflow > 0.0 && !vpEdges.right.inDirection) {
                        correction = Math.min(vpEdges.right.overflow, -vpEdges.left.overflow);
                        if (correction > 0.0) {
                            newX -= correction;
                            vpEdges.right.overflow -= correction;
                            vpEdges.left.overflow += correction;
                        }
                    }
                    if (vpEdges.bottom.overflow > 0.0 && !vpEdges.bottom.inDirection) {
                        correction = Math.min(vpEdges.bottom.overflow, -vpEdges.top.overflow);
                        if (correction > 0.0) {
                            newY += correction;
                            vpEdges.top.overflow += correction;
                            vpEdges.bottom.overflow -= correction;
                        }
                    }
                    if (vpEdges.left.overflow > 0.0 && !vpEdges.left.inDirection) {
                        correction = Math.min(vpEdges.left.overflow, -vpEdges.right.overflow);
                        if (correction > 0.0) {
                            newX += correction;
                            vpEdges.top.overflow += correction;
                            vpEdges.bottom.overflow -= correction;
                        }
                    }

                    //other edges to be handled: only required if the sprite was rotated (in this case the sprite may have another conflict due to rotation)
                    vpEdges.top.inWork = vpEdges.top.overflow > 0.0 && vpEdges.top.inDirection;
                    vpEdges.right.inWork = vpEdges.right.overflow > 0.0 && vpEdges.right.inDirection;
                    vpEdges.bottom.inWork = vpEdges.bottom.overflow > 0.0 && vpEdges.bottom.inDirection;
                    vpEdges.left.inWork = vpEdges.left.overflow > 0.0 && vpEdges.left.inDirection;
                }
                else if (this._rotationStyle == PocketCode.RotationStyle.LEFT_TO_RIGHT)
                    props.flipX = newDir < 0.0;
            }

            if (this.positionX !== newX) {
                props.x = newX + this._lookOffsetX;
            }
            if (this.positionY !== newY) {
                props.y = newY + this._lookOffsetY;
            }
            if (props.x || props.y)
                this.setPosition(newX, newY, false);

            //recall if overflow in direction
            if (vpEdges.top.inWork || vpEdges.right.inWork || vpEdges.bottom.inWork || vpEdges.left.inWork)
                return this.ifOnEdgeBounce(vpEdges, props);

            return this._triggerOnChange(props);    //returns false for empty objects
        },
        drawStamp: function () {
            return this._triggerOnChange({ drawStamp: true });  //TODO: introduce "action" parameter { canvasAction: penDown, penUp, stamp } ???
        },

        showBubble: function (type, text) {
            //TODO validation: PocketCode.Model.BubbleType.SAY/THINK
            return this._triggerOnChange({ bubble: { type: type, text: text, visible: true } });
        },
        hideBubble: function (type) {
            //TODO validation: PocketCode.Model.BubbleType.SAY/THINK
            return this._triggerOnChange({ bubble: { type: type, visible: false } });
        },


        clone: function (device, soundManager, broadcastMgr) {
            if (!this._spriteFactory)
                this._spriteFactory = new PocketCode.SpriteFactory(device, this._gameEngine, soundManager);

            var definition = {
                _positionX: this._positionX,
                _positionY: this._positionY,
                _rotationStyle: this._rotationStyle,
                _direction: this._direction,

                ////looks
                _lookOffsetX: this._lookOffsetX,
                _lookOffsetY: this._lookOffsetY,
                _currentLook: this._currentLook,
                _scaling: this._scaling,
                _visible: this._visible,
                _transparency: this._transparency,
                _brightness: this._brightness,
                _colorEffect: this._colorEffect,

                //pen
                _penDown: this._penDown,
                _penSize: this._penSize,
                _penColor: this._penColor,
            };
            var clone = this._spriteFactory.createClone(this._scene, broadcastMgr, this._json, definition);

        },
        /* override */
        dispose: function () {
            this.stopAllScripts();

            this._gameEngine = undefined;   //make sure the game engine is not disposed
            this._onChange = undefined;     //make sure the game engines event is not disposed (shared event)
            var script,
                scripts = this._scripts;
            for (var i = 0, l = scripts.length; i < l; i++) {  //remove handlers
                script = scripts[i];
                if (script.onExecuted)  //supported by all (root container) scripts
                    script.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._scriptOnExecuted, this));
            }

            //call super
            PocketCode.UserVariableHost.prototype.dispose.call(this);
        },

    });

    return Sprite;
})();


PocketCode.Model.merge({
    SpriteClone: (function () {
        SpriteClone.extends(PocketCode.Model.Sprite, false);

        function SpriteClone(gameEngine, scene, jsonSprite, definition) {

            PocketCode.Model.Sprite.call(this, gameEngine, scene, jsonSprite);

            this._id = SmartJs.getNewId();
            this._json = jsonSprite;

            this._gameEngine = gameEngine;
            this._scene = scene;
            this._onChange = scene.onSpriteUiChange;    //mapping event (defined in scene)
            this._onVariableChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._gameEngine.onVariableUiChange.dispatchEvent(e); }, this)); //TODO: _scene: should we define this event in scene/gameEngine?

            this._looks = [];
            this._sounds = [];
            this._scripts = [];

            //looks: a sprite doesn't always have a look
            if (jsonSprite.looks != undefined)
                this.looks = jsonSprite.looks;

            this.initLooks();

            //sounds
            if (jsonSprite.sounds) {
                this.sounds = jsonSprite.sounds;
            }

            //variables: a sprite may have no (local) variables
            this._variables = jsonSprite.variables || [];
            this._lists = jsonSprite.lists || [];

            this.merge(definition);

            this._onCloneStart = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(SpriteClone.prototype, {
            onCloneStart: {
                get: function () {
                    return this._onCloneStart;
                }
            },
        });

        //properties
        Object.defineProperties(SpriteClone.prototype, {
            isClone: {
                value: true,
                //writable: false,
            },
        });

        return SpriteClone;
    })(),
});


PocketCode.Model.merge({
    BackgroundSprite: (function () {
        BackgroundSprite.extends(PocketCode.Model.Sprite, false);

        function BackgroundSprite(gameEngine, scene, propObject) {
            PocketCode.Model.Sprite.call(this, gameEngine, scene, propObject);

            this._lookChangeSubscriptions = {};
            this._pendingLookOps = {};
        }

        //properties
        //Object.defineProperties(BackgroundSprite.prototype, {
        //});

        //events
        //Object.defineProperties(BackgroundSprite.prototype, {
        //});

        //methods
        BackgroundSprite.prototype.merge({
            subscribeOnLookChange: function (lookId, handler) {
                if (typeof lookId !== 'string')
                    throw new Error('invalid argument: look id, expected type: string');
                if (typeof handler !== 'function')
                    throw new Error('invalid argument: subscriber handler, expected type: function');

                this._lookChangeSubscriptions[lookId] || (this._lookChangeSubscriptions[lookId] = []);
                this._lookChangeSubscriptions[lookId].push(handler);
            },
            _publish: function (lookId, waitCallback) {
                //this._stopped = false;

                var subs = this._lookChangeSubscriptions[lookId];
                if (!subs || subs.length == 0) {
                    if (waitCallback)
                        waitCallback(false);
                    return;
                }

                var po; //stop running tasks with same broadcast id
                for (id in this._pendingLookOps) {
                    po = this._pendingLookOps[id];
                    if (po.lookId == lookId) {
                        delete this._pendingLookOps[id];
                        beak;
                    }
                }

                var handler;
                if (waitCallback) {
                    var id = SmartJs.getNewId(),
                        po = this._pendingLookOps[id] = { lookId: lookId, count: 0, waitCallback: waitCallback, loopDelay: false };
                    //this._pendingLookOps[id] = { count: 0 };

                    for (var i = 0, l = subs.length; i < l; i++) {
                        //if (this._stopped)
                        //    break;
                        po.count++;
                        handler = subs[i];
                        window.setTimeout(handler.bind(this, new Date(), new SmartJs.Event.EventListener(this._scriptExecutedCallback, this), id), 1);
                        //handler(new SmartJs.Event.EventListener(this._scriptExecutedCallback, this), id);
                    }
                }
                else {
                    for (var i = 0, l = subs.length; i < l; i++) {
                        //if (this._stopped)
                        //    break;
                        handler = subs[i];
                        window.setTimeout(handler.bind(this, new Date()), 1);   //handler();  //window.setTimeout(handler, 0);
                    }
                }
                //this._pendingLookOps
            },
            _scriptExecutedCallback: function (e) { //{ id: threadId, loopDelay: loopD }
                var po = this._pendingLookOps[e.id]
                if (!po)    //stopped
                    return;
                //if (po.id == id) {  //make sure an old callback isn't handled
                    po.count--;
                    po.loopDelay = po.loopDelay || e.loopDelay;
                //}

                if (po.count == 0) {  //all scripts executed
                    delete this._pendingLookOps[e.id];
                    po.waitCallback(po.loopDelay);
                }
            },

            /* override */
            setLook: function (lookId, waitCallback) {
                var success = PocketCode.Model.Sprite.prototype.setLook.call(this, lookId);
                if (!success) {
                    if (waitCallback)
                        waitCallback(false);
                    return false;
                }

                this._publish(lookId, waitCallback);
                return true;
            },
            stopAllScripts: function (exceptScriptId) {
                //this._stopped = true;
                this._pendingLookOps = {};
                PocketCode.Model.Sprite.prototype.stopAllScripts.call(this, exceptScriptId);
            },
            dispose: function () {
                this._pendingLookOps = {};
                this._lookChangeSubscriptions = {};
                PocketCode.Model.Sprite.prototype.dispose.call(this);
            },
        });

        return BackgroundSprite;
    })(),

    PhysicsSprite: (function () {
        PhysicsSprite.extends(PocketCode.Model.Sprite, false);

        function PhysicsSprite(gameEngine, scene, propObject) {

            PocketCode.Model.Sprite.call(this, gameEngine, scene, propObject);

            this._mass = 1.0;
            this._density = 1.0;
            this._physicsType = PocketCode.PhysicsType.NONE;
            this._velocityX = 0;
            this._velocityY = 0;
            this._friction = 0.2;
            this._bounceFactor = 0.8;
            this._turnNDegreePerSecond = 0;
        }

        //properties
        Object.defineProperties(PhysicsSprite.prototype, {  //TODO: validate if (isNaN(value))
            mass: {
                set: function (value) {
                    this._mass = value
                }
            },
            turnNDegreePerSecond: {
                set: function (value) {
                    this._turnNDegreePerSecond = value;
                }
            },
            friction: {
                set: function (value) {
                    this._friction = value
                }
            },
            bounceFactor: {
                set: function (value) {
                    this._bounceFactor = value;
                }
            },
            physicsType: {
                set: function (value) {
                    this._physicsType = value;
                    //todo
                }
            }
        });

        //methods
        PhysicsSprite.prototype.merge({
            //setGravity: function(x, y) {    //TODO: why method and not prop? DEFINED IN SCENE
            //    this._scene.setGravity(x, y);
            //},
            setVelocity: function (x, y) {    //TODO: why method and not prop?
                this._velocityX = x;
                this._velocityY = y;
            }
        });

        return PhysicsSprite;
    })(),

});

