/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="program.js" />
'use strict';

/**
 * @fileOverview Sprite: This file contains every relevant functionality of a sprite
 * @author catrobat HTML5 team
 */

/**
 * @namespace Model
 * @type {{}|*}
 */
PocketCode.Model = PocketCode.Model || {};

/**
 * RotationStyles
 * @type {{DO_NOT_ROTATE: string, LEFT_TO_RIGHT: string, ALL_AROUND: string}}
 */
PocketCode.RotationStyle = {
    DO_NOT_ROTATE: 'don\'t rotate',
    LEFT_TO_RIGHT: 'left-right',
    ALL_AROUND: 'all around',
};

/**
 * GraphicEffects
 * @type {{COLOR: string, FISHEYE: string, WHIRL: string, PIXELATE: string, MOSAIC: string, BRIGHTNESS: string, GHOST: string}}
 */
PocketCode.GraphicEffect = {
    COLOR: 'color',
    FISHEYE: 'fisheye',
    WHIRL: 'whirl',
    PIXELATE: 'pixelate',
    MOSAIC: 'mosaic',
    BRIGHTNESS: 'brightness',
    GHOST: 'ghost',     //opacity, transparency
};
/**
 * @class Sprite whole functionality of a sprite object
 * @property {PocketCode.ExecutingState} _executionState states if sprite is running/stopped
 * @property {String} id indicates the id of the sprite
 * @property {String} name indicates the name of the sprite
 * @property {PocketCode.GameEngine} _gameEngine reference to gameEngine object
 * @property {Array} _looks list of looks
 * @property {Array} _sounds list of sounds
 * @property {number} _onChange maps events to gameEngine.onSpriteChange
 * @property {Array} _variables set of variables
 * @property {Array} _variableNames set of varialbe names
 * @property {Array} _bricks list of bricks
 * @property {number} _positionX horizontal position
 * @property {number} _positionY vertical position
 * @property {number} _direction indicates the direction the sprite points to in degree
 * @property {Object} _currentLook indicates the current look of the sprite
 * @property {number} _size indicates the size of the sprite
 * @property {boolean} _visible indicates whether the sprite is visible or not
 * @property {number} _transparency transparency value of the sprite
 * @property {number} _brightness brightness value of the sprite
 * @property {SmartJs.Event} _onExecuted indicates whether the sprite has been executed
 *
 *
 */
