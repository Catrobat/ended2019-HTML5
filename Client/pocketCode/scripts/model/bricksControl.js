<<<<<<< HEAD
﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/program.js" />
/// <reference path="bricksCore.js" />
'use strict';

/**
 * @fileOverview bricksControl
 * @version 1.0
 */

PocketCode.Bricks.merge({

    ProgramStartBrick: (function () {
        ProgramStartBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

        function ProgramStartBrick(device, program, sprite) {
            PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);

            //this._bricks; type of PocketCode.Bricks.BrickContainer
            //listen to program start
            //program.onProgramStart.addEventListener(new SmartJs.Event.EventListener(this._programStartHandler, this));
            program.onProgramStart.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
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
        });

        return ProgramStartBrick;
    })(),


    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

        function WhenActionBrick(device, program, sprite, propObject) {
            PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);

            this._action = propObject.action;
            //listen to 'when tabbed'
            program.onTabbedAction.addEventListener(new SmartJs.Event.EventListener(this._onTabbedHandler, this));
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
        });

        return WhenActionBrick;
    })(),


    WaitBrick: (function () {
        WaitBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function WaitBrick(device, sprite, propObject) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
        }

        WaitBrick.prototype.merge({
            _timerExpiredHandler: function (e) {
                this._return(e.callId);
            },
            _execute: function (callId) {
                var po = this._pendingOps[callId];
                po.timer = new SmartJs.Components.Timer(this._duration.calculate(), new SmartJs.Event.EventListener(this._timerExpiredHandler, this), true, { callId: callId });
            },
            pause: function () {
                var po = this._pendingOps;
                for (var o in po) {
                    var timer = po[o].timer;
                    if (timer)
                        timer.pause();
                }
            },
            resume: function () {
                var po = this._pendingOps;
                for (var o in po) {
                    var timer = po[o].timer;
                    if (timer)
                        timer.resume();
                }
            },
            stop: function () {
                var po = this._pendingOps;
                for (var o in po) {
                    var timer = po[o].timer;
                    if (timer)
                        timer.stop();
                }
                this._pendingOps = {};
            },
        });

        return WaitBrick;
    })(),


    BroadcastReceiveBrick: (function () {
        BroadcastReceiveBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

        function BroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);

            //this._broadcastMgr = broadcastMgr;
            //this._receiveMsgId = propObject.receiveMsgId;
            broadcastMgr.subscribe(propObject.receiveMsgId, new SmartJs.Event.EventListener(this._onBroadcastHandler, this));
            //this._bricks; type of PocketCode.Bricks.BrickContainer
        }

        BroadcastReceiveBrick.prototype.merge({
            _onBroadcastHandler: function (e) {
                if (e && e.id) {    //for broadcastWait: e.g. { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) }
                    PocketCode.Bricks.SingleContainerBrick.prototype.execute.call(this, e.listener, e.id);
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
        BroadcastBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

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
        BroadcastAndWaitBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function BroadcastAndWaitBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

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
        NoteBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function NoteBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._text = propObject.text;
        }

        NoteBrick.prototype._execute = function () {
            this._return();
        };

        return NoteBrick;
    })(),


    ForeverBrick: (function () {
        ForeverBrick.extends(PocketCode.Bricks.LoopBrick, false);

        function ForeverBrick(device, sprite, minLoopCycleTime) {
            PocketCode.Bricks.LoopBrick.call(this, device, sprite, minLoopCycleTime);

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
            _execute: function (callId) {
                this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), callId);
            },
            //stop: function () {
            //	//required? 
            //},
        });

        return ForeverBrick;
    })(),


    IfThenElseBrick: (function () {
        IfThenElseBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function IfThenElseBrick(device, sprite, propObject) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
            this._ifBricks = new PocketCode.Bricks.BrickContainer([]);
            this._elseBricks = new PocketCode.Bricks.BrickContainer([]);
        }

        //properties
        Object.defineProperties(IfThenElseBrick.prototype, {
            ifBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Bricks.BrickContainer)
                        this._ifBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Bricks.BrickContainer');
                },
                //enumerable: false,
                //configurable: true,
            },
            elseBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Bricks.BrickContainer)
                        this._elseBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Bricks.BrickContainer');
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
                PocketCode.Bricks.ThreadedBrick.prototype.stop.call(this);
                this._ifBricks.stop();
                this._elseBricks.stop();
            },
        });

        return IfThenElseBrick;
    })(),


    RepeatBrick: (function () {
        RepeatBrick.extends(PocketCode.Bricks.LoopBrick, false);

        function RepeatBrick(device, sprite, propObject, minLoopCycleTime) {
            PocketCode.Bricks.LoopBrick.call(this, device, sprite, minLoopCycleTime);

            this._timesToRepeat = new PocketCode.Formula(device, sprite, propObject.timesToRepeat);
            this._bricks = propObject.bricks;
        }

        RepeatBrick.prototype.merge({
            /* override */
            _loopConditionMet: function (callId) {
                var po = this._pendingOps[callId];
                if (po.loopCounter === undefined)
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
            _execute: function (callId) {
                var po = this._pendingOps[callId];
                //if (!po.loopCounter)  //not required: loopCondition has to be checkt first
                //    po.loopCounter = this._timesToRepeat.calculate();
                po.loopCounter--;// = po.loopCounter - 1;

                this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), callId);
            },
        });

        return RepeatBrick;
    })(),

});
=======
﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/program.js" />
/// <reference path="bricksCore.js" />
'use strict';

