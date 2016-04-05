/// <reference path="sj.js" />
/// <reference path="sj-error.js" />
'use strict';

/* javascript runtime extensions */

/* smart js core namespace */
SmartJs.Core = {};

SmartJs.Core = {
    String: (function () {
        //ctr
        function Strg(string /*, arguments*/) {
            if (typeof string !== 'string')
                throw new Error('invalid argument: string');

            this._string = string;
            this._format = arguments;
        }

        //Object.defineProperties(Strg.prototype, {
        //});

        Strg.prototype.merge({
            toString: function () {
                return this._string.replace(/({)(\d+)(})/gi,
                        function ($1, $2, idx) {
                            var currentIdx = parseInt(idx) + 1;
                            if (this._format.length <= currentIdx) {
                                throw new Error('invalid string format: missing argument ' + idx);
                            }

                            return this._format[currentIdx].toString();
                        }.bind(this));
            },
        });

        return Strg;
    })(),

    Component: (function () {
        //ctr
        function Component(propObject) {
            if (propObject)
                this._mergeProperties(propObject);
        }

        Object.defineProperties(Component.prototype, {
            objClassName: {
                get: function () {
                    return this.constructor.toString().match(/function\s*(\w+)/)[1];
                },
            },

        });

        Component.prototype.merge({
            __dispose: function (protoDispose) {
                if (this._disposing || this._disposed) return;     //already disposed
                this._disposing = true;

                for (var prop in this) {
                    if (typeof this[prop] === 'function' || !this.hasOwnProperty(prop))
                        continue;

                    if (this[prop] && typeof this[prop].dispose === 'function' && (!this[prop]._disposing || !this[prop]._disposed)) {
                        this[prop].dispose();
                    }

                    if (typeof prop !== 'function' && prop !== '_disposing')
                        delete this[prop];
                }
                var _proto = Object.getPrototypeOf(this);
                if (typeof _proto.__dispose === 'function')
                    _proto.__dispose(true);

                if (!protoDispose)
                    this._disposed = true;
                delete this._disposing;
                //delete this;  //objects references (this) cannot be deleted or set to undefined
            },
            dispose: function () {
                this.__dispose();
                delete this.constructor;// = undefined;
                this._disposed = true;
            },
            _mergeProperties: function (propertyObject, object) {//, root) {
                if (!propertyObject) return;
                object = object || this;
                //root = (root === undefined) ? true : false; //map to DOM element

                if (typeof propertyObject !== 'object')
                    throw new Error('invalid argument: expectet "propertyObject" typeof object');

                for (var p in propertyObject) {
                    if (object[p] === undefined)
                        throw new Error('_mergeProperties(): property "' + p + '" not found in ' + object.objClassName);
                    if (typeof object[p] === 'function')
                        throw new Error('_mergeProperties(): setting a method not allowed: property ' + p + ' in ' + object.objClassName);
                    //try {
                    if (typeof propertyObject[p] === 'object' && typeof propertyObject[p] !== 'array')
                        this._mergeProperties(propertyObject[p], object[p]);
                    else {
                        //if (object instanceof CSSStyleDeclaration && typeof propertyObject[p] !== 'string')
                        //    throw new Error('invalid parameter: CSSStyleDeclaration setter, expected: property "' + object[p] + '" typeof string');
                        //if (object.hasOwnProperty(object[p]) || object instanceof CSSStyleDeclaration) {    //property found in object
                        try {
                            object[p] = propertyObject[p];
                        }
                        catch (e) { }   //silent catch due to write protected properties
                        if (object instanceof CSSStyleDeclaration && object[p] !== propertyObject[p])
                            throw new Error('invalid parameter: constructor parameter object "' + p + '" was not set correctly');
                        //}
                        //else if (object === this && this.setAttribute) {    //try to map to DOM object
                        //    this.setAttribute(p, propertyObject[p]);
                        //}
                        //else var breakpoint=true;
                    }
                    //}
                    //catch (e) {
                    //    throw new Error('error setting property "p": ' + e.message);
                    //}

                }

            },
        });

        return Component;
    })(),
};

SmartJs.Core.EventTarget = (function () {
    EventTarget.extends(SmartJs.Core.Component, false);

    function EventTarget(propObject) {
        SmartJs.Core.Component.call(this, propObject);
    }

    EventTarget.prototype.merge({
        _addDomListener: function (target, eventName, eventHandler, args) {
            var _self = this;
            var handler = function (e) {
                e = e || {};
                if (args) {
                    if (args.stopPropagation !== false)
                        e.stopPropagation();
                    e.merge(args);
                }
                return eventHandler.call(_self, e);
            };
            if (target.addEventListener)
                target.addEventListener(eventName, handler, false);
            else
                target.attachEvent('on' + eventName, handler);
            return handler;
        },

        _removeDomListener: function (target, eventName, eventHandler) {
            if (target.removeEventListener)
                target.removeEventListener(eventName, eventHandler, false);
            else
                target.detachEvent('on' + eventName, eventHandler);
        },
    });

    return EventTarget;
})();

