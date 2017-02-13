/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="https://code.createjs.com/createjs-2014.12.12.combined.js" />
'use strict';


PocketCode.SoundManager = (function () {

    function SoundManager() {

        this._loading = false;  //loading in progress
        this._totalSize = 0;
        this._loadedSize = 0;
        this._registeredFiles = []; //files to load

        this._id = SmartJs.getNewId() + '_';
        this._maxInstancesOfSameSound = 20;
        this._supported = createjs.Sound.initializeDefaultPlugins();

        this._volume = 0.7;
        this._muted = false;
        createjs.Sound.volume = this._volume;   //initial
        this._muted = createjs.Sound.muted;

        this._activeSounds = {};    //an array of sound instances per scene id

        this._onLoadingProgress = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);
        //this._onStartPlayingInstance = new SmartJs.Event.Event(this);       //currently private only
        //this._onFinishedPlayingInstance = new SmartJs.Event.Event(this);    //currently private only
        //this._onFailedPlayingInstance = new SmartJs.Event.Event(this);      //currently private only
        this._onFinishedPlaying = new SmartJs.Event.Event(this);

        //bind on soundJs
        this._fileLoadProxy = createjs.proxy(this._fileLoadHandler, this);
        createjs.Sound.addEventListener('fileload', this._fileLoadProxy);

        this._fileErrorProxy = createjs.proxy(this._fileLoadingErrorHandler, this);
        createjs.Sound.addEventListener('fileerror', this._fileErrorProxy);
    }

    //properties
    Object.defineProperties(SoundManager.prototype, {
        supported: {
            get: function () {
                return this._supported;
            },
        },
        volume: {
            get: function () {
                return this._volume * 100;
            },
            set: function (value) {
                if (typeof value !== 'number')
                    throw new Error('invalid argument: volume expects argument type: number');

                if (value < 0)
                    value = 0;
                else if (value > 100)
                    value = 100;

                value = value / 100;
                if (this._volume === value)
                    return;

                this._volume = value;
                var sounds;
                for (var id in this._activeSounds) {
                    sounds = this._activeSounds[id];
                    for (var i = 0, l = sounds.length; i < l; i++)
                        sounds[i].volume = value;
                }
            }
        },
        muted: {
            get: function () {
                return this._muted;
            },
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid argument: muted expects argument type: boolean');
                if (this._muted === value)
                    return;

                this._muted = value;
                var sounds;
                for (var id in this._activeSounds) {
                    sounds = this._activeSounds[id];
                    for (var i = 0, l = sounds.length; i < l; i++)
                        sounds[i].muted = value;
                }
            },
        },
    });

    //events
    Object.defineProperties(SoundManager.prototype, {
        onLoadingProgress: {
            get: function () {
                return this._onLoadingProgress;
            },
        },
        onLoad: {
            get: function () {
                return this._onLoad;
            },
        },
        onLoadingError: {
            get: function () {
                return this._onLoadingError;
            },
        },
        onFinishedPlaying: {    //executed if isPlaying = false
            get: function () {
                return this._onFinishedPlaying;
            },
        },
    });

    //methods
    SoundManager.prototype.merge({
        _fileLoadHandler: function (e) {
            if (!e.data || e.data.soundManagerId !== this._id)
                return;

            var idx,
                file,
                files = this._filesToLoad || [];

            for (var i = 0, l = files.length; i < l; i++) {
                file = files[i];
                if (file.id === e.id) {
                    idx = i;
                    break;
                }
            }
            if (idx != undefined) {
                if (!this._loading) //aborted
                    return;
                this._registeredFiles.push({ id: e.id, src: e.src });
                this._loadedSize += file.size;
                this._onLoadingProgress.dispatchEvent({ progress: Math.round(this._loadedSize / this._totalSize * 100), file: file });

                if (idx + 1 == this._filesToLoad.length) {
                    this._loading = false;
                    //this._filesToLoad = [];
                    this._onLoad.dispatchEvent();
                }
                else {
                    var loadNextFile = this._requestFile.bind(this, idx + 1);
                    window.setTimeout(loadNextFile, 20);    //make sure the ui gets rerendered
                }
            }
            else   //single file loaded
                this._onLoad.dispatchEvent();
            if (e.data && e.data.playOnLoad)
                this.startSound(e.id.slice(this._id.length), e.data.finishedCallback, e.data.loadedCallback);
        },
        _fileLoadingErrorHandler: function (e) {
            if (!e.data || e.data.soundManagerId !== this._id)
                return;

            var idx,
                file,
                files = this._filesToLoad || [];

            for (var i = 0, l = files.length; i < l; i++) {
                file = files[i];
                if (file.id === e.id) {
                    idx = i;
                    break;
                }
            }
            if (idx !== undefined) {
                if (!this._loading) //aborted
                    return;

                this._onLoadingError.dispatchEvent({ file: file });
                //^^ single files may not be supported- we continue loading anyway but do not add them to our registered files
                this._loadedSize += file.size;
                this._onLoadingProgress.dispatchEvent({ progress: Math.round(this._loadedSize / this._totalSize * 100), file: file });

                if (idx + 1 == this._filesToLoad.length) {
                    this._loading = false;
                    //this._filesToLoad = [];
                    this._onLoad.dispatchEvent();
                }
                else {
                    var loadNextFile = this._requestFile.bind(this, idx + 1);
                    window.setTimeout(loadNextFile, 20);    //make sure the ui gets rerendered
                }
            }
        },
        _removeAllSounds: function () {
            if (this.supported)
                createjs.Sound.removeSounds(this._registeredFiles);
            this._registeredFiles = [];
        },
        _requestFile: function (fileIndex) {
            var sound = this._filesToLoad[fileIndex];
            var success = false;
            try {
                success = createjs.Sound.registerSound(sound.src, sound.id, sound.data, '');
            }
            catch (e) {
                //even if an url is provided there are sounds with missing file extension
                //that will cause an exception in soundJs
            }
            if (!success)
                this._fileLoadingErrorHandler(sound);   //false is returned if no loaded can be initialized (e.g. *.wav in IE) -> handle as error
        },
        _createSoundObject: function (url, id, size, playOnLoad, finishedCallback, loadedCallback) {
            url = url.split('/');
            var idx = url.length - 1;
            url[idx] = (url[idx]).replace(/([^.?]+)(.*)/, function (match, p1, p2) {
                return encodeURIComponent(p1) + p2;
            });  // encodeURIComponent(url[idx]);
            return {
                id: this._id + id, src: url.join('/'),
                data: {
                    channels: this._maxInstancesOfSameSound,
                    playOnLoad: playOnLoad,
                    finishedCallback: finishedCallback,
                    loadedCallback: loadedCallback,
                    soundManagerId: this._id
                }, size: size
            };
        },
        loadSound: function (url, id, type, playOnLoad, finishedCallback, loadedCallback) {
            //added to cache static tts sound files- detected by parser
            if (!id || !url) {
                throw new Error('load sound: missing id or url');
            }
            if (!this.supported) {
                this._onLoad.dispatchEvent();   //simulate loading
                return false;
            }

            var sound = this._createSoundObject(url, id, undefined, playOnLoad, finishedCallback, loadedCallback);
            var success;
            if (type) {
                var src = {};
                src[type] = sound.src;
                success = createjs.Sound.registerSound(src, sound.id, sound.data, '');
            }
            else
                success = createjs.Sound.registerSound(sound.src, sound.id, sound.data, '');
            if (!success)
                return false;

            this._registeredFiles.push(sound);
            return true;
        },
        loadSounds: function (resourceBaseUrl, files) {
            if (this._loading)
                throw new Error('loading in progress: you have to wait');
            if (!(files instanceof Array))
                throw new Error('sounds expects type Array');

            var file;
            this._filesToLoad = [];
            this._totalSize = 0;
            for (var i = 0, l = files.length; i < l; i++) {
                file = files[i];
                if (!file.url || !file.id || !file.size || typeof file.size !== 'number')
                    throw new Error('Sounddata is missing id, url or size');
                this._filesToLoad.push(this._createSoundObject(resourceBaseUrl + file.url, file.id, file.size));
                this._totalSize += file.size;
            }

            this._removeAllSounds();
            this._loadedSize = 0;
            if (this._filesToLoad.length > 0) {
                this._loading = true;
                this._onLoadingProgress.dispatchEvent({ progress: 0 });
                if (!this.supported) {  //simulate loading even if sound is not supported
                    for (var i = 0, l = this._filesToLoad.length; i < l; i++) {
                        this._onLoadingError.dispatchEvent({ file: file });
                        this._loadedSize += file.size;
                        this._onLoadingProgress.dispatchEvent({ progress: Math.round(this._loadedSize / this._totalSize * 100), file: file });
                    }
                    this._onLoad.dispatchEvent();
                    this._loading = false;
                    return;
                }
                else {
                    this._requestFile(0);
                }
            }
            else
                this._onLoad.dispatchEvent();
        },
        abortLoading: function () {
            this._loading = false;
        },
        startSound: function (sceneId, id, loadedCallback, finishedCallback) {
            if (!this.supported) {
                if (finishedCallback)
                    finishedCallback(false);
                return false;
            }

            try {
                var soundInstance = createjs.Sound.createInstance(this._id + id);
            }
            catch (e) {
                if (finishedCallback)
                    finishedCallback(false);
                return false;
            }
            soundInstance.addEventListener('succeeded', createjs.proxy(function (e, sceneId, soundInstance) {
                this._activeSounds[sceneId] || (this._activeSounds[sceneId] = []);
                this._activeSounds[sceneId].push(soundInstance);
                //this._onStartPlayingInstance.dispatchEvent({ instance: soundInstance });
            }, this, sceneId, soundInstance));

            soundInstance.addEventListener('complete', createjs.proxy(function (e, sceneId, soundInstance) {
                this._activeSounds[sceneId] || (this._activeSounds[sceneId] = []);
                var active = this._activeSounds[sceneId];
                active.remove(soundInstance);
                //this._onFinishedPlayingInstance.dispatchEvent({ instance: soundInstance });
                if (active.length == 0)
                    this._onFinishedPlaying.dispatchEvent({ instance: soundInstance });

                if (finishedCallback)
                    finishedCallback(true);
            }, this, sceneId, soundInstance));

            soundInstance.addEventListener('failed', createjs.proxy(function (e, sceneId, soundInstance) {
                this._activeSounds[sceneId] || (this._activeSounds[sceneId] = []);
                var active = this._activeSounds[sceneId];
                active.remove(soundInstance);
                //this._onFailedPlayingInstance.dispatchEvent({ instance: soundInstance });
                if (active.length == 0)
                    this._onFinishedPlaying.dispatchEvent({ instance: soundInstance });

                if (finishedCallback)
                    finishedCallback(false);
            }, this, sceneId, soundInstance));

            soundInstance.volume = this._volume;
            soundInstance.muted = this._muted;
            soundInstance = soundInstance.play();
            if (soundInstance.playState === null || soundInstance.playState === 'playFailed')
                return false;
            if (loadedCallback)
                loadedCallback(soundInstance.uniqueId);
            return soundInstance.uniqueId;
        },
        startSoundFromUrl: function (sceneId, url, loadedCallback, finishedCallback) {
            if (!this.supported) {
                if (finishedCallback)
                    finishedCallback(false);
                return false;
            }

            var soundId = SmartJs.getNewId();
            var success = this.loadSound(url, soundId, 'mp3', true, finishedCallback, loadedCallback);
            if (success)
                return true;
            //else
            if (finishedCallback)
                finishedCallback(false);
            return false;
        },
        isPlaying: function (sceneId) {
            if (!sceneId)
                throw new Error('missing argument: scene id');
            var active = this._activeSounds[sceneId];
            if (active && active.length > 0)
                return true;
            return false;
        },
        pauseSound: function (sceneId, id) {
            var active = this._activeSounds[sceneId];
            if (!active)
                return;

            for (var i = 0, l = active.length; i < l; i++) {
                if (active[i].uniqueId === id) {
                    active[i].paused = true;

                    //fixes rounding errors in the framework that occurs when sounds are paused before 1ms
                    if (active[i].position < 1) {
                        active[i].position = 0;
                    }
                    return;
                }
            }
        },
        pauseSounds: function (/*optional*/ sceneId) {
            var active = [];
            if (sceneId) {
                active = this._activeSounds[sceneId];
                if (!active)
                    return false;
            }
            else {
                for (var id in this._activeSounds) {
                    active = active.concat(this._activeSounds[id]);
                }
            }

            for (var i = 0, l = active.length; i < l; i++) {
                if (active[i].paused === false) {
                    active[i].paused = true;

                    //fixes rounding errors in the framework that occurs when sounds are paused before 1ms
                    if (active[i].position < 1) {
                        active[i].position = 0;
                    }
                }
            }
        },
        resumeSound: function (sceneId, id) {
            var active = this._activeSounds[sceneId];
            if (!active)
                return;

            for (var i = 0, l = active.length; i < l; i++) {
                if (active[i].uniqueId === id) {
                    active[i].paused = false;
                    return;
                }
            }
        },
        resumeSounds: function (/*optional*/ sceneId) {
            var active = [];
            if (sceneId) {
                active = this._activeSounds[sceneId];
                if (!active)
                    return false;
            }
            else {
                for (var id in this._activeSounds) {
                    active = active.concat(this._activeSounds[id]);
                }
            }

            for (var i = 0, l = active.length; i < l; i++) {
                if (active[i].paused === true) {
                    active[i].paused = false;
                }
            }
        },
        stopSound: function (sceneId, id) {
            var active = this._activeSounds[sceneId];
            if (!active)
                return;

            for (var i = 0, l = active.length; i < l; i++) {
                if (active[i].uniqueId === id) {
                    active[i].stop();
                    active.remove(active[i]);
                    return;
                }
            }
        },
        stopAllSounds: function (/*optional*/ sceneId) {
            var active = [];
            if (sceneId) {
                active = this._activeSounds[sceneId];
                if (!active) //e.g. gameEngine stopped all sounds before scenes try to stop them
                    return false;
            }
            else {
                for (var id in this._activeSounds) {
                    active = active.concat(this._activeSounds[id]);
                }
            }


            for (var i = 0, l = active.length; i < l; i++)
                active[i].stop();
            this._activeSounds = {};
            return true;
        },
        dispose: function () {
            this.abortLoading();
            createjs.Sound.removeEventListener('fileload', this._fileLoadProxy);
            createjs.Sound.removeEventListener('fileerror', this._fileErrorProxy);
            this.stopAllSounds();
            this._removeAllSounds();
        },
    });

    return SoundManager;
})();
