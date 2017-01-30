/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
/// <reference path="../components/soundManager.js" />
/// <reference path="../components/proxy.js" />
'use strict';

PocketCode.Model.merge({

    PlaySoundBrick: (function () {
        PlaySoundBrick.extends(PocketCode.Model.BaseBrick, false);

        function PlaySoundBrick(device, sprite, sceneId, soundManager, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._sceneId = sceneId;
            this._soundManager = soundManager;
            this._soundId = propObject.resourceId;
        }

        PlaySoundBrick.prototype._execute = function () {
            if (this._soundId)  //can be null
                this._soundManager.startSound(this._sceneId, this._soundId);
            this._return();
        };

        return PlaySoundBrick;
    })(),

    PlaySoundAndWaitBrick: (function () {
        PlaySoundAndWaitBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function PlaySoundAndWaitBrick(device, sprite, sceneId, soundManager, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._sceneId = sceneId;
            this._soundManager = soundManager;
            this._soundId = propObject.resourceId;
        }

        PlaySoundAndWaitBrick.prototype.merge({
            _execute: function (id, scope) {
                if (!this._soundId) {  //can be null
                    this._return(id);
                    return;
                }
                var po = this._pendingOps[id];
                if (!po)  //stopped
                    return;

                var instanceId = this._soundManager.startSound(this._sceneId, this._soundId, this._return.bind(this, id, false));
                if (instanceId === false)
                    this._return(id);
                else
                    po.instanceId = instanceId;
            },
            pause: function () {
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    po = pos[p];
                    if (po.instanceId)
                        this._soundManager.pauseSound(po.instanceId);
                    //po.paused = true;
                }
                PocketCode.Model.ThreadedBrick.prototype.pause.call(this);
            },
            resume: function () {
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    po = pos[p];
                    //po.paused = false;
                    if (po.instanceId)
                        this._soundManager.resumeSound(po.instanceId);
                }
                PocketCode.Model.ThreadedBrick.prototype.resume.call(this);
            },
            stop: function () {
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    po = pos[p];
                    if (po.instanceId)
                        this._soundManager.stopSound(po.instanceId);
                }
                PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
            },
        });

        return PlaySoundAndWaitBrick;
    })(),

    StopAllSoundsBrick: (function () {
        StopAllSoundsBrick.extends(PocketCode.Model.BaseBrick, false);

        function StopAllSoundsBrick(device, sprite, sceneId, soundManager, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._sceneId = sceneId;
            this._soundManager = soundManager;
        }

        StopAllSoundsBrick.prototype._execute = function () {
            this._soundManager.stopAllSounds(this._sceneId);
            this._return();
        };

        return StopAllSoundsBrick;
    })(),

    SetVolumeBrick: (function () {
        SetVolumeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetVolumeBrick(device, sprite, soundManager, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._soundManager = soundManager;
            this._percentage = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetVolumeBrick.prototype._execute = function (scope) {
            var val = this._percentage.calculate(scope);
            if (isNaN(val))
                this._return();
            else {
                this._soundManager.volume = val;
                this._return();
            }
        };

        return SetVolumeBrick;
    })(),

    ChangeVolumeBrick: (function () {
        ChangeVolumeBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeVolumeBrick(device, sprite, soundManager, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._soundManager = soundManager;
            this._value = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeVolumeBrick.prototype._execute = function (scope) {
            var val = this._value.calculate(scope);
            if (isNaN(val))
                this._return(false);
            else {
                this._soundManager.volume += val;   //changeVolume(this._value.calculate(scope));
                this._return();
            }
        };

        return ChangeVolumeBrick;
    })(),

    SpeakBrick: (function () {
        SpeakBrick.extends(PocketCode.Model.BaseBrick, false);

        function SpeakBrick(device, sprite, sceneId, soundManager, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._sceneId = sceneId;
            this._soundManager = soundManager;
            this._text = new PocketCode.Formula(device, sprite, propObject.text);

            if (this._text.isStatic) {  //sound will not change at runtime and can be cached in soundManager
                this._soundId = SmartJs.getNewId();
                var text = this._text.calculate().replace(/\n,\r/g, '');
                if (text == '') {
                    this._soundId = undefined;
                    return;
                }
                //caching
                var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
                this._soundManager.loadSound(request.url, this._soundId, 'mp3');
            }
        }

        SpeakBrick.prototype._execute = function (scope) {
            if (this._soundId) {
                this._soundManager.startSound(this._sceneId, this._soundId);
            }
            else {
                var text = this._text.calculate(scope).replace(/\n,\r/g, '');
                if (text !== '') {
                    //we use a request object here to generate an url
                    var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
                    this._soundManager.startSoundFromUrl(this._sceneId, request.url);
                }
            }
            this._return();
        };

        return SpeakBrick;
    })(),
});

