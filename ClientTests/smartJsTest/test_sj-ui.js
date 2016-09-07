/// <reference path="../../client/_smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-ui.js" />
/// <reference path="../qunit/qunit-1.23.0.js" />
'use strict';

QUnit.module("sj-ui.js");

QUnit.test("SmartJs.Ui.Window", function (assert) {

    assert.throws(function () { var window = new SmartJs.Ui.Window(); }, Error, "ERROR: static, no class definition/constructor");
    assert.throws(function () { SmartJs.Ui.Window instanceof SmartJs.Ui.Window }, Error, "ERROR: static class: no instanceof allowed");

    var win = SmartJs.Ui.Window;

    //disposing without efect on the object
    var visible = win._visible;
    win.dispose()
    assert.ok(win._visible != undefined && win._visible === visible, "dispose: no effect");

    assert.ok(win instanceof SmartJs.Core.EventTarget, "instance + inheritance check"); //win instanceof SmartJs.Ui.Window && 
    assert.ok(win.objClassName === "Window", "objClassName check");

    assert.ok(win.onResize instanceof SmartJs.Event.Event, "onResize event accessor");
    assert.ok(win.onVisibilityChange instanceof SmartJs.Event.Event, "onVisibilityChange event accessor");

    win.title = "new window title";
    assert.equal(win.title, "new window title", "title getter/setter");

    var handlerCalled = 0;
    var visHandler = function (e) {
        handlerCalled = 1;
    };
    win.onVisibilityChange.addEventListener(new SmartJs.Event.EventListener(visHandler, this));
    win._visibilityChangeHandler({});   //simulate event
    assert.equal(handlerCalled, 1, "visibility change dispatched");
    assert.equal(win.visible, true, "check visibility accessor");

    assert.ok(win.height > 0, "height accessor");
    assert.ok(win.width > 0, "width accessor");
});


QUnit.test("SmartJs.Ui.TextNode", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var div = document.createElement("div");
    dom.appendChild(div);

    var tn = new SmartJs.Ui.TextNode();
    assert.ok(tn instanceof SmartJs.Ui.TextNode && tn instanceof SmartJs.Core.Component && tn instanceof Object, "instance check");
    assert.equal(tn.objClassName, "TextNode", "objClassName check");

    tn.text = "NEW TEXT NODE";
    assert.equal(tn.text, "NEW TEXT NODE", "textnode: get/set text");

    var vp = new SmartJs.Ui.Control(div);   //if you make dom a Control in UnitTests the ID will change and cause errors on other test cases
    vp._appendChild(tn);
    assert.equal(div.innerHTML, tn.text, "textnode: append");

    vp._removeChild(tn);
    assert.equal(div.innerHTML, "", "textnode: remove");

    tn = new SmartJs.Ui.TextNode("ANOTHER TEXT");
    assert.equal(tn.text, "ANOTHER TEXT", "textnode: constructor text");
    var layoutChangeCounter = 0;
    var layoutChangeHandler = function (e) {
        layoutChangeCounter++;
    };
    vp.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(layoutChangeHandler, this));
    vp._appendChild(tn);
    assert.equal(div.innerHTML, tn.text, "textnode: append (constructor text)");
    assert.equal(layoutChangeCounter, 1, "parent layout change was triggered: parent logic");
    tn.text = "new text.. longer than the original";
    assert.equal(layoutChangeCounter, 2, "parent layout change was triggered: on resize");

    tn.dispose();
    assert.notEqual(vp._dom, undefined, "textnode: parent still in DOM");
    assert.equal(vp._dom.innerHTML, '', "textnode: disposed (DOM)");
    assert.ok(tn._disposed, "textnode: marked as disposed");

    //more than one text node can be changed by the browser (loosing their references): old?
    var tn1 = new SmartJs.Ui.TextNode(" A ");
    var tn2 = new SmartJs.Ui.TextNode(" B ");
    var tn3 = new SmartJs.Ui.TextNode(" C ");
    var tn4 = new SmartJs.Ui.TextNode(" D ");
    var tn5 = new SmartJs.Ui.TextNode(" E ");
    var tn6 = new SmartJs.Ui.TextNode(" F ");
    vp._appendChild(tn1);
    vp._appendChild(tn2);
    vp._appendChild(tn3);
    vp._appendChild(tn4);
    vp._appendChild(tn5);
    vp._appendChild(tn6);

    assert.equal(vp._dom.innerHTML, " A  B  C  D  E  F ", "textnode: several appended");

    tn2.hide();
    tn4.hide();
    assert.equal(vp._dom.innerHTML, " A  C  E  F ", "textnode: hide");

    tn2.show();
    tn4.show();
    assert.equal(vp._dom.innerHTML, " A  B  C  D  E  F ", "textnode: show");

    tn2.dispose();
    tn4.dispose();
    tn5.dispose();
    assert.equal(vp._dom.innerHTML, " A  C  F ", "textnode: dispose single node references");

    //dispose from document dom (without sj-ui-control as parent)
    tn = new SmartJs.Ui.TextNode("ANOTHER TEXT");
    dom.appendChild(tn._dom);
    tn.dispose();
    assert.equal(tn._disposed, true, "disposed");
    assert.equal(document.body.contains(tn._dom), false, "textnode: delete from dom during dispose");

});


