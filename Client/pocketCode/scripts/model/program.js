/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/soundManager.js" />
'use strict';

PocketCode.Model.Program = (function () {

    function Program(id) {
        this._running = false;  //TODO: change to PocketCode.ExecutingState (core.js)
        this._paused = false;
        this.minLoopCycleTime = 25; //ms

        this._id = id;
        this.title = "";
        this.description = "";
        this.author = "";
        this.height = 0;
        this.width = 0;

        this.background = undefined;
        this.sprites = [];

        this.resourceBaseUrl = "";
        this._images = {};
        this._sounds = {};
        this._soundManager = new PocketCode.SoundManager(this._id);
        this._variables = {};
        this._variableNames = {};

        this._broadcasts = [];
        this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);

        //events
        this._onProgramStart = new SmartJs.Event.Event(this);
        this._onExecuted = new SmartJs.Event.Event(this);
        this._onSpriteChange = new SmartJs.Event.Event(this);
        this._onTabbedAction = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Program.prototype, {
        images: {
            set: function (images) {
                if (!(images instanceof Array))
                    throw new Error('setter expects type Array');

                for (i = 0, l = images.length; i < l; i++)
                    this._images[images[i].id] = images[i];
            },
            //enumerable: false,
            //configurable: true,
        },
        sounds: {   //TODO: Change this using the soundManager
            set: function (sounds) {
                if (!(sounds instanceof Array))
                    throw new Error('setter expects type Array');

                for (i = 0, l = sounds.length; i < l; i++)
                    this._sounds[sounds[i].id] = sounds[i];
            },
            //enumerable: false,
            //configurable: true,
        },
        variables: {
            set: function (variables) {
                if (!(variables instanceof Array))
                    throw new Error('setter expects type Array');

                for (i = 0, l = variables.length; i < l; i++) {
                    varArray[i].value = 0;  //init
                    this._variables[variables[i].id] = variables[i];
                    this._variableNames[variables[i].id] = { name: variables[i].name, scope: 'global' };
                }
            },
            //enumerable: false,
            //configurable: true,
        },
        broadcasts: {
            set: function (broadcasts) {
                if (!(broadcasts instanceof Array))
                    throw new Error('setter expects type Array');

                //for (i = 0, l = broadcasts.length; i < l; i++)
                //    this._broadcasts[broadcasts[i].id] = broadcasts[i];
                this._broadcasts = broadcasts;
                this._broadcastMgr.init(broadcasts);
            },
            //enumerable: false,
            //configurable: true,
        },
    });

    //events
    Object.defineProperties(Program.prototype, {
        onProgramStart: {
            get: function () { return this._onProgramStart; },
            //enumerable: false,
            //configurable: true,
        },
        onExecuted: {
            get: function () { return this._onExecuted; },
            //enumerable: false,
            //configurable: true,
        },
        onSpriteChange: {
            get: function () { return this._onSpriteChange; },
            //enumerable: false,
            //configurable: true,
        },
        onTabbedAction: {
            get: function () { return this._onTabbedAction; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    Program.prototype.merge({
        start: function () {
            //this._soundManager.pauseSounds(); //TODO: loading???
            if (this._running)
                return;
            if (!this.background && this.sprites.length === 0)
                throw new Error('no program loaded');

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].start();
            }
            this.onProgramStart.dispatchEvent();
        },
        restart: function () {
            this.stop();
            this.start();
        },
        pause: function () {
            this._soundManager.pauseSounds();
            if (!this._running || this._paused)
                return;

            this.background.pause();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].pause();
            }
            this._paused = true;
        },
        resume: function () {
            this._soundManager.resumeSounds();
            if (!this._paused)
                return;

            this.background.resume();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].resume();
            }
            this._paused = false;
        },
        stop: function () {
            this._soundManager.stopAllSounds();
            this.background.stop();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].stop();
            }
            this._running = false;
            this._paused = false;
        },

        _spriteOnExecudedHandler: function (e) {
            //TODO: add handler to sprites on init
            //check all sprites if running
            //dispatch program.onExecuted event
        },

        //Brick-Sprite Interacttion
        getSprite: function (spriteId) {
            //TODO: implement this
        },
        getSpriteLayer: function (spriteId) {
            return 1; //to enable testing formulas //TODO: implement this
        },
        checkSpriteOnEdgeBounce: function (spriteId, sprite) {  //TODO: check parameters
            //program viewport
            var h = this.height;
            var w = this.width;

            //TODO: implementation
            //this._triggerOnChange([{ positionX: this._positionX }, { positionY: this._positionY }, { direction: this._direction }]);
            //^^ only properties that really change
            return false;
        },
        setSpriteLayerBack: function (spriteId, layers) {   //TODO: check parameters- sprite?
            //TODO: implement logic, returns true or false: sprite layer changed?
            var ids = [];
            var sprites = this.sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                ids.push(sprites[i]);
            }
            this._onSpriteChange.dispatchEvent({ id: spriteId, properties: { layer: ids } }, this.getSprite(spriteId));    //TODO: check event arguments
            return true;
        },
        setSpriteLayerToFront: function (spriteId) {    //TODO: check parameters- sprite?
            //TODO: implement logic, returns true or false: sprite layer changed?
            var ids = [];
            var sprites = this.sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                ids.push(sprites[i]);
            }
            this._onSpriteChange.dispatchEvent({ id: spriteId, properties: { layers: ids } }, this.getSprite(spriteId));    //TODO: check event arguments
            return true;
        },

        //variables
        getGlobalVariable: function (varId) {
            if (this._variables[varId])
                return this._variables[varId];
            else
                throw new Error('unknown variable id: ' + varId);
        },
        getGlobalVariableNames: function () {
            return this._variableNames;
        }
        //setGlobalVariable: function (varId, value) {
        //    if (this._variables[varId])
        //        return this._variables[varId].value = value;
        //    else
        //        throw new Error('unknown variable id: ' + varId);
        //},
    });

    return Program;
})();