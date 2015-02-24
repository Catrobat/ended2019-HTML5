/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="../model/bricksCore.js" />
/// <reference path="../model/bricksControl.js" />
/// <reference path="../model/bricksSound.js" />
/// <reference path="../model/bricksMotion.js" />
/// <reference path="../model/bricksSound.js" />
/// <reference path="../model/bricksVariables.js" />
'use strict';

PocketCode.ProgramParser = (function () {
	function ProgramParser() {
		this._bricksCount = 0;	//TODO:
		this._brickFactory = null;//new PocketCode.BrickFactory()

		this._onProgressChange = new SmartJs.Event.Event(this);
	}

	//events
	Object.defineProperties(ProgramParser.prototype, {
		onProgressChange: {
			get: function () { return this._onProgressChange; },
			//enumerable: false,
			//configurable: true,
		},
	});

	ProgramParser.prototype.parse = function (jsonProgram) {    //, bricksCount) {
		//this._bricksCount = bricksCount || this._bricksCount;

		if (!this._brickFactory)
			this._brickFactory = new PocketCode.BrickFactory(this._device, this, this._broadcastMgr, this._bricksCount);
		else
			this._brickFactory.bricksCount = this._bricksCount;

		//TODO:
		//_brickFactory.parseJson(currentSprite, json);
		return null;
	};

	return ProgramParser;
})();

//PocketCode.ProgramParser = new PocketCode.ProgramParser();


PocketCode.BrickFactory = (function () {
	function BrickFactory(device, program, broadcastMgr, totalCount) {
		this._device = device;
		this._program = program;
		this._broadcastMgr = broadcastMgr;

		this._total = totalCount;
		this._parsed = 0;
		this._updatePercentage = 0;
		this._unsupportedBricks = [];

		this._onProgressChange = new SmartJs.Event.Event(this);
		this._onUnsupportedBricksFound = new SmartJs.Event.Event(this);
	}

	//events
	Object.defineProperties(BrickFactory.prototype, {
		onProgressChange: {
			get: function () { return this._onProgressChange; },
			//enumerable: false,
			//configurable: true,
		},
		onUnsupportedBrickFound: {
			get: function () { return this._onUnsupportedBricksFound; },
			//enumerable: false,
			//configurable: true,
		},
	});

	//methods
	BrickFactory.prototype.merge({
		create: function (currentSprite, jsonBrick) {
			var type = jsonBrick.type;

			switch (type) {
				case 'ProgramStartBrick':
				case 'WhenActionBrick':
					var brick = new PocketCode.Bricks[type + 'Brick'](this._device, this._program, currentSprite, jsonBrick);
					break;

					//case 'WhenActionBrick':
					//    var brick = new PocketCode.Bricks[type + 'Brick'](this._device, this._program, currentSprite, jsonBrick);
					//    break;

				case 'BroadcastReceive':
				case 'Broadcast':
				case 'BroadcastAndWaitBrick':
					var brick = new PocketCode.Bricks[type + 'Brick'](this._device, currentSprite, this._broadcastMgr, jsonBrick);
					break;

				default:
					if (PocketCode.Bricks[type + 'Brick'])
						var brick = new PocketCode.Bricks[type + 'Brick'](this._device, currentSprite, jsonBrick);
					else {
						var brick = new PocketCode.Bricks.UnsupportedBrick(this._device, currentSprite, jsonBrick);
					}
			}

			if (brick instanceof PocketCode.Bricks.UnsupportedBrick)
			    this._unsupportedBricks.push(brick);


			//trigger event
			this._parsed++;
			this._updateProgress();
			if (jsonBrick.bricks)   //all loops
				brick.bricks = this._createList(jsonBrick.bricks);          //ERROR: //TODO: set as a BrickContainer
			else if (brick.ifBricks && brick.elseBricks) {  //if then else
				brick.ifBricks = this._createList(jsonBrick.ifBricks);
				brick.elseBricks = this._createList(jsonBrick.elseBricks);
			}

			if (this._total == this._parsed && this._unsupportedBricks.length > 0)
				this._onUnsupportedBrickFound.dispatchEvent({ unsupportedBricks: this._unsupportedBricks });

			//add event listener
			if (brick instanceof PocketCode.Bricks.RootContainerBrick) {
				//TODO:
			}

			return brick;
		},
		_createList: function (jsonBricks) {
			var bricks = [];
			for (var i = 0, l = jsonBrick.length; i < l; i++)
				bricks.push(this.create(jsonBricks[i]));
			return bricks;
		},
		_updateProgress: function () {
			var progress = 100 / this._total * this._parsed;
			//we do not want to trigger several hundred progress updates.. every 5% should be enough
			if (progress - this._updatePercentage >= 5.0) {
				this._updatePercentage = progress;
				this._onProgressChange.dispatchEvent({ progress: progress });
			}

		},
	});

	return BrickFactory;
})();


