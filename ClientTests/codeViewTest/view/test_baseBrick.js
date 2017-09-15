/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/view/loopBrick.js");


QUnit.test("View BaseBrick", function (assert) {

    var content = {content: ""}
    var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, false, content);
    view._removeChild(view._childs[1]);
    assert.ok(view instanceof PocketCode.View.BaseBrick && view instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(view.objClassName === "BaseBrick", "objClassName check");

    //properties
    view.selectable = false;
    assert.equal(view._selectable, false, "selectable set correctly");

    view.commentedOut = true;
    var commentedOut = view.commentedOut;
    assert.equal(commentedOut, true, "commentedOut set correctly");

    view.isEndBrick = true;
    var isEndBrick = view.className.includes("pc-endBrick")
    assert.equal(isEndBrick, true, "isEndBrick set correctly to true");

    view.isEndBrick = false;
    isEndBrick = view.className.includes("pc-endBrick")
    assert.equal(isEndBrick, false, "isEndBrick set correctly to false");


    //methods

    var content = {
        content: [
            {
                type: 'text',
                i18n: 'brick_wait'
            }
        ]
    };
    view._createAndAppend(content.content);
    assert.equal(view._childs[1]._childs[0]._textNode._text, "Wait", "_createAndAppend type text set");
    assert.equal(view._childs[1]._childs[0]._textNode._i18n, "brick_wait", "_createAndAppend type text set 2");

    content = {
        content: [
            {
                type: 'lf'
            }
        ]
    };

    view._createAndAppend(content.content);
    assert.ok(view._childs[2]._childs[0] instanceof SmartJs.Ui.Control, "_createAndAppend type lf set");

    content = {
        content: [
            {
                type: 'formula',
                id: SmartJs.getNewId(),
                value: { type: "NUMBER", value: 5},
            }
        ]
    };

    view._createAndAppend(content.content);
    assert.equal(view._childs[3]._childs[0]._childs[0]._textNode._text, "5", "_createAndAppend type formula set");
    assert.ok(view._childs[3]._childs[0]._onClick._listeners[0].scope instanceof PocketCode.View.BaseBrick, "_createAndAppend type formula event");

    //todo: select.value test
    content = {
        content: [
            {
                type: 'select',
                id: SmartJs.getNewId(),
                value: ''
            }
        ]
    };

    view._createAndAppend(content.content);
    assert.ok(view._childs[4]._childs[0] instanceof PocketCode.CodeView.Ui.BrickDropdown, "_createAndAppend type select set");
    assert.ok(view._childs[4]._childs[0]._onClick._listeners[0].scope instanceof PocketCode.View.BaseBrick, "_createAndAppend type select event");


    //todo _drawBackground
});