QUnit.test("SmartJs.Ui.Control", function (assert) {

    var dom = document.getElementById("qunit-fixture");

    //create Control
    var cp = new SmartJs.Ui.Control("div");
    assert.ok(cp instanceof SmartJs.Ui.Control && cp instanceof SmartJs.Core.EventTarget, "instance check");
    assert.equal(cp.objClassName, "Control", "objClassName correct (not equal namespace)");
    assert.ok(cp._dom instanceof HTMLDivElement, "constructor using string");

    var div = document.createElement("div");
    cp = new SmartJs.Ui.Control(div);
    assert.ok(cp._dom instanceof HTMLDivElement, "constructor using html element");
    assert.equal(cp._dom.id, cp._id, "Control id = dom element id");

    assert.throws(function () { var x = new SmartJs.Ui.Control(); }, Error, "ERROR: empty constructor call");
    assert.throws(function () { var x = new SmartJs.Ui.Control("div", "invalid"); }, Error, "ERROR: invalid propObject argument");
    //assert.throws(function () { var x = new SmartJs.Ui.Control("div2"); }, Error, "ERROR: invalid constructor call: args");
    //div = document.createElement("div2");
    //assert.throws(function () { var x = new SmartJs.Ui.Control(div); }, Error, "ERROR: invalid constructor call: HTMLElement");

    div = document.createElement("div");
    dom.appendChild(div);
    cp = new SmartJs.Ui.Control(div);   //id is applied
    var el = document.getElementById(cp.id);
    assert.ok(el instanceof HTMLDivElement, "DOM id check");
    
    //id
    assert.equal(cp._dom.id, cp.id, "Control id getter");
    //assert.throws(function () { cp.id = 5; }, Error, "ERROR: Control id setter");
    //^^ IE9 will ignore the setter without throwing an error
    var id = cp.id;
    try {
        cp.id = 5;
    }
    catch (e) { }
    assert.equal(id, cp.id, "control id write protected");

    assert.ok(cp.rendered, "check rendering state (dom based construction)");
    var cp = new SmartJs.Ui.Control("div");
    assert.ok(!cp.rendered, "check rendering state (new)");
    dom.appendChild(cp._dom);
    assert.ok(cp.rendered, "check rendering state (after append)");

    //hide, show, hidden
    assert.ok(!cp.hidden, "hidden: false on unset control");
    cp.hide();
    assert.ok(cp.hidden, "hidden: true after control.hide()");

    var testParent = {
        onLayoutChange: new SmartJs.Event.Event(this),
    }
    cp._parent = testParent;
    var onLayoutChangeCalled = 0;
    var onLayoutChangeHandler = function (e) {
        onLayoutChangeCalled++;
    }
    testParent.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(onLayoutChangeHandler, this));
    cp.hide();  //called twice: code coverage shows that no event is triggered 
    assert.equal(onLayoutChangeCalled, 0, "no onLayoutChange event triggerd if already hidden");

    cp._parent = undefined;
    cp.show();
    assert.ok(!cp.hidden, "hidden: false after control.show()");

    cp._parent = testParent;
    cp.show();  //called twice: code coverage shows that no event is triggered 
    assert.equal(onLayoutChangeCalled, 0, "no onLayoutChange event triggerd if already visible");
    cp._parent = undefined;

    //dispose (+childs)
    cp.dispose();
    assert.ok(cp._disposed === true && this.id === undefined && this.objClassName === undefined, "recursive dispose");

    //merging objects in constructor: this tests could not be defined in component as there are no properties that can be set
    var e = new SmartJs.Ui.Control("div", { height: 12, width: 24, className: "asd", style: { position: "relative", borderWidth: "2px" } });
    dom.appendChild(e._dom);   //insert before check.. otherwise height/width will return 0
                                //check if style overrides the styles set by width/height properties
    assert.ok(e.height === 12 && e.width === 24 && e.className === "asd" && e.style.position === "relative" && e.style.borderWidth === "2px", "merging/setting complex object using constructor (height, width not overridden)");
    
    assert.throws(function () {
        e = new SmartJs.Ui.Control("div", { undefined: "asd", height: 12, width: 24, className: "asd", style: { position: "relative", borderWidth: "2px" } });
    }, Error, "ERROR: undefined property");

    assert.throws(function () {
        e = new SmartJs.Ui.Control("div", { height: 12, width: 24, className: "asd", style: { position: "relative", borderHeight: "2px" } });
    }, Error, "ERROR: undefined style property");

    assert.throws(function () {
        e = new SmartJs.Ui.Control("div", { height: 12, width: 24, className: "asd", style: { position: "relative", borderWidth: "asd" } });
    }, Error, "ERROR: invalid style property type");

    //try {
    //    e = new SmartJs.Ui.Control("div", { height: 12, width: 24, className: "asd", style: { position: "relative", borderWidth: 2 } });
    //}
    //catch (e) {
    //    alert(e.message);
    //}

    //var breakPoint = true;
});


