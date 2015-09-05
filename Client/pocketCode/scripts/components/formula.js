/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="parser.js" />
'use strict';

PocketCode.Formula = (function () {

    function Formula(device, sprite, jsonFormula) {

        if (!device || !sprite)
            throw new Error('invalid parameter: undeclared device or sprite');
        this._device = device;
        this._sprite = sprite;

        if (jsonFormula)
            this.json = jsonFormula;
        //this._uiString = '';
    }

    //accessors
    Object.defineProperties(Formula.prototype, {
        isStatic: {
            value: false,
            writable: true,
        },
        json: {
            get: function () {
                return this._json;
            },
            set: function (value) {
                this._json = value;
                var parsed = PocketCode.FormulaParser.parseJson(value); //return {calculate: [Function], isStatic: [boolean]}
                if (parsed.isStatic) {
                    this.isStatic = true;
                    this.calculate = parsed.calculate;  //to map scope to formula (currently scope = parsed)
                    var val = this.calculate();
                    val = (typeof val === 'string') ? '"' + val + '"' : val;
                    this.calculate = new Function('return ' + val + ';');//'return ' + val + ';');
                }
                else {
                    this.isStatic = false;
                    this.calculate = parsed.calculate;
                }
                this._uiString = undefined;
                //this._validateFormula();  //validation dring loading will throw an error as not all objects may be loaded at this time
            },
            //enumerable: false,
            //configurable: true,
        },
        uiString: {
            get: function () {
                if (!this._uiString)
                    this._uiString = PocketCode.FormulaParser.getUiString(this._json, this._sprite.getAllVariables());
                return this._uiString;
            },
        },
    });

    //methods
    Formula.prototype.merge({
        _degree2radian: function (val) {
            return val * (Math.PI / 180.0);
        },
        _radian2degree: function (val) {
            return val * (180.0 / Math.PI);
        },
        _log10: function (val) {
            return Math.log(val) / Math.LN10;
        },

        _validateFormula: function () {
            try {
                var test = this.calculate();
            }
            catch (e) {
                throw new Error('Error parsing formula: ' + e.message);
            }
        },
    });

    return Formula;
})();