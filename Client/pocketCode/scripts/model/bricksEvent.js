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
        WhenProgramStartBrick.extends(PocketCode.Model.EventBrick, false);

        function WhenProgramStartBrick(device, sprite, propObject, startEvent) {
            PocketCode.Model.EventBrick.call(this, device, sprite, propObject);

            this._onStart = startEvent;
            if (this._onStart)  //may be undefined on startAsClone
                startEvent.addEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
        }

        WhenProgramStartBrick.prototype.merge({
            dispose: function () {
                if (this._onStart) {
                    this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
                    this._onStart = undefined;  //make sure to disconnect from gameEngine
                }
                PocketCode.Model.EventBrick.prototype.dispose.call(this);
            },
        });

        return WhenProgramStartBrick;
    })(),

    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.Model.EventBrick, false);

        function WhenActionBrick(device, sprite, propObject, actionEvents) {
            PocketCode.Model.EventBrick.call(this, device, sprite, propObject);

            this._onActionEvents = actionEvents;
            this._action = undefined;
            this.action = propObject.action;   //handling several actions: "spriteTouched", "screenTouched" (currently not supported: "video motion", "timer", "loudness", ...) 
            //TODO: make sure to handle pause/resume/stop if needed (when extending functionality to support other actions as well, e.g. 'VideoMotion', 'Timer', 'Loudness')
        }

        Object.defineProperties(WhenActionBrick.prototype, {
            action: {
                get: function () {
                    return this._action;
                },
                set: function (action) {
                    if (this._action == action)
                        return;

                    //validate action
                    var found = false;
                    for (var type in PocketCode.UserActionType) {
                        if (PocketCode.UserActionType[type] == action) {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        throw new Error('unrecognized event: check if action is part of PocketCode.UserActionType');

                    var event = this._onActionEvents[action];
                    if (!(event instanceof SmartJs.Event.Event))
                        throw new Error('unrecognized event: check if all events were registered in our parser');
                    if (this._actionEvent)
                        this._actionEvent.removeEventListener(new SmartJs.Event.EventListener(this._onActionHandler, this));

                    this._action = action;
                    this._actionEvent = event;
                    event.addEventListener(new SmartJs.Event.EventListener(this._onActionHandler, this));
                },
            },
        });

        WhenActionBrick.prototype.merge({
            _onActionHandler: function (e) {
                if (!e.sprite || e.sprite === this._sprite)
                    this.executeEvent(e);
            },
            dispose: function () {
                if (this._actionEvent)
                    this._actionEvent.removeEventListener(new SmartJs.Event.EventListener(this._onActionHandler, this));

                this._action = this._actionEvent = undefined;
                PocketCode.Model.EventBrick.prototype.dispose.call(this);
            },
        });

        return WhenActionBrick;
    })(),

});

