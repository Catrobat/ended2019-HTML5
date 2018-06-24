/// <reference path="../../qunit/qunit-2.4.0.js" />
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

    //test infrastructur
    var canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 100;
    var ctx = canvas.getContext("2d");

    //tests
    var ri = new PocketCode.RenderingItem({id: "s01"});
    assert.ok(ri instanceof PocketCode.RenderingItem, "instance check");

    assert.ok(ri._id == "s01" && ri.x == 0.0 && ri.y == 0.0 && ri.visible == true, "cntr default args check");
    ri = new PocketCode.RenderingItem({id: "s02", x: 10, y: 20, visible: false});
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
    assert.notOk(ri.draw(ctx), "draw() on empty cache");
    //define cache
    ri._cacheCanvas.width = ri._cacheCanvas.height = 1;
    ri.visible = false;
    assert.notOk(ri.draw(ctx), "draw(): invisible");
    ri.visible = true;
    assert.ok(ri.draw(ctx), "draw(): including cache");

    ri.dispose();
    assert.equal(ri._cacheCanvas, undefined, "dispose(): cache cleared");
    ri.visible = true;
    assert.notOk(ri.draw(ctx), "draw() on disposed RI: not successfull");
});


QUnit.test("RenderingText", function (assert) {

    var rt = new PocketCode.RenderingText({id: "s01"});
    assert.ok(rt instanceof PocketCode.RenderingText && rt instanceof PocketCode.RenderingItem, "instance check");

    // underlying vars are defined in uservariablehost
    var scopeId = "scopeId",
        id = 'id0',
        x = 20,
        y = 16,
        value = 'Hello, world!',
        visible = true;

    var props = {scopeId: scopeId, id: id, value: value, x: x, y: y, visible: visible};
    var renderingText = new PocketCode.RenderingText(props);

    assert.ok(renderingText instanceof PocketCode.RenderingText, 'correct instance');

    // test default config
    //value = 5.333;
    //renderingText.value = value;
    //assert.equal(renderingText._text, value.toString(), "Text set correctly");
    //assert.ok(typeof renderingText._text == "string", "numbers are converted: typecheck");

    //rendering
    var canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 100;
    var ctx = canvas.getContext("2d");

    var fillTextCalled = 0;
    renderingText._cacheCtx.fillText = function () {    //overide internal fillText to assert number of calls
        fillTextCalled++;
    };

    renderingText.value = "";
    renderingText.draw(ctx);
    assert.ok(!fillTextCalled, "No text drawn on canvas if text is empty");
    fillTextCalled = 0;

    var numberOfNewlines = 5;
    value = "Hello world";

    for (var i = 0, l = numberOfNewlines; i < l; i++) {
        value = value + "\n test";
    }

    renderingText.value = value;
    assert.equal(fillTextCalled, 6, "cache rerendered on value update");
    renderingText.value = value;
    assert.equal(fillTextCalled, 6, "cache NOT rerendered if value does not change");

    //fillTextCalled = 0;
    //renderingText.visible = true;
    //renderingText.draw(ctx);
    //assert.equal(fillTextCalled, numberOfNewlines + 1, "Create Text on Canvas with fillText for each line of text");

    //recreate RT (without fillText override)
    renderingText = new PocketCode.RenderingText(props);
    //rendering and font size
    canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 100;
    var ctx = canvas.getContext("2d");
    //for test only
    //document.body.appendChild(canvas);
    //canvas.style.position = "absolute";

    ctx.clearRect(0, 0, 200, 100);
    renderingText.value = 42;
    renderingText.x = 0;
    renderingText.y = 0;
    renderingText.draw(ctx);

    var img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    assert.equal(img.canvas.height, 33, "rendering Text original height (numbers): based on screenshot (2016-07-06)");

    ctx.clearRect(0, 0, 200, 100);
    renderingText.value = "ÖÄÜ";
    renderingText.draw(ctx);

    img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    var topLeft = {
        x: 100 + Math.round(Math.cos(img.tl.angle) * img.tl.length),
        y: 50 - Math.round(Math.sin(img.tl.angle) * img.tl.length),
    };

    assert.ok(topLeft.x < 2, "rendered to left (center)");
    assert.ok(topLeft.y <= 2, "rendered to top (center)");

    ctx.clearRect(0, 0, 200, 100);
    renderingText.x = 10;
    renderingText.y = -10;  //+=up on out coord system
    renderingText.draw(ctx);

    img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    topLeft = {
        x: 100 + Math.round(Math.cos(img.tl.angle) * img.tl.length),
        y: 50 - Math.round(Math.sin(img.tl.angle) * img.tl.length),
    };
    assert.ok(topLeft.x > 10 && topLeft.x < 12, "rendered to left (x offset)");
    assert.ok(topLeft.y > 10 && topLeft.y <= 12, "rendered to top (y offset)");

    ctx.clearRect(0, 0, 200, 100);
    canvas.with = 400;
    canvas.height = 400;
    renderingText.value = "This is my ...\n\nThis is my ...";
    renderingText.x = 10;
    renderingText.y = 10;
    renderingText.draw(ctx);

    //img = PocketCode.ImageHelper.adjustCenterAndTrim(canvas, true);
    //var top = Math.round(Math.sin(img.tl.angle) * img.tl.length),
    //    bottom = Math.round(Math.sin(img.bl.angle) * img.bl.length);
    //assert.ok(Math.abs(top - bottom) <= 32, "rendering Text line height: based on screenshot (2016-07-11)");

    assert.ok(false, "TODO");
});


