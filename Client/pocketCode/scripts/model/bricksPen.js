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
        this._sprite.penDown = true;
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
      this._sprite.penDown = false;
      this._return(false);
    };

    return PenUpBrick;
  })(),
});
