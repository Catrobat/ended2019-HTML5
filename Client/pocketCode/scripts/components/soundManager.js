/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="https://code.createjs.com/createjs-2014.12.12.combined.js" />
'use strict';

PocketCode.SoundManager = (function () {

	function SoundManager(projectId, sounds) {
		this._projectId = projectId + '_';
		this._activeSounds = [];

		this._onLoadingProgress = new SmartJs.Event.Event(this);

            //
            createjs.Sound.setVolume(0.7);


		if (sounds)
			this.init(sounds);

	}

	//properties
	Object.defineProperties(SoundManager.prototype, {
		volume: {
			get: function () {
				return createjs.Sound.getVolume() * 100;
			},
			set: function (value) {
				createjs.Sound.setVolume(value / 100.0);
			}
		},
		activeSounds: {
			get: function(){
				return this._activeSounds;
			}
		}
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
		init: function(sounds) {
			this.maxAmountOfSameSounds = 10;

			for(var i = 0; i < sounds.length; i++){
				sounds[i].id = this._projectId + sounds[i].id;
				sounds[i].src = sounds[i].url;
				sounds[i].data = this.maxAmountOfSameSounds;
			}

			createjs.Sound.alternateExtensions = ["mp3"];

			this.loadQueue = new createjs.LoadQueue();
			this.loadQueue.installPlugin(createjs.Sound);

			this.loadQueue.addEventListener("progress", createjs.proxy(function(e) {
				this._onLoadingProgress.dispatchEvent({progress: e.progress * 100});
			},this));

			this.loadQueue.loadManifest(sounds);

		},

		startSound: function (id) {
			var soundInstance = createjs.Sound.createInstance(id);
			soundInstance.addEventListener("succeeded", createjs.proxy(function(e, soundInstance){
				this.activeSounds.push(soundInstance);
			}, this, soundInstance));

			soundInstance.addEventListener("complete", createjs.proxy(function(e, soundInstance){
				var index = this.activeSounds.indexOf(soundInstance);
				if(index > -1){
					this.activeSounds.splice(index,1);
				}
				soundInstance.destroy();
			}, this, soundInstance));

			soundInstance.play();
		},

		startSoundFromUrl: function(url) {

		},

		pauseSounds: function () {
			for(var i = 0; i < this._activeSounds.length; i++){
				if(this._activeSounds[i].paused === false){
					this._activeSounds[i].paused = true;
                    //fix rounding errors that occurs when sounds are paused before 1ms
					if(this._activeSounds[i].position < 1){
						this._activeSounds[i].position = 0;
					}
				}
			}
		},

		resumeSounds: function () {
			for(var i = 0; i < this._activeSounds.length; i++){
				if(this._activeSounds[i].paused === true){
					this._activeSounds[i].paused = false;
				}
			}
		},

		stopAllSounds: function () {
			createjs.Sound.stop();

			for(var i = 0; i < this._activeSounds.length; i++){
				this._activeSounds[i].destroy();
			}
			this._activeSounds = [];
		},

		changeVolume: function (byValue) {
			createjs.Sound.setVolume(createjs.Sound.getVolume() + byValue / 100.0);
		}
	});

	return SoundManager;
})();

