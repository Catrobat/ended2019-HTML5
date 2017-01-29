/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/publishSubscribe.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="bricksCore.js" />
'use strict';

/**
 * @fileOverview bricksEvent
 */

PocketCode.Model.merge({

    WhenProgramStartBrick: (function () {
        WhenProgramStartBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenProgramStartBrick(device, sprite, propObject, startEvent) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            this._onStart = startEvent;
            startEvent.addEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
        }

        WhenProgramStartBrick.prototype.merge({
            dispose: function () {
                if (this._onStart) {
                    this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
                    this._onStart = undefined;  //make sure to disconnect from gameEngine
                }
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenProgramStartBrick;
    })(),

    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenActionBrick(device, sprite, propObject, actionEvent) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            //this._action = propObject.action;   //'Tapped', 'TouchStart'
            //TODO: make sure to handle pause/resume/stop if needed (when extending functionality to support other actions as well, e.g. 'VideoMotion', 'Timer', 'Loudness')
            this._onAction = actionEvent;
            actionEvent.addEventListener(new SmartJs.Event.EventListener(this._onActionHandler, this));
        }

        WhenActionBrick.prototype.merge({
            _onActionHandler: function (e) {
                if (e.sprite === this._sprite)
                    this.executeEvent();
            },
            dispose: function () {
                this._onAction.removeEventListener(new SmartJs.Event.EventListener(this._onActionHandler, this));
                this._onAction = undefined;  //make sure to disconnect from gameEngine
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenActionBrick;
    })(),

    WhenBroadcastReceiveBrick: (function () {
        WhenBroadcastReceiveBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenBroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            broadcastMgr.subscribe(propObject.receiveMsgId, this._subscribeCallback.bind(this));//new SmartJs.Event.EventListener(this._onBroadcastHandler, this));
        }

        //WhenBroadcastReceiveBrick.prototype.merge({
        //    _onBroadcastHandler: function (e) {
        //        if (e && e.id) {    //for broadcastWait: e.g. { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) }
        //            //PocketCode.Model.SingleContainerBrick.prototype.execute.call(this, e.listener, e.id);
        //            this._bricks.execute(e.listener, e.id);
        //        }
        //        else {
        //            //the onExecuted event is only dispatched for broadcasts- broadcastWait will always terminate befor the calling routine
        //            this.executeEvent();
        //        }
        //    },
        //});

        return WhenBroadcastReceiveBrick;
    })(),

    BroadcastBrick: (function () {
        BroadcastBrick.extends(PocketCode.Model.BaseBrick, false);

        function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._broadcastMgr = broadcastMgr;
            this._broadcastMsgId = propObject.broadcastMsgId;

            //this._paused = false;
            //this._pendingOp = false;
            //this._stopped = false;
        }

        BroadcastBrick.prototype.merge({
            _execute: function () {
                //if (this._paused) {
                //    this._pendingOp = true;
                //    return;
                //}
                //if (this._stopped) {
                //    this._stopped = false;
                //    return;
                //}
                this._broadcastMgr.publish(this._broadcastMsgId);
                this._return();
            },
            //pause: function () {
            //    this._paused = true;
            //},
            //resume: function () {
            //    this._paused = false;
            //    if (this._pendingOp) {
            //        this._pendingOp = false;
            //        this._execute();
            //    }
            //},
            //stop: function () {
            //    this._stopped = true;
            //    this._paused = false;
            //    this._pendingOp = false;
            //},
        });

        return BroadcastBrick;
    })(),

    BroadcastAndWaitBrick: (function () {
        BroadcastAndWaitBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function BroadcastAndWaitBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._broadcastMgr = broadcastMgr;
            this._broadcastMsgId = propObject.broadcastMsgId;
        }

        BroadcastAndWaitBrick.prototype.merge({
            _execute: function (id) {
                this._broadcastMgr.publish(this._broadcastMsgId, this._return.bind(this, id));
            },
        });

        return BroadcastAndWaitBrick;
    })(),

    WhenConditionMetBrick: (function () {
        WhenConditionMetBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenConditionMetBrick(device, sprite, minLoopCycleTime, propObject, startEvent) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            this._previousMet = false;
            this._cycleTime = minLoopCycleTime;
            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);

            this._onStart = startEvent;
            startEvent.addEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
        }

        WhenConditionMetBrick.prototype.merge({
            //a When.. brick cannot be part of a user script, so we do not have to take care of the execution scope (always sprite)
            _execute: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);

                var met = false;
                try {
                    met = this._condition.calculate();
                }
                catch (e) { }

                if (!this._previousMet && met) {
                    this._previousMet = met;
                    PocketCode.Model.ScriptBlock.prototype._execute.call(this, SmartJs.getNewId());
                }
                else {
                    this._previousMet = met;
                    this._timeoutHandler = window.setTimeout(this._execute.bind(this), this._cycleTime);
                }
            },
            pause: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);
                PocketCode.Model.ScriptBlock.prototype.pause.call(this);
            },
            resume: function () {
                this._execute();
            },
            stop: function () {
                window.clearTimeout(this._timeoutHandler);
            },
            dispose: function () {
                window.clearTimeout(this._timeoutHandler);
                this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
                //this.removeEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
            },
        });

        return WhenConditionMetBrick;
    })(),

    WhenCollisionBrick: (function () {
        WhenCollisionBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenCollisionBrick(device, sprite, physicsWorld, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            var spriteId2 = propObject.any ? undefined : propObject.spriteId;
            physicsWorld.subscribeCollision(sprite.id, spriteId2, new SmartJs.Event.EventListener(this._onCollisionHandler, this));
        }

        WhenCollisionBrick.prototype.merge({
            _onCollisionHandler: function (e) {
                this.executeEvent();
            }
        });

        return WhenCollisionBrick;
    })(),

    WhenBackgroundChangesToBrick: (function () {
        WhenBackgroundChangesToBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenBackgroundChangesToBrick(device, sprite, scene, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            if (sprite instanceof PocketCode.Model.BackgroundSprite)    //because scene background will not be defined during loading it
                sprite.subscribeOnLookChange(propObject.lookId, this._subscribeCallback.bind(this));
            else
                scene.subscribeToBackgroundChange(propObject.lookId, this._subscribeCallback.bind(this));
            //changeEvent.addEventListener(new SmartJs.Event.EventListener(this._onBackgroundChangeHandler, this));
        }

        //WhenBackgroundChangesToBrick.prototype.merge({
        //_lookChangeHandler: function (e) {
        //    if (e && e.listener && e.id) {    //for changeAndWait: e.g. { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) }
        //        //PocketCode.Model.SingleContainerBrick.prototype.execute.call(this, e.listener, e.id);
        //        this._bricks.execute(e.listener, e.id);
        //    }
        //    else {
        //        //the onExecuted event is only dispatched for simple changes - changeAndWait will always terminate befor the calling routine
        //        this.executeEvent();
        //    }
        //},
        //dispose: function () {
        //    changeEvent.removeEventListener(new SmartJs.Event.EventListener(this._onBackgroundChangeHandler, this));
        //    PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
        //},
        //});

        return WhenBackgroundChangesToBrick;
    })(),
});

PocketCode.Model.merge({

    WhenStartAsCloneBrick: (function () {
        WhenStartAsCloneBrick.extends(PocketCode.Model.WhenProgramStartBrick, false);

        function WhenStartAsCloneBrick(device, sprite, propObject) {

            if (!sprite.isClone)
                return;
            PocketCode.Model.WhenProgramStartBrick.call(this, device, sprite, propObject, sprite.onCloneStart);
        }

        return WhenStartAsCloneBrick;
    })(),

});