QUnit.test("RenderingBubble", function (assert) {

    var rb = new PocketCode.RenderingBubble({id: "s01"});
    assert.ok(rb instanceof PocketCode.RenderingBubble && rb instanceof PocketCode.RenderingItem, "instance check");

    //Bubble positions
    rb.content = "Test";
    assert.ok(rb._cacheCanvas.height > 0, "Cache created");

    assert.equal(rb.visible, false, "Initial visibility hidden");
    rb.visible = true;
    //Test if we have an image attached to a bubble
    var canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 1200;
    var ctx = canvas.getContext("2d");

    var screenTl = {
            length: 35,
            angle: 75,
        },
        screenTr = {
            length: 30,
            angle: 40,
        },
        screenBottom = -50,
        posLeft = {
            length: 40,
            angle: 80
        }, // or undefined
        posRight = {
            length: 50,
            angle: 40
        }, // or undefined
        left = -40, //or undefined
        right = 60; //or undefined

    var canvasInsideScreen = function (rb) {
        //Check if topRight/Right for using the right vector

        if (rb.x < canvas.width && rb.y < canvas.height) {
            return true;
        } else {
            return false;
        }
    };
    // rb.orientation = PocketCode.BubbleOrientation.RIGHT;
//TODO: Check if it's inside canvas?
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.TOPRIGHT, "Center of the sprite offscreen and orientation TopRight");

    //TopLeft
    screenTl.angle = 0,
        screenTl.length = 0,
        screenTr.angle = 90,
        screenTr.length = canvas.width;
    rb.draw(ctx, screenTl, screenTr, canvas.height);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.RIGHT, "Center of the sprite is at the Top Left corner and orientation RIGHT");


    //Position Top - Middle
    screenTl.angle = 0,
        screenTl.length = canvas.width * 0.5,
        screenTr.angle = 90,
        screenTr.length = canvas.width * 0.5;
    rb.draw(ctx, screenTl, screenTr, canvas.height);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.RIGHT, "Center of the sprite is at the Middle Top corner and orientation RIGHT");
//Check if it's on screen

    //Position Top - Right
    screenTl.angle = 0,
        screenTl.length = canvas.width,
        screenTr.angle = 90,
        screenTr.length = 0;
    rb.draw(ctx, screenTl, screenTr, canvas.height);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.LEFT, "Center of the sprite is at the Right Top corner and orientation change to LEFT");
//Check if it's on screen

    //Position Middle - Right
    screenTl.angle = 45,
        screenTl.length = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height * 0.5, 2)),
        screenTr.angle = 180,
        screenTr.length = canvas.height * 0.5;
    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.5);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.LEFT, "Center of the sprite is at the Right Middle corner and orientation change to LEFT");
