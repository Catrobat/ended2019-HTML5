/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';


PocketCode.SoundManager = (function () {

    /* Our sounds are played using the soundJs library
    *  This lib works as a singleton, so we use a single sound manager instance in the gameEngine to preload all sounds of a project.
    *  These preloaded sounds are available in each audioPlayer instance (defined per sprite) based on this singleton implementation, 
    *  every sound that is currently played is a soundInstance and managed per sprite (per audioPlayer instance).
    *  For preloading tts (text-to-speech) sound files or even load and play them directly each audioPlayer is derived from soundManager.
    */
    function SoundManager(soundCollectionId) {

        this._loading = false;  //loading in progress
        this._totalSize = 0;
        this._loadedSize = 0;
        this._registeredFiles = []; //files to load

        this._scId = soundCollectionId || SmartJs.getNewId() + '_';
        this._maxInstancesOfSameSound = 20;

        this._onLoadingProgress = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);

        if (!this.supported)
            return;
        //bind on soundJs
        this._fileLoadProxy = createjs.proxy(this._fileLoadHandler, this);
        createjs.Sound.addEventListener('fileload', this._fileLoadProxy);

        this._fileErrorProxy = createjs.proxy(this._fileLoadingErrorHandler, this);
        createjs.Sound.addEventListener('fileerror', this._fileErrorProxy);
    }

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
    });

    //properties
    Object.defineProperties(SoundManager.prototype, {
        supported: {
            value: createjs.Sound.initializeDefaultPlugins(),
        },
        soundCollectionId: {
            get: function () {
                return this._scId;
            },
        },
        muted: {
            //nnotice: this will cause all soundManager instances to mute
            //as mute() is not a brick but a player feature this has no side-effects
            get: function () {
                if (!this.supported)
                    return true;
                return createjs.Sound.muted;
            },
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid argument: muted expects argument type: boolean');

                if (this.supported)
                    createjs.Sound.muted = value;
            },
        },
    });

    //methods
    SoundManager.prototype.merge({
        _fileLoadHandler: function (e) {
            if (!e.data || e.data.soundCollectionId !== this._scId)
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
            if (!this._loading) //aborted
                return;

            if (idx != undefined) {
                this._registeredFiles.push({ id: e.id, src: e.src });
                this._loadedSize += file.size;
                this._onLoadingProgress.dispatchEvent({ progress: Math.round(this._loadedSize / this._totalSize * 100), file: file });

                if (idx + 1 == this._filesToLoad.length) {
                    this._loading = false;
                    this._onLoad.dispatchEvent();
                }
                else {
                    var loadNextFile = this._requestFile.bind(this, idx + 1);
                    setTimeout(loadNextFile, 20);    //make sure the ui gets rerendered
                }
            }
            //else: single file loaded

            this._fileOnLoadHandler(e.id, e.data);
        },
        _fileOnLoadHandler: function (id, data) {
            /* abstract: has to be overridden in audioPlayer to handler playOnLoad */
        },
        _fileLoadingErrorHandler: function (e) {
            if (!e.data || e.data.soundCollectionId !== this._scId)
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
                    this._onLoad.dispatchEvent();
                }
                else {
                    var loadNextFile = this._requestFile.bind(this, idx + 1);
                    window.setTimeout(loadNextFile, 20);    //make sure the ui gets rerendered
                }
            }
        },
        _createSoundObject: function (id, url, size, playOnLoad, onStartCallback, onFinishCallback) {
            url = url.split('/');
            var idx = url.length - 1;
            url[idx] = (url[idx]).replace(/([^.?]+)(.*)/, function (match, p1, p2) {
                return encodeURIComponent(p1) + p2;
            });
            return {
                id: this._scId + id,
                src: url.join('/'),
                data: {
                    channels: this._maxInstancesOfSameSound,
                    playOnLoad: playOnLoad,
                    onStartCallback: onStartCallback,
                    onFinishCallback: onFinishCallback,
                    soundCollectionId: this._scId
                },
                size: size
            };
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
                    throw new Error('sound data: missing id, url or size');
                this._filesToLoad.push(this._createSoundObject(file.id, resourceBaseUrl + file.url, file.size));
                this._totalSize += file.size;
            }

            this._stopAndRemoveAllSounds();
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
        _requestFile: function (fileIndex) {
            var sound = this._filesToLoad[fileIndex];
            var success = false;
            try {
                success = createjs.Sound.registerSound(sound.src, sound.id, sound.data, '');
            }
            catch (e) {
                //silent catch -> success = false
                //even if an url is provided there are sound files with missing file extension
                //these will cause an exception in soundJs
            }
            if (!success)
                this._fileLoadingErrorHandler(sound);
        },
        _stopAndRemoveAllSounds: function () {
            if (this.supported)
                createjs.Sound.removeSounds(this._registeredFiles);   //this will also stop all sounds
            this._registeredFiles = [];
        },
        dispose: function () {
            this._loading = false;  //abort loading
            createjs.Sound.removeEventListener('fileload', this._fileLoadProxy);
            createjs.Sound.removeEventListener('fileerror', this._fileErrorProxy);
            this._stopAndRemoveAllSounds();
        },
    });

    return SoundManager;
})();

