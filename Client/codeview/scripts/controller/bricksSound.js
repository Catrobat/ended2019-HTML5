'use strict';

PocketCode.merge({

    PlaySoundBrick: (function () {
        PlaySoundBrick.extends(PocketCode.BaseBrick, false);

        function PlaySoundBrick(model, commentedOut) {
            if(!(model instanceof PocketCode.Model.PlaySoundBrick)) {
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
                        //name: 'PlaySoundBrick' + PocketCode.PlaySoundBrick.content[2].id,
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
            if(!(model instanceof PocketCode.Model.PlaySoundAndWaitBrick)) {
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
                        //name: 'PlaySoundAndWaitBrick' + PocketCode.PlaySoundAndWaitBrick.content[2].id,
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
            if(!(model instanceof PocketCode.Model.StopAllSoundsBrick)) {
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
        function SetVolumeBrick(model, commentedOut) {
            if(!(model instanceof PocketCode.Model.SetVolumeBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_volume_to'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SetVolumeBrick' + PocketCode.SetVolumeBrick.content[1].id,
                        value: ''
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
        function ChangeVolumeBrick(model, commentedOut) {
            if(!(model instanceof PocketCode.Model.ChangeVolumeBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_volume_by'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'ChangeVolumeBrick' + PocketCode.ChangeVolumeBrick.content[1].id,
                        value: ''
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
        function SpeakBrick(model, commentedOut) {
            if(!(model instanceof PocketCode.Model.SpeakBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_speak'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        name: 'SpeakBrick' + PocketCode.SpeakBrick.content[1].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.SOUND, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return SpeakBrick;
    })(),
});