/// <reference path="../core.js" />
'use strict';

PocketCode.Model = {};

PocketCode.Model.Sprite = (function () {

    function Sprite(program, propObject) {
        this._program = program;
        this.running = false;

        this.id = undefined;
        this.name = "";
        this.looks = [];
        this.sounds = [];
        this._variables = {};
        this._variableNames = {};

        this._bricks = [];
        //TODO: if not each brick instance of RootContainerBrick throw error
        //attach to bricks onExecuted event, get sure all are executed an not running

        //events
        this._onExecuted = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Sprite.prototype, {
        positionX: {
            get: function () {
                //TODO

            },
        },
        positionY: {
            get: function () {
                //TODO

            },
        },

        //variables
        variables: {    //[{id: [id], name: [name]}, ... ]
            set: function (varArray) {
                if (!(varArray instanceof Array))
                    throw new Error('variable setter expects type Array');

                for (i = 0, l = varArray.length; i < l; i++) {
                    varArray[i].value = 0;  //init
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

        //motion: position
        setPosition: function (x, y) {
            //TODO:
            return true;
        },
        setPositionX: function (x) {
            //TODO:
            return true;
        },
        changePositionX: function (value) {
            //TODO:
            return true;
        },
        setPositionY: function (y) {
            //TODO:
            return true;
        },
        changePositionY: function (value) {
            //TODO:
            return true;
        },
        ifOnEdgeBounce: function () {
            //TODO:
            return true;
        },
        move: function (steps) {
            //TODO:
            return true;
        },
        //motion:direction
        turnLeft: function (degree) {
            //TODO:
            return true;
        },
        turnRight: function (degree) {
            //TODO:
            return true;
        },
        setDirection: function (degree) {
            //TODO:
            return true;
        },
        pointTo: function (brickId) {
            //TODO:
            return true;
        },
        //motion: layer
        goBack: function (layers) {
            //TODO:
            return true;
        },
        comeToFront: function () {
            //TODO:
            return true;
        },

        //looks:
        setLook: function (lookId) {
            //TODO:
            return true;
        },
        nextLook: function () {
            //TODO:
            return true;
        },
        setSize: function(percentage) {
            //TODO:
            return true;
        },
        changeSize: function(value) {
            //TODO:
            return true;
        },
        hide: function () {
            //TODO:
            return true;
        },
        show: function () {
            //TODO:
            return true;
        },
        setTransparency: function(percentage) {
            //TODO:
            return true;
        },
        changeTransparency: function(value) {
            //TODO:
            return true;
        },
        setBrightness: function(percentage) {
            //TODO:
            return true;
        },
        changeBrightness: function(value) {
            //TODO:
            return true;
        },
        cleadGraphicEffects: function () {
            //TODO:
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