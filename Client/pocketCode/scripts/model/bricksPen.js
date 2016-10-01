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
        this._sprite.penDown(true);
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
      this._sprite.penDown(false);
      this._return(false);
    };

    return PenUpBrick;
  })(),

  SetPenSizeBrick: (function () {
    SetPenSizeBrick.extends(PocketCode.Model.BaseBrick, false);

    function SetPenSizeBrick(device, sprite, propObject) {
      PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
      this._penSize = new PocketCode.Formula(device, sprite, propObject.value);
    }

    SetPenSizeBrick.prototype._execute = function () {
      var penSize = this._penSize.calculate();
      if (!isNaN(penSize))
        this._return( this._sprite.penSize(penSize) );
      else
        this._return(false);
    };

    return SetPenSizeBrick;
  })(),

  SetPenColorBrick: (function () {
    SetPenColorBrick.extends(PocketCode.Model.BaseBrick, false);

    function SetPenColorBrick(device, sprite, propObject) {
      PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

      this._penColorBlue = new PocketCode.Formula(device, sprite, propObject.blue);
      this._penColorRed = new PocketCode.Formula(device, sprite, propObject.red);
      this._penColorGreen = new PocketCode.Formula(device, sprite, propObject.green);
    }

    SetPenColorBrick.prototype._execute = function () {
      var blue = this._penColorBlue.calculate(),
          red = this._penColorRed.calculate(),
          green = this._penColorGreen.calculate();
      if (!isNaN(blue) && !isNaN(red) && !isNaN(green))
        this._return(this._sprite.penColor(blue, red, green));
      else
        this._return(false);
    };

    return SetPenColorBrick;
  })(),

    ClearPenBrick: (function () {
        ClearPenBrick.extends(PocketCode.Model.BaseBrick, false);

        function ClearPenBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        ClearPenBrick.prototype._execute = function () {
            this._return(scene.ClearPenStampCanvas());
        };

        return ClearPenBrick;
    })(),

    StampBrick: (function () {
        StampBrick.extends(PocketCode.Model.BaseBrick, false);

        function StampBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        StampBrick.prototype._execute = function () {
            this._return(this._sprite.penStamp());
        };

        return StampBrick;
    })(),

});
