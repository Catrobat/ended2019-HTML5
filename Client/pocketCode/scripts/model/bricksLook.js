/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="sprite.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Model.merge({

    SetGraphicEffectBrick: (function () {
        SetGraphicEffectBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetGraphicEffectBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._effect = propObject.effect;    //typeof PocketCode.GraphicEffect 
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetGraphicEffectBrick.prototype._execute = function () {
            var val = this._value.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.setGraphicEffect(this._effect, val));
        };

        return SetGraphicEffectBrick;
    })(),


    ChangeGraphicEffectBrick: (function () {
        ChangeGraphicEffectBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeGraphicEffectBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._effect = propObject.effect;    //typeof PocketCode.GraphicEffect
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeGraphicEffectBrick.prototype._execute = function () {
            var val = this._value.calculate();
            if (isNaN(val))
                this._return(false);
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
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._lookId = propObject.lookId;
        }

        SetLookBrick.prototype._execute = function () {
            if (this._lookId)  //can be null
                this._return(this._sprite.setLook(this._lookId));
        };

        return SetLookBrick;
    })(),


    PreviousLookBrick: (function () {
        PreviousLookBrick.extends(PocketCode.Model.BaseBrick, false);

        function PreviousLookBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        PreviousLookBrick.prototype._execute = function () {
            this._return(this._sprite.previousLook());
        };

        return PreviousLookBrick;
    })(),


    NextLookBrick: (function () {
        NextLookBrick.extends(PocketCode.Model.BaseBrick, false);

        function NextLookBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        NextLookBrick.prototype._execute = function () {
            this._return(this._sprite.nextLook());
        };

        return NextLookBrick;
    })(),


    SelectCameraBrick: (function () {
        SelectCameraBrick.extends(PocketCode.Model.BaseBrick, false);

        function SelectCameraBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            if (propObject && propObject.selected)    //set and 1
                this._selected = PocketCode.CameraType.FRONT;
            else
                this._selected = PocketCode.CameraType.BACK;

            this._device.selectedCamera = this._device.selectedCamera;   //call on ctr to notify our device this feature is in use without changing the setting
        }

        SelectCameraBrick.prototype._execute = function () {
            if (this._selected == this._device.selectedCamera) {
                this._return(false);
                return;
            }

            this._device.selectedCamera = this._selected;
            if (this._device.cameraOn)
                this._return(true);
            else
                this._return(false);
        };

        return SelectCameraBrick;
    })(),


    CameraBrick: (function () {
        CameraBrick.extends(PocketCode.Model.BaseBrick, false);

        function CameraBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._selected = propObject && propObject.selected ? 1 : 0; //{0: off, 1: on}
            this._device.cameraOn = this._device.cameraOn;   //call on ctr to notify our device this feature is in use without changing the setting
        }

        CameraBrick.prototype._execute = function () {
            if (this._selected == 1 && !this._device.cameraOn)
                this._device.cameraOn = true;
            else if (this._selected == 0 && this._device.cameraOn)
                this._device.cameraOn = false;
            else {  //set already
                this._return(false);
                return;
            }
            this._return(true);
        };

        return CameraBrick;
    })(),


    SetCameraTransparencyBrick: (function () {
        SetCameraTransparencyBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetCameraTransparencyBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetCameraTransparencyBrick.prototype._execute = function () {
            var val = this._value.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(false);    //TODO: e.g. this._return(this._device.setCameraTransparenc(val));
        };

        return SetCameraTransparencyBrick;
    })(),


    SetSizeBrick: (function () {
        SetSizeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetSizeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetSizeBrick.prototype._execute = function () {
            var val = this._percentage.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.setSize(val));
        };

        return SetSizeBrick;
    })(),


    ChangeSizeBrick: (function () {
        ChangeSizeBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeSizeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeSizeBrick.prototype._execute = function () {
            var val = this._value.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.changeSize(val));
        };

        return ChangeSizeBrick;
    })(),


    HideBrick: (function () {
        HideBrick.extends(PocketCode.Model.BaseBrick, false);

        function HideBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);
        }

        HideBrick.prototype._execute = function () {
            this._return(this._sprite.hide());
        };

        return HideBrick;
    })(),


    ShowBrick: (function () {
        ShowBrick.extends(PocketCode.Model.BaseBrick, false);

        function ShowBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);
        }

        ShowBrick.prototype._execute = function () {
            this._return(this._sprite.show());
        };

        return ShowBrick;
    })(),


    SetTransparencyBrick: (function () {
        SetTransparencyBrick.extends(PocketCode.Model.SetGraphicEffectBrick, false);

        function SetTransparencyBrick(device, sprite, propObject) {
            PocketCode.Model.SetGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.GHOST;
        }

        //SetTransparencyBrick.prototype._execute = function () {
        //    this._return(this._sprite.setTransparency(this._value.calculate()));
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
        //    this._return(this._sprite.changeTransparency(this._value.calculate()));
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
        //    this._return(this._sprite.setBrightness(this._value.calculate()));
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
        //    this._return(this._sprite.changeTransparency(this._value.calculate()));
        //};

        return ChangeBrightnessBrick;
    })(),


    SetColorEffectBrick: (function () {
        SetColorEffectBrick.extends(PocketCode.Model.SetGraphicEffectBrick, false);

        function SetColorEffectBrick(device, sprite, propObject) {
            PocketCode.Model.SetGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.BRIGHTNESS;
        }

        //SetBrightnessBrick.prototype._execute = function () {
        //    this._return(this._sprite.setBrightness(this._value.calculate()));
        //};

        return SetColorEffectBrick;
    })(),


    ChangeColorEffectBrick: (function () {
        ChangeColorEffectBrick.extends(PocketCode.Model.ChangeGraphicEffectBrick, false);

        function ChangeColorEffectBrick(device, sprite, propObject) {
            PocketCode.Model.ChangeGraphicEffectBrick.call(this, device, sprite, propObject);
            //this._effect = PocketCode.GraphicEffect.BRIGHTNESS;
        }

        //ChangeBrightnessBrick.prototype._execute = function () {
        //    this._return(this._sprite.changeTransparency(this._value.calculate()));
        //};

        return ChangeColorEffectBrick;
    })(),


    ClearGraphicEffectBrick: (function () {
        ClearGraphicEffectBrick.extends(PocketCode.Model.BaseBrick, false);

        function ClearGraphicEffectBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        ClearGraphicEffectBrick.prototype._execute = function () {
            this._return(this._sprite.clearGraphicEffects());
        };

        return ClearGraphicEffectBrick;
    })(),

    FlashBrick: (function () {
        FlashBrick.extends(PocketCode.Model.BaseBrick, false);

        function FlashBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

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
