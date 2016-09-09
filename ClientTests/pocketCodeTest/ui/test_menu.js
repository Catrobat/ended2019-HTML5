/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("ui/menu.js");


QUnit.test("Menu", function (assert) {

    var done = assert.async;

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    var ctrl = new PocketCode.Ui.Menu();
    container.appendChild(ctrl);

    assert.ok(ctrl instanceof PocketCode.Ui.Menu && ctrl instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "Menu", "objClassName check");


    assert.equal(ctrl.disabled, false, "disabled getter");
    ctrl.disabled = true;
    assert.equal(ctrl.disabled, true, "disabled setter + getter");
    ctrl.disabled = false;



    ctrl._open();
/*
    assert.equal( ctrl._container._childs[0].length, 0, "No elements in menu" );
    var button9 = new PocketCode.Ui.MenuItem("example");
    ctrl.addElement( button9 );
    var btn2 = new PocketCode.Ui.Button();
    ctrl.addElement( btn2 );
    var sep = new PocketCode.Ui.MenuSeparator();
    ctrl.addElement( sep );
    assert.equal( ctrl._childs[0].length, 1, "1 element in menu" );
    console.log( ctrl );
    */


    var clickHandler = function (e) {
        assert.ok(true, "menu clicked");
        assert.equal( ctrl._state, ctrl._states.CLOSED , "is closed");


        ctrl.dispose();    //removed on dispose
        assert.equal(ctrl._disposed, true, "disposed");
        assert.equal(container._childs.length, 0, "removed from parent during dispose");

        done();
    };
    ctrl.onClick.addEventListener(new SmartJs.Event.EventListener(clickHandler));

    assert.equal( ctrl._state, ctrl._states.OPEN , "is open");
    ctrl._menuTitle._dom.click();  //simulate click




    assert.ok(false, "TODO More tests (add buttons etc)");
});
