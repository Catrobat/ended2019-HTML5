/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
/// <reference path="../components/soundManager.js" />
/// <reference path="../components/proxy.js" />
'use strict';

PocketCode.Bricks.merge({

    PlaySoundBrick: (function () {
        PlaySoundBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function PlaySoundBrick(device, sprite, soundManager, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._soundManager = soundManager;
            this._soundId = propObject.soundId;
        }

        PlaySoundBrick.prototype._execute = function () {
            this._soundManager.startSound(this._soundId);
            this._return();
        };

        return PlaySoundBrick;
    })(),


    StopAllSoundsBrick: (function () {
        StopAllSoundsBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function StopAllSoundsBrick(device, sprite, soundManager) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._soundManager = soundManager;
        }

        StopAllSoundsBrick.prototype._execute = function () {
            this._soundManager.stopAllSounds();
            this._return();
        };

        return StopAllSoundsBrick;
    })(),


    SetVolumeBrick: (function () {
        SetVolumeBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SetVolumeBrick(device, sprite, soundManager, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._soundManager = soundManager;
            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetVolumeBrick.prototype._execute = function () {
            this._soundManager.volume = this._percentage.calculate();
            this._return();
        };

        return SetVolumeBrick;
    })(),


    ChangeVolumeBrick: (function () {
        ChangeVolumeBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ChangeVolumeBrick(device, sprite, soundManager, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._soundManager = soundManager;
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeVolumeBrick.prototype._execute = function () {
            this._soundManager.ChangeVolume(this._value.calculate());
            this._return();
        };

        return ChangeVolumeBrick;
    })(),


    SpeakBrick: (function () {
        SpeakBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SpeakBrick(device, sprite, soundManager, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._soundManager = soundManager;
            this._text = new PocketCode.Formula(device, sprite, propObject.text);

            if (this._text.isStatic) {  //sound will not change at runtime and can be cached in soundManager
                this._soundId = SmartJs.getNewId();
                this._text = this._text.calculate();
                //caching
                var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { string: this._text });
                this._soundManager.loadSoundFile(this._soundId, request.url);
            }
        }

        SpeakBrick.prototype._execute = function () {
            if (this._soundId) {
                this._soundManager.startSound(this._soundId);
            }
            else {
                var text = this._text.calculate();
                //we use a request object here to generate an url
                var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { string: text });
                this._soundManager.startSoundFromUrl(request.url);
            }
            this._return();
        };

        return SpeakBrick;
    })(),

});
