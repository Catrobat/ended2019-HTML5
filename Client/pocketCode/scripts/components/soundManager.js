/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="https://code.createjs.com/createjs-2014.12.12.combined.js" />
'use strict';

PocketCode.SoundManager = (function () {

    function SoundManager(projectId, sounds) {

        if (!createjs.Sound.isReady()) {
            createjs.Sound.initializeDefaultPlugins();
        }

        if (!createjs.Sound.getCapabilities() || !createjs.Sound.getCapabilities().mp3) {
            this.supported = false; //throw new Error('mp3 playback is not supported by this browser.');
        }

        this.maxInstancesOfSameSound = 20;
        this._muted = false;

        createjs.Sound.removeAllSounds();
        createjs.Sound.removeAllEventListeners();

        this._projectId = projectId + '_';
        this._activeSounds = [];

        this._onLoadingProgress = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);
        this._onFinishedPlaying = new SmartJs.Event.Event(this);

        createjs.Sound.setVolume(0.7);  //initial

        if (sounds)
            this.init(sounds);
    }

    //properties
    Object.defineProperties(SoundManager.prototype, {
        supported: {
            value: true,    //default
            writable: true,
        },
        volume: {
            get: function () {
                return createjs.Sound.getVolume() * 100;
            },
            set: function (value) {
                createjs.Sound.setVolume(value / 100);
            }
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
        init: function (sounds) {
            if (!(sounds instanceof Array))
                throw new Error('sounds expects type Array');
            if (!this.supported)
                return false;

            var soundsFormatted = [];
            var sizeOfAllSounds = 0;
            for (var i = 0, l = sounds.length; i < l; i++) {
                if (!sounds[i].hasOwnProperty('url') || !sounds[i].hasOwnProperty('id')) {
                    throw new Error('Sounddata is missing id or url');
                }
                soundsFormatted[i] = { id: this._projectId + sounds[i].id, src: sounds[i].url, data: this.maxInstancesOfSameSound, size: sounds[i].size };
                sizeOfAllSounds += sounds[i].size;
            }

            var percentLoaded = 0;
            createjs.Sound.addEventListener('fileload', createjs.proxy(function (e) {
                var loadedFile = soundsFormatted.filter(function (sound) { return sound.src === e.src; });
                if (loadedFile.length > 0) {
                    percentLoaded += loadedFile[0].size / sizeOfAllSounds * 100;
                    this._onLoadingProgress.dispatchEvent({ progress: percentLoaded });
                }
            }, this));

            createjs.Sound.addEventListener('fileerror', createjs.proxy(function (e) {
                this._onLoadingError.dispatchEvent({src: e.src});
            }, this));

            createjs.Sound.registerSounds(soundsFormatted, '');
        },

        loadSoundFile: function (id, url) {
            if (!this.supported)
                return false;

            ////added to cache static tts sound files- detected by parser
            //if (!id || !url) {
            //    throw new Error('loadSoundFile: missing id or url');
            //}
            //createjs.Sound.registerSound(url, this._projectId + id);
        },

        startSound: function (id) {
            if (!this.supported)
                return false;

            var soundInstance = createjs.Sound.createInstance(id);
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

            //var id = SmartJs.getNewId();
            //this.loadSoundFile(id, url);

            //createjs.Sound.play()

        },

        pauseSounds: function () {
            for (var i = 0; i < this._activeSounds.length; i++) {
                if (this._activeSounds[i].paused === false) {
                    this._activeSounds[i].paused = true;

                    //fixes rounding errors in the framework that occurs when sounds are paused before 1ms
                    if (this._activeSounds[i].position < 1) {
                        this._activeSounds[i].position = 0;
                    }
                }
            }
        },

        resumeSounds: function () {
            for (var i = 0; i < this._activeSounds.length; i++) {
                if (this._activeSounds[i].paused === true) {
                    this._activeSounds[i].paused = false;
                }
            }
        },

        stopAllSounds: function () {
            if (!this.supported)
                return false;

            createjs.Sound.stop();
            this._activeSounds = [];
            return true;
        },

        changeVolume: function (byValue) {
            createjs.Sound.setVolume(createjs.Sound.getVolume() + byValue / 100.0);
        },

        mute: function (value) {
            if (typeof value !== 'boolean')
                throw new Error('invalid argument: mute() expects argument type: boolean');
            this._muted = value;
            createjs.Sound.setMute(value);
        },
        dispose: function () {
        },
    });

    return SoundManager;

})();

