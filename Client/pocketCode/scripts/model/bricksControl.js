/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="bricksCore.js" />
'use strict';

/**
 * @fileOverview bricksControl
 */

PocketCode.Model.merge({

    WhenProgramStartBrick: (function () {
        WhenProgramStartBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenProgramStartBrick(device, sprite, startEvent) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite);

            this._onStart = startEvent;
            startEvent.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
        }

        WhenProgramStartBrick.prototype.merge({
            dispose: function () {
                this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
                this._onStart = undefined;  //make sure to disconnect from gameEngine
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenProgramStartBrick;
    })(),


    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenActionBrick(device, sprite, actionEvent, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite);

            this._action = propObject.action;
            //listen to 'when tabbed'
            this._onAction = actionEvent;
            actionEvent.addEventListener(new SmartJs.Event.EventListener(this._onTabbedHandler, this));
        }

        WhenActionBrick.prototype.merge({
            _onTabbedHandler: function (e) {
                if (e.sprite === this._sprite)
                    this.execute();
            },
            dispose: function () {
                this._onAction.removeEventListener(new SmartJs.Event.EventListener(this._onTabbedHandler, this));
                this._onAction = undefined;  //make sure to disconnect from gameEngine
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenActionBrick;
    })(),


    WaitBrick: (function () {
        WaitBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function WaitBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._paused = false;
        }

        WaitBrick.prototype.merge({
            _timerExpiredHandler: function (e) {
                this._return(e.callId);
            },
            _execute: function (callId) {
                if (this._disposed)
                    return;
                var duration = this._duration.calculate();
                if (isNaN(duration)) {
                    this._return(callId);
                    return
                }
                var po = this._pendingOps[callId];
                po.paused = this._paused;
                po.timer = new SmartJs.Components.Timer(Math.round(duration * 1000.0), new SmartJs.Event.EventListener(this._timerExpiredHandler, this), true, { callId: callId });
                if (this._paused)
                    po.timer.pause();
            },
            pause: function () {
                this._paused = true;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.timer)
                        po.timer.pause();
                    po.paused = true;
                }
            },
            resume: function () {
                this._paused = false;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    po.paused = false;
                    if (po.timer)
                        po.timer.resume();
                }
            },
            stop: function () {
                this._paused = false;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.timer)
                        po.timer.stop();
                }
                this._pendingOps = {};
            },
        });

        return WaitBrick;
    })(),


    WhenBroadcastReceiveBrick: (function () {
        WhenBroadcastReceiveBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenBroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite);

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
            PocketCode.Model.BaseBrick.call(this, device, sprite);

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
                if (this._disposed)
                    return;
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
            PocketCode.Model.ThreadedBrick.call(this, device, sprite);

            this._broadcastMgr = broadcastMgr;
            this._broadcastMsgId = propObject.broadcastMsgId;
        }

        BroadcastAndWaitBrick.prototype.merge({
            _returnHandler: function (e) {
                this._return(e.id, e.loopDelay)
            },
            _execute: function (id) {
                if (this._disposed)
                    return;
                this._broadcastMgr.publish(this._broadcastMsgId, new SmartJs.Event.EventListener(this._returnHandler, this), id);
            },
        });

        return BroadcastAndWaitBrick;
    })(),


    NoteBrick: (function () {
        NoteBrick.extends(PocketCode.Model.BaseBrick, false);

        function NoteBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._text = propObject.text;
        }

        NoteBrick.prototype._execute = function () {
            this._return();
        };

        return NoteBrick;
    })(),


    ForeverBrick: (function () {
        ForeverBrick.extends(PocketCode.Model.LoopBrick, false);

        function ForeverBrick(device, sprite, minLoopCycleTime) {
            PocketCode.Model.LoopBrick.call(this, device, sprite, minLoopCycleTime);
        }

        ForeverBrick.prototype.merge({
            /* override */
            _loopConditionMet: function () {
                return true;    //always true for endless loop
            },
        });

        return ForeverBrick;
    })(),


    IfThenElseBrick: (function () {
        IfThenElseBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function IfThenElseBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite);

            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
            this._ifBricks = new PocketCode.Model.BrickContainer([]);
            this._elseBricks = new PocketCode.Model.BrickContainer([]);
        }

        //properties
        Object.defineProperties(IfThenElseBrick.prototype, {
            ifBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Model.BrickContainer)
                        this._ifBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Model.BrickContainer');
                },
            },
            elseBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Model.BrickContainer)
                        this._elseBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Model.BrickContainer');
                },
            },
        });

        //methods
        IfThenElseBrick.prototype.merge({
            _returnHandler: function (e) {
                //helper method to make event binding easier
                this._return(e.id, e.loopDelay)
            },
            _execute: function (threadId) {
                if (this._condition.calculate())
                    this._ifBricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), threadId);
                else
                    this._elseBricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), threadId);
            },
            pause: function () {
                this._ifBricks.pause();
                this._elseBricks.pause();
            },
            resume: function () {
                this._ifBricks.resume();
                this._elseBricks.resume();
            },
            stop: function () {
                PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
                this._ifBricks.stop();
                this._elseBricks.stop();
            },
        });

        return IfThenElseBrick;
    })(),


    RepeatBrick: (function () {
        RepeatBrick.extends(PocketCode.Model.LoopBrick, false);

        function RepeatBrick(device, sprite, minLoopCycleTime, propObject) {
            PocketCode.Model.LoopBrick.call(this, device, sprite, minLoopCycleTime);

            this._timesToRepeat = new PocketCode.Formula(device, sprite, propObject.timesToRepeat);
            this._bricks = propObject.bricks;
        }

        RepeatBrick.prototype.merge({
            /* override */
            _loopConditionMet: function (threadId) {
                var po = this._pendingOps[threadId];
                if (!po)
                    return false;

                if (po.loopCounter === undefined) { //init counter
                    var count = this._timesToRepeat.calculate();
                    if (!isNaN(count))
                        po.loopCounter = Math.round(count);
                    else
                        po.loopCounter = 0;
                }
                else
                    po.loopCounter--;

                if (po.loopCounter > 0)
                    return true;
                return false;
            },
        });

        return RepeatBrick;
    })(),

});
