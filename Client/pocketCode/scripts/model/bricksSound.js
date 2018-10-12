/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
/// <reference path="../components/proxy.js" />
'use strict';

PocketCode.Model.merge({

    PlaySoundBrick: (function () {
        PlaySoundBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function PlaySoundBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._soundId = propObject.resourceId;
            this._wait = propObject.wait;
        }

        PlaySoundBrick.prototype.merge({
            _execute: function (id, scope) {
                if (!this._soundId) {  //can be null
                    this._return(id);
                    return;
                }

                if (!this._wait) {
                    this._sprite.startSound(this._soundId);
                    this._return(id);
                }
                else {  //and wait
                    var po = this._pendingOps[id];
                    if (!po)  //stopped
                        return;

                    var success = this._sprite.startSound(this._soundId, this._onStartPlaying.bind(this, id), this._return.bind(this, id));

                    if (!success)
                        this._return(id);
                }
            },
            _onStartPlaying: function (id, instanceId) {
                var po = this._pendingOps[id];
                if (!po)  //stopped
                    return;
                po.soundInstanceId = instanceId;
            },
            //pause:function(){},   //handled in sprite: player.pauseAllSounds() & player.resumeAllSounds()
            //resume:function(){},
            stop: function () {//stopEventType) {
                var po,
                    pos = this._pendingOps,
                    instances = [];
                for (var id in pos) {
                    po = pos[id];
                    if (/*stopEventType && */ po.soundInstanceId)
                        instances.push(po.soundInstanceId);
                }
                PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
                //^^ stop bricks first so _return() called by stopSound() will not start next brick
                for (var i = 0, l = instances.length; i < l;i++)
                    this._sprite.stopSound(instances[i]);
            },
        });

        return PlaySoundBrick;
    })(),

    /*
    included in control/stopBrick - refactoring of brick factory MISSING (TODO)

    StopAllSoundsBrick: (function () {
        StopAllSoundsBrick.extends(PocketCode.Model.BaseBrick, false);

        function StopAllSoundsBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
        }

        StopAllSoundsBrick.prototype.merge({
            _execute: function () {
                this._scene.stopAllSounds();
                this._return();
            },
            dispose: function () {
                this._scene = undefined;
                PocketCode.Model.BaseBrick.prototype.dispose.call(this);
            }
        });

        return StopAllSoundsBrick;
    })(),
    */

    SetVolumeBrick: (function () {
        SetVolumeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetVolumeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        //formula accessors
        Object.defineProperties(SetVolumeBrick.prototype, {
            volumeFormula: {
                get: function () {
                    return this._percentage;
                },
            },
        });

        SetVolumeBrick.prototype.merge({
            _execute: function (scope) {
                var val = this._percentage.calculate(scope);
                if (!isNaN(val))
                    this._sprite.volume = val;
                this._return();
            },
        });

        return SetVolumeBrick;
    })(),

    ChangeVolumeBrick: (function () {
        ChangeVolumeBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeVolumeBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        //formula accessors
        Object.defineProperties(ChangeVolumeBrick.prototype, {
            volumeFormula: {
                get: function () {
                    return this._value;
                },
            },
        });

        ChangeVolumeBrick.prototype.merge({
            _execute: function (scope) {
                var val = this._value.calculate(scope);
                if (!isNaN(val))
                    this._sprite.volume += val;
                this._return();
            },
        });

        return ChangeVolumeBrick;
    })(),
});

PocketCode.Model.SpeakBrick = (function () {
    SpeakBrick.extends(PocketCode.Model.PlaySoundBrick, false);

    function SpeakBrick(device, sprite, propObject) {
        PocketCode.Model.PlaySoundBrick.call(this, device, sprite, propObject);

        this._soundId = undefined;
        this._text = new PocketCode.Formula(device, sprite, propObject.text);

        if (this._text.isStatic) {  //sound will not change at runtime and can be cached using the soundManager
            var text = this._text.calculate().toString().replace(/\n,\r/g, '').trim();
            if (text == '')
                return;

            //caching
            var newId = SmartJs.getNewId();
            var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
            if (this._sprite.loadSoundFile(newId, request.url, 'mp3'))    //sound object created successfully
                this._soundId = newId;
        }
    }

    //formula accessors
    Object.defineProperties(SpeakBrick.prototype, {
        textFormula: {
            get: function () {
                return this._text;  //TODO: onChange event needed for preloading sounds
            },
        },
    });

    SpeakBrick.prototype.merge({
        _execute: function (id, scope) {
            if (!this._wait) {
                if (this._soundId) {    //cached
                    this._sprite.startSound(this._soundId);
                }
                else {
                    var text = this._text.calculate(scope).toString().replace(/\n,\r/g, '').trim();
                    if (text == '') {
                        this._return(id);
                        return;
                    }

                    //we use a request object here to generate an url
                    var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
                    this._sprite.loadSoundFile(SmartJs.getNewId(), request.url, 'mp3', true);
                }
                this._return(id);
            }
            else {  //and wait
                var po = this._pendingOps[id],
                    success;
                if (!po)  //stopped
                    return;

                if (this._soundId) {
                    success = this._sprite.startSound(this._soundId, this._onStartPlaying.bind(this, id), this._return.bind(this, id));
                }
                else {
                    var text = this._text.calculate(scope).toString().replace(/\n,\r/g, '').trim();
                    if (text == '') {
                        this._return(id);
                        return;
                    }

                    //we use a request object here to generate an url
                    var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
                    success = this._sprite.loadSoundFile(SmartJs.getNewId(), request.url, 'mp3', true, this._onStartPlaying.bind(this, id), this._return.bind(this, id));
                }
                if (!success)
                    this._return(id);
            }
        },
    });

    return SpeakBrick;
})();
