/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/formula.js" />
'use strict';


PocketCode.Model.merge({

    BrickContainer: (function () {
        function BrickContainer(bricks) {
            this._bricks = bricks || [];
            this._pendingOps = {};
            this._paused = false;
        }

        BrickContainer.prototype.merge({
            execute: function (onExecutedListener, threadId, scope) {
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('BrickContainer: missing or invalid arguments on execute()');

                var id = SmartJs.getNewId();
                this._pendingOps[id] = {
                    listener: onExecutedListener,
                    threadId: threadId,
                    scope: scope,
                    loopDelay: false,
                    childIdx: 0,
                };
                this._executeContainerItem({ id: id, loopDelay: false });
            },
            _executeContainerItem: function (args) {
                var po = this._pendingOps[args.id];
                if (!po)  //stopped
                    return;

                po.loopDelay = args.loopDelay ? args.loopDelay : po.loopDelay;
                if (this._paused) {
                    po.paused = true;  //indicating the pause occured in the container, not in the brick
                    return;
                }

                var idx = po.childIdx,
                    bricks = this._bricks;
                if (idx < bricks.length && !args.stopped) {
                    po.childIdx++;
                    bricks[idx].execute(new SmartJs.Event.EventListener(this._executeContainerItem, this), args.id, po.scope);
                }
                else {
                    if (typeof po.scope == 'object' && (po.scope instanceof PocketCode.GameEngine || po.scope instanceof PocketCode.Model.Sprite))
                        po.scope = undefined;   //make sure to not dispose objects currently in use
                    var listener = po.listener,
                        threadId = po.threadId,
                        loopDelay = po.loopDelay;
                    for (var prop in po)
                        if (po[prop] && po[prop].dispose)
                            po[prop].dispose();
                    delete this._pendingOps[args.id];
                    listener.handler.call(listener.scope, { id: threadId, loopDelay: loopDelay, stopped: args.stopped });
                }
            },
            pause: function () {
                this._paused = true;
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].pause)
                        bricks[i].pause();
                }
            },
            resume: function () {
                this._paused = false;
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].resume)
                        bricks[i].resume();
                    if (this._paused)   //e.g. AskBrick: after resuming the next brick will pause the routine again
                        return;
                }

                var op;
                for (var id in this._pendingOps) {
                    if (this._paused)   //e.g. AskBrick: after resuming the next brick will pause the routine again
                        return;
                    op = this._pendingOps[id];
                    if (op.paused) {    //paused in container
                        op.paused = undefined;
                        this._executeContainerItem({ id: id });
                    }
                }
            },
            _stopPendingOperations: function () {
                var po;
                for (var id in this._pendingOps) {
                    po = this._pendingOps[id];
                    if (typeof po.scope == 'object' && (po.scope instanceof PocketCode.GameEngine || po.scope instanceof PocketCode.Model.Sprite))
                        po.scope = undefined;   //make sure to not dispose objects currently in use

                    for (var prop in po) //may include objects like timer, animation, ...
                        if (po[prop] && po[prop].dispose)
                            po[prop].dispose();
                    delete this._pendingOps[id];
                }
                this._pendingOps = {};
            },
            stop: function (calledFromStopBrick) {
                this._stopPendingOperations();

                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].stop)
                        bricks[i].stop(calledFromStopBrick);
                }
                this._paused = false;
            },
            dispose: function () {
                this.stop();
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++)
                    bricks[i].dispose();
                this._bricks = [];
            },
        });

        return BrickContainer;
    })(),

    BaseBrick: (function () {
        BaseBrick.extends(SmartJs.Core.Component);

        function BaseBrick(device, sprite, propObject) {
            this._device = device;
            this._sprite = sprite;
            this._commentedOut = propObject.commentedOut;

            //this._threadId = undefined;
        }

        BaseBrick.prototype.merge({
            execute: function (onExecutedListener, threadId, scope) {
                if (this._disposed)
                    return;
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('BaseBrick: missing or invalid arguments on execute()');

                this._onExecutedListener = onExecutedListener;
                this._threadId = threadId;
                if (this._commentedOut === true)
                    this._return();
                else
                    this._execute(scope);
            },
            _execute: function (scope) {    //override this method in derived classes
                this._return();
            },
            _return: function (loopDelay, stopped) {
                if (this._disposed)
                    return;
                this._onExecutedListener.handler.call(this._onExecutedListener.scope, {
                    id: this._threadId,
                    loopDelay: loopDelay,
                    stopped: stopped,
                });
            },
            /* override */
            dispose: function () {
                //make sure not all referenced objects get disposed
                this._device = undefined;
                this._sprite = undefined;

                SmartJs.Core.Component.prototype.dispose.call(this);    //call super
            },
        });

        return BaseBrick;
    })(),

});

