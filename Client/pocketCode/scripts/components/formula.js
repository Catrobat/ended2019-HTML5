/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="parser.js" />
'use strict';

PocketCode.Formula = (function () {

	function Formula(device, sprite, jsonFormula) {
	    this._device = device;
	    this._sprite = sprite;

	    this.json = jsonFormula;
	}

	//accessors
	Object.defineProperties(Formula.prototype, {
	    json: {
	        get: function () {
	            return this._json;
	        },
	        set: function (value) {
	            this._json = value;
	            this.calculate = PocketCode.FormulaParser.parseJson(value);
	        },
	        //enumerable: false,
	        //configurable: true,
	    },
	});

	//methods
	Formula.prototype.merge({
		_degree2radian: function(val) {
			return val * (Math.PI / 180.0);
		},
		_radian2degree: function(val) {
			return val * (180.0 / Math.PI);
		},
		_log10: function(val) {
			return Math.log(val) / Math.LN10;
		},
	});
	
	return Formula;
})();