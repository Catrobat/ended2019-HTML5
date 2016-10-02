/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Model.merge({

    SetVariableBrick: (function () {
        SetVariableBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetVariableBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (propObject.resourceId) //can be null
                this._var = sprite.getVariable(propObject.resourceId);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetVariableBrick.prototype._execute = function () {
            if (this._var)  //can be undefined
                this._var.value = this._value.calculate();
            this._return();
        };

        return SetVariableBrick;
    })(),

    ChangeVariableBrick: (function () {
        ChangeVariableBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeVariableBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (propObject.resourceId) //can be null
                this._var = sprite.getVariable(propObject.resourceId);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeVariableBrick.prototype._execute = function () {
            var value = this._value.calculate();
            if (this._var) {   //this._var can be undefined
                if (!isNaN(this._var.value) && !isNaN(value))
                    this._var.value += value;
                else //overwrite existing if values not numeric
                    this._var.value = value;
            }
            this._return();
        };

        return ChangeVariableBrick;
    })(),

    ShowVariableBrick: (function() {
        ShowVariableBrick.extends(PocketCode.Model.BaseBrick, false);

        function ShowVariableBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
             
            this._varId = propObject.resourceId;
            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        ShowVariableBrick.prototype._execute = function () {
            if (this._varId)    //can be null
                this._sprite.showVariableAt(this._varId, this._x.calculate(), this._y.calculate());
            this._return();
        };

        return ShowVariableBrick;
    })(),

    HideVariableBrick: (function() {
        HideVariableBrick.extends(PocketCode.Model.BaseBrick, false);

        function HideVariableBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._varId = propObject.resourceId;
        }

        HideVariableBrick.prototype._execute = function () {
            if (this._varId)    //can be null
                this._sprite.hideVariable(this._varId);
            this._return();
        };

        return HideVariableBrick;
    })(),

    AppendToListBrick: (function () {
        AppendToListBrick.extends(PocketCode.Model.BaseBrick, false);

        function AppendToListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (propObject.resourceId)    //can be null
                this._list = sprite.getList(propObject.resourceId);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        AppendToListBrick.prototype._execute = function () {
            if (this._list) //can be null
                this._list.append(this._value.calculate());
            this._return();
        };

        return AppendToListBrick;
    })(),


    InsertAtListBrick: (function () {
        InsertAtListBrick.extends(PocketCode.Model.BaseBrick, false);

        function InsertAtListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (propObject.resourceId)    //can be null
                this._list = sprite.getList(propObject.resourceId);
            this._idx = new PocketCode.Formula(device, sprite, propObject.index);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        InsertAtListBrick.prototype._execute = function () {
            var idx = this._idx.calculate();
            if (this._list && !isNaN(idx))
                this._list.insertAt(idx, this._value.calculate());
            this._return();
        };

        return InsertAtListBrick;
    })(),


    ReplaceAtListBrick: (function () {
        ReplaceAtListBrick.extends(PocketCode.Model.BaseBrick, false);

        function ReplaceAtListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (propObject.resourceId)    //can be null
                this._list = sprite.getList(propObject.resourceId);
            this._idx = new PocketCode.Formula(device, sprite, propObject.index);
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ReplaceAtListBrick.prototype._execute = function () {
            var idx = this._idx.calculate();
            if (this._list && !isNaN(idx))
                this._list.replaceAt(idx, this._value.calculate());
            this._return();
        };

        return ReplaceAtListBrick;
    })(),


    DeleteAtListBrick: (function () {
        DeleteAtListBrick.extends(PocketCode.Model.BaseBrick, false);

        function DeleteAtListBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (propObject.resourceId)    //can be null
                this._list = sprite.getList(propObject.resourceId);
            this._idx = new PocketCode.Formula(device, sprite, propObject.index);
        }

        DeleteAtListBrick.prototype._execute = function () {
            var idx = this._idx.calculate();
            if (this._list && !isNaN(idx))
                this._list.deleteAt(idx);
            this._return();
        };

        return DeleteAtListBrick;
    })(),

});

//e.g. var brick = new PocketCode.Model.SetVariableBrick({ value: "asd", id: 123 });
