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
            if (this._disposed)
                return;
            this._return(this._sprite.setGraphicEffect(this._effect, this._value.calculate()));
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
            if (this._disposed)
                return;
            this._return(this._sprite.changeGraphicEffect(this._effect, this._value.calculate()));
        };

        return ChangeGraphicEffectBrick;
    })(),

});

PocketCode.Model.merge({

    SetLookBrick: (function () {
        SetLookBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetLookBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._imageId = propObject.imageId;
        }

        SetLookBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            if (this._imageId)  //can be null
                this._return(this._sprite.setLook(this._imageId));
        };

        return SetLookBrick;
    })(),


    NextLookBrick: (function () {
        NextLookBrick.extends(PocketCode.Model.BaseBrick, false);

        function NextLookBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        NextLookBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._return(this._sprite.nextLook());
        };

        return NextLookBrick;
    })(),


    SetSizeBrick: (function () {
        SetSizeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetSizeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetSizeBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._return(this._sprite.setSize(this._percentage.calculate()));
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
            if (this._disposed)
                return;
            this._return(this._sprite.changeSize(this._value.calculate()));
        };

        return ChangeSizeBrick;
    })(),


    HideBrick: (function () {
        HideBrick.extends(PocketCode.Model.BaseBrick, false);

        function HideBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);
        }

        HideBrick.prototype._execute = function () {
            if (this._disposed)
                return;
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
            if (this._disposed)
                return;
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


    ClearGraphicEffectBrick: (function () {
        ClearGraphicEffectBrick.extends(PocketCode.Model.BaseBrick, false);

        function ClearGraphicEffectBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        ClearGraphicEffectBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._return(this._sprite.clearGraphicEffects());
        };

        return ClearGraphicEffectBrick;
    })(),

    LedOnBrick: (function () {
        LedOnBrick.extends(PocketCode.Model.BaseBrick, false);

        function LedOnBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);
        }

        LedOnBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._device.flashlightOn = true;
            this._return(true);
        };

        return LedOnBrick;
    })(),

    LedOffBrick: (function () {
        LedOffBrick.extends(PocketCode.Model.BaseBrick, false);

        function LedOffBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);
        }

        LedOffBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._device.flashlightOn = false;
            this._return(false);
        };

        return LedOffBrick;
    })(),

});
