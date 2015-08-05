/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Bricks.merge({

    AppendToListBrick: (function () {
        AppendToListBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function AppendToListBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

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
        InsertAtListBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function InsertAtListBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

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
        ReplaceAtListBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ReplaceAtListBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

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
        DeleteAtListBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function DeleteAtListBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

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

