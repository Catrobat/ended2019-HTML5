/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Bricks.merge({

    PlaceAtBrick: (function () {
        PlaceAtBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function PlaceAtBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        PlaceAtBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return PlaceAtBrick;
    })(),


    SetXBrick: (function () {
        SetXBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SetXBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetXBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return SetXBrick;
    })(),


    SetYBrick: (function () {
        SetYBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SetYBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetYBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return SetYBrick;
    })(),


    ChangeXBrick: (function () {
        ChangeXBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ChangeXBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeXBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return ChangeXBrick;
    })(),


    ChangeYBrick: (function () {
        ChangeYBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ChangeYBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeYBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return ChangeYBrick;
    })(),


    IfOnEdgeBounceBrick: (function () {
        IfOnEdgeBounceBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function IfOnEdgeBounceBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

        }

        IfOnEdgeBounceBrick.prototype._execute = function () {
            //todo implement
            this._return();
        };

        return IfOnEdgeBounceBrick;
    })(),


    MoveNStepsBrick: (function () {
        MoveNStepsBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function MoveNStepsBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._steps = new PocketCode.Formula(device, sprite, propObject.steps);
        }

        MoveNStepsBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return MoveNStepsBrick;
    })(),


    //TODO use point in direction?
    TurnLeftBrick: (function () {
        TurnLeftBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function TurnLeftBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        TurnLeftBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return TurnLeftBrick;
    })(),


    //TODO use point in direction?
    TurnRightBrick: (function () {
        TurnRightBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function TurnRightBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        TurnRightBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return TurnRightBrick;
    })(),


    PointInDirectionBrick: (function () {
        PointInDirectionBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function PointInDirectionBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        PointInDirectionBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return PointInDirectionBrick;
    })(),


    PointToBrick: (function () {
        PointToBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function PointToBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._spriteId = propObject.spriteId;
        }

        PointToBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return PointToBrick;
    })(),


    GlideToBrick: (function () {
        GlideToBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function GlideToBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
        }

        GlideToBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return GlideToBrick;
    })(),


    GoBackBrick: (function () {
        GoBackBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function GoBackBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._layers = new PocketCode.Formula(device, sprite, propObject.layers);
        }

        GoBackBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return GoBackBrick;
    })(),


    ComeToFrontBrick: (function () {
        ComeToFrontBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ComeToFrontBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

        }

        ComeToFrontBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return ComeToFrontBrick;
    })(),

});

