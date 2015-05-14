/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/soundManager.js" />
'use strict';

PocketCode.GameEngine = (function () {

    function GameEngine() {
        this._executionState = PocketCode.ExecutingState.STOPPED;
        this.minLoopCycleTime = 25; //ms
        this.soundsLoaded = false;
        this.bricksLoaded = false;
        this.projectReady = false;

        this._id = "";
        this.title = "";
        this.description = "";
        this.author = "";
        this.height = 0;
        this.width = 0;

        //to have the same layer value as in catroid
        this.backgroundOffset = 1;

        this.background = undefined;
        this.sprites = [];

        this.resourceBaseUrl = "";
        this._layerObjectList = [];

        this._images = {};
        this._sounds = {};
        this._soundManager = new PocketCode.SoundManager(this._id);
        this._variables = {};
        this._variableNames = {};

        this._broadcasts = [];
        this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);
        this._brickFactory = new PocketCode.BrickFactory();

        //events
        this._onProgramStart = new SmartJs.Event.Event(this);
        this._onExecuted = new SmartJs.Event.Event(this);
        this._onSpriteChange = new SmartJs.Event.Event(this);
        this._onTabbedAction = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(GameEngine.prototype, {
        layerObjectList: {
            get: function () {
                this._layerObjectList = this.sprites.slice();
                this._layerObjectList.unshift(this.background);
                return this._layerObjectList;
            }
        },
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
                    //varArray[i].value = 0;  //init
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
    Object.defineProperties(GameEngine.prototype, {
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
    GameEngine.prototype.merge({
        loadProject: function (jsonProject) {
            this.soundsLoaded = false;
            this.bricksLoaded = false;

            this.projectReady = false;
            this._id = jsonProject.id;
            this.title = jsonProject.header.title;
            this.description = jsonProject.header.description;
            this.author = jsonProject.header.author;

            //cleanup
            this._images = {};
            this._sounds = {};
            this.background = undefined;
            this.sprites = [];
            this._executionState = PocketCode.ExecutingState.STOPPED;
            this._variables = {};
            this._variableNames = {};
            this._broadcasts = [];
            this._soundManager = new PocketCode.SoundManager(this._id);
            if (!this._soundManager.supported) {
                //todo handle unsupported mp3 playback
                this.soundsLoaded = true;
            }

            var gameEngine = this;

            this._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(function (e) {
                //todo handle missing sounds so that project does not get stuck loading
                //throw new Error("Could not load sound" + e.src);
            }));

            this._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(function (e) {
                if (e.progress === 100) {
                    gameEngine.soundsLoaded = true;
                    if (gameEngine.bricksLoaded) {
                        gameEngine.projectReady = true;
                    }
                }
            }));

            this.images = jsonProject.images;
            this.sounds = jsonProject.sounds;
            if (jsonProject.sounds.length <= 0)
                this.soundsLoaded = true;

            this.broadcasts = jsonProject.broadcasts;
            this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);
            this.variables = jsonProject.variables;

            var device = new PocketCode.Device(this._soundManager);
            var bricksCount = jsonProject.header.bricksCount;
            if (bricksCount <= 0)
                this.bricksLoaded = true;
            this._brickFactory = new PocketCode.BrickFactory(device, this, this._broadcastMgr, this._soundManager, bricksCount);
            this._brickFactory.onProgressChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                if (e.progress === 100) {
                    gameEngine.bricksLoaded = true;
                    if (gameEngine.soundsLoaded) {
                        gameEngine.projectReady = true;
                    }
                }
            }));

            //console.log(jsonProject.background);
            this.background = new PocketCode.Model.Sprite(this, jsonProject.background);

            for (var i = 0, l = jsonProject.sprites.length; i < l; i++) {
                this.sprites.push(new PocketCode.Model.Sprite(this, jsonProject.sprites[i]));
            }

            for (i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecudedHandler, this));
            }
        },

        execute: function () {
            if (this._executionState === PocketCode.ExecutingState.RUNNING)
                return;
            if (!this.background && this.sprites.length === 0 || !this.projectReady)
                throw new Error('no project loaded');

            this.background.execute();

            for (var i = 0, l = this.sprites.length; i < l; i++) {
                this.sprites[i].execute();
            }

            this._executionState = PocketCode.ExecutingState.RUNNING;
            //todo
            this.background.status = PocketCode.ExecutingState.RUNNING;
            this.onProgramStart.dispatchEvent();
        },

        restart: function () {
            this.stop();
            this.execute();
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
            //TODO:
            //check all sprites if running
            //dispatch program.onExecuted event
        },

        //Brick-Sprite Interacttion
        getSprite: function (spriteId) {
            var sprite = this.sprites.filter(function (sprite) { return sprite.id === spriteId; })[0];
            if (!sprite)
                throw new Error('unknown sprite with id: ' + spriteId);
            return sprite;
        },

        getSpriteLayer: function (spriteId) {
            return this.layerObjectList.indexOf(this.getSprite(spriteId));
        },

        setSpriteLayerBack: function (spriteId, layers) {
            var currentPosition = this.getSpriteLayer(spriteId) - this.backgroundOffset;

            if (layers <= 0 || currentPosition <= 0)
                return false;

            var sprites = this.sprites;
            var currentSprite = this.sprites[currentPosition];
            sprites.remove(currentSprite);

            var newPosition = currentPosition - layers;
            if (newPosition < 0)
                newPosition = 0;
            sprites.insert(currentSprite, newPosition);


            var ids = [];
            for (var i = 0, l = sprites.length; i < l; i++) {
                ids.push(sprites[i]);
            }
            this._onSpriteChange.dispatchEvent({ id: spriteId, properties: { layer: ids } }, this.getSprite(spriteId));    //TODO: check event arguments
            return true;
        },

        setSpriteLayerToFront: function (spriteId) {
            var currentPosition = this.getSpriteLayer(spriteId) - this.backgroundOffset;

            var sprites = this.sprites;

            if (currentPosition === sprites.length - 1)
                return false;
            var spriteToSetToFront = sprites[currentPosition];
            sprites.splice(currentPosition, 1);
            sprites.push(spriteToSetToFront);

            var ids = [];
            for (var i = 0, l = sprites.length; i < l; i++) {
                ids.push(sprites[i]);
            }
            this._onSpriteChange.dispatchEvent({ id: spriteId, properties: { layers: ids } }, this.getSprite(spriteId));    //TODO: check event arguments
            return true;
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

    return GameEngine;
})();