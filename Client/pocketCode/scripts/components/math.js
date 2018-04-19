/// <reference path="Cast.js" />
'use strict';

PocketCode.Math = {};

PocketCode.Math.merge({
    /* custom equl (==) operator*/
    isEqual: function (value1, value2) {

        if (value1 == value2)   //simple check: implicit
            return true;

        //2 lists
        if (value1 instanceof PocketCode.Model.UserVariableList && value2 instanceof PocketCode.Model.UserVariableList) {
            if (value1.length != value2.length || value1.value != value2.value) //quick compare
                return false;

            //please notice: in Scratch Arrays are only equal if the elements have the same order
            for (var i = 1, l = value1.length; i <= l; i++) {   //we work with custom lists here (idx = 1..n)
                if(!this.isEqual(value1.valueAt(i), value2.valueAt(i)))
                    return false;
            }
            return true;
        }

        var cast = PocketCode.Math.Cast,
            value1 = cast.toValue(value1),  //make sure we compare to native types
            value2 = cast.toValue(value2);
        //case insensitive strings
        if (typeof value1 == 'string' && typeof value2 == 'string' && value1.toUpperCase() == value2.toUpperCase())
            return true;

        //numbers
        if (value1 != value1 && value2 != value2)   //2 real NaN values return true (Scratch)
            return true;
        var num1 = cast.toNumber(value1), //(typeof value1 == 'number') ? value : num1;
            num2 = cast.toNumber(value2); //(typeof value2 == 'number') ? value : num2;
        if (num1 && (num1 == num2)) //not true for num1 = num2 = 0
            return true;

        //bool
        if (typeof value1 == 'string' && typeof value2 == 'boolean' ||
            typeof value1 == 'boolean' && typeof value2 == 'string')
            return (cast.toBoolean(value1) && cast.toBoolean(value2));  //both == true

        return false;
    },

    /*
     * according to Scratch..
     * - entering true or false in a box is stored as a string
     * - strings cannot be casted to numbers -> 0
     * - but strings can be casted to bool (true false: case-insensitive match
     * - strings are compared case-insensitive
     * - ...
     */
    _Cast: (function () {

        function Cast() { }

        //properties
        Object.defineProperties(Cast.prototype, {
            _UNDEFINED_TEXT: {
                value: '',  //add a string to show if text (variable) is undefined/uninitialized
                //e.g. accessing an undefined list item
            },
            //    _NOT_A_NUMBER_TEXT: {
            //        value: 'NaN',  //add a string to show if text (variable) is undefined/uninitialized
            //        //e.g. Infinity multiplied by Infinity or divided by zero
            //    },
            //    _NUMBER_INFINITY_TEXT: {
            //        value: new PocketCode.Core.I18nString('variableInfinity'),
            //        //e.g. division through zero (or a string converted to zero)
            //    },
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
                if (typeof value === 'string') {
                    return (value.toUpperCase() === 'TRUE' ? true : false);    //scratch compatibility: return false for all string2bool
                }
                return !!value; //notice: !!"any string but empty" -> true
            },
            toNumber: function (value) {
                value = this.toValue(value);    //objects value

                if (typeof value == 'string')   //try to replace localized comma with '.'
                    value.replace((1.1).toLocaleString().substring(1, 2), '.');
                //try to parse string or bool to number: including Infinity as string
                value = +value; //returns NaN if not possible
                if (value != null && !isNaN(value))
                    return value;

                return 0;//(value === 'true' ? 1 : 0);    //scratch compatibility: false, undefined, null, other strings, ..
            },
            toString: function (value) {
                value = this.toValue(value);    //objects value
                if (value === null || value === undefined)
                    return '';
                return value.toString();
            },
            toI18nString: function (value, languageCode) {
                //used for text rendering
                value = this.toValue(value);    //objects value

                if (isNaN(value) && value != value) //real type NaN (NaN == NaN) => false
                    return value.toLocaleString(languageCode);//._NOT_A_NUMBER_TEXT.toString();
                if (value === null || (typeof value != 'string' && isNaN(value)))
                    return this._UNDEFINED_TEXT.toString();
                if (value === true)
                    return this._BOOLEAN_TRUE_TEXT.toString();
                if (value === false)
                    return this._BOOLEAN_FALSE_TEXT.toString();
                if (value === Infinity)
                    return value.toLocaleString(languageCode);  //'\u221E';
                if (value === -Infinity)
                    return value.toLocaleString(languageCode);

                return value.toString();    //string, number, .. no formatting (shows localized numbers, comma, 1000th separator, ..)
            },
            //toTypedValue: function (value) {
            //    //used in variables: setting a return value of a formula.calculate()
            //    value = this.toValue(value);    //objects value

            //    if (value === null || value === undefined)
            //        return undefined;
            //    if (typeof value === 'string') { //convert numbers added as string: 
            //        //we do not convert boolsch values- they are stored as string but can be casted to bool (like in Scratch)
            //        var num = +value;   //convert to number
            //        return (!isNaN(num) ? num : value);
            //    }
            //        //if (isNaN(value))   //like in Scratch: we allow NaN as value -> it's casted when used
            //        //    return 0;
            //    else    //boolean or number including +-Infinity
            //        return value;
            //},
            /* override */
            dispose: function () {
                //static class: cannot be disposed
            },
        });

        return Cast;
    })(),
});

//static class: constructor override (keeping code coverage enabled)
PocketCode.Math.Cast = new PocketCode.Math._Cast();