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

        //formula accessors
        Object.defineProperties(WaitBrick.prototype, {
            durationFormula: {
                get: function () {
                    return this._duration;
                },
            },
        });

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
            this._hasElse = propObject.hasElse;
            this._ifBricks = new PocketCode.Model.BrickContainer([]);
            this._elseBricks = new PocketCode.Model.BrickContainer([]);
        }

        //formula accessors
        Object.defineProperties(IfThenElseBrick.prototype, {
            conditionFormula: {
                get: function () {
                    return this._condition;
                },
            },
        });

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
                this._return(e.id, e.loopDelay, e.stopped);
            },
            _execute: function (id, scope) {
                if (this._condition.calculate(scope))
                    this._ifBricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id, scope);
                else if (this._hasElse)
                    this._elseBricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id, scope);
                else
                    this._return(id);
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

    WaitUntilBrick: (function () {
        WaitUntilBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function WaitUntilBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
            this._attached = false;
        }

        //formula accessors
        Object.defineProperties(WaitUntilBrick.prototype, {
            conditionFormula: {
                get: function () {
                    return this._condition;
                },
            },
        });

        WaitUntilBrick.prototype.merge({
            _execute: function () {
                var po,
                    pending = false;    //indicating if there are unhadled threads waiting
                for (var id in this._pendingOps) {
                    po = this._pendingOps[id];

                    if (this._condition.calculate(po.scope))
                        this._return(id, false);
                    else
                        pending = true;
                }

                if (pending) {
                    if (!this._attached) { //start evaluating poriodically
                        this._attached = true;
                        SmartJs.AnimationFrame.addEventListener(new SmartJs.Event.EventListener(this._execute, this));
                    }
                }
                else { //stop evaluating poriodically if no operations were found
                    this._attached = false;
                    SmartJs.AnimationFrame.removeEventListener(new SmartJs.Event.EventListener(this._execute, this));
                }

            },
            pause: function () {
                this._attached = false;
                SmartJs.AnimationFrame.removeEventListener(new SmartJs.Event.EventListener(this._execute, this));
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

        //formula accessors
        Object.defineProperties(RepeatBrick.prototype, {
            timesToRepeatFormula: {
                get: function () {
                    return this._timesToRepeat;
                },
            },
        });

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

        //formula accessors
        Object.defineProperties(RepeatUntilBrick.prototype, {
            conditionFormula: {
                get: function () {
                    return this._condition;
                },
            },
        });

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

        function SceneTransitionBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._sceneId = propObject.sceneId;
        }

        SceneTransitionBrick.prototype.merge({
            _execute: function () {
                this._return(this._scene.resumeOrStartOtherScene(this._sceneId));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return SceneTransitionBrick;
    })(),

    StartSceneBrick: (function () {
        StartSceneBrick.extends(PocketCode.Model.BaseBrick, false);

        function StartSceneBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._sceneId = propObject.sceneId;
        }

        StartSceneBrick.prototype.merge({
            _execute: function () {
                this._return(this._scene.startOtherScene(this._sceneId));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return StartSceneBrick;
    })(),

    CloneBrick: (function () {
        CloneBrick.extends(PocketCode.Model.BaseBrick, false);

        function CloneBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._ofMyself = propObject.ofMyself;
            this._cloneId = propObject.spriteId;
        }

        CloneBrick.prototype.merge({
            _execute: function () {
                //todo: bubbles
                var id = this._ofMyself ? this._sprite.id : this._cloneId;
                this._return(this._scene.cloneSprite(id));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return CloneBrick;
    })(),

    DeleteCloneBrick: (function () {
        DeleteCloneBrick.extends(PocketCode.Model.BaseBrick, false);

        function DeleteCloneBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        DeleteCloneBrick.prototype.merge({
            _execute: function () {
                if (!(this._sprite instanceof PocketCode.Model.SpriteClone))
                    this._return();
                else
                    this._return(this._sprite.deleteClone());
            },
        });

        return DeleteCloneBrick;
    })(),

    StopBrick: (function () {
        StopBrick.extends(PocketCode.Model.BaseBrick, false);

        function StopBrick(device, sprite, scene, scriptId, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._scriptId = scriptId;
            this.type = propObject.stopType;
        }

        Object.defineProperties(StopBrick.prototype, {
            type: {
                get: function () {
                    return this._type;
                },
                set: function (type) {
                    if (this._type == type)
                        return;

                    //validate type
                    var found = false;
                    for (var t in PocketCode.StopType) {
                        if (PocketCode.StopType[t] == type) {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        throw new Error('unrecognized type: check if type is part of PocketCode.StopType');

                    this._type = type;
                },
            },
        });

        StopBrick.prototype.merge({
            _execute: function () {
                switch (this._type) {
                    case PocketCode.StopType.THIS_SCRIPT:
                        //this._sprite.stopScript(true, this._scriptId);
                        this._return(false, true); //handler notification: script stopped
                        break;
                    case PocketCode.StopType.OTHER_SCRIPTS:
                        this._return(this._sprite.stopAllScripts(true, this._scriptId));
                        break;
                    case PocketCode.StopType.ALL_SOUNDS:
                        this._scene.stopAllSounds();
                        this._return();
                        break;
                    case PocketCode.StopType.ALL:
                        this._scene.stopAllScriptsAndSounds(true);
                        break; //no handler called: script was stopped
                }
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return StopBrick;
    })(),

});
