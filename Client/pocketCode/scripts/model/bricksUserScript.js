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
            this._uvh = { prototype: new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, sprite) }; //TODO: make sure sprite keeps the same and doesn't vary per call

            //this._onStart = startEvent;
            //startEvent.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
        }

        UserScriptBrick.prototype.merge({
            execute: function (onExecutedListener, threadId/*, sprite*/) {
                if (this._disposed)
                    return;
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('UserScriptBrick (ThreadedBrick): missing or invalid arguments on execute()');

                //sprite = sprite || this._sprite;
                var id = SmartJs.getNewId(),
                    uvh = new PocketCode.Model.UserVariableHost(PocketCode.UserVariableScope.PROCEDURE, this._uvh);
                //TODO: init variables

                this._pendingOps[id] = { threadId: threadId, listener: onExecutedListener };
                //if (this._commentedOut === true)  //user scripts cannot be commented out
                //    return this._return(id, false);

                //this._execute(id);

                this._executionState = PocketCode.ExecutionState.RUNNING;   //TODO make sure all instances are STOPPED
                PocketCode.Model.ScriptBlock.prototype.execute.call(this, new SmartJs.Event.EventListener(function (e) {
                    if (Object.keys(this._pendingOps).length == 1) {
                        this._executionState = PocketCode.ExecutionState.STOPPED;
                        this._onExecuted.dispatchEvent();
                    }
                    this._return(e.id, e.loopDelay);    //TODO: ??
                }, this), id, uvh);
            },
            stopThread: function(threadId) {
                //TODO
            },
            //stop: function () {
            //    PocketCode.Model.ScriptBlock.prototype.stop.call(this);
            //    this._executionState = PocketCode.ExecutionState.STOPPED;
            //},
            //dispose: function () {
            //    //this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
            //    //this._onStart = undefined;  //make sure to disconnect from gameEngine
            //    PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            //},
        });

        return UserScriptBrick;
    })(),


    CallUserScriptBrick: (function () { //TODO make sure a script called can be canceled/stopped if the calling script gets stopped
        CallUserScriptBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function CallUserScriptBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            //get user script by id- at runtime: sprite getUserScritp(this._id).execute(..)
            //this._userScript = 
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

                //this._userScript.execute(..) //always include this._sprite in case user bricks are moved (defined in sprite right now)
                

                //this._returnHandler({ callId: callId });
            },
            pause: function () {
                //pause user script thread
            },
            resume: function () {
                //resume user script thread
            },
            stop: function () { //TODO: 
                //stop user script thread
                //call super
            },
        });

        return CallUserScriptBrick;
    })(),

});
