/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Bricks.merge({

    SetVariableBrick: (function () {
        SetVariableBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SetVariableBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._var = sprite.getVariable(propObject.referenceId);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetVariableBrick.prototype._execute = function () {
            this._var.value = this._value.calculate();
            this._return();
        };

        return SetVariableBrick;
    })(),


    ChangeVariableBrick: (function () {
        ChangeVariableBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ChangeVariableBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._var = sprite.getVariable(propObject.referenceId);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeVariableBrick.prototype._execute = function () {
            this._var.value += this._value.calculate();
            this._return();
        };

        return ChangeVariableBrick;
    })(),

});


//e.g. var brick = new PocketCode.Bricks.SetVariableBrick({ value: "asd", id: 123 });