PocketCode.FormulaParser = new ( (function () {
	function FormulaParser() {
	}

	FormulaParser.prototype.merge({
	    getUiString: function (jsonFormula, variableNames) {
	        if (!variableNames)
	            throw new Error('invalid argument: variableNames (lookup dictionary required)');
	        this._variableNames = variableNames;

	        return this._parseJsonType(jsonFormula, true);
	    },
		parseJson: function (jsonFormula) {
			var formulaString = this._parseJsonType(jsonFormula);
			return new Function('return ' + formulaString + ';');
		},

		_parseJsonType: function (jsonFormula, uiString) {
			if (jsonFormula == null)
				return '';

			/* package org.catrobat.catroid.formulaeditor: class FormulaElement: enum ElementType
			*  OPERATOR, FUNCTION, NUMBER, SENSOR, USER_VARIABLE, BRACKET, STRING
			*/
			switch (jsonFormula.type) {
				case 'OPERATOR':
				    return this._parseJsonOperator(jsonFormula, uiString);

				case 'FUNCTION':
				    return this._parseJsonFunction(jsonFormula, uiString);

				case 'NUMBER':
					return jsonFormula.value;// + '';  //as string?

				case 'SENSOR':
				    return this._parseJsonSensor(jsonFormula, uiString);

			    case 'USER_VARIABLE':
			        if (uiString)
			            return this._variableNames[jsonFormula.value].name;
					return 'this._sprite.getVariable(' + jsonFormula.value + ').value';

				case 'BRACKET':
					if (!jsonFormula.right)
						return '()';

					return '(' + this._parseJsonType(jsonFormula.right, uiString) + ')';

				case 'STRING':
					return jsonFormula.value;

				default:
					throw new Error('formula parser: unknown type: ' + jsonFormula.type);
			}
		},

		_concatOperatorFormula: function (jsonFormula, operator, uiString) {
		    return this._parseJsonType(jsonFormula.left, uiString) + operator + this._parseJsonType(jsonFormula.right, uiString);
		},
		_parseJsonOperator: function (jsonFormula, uiString) {
			/* package org.catrobat.catroid.formulaeditor: enum Operators */
			switch (jsonFormula.value) {
				case 'LOGICAL_AND':
				    if (uiString)
				        return this._concatOperatorFormula(jsonFormula, ' AND ', uiString);
				    return this._concatOperatorFormula(jsonFormula, ' && ');

			    case 'LOGICAL_OR':
			        if (uiString)
			            return this._concatOperatorFormula(jsonFormula, ' OR ', uiString);
					return this._concatOperatorFormula(jsonFormula, ' || ');

				case 'EQUAL':
				    if (uiString)
				        return this._concatOperatorFormula(jsonFormula, ' = ', uiString);
				    return this._concatOperatorFormula(jsonFormula, ' === ');

				case 'NOT_EQUAL':
				    if (uiString)
				        return this._concatOperatorFormula(jsonFormula, ' ≠ ', uiString);
				    return this._concatOperatorFormula(jsonFormula, ' !== ');

				case 'SMALLER_OR_EQUAL':
				    if (uiString)
				        return this._concatOperatorFormula(jsonFormula, ' ≤ ', uiString);
				    return this._concatOperatorFormula(jsonFormula, ' <= ');

				case 'GREATER_OR_EQUAL':
				    if (uiString)
				        return this._concatOperatorFormula(jsonFormula, ' ≥ ', uiString);
				    return this._concatOperatorFormula(jsonFormula, ' >= ');

				case 'SMALLER_THAN':
				    return this._concatOperatorFormula(jsonFormula, ' < ', uiString);

				case 'GREATER_THAN':
				    return this._concatOperatorFormula(jsonFormula, ' > ', uiString);

				case 'PLUS':
				    return this._concatOperatorFormula(jsonFormula, ' + ', uiString);

				case 'MINUS':
				    return '-' + this._parseJsonType(jsonFormula.right, uiString);

			    case 'MULT':
			        if (uiString)
			            return this._concatOperatorFormula(jsonFormula, ' x ', uiString);
					return this._concatOperatorFormula(jsonFormula, ' * ');

				case 'DIVIDE':
				    if (uiString)
				        return this._concatOperatorFormula(jsonFormula, ' ÷ ', uiString);
				    return this._concatOperatorFormula(jsonFormula, ' / ');

					//case 'MOD':
					//    return this._concatOperatorFormula(jsonFormula, ' % ');

					//case 'POW':
					//    return 'Math.pow(' + this._concatOperatorFormula(jsonFormula, ', ') + ')';

				case 'LOGICAL_NOT':
				    if (uiString)
				        return ' NOT ' + this._parseJsonType(jsonFormula.right, uiString);
				    return '!' + this._parseJsonType(jsonFormula.right);

				default:
					throw new Error('formula parser: unknown operator: ' + jsonFormula.value);
			}
		},

		_parseJsonFunction: function (jsonFormula, uiString) {
			/* package org.catrobat.catroid.formulaeditor: enum Functions
			*  SIN, COS, TAN, LN, LOG, SQRT, RAND, ROUND, ABS, PI, MOD, ARCSIN, ARCCOS, ARCTAN, EXP, MAX, MIN, TRUE, FALSE, LENGTH, LETTER, JOIN;
			*/
			switch (jsonFormula.value) {
				case 'SIN':
				    if (uiString)
				        return 'sin( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'Math.sin(this._toRad(' + this._parseJsonType(jsonFormula.left) + '))';

				case 'COS':
				    if (uiString)
				        return 'cos( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'Math.cos(this._toRad(' + this._parseJsonType(jsonFormula.left) + '))';

				case 'TAN':
				    if (uiString)
				        return 'tan( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'Math.tan(this._toRad(' + this._parseJsonType(jsonFormula.left) + '))';

				case 'LN':
				    if (uiString)
				        return 'ln( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'Math.log(' + this._parseJsonType(jsonFormula.left) + ')';

				case 'LOG':
				    if (uiString)
				        return 'log( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'this._log10(' + this._parseJsonType(jsonFormula.left) + ')';

				case 'SQRT':
				    if (uiString)
				        return 'sqrt( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'Math.sqrt(' + this._parseJsonType(jsonFormula.left) + ')';

				case 'RAND':
					//var left = this._parseJsonType(jsonFormula.left); = min
					//var right = this._parseJsonType(jsonFormula.right); = max
				    if (uiString)
				        return 'random( ' + this._parseJsonType(jsonFormula.left, uiString) + ', '+ this._parseJsonType(jsonFormula.right, uiString) + ' )';    //TODO:
				    return 'Math.floor((Math.random() * ' + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';  //TODO:

			    case 'ROUND':
			        if (uiString)
			            return 'round( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
					return 'Math.round(' + this._parseJsonType(jsonFormula.left) + ')';

				case 'ABS':
				    if (uiString)
				        return 'abs( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'Math.abs(' + this._parseJsonType(jsonFormula.left) + ')';

			    case 'PI':
			        if (uiString)
			            return 'pi';
					return 'Math.PI';

			    case 'MOD':
			        if (uiString)
			            return 'mod( ' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ' )';
					return this._concatOperatorFormula(jsonFormula, ' % ');

				case 'ARCSIN':
				    if (uiString)
				        return 'arcsin( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'this._toDeg(Math.asin(' + this._parseJsonType(jsonFormula.left) + '))';

				case 'ARCCOS':
				    if (uiString)
				        return 'arccos( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'this._toDeg(Math.acos(' + this._parseJsonType(jsonFormula.left) + '))';

				case 'ARCTAN':
				    if (uiString)
				        return 'arctan( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'this._toDeg(Math.atan(' + this._parseJsonType(jsonFormula.left) + '))';

				case 'EXP':
				    if (uiString)
				        return 'exp( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';
				    return 'Math.exp(' + this._parseJsonType(jsonFormula.left) + ')';

				case 'MAX':
				    if (uiString)
				        return 'max( ' + this._concatOperatorFormula(jsonFormula, ', ', uiString) + ' )';
				    return 'Math.max(' + this._concatOperatorFormula(jsonFormula, ', ') + ')';

				case 'MIN':
				    if (uiString)
				        return 'min( ' + this._concatOperatorFormula(jsonFormula, ', ', uiString) + ' )';
				    return 'Math.min(' + this._concatOperatorFormula(jsonFormula, ', ') + ')';

			    case 'TRUE':
			        if (uiString)
			            return 'TRUE';
					return 'true';

				case 'FALSE':
				    if (uiString)
				        return 'FALSE';
				    return 'false';

				//case 'LENGTH':  //string //TODO:
				//	if (jsonFormula.left)
				//		return jsonFormula.left.length;
				//	return 0;

				//case 'LETTER':  //string
				//	var idx = jsonFormula.left - 1;
				//	if (idx < 0 || idx >= jsonFormula.left.length)
				//		return '';
				//	return jsonFormula.left.substr(idx, 1);
				//	break;

				//case 'JOIN':    //string
				//	throw new Error('formula parser: join not implemented');	//TODO
				//	break;

				default:
					throw new Error('formula parser: unknown function: ' + jsonFormula.value);

			}
		},

		_parseJsonSensor: function (jsonFormula, uiString) {
			/* package org.catrobat.catroid.formulaeditor: enum Sensors
			*  X_ACCELERATION, Y_ACCELERATION, Z_ACCELERATION, COMPASS_DIRECTION, X_INCLINATION, Y_INCLINATION, LOUDNESS, FACE_DETECTED, FACE_SIZE, FACE_X_POSITION, FACE_Y_POSITION, OBJECT_X(true), OBJECT_Y(true), OBJECT_GHOSTEFFECT(true), OBJECT_BRIGHTNESS(true), OBJECT_SIZE(true), OBJECT_ROTATION(true), OBJECT_LAYER(true)
			*/
			switch (jsonFormula.value) {
				//sensors
				case 'X_ACCELERATION':
				    if (uiString)
				        return 'acceleration_x';
				    return 'this._device.accelerationX';

				case 'Y_ACCELERATION':
				    if (uiString)
				        return 'acceleration_y';
				    return 'this._device.accelerationY';

				case 'Z_ACCELERATION':
				    if (uiString)
				        return 'acceleration_z';
				    return 'this._device.accelerationZ';

				case 'COMPASS_DIRECTION':
				    if (uiString)
				        return 'compass_direction';
				    return 'this._device.compassDirection';

				case 'X_INCLINATION':
				    if (uiString)
				        return 'inclination_x';
				    return 'this._device.inclinationX';

				case 'Y_INCLINATION':
				    if (uiString)
				        return 'inclination_y';
				    return 'this._device.inclinationY';

				case 'LOUDNESS':
				    if (uiString)
				        return 'loudness';
				    return 'this._device.loudness';

				//sprite
				case 'OBJECT_BRIGHTNESS':
				    if (uiString)
				        return 'brightness';
				    return 'this._sprite.brightness';

				case 'OBJECT_GHOSTEFFECT':
				    if (uiString)
				        return 'transparency';
				    return 'this._sprite.transparency';

				case 'OBJECT_LAYER':
				    if (uiString)
				        return 'layer';
				    return 'this._sprite.layer';

				case 'OBJECT_ROTATION': //=direction
				    if (uiString)
				        return 'direction';
				    return 'this._sprite.rotation';

				case 'OBJECT_SIZE':
				    if (uiString)
				        return 'size';
				    return 'this._sprite.size';

				case 'OBJECT_X':
				    if (uiString)
				        return 'position_x';
				    return 'this._sprite.x';

				case 'OBJECT_Y':
				    if (uiString)
				        return 'position_y';
				    return 'this._sprite.y';

				default:
					throw new Error('formula parser: unknown sensor: ' + jsonFormula.value);
			}
		},

	});

	return FormulaParser;
})() );


