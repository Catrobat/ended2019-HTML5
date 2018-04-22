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
    assert.equal(expander.__container.className, "pc-expanderBody", "Expander closed by default");
    expander._onChangeHandler({checked: true});
    assert.equal(expander.__container.className, "pc-expanderBody pc-bodyVisible", "Expander opened by click");
    expander._onChangeHandler({checked: false});
    assert.equal(expander.__container.className, "pc-expanderBody", "Expander closed by click");
    //assert.ok(false, "TODO");

});
