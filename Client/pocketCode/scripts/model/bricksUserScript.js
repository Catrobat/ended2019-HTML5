/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
/// <reference path="../components/soundManager.js" />
/// <reference path="../components/proxy.js" />
'use strict';

PocketCode.Model.merge({

    //TODO: make sure to use the logic from WhenBroadcastReceiveBrick to bind a event on subScripts
    //include return values for execute (global: in ScriptBlock??)

    UserScriptBrick: (function () { //TODO: make sure to use the logic from WhenBroadcastReceiveBrick to bind a event on subScripts
        UserScriptBrick.extends(PocketCode.Model.ScriptBlock, false);

        function UserScriptBrick(device, sprite, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            //we need a prototype object storing all procedure arguments to call fomula.toString(this._uvhPrototype)
            //otherwide we are not able to show a formula including (variable) argument names
            this._uvhPrototype = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, sprite);

            //this._onStart = startEvent;
            //startEvent.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
        }

        UserScriptBrick.prototype.merge({
            dispose: function () {
                //this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
                //this._onStart = undefined;  //make sure to disconnect from gameEngine
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            },
        });

        return UserScriptBrick;
    })(),


    CallUserScriptBrick: (function () { //TODO make sure a script called can be canceled/stopped if the calling script gets stopped
        CallUserScriptBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function CallUserScriptBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            //this._x = new PocketCode.Formula(device, sprite, propObject.x);
            //this._y = new PocketCode.Formula(device, sprite, propObject.y);
            //this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            //this._paused = false;
        }

        CallUserScriptBrick.prototype.merge({
            //_updatePositionHandler: function (e) {
            //    this._sprite.setPosition(e.value.x, e.value.y);
            //},
            _returnHandler: function (e) {
                var callId = e.callId;
                this._return(callId, true); //TODO: is this method really necessary??? inheritace???
            },
            _execute: function (callId) {
                //var sprite = this._sprite;
                //var po = this._pendingOps[callId];
                //po.paused = this._paused;
                //var duration = this._duration.calculate(),
				//	x = this._x.calculate(),
				//	y = this._y.calculate();
                //if (isNaN(duration)) {
                //    if (!isNaN(x) && !isNaN(y))
                //        this._updatePositionHandler({ value: { x: x, y: y } });
                //    this._returnHandler({ callId: callId });
                //    return;
                //}

                //var animation = new SmartJs.Animation.Animation2D({ x: sprite.positionX, y: sprite.positionY }, { x: x, y: y }, Math.round(duration * 1000), SmartJs.Animation.Type.LINEAR2D);
                //animation.onUpdate.addEventListener(new SmartJs.Event.EventListener(this._updatePositionHandler, this));
                //animation.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._returnHandler, this));
                //po.animation = animation;
                //animation.start({ callId: callId });
                //if (this._paused)
                //    animation.pause();

                this._returnHandler({ callId: callId });
            },
            pause: function () {
                //this._paused = true;
                //var po, pos = this._pendingOps;
                //for (var p in pos) {
                //    if (!pos.hasOwnProperty(p))
                //        continue;
                //    po = pos[p];
                //    if (po.animation)
                //        po.animation.pause();
                //    po.paused = true;
                //}
            },
            resume: function () {
                //this._paused = false;
                //var po, pos = this._pendingOps;
                //for (var p in pos) {
                //    if (!pos.hasOwnProperty(p))
                //        continue;
                //    po = pos[p];
                //    if (po.paused) {
                //        po.paused = false;
                //        if (po.animation)
                //            po.animation.resume();
                //    }
                //}
            },
            stop: function () {
                //this._paused = false;
                //var po, pos = this._pendingOps;
                //for (var p in pos) {
                //    if (!pos.hasOwnProperty(p))
                //        continue;
                //    po = pos[p];
                //    if (po.animation)
                //        po.animation.stop();
                //}
                //this._pendingOps = {};
            },
        });

        return CallUserScriptBrick;
    })(),

});
