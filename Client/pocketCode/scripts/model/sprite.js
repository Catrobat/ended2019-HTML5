/// <reference path="../core.js" />
/// <reference path="program.js" />
'use strict';

/**
 * @fileOverview Sprite: This file contains
 * @author catrobat HTML5 team
 */

/**
 * @namespace Model
 * @type {{}|*}
 */
PocketCode.Model = PocketCode.Model || {};


PocketCode.RotationStyle = {
    DO_NOT_ROTATE: 'don\'t rotate',
    LEFT_TO_RIGHT: 'left-right',
    ALL_AROUND: 'all around',
};

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
 * @class Sprite balbalball
 * @property {number} running states if sprite is running
 * @property {number} id indicates the id of the sprite
 * @property {number} name indicates the name of the sprite
 * @property {number} name @default indicates the name of the sprite
 *
 */
PocketCode.Model.Sprite = (function () {
    /**
     * initializing bllablabl
     * @param gameEngine
     * @param propObject
     * @constructor
     */
    function Sprite(gameEngine, propObject) {

        this._gameEngine = gameEngine;
        this._onChange = gameEngine.onSpriteChange;    //mapping event (defined in gameEngine)
        this._executionState = PocketCode.ExecutingState.STOPPED;
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
    }

    //properties
    /**
     *
     */
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

        onChange: {
            get: function () { return this._gameEngine.onSpriteChange; },
        },
        //sound
        //sounds: {
        //    set: function (sounds) {
        //        ;
        //    },
        //},

        //bricks

        bricks: {
            set: function (bricks) {
                this._bricks = bricks;
            },
            get: function () {
                return this._bricks;
            },
        },

        //looks
        looks: {
            set: function (looks) {
                if (looks === undefined || typeof looks !== 'object' || !(looks instanceof Array) || looks.length === 0)
                    throw new Error('invalid argument: expected looks type of array');

                this._looks = looks;
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
    });

    //events
    Object.defineProperties(Sprite.prototype, {
        /**
         * @event
         *
         */
        onExecuted: {
            get: function () { return this._onExecuted; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    Sprite.prototype.merge({
        /**
         *
         */
        execute: function() {
            for (var i = 0, l = this._bricks.length; i < l; i++) {
                if (this._bricks[i].execute) {
                    this._bricks[i].execute();
                }
            }
            this._executionState =  PocketCode.ExecutingState.RUNNING;;
        },
        /**
         *
         */
        pause: function () {
            for (var i = 0, l = this._bricks.length; i < l; i++) {
                if (this._bricks[i].pause)
                    this._bricks[i].pause();
            }
        },
        resume: function () {
            for (var i = 0, l = this._bricks.length; i < l; i++) {
                if (this._bricks[i].resume)
                    this._bricks[i].resume();
            }
        },
        stop: function () {
            for (var i = 0, l = this._bricks.length; i < l; i++) {
                if (this._bricks[i].stop)
                    this._bricks[i].stop();
            }
            this._executionState = PocketCode.ExecutingState.STOPPED;
        },
        /**
         *
         * @param propertyArray
         * @private
         */
        _triggerOnChange: function(propertyArray) {
            this._onChange.dispatchEvent({id: this.id, properties: propertyArray}, this);
        },

        //motion: position
        /**
         *
         * @param x
         * @param y
         * @param triggerEvent
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
         *
         * @param x
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
         *
         * @param value
         * @returns {boolean}
         */
        changePositionX: function (value) {
            if (!value)// || value === 0)
                return false;
            this._positionX += value;
            this._triggerOnChange([{ positionX: this._positionX }]);
            return true;
        },
        setPositionY: function (y) {
            if (this._positionY === y)
                return false;
            this._positionY = y;
            this._triggerOnChange([{ positionY: y }]);
            return true;
        },
        changePositionY: function (value) {
            if (!value)// || value === 0)
                return false;
            this._positionY += value;
            this._triggerOnChange([{ positionY: this._positionY }]);
            return true;
        },
        ifOnEdgeBounce: function () {
            return this._gameEngine.checkSpriteOnEdgeBounce(this.id, this);    //TODO: check parameters
            //onChange event is triggered by program in this case
        },
        /**
         *
         * @param steps
         * @returns {boolean}
         */
        move: function (steps) {
            if (!steps)// || steps === 0)
                return false;

            var rad = this.direction * (Math.PI / 180.0);
            var offsetX = Math.round(Math.sin(rad) * steps);
            var offsetY = Math.round(Math.cos(rad) * steps);
            var triggerEvent;
            this.setPosition(this._positionX + offsetX, this._positionY + offsetY,triggerEvent);
            return true;
        },

        //motion:direction
        turnLeft: function (degree) {
            if (!degree)
                return false;
            return this.turnRight(degree * -1.0);
        },
        turnRight: function (degree) {
            if (!degree)
                return false;
            var d = this._direction;
            var nd = (d + degree) % 360;
            if (nd <= -180.0){
                nd += 360;
            }
            if (nd > 180.0){
                nd -= 360;
            }
            if (d === nd)
                return false;

            this._direction = nd;
            this._triggerOnChange([{ direction: nd }]);
            return true;
        },
        setDirection: function (degree, triggerEvent) {
            triggerEvent = triggerEvent || true;    //default
            if (degree === undefined || this.direction === degree)
                return false;

            this.direction = degree;
            if (triggerEvent)
                this._triggerOnChange([{ direction: degree }]);
            return true;
        },
        pointTo: function (spriteId) {
            if (!spriteId)
                return false;
            var pointTo = this._gameEngine.getSprite(spriteId);
            if(pointTo== undefined)
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
        goBack: function (layers) {
            return this._gameEngine.setSpriteLayerBack(this.id,layers);
            //onChange event is triggered by program in this case
        },
        comeToFront: function () {
            return this._gameEngine.setSpriteLayerToFront(this.id);
            //onChange event is triggered by program in this case
        },

        //looks
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
                        var j=i+1;
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
        setSize: function (percentage) {
            if (percentage === undefined || isNaN(percentage) || percentage==null)
                throw new Error('invalid percentage ');
            if( this._size === percentage || (this._size === 0 && percentage <= 0))
                return false;

            this._size = percentage;
            if (this._size < 0)
                this._size = 0;
            this._triggerOnChange([{ size: this._size }]);
            return true;
        },
        changeSize: function (value) {  //TODO: checkout default behaviour on <0
            if (value === undefined || isNaN(value) || value==null)
                throw new Error('invalid value');
            if (!value || (this._size === 0 && (this._size + value) <= 0))
                return false;

            this._size += value;
            if (this._size < 0)
                this._size = 0;
            this._triggerOnChange([{ size: this._size }]);
            return true;
        },
        hide: function () {
            if (!this._visible)
                return false;

            this._visible = false;
            this._triggerOnChange([{ visible: false }]);
            return true;
        },
        show: function () {
            if (this._visible)
                return false;

            this._visible = true;
            this._triggerOnChange([{ visible: true }]);
            return true;
        },
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
        getVariable: function (varId) {
            if (this._variables[varId])
                return this._variables[varId];
            else //global lookup
                return this._gameEngine.getGlobalVariable(varId);
        },
        getVariableNames: function () {
            //clone
            var variableNames = {};
            var names = this._variableNames;
            for (var v in names)
                if (names.hasOwnProperty(v)){
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
    });

    return Sprite;
})();