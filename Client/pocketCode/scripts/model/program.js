/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/soundManager.js" />
'use strict';

PocketCode.Model.Program = (function () {

    function Program(id) {
        this._executionState = PocketCode.ExecutingState.STOPPED;
        this._paused = false;
        this.minLoopCycleTime = 25; //ms

        this._id = id;
        this.title = "";
        this.description = "";
        this.author = "";
        this.height = 0;
        this.width = 0;

        //to have the same layer value as in catroid
        this.backgroundOffset = 2;

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

                for (var i = 0, l = images.length; i < l; i++)
                    this._images[images[i].id] = images[i];
            },
            //enumerable: false,
            //configurable: true,
        },
        sounds: {
            set: function (sounds) {
                if (!(sounds instanceof Array))
                    throw new Error('setter expects type Array');

                for (var i = 0, l = sounds.length; i < l; i++)
                    this._sounds[sounds[i].id] = sounds[i];

                this._soundManager.init(sounds);
            },
            //enumerable: false,
            //configurable: true,
        },
        variables: {
            set: function (variables) {
                if (!(variables instanceof Array))
                    throw new Error('setter expects type Array');

                for (var i = 0, l = variables.length; i < l; i++) {
                    //varArray[i].value = 0;  //init //possibly todo - we will see
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
            if (this._executionState === PocketCode.ExecutingState.RUNNING)
                return;
            if (!this.background && this.sprites.length === 0)
                throw new Error('no program loaded');

            this.background.start();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].start();
            }

            this._executionState = PocketCode.ExecutingState.RUNNING;
            this.onProgramStart.dispatchEvent();
        },
        restart: function () {
            this.stop();
            this.start();
        },
        pause: function () {
            if (this._executionState !== PocketCode.ExecutingState.RUNNING || this._executionState === PocketCode.ExecutingState.PAUSED)//(!this._running || this._paused)
                return;

            this._soundManager.pauseSounds();
            this.background.pause();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].pause();
            }
            //this._paused = true;
            this._executionState = PocketCode.ExecutingState.PAUSED;
        },
        resume: function () {
            if (this._executionState !== PocketCode.ExecutingState.PAUSED)//(!this._paused)
                return;

            this._soundManager.resumeSounds();
            this.background.resume();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].resume();
            }
            //this._paused = false;
            this._executionState = PocketCode.ExecutingState.RUNNING;
        },
        stop: function () {
            this._soundManager.stopAllSounds();
            this.background.stop();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].stop();
            }
            this._executionState = PocketCode.ExecutingState.STOPPED;
            //this._running = false;
            //this._paused = false;
        },

        _spriteOnExecudedHandler: function (e) {
            //TODO: add handler to sprites on init
            //check all sprites if running
            //dispatch program.onExecuted event
        },

        //Brick-Sprite Interacttion
        getSprite: function (spriteId) {
            return this.sprites.filter(function (sprite) {return sprite.id === spriteId;})[0];
        },
        getSpriteLayer: function (spriteId) {
            return this.sprites.indexOf(this.getSprite(spriteId)) + this.backgroundOffset;
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
        setSpriteLayerBack: function (spriteId) {
            //TODO handle undefined spriteId
            var currentPosition = this.getSpriteLayer(spriteId) - this.backgroundOffset;
            var sprites = this.sprites;
            if (currentPosition === 0)
                return false;

            var nextSprite = sprites[currentPosition - 1];
            sprites[currentPosition - 1] = sprites[currentPosition];
            sprites[currentPosition] = nextSprite;

            var ids = [];
            for (var i = 0, l = sprites.length; i < l; i++) {
                ids.push(sprites[i]);
            }
            this._onSpriteChange.dispatchEvent({ id: spriteId, properties: { layer: ids } }, this.getSprite(spriteId));    //TODO: check event arguments
            return true;
        },
        setSpriteLayerToFront: function (spriteId) {
            //TODO handle undefined spriteId
            var currentPosition = this.getSpriteLayer(spriteId) - this.backgroundOffset;
            var sprites = this.sprites;
            console.log(this.sprites);

            if(currentPosition === sprites.length - 1)
                return false;
            var spriteToSetToFront = sprites[currentPosition];
            sprites.splice(currentPosition, 1);
            sprites.push(spriteToSetToFront);
            console.log(this.sprites);

            var ids = [];
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