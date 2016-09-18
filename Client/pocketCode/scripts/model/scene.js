/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="userVariableHost.js" />
/// <reference path="sprite.js" />
/// <reference path="imageStore.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="broadcastManager.js" />
/// <reference path="collisionManager.js" />
/// <reference path="soundManager.js" />
/// <reference path="stopwatch.js" />
'use strict';

PocketCode.Model.Scene = (function () {
    Scene.extends(PocketCode.UserVariableHost, false);

    function Scene() {
        //todo id background sprite
        this._executionState = PocketCode.ExecutionState.INITIALIZED;

        //events
        this._onProgramStart = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Scene.prototype, {
        executionState:{
           get: function () {
               return this._executionState;
           }
        },
        id: {
           get: function () {
               return this._id;
           }
        },
        sprites: {
            get: function () {
                return this._sprites;
            }
        },
        background: {
            get: function () {
                return this._background;
            }
        },
        collisionManager: {
            get: function () {
                return this._collisionManager;
            },
        },
    });

    Object.defineProperties(Scene.prototype, {
        onProgramStart: {
            get: function () { return this._onProgramStart; },
        },
    });

    //methods
    Scene.prototype.merge({
        init: function (spriteFactory, projectTimer, spriteOnExecutedHandler, gameEngine) { //todo move unnecessary parameters to scene directly
            this._gameEngine = gameEngine;
            this._spriteOnExecutedHandler = spriteOnExecutedHandler;
            this._spriteFactory = spriteFactory;
            this._collisionManager = undefined;
            this._sprites = [];
            this._projectTimer = projectTimer;
            this._originalSpriteOrder = [];
        },
        start: function () {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (this._executionState === PocketCode.ExecutionState.PAUSED)
                return this.resume();

            this._projectTimer.start();
            this._executionState = PocketCode.ExecutionState.RUNNING;
            //^^ we create them onProjectLoaded at the first start
            //todo onSceneStart and onProgramstart back to ge?
            this._onProgramStart.dispatchEvent();    //notifies the listerners (script bricks) to start executing
            if (!this._background)
                this._spriteOnExecutedHandler();    //make sure an empty program terminates
        },
        load: function (jsonScene) {
            if (!jsonScene)
                throw new Error('invalid argument: jsonScene');

            this._originalScreenWidth = jsonScene.screenWidth;
            this._originalScreenHeight = jsonScene.screenHeight;
            this._collisionManager = new PocketCode.CollisionManager(this._originalScreenWidth, this._originalScreenHeight);

            if (jsonScene.background)
                this._loadBackground(jsonScene.background);

            this._loadSprites(jsonScene.sprites);
        },
        stop: function (){
            //todo
        },
        pause: function (){
            //todo
            if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                return false;

            this.projectTimer.pause();
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
            //todo
        },
        reinitializeSprites: function () {
            var bg = this._background;
            if (bg) {
                bg.init();
            }

            this._sprites = this._originalSpriteOrder;  //reset sprite order
            //todo collision manager
            //this._collisionManager.sprites = this._originalSpriteOrder;

            var sprites = this._sprites,
                sprite;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprite = sprites[i];
                sprite.init();
            }
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
        _loadBackground: function (background) {
            this._background = this._spriteFactory.create(background);
            this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this._gameEngine)); //todo
            this._collisionManager.background = this._background;
        }
    });

    return Scene;
})();