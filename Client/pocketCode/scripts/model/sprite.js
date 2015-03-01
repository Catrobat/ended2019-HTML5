/// <reference path="../core.js" />
/// <reference path="program.js" />
'use strict';

PocketCode.Model = {};

PocketCode.Model.Sprite = (function () {

    function Sprite(program, propObject) {
        this._program = program;
        this._onChange = program.onSpriteChange;
        this.running = false;

        this.id = undefined;
        this.name = "";
        this._looks = [];
        this._sounds = [];
        this._variables = {};
        this._variableNames = {};

        this._bricks = [];
        //TODO: if not each brick instance of RootContainerBrick throw error
        //attach to bricks onExecuted event, get sure all are executed an not running

        //property initialization
        //motion
        this._positionX = 0.0;
        this._positionY = 0.0;
        this._direction = 90.0; //pointing to right: 0° means up
        //sound
        //looks
        this._currentLook = undefined;
        this._size = 100.0;
        this._visible = true;
        this._transparency = 0.0;
        this._brightness = 100.0;
        //this._layer = -1;   //for background only? No!

        //events
        this._onExecuted = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Sprite.prototype, {
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
                return this._program.getSpriteLayer(this.id);
            },
        },

        //sound
        //sounds: {
        //    set: function (sounds) {
        //        ;
        //    },
        //},

        //looks
        looks: {
            set: function (looks) {
                if (!looks || typeof looks !== 'object' || !(looks instanceof Array) || looks.length === 0)
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

                for (i = 0, l = varArray.length; i < l; i++) {
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
        onExecuted: {
            get: function () { return this._onExecuted; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    Sprite.prototype.merge({
        start: function() {
            for (var i = 0, l = this.bricks.length; i < l; i++) {
                if (this.bricks[i].start)
                    this.bricks[i].start();
            }
            this.running = true;
        },
        pause: function () {
            for (var i = 0, l = this.bricks.length; i < l; i++) {
                if (this.bricks[i].pause)
                    this.bricks[i].pause();
            }
        },
        resume: function () {
            for (var i = 0, l = this.bricks.length; i < l; i++) {
                if (this.bricks[i].resume)
                    this.bricks[i].resume();
            }
        },
        stop: function () {
            for (var i = 0, l = this.bricks.length; i < l; i++) {
                if (this.bricks[i].stop)
                    this.bricks[i].stop();
            }
            this.running = false;
        },

        _triggerOnChange: function(propertyArray) {
            this._onChange.dispatchEvent({id: this.id, properties: propertyArray}, this);
        },

        //motion: position
        setPosition: function (x, y, triggerEvent) {
            triggerEvent = triggerEvent || true;    //default
            if (this._positionX === x && this._positionY === y)
                return false;
            this._positionX = x;
            this._positionY = y;
            if (triggerEvent)
                this._triggerOnChange([{ positionX: x }, { positionY: y }]);
            return true;
        },
        setPositionX: function (x) {
            if (this._positionX === x)
                return false;
            this._positionX = x;
            this._triggerOnChange([{ positionX: x }]);
            return true;
        },
        changePositionX: function (value) {
            if (!value || value === 0)
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
            if (!value || value === 0)
                return false;
            this._positionY += value;
            this._triggerOnChange([{ positionY: this._positionY }]);
            return true;
        },
        ifOnEdgeBounce: function () {
            return this._program.checkSpriteOnEdgeBounce(this.id, this);    //TODO: check parameters
            //onChange event is triggered by program in this case
        },
        move: function (steps) {
            if (!steps || steps === 0)
                return false;

            var rad = this.direction * (Math.PI / 180.0);
            var offsetX = Math.round(Math.sin(rad) * steps);
            var offsetY = Math.round(Math.cos(rad) * steps);
            this.setPosition(this._positionX + offsetX, this._positionY + offsetY);
            return true;
        },
        //motion:direction
        turnLeft: function (degree) {
            if (!degree)
                return false;
            return this.turnRight(degree * -1.0);
        },
        turnRight: function (degree) {
            if (!degree)// || degree === 0)
                return false;
            var d = this.direction;
            var nd = (d + degree) % 360;
            if (nd < -180.0)
                nd += 360;
            if (nd > 180.0)
                nd -= 360;
            if (d === nd)
                return false;

            this.direction = nd;
            this._triggerOnChange([{ direction: nd }]);
            return true;
        },
        setDirection: function (degree, triggerEvent) {
            triggerEvent = triggerEvent || true;    //default
            if (!degree || this.direction === degree)
                return false;

            this.direction = degree;
            if (triggerEvent)
                this._triggerOnChange([{ direction: degree }]);
            return true;
        },
        pointTo: function (spriteId) {
            return false;
            //TODO: point to undefined until implementation

            var pointTo = this._program.getSprite(spriteId);
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
            return this._program.setSpriteLayerBack(this.id, layers);
            //onChange event is triggered by program in this case
        },
        comeToFront: function () {
            return this._program.setSpriteLayerToFront(this.id);
            //onChange event is triggered by program in this case
        },

        //looks
        setLook: function (lookId) {
            return false;
            //TODO: current look undefined due to missing implementation

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
            return false;
            //TODO: current look undefined due to missing implementation

            var looks = this._looks;
            var count = looks.length;
            if (count < 2)
                return false;

            var look;
            for (var i = 0; i < count; i++) {
                if (this._currentLook === looks[i]) {
                    if ((i + 1) < count) {
                        this._currentLook = looks[i];
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
            if (!percentage || this._size === percentage || (this._size === 0 && percentage <= 0))
                return false;

            this._size = percentage;
            if (this._size < 0)
                this._size = 0;
            this._triggerOnChange([{ size: this._size }]);
            return true;
        },
        changeSize: function (value) {  //TODO: checkout default behaviour on <0
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
        setTransparency: function (percentage) {  //TODO: checkout default behaviour on <0 & >100
            if (!percentage)
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
        changeTransparency: function (value) {  //TODO: checkout default behaviour on <0 & >100
            if (!value)
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
        setBrightness: function (percentage) {  //TODO: checkout default behaviour on <0 & >100
            if (!percentage)
                return false;

            if (percentage < 0.0)
                percentage = 0.0;
            if (percentage > 100.0)
                percentage = 100.0;

            if (this._brightness === percentage)
                return false;


            this._brightness = percentage;
            this._triggerOnChange([{ brightness: percentage }]);
            return true;
        },
        changeBrightness: function (value) {  //TODO: checkout default behaviour on <0 & >100
            if (!value)
                return false;

            value = this._brightness + value;
            if (value < 0.0)
                value = 0.0;
            if (value > 100.0)
                value = 100.0;

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
                return this._program.getGlobalVariable(varId);
        },
        getVariableNames: function () {
            //clone
            var variableNames = {};
            var names = this._variableNames;
            for (var v in names)
                if (names.hasOwnProperty(v))
                    variableNames[v] = names[v];
            //include global variables
            variableNames.merge(this._program.getGlobalVariableNames());
            return variableNames;
        },
        //setVariable: function (varId, value) {
        //    if (this._variables[varId])
        //        this._variables[varId].value = value;
        //    else //gloable lookup
        //        return this._program.setGlobalVariable(varId, value);
        //},
    });

    return Sprite;
})();