PocketCode.Model.merge({

    ThreadedBrick: (function () {
        ThreadedBrick.extends(PocketCode.Model.BaseBrick, false);

        function ThreadedBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._pendingOps = {};
            this._paused = false;
        }

        ThreadedBrick.prototype.merge({
            execute: function (onExecutedListener, threadId, scope) {
                if (this._disposed)
                    return;
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('ThreadedBrick: missing or invalid arguments on execute()');

                var id = SmartJs.getNewId();
                this._pendingOps[id] = {
                    listener: onExecutedListener,
                    threadId: threadId,
                    scope: scope,
                };
                if (this._commentedOut === true)
                    this._return(id, false);
                else
                    this._execute(id, scope);
            },
            /* method to override in derived classes */
            _execute: function (id, scope) {
                this._return(id, false);
            },
            _return: function (id, loopDelay, stopped) {
                var po = this._pendingOps[id];
                if (!po)  //stopped
                    return;

                var loopD = loopDelay ? loopDelay : false;
                var listener = po.listener;
                var threadId = po.threadId;

                for (var prop in po) //may include objects like timers, animations, ...
                    if (po[prop] && po[prop].dispose)
                        po[prop].dispose();
                delete this._pendingOps[id];
                if (listener)
                    listener.handler.call(listener.scope, {
                        id: threadId,
                        loopDelay: loopD,
                        stopped: stopped,
                    });
            },
            pause: function () {
                this._paused = true;
            },
            resume: function () {
                this._paused = false;
            },
            _stopPendingOperations: function () {
                var po,
                    pos = this._pendingOps;
                for (var id in pos) {
                    po = this._pendingOps[id];
                    if (typeof po.scope == 'object' && (po.scope instanceof PocketCode.GameEngine || po.scope instanceof PocketCode.Model.Sprite))
                        po.scope = undefined;   //make sure to not dispose objects currently in use

                    for (var prop in po) //may include objects like animation, ...
                        if (po[prop] && po[prop].dispose)
                            po[prop].dispose();
                    //delete this._pendingOps[id];
                }
                this._pendingOps = {};
            },
            stop: function () {
                this._stopPendingOperations();
                this._paused = false;
            },
            /* override */
            dispose: function () {
                this.stop();

                PocketCode.Model.BaseBrick.prototype.dispose.call(this);    //call super
            },
        });

        return ThreadedBrick;
    })(),

    UnsupportedBrick: (function () {
        UnsupportedBrick.extends(PocketCode.Model.BaseBrick, false);

        function UnsupportedBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._xml = propObject.xml;
            this._brickType = propObject.brickType;
            this._json = propObject;
        }

        return UnsupportedBrick;
    })(),

});

PocketCode.Model.SingleContainerBrick = (function () {
    SingleContainerBrick.extends(PocketCode.Model.ThreadedBrick, false);

    function SingleContainerBrick(device, sprite, propObject) {
        PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

        this._bricks = new PocketCode.Model.BrickContainer([]);
    }

    //properties
    Object.defineProperties(SingleContainerBrick.prototype, {
        bricks: {
            set: function (brickContainer) {
                if (brickContainer instanceof PocketCode.Model.BrickContainer)
                    this._bricks = brickContainer;
                else
                    throw new Error('invalid argument brickContainer: expected type PocketCode.Model.BrickContainer');
            },
        },
    });

    //methods
    SingleContainerBrick.prototype.merge({
        _returnHandler: function (e) {
            this._return(e.id, e.loopDelay, e.stopped)
        },
        _execute: function (id, scope) {
            this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id, scope);
        },
        pause: function () {
            this._bricks.pause();
            PocketCode.Model.ThreadedBrick.prototype.pause.call(this);
        },
        resume: function () {
            this._bricks.resume();
            PocketCode.Model.ThreadedBrick.prototype.resume.call(this);
        },
        stop: function (calledFromStopBrick) {
            PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
            this._bricks.stop(calledFromStopBrick);
        },
    });

    return SingleContainerBrick;
})();

