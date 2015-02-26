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

    if (typeof this !== 'object' || this instanceof Array)
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
    _getId: function () { return 'sj-' + this._objectId++; },

    Device: {
        isMobile: (typeof window.orientation !== "undefined") || !!navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Phone|ZuneWP7|WPDesktop|webOS/i),
        isTouch: ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0),
    },

    isBrowserCompatible: function () {
        var _result = true;
        var _tests = {
            Object_getPrototypeOf: function () {
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
            window_getComputedStyle: function () {
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



SmartJs.Error = {
    Exception: (function () {
        Exception.extends(Error);

        function Exception(args) {
            if (typeof args === 'string')
                this.message = args;
            else if (typeof args === 'object')
                this.merge(args);
            else
                throw new Error('invalid argument: expected "args" of type string or object');
            this.stack = this.stack || '';
        }

        return Exception;
    })(),
};

SmartJs.Error.NotImplementedException = (function () {
    NotImplementedException.extends(SmartJs.Error.Exception, false);

    function NotImplementedException() {
        SmartJs.Error.Exception.call(this, 'Not implemented');
    }

    return NotImplementedException;
})();

SmartJs.Error.InvalidArgumentException = (function () {
    InvalidArgumentException.extends(SmartJs.Error.Exception, false);

    function InvalidArgumentException(argument, expected) {
        SmartJs.Error.Exception.call(this, { msg: 'Invalid argument: "' + argument.toString() + '", expected: ' + expected.toString(), argument: argument.toString(), expected: expected.toString() });
    }

    return InvalidArgumentException;
})();


/* javascript runtime extensions */

/* smart js core namespace */
SmartJs.Core = {};

SmartJs.Core.Component = (function () {
    function Component(propObject) {
        //this._id = SmartJs._getId();
        //this._disposed = false;   -> not required: if (this._disposed) returns false for false and undefined
        this._mergeProperties(propObject);
    }

    Object.defineProperties(Component.prototype, {
        //id: {
        //    get: function () {
        //        return this._id;
        //    },
        //    enumerable: false,
        //    configurable: true,
        //},
        objClassName: {
            get: function () {
                return this.constructor.toString().match(/function\s*(\w+)/)[1];
            },
            //enumerable: false,
            //configurable: true,
        },

    });

    Component.prototype.merge({
        __dispose: function (protoDispose) {
            //protoDispose = protoDispose || false;
            if (this._disposing || this._disposed) return;     //already disposed
            this._disposing = true;

            for (var prop in this) {
                if (!this.hasOwnProperty(prop))
                    continue;
                if (protoDispose && typeof this[prop] === 'function')
                    continue;

                if (this[prop] && this[prop].dispose && typeof this[prop].dispose === 'function') {
                    this[prop].dispose();
                }

                //try {
                //    this[prop] = undefined;
                //} catch (e) { };    //catch error on readOnly properties
                if (prop !== '_disposing')
                    delete this[prop];
                //else alert('_disposing found');
            }
            var _proto = Object.getPrototypeOf(this);
            if (_proto.__dispose)
                _proto.__dispose(true);

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
                throw new Error('invalid argument: expectet "propertyObject typeof object');

            for (var p in propertyObject) {
                if (object[p] === undefined)
                    throw new Error('property "' + p + '" not found in ' + object.objClassName);
                if (typeof object[p] === 'function')
                    throw new Error('setting a method not allowed: property ' + p + ' in ' + object.objClassName);
                //try {
                if (typeof propertyObject[p] === 'object' && typeof propertyObject[p] !== 'array')
                    this._mergeProperties(propertyObject[p], object[p]);
                else {
                    //if (object instanceof CSSStyleDeclaration && typeof propertyObject[p] !== 'string')
                    //    throw new Error('invalid parameter: CSSStyleDeclaration setter, expected: property "' + object[p] + '" typeof string');
                    //if (object.hasOwnProperty(object[p]) || object instanceof CSSStyleDeclaration) {    //property found in object
                    object[p] = propertyObject[p];
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
})();



SmartJs.Core.EventTarget = (function () {
    EventTarget.extends(SmartJs.Core.Component, false);

    function EventTarget(propObject) {
        SmartJs.Core.Component.call(this, propObject);
    }

    EventTarget.prototype.merge({
        _addDomListener: function (target, eventName, eventHandler) {
            //var _self = this;
            var handler = function (e) {
                e.stopPropagation();
                return eventHandler.bind(this, e);
            };
            target.addEventListener(eventName, handler, false);
            return handler;
        },

        _removeDomListener: function (target, eventName, eventHandler) {
            target.removeEventListener(eventName, eventHandler, false);
        },
    });

    return EventTarget;
})();




//application
//        SmartJs.Core.Application = (function () {
//            Application.extends(SmartJs.Core.Component);
//            function Application() {
//                //this.test = 'test';
//                //document.addEventListener("DOMContentLoaded", function () {
//                //    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
//                //    this._start();
//                //}, false);
//                this._start();
//            }
//TODO: use merge() here
//            Application.prototype._start = function () {
//                alert('test');   //TODO: remove this: test only

//                //TODO: add individual app functionality
//            };
//            return Application;
//        })();

//    }
//    catch (ex) {
//        console.log('error initialising namespace SmartJs.Core: ' + ex.message);
//    }
//}



//https://github.com/kbjr/Events.js
//see: _helpers/Events


SmartJs.Event = {
    Event: (function () {
        Event.extends(SmartJs.Core.Component);

        function Event(target) {
            if (!(target instanceof SmartJs.Core.Component))
                throw new Error('invalid argument: expected target type: SmartJs.Core.Component');

            this.target = target;
            this._listeners = [];
        };

        Event.prototype.merge({
            addEventListener: function (listener) {
                if (!(listener instanceof SmartJs.Event.EventListener))
                    throw new Error('invalid argument: expected listener type: SmartJs.Event.EventListener');

                var idx = this.__listenerIndex(listener);
                if (idx == -1) {  //not found
                    this._listeners.push(listener);
                    return true;
                }
                return false;
            },
            removeEventListener: function (listener) {
                if (!(listener instanceof SmartJs.Event.EventListener))
                    throw new Error('invalid argument: expected listener type: SmartJs.Event.EventListener');

                var idx = this.__listenerIndex(listener);
                if (idx >= 0) {
                    this._listeners.splice(idx, 1);
                    return true;
                }
                return false;
            },
            __listenerIndex: function (listener) {
                var idx = this._listeners.indexOf(listener);
                if (idx >= 0)
                    return idx;

                var li = this._listeners;
                var item, l = li.length;
                for (var i = 0; i < l; i++) {
                    item = li[i];
                    if (item.handler === listener.handler && item.scope === listener.scope)
                        return i;
                }
                return -1;
            },
            dispatchEvent: function (args, target, bubbles) {
                if (typeof args !== 'undefined' && typeof args !== 'object')
                    throw new Error('invalid argument: expected optional argument (args) type: object');
                if (typeof target !== 'undefined' && typeof target !== 'object')
                    throw new Error('invalid argument: expected optional target type: object');
                if (typeof bubbles !== 'undefined' && typeof bubbles !== 'boolean')
                    throw new Error('invalid argument: expected optional bubbles type: boolean');

                var a = args || {};
                a.target = target || this.target;
                a.bubbles = bubbles || false;

                var li = this._listeners;
                var item, l = li.length;
                for (var i = 0; i < l; i++) {
                    item = li[i];
                    if (item.scope)
                        item.handler.call(item.scope, a);
                    else
                        item.handler(a);
                }
            },
            //dispose: function () {
            //    //clear cross reference
            //    //this.target = undefined;
            //    SmartJs.Core.Component.prototype.dispose.call(this);
            //},
        });
        return Event;
    })(),


    EventListener: (function () {
        function EventListener(handler, scope) {
            if (typeof handler !== 'function')
                throw new Error('invalid argument: expected handler type: function');
            if (typeof scope !== 'undefined' && typeof scope !== 'object')
                throw new Error('invalid argument: expected optional scope type: object');

            this.handler = handler;
            this.scope = scope;
        };

        //Event.prototype.merge({
        //    dispose: function () {
        //        //clear cross reference
        //        delete this.handler;
        //        delete this.scope;
        //    },
        //});
        return EventListener;
    })(),

};



SmartJs.Ui = {
    TextNode: (function () {
        TextNode.extends(SmartJs.Core.Component, false);

        function TextNode(text) {//, propObject) {
            this._text = text;
            this._dom = document.createTextNode(this._text);

            SmartJs.Core.EventTarget.call(this);//, propObject);
        }

        //properties
        Object.defineProperties(TextNode.prototype, {
            text: {
                get: function () {
                    return this._text;
                },
                set: function (value) {
                    this._text = value;
                    this._dom.textContent = value;
                },
                //enumerable: false,
                //configurable: true,
            },
        });

        //methods
        TextNode.prototype.merge({
            verifyResize: function () { //interface suport only
            },
            dispose: function () {
                if (this._parent)
                    this._parent._removeChild(this);
                else if (document.body.contains(this._dom))
                    this._dom.parentNode.removeChild(this._dom);
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return TextNode;
    })(),

    Control: (function () {
        UiControl.extends(SmartJs.Core.EventTarget, false);

        function UiControl(element, propObject) {
            this._id = SmartJs._getId();

            if (element instanceof HTMLElement)
                this._dom = element;
            else if (typeof element === 'string')
                this._dom = document.createElement(element);

            if (!this._dom || this._dom instanceof HTMLUnknownElement)
                throw new Error('invalid argument: expected parameter "element" as valid HTMLElement or string');

            this._dom.id = this._id;
            this._innerDom = this._dom;

            this._parent = undefined;
            this._childs = [];
            this._cachedSize = { height: 0, width: 0, innerHeight: 0, innerWidth: 0 };
            //this._docked = false;

            //events
            this._onResize = new SmartJs.Event.Event(this);
            this._onResize.addEventListener(new SmartJs.Event.EventListener(function (e) {
                var size = this._cachedSize;// = { height: this.height, width: this.width };
                size.height = this.height;
                size.width = this.width;

                if (size.innerHeight !== this._innerHeight || size.innerWidth !== this._innerWidth) {
                    size.innerHeight = this._innerHeight;
                    size.innerWidth = this._innerWidth;

                    var childs = this._childs, l = childs.length;
                    for (var i = 0; i < l; i++)
                        childs[i].verifyResize(this);
                }
                var parent = this._parent;
                if (parent && parent !== e.caller)
                    this._parent.onLayoutChange.dispatchEvent({ caller: this });
            }, this));

            this._onLayoutChange = new SmartJs.Event.Event(this);
            this._onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                var childs = this._childs, l = childs.length;
                for (var i = 0; i < l; i++) {
                    var child = childs[i];
                    if (child !== e.caller)
                        child.verifyResize(this);
                }

            }, this));

            //base constructor has to be called after creating dom to avoid errors: propObject->style not available
            SmartJs.Core.EventTarget.call(this, propObject);
        }

        //properties
        Object.defineProperties(UiControl.prototype, {
            id: {
                get: function () {
                    return this._id;
                },
                //enumerable: false,
                //configurable: true,
            },
            rendered: {
                get: function () {
                    //return (node === document.body) ? false : document.body.contains(node);
                    //if (this._dom)
                    return document.body.contains(this._dom);
                    //return false;
                },
                //enumerable: false,
                //configurable: true,
            },
            style: {
                get: function () {
                    return this._dom.style; //returns a CSSStyleDeclaration object
                },
                set: function (value) {
                    if (typeof value !== 'object' || value instanceof Array)
                        throw new Error('invalid parameter: expected "value" typeof object');

                    var s = this._dom.style;
                    s.cssText = ''; //clear
                    for (var p in value) {
                        if (s[p] === undefined)
                            throw new Error('invalid parameter: "' + p + '" not defined in style');
                        s[p] = value[p];
                    }
                    this.verifyResize();
                },
                //enumerable: false,
                //configurable: true,
            },
            className: {
                get: function () {
                    return this._dom.className;
                },
                set: function (value) {
                    this._dom.className = value;
                    this.verifyResize();
                },
                //enumerable: false,
                //configurable: true,
            },
            height: {
                get: function () {
                    if (!this.rendered)
                        return 0;

                    var _style = window.getComputedStyle(this._dom);
                    var height = this._dom.offsetHeight;
                    height += parseInt(_style.marginTop) || 0;  //returns NaN in e.g. Chrome
                    height += parseInt(_style.marginBottom) || 0;
                    return height;
                },
                set: function (value) {
                    if (typeof value !== 'number')
                        throw new Error('invalid argument: expected "value" typeof "number" (px)');

                    var _style = window.getComputedStyle(this._dom);
                    if (_style.boxSizing !== 'border-box') {    //content-box or other
                        value -= parseInt(_style.paddingTop) || 0;
                        value -= parseInt(_style.paddingBottom) || 0;
                        value -= parseInt(_style.borderTopWidth) || 0;
                        value -= parseInt(_style.borderBottomWidth) || 0;
                    }

                    value -= parseInt(_style.marginTop) || 0;
                    value -= parseInt(_style.marginBottom) || 0;

                    value += 'px';
                    if (this.style.height !== value) {
                        this.style.height = value;
                        this.verifyResize();
                    }
                },
                //enumerable: true,
                //configurable: true,
            },
            _innerHeight: {
                get: function () {
                    if (!this.rendered)
                        return 0;

                    var _style = window.getComputedStyle(this._innerDom);
                    var height = this._innerDom.clientHeight;
                    height -= parseInt(_style.paddingTop) || 0;
                    height -= parseInt(_style.paddingBottom) || 0;
                    return height;
                },
                //enumerable: true,
                //configurable: true,
            },
            width: {
                get: function () {
                    if (!this.rendered)
                        return 0;

                    var _style = window.getComputedStyle(this._dom);
                    var width = this._dom.offsetWidth;
                    width += parseInt(_style.marginLeft) || 0;
                    width += parseInt(_style.marginRight) || 0;
                    return width;
                },
                set: function (value) {
                    if (typeof value !== 'number')
                        throw new Error('invalid argument: expected "value" typeof "number" (px)');

                    var _style = window.getComputedStyle(this._dom);
                    if (_style.boxSizing !== 'border-box') {    //content-box or other
                        value -= parseInt(_style.paddingLeft) || 0;
                        value -= parseInt(_style.paddingRight) || 0;
                        value -= parseInt(_style.borderLeftWidth) || 0;
                        value -= parseInt(_style.borderRightWidth) || 0;
                    }

                    value -= parseInt(_style.marginLeft) || 0;
                    value -= parseInt(_style.marginRight) || 0;

                    value += 'px';
                    if (this.style.width !== value) {
                        this.style.width = value;
                        this.verifyResize();
                    }
                },
                //enumerable: true,
                //configurable: true,
            },
            _innerWidth: {
                get: function () {
                    if (!this.rendered)
                        return 0;

                    var _style = window.getComputedStyle(this._innerDom);
                    var width = this._innerDom.clientWidth;
                    width -= parseInt(_style.paddingLeft) || 0;
                    width -= parseInt(_style.paddingRight) || 0;
                    return width;
                },
                //enumerable: true,
                //configurable: true,
            },
            hidden: {
                get: function () {
                    var display = this._dom.style.display;
                    if (display === '' || display === 'block')
                        return false;
                    return true;
                },
                //enumerable: false,
                //configurable: true,
            },
        });

        //events
        Object.defineProperties(UiControl.prototype, {
            onResize: {
                get: function () { return this._onResize; },
                //enumerable: false,
                //configurable: true,
            },
            onLayoutChange: {
                get: function () { return this._onLayoutChange; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //methods
        UiControl.prototype.merge({
            verifyResize: function (caller) {
                if (this.hidden) return;

                var size = this._cachedSize;
                if (size.height !== this.height || size.width !== this.width)
                    this.onResize.dispatchEvent({ caller: caller });
            },
            addClassName: function (className) {
                if (typeof className === undefined) return;
                if (typeof className !== 'string')
                    throw new Error('invalid argument: expected "className" as string');

                this.__addClassName(this._dom.className, className);
                this.verifyResize(this);
            },
            __addClassName: function (classString, className) {
                var props = className.trim();
                if (props === '') return;

                props = props.split(/\s+/);
                var cls = classString.trim();
                if (cls === '')
                    cls = [];
                else
                    cls = cls.split(/\s+/);

                var val, l = props.length;
                for (var i = 0; i < l; i++) {
                    val = props[i];
                    cls.remove(val);
                    cls.push(val);
                }
                this._dom.className = cls.join(' ');
            },
            removeClassName: function (className) {
                if (typeof className === undefined) return;
                if (typeof className !== 'string')
                    throw new Error('invalid argument: expected "className" as string');

                this._dom.className = this.__removeClassName(className, true);
                this.verifyResize(this);
            },
            __removeClassName: function (className) {
                var props = className.trim();
                if (props === '') return;

                props = props.split(/\s+/);
                var cls = this._dom.className.trim();
                if (cls === '')
                    return cls;
                else
                    cls = cls.split(/\s+/);

                var l = props.length;
                for (var i = 0; i < l; i++)
                    cls.remove(props[i]);

                return cls.join(' ');
            },
            replaceClassName: function (existingClass, newClass) {  //replaces styles, triggeres dom update only once
                if (typeof existingClass === undefined) return;
                newClass = newClass || '';

                if (typeof existingClass !== 'string' || typeof newClass !== 'string')
                    throw new Error('invalid argument: expected typeof string');

                if (typeof newClass === undefined || newClass.trim() === '')
                    return this.removeClassName(existingClass);

                var domClasses = this._dom.className.split(/\s+/);
                var replaceClasses = existingClass.trim().split(/\s+/);
                var update = false;
                var l = replaceClasses.length;
                for (var i = 0; i < l; i++)
                    if (domClasses.remove(replaceClasses[i]) > 0) {
                        update = true;  //found
                        break;
                    }

                if (!update)  //nothing found to replace
                    return;

                var classString = this.__removeClassName(existingClass);
                this.__addClassName(classString, newClass);
                this.verifyResize(this);
            },
            _insertAtIndex: function (uiControl, idx) {
                if (uiControl._disposed)
                    throw new Error('object disposed');
                if (!(uiControl instanceof SmartJs.Ui.Control) && !(uiControl instanceof SmartJs.Ui.TextNode))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');
                if (typeof idx !== 'number')
                    throw new Error('invalid argument: idx, expected: typeof number');

                if (idx < 0 || idx > this._childs.length)
                    throw new Error('insertion point index out of range');

                var currentIdx = this._childs.indexOf(uiControl);
                if (currentIdx === idx)    //already on this position
                    return;

                var currentParent = uiControl._parent;
                currentIdx = -1;
                if (currentParent) {
                    currentIdx = currentParent._childs.indexOf(uiControl);
                    currentParent._removeChild(uiControl);
                    if (currentParent === this && currentIdx <= idx)
                        idx--;
                }
                else if (uiControl.rendered)    //an existing tag was used in an uiCOntrol Cntr
                    uiControl._dom.parentNode.removeChild(uiControl._dom);

                try {   //DOM manipulation
                    if (idx === this._childs.length)    //last position
                        this._dom.appendChild(uiControl._dom);
                    else
                        this._dom.insertBefore(uiControl._dom, this._childs[idx]._dom);
                }
                catch (e) {
                    if (currentParent)
                        currentParent._insertBefore(uiControl, currentParent._childs[currentIdx]);  //reappend to original parent or position on error
                    throw new Error(e.message + ', possibly caused by appending a control to one of its own child controls (recursion loop)');
                }
                uiControl._parent = this;
                this._childs.insert(uiControl, idx);

                uiControl.verifyResize(this);
                this.onLayoutChange.dispatchEvent({}, uiControl);
            },
            _appendChild: function (uiControl) {
                this._insertAtIndex(uiControl, this._childs.length);
            },
            _insertBefore: function (newUiC, existingUiC) {
                if (!(newUiC instanceof SmartJs.Ui.Control) && !(existingUiC instanceof SmartJs.Ui.Control))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');

                var idx = this._childs.indexOf(existingUiC);
                if (idx === -1)
                    throw new Error('reference control could not be found');

                this._insertAtIndex(newUiC, idx);
            },
            _insertAfter: function (newUiC, existingUiC) {
                if (!(newUiC instanceof SmartJs.Ui.Control) && !(newUiC instanceof SmartJs.Ui.TextNode) ||
                    !(existingUiC instanceof SmartJs.Ui.Control) && !(existingUiC instanceof SmartJs.Ui.TextNode))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');

                var idx = this._childs.indexOf(existingUiC);
                if (idx === -1)
                    throw new Error('reference control could not be found');

                this._insertAtIndex(newUiC, idx + 1);
            },
            _replaceChild: function (newUiC, existingUiC) {
                if (!(newUiC instanceof SmartJs.Ui.Control) && !(newUiC instanceof SmartJs.Ui.TextNode) ||
                    !(existingUiC instanceof SmartJs.Ui.Control) && !(existingUiC instanceof SmartJs.Ui.TextNode))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');

                var idx = this._childs.indexOf(existingUiC);
                if (idx === -1)
                    throw new Error('reference control could not be found');

                this._removeChild(existingUiC, true);
                try {
                    this._insertAtIndex(newUiC, idx + 1);
                }
                catch (e) {
                    this._insertAtIndex(existingUiC, idx);  //no changes on error
                    throw e;
                }
            },
            _removeChild: function (uiControl, suppressResizeEvent) {
                if (!(uiControl instanceof SmartJs.Ui.Control) && !(uiControl instanceof SmartJs.Ui.TextNode))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');

                if (uiControl._parent !== this) return;

                uiControl._parent = undefined;

                if (this._childs.remove(uiControl) > 0) {  //found in Array
                    this._dom.removeChild(uiControl._dom);
                    if (!suppressResizeEvent)
                        this.onLayoutChange.dispatchEvent();
                }
            },
            hide: function () {
                var style = this._dom.style;
                if (style.display === 'none') return;

                style.display = 'none';
                if (this._parent)
                    this._parent.onLayoutChange.dispatchEvent({}, this);
            },
            show: function () {
                var style = this._dom.style;
                if (style.display === 'block') return;

                style.display = 'block';
                if (this._parent)
                    this._parent.onLayoutChange.dispatchEvent({}, this);
            },

            dispose: function () {
                if (this._parent)
                    this._parent._removeChild(this);
                else if (this.rendered)    //in DOM but no parent: rootElement (viewPort)
                    this._dom.parentNode.removeChild(this._dom);

                //dispose childs first to avoid DOM level recursion error 
                //(deleting this._dom will delete all _dom sub elements as well)
                var childs = this._childs;
                if (childs) {
                    var l = childs.length;
                    for (var i = 0; i < l; i++)
                        childs[i].dispose();
                }
                SmartJs.Core.EventTarget.prototype.dispose.call(this);  //super.dispose();
            },

        });

        return UiControl;
    })(),

};

SmartJs.Ui.ContainerControl = (function () {
    UiContainerControl.extends(SmartJs.Ui.Control, false);

    function UiContainerControl(propObject) {
        SmartJs.Ui.Control.call(this, 'div', propObject);

        //this._containerDom = this._dom;
        //TODO: set this._innerDom
        //this._containerChilds = [];

        var _onResizeHandler = function () {
            //while elements docked in a UiControl listen on the resize event of their uiControl,
            //in a container the resize (dock) event of the parent is used for notification
            return;
            //TODO: check if container has changed before triggering an update on all included child objects

            //var cc = this._containerChilds;
            //for (var i = 0, l = cc.length; i < l; i++) {
            //    cc[i].onLayoutChange.dispatchEvent({width: this.innerWidth, height: this.innerHeight}, this);
            //}
        };
        this.onResize.addEventListener(new SmartJs.Event.EventListener(_onResizeHandler));
    }

    Object.defineProperties(UiContainerControl.prototype, {
        containerInnerHeight: {
            value: function () {
                return this._innerHeight;//_containerDom.clientHeight;
            },
            //enumerable: true,
            //configurable: true,
        },
        containerInnerWidth: {
            value: function () {
                return this._innerWidth;//_containerDom.clientWidth;
            },
            //enumerable: true,
            //configurable: true,
        },
    });

    UiContainerControl.prototype.merge({
        //adding and removing uiControls supported on container controls: make public
        appendChild: function (uiControl) {
            return this._appendChild(uiControl);//, this._containerChilds, this._containerDom);
        },
        insertBefore: function (existingUiC, newUiC) {
        },
        insertAfter: function (existingUiC, newUiC) {
        },
        replaceChild: function (existingUiC, newUiC) {
        },
        removeChild: function (uiControl) {
            return this._removeChild(uiControl);//, this._containerChilds, this._containerDom);
        },
        //clearContents: function () {
        //    throw new SmartJs.Error.NotImplementedException();//TODO: remove, delete, dispose all?
        //},
    });

    return UiContainerControl;
})();


SmartJs.Ui.ViewPort = (function () {
    ViewPort.extends(SmartJs.Ui.Control, false);

    function ViewPort() {//propObject) {
        SmartJs.Ui.Control.call(this, 'div', { style: { height: "100%", width: "100%", } });

        //var onResizeHandler = function () { };
        if (window.orientationchange)
            this._resizeHandlerReference = this._addDomListener(window, 'orientationchange', this.verifyResize);
        else
            this._resizeHandlerReference = this._addDomListener(window, 'resize', this.verifyResize);
        //TODO: close, refresh: dispose
    }

    ViewPort.prototype.merge({
        //TODO: load view/presenter
        dispose: function () {
            this._removeDomListener(this, 'orientationchange', this._resizeHandlerReference);
            this._removeDomListener(this, 'resize', this._resizeHandlerReference);

            SmartJs.Ui.Control.prototype.dispose.call(this);  //super.dispose();
        },
    });
    return ViewPort;
})();


