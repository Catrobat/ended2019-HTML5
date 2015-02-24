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

        this._bricks = [];
        //TODO: if not each brick instance of RootContainerBrick throw error
        //attach to bricks onExecuted event, get sure all are executed an not running

        //events
        this._onExecuted = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Sprite.prototype, {
        variables: {
            set: function (varArray) {
                if (!(varArray instanceof Array))
                    throw new Error('variable setter expects type Array');

                for (i = 0, l = varArray.length; i < l; i++) {
                    varArray[i].value = 0;  //init
                    this._variables[varArray[i].id] = varArray[i];
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

        //looks:
        setLook: function (lookId) {
            //TODO:
        },
        hide: function () {
            //TODO:
        },
        show: function () {
            //TODO:
        },
        cleadGraphicEffects: function () {
                //TODO:
        },

        //variables
        getVariable: function (varId) {
            if (this._variables[varId])
                return this._variables[varId];
            else //gloable lookup
                return this._program.getGlobalVariable(varId);
        },
        getVariableNames: function () {
            var variables = {};
            //TODO: id: {name: ?, type: [local/global]} 
            variables.merge(this._program.getGlobalVariableNames());
            return variables;
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