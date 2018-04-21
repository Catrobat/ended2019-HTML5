/// <reference path="Cast.js" />
'use strict';

PocketCode.Math = {};

PocketCode.Math.merge({
    /* custom equl (==) operator*/
    isEqual: function (value1, value2) {

        if (value1 === value2)   //simple check: explicit
            return true;

        var cast = PocketCode.Math.Cast;

        //2 lists (lists are added as value: no recursive (endless) call possible)
        if (value1 instanceof PocketCode.Model.UserVariableList && value2 instanceof PocketCode.Model.UserVariableList) {
            if (value1.length != value2.length)// || value1.value != value2.value) //quick compare
                return false;

            //please notice: in Scratch Arrays are only equal if the elements have the same order
            for (var i = 1, l = value1.length; i <= l; i++) {   //we work with custom lists here (idx = 1..n)
                if (cast.toString(value1.valueAt(i)).toUpperCase() !== cast.toString(value2.valueAt(i)).toUpperCase())   //string compare (not strong typed)
                    return false;
            }
            return true;
        }

        //case insensitive strings
        if (typeof value1 == 'string' && typeof value2 == 'string' && value1.toUpperCase() == value2.toUpperCase())
            return true;

        var tval1 = cast.toTypedValue(value1),  //make sure we compare to native types
            tval2 = cast.toTypedValue(value2);

        //check again: numbers & bools
        if (tval1 === tval2)
            return true;
        //both = NaN
        if (tval1 !== tval1 && tval2 !== tval2)
            return true;

        if (tval1 == undefined || tval2 == undefined) {
            if (cast.toString(value1) === cast.toString(value2))
                return true;    //undefined == "" (empty string) => true
            return false;   //make sure undefined is not converted to bool = false
        }

        //bool: currently not supprted by scratch,
        //but false == 0 and true == 1 should evaluate to true
        if (tval1 === true && tval2 === 1 ||
            tval1 === false && tval2 === 0 ||
            tval2 === true && tval1 === 1 ||
            tval2 === false && tval1 === 0)
            return true;

        //default
        return false;
    },

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
                value = this.toTypedValue(value);    //objects value
                return !!value; //!!"any string but empty" -> true
            },
            toNumber: function (value) {
                value = this.toTypedValue(value);    //objects value
                value = +value; //returns NaN if not possible
                if (value != null && !isNaN(value))
                    return value;
                return 0;
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

                return value.toString();    //string, number, .. no formatting (shows localized numbers: language, comma, 1000th separator, ..)
            },
            toTypedValue: function (value) {
                value = this.toValue(value);    //objects value

                if (value === null || value === undefined)
                    return undefined;
                if (value != value)    //NaN
                    return value;
                if (typeof value == 'string') { //convert types numbers added as string
                    switch (value.toUpperCase()) {
                        case "NAN":
                            return NaN;
                        case "TRUE":
                            return true;
                        case "FALSE":
                            return false;
                        case "INFINITY":    //supporting case insensitive
                            return Infinity;
                        case "-INFINITY":
                            return -Infinity;
                    }
                    var num = +value;   //convert to number
                    return (!isNaN(num) ? num : value);
                }
                else    //boolean or number including NaN & +-Infinity
                    return value;
            },
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
