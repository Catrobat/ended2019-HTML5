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

        this._id = SmartJs.getNewId() + '_';
        this._maxInstancesOfSameSound = 20;
        this._muted = false;

        this._activeSounds = [];
        this._registeredSounds = [];

        this._onLoadingProgress = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);
        this._onFinishedPlaying = new SmartJs.Event.Event(this);

        this._volume = 0.7;
        createjs.Sound.volume = this._volume;//setVolume(0.7);  //initial
        this._muted = createjs.Sound.muted;
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
                this._volume = value / 100;
                //TODO: update instances
                //createjs.Sound.setVolume(value / 100);
            }
        },
        muted: {
            get: function() {
                return this._muted;
            },
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid argument: muted expects argument type: boolean');
                this._muted = value;
                //TODO: set mutes on instances
                //createjs.Sound.setMute(value);
            },
        },
        isPlaying: {
            get: function () {
                if (this._activeSounds.length > 0)
                    return true;
                return false;
            },
        }

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
        _removeAllSounds: function () {  //TODO: remove this._registeredSounds only
            createjs.Sound.removeAllSounds();
            createjs.Sound.removeAllEventListeners();
        },
        loadSounds: function (resourceBaseUrl, sounds) {
            if (!(sounds instanceof Array))
                throw new Error('sounds expects type Array');
            if (!this.supported)
                return false;

            this._removeAllSounds();
            var soundsFormatted = [];
            this._sizeOfAllSounds = 0;
            for (var i = 0, l = sounds.length; i < l; i++) {
                if (!sounds[i].url || !sounds[i].id || !sounds[i].size) {
                    throw new Error('Sounddata is missing id, url or size');
                }
                soundsFormatted[i] = { id: this._id + sounds[i].id, src: resourceBaseUrl + sounds[i].url, data: this._maxInstancesOfSameSound, size: sounds[i].size };
                this._sizeOfAllSounds += sounds[i].size;
            }

            var percentLoaded = this._sizeOfAllSounds > 0 ? 0 : 100;
            this._onLoadingProgress.dispatchEvent({ progress: percentLoaded });
            //TODO: dispatch onLoad after all files loaded.. filesize == 0? ->return?

            createjs.Sound.addEventListener('fileload', createjs.proxy(function (e) {
                var loadedFile = soundsFormatted.filter(function (sound) { return sound.src === e.src; });
                if (loadedFile.length > 0) {
                    percentLoaded += loadedFile[0].size / this._sizeOfAllSounds * 100;
                    this._onLoadingProgress.dispatchEvent({ progress: percentLoaded });
                }
                //TODO: dispatch onLoad after all files loaded.. make sure to handle rounding errors when using == 100
            }, this));

            createjs.Sound.addEventListener('fileerror', createjs.proxy(function (e) {
                this._onLoadingError.dispatchEvent({ src: e.src });
            }, this));

            createjs.Sound.registerSounds(soundsFormatted, '');
        },

        loadSoundFile: function (id, url) { //TODO: Benny?
            if (!this.supported)
                return false;

            //added to cache static tts sound files- detected by parser
            if (!id || !url) {
                throw new Error('loadSoundFile: missing id or url');
            }
            createjs.Sound.registerSound({ id: this._id + id, src: url });
        },

        startSound: function (id) {
            if (!this.supported)
                return false;

            var soundInstance = createjs.Sound.createInstance(this._id + id);
            soundInstance.addEventListener('succeeded', createjs.proxy(function (e, soundInstance) {
                this._activeSounds.push(soundInstance);
                //console.log('instance succeeded');
            }, this, soundInstance));

            soundInstance.addEventListener('complete', createjs.proxy(function (e, soundInstance) {
                //console.log('instance completed');
                var active = this._activeSounds;
                active.remove(soundInstance);
                if (active.length == 0)
                    this._onFinishedPlaying.dispatchEvent();
            }, this, soundInstance));

            soundInstance.play();
        },

        startSoundFromUrl: function (url) { //TODO: take care of mobile devices that need an event to load/play audio files?
            if (!this.supported)
                return false;

            var soundId = SmartJs.getNewId();
            createjs.Sound.on("fileload", createjs.proxy(function (e) {
                var id = this._id + soundId;
                if (e.id === id)
                    this.startSound(id);
            }, this));
            createjs.Sound.registerSound({ id: this._id + soundId, src: url });

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
            createjs.Sound.removeAllSounds();
            createjs.Sound.removeAllEventListeners();

            //SmartJs.Core.Component.prototype.dispose.call(this);
        },
    });

    return SoundManager;

})();