QUnit.test("SmartJs.Ui.Control: add, insert, ..., remove, dispose (embedded ui)", function (assert) {

    var dom = document.getElementById("qunit-fixture");

    var root = new SmartJs.Ui.Control('div');   //control container to test with
    var root2 = new SmartJs.Ui.Control('div');
    //dom.appendChild(root._dom);

    var disposedBtn = new SmartJs.Ui.Control("button");
    disposedBtn.dispose();
    assert.throws(function () { root._appendChild(disposedBtn); }, Error, "ERROR: adding disposed control");

    var button = new SmartJs.Ui.Control('button', { height: 20, width: 60 });

    root._appendChild(button);
    assert.equal(root._childs.length, 1, "append: control added to childs");
    assert.notEqual(root._dom.innerHTML, "", "append: control added to inner DOM");
    assert.ok(root._dom.contains(button._dom), "append: control added to parents DOM");
    assert.equal(button._parent, root, "append: controls _parent set correctly");

    dom.appendChild(root._dom);
    dom.appendChild(root2._dom);
    assert.ok(document.getElementById(button.id) instanceof HTMLButtonElement, "append: inner control rendered after applying to DOM");

    root._removeChild(button);
    assert.equal(root._childs.length, 0, "remove: control removed from childs");
    assert.equal(root._dom.innerHTML, "", "remove: control removed from inner DOM");
    assert.equal(button._parent, undefined, "remove: controls _parent (unset)");

    var button2 = new SmartJs.Ui.Control('button', { height: 20, width: 60 });
    root._appendChild(button);
    root._appendChild(button2);
    root._appendChild(button);
    //root._appendChild(button);  //not moved -> tested in browser dom
    assert.equal(root._childs.length, 2, "append: control only inserted once in _childs list");
    assert.ok(document.getElementById(button.id) instanceof HTMLButtonElement && document.getElementById(button2.id) instanceof HTMLButtonElement, "append: both controls inserted in DOM");

    root2._appendChild(button);
    assert.equal(root._childs.length, 1, "append move: controls removed from list if parent changed");
    assert.equal(root2._childs.length, 1, "append move: control removed and added");
    assert.ok(document.getElementById(button.id).parentElement.id === root2.id && document.getElementById(button2.id).parentElement.id === root.id, "append: controls moved correctly");
    assert.equal(button._parent, root2, "append move: controls _parent set correctly");

    button.dispose();
    assert.equal(button._disposed, true, "dispose: marked as disposed");
    assert.equal(root2._childs.length, 0, "dispose (simple): removed from childs");
    assert.equal(root2._dom.innerHTML, "", "dispose (simple): removed from DOM");

    button = new SmartJs.Ui.Control('button', { height: 20, width: 60 });
    button2._appendChild(button);

    //append control to its own child control
    assert.throws(function () { button._appendChild(button2); }, Error, "ERROR: recursion check (browser internal) for appending control to one of its child controls");
    assert.equal(button._parent, button2, "error has no impact on parent node");
    assert.equal(button2._childs.length, 1, "error has no impact on childs list");

    //move inside parent node
    root._appendChild(button);
    root._appendChild(button2);
    var img = new SmartJs.Ui.Control('img', { height: 20, width: 60 });
    root._appendChild(img);
    root._appendChild(button2);
    assert.equal(root._childs[2], button2, "move: insert on correct position");
    assert.equal(root._childs[1], img, "move: item (after) moved to next position");

    assert.throws(function () { root._insertAt("invalidIndex", button); }, Error, "ERROR: _insertAt: invalid index");
    root._insertAt(root._childs.length, button);
    assert.equal(root._childs[root._childs.length - 1], button, "move: item moved to end- index calculated correctly");
    root._insertAt(0, button);
    assert.equal(root._childs[0], button, "move: item moved to first- index calculated correctly");

    assert.throws(function () { root._insertBefore("invalid", button); }, Error, "ERROR: insertBefore: invlaid argument: new control");
    root._insertBefore(button2, button);
    assert.equal(root._childs[0], button2, "_insertBefore: item moved to first- index calculated correctly");

    assert.throws(function () { root._insertAfter("invalid", button); }, Error, "ERROR: insertAfter: invlaid argument: new control");
    assert.throws(function () { root._insertAfter(button2, new SmartJs.Ui.Control("div")); }, Error, "ERROR: insertAfter: reference control not found");
    root._insertAfter(button2, button);
    assert.equal(root._childs[1], button2, "_insertAfter: item moved to first- index calculated correctly");

    assert.throws(function () { root._replaceChild("invalid", button); }, Error, "ERROR: replaceChild: invlaid argument: new control");
    assert.throws(function () { root._replaceChild(button2, new SmartJs.Ui.Control("div")); }, Error, "ERROR: replaceChild: reference control not found");
    var tn = new SmartJs.Ui.TextNode();
    root._replaceChild(tn, button);
    assert.equal(root._childs[0], tn, "_replaceChild: 1st item replaced");
    assert.equal(root._childs[1], button2, "_replaceChild: 2nd item not moved");
    root._replaceChild(button, tn); //switch back to continue existing tests without error

    //handle controls using dom ctr
    var divElement = document.createElement('div');
    divElement.id = "asd";
    dom.appendChild(divElement);
    divElement = document.createElement('div');
    divElement.id = "jkl";
    dom.appendChild(divElement);
    var asd = new SmartJs.Ui.Control(document.getElementById("asd"));
    var jkl = new SmartJs.Ui.Control(document.getElementById("jkl"));
    assert.ok(asd instanceof SmartJs.Ui.Control && jkl instanceof SmartJs.Ui.Control, "dom check: elements created correctly");
    jkl._appendChild(asd);
    assert.ok(asd._parent === jkl, "moved correctly: removed from DOM even there was no parent defined");

    assert.throws(function () { root._insertAt(root._childs.length + 1, button2); }, Error, "ERROR: wrong index");
    assert.throws(function () { root._insertAt(root._childs.length, 23); }, Error, "ERROR: type error");
    assert.throws(function () { root._insertBefore(button2, 23); }, Error, "ERROR: reference item not found");

    button2._appendChild(button);   //button2 idx=0
    assert.throws(function () { button._appendChild(button2); }, Error, "ERROR: recursion");
    assert.equal(root._childs[0], button2, "index not changed on error");

    button2.dispose();
    assert.equal(button._disposed, true, "dispose: item disposed");
    assert.equal(button2._disposed, true, "dispose: sub item disposed");
    assert.equal(root._childs[0], img, "dispose: item repositioned during dispose");

    jkl.dispose();
    assert.ok(document.getElementById("asd") === null && document.getElementById("jkl") === null && asd._disposed === true && jkl._disposed === true, "dispose & remove from DOM without _parent defined");
    //try {
    //    button._appendChild(button2);
    //}
    //catch (e) {
    //    alert(e.message);   //recursion error in document
    //                        //get sure childs, parent, dom does not change when trying this
    //}

    //root2._appendChild(button2);
    ////what happens if we add an element to another that does not allow childs?
    //var img = new SmartJs.Ui.Control('image', { height: 20, width: 60 });
    //root._appendChild(img);
    //try {
    //    img._appendChild(button2);
    //    //whats the W3C specification on nested elements?
    //}
    //catch (e) {
    //    alert(e.message);   //insert an element not supported?
    //}

    //dock + children
    //is there a resizeEvent required to accomblish docking?

    var breakPoint;
});


