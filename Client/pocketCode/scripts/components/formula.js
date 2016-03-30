/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="parser.js" />
'use strict';

PocketCode.Formula = (function () {
    //Formula.extends(SmartJs.Core.Component);

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
                    val = (typeof val === 'string') ? '\'' + val.replace(/'/g, '\\\'').replace(/\n/g, '\\n') + '\'' : val;
                    this.calculate = new Function('return ' + val + ';');
                }
                else {
                    this.isStatic = false;
                    this.calculate = parsed.calculate;
                }
                this._uiString = undefined;
                this._validateFormula();
            },
        },
        uiString: {
            get: function () {
                if (!this._uiString)
                    this._uiString = PocketCode.FormulaParser.getUiString(this._json, this._sprite.getAllVariables(), this._sprite.getAllLists());
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
        _validateNumeric: function (left, operator, right) {
            if (isNaN(left))
                left = 0;
            if (isNaN(right)) {
                right = 0;
                if (operator == ' / ')  //handle division by zero
                    return 0;
                else if (operator == ' % ') {   //modulo
                    var func = new Function('return ' + left + ';');
                    return func();
                }
        }
            var func = new Function('return ' + left + operator + right + ';');
            return func();
        },
        _validateFormula: function () {
            try {
                var formula = new PocketCode.Formula(this._device, this._sprite);
                formula._sprite = { //override sprite to enable validation during parsing
                    brightness: 100,
                    transparency: 0,
                    layer: 1,
                    direction: 90,
                    size: 100,
                    positionX: 0,
                    positionY: 0,
                    getVariable: function () { return { value: 0 }; },
                    getList: function() { return { value: [] }; },
                };
                var test = this.calculate.call(formula);    //execute generated calculate method in testFormula
            }
            catch (e) {
                throw new Error('Error parsing formula: ' + e.message);
            }
        },
        dispose: function () {
            this._device = undefined;
            this._sprite = undefined;
        },
    });

    return Formula;
})();