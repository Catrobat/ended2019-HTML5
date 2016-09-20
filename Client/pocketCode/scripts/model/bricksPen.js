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

  SetPenSizeBrick: (function () {
    SetPenSizeBrick.extends(PocketCode.Model.BaseBrick, false);

    function SetPenSizeBrick(device, sprite, propObject) {
      PocketCode.Model.BaseBrick.call(this, device, sprite);
      this._x = new PocketCode.Formula(device, sprite, propObject.value);
    }

    SetPenSizeBrick.prototype._execute = function () {
      var penSize = this._x.calculate();
      if (!isNaN(penSize))
        this._sprite.penSize(penSize);
      this._return(false);
    };

    return SetPenSizeBrick;
  })(),

  SetPenColorBrick: (function () {
    SetPenColorBrick.extends(PocketCode.Model.BaseBrick, false);

    function SetPenColorBrick(device, sprite, propObject) {
      PocketCode.Model.BaseBrick.call(this, device, sprite);

      this._blue = new PocketCode.Formula(device, sprite, propObject.blue);
      this._red = new PocketCode.Formula(device, sprite, propObject.red);
      this._green = new PocketCode.Formula(device, sprite, propObject.green);
    }

    SetPenColorBrick.prototype._execute = function () {
      var blue = this._blue.calculate(),
          red = this._red.calculate(),
          green = this._green.calculate();
      if (!isNaN(blue) && !isNaN(red) && !isNaN(green))
        this._return(this._sprite.penColor(blue, red, green));
      this._return(false);
    };

    return SetPenColorBrick;
  })(),

});
