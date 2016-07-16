/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/renderingItem.js" />
'use strict';

QUnit.module("components/renderingItem.js");


QUnit.test("RenderingItem", function (assert) {

    var ri = new PocketCode.RenderingItem({ id: "s01" });
    assert.ok(ri instanceof PocketCode.RenderingItem, "instance check");

    assert.throws(function () { ri = new PocketCode.RenderingItem(); }, Error, "ERROR: cntr call without parameter");
    assert.throws(function () { ri = new PocketCode.RenderingItem({ visible: true }); }, Error, "ERROR: cntr call without id");

    assert.ok(ri._id == "s01" && ri.x == 0.0 && ri.y == 0.0 && ri.visible == true, "cntr default args check");
    ri = new PocketCode.RenderingItem({ id: "s02", x: 10, y: 20, visible: false });
    assert.ok(ri._id == "s02" && ri.x == 10.0 && ri.y == 20.0 && ri.visible == false, "cntr args check");

    //getter setter
    assert.equal(ri.id, "s02", "id getter");
    ri.x = 5;
    assert.equal(ri.x, 5, "x getter/setter");
    ri.y = 7;
    assert.equal(ri.y, 7, "y getter/setter");
    ri.visible = true;
    assert.equal(ri.visible, true, "visible getter/setter");

    //draw
    assert.throws(function () { ri.draw(); }, Error, "ERROR: calling draw() on base class");
    ri.visible = false;

    var called = 0, context;
    ri._draw = function (ctx) {
        called++;
        context = ctx;
    };

    var testCtx = { context: "test" };  //we define an object to assert.equal the output
    ri.draw(testCtx);  //no error if not visible
    assert.equal(called, 0, "_draw not called on invisisble items");

    ri.visible = true;
    ri.draw(testCtx);
    assert.equal(testCtx, context, "context passed to private render method");
});


QUnit.test("RenderingText", function (assert) {

    var rt = new PocketCode.RenderingText({ id: "s01" });
    assert.ok(rt instanceof PocketCode.RenderingText && rt instanceof PocketCode.RenderingItem, "instance check");

    assert.throws(function () { new PocketCode.RenderingText(); }, Error, 'fail on missing constructor argument');
    // underlying vars are defined in uservariablehost
    var id = 'id0',
        x = 20,
        y = 16,
        text = 'Hello, world!',
        visible = true;

    var props = { id: id, text: text, x: x, y: y, visible: visible };
    var renderingText = new PocketCode.RenderingText(props);

    assert.ok(renderingText instanceof PocketCode.RenderingText, 'correct instance');

    // test default config
    text = 5.333;
    renderingText.text = text;
    assert.equal(renderingText._text, text.toString(), "Text set correctly");
    assert.ok(typeof renderingText._text == "string", "numbers are converted: typecheck");

    renderingText.text = 4;
    assert.equal(renderingText._text, "4.0", "include 1 decimal as default for integers");

    //rendering
    var canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 100;
    var ctx = canvas.getContext("2d");

    var fillTextCalled = 0;
    ctx.fillText = function () {    //overide fillText to assert number of calls
        fillTextCalled++;
    };

    renderingText.text = "";
    renderingText.draw(ctx);
    assert.ok(!fillTextCalled, "No text drawn on canvas if text is empty");
    fillTextCalled = 0;

    var numberOfNewlines = 5;
    text = "Hello world";

    for (var i = 0, l = numberOfNewlines; i < l; i++) {
        text = text + "\n test";
    }

    renderingText.text = text;
    renderingText.visible = true;
    renderingText.draw(ctx);
    assert.equal(fillTextCalled, numberOfNewlines + 1, "Create Text on Canvas with fillText for each line of text");

    //rendering and font size
    canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 100;
    var ctx = canvas.getContext("2d");
    //for test only
    //document.body.appendChild(canvas);
    //canvas.style.position = "absolute";

    ctx.clearRect(0, 0, 200, 100);
    renderingText.text = 42;
    renderingText.x = 0;
    renderingText.y = 0;
    renderingText.draw(ctx);

    var img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    assert.equal(img.canvas.height, 33, "rendering Text original height (numbers): based on screenshot (2016-07-06)");

    ctx.clearRect(0, 0, 200, 100);
    renderingText.text = "ÖÄÜ";
    renderingText.draw(ctx);

    img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    var topLeft = {
        x: 100 + Math.round(Math.cos(img.tl.angle) * img.tl.length),
        y: 50 - Math.round(Math.sin(img.tl.angle) * img.tl.length),
    };

    assert.ok(topLeft.x < 2, "rendered to left (center)");
    assert.ok(topLeft.y < 2, "rendered to top (center)");

    ctx.clearRect(0, 0, 200, 100);
    renderingText.x = 10;
    renderingText.y = 10;
    renderingText.draw(ctx);

    img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    topLeft = {
        x: 100 + Math.round(Math.cos(img.tl.angle) * img.tl.length),
        y: 50 - Math.round(Math.sin(img.tl.angle) * img.tl.length),
    };
    assert.ok(topLeft.x > 10 && topLeft.x < 12, "rendered to left (x offset)");
    assert.ok(topLeft.y > 10 && topLeft.y < 12, "rendered to top (y offset)");

    ctx.clearRect(0, 0, 200, 100);
    canvas.with = 400;
    canvas.height = 400;
    renderingText.text = "This is my ...\n\nThis is my ...";
    renderingText.x = 10;
    renderingText.y = 10;
    renderingText.draw(ctx);

    img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    var top = Math.round(Math.sin(img.tl.angle) * img.tl.length),
        bottom = Math.round(Math.sin(img.bl.angle) * img.bl.length);
    assert.ok(Math.abs(top + bottom -220) < 2, "rendering Text line height: based on screenshot (2016-07-11)");

});


