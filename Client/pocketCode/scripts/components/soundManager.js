/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="https://code.createjs.com/createjs-2014.12.12.combined.js" />
'use strict';

PocketCode.SoundManager = (function () {

	//ctr: sounds = [{id: "s12", name:"asd", url:""}, {...}]
	function SoundManager(projectId, sounds) {
		this._projectId = projectId + '_';
		if (sounds)
			this.init(sounds);
		else
		    this._volume = 1;   //TODO: find out if there is a default value & this is necessary

		//events
		this._onLoadingProgress = new SmartJs.Event.Event(this);
	}

	//properties
	Object.defineProperties(SoundManager.prototype, {
		volume: {
			get: function () {
				return this._volume * 100.0;
			},
			set: function (value) {
				this._volume = value / 100.0;   //TODO: round?
			}
		},
	});

	//events
	Object.defineProperties(SoundManager.prototype, {
		onLoadingProgress: {
			get: function () { return this._onLoadingProgress; },
			//enumerable: false,
			//configurable: true,
		},
	});

	//methods
	SoundManager.prototype.merge({
		init: function(sounds) {
		    this._volume = 1;   //TODO: find out if there is a default value

		},

		startSound: function (id) {

		},
		startSoundFromUrl: function(url) {

		},
		pauseSounds: function () {

		},

		resumeSounds: function () {

		},

		stopAllSounds: function () {

		},

		ChangeVolume: function (byValue) {
			this._volume += byValue / 100.0;    //TODO: round? chech value >0 && <100?
		},
	});

	return SoundManager;
})();

