'use strict';

PocketCode.merge({

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
        function SetPenSizeBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetPenSizeBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_pen_size'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
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
        function SetPenColorBrick(model, commentedOut, formulaRed, formulaGreen, formulaBlue) {
            if (!(model instanceof PocketCode.Model.SetPenColorBrick)) {
                throw new Error("Invalid argument Model");
            }
            var _formulaRed = formulaRed || "";
            var _formulaGreen = formulaGreen || "";
            var _formulaBlue = formulaBlue || "";

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
                        value: _formulaRed
                    },
                    {
                        type: 'text',
                        i18n: 'color_green'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaGreen
                    },
                    {
                        type: 'text',
                        i18n: 'color_blue'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formulaBlue
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
