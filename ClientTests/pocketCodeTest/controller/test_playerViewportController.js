/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("playerViewportController.js");


QUnit.test("PlayerViewportController", function (assert) {
    var gameEngine = new PocketCode.GameEngine();
    var controller = new PocketCode.PlayerViewportController();

    assert.ok(controller instanceof  PocketCode.PlayerViewportController, "Instance check");
    assert.ok(controller.onSpriteClicked instanceof SmartJs.Event.Event, "Clicked Event check");

    var sprites = [];
    var variables = [];

    // rendering images
    assert.throws(function() {controller.initRenderingImages(0)}, Error,"Set rendering images to non-array type");

    controller.initRenderingImages(sprites);
    assert.ok(controller.renderingImages.length == 0, "Check rendering images init with empty array");


    // taken from test_sprite.js, overwrite game engine look getter
    assert.ok(typeof gameEngine.getLookImage === "function", "sprite-program interface: get look from store");
    gameEngine.getLookImage = function (id) {
            return { canvas: new Image(10, 10), center: { length: 0, angle: 0 }, initialScaling: 0.5 }; // important to set image size here
    };

    var testLook = {id:"id0", name:"first"};

    for (var i = 1; i < 5; i++){
        sprites.push(new PocketCode.Model.Sprite(gameEngine, {id: "id"+i, name: "sprite"+i}).renderingProperties);
    }

    controller.initRenderingImages(sprites);

    assert.ok(controller.renderingImages.length == 0, "Check rendering images init with no sprite having a look");

    var spriteWithLook = new PocketCode.Model.Sprite(gameEngine, {id: "id0", name: "sprite0", looks: [testLook] });

    sprites.splice(0, 0, spriteWithLook.renderingProperties);

    controller.initRenderingImages(sprites);

    assert.ok(controller.renderingImages.length == 1, "Check rendering images init with one sprite having a look");

    controller.updateSprite("id0", {x:300, y: 300});
    // TODO test if result correcct

    controller.updateSprite("id0", {layer:0});
    // TODO test if result correcct


    //spriteWithLook.setPosition(100, 200);
    console.log('rimage', controller.renderingImages[0]._x, controller.renderingImages[0]._y);

    // rendering variables

    assert.throws(function() {controller.initRenderingVariables(0)}, Error,"Set rendering images to non-array type");

    controller.initRenderingVariables(variables);
    assert.ok(controller.renderingVariables.length == 0, "Check rendering variables init with empty array");

    variables = [];

    for (var i = 0; i < 5; i++){
        variables.push({id:"id"+i, x:i, y:i*3,text:"placeholder", visible:true});
    }

    controller.initRenderingVariables(variables);
    assert.ok(controller.renderingVariables.length == 5, "Check rendering variables init");

    controller.updateVariable("id0", {x: 5, y:3});
    // TODO test if result correcct

    assert.ok(controller.takeScreenshot() != undefined, "Screenshot generated");

    controller.hideAxes();
    assert.ok(controller._view.axisVisible == false, "Axes hidden");

    controller.showAxes();
    assert.ok(controller._view.axisVisible == true, "Axes shown");

    var newWidth = 100;
    var newHeight = 100;
    controller.setProjectScreenSize(newWidth, newHeight);
    var dimensions = controller.dimensions;
    assert.ok(dimensions.width == newWidth, "New project screen width set correctly");
    assert.ok(dimensions.height == newHeight, "New project screen height set correctly");

    // TODO Test rendering properly (_redrawCanvas...)
    // controller.render();

});



