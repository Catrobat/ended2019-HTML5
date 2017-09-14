/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/ui/brickTextItem.js");


QUnit.test("BrickTextItem", function (assert) {

    var ctrl = new PocketCode.CodeView.Ui.BrickTextItem("5", false);
    assert.ok(ctrl instanceof PocketCode.CodeView.Ui.BrickTextItem && ctrl instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "BrickTextItem", "objClassName check");

    assert.equal(ctrl._textNode._text, "5", "textNode added");

    var ctrl = new PocketCode.CodeView.Ui.BrickTextItem("formula_editor_function_sin", true);
    assert.equal(ctrl._textNode._text, "sin", "i18nTextNode added");
});