/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
"use strict";

QUnit.module("components/renderingImage.js");


QUnit.test("RenderingImage", function (assert) {

    //var img = {
    //    canvas: document.createElement("canvas"),
    //    originalWidth: 10,
    //    originalHeight: 10,
    //    center: {},
    //    tl: {},
    //    tr: {},
    //    bl: {},
    //    br: {},
    //};

    var ALPHA_CHANNEL = 3;
    var alphaAtPoint = function (x, y) {
        var ctx = canvas.getContext("2d");   // access to check internal settings
        return ctx.getImageData(x, y, 1, 1).data[ALPHA_CHANNEL];
    };

    var pixelHasAlpha = function (x, y) {
        return alphaAtPoint(x, y) > 0.;
    };

    var pixelNearEdge = function (x, y, rect, minorThreshold) {
        var eps = minorThreshold ? 1.0 : 2.0;

        var ld = Math.abs(rect.tlX - x) <= eps;
        var rd = Math.abs(rect.tlX + rect.width - x) <= eps;
        var td = Math.abs(rect.tlY - y) <= eps;
        var bd = Math.abs(rect.tlY + rect.height - y) <= eps;

        return ld || rd || td || bd;
    };

    var pixelWithinBoundaries = function (x, y, rect) {
        var insideLeftBound, insideUpperBound, insideRightBound, insideLowerBound;

        insideLeftBound = x >= rect.tlX;
        insideRightBound = x < (rect.tlX + rect.width);
        insideUpperBound = y >= rect.tlY;
        insideLowerBound = y < (rect.tlY + rect.height);

        return insideLeftBound && insideRightBound && insideUpperBound && insideLowerBound;
    };

    // calculates pixel position before rotation
    var rotatePointAroundAnchor = function (x, y, anchorX, anchorY, angle) {
        angle = angle * (Math.PI / 180.);

        var xPrime = Math.cos(angle) * (x - anchorX) - Math.sin(angle) * (y - anchorY) + anchorX;
        var yPrime = Math.sin(angle) * (x - anchorX) + Math.cos(angle) * (y - anchorY) + anchorY;

        return { x: xPrime, y: yPrime }
    };

    // helper function to check which pixels of canvas were actually drawn on
    var checkPixels = function (centerX, centerY, width, height, rotation, log) {
        var canvasHeight = canvas.height;
        var canvasWidth = canvas.width;
        var pixelIsSet, rotatedPoint, originalX, originalY;
        var rect = {};
        // coordinates given are centerX, centerY
        // shifting the coordinates to top left for checking the drawn area
        // ............     ............
        // ..-------...     ..x------...
        // ..---x---... ->  ..-------...
        // ..-------...     ..-------...
        // ............     ............
        var topLeftX = Math.round(centerX - width / 2.);
        var topLeftY = Math.round(centerY - height / 2.);

        rect = { tlX: topLeftX, tlY: topLeftY, width: width, height: height };

        for (var currentY = 0; currentY < canvasHeight; currentY++) {
            for (var currentX = 0; currentX < canvasWidth; currentX++) {
                pixelIsSet = pixelHasAlpha(currentX, currentY);

                if (rotation) {
                    // find original pixel
                    // negative rotation as rotation is applied clockwise at rendering
                    rotatedPoint = rotatePointAroundAnchor(currentX, currentY, centerX, centerY, -rotation);
                    // console.log(currentX, currentY, centerX, centerY, rotation);
                    originalX = rotatedPoint.x;
                    originalY = rotatedPoint.y;

                    // was original pixel within rect?
                    if (pixelWithinBoundaries(originalX, originalY, rect)) {
                        if (!pixelIsSet && !pixelNearEdge(originalX, originalY, rect)) {
                            console.log(currentX, currentY, "orig", rotatedPoint.x, rotatedPoint.y);
                            console.log("source px inside bounds but destination px not set");
                            return false;
                        }
                    }

                    else {
                        if (pixelIsSet) {
                            if (pixelNearEdge(originalX, originalY, rect))
                                continue;
                            console.log(currentX, currentY, "orig", originalX, originalY);
                            console.log("source px outside bounds but destination px set to", alphaAtPoint(currentX, currentY));
                            return false;
                        }
                    }
                }

                else {
                    if (pixelWithinBoundaries(currentX, currentY, rect)) {
                        // pixel is within boundaries, is it set?
                        if (!pixelIsSet && !pixelNearEdge(currentX, currentY, rect, true)) {
                            console.log("pixel not set, but it should be", currentX, currentY);
                            return false;
                        }
                    }

                    else {
                        // pixel not inside boundaries, is it set?
                        if (pixelIsSet && !pixelNearEdge(currentX, currentY, rect, true)) {
                            console.log("pixel set, but it shouldnt be", currentX, currentY);
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };

    // var gameEngine = new PocketCode.GameEngine();
    //
    // // taken from test_sprite.js, overwrite game engine look getter
    // assert.ok(typeof gameEngine.getLookImage === "function", "sprite-program interface: get look from store");
    // var initialScaling = 0.5;
    // gameEngine.getLookImage = function () {
    //     return { canvas: document.createElement("canvas"), center: { length: 0, angle: 0 }, initialScaling: initialScaling };
    // };
    //
    // var id = "id0";
    // var testLook = {id: id, name:"firstlook"};
    // var x, y;
    // x = y = 24;
    // var rotationAngle = 90;
    // var brightness = 31;
    // var transparency = 63;
    // var opacity = 100 - transparency;
    // var sprite = new PocketCode.Model.Sprite(gameEngine, {id: "id0", name: "sprite0", looks: [testLook]});
    // sprite.init();
    // sprite.setPosition(x,y);
    // sprite.setDirection(rotationAngle);
    // sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, brightness);
    // sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, transparency);
    //
    // assert.throws(function() {new PocketCode.RenderingImage()}, Error, "missing constructor argument");
    //
    // var renderingImage = new PocketCode.RenderingImage(sprite.renderingProperties);
    //
    // assert.ok(renderingImage instanceof  PocketCode.RenderingImage, "Instance check");
    //
    // var image = renderingImage.object;
    // assert.ok(image.perPixelTargetFind == true, "perpixeltargetfind setup correctly");
    // assert.ok(image.selectable == false, "selection setup correctly");
    // assert.ok(image.hasControls == false, "controls setup correctly");
    // assert.ok(image.hasBorders == false, "borders setup correctly");
    // assert.ok(image.hasRotatingPoint == false, "rotation point setup correctly");
    // assert.ok(image.originX == "center", "origin x setup correctly");
    // assert.ok(image.originY == "center", "origin y setup correctly");
    // assert.ok(image.centeredScaling == true, "centeredscaling setup correctly");
    //
    // assert.ok(renderingImage.id == id, "id set correctly");
    // assert.ok(renderingImage.x == x, "x set correctly");
    // assert.ok(renderingImage.y == y, "y set correctly");
    // assert.ok(image.scaleX == 1. / initialScaling, "x scaling set correctly");
    // assert.ok(image.scaleY == 1. / initialScaling, "y scaling set correctly");
    //
    // assert.ok(image.angle == rotationAngle - 90., "rotation angle set correctly");
    // assert.ok(image.flipX == false, "flipX set correctly");
    // assert.ok(image.visible == true, "visibility set correctly");
    //
    // // needs restructuring if more filters become available
    // assert.ok(image.filters.length == 1, "filter is set");
    // assert.ok(image.filters[0].brightness == Math.round((brightness - 100) * 2.55), "filter value correct");
    // renderingImage.graphicEffects = [{effect:PocketCode.GraphicEffect.BRIGHTNESS, value:0}];
    // assert.ok(image.filters.length == 0, "setting brightness to 100% removes filter");
    //
    // assert.ok(image.opacity == opacity / 100., "opacity set correctly");
    // var setGraphicEffects = function () {renderingImage.graphicEffects = 1;};
    // assert.throws(function() {setGraphicEffects()}, Error, "set effects to non-array type");

    var asyncTestsDone = assert.async();

    var runTests = function () {

        var canvasElement = { width: 10, height: 20 };
        var renderingImage = new PocketCode.RenderingImage({ look: canvasElement });

        assert.ok(renderingImage instanceof PocketCode.RenderingImage, "instance check");
        assert.equal(renderingImage.object, canvasElement, "RenderingImage.object returns canvas element");

        assert.throws(function () { new PocketCode.RenderingImage(); }, Error, "missing arguments");
        assert.throws(function () { new PocketCode.RenderingImage("string"); }, Error, "argument not an object");

        renderingImage._x = 10;
        renderingImage._y = 15;

        assert.ok(renderingImage.containsPoint({ x: 5, y: 5 }), "Contains Point on left top corner");
        assert.ok(renderingImage.containsPoint({ x: 15, y: 5 }), "Contains Point on right top corner");
        assert.ok(renderingImage.containsPoint({ x: 15, y: 25 }), "Contains Point on right bottom corner");
        assert.ok(renderingImage.containsPoint({ x: 5, y: 25 }), "Contains Point on left bottom corner");
        assert.ok(!renderingImage.containsPoint({ x: 4, y: 5 }), "Does not contain Point outside left border");
        assert.ok(!renderingImage.containsPoint({ x: 5, y: 4 }), "Does not contain Point outside top border");
        assert.ok(!renderingImage.containsPoint({ x: 5, y: 26 }), "Does not contain Point outside bottom border");
        assert.ok(!renderingImage.containsPoint({ x: 16, y: 6 }), "Does not contain Point outside top border");

        for (var rotationAngle = 0; rotationAngle <= 360; rotationAngle += 30) {
            renderingImage.rotation = rotationAngle;
            var rad = (-rotationAngle + 90) * (Math.PI / 180.0);

            var xOffset = renderingImage.height / 2 * Math.cos(rad);
            var yOffset = renderingImage.height / 2 * Math.sin(rad);
            var centerTop = { x: renderingImage.x + xOffset, y: renderingImage.y - yOffset };
            var centerBottom = { x: renderingImage.x - xOffset, y: renderingImage.y + yOffset };

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = renderingImage.width / 2 * Math.cos(rad);
            yOffset = renderingImage.width / 2 * Math.sin(rad);
            var centerRight = { x: renderingImage.x + xOffset, y: renderingImage.y - yOffset };
            var centerLeft = { x: renderingImage.x - xOffset, y: renderingImage.y + yOffset };

            assert.ok(renderingImage.containsPoint(centerTop) && renderingImage.containsPoint(centerBottom)
                && renderingImage.containsPoint(centerLeft) && renderingImage.containsPoint(centerRight), "Contains Points on boundaries with rotation: " + rotationAngle);

            rad = (-rotationAngle + 90) * (Math.PI / 180.0);
            xOffset = ((renderingImage.height / 2) + 1) * Math.cos(rad);
            yOffset = ((renderingImage.height / 2) + 1) * Math.sin(rad);
            centerTop = { x: renderingImage.x + xOffset, y: renderingImage.y - yOffset };
            centerBottom = { x: renderingImage.x - xOffset, y: renderingImage.y + yOffset };

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = ((renderingImage.width / 2) + 1) * Math.cos(rad);
            yOffset = ((renderingImage.width / 2) + 1) * Math.sin(rad);
            centerRight = { x: renderingImage.x + xOffset, y: renderingImage.y - yOffset };
            centerLeft = { x: renderingImage.x - xOffset, y: renderingImage.y + yOffset };

            assert.ok(!renderingImage.containsPoint(centerTop) && !renderingImage.containsPoint(centerBottom)
                && !renderingImage.containsPoint(centerLeft) && !renderingImage.containsPoint(centerRight), "Does not contain Points outside boundaries with rotation: " + rotationAngle);
        }

        //draw tests
        //var look1 = new PocketCode.Model.Look({ name: "look1", id: "sid1", resourceId: "s1" });
        //var look2 = new PocketCode.Model.Look({ name: "look2", id: "sid2", resourceId: "s2" });

        var sprite1 = new PocketCode.Model.Sprite(gameEngine, { id: "id0", name: "sprite0", looks: [{ name: "look1", id: "sid1", resourceId: "s1" }] });   //look1] });
        sprite1.initLooks();
        sprite1.init();
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, { id: "id1", name: "sprite1", looks: [{ name: "look2", id: "sid2", resourceId: "s2" }] });   //look2] });
        sprite2.initLooks();
        sprite2.init();

        var renderingImageOpaque = new PocketCode.RenderingImage(sprite1.renderingProperties);
        var renderingImageTransparent = new PocketCode.RenderingImage(sprite2.renderingProperties);

        //draw tests
        var ctx = canvas.getContext("2d");

        renderingImageOpaque.draw(ctx);
        assert.ok(ctx.getImageData(0, 0, 1, 1).data[3], "visible image drawn");
        renderingImageOpaque.visible = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderingImageOpaque.draw(ctx);
        assert.ok(!ctx.getImageData(0, 0, 1, 1).data[3], "invisible image not drawn");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderingImageOpaque.visible = true;

        //  ************** TESTS WITH 100% opaque SPRITE ******************************************************************
        //  test simple rendering on origin
        var estimatedCenterX, estimatedCenterY, rotationAngle;
        var opaqueImageWidth = renderingImageOpaque.object.width;
        var opaqueImageHeight = renderingImageOpaque.object.height;
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        renderingImageOpaque.draw(ctx);
        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0;
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (topleft)");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test centered rendering
        estimatedCenterX = renderingImageOpaque.x = canvasWidth / 2.;
        estimatedCenterY = renderingImageOpaque.y = canvasHeight / 2.;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (center)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering corners
        estimatedCenterX = renderingImageOpaque.x = canvasWidth;
        estimatedCenterY = renderingImageOpaque.y = 0.;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (top right)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering bottom left
        estimatedCenterX = renderingImageOpaque.x = 0.;
        estimatedCenterY = renderingImageOpaque.y = canvasHeight;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (bottom left)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering bottom right
        estimatedCenterX = renderingImageOpaque.x = canvasWidth;
        estimatedCenterY = renderingImageOpaque.y = canvasHeight;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (bottom right)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering somewhere
        estimatedCenterX = renderingImageOpaque.x = Math.random() * canvasWidth;
        estimatedCenterY = renderingImageOpaque.y = Math.random() * canvasHeight;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (random position)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering x ceil
        estimatedCenterX = 26;
        estimatedCenterY = 30;
        renderingImageOpaque.x = 25.55;
        renderingImageOpaque.y = 30;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, false, true), "opaque sprite (subpixel x ceil)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering y ceil
        estimatedCenterX = 25;
        estimatedCenterY = 31;
        renderingImageOpaque.x = 25;
        renderingImageOpaque.y = 30.55;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (subpixel y ceil)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering x floor
        estimatedCenterX = 25;
        estimatedCenterY = 30;
        renderingImageOpaque.x = 25.45;
        renderingImageOpaque.y = 30;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (subpixel x floor)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering y floor
        estimatedCenterX = 25;
        estimatedCenterY = 30;
        renderingImageOpaque.x = 25;
        renderingImageOpaque.y = 30.45;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (subpixel y floor)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (rotationAngle = 0; rotationAngle <= 360; rotationAngle += 30) {
            // test rotated rendering
            estimatedCenterX = renderingImageOpaque.x = 10;
            estimatedCenterY = renderingImageOpaque.y = 10;
            renderingImageOpaque.rotation = rotationAngle;
            renderingImageOpaque.draw(ctx);
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, rotationAngle), "opaque sprite (rotated " + rotationAngle + ")");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // ******************* TEST WITH PARTLY TRANSPARENT SPRITE *********************************************************
        // 5x5 area of 10x10 image

        // simple rendering in origin
        var transparentImageWidth = renderingImageTransparent.object.width;
        var transparentImageHeight = renderingImageTransparent.object.height;

        estimatedCenterX = estimatedCenterY = renderingImageTransparent.x = renderingImageTransparent.y = 5;
        renderingImageTransparent.draw(ctx);

        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight), "transparent sprite (origin)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // render in center
        estimatedCenterX = renderingImageTransparent.x = canvasWidth / 2.;
        estimatedCenterY = renderingImageTransparent.y = canvasHeight / 2.;

        renderingImageTransparent.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight), "transparent sprite (center)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // rendering rotated 45
        estimatedCenterX = estimatedCenterY = renderingImageTransparent.x = renderingImageTransparent.y = 5;
        rotationAngle = 45;
        renderingImageTransparent.rotation = rotationAngle;

        renderingImageTransparent.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight, rotationAngle), "transparent sprite (rotated 45)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // rendering rotated 60
        estimatedCenterX = estimatedCenterY = renderingImageTransparent.x = renderingImageTransparent.y = 5;
        rotationAngle = 60;
        renderingImageTransparent.rotation = rotationAngle;

        renderingImageTransparent.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight, rotationAngle), "transparent sprite (rotated 60)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ********************* TEST WITH CONTEXT SCALING ******************************************************************
        var viewportScaling = 1.5;

        renderingImageOpaque.rotation = 0;
        //renderingImageOpaque.scaling = 1.5;

        canvas.width = 80;
        canvas.height = 40;

        canvasHeight = canvas.height;
        canvasWidth = canvas.width;

        ctx = canvas.getContext("2d");
        ctx.scale(viewportScaling, viewportScaling);

        // rendering origin 1.5x
        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0; // 0 * 1.5

        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (canvas 1.5x, origin)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderingImageOpaque.x = canvasWidth / 2.;
        renderingImageOpaque.y = canvasHeight / 2.;
        estimatedCenterX = renderingImageOpaque.x * viewportScaling;
        estimatedCenterY = renderingImageOpaque.y * viewportScaling;

        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (canvas 1.5x)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (rotationAngle = 0; rotationAngle <= 360; rotationAngle += 36) {
            renderingImageOpaque.rotation = rotationAngle;

            renderingImageOpaque.draw(ctx);
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling, rotationAngle), "opaque sprite (canvas 1.5x, rotated " + rotationAngle + ")");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        //filters
        renderingImage._filters.brightness = 0;
        var originalData = [
            1, 2, 3, 4,
            7, 8, 9, 17,
            3, 3, 2, 15
        ];

        var modifiedData = originalData.slice(0);

        renderingImage.applyBrightnessFilter(modifiedData);

        var dataAsExpected = true;
        for (var i = 0, l = modifiedData.length; i < l; i++) {
            if (originalData[i] !== modifiedData[i])
                dataAsExpected = false;
        }

        assert.ok(dataAsExpected, "applyBrightnessFilter: no change made to brightness if brightness is 0");

        var brightnessChange = 10;
        renderingImage._filters.brightness = brightnessChange;

        dataAsExpected = true;
        modifiedData = originalData.slice(0);
        renderingImage.applyBrightnessFilter(modifiedData);

        for (i = 0, l = modifiedData.length; i < l; i++) {
            if (!(i % 4) && (modifiedData[i] !== originalData[i] + Math.round(brightnessChange * 2.55))) {
                dataAsExpected = false;
            }
        }

        assert.ok(dataAsExpected, "applyBrightnessFilter: correct change made to brightness if brightness is not 0");

        var filterRenderingImage = new PocketCode.RenderingImage(sprite1.renderingProperties);

        var brightnessFilterApplied = false;
        filterRenderingImage.applyBrightnessFilter = function () {
            brightnessFilterApplied = true;
        };

        var colorFilterApplied = false;
        filterRenderingImage.applyColorFilter = function () {
            colorFilterApplied = true;
        };

        var originalElement = "test";
        var originalElementBackup = filterRenderingImage._originalElement;
        filterRenderingImage._originalElement = originalElement;

        filterRenderingImage.applyFilters();
        assert.ok(!brightnessFilterApplied && !colorFilterApplied, "no filter applied if filters both empty");
        assert.equal(filterRenderingImage._element, originalElement, "canvasElement reset to original when there are no filters");

        filterRenderingImage._originalElement = originalElementBackup;
        filterRenderingImage._filters = {
            brightness: 5,
            color: 5
        };

        filterRenderingImage.applyFilters();
        assert.ok(brightnessFilterApplied && colorFilterApplied, "filter applied if filters exist");

        reconfigureTestSettings();
    };

    var runScaledImagesTests = function () {
        // TODO test rendering with initialscaling in sprite (via imagestore)
        //var lookOpaque = new PocketCode.Model.Look({ name: "look3", id: "sid3", resourceId: "s3" });
        //var lookTransparent = new PocketCode.Model.Look({ name: "look4", id: "sid4", resourceId: "s4" });

        var spriteOpaque = new PocketCode.Model.Sprite(gameEngine, { id: "id2", name: "sprite2", looks: [{ name: "look3", id: "sid3", resourceId: "s3" }] });  //lookOpaque] });
        spriteOpaque.initLooks();
        spriteOpaque.init();
        var spriteTransparent = new PocketCode.Model.Sprite(gameEngine, { id: "id3", name: "sprite3", looks: [{ name: "look4", id: "sid4", resourceId: "s4" }] });  //lookTransparent] });
        spriteTransparent.initLooks();
        spriteTransparent.init();
        var renderingImageOpaque = new PocketCode.RenderingImage(spriteOpaque.renderingProperties);
        // var renderingImageTransparent = new PocketCode.RenderingImage(spriteTransparent.renderingProperties);

        var estimatedCenterX, estimatedCenterY, rotationAngle, canvasWidth, canvasHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        var opaqueImageWidth = renderingImageOpaque.object.width;
        var opaqueImageHeight = renderingImageOpaque.object.height;

        // ****************** TEST OPAQUE SPRITE SCALED RENDERING ******************************************************

        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0;

        var ctx = canvas.getContext("2d");
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (2.5x, origin)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 20;
        renderingImageOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (2.5x, (20,20))");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (rotationAngle = 0; rotationAngle <= 360; rotationAngle += 36) {
            renderingImageOpaque.rotation = rotationAngle;
            estimatedCenterX = renderingImageOpaque.x = Math.random() * canvasWidth;
            estimatedCenterY = renderingImageOpaque.y = Math.random() * canvasHeight;
            renderingImageOpaque.draw(ctx);
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, rotationAngle), "opaque sprite (2.5x, rotated " + rotationAngle + ")");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        // ****************** TEST OPAQUE SPRITE SCALED RENDERING ****************************************************

        // // TODO test rendering with initialscaling AND viewportscaling
        // canvas.setDimensions(80, 40, viewportScaling);
        // estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0; // 0 * viewportScaling
        // renderingImageOpaque.draw(ctx);
        // assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (2.5x, canvas 1.5x, origin)");
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        //
        // renderingImageOpaque.x = renderingImageOpaque.y = 20;
        // estimatedCenterX = renderingImageOpaque.x * viewportScaling;
        // estimatedCenterY = renderingImageOpaque.y * viewportScaling;
        // renderingImageOpaque.draw(ctx);
        // assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (2.5x, canvas 1.5x)");
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        //
        // for (rotationAngle = 0;rotationAngle <= 360; rotationAngle+=36) {
        //     renderingImageOpaque.rotation = rotationAngle;
        //     renderingImageOpaque.x = Math.random() * canvasWidth / viewportScaling;
        //     renderingImageOpaque.y = Math.random() * canvasHeight / viewportScaling;
        //
        //     estimatedCenterX = renderingImageOpaque.x * viewportScaling;
        //     estimatedCenterY = renderingImageOpaque.y * viewportScaling;
        //
        //     renderingImageOpaque.draw(ctx);
        //     assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling, rotationAngle), "opaque sprite (2.5x, canvas 1.5x, rotated " + rotationAngle + ")");
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        // }

        asyncTestsDone();
    };

    var reconfigureTestSettings = function () {
        is.onLoad.removeEventListener(new SmartJs.Event.EventListener(runTests));
        is.onLoad.addEventListener(new SmartJs.Event.EventListener(runScaledImagesTests));
        is.loadImages(baseUrl, imagesScaling);

        var ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 80;
        canvas.height = 40;
    };


    //init tests to start
    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper14.png", size: 1 },  //100% opaque red square
            { id: "s2", url: "imgHelper15.png", size: 1 }   //green square inside transparent area
        ];

    var imagesScaling = [
            { id: "s3", url: "imgHelper14.png", size: 1 },
            { id: "s4", url: "imgHelper15.png", size: 1 }];

    var gameEngine = new PocketCode.GameEngine();
    var canvas = document.createElement("canvas");

    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runTests));
    is.loadImages(baseUrl, images);

});