QUnit.test("SmartJs.Ui.Control: height & width", function (assert) {

    var dom = document.getElementById("qunit-fixture");

    var hw = new SmartJs.Ui.Control('div');
    assert.equal(hw._innerHeight, 0, "_innerHeight: height not set in styles & element not in document");
    assert.equal(hw._innerWidth, 0, "_innerWidth: width not set in styles & element not in document");

    dom.appendChild(hw._dom);
    assert.equal(hw._innerHeight, 0, "_innerHeight: height not set in styles & element in document");
    assert.equal(hw._innerWidth, 1000, "_innerWidth: width not set in styles & element in document");    //based on the QUnit "qunit-fixture" div

    dom.removeChild(hw._dom);
    hw.style.height = "20px";
    hw.style.width = "40px";
    assert.equal(hw._innerHeight, 0, "_innerHeight: height set in styles & element not in document");
    assert.equal(hw._innerWidth, 0, "_innerWidth: width set in styles & element not in document");

    dom.appendChild(hw._dom);
    assert.equal(hw._innerHeight, 20, "_innerHeight: height set in styles & element in document");
    assert.equal(hw._innerWidth, 40, "_innerWidth: width set in styles & element in document");

    dom.removeChild(hw._dom);
    hw.style.border = "solid 2px black";
    hw.style.margin = "1px";
    hw.style.padding = "3px";
    assert.equal(hw._innerHeight, 0, "_innerHeight: height & border set in styles & element not in document");
    assert.equal(hw._innerWidth, 0, "_innerWidth: width & border set in styles & element not in document");

    dom.appendChild(hw._dom);
    //please notice: setting tht css directly will result in different height/width values depending on boxSizing (border-box: border and padding included)
    //while on "content-box" the (outher) height/width will increase when addind a border or padding 
    assert.equal(hw._innerHeight, 20, "_innerHeight: height & border set in styles & element in document");
    assert.equal(hw._innerWidth, 40, "_innerWidth: width & border set in styles & element in document");

    //check return type
    assert.equal(typeof hw.height, 'number', "height: return type check");
    assert.equal(typeof hw._innerHeight, 'number', "_innerHeight: return type check");
    assert.equal(typeof hw.width, 'number', "width: return type check");
    assert.equal(typeof hw._innerWidth, 'number', "_innerWidth: return type check");

    dom.removeChild(hw._dom);
    hw.style.boxSizing = "border-box";
    assert.equal(hw._innerHeight, 0, "_innerHeight: boxSizing = \"border-box\": height set in styles & element not in document");
    assert.equal(hw._innerWidth, 0, "_innerWidth: boxSizing = \"border-box\": width set in styles & element not in document");

    dom.appendChild(hw._dom);10
    assert.equal(hw._innerHeight, 10, "_innerHeight: boxSizing = \"border-box\": height set in styles & element in document");
    assert.equal(hw._innerWidth, 30, "_innerWidth: boxSizing = \"border-box\": width set in styles & element in document");


    var hw = new SmartJs.Ui.Control('div');
    assert.equal(hw.height, 0, "height not set & element not in document");
    assert.equal(hw.width, 0, "width not set & element not in document");

    dom.appendChild(hw._dom);
    assert.equal(hw.height, 0, "height not set & element in document");
    assert.equal(hw.width, 1000, "width not set & element in document");    //based on the QUnit "qunit-fixture" div

    dom.removeChild(hw._dom);
    hw.height = 20;
    hw.width = 40;
    assert.equal(hw.height, 0, "height set & element not in document");
    assert.equal(hw.width, 0, "width set & element not in document");

    assert.equal(hw.style.height, "20px", "height setter: css check (element not in document)");
    assert.equal(hw.style.width, "40px", "width setter: css check (element not in document)");

    dom.appendChild(hw._dom);
    assert.equal(hw.height, 20, "height set & element in document");
    assert.equal(hw.width, 40, "width set & element in document");

    hw.style.border = "2px solid black";
    hw.style.padding = "5px";   //has effects on setting value when boxSizing == content-box
    hw.height = 20;
    hw.width = 40;

    assert.equal(hw.height, 20, "height set (including border) & element in document: NOTICE: this and other tests may fail if your browsers zoom <> 100%");
    assert.equal(hw.width, 40, "width set & (including border) element in document");
    //check css width, height
    assert.equal(hw.style.height, "6px", "height setter: css check (including border) & element in document");
    assert.equal(hw.style.width, "26px", "width setter: css check & (including border) element in document");

    hw.style.boxSizing = "border-box";
    hw.height = 20;
    hw.width = 40;
    assert.equal(hw.height, 20, "height: boxSizing = \"border-box\" (including border): height set & element in document");
    assert.equal(hw.width, 40, "width: boxSizing = \"border-box\" (including border): width set & element in document");

    hw.style.margin = "1px";
    hw.height = 20;
    hw.width = 40;
    assert.equal(hw.height, 20, "height: boxSizing = \"border-box\" (including border, padding): height set & element in document");
    assert.equal(hw.width, 40, "width: boxSizing = \"border-box\" (including border, padding): width set & element in document");
    //check css width, height
    assert.equal(hw.style.height, "18px", "height setter: css check: boxSizing = \"border-box\" (including border, padding): height set & element in document");
    assert.equal(hw.style.width, "38px", "width setter: css check: boxSizing = \"border-box\" (including border, padding): width set & element in document");

    //check setter argument type
    assert.throws(function () { hw.height = "20px"; }, Error, "ERROR: height setter != number");
    assert.throws(function () { hw.width = "40px"; }, Error, "ERROR: width setter != number");

    //resize event triggered
    var count = 0;
    var handler = function (e) { count++; }
    hw.onResize.addEventListener(new SmartJs.Event.EventListener(handler));
    hw.height = 10;
    assert.ok(count === 1, "height: resize event triggered");
    hw.width = 20;
    assert.ok(count === 2, "width: resize event triggered");
    //only onResize if changed
    count = 0;
    hw.height = 10;
    assert.ok(count === 0, "height: resize event triggered");
    hw.width = 20;
    assert.ok(count === 0, "width: resize event triggered");


});


