/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/view/eventBrick.js");


QUnit.test("View EventBrick", function (assert) {

    var content = {
        content: [
            {
                type: 'text',
                i18n: 'brick_when_started'
            }
        ],
        endContent: [
            {
                type: 'text',
                i18n: ''
            }
        ]
    };
    var brick = new PocketCode.View.EventBrick(false, content);

    assert.ok(brick instanceof PocketCode.View.EventBrick && brick instanceof PocketCode.View.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "EventBrick", "objClassName check");

    assert.ok(brick._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.ok(brick._childs[3]._childs[0] instanceof PocketCode.CodeView.Ui.BrickTextItem, "endContent added")
});