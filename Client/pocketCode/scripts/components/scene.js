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

    function Scene(gameEngine) {

        //methods
        Object.defineProperties(GameEngine.prototype, {
            start: function (){
                //todo
            },
            load: function (jsonScene){
                if (!jsonScene)
                    throw new Error('invalid argument: jsonScene');
                else
                    this._jsonScene = jsonScene;
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
            }
    });



}





    return Scene;
})();