PocketCode.Model.Sprite = (function () {
    Sprite.extends(SmartJs.Core.Component);
    /**
     * initialization of properties
     * @param gameEngine gameEngine instance as a reference
     * @param propObject object which can contains properties
     */
    function Sprite(gameEngine, propObject) {

        this._gameEngine = gameEngine;
        this._onChange = gameEngine.onSpriteChange;    //mapping event (defined in gameEngine)
        //this._executionState = PocketCode.ExecutionState.STOPPED;
        this.id = undefined;
        this.name = "";
        this._looks = [];
        this._sounds = [];
        this._variables = {};
        this._variableNames = {};
        this._bricks = [];

        //attach to bricks onExecuted event, get sure all are executed an not running
        //property initialization
        //motion
        this._positionX = 0.0;
        this._positionY = 0.0;
        this._direction = 90.0; //pointing to right: 0� means up
        //sound
        //looks
        this._currentLook = undefined;
        this._size = 100.0;
        this._visible = true;
        this._transparency = 0.0;
        this._brightness = 100.0;

        //events
        this._onExecuted = new SmartJs.Event.Event(this);

        if (!propObject || !propObject.id || !propObject.name)
            throw new Error('missing ctr arguments: id and/or name in sprite');

        this.id = propObject.id;
        this.name = propObject.name;

        //looks: a sprite doesn't always have a look
        if (propObject.looks != undefined)
            this.looks = propObject.looks;

        //variables: a sprite may have no (local) variables
        if (propObject.variables)
            this.variables = propObject.variables;

        //sounds
        if (propObject.sounds) {
            if (!(propObject.sounds instanceof Array))
                throw new Error('sounds setter expects type Array');

            for (var i = 0, l = propObject.sounds.length; i < l; i++) {
                this._sounds[propObject.sounds[i].id] = propObject.sounds[i];
            }
        }

        //bricks
        if (propObject.bricks) {
            this.bricks = propObject.bricks;
        }
    }

    Object.defineProperties(Sprite.prototype, {
        rotationStyle: {
            value: PocketCode.RotationStyle.ALL_AROUND,   //static property (right now)
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
            set: function (direction) {
                this._direction = direction;
            },
            get: function () {
                return this._direction;
            },
        },
        layer: {
            set: function (layer) {
                //TODO: in program : for testing issues
                // this._layer = layer;
            },
            get: function () {
                return this._gameEngine.getSpriteLayer(this.id);
            },
        },

        bricks: {
            set: function (bricks) {
                if (!(bricks instanceof Array))
                    throw new Error('bricks setter expects type Array');

                for (var i = 0, l = bricks.length; i < l; i++) {
                    this._bricks.push(this._gameEngine._brickFactory.create(this, bricks[i])); //TODO: brickfactory is PRIVATE
                }
            },
            //get: function () {
            //    return this._bricks;
            //},
        },

        //looks
        looks: {
            set: function (looks) {
                if (!(looks instanceof Array))// || looks.length === 0)    //looks === undefined || typeof looks !== 'object' || 
                    throw new Error('invalid argument: expected looks type of array');

                this._looks = looks;
                if (looks.length > 0)
                    this._currentLook = looks[0];
            }
        },
        currentLook: {
            get: function () {
                return this._currentLook;
            },
        },
        size: {     //percentage
            get: function () {
                return this._size;
            },
        },
        visible: {
            get: function () {
                return this._visible;
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

        //variables
        variables: {    //[{id: [id], name: [name]}, ... ]
            set: function (varArray) {
                if (!(varArray instanceof Array))
                    throw new Error('variable setter expects type Array');

                for (var i = 0, l = varArray.length; i < l; i++) {
                    varArray[i].value = 0.0;  //init
                    this._variables[varArray[i].id] = varArray[i];
                    this._variableNames[varArray[i].id] = { name: varArray[i].name, scope: 'local' };
                }
            },
            //enumerable: false,
            //configurable: true,
        },
        hasRunningScripts: {
            get: function () {
                return false;   //TODO: check this
            },
        },
    });

    //events
    Object.defineProperties(Sprite.prototype, {
        /**
         * @event
         * returns the onSpriteChange of gameEngine
         */
        onChange: {
            get: function () { return this._gameEngine.onSpriteChange; },
        },
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
        ///**
        // * calls execute() on every brick as long as method is available
        // */
        //execute: function() {
        //    for (var i = 0, l = this._bricks.length; i < l; i++) {
        //        if (this._bricks[i].execute) {
        //            this._bricks[i].execute();
        //        }
        //    }
        //    this._executionState =  PocketCode.ExecutionState.RUNNING;
        //},
        /**
         * calls pause() on every brick as long as method is available
         */
        pause: function () {
            var bricks = this._bricks;
            for (var i = 0, l = bricks.length; i < l; i++) {
                if (bricks[i].pause)
                    bricks[i].pause();
            }
            //this._executionState = PocketCode.ExecutionState.PAUSED;
        },
        /**
         * calls resume() on every brick as long as method is available
         */
        resume: function () {
            var bricks = this._bricks;
            for (var i = 0, l = bricks.length; i < l; i++) {
                if (bricks[i].resume)
                    bricks[i].resume();
            }
            //this._executionState = PocketCode.ExecutionState.RUNNING;
        },
        /**
         * calls stop() on every brick as long as method is available
         */
        stop: function () {
            var bricks = this._bricks;
            for (var i = 0, l = bricks.length; i < l; i++) {
                if (bricks[i].stop)
                    bricks[i].stop();
            }
            //this._executionState = PocketCode.ExecutionState.STOPPED;
        },

        /**
         * @event
         * @param propertyArray
         * @private
         */
        _triggerOnChange: function (propertyArray) {
            this._onChange.dispatchEvent({ id: this.id, properties: propertyArray }, this);
        },

        //motion: position
        /**
         * sets the position(x,y) of the sprite
         * @param {number} x
         * @param {number} y
         * @param {triggerEvent
         * @returns {boolean}
         */
        setPosition: function (x, y, triggerEvent) {
            triggerEvent = triggerEvent || true;    //default
            if (this._positionX === x && this._positionY === y)
                return false;

            var ops = [];
            if (this._positionX != x) {
                this._positionX = x;
                ops.push({ positionX: x });
            }
            if (this._positionY != y) {
                this._positionY = y;
                ops.push({ positionY: y });
            }
            if (triggerEvent)
                this._triggerOnChange(ops);
            return true;
        },
        /**
         * sets the x position of the sprite
         * @param {number} x
         * @returns {boolean}
         */
        setPositionX: function (x) {
            if (this._positionX === x)
                return false;
            this._positionX = x;
            this._triggerOnChange([{ positionX: x }]);
            return true;
        },
        /**
         * changes the x position of the sprite by a value
         * @param {number} value
         * @returns {boolean}
         */
        changePositionX: function (value) {
            if (!value)// || value === 0)
                return false;
            this._positionX += value;
            this._triggerOnChange([{ positionX: this._positionX }]);
            return true;
        },
        /**
         * sets the y position of the sprite
         * @param {number} y
         * @returns {boolean}
         */
        setPositionY: function (y) {
            if (this._positionY === y)
                return false;
            this._positionY = y;
            this._triggerOnChange([{ positionY: y }]);
            return true;
        },
        /**
         * changes the y position of the sprite by a value
         * @param {number} value
         * @returns {boolean}
         */
        changePositionY: function (value) {
            if (!value)// || value === 0)
                return false;
            this._positionY += value;
            this._triggerOnChange([{ positionY: this._positionY }]);
            return true;
        },
        /**
         * checks if sprite flips at the edge
         * @returns {*}
         */
        ifOnEdgeBounce: function () {
            return this._gameEngine.checkSpriteOnEdgeBounce(this.id, this);    //TODO: check parameters
            //onChange event is triggered by program in this case
        },
        /**
         * moves the sprite "value" steps in the direction of the current direction
         * @param {number} steps
         * @returns {boolean}
         */
        move: function (steps) {
            if (!steps)// || steps === 0)
                return false;

            var rad = this.direction * (Math.PI / 180.0);
            var offsetX = Math.round(Math.sin(rad) * steps);
            var offsetY = Math.round(Math.cos(rad) * steps);
            var triggerEvent;
            this.setPosition(this._positionX + offsetX, this._positionY + offsetY, triggerEvent);
            return true;
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
            return this.turnRight(degree * -1.0);
        },
        /**
         * turns the sprite "value" degree right
         * @param degree
         * @returns {boolean}
         */
        turnRight: function (degree) {
            if (!degree)
                return false;
            var d = this._direction;
            var nd = (d + degree) % 360;
            if (nd <= -180.0) {
                nd += 360;
            }
            if (nd > 180.0) {
                nd -= 360;
            }
            if (d === nd)
                return false;

            this._direction = nd;
            this._triggerOnChange([{ direction: nd }]);
            return true;
        },
        /**
         * sets the direction of the sprite to degree value
         * @param {number} degree
         * @param triggerEvent
         * @returns {boolean}
         */
        setDirection: function (degree, triggerEvent) {
            triggerEvent = triggerEvent || true;    //default
            if (degree === undefined || this.direction === degree)
                return false;

            this.direction = degree;
            if (triggerEvent)
                this._triggerOnChange([{ direction: degree }]);
            return true;
        },
        /**
         * sets the direction of current sprite so that it points to a given sprite
         * @param spriteId
         * @returns {boolean}
         */
        pointTo: function (spriteId) {
            if (!spriteId)
                return false;
            var pointTo = this._gameEngine.getSprite(spriteId);
            if (pointTo == undefined)
                return false;

            var offsetX = pointTo.positionX - this.positionX;
            var offsetY = pointTo.positionY - this.positionY;

            if (offsetX === 0 && offsetY === 0)
                return false;

            this.direction = Math.atan2(offsetY, offsetX) * (180.0 / Math.PI);
            this._triggerOnChange([{ direction: this.direction }]);
            return true;
        },
        //motion: layer
        /**
         * sets the sprite "value" layers back
         * @param {number} layers
         * @returns {*}
         */
        goBack: function (layers) {
            return this._gameEngine.setSpriteLayerBack(this.id, layers);
            //onChange event is triggered by program in this case
        },
        /**
         * sets the layer of the sprite to the foremost one
         * @returns {*}
         */
        comeToFront: function () {
            return this._gameEngine.setSpriteLayerToFront(this.id);
            //onChange event is triggered by program in this case
        },

        //looks
        /**
         * sets the look of the sprite
         * @param lookId
         * @returns {boolean}
         */
        setLook: function (lookId) {
            if (this._currentLook == undefined) {
                // throw new Error('current look is invalid');
                return false;
            }

            if (this._currentLook.id === lookId)
                return false;
            var looks = this._looks;
            var look;
            for (var i = 0, l = looks.length; i < l; i++) {
                look = looks[i];
                if (look.id === lookId) {
                    this._currentLook = look;
                    this._triggerOnChange([{ look: look }]);
                    return true;
                }
            }
            throw new Error('look with id ' + lookId + ' could not be found');
        },
        /**
         * sets the current look of the sprite to the next one in the list
         * @returns {boolean}
         */
        nextLook: function () {
            if (this._currentLook == undefined) {
                //   throw new Error('current look is invalid');
                return false;
            }
            var looks = this._looks;
            var count = looks.length;
            if (count < 2)
                return false;
            var look;
            for (var i = 0; i < count; i++) {
                if (this._currentLook === looks[i]) {
                    if ((i + 1) < count) { //1+1=2 < 2    2<2
                        var j = i + 1;
                        this._currentLook = looks[j];
                    }
                    else {
                        this._currentLook = looks[0];
                    }
                    break;
                }
            }
            this._triggerOnChange([{ look: this._currentLook }]);
            return true;
        },
        /**
         * sets the size of the sprite with percentage "value"
         * @param {number} percentage
         * @returns {boolean}
         */
        setSize: function (percentage) {
            if (percentage === undefined || isNaN(percentage) || percentage == null)
                throw new Error('invalid percentage ');
            if (this._size === percentage || (this._size === 0 && percentage <= 0))
                return false;

            this._size = percentage;
            if (this._size < 0)
                this._size = 0;
            this._triggerOnChange([{ size: this._size }]);
            return true;
        },
        /**
         * changes the current size by "value"
         * @param {number} value
         * @returns {boolean}
         */
        changeSize: function (value) {  //TODO: checkout default behaviour on <0
            if (value === undefined || isNaN(value) || value == null)
                throw new Error('invalid value');
            if (!value || (this._size === 0 && (this._size + value) <= 0))
                return false;

            this._size += value;
            if (this._size < 0)
                this._size = 0;
            this._triggerOnChange([{ size: this._size }]);
            return true;
        },
        /**
         * sets the sprite as not visible
         * @returns {boolean}
         */
        hide: function () {
            if (!this._visible)
                return false;

            this._visible = false;
            this._triggerOnChange([{ visible: false }]);
            return true;
        },
        /**
         * sets the sprite as visible
         * @returns {boolean}
         */
        show: function () {
            if (this._visible)
                return false;

            this._visible = true;
            this._triggerOnChange([{ visible: true }]);
            return true;
        },
        /**
         * sets the graphicEffect of the sprite with a given effect and value of the effect
         * @param {PocketCode.GraphicEffect} effect
         * @param {number} value
         * @returns {*}
         */
        setGraphicEffect: function (effect, value) {
            if (value === undefined || isNaN(value)) {
                throw new Error('invalid value ');
                return false;
            }
            switch (effect) {
                case PocketCode.GraphicEffect.GHOST:    //=transparency
                    return this._setTransparency(value);
                    //break;
                case PocketCode.GraphicEffect.BRIGHTNESS:
                    return this._setBrightness(value);
                    //break;
                case PocketCode.GraphicEffect.COLOR:
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
            if (value === undefined || isNaN(value)) {
                throw new Error('invalid value: ');
                return false;
            }
            switch (effect) {
                case PocketCode.GraphicEffect.GHOST:    //=transparency
                    return this._changeTransparency(value);
                    //break;

                case PocketCode.GraphicEffect.BRIGHTNESS:
                    return this._changeBrightness(value);
                    //break;
                case PocketCode.GraphicEffect.COLOR:
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
        _setTransparency: function (percentage) {
            if (percentage === undefined)
                return false;

            if (percentage < 0.0)
                percentage = 0.0;
            if (percentage > 100.0)
                percentage = 100.0;

            if (this._transparency === percentage)
                return false;

            this._transparency = percentage;
            this._triggerOnChange([{ transparency: percentage }]);
            return true;
        },
        /* set to private and called from set/change graphic effect*/
        /**
         * changes the transparency of the sprite by the "value" percentage
         * @param {number} percentage
         * @returns {boolean}
         * @private
         */
        _changeTransparency: function (value) {
            if (value === undefined)
                return false;

            value = this._transparency + value;
            if (value < 0.0)
                value = 0.0;
            if (value > 100.0)
                value = 100.0;

            if (this._transparency === value)
                return false;

            this._transparency = value;
            this._triggerOnChange([{ transparency: value }]);
            return true;
        },
        /* set to private and called from set/change graphic effect*/
        /**
         * sets the brightness of the sprite by the "value" percentage
         * @param {number} percentage
         * @returns {boolean}
         * @private
         */
        _setBrightness: function (percentage) {
            if (percentage === undefined)
                return false;

            if (percentage < 0.0)
                percentage = 0.0;
            if (percentage > 200.0)
                percentage = 200.0;

            if (this._brightness === percentage)
                return false;

            this._brightness = percentage;
            this._triggerOnChange([{ brightness: percentage }]);
            return true;
        },
        /* set to private and called from set/change graphic effect*/
        /**
         * changes the transparency of the sprite by the "value" percentage
         * @param {number} percentage
         * @returns {boolean}
         * @private
         */
        _changeBrightness: function (value) {
            if (value === undefined)
                return false;

            value = this._brightness + value;
            if (value < 0.0)
                value = 0.0;
            if (value > 200.0)
                value = 200.0;

            if (this._brightness === value)
                return false;

            this._brightness = value;
            this._triggerOnChange([{ brightness: value }]);
            return true;
        },
        /**
         * clears all graphicEffects of the sprite
         * @returns {boolean}
         */
        clearGraphicEffects: function () {
            var ops = [];
            if (this._transparency === 0.0 && this._brightness === 100.0)
                return false;

            if (this._transparency != 0.0) {
                this._transparency = 0.0;
                ops.push({ transparency: 0.0 });
            }
            if (this._brightness != 100.0) {
                this._brightness = 100.0;
                ops.push({ brightness: 100.0 });
            }
            this._triggerOnChange(ops);
            return true;
        },

        //variables
        /**
         * returns the global variable with the given id
         * @param varId
         * @returns {*}
         */
        getVariable: function (varId) {
            if (this._variables[varId])
                return this._variables[varId];
            else //global lookup
                return this._gameEngine.getGlobalVariable(varId);
        },
        /**
         * returns all variable names
         * @returns {{}}
         */
        getVariableNames: function () {
            //clone
            var variableNames = {};
            var names = this._variableNames;
            for (var v in names)
                if (names.hasOwnProperty(v)) {
                    variableNames[v] = names[v];
                }

            //include global variables
            variableNames.merge(this._gameEngine.getGlobalVariableNames());
            return variableNames;
        },
        //setVariable: function (varId, value) {
        //    if (this._variables[varId])
        //        this._variables[varId].value = value;
        //    else //gloable lookup
        //        return this._gameEngine.setGlobalVariable(varId, value);
        //},
        /* override */
        dispose: function () {
            //make sure the game engine and loaded resources are not disposed
            this._gameEngine = undefined;
            this._looks = undefined;
            this._sounds = undefined;
            this._variables = undefined;
            this._variableNames = undefined;
            this._bricks = undefined;
            //call super
            SmartJs.Core.Component.prototype.dispose.call(this);
        },
    });

    return Sprite;
})();