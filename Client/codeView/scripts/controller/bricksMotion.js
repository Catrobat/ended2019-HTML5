'use strict';


PocketCode.merge({

    GoToPositionBrick: (function () {
        GoToPositionBrick.extends(PocketCode.BaseBrick, false);
        function GoToPositionBrick(model, commentedOut, formulaX, formulaY) {
            if (!(model instanceof PocketCode.Model.GoToPositionBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formulaX = formulaX || "";
            var _formulaY = formulaY || "";
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_go_to'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'text',
                        i18n: 'x_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaX
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaY
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return GoToPositionBrick;
    })(),

    SetXBrick: (function () {
        SetXBrick.extends(PocketCode.BaseBrick, false);
        function SetXBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetXBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_x'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetXBrick;
    })(),

    SetYBrick: (function () {
        SetYBrick.extends(PocketCode.BaseBrick, false);
        function SetYBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetYBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_y'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetYBrick;
    })(),

    ChangeXBrick: (function () {
        ChangeXBrick.extends(PocketCode.BaseBrick, false);
        function ChangeXBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.ChangeXBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_x_by'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ChangeXBrick;
    })(),

    ChangeYBrick: (function () {
        ChangeYBrick.extends(PocketCode.BaseBrick, false);
        function ChangeYBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.ChangeYBrick)) {
                throw new Error("Invalid argument Model");
            }
            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_y_by'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ChangeYBrick;
    })(),

    SetRotionStyleBrick: (function () {
        SetRotionStyleBrick.extends(PocketCode.BaseBrick, false);
        function SetRotionStyleBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetRotionStyleBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_rotation_style'
                    },
                    {
                        type: 'lf',
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetRotionStyleBrick;
    })(),

    SetRotationSpeedBrick: (function () {
        SetRotationSpeedBrick.extends(PocketCode.BaseBrick, false);
        function SetRotationSpeedBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetRotationSpeedBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {};
            var _formula = formula || "";

            if(model.ccw){
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_rotate_left'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            value: _formula
                        },
                        {
                            type: 'text',
                            i18n: 'brick_turn_speed_unit'
                        }
                    ]
                };
            }
            else {
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_rotate_right'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            value: _formula
                        },
                        {
                            type: 'text',
                            i18n: 'brick_turn_speed_unit'
                        }
                    ]
                };
            }

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetRotationSpeedBrick;
    })(),

    GoToBrick: (function () {
        GoToBrick.extends(PocketCode.BaseBrick, false);
        function GoToBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.GoToBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_go_to'
                    },
                    {
                        type: 'lf',
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return GoToBrick;
    })(),

    IfOnEdgeBounceBrick: (function () { //Pralle vom Rand ab
        IfOnEdgeBounceBrick.extends(PocketCode.BaseBrick, false);
        function IfOnEdgeBounceBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.IfOnEdgeBounceBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_if_on_edge_bounce'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return IfOnEdgeBounceBrick;
    })(),

    MoveNStepsBrick: (function () {
        MoveNStepsBrick.extends(PocketCode.BaseBrick, false);
        function MoveNStepsBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.MoveNStepsBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_move'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'brick_move_n_step_s'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return MoveNStepsBrick;
    })(),

    TurnLeftBrick: (function () {
        TurnLeftBrick.extends(PocketCode.BaseBrick, false);
        function TurnLeftBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.TurnLeftBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_turn_left'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'degrees'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return TurnLeftBrick;
    })(),

    TurnRightBrick: (function () {
        TurnRightBrick.extends(PocketCode.BaseBrick, false);
        function TurnRightBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.TurnRightBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_turn_right'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'degrees'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return TurnRightBrick;
    })(),

    SetDirectionBrick: (function () {
        SetDirectionBrick.extends(PocketCode.BaseBrick, false);
        function SetDirectionBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetDirectionBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_point_in_direction'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'degrees'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetDirectionBrick;
    })(),

    SetDirectionToBrick: (function () {
        SetDirectionToBrick.extends(PocketCode.BaseBrick, false);
        function SetDirectionToBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetDirectionToBrick)) {
                throw new Error("Invalid argument Model");
            }
            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_point_to'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetDirectionToBrick;
    })(),

    GlideToBrick: (function () { //Gleite 1 Sekunde zu X: .. Y: ...
        GlideToBrick.extends(PocketCode.BaseBrick, false);
        function GlideToBrick(model, commentedOut, formulaTime, formulaX, formulaY) {
            if (!(model instanceof PocketCode.Model.GlideToBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formulaTime = formulaTime || "";
            var _formulaX = formulaX || "";
            var _formulaY = formulaY || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_glide'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaTime
                    },
                    {
                        type: 'text',
                        i18n: 'nxt_second_s'
                    },
                    {
                        type: 'lf',
                    },
                    {
                        type: 'text',
                        i18n: 'brick_glide_to_x'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaX
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaY
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return GlideToBrick;
    })(),

    GoBackBrick: (function () {
        GoBackBrick.extends(PocketCode.BaseBrick, false);
        function GoBackBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.GoBackBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_go_back'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'brick_go_back_layer_s'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return GoBackBrick;
    })(),

    ComeToFrontBrick: (function () {
        ComeToFrontBrick.extends(PocketCode.BaseBrick, false);
        function ComeToFrontBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ComeToFrontBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_come_to_front'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ComeToFrontBrick;
    })(),

    VibrationBrick: (function () {
        VibrationBrick.extends(PocketCode.BaseBrick, false);
        function VibrationBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.VibrationBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_vibration'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'nxt_second_s'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return VibrationBrick;
    })(),


    /* PHYSICS BRICKS */
    SetPhysicsObjectTypeBrick: (function () {
        SetPhysicsObjectTypeBrick.extends(PocketCode.BaseBrick, false);
        function SetPhysicsObjectTypeBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetPhysicsObjectTypeBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_physics_object_type'
                    },
                    {
                        type: 'lf',
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetPhysicsObjectTypeBrick;
    })(),

    SetVelocityBrick: (function () {
        SetVelocityBrick.extends(PocketCode.BaseBrick, false);
        function SetVelocityBrick(model, commentedOut, formulaX, formulaY) {
            if (!(model instanceof PocketCode.Model.SetVelocityBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formulaX = formulaX || "";
            var _formulaY = formulaY || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_velocity_to'
                    },

                    {
                        type: 'lf',
                    },
                    {
                        type: 'text',
                        i18n: 'x_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaX
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaY
                    },
                    {
                        type: 'text',
                        i18n: 'brick_set_velocity_unit'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetVelocityBrick;
    })(),

    SetGravityBrick: (function () {
        SetGravityBrick.extends(PocketCode.BaseBrick, false);
        function SetGravityBrick(model, commentedOut, formulaX, formulaY) {
            if (!(model instanceof PocketCode.Model.SetGravityBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formulaX = formulaX || "";
            var _formulaY = formulaY || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_gravity_to'
                    },

                    {
                        type: 'lf',
                    },
                    {
                        type: 'text',
                        i18n: 'x_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaX
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaY
                    },
                    {
                        type: 'text',
                        i18n: 'brick_set_gravity_unit'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetGravityBrick;
    })(),

    SetMassBrick: (function () {
        SetMassBrick.extends(PocketCode.BaseBrick, false);
        function SetMassBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetMassBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_mass'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'brick_set_mass_unit'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetMassBrick;
    })(),

    SetBounceFactorBrick: (function () {
        SetBounceFactorBrick.extends(PocketCode.BaseBrick, false);
        function SetBounceFactorBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetBounceFactorBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_bounce_factor'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'ev3_tone_percent'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetBounceFactorBrick;
    })(),

    SetFrictionBrick: (function () {
        SetFrictionBrick.extends(PocketCode.BaseBrick, false);
        function SetFrictionBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetFrictionBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_friction'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'ev3_tone_percent'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetFrictionBrick;
    })(),

});
