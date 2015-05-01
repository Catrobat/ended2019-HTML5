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
        }
    });

    //methods
    SoundManager.prototype.merge({
        init: function (sounds) {
            var soundsFormatted = [];
            var sizeOfAllSounds = 0;
            var l = sounds.length;
            for (var i = 0; i < l; i++) {
                if (!sounds[i].hasOwnProperty("url") || !sounds[i].hasOwnProperty("id")) {
                    throw new Error('Sounddata is missing id or url.');
                }
                soundsFormatted[i] = { id: this._projectId + sounds[i].id, src: sounds[i].url, data: this.maxInstancesOfSameSound, size: sounds[i].size };
                sizeOfAllSounds += sounds[i].size;
            }

            var percentLoaded = 0;
            createjs.Sound.addEventListener("fileload", createjs.proxy(function (e) {
                var loadedFile = soundsFormatted.filter(function (sound) { return sound.src === e.src; });
                if (loadedFile.length > 0) {
                    percentLoaded += loadedFile[0].size / sizeOfAllSounds * 100;
                    this._onLoadingProgress.dispatchEvent({ progress: percentLoaded });
                }
            }, this));

            createjs.Sound.registerSounds(soundsFormatted, "");
        },

        loadSoundFile: function (id, url) {
            //added to cache static tts sound files- detected by parser
        },

        startSound: function (id) {
            var soundInstance = createjs.Sound.createInstance(id);
            soundInstance.addEventListener("succeeded", createjs.proxy(function (e, soundInstance) {
                this._activeSounds.push(soundInstance);
            }, this, soundInstance));

            soundInstance.addEventListener("complete", createjs.proxy(function (e, soundInstance) {
                var index = this._activeSounds.indexOf(soundInstance);
                if (index > -1) {
                    this._activeSounds.splice(index, 1);
                }
            }, this, soundInstance));

            soundInstance.play();
        },

        startSoundFromUrl: function (url) {

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
            createjs.Sound.stop();
            this._activeSounds = [];
        },

        changeVolume: function (byValue) {
            createjs.Sound.setVolume(createjs.Sound.getVolume() + byValue / 100.0);
        },

        mute: function (value){
            this._muted = value;
            createjs.Sound.setMute(value);
        }
    });

    return SoundManager;

})();