//Check if it's on screen

    //Position Middle - Middle
    screenTl.angle = 63.4321574,
        screenTl.length = Math.sqrt(Math.pow(canvas.width * 0.5, 2) + Math.pow(canvas.height * 0.5, 2)),
        screenTr.angle = 26.564615213,
        screenTr.length = Math.sqrt(Math.pow(canvas.width * 0.5, 2) + Math.pow(canvas.height * 0.5, 2));
    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.5);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.LEFT, "Center of the sprite is at the Middle- Middle part and orientation stay to LEFT");
//Check if it's on screen

    //Position Middle - Left
    screenTl.angle = 90,
        screenTl.length = canvas.height * 0.5,
        screenTr.angle = 45,
        screenTr.length = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height * 0.5, 2));
    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.5);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.TOPRIGHT, "Center of the sprite is at the middle left corner and orientation change to TOPRIGHT");
//Check if it's on screen


    //Position Left Bottom Screen
    screenTl.angle = 90,
        screenTl.length = canvas.height,
        screenTr.angle = 26.55,
        screenTr.length = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
    rb.draw(ctx, screenTl, screenTr, 0);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.TOPRIGHT, "Center of the sprite is at the bottom left corner and orientation change to TOPRIGHT");
//Check if it's on screen

    //Position Middle Bottom Screen
    screenTl.angle = 75.962744478,
        screenTl.length = Math.sqrt(Math.pow(canvas.width * 0.5, 2) + Math.pow(canvas.height, 2)),
        screenTr.angle = 14.036205474,
        screenTr.length = Math.sqrt(Math.pow(canvas.width * 0.5, 2) + Math.pow(canvas.height, 2));
    rb.draw(ctx, screenTl, screenTr, 0);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.TOPRIGHT, "Center of the sprite is at the bottom middle  and orientation stay to TOPRIGHT");
//Check if it's on screen

    //Position Right Bottom Screen
    screenTl.angle = 63.4349487,
        screenTl.length = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)),
        screenTr.angle = 180,
        screenTr.length = canvas.height;
    rb.draw(ctx, screenTl, screenTr, 0);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.TOPLEFT, "Center of the sprite is at the bottom right corner and orientation change to TOPLEFT");
//Check if it's on screen

    //////////////////////////////////////////////////////////////////////////

    //tests with sprite

    //Position TopRight
    //Screen Data
    screenTl.angle = 26.6,
        screenTl.length = 447.21,
        screenTr.angle = 45,
        screenTr.length = 282.84;

    //Sprite Data
    posLeft.angle = 135,
        posLeft.length = 150,
        posRight.angle = 45,
        posRight.length = 150,
        left = 150,
        right = 150;
    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.83336, posLeft, posRight, left, right);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.LEFT, "Circle sprite at the top right of the screen and orientation on the Left");


    //Position Top Left
    //Screen Data
    screenTl.angle = 45,
        screenTl.length = 282.84,
        screenTr.angle = 63.5,
        screenTr.length = 447.21;

    //Sprite Data
    posLeft.angle = 135,
        posLeft.length = 150,
        posRight.angle = 45,
        posRight.length = 150,
        left = 150,
        right = 150;
    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.83336, posLeft, posRight, left, right);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.RIGHT, "Circle sprite at the top left of the screen and orientation on the Right");

    //Position at the bottom Left
    //Screen Data
    screenTl.angle = 78.7,
        screenTl.length = 1019.8,
        screenTr.angle = 21.8,
        screenTr.length = 1077;

    //Sprite Data
    posLeft.angle = 135,
        posLeft.length = 150,
        posRight.angle = 45,
        posRight.length = 150,
        left = 150,
        right = 150;
    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.16666, posLeft, posRight, left, right);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.RIGHT, "Circle sprite at the bottom left of the screen and orientation on the Top Right");

    //Position at the bottom right
    //Screen Data
    screenTl.angle = 68.2,
        screenTl.length = 1077,
        screenTr.angle = 11.3,
        screenTr.length = 1019.8;

    //Sprite Data
    posLeft.angle = 135,
        posLeft.length = 150,
        posRight.angle = 45,
        posRight.length = 150,
        left = 150,
        right = 150;
    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.16666, posLeft, posRight, left, right);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.TOPLEFT, "Circle sprite at the bottom right of the screen and orientation on the Top Left");

    //Position at the center of the screen
    //Screen Data
    screenTl.angle = 63.4321574,
        screenTl.length = Math.sqrt(Math.pow(canvas.width * 0.5, 2) + Math.pow(canvas.height * 0.5, 2)),
        screenTr.angle = 26.564615213,
        screenTr.length = Math.sqrt(Math.pow(canvas.width * 0.5, 2) + Math.pow(canvas.height * 0.5, 2));
    //Sprite Data
    posLeft.angle = 135,
        posLeft.length = 150,
        posRight.angle = 45,
        posRight.length = 150,
        left = 150,
        right = 150;

    rb.draw(ctx, screenTl, screenTr, canvas.height * 0.5, posLeft, posRight, left, right);
    assert.equal(rb._orientation, PocketCode.BubbleOrientation.TOPRIGHT, "Circle sprite at the middle of the screen and orientation on the Top Right");

});


