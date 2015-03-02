/*
 * ----------------------------- Smart JS --------------------------------
 *
 * Author: Wolfgang Wintersteller
 *         wolfgang.wintersteller@gmail.com
 *
 * Licensed under Unlicense:
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */


'use strict';

Object.prototype.merge = function (o) {

    if (this instanceof Array)
        throw new Error('Object.merge not valid on simple data types and arrays');

    for (var m in o) {
        if (o.hasOwnProperty(m)) {
            if (typeof this[m] === 'object' && typeof o[m] === 'object')
                this[m].merge(o[m]);
            else
                this[m] = o[m];
        }
    }
};
Object.defineProperty(Object.prototype, 'merge', { enumerable: false });

Function.prototype.extends = function (superClass, execSuperCtor) {
    execSuperCtor = execSuperCtor !== false ? true : false;

    //for (var p in superClass) if (superClass.hasOwnProperty(p)) this[p] = superClass[p];
    var _proto = this.prototype;

    if (execSuperCtor)
        this.prototype = new superClass();
    else
        this.prototype = Object.create(superClass.prototype);

    this.prototype.constructor = _proto.constructor;

    ////super operator
    //this.prototype._super = {
    //    constructor: superClass.bind(this),
    //};
    //var _super = this.prototype._super;
    //_proto = superClass.prototype;
    //for (var f in _proto) {
    //    if (typeof f === 'function')
    //        _super[f] = superClass.prototype[f].bind(this);
    //}
};
Object.defineProperty(Function.prototype, 'extends', { enumerable: false });

Array.prototype.insert = function (o, idx) {
    this.splice(idx, 0, o);
};
Object.defineProperty(Array.prototype, 'insert', { enumerable: false });

Array.prototype.remove = function (o) {
    var idx, counter = 0;
    while ((idx = this.indexOf(o)) !== -1) {
        this.splice(idx, 1);
        counter++;
    }

    return counter;
};
Object.defineProperty(Array.prototype, 'remove', { enumerable: false });

Array.prototype.dispose = function () {

    for (var i in this) {
        if (this[i] && this[i].dispose && typeof this[i].dispose === 'function') {
            this[i].dispose();
        }
    }
    this.length = 0;  //deletes all entries
};
Object.defineProperty(Array.prototype, 'dispose', { enumerable: false });


/* smart js infrastructure */

var SmartJs = {

    _version: 0.1,
    _objectId: 0,
    getNewId: function () { return 'sj' + this._objectId++; },

    Device: {
        isMobile: (typeof window.orientation !== "undefined") || !!navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Phone|ZuneWP7|WPDesktop|webOS/i),
        isTouch: ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0),
    },

    isBrowserCompatible: function () {
        var _result = true;
        var _tests = {
            //navigator_OperaMini: function () {
            //    if (window.operamini) {
            //        _result = false;
            //        return false;
            //    }
            //}(),
            Object_getPrototypeOf: function() {
                if (!Object.getPrototypeOf) {
                    _result = false;
                    return false;
                }
            }(),
            Object_defineProperty: function () {
                if (!Object.defineProperty) {
                    _result = false;
                    return false;
                }
                else {
                    var _x = {}; //IE8 will allow property definitions only on DOM objects
                    try {
                        Object.defineProperty(_x, 'a', {
                            value: 'test',
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                    }
                    catch (ex) {
                        _result = false;
                        return false;
                    }
                }
                return true;
            }(),
            Array_indexOf: function () {
                if ([].indexOf) return true;

                _result = false;
                return false;
            }(),
            document_addEventListener: function () {
                if (document.addEventListener) return true;

                _result = false;
                return false;
            }(),
            event_stopPropagation: function () {
                var e = document.createEvent("MouseEvents");
                e.initEvent("click", false, true);
                if (e.stopPropagation) return true;

                _result = false;
                return false;
            }(),
            //event_target: function () {   //checking on one property is enough
            //    var e = document.createEvent("MouseEvents");
            //    e.initEvent("click", false, true);
            //    if (e.target) return true;

            //    _result = false;
            //    return false;
            //}(),
            String_trim: function () {
                if (''.trim) return true;

                _result = false;
                return false;
            }(),
            window_getComputedStyle: function() {
                if (!window.getComputedStyle) {
                    _result = false;
                    return false;
                }
            }(),
            css_box_sizing__border_box: function () {
                var box = document.createElement('div');
                //box.style = {
                //    position: 'absolute',
                //    top: '-20px',
                //    left: '-20px',
                //    boxSizing: 'border-box',
                //    border: 'solid 3px black',
                //    height: '10px',
                //    width: '10px',
                //};
                var style = box.style;
                style.position = 'absolute';
                style.top = '-20px';
                style.left = '-20px';
                style.boxSizing = 'border-box';
                style.border = 'solid 3px black';
                style.height = '10px';
                style.width = '10px';

                document.body.appendChild(box);
                var supported = box.offsetHeight == 10 && box.offsetWidth == 10;
                document.body.removeChild(box);
                box = undefined;

                if (supported) return true;

                _result = false;
                return false;
            }(),
            xmlHttpRequest: function () {
                try {
                    var xhr = new XMLHttpRequest();
                }
                catch (e) {
                    _result = false;
                    return false;
                }
                return true;
            }(),

            //TODO: add tests if browser compatibility is unknown
        };

        return { result: _result, tests: _tests };
    },
};

