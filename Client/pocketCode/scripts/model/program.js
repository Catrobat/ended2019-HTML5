/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="broadcastManager.js" />
'use strict';

PocketCode.Model.Program = (function () {

	function Program() {
		this._running = false;
		this._paused = false;

		this.id = undefined;
		this.title = "";
		this.description = "";
		this.author = "";

		this.background = undefined;
		this.sprites = [];

		this.resourceBaseUrl = "";
		this.images = [];
		this.sounds = [];

		this.variables = [];

		this._broadcasts = [];
		this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);

		//events
		this._onProgramStart = new SmartJs.Event.Event(this);
		this._onExecuted = new SmartJs.Event.Event(this);
		this._onTabbedAction = new SmartJs.Event.Event(this);
	}

	//events
	Object.defineProperties(Program.prototype, {
		onProgramStart: {
			get: function () { return this._onProgramStart; },
			//enumerable: false,
			//configurable: true,
		},
		onExecuted: {
			get: function () { return this._onExecuted; },
			//enumerable: false,
			//configurable: true,
		},
		onTabbedAction: {
			get: function () { return this._onTabbedAction; },
			//enumerable: false,
			//configurable: true,
		},
	});
		
	//methods
	Program.prototype.merge({
		start: function () {
			if (this._running)
				return;
			if (!this.background && this.sprites.length === 0)
				throw new Error('no program loaded');

			for (var i = 0, l = this.sprites.length; i < l; i++) {
				this.sprites[i].start();
			}
			this.onProgramStart.dispatchEvent();
		},
		restart: function () {
			this.stop();
			this.start();
		},
		pause: function () {
			if (!this._running || this._paused)
				return;

			this.background.pause();

			for (var i = 0, l = this.sprites.length; i < l; i++) {
				this.sprites[i].pause();
			}
			this._paused = true;
		},
		resume: function () {
			if (!this._paused)
				return;

			this.background.resume();

			for (var i = 0, l = this.sprites.length; i < l; i++) {
				this.sprites[i].resume();
			}
			this._paused = false;
		},
		stop: function () {
			this.background.stop();

			for (var i = 0, l = this.sprites.length; i < l; i++) {
				this.sprites[i].stop();
			}
			this._running = false;
			this._paused = false;
		},

		_spriteOnExecudedHandler: function(e) {
			//TODO: add handler to sprites on init
			//check all sprites if running
			//dispatch program.onExecuted event
		},

		getSprite: function (spriteId) {
			//todo implement this
		},
		getSpriteLayer: function (spriteId) {
			//todo implement this
		},

		getGlobalVariable: function (varId) {
			//todo implement this: global variables
		},
		setGlobalVariable: function (varId, value) {
			//todo implement this: global variables
		},
	});

	return Program;
})();