QUnit.test("SmartJs.Ui.Control: css & styles", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var div = document.createElement("div");

    dom.appendChild(div);
    var cp = new SmartJs.Ui.Control(div);   //id is applied
    var el = document.getElementById(cp.id);

    //style: please notice: while settings an object {} the getter returns a CSSStyleDeclaration object which has an array declaration?
    cp.style = { position: "absolute", height: "10px", width: "20px" };
    assert.ok(cp.style.length === 3 && cp.style.position === "absolute" && cp.style.height === "10px" && cp.style.width === "20px", "read write style initial");

    cp.style.position = "relative";
    cp.style.color = "red";
    assert.ok(cp.style.length === 4 && cp.style.color === "red" && cp.style.position === "relative" && cp.style.height === "10px" && cp.style.width === "20px", "write style properties (add)");

    cp.style = { height: "20px", width: "40px" };
    assert.ok(cp.style.length === 2, "style properties deleted on set");
    assert.ok(cp.style.height === "20px" && cp.style.width === "40px", "set style object (reset)");

    assert.equal(el.style, cp.style, "DOM element references");

    assert.throws(function () { cp.style = 1; }, "ERROR: invalid parameter");
    assert.throws(function () { cp.style = []; }, "ERROR: invalid parameter: array");

    //assert.throws(function () { cp.style = { x: 2 }; }, "ERROR: invalid parameter argument: not css conform");
    //assert.throws(function () { cp.style = { x: "2" }; }, "ERROR: invalid parameter argument: not css conform (string)");
    //^^above tests do not throw an error in chrome

    //css className
    assert.ok(typeof cp.className === "string", "get sure even a undefined class property is retured as string");

    cp.className = "css1 css2";
    assert.equal(cp.className, "css1 css2", "className get, set");

    assert.equal(el.className, cp.className, "DOM element references (className)");

    cp.className = "css3";
    assert.equal(cp.className, "css3", "className reset & delete");

    cp.className = "";
    assert.equal(cp.className, "", "unset / delete className");

    cp.addClassName("css1");
    assert.equal(cp.className, "css1", "addClassName first");   //25

    cp.addClassName("css1");
    assert.equal(cp.className, "css1", "addClassName: same className twice");

    cp.addClassName("css1   css2");
    assert.equal(cp.className, "css1 css2", "addClassName (two classes): one existing and separated by more than one white-space");

    cp.addClassName("css3  css1 css1   css2   css1 ");
    assert.equal(cp.className, "css3 css2 css1", "addClassName: several classes mixed and duplicated inserts");

    assert.throws(function () { cp.addClassName(23); }, Error, "ERROR: invalid argument (add): not a string");


    cp.removeClassName("css3");
    assert.equal(cp.className, "css2 css1", "removeClassName first");

    cp.addClassName("css3 css4");
    cp.removeClassName("css3");
    assert.equal(cp.className, "css2 css1 css4", "removeClassName middle");

    cp.removeClassName("css2   css4");
    assert.equal(cp.className, "css1", "remove several classNames");

    cp.className = "css1 css2  css1 css2   css1 css2    css1 css1";
    cp.removeClassName("css2 css1");
    assert.equal(cp.className, "", "remove several classNames combined");

    cp.className = "css1 css2  css1 css2 css4  css1 css2    css1 css2   css4";
    cp.removeClassName("css2   css1");
    assert.equal(cp.className, "css4 css4", "remove several classNames combined (2)");

    assert.throws(function () { cp.removeClassName(23); }, Error, "ERROR: invalid argument (remove): not a string");

    cp.className = "   ";   //empty
    cp.removeClassName("css2   css1");
    assert.equal(cp.className, "", "cleanup during remove");

    cp.className = "css1";
    cp.replaceClassName("css1", "css3 css2");
    assert.equal(cp.className, "css3 css2", "replace class names: simple");

    cp.className = "css1";
    cp.replaceClassName("css1", " ");
    assert.equal(cp.className, "", "replace class names with empty string");

    cp.className = "css1";
    cp.replaceClassName("css1");
    assert.equal(cp.className, "", "replace class names: undefined replace property");

    cp.className = "css1 css2  css1 css2 css4  css1 css2    css2 css2   css4";
    cp.replaceClassName("css4 css2", "css3");
    assert.equal(cp.className, "css1 css1 css1 css3", "replace class names: complex single");

    cp.className = "css1 css2  css1 css2 css4  css1 css2    css1 css2   css4";
    cp.replaceClassName("css2 css4 css1", "css4 css4 css4");
    assert.equal(cp.className, "css4", "replace class names: complex multiple");

    cp.className = "css1 css2  css1 css2 css4  css1 css2    css1 css2   css4";
    cp.replaceClassName("css2 css4 css1", "css4 css5");
    assert.equal(cp.className, "css4 css5", "replace class names: complex multiple");

    cp.className = "css1 css2  css3 ";
    cp.replaceClassName("css1", "css3 css2");
    assert.equal(cp.className, "css3 css2", "replace class names: check multiple inserts");

    cp.className = "css1 css2  css3 ";
    cp.replaceClassName("css4", "css5 css5");
    assert.equal(cp.className, "css1 css2  css3 ", "replace class names: no change (& dom update) if nothing found to replace");

    cp.className = "css1 css2  css3 ";
    assert.throws(function () { cp.replaceClassName(23, ""); }, Error, "ERROR: invalid argument (replace): 1st argument not a string");

    assert.throws(function () { cp.replaceClassName("css2", 23); }, Error, "ERROR: invalid argument (replace): 2nd argument not a string");

});