/**
 * @fileOverview bricksControl
 * @version 1.0
 */

PocketCode.Bricks.merge({

    ProgramStartBrick: (function () {
        ProgramStartBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

        function ProgramStartBrick(device, program, sprite) {
            PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);

            //this._bricks; type of PocketCode.Bricks.BrickContainer
            //listen to program start
            //program.onProgramStart.addEventListener(new SmartJs.Event.EventListener(this._programStartHandler, this));
            program.onProgramStart.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
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
        });

        return ProgramStartBrick;
    })(),


    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

        function WhenActionBrick(device, program, sprite, propObject) {
            PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);

            this._action = propObject.action;
            //listen to 'when tabbed'
            program.onTabbedAction.addEventListener(new SmartJs.Event.EventListener(this._onTabbedHandler, this));
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
        });

        return WhenActionBrick;
    })(),


    WaitBrick: (function () {
        WaitBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function WaitBrick(device, sprite, propObject) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
        }

        WaitBrick.prototype.merge({
            _timerExpiredHandler: function (e) {
                this._return(e.callId);
            },
            _execute: function (callId) {
                var po = this._pendingOps[callId];
                po.timer = new SmartJs.Components.Timer(this._duration.calculate(), new SmartJs.Event.EventListener(this._timerExpiredHandler, this), true, { callId: callId });
            },
            pause: function () {
                var po = this._pendingOps;
                for (var o in po) {
                    var timer = po[o].timer;
                    if (timer)
                        timer.pause();
                }
            },
            resume: function () {
                var po = this._pendingOps;
                for (var o in po) {
                    var timer = po[o].timer;
                    if (timer)
                        timer.resume();
                }
            },
            stop: function () {
                var po = this._pendingOps;
                for (var o in po) {
                    var timer = po[o].timer;
                    if (timer)
                        timer.stop();
                }
                this._pendingOps = {};
            },
        });

        return WaitBrick;
    })(),


    BroadcastReceiveBrick: (function () {
        BroadcastReceiveBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

        function BroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);

            //this._broadcastMgr = broadcastMgr;
            //this._receiveMsgId = propObject.receiveMsgId;
            broadcastMgr.subscribe(propObject.receiveMsgId, new SmartJs.Event.EventListener(this._onBroadcastHandler, this));
            //this._bricks; type of PocketCode.Bricks.BrickContainer
        }

        BroadcastReceiveBrick.prototype.merge({
            _onBroadcastHandler: function (e) {
                if (e && e.id) {    //for broadcastWait: e.g. { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) }
                    PocketCode.Bricks.SingleContainerBrick.prototype.execute.call(this, e.listener, e.id);
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
        BroadcastBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

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
        BroadcastAndWaitBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function BroadcastAndWaitBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

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
        NoteBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function NoteBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._text = propObject.text;
        }

        NoteBrick.prototype._execute = function () {
            this._return();
        };

        return NoteBrick;
    })(),


    ForeverBrick: (function () {
        ForeverBrick.extends(PocketCode.Bricks.LoopBrick, false);

        function ForeverBrick(device, sprite, minLoopCycleTime) {
            PocketCode.Bricks.LoopBrick.call(this, device, sprite, minLoopCycleTime);

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
            _execute: function (callId) {
                this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), callId);
            },
            //stop: function () {
            //	//required? 
            //},
        });

        return ForeverBrick;
    })(),


    IfThenElseBrick: (function () {
        IfThenElseBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

        function IfThenElseBrick(device, sprite, propObject) {
            PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
            this._ifBricks = new PocketCode.Bricks.BrickContainer([]);
            this._elseBricks = new PocketCode.Bricks.BrickContainer([]);
        }

        //properties
        Object.defineProperties(IfThenElseBrick.prototype, {
            ifBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Bricks.BrickContainer)
                        this._ifBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Bricks.BrickContainer');
                },
                //enumerable: false,
                //configurable: true,
            },
            elseBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Bricks.BrickContainer)
                        this._elseBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Bricks.BrickContainer');
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
                PocketCode.Bricks.ThreadedBrick.prototype.stop.call(this);
                this._ifBricks.stop();
                this._elseBricks.stop();
            },
        });

        return IfThenElseBrick;
    })(),


    RepeatBrick: (function () {
        RepeatBrick.extends(PocketCode.Bricks.LoopBrick, false);

        function RepeatBrick(device, sprite, propObject, minLoopCycleTime) {
            PocketCode.Bricks.LoopBrick.call(this, device, sprite, minLoopCycleTime);

            this._timesToRepeat = new PocketCode.Formula(device, sprite, propObject.timesToRepeat);
            this._bricks = propObject.bricks;
        }

        RepeatBrick.prototype.merge({
            /* override */
            _loopConditionMet: function (callId) {
                var po = this._pendingOps[callId];
                if (po.loopCounter === undefined)
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
            _execute: function (callId) {
                var po = this._pendingOps[callId];
                //if (!po.loopCounter)  //not required: loopCondition has to be checkt first
                //    po.loopCounter = this._timesToRepeat.calculate();
                po.loopCounter--;// = po.loopCounter - 1;

                this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), callId);
            },
        });

        return RepeatBrick;
    })(),

});
>>>>>>> 18967ba9f0cd729500ca8b280af758be3d774944
