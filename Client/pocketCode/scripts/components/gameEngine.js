/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/soundManager.js" />
'use strict';

PocketCode.GameEngine = (function () {
    GameEngine.extends(SmartJs.Core.Component);

    function GameEngine() {
        this._executionState = PocketCode.ExecutionState.STOPPED;
        this.minLoopCycleTime = 25; //ms        //TODO:
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
        this._backgroundOffset = 1; //TODO: overhead???

        this._background = undefined;
        this._sprites = [];

        this.resourceBaseUrl = "";
        //this._layerObjectList = [];

        this._images = {};
        this._sounds = {};
        this._soundManager = new PocketCode.SoundManager(this._id);
        this.__variables = {};
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
                //this._layerObjectList = this._sprites.slice();
                //this._layerObjectList.unshift(this._background);
                //return this._layerObjectList;
                return [this._background].concat(this._sprites);    //TODO ??? 
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
        _variables: {
            set: function (variables) {
                if (!(variables instanceof Array))
                    throw new Error('setter expects type Array');

                for (var i = 0, l = variables.length; i < l; i++) {
                    //varArray[i].value = 0;  //init
                    this.__variables[variables[i].id] = variables[i];
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
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                this.stopProject();

            this.soundsLoaded = false;
            this.bricksLoaded = false;

            this.projectReady = false;
            this._id = jsonProject.id;
            this.title = jsonProject.header.title;
            this.description = jsonProject.header.description;
            this.author = jsonProject.header.author;

            //cleanup
            //this._images = {};
            //this._sounds = {};
            if (this._background)
                this._background.dispose();// = undefined;
            this._sprites.dispose();
            this._executionState = PocketCode.ExecutionState.STOPPED;
            //this.__variables = {};
            this._variableNames = {};
            //this._broadcasts = [];
            this._soundManager = new PocketCode.SoundManager(this._id);
            if (!this._soundManager.supported) {
                //todo handle unsupported mp3 playback
                this.soundsLoaded = true;
            }

            this._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._soundManagerOnLoadingErrorHandler, this));
            this._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._soundManagerOnLoadingProgressHandler, this));

            this.images = jsonProject.images || [];
            this.sounds = jsonProject.sounds || [];
            if (jsonProject.sounds.length == 0) // && !Object.keys(this._sounds).length)//this._sounds.length === 0)
                this.soundsLoaded = true;

            this._broadcasts = jsonProject.broadcasts || [];
            this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);
            this._variables = jsonProject.variables || {};

            var device = new PocketCode.Device(this._soundManager);
            var bricksCount = jsonProject.header.bricksCount;
            if (bricksCount <= 0)
                this.bricksLoaded = true;
            this._brickFactory = new PocketCode.BrickFactory(device, this, this._broadcastMgr, this._soundManager, bricksCount);
            this._brickFactory.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._brickFactoryOnProgressChangeHandler, this));

            //console.log(jsonProject.background);
            this._background = new PocketCode.Model.Sprite(this, jsonProject.background);

            var sp = jsonProject.sprites;
            for (var i = 0, l = sp.length; i < l; i++) {
                this._sprites.push(new PocketCode.Model.Sprite(this, sp[i]));   //TODO: use array.concat?
            }

            sp = this._sprites;
            for (i = 0, l = sp.length; i < l; i++) {
                sp[i].onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            }

            this._projectLoaded = true;
        },
        _soundManagerOnLoadingErrorHandler: function (e) {
            //todo handle missing sounds so that project does not get stuck loading
            //throw new Error("Could not load sound" + e.src);
        },
        _soundManagerOnLoadingProgressHandler: function (e) {
            if (e.progress === 100) {
                this.soundsLoaded = true;
                if (this.bricksLoaded) {
                    this.projectReady = true;
                }
            }
        },
        _brickFactoryOnProgressChangeHandler: function (e) {
            if (e.progress === 100) {
                this.bricksLoaded = true;
                if (this.soundsLoaded) {
                    this.projectReady = true;
                }
            }
        },
        runProject: function () {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (!this._projectLoaded)//this._background && this._sprites.length === 0 || !this.projectReady)    -> in theory there do not have to be a sprite or beackground
                throw new Error('no project loaded');

            //this._background.execute();

            //for (var i = 0, l = this._sprites.length; i < l; i++) {
            //    this._sprites[i].execute();
            //}

            this._executionState = PocketCode.ExecutionState.RUNNING;
            this.onProgramStart.dispatchEvent();
        },

        restartProject: function () {
            this.stopProject();
            this.runProject();
        },

        pauseProject: function () {
            if (this._executionState !== PocketCode.ExecutionState.RUNNING || this._executionState === PocketCode.ExecutionState.PAUSED)//(!this._running || this._paused)
                return;

            this._soundManager.pauseSounds();
            if (this._background)
                this._background.pauseScripts();

            for (var i = 0, l = this._sprites.length; i < l; i++) {
                this._sprites[i].pauseScripts();
            }
            //this._paused = true;
            this._executionState = PocketCode.ExecutionState.PAUSED;
        },

        resumeProject: function () {
            if (this._executionState !== PocketCode.ExecutionState.PAUSED)//(!this._paused)
                return;

            this._soundManager.resumeSounds();
            if (this._background)
                this._background.resumeScripts();

            for (var i = 0, l = this._sprites.length; i < l; i++) {
                this._sprites[i].resumeScripts();
            }
            //this._paused = false;
            this._executionState = PocketCode.ExecutionState.RUNNING;
        },

        stopProject: function () {
            if (this._executionState === PocketCode.ExecutionState.STOPPED)
                return;
            this._soundManager.stopAllSounds();
            if (this._background)
                this._background.stopScripts();

            for (var i = 0, l = this._sprites.length; i < l; i++) {
                this._sprites[i].stopScripts();
            }
            this._executionState = PocketCode.ExecutionState.STOPPED;
            //this._running = false;
            //this._paused = false;
        },

        _spriteOnExecutedHandler: function (e) {
            //TODO: if soundmanager still playing return
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].hasRunningScripts)//status !== PocketCode.ExecutionState.STOPPED)
                    return;
            }

            this._executionState === PocketCode.ExecutionState.STOPPED;
            this._onExecuted.dispatchEvent();
        },

        //Brick-Sprite Interaction
        getSpriteById: function (spriteId) {
            //var sprite = this._sprites.filter(function (sprite) { return sprite.id === spriteId; })[0];   //a loop is faster than a filter (>55% slower) especially when searching for 1 element only
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++)
            {
                if (sprites[i].id === spriteId)
                    return sprites[i];
            }
            //if (!sprite)
                throw new Error('unknown sprite with id: ' + spriteId);
            //return sprite;
        },

        getSpriteLayer: function (sprite) {//Id) {
            //return this.layerObjectList.indexOf(sprite);//this.getSpriteById(spriteId));
            var idx = this._sprites.indexOf(sprite);
            if (idx < 0)
                throw new Error('sprite not found: getSpriteLayer');
            return idx + this._backgroundOffset;
        },

        setSpriteLayerBack: function (sprite, layers) {
            var sprites = this._sprites;
            var idx = sprites.indexOf(sprite);
            if (idx == 0)
                return false;
            var count = sprites.remove(sprite);
            if (count == 0)
                return false;

            idx = Math.max(idx - layers, 0);
            sprites.insert(sprite, idx);
            //var currentPosition = this.getSpriteLayer(spriteId) - this._backgroundOffset;

            //if (layers <= 0 || currentPosition <= 0)
            //    return false;

            //var sprites = this._sprites;
            //var currentSprite = this._sprites[currentPosition];
            //sprites.remove(currentSprite);

            //var newPosition = currentPosition - layers;
            //if (newPosition < 0)
            //    newPosition = 0;
            //sprites.insert(currentSprite, newPosition);


            //var ids = [];
            //for (var i = 0, l = sprites.length; i < l; i++) {
            //    ids.push(sprites[i]);   //TODO: you're pushing sprites here, right? not IDs?
            //}
            //this._onSpriteChange.dispatchEvent({ id: spriteId, properties: { layer: ids } }, this.getSpriteById(spriteId));    //TODO: check event arguments
            this._onSpriteChange.dispatchEvent({ id: sprite.id, properties: { layer: idx + this._backgroundOffset } }, sprite);    //TODO: check event arguments
            return true;
        },

        setSpriteLayerToFront: function (sprite) {//Id) {
            var sprites = this._sprites;
            if (sprites.indexOf(sprite) === sprites.length - 1)
                return false;
            var count = sprites.remove(sprite);
            if (count == 0)
                return false;
            sprites.push(sprite);

            //var currentPosition = this.getSpriteLayer(spriteId) - this._backgroundOffset;

            //var sprites = this._sprites;

            //if (currentPosition === sprites.length - 1)
            //    return false;
            //var spriteToSetToFront = sprites[currentPosition];
            //sprites.splice(currentPosition, 1);
            //sprites.push(spriteToSetToFront);

            //var ids = [];
            //for (var i = 0, l = sprites.length; i < l; i++) {
            //    ids.push(sprites[i]);
            //}
            //this._onSpriteChange.dispatchEvent({ id: spriteId, properties: { layers: ids } }, this.getSpriteById(spriteId));    //TODO: check event arguments
            this._onSpriteChange.dispatchEvent({ id: sprite.id, properties: { layers: sprites.length } }, sprite);    //TODO: sprites.length - 1 + this._backgroundOffset ???
            return true;
        },

        checkSpriteOnEdgeBounce: function (sprite) {    //Id, sprite) {  //TODO: check parameters:sprite.rotationStyle???    call: sprite.bounceTo(angle, posX, posY) new method?
            //program viewport
            var h = this.height;
            var w = this.width;

            var rs = sprite.rotationStyle;

            //TODO: implementation
            //this._triggerOnChange([{ positionX: this._positionX }, { positionY: this._positionY }, { direction: this._direction }]);
            //^^ only properties that really change
            return false;
        },

        //variables
        getGlobalVariable: function (varId) {
            if (this.__variables[varId])
                return this.__variables[varId];
            else
                throw new Error('unknown variable id: ' + varId);
        },
        getGlobalVariableNames: function () {
            return this._variableNames;
        },
        //setGlobalVariable: function (varId, value) {
        //    if (this.__variables[varId])
        //        return this.__variables[varId].value = value;
        //    else
        //        throw new Error('unknown variable id: ' + varId);
        //},

        /* override */
        dispose: function () {
            this.stopProject();
            //make sure the game engine and loaded resources are not disposed
            this._onProgramStart = undefined;
            this._onExecuted = undefined;
            this._onSpriteChange = undefined;
            this._onTabbedAction = undefined;
            //call super
            SmartJs.Core.Component.prototype.dispose.call(this);
        },
    });

    return GameEngine;
})();