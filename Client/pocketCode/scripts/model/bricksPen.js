/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="sprite.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Model.merge({

    PenDownBrick: (function () {
        PenDownBrick.extends(PocketCode.Model.BaseBrick, false);

        function PenDownBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        PenDownBrick.prototype._execute = function () {
            this._sprite.penDown = true;
            this._return(false);
        };

        return PenDownBrick;
    })(),

    PenUpBrick: (function () {
        PenUpBrick.extends(PocketCode.Model.BaseBrick, false);

        function PenUpBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        PenUpBrick.prototype._execute = function () {
            this._sprite.penDown = false;
            this._return(false);
        };

        return PenUpBrick;
    })(),

    SetPenSizeBrick: (function () {
        SetPenSizeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetPenSizeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            this._penSize = new PocketCode.Formula(device, sprite, propObject.size);
        }

        SetPenSizeBrick.prototype._execute = function (scope) {
            var penSize = this._penSize.calculate(scope);
            if (!isNaN(penSize))
                this._sprite.penSize = penSize;
            this._return(false);
        };

        return SetPenSizeBrick;
    })(),

    SetPenColorBrick: (function () {
        SetPenColorBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetPenColorBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._r = new PocketCode.Formula(device, sprite, propObject.r);
            this._g = new PocketCode.Formula(device, sprite, propObject.g);
            this._b = new PocketCode.Formula(device, sprite, propObject.b);
        }

        SetPenColorBrick.prototype._execute = function (scope) {
            var r = this._r.calculate(scope),
                g = this._g.calculate(scope),
                b = this._b.calculate(scope);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b))
                this._sprite.penColor = { r: r, g: g, b: b };

            this._return(false);
        };

        return SetPenColorBrick;
    })(),

    StampBrick: (function () {
        StampBrick.extends(PocketCode.Model.BaseBrick, false);

        function StampBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        StampBrick.prototype._execute = function () {
            this._return(this._sprite.drawStamp());
        };

        return StampBrick;
    })(),

    ClearBackgroundBrick: (function () {
        ClearBackgroundBrick.extends(PocketCode.Model.BaseBrick, false);

        function ClearBackgroundBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
        }

        ClearBackgroundBrick.prototype.merge({
            _execute: function () {
                this._return(this._scene.clearPenStampBackground());
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return ClearBackgroundBrick;
    })(),

});
