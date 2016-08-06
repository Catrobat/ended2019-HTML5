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

PocketCode.Scene = (function () {
    Scene.extends(PocketCode.UserVariableHost, false);

    function Scene(spriteFactory, collisionManager) {
        this._spriteFactory = spriteFactory;
        this._collisionManager = collisionManager;
        this._sprites = [];
        this._originalSpriteOrder = [];
    }

    //properties
    Object.defineProperties(Scene.prototype, {
        sprites: {
            get: function () {
                return this._sprites;
            }
        },
        background: {
            get: function () {
                return this._background;
            }
        }
    });


    //methods
    Scene.prototype.merge({
        start: function () {
            //todo
        },
        load: function (jsonScene) {
            if (!jsonScene)
                throw new Error('invalid argument: jsonScene');

            //this._jsonScene = jsonScene;

            if (jsonScene.background)
                this._loadBackground(jsonScene.background);

            this._loadSprites(jsonScene.sprites);

            //todo
        },
        stop: function (){
            //todo
        },
        pause: function (){
            //todo
        },
        reinitialize: function () {
            //todo
        },
        _spriteOnExecutedHandler: function (e) {
            //todo
        },
        _loadSprites: function (sprites) {
            //todo type check
            var sp = sprites;
            var sprite, i, l;
            for (i = 0, l = sp.length; i < l; i++) {
                sprite = this._spriteFactory.create(sp[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
                this._sprites.push(sprite);
                this._originalSpriteOrder.push(sprite);
            }
            this._collisionManager.sprites = this._sprites;
        },
        _loadBackground: function (background) {
            //todo these things don't exist yet
            this._background = this._spriteFactory.create(background);
            this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            this._collisionManager.background = this._background;
        }
    });

    return Scene;
})();