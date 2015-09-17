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
 * @version 1.0
 */

PocketCode.Model.merge({

    ProgramStartBrick: (function () {
        ProgramStartBrick.extends(PocketCode.Model.RootContainerBrick, false);

        function ProgramStartBrick(device, sprite, startEvent) {
            PocketCode.Model.RootContainerBrick.call(this, device, sprite);

            //this._bricks; type of PocketCode.Model.BrickContainer
            //listen to project start
            //project.onProgramStart.addEventListener(new SmartJs.Event.EventListener(this._programStartHandler, this));
            this._onStart = startEvent;
            startEvent.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
        }

        ProgramStartBrick.prototype.merge({
            //_programStartHandler: function(e) {
            //    this.execute(new SmartJs.Event.EventListener(function () { this._onExecuted.dispatchEvent(); }, this), SmartJs.getNewId());
            //	//when this._returnHandler is called this handler calls _return() for us which is overridden
            //	//to call our custom event
            //},
            _execute: function (id) {
                //if (!this._bricks) {
                //	this._return(id);
                //	return;
                //}
                this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id);
                //this._return();
            },
            //pause: function () {
            //	this._bricks.pause();
            //},
            //resume: function () {
            //	this._bricks.resume();
            //},
            dispose: function () {
                this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
                PocketCode.Model.RootContainerBrick.prototype.dispose.call(this);
            },
        });

        return ProgramStartBrick;
    })(),


    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.Model.RootContainerBrick, false);

        function WhenActionBrick(device, sprite, actionEvent, propObject) {
            PocketCode.Model.RootContainerBrick.call(this, device, sprite);

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
            _execute: function (id) {
                //if (!this._bricks) {
                //	this._return(id);
                //	return;
                //}
                this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id);
            },
            //pause: function () {
            //	this._bricks.pause();
            //},
            //resume: function () {
            //	this._bricks.resume();
            //},
            dispose: function () {
                this._onAction.removeEventListener(new SmartJs.Event.EventListener(this._onTabbedHandler, this));
                PocketCode.Model.RootContainerBrick.prototype.dispose.call(this);
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
                var po = this._pendingOps[callId];
                po.paused = this._paused;
                po.timer = new SmartJs.Components.Timer(this._duration.calculate() * 1000, new SmartJs.Event.EventListener(this._timerExpiredHandler, this), true, { callId: callId });
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
                    po.timer.resume();
                }
            },
            stop: function () {
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    po.timer.stop();
                }
                this._pendingOps = {};
            },
        });

        return WaitBrick;
    })(),


    BroadcastReceiveBrick: (function () {
        BroadcastReceiveBrick.extends(PocketCode.Model.RootContainerBrick, false);

        function BroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.RootContainerBrick.call(this, device, sprite);

            //this._broadcastMgr = broadcastMgr;
            //this._receiveMsgId = propObject.receiveMsgId;
            broadcastMgr.subscribe(propObject.receiveMsgId, new SmartJs.Event.EventListener(this._onBroadcastHandler, this));
            //this._bricks; type of PocketCode.Model.BrickContainer
        }

        BroadcastReceiveBrick.prototype.merge({
            _onBroadcastHandler: function (e) {
                if (e && e.id) {    //for broadcastWait: e.g. { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) }
                    PocketCode.Model.SingleContainerBrick.prototype.execute.call(this, e.listener, e.id);
                }
                else {
                    //the onExecuted event is only dispatched for broadcasts- broadcastWait will always terminate befor the calling routine
                    this.execute();
                }
            },
            //_returnHandler: function(e) {
            //    this._return(e.id, e.loopDelay)
            //},
            _execute: function (id) {
                //if (!this._bricks) {
                //	this._return(id);
                //	return;
                //}
                this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id);
            },
            //pause: function () {
            //	this._bricks.pause();
            //},
            //resume: function () {
            //	this._bricks.resume();
            //},
        });

        return BroadcastReceiveBrick;
    })(),


    BroadcastBrick: (function () {
        BroadcastBrick.extends(PocketCode.Model.BaseBrick, false);

        function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._broadcastMgr = broadcastMgr;
            this._broadcastMsgId = propObject.broadcastMsgId;
        }

        BroadcastBrick.prototype._execute = function () {
            this._broadcastMgr.publish(this._broadcastMsgId);
            this._return();
        };

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
                //this._broadcastMgr.publish(this._broadcastMsgId, new SmartJs.Event.EventListener(_waitHandler, this), id);
                this._broadcastMgr.publish(this._broadcastMsgId, new SmartJs.Event.EventListener(this._returnHandler, this), id);
            },
            //_waitHandler: function (callId, loopDelay) {
            //    this._return(callId, loopDelay)
            //},
            //pause: function () {
            //	//TODO: 
            //},
            //resume: function () {
            //	//TODO: 
            //},
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

            //this._bricks = propObject.bricks;
        }

        ForeverBrick.prototype.merge({
            /* override */
            _loopConditionMet: function () {
                //always true for endless loop
                return true;
            },
            //_returnHandler: function (e) {
            //	this._return(e.id, e.loopDelay);  
            //},
            _execute: function (threadId) {
                this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), threadId);
            },
            //stop: function () {
            //	//required? 
            //},
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
                //enumerable: false,
                //configurable: true,
            },
            elseBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Model.BrickContainer)
                        this._elseBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Model.BrickContainer');
                },
                //enumerable: false,
                //configurable: true,
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

                if (po.loopCounter === undefined) //the formula may change during look cycle? //TODO: separate counter from condition?
                    po.loopCounter = Math.round(this._timesToRepeat.calculate());

                if (po.loopCounter > 0)
                    return true;
                return false;
            },
            //_returnHandler: function (e) {
            //TODO: loop counter and increment
            //rerun _execute on container n times and than call _return
            //this._return(e.id, e.loopDelay);
            //},
            _execute: function (threadId) {
                var po = this._pendingOps[threadId];
                if (!po)
                    return false;
                //if (!po.loopCounter)  //not required: loopCondition has to be checkt first
                //    po.loopCounter = this._timesToRepeat.calculate();
                po.loopCounter--;// = po.loopCounter - 1;

                this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), threadId);
            },
        });

        return RepeatBrick;
    })(),

});
