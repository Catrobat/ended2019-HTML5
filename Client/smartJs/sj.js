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
/**
 * Object.merge provides a simple way to merge an existing object with another
 * All ixisting and writeable oject properties will be replaced, missing properties added
 * @param o: object that is merged into the original object
 */
Object.prototype.merge = function (o) {
    if (typeof o !== 'object')
        return this;
    if (this instanceof Array)
        throw new Error('Object.merge not valid on simple data types and arrays');

    for (var m in o) {
        if (o.hasOwnProperty(m)) {
            if (typeof this[m] === 'object' && typeof o[m] === 'object' && !(o[m] instanceof Array ))
                this[m].merge(o[m]);
            else
                this[m] = o[m];
        }
    }
    return this;
};
Object.defineProperty(Object.prototype, 'merge', { enumerable: false });

/**
 * Function.extends implements inheritance
 * A given class definition function is manipulatet to inherit from superClass
 * @param {function} superClass: class definition to inherit from
 * @param {boolean} [execSuperCtor=true] - should super contructor be called during inheritance
 */
Function.prototype.extends = function (superClass, execSuperCtor) {
    execSuperCtor = execSuperCtor !== false ? true : false;

    //for (var p in superClass) if (superClass.hasOwnProperty(p)) this[p] = superClass[p];
    var _proto = this.prototype;

    if (execSuperCtor)
        this.prototype = new superClass();
    else
        this.prototype = Object.create(superClass.prototype);

    this.prototype.constructor = _proto.constructor;
    //Object.defineProperties(this.prototype, {
    //    _super: {
    //        value: superClass.prototype,
    //    },
    //});
    //this.prototype._superCtor = function () { superClass.apply(this, arguments) };
};
Object.defineProperty(Function.prototype, 'extends', { enumerable: false });

/**
 * Array.insert inserts an object o into an array at a given index idx
 * @param {Array} o
 * @param {number} idx
 */
Array.prototype.insert = function (idx, o) {
    this.splice(idx, 0, o);
};
Object.defineProperty(Array.prototype, 'insert', { enumerable: false });

/**
 * Array.remove removes an object o from an (cut out)
 * @param o
 */
Array.prototype.remove = function (o) {
    var idx, counter = 0;
    while ((idx = this.indexOf(o)) !== -1) {
        this.splice(idx, 1);
        counter++;
    }

    return counter;
};
Object.defineProperty(Array.prototype, 'remove', { enumerable: false });

/**
 * Array.dispose disposes an Array by cutting out all items after trying to call dispose on them
 */
Array.prototype.dispose = function () {

    for (var i = this.length - 1; i >= 0; i--) {// in this) {
        if (this[i] && typeof this[i].dispose === 'function') { //&& this[i].dispose 
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
    /**
     * SmartJs.getNewId generates a new unique id (in this DOM instance only)
     */
    getNewId: function () { return 'sj' + this._objectId++; },

    /**
     * SmartJs.Device is a helper object to simply indicate if a device supports touch events and/or is a mobile device
     */
    Device: {
        isIOs: ((typeof window.orientation !== 'undefined') && navigator.userAgent.match(/iPad|iPhone|iPod/i) && !navigator.userAgent.match(/IEMobile|Windows Phone/i)),
        isFirefoxOS: (!!"mozApps" in navigator && navigator.userAgent.search("Mobile") != -1 && avigator.userAgent.search("Android") < 0),
        isTouch: ('ontouchstart' in window) || ('msMaxTouchPoints' in navigator && navigator.msMaxTouchPoints > 0) || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0),
        isMobile: (typeof window.orientation !== 'undefined') || !!navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Phone|ZuneWP7|WPDesktop|webOS/i),
    },

    /**
     * SmartJs.isBrowserCompatible() tests the browser for compatibility with SmartJs
     */
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
                return true;
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
                if (document.addEventListener)
                    return true;

                _result = false;
                return false;
            }(),
            event_stopPropagation: function () {
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', false, true);
                if (e.stopPropagation) return true;

                _result = false;
                return false;
            }(),
            //event_target: function () {   //checking on one property is enough
            //    var e = document.createEvent('MouseEvents');
            //    e.initEvent('click', false, true);
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
                return true;
            }(),
            cssBoxSizing_borderBox: function () {
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
                style.top = '-200px';
                style.left = '-200px';
                style.boxSizing = 'border-box';
                style.border = 'solid 30px black';
                style.height = '100px';
                style.width = '100px';

                document.body.appendChild(box);
                var supported = box.offsetHeight == 100 && box.offsetWidth == 100;
                document.body.removeChild(box);
                box = undefined;

                if (supported)
                    return true;

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

