/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Model.merge({

    SetVariableBrick: (function () {
        SetVariableBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetVariableBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

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
        ChangeVariableBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeVariableBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._var = sprite.getVariable(propObject.referenceId);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeVariableBrick.prototype._execute = function () {
            this._var.value += this._value.calculate();
            this._return();
        };

        return ChangeVariableBrick;
    })(),

    ShowTextBrick: (function() {
        ShowTextBrick.extends(PocketCode.Model.BaseBrick, false);

        function ShowTextBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._varId = propObject.referenceId;
            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        ShowTextBrick.prototype._execute = function () {
            this._sprite.showVariableAt(this._varId, this._x.calculate(), this._y.calculate());
            this._return();
        };

        return ShowTextBrick;
    })(),

    HideTextBrick: (function() {
        HideTextBrick.extends(PocketCode.Model.BaseBrick, false);

        function HideTextBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._varId = propObject.referenceId;
        }

        HideTextBrick.prototype._execute = function () {
            this._sprite.hideVariable(this._varId);
            this._return();
        };

        return HideTextBrick;
    })(),

    AppendToListBrick: (function () {
        AppendToListBrick.extends(PocketCode.Model.BaseBrick, false);

        function AppendToListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._list = sprite.getList(propObject.referenceId);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        AppendToListBrick.prototype._execute = function () {
            this._list.append(this._value.calculate());
            this._return();
        };

        return AppendToListBrick;
    })(),


    InsertAtListBrick: (function () {
        InsertAtListBrick.extends(PocketCode.Model.BaseBrick, false);

        function InsertAtListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._list = sprite.getList(propObject.referenceId);
            this._idx = propObject.index;
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        InsertAtListBrick.prototype._execute = function () {
            this._list.insertAt(this._idx, this._value.calculate());
            this._return();
        };

        return InsertAtListBrick;
    })(),


    ReplaceAtListBrick: (function () {
        ReplaceAtListBrick.extends(PocketCode.Model.BaseBrick, false);

        function ReplaceAtListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._list = sprite.getList(propObject.referenceId);
            this._idx = propObject.index;
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ReplaceAtListBrick.prototype._execute = function () {
            this._list.replaceAt(this._idx, this._value.calculate());
            this._return();
        };

        return ReplaceAtListBrick;
    })(),


    DeleteAtListBrick: (function () {
        DeleteAtListBrick.extends(PocketCode.Model.BaseBrick, false);

        function DeleteAtListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._list = sprite.getList(propObject.referenceId);
            this._idx = propObject.index;
        }

        DeleteAtListBrick.prototype._execute = function () {
            this._list.deleteAt(this._idx);
            this._return();
        };

        return DeleteAtListBrick;
    })(),

});

//e.g. var brick = new PocketCode.Model.SetVariableBrick({ value: "asd", id: 123 });
