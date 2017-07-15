/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="sprite.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Model.merge({

    PenDownBrick: (function () {
        PenDownBrick.extends(PocketCode.BaseBrick, false);
        function PenDownBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.PenDownBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_pen_down'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.PEN, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return PenDownBrick;
    })(),

    PenUpBrick: (function () {
        PenUpBrick.extends(PocketCode.BaseBrick, false);
        function PenUpBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.PenUpBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_pen_up'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.PEN, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return PenUpBrick;
    })(),

    SetPenSizeBrick: (function () {
        SetPenSizeBrick.extends(PocketCode.BaseBrick, false);
        function SetPenSizeBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetPenSizeBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_pen_size'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetPenSizeBrick' + PocketCode.SetPenSizeBrick.content[1].id,
                        value: ''
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.PEN, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetPenSizeBrick;
    })(),

    SetPenColorBrick: (function () {
        SetPenColorBrick.extends(PocketCode.BaseBrick, false);
        function SetPenColorBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetPenColorBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_pen_color'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'color_red'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetPenColorBrick' + PocketCode.SetPenColorBrick.content[3].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'color_green'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetPenColorBrick' + PocketCode.SetPenColorBrick.content[5].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'color_blue'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetPenColorBrick' + PocketCode.SetPenColorBrick.content[7].id,
                        value: ''
                    },
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.PEN, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetPenColorBrick;
    })(),

    StampBrick: (function () {
        StampBrick.extends(PocketCode.BaseBrick, false);
        function StampBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.StampBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_stamp'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.PEN, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return StampBrick;
    })(),

    ClearBackgroundBrick: (function () {
        ClearBackgroundBrick.extends(PocketCode.BaseBrick, false);
        function ClearBackgroundBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ClearBackgroundBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_wipe_painted_away'
                    }
                ]
            };
            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.PEN, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ClearBackgroundBrick;
    })(),

});
