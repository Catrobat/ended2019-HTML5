"use strict"
Object.prototype.merge = function (t) {
    if ("object" != typeof this || this instanceof Array) throw Error("Object.merge not valid on simple data types and arrays")
    for (var e in t) t.hasOwnProperty(e) && ("object" == typeof this[e] && "object" == typeof t[e] ? this[e].merge(t[e]) : this[e] = t[e])
}, Object.defineProperty(Object.prototype, "merge", { enumerable: !1 }), Function.prototype.extends = function (t, e) {
    e = e !== !1 ? !0 : !1
    var i = this.prototype
    this.prototype = e ? new t : Object.create(t.prototype), this.prototype.constructor = i.constructor
}, Object.defineProperty(Function.prototype, "extends", { enumerable: !1 }), Array.prototype.insert = function (t, e) { this.splice(e, 0, t) }, Object.defineProperty(Array.prototype, "insert", { enumerable: !1 }), Array.prototype.remove = function (t) {
    for (var e, i = 0; -1 !== (e = this.indexOf(t)) ;) this.splice(e, 1), i++
    return i
}, Object.defineProperty(Array.prototype, "remove", { enumerable: !1 }), Array.prototype.dispose = function () {
    for (var t in this) this[t] && this[t].dispose && "function" == typeof this[t].dispose && this[t].dispose()
    this.length = 0
}, Object.defineProperty(Array.prototype, "dispose", { enumerable: !1 })
var SmartJs = {
    _version: .1, _objectId: 0, _getId: function () { return "sj-" + this._objectId++ }, Device: { isMobile: void 0 !== window.orientation || !!navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Phone|ZuneWP7|WPDesktop|webOS/i), isTouch: "ontouchstart" in window || navigator.msMaxTouchPoints > 0 }, isBrowserCompatible: function () {
        var t = !0, e = {
            Object_getPrototypeOf: function () { return Object.getPrototypeOf ? void 0 : (t = !1, !1) }(), Object_defineProperty: function () {
                if (!Object.defineProperty) return t = !1, !1
                var e = {}
                try { Object.defineProperty(e, "a", { value: "test", writable: !0, enumerable: !0, configurable: !0 }) } catch (i) { return t = !1, !1 } return !0
            }(), Array_indexOf: function () { return [].indexOf ? !0 : (t = !1, !1) }(), document_addEventListener: function () { return document.addEventListener ? !0 : (t = !1, !1) }(), event_stopPropagation: function () {
                var e = document.createEvent("MouseEvents")
                return e.initEvent("click", !1, !0), e.stopPropagation ? !0 : (t = !1, !1)
            }(), String_trim: function () { return "".trim ? !0 : (t = !1, !1) }(), window_getComputedStyle: function () { return window.getComputedStyle ? void 0 : (t = !1, !1) }(), css_box_sizing__border_box: function () {
                var e = document.createElement("div"), i = e.style
                i.position = "absolute", i.top = "-20px", i.left = "-20px", i.boxSizing = "border-box", i.border = "solid 3px black", i.height = "10px", i.width = "10px", document.body.appendChild(e)
                var r = 10 == e.offsetHeight && 10 == e.offsetWidth
                return document.body.removeChild(e), e = void 0, r ? !0 : (t = !1, !1)
            }(), xmlHttpRequest: function () { try { { new XMLHttpRequest } } catch (e) { return t = !1, !1 } return !0 }()
        }
        return { result: t, tests: e }
    }
}
SmartJs.Error = {
    Exception: function () {
        function t(t) {
            if ("string" == typeof t) this.message = t
            else {
                if ("object" != typeof t) throw Error('invalid argument: expected "args" of type string or object')
                this.merge(t)
            } this.stack = this.stack || ""
        } return t.extends(Error), t
    }()
}, SmartJs.Error.NotImplementedException = function () { function t() { SmartJs.Error.Exception.call(this, "Not implemented") } return t.extends(SmartJs.Error.Exception, !1), t }(), SmartJs.Error.InvalidArgumentException = function () { function t(t, e) { SmartJs.Error.Exception.call(this, { msg: 'Invalid argument: "' + t + '", expected: ' + e, argument: "" + t, expected: "" + e }) } return t.extends(SmartJs.Error.Exception, !1), t }(), SmartJs.Core = {}, SmartJs.Core.Component = function () {
    function t(t) { this._mergeProperties(t) } return Object.defineProperties(t.prototype, { objClassName: { get: function () { return ("" + this.constructor).match(/function\s*(\w+)/)[1] } } }), t.prototype.merge({
        __dispose: function (t) {
            if (!this._disposing && !this._disposed) {
                this._disposing = !0
                for (var e in this) this.hasOwnProperty(e) && (t && "function" == typeof this[e] || (this[e] && this[e].dispose && "function" == typeof this[e].dispose && this[e].dispose(), "_disposing" !== e && delete this[e]))
                var i = Object.getPrototypeOf(this)
                i.__dispose && i.__dispose(!0), delete this._disposing
            }
        }, dispose: function () { this.__dispose(), delete this.constructor, this._disposed = !0 }, _mergeProperties: function (t, e) {
            if (t) {
                if (e = e || this, "object" != typeof t) throw Error('invalid argument: expectet "propertyObject typeof object')
                for (var i in t) {
                    if (void 0 === e[i]) throw Error('property "' + i + '" not found in ' + e.objClassName)
                    if ("function" == typeof e[i]) throw Error("setting a method not allowed: property " + i + " in " + e.objClassName)
                    if ("object" == typeof t[i] && "array" != typeof t[i]) this._mergeProperties(t[i], e[i])
                    else if (e[i] = t[i], e instanceof CSSStyleDeclaration && e[i] !== t[i]) throw Error('invalid parameter: constructor parameter object "' + i + '" was not set correctly')
                }
            }
        }
    }), t
}(), SmartJs.Core.EventTarget = function () {
    function t(t) { SmartJs.Core.Component.call(this, t) } return t.extends(SmartJs.Core.Component, !1), t.prototype.merge({
        _addDomListener: function (t, e, i) {
            var r = this, n = function (t) { return t.stopPropagation(), i.call(r, t) }
            return t.addEventListener(e, n, !1), n
        }, _removeDomListener: function (t, e, i) { t.removeEventListener(e, i, !1) }
    }), t
}(), SmartJs.Event = {
    Event: function () {
        function t(t) {
            if (!(t instanceof SmartJs.Core.Component)) throw Error("invalid argument: expected target type: SmartJs.Core.Component")
            this.target = t, this._listeners = []
        } return t.extends(SmartJs.Core.Component), t.prototype.merge({
            addEventListener: function (t) {
                if (!(t instanceof SmartJs.Event.EventListener)) throw Error("invalid argument: expected listener type: SmartJs.Event.EventListener")
                var e = this.__listenerIndex(t)
                return -1 == e ? (this._listeners.push(t), !0) : !1
            }, removeEventListener: function (t) {
                if (!(t instanceof SmartJs.Event.EventListener)) throw Error("invalid argument: expected listener type: SmartJs.Event.EventListener")
                var e = this.__listenerIndex(t)
                return e >= 0 ? (this._listeners.splice(e, 1), !0) : !1
            }, __listenerIndex: function (t) {
                var e = this._listeners.indexOf(t)
                if (e >= 0) return e
                for (var i, r = this._listeners, n = r.length, o = 0; n > o; o++) if (i = r[o], i.handler === t.handler && i.scope === t.scope) return o
                return -1
            }, dispatchEvent: function (t, e, i) {
                if (void 0 !== t && "object" != typeof t) throw Error("invalid argument: expected optional argument (args) type: object")
                if (void 0 !== e && "object" != typeof e) throw Error("invalid argument: expected optional target type: object")
                if (void 0 !== i && "boolean" != typeof i) throw Error("invalid argument: expected optional bubbles type: boolean")
                var r = t || {}
                r.target = e || this.target, r.bubbles = i || !1
                for (var n, o = this._listeners, s = o.length, a = 0; s > a; a++) n = o[a], n.scope ? n.handler.call(n.scope, r) : n.handler(r)
            }
        }), t
    }(), EventListener: function () {
        function t(t, e) {
            if ("function" != typeof t) throw Error("invalid argument: expected handler type: function")
            if (void 0 !== e && "object" != typeof e) throw Error("invalid argument: expected optional scope type: object")
            this.handler = t, this.scope = e
        } return t
    }()
}, SmartJs.Ui = {
    TextNode: function () { function t(t) { this._text = t, this._dom = document.createTextNode(this._text), SmartJs.Core.EventTarget.call(this) } return t.extends(SmartJs.Core.Component, !1), Object.defineProperties(t.prototype, { text: { get: function () { return this._text }, set: function (t) { this._text = t, this._dom.textContent = t } } }), t.prototype.merge({ verifyResize: function () { }, dispose: function () { this._parent ? this._parent._removeChild(this) : document.body.contains(this._dom) && this._dom.parentNode.removeChild(this._dom), SmartJs.Core.Component.prototype.dispose.call(this) } }), t }(), Control: function () {
        function t(t, e) {
            if (this._id = SmartJs._getId(), t instanceof HTMLElement ? this._dom = t : "string" == typeof t && (this._dom = document.createElement(t)), !this._dom || this._dom instanceof HTMLUnknownElement) throw Error('invalid argument: expected parameter "element" as valid HTMLElement or string')
            this._dom.id = this._id, this._innerDom = this._dom, this._parent = void 0, this._childs = [], this._cachedSize = { height: 0, width: 0, innerHeight: 0, innerWidth: 0 }, this._onResize = new SmartJs.Event.Event(this), this._onResize.addEventListener(new SmartJs.Event.EventListener(function (t) {
                var e = this._cachedSize
                if (e.height = this.height, e.width = this.width, e.innerHeight !== this._innerHeight || e.innerWidth !== this._innerWidth) {
                    e.innerHeight = this._innerHeight, e.innerWidth = this._innerWidth
                    for (var i = this._childs, r = i.length, n = 0; r > n; n++) i[n].verifyResize(this)
                } var o = this._parent
                o && o !== t.caller && this._parent.onLayoutChange.dispatchEvent({ caller: this })
            }, this)), this._onLayoutChange = new SmartJs.Event.Event(this), this._onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (t) {
                for (var e = this._childs, i = e.length, r = 0; i > r; r++) {
                    var n = e[r]
                    n !== t.caller && n.verifyResize(this)
                }
            }, this)), SmartJs.Core.EventTarget.call(this, e)
        } return t.extends(SmartJs.Core.EventTarget, !1), Object.defineProperties(t.prototype, {
            id: { get: function () { return this._id } }, rendered: { get: function () { return document.body.contains(this._dom) } }, style: {
                get: function () { return this._dom.style }, set: function (t) {
                    if ("object" != typeof t || t instanceof Array) throw Error('invalid parameter: expected "value" typeof object')
                    var e = this._dom.style
                    e.cssText = ""
                    for (var i in t) {
                        if (void 0 === e[i]) throw Error('invalid parameter: "' + i + '" not defined in style')
                        e[i] = t[i]
                    } this.verifyResize()
                }
            }, className: { get: function () { return this._dom.className }, set: function (t) { this._dom.className = t, this.verifyResize() } }, height: {
                get: function () {
                    if (!this.rendered) return 0
                    var t = window.getComputedStyle(this._dom), e = this._dom.offsetHeight
                    return e += parseInt(t.marginTop) || 0, e += parseInt(t.marginBottom) || 0
                }, set: function (t) {
                    if ("number" != typeof t) throw Error('invalid argument: expected "value" typeof "number" (px)')
                    var e = window.getComputedStyle(this._dom)
                    "border-box" !== e.boxSizing && (t -= parseInt(e.paddingTop) || 0, t -= parseInt(e.paddingBottom) || 0, t -= parseInt(e.borderTopWidth) || 0, t -= parseInt(e.borderBottomWidth) || 0), t -= parseInt(e.marginTop) || 0, t -= parseInt(e.marginBottom) || 0, t += "px", this.style.height !== t && (this.style.height = t, this.verifyResize())
                }
            }, _innerHeight: {
                get: function () {
                    if (!this.rendered) return 0
                    var t = window.getComputedStyle(this._innerDom), e = this._innerDom.clientHeight
                    return e -= parseInt(t.paddingTop) || 0, e -= parseInt(t.paddingBottom) || 0
                }
            }, width: {
                get: function () {
                    if (!this.rendered) return 0
                    var t = window.getComputedStyle(this._dom), e = this._dom.offsetWidth
                    return e += parseInt(t.marginLeft) || 0, e += parseInt(t.marginRight) || 0
                }, set: function (t) {
                    if ("number" != typeof t) throw Error('invalid argument: expected "value" typeof "number" (px)')
                    var e = window.getComputedStyle(this._dom)
                    "border-box" !== e.boxSizing && (t -= parseInt(e.paddingLeft) || 0, t -= parseInt(e.paddingRight) || 0, t -= parseInt(e.borderLeftWidth) || 0, t -= parseInt(e.borderRightWidth) || 0), t -= parseInt(e.marginLeft) || 0, t -= parseInt(e.marginRight) || 0, t += "px", this.style.width !== t && (this.style.width = t, this.verifyResize())
                }
            }, _innerWidth: {
                get: function () {
                    if (!this.rendered) return 0
                    var t = window.getComputedStyle(this._innerDom), e = this._innerDom.clientWidth
                    return e -= parseInt(t.paddingLeft) || 0, e -= parseInt(t.paddingRight) || 0
                }
            }, hidden: {
                get: function () {
                    var t = this._dom.style.display
                    return "" === t || "block" === t ? !1 : !0
                }
            }
        }), Object.defineProperties(t.prototype, { onResize: { get: function () { return this._onResize } }, onLayoutChange: { get: function () { return this._onLayoutChange } } }), t.prototype.merge({
            verifyResize: function (t) { if (!this.hidden) { var e = this._cachedSize; (e.height !== this.height || e.width !== this.width) && this.onResize.dispatchEvent({ caller: t }) } }, addClassName: function (t) {
                if (void 0 !== typeof t) {
                    if ("string" != typeof t) throw Error('invalid argument: expected "className" as string')
                    this.__addClassName(this._dom.className, t), this.verifyResize(this)
                }
            }, __addClassName: function (t, e) {
                var i = e.trim()
                if ("" !== i) {
                    i = i.split(/\s+/)
                    var r = t.trim()
                    r = "" === r ? [] : r.split(/\s+/)
                    for (var n, o = i.length, s = 0; o > s; s++) n = i[s], r.remove(n), r.push(n)
                    this._dom.className = r.join(" ")
                }
            }, removeClassName: function (t) {
                if (void 0 !== typeof t) {
                    if ("string" != typeof t) throw Error('invalid argument: expected "className" as string')
                    this._dom.className = this.__removeClassName(t, !0), this.verifyResize(this)
                }
            }, __removeClassName: function (t) {
                var e = t.trim()
                if ("" !== e) {
                    e = e.split(/\s+/)
                    var i = this._dom.className.trim()
                    if ("" === i) return i
                    i = i.split(/\s+/)
                    for (var r = e.length, n = 0; r > n; n++) i.remove(e[n])
                    return i.join(" ")
                }
            }, replaceClassName: function (t, e) {
                if (void 0 !== typeof t) {
                    if (e = e || "", "string" != typeof t || "string" != typeof e) throw Error("invalid argument: expected typeof string")
                    if (void 0 === typeof e || "" === e.trim()) return this.removeClassName(t)
                    for (var i = this._dom.className.split(/\s+/), r = t.trim().split(/\s+/), n = !1, o = r.length, s = 0; o > s; s++) if (i.remove(r[s]) > 0) {
                        n = !0
                        break
                    } if (n) {
                        var a = this.__removeClassName(t)
                        this.__addClassName(a, e), this.verifyResize(this)
                    }
                }
            }, _insertAtIndex: function (t, e) {
                if (t._disposed) throw Error("object disposed")
                if (!(t instanceof SmartJs.Ui.Control || t instanceof SmartJs.Ui.TextNode)) throw Error("invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode")
                if ("number" != typeof e) throw Error("invalid argument: idx, expected: typeof number")
                if (0 > e || e > this._childs.length) throw Error("insertion point index out of range")
                var i = this._childs.indexOf(t)
                if (i !== e) {
                    var r = t._parent
                    i = -1, r ? (i = r._childs.indexOf(t), r._removeChild(t), r === this && e >= i && e--) : t.rendered && t._dom.parentNode.removeChild(t._dom)
                    try { e === this._childs.length ? this._dom.appendChild(t._dom) : this._dom.insertBefore(t._dom, this._childs[e]._dom) } catch (n) { throw r && r._insertBefore(t, r._childs[i]), Error(n.message + ", possibly caused by appending a control to one of its own child controls (recursion loop)") } t._parent = this, this._childs.insert(t, e), t.verifyResize(this), this.onLayoutChange.dispatchEvent({}, t)
                }
            }, _appendChild: function (t) { this._insertAtIndex(t, this._childs.length) }, _insertBefore: function (t, e) {
                if (!(t instanceof SmartJs.Ui.Control || e instanceof SmartJs.Ui.Control)) throw Error("invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode")
                var i = this._childs.indexOf(e)
                if (-1 === i) throw Error("reference control could not be found")
                this._insertAtIndex(t, i)
            }, _insertAfter: function (t, e) {
                if (!((t instanceof SmartJs.Ui.Control || t instanceof SmartJs.Ui.TextNode) && (e instanceof SmartJs.Ui.Control || e instanceof SmartJs.Ui.TextNode))) throw Error("invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode")
                var i = this._childs.indexOf(e)
                if (-1 === i) throw Error("reference control could not be found")
                this._insertAtIndex(t, i + 1)
            }, _replaceChild: function (t, e) {
                if (!((t instanceof SmartJs.Ui.Control || t instanceof SmartJs.Ui.TextNode) && (e instanceof SmartJs.Ui.Control || e instanceof SmartJs.Ui.TextNode))) throw Error("invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode")
                var i = this._childs.indexOf(e)
                if (-1 === i) throw Error("reference control could not be found")
                this._removeChild(e, !0)
                try { this._insertAtIndex(t, i + 1) } catch (r) { throw this._insertAtIndex(e, i), r }
            }, _removeChild: function (t, e) {
                if (!(t instanceof SmartJs.Ui.Control || t instanceof SmartJs.Ui.TextNode)) throw Error("invalid argument: uiControl, expected: instance of SmartJs.Ui.Control or SmartJs.Ui.TextNode")
                t._parent === this && (t._parent = void 0, this._childs.remove(t) > 0 && (this._dom.removeChild(t._dom), e || this.onLayoutChange.dispatchEvent()))
            }, hide: function () {
                var t = this._dom.style
                "none" !== t.display && (t.display = "none", this._parent && this._parent.onLayoutChange.dispatchEvent({}, this))
            }, show: function () {
                var t = this._dom.style
                "block" !== t.display && (t.display = "block", this._parent && this._parent.onLayoutChange.dispatchEvent({}, this))
            }, dispose: function () {
                this._parent ? this._parent._removeChild(this) : this.rendered && this._dom.parentNode.removeChild(this._dom)
                var t = this._childs
                if (t) for (var e = t.length, i = 0; e > i; i++) t[i].dispose()
                SmartJs.Core.EventTarget.prototype.dispose.call(this)
            }
        }), t
    }()
}, SmartJs.Ui.ContainerControl = function () {
    function t(t) {
        SmartJs.Ui.Control.call(this, "div", t)
        var e = function () { }
        this.onResize.addEventListener(new SmartJs.Event.EventListener(e))
    } return t.extends(SmartJs.Ui.Control, !1), Object.defineProperties(t.prototype, { containerInnerHeight: { value: function () { return this._innerHeight } }, containerInnerWidth: { value: function () { return this._innerWidth } } }), t.prototype.merge({ appendChild: function (t) { return this._appendChild(t) }, insertBefore: function () { }, insertAfter: function () { }, replaceChild: function () { }, removeChild: function (t) { return this._removeChild(t) } }), t
}(), SmartJs.Ui.ViewPort = function () { function t() { SmartJs.Ui.Control.call(this, "div", { style: { height: "100%", width: "100%" } }), this._resizeHandlerReference = window.orientationchange ? this._addDomListener(window, "orientationchange", this.verifyResize) : this._addDomListener(window, "resize", this.verifyResize) } return t.extends(SmartJs.Ui.Control, !1), t.prototype.merge({ dispose: function () { this._removeDomListener(this, "orientationchange", this._resizeHandlerReference), this._removeDomListener(this, "resize", this._resizeHandlerReference), SmartJs.Ui.Control.prototype.dispose.call(this) } }), t }()