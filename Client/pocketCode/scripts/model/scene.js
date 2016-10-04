/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/userVariableHost.js" />
/// <reference path="../components/imageStore.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/collisionManager.js" />
/// <reference path="../components/soundManager.js" />
/// <reference path="sprite.js" />
/// <reference path="userVariable.js" />
'use strict';

PocketCode.Model.Scene = (function () {
    Scene.extends(PocketCode.UserVariableHost, false);

    function Scene(jsonScene) {
        //todo id background sprite
        this._executionState = PocketCode.ExecutionState.INITIALIZED;
        this._physicsWorld = new PocketCode.PhysicsWorld(this);
        this._collisionManager = new PocketCode.CollisionManager(0, 0);  //TODO: jsonScene.screenWidth, jsonScene.screenHeight);

        this._sprites = [];
        this._originalSpriteOrder = [];

        //events
        this._onStart = new SmartJs.Event.Event(this);
        this._onExecuted = new SmartJs.Event.Event(this);
        this._onSpriteUiChange = new SmartJs.Event.Event(this);
        this._onSpriteTappedAction = new SmartJs.Event.Event(this);
        this._onTouchStartAction = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Scene.prototype, {
        executionState: {
            get: function () {
                return this._executionState;
            }
        },
        id: {
            get: function () {
                return this._id;
            }
        },
        name: {
            get: function () {
                return this._name;
            }
        },
        renderingSprites: {
            get: function () {
                var imgs = [this._background.renderingSprite],
                    sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++)
                    imgs.push(sprites[i].renderingSprite);

                return imgs;
            }
        },
        renderingTexts: {  //local vars of bg and sprites
            get: function () {
                var vars = [];
                if (this._background)
                    vars = this._background.renderingVariables;
                var sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++)
                    vars = vars.concat(sprites[i].renderingVariables);
                return vars;
            },
        },
        //sprites: {
        //    get: function () {
        //        return this._sprites;
        //    }
        //},
        //background: {
        //    get: function () {
        //        return this._background;
        //    }
        //},
        collisionManager: {
            get: function () {
                return this._collisionManager;
            },
        },
        physicsWorld: {
            get: function () {
                return this._physicsWorld;
            }
        },
    });

    Object.defineProperties(Scene.prototype, {
        onStart: {
            get: function () { return this._onStart; },
        },
        onExecuted: {
            get: function () { return this._onExecuted; },
        },
        onSpriteUiChange: {
            get: function () { return this._onSpriteUiChange; },
        },
        onSpriteTappedAction: {
            get: function () { return this._onSpriteTappedAction; },
        },
        onTouchStartAction: {
            get: function () { return this._onTouchStartAction }
        },
    });

    //methods
    Scene.prototype.merge({
        init: function (spriteFactory, /*projectTimer, spriteOnExecutedHandler, */gameEngine, device, soundManager, onSpriteUiChange) { //todo move unnecessary parameters to scene directly
            this._gameEngine = gameEngine;
            //this._spriteOnExecutedHandler = spriteOnExecutedHandler;
            this._spriteFactory = spriteFactory;
            this._collisionManager = undefined;
            this._device = device;
            this._soundManager = soundManager;
            this._onSpriteUiChange = onSpriteUiChange;

            if (this._background)
                this._background.dispose();// = undefined;
            this._originalSpriteOrder = [];
            this._sprites.dispose();

            // this._sprites = [];
            //this._projectTimer = projectTimer;
            this._originalSpriteOrder = [];
        },
        load: function (jsonScene) {
            if (!jsonScene)
                throw new Error('invalid argument: jsonScene');

            this._name = jsonScene.name;
            this._id = jsonScene.id;
            this._originalScreenWidth = jsonScene.screenWidth;
            this._originalScreenHeight = jsonScene.screenHeight;
            this._collisionManager = new PocketCode.CollisionManager(this._originalScreenWidth, this._originalScreenHeight);

            if (jsonScene.background)
                this._loadBackground(jsonScene.background);

            this._loadSprites(jsonScene.sprites);
        },
        start: function () {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (this._executionState === PocketCode.ExecutionState.PAUSED)
                return this.resume();

            //this._projectTimer.start();
            this._executionState = PocketCode.ExecutionState.RUNNING;
            //^^ we create them onProjectLoaded at the first start
            this._onStart.dispatchEvent();    //notifies the listerners (script bricks) to start executing
            if (!this._background)
                this._spriteOnExecutedHandler();    //make sure an empty program terminates
        },
        pause: function () {
            if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                return false;

            //this._projectTimer.pause();
            this._soundManager.pauseSounds();
            if (this._background)
                this._background.pauseScripts();

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].pauseScripts();
            }
            this._executionState = PocketCode.ExecutionState.PAUSED;
            return true;
        },
        resume: function () {
            if (this._executionState !== PocketCode.ExecutionState.PAUSED)
                return;

            //todo resume event?

            //this._projectTimer.resume();
            this._soundManager.resumeSounds();
            if (this._background)
                this._background.resumeScripts();

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].resumeScripts();
            }
            this._executionState = PocketCode.ExecutionState.RUNNING;
        },
        stop: function () {
            if (this._executionState === PocketCode.ExecutionState.STOPPED)
                return;

            //this._projectTimer.stop();
            if (this._background) {
                this._background.stopAllScripts();
            }
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].stopAllScripts();
            }

            this._executionState = PocketCode.ExecutionState.STOPPED;
        },
        _spriteOnExecutedHandler: function (e) {    //TODO: moved to scene: make sure to write another handler for sound checking if currentScene is stopped
            window.setTimeout(function () {
                if (this._disposed || this.executionState === PocketCode.ExecutionState.STOPPED)   //do not trigger event more than once
                    return;
                if (this.onSpriteTappedAction.listenersAttached || this.onTouchStartAction.listenersAttached)
                    return; //still waiting for user interaction

                //if (this._soundManager.isPlaying)
                //    return;
                if (this._background && this._background.scriptsRunning)
                    return;
                var sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++) {
                    if (sprites[i].scriptsRunning)
                        return;
                }

                this._executionState = PocketCode.ExecutionState.STOPPED;
                this._onExecuted.dispatchEvent();    //check if project has been executed successfully: this will never happen if there is an endlessLoop or whenTapped brick 
            }.bind(this), 100);  //delay neede to allow other scripts to start
        },

        initializeSprites: function () {
            var bg = this._background,
                sprites = this._sprites;

            if (bg) {
                bg.initLooks();
                bg.init();
            }
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].initLooks();
                sprites[i].init();
            }
        },
        reinitializeSprites: function () {
            var bg = this._background;
            if (bg) {
                bg.init();
            }

            this._sprites = this._originalSpriteOrder;  //reset sprite order
            //this._collisionManager.sprites = this._originalSpriteOrder;

            var sprites = this._sprites;//,
            //sprite;
            for (var i = 0, l = sprites.length; i < l; i++)
                sprites[i].init();
            //{
            //    sprite = sprites[i];
            //    sprite.init();
            //}
        },
        handleUserAction: function (e) {
            switch (e.action) {
                case PocketCode.UserActionType.SPRITE_CLICKED:
                    var sprite = this.getSpriteById(e.targetId);
                    if (sprite)
                        this._onSpriteTappedAction.dispatchEvent({ sprite: sprite });
                    break;
                default:
                    this._device.updateTouchEvent(e.action, e.id, e.x, e.y);
            }
        },
        getSpriteById: function (spriteId) {
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].id === spriteId)
                    return sprites[i];
            }

            if (this._background && spriteId == this._background.id)
                return this._background;

            throw new Error('unknown sprite with id: ' + spriteId);
        },
        setGravity: function (x, y) {
            this._physicsWorld.setGravity(x, y);
        },
        clearPenStampCanvas: function () {
            return true;
        },
        _loadBackground: function (background) {
            this._background = this._spriteFactory.create(background);
            this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this._gameEngine)); //todo
            this._collisionManager.background = this._background;
        },
        _loadSprites: function (sprites) {
            //todo type check
            var sp = sprites;
            var sprite, i, l;
            for (i = 0, l = sp.length; i < l; i++) {
                sprite = this._spriteFactory.create(sp[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this._gameEngine)); //todo
                this._sprites.push(sprite);
                this._originalSpriteOrder.push(sprite);
            }
            this._collisionManager.sprites = this._sprites;
        },
        getLookImage: function (id) {
            //used by the sprite to access an image during look init
            return this._imageStore.getImage(id);
        },
        setCameraTransparency: function(value) {
            return this._background.setCameraTransparency(value);
        },
        setBackground: function (lookId) {
            return this._background.setLook(lookId);
        },
        getSpriteLayer: function (sprite) { //including background (used in formulas)
            if (sprite === this._background)
                return 0;
            var idx = this._sprites.indexOf(sprite);
            if (idx < 0)
                throw new Error('sprite not found: getSpriteLayer');
            return idx + 1;
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
            sprites.insert(idx, sprite);

            this._onSpriteUiChange.dispatchEvent({ id: sprite.id, properties: { layer: idx + 1 } }, sprite);    //including background
            return true;
        },
        setSpriteLayerToFront: function (sprite) {
            var sprites = this._sprites;
            if (sprites.indexOf(sprite) === sprites.length - 1)
                return false;
            var count = sprites.remove(sprite);
            if (count == 0)
                return false;
            sprites.push(sprite);

            this._onSpriteUiChange.dispatchEvent({ id: sprite.id, properties: { layer: sprites.length } }, sprite);    //including background
            return true;
        },
        setSpritePosition: function (spriteId, type, destinationSpriteId) {
            switch (type) {
                case PocketCode.Model.GoToType.POINTER:
                    //TODO
                    break;
                case PocketCode.Model.GoToType.RANDOM:
                    //TODO
                    break;
                case PocketCode.Model.GoToType.SPRITE:
                    //TODO
                    break;
            }
        },

    });

    return Scene;
})();
