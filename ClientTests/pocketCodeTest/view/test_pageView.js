/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("view/pageView.js");


QUnit.test("PageView", function (assert) {

    var propObj = {};
    var pageView = new PocketCode.Ui.PageView(propObj);
    assert.ok(pageView instanceof SmartJs.Ui.ContainerControl, "instance check");
    assert.ok(pageView._childs[0].className == "pc-pageHeader" &&
        pageView._childs[1].className == "pc-pageBodyLayout" &&
        pageView._childs[2].className == "pc-pageFooter", "add header to childs");
    assert.ok(pageView._onResize._listeners.length == 2, "add listener to _onResize");

    // ********************* methods *********************

    //todo: set footer/header height
   /* pageView._footer._dom.style.height = 10;
    pageView._header._dom.style.height = 20;
    pageView._footer.height = 10;

    var dom = document.getElementById("qunit-fixture");
    var hw = new SmartJs.Ui.Control('div');
    hw.height = 20;
    hw.width = 40;
    dom.appendChild(hw._dom);*/

    pageView.hideFooter();
    assert.ok(pageView._footer.hidden == true, "hideFooter");
    assert.ok(pageView._bodyLayout.style.paddingBottom == "20px", "_handleResize, only footer hidden");

    pageView.hideHeader();
    assert.ok(pageView._header.hidden == true, "hideHeader");
    assert.ok(pageView._bodyLayout.style.paddingBottom == "0px", "_handleResize, header and footer hidden");

    pageView.showFooter();
    assert.ok(pageView._footer.hidden == false, "showFooter");
    assert.ok(pageView._bodyLayout.style.paddingBottom == "10px", "_handleResize, only header hidden");

    pageView.showHeader();
    assert.ok(pageView._header.hidden == false, "showHeader");
    assert.ok(pageView._bodyLayout.style.paddingBottom == "30px", "_handleResize, header and footer not hidden");

    pageView.dispose();
    assert.ok(pageView._onResize._listeners.length == 1, "dispose");

});



