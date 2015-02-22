/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/program.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Bricks.merge({

	ProgramStartBrick: (function () {
		ProgramStartBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

		function ProgramStartBrick(device, program, sprite) {
			PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);
						
			//this._bricks; type of PocketCode.Bricks.BrickContainer
			//listen to program start
			program.onProgramStart.addEventListener(new SmartJs.Event.EventListener(this.execute, this));
		}

		ProgramStartBrick.prototype.merge({
			_execute: function (id) {
				this._bricks.execute(new SmartJs.Event.EventListener(_return, this), id);
				//this._return();
			},
			//pause: function () {
			//	this._bricks.pause();
			//},
			//resume: function () {
			//	this._bricks.resume();
			//},
		});

		return ProgramStartBrick;
	})(),


	WhenActionBrick: (function () {
		WhenActionBrick.extends(PocketCode.Bricks.RootContainerBrick, false);

		function WhenActionBrick(device, program, sprite, propObject) {
			PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);
				
			this._action = propObject.action;
			//listen to 'when tabbed'
			program.onTabbedAction.addEventListener(new SmartJs.Event.EventListener(this._onTabbedHandler, this));
		}

		WhenActionBrick.prototype.merge({
			_onTabbedHandler: function (e) {
				if (e.sprite === this._sprite)
					this.execute();
			},
			_execute: function (id) {
				this._bricks.execute(new SmartJs.Event.EventListener(_return, this), id);   //return is called with 2 args: id & loopDelay
				//this._return();
			},
			//pause: function () {
			//	this._bricks.pause();
			//},
			//resume: function () {
			//	this._bricks.resume();
			//},
		});

		return WhenActionBrick;
	})(),


	WaitBrick: (function () {
		WaitBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

		function WaitBrick(device, sprite, propObject) {
			PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

			this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
		}

		WaitBrick.prototype.merge({
			_timerExpiredHandler: function(e) {
				var currentOp = this._pendingOps[e.threadId];
				var callId = currentOp.callId;
				delete this._pendingOps[e.threadId];

				this._return(callId);
			},
			_execute: function (callId) {
				var threadId = SmartJs._newId();
				this._pendingOps[threadId] = { callId: callId, timer: new SmartJs.Components.Timer(new SmartJs.Event.EventListener(this._timerExpiredHandler, this), this._duration.calculate(), { threadId: threadId }) };
				//TODO: tricky -> this._duration.calculate will be called periodically here until the return value
				//var id = 
				//this._return(id);
			},
			pause: function () {
				var po = this._pendingOps;
				for (var o in po) {
					var timer = o.timer;
					if (timer && timer instanceof SmartJs.Components.Timer)   //(po.hasOwnProperty(o) && o.timer) 
						timer.pause();
				}
			},
			resume: function () {
				var po = this._pendingOps;
				for (var o in po) {
					var timer = o.timer;
					if (timer && timer instanceof SmartJs.Components.Timer)   //(po.hasOwnProperty(o) && o.resume) 
						timer.resume();
				}
			},
			stop: function () {
				var po = this._pendingOps;
				for (var o in po) {
					var timer = o.timer;
					if (timer && timer instanceof SmartJs.Components.Timer)   //(po.hasOwnProperty(o) && o.resume) 
						timer.stop();
				}
				this._pendingOps = {};
			},
		});

		return WaitBrick;
	})(),


	BroadcastReceive: (function () {
		BroadcastReceive.extends(PocketCode.Bricks.RootContainerBrick, false);

		function BroadcastReceive(device, sprite, broadcastMgr, propObject) {
			PocketCode.Bricks.RootContainerBrick.call(this, device, sprite);

			//this._broadcastMgr = broadcastMgr;
			//this._receiveMsgId = propObject.receiveMsgId;
			broadcastMgr.subscribe(propObject.receiveMsgId, new SmartJs.Event.EventListener(this._onBroadcastHandler, this));
			//this._bricks; type of PocketCode.Bricks.BrickContainer
		}

		BroadcastReceive.prototype.merge({
			_onBroadcastHandler: function (e) { 
				if (e) {    //for broadcastWait: e.g. { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) }
					this.execute(e.listener, e.threadId);
				}
				else
					this.execute();
			},
			//_returnHandler: function(e) {
			//    this._return(e.id, e.loopDelay)
			//},
			_execute: function (id) {
				this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), id);
				//this._return(id);
			},
			//pause: function () {
			//	this._bricks.pause();
			//},
			//resume: function () {
			//	this._bricks.resume();
			//},
		});

		return BroadcastReceive;
	})(),


	BroadcastBrick: (function () {
		BroadcastBrick.extends(PocketCode.Bricks.BaseBrick, false);

		function BroadcastBrick(device, sprite, broadcastMgr, propObject) {
			PocketCode.Bricks.BaseBrick.call(this, device, sprite);

			this._broadcastMgr = broadcastMgr;
			this._broadcastMsgId = propObject.broadcastMsgId;
		}

		BroadcastBrick.prototype._execute = function () {
			this._broadcastMgr.publish(this._broadcastMsgId);
			this._return();
		};

		return BroadcastBrick;
	})(),


	BroadcastAndWaitBrick: (function () {
		BroadcastAndWaitBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

		function BroadcastAndWaitBrick(device, sprite, broadcastMgr, propObject) {
			PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

			this._broadcastMgr = broadcastMgr;
			this._broadcastMsgId = propObject.broadcastMsgId;
		}

		BroadcastAndWaitBrick.prototype.merge({
			_returnHandler: function (e) {
				this._return(e.id, e.loopDelay)
			},
			_execute: function (id) {
				//this._broadcastMgr.publish(this._broadcastMsgId, new SmartJs.Event.EventListener(_waitHandler, this), id);
				this._broadcastMgr.publish(this._broadcastMsgId, new SmartJs.Event.EventListener(this._returnHandler, this), id);
			},
			//_waitHandler: function (callId, loopDelay) {
			//    this._return(callId, loopDelay)
			//},
			pause: function () {
				//TODO: 
			},
			resume: function () {
				//TODO: 
			},
		});

		return BroadcastAndWaitBrick;
	})(),


	NoteBrick: (function () {
		NoteBrick.extends(PocketCode.Bricks.BaseBrick, false);

		function NoteBrick(device, sprite, propObject) {
			PocketCode.Bricks.BaseBrick.call(this, device, sprite);

			this._text = propObject.text;
		}

		NoteBrick.prototype._execute = function () {
			this._return();
		};

		return NoteBrick;
	})(),


	ForeverBrick: (function () {
		ForeverBrick.extends(PocketCode.Bricks.LoopBrick, false);

		function ForeverBrick(device, sprite) {
			PocketCode.Bricks.BaseBrick.call(this, device, sprite);

			//this._bricks = propObject.bricks;
		}

		ForeverBrick.prototype.merge({
			_returnHandler: function(e) {
			    this._execute(e.id);
			    //this._return(e.id, e.loopDelay);  //_return will never be called in a forever loop
			},
			_execute: function (threadId) {
				this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), threadId);
			},
		});

		return ForeverBrick;
	})(),


	IfThenElseBrick: (function () {
		IfThenElseBrick.extends(PocketCode.Bricks.ThreadedBrick, false);

		function IfThenElseBrick(device, sprite, propObject) {
			PocketCode.Bricks.ThreadedBrick.call(this, device, sprite);

			this._condition = new PocketCode.Formula(device, sprite, propObject.condition);
			//this._ifBricks; type of PocketCode.Bricks.BrickContainer
			//this._elseBricks; type of PocketCode.Bricks.BrickContainer
		}

		//properties
		Object.defineProperties(IfThenElseBrick.prototype, {
			ifBricks: {
				set: function (brickContainer) {
					if (brickContainer instanceof PocketCode.Bricks.BrickContainer)
						this._ifBricks = brickContainer;
					else
						throw new Error('invalid argument brickConatiner: expected type PocketCode.Bricks.BrickContainer');
				},
				//enumerable: false,
				//configurable: true,
			},
			elseBricks: {
				set: function (brickContainer) {
					if (brickContainer instanceof PocketCode.Bricks.BrickContainer)
						this._elseBricks = brickContainer;
					else
						throw new Error('invalid argument brickConatiner: expected type PocketCode.Bricks.BrickContainer');
				},
				//enumerable: false,
				//configurable: true,
			},
		});

		//methods
		IfThenElseBrick.prototype.merge({
			_execute: function () {
				//TODO: implement this
			},
			pause: function () {
				this._ifBricks.pause();
				this._elseBricks.pause();
			},
			resume: function () {
				this._ifBricks.resume();
				this._elseBricks.resume();
			},
		});

		return IfThenElseBrick;
	})(),


	RepeatBrick: (function () {
		RepeatBrick.extends(PocketCode.Bricks.LoopBrick, false);

		function RepeatBrick(device, sprite, propObject) {
			PocketCode.Bricks.LoopBrick.call(this, device, sprite);

			this._timesToRepeat = new PocketCode.Formula(device, sprite, propObject.timesToRepeat);
			this._bricks = propObject.bricks;
		}

		RepeatBrick.prototype.merge({
			_returnHandler: function (e) {
				//TODO: loop counter and increment
				//rerun _execute on container n times and than call _return
				//this._return(e.id, e.loopDelay);
			},
			_execute: function (threadId) {
				this._bricks.execute(new SmartJs.Event.EventListener(this._returnHandler, this), threadId);
			},
		});

		return RepeatBrick;
	})(),

});
