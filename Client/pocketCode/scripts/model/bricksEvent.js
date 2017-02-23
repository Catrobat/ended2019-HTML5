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
            if (this._onStart)  //may be undefined on startAsClone
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

            this._msgId = propObject.receiveMsgId;
            this._callback = this._subscribeCallback.bind(this);
            this._broadcastMgr = broadcastMgr;
            broadcastMgr.subscribe(this._msgId, this._callback);
        }

        WhenBroadcastReceiveBrick.prototype.dispose = function () {
            this._broadcastMgr.unsubscribe(this._msgId, this._callback);
            this._broadcastMgr = undefined;
            PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
        };

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
                PocketCode.Model.ScriptBlock.prototype.resume.call(this);
                this._execute();
            },
            stop: function (calledFromStopBrick) {
                if (!calledFromStopBrick) {
                    window.clearTimeout(this._timeoutHandler);
                    this._previousMet = false;  //reinit
                }
                PocketCode.Model.ScriptBlock.prototype.stop.call(this);
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

            this._physicsWorld = physicsWorld;
            this._spriteId2 = propObject.any ? 'any' : propObject.spriteId;
            physicsWorld.subscribeCollision(sprite.id, this._spriteId2, new SmartJs.Event.AsyncEventListener(this.executeEvent, this));
        }

        WhenCollisionBrick.prototype.dispose = function () {
            this._physicsWorld.unsubscribeCollision(this._sprite.id, this._spriteId2, new SmartJs.Event.AsyncEventListener(this.executeEvent, this));
            this._physicsWorld = undefined;
            PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
        };

        return WhenCollisionBrick;
    })(),

    WhenBackgroundChangesToBrick: (function () {
        WhenBackgroundChangesToBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenBackgroundChangesToBrick(device, sprite, scene, propObject) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            this._scene = scene;
            this._lookId = propObject.lookId
            this._callback = this._subscribeCallback.bind(this);
            if (sprite instanceof PocketCode.Model.BackgroundSprite)    //because scene background will not be defined during loading it
                sprite.subscribeOnLookChange(this._lookId, this._callback);
            else
                scene.subscribeToBackgroundChange(this._lookId, this._callback);
        }

        //methods
        WhenBackgroundChangesToBrick.prototype.dispose = function () {
            this._scene.unsubscribeFromBackgroundChange(this._lookId, this._callback);
            this._scene = undefined;
            PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
        };

        return WhenBackgroundChangesToBrick;
    })(),
});

PocketCode.Model.merge({

    WhenStartAsCloneBrick: (function () {
        WhenStartAsCloneBrick.extends(PocketCode.Model.WhenProgramStartBrick, false);

        function WhenStartAsCloneBrick(device, sprite, propObject) {

            if (!(sprite instanceof PocketCode.Model.SpriteClone))
                PocketCode.Model.WhenProgramStartBrick.call(this, device, sprite, propObject);  //without ecent
            else
                PocketCode.Model.WhenProgramStartBrick.call(this, device, sprite, propObject, sprite.onCloneStart);
        }

        return WhenStartAsCloneBrick;
    })(),
});
