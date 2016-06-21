/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("components/renderingText.js");


QUnit.test("RenderingText", function (assert) {
    assert.throws(function() {new PocketCode.RenderingText();}, Error, 'fail on missing constructor argument');
    // underlying vars are defined in uservariablehost
    var id = 'id0',
        x = 20,
        y = 16,
        text = 'Hello, world!',
        visible = true;

    var props = {id: id, text: text, x: x, y: y, visible: visible};
    var renderingText = new PocketCode.RenderingText(props);

    assert.ok(renderingText instanceof  PocketCode.RenderingText, 'correct instance');

    // test default config
    assert.equal(renderingText.id, id, 'id set correctly');
    assert.equal(renderingText.x, x, 'x set correctly in constructor');
    assert.equal(renderingText.y, y, 'y set correctly in constructor');

    x = 10;
    y = 15;
    renderingText.x = x;
    renderingText.y = y;

    assert.equal(renderingText.x, x, 'x set correctly in setter');
    assert.equal(renderingText.y, y, 'y set correctly in setter');

    text = 5;
    renderingText.text = text;
    assert.equal(renderingText._text, text.toString(), "Numeric Text set correctly");

    renderingText.text = text;
    assert.equal(renderingText._text, text, "String set to text correctly");

    var visibility = 5;
    renderingText.visible = visibility;
    assert.equal(renderingText.visible, visibility, "Set visibility");

    renderingText.visible = false;
    assert.equal(renderingText.visible, renderingText.visible, "Get visibility");

    //rendering
    var fillTextCalled = 0;
    var context = {
        fillText: function () {
            fillTextCalled++;
        }
    };

    renderingText.draw(context);
    assert.ok(!fillTextCalled, "No text drawn on canvas is Text is not visible");
    fillTextCalled = 0;

    var numberOfNewlines = 5;
    text = "Hello world";

    for (var i = 0, l = numberOfNewlines; i < l; i++){
        text = text + "\n test";
    }

    renderingText.text = text;
    renderingText.visible = true;
    renderingText.draw(context);
    assert.equal(fillTextCalled, numberOfNewlines + 1, "Create Text on Canvas with fillText for each line of text");

});