QUnit.test("SmartJs.Ui.Control: resize & layoutChange events", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var div = document.createElement("div");

    dom.appendChild(div);
    var vp = new SmartJs.Ui.Control(div);   //if you make dom a UiControl in UnitTests the ID will change and cause errors on other test cases
    
    var countResize1 = 0, countLayoutChange1 = 0,
        countResize2 = 0, countLayoutChange2 = 0,
        countResize3 = 0, countLayoutChange3 = 0,
        countResize4 = 0, countLayoutChange4 = 0;

    var ctr1 = new SmartJs.Ui.Control("div", { width: 400, height: 150 });
    ctr1.onResize.addEventListener(new SmartJs.Event.EventListener(function (e) { countResize1++; }));
    ctr1.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (e) { countLayoutChange1++; }));
    var ctr2 = new SmartJs.Ui.Control("div", { style: {width: "100%", height: "100%"} });
    ctr2.onResize.addEventListener(new SmartJs.Event.EventListener(function (e) { countResize2++; }));
    ctr2.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (e) { countLayoutChange2++; }));
    var ctr3 = new SmartJs.Ui.Control("div", { style: { width: "100%", height: "100%" } });
    ctr3.onResize.addEventListener(new SmartJs.Event.EventListener(function (e) { countResize3++; }));
    ctr3.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (e) { countLayoutChange3++; }));
    var ctr4 = new SmartJs.Ui.Control("div", { style: { width: "100%", height: "100%" } });
    ctr4.onResize.addEventListener(new SmartJs.Event.EventListener(function (e) { countResize4++; }));
    ctr4.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(function (e) { countLayoutChange4++; }));

    vp._appendChild(ctr1);
    assert.equal(countResize1, 1, "resize: resize on first append");
    assert.equal(countLayoutChange1, 0, "layoutChange: no change on append");
    ctr1.width = 200;
    assert.equal(countResize1, 2, "resize (set width): resize on width change");
    assert.equal(countLayoutChange1, 0, "resize (set width): no change on append");

    ctr1.hide();
    assert.equal(countResize1, 2, "resize (hide): no resize");
    assert.equal(countLayoutChange1, 0, "resize (hide): no layout change");

    ctr1.show();
    assert.equal(countResize1, 2, "resize (set width): no resize");
    assert.equal(countLayoutChange1, 0, "resize (set width): no layout change");

    //class
    ctr1.addClassName("testDivResize");
    assert.equal(countResize1, 3, "add class (margin): resize");
    assert.equal(countLayoutChange1, 0, "add class(margin): no layout change");

    //append, remove
    countResize1 = 0;
    countLayoutChange1 = 0;
    ctr1._appendChild(ctr2);
    assert.equal(countResize2, 1, "resize: resize on 2nd level append");
    assert.equal(countLayoutChange2, 0, "layoutChange: no change on append");
    assert.equal(countLayoutChange1, 1, "parent layoutChange: change on parent");   //called twice due to dynamic child size -> fixed!

    assert.throws(function () { ctr1._removeChild("invalid"); }, Error, "ERROR: removeChild: invlaid argument: control");
    ctr1._removeChild(ctr2);
    assert.equal(countResize2, 1, "resize: no resize on 2nd level remove");
    assert.equal(countLayoutChange2, 0, "layoutChange: no change on remove");
    assert.equal(countLayoutChange1, 2, "parent layoutChange: change on parent (removed child)");

    //ctr1 has a cached width/height now
    countResize1 = 0;
    countLayoutChange1 = 0;
    countResize2 = 0;
    ctr1._appendChild(ctr2);
    assert.equal(countResize1, 0, "including cache: no resize on parent");   //no resize event duw to size caching
    assert.equal(countLayoutChange1, 1, "including cache: parent layoutChange: change on parent");   //called once:no resoze triggered
    assert.equal(countResize2, 0, "including cache: resize on 2nd level append");   //no resize event duw to size caching
    assert.equal(countLayoutChange2, 0, "including cache: layoutChange: no change on append");

    countLayoutChange1 = 0;
    ctr1._appendChild(ctr3);    //2 items on same level
    assert.equal(countResize1, 0, "including cache: no resize on parent");
    assert.equal(countLayoutChange1, 1, "including cache: parent layoutChange: change on parent");
    assert.equal(countResize2, 0, "including cache: no resize on parent");
    assert.equal(countLayoutChange2, 0, "including cache: parent layoutChange: change on parent");
    assert.equal(countResize3, 1, "new item: resize on 2nd level append");
    assert.equal(countLayoutChange3, 0, "new item: layoutChange: no change on append");

    countLayoutChange1 = 0;
    countResize3 = 0;
    //3rd level
    ctr2._appendChild(ctr4);
    assert.equal(countResize1, 0, "3rd level: including cache: no resize on parent");
    assert.equal(countLayoutChange1, 0, "3rd level: including cache: parent layoutChange: change on parent");
    assert.equal(countResize2, 0, "3rd level: including cache: no resize on parent");
    assert.equal(countLayoutChange2, 1, "3rd level: including cache: parent layoutChange: change on parent");
    assert.equal(countResize3, 0, "3rd level: new item: resize on 2nd level append");
    assert.equal(countLayoutChange3, 0, "3rd level: new item: layoutChange: no change on append");
    assert.equal(countResize4, 1, "3rd level: new item: resize on 2nd level append");
    assert.equal(countLayoutChange4, 0, "3rd level: new item: layoutChange: no change on append");

    //resize
    countLayoutChange2 = 0;
    countResize4 = 0;
    ctr1.width = 400;
    assert.equal(countResize1, 1, "resize root: including cache: no resize on parent");
    assert.equal(countLayoutChange1, 0, "resize root: including cache: parent layoutChange: change on parent");
    assert.equal(countResize2, 1, "resize root: including cache: no resize on parent");
    assert.equal(countLayoutChange2, 0, "resize root: including cache: parent layoutChange: change on parent");
    assert.equal(countResize3, 1, "resize root: resize on 2nd level");
    assert.equal(countLayoutChange3, 0, "resize root: layoutChange: no change (independent item)");
    assert.equal(countResize4, 1, "resize root: resize on 3nd level append");
    assert.equal(countLayoutChange4, 0, "resize root: 3rd level: layoutChange: no change on append");

    //css resize
    countResize1 = 0;
    countResize2 = 0;
    countResize3 = 0;
    countResize4 = 0;
    ctr2.style = { height: 300, width: 300 };
    assert.equal(countResize1, 0, "trigger both directions: countResize1 (not called)");
    assert.equal(countLayoutChange1, 1, "trigger both directions: countLayoutChange1: notified by ctr2 = child");
    assert.equal(countResize2, 1, "trigger both directions: countResize2: changed (dimensions)");
    assert.equal(countLayoutChange2, 0, "trigger both directions: countLayoutChange2");
    assert.equal(countResize3, 0, "trigger both directions: countResize3: notified by ctr1 = parent (but size did not change)");
    assert.equal(countLayoutChange3, 0, "trigger both directions: countLayoutChange3");
    assert.equal(countResize4, 1, "trigger both directions: countResize4: notified by ctr2 = parent");
    assert.equal(countLayoutChange4, 0, "trigger both directions: countLayoutChange4");

    //var breakpoint = true;

});