QUnit.test("RenderingImage", function (assert) {

    var done = assert.async();

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
                    originalX = rotatedPoint.x;
                    originalY = rotatedPoint.y;

                    // was original pixel within rect?
                    if (pixelWithinBoundaries(originalX, originalY, rect)) {
                        if (!pixelIsSet && !pixelNearEdge(originalX, originalY, rect)) {
                            //console.log(currentX, currentY, "orig", rotatedPoint.x, rotatedPoint.y);
                            //console.log("source px inside bounds but destination px not set");
                            return false;
                        }
                    }

                    else {
                        if (pixelIsSet) {
                            if (pixelNearEdge(originalX, originalY, rect))
                                continue;
                            //console.log(currentX, currentY, "orig", originalX, originalY);
                            //console.log("source px outside bounds but destination px set to", alphaAtPoint(currentX, currentY));
                            return false;
                        }
                    }
                }

                else {
                    if (pixelWithinBoundaries(currentX, currentY, rect)) {
                        // pixel is within boundaries, is it set?
                        if (!pixelIsSet && !pixelNearEdge(currentX, currentY, rect, true)) {
                            //console.log("pixel not set, but it should be", currentX, currentY);
                            return false;
                        }
                    }

                    else {
                        // pixel not inside boundaries, is it set?
                        if (pixelIsSet && !pixelNearEdge(currentX, currentY, rect, true)) {
                            //console.log("pixel set, but it shouldnt be", currentX, currentY);
                            return false;
                        }
                    }
                }
            }
        }
        return true;
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

    function runTests() {

        var canvasElement = document.createElement('canvas');
        canvasElement.height = 20;
        canvasElement.width = 10;

        var renderingImage = new PocketCode.RenderingImage({ id: "id", look: canvasElement });

        assert.ok(renderingImage instanceof PocketCode.RenderingImage && renderingImage instanceof PocketCode.RenderingItem, "instance check");
        //assert.equal(renderingImage.look, canvasElement, "RenderingImage.look returns canvas element");

        assert.throws(function () { new PocketCode.RenderingImage(); }, Error, "ERROR: missing arguments");
        assert.throws(function () { new PocketCode.RenderingImage("string"); }, Error, "ERROR: argument not an object");

        //getter, setter
        assert.throws(function () { renderingImage.look = "look"; }, Error, "ERROR: look setter: wrong type");
        renderingImage.scaling = 2;
        assert.equal(renderingImage._scaling, 2, "scaling: setter");
        renderingImage.rotation = 3;
        assert.equal(renderingImage._rotation, 3, "rotation: setter");
        renderingImage.flipX = false;
        assert.equal(renderingImage._flipX, false, "flipX: setter");
        renderingImage.shadow = true;
        assert.equal(renderingImage._shadow, true, "shadow: setter");

        assert.throws(function () { renderingImage.graphicEffects = "effect"; }, Error, "ERROR: graphicEffects setter: wrong type");
        renderingImage.graphicEffects = [];
        assert.deepEqual(renderingImage._graphicEffects, [], "graphicEffects setter");

        //reinit
        renderingImage = new PocketCode.RenderingImage({ id: "id", look: canvasElement });

        renderingImage.x = 10;
        renderingImage.y = 15;

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

            var xOffset = renderingImage._height / 2 * Math.cos(rad);
            var yOffset = renderingImage._height / 2 * Math.sin(rad);
            var centerTop = { x: renderingImage.x + xOffset, y: renderingImage.y - yOffset };
            var centerBottom = { x: renderingImage.x - xOffset, y: renderingImage.y + yOffset };

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = renderingImage._width / 2 * Math.cos(rad);
            yOffset = renderingImage._width / 2 * Math.sin(rad);
            var centerRight = { x: renderingImage.x + xOffset, y: renderingImage.y - yOffset };
            var centerLeft = { x: renderingImage.x - xOffset, y: renderingImage.y + yOffset };

            assert.ok(renderingImage.containsPoint(centerTop) && renderingImage.containsPoint(centerBottom)
                && renderingImage.containsPoint(centerLeft) && renderingImage.containsPoint(centerRight), "Contains Points on boundaries with rotation: " + rotationAngle);

            rad = (-rotationAngle + 90) * (Math.PI / 180.0);
            xOffset = ((renderingImage._height / 2) + 1) * Math.cos(rad);
            yOffset = ((renderingImage._height / 2) + 1) * Math.sin(rad);
            centerTop = { x: renderingImage.x + xOffset, y: renderingImage.y - yOffset };
            centerBottom = { x: renderingImage.x - xOffset, y: renderingImage.y + yOffset };

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = ((renderingImage._width / 2) + 1) * Math.cos(rad);
            yOffset = ((renderingImage._width / 2) + 1) * Math.sin(rad);
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

        var renderingImageOpaque = sprite1.renderingImage; //new PocketCode.RenderingImage(sprite1.renderingProperties);
        var renderingImageTransparent = sprite2.renderingImage; //new PocketCode.RenderingImage(sprite2.renderingProperties);

        //draw tests
        canvas.height = 20;
        canvas.width = 10;
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
        var opaqueImageWidth = renderingImageOpaque._cacheCanvas.width;
        var opaqueImageHeight = renderingImageOpaque._cacheCanvas.height;
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
        var transparentImageWidth = renderingImageTransparent._cacheCanvas.width;
        var transparentImageHeight = renderingImageTransparent._cacheCanvas.height;

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

        var look = undefined;
        renderingImage.look = look;
        assert.ok(renderingImage._canvasElement instanceof HTMLCanvasElement, "Created new canvas element as look if none was passed");
        assert.ok(renderingImage._originalElement instanceof HTMLCanvasElement, "Created new canvas original element as look if none was passed");

        //filters

        var backup = PocketCode.ImageHelper.setFilters;
        var setFiltersCalled = 0;
        PocketCode.ImageHelper.setFilters = function () {
            setFiltersCalled++;
        };
        assert.throws(function () { renderingImage.graphicEffects = '' }, Error, "Set graphic effects to non-array type");
        assert.ok(!setFiltersCalled, "no filters set when non array argument is given");

        renderingImage.graphicEffects = [];
        assert.ok(!setFiltersCalled, "setFilters not called when empty array given");

        renderingImage.graphicEffects = ['item'];
        assert.equal(setFiltersCalled, 1, "setFilters not called when empty array given");

        PocketCode.ImageHelper.setFilters = backup;

        reconfigureTestSettings();
    };

    function runScaledImagesTests() {
        //var lookOpaque = new PocketCode.Model.Look({ name: "look3", id: "sid3", resourceId: "s3" });
        //var lookTransparent = new PocketCode.Model.Look({ name: "look4", id: "sid4", resourceId: "s4" });

        var spriteOpaque = new PocketCode.Model.Sprite(gameEngine, { id: "id2", name: "sprite2", looks: [{ name: "look3", id: "sid3", resourceId: "s3" }] });  //lookOpaque] });
        spriteOpaque.initLooks();
        spriteOpaque.init();
        var spriteTransparent = new PocketCode.Model.Sprite(gameEngine, { id: "id3", name: "sprite3", looks: [{ name: "look4", id: "sid4", resourceId: "s4" }] });  //lookTransparent] });
        spriteTransparent.initLooks();
        spriteTransparent.init();
        var renderingImageOpaque = spriteOpaque.renderingImage; //new PocketCode.RenderingImage(spriteOpaque.renderingProperties);
        //var renderingImageTransparent = spriteTransparent.renderingImage; //new PocketCode.RenderingImage(spriteTransparent.renderingProperties);

        var estimatedCenterX, estimatedCenterY, rotationAngle, canvasWidth, canvasHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        var opaqueImageWidth = renderingImageOpaque._cacheCanvas.width;
        var opaqueImageHeight = renderingImageOpaque._cacheCanvas.height;

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

        done();
    };

    function reconfigureTestSettings() {
        is.onLoad.removeEventListener(new SmartJs.Event.EventListener(runTests));
        is.onLoad.addEventListener(new SmartJs.Event.EventListener(runScaledImagesTests));
        is.loadImages(baseUrl, imagesScaling);

        var ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 80;
        canvas.height = 40;
    };

});


QUnit.test("RenderingBubble", function (assert) {

    var rb = new PocketCode.RenderingBubble({ id: "s01" });
    assert.ok(rb instanceof PocketCode.RenderingBubble && rb instanceof PocketCode.RenderingText, "instance check");

    assert.throws(function () { new PocketCode.RenderingBubble(); }, Error, 'fail on missing constructor argument');

    assert.ok(false, "TODO");

});