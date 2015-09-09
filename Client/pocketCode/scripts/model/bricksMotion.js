/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-animation.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';

PocketCode.Model.merge({

	PlaceAtBrick: (function () {
		PlaceAtBrick.extends(PocketCode.Model.BaseBrick, false);

		function PlaceAtBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._x = new PocketCode.Formula(device, sprite, propObject.x);
			this._y = new PocketCode.Formula(device, sprite, propObject.y);
		}

		PlaceAtBrick.prototype._execute = function () {
			this._return(this._sprite.setPosition(this._x.calculate(), this._y.calculate()));
		};

		return PlaceAtBrick;
	})(),


	SetXBrick: (function () {
		SetXBrick.extends(PocketCode.Model.BaseBrick, false);

		function SetXBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._x = new PocketCode.Formula(device, sprite, propObject.value);
		}

		SetXBrick.prototype._execute = function () {
			this._return(this._sprite.setPositionX(this._x.calculate()));
		};

		return SetXBrick;
	})(),


	SetYBrick: (function () {
		SetYBrick.extends(PocketCode.Model.BaseBrick, false);

		function SetYBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._y = new PocketCode.Formula(device, sprite, propObject.value);
		}

		SetYBrick.prototype._execute = function () {
			this._return(this._sprite.setPositionY(this._y.calculate()));
		};

		return SetYBrick;
	})(),


	ChangeXBrick: (function () {
		ChangeXBrick.extends(PocketCode.Model.BaseBrick, false);

		function ChangeXBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._x = new PocketCode.Formula(device, sprite, propObject.value);
		}

		ChangeXBrick.prototype._execute = function () {
			this._return(this._sprite.changePositionX(this._x.calculate()));
		};

		return ChangeXBrick;
	})(),


	ChangeYBrick: (function () {
		ChangeYBrick.extends(PocketCode.Model.BaseBrick, false);

		function ChangeYBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._y = new PocketCode.Formula(device, sprite, propObject.value);
		}

		ChangeYBrick.prototype._execute = function () {
			this._return(this._sprite.changePositionY(this._y.calculate()));
		};

		return ChangeYBrick;
	})(),


	IfOnEdgeBounceBrick: (function () {
		IfOnEdgeBounceBrick.extends(PocketCode.Model.BaseBrick, false);

		function IfOnEdgeBounceBrick(device, sprite) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

		}

		IfOnEdgeBounceBrick.prototype._execute = function () {
			this._return(this._sprite.ifOnEdgeBounce());
		};

		return IfOnEdgeBounceBrick;
	})(),


	MoveNStepsBrick: (function () {
		MoveNStepsBrick.extends(PocketCode.Model.BaseBrick, false);

		function MoveNStepsBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._steps = new PocketCode.Formula(device, sprite, propObject.steps);
		}

		MoveNStepsBrick.prototype._execute = function () {
			this._return(this._sprite.move(this._steps.calculate()));
		};

		return MoveNStepsBrick;
	})(),


	TurnLeftBrick: (function () {
		TurnLeftBrick.extends(PocketCode.Model.BaseBrick, false);

		function TurnLeftBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
		}

		TurnLeftBrick.prototype._execute = function () {
			this._return(this._sprite.turnLeft(this._degrees.calculate()));
		};

		return TurnLeftBrick;
	})(),


	TurnRightBrick: (function () {
		TurnRightBrick.extends(PocketCode.Model.BaseBrick, false);

		function TurnRightBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
		}

		TurnRightBrick.prototype._execute = function () {
			this._return(this._sprite.turnRight(this._degrees.calculate()));
		};

		return TurnRightBrick;
	})(),


	PointInDirectionBrick: (function () {
		PointInDirectionBrick.extends(PocketCode.Model.BaseBrick, false);

		function PointInDirectionBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
		}

		PointInDirectionBrick.prototype._execute = function () {
			this._return(this._sprite.setDirection(this._degrees.calculate()));
		};

		return PointInDirectionBrick;
	})(),


	PointToBrick: (function () {
		PointToBrick.extends(PocketCode.Model.BaseBrick, false);

		function PointToBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._spriteId = propObject.spriteId;
		}

		PointToBrick.prototype._execute = function () {
			this._return(this._sprite.pointTo(this._spriteId));
		};

		return PointToBrick;
	})(),


	GlideToBrick: (function () {
		GlideToBrick.extends(PocketCode.Model.ThreadedBrick, false);

		function GlideToBrick(device, sprite, propObject) {
			PocketCode.Model.ThreadedBrick.call(this, device, sprite);

			this._x = new PocketCode.Formula(device, sprite, propObject.x);
			this._y = new PocketCode.Formula(device, sprite, propObject.y);
			this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
		}

		GlideToBrick.prototype.merge({
			_updatePositionHandler: function(e) {
				this._sprite.setPosition(e.value.x, e.value.y);
			},
			_returnHandler: function (e) {
				var callId = e.callId;
				this._return(callId, true);
			},
			_execute: function (callId) {
				var sprite = this._sprite;
				var po = this._pendingOps[callId];
				var animation = new SmartJs.Animation.Animation2D({ x: sprite.positionX, y: sprite.positionY }, { x: this._x.calculate(), y: this._y.calculate() }, Math.round(this._duration.calculate() * 1000), SmartJs.Animation.Type.LINEAR2D);
				animation.onUpdate.addEventListener(new SmartJs.Event.EventListener(this._updatePositionHandler, this));
				animation.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._returnHandler, this));
				po.animation = animation;
				animation.start({ callId: callId });
			},
			pause: function () {
				var po = this._pendingOps;
				for (var o in po) {
					var animation = po[o].animation;
					if (animation)
						animation.pause();
				}
			},
			resume: function () {
				var po = this._pendingOps;
				for (var o in po) {
					var animation = po[o].animation;
					if (animation)
						animation.resume();
				}
			},
			stop: function () {
				var po = this._pendingOps;
				for (var o in po) {
					var animation = po[o].animation;
					if (animation)
						animation.stop();
				}
				this._pendingOps = {};
			},
		});

		return GlideToBrick;
	})(),


	GoBackBrick: (function () {
		GoBackBrick.extends(PocketCode.Model.BaseBrick, false);

		function GoBackBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

			this._layers = new PocketCode.Formula(device, sprite, propObject.layers);
		}

		GoBackBrick.prototype._execute = function () {
			this._return(this._sprite.goBack(this._layers.calculate()));
		};

		return GoBackBrick;
	})(),


	ComeToFrontBrick: (function () {
		ComeToFrontBrick.extends(PocketCode.Model.BaseBrick, false);

		function ComeToFrontBrick(device, sprite) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);

		}

		ComeToFrontBrick.prototype._execute = function () {
			this._return(this._sprite.comeToFront());
		};

		return ComeToFrontBrick;
	})(),

	VibrationBrick: (function () {
		VibrationBrick.extends(PocketCode.Model.BaseBrick, false);

		function VibrationBrick(device, sprite, propObject) {
			PocketCode.Model.BaseBrick.call(this, device, sprite);
			
			this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
		}

		VibrationBrick.prototype._execute = function () {
			this._return(this._device.vibrate(this._duration.calculate()));
		};

		return VibrationBrick;
	})(),
	
});

