/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/view/loopBrick.js");


QUnit.test("View LoopBrick", function (assert) {

    var content = {
        content: [
            {
                type: 'text',
                i18n: 'brick_forever',
            }
        ],
        endContent: [
            {
                type: 'text',
                i18n: 'brick_loop_end',
            }
        ]

    };

    var brick = new PocketCode.View.LoopBrick(false, content, false);

    assert.ok(brick instanceof PocketCode.View.LoopBrick && brick instanceof PocketCode.View.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "LoopBrick", "objClassName check");

    assert.equal(brick._childs[1]._childs[1]._textNode._text, "Forever", "brick_forever added");
    assert.ok(brick._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added");
    assert.equal(brick._childs[3]._childs[0]._textNode._text, "End of loop", "brick_loop_end added");
});