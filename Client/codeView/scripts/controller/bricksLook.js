'use strict';

PocketCode.merge({

    SetLookBrick: (function () {
        SetLookBrick.extends(PocketCode.BaseBrick, false);
        function SetLookBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetLookBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_look'
                    },
                    {
                        type: 'lf', //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        //name: 'SetLookBrick' + PocketCode.SetLookBrick.content[2].id,
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetLookBrick;
    })(),

    NextLookBrick: (function () {
        NextLookBrick.extends(PocketCode.BaseBrick, false);
        function NextLookBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.NextLookBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_next_look'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return NextLookBrick;
    })(),

    PreviousLookBrick: (function () {
        PreviousLookBrick.extends(PocketCode.BaseBrick, false);
        function PreviousLookBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.PreviousLookBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_previous_look'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return PreviousLookBrick;
    })(),

    SetSizeBrick: (function () {
        SetSizeBrick.extends(PocketCode.BaseBrick, false);
        function SetSizeBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetSizeBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_size_to'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'SetSizeBrick' + PocketCode.SetSizeBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'ev3_tone_percent' //Prozentzeichen
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetSizeBrick;
    })(),

    ChangeSizeBrick: (function () {
        ChangeSizeBrick.extends(PocketCode.BaseBrick, false);
        function ChangeSizeBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ChangeSizeBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_size_by'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ChangeSizeBrick' + PocketCode.ChangeSizeBrick.content[1].id,
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ChangeSizeBrick;
    })(),

    HideBrick: (function () {
        HideBrick.extends(PocketCode.BaseBrick, false);
        function HideBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.HideBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_hide'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return HideBrick;
    })(),

    ShowBrick: (function () {
        ShowBrick.extends(PocketCode.BaseBrick, false);
        function ShowBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ShowBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_show'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ShowBrick;
    })(),

    AskBrick: (function () {
        AskBrick.extends(PocketCode.BaseBrick, false);

        function AskBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.AskBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_ask_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'AskBrick' + PocketCode.AskBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'text',
                        i18n: 'brick_ask_and_save_entered_value'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'AskBrick' + PocketCode.AskBrick.content[5].id,
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return AskBrick;
    })(),

    SayBrick: (function () {
        SayBrick.extends(PocketCode.BaseBrick, false);
        function SayBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SayBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_say_bubble'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'SayBrick' + PocketCode.SayBrick.content[1].id,
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SayBrick;
    })(),

    SayForBrick: (function () {
        SayForBrick.extends(PocketCode.BaseBrick, false);
        function SayForBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SayForBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_say_bubble'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'SayForBrick' + PocketCode.SayForBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'text',
                        i18n: 'brick_think_say_for_text'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'SayForBrick' + PocketCode.SayForBrick.content[4].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'nxt_second_s'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SayForBrick;
    })(),

    ThinkBrick: (function () {
        ThinkBrick.extends(PocketCode.BaseBrick, false);
        function ThinkBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ThinkBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_think_bubble'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ThinkBrick' + PocketCode.ThinkBrick.content[1].id,
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ThinkBrick;
    })(),

    ThinkForBrick: (function () {
        ThinkForBrick.extends(PocketCode.BaseBrick, false);
        function ThinkForBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ThinkForBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_think_bubble'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ThinkForBrick' + PocketCode.ThinkForBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'text',
                        i18n: 'brick_think_say_for_text'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ThinkForBrick' + PocketCode.ThinkForBrick.content[4].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'nxt_second_s'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ThinkForBrick;
    })(),

    SetGraphicEffectBrick: (function () {
        SetGraphicEffectBrick.extends(PocketCode.BaseBrick, false);

        function SetGraphicEffectBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetGraphicEffectBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {};

            if(model._effect === "brightness"){
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_set_brightness_to'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            //name: 'SetBrightnessBrick' + PocketCode.SetBrightnessBrick.content[1].id,
                            value: '' //range 0 - 100
                        },
                        {
                            type: 'text',
                            i18n: 'ev3_tone_percent' // Prozentzeichen
                        }
                    ]
                }

            }
            if(model._effect === "transparency"){
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_set_transparency'
                        },
                        {
                            type: 'lf' //line feed
                        },
                        {
                            type: 'text',
                            i18n: 'to_label'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            //name: 'SetTransparencyBrick' + PocketCode.SetTransparencyBrick.content[3].id,
                            value: '' //range 0 - 100
                        },
                        {
                            type: 'text',
                            i18n: 'ev3_tone_percent' // Prozentzeichen
                        }
                    ]
                }

            }
            if(model._effect === "color"){
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_set_color_to'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            //name: 'SetColorEffectBrick' + PocketCode.SetColorEffectBrick.content[1].id,
                            value: ''
                        }
                    ]
                }
            }

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return SetGraphicEffectBrick;
    })(),

    ChangeGraphicEffectBrick: (function () {
        ChangeGraphicEffectBrick.extends(PocketCode.BaseBrick, false);

        function ChangeGraphicEffectBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ChangeGraphicEffectBrick)) {
                throw new Error("Invalid argument Model");
            };

            var content = {};

            if(model._effect === "brightness"){
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_change_brightness_by'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            //name: 'ChangeBrightnessBrick' + PocketCode.ChangeBrightnessBrick.content[1].id,
                            value: ''
                        }
                    ]
                };
            }
            if(model._effect === "transparency"){
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_change_ghost_effect_by'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            //name: 'ChangeTransparencyBrick' + PocketCode.ChangeTransparencyBrick.content[1].id,
                            value: '' //range 0 - 100 ??
                        }
                    ]
                }

            }
            if(model._effect === "color"){
                content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_change_color_by'
                        },
                        {
                            type: 'formula',
                            id: SmartJs.getNewId(),
                            //name: 'ChangeColorEffectBrick' + PocketCode.ChangeColorEffectBrick.content[1].id,
                            value: '' //range 0-255?
                        }
                    ]
                }
            }

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return ChangeGraphicEffectBrick;
    })(),

    ClearGraphicEffectBrick: (function () {
        ClearGraphicEffectBrick.extends(PocketCode.BaseBrick, false);
        function ClearGraphicEffectBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ClearGraphicEffectBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_clear_graphic_effect'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ClearGraphicEffectBrick;
    })(),

    SetBackgroundBrick: (function () {
        SetBackgroundBrick.extends(PocketCode.BaseBrick, false);

        function SetBackgroundBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetBackgroundBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_background'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        //name: 'SetBackgroundBrick' + PocketCode.SetBackgroundBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetBackgroundBrick;
    })(),

    SetBackgroundAndWaitBrick: (function () {
        SetBackgroundAndWaitBrick.extends(PocketCode.BaseBrick, false);

        function SetBackgroundAndWaitBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetBackgroundAndWaitBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_background'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        //name: 'SetBackgroundAndWaitBrick' + PocketCode.SetBackgroundAndWaitBrick.content[2].id,
                        value: ''
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'brick_and_wait'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetBackgroundAndWaitBrick;
    })(),

    CameraBrick: (function () {
        CameraBrick.extends(PocketCode.BaseBrick, false);

        function CameraBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.CameraBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_video'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        //name: 'CameraBrick' + PocketCode.CameraBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return CameraBrick;
    })(),

    SelectCameraBrick: (function () {
        SelectCameraBrick.extends(PocketCode.BaseBrick, false);

        function SelectCameraBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SelectCameraBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_choose_camera'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        //name: 'SelectCameraBrick' + PocketCode.SelectCameraBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SelectCameraBrick;
    })(),

    FlashBrick: (function () {
        FlashBrick.extends(PocketCode.BaseBrick, false);

        function FlashBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.FlashBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_flash'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        //name: 'FlashBrick' + PocketCode.FlashBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.LOOK, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return FlashBrick;
    })(),

});
