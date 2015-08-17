/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="https://code.createjs.com/createjs-2014.12.12.combined.js" />
'use strict';

PocketCode.SoundManager = (function () {

    function SoundManager(sounds) {

        if (!createjs.Sound.isReady()) {
            createjs.Sound.initializeDefaultPlugins();
        }

        if (!createjs.Sound.getCapabilities() || !createjs.Sound.getCapabilities().mp3) {
            this.supported = false; //throw new Error('mp3 playback is not supported by this browser.');
        }

        this.maxInstancesOfSameSound = 20;
        this._muted = false;

        this._activeSounds = [];

        this._onLoadingProgress = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);
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
        init: function (sounds) {
            if (!(sounds instanceof Array))
                throw new Error('sounds expects type Array');
            if (!this.supported)
                return false;

            createjs.Sound.removeAllSounds();
            createjs.Sound.removeAllEventListeners();

            var soundsFormatted = [];
            this._sizeOfAllSounds = 0;
            for (var i = 0, l = sounds.length; i < l; i++) {
                if (!sounds[i].hasOwnProperty('url') || !sounds[i].hasOwnProperty('id')) {
                    throw new Error('Sounddata is missing id or url');
                }
                soundsFormatted[i] = { id: sounds[i].id, src: sounds[i].url, data: this.maxInstancesOfSameSound, size: sounds[i].size };
                this._sizeOfAllSounds += sounds[i].size;
            }

            var percentLoaded = this._sizeOfAllSounds > 0 ? 0 : 100;
            this._onLoadingProgress.dispatchEvent({ progress: percentLoaded, size: 0 });
            //TODO: dispatch onLoad after all files loaded.. filesize == 0? ->return?

            createjs.Sound.addEventListener('fileload', createjs.proxy(function (e) {
                var loadedFile = soundsFormatted.filter(function (sound) { return sound.src === e.src; });
                if (loadedFile.length > 0) {
                    percentLoaded += loadedFile[0].size / this._sizeOfAllSounds * 100;
                    this._onLoadingProgress.dispatchEvent({ progress: percentLoaded, size: loadedFile[0].size });
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

            ////added to cache static tts sound files- detected by parser
            //if (!id || !url) {
            //    throw new Error('loadSoundFile: missing id or url');
            //}
            //createjs.Sound.registerSound(url, id);
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

            var id = SmartJs.getNewId();
            createjs.Sound.registerSound({ mp3: url }, id, this.maxInstancesOfSameSound, '');
            createjs.Sound.on("fileload", function loadHandler(event) {
                if (event.id === id)
                    this.startSound(id);
            }, this);

            return id;
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