QUnit.test("SmartJs.Ui.HtmlTag", function (assert) {

    var tag = new SmartJs.Ui.HtmlTag('br');
    assert.ok(tag instanceof SmartJs.Ui.Control, "instance check");
    assert.equal(tag.objClassName, "HtmlTag", "objClassName check");

    tag.setDomAttribute("id", tag.id + "new Id");
    assert.equal(tag.getDomAttribute("id"), tag.id + "new Id", "DOM Attribute getter/setter");

    //override internal functions to test interface
    var lastMethod = -1;
    tag._addDomListener = function () {
        lastMethod = 6;
    };
    tag._removeDomListener = function () {
        lastMethod = 7;
    };
    tag._appendChild = function () {
        lastMethod = 0;
    };
    tag._insertAt = function () {
        lastMethod = 1;
    };
    tag._insertBefore = function () {
        lastMethod = 2;
    };
    tag._insertAfter = function () {
        lastMethod = 3;
    };
    tag._replaceChild = function () {
        lastMethod = 4;
    };
    tag._removeChild = function () {
        lastMethod = 5;
    };

    tag.appendChild();
    assert.equal(lastMethod, 0, "appendChild");
    tag.insertAt();
    assert.equal(lastMethod, 1, "insertAt");
    tag.insertBefore();
    assert.equal(lastMethod, 2, "insertBefore");
    tag.insertAfter();
    assert.equal(lastMethod, 3, "insertAfter");
    tag.replaceChild();
    assert.equal(lastMethod, 4, "replaceChild");
    tag.removeChild();
    assert.equal(lastMethod, 5, "removeChild");
    tag.addDomListener();
    assert.equal(lastMethod, 6, "add DOM listener");
    tag.removeDomListener();
    assert.equal(lastMethod, 7, "remove DOM listener");

});


QUnit.test("SmartJs.Ui.Image", function (assert) {

    var done1 = assert.async();

    var testSrc = "data:image/png;base64,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";

    var dom = document.getElementById("qunit-fixture");
    //var div = document.createElement("div");
    //dom.appendChild(div);

    var img = new SmartJs.Ui.Image({ style: { maxWidth: '100px' } });
    assert.ok(img instanceof SmartJs.Ui.Image && img instanceof SmartJs.Ui.Control, "instance check");
    assert.equal(img.objClassName, "Image", "objClassName check");
    assert.ok(img._dom instanceof HTMLImageElement, "image html element created");
    assert.ok(img.style.maxWidth === "100px" && img.style.width === "auto" && img.style.height === "auto", "constuctor with default style parameters");

    assert.throws(function () { var imgErr = new SmartJs.Ui.Image("invalid"); }, Error, "ERROR: invalid propObject argument");

    assert.ok(img.onLoad instanceof SmartJs.Event.Event, "onLoad event type and getter");

    var htmlImg = img._dom;
    var onLoadHandlerCalled = 0;

    var onLoadHandler = function (e) {
        onLoadHandlerCalled++;
        onLoadTests();
    };
    img.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler));
    if ('crossOrigin' in htmlImg) { //make sure to set this before loading as this will trigger a new request (in FF)
        img.crossOrigin = "anonymous";
        assert.equal(htmlImg.crossOrigin, "anonymous", "cross origin setter");
    }
    img.src = testSrc;

    function onLoadTests() {
        assert.equal(img.src, testSrc, "src getter/setter");
        assert.equal(onLoadHandlerCalled, 1, "onLoad called only once");

        assert.equal(img.naturalWidth, 58, "natural with getter");
        assert.equal(img.naturalHeight, 70, "natural height getter");

        done1();
    }

});


