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
 */

PocketCode.Model.merge({


    WaitBrick: (function () {
        WaitBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function WaitBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._paused = false;
        }

        WaitBrick.prototype.merge({
            _timerExpiredHandler: function (e) {
                this._return(e.callId);
            },
            _execute: function (callId) {
                var duration = this._duration.calculate();
                if (isNaN(duration)) {
                    this._return(callId);
                    return;
                }
                var po = this._pendingOps[callId];
                po.paused = this._paused;
                po.timer = new SmartJs.Components.Timer(Math.round(duration * 1000.0), new SmartJs.Event.EventListener(this._timerExpiredHandler, this), true, { callId: callId });
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
                    if (po.timer)
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
                    if (po.timer)
                        po.timer.resume();
                }
            },
            stop: function () {
                this._paused = false;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.timer)
                        po.timer.stop();
                }
                this._pendingOps = {};
            },
        });

        return WaitBrick;
    })(),

    //currently not supported by android
    //ResetTimerBrick: (function () {
    //    ResetTimerBrick.extends(PocketCode.Model.BaseBrick, false);

    //    function ResetTimerBrick(device, sprite, projectTimer) {
    //        PocketCode.Model.BaseBrick.call(this, device, sprite);
    //        this._projectTimer = projectTimer;
    //    }

    //    ResetTimerBrick.prototype.merge({
    //        _execute: function () {
    //            this._projectTimer.start();
    //            this._return(true);
    //        },
    //        /* override */
    //        dispose: function () {
    //            this._gameEngine = undefined;
    //            //call super
    //            PocketCode.Model.BaseBrick.prototype.dispose.call(this);
    //        },
    //    });

    //    return ResetTimerBrick;
    //})(),

    NoteBrick: (function () {
        NoteBrick.extends(PocketCode.Model.BaseBrick, false);

        function NoteBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._text = propObject.text;
        }

        NoteBrick.prototype._execute = function () {
            this._return();
        };

        return NoteBrick;
    })(),

    ForeverBrick: (function () {
        ForeverBrick.extends(PocketCode.Model.LoopBrick, false);

        function ForeverBrick(device, sprite, minLoopCycleTime, propObject) {
            PocketCode.Model.LoopBrick.call(this, device, sprite, minLoopCycleTime, propObject);
        }

        ForeverBrick.prototype.merge({
            /* override */
            _loopConditionMet: function () {
                return true;    //always true for endless loop
            },
        });

        return ForeverBrick;
    })(),

    IfThenElseBrick: (function () {
        IfThenElseBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function IfThenElseBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

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
            },
            elseBricks: {
                set: function (brickContainer) {
                    if (brickContainer instanceof PocketCode.Model.BrickContainer)
                        this._elseBricks = brickContainer;
                    else
                        throw new Error('invalid argument brickConatiner: expected type PocketCode.Model.BrickContainer');
                },
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

    //please notice: we evaluate the condition using a timeout equal to minLoopDelay
    //the implementation is equal to the Android implementation- anyway, it's not correct
    //we should? extend our formula to support onChange events- this may cause performance issues, e.g. onChangeHandler on each sensor, sprite property, variable, ..
    WaitUntilBrick: (function () {
        WaitUntilBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function WaitUntilBrick(device, sprite, delay, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._delay = delay; //= minLoopCycleTime;
            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
            this._timeoutHandler = false;
        }

        WaitUntilBrick.prototype.merge({
            _execute: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);

                if (this._condition.calculate()) {
                    //call _return for all threads
                    var ids = [];
                    for (var id in this._pendingOps)
                        ids.push(id);   //store ids: preventing object modification (delete prop) during iteration

                    for (var i = 0, l = ids.length; i < l; i++)
                        this._return(ids[i], false);
                }
                else
                    this._timeoutHandler = window.setTimeout(this._execute.bind(this), this._delay);
            },
            pause: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);
            },
            resume: function () {
                this._execute();
            },
            //stop: thread ids (_pendingOps) will be {}.. no override
        });

        return WaitUntilBrick;
    })(),

    RepeatBrick: (function () {
        RepeatBrick.extends(PocketCode.Model.LoopBrick, false);

        function RepeatBrick(device, sprite, minLoopCycleTime, propObject) {
            PocketCode.Model.LoopBrick.call(this, device, sprite, minLoopCycleTime, propObject);

            this._timesToRepeat = new PocketCode.Formula(device, sprite, propObject.timesToRepeat);
        }

        RepeatBrick.prototype.merge({
            /* override */
            _loopConditionMet: function (threadId) {
                var po = this._pendingOps[threadId];
                if (!po)
                    return false;

                if (po.loopCounter === undefined) { //init counter
                    var count = this._timesToRepeat.calculate();
                    if (!isNaN(count))
                        po.loopCounter = Math.round(count);
                    else
                        po.loopCounter = 0;
                }
                else
                    po.loopCounter--;

                if (po.loopCounter > 0)
                    return true;
                return false;
            },
        });

        return RepeatBrick;
    })(),

    RepeatUntilBrick: (function () {
        RepeatUntilBrick.extends(PocketCode.Model.LoopBrick, false);

        function RepeatUntilBrick(device, sprite, minLoopCycleTime, propObject) {
            PocketCode.Model.LoopBrick.call(this, device, sprite, minLoopCycleTime, propObject);

            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
        }

        RepeatUntilBrick.prototype.merge({
            /* override */
            _loopConditionMet: function () {
                if (this._condition.calculate())    //break on condition = true
                    return false;
                return true;
            },
        });

        return RepeatUntilBrick;
    })(),

    //continue scene
    SceneTransitionBrick: (function () {
        SceneTransitionBrick.extends(PocketCode.Model.BaseBrick, false);

        function SceneTransitionBrick(device, sprite, gameEngine, scene, propObject ) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            //this._scene = scene;
            this._transitionScene = gameEngine.getSceneById(propObject.sceneId);
            //this._currentScene = gameEngine.getSceneById(this._scene.id);
            this._currentScene = scene;
        }

        SceneTransitionBrick.prototype._execute = function () {
            var result = this._currentScene.pause();
            this._return(this._transitionScene.resumeOrStart());
        };

        return SceneTransitionBrick;
    })(),

    StartSceneBrick: (function () {
        StartSceneBrick.extends(PocketCode.Model.BaseBrick, false);

        function StartSceneBrick(device, sprite, gameEngine, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            this._scene = scene;
            this._currentScene = scene;
            this._sceneToStart = gameEngine.getSceneById(propObject.sceneId);
            //this._currentScene = gameEngine.getSceneById(this._scene.id);

        }

        StartSceneBrick.prototype._execute = function () {

            this._currentScene.pause();
            this._return(this._sceneToStart.start());
        };

        return StartSceneBrick;
    })(),

    WhenStartAsCloneBrick: (function () {
        WhenStartAsCloneBrick.extends(PocketCode.Model.ScriptBlock, false);

        function WhenStartAsCloneBrick(device, sprite, propObject, startEvent) {
            PocketCode.Model.ScriptBlock.call(this, device, sprite, propObject);

            if (!sprite.isClone)
                return;
            this._onCloneStart = sprite.onCloneStart;
            startEvent.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
        }

        WhenStartAsCloneBrick.prototype.merge({
            dispose: function () {
                this._onCloneStart.removeEventListener(new SmartJs.Event.EventListener(this.execute, this));
                this._onCloneStart = undefined;  //make sure to disconnect from gameEngine
                PocketCode.Model.ScriptBlock.prototype.dispose.call(this);
            },
        });

        return WhenStartAsCloneBrick;
    })(),

    CloneBrick: (function () {
        CloneBrick.extends(PocketCode.Model.BaseBrick, false);

        function CloneBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._cloneId = propObject.spriteId;
        }

        CloneBrick.prototype._execute = function () {
            this._return(this._scene.cloneSprite(this._cloneId));
        };

        return CloneBrick;
    })(),

    DeleteCloneBrick: (function () {
        DeleteCloneBrick.extends(PocketCode.Model.BaseBrick, false);

        function DeleteCloneBrick(device, sprite, scene,  propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;

        }

        DeleteCloneBrick.prototype._execute = function () {
            if (!this._sprite.isClone)
                this._return(false);
            this._return(this._scene.deleteClone(this._sprite.id));
        };

        return DeleteCloneBrick;
    })(),

    StopScriptType: {
        THIS: 1,
        ALL: 2,
        OTHER: 3
    },

    StopScriptBrick: (function () {
        StopScriptBrick.extends(PocketCode.Model.BaseBrick, false);

        function StopScriptBrick(device, sprite, scriptId, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, scriptId, propObject);

            switch (propObject.scriptType) {
                case 'this':
                    this._type = PocketCode.Model.StopScriptType.THIS;
                    break;
                case 'all':
                    this._type = PocketCode.Model.StopScriptType.ALL;
                    break;
                case 'other':
                    this._type = PocketCode.Model.StopScriptType.OTHER;
                    break;
            }
            this._scriptId = scriptId;
        }

        StopScriptBrick.prototype._execute = function () {
            switch(this._type) {
                case PocketCode.Model.StopScriptType.THIS:
                    this._return(this._sprite.stopScript(this._scriptId));
                    break;
                case PocketCode.Model.StopScriptType.ALL:
                    this._return(this._sprite.stopAllScripts());
                    break;
                case PocketCode.Model.StopScriptType.OTHER:
                    this._return(this._sprite.stopAllScripts(this._scriptId));
                    break;
            }
        };

        return StopScriptBrick;
    })(),

});
