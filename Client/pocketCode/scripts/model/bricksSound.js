/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Bricks.merge({

    PlaySoundBrick: (function () {
        PlaySoundBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function PlaySoundBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._soundId = propObject.soundId;
        }

        PlaySoundBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return PlaySoundBrick;
    })(),


    StopAllSoundsBrick: (function () {
        StopAllSoundsBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function StopAllSoundsBrick(device, sprite) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

        }

        StopAllSoundsBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return StopAllSoundsBrick;
    })(),


    SetVolumeBrick: (function () {
        SetVolumeBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SetVolumeBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetVolumeBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return SetVolumeBrick;
    })(),


    ChangeVolumeBrick: (function () {
        ChangeVolumeBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function ChangeVolumeBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeVolumeBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return ChangeVolumeBrick;
    })(),


    SpeakBrick: (function () {
        SpeakBrick.extends(PocketCode.Bricks.BaseBrick, false);

        function SpeakBrick(device, sprite, propObject) {
            PocketCode.Bricks.BaseBrick.call(this, device, sprite);

            this._text = new PocketCode.Formula(device, sprite, propObject.text);
        }

        SpeakBrick.prototype._execute = function () {
            //todo implement this
            this._return();
        };

        return SpeakBrick;
    })(),

});
