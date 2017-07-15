/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-animation.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Model.merge({

    GoToPositionBrick: (function () {
        GoToPositionBrick.extends(PocketCode.BaseBrick, false);
        function GoToPositionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.GoToPositionBrick)) {
                throw new Error("Invalid argument Model");
            }
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
                        name: 'GoToPositionBrick' + PocketCode.GoToPositionBrick.content[3].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'GoToPositionBrick' + PocketCode.GoToPositionBrick.content[5].id,
                        value: ''
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
        function SetXBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetXBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_x'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetXBrick' + PocketCode.SetXBrick.content[1].id,
                        value: ''
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
        function SetYBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetYBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_y'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetYBrick' + PocketCode.SetYBrick.content[1].id,
                        value: ''
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
        function ChangeXBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ChangeXBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_x_by'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'ChangeXBrick' + PocketCode.ChangeXBrick.content[1].id,
                        value: ''
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
        function ChangeYBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ChangeYBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_y_by'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'ChangeYBrick' + PocketCode.ChangeYBrick.content[1].id,
                        value: ''
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
                        name: 'SetRotionStyleBrick' + PocketCode.SetRotionStyleBrick.content[2].id,
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetRotionStyleBrick;
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
                        name: 'GoToBrick' + PocketCode.GoToBrick.content[2].id,
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
        function MoveNStepsBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.MoveNStepsBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_move'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'MoveNStepsBrick' + PocketCode.MoveNStepsBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_move_n_step_plural'
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
        function TurnLeftBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.TurnLeftBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_turn_left'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'TurnLeftBrick' + PocketCode.TurnLeftBrick.content[1].id,
                        value: ''
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
        function TurnRightBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.TurnRightBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_turn_right'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'TurnRightBrick' + PocketCode.TurnRightBrick.content[1].id,
                        value: ''
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
        function SetDirectionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetDirectionBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_point_in_direction'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetDirectionBrick' + PocketCode.SetDirectionBrick.content[1].id,
                        value: ''
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
        function SetDirectionToBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetDirectionToBrick)) {
                throw new Error("Invalid argument Model");
            }
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
                        name: 'SetDirectionToBrick' + PocketCode.SetDirectionToBrick.content[2].id,
                        value: ''
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
        function GlideToBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.GlideToBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_glide'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'GlideToBrick' + PocketCode.GlideToBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'second_plural'
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
                        name: 'GlideToBrick' + PocketCode.GlideToBrick.content[5].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'GlideToBrick' + PocketCode.GlideToBrick.content[7].id,
                        value: ''
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
        function GoBackBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.GoBackBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_go_back'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'GoBackBrick' + PocketCode.GoBackBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_go_back_layer_plural'
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
        function VibrationBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.VibrationBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_vibration'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'VibrationBrick' + PocketCode.VibrationBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'second_plural'
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
                        name: 'SetPhysicsObjectTypeBrick' + PocketCode.SetPhysicsObjectTypeBrick.content[2].id,
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
        function SetVelocityBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetVelocityBrick)) {
                throw new Error("Invalid argument Model");
            }
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
                        name: 'SetVelocityBrick' + PocketCode.SetVelocityBrick.content[3].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetVelocityBrick' + PocketCode.SetVelocityBrick.content[5].id,
                        value: ''
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

    RotationSpeedLeftBrick: (function () {
        RotationSpeedLeftBrick.extends(PocketCode.BaseBrick, false);
        function RotationSpeedLeftBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.RotationSpeedLeftBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_rotate_left'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'RotationSpeedLeftBrick' + PocketCode.RotationSpeedLeftBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_turn_speed_unit'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return RotationSpeedLeftBrick;
    })(),

    RotationSpeedRightBrick: (function () {
        RotationSpeedRightBrick.extends(PocketCode.BaseBrick, false);
        function RotationSpeedRightBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.RotationSpeedRightBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_rotate_right'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'RotationSpeedRightBrick' + PocketCode.RotationSpeedRightBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_turn_speed_unit'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.MOTION, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return RotationSpeedRightBrick;
    })(),

    SetGravityBrick: (function () {
        SetGravityBrick.extends(PocketCode.BaseBrick, false);
        function SetGravityBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetGravityBrick)) {
                throw new Error("Invalid argument Model");
            }
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
                        name: 'SetGravityBrick' + PocketCode.SetGravityBrick.content[3].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetGravityBrick' + PocketCode.SetGravityBrick.content[5].id,
                        value: ''
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
        function SetMassBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetMassBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_mass'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetMassBrick' + PocketCode.SetMassBrick.content[1].id,
                        value: ''
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
        function SetBounceFactorBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetBounceFactorBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_bounce_factor'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetBounceFactorBrick' + PocketCode.SetBounceFactorBrick.content[1].id,
                        value: ''
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
        function SetFrictionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetFrictionBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_friction'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetFrictionBrick' + PocketCode.SetFrictionBrick.content[1].id,
                        value: ''
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