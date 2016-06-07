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
    assert.ok(renderingText.id == id, 'id set correctly');
    assert.ok(renderingText.x == x, 'x set correctly');
    assert.ok(renderingText.y == y, 'y set correctly');

    assert.ok(false, 'TODO');

    /*id: propObject.id,
     selectable: false,
     hasControls: false,
     hasBorders: false,
     hasRotatingPoint: false,
     originX: "left",
     originY: "top",
     positionX: propObject.x,
     positionY: propObject.y,
     fontFamily: 'Arial',
     fontSize: 50,
     fontWeight: 'bold',
     //fill: 'rgb(b,b,b)',
     visible: propObject.visible,*/

});