PocketCode.Model.SpeakAndWaitBrick = (function () {
    SpeakAndWaitBrick.extends(PocketCode.Model.PlaySoundAndWaitBrick, false);

    function SpeakAndWaitBrick(device, sprite, sceneId, soundManager, propObject) {
        PocketCode.Model.PlaySoundAndWaitBrick.call(this, device, sprite, sceneId, soundManager, propObject);

        //this._soundManager = soundManager;
        this._text = new PocketCode.Formula(device, sprite, propObject.text);

        if (this._text.isStatic) {  //sound will not change at runtime and can be cached in soundManager
            this._soundId = SmartJs.getNewId();
            var text = this._text.calculate().replace(/\n,\r/g, '');
            if (text == '') {
                this._soundId = undefined;
                return;
            }
            //caching
            var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
            this._soundManager.loadSound(request.url, this._soundId, 'mp3');
        }
    }

    SpeakAndWaitBrick.prototype.merge({
        _onLoadHandler: function (id, instanceId) {
            var po = this._pendingOps[id];
            if (!po)  //stopped
                return;
            po.instanceId = instanceId;
        },
        _execute: function (id, scope) {
            var po = this._pendingOps[id];
            if (!po)  //stopped
                return;

            var instanceId = false;
            if (this._soundId) {
                instanceId = this._soundManager.startSound(this._sceneId, this._soundId, this._return.bind(this, id, false));
                if (instanceId === false)
                    this._return(id);
                else
                    po.instanceId = instanceId;
            }
            else {
                var text = this._text.calculate(scope).replace(/\n,\r/g, '');
                if (text !== '') {
                    //we use a request object here to generate an url
                    var request = new PocketCode.ServiceRequest(PocketCode.Services.TTS, SmartJs.RequestMethod.GET, { text: text });
                    this._soundManager.startSoundFromUrl(this._sceneId, request.url, this._onLoadHandler.bind(this, id), this._return.bind(this, id, false));
                }
            }
        },
        //pause: function () {
        //    this._paused = true;
        //    var po, pos = this._pendingOps;
        //    for (var p in pos) {
        //        po = pos[p];
        //        if (po.instanceId)
        //            this._soundManager.pauseSound(po.instanceId);
        //        //po.paused = true;
        //    }
        //},
        //resume: function () {
        //    this._paused = false;
        //    var po, pos = this._pendingOps;
        //    for (var p in pos) {
        //        po = pos[p];
        //        //po.paused = false;
        //        if (po.instanceId)
        //            this._soundManager.resumeSound(po.instanceId);
        //    }
        //},
        //stop: function () {
        //    this._paused = false;
        //    var po, pos = this._pendingOps;
        //    for (var p in pos) {
        //        po = pos[p];
        //        if (po.instanceId)
        //            this._soundManager.stopSound(po.instanceId);
        //    }
        //    PocketCode.Model.ThreadedBrick.prototype.stop.call(this);
        //},
    });

    return SpeakAndWaitBrick;
})();

