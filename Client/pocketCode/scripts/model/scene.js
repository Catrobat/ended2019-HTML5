/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="userVariableHost.js" />
/// <reference path="../components/imageStore.js" />
/// <reference path="../components/publishSubscribe.js" />
/// <reference path="../components/collisionManager.js" />
/// <reference path="sprite.js" />
/// <reference path="userVariable.js" />
'use strict';

PocketCode.Model.Scene = (function () {
    Scene.extends(SmartJs.Core.Component);

    function Scene(gameEngine, device, jsonBroadcasts, minLoopCycleTime) {

        //TODO: argument validation
        if (!(jsonBroadcasts instanceof Array))
            throw new Error('setter expects type Array');

        this._executionState = PocketCode.ExecutionState.INITIALIZED;
        this._physicsWorld = new PocketCode.PhysicsWorld(this);

        this._background = undefined;
        this._sprites = [];
        this._originalSpriteOrder = [];
        this._minLoopCycleTime = minLoopCycleTime || 20; //ms
        this._device = device;

        this._broadcastMgr = new PocketCode.BroadcastManager(jsonBroadcasts || []);
        this._collisionManager = undefined; //set during loading

        this._bricksLoaded = 0;
        this._unsupportedBricks = [];

        this._spriteFactory = new PocketCode.SpriteFactory(device, gameEngine, this._minLoopCycleTime);
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
        onSpriteTappedAction: { //WhenActionBrick: Tapped
            get: function () { return this._onSpriteTappedAction; },
        },
        onTouchStartAction: {   //WhenActionBrick: TouchStart
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
        muted: {
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid parameter: muted');

                var sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++) {
                    sprites[i].muted = value;
                }
            },
        },
        //sprites: {
        //    get: function () {
        //        return this._sprites;
        //    }
        //},
        background: {
            get: function () {
                return this._background;
            }
        },
        currentBackgroundNumber: {  //to accesss scene properties in formula
            get: function () {
                return this._background.currentLookNumber;
            },
        },
        currentBackgroundName: {    //to accesss scene properties in formula
            get: function () {
                return this._background.currentLookName;
            },
        },
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
            this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._checkForOnExecuted, this));
            this._collisionManager.background = this._background;
        },
        _loadSprites: function (jsonSprites) {
            var sprite;
            for (var i = 0, l = jsonSprites.length; i < l; i++) {
                sprite = this._spriteFactory.create(this, this._broadcastMgr, jsonSprites[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._checkForOnExecuted, this));
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
            this._unsupportedBricks = this._unsupportedBricks.concat(e.unsupportedBricks);
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

            var sprites = this._sprites,
                clones = [];
            for (var i = 0, l = sprites.length; i < l; i++)
                if (sprites[i] instanceof PocketCode.Model.SpriteClone)
                    clones.push(sprites[i]);    //do not edit indixes during iterating

            for (var i = 0, l = clones.length; i < l; i++)
                this.deleteClone(clones[i].id);

            this._sprites = this._originalSpriteOrder;
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
                this._checkForOnExecuted();    //make sure an empty program terminates
            return true;
        },
        pause: function (internal) {    //internal: for ask, .. 
            //to make sure the execution state does not change to paused which will cause the UI to change as well
            if (internal) {
                if (this._executionState == PocketCode.ExecutionState.PAUSED_USERINTERACTION)
                    return false;
                else if (this._executionState == PocketCode.ExecutionState.PAUSED) {
                    this._executionState = PocketCode.ExecutionState.PAUSED_USERINTERACTION;
                    return true;
                }
                else if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                    return false;
            }
            else {
                if (this._executionState == PocketCode.ExecutionState.PAUSED_USERINTERACTION)
                    return true;
                else if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                    return false;
            }

            //this._projectTimer.pause();
            //this._soundManager.pauseSounds();

            if (this._background)
                this._background.pauseScripts(!internal);

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].pauseScripts(!internal);
            }
            if (internal)
                this._executionState = PocketCode.ExecutionState.PAUSED_USERINTERACTION;
            else
                this._executionState = PocketCode.ExecutionState.PAUSED;
            return true;
        },
        resume: function (internal) {
            if (internal) {
                if (this._executionState !== PocketCode.ExecutionState.PAUSED_USERINTERACTION)
                    return false;
            }
            else {
                if (this._executionState == PocketCode.ExecutionState.PAUSED_USERINTERACTION)
                    return true;
                else if (this._executionState !== PocketCode.ExecutionState.PAUSED)
                    return false;
            }

            this._executionState = PocketCode.ExecutionState.RUNNING;   //important: because pause can be set again during resume
            //this._projectTimer.resume();
            //this._soundManager.resumeSounds();

            if (this._background)
                this._background.resumeScripts(!internal);

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].resumeScripts(!internal);
            }
            return true;
        },
        stop: function () {
            if (this._executionState === PocketCode.ExecutionState.STOPPED)
                return;

            //this._projectTimer.stop();
            this.stopAllScriptsAndSounds();
            this._executionState = PocketCode.ExecutionState.STOPPED;
        },
        stopAllScriptsAndSounds: function (stopEventType) {    //to make sure a WhenConditionMet-Brick doesn't stop running (listening to changes)
            if (this._background) {
                this._background.stopAllScripts(stopEventType);
            }
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].stopAllScripts(stopEventType);
                sprites[i].stopAllSounds();
            }
        },
        _checkForOnExecuted: function (e) {
            window.setTimeout(function () {
                if (this._disposed || this.executionState === PocketCode.ExecutionState.STOPPED)   //do not trigger event more than once
                    return;
                if (this.onSpriteTappedAction.listenersAttached || this.onTouchStartAction.listenersAttached)
                    return; //still waiting for user interaction

                //if (this._soundManager.isPlaying())
                //    return;
                if (this._background && this._background.scriptsOrSoundsExecuting)
                    return;
                var sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++) {
                    if (sprites[i].scriptsOrSoundsExecuting)
                        return;
                }

                this._executionState = PocketCode.ExecutionState.STOPPED;
                this._onExecuted.dispatchEvent();    //check if project has been executed successfully: this will never happen if there is an endlessLoop or whenTapped brick 
            }.bind(this), 100);  //delay neede to allow other scripts to start
        },
        handleUserAction: function (e) {
            switch (e.action) {
                case PocketCode.UserActionType.SPRITE_TOUCHED:
                    var sprite = this.getSpriteById(e.targetId);
                    if (sprite)
                        this._onSpriteTappedAction.dispatchEvent({ sprite: sprite });
                    break;
                default:    //TOUCH_START, TOUCH_MOVE, TOUCH_END
                    this._device.updateTouchEvent(e.action, e.id, e.x, e.y);
                    if (e.action == PocketCode.UserActionType.TOUCH_START)
                        this._onTouchStartAction.dispatchEvent();
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
        getSpriteByName: function (spriteName) {
            if (this._background && this._background.name == spriteName)
                return this._background;

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].name === spriteName)
                    return sprites[i];
            }

            //throw new Error('unknown sprite with name: ' + spriteName);
        },

        setBackground: function (lookId, waitCallback) {
            if (!this._background) {
                if (waitCallback)
                    waitCallback(false);
                return false;
            }
            return this._background.setLook(lookId, waitCallback);
        },
        setBackgroundByIndex: function (lookIdx) {
            if (!this._background) {
                return false;
            }
            return this._background.setLookByIndex(lookIdx);
        },
        subscribeToBackgroundChange: function (lookId, changeHandler) {
            if (!this._background)
                return;

            this._background.subscribeOnLookChange(lookId, changeHandler);
        },
        unsubscribeFromBackgroundChange: function (lookId, changeHandler) {
            if (!this._background)
                return;

            this._background.unsubscribeFromLookChange(lookId, changeHandler);
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
        //ask
        showAskDialog: function (question, callback) {
            this._onSpriteUiChange.dispatchEvent({ properties: { showAskDialog: true, question: question, callback: callback } });
        },
        hideAskDialog: function (question, callback) {
            this._onSpriteUiChange.dispatchEvent({ properties: { showAskDialog: false } });
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
                clone = sprite.clone(this._device, this._broadcastMgr);
            clone.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._checkForOnExecuted, this));

            this._sprites.insert(layer - 1, clone); //adding at position from original sprite

            this._onUiChange.dispatchEvent();   //to include clone in rendering sprites
            clone.onCloneStart.dispatchEvent();
            return true;
        },
        deleteClone: function (cloneId) {
            var clone;
            try {   //make sure an already disposed clone does not throw an error (not found)
                clone = this.getSpriteById(cloneId);
            }
            catch (e) { }
            if (!(clone instanceof PocketCode.Model.SpriteClone))
                return;

            clone.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._checkForOnExecuted, this));
            this._sprites.remove(clone);
            this._checkForOnExecuted();    //call executed handler: the clone may be the last running script
            clone.dispose(); //dispose results in an error: hanging project 965 (dispose will stop scripts- no broadcastWait callback?)
            //window.setTimeout(clone.dispose.bind(clone), 50);   //dispose with delay to make sure scripts are not stopped immediately
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
            //do not dispose device & sound-manager: handled by game engine
            this._device = undefined;
            //this._soundManager.onFinishedPlaying.removeEventListener(new SmartJs.Event.EventListener(this._checkForOnExecuted, this));

            if (this._background)
                this._background.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._checkForOnExecuted, this));

            delete this._originalSpriteOrder;
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._checkForOnExecuted, this));
            }

            //call super
            PocketCode.Model.UserVariableHost.prototype.dispose.call(this);
        },

    });

    return Scene;
})();
