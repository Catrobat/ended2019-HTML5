/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/i18nProvider.js" />
/// <reference path="../../../Client/pocketCode/scripts/ui/button.js" />
'use strict';

QUnit.module("ui/button.js");


QUnit.test("Button", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    var ctrl = new PocketCode.Ui.Button('i18nKey');
    container.appendChild(ctrl);

    assert.ok(ctrl instanceof PocketCode.Ui.Button && ctrl instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "Button", "objClassName check");

    assert.equal(ctrl.disabled, false, "disabled getter");
    ctrl.disabled = true;
    assert.equal(ctrl.disabled, true, "disabled setter + getter");

    assert.equal(ctrl.text, "[i18nKey]", "text getter");
    ctrl.i18nKey = "newI18n";
    assert.equal(ctrl.text, "[newI18n]", "i18n setter");

    var clicked = 0;
    var clickHandler = function (e) {
        clicked++;
        assert.ok(true, "button clicked");

        ctrl.dispose();    //removed on dispose
        assert.equal(ctrl._disposed, true, "disposed");
        assert.equal(container._childs.length, 0, "removed from parent during dispose");
    }

    ctrl.onClick.addEventListener(new SmartJs.Event.EventListener(clickHandler));
    ctrl._dom.click();  //simulate click
    assert.equal(clicked, 0, "no event dispatched on disabled control");

    ctrl.disabled = false;
    ctrl._dom.click();  //simulate click

});


QUnit.test("PlayerSvgButton", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    assert.throws(function () { new PocketCode.Ui.PlayerSvgButton('', 'i18nKey'); }, Error, "ERROR: invalid icon");

    var ctrl = new PocketCode.Ui.PlayerSvgButton('iconTest', 'i18nKey', true);
    assert.ok(ctrl instanceof PocketCode.Ui.PlayerSvgButton && ctrl instanceof PocketCode.Ui.Button, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "PlayerSvgButton", "objClassName check");
    ctrl.dispose();

    ctrl = new PocketCode.Ui.PlayerSvgButton('iconTest', 'i18nKey', true, true);
    assert.equal(ctrl.className, "pc-menuBigButton pc-webButton", "css on menuButton");
    container.appendChild(ctrl);

    assert.equal(ctrl.checked, false, "checked getter");
    ctrl.checked = true;
    assert.equal(ctrl.checked, true, "checked setter + getter");
    ctrl.checked = false;
    assert.equal(ctrl.checked, false, "checked setter + getter");

});



