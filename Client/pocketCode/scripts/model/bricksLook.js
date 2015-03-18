/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="sprite.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Bricks.merge({

    SetLookBrick: (function () {
        SetLookBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SetLookBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._lookId = propObject.id;
        }

        SetLookBrick.prototype._execute = function () {
            this._return(this._sprite.setLook(this._lookId));
        };

        return SetLookBrick;
    })(),


    NextLookBrick: (function () {
        NextLookBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function NextLookBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

        }

        NextLookBrick.prototype._execute = function () {
            this._return(this._sprite.nextLook());
        };

        return NextLookBrick;
    })(),


    SetSizeToBrick: (function () {
        SetSizeToBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SetSizeToBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetSizeToBrick.prototype._execute = function () {
            this._return(this._sprite.setSize(this._percentage.calculate()));
        };

        return SetSizeToBrick;
    })(),


    ChangeSizeBrick: (function () {
        ChangeSizeBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ChangeSizeBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeSizeBrick.prototype._execute = function () {
            this._return(this._sprite.changeSize(this._value.calculate()));
        };

        return ChangeSizeBrick;
    })(),


    HideBrick: (function () {
        HideBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function HideBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);
        }

        HideBrick.prototype._execute = function () {
            this._return(this._sprite.hide());
        };

        return HideBrick;
    })(),


    ShowBrick: (function () {
        ShowBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ShowBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);
        }

        ShowBrick.prototype._execute = function () {
            this._return(this._sprite.show());
        };

        return ShowBrick;
    })(),


    SetTransparencyBrick: (function () {
        SetTransparencyBrick.extends(PocketCode.Bricks.SetGraphicEffectBrick, false);

        function SetTransparencyBrick(device, sprite, propObject) {
            PocketCode.Bricks.SetGraphicEffectBrick.call(this, device, sprite, propObject);
        }

        SetTransparencyBrick.prototype._execute = function () {
            this._return(this._sprite.setTransparency(this._percentage.calculate()));
        };

        return SetTransparencyBrick;
    })(),


    ChangeTransparencyBrick: (function () {
        ChangeTransparencyBrick.extends(PocketCode.Bricks.ChangeGraphicEffectBrick, false);

        function ChangeTransparencyBrick(device, sprite, propObject) {
            PocketCode.Bricks.ChangeGraphicEffectBrick.call(this, device, sprite, propObject);
        }

        ChangeTransparencyBrick.prototype._execute = function () {
            this._return(this._sprite.changeTransparency(this._value.calculate()));
        };

        return ChangeTransparencyBrick;
    })(),


    SetBrightnessBrick: (function () {
        SetBrightnessBrick.extends(PocketCode.Bricks.SetGraphicEffectBrick, false);

        function SetBrightnessBrick(device, sprite, propObject) {
            PocketCode.Bricks.SetGraphicEffectBrick.call(this, device, sprite, propObject);
        }

        SetBrightnessBrick.prototype._execute = function () {
            this._return(this._sprite.setBrightness(this._percentage.calculate()));
        };

        return SetBrightnessBrick;
    })(),


    ChangeBrightnessBrick: (function () {
        ChangeBrightnessBrick.extends(PocketCode.Bricks.ChangeGraphicEffectBrick, false);

        function ChangeBrightnessBrick(device, sprite, propObject) {
            PocketCode.Bricks.ChangeGraphicEffectBrick.call(this, device, sprite, propObject);
        }

        ChangeBrightnessBrick.prototype._execute = function () {
            this._return(this._sprite.changeTransparency(this._value.calculate()));
        };

        return ChangeBrightnessBrick;
    })(),


    ClearGraphicEffectBrick: (function () {
        ClearGraphicEffectBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ClearGraphicEffectBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

        }

        ClearGraphicEffectBrick.prototype._execute = function () {
            this._return(this._sprite.clearGraphicEffects());
        };

        return ClearGraphicEffectBrick;
    })(),

});
