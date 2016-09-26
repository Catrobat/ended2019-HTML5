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
        WhenProgramStartBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenProgramStartBrick(device, sprite, propObject, startEvent) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

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

    WhenBroadcastReceiveBrick: (function () {
        WhenBroadcastReceiveBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenBroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

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
                this._broadcastMgr.publish(this._broadcastMsgId, new SmartJs.Event.EventListener(this._returnHandler, this), id);
            },
        });

        return BroadcastAndWaitBrick;
    })(),


    WhenCollisionBrick: (function () {
        WhenCollisionBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenCollisionBrick(device, sprite, physicsWorld, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            var spriteId2 = propObject.any ? 'any' : propObject.spriteId;
            physicsWorld.subscribeCollision(sprite.id, spriteId2, new SmartJs.Event.EventListener(this._onCollisionHandler, this));
        }

        WhenCollisionBrick.prototype.merge({
            _onCollisionHandler: function (e) {
                this.execute();
            }
        });

        return WhenCollisionBrick;
    })(),

});