QUnit.test("SmartJs.Ui.ContainerControl", function (assert) {

    var dom = document.getElementById("qunit-fixture");

    //create Control
    var cp = new SmartJs.Ui.ContainerControl();
    assert.ok(cp instanceof SmartJs.Ui.ContainerControl && cp instanceof SmartJs.Ui.Control && cp instanceof Object, "instance check");
    assert.equal(cp.objClassName, "ContainerControl", "objClassName correct (not equal namespace)");

    cp.dispose();
    assert.ok(cp._disposed === true && this.id === undefined && this.objClassName === undefined, "recursive dispose");

    cp = new SmartJs.Ui.ContainerControl();
    dom.appendChild(cp._dom);

    assert.equal(cp._container, cp.__container, "container internal getter = this (default)");
    assert.throws(function () { cp._container = document.createElement("div"); }, Error, "ERROR: invalid container");
    assert.throws(function () { var x = new SmartJs.Ui.ContainerControl("invalid"); }, Error, "ERROR: invalid propObject argument");

    var tn1 = new SmartJs.Ui.TextNode("1");
    var tn2 = new SmartJs.Ui.TextNode("2");
    var div1 = new SmartJs.Ui.Control("div", { style: { width: "20px", height: "40px" } });

    //appendChild
    cp.appendChild(tn1);
    assert.equal(cp._childs[0], tn1, "container control: append simple");

    //insertAt
    cp.insertAt(0, tn2);
    assert.ok(cp._childs[0] === tn2 && cp._childs[1] === tn1, "container control: insert at simple + current item moved");

    //insertBefore
    cp.insertBefore(div1, tn1);
    assert.ok(cp._childs[0] === tn2 && cp._childs[1] === div1 && cp._childs[2] === tn1, "container control: insert before simple + current item moved");

    //insertAfter
    cp.insertAfter(tn2, div1);
    assert.ok(cp._childs[0] === div1 && cp._childs[1] === tn2 && cp._childs[2] === tn1, "container control: insert after simple + current item moved");

    //removeChild
    cp.removeChild(tn2);
    assert.ok(cp._childs[0] === div1 && cp._childs[1] === tn1, "container control: remove child simple + current item moved");

    //replaceChild
    cp.replaceChild(tn2, div1);
    assert.ok(cp._childs[0] === tn2 && cp._childs[1] === tn1, "container control: replace child simple");

    //resize
    //cp.hide();
    //cp.width = 100;


    //init test infrastructure
    var TestControl = (function () {
        TestControl.extends(SmartJs.Ui.ContainerControl, false);

        function TestControl(propObject) {
            SmartJs.Ui.ContainerControl.call(this, propObject);
        }

        Object.defineProperties(TestControl.prototype, {
            container: {
                set: function (value) {
                    this._container = value;
                },
                get: function () {
                    return this._container;
                },
            },
        });

        return TestControl;
    })();


    //create TestControl
    cp.dispose();

    cp = new SmartJs.Ui.ContainerControl({ style: { width: "20px", height: "40px" } });
    dom.appendChild(cp._dom);

    //recreate after dispose
    tn1 = new SmartJs.Ui.TextNode("1");
    tn2 = new SmartJs.Ui.Control("div", { style: { visibility: "hidden" } });
    div1 = new SmartJs.Ui.Control("div", { style: { width: "20px", height: "40px" } });

    //resize
    cp.width = 100;

    var tc = new TestControl();
    cp.appendChild(tc);
    cp._container = tc;
    assert.equal(cp.__container, tc, "container internal setter");
    assert.equal(cp._childs[0], tc, "init setup correctly: container tests");

    var containerRef = cp.__container;  //the inner container that will be used for insert,... operations

    //appendChild
    cp.appendChild(tn1);
    assert.equal(containerRef._childs[0], tn1, "container control: append simple");

    //insertAt
    cp.insertAt(0, tn2);
    assert.ok(containerRef._childs[0] === tn2 && containerRef._childs[1] === tn1, "container control: insert at simple + current item moved");

    //insertBefore
    cp.insertBefore(div1, tn1);
    assert.ok(containerRef._childs[0] === tn2 && containerRef._childs[1] === div1 && containerRef._childs[2] === tn1, "container control: insert before simple + current item moved");

    //insertAfter
    cp.insertAfter(tn2, div1);
    assert.ok(containerRef._childs[0] === div1 && containerRef._childs[1] === tn2 && containerRef._childs[2] === tn1, "container control: insert after simple + current item moved");

    //removeChild
    cp.removeChild(tn2);
    assert.ok(containerRef._childs[0] === div1 && containerRef._childs[1] === tn1, "container control: remove child simple + current item moved");

    //replaceChild
    cp.replaceChild(tn2, div1);
    assert.ok(containerRef._childs[0] === tn2 && containerRef._childs[1] === tn1, "container control: replace child simple");

    //resize
    cp.width = 100;

});


QUnit.test("SmartJs.Ui.Viewport", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var div = document.createElement("div");
    dom.appendChild(div);

    var vp = new SmartJs.Ui.Viewport();
    assert.ok(vp instanceof SmartJs.Ui.Viewport && vp instanceof SmartJs.Ui.Control && vp instanceof Object, "instance check");
    assert.equal(vp.objClassName, "Viewport", "objClassName check");

    assert.throws(function () { vp.addToDom("not an element"); }, Error, "ERROR: invalid parent param");

    var resizeCount = 0;
    var resizeHandler = function (e) {
        resizeCount++;
    };
    vp.onResize.addEventListener(new SmartJs.Event.EventListener(resizeHandler));
    vp.addToDom(dom);
    assert.equal(resizeCount, 1, "resize dispatched on addToDom");

    vp.addToDom(dom);
    assert.equal(resizeCount, 1, "resize not dispatched if addToDom called twice (same parent element)");

    vp.addToDom(div);
    assert.equal(resizeCount, 2, "resize dispatched if addToDom called twice (other parent element)");
    assert.equal(vp._parentHtmlElement, div, "removed automatically when adding to other parent element: instance");
    assert.notEqual(div.innerHTML, "", "removed automatically when adding to other parent element: DOM");

    vp.dispose();
    assert.ok(vp._disposed, "");
    assert.equal(div.innerHTML, "", "removed from DOM an dispose");
});

