/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/formula.js" />
'use strict';

/**
 * @fileOverview bricksCore: This file covers the different types of a brick. BrickContainer, BaseBrick, ThreadedBrick,
 * SingleContainerBrick, RootContainerBrick, LoopBrick, UnsupportedBrick
 *
 * @author catrobat HTML5 team
 * @version 1.0
 *
 */

PocketCode.Bricks = {

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
            execute: function (onExecutedListener, threadId) {
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('BrickContainer: missing or invalid arguments on execute()');

                var id = SmartJs.getNewId();
                this._pendingOps[id] = {
                    threadId: threadId,
                    listener: onExecutedListener,
                    loopDelay: false,
                    childIdx: 0
                };
                this._executeContainerItem({ id: id, loopDelay: false });
            },
            /**
             * Goes through pendingOps and calls "execute()" on each bricks[id] entry
             * @param args: consists of id and loopDelay
             * @private
             */
            _executeContainerItem: function (args) {
                var op = this._pendingOps[args.id];
                if (!op)  //stopped
                    return;
                op.loopDelay = args.loopDelay ? args.loopDelay : op.loopDelay;
                var idx = op.childIdx;

                var bricks = this._bricks;
                if (idx < bricks.length) {
                    op.childIdx++;
                    bricks[idx].execute(new SmartJs.Event.EventListener(this._executeContainerItem, this), args.id);
                }
                else {
                    var listener = op.listener;
                    delete this._pendingOps[args.id];
                    listener.handler.call(listener.scope, { id: op.threadId, loopDelay: op.loopDelay });
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
                this._pendingOps = {};
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].stop)
                        bricks[i].stop();
                }
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
         * @constructor
         */
        function BaseBrick(device, sprite) {
            this._device = device;
            this._sprite = sprite;
        }

        BaseBrick.prototype.merge({
            /**
             * calls "execute()" on the brick which is set with given onExecutedListener and threadId
             * @param {SmartJs.Event.EventListener} onExecutedListener
             * @param {String} threadId
             * @throws {Error} missing or invalid arguments: when threadId isn't of type String or listener isn't of type
             * SmartJs.Event.EventListener
             *
             */
            execute: function (onExecutedListener, threadId) {
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('BaseBrick: missing or invalid arguments on execute()');

                this._onExecutedListener = onExecutedListener;
                this._threadId = threadId;
                this._execute();
            },
            /**
             *
             * @param {number} loopDelay
             * @private
             */
            _return: function (loopDelay) {
                this._onExecutedListener.handler.call(this._onExecutedListener.scope, {
                    id: this._threadId,
                    loopDelay: loopDelay
                });
            },
        });

        return BaseBrick;
    })(),

};

/**
 * @class ThreadedBrick: Thread based type of Brick with unique Id
 */
PocketCode.Bricks.ThreadedBrick = (function () {
    ThreadedBrick.extends(PocketCode.Bricks.BaseBrick, false);
    /**
     * Initializes pendingOps
     * @param device
     * @param sprite
     * @constructor
     */
    function ThreadedBrick(device, sprite) {
        PocketCode.Bricks.BaseBrick.call(this, device, sprite);
        this._pendingOps = {};
    }

    ThreadedBrick.prototype.merge({
        /**
         * Calls "execute(id)" with a uniquely generated thread Id and adds an entry to pendingOps list. Parameters can
         * be null e.g. ProgramStartBrick, WhenActionBrick, BroadcastReceiveBrick if not triggered by BroadcastWaitBrick
         * @param {SmartJs.Event.EventListener} onExecutedListener: given executedListener
         * @param {String} threadId: given thread ID
         * @throws {Error} missing or invalid arguments: when threadId isn't of type String or listener isn't of type
         * SmartJs.Event.EventListener
         */
        execute: function (onExecutedListener, threadId) {
            if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                throw new Error('ThreadedBrick: missing or invalid arguments on execute()');

            var id = SmartJs.getNewId();
            this._pendingOps[id] = { threadId: threadId, listener: onExecutedListener };
            this._execute(id);
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
            delete this._pendingOps[id];
            if (listener)
                listener.handler.call(listener.scope, { id: threadId, loopDelay: loopD });
        },
        //pause: function() {

        //},
        //resume: function() {

        //},

        /**
         * clears pendingOps list
         */
        stop: function () {
            this._pendingOps = {};
        },
    });

    return ThreadedBrick;
})();

/**
 * @class SingleContainerBrick
 */
PocketCode.Bricks.SingleContainerBrick = (function () {
    SingleContainerBrick.extends(PocketCode.Bricks.ThreadedBrick, false);
    /**
     * Initializes bricks as a new BrickContainer
     * @param device
     * @param sprite
     * @constructor
     */
    function SingleContainerBrick(device, sprite) {
        PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

        this._bricks = new PocketCode.Bricks.BrickContainer([]);
    }

    //properties
    Object.defineProperties(SingleContainerBrick.prototype, {
        bricks: {
            set: function (brickContainer) {
                if (brickContainer instanceof PocketCode.Bricks.BrickContainer)
                    this._bricks = brickContainer;
                else
                    throw new Error('invalid argument brickContainer: expected type PocketCode.Bricks.BrickContainer');
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
        _execute: function (threadId) {
            this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), threadId);
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
            PocketCode.Bricks.ThreadedBrick.prototype.stop.call(this);
            this._bricks.stop();
        },
    });

    return SingleContainerBrick;
})();

/**
 * @class RootContainerBrick
 */
