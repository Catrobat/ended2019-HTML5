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

    function Scene(gameEngine, device, soundManager, jsonBroadcasts, minLoopCycleTime/*, totalBrickCount, onSpriteUiChange*/) {

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

        //this._broadcasts = jsonBroadcasts || [];
        this._broadcastMgr = new PocketCode.BroadcastManager(jsonBroadcasts || []);
        //this._bricksTotal = 0;// TODO calc scene internal bricks? totalBrickCount;
        this._bricksLoaded = 0;
        this._unsupportedBricks = [];

        this._spriteFactory = new PocketCode.SpriteFactory(device, gameEngine, soundManager, this._bricksTotal, this._minLoopCycleTime);
        this._spriteFactory.onSpriteLoaded.addEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnSpriteLoadedHandler, this));
        this._spriteFactory.onUnsupportedBricksFound.addEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnUnsupportedBricksFoundHandler, this));

        //events
        this._onStart = new SmartJs.Event.Event(this);
        this._onExecuted = new SmartJs.Event.Event(this);
        this._onBackgroundChange = new SmartJs.Event.Event(this);
        this._onSpriteUiChange = new SmartJs.Event.Event(this);     //TODO: reconnect events on scene change? or share event?
        this._onSpriteTappedAction = new SmartJs.Event.Event(this);
        this._onTouchStartAction = new SmartJs.Event.Event(this);
        this._onProgressChange = new SmartJs.Event.Event(this);
        this._onUnsupportedBricksFound = new SmartJs.Event.Event(this);

        //this._collisionManager = undefined;
        //this._device = device;
        //this._soundManager = soundManager;
        //this._onSpriteUiChange = onSpriteUiChange; //TODO overwrites what has just been set.

        //if (this._background)
        //    this._background.dispose();// = undefined;
        //this._originalSpriteOrder = [];
        //this._sprites.dispose();

        //// this._sprites = [];
        ////this._projectTimer = projectTimer;
        //this._originalSpriteOrder = [];
    }

    //events
    Object.defineProperties(Scene.prototype, {
        onStart: {
            get: function () { return this._onStart; },
        },
        onExecuted: {
            get: function () { return this._onExecuted; },
        },
        onBackgroundChange: {
            get: function () { return this._onBackgroundChange; },
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
        onProgressChange: {
            get: function () { return this._onProgressChange; },
        },
        onUnsupportedBricksFound: {
            get: function () { return this._onUnsupportedBricksFound; },
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
        //broadcasts: { //TODO: public? - move to scene (internal broadcast mgr)
        //    set: function (broadcasts) {
        //        if (!(broadcasts instanceof Array))
        //            throw new Error('setter expects type Array');

        //        this._broadcasts = broadcasts;
        //        this._broadcastMgr.init(broadcasts);
        //    },
        //},
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
            //if (jsonScene.sprites instanceof Array)
            this._loadSprites(jsonScene.sprites);

            if(this._unsupportedBricks.length > 0)
                this._onUnsupportedBricksFound.dispatchEvent({ unsupportedBricks: this._unsupportedBricks });
        },
        //_calcBricksCount(jsonScene) {
        //    return 0;   //TODO
        //},
        //removeSpriteFactoryEventListeners: function () {    //TODO
        //    this._spriteFactory.onProgressChange.removeEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnSpriteLoadedHandler, this));
        //},
        _loadBackground: function (background) {
            this._background = this._spriteFactory.create(this, this._broadcastMgr, /*this._bricksLoaded,*/ background, true);
            this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this)); //todo
            //TODO: attach listener onLookChange
            this._collisionManager.background = this._background;
        },
        _loadSprites: function (sprites) {
            //todo type check
            //var sp = sprites;
            var sprite, i, l;
            for (i = 0, l = sprites.length; i < l; i++) {
                sprite = this._spriteFactory.create(this, this._broadcastMgr, /*this._bricksLoaded,*/ sprites[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this)); //todo
                this._sprites.push(sprite);
                this._originalSpriteOrder.push(sprite);
            }
            this._collisionManager.sprites = this._sprites;
        },
        _spriteFactoryOnSpriteLoadedHandler: function (e) {
            this._bricksLoaded += e.bricksLoaded;
            this._onProgressChange.dispatchEvent({ bricksLoaded: this._bricksLoaded });
        },
        _spriteFactoryOnUnsupportedBricksFoundHandler: function(e) {
            this._unsupportedBricks.concat(e.unsupportedBricks);
        },
        start: function () {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return false;
            if (this._executionState === PocketCode.ExecutionState.PAUSED)
                this.stop();//return this.resume();

            //this._projectTimer.start();
            this._executionState = PocketCode.ExecutionState.RUNNING;
            //^^ we create them onProjectLoaded at the first start
            this._onStart.dispatchEvent();    //notifies the listerners (script bricks) to start executing
            if (!this._background)
                this._spriteOnExecutedHandler();    //make sure an empty program terminates
            return true;
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
            if (this._executionState !== PocketCode.ExecutionState.PAUSED)// {    //TODO:
                return false;
            //    this._gameEngine.changeScene(this._id);

            //    return true;
            //}



            //todo resume event?

            //this._projectTimer.resume();
            this._soundManager.resumeSounds();  //TODO: pause/resume on scenes???
            if (this._background)
                this._background.resumeScripts();

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].resumeScripts();
            }
            this._executionState = PocketCode.ExecutionState.RUNNING;


            //this._gameEngine.changeScene(this._id);
            return true;
        },
        stop: function () {
            if (this._executionState === PocketCode.ExecutionState.STOPPED)
                return;
            this._broadcastMgr.stop();

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
        pauseAndShowAskDialog: function (question, callbackListener) {
            //TODO: 
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
        getLookImage: function (id) {
            //used by the sprite to access an image during look init
            return this._imageStore.getImage(id);
        },
        setCameraTransparency: function (value) {
            return this._background.setCameraTransparency(value);
        },
        setBackground: function (lookId) {

            var change = this._background.setLook(lookId);
            if (change)
                this._onBackgroundChange.dispatchEvent({ lookId: lookId });
            return change;
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
            switch (type) {
                case PocketCode.Model.GoToType.POINTER:
                    //TODO
                    break;
                case PocketCode.Model.GoToType.RANDOM:
                    //TODO
                    break;
                case PocketCode.Model.GoToType.SPRITE:
                    //TODO: destinationSpriteId is used here to get the coords
                    break;
            }
        },

        clearPenStampBackground: function () {
            return true;    //TODO
        },

        cloneSprite: function (id) {
            if (this._background && this._background.id == id)
                return false;

            var sprite = this.getSpriteById(id),
                layer = this.getSpriteLayer(sprite),
                clone = sprite.clone(this._device, this._soundManager, this._minLoopCycleTime, this._broadcastMgr);

            this._sprites.insert(layer, clone);

            //todo dispatch event for UI

            clone.onCloneStart.dispatchEvent();
            return true;
        },

        deleteClone: function (cloneId) {
            var clone = this.getSpriteById(cloneId);

            this._sprites.remove(clone);
            clone.dispose();
            //remove from list

            //todo dispatch event for UI
            //notify UI: neues Event onCloneDeleted (siehe unten)
        },
        dispose: function () {
            if (this._disposed)
                return; //may occur when dispose on error

            this.stop();
            alert('TODO');

            //TODO: remove code below and make sure scenes are disposed
            // if (this._background)
            //     this._background.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            //
            // delete this._originalSpriteOrder;
            // var scenes = this._scenes;
            // for (var j = 0, lengthScenes = scenes.length; j < lengthScenes; j++) {
            //     var sprites = scenes[j].sprites;
            //     for (var i = 0, l = sprites.length; i < l; i++) {
            //         sprites[i].onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            //     }
            // }

            //call super
            PocketCode.UserVariableHost.prototype.dispose.call(this);

        },

    });

    return Scene;
})();