PocketCode.Model.merge({

    ScriptBlock: (function () {
        ScriptBlock.extends(PocketCode.Model.SingleContainerBrick, false);

        function ScriptBlock(device, sprite, propObject) {
            PocketCode.Model.SingleContainerBrick.call(this, device, sprite, propObject);

            if (propObject) {   //can be null
                this._id = propObject.id;
                //this._x = propObject.x;   //removed because currently not in use (commented out in in project JSON as well)
                //this._y = propObject.y;
            }
            this.__executionState = PocketCode.ExecutionState.STOPPED;
            this._onExecutionStateChange = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(ScriptBlock.prototype, {
            onExecutionStateChange: {
                get: function () {
                    return this._onExecutionStateChange;
                },
            },
        });

        //properties
        Object.defineProperties(ScriptBlock.prototype, {
            id: {
                get: function () {
                    return this._id;
                },
            },
            executionState: {
                get: function () {
                    return this.__executionState;
                },
            },
            _executionState: {
                set: function (value) {
                    if (this.__executionState == value)
                        return;
                    this.__executionState = value;
                    this._onExecutionStateChange.dispatchEvent({ executionState: value });
                },
                //get: function () {
                //    return this.__executionState;
                //},
            },
        });

        //methods
        ScriptBlock.prototype.merge({
            /*override*/
            execute: function (onExecutedListener, threadId, scope) {
                if (this._disposed)
                    return;
                this._executionState = PocketCode.ExecutionState.RUNNING
                PocketCode.Model.SingleContainerBrick.prototype.execute.call(this, onExecutedListener, threadId);
            },
            _return: function (id, loopDelay, stopped) {
                this._executionState = PocketCode.ExecutionState.STOPPED;
                PocketCode.Model.SingleContainerBrick.prototype._return.call(this, id, loopDelay, stopped);
            },
            stop: function (calledFromStopBrick) {
                PocketCode.Model.SingleContainerBrick.prototype.stop.call(this, calledFromStopBrick);
                this._executionState = PocketCode.ExecutionState.STOPPED;
            },
        });

        return ScriptBlock;
    })(),

    LoopBrick: (function () {
        LoopBrick.extends(PocketCode.Model.SingleContainerBrick, false);

        function LoopBrick(device, sprite, minLoopCycleTime, propObject) {
            PocketCode.Model.SingleContainerBrick.call(this, device, sprite, propObject);

            this._minLoopCycleTime = minLoopCycleTime || 20;
            this._calls = 0;
        }

        LoopBrick.prototype.merge({
            execute: function (onExecutedListener, threadId, scope) {
                if (this._disposed)
                    return;

                var id = SmartJs.getNewId();
                this._pendingOps[id] = {
                    listener: onExecutedListener,
                    threadId: threadId,
                    scope: scope,
                    startTime: Date.now(),
                };
                if (this._commentedOut === true)
                    this._return(id, false);
                else if (this._loopConditionMet(this._pendingOps[id]))
                    this._execute(id, scope);
                else
                    this._return(id, false);
            },
            _execute: function (id, scope) {
                if (this._disposed || !this._pendingOps[id])
                    return;
                this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), id, scope);
            },
            _loopConditionMet: function (po) {
                return false;
            },
            _endOfLoopHandler: function (e) {
                var id = e.id;
                var po = this._pendingOps[id];
                if (!po)
                    return;

                this._calls++;
                if (/*this._bricks &&*/ this._loopConditionMet(po) && !e.stopped) {   //bricks checked already in execute()
                    var executionDelay = 0;
                    if (e.loopDelay) {
                        executionDelay = this._minLoopCycleTime - (Date.now() - po.startTime);  //20ms min loop cycle time
                    }
                    po.startTime = Date.now();  //re-init for each loop
                    if (executionDelay > 0) {
                        window.setTimeout(this._execute.bind(this, id, po.scope), executionDelay);
                    }
                    else {
                        this._calls++;
                        if (this._calls < PocketCode.threadCounter)
                            this._execute.call(this, id, po.scope);
                        else
                            window.setTimeout(this._execute.bind(this, id, po.scope), 0);
                    }
                }
                else
                    this._return(id, false, e.stopped);
                this._calls = 0;
            },
        });

        return LoopBrick;
    })(),

});

