'use strict';

QUnit.module("scrollContainer.js");


QUnit.test("ScrollContainer", function (assert) {

    var s = new PocketCode.Ui.ScrollContainer();
    assert.equal(s.style.overflow, "hidden", "overflow hidden if no css class applied");

    s.innerHTML = "<p>some html</p>";
    assert.equal(s.innerHTML, "<p>some html</p>", "innerHTML getter + setter");

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl();
    dom.appendChild(container._dom);    //this should trigger a resize- code coverage

    container.appendChild(s);    //this should trigger a resize- code coverage
    s.dispose();    //removed on dispose

});