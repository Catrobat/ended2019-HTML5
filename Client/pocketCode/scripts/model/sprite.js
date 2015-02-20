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
        this.variables = [];

        this._bricks = [];
        //TODO: if not each brick instance of RootContainerBrick throw error
        //attach to bricks onExecuted event, get sure all are executed an not running

        //events
        this._onExecuted = new SmartJs.Event.Event(this);
    }

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
            //todo implement this
            //if not local (in this sprite) get global by
            //return this._program.getGlobalVariable()
        },
        setVariable: function (varId, value) {
            //if not local (in this sprite) get global by
            //this._program.getGlobalVariable().value = value;
        },
    });

    return Sprite;
})();