PocketCode.Model.EventBrick = (function () {
    EventBrick.extends(PocketCode.Model.ScriptBlock, false);

    function EventBrick(device, sprite, propObject) {
        PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

        this._stoppedAt = Date.now() - 1;
        //this._pendingOp = undefined;    //used for current thread
    }

    //methods
    EventBrick.prototype.merge({
        //supporting subscription to publish-subscribe broker (broadcast and wait, background-change and wait, ..)
        _subscriberCallback: function (dispatchedAt, onExecutedListener, threadId) {
            if (onExecutedListener && threadId) {   //..AndWait
                if ((dispatchedAt && dispatchedAt < this._stoppedAt) || this._disposed) {
                    //stopped before executed
                    onExecutedListener.handler.call(onExecutedListener.scope, { id: threadId, loopDelay: false });
                    return;
                }
                this.execute(onExecutedListener, threadId);
            }
            else {  //without ..AndWait
                this.executeEvent({ dispatchedAt: dispatchedAt });
            }
        },
        executeEvent: function (e) {
            if (e && e.dispatchedAt && e.dispatchedAt <= this._stoppedAt)
                return;

            //if no arguments provided (typical case for script blocks), we create some dummy args to call our super method
            this.execute();//new SmartJs.Event.EventListener(function () { }, this), SmartJs.getNewId());
        },
        /*override*/
        execute: function (onExecutedListener, threadId) {
            if (this._disposed)
                return;
            if (onExecutedListener && (!(onExecutedListener instanceof SmartJs.Event.EventListener) || !threadId))
                throw new Error('EventBrick: missing or invalid arguments on execute()');

            threadId = threadId || SmartJs.getNewId()
            if (this._commentedOut === true) {
                this._return(threadId);
                return;
            }

            if (this.executionState == PocketCode.ExecutionState.RUNNING)
                PocketCode.Model.SingleContainerBrick.prototype.stop.call(this);    //call stop without changing executionState
            else
                this._executionState = PocketCode.ExecutionState.RUNNING;

            this._threadId = threadId;
            this._onExecutedListener = onExecutedListener;
            this._execute(threadId);
        },
        _return: function (id, loopDelay) {
            if (this._disposed)
                return;

            var listener = this._onExecutedListener;
            this._onExecutedListener = this._threadId = undefined;
            this._executionState = PocketCode.ExecutionState.STOPPED;

            if (listener) {
                listener.handler.call(listener.scope, {
                    id: id,
                    loopDelay: loopDelay,
                });
            }
        },
        stop: function (calledFromStopBrick) {
            PocketCode.Model.ScriptBlock.prototype.stop.call(this);

            if (calledFromStopBrick) {
                this._stoppedAt = Date.now();
                //make sure we call our callback handler (e.g. broadcastWait of other sprites) if this script is stopped - pending ops cleared in publishSubscribeHost
                setTimeout(this._return.bind(this, this._threadId), 1);   //delay to make sure the recursived stop has reached all bricks before executing callback
            }
        },
        dispose: function () {
            //to make sure a pending callback (broadcastWait, changeBackgroundAndWait, ..) will be called on dispose of clones
            if (this._sprite instanceof PocketCode.Model.SpriteClone) {
                this._return(this._threadId);
            }
            PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
        },
    });

    return EventBrick;
})();
