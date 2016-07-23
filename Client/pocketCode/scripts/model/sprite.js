/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/userVariableHost.js" />
/// <reference path="../components/renderingItem.js" />
/// <reference path="../components/gameEngine.js" />
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

PocketCode.MovementStyle = {
    NO_BOUNCING: 'no bouncing',
    OTHERS_BOUNCE: 'others bounce off it',
    BOUNCING_WITH_GRAVITY: 'bouncing with gravity'
};


PocketCode.Model.Sprite = (function () {
    Sprite.extends(PocketCode.UserVariableHost, false);

    /**
     * initialization of properties
     * @param gameEngine gameEngine instance as a reference
     * @param propObject object which can contains properties
     */
    function Sprite(gameEngine, propObject) {
        PocketCode.UserVariableHost.call(this, PocketCode.UserVariableScope.LOCAL, gameEngine);
        this._gameEngine = gameEngine;
        this._onChange = gameEngine.onSpriteUiChange;    //mapping event (defined in gameEngine)
        this._onVariableChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._gameEngine.onVariableUiChange.dispatchEvent(e); }, this));

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

        //scripts
        if (propObject.scripts) {
            this.scripts = propObject.scripts;
        }
    }

    //properties
    Object.defineProperties(Sprite.prototype, {
        //renderingProperties: {   //all rendering propeties as object
        //    get: function () {
        //        return {
        //            id: this._id,
        //            x: Math.round(this._positionX + this._lookOffsetX),
        //            y: Math.round(this._positionY + this._lookOffsetY),
        //            rotation: this.rotationStyle === PocketCode.RotationStyle.ALL_AROUND ? this._direction - 90.0 : 0.0,
        //            flipX: this.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && this.direction < 0,
        //            look: this._currentLook ? this._currentLook.canvas : undefined,
        //            scaling: this._scaling,
        //            visible: this._visible,
        //            graphicEffects: [
        //                { effect: PocketCode.GraphicEffect.GHOST, value: this._transparency },
        //                { effect: PocketCode.GraphicEffect.BRIGHTNESS, value: this._brightness - 100.0 },  //send +-100 instead of 0..200
        //                { effect: PocketCode.GraphicEffect.COLOR, value: this._colorEffect },
        //                //TODO: add other filters as soon as available
        //            ],
        //        };
        //    },
        //},
        renderingImage: {   //rendering image is created but not stored!
            get: function () {
                return new PocketCode.RenderingImage({
                    id: this._id,
                    x: Math.round(this._positionX + this._lookOffsetX),
                    y: Math.round(this._positionY + this._lookOffsetY),
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
                return this._gameEngine.getSpriteLayer(this);//.id);
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

        projectTimerValue: {    //used in formula (gameEngine not accessible)
            get: function() {
                return this._gameEngine.projectTimer.value;
            },
        },
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

        visible: {
            get: function () {
                return this._visible;
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
                    return;
                }
            }
        },
        stopOtherScripts: function (scriptId) {
            var scripts = this._scripts;
            for (var i = 0, l = scripts.length; i < l; i++) {
                if (scripts[i].id !== scriptId)
                    scripts[i].stop();
            }
        },
        stopAllScripts: function () {
            var scripts = this._scripts;
            for (var i = 0, l = scripts.length; i < l; i++) {
                if (scripts[i].stop)
                    scripts[i].stop();
            }
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
        setPosition: function (x, y, triggerEvent) {
            if (isNaN(x) || isNaN(y))
                throw new Error('invalid argument: position');
            if (this._positionX === x && this._positionY === y)
                return false;

            var ops = {};
            if (this._positionX != x) {
                this._positionX = x;
                ops.x = Math.round(x + this._lookOffsetX);
            }
            if (this._positionY != y) {
                this._positionY = y;
                ops.y = Math.round(y + this._lookOffsetY);
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
            if (this._positionX === x)
                return false;

            this._positionX = x;
            return this._triggerOnChange({ x: Math.round(x + this._lookOffsetX) });
        },
        /**
         * changes the x position of the sprite by a value
         * @param {number} value
         * @returns {boolean}
         */
        changePositionX: function (value) {
            if (isNaN(value))
                throw new Error('invalid argument: position');
            if (!value)
                return false;

            this._positionX += value;
            return this._triggerOnChange({ x: Math.round(this._positionX + this._lookOffsetX) });
        },
        /**
         * sets the y position of the sprite
         * @param {number} y
         * @returns {boolean}
         */
        setPositionY: function (y) {
            if (isNaN(y))
                throw new Error('invalid argument: position');
            if (this._positionY === y)
                return false;

            var center = { length: 0, angle: 0 };
            this._positionY = y;
            return this._triggerOnChange({ y: Math.round(y + this._lookOffsetY) });
        },
        /**
         * changes the y position of the sprite by a value
         * @param {number} value
         * @returns {boolean}
         */
        changePositionY: function (value) {
            if (isNaN(value))
                throw new Error('invalid argument: position');
            if (!value)
                return false;

            var center = { length: 0, angle: 0 };
            this._positionY += value;
            return this._triggerOnChange({ y: Math.round(this._positionY + this._lookOffsetY) });
        },
        /**
         * moves the sprite "value" steps in the direction of the current direction
         * @param {number} steps
         * @returns {boolean}
         */
        move: function (steps) {
            if (!steps || isNaN(steps))
                return false;

            var rad = (90.0 - this._direction) * Math.PI / 180.0;
            var offsetX = Math.round(Math.cos(rad) * steps),    //make sure the value is an int
                offsetY = Math.round(Math.sin(rad) * steps);

            return this.setPosition(this._positionX + offsetX, this._positionY + offsetY);
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

            props.x = Math.round(this._positionX + this._lookOffsetX);
            props.y = Math.round(this._positionY + this._lookOffsetY);

            return this._triggerOnChange(props);
        },
        /**
         * sets the direction of current sprite so that it points to a given sprite
         * @param spriteId
         * @returns {boolean}
         */
        pointTo: function (spriteId) {
            if (!spriteId)
                return false;

            var pointTo = this._gameEngine.getSpriteById(spriteId); //throws error if undefined

            var offsetX = pointTo.positionX - this.positionX;
            var offsetY = pointTo.positionY - this.positionY;

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
            return this._gameEngine.setSpriteLayerBack(this, layers);
        },
        /**
         * sets the layer of the sprite to the foremost one
         * @returns {*}
         */
        comeToFront: function () {
            return this._gameEngine.setSpriteLayerToFront(this);
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
                        props.x = Math.round(this._positionX + this._lookOffsetX);
                        props.y = Math.round(this._positionY + this._lookOffsetY);
                    }
                    break;
                case PocketCode.RotationStyle.LEFT_TO_RIGHT:
                    if (this._direction < 0)
                        props.flipX = true; //switched to
                    if (this._direction != 90.0 && old == PocketCode.RotationStyle.ALL_AROUND) {
                        this._recalculateLookOffsets();
                        props.rotation = 0.0;
                        props.x = Math.round(this._positionX + this._lookOffsetX);
                        props.y = Math.round(this._positionY + this._lookOffsetY);
                    }
                    break;
                case PocketCode.RotationStyle.DO_NOT_ROTATE:
                    if (this._direction != 90.0 && old == PocketCode.RotationStyle.ALL_AROUND) {
                        this._recalculateLookOffsets();
                        props.rotation = 0.0;
                        props.x = Math.round(this._positionX + this._lookOffsetX);
                        props.y = Math.round(this._positionY + this._lookOffsetY);
                    }
                    break;
                default:
                    throw new Error("invalid argument: unknown rotation style");
            }

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
                    update.x = Math.round(this._positionX + this._lookOffsetX);
                    update.y = Math.round(this._positionY + this._lookOffsetY);
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
                    update.x = Math.round(this._positionX + this._lookOffsetX);
                    update.y = Math.round(this._positionY + this._lookOffsetY);
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
                    update.x = Math.round(this._positionX + this._lookOffsetX);
                    update.y = Math.round(this._positionY + this._lookOffsetY);
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
                x: Math.round(this._positionX + this._lookOffsetX),
                y: Math.round(this._positionY + this._lookOffsetY),
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
                x: Math.round(this._positionX + this._lookOffsetX),
                y: Math.round(this._positionY + this._lookOffsetY),
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

            var collisionMgr = this._gameEngine.collisionManager;

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
                    x: (boundary.right + boundary.left) / 2.0,
                    y: (boundary.top + boundary.bottom) / 2.0,
                };

                //reposition: keep the AOI center
                boundary = look.getBoundary(scaling, rotationCW, flipX, true);
                newX += centerOffset.x - (boundary.right + boundary.left) / 2.0;
                newY += centerOffset.y - (boundary.top + boundary.bottom) / 2.0;

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
                props.x = Math.round(newX + this._lookOffsetX);
            }
            if (this.positionY !== newY) {
                props.y = Math.round(newY + this._lookOffsetY);
            }
            if (props.x || props.y)
                this.setPosition(newX, newY, false);

            //recall if overflow in direction
            if (vpEdges.top.inWork || vpEdges.right.inWork || vpEdges.bottom.inWork || vpEdges.left.inWork)
                return this.ifOnEdgeBounce(vpEdges, props);

            return this._triggerOnChange(props);    //returns false for empty objects
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

PocketCode.Model.PhysicsSprite = (function () {
    PhysicsSprite.extends(PocketCode.Model.Sprite, false);
    function PhysicsSprite(gameEngine, propObject) {

        PocketCode.Model.Sprite.call(this, gameEngine, propObject);

        //todo check default values
        this._mass = 0;
        this._movementStyle = PocketCode.MovementStyle.NO_BOUNCING;
        this._velocityX = 0;
        this._velocityY = 0;
        this._friction = 0;
        this._bounceFactor = 0;
    }

    //properties
    Object.defineProperties(PhysicsSprite.prototype, {
        mass: {
            get: function() {
                return this._mass;
            },
            set: function (value) {
                this._mass = value
            }
        },
        velocity: {
            get: function() {
                return this._velocity;
            },
            set: function (x, y) {
                this._velocity.x = x;
                this._velocity.y = y;
            }
        },
        friction: {
            get: function() {
                return this._friction;
            },
            set: function (value) {
                this._friction = value
            }
        },
        bounceFactor: {
            set: function(value) {
                this._bounceFactor = value;
            }
        },
        movementStyle: {
            get: function () {
                return this._movementStyle;
            },
            set: function(value) {
                this._movementStyle = value;
            }
        }
    });

    //methods
    PhysicsSprite.prototype.merge({
        setGravity: function(value) {
            this._gameEngine.setGravity(value);
        },
        setVelocity: function (x, y) {
            this._velocityX = x;
            this._velocityY = y;
        }
    });

    return PhysicsSprite;
})();
