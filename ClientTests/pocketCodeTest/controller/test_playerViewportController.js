/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
"use strict";

QUnit.module("controller/playerViewportController.js");


QUnit.test("PlayerViewportController", function (assert) {
    var gameEngine = new PocketCode.GameEngine();
    var controller = new PocketCode.PlayerViewportController();

    // check instance types
    assert.ok(controller instanceof PocketCode.PlayerViewportController, "Instance check");
    assert.ok(controller.onSpriteClicked instanceof SmartJs.Event.Event, "Clicked Event check");

    // check screen size
    var screenWidth = 100;
    var screenHeight = 200;
    controller.setProjectScreenSize(screenWidth, screenHeight);
    var dimensions = controller.dimensions;
    assert.ok(dimensions.width == screenWidth, "New project screen width set correctly");
    assert.ok(dimensions.height == screenHeight, "New project screen height set correctly");

    var sprites = [];
    var variables = [];

    // check rendering images with wrong type and empty list
    assert.throws(function () { controller.initRenderingImages(0) }, Error, "Set rendering images to non-array type");
    controller.initRenderingImages(sprites);
    assert.ok(controller.renderingImages.length == 0, "Check rendering images init with empty array");

    // taken from test_sprite.js, overwrite game engine look getter
    assert.ok(typeof gameEngine.getLookImage === "function", "sprite-program interface: get look from store");
    gameEngine.getLookImage = function () {
        return { canvas: fabric.document.createElement("canvas"), center: { length: 0, angle: 0 }, initialScaling: 1 };
    };

    for (var i = 1; i < 5; i++) {
        sprites.push(new PocketCode.Model.Sprite(gameEngine, { id: "id" + i, name: "sprite" + i }).renderingProperties);
    }
    // init with sprites without looks
    controller.initRenderingImages(sprites);
    assert.ok(controller.renderingImages.length == 0, "Check rendering images init with no sprite having a look");
    var testLook = { id: "id_0", resourceId: "resourceId_0", name: "first" };
    var spriteWithLook1 = new PocketCode.Model.Sprite(gameEngine, { id: "id0", name: "sprite0", looks: [testLook] });
    spriteWithLook1._looks[0]._canvas = "canvas";  //set internally do not return undefined as look for this test;
    sprites.splice(0, 0, spriteWithLook1.renderingProperties);
    var spriteWithLook2 = new PocketCode.Model.Sprite(gameEngine, { id: "id1", name: "sprite1", looks: [testLook] });
    spriteWithLook2._looks[0]._canvas = "canvas";  //set internally do not return undefined as look for this test;
    sprites.splice(0, 0, spriteWithLook2.renderingProperties);
    var spriteWithLook3 = new PocketCode.Model.Sprite(gameEngine, { id: "id2", name: "sprite2", looks: [testLook] });
    spriteWithLook3._looks[0]._canvas = "canvas";  //set internally do not return undefined as look for this test;
    sprites.splice(0, 0, spriteWithLook3.renderingProperties);

    // init with three sprite having a look
    controller.initRenderingImages(sprites);
    assert.equal(controller.renderingImages.length, 3, "Check rendering images init with three sprites having a look");

    var getSpriteWithId = function (id) {
        var images = controller._renderingImages;
        var len = images.length;
        for (var i = 0; i < len; i++) {
            if (images[i].id == id)
                return images[i];
        }
    };

    var getVariableWithId = function (id) {
        var vars = controller._renderingVariables;
        var len = vars.length;
        for (var i = 0; i < len; i++) {
            if (vars[i].id == id)
                return vars[i];
        }
    };

    // transformations from pc to canvas coordinates
    var transformX = function (x) {
        return x + screenWidth / 2.0;
    };

    var transformY = function (y) {
        return screenHeight / 2.0 - y;
    };

    var updatedX, updatedY;
    updatedX = 300;
    updatedY = 325;

    var updatedSprite = getSpriteWithId("id0");
    controller.updateSprite("id0", { x: updatedX, y: updatedY });

    assert.ok(updatedSprite.x == transformX(updatedX), "Updated Sprite x position");
    assert.ok(updatedSprite.y == transformY(updatedY), "Updated Sprite y position");

    //test other sprite changes ? part of renderingImage tests, as other changes are propagated directly

    // layer moving
    var oldLayer = 2;
    assert.ok(controller._renderingImages.indexOf(updatedSprite) == oldLayer, "Test sprite layer");
    var updatedLayer = 0;
    controller.updateSprite("id0", { layer: updatedLayer });
    assert.ok(controller._renderingImages.indexOf(updatedSprite) == updatedLayer, "Test sprite layer move forward");
    updatedLayer = 2;
    controller.updateSprite("id0", { layer: updatedLayer });
    assert.ok(controller._renderingImages.indexOf(updatedSprite) == updatedLayer, "Test sprite layer move backwards");

    updatedLayer = 2;
    controller.updateSprite("id0", { layer: 5 });
    assert.ok(controller._renderingImages.indexOf(updatedSprite) == updatedLayer, "Test sprite layer move out of rear-bound");

    updatedLayer = 0;
    controller.updateSprite("id0", { layer: -2 });
    assert.ok(controller._renderingImages.indexOf(updatedSprite) == updatedLayer, "Test sprite layer move out of front-bound");

    spriteWithLook1.setPosition(100, 200);
    // rendering variables

    assert.throws(function () { controller.initRenderingVariables(0) }, Error, "Set rendering images to non-array type");

    controller.initRenderingVariables(variables);
    assert.ok(controller.renderingVariables.length == 0, "Check rendering variables init with empty array");

    variables = [];

    for (var i = 0; i < 5; i++) {
        variables.push({ id: "id" + i, x: i, y: i * 3, text: "placeholder", visible: true });
    }

    controller.initRenderingVariables(variables);
    assert.ok(controller.renderingVariables.length == 5, "Check rendering variables init");

    var testedVariable = getVariableWithId("id0");
    controller.updateVariable("id0", { x: 5, y: 3 });

    assert.ok(testedVariable.x == transformX(5), "Updated Variable x position");
    assert.ok(testedVariable.y == transformY(3), "Updated Variable y position");
    var scr = controller.takeScreenshot();
    assert.ok(scr != undefined, "Screenshot generated");

    // TODO compare screenshots... not possible without accessing private vars, move to view tests?

    // test various axes visibility states consecutively
    controller.hideAxes();
    assert.ok(controller._view.axisVisible == false, "Axes hidden");
    controller.hideAxes();
    assert.ok(controller._view.axisVisible == false, "Axes still hidden");

    controller.showAxes();
    assert.ok(controller._view.axisVisible == true, "Axes shown");

    controller.showAxes();
    assert.ok(controller._view.axisVisible == true, "Axes still shown");

    controller.hideAxes();
    assert.ok(controller._view.axisVisible == false, "Axes hidden again");

});

