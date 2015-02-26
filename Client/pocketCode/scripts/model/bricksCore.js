/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Bricks = {

    BrickContainer: (function () {

        function BrickContainer(bricks) {
            this._bricks = bricks || [];
            this._pendingOps = {};
        }

        BrickContainer.prototype.merge({
            execute: function (onExecutedListener, threadId) {
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('BrickContainer: missing or invalid arguments on execute()');

                var id = SmartJs._getId();
                this._pendingOps[id] = { threadId: threadId, listener: onExecutedListener, loopDelay: false, childIdx: 0 };
                this._executeContainerItem({ id: id, loopDelay: false });
            },

            _executeContainerItem: function (args) {
                var op = this._pendingOps[args.id];
                if (!op)  //stopped
                    return;

                //if (args.loopDelay)
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

            pause: function () {
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].pause)
                        bricks[i].pause();
                }
            },
            resume: function () {
                var bricks = this._bricks;
                for (var i = 0, l = bricks.length; i < l; i++) {
                    if (bricks[i].resume)
                        bricks[i].resume();
                }
            },
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


    BaseBrick: (function () {
        BaseBrick.extends(SmartJs.Core.Component);

        function BaseBrick(device, sprite) {
            this._device = device;
            this._sprite = sprite;
        }

        BaseBrick.prototype.merge({
            execute: function (onExecutedListener, threadId) {
                if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                    throw new Error('BaseBrick: missing or invalid arguments on execute()');

                this._onExecutedListener = onExecutedListener;
                this._threadId = threadId;
                this._execute();
            },
            _return: function (loopDelay) {
                this._onExecutedListener.handler.call(this._onExecutedListener.scope, { id: this._threadId, loopDelay: loopDelay });
            },
        });

        return BaseBrick;
    })(),

};


PocketCode.Bricks.ThreadedBrick = (function () {
    ThreadedBrick.extends(PocketCode.Bricks.BaseBrick, false);

    function ThreadedBrick(device, sprite) {
        PocketCode.Bricks.BaseBrick.call(this, device, sprite);
        this._pendingOps = {};
    }

    ThreadedBrick.prototype.merge({
        execute: function (onExecutedListener, threadId) {    //parameters can be null, e.g. ProgramStartBrick, WhenActionBrick, BroadcastReceiveBrick if not triggerend by BroadcastWaitBrick
            if (!onExecutedListener || !threadId || !(onExecutedListener instanceof SmartJs.Event.EventListener) || typeof threadId !== 'string')
                throw new Error('ThreadedBrick: missing or invalid arguments on execute()');

            var id = SmartJs._getId();
            this._pendingOps[id] = { threadId: threadId, listener: onExecutedListener };
            this._execute(id);
        },
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
        stop: function () {
            this._pendingOps = {};
        },
    });

    return ThreadedBrick;
})();


PocketCode.Bricks.SingleContainerBrick = (function () {
    SingleContainerBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

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
        _returnHandler: function (e) {
            //helper method to make event binding easier
            this._return(e.id, e.loopDelay)
        },
        _execute: function (threadId) {
            this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), threadId);
        },
        pause: function () {
            this._bricks.pause();
        },
        resume: function () {
            this._bricks.resume();
        },
        stop: function () {
            PocketCode.Bricks.ThreadedBrick.prototype.stop.call(this);
            this._bricks.stop();
        },
    });

    return SingleContainerBrick;
})();


PocketCode.Bricks.RootContainerBrick = (function () {
    RootContainerBrick.extends(PocketCode.Bricks.SingleContainerBrick, false);

    //ctr
    function RootContainerBrick(device, sprite) {
        PocketCode.Bricks.SingleContainerBrick.call(this, device, sprite);

        //this._bricks typeof PocketCode.Bricks.BrickContainer
        //this.running = false;

        //events
        this._onExecuted = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(RootContainerBrick.prototype, {
        onExecuted: {
            get: function () { return this._onExecuted; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    RootContainerBrick.prototype.merge({
        ///* override */
        execute: function () {
            PocketCode.Bricks.SingleContainerBrick.prototype.execute.call(this, new SmartJs.Event.EventListener(function () { this._onExecuted.dispatchEvent(); }, this), SmartJs._getId());
            //throw new Error('execute() cannot be called directly on root containers')
        },
        //    /* override */
        //    _return: function (id, loopDelay) {
        //        //call super
        //        PocketCode.Bricks.ThreadedBrick.prototype._return.call(this, id, loopDelay);

        //        this._onExecuted.dispatchEvent();
        //    },
    });

    return RootContainerBrick;
})();


PocketCode.Bricks.LoopBrick = (function () {
    LoopBrick.extends(PocketCode.Bricks.SingleContainerBrick, false);

    function LoopBrick(device, sprite) {
        PocketCode.Bricks.SingleContainerBrick.call(this, device, sprite);

        //this._bricks typeof PocketCode.Bricks.BrickContainer
    }

    LoopBrick.prototype.merge({
        execute: function (onExecutedListener, callId) {
            var id = SmartJs._getId();
            this._pendingOps[id] = { callId: callId, listener: onExecutedListener, startTime: new Date() };

            if (this._bricks && this._loopConditionMet(id))
                this._execute(id);
            else
                this._return(id);
        },
        _endOfLoopHandler: function (e) {
            var id = e.id;
            //var loopDelay
            var op = this._pendingOps[id];
            if (!op)  //stopped
                return;

            if (this._bricks && this._loopConditionMet(id)) {
                var executionDelay = 0;
                if (e.loopDelay) {
                    executionDelay = 20 - (new Date() - op.startTime);  //20ms min loop cycle time
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
        //_executeCallback: function () {
        //    this._execute(id);
        //},
        _loopConditionMet: function () {
            //the loop condition is overridden in every single loop brick
            return false;
        },
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


PocketCode.Bricks.UnsupportedBrick = (function () {
    UnsupportedBrick.extends(PocketCode.Bricks.BaseBrick, false);

    function UnsupportedBrick(device, sprite, propObject) {
        PocketCode.Bricks.BaseBrick.call(this, device, sprite);

        this._xml = propObject.xml;
        this._brickType = propObject.brickType;
    }

    UnsupportedBrick.prototype._execute = function () {
        //console.log('call to unsupported brick: sprite= ' + this._sprite.name + ', xml= ' + this._xml + ', type= ' + this._brickType);
        this._return();
    };

    return UnsupportedBrick;
})();


