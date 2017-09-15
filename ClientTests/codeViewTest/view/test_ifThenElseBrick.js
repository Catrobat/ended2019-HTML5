/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/view/ifThenElseBrick.js");


QUnit.test("View IfThenElseBrick", function (assert) {

    var content = {
        content: [
            {
                type: 'text',
                i18n: 'brick_if_begin'
            },
            {
                type: 'formula',
                id: SmartJs.getNewId(),
                value: { type: "NUMBER", value: 5}
            },
            {
                type: 'text',
                i18n: 'brick_if_begin_second_part'
            }
        ],
        elseContent: [
            {
                type: 'text',
                i18n: 'brick_if_else'
            }
        ],
        endContent: [
            {
                type: 'text',
                i18n: 'brick_if_end'
            }
        ]

    };
    var brick = new PocketCode.View.IfThenElseBrick(false, true, content);

    assert.ok(brick instanceof PocketCode.View.IfThenElseBrick && brick instanceof PocketCode.View.BaseBrick, "instance check + inheritance");
    assert.ok(brick.objClassName === "IfThenElseBrick", "objClassName check");

    assert.equal(brick._childs[1]._childs[1]._textNode._text, "If", "brick_if_begin added");
    assert.equal(brick._childs[1]._childs[2]._childs[0]._textNode._text, "5", "brick_if formula added");
    assert.equal(brick._childs[1]._childs[3]._textNode._text, "is true then", "brick_if_begin_second_part added");

    assert.ok(brick._childs[2] instanceof SmartJs.Ui.HtmlTag, "ul tag added (if)");

    assert.equal(brick._childs[3]._childs[0]._childs[0]._textNode._text, "Else", "brick_if_else added");
    assert.ok(brick._childs[3]._childs[1] instanceof SmartJs.Ui.HtmlTag, "ul tag added (else)");

    assert.equal(brick._childs[4]._childs[0]._textNode._text, "End If", "brick_if_end added");
});