PocketCode.AudioPlayer = (function () {
    AudioPlayer.extends(PocketCode.SoundManager, false);

    function AudioPlayer(soundCollectionId) {
        if (!soundCollectionId)
            throw new Error('missing parameter: soundCollectionId');

        //the soundCollectionId is required to support several sound manager instances
        //there is only one per gameEngine. Anyway, we support loading several players in on web-page
        PocketCode.SoundManager.call(this, soundCollectionId);

        this._volume = 1.0;

        this._activeSounds = [];
        this._onFinishedPlaying = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(AudioPlayer.prototype, {
        onFinishedPlaying: {    //executed if isPlaying = false
            get: function () {
                return this._onFinishedPlaying;
            },
        },
    });

    //properties
    Object.defineProperties(AudioPlayer.prototype, {
        isPlaying: {
            get: function () {
                if (this._activeSounds.length > 0)
                    return true;
                return false;
            },
        },
        volume: {
            get: function () {
                return this._volume * 100;
            },
            set: function (value) {
                if (typeof value !== 'number')
                    throw new Error('invalid argument: volume expects argument type: number');

                value = Math.min(100, Math.max(0, value));
                value = value / 100.0;
                if (this._volume === value)
                    return;

                this._volume = value;
                var sound;
                for (var i = 0, l = this._activeSounds.length; i < l; i++) {
                    sound = this._activeSounds[i];
                    sound.volume = value;
                }
            }
        },
    });

    //methods
    AudioPlayer.prototype.merge({
        //start sound returns the instanceId to let the calling brick handle stop
        startSound: function (id, onStartCallback, onFinishCallback) {
            if (!this.supported)
                return false;

            try {
                var soundInstance = createjs.Sound.createInstance(this._scId + id);
            }
            catch (e) {
                return false;
            }

            soundInstance.addEventListener('succeeded', createjs.proxy(function (e, soundInstance, onStartCallback) {
                this._activeSounds.push(soundInstance);
                if (onStartCallback)
                    onStartCallback(soundInstance.uniqueId);
            }, this, soundInstance, onStartCallback));

            soundInstance.addEventListener('complete', createjs.proxy(function (e, soundInstance, onFinishCallback) {
                this._activeSounds.remove(soundInstance);
                if (onFinishCallback)
                    onFinishCallback();
                if (this._activeSounds.length == 0)
                    this._onFinishedPlaying.dispatchEvent();
            }, this, soundInstance, onFinishCallback));

            soundInstance.addEventListener('failed', createjs.proxy(function (e, soundInstance, onFinishCallback) {
                this._activeSounds.remove(soundInstance);
                if (onFinishCallback)
                    onFinishCallback();
                if (this._activeSounds.length == 0)
                    this._onFinishedPlaying.dispatchEvent();
            }, this, soundInstance, onFinishCallback));

            soundInstance.volume = this._volume;
            soundInstance = soundInstance.play();

            if (soundInstance.playState === null || soundInstance.playState === 'playFailed')
                return false;

            return true;
        },
        loadSoundFile: function (id, url, type, playOnLoad, onStartCallback, onFinishCallback) {
            //to cache static tts sound files- detected by parser or play tts response (*.mp3) onLoad
            if (!id || !url)
                throw new Error('load sound: missing id or url');

            if (!this.supported)
                return false;

            var sound = this._createSoundObject(id, url, undefined, playOnLoad, onStartCallback, onFinishCallback);
            var success = false;
            if (type) { //to enable loading files from restful services (without file extension)
                var src = {};
                src[type] = sound.src;
                success = createjs.Sound.registerSound(src, sound.id, sound.data, '');
            }
            else {
                success = createjs.Sound.registerSound(sound.src, sound.id, sound.data, '');
            }

            if (success)
                this._registeredFiles.push(sound);
            return success;
        },
        _fileOnLoadHandler: function (id, data) {
            //called when successfully loaded to enable playOnLoad
            if (data && data.playOnLoad)
                this.startSound(id.slice(this._scId.length), data.onStartCallback, data.onFinishCallback);
        },
        pauseAllSounds: function () {
            var active = this._activeSounds;
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
        resumeAllSounds: function () {
            var active = this._activeSounds;
            for (var i = 0, l = active.length; i < l; i++) {
                active[i].paused = false;
            }
        },
        stopSound: function (instanceId) {
            var active = this._activeSounds;
            for (var i = 0, l = active.length; i < l; i++) {
                if (active[i].uniqueId === instanceId) {
                    active[i].stop();
                    active.remove(active[i]);
                    break;
                }
            }
            if (this._activeSounds.length == 0)
                this._onFinishedPlaying.dispatchEvent();
        },
        stopAllSounds: function () {
            var active = this._activeSounds;
            for (var i = 0, l = active.length; i < l; i++)
                active[i].stop();
            this._activeSounds = [];
            this._onFinishedPlaying.dispatchEvent();
        },
        //dispose: function () {
        //    please notice: each player has _registeredFiles collection including dynamically loaded (TTS) sounds only
        //    therefore dispose () is handled by the inherited class SoundManager
        //},
    });

    return AudioPlayer;
})();
