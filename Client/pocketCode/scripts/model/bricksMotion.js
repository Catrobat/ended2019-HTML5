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
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        //formula accessors
        Object.defineProperties(GoToPositionBrick.prototype, {
            xFormula: {
                get: function () {
                    return this._x;
                },
            },
            yFormula: {
                get: function () {
                    return this._y;
                },
            },
        });

        GoToPositionBrick.prototype._execute = function (scope) {
            var x = this._x.calculate(scope),
                y = this._y.calculate(scope);
            if (isNaN(x) || isNaN(y))
                this._return();
            else
                this._return(this._sprite.setPosition(x, y));
        };

        return GoToPositionBrick;
    })(),

    SetXBrick: (function () {
        SetXBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetXBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(SetXBrick.prototype, {
            xFormula: {
                get: function () {
                    return this._x;
                },
            },
        });

        SetXBrick.prototype._execute = function (scope) {
            var x = this._x.calculate(scope);
            if (isNaN(x))
                this._return();
            else
                this._return(this._sprite.setPositionX(x));
        };

        return SetXBrick;
    })(),

    SetYBrick: (function () {
        SetYBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetYBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(SetYBrick.prototype, {
            yFormula: {
                get: function () {
                    return this._y;
                },
            },
        });

        SetYBrick.prototype._execute = function (scope) {
            var y = this._y.calculate(scope);
            if (isNaN(y))
                this._return();
            else
                this._return(this._sprite.setPositionY(y));
        };

        return SetYBrick;
    })(),

    ChangeXBrick: (function () {
        ChangeXBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeXBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(ChangeXBrick.prototype, {
            xFormula: {
                get: function () {
                    return this._x;
                },
            },
        });

        ChangeXBrick.prototype._execute = function (scope) {
            var x = this._x.calculate(scope);
            if (isNaN(x))
                this._return();
            else
                this._return(this._sprite.changePositionX(x));
        };

        return ChangeXBrick;
    })(),

    ChangeYBrick: (function () {
        ChangeYBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeYBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(ChangeYBrick.prototype, {
            yFormula: {
                get: function () {
                    return this._y;
                },
            },
        });

        ChangeYBrick.prototype._execute = function (scope) {
            var y = this._y.calculate(scope);
            if (isNaN(y))
                this._return();
            else
                this._return(this._sprite.changePositionY(y));
        };

        return ChangeYBrick;
    })(),

    SetRotionStyleBrick: (function () {
        SetRotionStyleBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetRotionStyleBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (!propObject)
                this._style = PocketCode.RotationStyle.ALL_AROUND;
            else
                switch (propObject.selected) {  //{ 0: left-right, 1: all around, 2: don't rotate }
                    case 0:
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
            this._return(this._sprite.setRotationStyle(this._style));
        };

        return SetRotionStyleBrick;
    })(),

    GoToType: {
        POINTER: 1,
        RANDOM: 2,
        SPRITE: 3
    },

    GoToBrick: (function () {
        GoToBrick.extends(PocketCode.Model.BaseBrick, false);

        function GoToBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);


            // this._gameEngine = gameEngine;
            this._scene = scene;
            this._destinationSpriteId = propObject.spriteId;
            switch (propObject.destinationType) {
                case 'pointer':
                    this._type = PocketCode.Model.GoToType.POINTER;
                    break;
                case 'random':
                    this._type = PocketCode.Model.GoToType.RANDOM;
                    break;
                case 'sprite':
                    this._type = PocketCode.Model.GoToType.SPRITE;
                    break;
            }
        }

        GoToBrick.prototype.merge({
            _execute: function () {
                this._return(this._scene.setSpritePosition(this._sprite.id, this._type, this._destinationSpriteId));
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return GoToBrick;
    })(),

    IfOnEdgeBounceBrick: (function () {
        IfOnEdgeBounceBrick.extends(PocketCode.Model.BaseBrick, false);

        function IfOnEdgeBounceBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        IfOnEdgeBounceBrick.prototype._execute = function () {
            this._return(this._sprite.ifOnEdgeBounce());
        };

        return IfOnEdgeBounceBrick;
    })(),

    MoveNStepsBrick: (function () {
        MoveNStepsBrick.extends(PocketCode.Model.BaseBrick, false);

        function MoveNStepsBrick(device, sprite, minLoopCycleTime, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._minLoopCycleTime = minLoopCycleTime || 20;
            this._steps = new PocketCode.Formula(device, sprite, propObject.steps);
        }

        //formula accessors
        Object.defineProperties(MoveNStepsBrick.prototype, {
            stepsFormula: {
                get: function () {
                    return this._steps;
                },
            },
        });

        MoveNStepsBrick.prototype._execute = function (scope) {
            var val = this._steps.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.move(val, val / this._minLoopCycleTime));
        };

        return MoveNStepsBrick;
    })(),

    TurnLeftBrick: (function () {
        TurnLeftBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnLeftBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        //formula accessors
        Object.defineProperties(TurnLeftBrick.prototype, {
            degreesFormula: {
                get: function () {
                    return this._degrees;
                },
            },
        });

        TurnLeftBrick.prototype._execute = function (scope) {
            var val = this._degrees.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.rotate(-val));
        };

        return TurnLeftBrick;
    })(),

    TurnRightBrick: (function () {
        TurnRightBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnRightBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        //formula accessors
        Object.defineProperties(TurnRightBrick.prototype, {
            degreesFormula: {
                get: function () {
                    return this._degrees;
                },
            },
        });

        TurnRightBrick.prototype._execute = function (scope) {
            var val = this._degrees.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.rotate(val));
        };

        return TurnRightBrick;
    })(),

    SetDirectionBrick: (function () {
        SetDirectionBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetDirectionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        //formula accessors
        Object.defineProperties(SetDirectionBrick.prototype, {
            degreesFormula: {
                get: function () {
                    return this._degrees;
                },
            },
        });

        SetDirectionBrick.prototype._execute = function (scope) {
            var val = this._degrees.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.setDirection(val));
        };

        return SetDirectionBrick;
    })(),

    SetDirectionToBrick: (function () {
        SetDirectionToBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetDirectionToBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._spriteId = propObject.spriteId;
        }

        SetDirectionToBrick.prototype._execute = function () {
            this._return(this._sprite.setDirectionTo(this._spriteId));
        };

        return SetDirectionToBrick;
    })(),

    SetRotationStyleBrick: (function () {
        SetRotationStyleBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetRotationStyleBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (!propObject)
                this._style = PocketCode.RotationStyle.ALL_AROUND;
            else
                switch (propObject.selected) {  //{ 0: left-right, 1: all around, 2: don't rotate }
                    case 0:
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

        SetRotationStyleBrick.prototype._execute = function () {
            this._return(this._sprite.setRotationStyle(this._style));
        };

        return SetRotationStyleBrick;
    })(),

    SetRotationSpeedBrick: (function () {
        SetRotationSpeedBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetRotationSpeedBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degreesPerSecond = new PocketCode.Formula(device, sprite, propObject.degreesPerSec);
            this._ccw = propObject.ccw; //counterclockwise (=rotate left)
        }

        //formula accessors
        Object.defineProperties(SetRotationSpeedBrick.prototype, {
            degPerSecFormula: {
                get: function () {
                    return this._degreesPerSecond;
                },
            },
            ccw: {
                get: function () {
                    return this._ccw;
                },
            },
        });


        SetRotationSpeedBrick.prototype._execute = function (scope) {
            var value = this._degreesPerSecond.calculate(scope);

            if (!isNaN(value)) {
                if (this._ccw)
                    value *= -1;
                this._sprite.rotationSpeed = value;
            }
            this._return();
        };

        return SetRotationSpeedBrick;
    })(),

    GlideToBrick: (function () {
        GlideToBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function GlideToBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._velocity = 0; //initial
        }

        //formula accessors
        Object.defineProperties(GlideToBrick.prototype, {
            xFormula: {
                get: function () {
                    return this._x;
                },
            },
            yFormula: {
                get: function () {
                    return this._y;
                },
            },
            durationFormula: {
                get: function () {
                    return this._duration;
                },
            },
        });

        GlideToBrick.prototype.merge({
            _updatePositionHandler: function (e) {
                this._sprite.setPosition(e.value.x, e.value.y, true, this._pendingOps[this._callId].cancelCallback);
            },
            //_returnHandler: function (e) {
            //    //var callId = e.callId;
            //    this._return(e.callId, true);
            //},
            _cancel: function (id) {
                var po = this._pendingOps[id];
                if (!po)    //make sure a internaly canceled op does not get canceled again from sprite callback
                    return;
                po.animation.stop();
                this._return(id, false);
            },
            _execute: function (id, scope) {
                this._callId = id;  //in this brick there can only be one active animation
                var sprite = this._sprite;

                var po;
                //terminate pending ops to avoid conflicts
                for (var p in this._pendingOps)
                    if (p != id)
                        this._cancel(p);

                po = this._pendingOps[id];
                po.cancelCallback = this._cancel.bind(this, id);    //make sure callback is only created once per animation

                //po.paused = this._paused;
                var duration = this._duration.calculate(scope),
                    duration = Math.round(duration * 1000),
                    x = this._x.calculate(scope),
                    y = this._y.calculate(scope);

                //handle invalid arguments
                if (isNaN(duration) || duration == 0 || isNaN(x) || isNaN(y)) {
                    if (!isNaN(x) && !isNaN(y)) {
                        this._updatePositionHandler({ value: { x: x, y: y } });
                        this._return(id, true);
                    }
                    else
                        this._return(id, false);
                    return;
                }

                var dx = Math.abs(x - sprite.positionX),
                    dy = Math.abs(y - sprite.positionY);
                this._velocity = Math.sqrt(dx * dx + dy * dy) / duration;

                var animation = new SmartJs.Animation.Animation2D({ x: sprite.positionX, y: sprite.positionY }, { x: x, y: y }, duration, SmartJs.Animation.Type.LINEAR2D);
                animation.onUpdate.addEventListener(new SmartJs.Event.EventListener(this._updatePositionHandler, this));
                animation.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._return.bind(this, id, true, false)));
                po.animation = animation;
                animation.start();//{ callId: id });
                if (this._paused)
                    animation.pause();
            },
            pause: function () {
                var po, pos = this._pendingOps;
                for (var id in pos) {
                    //if (!pos.hasOwnProperty(p))
                    //    continue;
                    po = pos[id];
                    if (po.animation)
                        po.animation.pause();
                    //po.paused = true;
                }
                PocketCode.Model.ThreadedBrick.prototype.pause.call(this);
            },
            resume: function () {
                var po, pos = this._pendingOps;
                for (var id in pos) {
                    //if (!pos.hasOwnProperty(p))
                    //    continue;
                    po = pos[id];
                    //if (po.paused) {
                    //    po.paused = false;
                    if (po.animation)
                        po.animation.resume();
                    //}
                }
                PocketCode.Model.ThreadedBrick.prototype.resume.call(this);
            },
            stop: function () {
                var po, pos = this._pendingOps;
                for (var id in pos) {
                    //if (!pos.hasOwnProperty(p))
                    //    continue;
                    po = pos[id];
                    if (po.animation)
                        po.animation.stop();
                }
                PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
            },
        });

        return GlideToBrick;
    })(),

    GoBackBrick: (function () {
        GoBackBrick.extends(PocketCode.Model.BaseBrick, false);

        function GoBackBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._layers = new PocketCode.Formula(device, sprite, propObject.layers);
        }

        //formula accessors
        Object.defineProperties(GoBackBrick.prototype, {
            layersFormula: {
                get: function () {
                    return this._layers;
                },
            },
        });

        GoBackBrick.prototype._execute = function (scope) {
            var val = this._layers.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._sprite.goBack(val));
        };

        return GoBackBrick;
    })(),

    ComeToFrontBrick: (function () {
        ComeToFrontBrick.extends(PocketCode.Model.BaseBrick, false);

        function ComeToFrontBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

        }

        ComeToFrontBrick.prototype._execute = function () {
            this._return(this._sprite.comeToFront());
        };

        return ComeToFrontBrick;
    })(),

    VibrationBrick: (function () {
        VibrationBrick.extends(PocketCode.Model.BaseBrick, false);

        function VibrationBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._device.vibrate();    //call on ctr to notify our device this feature is in use
        }

        //formula accessors
        Object.defineProperties(VibrationBrick.prototype, {
            durationFormula: {
                get: function () {
                    return this._duration;
                },
            },
        });

        VibrationBrick.prototype._execute = function (scope) {
            var val = this._duration.calculate(scope);
            if (isNaN(val))
                this._return();
            else
                this._return(this._device.vibrate(val));
        };

        return VibrationBrick;
    })(),


    /* PHYSICS BRICKS */
    SetPhysicsObjectTypeBrick: (function () {
        SetPhysicsObjectTypeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetPhysicsObjectTypeBrick(device, sprite, physicsWorld, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            this._physicsWorld = physicsWorld;

            if (!propObject) {
                this._physicsType = PocketCode.PhysicsType.NONE;
            }
            else {
                switch (propObject.physicsType) {
                    case 'FIXED':
                        this._physicsType = PocketCode.PhysicsType.FIXED;
                        break;
                    case 'DYNAMIC':
                        this._physicsType = PocketCode.PhysicsType.DYNAMIC;
                        break;
                    default:
                        this._physicsType = PocketCode.PhysicsType.NONE;
                        break;
                }
            }
        }

        SetPhysicsObjectTypeBrick.prototype.merge({
            _execute: function () {
                //TODO:
                var physicsEnabled = this._physicsType !== PocketCode.PhysicsType.NONE;

                this._physicsWorld.subscribe(this._sprite.id, physicsEnabled);
                this._sprite.physicsType = this._physicsType;

                this._return();
            },
            dispose: function () {
                this._physicsWorld = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return SetPhysicsObjectTypeBrick;
    })(),

    SetVelocityBrick: (function () {
        SetVelocityBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetVelocityBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        //formula accessors
        Object.defineProperties(SetVelocityBrick.prototype, {
            xFormula: {
                get: function () {
                    return this._x;
                },
            },
            yFormula: {
                get: function () {
                    return this._y;
                },
            },
        });

        SetVelocityBrick.prototype._execute = function (scope) {
            var x = this._x.calculate(scope),
                y = this._y.calculate(scope);

            if (!isNaN(x) || !isNaN(y))
                this._sprite.setVelocity(x, y); //TODO: velocity/sek ->direction?
            this._return();
        };

        return SetVelocityBrick;
    })(),

    RotationSpeedLeftBrick: (function () {
        RotationSpeedLeftBrick.extends(PocketCode.Model.BaseBrick, false);

        function RotationSpeedLeftBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degreesPerSecond = new PocketCode.Formula(device, sprite, propObject.degreesPerSec);
        }

        RotationSpeedLeftBrick.prototype._execute = function (scope) {
            var degreesPerSecond = this._degreesPerSecond.calculate(scope);

            if (!isNaN(degreesPerSecond))
                this._sprite.turnNDegreePerSecond = -degreesPerSecond;

            this._return();
        };

        return RotationSpeedLeftBrick;
    })(),

    RotationSpeedRightBrick: (function () {
        RotationSpeedRightBrick.extends(PocketCode.Model.BaseBrick, false);

        function RotationSpeedRightBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degreesPerSecond = new PocketCode.Formula(device, sprite, propObject.degreesPerSec);
        }

        RotationSpeedRightBrick.prototype._execute = function (scope) {
            var degreesPerSecond = this._degreesPerSecond.calculate(scope);

            if (!isNaN(degreesPerSecond))
                this._sprite.turnNDegreePerSecond = degreesPerSecond;

            this._return();
        };

        return RotationSpeedRightBrick;
    })(),

    SetGravityBrick: (function () {
        SetGravityBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetGravityBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        //formula accessors
        Object.defineProperties(SetGravityBrick.prototype, {
            xFormula: {
                get: function () {
                    return this._x;
                },
            },
            yFormula: {
                get: function () {
                    return this._y;
                },
            },
        });

        SetGravityBrick.prototype.merge({
            _execute: function (scope) {
                var x = this._x.calculate(scope),
                    y = this._y.calculate(scope);
                if (!isNaN(x) || !isNaN(y))
                    this._scene.setGravity(x, y);

                this._return();
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            },
        });

        return SetGravityBrick;
    })(),

    SetMassBrick: (function () {
        SetMassBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetMassBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._mass = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(SetMassBrick.prototype, {
            massFormula: {
                get: function () {
                    return this._mass;
                },
            },
        });

        SetMassBrick.prototype._execute = function (scope) {
            var mass = this._mass.calculate(scope);
            if (!isNaN(mass))
                this._sprite.mass = mass;

            this._return();
        };

        return SetMassBrick;
    })(),

    SetBounceFactorBrick: (function () {
        SetBounceFactorBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetBounceFactorBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._bounceFactor = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        //formula accessors
        Object.defineProperties(SetBounceFactorBrick.prototype, {
            bounceFactorFormula: {
                get: function () {
                    return this._bounceFactor;
                },
            },
        });

        SetBounceFactorBrick.prototype._execute = function (scope) {
            var bounceFactor = this._bounceFactor.calculate(scope);

            if (!isNaN(bounceFactor))
                this._sprite.bounceFactor = bounceFactor;

            this._return();
        };

        return SetBounceFactorBrick;
    })(),

    SetFrictionBrick: (function () {
        SetFrictionBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetFrictionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._friction = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        //formula accessors
        Object.defineProperties(SetFrictionBrick.prototype, {
            frictionFormula: {
                get: function () {
                    return this._friction;
                },
            },
        });

        SetFrictionBrick.prototype._execute = function (scope) {
            var friction = this._friction.calculate(scope);
            if (!isNaN(friction))
                this._sprite.friction = friction;

            this._return();
        };

        return SetFrictionBrick;
    })(),

});
