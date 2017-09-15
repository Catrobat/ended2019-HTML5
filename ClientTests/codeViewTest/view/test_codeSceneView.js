/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/view/codeSceneView.js");


QUnit.test("CodeSceneView", function (assert) {

    var view = new PocketCode.CodeSceneView();

    assert.ok(view instanceof PocketCode.CodeSceneView && view instanceof PocketCode.Ui.TabPage, "instance check + inheritance");
    assert.ok(view.objClassName === "CodeSceneView", "objClassName check");
});