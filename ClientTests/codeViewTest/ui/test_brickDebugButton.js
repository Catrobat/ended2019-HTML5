/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/ui/brickDebugButton.js");


QUnit.test("BrickDebugButton", function (assert) {

    var i18nKey = { type: "NUMBER", value: 5};

    var ctrl = new PocketCode.CodeView.Ui.BrickDebugButton(i18nKey);
    assert.ok(ctrl instanceof PocketCode.CodeView.Ui.BrickDebugButton && ctrl instanceof PocketCode.Ui.Button, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "BrickDebugButton", "objClassName check");
});