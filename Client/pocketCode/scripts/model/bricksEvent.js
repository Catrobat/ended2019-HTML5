/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="bricksCore.js" />
'use strict';

/**
 * @fileOverview bricksEvent
 */

PocketCode.Model.merge({

    WhenProgramStartBrick: (function () {
        WhenProgramStartBrick.extends(PocketCode.Model.SingleInstanceScriptBlock, false);

        function WhenProgramStartBrick(device, sprite, propObject, startEvent) {
            PocketCode.Model.SingleInstanceScriptBlock.call(this, device, sprite, propObject);

            this._onStart = startEvent;
            startEvent.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
        }

        WhenProgramStartBrick.prototype.merge({
            dispose: function () {
                if (this._onStart) {
                    this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
                    this._onStart = undefined;  //make sure to disconnect from gameEngine
                }
                PocketCode.Model.SingleInstanceScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenProgramStartBrick;
    })(),

    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.Model.SingleInstanceScriptBlock, false);

        function WhenActionBrick(device, sprite, propObject, actionEvent) {
            PocketCode.Model.SingleInstanceScriptBlock.call(this, device, sprite, propObject);

            //this._action = propObject.action;   //'Tapped', 'TouchStart'
            //TODO: make sure to handle pause/resume/stop if needed (when extending functionality to support other actions as well, e.g. 'VideoMotion', 'Timer', 'Loudness')
            this._onAction = actionEvent;
            actionEvent.addEventListener(new SmartJs.Event.EventListener(this._onActionHandler, this));
        }

        WhenActionBrick.prototype.merge({
            _onActionHandler: function (e) {
                if (e.sprite === this._sprite)
                    this.execute();
            },
            dispose: function () {
                this._onAction.removeEventListener(new SmartJs.Event.EventListener(this._onActionHandler, this));
                this._onAction = undefined;  //make sure to disconnect from gameEngine
                PocketCode.Model.SingleInstanceScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenActionBrick;
    })(),

    WhenBroadcastReceiveBrick: (function () {
        WhenBroadcastReceiveBrick.extends(PocketCode.Model.SingleInstanceScriptBlock, false);

        function WhenBroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.SingleInstanceScriptBlock.call(this, device, sprite, propObject);

            broadcastMgr.subscribe(propObject.receiveMsgId, new SmartJs.Event.EventListener(this._onBroadcastHandler, this));
        }

        WhenBroadcastReceiveBrick.prototype.merge({
            _onBroadcastHandler: function (e) {
                if (e && e.id) {    //for broadcastWait: e.g. { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) }
                    PocketCode.Model.SingleContainerBrick.prototype.execute.call(this, e.listener, e.id);
                }
                else {
                    //the onExecuted event is only dispatched for broadcasts- broadcastWait will always terminate befor the calling routine
                    this.execute();
                }
            },
        });

        return WhenBroadcastReceiveBrick;
    })(),

    BroadcastBrick: (function () {
        BroadcastBrick.extends(PocketCode.Model.BaseBrick, false);

        function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._broadcastMgr = broadcastMgr;
            this._broadcastMsgId = propObject.broadcastMsgId;

            this._paused = false;
            this._pendingOp = false;
            //this._stopped = false;

            this._recursiveBroadcasts = false;
            this._timeout = undefined;
        }

        BroadcastBrick.prototype.merge({
            _execute: function (usingTimeout) {
                if (usingTimeout && this._stopped)
                    return;
                this._stopped = false;
                if (this._paused) {
                    this._pendingOp = true;
                    return;
                }
                //if (this._stopped) {
                //    this._stopped = false;
                //    return;
                //}
                var brId = this._broadcastMsgId;
                //var broadcasts = this._broadcasts;

                if (this._recursiveBroadcasts) {
                    this._timeout = setTimeout(this._execute.bind(this, true), 1);
                }
                else {
                    this._recursiveBroadcasts = true;
                    //this._broadcastMgr.publish(brId);
                    this._timeout = setTimeout(this._broadcastMgr.publish.bind(this._broadcastMgr, brId), 0);
                    this._recursiveBroadcasts = false;
                }
                //setTimeout(this._return.bind(this), 1);
                this._return();
            },
            pause: function () {
                this._paused = true;
            },
            resume: function () {
                this._paused = false;
                if (this._pendingOp) {
                    this._pendingOp = false;
                    this._execute();
                }
            },
            stop: function () {
                clearTimeout(this._timeout);
                this._paused = false;
                this._stopped = true;
                //this._pendingOp = false;    //TODO: TEST
                //this._stopped = true;
            },
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
            _returnHandler: function (e) {
                this._return(e.id, e.loopDelay)
            },
            _execute: function (id) {
                this._broadcastMgr.publish(this._broadcastMsgId, new SmartJs.Event.EventListener(this._returnHandler, this), id);
            },
        });

        return BroadcastAndWaitBrick;
    })(),

    WhenConditionMetBrick: (function () {
        WhenConditionMetBrick.extends(PocketCode.Model.SingleInstanceScriptBlock, false);

        function WhenConditionMetBrick(device, sprite, minLoopCycleTime, propObject) {
            PocketCode.Model.SingleInstanceScriptBlock.call(this, device, sprite, propObject);

            this._previousMet = false;
            this._cycleTime = minLoopCycleTime;
            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
        }

        WhenConditionMetBrick.prototype.merge({
            _execute: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);

                var met = false;
                try {
                    met = this._condition.calculate();
                }
                catch (e) {}

                if (!this._previousMet && met) {
                    this._previousMet = met;
                    PocketCode.Model.SingleInstanceScriptBlock.prototype._execute.call(this, SmartJs.getNewId());
                }
                else {
                    this._previousMet = met;
                    this._timeoutHandler = window.setTimeout(this._execute.bind(this), this._cycleTime);
                }
            },
            pause: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);
                PocketCode.Model.SingleInstanceScriptBlock.prototype.pause.call(this);
            },
            resume: function () {
                this._execute();
            },
            stop: function () {
                window.clearTimeout(this._timeoutHandler);
            },
            dispose: function () {
                window.clearTimeout(this._timeoutHandler);
                this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
                PocketCode.Model.SingleInstanceScriptBlock.prototype.dispose.call(this);
                //this.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
            },
        });

        return WhenConditionMetBrick;
    })(),

    WhenCollisionBrick: (function () {
        WhenCollisionBrick.extends(PocketCode.Model.SingleInstanceScriptBlock, false);

        function WhenCollisionBrick(device, sprite, physicsWorld, propObject) {
            PocketCode.Model.SingleInstanceScriptBlock.call(this, device, sprite, propObject);

            var spriteId2 = propObject.any ? 'any' : propObject.spriteId;   //TODO: change any to undefined?
            physicsWorld.subscribeCollision(sprite.id, spriteId2, new SmartJs.Event.EventListener(this._onCollisionHandler, this));
        }

        WhenCollisionBrick.prototype.merge({
            _onCollisionHandler: function (e) {
                this.execute();
            }
        });

        return WhenCollisionBrick;
    })(),

    WhenBackgroundChangesToBrick: (function () {
        WhenBackgroundChangesToBrick.extends(PocketCode.Model.SingleInstanceScriptBlock, false);

        function WhenBackgroundChangesToBrick(device, sprite, propObject, changeEvent) {
            PocketCode.Model.SingleInstanceScriptBlock.call(this, device, sprite, propObject);

            this._lookId = propObject.lookId;
            this._changeEvent = changeEvent;
            changeEvent.addEventListener(new SmartJs.Event.EventListener(this._onBackgroundChangeHandler, this));
        }

        WhenBackgroundChangesToBrick.prototype.merge({
            _onBackgroundChangeHandler: function (e) {
                if(e.lookId == this._lookId)
                    this.execute();
            },
            dispose: function () {
                changeEvent.removeEventListener(new SmartJs.Event.EventListener(this._onBackgroundChangeHandler, this));
                PocketCode.Model.SingleInstanceScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenBackgroundChangesToBrick;
    })(),

});