/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/formula.js" />
'use strict';


PocketCode.Model.merge({

    /**
     * @class BrickContainer: BrickContainer is a Brick object that can contain other Brick(Container)s
     */
    BrickContainer: (function () {
        /**
         * Initializes list of bricks and list of pending Ops
         * @param bricks
         * @constructor
         */
        function BrickContainer(bricks) {
            this._bricks = bricks || [];
            this._pendingOps = {};
        }

        BrickContainer.prototype.merge({
            /**
             * This method creates a new entry indicated with a unique id for pendingOps with the given threadId, onExecutedListener, loopDelay(false)
             * and a child Index (0). Afterwards executeContainerItem is called.
             * @param {SmartJs.Event.EventListener} onExecutedListener: given executedListener
             * @param {String} threadId: given thread ID
             * @throws {Error} missing or invalid arguments: when threadId isn't of type String or listener isn't of type
             * SmartJs.Event.EventListener
             */
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
            /**
             * Goes through pendingOps and calls "execute()" on each bricks[id] entry
             * @param args: consists of id and loopDelay
             * @private
             */
            _executeContainerItem: function (args) {
                var po = this._pendingOps[args.id];
                if (!po)  //stopped
                    return;
                po.loopDelay = args.loopDelay ? args.loopDelay : po.loopDelay;
                var idx = po.childIdx;

                var bricks = this._bricks;
                if (idx < bricks.length) {
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
                    listener.handler.call(listener.scope, { id: threadId, loopDelay: loopDelay });
                }
            },
            /**
             * Goes through the list of bricks and calls "pause()" on each of them
             */
            pause: function () {
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].pause)
                        bricks[i].pause();
                }
            },
            /**
             * Goes through the list of bricks and calls "resume()" on each of them
             */
            resume: function () {
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].resume)
                        bricks[i].resume();
                }
            },
            /**
             * Goes through the list of bricks and calls "stop()" on each of them
             */
            stop: function () {
                var po;
                for (var id in this._pendingOps) {
                    po = this._pendingOps[id];
                    if (typeof po.scope == 'object' && (po.scope instanceof PocketCode.GameEngine || po.scope instanceof PocketCode.Model.Sprite))
                        po.scope = undefined;   //make sure to not dispose objects currently in use

                    for (var prop in po) //may include objects like animation, ...
                        if (po[prop] && po[prop].dispose)
                            po[prop].dispose();
                    delete this._pendingOps[id];
                }
                this._pendingOps = {};

                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].stop)
                        bricks[i].stop();
                }
            },
            dispose: function () {
                this.stop();
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++)
                    bricks[i].dispose();
            },
        });

        return BrickContainer;
    })(),

    /**
     * @class BaseBrick:
     */
    BaseBrick: (function () {
        BaseBrick.extends(SmartJs.Core.Component);
        /**
         * Initializes device and sprite with the given parameters
         * @param device
         * @param sprite
         * @param propObject
         * @constructor
         */
        function BaseBrick(device, sprite, propObject) {
            this._device = device;
            this._sprite = sprite;
            this._commentedOut = propObject.commentedOut;

            //this._threadId = undefined;
            //this._onExecutedListener = undefined;
        }

        BaseBrick.prototype.merge({
            /**
             * calls "execute()" on the brick which is set with given onExecutedListener and threadId
             * @param {SmartJs.Event.EventListener} onExecutedListener
             * @param {String} threadId
             * @throws {Error} missing or invalid arguments: when threadId isn't of type String or listener isn't of type
             * SmartJs.Event.EventListener
             */
            execute: function (onExecutedListener, threadId, scope) {
                if (this._disposed)
                    return;
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('BaseBrick: missing or invalid arguments on execute()');

                this._onExecutedListener = onExecutedListener;
                this._threadId = threadId;
                if (this._commentedOut === true)
                    return this._return(false);
                this._execute(scope);
            },
            /* method to override in derived classes */
            _execute: function (scope) {
                this._return(false);
            },
            /**
             * @param {number} loopDelay
             * @private
             */
            _return: function (loopDelay) {
                this._onExecutedListener.handler.call(this._onExecutedListener.scope, {
                    id: this._threadId,
                    loopDelay: loopDelay
                });
            },
            /* override */
            dispose: function () {
                if (this.stop)
                    this.stop();
                //make sure not all referenced objects get disposed
                this._device = undefined;
                this._sprite = undefined;
                //call super
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return BaseBrick;
    })(),

});

/**
 * @class ThreadedBrick: Thread based type of Brick with unique Id
 */
PocketCode.Model.ThreadedBrick = (function () {
    ThreadedBrick.extends(PocketCode.Model.BaseBrick, false);
    /**
     * Initializes pendingOps
     * @param device
     * @param sprite
     * @constructor
     */
    function ThreadedBrick(device, sprite, propObject) {
        PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        this._pendingOps = {};
    }

    ThreadedBrick.prototype.merge({
        /**
         * Calls "execute(id)" with a uniquely generated thread Id and adds an entry to pendingOps list. Parameters can
         * be null e.g. WhenProgramStartBrick, WhenActionBrick, WhenBroadcastReceiveBrick if not triggered by BroadcastWaitBrick
         * @param {SmartJs.Event.EventListener} onExecutedListener: given executedListener
         * @param {String} threadId: given thread ID
         * @throws {Error} missing or invalid arguments: when threadId isn't of type String or listener isn't of type
         * SmartJs.Event.EventListener
         */
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
                return this._return(id, false);

            this._execute(id, scope);
        },
        /* method to override in derived classes */
        _execute: function (id, scope) {
            this._return(id, false);
        },
        /**
         *
         * @param {String} id
         * @param {number} loopDelay
         * @private
         */
        _return: function (id, loopDelay) {
            var po = this._pendingOps[id];
            if (!po)  //stopped
                return;

            var loopD = loopDelay ? loopDelay : false;
            var listener = po.listener;
            var threadId = po.threadId;

            for (var prop in po) //may include objects like animation, ...
                if (po[prop] && po[prop].dispose)
                    po.dispose();
            delete this._pendingOps[id];
            if (listener)
                listener.handler.call(listener.scope, { id: threadId, loopDelay: loopD });
        },
        //pause: function() {

        //},
        //resume: function() {

        //},
        stop: function () {
            var po;
            for (var id in this._pendingOps) {
                var po = this._pendingOps[id];
                if (typeof po.scope == 'object' && (po.scope instanceof PocketCode.GameEngine || po.scope instanceof PocketCode.Model.Sprite))
                    po.scope = undefined;   //make sure to not dispose objects currently in use

                for (var prop in po) //may include objects like animation, ...
                    if (po[prop] && po[prop].dispose)
                        po[prop].dispose();
                delete this._pendingOps[id];
            }
            this._pendingOps = {};
        },
    });

    return ThreadedBrick;
})();

