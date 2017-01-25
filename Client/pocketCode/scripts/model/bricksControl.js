/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/publishSubscribe.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Model.merge({

    WaitBrick: (function () {
        WaitBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function WaitBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
        }

        WaitBrick.prototype.merge({
            _timerExpiredHandler: function (e) {
                this._return(e.callId);
            },
            _execute: function (id, scope) {
                var duration = this._duration.calculate(scope);
                if (isNaN(duration)) {
                    this._return(id);
                    return;
                }
                var po = this._pendingOps[id];
                po.timer = new SmartJs.Components.Timer(Math.round(duration * 1000.0), new SmartJs.Event.EventListener(this._timerExpiredHandler, this), true, { callId: id });
                if (this._paused)
                    po.timer.pause();
            },
            pause: function () {
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    po = pos[p];
                    if (po.timer)
                        po.timer.pause();
                }
                PocketCode.Model.ThreadedBrick.prototype.pause.call(this);
            },
            resume: function () {
                var po, pos = this._pendingOps;
                for (var id in pos) {
                    po = pos[id];
                    if (po.timer)
                        po.timer.resume();
                }
                PocketCode.Model.ThreadedBrick.prototype.resume.call(this);
            },
            stop: function () {
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    po = pos[p];
                    if (po.timer)
                        po.timer.stop();
                }
                PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
            },
        });

        return WaitBrick;
    })(),

    //currently not supported by android
    //ResetTimerBrick: (function () {
    //    ResetTimerBrick.extends(PocketCode.Model.BaseBrick, false);

    //    function ResetTimerBrick(device, sprite, projectTimer, propObject) {
    //        PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
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

        NoteBrick.prototype._execute = function (scope) {
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
            _loopConditionMet: function (po) {
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
            this._showElse = propObject.showElse;
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
            _execute: function (id, scope) {
                if (this._condition.calculate(scope))
                    this._ifBricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id, scope);
                else //if (this._showElse)
                    this._elseBricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id, scope);
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

                var po,
                    pending = false;    //indicating if there are unhadled threads waiting
                for (var id in this._pendingOps) {
                    po = this._pendingOps[id];

                    if (this._condition.calculate(po.scope))
                        this._return(id, false);
                    else
                        pending = true;
                }

                if (pending) //polling will only be restarted if there are unhaldled ops waiting
                    this._timeoutHandler = window.setTimeout(this._execute.bind(this), this._delay);
            },
            pause: function () {
                if (this._timeoutHandler)
                    window.clearTimeout(this._timeoutHandler);
            },
            resume: function () {
                this._execute();
            },
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
            _loopConditionMet: function (po) {
                if (!po)
                    return false;

                if (po.loopCounter === undefined) { //init counter
                    var count = this._timesToRepeat.calculate(po.scope);
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
            _loopConditionMet: function (po) {
                if (this._condition.calculate(po.scope))    //break on condition = true
                    return false;
                return true;
            },
        });

        return RepeatUntilBrick;
    })(),

    //continue or start scene
    SceneTransitionBrick: (function () {
        SceneTransitionBrick.extends(PocketCode.Model.BaseBrick, false);

        function SceneTransitionBrick(device, sprite, gameEngine, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._gameEngine = gameEngine;
            this._sceneId = propObject.sceneId;
        }

        SceneTransitionBrick.prototype._execute = function () {
            this._return(this._gameEngine.resumeOrStartScene(this._sceneId));
        };

        return SceneTransitionBrick;
    })(),

    StartSceneBrick: (function () {
        StartSceneBrick.extends(PocketCode.Model.BaseBrick, false);

        function StartSceneBrick(device, sprite, gameEngine, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            
            this._gameEngine = gameEngine;
            this._sceneId = propObject.sceneId;
        }

        StartSceneBrick.prototype._execute = function () {
            this._return(this._gameEngine.startScene(this._sceneId));
        };

        return StartSceneBrick;
    })(),

    WhenStartAsCloneBrick: (function () {
        WhenStartAsCloneBrick.extends(PocketCode.Model.WhenProgramStartBrick, false);

        function WhenStartAsCloneBrick(device, sprite, propObject) {

            if (!sprite.isClone)
                return;
            PocketCode.Model.WhenProgramStartBrick.call(this, device, sprite, propObject, sprite.onCloneStart);
        }

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

        function DeleteCloneBrick(device, sprite, scene, propObject) {
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
            switch (this._type) {
                case PocketCode.Model.StopScriptType.THIS:
                    this._sprite.stopScript(this._scriptId);
                    return; //no handler called
                    break;
                case PocketCode.Model.StopScriptType.ALL:
                    this._sprite.stopAllScripts();
                    return; //no handler called
                    break;
                case PocketCode.Model.StopScriptType.OTHER:
                    this._return(this._sprite.stopAllScripts(this._scriptId));
                    break;
            }
        };

        return StopScriptBrick;
    })(),

});
