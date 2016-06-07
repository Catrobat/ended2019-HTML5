/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("components/renderingImage.js");


QUnit.test("RenderingImage", function (assert) {
    var gameEngine = new PocketCode.GameEngine();

    // taken from test_sprite.js, overwrite game engine look getter
    assert.ok(typeof gameEngine.getLookImage === "function", "sprite-program interface: get look from store");
    var initialScaling = 0.5;
    gameEngine.getLookImage = function () {
        return { canvas: fabric.document.createElement('canvas'), center: { length: 0, angle: 0 }, initialScaling: initialScaling };
    };

    var id = 'id0';
    var testLook = {id: id, name:"firstlook"};
    var x, y;
    x = y = 24;
    var rotationAngle = 90;
    var brightness = 31;
    var transparency = 63;
    var opacity = 100 - transparency;
    var sprite = new PocketCode.Model.Sprite(gameEngine, {id: "id0", name: "sprite0", looks: [testLook]});
    sprite.init();
    sprite.setPosition(x,y);
    sprite.setDirection(rotationAngle);
    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, brightness);
    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, transparency);

    assert.throws(function() {new PocketCode.RenderingImage()}, Error, 'missing constructor argument');

    var renderingImage = new PocketCode.RenderingImage(sprite.renderingProperties);

    assert.ok(renderingImage instanceof  PocketCode.RenderingImage, 'Instance check');

    var image = renderingImage.object;
    assert.ok(image instanceof fabric.Image, 'fabric image created');
    assert.ok(image.perPixelTargetFind == true, 'perpixeltargetfind setup correctly');
    assert.ok(image.selectable == false, 'selection setup correctly');
    assert.ok(image.hasControls == false, 'controls setup correctly');
    assert.ok(image.hasBorders == false, 'borders setup correctly');
    assert.ok(image.hasRotatingPoint == false, 'rotation point setup correctly');
    assert.ok(image.originX == 'center', 'origin x setup correctly');
    assert.ok(image.originY == 'center', 'origin y setup correctly');
    assert.ok(image.centeredScaling == true, 'centeredscaling setup correctly');

    assert.ok(renderingImage.id == id, 'id set correctly');
    assert.ok(renderingImage.x == x, 'x set correctly');
    assert.ok(renderingImage.y == y, 'y set correctly');
    assert.ok(image.scaleX == 1. / initialScaling, 'x scaling set correctly');
    assert.ok(image.scaleY == 1. / initialScaling, 'y scaling set correctly');

    assert.ok(image.angle == rotationAngle - 90., 'rotation angle set correctly');
    assert.ok(image.flipX == false, 'flipX set correctly');
    assert.ok(image.visible == true, 'visibility set correctly');

    // needs restructuring if more filters become available
    assert.ok(image.filters.length == 1, 'filter is set');
    assert.ok(image.filters[0].brightness == Math.round((brightness - 100) * 2.55), 'filter value correct');
    renderingImage.graphicEffects = [{effect:PocketCode.GraphicEffect.BRIGHTNESS, value:0}];
    assert.ok(image.filters.length == 0, 'setting brightness to 100% removes filter');

    assert.ok(image.opacity == opacity / 100., 'opacity set correctly');
    var setGraphicEffects = function () {renderingImage.graphicEffects = 1;};
    assert.throws(function() {setGraphicEffects()}, Error, 'set effects to non-array type');

});



