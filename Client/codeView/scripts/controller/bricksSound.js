'use strict';

PocketCode.merge({

    PlaySoundBrick: (function () {
        PlaySoundBrick.extends(PocketCode.BaseBrick, false);

        function PlaySoundBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.PlaySoundBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_play_sound'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return PlaySoundBrick;
    })(),

    PlaySoundAndWaitBrick: (function () {
        PlaySoundAndWaitBrick.extends(PocketCode.BaseBrick, false);

        function PlaySoundAndWaitBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.PlaySoundAndWaitBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_play_sound_and_wait'
                    },
                    {
                        type: 'lf' //line feed
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return PlaySoundAndWaitBrick;
    })(),

    StopAllSoundsBrick: (function () {
        StopAllSoundsBrick.extends(PocketCode.BaseBrick, false);
        function StopAllSoundsBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.StopAllSoundsBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_stop_all_sounds'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return StopAllSoundsBrick;
    })(),

    SetVolumeBrick: (function () {
        SetVolumeBrick.extends(PocketCode.BaseBrick, false);
        function SetVolumeBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SetVolumeBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_volume_to'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SetVolumeBrick;
    })(),

    ChangeVolumeBrick: (function () {
        ChangeVolumeBrick.extends(PocketCode.BaseBrick, false);
        function ChangeVolumeBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.ChangeVolumeBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_volume_by'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return ChangeVolumeBrick;
    })(),

    SpeakBrick: (function () {
        SpeakBrick.extends(PocketCode.BaseBrick, false);
        function SpeakBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SpeakBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_speak'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SpeakBrick;
    })(),

    SpeakAndWaitBrick: (function () {
        SpeakAndWaitBrick.extends(PocketCode.BaseBrick, false);
        function SpeakAndWaitBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.SpeakAndWaitBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_speak'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
                    },
                    {
                        type: 'text',
                        i18n: 'brick_speak_and_wait'
                    },
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SpeakAndWaitBrick;
    })(),

});