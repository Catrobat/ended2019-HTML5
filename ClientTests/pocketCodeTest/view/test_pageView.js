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

    pageView.hideFooter();
    assert.ok(pageView._footer.hidden == true, "hideFooter");

    pageView.hideHeader();
    assert.ok(pageView._header.hidden == true, "hideHeader");

    pageView.showFooter();
    assert.ok(pageView._footer.hidden == false, "showFooter");

    pageView.showHeader();
    assert.ok(pageView._header.hidden == false, "showHeader");

    pageView.dispose();
    assert.ok(pageView._onResize._listeners.length == 1, "dispose");
});



