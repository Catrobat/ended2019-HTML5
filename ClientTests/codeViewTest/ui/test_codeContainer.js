/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/ui/codeContainer.js");


QUnit.test("CodeListing", function (assert) {

    var ctrl = new PocketCode.CodeView.Ui.CodeListing();
    assert.ok(ctrl instanceof PocketCode.CodeView.Ui.CodeListing && ctrl instanceof PocketCode.Ui.ScrollContainer, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "CodeListing", "objClassName check");

    assert.ok(false, "TODO");
});

QUnit.test("CodeContainer", function (assert) {

    var i18nKey = { type: "NUMBER", value: 5};

    var ctrl = new PocketCode.CodeView.Ui.CodeContainer(i18nKey);
    assert.ok(ctrl instanceof PocketCode.CodeView.Ui.CodeContainer && ctrl instanceof SmartJs.Ui.ContainerControl, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "CodeContainer", "objClassName check");

    assert.ok(false, "TODO");
});