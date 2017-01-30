/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/userVariableHost.js" />
/// <reference path="../components/imageStore.js" />
/// <reference path="../components/publishSubscribe.js" />
/// <reference path="../components/collisionManager.js" />
/// <reference path="../components/soundManager.js" />
/// <reference path="sprite.js" />
/// <reference path="userVariable.js" />
'use strict';

PocketCode.Model.Scene = (function () {
    Scene.extends(SmartJs.Core.Component);

    function Scene(gameEngine, device, soundManager, jsonBroadcasts, minLoopCycleTime) {

        if (!(jsonBroadcasts instanceof Array))
            throw new Error('setter expects type Array');

        this._executionState = PocketCode.ExecutionState.INITIALIZED;
        this._physicsWorld = new PocketCode.PhysicsWorld(this);

        this._background = undefined;
        this._sprites = [];
        this._originalSpriteOrder = [];
        this._minLoopCycleTime = minLoopCycleTime || 20; //ms //todo param?
        this._device = device;

        this._soundManager = soundManager;
        this._broadcastMgr = new PocketCode.BroadcastManager(jsonBroadcasts || []);
        this._collisionManager = undefined; //set during loading

        this._bricksLoaded = 0;
        this._unsupportedBricks = [];

        this._spriteFactory = new PocketCode.SpriteFactory(device, gameEngine, soundManager, this._bricksTotal, this._minLoopCycleTime);
        this._spriteFactory.onSpriteLoaded.addEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnSpriteLoadedHandler, this));
        this._spriteFactory.onUnsupportedBricksFound.addEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnUnsupportedBricksFoundHandler, this));

        //events
        this._onProgressChange = new SmartJs.Event.Event(this);
        this._onUnsupportedBricksFound = new SmartJs.Event.Event(this);
        this._onStart = new SmartJs.Event.Event(this);
        this._onExecuted = new SmartJs.Event.Event(this);
        this._onUiChange = new SmartJs.Event.Event(this);   //scene changed
        this._onSpriteUiChange = gameEngine.onSpriteUiChange;   //mapping event to gameEngin
        this._onSpriteTappedAction = new SmartJs.Event.Event(this);
        this._onTouchStartAction = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(Scene.prototype, {
        onProgressChange: {
            get: function () { return this._onProgressChange; },
        },
        onUnsupportedBricksFound: {
            get: function () { return this._onUnsupportedBricksFound; },
        },
        onStart: {
            get: function () { return this._onStart; },
        },
        onExecuted: {
            get: function () { return this._onExecuted; },
        },
        onUiChange: {   //scene specific event
            get: function () { return this._onUiChange; },
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
        screenSize: {
            get: function () {
                return { height: this._originalScreenHeight, width: this._originalScreenWidth };
            }
        },
        name: {
            get: function () {
                return this._name;
            }
        },
        renderingSprites: {
            get: function () {
                var imgs = [];
                if (this._background)
                    imgs.push(this._background.renderingSprite);
                //var imgs = [this._background.renderingSprite],
                var sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++)
                    imgs.push(sprites[i].renderingSprite);

                return imgs;
            }
        },
        renderingVariables: {  //local vars of bg and sprites
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

    //methods
    Scene.prototype.merge({
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

            if (this._unsupportedBricks.length > 0)
                this._onUnsupportedBricksFound.dispatchEvent({ unsupportedBricks: this._unsupportedBricks });
        },
        _loadBackground: function (jsonBackground) {
            this._background = this._spriteFactory.create(this, this._broadcastMgr, jsonBackground, true);
            this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            this._collisionManager.background = this._background;
        },
        _loadSprites: function (jsonSprites) {
            var sprite;
            for (var i = 0, l = jsonSprites.length; i < l; i++) {
                sprite = this._spriteFactory.create(this, this._broadcastMgr, jsonSprites[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
                this._sprites.push(sprite);
                this._originalSpriteOrder.push(sprite);
            }
            this._collisionManager.sprites = this._sprites;
        },
        _spriteFactoryOnSpriteLoadedHandler: function (e) {
            this._bricksLoaded += e.bricksLoaded;
            this._onProgressChange.dispatchEvent({ bricksLoaded: this._bricksLoaded });
        },
        _spriteFactoryOnUnsupportedBricksFoundHandler: function (e) {
            this._unsupportedBricks.concat(e.unsupportedBricks);
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

            this._sprites = this._originalSpriteOrder;
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++)
                sprites[i].init();
        },
        start: function () {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return false;
            if (this._executionState === PocketCode.ExecutionState.PAUSED)
                this.stop();

            //this._projectTimer.start();
            this._executionState = PocketCode.ExecutionState.RUNNING;
            this._onStart.dispatchEvent();    //notifies the listerners (script bricks) to start executing
            if (!this._background)
                this._spriteOnExecutedHandler();    //make sure an empty program terminates
            return true;
        },
        pause: function () {
            if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                return false;

            //this._projectTimer.pause();
            this._soundManager.pauseSounds(this._id);

            if (this._background)
                this._background.pauseScripts();

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].pauseScripts();
            }
            this._executionState = PocketCode.ExecutionState.PAUSED;
            return true;
        },
        pauseAndShowAskDialog: function (question, callbackListener) {
            //TODO: 
        },
        resume: function () {
            if (this._executionState !== PocketCode.ExecutionState.PAUSED)
                return false;

            //this._projectTimer.resume();
            this._soundManager.resumeSounds(this._id);

            if (this._background)
                this._background.resumeScripts();

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].resumeScripts();
            }
            this._executionState = PocketCode.ExecutionState.RUNNING;
            return true;
        },
        stop: function () {
            if (this._executionState === PocketCode.ExecutionState.STOPPED)
                return;

            //this._projectTimer.stop();
            this._soundManager.stopAllSounds(this._id);

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
        //    window.setTimeout(function () {
        //        if (this._disposed || this.executionState === PocketCode.ExecutionState.STOPPED)   //do not trigger event more than once
        //            return;
        //        if (this.onSpriteTappedAction.listenersAttached || this.onTouchStartAction.listenersAttached)
        //            return; //still waiting for user interaction

        //        //if (this._soundManager.isPlaying)
        //        //    return;
        //        if (this._background && this._background.scriptsRunning)
        //            return;
        //        var sprites = this._sprites;
        //        for (var i = 0, l = sprites.length; i < l; i++) {
        //            if (sprites[i].scriptsRunning)
        //                return;
        //        }

        //        this._executionState = PocketCode.ExecutionState.STOPPED;
        //        this._onExecuted.dispatchEvent();    //check if project has been executed successfully: this will never happen if there is an endlessLoop or whenTapped brick 
        //    }.call(this), 100);  //delay neede to allow other scripts to start
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
            if (this._background && this._background.id == spriteId)
                return this._background;

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].id === spriteId)
                    return sprites[i];
            }

            throw new Error('unknown sprite with id: ' + spriteId);
        },
        getLookImage: function (id) {
            //used by the sprite to access an image during look init
            return this._imageStore.getImage(id);
        },
        setBackground: function (lookId, waitCallback) {
            if (!this._background)
                return false;

            return this._background.setLook(lookId, waitCallback);
        },
        subscribeToBackgroundChange: function (lookId, changeHandler) {
            if (!this._background)
                return;

            this._background.subscribeOnLookChange(lookId, changeHandler);
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
        setSpritePosition: function (spriteId, type, destinationSpriteId) { //called by: GoToBrick
            if (!spriteId)
                return false;
            var sprite = this.getSpriteById(spriteId);
            if (!sprite)
                return false;

            switch (type) {
                case PocketCode.Model.GoToType.POINTER:
                    var pos = this._device.getLatestActiveTouchPosition();
                    if (!pos.x || !pos.y)
                        return false;

                    return sprite.setPosition(pos.x, pos.y);
                    break;
                case PocketCode.Model.GoToType.RANDOM:
                    var x = Math.floor((Math.random() * this._originalScreenWidth * 2) + 1 - this._originalScreenWidth),
                        y = Math.floor((Math.random() * this._originalScreenHeight * 2) + 1 - this._originalScreenHeight);
                    return sprite.setPosition(x, y);
                    break;
                case PocketCode.Model.GoToType.SPRITE:
                    if (!destinationSpriteId || spriteId == destinationSpriteId)
                        return false;
                    var destSprite = this.getSpriteById(destinationSpriteId);
                    if (!destSprite)
                        return false;

                    return sprite.setPosition(destSprite.positionX, destSprite.positionY);
                    break;
                default:
                    return false;
            }
        },
        //pen
        clearPenStampBackground: function () {
            this._onSpriteUiChange.dispatchEvent({ properties: { clearBackground: true } });
            return true;
        },
        //clone
        cloneSprite: function (id) {
            if (this._background && this._background.id == id)  //cloning background not allowed
                return false;

            var sprite = this.getSpriteById(id),
                layer = this.getSpriteLayer(sprite),
                clone = sprite.clone(this._device, this._soundManager, this._minLoopCycleTime, this._broadcastMgr);

            this._sprites.insert(layer, clone); //adding behind original sprite

            this._onUiChange.dispatchEvent();   //to include clone in rendering sprites
            clone.onCloneStart.dispatchEvent();
            return true;
        },
        deleteClone: function (cloneId) {
            var clone = this.getSpriteById(cloneId);

            this._sprites.remove(clone);
            clone.dispose();
            this._onUiChange.dispatchEvent();   //to remove clone from rendering sprites
        },
        //physics
        setGravity: function (x, y) {
            this._physicsWorld.setGravity(x, y);
        },
        dispose: function () {
            if (this._disposed)
                return; //may occur when dispose on error

            this.stop();
            if (this._background)
                this._background.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));

            delete this._originalSpriteOrder;
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            }

            //call super
            PocketCode.UserVariableHost.prototype.dispose.call(this);
        },

    });

    return Scene;
})();
