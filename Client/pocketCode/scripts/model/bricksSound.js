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
                    try {
                        this._sprite.startSound(this._soundId);
                    }
                    catch (e) { }   //silent catch if not supported
                    this._return(id);
                }
                else {  //and wait
                    var po = this._pendingOps[id];
                    if (!po)  //stopped
                        return;

                    try {
                        var instanceId = this._sprite.startSound(this._soundId, this._return.bind(this, id));
                    }
                    catch (e) {
                        this._return(id);
                        return;
                    }
                    po.soundInstanceId = instanceId;
                }
            },
            stop: function () {
                var po,
                    pos = this._pendingOps;
                for (var id in pos) {
                    po = pos[id];
                    if (po.soundInstanceId)
                        this._sprite.stopSound(po.soundInstanceId);
                }
                PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
            },
        });

        return PlaySoundBrick;
    })(),

    StopAllSoundsBrick: (function () {
        StopAllSoundsBrick.extends(PocketCode.Model.BaseBrick, false);

        function StopAllSoundsBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
        }

        StopAllSoundsBrick.prototype.merge({
            _execute: function () {
                this._sprite.stopAllSounds();
                this._return();
            },
        });

        return StopAllSoundsBrick;
    })(),

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

        this._text = new PocketCode.Formula(device, sprite, propObject.text);
        if (this._text.isStatic) {  //sound will not change at runtime and can be cached using the soundManager
            var text = this._text.calculate().toString().replace(/\n,\r/g, '').trim();
            if (text == '')
                return;

            //caching
            this._soundId = SmartJs.getNewId();
            var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
            this._sprite.loadSound(request.url, this._soundId, 'mp3');
        }
    }

    //formula accessors
    Object.defineProperties(SpeakBrick.prototype, {
        textFormula: {
            get: function () {
                return this._text;  //TODO: onChange Event needed for preloading sounds
            },
        },
    });

    SpeakBrick.prototype.merge({
        _onLoadHandler: function (id, instanceId) {
            var po = this._pendingOps[id];
            if (!po)  //stopped
                return;
            po.soundInstanceId = instanceId;
        },
        _execute: function (id, scope) {
            if (!this._soundId) {  //can be null
                this._return(id);
                return;
            }
            var po = this._pendingOps[id];
            if (!po)  //stopped
                return;

            if (!this._wait) {
                if (this._soundId) {
                    try {
                        this._sprite.startSound(this._soundId);
                    }
                    catch (e) { }   //silent catch if not supported
                }
                else {
                    var text = this._text.calculate(scope).toString().replace(/\n,\r/g, '').trim();
                    if (text == '') {
                        this._return(id);
                        return;
                    }

                    //we use a request object here to generate an url
                    var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
                    try {
                        this._sprite.startSoundFromUrl(request.url);
                    }
                    catch (e) { }   //silent catch if not supported
                }
                this._return(id);
            }
            else {  //and wait
                var instanceId;
                if (this._soundId) {
                    try {
                        instanceId = this._sprite.startSound(this._soundId, this._return.bind(this, id));
                        po.soundInstanceId = instanceId;
                    }
                    catch (e) {
                        this._return(id);
                        return;
                    }
                }
                else {
                    var text = this._text.calculate(scope).toString().replace(/\n,\r/g, '').trim();
                    if (text == '') {
                        this._return(id);
                        return;
                    }

                    //we use a request object here to generate an url
                    var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
                    try {
                        this._sprite.startSoundFromUrl(request.url, this._onLoadHandler.bind(this, id), this._return.bind(this, id));
                    }
                    catch (e) {
                        this._return(id);
                        return;
                    }
                }
            }
        },
    });

    return SpeakBrick;
})();