QUnit.test("RenderingSprite", function (assert) {

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

        return {x: xPrime, y: yPrime}
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
        var topLeftX = Math.round(centerX - width * 0.5);
        var topLeftY = Math.round(centerY - height * 0.5);

        rect = {tlX: topLeftX, tlY: topLeftY, width: width, height: height};

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
            {id: "s1", url: "imgHelper14.png", size: 1},  //100% opaque red square
            {id: "s2", url: "imgHelper15.png", size: 1}   //green square inside transparent area
        ];

    var imagesScaling = [
        {id: "s3", url: "imgHelper14.png", size: 1},
        {id: "s4", url: "imgHelper15.png", size: 1}];

    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var canvas = document.createElement("canvas");

    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runTests));
    is.loadImages(baseUrl, images);

    function runTests() {

        var canvasElement = document.createElement('canvas');
        canvasElement.height = 20;
        canvasElement.width = 10;

        var renderingSprite = new PocketCode.RenderingSprite({id: "id", look: canvasElement});

        assert.ok(renderingSprite instanceof PocketCode.RenderingSprite && renderingSprite instanceof PocketCode.RenderingItem, "instance check");
        //assert.equal(renderingSprite.look, canvasElement, "RenderingSprite.look returns canvas element");

        assert.throws(function () {
            new PocketCode.RenderingSprite();
        }, Error, "ERROR: missing arguments");
        assert.throws(function () {
            new PocketCode.RenderingSprite("string");
        }, Error, "ERROR: argument not an object");

        //getter, setter
        assert.throws(function () {
            renderingSprite.look = "look";
        }, Error, "ERROR: look setter: wrong type");
        renderingSprite.scaling = 2;
        assert.equal(renderingSprite._scaling, 2, "scaling: setter");
        renderingSprite.rotation = 3;
        assert.equal(renderingSprite._rotation, 3, "rotation: setter");
        renderingSprite.flipX = false;
        assert.equal(renderingSprite._flipX, false, "flipX: setter");
        renderingSprite.shadow = true;
        assert.equal(renderingSprite._shadow, true, "shadow: setter");
        //renderingSprite.penDown = false;
        assert.equal(renderingSprite.penDown, false, "penDown: default");

        //initial
        assert.equal(renderingSprite.penSize, undefined, "penSize: default");
        assert.equal(renderingSprite.penColor, undefined, "penColor: default");

        renderingSprite.penSize = 5;
        assert.equal(renderingSprite.penSize, 5, "penSize: getter/setter");
        renderingSprite.penColor = {r: 0, g: 0, b: 255.0,};
        assert.equal(renderingSprite.penColor.r, 0.0, "penColorRed: getter/setter");
        assert.equal(renderingSprite.penColor.g, 0.0, "penColorGreen: getter/setter");
        assert.equal(renderingSprite.penColor.b, 255.0, "penColorBlue: getter/setter");

        assert.throws(function () {
            renderingSprite.graphicEffects = "effect";
        }, Error, "ERROR: graphicEffects setter: wrong type");
        renderingSprite.graphicEffects = [];
        assert.deepEqual(renderingSprite._graphicEffects, [], "graphicEffects setter");

        //reinit
        renderingSprite = new PocketCode.RenderingSprite({id: "id", look: canvasElement});

        renderingSprite.x = 10;
        renderingSprite.y = 15;

        assert.ok(renderingSprite.containsPoint({x: 5, y: 5}), "Contains Point on left top corner");
        assert.ok(renderingSprite.containsPoint({x: 15, y: 5}), "Contains Point on right top corner");
        assert.ok(renderingSprite.containsPoint({x: 15, y: 25}), "Contains Point on right bottom corner");
        assert.ok(renderingSprite.containsPoint({x: 5, y: 25}), "Contains Point on left bottom corner");
        assert.ok(!renderingSprite.containsPoint({x: 4, y: 5}), "Does not contain Point outside left border");
        assert.ok(!renderingSprite.containsPoint({x: 5, y: 4}), "Does not contain Point outside top border");
        assert.ok(!renderingSprite.containsPoint({x: 5, y: 26}), "Does not contain Point outside bottom border");
        assert.ok(!renderingSprite.containsPoint({x: 16, y: 6}), "Does not contain Point outside top border");

        for (var rotationAngle = 0; rotationAngle <= 360; rotationAngle += 30) {
            renderingSprite.rotation = rotationAngle;
            var rad = (-rotationAngle + 90) * (Math.PI / 180.0);

            var xOffset = renderingSprite._height * 0.5 * Math.cos(rad);
            var yOffset = renderingSprite._height * 0.5 * Math.sin(rad);
            var centerTop = {x: renderingSprite.x + xOffset, y: renderingSprite.y - yOffset};
            var centerBottom = {x: renderingSprite.x - xOffset, y: renderingSprite.y + yOffset};

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = renderingSprite._width * 0.5 * Math.cos(rad);
            yOffset = renderingSprite._width * 0.5 * Math.sin(rad);
            var centerRight = {x: renderingSprite.x + xOffset, y: renderingSprite.y - yOffset};
            var centerLeft = {x: renderingSprite.x - xOffset, y: renderingSprite.y + yOffset};

            assert.ok(renderingSprite.containsPoint(centerTop) && renderingSprite.containsPoint(centerBottom)
                && renderingSprite.containsPoint(centerLeft) && renderingSprite.containsPoint(centerRight), "Contains Points on boundaries with rotation: " + rotationAngle);

            rad = (-rotationAngle + 90) * (Math.PI / 180.0);
            xOffset = ((renderingSprite._height * 0.5) + 1) * Math.cos(rad);
            yOffset = ((renderingSprite._height * 0.5) + 1) * Math.sin(rad);
            centerTop = {x: renderingSprite.x + xOffset, y: renderingSprite.y - yOffset};
            centerBottom = {x: renderingSprite.x - xOffset, y: renderingSprite.y + yOffset};

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = ((renderingSprite._width * 0.5) + 1) * Math.cos(rad);
            yOffset = ((renderingSprite._width * 0.5) + 1) * Math.sin(rad);
            centerRight = {x: renderingSprite.x + xOffset, y: renderingSprite.y - yOffset};
            centerLeft = {x: renderingSprite.x - xOffset, y: renderingSprite.y + yOffset};

            assert.ok(!renderingSprite.containsPoint(centerTop) && !renderingSprite.containsPoint(centerBottom)
                && !renderingSprite.containsPoint(centerLeft) && !renderingSprite.containsPoint(centerRight), "Does not contain Points outside boundaries with rotation: " + rotationAngle);
        }

        //draw tests
        //var look1 = new PocketCode.Model.Look({ name: "look1", id: "sid1", resourceId: "s1" });
        //var look2 = new PocketCode.Model.Look({ name: "look2", id: "sid2", resourceId: "s2" });
        var sprite1 = new PocketCode.Model.Sprite(gameEngine, scene, {
            id: "id0",
            name: "sprite0",
            looks: [{name: "look1", id: "sid1", resourceId: "s1"}]
        });   //look1] });
        sprite1.initLooks();
        sprite1.init();
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, scene, {
            id: "id1",
            name: "sprite1",
            looks: [{name: "look2", id: "sid2", resourceId: "s2"}]
        });   //look2] });
        sprite2.initLooks();
        sprite2.init();

        var renderingSpriteOpaque = sprite1.renderingSprite; //new PocketCode.RenderingSprite(sprite1.renderingProperties);
        var renderingSpriteTransparent = sprite2.renderingSprite; //new PocketCode.RenderingSprite(sprite2.renderingProperties);

        //draw tests
        canvas.height = 20;
        canvas.width = 10;
        var ctx = canvas.getContext("2d");

        renderingSpriteOpaque.draw(ctx);
        assert.ok(ctx.getImageData(0, 0, 1, 1).data[3], "visible image drawn");
        renderingSpriteOpaque.visible = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderingSpriteOpaque.draw(ctx);
        assert.ok(!ctx.getImageData(0, 0, 1, 1).data[3], "invisible image not drawn");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderingSpriteOpaque.visible = true;

        //  ************** TESTS WITH 100% opaque SPRITE ******************************************************************
        //  test simple rendering on origin
        var estimatedCenterX, estimatedCenterY, rotationAngle;
        var opaqueImageWidth = renderingSpriteOpaque._cacheCanvas.width;
        var opaqueImageHeight = renderingSpriteOpaque._cacheCanvas.height;
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        renderingSpriteOpaque.draw(ctx);
        estimatedCenterX = estimatedCenterY = renderingSpriteOpaque.x = renderingSpriteOpaque.y = 0;
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (topleft)");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test centered rendering
        estimatedCenterX = renderingSpriteOpaque.x = canvasWidth * 0.5;
        estimatedCenterY = renderingSpriteOpaque.y = canvasHeight * 0.5;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (center)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering corners
        estimatedCenterX = renderingSpriteOpaque.x = canvasWidth;
        estimatedCenterY = renderingSpriteOpaque.y = 0.;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (top right)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering bottom left
        estimatedCenterX = renderingSpriteOpaque.x = 0.;
        estimatedCenterY = renderingSpriteOpaque.y = canvasHeight;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (bottom left)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering bottom right
        estimatedCenterX = renderingSpriteOpaque.x = canvasWidth;
        estimatedCenterY = renderingSpriteOpaque.y = canvasHeight;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (bottom right)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //  test rendering somewhere
        estimatedCenterX = renderingSpriteOpaque.x = Math.random() * canvasWidth;
        estimatedCenterY = renderingSpriteOpaque.y = Math.random() * canvasHeight;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (random position)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering x ceil
        estimatedCenterX = 26;
        estimatedCenterY = 30;
        renderingSpriteOpaque.x = 25.55;
        renderingSpriteOpaque.y = 30;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, false, true), "opaque sprite (subpixel x ceil)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering y ceil
        estimatedCenterX = 25;
        estimatedCenterY = 31;
        renderingSpriteOpaque.x = 25;
        renderingSpriteOpaque.y = 30.55;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (subpixel y ceil)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering x floor
        estimatedCenterX = 25;
        estimatedCenterY = 30;
        renderingSpriteOpaque.x = 25.45;
        renderingSpriteOpaque.y = 30;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (subpixel x floor)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // test subpixel rendering y floor
        estimatedCenterX = 25;
        estimatedCenterY = 30;
        renderingSpriteOpaque.x = 25;
        renderingSpriteOpaque.y = 30.45;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (subpixel y floor)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (rotationAngle = 0; rotationAngle <= 360; rotationAngle += 30) {
            // test rotated rendering
            estimatedCenterX = renderingSpriteOpaque.x = 10;
            estimatedCenterY = renderingSpriteOpaque.y = 10;
            renderingSpriteOpaque.rotation = rotationAngle;
            renderingSpriteOpaque.draw(ctx);
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, rotationAngle), "opaque sprite (rotated " + rotationAngle + ")");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // ******************* TEST WITH PARTLY TRANSPARENT SPRITE *********************************************************
        // 5x5 area of 10x10 image

        // simple rendering in origin
        var transparentImageWidth = renderingSpriteTransparent._cacheCanvas.width;
        var transparentImageHeight = renderingSpriteTransparent._cacheCanvas.height;

        estimatedCenterX = estimatedCenterY = renderingSpriteTransparent.x = renderingSpriteTransparent.y = 5;
        renderingSpriteTransparent.draw(ctx);

        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight), "transparent sprite (origin)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // render in center
        estimatedCenterX = renderingSpriteTransparent.x = canvasWidth * 0.5;
        estimatedCenterY = renderingSpriteTransparent.y = canvasHeight * 0.5;

        renderingSpriteTransparent.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight), "transparent sprite (center)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // rendering rotated 45
        estimatedCenterX = estimatedCenterY = renderingSpriteTransparent.x = renderingSpriteTransparent.y = 5;
        rotationAngle = 45;
        renderingSpriteTransparent.rotation = rotationAngle;

        renderingSpriteTransparent.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight, rotationAngle), "transparent sprite (rotated 45)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // rendering rotated 60
        estimatedCenterX = estimatedCenterY = renderingSpriteTransparent.x = renderingSpriteTransparent.y = 5;
        rotationAngle = 60;
        renderingSpriteTransparent.rotation = rotationAngle;

        renderingSpriteTransparent.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight, rotationAngle), "transparent sprite (rotated 60)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ********************* TEST WITH CONTEXT SCALING ******************************************************************
        var viewportScaling = 1.5;

        renderingSpriteOpaque.rotation = 0;
        //renderingSpriteOpaque.scaling = 1.5;

        canvas.width = 80;
        canvas.height = 40;

        canvasHeight = canvas.height;
        canvasWidth = canvas.width;

        ctx = canvas.getContext("2d");
        ctx.scale(viewportScaling, viewportScaling);

        // rendering origin 1.5x
        estimatedCenterX = estimatedCenterY = renderingSpriteOpaque.x = renderingSpriteOpaque.y = 0; // 0 * 1.5

        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (canvas 1.5x, origin)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderingSpriteOpaque.x = canvasWidth * 0.5;
        renderingSpriteOpaque.y = canvasHeight * 0.5;
        estimatedCenterX = renderingSpriteOpaque.x * viewportScaling;
        estimatedCenterY = renderingSpriteOpaque.y * viewportScaling;

        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (canvas 1.5x)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (rotationAngle = 0; rotationAngle <= 360; rotationAngle += 36) {
            renderingSpriteOpaque.rotation = rotationAngle;

            renderingSpriteOpaque.draw(ctx);
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling, rotationAngle), "opaque sprite (canvas 1.5x, rotated " + rotationAngle + ")");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        var look = undefined;
        renderingSprite.look = look;
        assert.ok(renderingSprite._canvasElement instanceof HTMLCanvasElement, "Created new canvas element as look if none was passed");
        assert.ok(renderingSprite._originalElement instanceof HTMLCanvasElement, "Created new canvas original element as look if none was passed");

        //filters

        var backup = PocketCode.ImageHelper.setFilters;
        var setFiltersCalled = 0;
        PocketCode.ImageHelper.setFilters = function () {
            setFiltersCalled++;
        };
        assert.throws(function () {
            renderingSprite.graphicEffects = ''
        }, Error, "Set graphic effects to non-array type");
        assert.ok(!setFiltersCalled, "no filters set when non array argument is given");

        renderingSprite.graphicEffects = [];
        assert.ok(!setFiltersCalled, "setFilters not called when empty array given");

        renderingSprite.graphicEffects = ['item'];
        assert.equal(setFiltersCalled, 1, "setFilters not called when empty array given");

        PocketCode.ImageHelper.setFilters = backup;

        reconfigureTestSettings();
    };

    function runScaledImagesTests() {
        //var lookOpaque = new PocketCode.Model.Look({ name: "look3", id: "sid3", resourceId: "s3" });
        //var lookTransparent = new PocketCode.Model.Look({ name: "look4", id: "sid4", resourceId: "s4" });

        var spriteOpaque = new PocketCode.Model.Sprite(gameEngine, scene, {
            id: "id2",
            name: "sprite2",
            looks: [{name: "look3", id: "sid3", resourceId: "s3"}]
        });  //lookOpaque] });
        spriteOpaque.initLooks();
        spriteOpaque.init();
        var spriteTransparent = new PocketCode.Model.Sprite(gameEngine, scene, {
            id: "id3",
            name: "sprite3",
            looks: [{name: "look4", id: "sid4", resourceId: "s4"}]
        });  //lookTransparent] });
        spriteTransparent.initLooks();
        spriteTransparent.init();
        var renderingSpriteOpaque = spriteOpaque.renderingSprite; //new PocketCode.RenderingSprite(spriteOpaque.renderingProperties);
        //var renderingSpriteTransparent = spriteTransparent.renderingSprite; //new PocketCode.RenderingSprite(spriteTransparent.renderingProperties);

        var estimatedCenterX, estimatedCenterY, rotationAngle, canvasWidth, canvasHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        var opaqueImageWidth = renderingSpriteOpaque._cacheCanvas.width;
        var opaqueImageHeight = renderingSpriteOpaque._cacheCanvas.height;

        // ****************** TEST OPAQUE SPRITE SCALED RENDERING ******************************************************

        estimatedCenterX = estimatedCenterY = renderingSpriteOpaque.x = renderingSpriteOpaque.y = 0;

        var ctx = canvas.getContext("2d");
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (2.5x, origin)");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        estimatedCenterX = estimatedCenterY = renderingSpriteOpaque.x = renderingSpriteOpaque.y = 20;
        renderingSpriteOpaque.draw(ctx);
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), "opaque sprite (2.5x, (20,20))");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (rotationAngle = 0; rotationAngle <= 360; rotationAngle += 36) {
            renderingSpriteOpaque.rotation = rotationAngle;
            estimatedCenterX = renderingSpriteOpaque.x = Math.random() * canvasWidth;
            estimatedCenterY = renderingSpriteOpaque.y = Math.random() * canvasHeight;
            renderingSpriteOpaque.draw(ctx);
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, rotationAngle), "opaque sprite (2.5x, rotated " + rotationAngle + ")");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        // ****************** TEST OPAQUE SPRITE SCALED RENDERING ****************************************************

        // canvas.setDimensions(80, 40, viewportScaling);
        // estimatedCenterX = estimatedCenterY = renderingSpriteOpaque.x = renderingSpriteOpaque.y = 0; // 0 * viewportScaling
        // renderingSpriteOpaque.draw(ctx);
        // assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (2.5x, canvas 1.5x, origin)");
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        //
        // renderingSpriteOpaque.x = renderingSpriteOpaque.y = 20;
        // estimatedCenterX = renderingSpriteOpaque.x * viewportScaling;
        // estimatedCenterY = renderingSpriteOpaque.y * viewportScaling;
        // renderingSpriteOpaque.draw(ctx);
        // assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), "opaque sprite (2.5x, canvas 1.5x)");
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        //
        // for (rotationAngle = 0;rotationAngle <= 360; rotationAngle+=36) {
        //     renderingSpriteOpaque.rotation = rotationAngle;
        //     renderingSpriteOpaque.x = Math.random() * canvasWidth / viewportScaling;
        //     renderingSpriteOpaque.y = Math.random() * canvasHeight / viewportScaling;
        //
        //     estimatedCenterX = renderingSpriteOpaque.x * viewportScaling;
        //     estimatedCenterY = renderingSpriteOpaque.y * viewportScaling;
        //
        //     renderingSpriteOpaque.draw(ctx);
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
