/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("ui/menu.js");


QUnit.test("Menu", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    var ctrl = new PocketCode.Ui.Menu();
    container.appendChild(ctrl);

    assert.ok(ctrl instanceof PocketCode.Ui.Menu && ctrl instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "Menu", "objClassName check");

    assert.ok(ctrl.onMenuAction instanceof SmartJs.Event.Event && ctrl.onOpen instanceof SmartJs.Event.Event, "event accessors");
    assert.equal(ctrl.className, "pc-menu", "css set correctly");

    assert.ok(ctrl._subMenu.hidden, "closed by default");
    ctrl._openCloseHandler();    //simulate click/tab
    assert.notOk(ctrl._subMenu.hidden, "openend by click");
    ctrl._openCloseHandler();    //simulate click/tab
    assert.ok(ctrl._subMenu.hidden, "closed by click");
    ctrl._openCloseHandler();    //simulate click/tab - open again
    ctrl.close();
    assert.ok(ctrl._subMenu.hidden, "closed by method call");

    var mobile = SmartJs.Device.isMobile;
    SmartJs.Device.isMobile = true; //make sure css is set currectly

    ctrl = new PocketCode.Ui.Menu();
    assert.equal(ctrl.className, "pc-menu pc-menuMobile", "css set correctly on mobile");
    SmartJs.Device.isMobile = mobile;   //reset to avoid errors on other tests
});

QUnit.test("MenuSeparator", function (assert) {

    var ctrl = new PocketCode.Ui.MenuSeparator();

    assert.ok(ctrl instanceof PocketCode.Ui.MenuSeparator && ctrl instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "MenuSeparator", "objClassName check");

    assert.equal(ctrl.className, "pc-menuSeparator", "css set correctly");
});

QUnit.test("MenuItem", function (assert) {

    var ctrl = new PocketCode.Ui.MenuItem();

    assert.ok(ctrl instanceof PocketCode.Ui.MenuItem && ctrl instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "MenuItem", "objClassName check");

});

