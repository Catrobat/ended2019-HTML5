/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="sprite.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Model.merge({

  PenDownBrick: (function () {
    PenDownBrick.extends(PocketCode.Model.BaseBrick, false);

    function PenDownBrick(device, sprite, propObject) {
      PocketCode.Model.BaseBrick.call(this, device, sprite);
    }

    PenDownBrick.prototype._execute = function () {
        this._sprite.penDown(true);
        this._return(false);
    };

    return PenDownBrick;
  })(),

  PenUpBrick: (function () {
    PenUpBrick.extends(PocketCode.Model.BaseBrick, false);

    function PenUpBrick(device, sprite, propObject) {
      PocketCode.Model.BaseBrick.call(this, device, sprite);
    }

    PenUpBrick.prototype._execute = function () {
      this._sprite.penDown(false);
      this._return(false);
    };

    return PenUpBrick;
  })(),

  SetPenSize: (function () {
    SetPenSize.extends(PocketCode.Model.BaseBrick, false);

    function SetPenSize(device, sprite, propObject) {
      PocketCode.Model.BaseBrick.call(this, device, sprite);
      this._x = new PocketCode.Formula(device, sprite, propObject.value);
    }

    SetPenSize.prototype._execute = function () {
      var penSize = this._x.calculate();
      if (!isNaN(penSize))
        this._sprite.penSize(penSize);
      this._return(false);
    };

    return SetPenSize;
  })(),

  ClearPen: (function () {
    ClearPen.extends(PocketCode.Model.BaseBrick, false);

    function ClearPen(device, sprite) {
      PocketCode.Model.BaseBrick.call(this, device, sprite);
    }

    ClearPen.prototype._execute = function () {
      this._return(this._sprite.hide());
    };

    return ClearPen;
  })(),

});