PocketCode.Model.merge({

    WhenBroadcastReceiveBrick: (function () {
        WhenBroadcastReceiveBrick.extends(PocketCode.Model.EventBrick, false);

        function WhenBroadcastReceiveBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.EventBrick.call(this, device, sprite, propObject);

            this._msgId = propObject.msgId;
            this._callback = this._subscribeCallback.bind(this);
            this._broadcastMgr = broadcastMgr;
            broadcastMgr.subscribe(this._msgId, this._callback);
        }

        WhenBroadcastReceiveBrick.prototype.dispose = function () {
            this._broadcastMgr.unsubscribe(this._msgId, this._callback);
            this._broadcastMgr = undefined;
            PocketCode.Model.EventBrick.prototype.dispose.call(this);
        };

        return WhenBroadcastReceiveBrick;
    })(),

    BroadcastBrick: (function () {
        BroadcastBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._broadcastMgr = broadcastMgr;
            this._msgId = propObject.msgId;
            this._andWait = propObject.andWait;
        }

        BroadcastBrick.prototype.merge({
            _execute: function (id) {
                if(this._andWait){
                    this._broadcastMgr.publish(this._msgId, this._return.bind(this, id));
                }
                else{
                    this._broadcastMgr.publish(this._msgId);
                    this._return(id);
                }
            },
            //test
            pause: function () {
                PocketCode.Model.ThreadedBrick.prototype.pause.call(this);
            },
            resume: function () {
                PocketCode.Model.ThreadedBrick.prototype.resume.call(this);
            },
            //test
            dispose: function () {
                this._broadcastMgr = undefined;
                PocketCode.Model.ThreadedBrick.prototype.dispose.call(this);
            },
        });

        return BroadcastBrick;
    })(),

    WhenConditionMetBrick: (function () {
        WhenConditionMetBrick.extends(PocketCode.Model.EventBrick, false);

        function WhenConditionMetBrick(device, sprite, propObject, startEvent) {
            PocketCode.Model.EventBrick.call(this, device, sprite, propObject);

            this._previousMet = false;
            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);

            this._attached = false;

            if (this._sprite instanceof PocketCode.Model.SpriteClone) {
                this._onStart = this._sprite.onCloneStart;
                this._onStart.addEventListener(new SmartJs.Event.EventListener(this._onCloneStartHandler, this));
            }
            else {
                this._onStart = startEvent;
                this._onStart.addEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
            }
        }

        //formula accessors
        Object.defineProperties(WhenConditionMetBrick.prototype, {
            conditionFormula: {
                get: function () {
                    return this._condition;
                },
            },
        });

        WhenConditionMetBrick.prototype.merge({
            _onCloneStartHandler: function () {  //to make sure all whenStartAsClone scripts where executed before evaluating the condition
                window.setTimeout(this.executeEvent.bind(this), 20);
            },
            //a When.. brick cannot be part of a user script, so we do not have to take care of the execution scope (always sprite)
            _execute: function () {
                if (!this._attached) {
                    this._attached = true;
                    SmartJs.AnimationFrame.addEventListener(new SmartJs.Event.EventListener(this._execute, this));
                }

                var met = false;
                try {
                    met = this._condition.calculate();
                }
                catch (e) { }

                if (!this._previousMet && met) {
                    this._previousMet = met;
                    PocketCode.Model.EventBrick.prototype._execute.call(this, SmartJs.getNewId());
                }
                else {
                    this._previousMet = met;
                }
            },
            pause: function () {
                this._attached = false;
                SmartJs.AnimationFrame.removeEventListener(new SmartJs.Event.EventListener(this._execute, this));
                PocketCode.Model.EventBrick.prototype.pause.call(this);
            },
            resume: function () {
                PocketCode.Model.EventBrick.prototype.resume.call(this);
                this._execute();
            },
            stop: function (stopEventType) {
                if (stopEventType != PocketCode.StopEventType.BRICK) {
                    this._attached = false;
                    SmartJs.AnimationFrame.removeEventListener(new SmartJs.Event.EventListener(this._execute, this));
                    this._previousMet = false;  //reinit
                }
                PocketCode.Model.EventBrick.prototype.stop.call(this);
            },
            dispose: function () {
                SmartJs.AnimationFrame.removeEventListener(new SmartJs.Event.EventListener(this._execute, this));

                if (this._sprite instanceof PocketCode.Model.SpriteClone)
                    this._onStart.removeEventListener(new SmartJs.Event.EventListener(this._onCloneStartHandler, this));
                else
                    this._onStart.removeEventListener(new SmartJs.Event.EventListener(this.executeEvent, this));
                this._onStart = undefined;
                PocketCode.Model.EventBrick.prototype.dispose.call(this);
            },
        });

        return WhenConditionMetBrick;
    })(),

    WhenCollisionBrick: (function () {
        WhenCollisionBrick.extends(PocketCode.Model.EventBrick, false);

        function WhenCollisionBrick(device, sprite, physicsWorld, propObject) {
            PocketCode.Model.EventBrick.call(this, device, sprite, propObject);

            this._physicsWorld = physicsWorld;
            this._spriteId2 = propObject.any ? 'any' : propObject.spriteId;
            physicsWorld.subscribeCollision(sprite.id, this._spriteId2, new SmartJs.Event.EventListener(this.executeEvent, this));
        }

        WhenCollisionBrick.prototype.dispose = function () {
            this._physicsWorld.unsubscribeCollision(this._sprite.id, this._spriteId2, new SmartJs.Event.EventListener(this.executeEvent, this));
            this._physicsWorld = undefined;
            PocketCode.Model.EventBrick.prototype.dispose.call(this);
        };

        return WhenCollisionBrick;
    })(),

    WhenBackgroundChangesToBrick: (function () {
        WhenBackgroundChangesToBrick.extends(PocketCode.Model.EventBrick, false);

        function WhenBackgroundChangesToBrick(device, sprite, scene, propObject) {
            PocketCode.Model.EventBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._lookId = propObject.lookId
            if (!this._lookId)  //can be null
                return;
            this._callback = this._subscriberCallback.bind(this);
            if (sprite instanceof PocketCode.Model.BackgroundSprite)    //because scene background will not be defined during loading it
                sprite.subscribeOnLookChange(this._lookId, this._callback);
            else
                scene.subscribeToBackgroundChange(this._lookId, this._callback);
        }

        //methods
        WhenBackgroundChangesToBrick.prototype.dispose = function () {
            if (this._lookId)  //can be null
                this._scene.unsubscribeFromBackgroundChange(this._lookId, this._callback);
            this._scene = undefined;
            PocketCode.Model.EventBrick.prototype.dispose.call(this);
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
