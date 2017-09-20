/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/controller/bricksCore.js");


QUnit.test("BaseBrick", function (assert) {

    var model = new PocketCode.Model.BaseBrick("device", "sprite", { id: "id", commentedOut: false });
    var content = {content: ""};//todo : content
    var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, false, content);

    var brick = new PocketCode.BaseBrick(view, model, false);

    assert.ok(brick instanceof PocketCode.BaseBrick && brick instanceof PocketCode.BaseController, "instance check + inheritance");
    assert.ok(brick.objClassName === "BaseBrick", "objClassName check");

    assert.equal(brick._commentedOut, false, "_commentedOut set")
    var brick = new PocketCode.BaseBrick(view, model, true);
    assert.equal(brick._commentedOut, true, "_commentedOut set 2")
    assert.ok(brick._model instanceof PocketCode.Model.BaseBrick, "_model set")

});

QUnit.test("UnsupportedBrick", function (assert) {

    var b = new PocketCode.Model.UnsupportedBrick("device", "sprite", { id: "id", commentedOut: false, xml: "xml", brickType: "brickType" });

    var brick = new PocketCode.UnsupportedBrick(b, false);

    assert.ok(brick instanceof PocketCode.UnsupportedBrick && brick instanceof PocketCode.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "UnsupportedBrick", "objClassName check");
});