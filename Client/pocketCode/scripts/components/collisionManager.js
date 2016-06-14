/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.CollisionManager = (function () {

    function CollisionManager(projectScreenWidth, projectScreenHeight) {

        this._projectScreenWidth = projectScreenWidth;
        this._projectScreenHeight = projectScreenHeight;

        //this._onCollision = new SmartJs.Event.Event(this);  //maybe another event strategy is neede here, e.g. subscribe with handler?
    }

    //events
    //Object.defineProperties(CollisionManager.prototype, {
    //    onCollision: {
    //        get: function () {
    //            return this._onCollision;
    //        },
    //    },
    //});

    //methods
    CollisionManager.prototype.merge({
        setProjectScreen: function (width, height) {
            this._projectScreenWidth = width;
            this._projectScreenHeight = height;
        },
        subscribe: function (sprite1, sprite2, handler) {
            var anything = sprite2 ? true : false;
            //TODO: subscribe a collisions check: make sure (sprite1 vs sprite2) -> handler1 & (sprite2 vs sprite1) -> handler2 does not check the collision twice before calling both handlers 
        },
        _publish: function () {
            //private here: call registered handlers on collisions
        },
        checkRegisteredCollisions: function (/* TODO */) {    //called to periodically check registered collisions after movements 
            //TODO
            return false;
        },
        checkSpritePointerCollision: function (sprite) {
            //TODO
            return false;
        },
        checkSpriteEdgeCollision: function (spriteBoundary) {
            //TODO
            return false;
        },
        checkSpriteCollision: function (sprite1, sprite2) {
            //TODO
            return false;
        },
        checkSpriteColorCollision: function (sprite, color) {
            //TODO
            return false;
        },
        checkColorColorCollision: function (color1, color2) {
            //TODO
            return false;
        },
    });


    return CollisionManager;
})();
