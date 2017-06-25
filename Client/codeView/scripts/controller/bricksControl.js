'use strict';

PocketCode.merge({

    WaitBrick: (function () {
        WaitBrick.extends(PocketCode.BaseBrick, false);

        function WaitBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WaitBrick)){
                throw new Error("Invalid argument Model");
            }
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WaitBrick;
    })(),


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

        SceneTransitionBrick.prototype.merge({
            _execute: function () {
                this._return(this._gameEngine.resumeOrStartScene(this._sceneId));
            },
            dispose: function () {
                this._gameEngine = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return SceneTransitionBrick;
    })(),

    StartSceneBrick: (function () {
        StartSceneBrick.extends(PocketCode.Model.BaseBrick, false);

        function StartSceneBrick(device, sprite, gameEngine, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._gameEngine = gameEngine;
            this._sceneId = propObject.sceneId;
        }

        StartSceneBrick.prototype.merge({
            _execute: function () {
                this._return(this._gameEngine.startScene(this._sceneId));
            },
            dispose: function () {
                this._gameEngine = undefined;
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

        function DeleteCloneBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
        }

        DeleteCloneBrick.prototype.merge({
            _execute: function () {
                if (!(this._sprite instanceof PocketCode.Model.SpriteClone)) {
                    this._return(false);
                    return;
                }
                this._return(this._scene.deleteClone(this._sprite.id));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return DeleteCloneBrick;
    })(),

    StopScriptType: {
        THIS: 1,
        ALL: 2,
        OTHER: 3
    },

    StopScriptBrick: (function () {
        StopScriptBrick.extends(PocketCode.Model.BaseBrick, false);

        function StopScriptBrick(device, sprite, scene, scriptId, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._scriptId = scriptId;

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
        }

        StopScriptBrick.prototype.merge({
            _execute: function () {
                switch (this._type) {
                    case PocketCode.Model.StopScriptType.THIS:
                        this._sprite.stopScript(true, this._scriptId);
                        return; //no handler called: script was stopped
                        //break;
                    case PocketCode.Model.StopScriptType.ALL:
                        this._scene.stopAllScripts(true);
                        return; //no handler called: script was stopped
                        //break;
                    case PocketCode.Model.StopScriptType.OTHER:
                        this._return(this._sprite.stopAllScripts(true, this._scriptId));
                        break;
                }
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return StopScriptBrick;
    })(),

});
