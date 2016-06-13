/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-animation.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Model.merge({

    GoToPositionBrick: (function () {
        GoToPositionBrick.extends(PocketCode.Model.BaseBrick, false);

        function GoToPositionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        GoToPositionBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var x = this._x.calculate(),
				y = this._y.calculate();
            if (isNaN(x) || isNaN(y))
                this._return(false);
            else
                this._return(this._sprite.setPosition(x, y));
        };

        return GoToPositionBrick;
    })(),


    SetXBrick: (function () {
        SetXBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetXBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetXBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var x = this._x.calculate();
            if (isNaN(x))
                this._return(false);
            else
                this._return(this._sprite.setPositionX(x));
        };

        return SetXBrick;
    })(),


    SetYBrick: (function () {
        SetYBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetYBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetYBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var y = this._y.calculate();
            if (isNaN(y))
                this._return(false);
            else
                this._return(this._sprite.setPositionY(y));
        };

        return SetYBrick;
    })(),


    ChangeXBrick: (function () {
        ChangeXBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeXBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeXBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var x = this._x.calculate();
            if (isNaN(x))
                this._return(false);
            else
                this._return(this._sprite.changePositionX(x));
        };

        return ChangeXBrick;
    })(),


    ChangeYBrick: (function () {
        ChangeYBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeYBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeYBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var y = this._y.calculate();
            if (isNaN(y))
                this._return(false);
            else
                this._return(this._sprite.changePositionY(y));
        };

        return ChangeYBrick;
    })(),


    SetRotionStyleBrick: (function () {
        SetRotionStyleBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetRotionStyleBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            switch (propObject.selected) {  //TODO: check if selected indices where generated correctly
                case 1:
                    this._style = PocketCode.RotationStyle.LEFT_TO_RIGHT;
                    break;
                case 2:
                    this._style = PocketCode.RotationStyle.DO_NOT_ROTATE;
                    break;
                default:
                    this._style = PocketCode.RotationStyle.ALL_AROUND;
                    break;
            }
        }

        SetRotionStyleBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._return(this._sprite.setRotationStyle(this._style));
        };

        return SetRotionStyleBrick;
    })(),


    IfOnEdgeBounceBrick: (function () {
        IfOnEdgeBounceBrick.extends(PocketCode.Model.BaseBrick, false);

        function IfOnEdgeBounceBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        IfOnEdgeBounceBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._return(this._sprite.ifOnEdgeBounce());
        };

        return IfOnEdgeBounceBrick;
    })(),


    MoveNStepsBrick: (function () {
        MoveNStepsBrick.extends(PocketCode.Model.BaseBrick, false);

        function MoveNStepsBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._steps = new PocketCode.Formula(device, sprite, propObject.steps);
        }

        MoveNStepsBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var val = this._steps.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.move(val));
        };

        return MoveNStepsBrick;
    })(),


    TurnLeftBrick: (function () {
        TurnLeftBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnLeftBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        TurnLeftBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var val = this._degrees.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.turnLeft(val));
        };

        return TurnLeftBrick;
    })(),


    TurnRightBrick: (function () {
        TurnRightBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnRightBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        TurnRightBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var val = this._degrees.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.turnRight(val));
        };

        return TurnRightBrick;
    })(),


    PointInDirectionBrick: (function () {
        PointInDirectionBrick.extends(PocketCode.Model.BaseBrick, false);

        function PointInDirectionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        PointInDirectionBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var val = this._degrees.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.setDirection(val));
        };

        return PointInDirectionBrick;
    })(),


    PointToBrick: (function () {
        PointToBrick.extends(PocketCode.Model.BaseBrick, false);

        function PointToBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._spriteId = propObject.spriteId;
        }

        PointToBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._return(this._sprite.pointTo(this._spriteId));
        };

        return PointToBrick;
    })(),


    GlideToBrick: (function () {
        GlideToBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function GlideToBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._paused = false;
        }

        GlideToBrick.prototype.merge({
            _updatePositionHandler: function (e) {
                this._sprite.setPosition(e.value.x, e.value.y);
            },
            _returnHandler: function (e) {
                var callId = e.callId;
                this._return(callId, true);
            },
            _execute: function (callId) {
                if (this._disposed)
                    return;
                var sprite = this._sprite;
                var po = this._pendingOps[callId];
                po.paused = this._paused;
                var duration = this._duration.calculate(),
					x = this._x.calculate(),
					y = this._y.calculate();
                if (isNaN(duration)) {
                    if (!isNaN(x) && !isNaN(y))
                        this._updatePositionHandler({ value: { x: x, y: y } });
                    this._returnHandler({ callId: callId });
                    return;
                }

                var animation = new SmartJs.Animation.Animation2D({ x: sprite.positionX, y: sprite.positionY }, { x: x, y: y }, Math.round(duration * 1000), SmartJs.Animation.Type.LINEAR2D);
                animation.onUpdate.addEventListener(new SmartJs.Event.EventListener(this._updatePositionHandler, this));
                animation.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._returnHandler, this));
                po.animation = animation;
                animation.start({ callId: callId });
                if (this._paused)
                    animation.pause();
            },
            pause: function () {
                this._paused = true;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.animation)
                        po.animation.pause();
                    po.paused = true;
                }
            },
            resume: function () {
                this._paused = false;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.paused) {
                        po.paused = false;
                        if (po.animation)
                            po.animation.resume();
                    }
                }
            },
            stop: function () {
                this._paused = false;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.animation)
                        po.animation.stop();
                }
                this._pendingOps = {};
            },
        });

        return GlideToBrick;
    })(),


    GoBackBrick: (function () {
        GoBackBrick.extends(PocketCode.Model.BaseBrick, false);

        function GoBackBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._layers = new PocketCode.Formula(device, sprite, propObject.layers);
        }

        GoBackBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var val = this._layers.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.goBack(val));
        };

        return GoBackBrick;
    })(),


    ComeToFrontBrick: (function () {
        ComeToFrontBrick.extends(PocketCode.Model.BaseBrick, false);

        function ComeToFrontBrick(device, sprite) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        ComeToFrontBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            this._return(this._sprite.comeToFront());
        };

        return ComeToFrontBrick;
    })(),


    VibrationBrick: (function () {
        VibrationBrick.extends(PocketCode.Model.BaseBrick, false);

        function VibrationBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._device.vibrate();    //call on ctr to notify our device this feature is in use
        }

        VibrationBrick.prototype._execute = function () {
            if (this._disposed)
                return;
            var val = this._duration.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._device.vibrate(val));
        };

        return VibrationBrick;
    })(),


    /* PHYSICS BRICKS */
    SetPhysicsObjectTypeBrick: (function () {
        SetPhysicsObjectTypeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetPhysicsObjectTypeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        SetPhysicsObjectTypeBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return SetPhysicsObjectTypeBrick;
    })(),


    SetVelocityBrick: (function () {
        SetVelocityBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetVelocityBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        SetVelocityBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return SetVelocityBrick;
    })(),


    TurnLeftSpeedBrick: (function () {
        TurnLeftSpeedBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnLeftSpeedBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        TurnLeftSpeedBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return TurnLeftSpeedBrick;
    })(),


    TurnRightSpeedBrick: (function () {
        TurnRightSpeedBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnRightSpeedBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        TurnRightSpeedBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return TurnRightSpeedBrick;
    })(),


    SetGravityBrick: (function () {
        SetGravityBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetGravityBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        SetGravityBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return SetGravityBrick;
    })(),


    SetMassBrick: (function () {
        SetMassBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetMassBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        SetMassBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return SetMassBrick;
    })(),


    SetBounceFactorBrick: (function () {
        SetBounceFactorBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetBounceFactorBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        SetBounceFactorBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return SetBounceFactorBrick;
    })(),


    SetFrictionBrick: (function () {
        SetFrictionBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetFrictionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite);

        }

        SetFrictionBrick.prototype._execute = function () {
            //TODO:
            this._return(false);
        };

        return SetFrictionBrick;
    })(),

});

