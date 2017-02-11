/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/publishSubscribe.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Model.merge({

    WhenProgramStartBrick: (function () {
        WhenProgramStartBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenProgramStartBrick(device, sprite, propObject, startEvent) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            this._onStart = startEvent;
            startEvent.addEventListener(new SmartJs.Event.AsyncEventListener(this.executeEvent, this));
        }

        WhenProgramStartBrick.prototype.merge({
            dispose: function () {
                if (this._onStart) {
                    this._onStart.removeEventListener(new SmartJs.Event.AsyncEventListener(this.executeEvent, this));
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
            actionEvent.addEventListener(new SmartJs.Event.AsyncEventListener(this._onActionHandler, this));
        }

        WhenActionBrick.prototype.merge({
            _onActionHandler: function (e) {
                if (!e.sprite || e.sprite === this._sprite)
                    this.executeEvent(e);
            },
            dispose: function () {
                this._onAction.removeEventListener(new SmartJs.Event.AsyncEventListener(this._onActionHandler, this));
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

        return WhenBroadcastReceiveBrick;
    })(),

    BroadcastBrick: (function () {
        BroadcastBrick.extends(PocketCode.Model.BaseBrick, false);

        function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._broadcastMgr = broadcastMgr;
            this._broadcastMsgId = propObject.broadcastMsgId;
        }

        BroadcastBrick.prototype.merge({
            _execute: function () {
                this._broadcastMgr.publish(this._broadcastMsgId);
                this._return();
            },
            dispose: function () {
                this._broadcastMgr = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
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
            _execute: function (id) {
                this._broadcastMgr.publish(this._broadcastMsgId, this._return.bind(this, id));
            },
            dispose: function () {
                this._broadcastMgr = undefined;
                PocketCode.Model.ThreadedBrick.prototype.dispose.call(this);
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

            if (this._sprite instanceof PocketCode.Model.SpriteClone) {
                this._onStart = this._sprite.onCloneStart;
                this._onStart.addEventListener(new SmartJs.Event.EventListener(this._onCloneStartHandler, this));
            }
            else {
                this._onStart = startEvent;
                this._onStart.addEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
            }
        }

        WhenConditionMetBrick.prototype.merge({
            _onCloneStartHandler: function () {  //to make sure all whenStartAsClone scripts where executed before evaluating the condition
                window.setTimeout(this.executeEvent.bind(this), this._cycleTime);
            },
            //a When.. brick cannot be part of a user script, so we do not have to take care of the execution scope (always sprite)
            _execute: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);

                var met = false;
                try {
                    if (this._sprite instanceof PocketCode.Model.SpriteClone)
                        var bp = true;
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
                if (this._sprite instanceof PocketCode.Model.SpriteClone)
                    this._onStart.removeEventListener(new SmartJs.Event.EventListener(this._onCloneStartHandler, this));
                else
                    this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
                this._onStart = undefined;
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenConditionMetBrick;
    })(),

    WhenCollisionBrick: (function () {
        WhenCollisionBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenCollisionBrick(device, sprite, physicsWorld, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            var spriteId2 = propObject.any ? 'any' : propObject.spriteId;
            physicsWorld.subscribeCollision(sprite.id, spriteId2, new SmartJs.Event.AsyncEventListener(this.executeEvent, this));
        }

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
        }

        return WhenBackgroundChangesToBrick;
    })(),
});

PocketCode.Model.merge({

    WhenStartAsCloneBrick: (function () {
        WhenStartAsCloneBrick.extends(PocketCode.Model.WhenProgramStartBrick, false);

        function WhenStartAsCloneBrick(device, sprite, propObject) {

            if (!(sprite instanceof PocketCode.Model.SpriteClone))
                return;
            PocketCode.Model.WhenProgramStartBrick.call(this, device, sprite, propObject, sprite.onCloneStart);
        }

        return WhenStartAsCloneBrick;
    })(),

});
