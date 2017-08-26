/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

QUnit.module("ui/expander.js");

QUnit.test("Expander", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    var expander = new PocketCode.Ui.Expander("i18nKey");

    //instance check
    assert.ok(expander instanceof PocketCode.Ui.Expander && expander instanceof SmartJs.Ui.ContainerControl, "instance check");

    //open & close check
    //closed by default check
    //assert.ok(expander.hidden, "Expander closed by default");
    //expander._onChangeHandler();
    //assert.notOk(expander.hidden, "DeviceEmulator opened by click");
    //expander._onChangeHandler();
    //assert.ok(expander.hidden, "DeviceEmulator closed by click");

    assert.ok(false, "TODO");

});
