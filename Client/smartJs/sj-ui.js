/// <reference path="sj.js" />
/// <reference path="sj-error.js" />
/// <reference path="sj-core.js" />
/// <reference path="sj-event.js" />
'use strict';

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
            this._id = SmartJs.getNewId();

            if (element instanceof HTMLElement)
                this._dom = element;
            else if (typeof element === 'string')
                this._dom = document.createElement(element);

            if(!this._dom)  // || this._dom instanceof HTMLUnknownElement)
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

                    var childs = this._childs;
                    for (var i = 0, l = childs.length; i < l; i++)
                        childs[i].verifyResize(this);
                }
                var parent = this._parent;
                if (parent && parent !== e.caller)
                    this._parent.onLayoutChange.dispatchEvent({caller: this});
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
            _insertAtIndex: function(uiControl, idx) {
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
                    for (var i = 0, l = childs.length; i < l; i++) 
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
        SmartJs.Ui.Control.call(this, 'div', { style: {height: "100%", width: "100%", }});

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


