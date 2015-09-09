/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="https://code.createjs.com/createjs-2014.12.12.combined.js" />
'use strict';

PocketCode.SoundManager = (function () {
    //SoundManager.extends(SmartJs.Core.Component);

    function SoundManager() {//resourceBaseUrl, sounds) {

        //if (!createjs.Sound.isReady()) {
        //    createjs.Sound.initializeDefaultPlugins();
        //}

        //if (!createjs.Sound.getCapabilities() || !createjs.Sound.getCapabilities().mp3) {
        //    this.supported = false; //throw new Error('mp3 playback is not supported by this browser.');
        //}
        //this.supported = createjs.Sound.initializeDefaultPlugins();
        this._loading = false;      //loading in progress
        //this._useSizeForProgressCalculation = false;
        this._totalSize = 0;        //calcualted size if useSizeForProgressCalculation == true
        this._loadedSize = 0;
        this._registeredFiles = []; //files to load

        this._id = SmartJs.getNewId() + '_';
        this._maxInstancesOfSameSound = 20;
        this._volume = 0.7;
        this._muted = false;

        this._activeSounds = [];

        this._onLoadingProgress = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);
        this._onFinishedPlaying = new SmartJs.Event.Event(this);

        createjs.Sound.volume = this._volume;//setVolume(0.7);  //initial
        this._muted = createjs.Sound.muted;

        this._fileLoadProxy = createjs.proxy(function (e) {
            this._fileLoadHandler(e);
        }, this);
        createjs.Sound.addEventListener('fileload', this._fileLoadProxy);

        this._fileErrorProxy = createjs.proxy(function (e) {
            this._fileLoadingErrorHandler(e);
        }, this);
        createjs.Sound.addEventListener('fileerror', this._fileErrorProxy);

        //if (resourceBaseUrl)
        //    this._resourceBaseUrl = resourceBaseUrl;
        //if (sounds)
        //    this.loadSounds(sounds);
    }

    //properties
    Object.defineProperties(SoundManager.prototype, {
        supported: {
            value: createjs.Sound.initializeDefaultPlugins(),//true,    //default
            //writable: true,
        },
        volume: {
            get: function () {
                return this._volume * 100;//createjs.Sound.getVolume() * 100;
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

                this._volume = value / 100;
                var sounds = this._activeSounds;
                for (var i = 0, l = sounds.length; i < l; i++)
                    sounds[i].volume = value;
            }
        },
        muted: {
            get: function() {
                return this._muted;
            },
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid argument: muted expects argument type: boolean');
                if (this._muted === value)
                    return;

                this._muted = value;
                var sounds = this._activeSounds;
                for (var i = 0, l = sounds.length; i < l; i++)
                    sounds[i].muted = value;
            },
        },
        isPlaying: {
            get: function () {
                if (this._activeSounds.length > 0)
                    return true;
                return false;
            },
        },

        //activeSounds: {
        //    get: function () {
        //        return this._activeSounds;
        //    }
        //}
    });

    //events
    Object.defineProperties(SoundManager.prototype, {
        onLoadingProgress: {
            get: function () {
                return this._onLoadingProgress;
            }
            //enumerable: false,
            //configurable: true,
        },
        onLoad: {
            get: function () {
                return this._onLoad;
            }
            //enumerable: false,
            //configurable: true,
        },
        onLoadingError: {
            get: function () {
                return this._onLoadingError;
            }
            //enumerable: false,
            //configurable: true,
        },
        onFinishedPlaying: {//executed if isPlaying = false
            get: function () {
                return this._onFinishedPlaying;
            }
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    SoundManager.prototype.merge({
        _fileLoadHandler: function (e) {
            var idx,
                file,
                files = this._filesToLoad;
            if (!files)
                return;

            for (var i = 0, l = files.length; i < l; i++) {
                file = files[i];
                if (file.id === e.id) {
                    idx = i;
                    break;
                }
            }
            if (idx) {
                if (!this._loading) //aborted
                    return;
                this._registeredFiles.push({ id: e.id, src: e.src });
                this._loadedSize += file.size;
                this._onProgressChange.dispatchEvent({ progress: Math.round(this._loadedSize / this._totalSize * 100), file: file });

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
        _fileLoadingErrorHandler: function(e) {
            var idx,
                file,
                files = this._filesToLoad;
            if (!files)
                return;

            for (var i = 0, l = files.length; i < l; i++) {
                file = files[i];
                if (file.id === e.id) {
                    idx = i;
                    break;
                }
            }
            if (idx) {
                this._loading = false;
                //this._filesToLoad = [];
                this._onError.dispatchEvent({ file: file });
            }
        },
        _removeAllSounds: function () {  //TODO: remove this._registeredFiles only
            //this.stopAllSounds();
            createjs.Sound.removeSounds(this._registeredFiles);
            this._registeredFiles = [];
            //createjs.Sound.removeAllSounds();
            //createjs.Sound.removeAllEventListeners();
        },
        _requestFile: function (fileIndex) {
            if (this._disposed)
                return;
            this._onLoadingProgress.dispatchEvent({ progress: 0 });
            createjs.Sound.registerSounds(this._filesToLoad[fileIndex]);
        },
        loadSound: function (id, url) { //TODO: Benny?
            if (!this.supported)
                return false;

            //added to cache static tts sound files- detected by parser
            if (!id || !url) {
                throw new Error('load sound: missing id or url');
            }
            var sound = { id: this._id + id, src: url };
            createjs.Sound.registerSound();
            this._registeredFiles.push(sound);
            return true;
        },
        loadSounds: function (resourceBaseUrl, files) {
            if (this._loading)
                throw new Error('loading in progress: you have to wait');
            if (!(files instanceof Array))
                throw new Error('sounds expects type Array');
            if (!this.supported)
                return false;

            this._removeAllSounds();
            var file;
            this._filesToLoad = [];
            this._totalSize = 0;
            for (var i = 0, l = files.length; i < l; i++) {
                file = files[i];
                if (!file.url || !file.id || !file.size) {
                    throw new Error('Sounddata is missing id, url or size');
                }
                this._filesToLoad.push({ id: this._id + file.id, src: resourceBaseUrl + file.url, data: this._maxInstancesOfSameSound, size: file.size });
                if (typeof file.size !== 'number')
                    throw new Error('invalid size definition');
                this._totalSize += file.size;
            }

            this._loadedSize = 0;
            if (this._filesToLoad.length > 0) {
                this._loading = true;
                this._requestFile(0);
            }
            else
                this._onLoad.dispatchEvent();

            //this._sizeOfAllSounds = 0;
            //for (var i = 0, l = sounds.length; i < l; i++) {
            //    if (!sounds[i].url || !sounds[i].id || !sounds[i].size) {
            //        throw new Error('Sounddata is missing id, url or size');
            //    }
            //    this._registeredFiles.push({ id: this._id + sounds[i].id, src: resourceBaseUrl + sounds[i].url, data: this._maxInstancesOfSameSound, size: sounds[i].size });
            //    this._sizeOfAllSounds += sounds[i].size;
            //}

            //var percentLoaded = this._sizeOfAllSounds > 0 ? 0 : 100;
            //this._onLoadingProgress.dispatchEvent({ progress: percentLoaded });
            ////TODO: dispatch onLoad after all files loaded.. filesize == 0? ->return?

            //createjs.Sound.addEventListener('fileload', createjs.proxy(function (e) {
            //    var loadedFile = this._registeredFiles.filter(function (sound) { return sound.id === id; });
            //    if (loadedFile.length > 0) {
            //        percentLoaded += loadedFile[0].size / this._sizeOfAllSounds * 100;
            //        this._onLoadingProgress.dispatchEvent({ progress: percentLoaded, file: loadedFile });
            //    }
            //    //TODO: dispatch onLoad after all files loaded.. make sure to handle rounding errors when using == 100
            //}, this));

            //createjs.Sound.addEventListener('fileerror', createjs.proxy(function (e) {
            //    var errorFile = this._registeredFiles.filter(function (sound) { return sound.id === id; });
            //    if (errorFile.length > 0)
            //        this._onLoadingError.dispatchEvent({ file: errorFile });
            //}, this));

            //createjs.Sound.registerSounds(this._registeredFiles, '');
            //return true;
        },
        abortLoading: function () {
            this._loading = false;
        },
        startSound: function (id) {
            if (!this.supported)
                return false;

            var soundInstance = createjs.Sound.createInstance(this._id + id);
            soundInstance.addEventListener('succeeded', createjs.proxy(function (e, soundInstance) {
                this._activeSounds.push(soundInstance);
            }, this, soundInstance));

            soundInstance.addEventListener('complete', createjs.proxy(function (e, soundInstance) {
                var active = this._activeSounds;
                active.remove(soundInstance);
                if (active.length == 0)
                    this._onFinishedPlaying.dispatchEvent();
            }, this, soundInstance));

            soundInstance.volume = this._volume;
            soundInstance.muted = this._muted;
            soundInstance.play();
        },

        startSoundFromUrl: function (url) { //TODO: take care of mobile devices that need an event to load/play audio files?
            var soundId = this._id + SmartJs.getNewId();
            this.loadSound({ id: soundId, src: url });
            this.startSound(soundId);
            //if (!this.supported)
            //    return false;


            //var soundId = SmartJs.getNewId();
            //createjs.Sound.on("fileload", createjs.proxy(function (e) {
            //    var id = this._id + soundId;
            //    if (e.id === id)
            //        this.startSound(id);
            //}, this));
            //createjs.Sound.registerSound({ id: this._id + soundId, src: url });

            return true;
        },

        pauseSounds: function () {
            var sounds = this._activeSounds;
            for (var i = 0, l = sounds.length; i < l; i++) {
                if (sounds[i].paused === false) {
                    sounds[i].paused = true;

                    //fixes rounding errors in the framework that occurs when sounds are paused before 1ms
                    if (sounds[i].position < 1) {
                        sounds[i].position = 0;
                    }
                }
            }
        },

        resumeSounds: function () {
            var sounds = this._activeSounds;
            for (var i = 0, l = sounds.length; i < l; i++) {
                if (sounds[i].paused === true) {
                    sounds[i].paused = false;
                }
            }
        },

        stopAllSounds: function () {
            if (!this.supported)
                return false;

            //createjs.Sound.stop();
            var sounds = this._activeSounds;
            for (var i = 0, l = sounds.length; i < l; i++)
                sounds[i].stop();
            this._activeSounds = [];
            return true;
        },

        //changeVolume: function (byValue) {
        //    createjs.Sound.setVolume(createjs.Sound.getVolume() + byValue / 100.0);
        //},

        dispose: function () {
            this.abortLoading();
            createjs.Sound.removeEventListener('fileload', this._fileLoadProxy);
            createjs.Sound.removeEventListener('fileerror', this._fileErrorProxy);
            this._removeAllSounds();
            //SmartJs.Core.Component.prototype.dispose.call(this);
        },
    });

    return SoundManager;

})();