PocketCode.Bricks.RootContainerBrick = (function () {
    RootContainerBrick.extends(PocketCode.Bricks.SingleContainerBrick, false);
    /**
     * Initializes onExecuted event
     * @param device
     * @param sprite
     * @constructor
     */
    function RootContainerBrick(device, sprite) {
        PocketCode.Bricks.SingleContainerBrick.call(this, device, sprite);

        this._executionState = PocketCode.ExecutionState.STOPPED;
        this._onExecuted = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(RootContainerBrick.prototype, {
        executionState: {
            get: function () {
                return this._executionState;
            },
            //enumerable: false,
            //configurable: true,
        },
    });

    //events
    Object.defineProperties(RootContainerBrick.prototype, {
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

    //methods
    RootContainerBrick.prototype.merge({
        /**
         * execute method is overridden
         */
        execute: function () {
            this._executionState = PocketCode.ExecutionState.RUNNING;
            PocketCode.Bricks.SingleContainerBrick.prototype.execute.call(this, new SmartJs.Event.EventListener(function () {
                this._executionState = PocketCode.ExecutionState.STOPPED;
                this._onExecuted.dispatchEvent();
            }, this), SmartJs.getNewId());
            //throw new Error('execute() cannot be called directly on root containers')
        },
        /**
         * calls "pause()" on bricks
         */
        pause: function () {
            PocketCode.Bricks.SingleContainerBrick.prototype.pause.call(this);
            this._executionState = PocketCode.ExecutionState.PAUSED;
        },
        /**
         * calls "resume()" on bricks
         */
        resume: function () {
            this._executionState = PocketCode.ExecutionState.RUNNING;
            PocketCode.Bricks.SingleContainerBrick.prototype.resume.call(this);
        },
        /**
         * calls "stop()" on bricks and threadedBrick
         */
        stop: function () {
            PocketCode.Bricks.SingleContainerBrick.prototype.stop.call(this);
            this._executionState = PocketCode.ExecutionState.STOPPED;
        },
    });

    return RootContainerBrick;
})();

/**
 * @class LoopBrick
 */
PocketCode.Bricks.LoopBrick = (function () {
    LoopBrick.extends(PocketCode.Bricks.SingleContainerBrick, false);
    /**
     *
     * @param device
     * @param sprite
     * @constructor
     */
    function LoopBrick(device, sprite, minLoopCycleTime) {
        PocketCode.Bricks.SingleContainerBrick.call(this, device, sprite);

        this._minLoopCycleTime = minLoopCycleTime || 20;
        //this._bricks typeof PocketCode.Bricks.BrickContainer
    }

    LoopBrick.prototype.merge({
        /**
         * executes brick if loop condition is met
         * @param {SmartJs.Event.EventListener} onExecutedListener
         * @param {String} callId
         */
        execute: function (onExecutedListener, callId) {
            var id = SmartJs.getNewId();
            this._pendingOps[id] = { callId: callId, listener: onExecutedListener, startTime: new Date() };

            if (this._bricks && this._loopConditionMet(id))
                this._execute(id);
            else
                this._return(id);
        },
        /**
         *
         * @param e
         * @private
         */
        _endOfLoopHandler: function (e) {
            var id = e.id;
            //var loopDelay
            var op = this._pendingOps[id];
            if (!op)  //stopped
                return;

            if (this._bricks && this._loopConditionMet(id)) {
                var executionDelay = 0;
                if (e.loopDelay) {
                    executionDelay = this._minLoopCycleTime - (new Date() - op.startTime);  //20ms min loop cycle time
                    //console.log("loop delay: ");
                }
                op.startTime = new Date();  //re-init for each loop
                var _self = this;
                if (executionDelay > 0) {
                    window.setTimeout(this._execute.bind(this, id), executionDelay);
                    //console.log("delay: " + executionDelay);
                }
                else {
                    window.setTimeout(this._execute.bind(this, id), 3);
                    //console.log("delay: 3");
                }
            }
            else
                this._return(id);

        },
        /**
         * the loop condition is overridden in every single loop brick
         * @returns {boolean}
         * @private
         */
        _loopConditionMet: function () {
            return false;
        },
        /**
         *
         * @param id
         * @private
         */
        _return: function (id) {
            var op = this._pendingOps[id];
            if (!op)  //stopped
                return;

            var listener = op.listener;
            var callId = op.callId;

            //var executionDelay = 0;
            //if (loopDelay)
            //    executionDelay = 20 - (new Date() - op.startTime);  //20ms min loop cycle time
            delete this._pendingOps[id];

            //if (executionDelay > 0) {
            //    window.setTimeout(function () {
            //        listener.handler.call(listener.scope, { id: callId, loopDelay: false });    //loop delay is always false (handled internally)
            //    }, executionDelay);
            //}
            //else {  //spend 3ms on a roundtrip to avoid long running script messages + enable UI update
            //window.setTimeout(function () {
            //    listener.handler.call(listener.scope, { id: callId, loopDelay: false });    //loop delay is always false (handled internally)
            //}, 3);
            listener.handler.call(listener.scope, { id: callId, loopDelay: false });
            //}
        },
    });

    return LoopBrick;
})();

/**
 * @class UnsupportedBrick: for bricks which are currently not supported
 */
PocketCode.Bricks.UnsupportedBrick = (function () {
    UnsupportedBrick.extends(PocketCode.Bricks.BaseBrick, false);

    function UnsupportedBrick(device, sprite, propObject) {
        PocketCode.Bricks.BaseBrick.call(this, device, sprite);

        this._xml = propObject.xml;
        this._brickType = propObject.brickType;
        this._json = propObject;
    }

    UnsupportedBrick.prototype._execute = function () {
        //console.log('call to unsupported brick: sprite= ' + this._sprite.name + ', xml= ' + this._xml + ', type= ' + this._brickType);
        this._return();
    };

    return UnsupportedBrick;
})();


