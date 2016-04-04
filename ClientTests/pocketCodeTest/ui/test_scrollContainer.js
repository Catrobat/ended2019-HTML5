'use strict';

QUnit.module("scrollContainer.js");


QUnit.test("ScrollContainer", function (assert) {

    var s = new PocketCode.Ui.ScrollContainer();
    assert.ok(s instanceof PocketCode.Ui.ScrollContainer && s instanceof SmartJs.Ui.ContainerControl, "instance check");
    assert.equal(s.style.overflow, "hidden", "overflow hidden if no css class applied (default)");

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);    //this should trigger a resize- code coverage

    container.appendChild(s);    //this should trigger a resize- code coverage

    //please notice:
    //the control has to be tested outside qunit to generate rendering and events

    s.dispose();    //removed on dispose
    assert.equal(s._disposed, true, "disposed");
    assert.equal(container._childs.length, 0, "removed from parent during dispose");

});
