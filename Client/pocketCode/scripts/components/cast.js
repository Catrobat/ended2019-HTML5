/// <reference path="Cast.js" />
'use strict';


PocketCode._Cast = (function () {

    function Cast() { }

    //properties
    Object.defineProperties(Cast.prototype, {
        _UNDEFINED_TEXT: {
            value: '',  //add a string to show if text (variable) is undefined/uninitialized
            //e.g. accessing an undefined list item
        },
        _NOT_A_NUMBER_TEXT: {
            value: 'NaN',  //add a string to show if text (variable) is undefined/uninitialized
            //e.g. Infinity multiplied by Infinity or divided by zero
        },
        _NUMBER_INFINITY_TEXT: {
            value: new PocketCode.Core.I18nString('variableInfinity'),
            //e.g. division through zero (or a string converted to zero)
        },
        _BOOLEAN_TRUE_TEXT: {
            value: new PocketCode.Core.I18nString('variableTrue'),
        },
        _BOOLEAN_FALSE_TEXT: {
            value: new PocketCode.Core.I18nString('variableFalse'),
        },
    });

    //methods
    Cast.prototype.merge({
        toValue: function (value) {
            if (value instanceof PocketCode.Model.UserVariable)
                return value.value;    //objects value
            return value;
        },
        toBoolean: function (value) {
            value = this.toValue(value);    //objects value
            return !!value;
        },
        toNumber: function (value) {
            value = this.toValue(value);    //objects value

            //try to parse string or bool to number
            value = +value; //returns NaN if not possible
            if (!isNaN(value) && value !== null)//isFinite(value))
                return value;

            return 0;   //false, undefined, null, other strings, ..
        },
        toString: function (value) {
            value = this.toValue(value);    //objects value

            if (isNaN(value) && value != value) //real type NaN (NaN == NaN) => false
                return this._NOT_A_NUMBER_TEXT.toString();
            if (value === null || (typeof value != 'string' && isNaN(value)))
                return this._UNDEFINED_TEXT.toString();
            if (value === true)
                return this._BOOLEAN_TRUE_TEXT.toString();
            if (value === false)
                return this._BOOLEAN_FALSE_TEXT.toString();
            if (value === Infinity)
                return this._NUMBER_INFINITY_TEXT.toString();
            if (value === -Infinity)
                return '-' + this._NUMBER_INFINITY_TEXT.toString();

            return value.toString();    //string, number, bool
        },
        toTypedValue: function (value) {
            //used in variables: setting a return value of a formula.calculate()
            if (value === null || value === undefined)
                return undefined;
            if (value instanceof PocketCode.Model.UserVariable) //for variables and lists
                return value.value;
            if (typeof value === 'string') { //convert numbers added as string: we do not convert boolsch values
                var num = +value;   //convert to number
                return (!isNaN(num) ? num : value);
            }
            if (isNaN(value))   //false for bools and Infinity, true for e.g. Error
                return 0;   //like in Scratch
            else    //boolean or number including +-Infinity
                return value;
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return Cast;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.Cast = new PocketCode._Cast();