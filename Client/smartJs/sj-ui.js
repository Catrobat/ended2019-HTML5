/// <reference path="sj.js" />
/// <reference path="sj-error.js" />
/// <reference path="sj-core.js" />
/// <reference path="sj-event.js" />
'use strict';

SmartJs.Ui = {};    //user interface namespace

SmartJs.Ui.Window = (function () {  //static class
    Window.extends(SmartJs.Core.EventTarget);

    //ctr
    function Window() {

        this._hiddenProperty = "hidden";
        this._visible = true;

        //events
        //this._onLoad = new SmartJs.Event.Event(window);
        this._onResize = new SmartJs.Event.Event(window);
        this._onVisibilityChange = new SmartJs.Event.Event(window);

        //this._addDomListener(window, 'load', this._onLoadHandler);

        //var onResizeHandler = function () { };
        var resizeEventName = 'resize';
        if (window.orientationchange)
            resizeEventName = 'orientationchange';

        this._addDomListener(window, resizeEventName, function (e) { this._onResize.dispatchEvent({ height: this.height, width: this.width }); });
        //else
        //    this._resizeHandlerReference = this._addDomListener(window, 'resize', this._onResize.dispatchEvent({ height: this.height, width: this.width }));

        // Set the name of the hidden property and the change event for visibility
        var visibilityChangeEventName = "";
        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
            this._hiddenProperty = "hidden";
            visibilityChangeEventName = "visibilitychange";
        }
        else if (typeof document.mozHidden !== "undefined") {
            this._hiddenProperty = "mozHidden";
            visibilityChangeEventName = "mozvisibilitychange";
        }
        else if (typeof document.msHidden !== "undefined") {
            this._hiddenProperty = "msHidden";
            visibilityChangeEventName = "msvisibilitychange";
        }
        else if (typeof document.webkitHidden !== "undefined") {
            this._hiddenProperty = "webkitHidden";
            visibilityChangeEventName = "webkitvisibilitychange";
        }

        if (this._visibilityChangeEventName !== "")
            this._addDomListener(document, visibilityChangeEventName, this._visibilityChangeHandler);
        else {
            // IE 9 and lower:
            if ("onfocusin" in document) {
                //document.onfocusin = document.onfocusout = onchange;
                this._addDomListener(document, 'focusin', this._visibilityChangeHandler);
                this._addDomListener(document, 'focusout', this._visibilityChangeHandler);
            }
                // All others:
            else {
                //window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
                this._addDomListener(window, 'pageshow', this._visibilityChangeHandler);
                this._addDomListener(window, 'pagehide', this._visibilityChangeHandler);
                this._addDomListener(window, 'focus', this._visibilityChangeHandler);
                this._addDomListener(window, 'blur', this._visibilityChangeHandler);
            }
        }
    }

    //events
    Object.defineProperties(Window.prototype, {
        //onLoad: {
        //    get: function () { return this._onResize; },
        //    //enumerable: false,
        //    //configurable: true,
        //},
        onResize: {
            get: function () { return this._onResize; },
            //enumerable: false,
            //configurable: true,
        },
        onVisibilityChange: {
            get: function () { return this._onVisibilityChange; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //properties
    Object.defineProperties(Window.prototype, {
        title: {
            get: function () { return document.title; },
            set: function (value) { document.title = value; },
            //enumerable: false,
            //configurable: true,
        },
        visible: {
            get: function () {
                //if (document[this._hiddenProperty])
                //	return document[this._hiddenProperty];
                return this._visible;
            },
            //enumerable: false,
            //configurable: true,
        },
        height: {
            get: function () {
                if (window.innerHeight) {
                    return window.innerHeight;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    return document.documentElement.clientHeight;
                } else if (document.body.clientHeight) {
                    return document.body.clientHeight;
                }
                return 0;
            },
            //enumerable: false,
            //configurable: true,
        },
        width: {
            get: function () {
                if (window.innerWidth) {
                    return window.innerWidth;
                } else if (document.documentElement && document.documentElement.clientWidth) {
                    return document.documentElement.clientWidth;
                } else if (document.body.clientWidth) {
                    return document.body.clientWidth;
                }
                return 0;
            },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    Window.prototype.merge({
        //_onLoadHandler: function(e) {
        //    this._onLoad.dispatchEvent();
        //},
        _visibilityChangeHandler: function (e) {
            e = e || window.event;

            //if (e.target.visibilityState) {
            //    this._visible = e.target.visibilityState == 'visible' ? true : false;
            //}
            //else {
                //onfocusin and onfocusout are required for IE 9 and lower, while all others make use of onfocus and onblur, except for iOS, which uses onpageshow and onpagehide
                //var visible = {focus: true, focusin: true, pageshow: true};
                var hidden = { blur: false, focusout: false, pagehide: false };
                if (e.type in hidden)
                    this._visible = false;
                else
                    this._visible = e.target[this._hiddenProperty] ? false : true;//true;	//default
            //}
            this._onVisibilityChange.dispatchEvent({ visible: this._visible }.merge(e));
        },
        dispose: function () {
            //override as a static class cannot be disposed
        },

    });

    return Window;
})();
//static class: constructor override (keeping code coverage enabled)
SmartJs.Ui.Window = new SmartJs.Ui.Window();


SmartJs.Ui.merge({
    TextNode: (function () {
        TextNode.extends(SmartJs.Core.Component);//, false);

        function TextNode(text) {//, propObject) {
            this._text = text || '';
            this._dom = document.createTextNode(this._text);

            //SmartJs.Core.EventTarget.call(this);//, propObject);
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
            hide: function () {
                this._dom.textContent = '';
            },
            show: function () {
                this._dom.textContent = this._text;
            },
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
        Control.extends(SmartJs.Core.EventTarget, false);

        function Control(element, propObject) {
            this._id = SmartJs.getNewId();

            if (element instanceof HTMLElement)
                this._dom = element;
            else if (typeof element === 'string')
                this._dom = document.createElement(element);

            if (!this._dom)  // || this._dom instanceof HTMLUnknownElement)
                throw new Error('invalid argument: expected parameter "element" as valid HTMLElement or string');

            this._dom.id = this._id;
            //this._innerDom = this._dom;

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

                    var childs = this._childs;
                    for (var i = 0, l = childs.length; i < l; i++)
                        childs[i].verifyResize(this);
                }

                var parent = this._parent;
                if (parent && parent !== e.caller)
                    this._parent.onLayoutChange.dispatchEvent({ caller: this });
            }, this));

            this._onLayoutChange = new SmartJs.Event.Event(this);
            this._onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                var childs = this._childs;
                for (var i = 0, l = childs.length; i < l; i++) {
                    var child = childs[i];
                    if (child !== e.caller)
                        child.verifyResize(this);
                }

            }, this));

            //base constructor has to be called after creating dom to avoid errors: propObject->style not available
            SmartJs.Core.EventTarget.call(this, propObject);
        }

        //properties
        Object.defineProperties(Control.prototype, {
            id: {
                get: function () {
                    return this._id;
                },
                //enumerable: false,
                //configurable: true,
            },
            rendered: {
                get: function () {
                    if (!document.body)
                        return false;
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
                    var _style = window.getComputedStyle(this._dom);
                    var height = this._dom.clientHeight;
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

                    var _style = window.getComputedStyle(this._dom);
                    var width = this._dom.clientWidth;
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
        Object.defineProperties(Control.prototype, {
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
        Control.prototype.merge({
            verifyResize: function (caller) {
                if (this.hidden || !this.rendered) return;
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

                var val;
                for (var i = 0, l = props.length; i < l; i++) {
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

                for (var i = 0, l = props.length; i < l; i++)
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
                for (var i = 0, l = replaceClasses.length; i < l; i++)
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
            _insertAt: function (idx, uiControl) {
                if (!(uiControl instanceof SmartJs.Ui.Control) && !(uiControl instanceof SmartJs.Ui.TextNode))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');
                if (uiControl._disposed)
                    throw new Error('object disposed');
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
                this._childs.insert(idx, uiControl);

                uiControl.verifyResize(this);
                this.onLayoutChange.dispatchEvent({}, uiControl);
            },
            _appendChild: function (uiControl) {
                this._insertAt(this._childs.length, uiControl);
            },
            _insertBefore: function (newUiC, existingUiC) {
                if (!(newUiC instanceof SmartJs.Ui.Control) && !(existingUiC instanceof SmartJs.Ui.Control))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');

                var idx = this._childs.indexOf(existingUiC);
                if (idx === -1)
                    throw new Error('reference control could not be found');

                this._insertAt(idx, newUiC);
            },
            _insertAfter: function (newUiC, existingUiC) {
                if (!(newUiC instanceof SmartJs.Ui.Control) && !(newUiC instanceof SmartJs.Ui.TextNode) ||
                    !(existingUiC instanceof SmartJs.Ui.Control) && !(existingUiC instanceof SmartJs.Ui.TextNode))
                    throw new Error('invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode');

                var idx = this._childs.indexOf(existingUiC);
                if (idx === -1)
                    throw new Error('reference control could not be found');

                this._insertAt(idx + 1, newUiC);
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
                    this._insertAt(idx + 1, newUiC);
                }
                catch (e) {
                    this._insertAt(idx, existingUiC);  //no changes on error
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
                if (style.display === 'none')
                    return;

                this._styleBeforeHide = style.display;
                style.display = 'none';
                if (this._parent)
                    this._parent.onLayoutChange.dispatchEvent({}, this);
            },
            show: function () {
                var style = this._dom.style;
                if (style.display !== 'none')
                    return;

                style.display = this._styleBeforeHide || '';
                if (this._parent)
                    this._parent.onLayoutChange.dispatchEvent({}, this);
            },

            dispose: function () {
                if (this._parent)
                    this._parent._removeChild(this);
                else if (this.rendered)    //in DOM but no parent: rootElement (viewport)
                    this._dom.parentNode.removeChild(this._dom);

                //dispose childs first to avoid DOM level recursion error 
                //(deleting this._dom will delete all _dom sub elements as well)
                var childs = this._childs;
                if (childs) {
                    for (var i = 0, l = childs.length; i < l; i++)
                        childs[i].dispose();
                }
                SmartJs.Core.EventTarget.prototype.dispose.call(this);  //super.dispose();
            },

        });

        return Control;
    })(),

});

SmartJs.Ui.merge({
    ContainerControl: (function () {
        ContainerControl.extends(SmartJs.Ui.Control, false);

        function ContainerControl(propObject) {
            if (propObject && typeof propObject !== 'object')
                throw new Error('invalid argument: expected: propObject typeof object');

            SmartJs.Ui.Control.call(this, 'div', propObject);

            this.__container = this;   //the inner container gets stored here
            //this._container = this; //override this property to ensure child elements are added inside the container tag and not inside the _dom tag
        }

        Object.defineProperties(ContainerControl.prototype, {
            _container: {
                set: function (value) {
                    if (!(value instanceof SmartJs.Ui.Control))
                        throw new Error('invalid argument: inner container has to be of instance SmartJs.Ui.Control');
                    this.__container = value;
                },
                get: function () {
                    return this.__container;    //needed to add to parent control in inherited classes
                },
            },
            /* override */
            _innerWidth: {
                get: function () {
                    if (!this.rendered || !this.__container)
                        return 0;

                    var _style = window.getComputedStyle(this.__container._dom);
                    var width = this.__container._dom.clientWidth;
                    width -= parseInt(_style.paddingLeft) || 0;
                    width -= parseInt(_style.paddingRight) || 0;
                    return width;
                },
                //enumerable: true,
                //configurable: true,
            },
        });

        ContainerControl.prototype.merge({
            //mapping the methods to the inner container and provide public access
            appendChild: function (uiControl) {
                var cont = this.__container;
                cont.__container._insertAt(cont._childs.length, uiControl);
            },
            insertAt: function(idx, uiControl) {
                this.__container._insertAt(idx, uiControl);
            },
            insertBefore: function (existingUiC, newUiC) {
                return this.__container._insertBefore(existingUiC, newUiC);
            },
            insertAfter: function (existingUiC, newUiC) {
                return this.__container._insertAfter(existingUiC, newUiC);
            },
            replaceChild: function (existingUiC, newUiC) {
                return this.__container._replaceChild(existingUiC, newUiC);
            },
            removeChild: function (uiControl) {
                return this.__container._removeChild(uiControl);
            },
            removeAll: function() {
                var cont = this.__container;
                for (var i = 0, l = cont._childs.length; i < l; i++)
                    cont.removeChild(cont._childs[i]);
            },
            clearContents: function () {    //remove and dispose
                var cont = this.__container;
                for (var i = 0, l = cont._childs.length; i < l; i++)
                    cont._childs[i].dispose();
            },
        });

        return ContainerControl;
    })(),

    Viewport: (function () {
        Viewport.extends(SmartJs.Ui.Control, false);

        function Viewport(propObject) {
            SmartJs.Ui.Control.call(this, 'div', { style: { height: '100%', width: '100%', }, }.merge(propObject));

            this._window = SmartJs.Ui.Window;
            //this._parentContainer;
            this._resizeListener = new SmartJs.Event.EventListener(this.verifyResize, this);
            this._window.onResize.addEventListener(this._resizeListener);
        }

        //Object.defineProperties(Viewport.prototype, {
        //    //domElement: {
        //    //    get: function () { return this._dom; },
        //    //    //enumerable: false,
        //    //    //configurable: true,
        //    //},
        //});

        Viewport.prototype.merge({
            addToDom: function (parent) {
                if (parent !== undefined && !(parent instanceof HTMLElement))
                    throw new Error('invalid argument: dom: expectet type HTMLElement');
                var parent = parent || document.body;
                parent.appendChild(this._dom);
                //this._parentContainer = parent;
            },
            dispose: function () {
                this._window.onResize.removeEventListener(this._resizeListener);
                SmartJs.Ui.Control.prototype.dispose.call(this);  //super.dispose();
            },

            /*verifyResize: function (caller) {
                if (this.hidden || !this.rendered) return;
                var size = this._cachedSize;

                // console.log('VP:', this.height, size.height);
                if (size.height !== this.height || size.width !== this.width)
                    this.onResize.dispatchEvent({ caller: caller });

            },*/

        });

        return Viewport;
    })(),

});