/**
 * @class SingleContainerBrick
 */
PocketCode.Model.SingleContainerBrick = (function () {
    SingleContainerBrick.extends(PocketCode.Model.ThreadedBrick, false);
    /**
     * Initializes bricks as a new BrickContainer
     * @param device
     * @param sprite
     * @constructor
     */
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
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    SingleContainerBrick.prototype.merge({
        /**
         * helper method to make event binding easier
         * @param e
         * @private
         */
        _returnHandler: function (e) {
            this._return(e.id, e.loopDelay)
        },
        /**
         * calls "execute()" with the given threadId
         * @param {String} threadId
         * @private
         */
        _execute: function (id, scope) {
            this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id, scope);
        },
        /**
         * calls "pause()" on bricks
         */
        pause: function () {
            this._bricks.pause();
        },
        /**
         * calls "resume()" on bricks
         */
        resume: function () {
            this._bricks.resume();
        },
        /**
         * calls "stop()" on bricks and threadedBrick
         */
        stop: function () {
            this._bricks.stop();
            PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
        },
    });

    return SingleContainerBrick;
})();

/**
 * @class ScriptBlock
 * representing a script block
 */
PocketCode.Model.ScriptBlock = (function () {
    ScriptBlock.extends(PocketCode.Model.SingleContainerBrick, false);
    /**
     * Initializes onExecuted event
     * @param device
     * @param sprite
     * @constructor
     */
    function ScriptBlock(device, sprite, propObject) {
        PocketCode.Model.SingleContainerBrick.call(this, device, sprite, propObject);

        if (propObject) {   //can be null
            this._id = propObject.id;
            //this._x = propObject.x;   //removed because currently not in use (commented out in in project JSON as well)
            //this._y = propObject.y;
        }
        this._executionState = PocketCode.ExecutionState.STOPPED;
        this._onExecuted = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(ScriptBlock.prototype, {
        /**
         * returns onExecuted
         * @event
         * @return onExecuted
         */
        onExecuted: {
            get: function () {
                return this._onExecuted;
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
                return this._executionState;
            },
        },
    });

    //methods
    ScriptBlock.prototype.merge({
        /**
         * execute method is overridden, as we need a specific return event handling to determine "program executed"
         */
        execute: function () {
            if (this._executionState == PocketCode.ExecutionState.RUNNING)
                this.stop();    //called twice before finish = stopp current thread and start from beginning (PocketCode specification)
            this._executionState = PocketCode.ExecutionState.RUNNING;
            PocketCode.Model.SingleContainerBrick.prototype.execute.call(this, new SmartJs.Event.EventListener(function () {
                this._executionState = PocketCode.ExecutionState.STOPPED;
                this._onExecuted.dispatchEvent();
            }, this), SmartJs.getNewId());
        },
        /**
         * calls "pause()" on bricks
         */
        pause: function () {
            if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                return;

            PocketCode.Model.SingleContainerBrick.prototype.pause.call(this);
            this._executionState = PocketCode.ExecutionState.PAUSED;
            //^^ while pausing the bricks we do not updae the current execution state
        },
        /**
         * calls "resume()" on bricks
         */
        resume: function () {
            if (this._executionState !== PocketCode.ExecutionState.PAUSED)
                return;

            this._executionState = PocketCode.ExecutionState.RUNNING;
            PocketCode.Model.SingleContainerBrick.prototype.resume.call(this);
        },
        /**
         * calls "stop()" on bricks and threadedBrick
         */
        stop: function () {
            PocketCode.Model.SingleContainerBrick.prototype.stop.call(this);
            this._executionState = PocketCode.ExecutionState.STOPPED;
        },
    });

    return ScriptBlock;
})();


/**
 * @class LoopBrick
 */
PocketCode.Model.LoopBrick = (function () {
    LoopBrick.extends(PocketCode.Model.SingleContainerBrick, false);
    /**
     *
     * @param device
     * @param sprite
     * @constructor
     */
    function LoopBrick(device, sprite, minLoopCycleTime, propObject) {
        PocketCode.Model.SingleContainerBrick.call(this, device, sprite, propObject);

        this._minLoopCycleTime = minLoopCycleTime || 20;
        this._pauseLoop = false;
        //this._bricks typeof PocketCode.Model.BrickContainer
    }

    LoopBrick.prototype.merge({
        /**
         * executes is overridden to check if loop condition is met
         * @param {SmartJs.Event.EventListener} onExecutedListener
         * @param {String} threadId
         */
        execute: function (onExecutedListener, threadId, scope) {
            var id = SmartJs.getNewId();
            this._pendingOps[id] = {
                listener: onExecutedListener,
                threadId: threadId,
                scope: scope,
                startTime: new Date(),
                paused: this._pauseLoop,
            };
            if (this._commentedOut === true)
                return this._return(id, false);

            if (this._bricks && this._loopConditionMet(this._pendingOps[id])) {
                if (!this._pauseLoop && !this._disposed)
                    this._execute(id, scope);
            }
            else
                this._return(id, false);
        },
        /**
         * override to enable loop condition check
         * @param {String} id
         * @private
         */
        _execute: function (id, scope) {
            this._bricks.execute(new SmartJs.Event.EventListener(this._endOfLoopHandler, this), id, scope);
        },
        /**
         * the loop condition is overridden in every single loop brick
         * @returns {boolean}
         * @private
         */
        _loopConditionMet: function (po) {
            return false;
        },
        /**
         * @param e
         * @private
         */
        _endOfLoopHandler: function (e) {
            var id = e.id;
            var po = this._pendingOps[id];
            if (!po)// || po.paused)  //stopped
                return;
            if (this._pauseLoop) { //set them paused when end of loop is reached
                po.paused = true;
                return;
            }

            if (/*this._bricks &&*/ this._loopConditionMet(po)) {   //bricks checked already in execute()
                var executionDelay = 0;
                if (e.loopDelay) {
                    executionDelay = this._minLoopCycleTime - (new Date() - po.startTime);  //20ms min loop cycle time
                }
                po.startTime = new Date();  //re-init for each loop
                if (executionDelay > 0) {
                    window.setTimeout(this._execute.bind(this, id, po.scope), executionDelay);
                }
                else {
                    window.setTimeout(this._execute.bind(this, id, po.scope), 1);
                }
            }
            else
                this._return(id);
        },
        pause: function () {
            this._pauseLoop = true;
            PocketCode.Model.SingleContainerBrick.prototype.pause.call(this);
            //we cannot iterate through all properties and set them paused here as this will cause an error on long (still) running loops
        },
        resume: function () {
            this._pauseLoop = false;
            PocketCode.Model.SingleContainerBrick.prototype.resume.call(this);
            var po,
                pos = this._pendingOps;
            for (var id in pos) {
                //if (!pos.hasOwnProperty(id))
                //    continue;
                po = pos[id];

                if (!po.paused) //only loops without threaded bricks (paused in brick) may have been paused
                    continue;
                po.paused = false;
                if (/*this._bricks &&*/ this._loopConditionMet(po) && !this._disposed)
                    this._execute(id, po.scope);
                else
                    this._return(id);
            }
        },
        stop: function () {
            this._pauseLoop = false;
            PocketCode.Model.SingleContainerBrick.prototype.stop.call(this);
        },
    });

    return LoopBrick;
})();

/**
 * @class UnsupportedBrick: for bricks which are currently not supported
 */
PocketCode.Model.UnsupportedBrick = (function () {
    UnsupportedBrick.extends(PocketCode.Model.BaseBrick, false);

    function UnsupportedBrick(device, sprite, propObject) {
        PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

        this._xml = propObject.xml;
        this._brickType = propObject.brickType;
        this._json = propObject;
    }

    return UnsupportedBrick;
})();


