/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/ui/codeViewMenu.js");


QUnit.test("CodeViewMenu", function (assert) {

    var ctrl = new PocketCode.CodeView.Ui.Menu();
    assert.ok(ctrl instanceof PocketCode.CodeView.Ui.Menu && ctrl instanceof PocketCode.Ui.Menu, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "Menu", "objClassName check");

    assert.ok(false, "TODO");
});