/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="sprite.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Model.merge({

    SetGraphicEffectBrick: (function () {
        SetGraphicEffectBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetGraphicEffectBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._effect = propObject.effect;    //typeof PocketCode.GraphicEffect 
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(SetGraphicEffectBrick.prototype, {
            valueFormula: {
                get: function () {
                    return this._value;
                },
            },
        });

        SetGraphicEffectBrick.prototype._execute = function (scope) {
            var val = this._value.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.setGraphicEffect(this._effect, val));
        };

        return SetGraphicEffectBrick;
    })(),

    ChangeGraphicEffectBrick: (function () {
        ChangeGraphicEffectBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeGraphicEffectBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._effect = propObject.effect;    //typeof PocketCode.GraphicEffect
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(ChangeGraphicEffectBrick.prototype, {
            changeFormula: {
                get: function () {
                    return this._value;
                },
            },
        });

        ChangeGraphicEffectBrick.prototype._execute = function (scope) {
            var val = this._value.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.changeGraphicEffect(this._effect, val));
        };

        return ChangeGraphicEffectBrick;
    })(),

});


PocketCode.Model.merge({

    SetLookBrick: (function () {
        SetLookBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetLookBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._lookId = propObject.lookId;
        }

        SetLookBrick.prototype._execute = function () {
            if (!this._lookId)  //can be null
                this._return();
            else
                this._return(this._sprite.setLook(this._lookId));
        };

        return SetLookBrick;
    })(),

    SetLookByIndexBrick: (function () {
        SetLookByIndexBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetLookByIndexBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._lookIdx = new PocketCode.Formula(device, sprite, propObject.idx);
        }

        //formula accessors
        Object.defineProperties(SetLookByIndexBrick.prototype, {
            indexFormula: {
                get: function () {
                    return this._lookIdx;
                },
            },
        });

        SetLookByIndexBrick.prototype._execute = function (scope) {
            var idx = this._lookIdx.calculate(scope);
            if (isNaN(idx))
                this._return();
            else
                this._return(this._sprite.setLookByIndex(idx));
        };

        return SetLookByIndexBrick;
    })(),

    NextLookBrick: (function () {
        NextLookBrick.extends(PocketCode.Model.BaseBrick, false);

        function NextLookBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        NextLookBrick.prototype._execute = function () {
            this._return(this._sprite.nextLook());
        };

        return NextLookBrick;
    })(),

    PreviousLookBrick: (function () {
        PreviousLookBrick.extends(PocketCode.Model.BaseBrick, false);

        function PreviousLookBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        PreviousLookBrick.prototype._execute = function () {
            this._return(this._sprite.previousLook());
        };

        return PreviousLookBrick;
    })(),

    SetSizeBrick: (function () {
        SetSizeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetSizeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        //formula accessors
        Object.defineProperties(SetSizeBrick.prototype, {
            valueFormula: {
                get: function () {
                    return this._percentage;
                },
            },
        });

        SetSizeBrick.prototype._execute = function (scope) {
            var val = this._percentage.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.setSize(val));
        };

        return SetSizeBrick;
    })(),

    ChangeSizeBrick: (function () {
        ChangeSizeBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeSizeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(ChangeSizeBrick.prototype, {
            changeFormula: {
                get: function () {
                    return this._value;
                },
            },
        });

        ChangeSizeBrick.prototype._execute = function (scope) {
            var val = this._value.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.changeSize(val));
        };

        return ChangeSizeBrick;
    })(),

    HideBrick: (function () {
        HideBrick.extends(PocketCode.Model.BaseBrick, false);

        function HideBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        HideBrick.prototype._execute = function () {
            this._return(this._sprite.hide());
        };

        return HideBrick;
    })(),

    ShowBrick: (function () {
        ShowBrick.extends(PocketCode.Model.BaseBrick, false);

        function ShowBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        ShowBrick.prototype._execute = function () {
            this._return(this._sprite.show());
        };

        return ShowBrick;
    })(),

    AskBrick: (function () {
        AskBrick.extends(PocketCode.Model.BaseBrick, false);

        function AskBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._question = new PocketCode.Formula(device, sprite, propObject.question);
            this._varId = propObject.resourceId;
        }

        //formula accessors
        Object.defineProperties(AskBrick.prototype, {
            questionFormula: {
                get: function () {
                    return this._question;
                },
            },
        });

        AskBrick.prototype.merge({
            _onAnswerHandler: function (scope, answer) {
                var variable = scope.getVariable(this._varId);
                if (variable)  //can be undefined
                    variable.value = answer;

                this._scene.resume(true);
                this._return(true);
            },
            _execute: function (scope) {
                scope = scope || this._sprite;
                var question = this._question.calculate(scope);

                this._scene.pause(true);
                this._scene.showAskDialog(question, this._onAnswerHandler.bind(this, scope));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return AskBrick;
    })(),

    SayBrick: (function () {
        SayBrick.extends(PocketCode.Model.BaseBrick, false);

        function SayBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._text = new PocketCode.Formula(device, sprite, propObject.text);
        }

        //formula accessors
        Object.defineProperties(SayBrick.prototype, {
            textFormula: {
                get: function () {
                    return this._text;
                },
            },
        });

        SayBrick.prototype._execute = function (scope) {
            var text = this._text.calculate(scope).toString().trim();

            if (text.trim() == '')
                this._return();
            else
                this._return(this._sprite.showBubble(PocketCode.Ui.BubbleType.SPEECH, text));
        };

        return SayBrick;
    })(),

    SayForBrick: (function () {
        SayForBrick.extends(PocketCode.Model.WaitBrick, false);

        function SayForBrick(device, sprite, propObject) {
            PocketCode.Model.WaitBrick.call(this, device, sprite, propObject);

            this._text = new PocketCode.Formula(device, sprite, propObject.text);
        }

        //formula accessors
        Object.defineProperties(SayForBrick.prototype, {
            textFormula: {
                get: function () {
                    return this._text;
                },
            },
        });

        SayForBrick.prototype.merge({
            /* override */
            _timerExpiredHandler: function (e) {
                var update = this._sprite.hideBubble(PocketCode.Ui.BubbleType.SPEECH);
                this._return(e.callId, update); //PocketCode.Model.WaitBrick.prototype._timerExpiredHandler.call(this, e.callId); //call super
            },
            /* override */
            _execute: function (id, scope) {
                var text = this._text.calculate(scope);
                if (text !== '' && !isNaN(this._duration.calculate(scope)))
                    this._sprite.showBubble(PocketCode.Ui.BubbleType.SPEECH, text);

                PocketCode.Model.WaitBrick.prototype._execute.call(this, id, scope); //call super
            },
        });

        return SayForBrick;
    })(),

    ThinkBrick: (function () {
        ThinkBrick.extends(PocketCode.Model.BaseBrick, false);

        function ThinkBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._text = new PocketCode.Formula(device, sprite, propObject.text);
        }

        //formula accessors
        Object.defineProperties(ThinkBrick.prototype, {
            textFormula: {
                get: function () {
                    return this._text;
                },
            },
        });

        ThinkBrick.prototype._execute = function (scope) {
            var text = this._text.calculate(scope);

            if (text.trim() == '')
                this._return();
            else
                this._return(this._sprite.showBubble(PocketCode.Ui.BubbleType.THINK, text));
        };

        return ThinkBrick;
    })(),

    ThinkForBrick: (function () {
        ThinkForBrick.extends(PocketCode.Model.WaitBrick, false);

        function ThinkForBrick(device, sprite, propObject) {
            PocketCode.Model.WaitBrick.call(this, device, sprite, propObject);

            this._text = new PocketCode.Formula(device, sprite, propObject.text);
        }

        //formula accessors
        Object.defineProperties(ThinkForBrick.prototype, {
            textFormula: {
                get: function () {
                    return this._text;
                },
            },
        });

        ThinkForBrick.prototype.merge({
            /* override */
            _timerExpiredHandler: function (e) {
                var update = this._sprite.hideBubble(PocketCode.Ui.BubbleType.THINK);
                this._return(e.callId, update); //PocketCode.Model.WaitBrick.prototype._timerExpiredHandler.call(this, e.callId); //call super
            },
            /* override */
            _execute: function (id, scope) {
                var text = this._text.calculate(scope);

                if (text !== '' && !isNaN(this._duration.calculate(scope)))
                    this._sprite.showBubble(PocketCode.Ui.BubbleType.THINK, text);

                PocketCode.Model.WaitBrick.prototype._execute.call(this, id); //call super
            },
        });

        return ThinkForBrick;
    })(),

    SetTransparencyBrick: (function () {
        SetTransparencyBrick.extends(PocketCode.Model.SetGraphicEffectBrick, false);

        function SetTransparencyBrick(device, sprite, propObject) {
            PocketCode.Model.SetGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.GHOST;
        }

        //SetTransparencyBrick.prototype._execute = function () {
        //    this._return(this._sprite.setTransparency(this._value.calculate(scope)));
        //};

        return SetTransparencyBrick;
    })(),

    ChangeTransparencyBrick: (function () {
        ChangeTransparencyBrick.extends(PocketCode.Model.ChangeGraphicEffectBrick, false);

        function ChangeTransparencyBrick(device, sprite, propObject) {
            PocketCode.Model.ChangeGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.GHOST;
        }

        //ChangeTransparencyBrick.prototype._execute = function () {
        //    this._return(this._sprite.changeTransparency(this._value.calculate(scope)));
        //};

        return ChangeTransparencyBrick;
    })(),

    SetBrightnessBrick: (function () {
        SetBrightnessBrick.extends(PocketCode.Model.SetGraphicEffectBrick, false);

        function SetBrightnessBrick(device, sprite, propObject) {
            PocketCode.Model.SetGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.BRIGHTNESS;
        }

        //SetBrightnessBrick.prototype._execute = function () {
        //    this._return(this._sprite.setBrightness(this._value.calculate(scope)));
        //};

        return SetBrightnessBrick;
    })(),

    ChangeBrightnessBrick: (function () {
        ChangeBrightnessBrick.extends(PocketCode.Model.ChangeGraphicEffectBrick, false);

        function ChangeBrightnessBrick(device, sprite, propObject) {
            PocketCode.Model.ChangeGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.BRIGHTNESS;
        }

        //ChangeBrightnessBrick.prototype._execute = function () {
        //    this._return(this._sprite.changeTransparency(this._value.calculate(scope)));
        //};

        return ChangeBrightnessBrick;
    })(),

    SetColorEffectBrick: (function () {
        SetColorEffectBrick.extends(PocketCode.Model.SetGraphicEffectBrick, false);

        function SetColorEffectBrick(device, sprite, propObject) {
            PocketCode.Model.SetGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.COLOR;
        }

        //SetBrightnessBrick.prototype._execute = function () {
        //    this._return(this._sprite.setBrightness(this._value.calculate(scope)));
        //};

        return SetColorEffectBrick;
    })(),

    ChangeColorEffectBrick: (function () {
        ChangeColorEffectBrick.extends(PocketCode.Model.ChangeGraphicEffectBrick, false);

        function ChangeColorEffectBrick(device, sprite, propObject) {
            PocketCode.Model.ChangeGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.COLOR;
        }

        //ChangeBrightnessBrick.prototype._execute = function () {
        //    this._return(this._sprite.changeTransparency(this._value.calculate(scope)));
        //};

        return ChangeColorEffectBrick;
    })(),

    ClearGraphicEffectBrick: (function () {
        ClearGraphicEffectBrick.extends(PocketCode.Model.BaseBrick, false);

        function ClearGraphicEffectBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

        }

        ClearGraphicEffectBrick.prototype._execute = function () {
            this._return(this._sprite.clearGraphicEffects());
        };

        return ClearGraphicEffectBrick;
    })(),

    SetBackgroundBrick: (function () {
        SetBackgroundBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetBackgroundBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._lookId = propObject.lookId;
        }

        SetBackgroundBrick.prototype.merge({
            _execute: function () {
                if (!this._lookId)  //can be null
                    this._return();
                else
                    this._return(this._scene.setBackground(this._lookId));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return SetBackgroundBrick;
    })(),

    SetBackgroundAndWaitBrick: (function () {
        SetBackgroundAndWaitBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function SetBackgroundAndWaitBrick(device, sprite, scene, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._lookId = propObject.lookId;
        }

        SetBackgroundAndWaitBrick.prototype.merge({
            _execute: function (id) {
                if (!this._lookId)  //can be null
                    this._return();
                else
                    this._return(this._scene.setBackground(this._lookId, this._return.bind(this, id)));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.ThreadedBrick.prototype.dispose.call(this);
            },
        });

        return SetBackgroundAndWaitBrick;
    })(),

    SetBackgroundByIndexBrick: (function () {
        SetBackgroundByIndexBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetBackgroundByIndexBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._lookIdx = new PocketCode.Formula(device, sprite, propObject.idx);
        }

        //formula accessors
        Object.defineProperties(SetBackgroundByIndexBrick.prototype, {
            indexFormula: {
                get: function () {
                    return this._lookIdx;
                },
            },
        });

        SetBackgroundByIndexBrick.prototype.merge({
            _execute: function (scope) {
                var idx = this._lookIdx.calculate(scope);
                if (isNaN(idx))
                    this._return();
                this._return(this._sprite.setLookByIndex(idx));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return SetBackgroundByIndexBrick;
    })(),


    CameraBrick: (function () {
        CameraBrick.extends(PocketCode.Model.BaseBrick, false);

        function CameraBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            this._turnOn = parseInt(propObject.selected) == 1;    //{0: off, 1: on}

            this._device.stopCamera();  //call on ctr to notify our device this feature is in use without changing the setting
        }

        CameraBrick.prototype.merge({
            _execute: function () {
                if (this._turnOn)
                    this._return(this._device.startCamera());
                else
                    this._return(this._device.stopCamera());
            }
        });

        return CameraBrick;
    })(),

    SelectCameraBrick: (function () {
        SelectCameraBrick.extends(PocketCode.Model.BaseBrick, false);

        function SelectCameraBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            if (propObject && propObject.selected == 0)   //{0: back, 1: front}
                this._selected = PocketCode.CameraType.BACK;
            else
                this._selected = PocketCode.CameraType.FRONT;   //default

            this._device.setCameraInUse(this._selected);    //notify device this cam is used in the project
        }

        SelectCameraBrick.prototype._execute = function () {
            this._return(this._device.setCameraType(this._selected));
        };

        return SelectCameraBrick;
    })(),

    //currently not planned?
    //SetCameraTransparencyBrick: (function () {
    //    SetCameraTransparencyBrick.extends(PocketCode.Model.BaseBrick, false);

    //    function SetCameraTransparencyBrick(device, sprite, scene, propObject) {
    //        PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

    //        this._scene = scene;
    //        this._value = new PocketCode.Formula(device, sprite, propObject.value);
    //    }

    ////formula accessors
    //Object.defineProperties(SetCameraTransparencyBrick.prototype, {
    //    valueFormula: {
    //        get: function () {
    //            return this._value;
    //        },
    //    },
    //});

    //    SetCameraTransparencyBrick.prototype._execute = function (scope) {
    //        var val = this._value.calculate(scope);
    //        if (isNaN(val))
    //            this._return(false);
    //        else
    //            return this._scene.setCameraTransparency(val);
    //    };

    //    return SetCameraTransparencyBrick;
    //})(),

    FlashBrick: (function () {
        FlashBrick.extends(PocketCode.Model.BaseBrick, false);

        function FlashBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._on = Boolean(parseInt(propObject.selected));	//{0: off, 1: on}
            //^^ please notice: Boolean('0') == true (string to bool)
            this._device.flashOn = this._device.flashOn;   //call on ctr to notify our device this feature is in use without changing the setting
        }

        FlashBrick.prototype._execute = function () {
            this._device.flashOn = this._on;
            this._return(true);
        };

        return FlashBrick;
    })(),

});
