/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("ui/canvas.js");


QUnit.test("Canvas", function (assert) {
    var ALPHA_CHANNEL = 3;
    var done = assert.async();

    var pixelHasAlpha = function (x, y) {
        return alphaAtPoint(x, y) > 0.;
    };

    var alphaAtPoint = function (x, y) {
        var ctx = canvas._contextContainer;   // access to check internal settings
        return ctx.getImageData(x, y, 1, 1).data[ALPHA_CHANNEL];
    };

    var countPixels = function () {
        var canvasHeight = canvas._lowerCanvasEl.height;
        var canvasWidth = canvas._lowerCanvasEl.width;
        var pixels = 0;

        for (var i = 0; i < canvasHeight; i++) {
            for (var j = 0; j < canvasWidth; j++) {
                if (pixelHasAlpha(j, i)) {
                    pixels++;
                }
            }
        }
        return pixels;
    };

    var runDefaultTests = function () {
        var looks1 = [{ resourceId: "s1", id: "s1", name: "look1" }];
        var looks2 = [{ resourceId: "s2", id: "s2", name: "look2" }];
        var sprite1 = new PocketCode.Model.Sprite(gameEngine, { id: "id0", name: "sprite0", looks: looks1 });
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, { id: "id1", name: "sprite1", looks: looks2 });

        sprite1.initLooks();
        sprite2.initLooks();

        var renderingImageOpaque = new PocketCode.RenderingImage(sprite1.renderingProperties);
        var renderingImageTransparent = new PocketCode.RenderingImage(sprite2.renderingProperties);

        var opaqueImageWidth = renderingImageOpaque.object.width;
        var opaqueImageHeight = renderingImageOpaque.object.height;


        canvas.renderingImages = [renderingImageOpaque];
        canvas.render();
        assert.ok(!canvas._isTargetTransparent(renderingImageOpaque, renderingImageOpaque.x, renderingImageOpaque.y), "target not transparent");

        assert.equal(countPixels(), opaqueImageWidth * opaqueImageHeight / 4.0, "correct nr of pixels rendered on canvas");

        canvas.renderingImages = [renderingImageTransparent];

        canvas.render();
        assert.ok(canvas._isTargetTransparent(renderingImageTransparent, 3, 3), "isTargetTransparent returns true for transparent pixels");
        assert.ok(!canvas._isTargetTransparent(renderingImageTransparent, 2, 2), "isTargetTransparent returns false for non transparent pixel");
        assert.ok(canvas._isTargetTransparent(renderingImageTransparent, 8, 3), "isTargetTransparent returns true for transparent pixels");
        canvas.clear();

        var renderingTexts = 'renderingTexts';
        canvas.renderingTexts = renderingTexts;
        assert.equal(canvas._renderingTexts, renderingTexts, "set renderingTexts");
        canvas.renderingTexts = [];

        //_getTargetAtPosition
        var scalingAppliedToPointer = false;

        var previousScaling = canvas.scaling;
        var scaling = 2;
        canvas.scaling = scaling;
        var mockPointer = { x: 10, y: 10 };

        canvas.getPointer = function () {
            return mockPointer;
        };

        canvas._isTargetTransparent = function () { return false; };

        var createMockRenderingObject = function (id, isPotentialTarget) {
            return {
                id: id,
                visible: true,
                containsPoint: function (pointer) {
                    if (pointer.x === mockPointer.x / scaling && pointer.y === mockPointer.y / scaling)
                        scalingAppliedToPointer = true;
                    return isPotentialTarget;
                }
            }
        };

        var previousRenderingObjects = canvas._renderingObjects;
        canvas._renderingObjects = [];
        canvas._renderingObjects.push(createMockRenderingObject(1, false));
        canvas._renderingObjects.push(createMockRenderingObject(2, false));
        canvas._renderingObjects.push(createMockRenderingObject(4, true));

        var target = canvas._getTargetAtPosition(mockPointer.x, mockPointer.y);
        assert.strictEqual(target.id, 4, '_getTargetAtPosition returns correct target');
        assert.ok(scalingAppliedToPointer, 'scaling applied to pointer before checking');

        target.visible = false;
        target = canvas._getTargetAtPosition(mockPointer.x, mockPointer.y);
        assert.ok(!target, "target not found if invisible");

        canvas._renderingObjects.push(createMockRenderingObject(5, false));
        canvas._renderingObjects.push(createMockRenderingObject(6, false));
        canvas._renderingObjects.push(createMockRenderingObject(7, true));

        assert.strictEqual(canvas._getTargetAtPosition(mockPointer.x, mockPointer.y).id, 7, '_getTargetAtPosition returns last correct target in renderingObjects');

        canvas._renderingObjects = [];
        assert.ok(!canvas._getTargetAtPosition(mockPointer.x, mockPointer.y), 'no target found if there are no rendering objects');

        canvas._renderingObjects.push(createMockRenderingObject(1, false));
        assert.ok(!canvas._getTargetAtPosition(mockPointer.x, mockPointer.y), 'no target found if there are no target rendering objects');

        canvas._renderingObjects = previousRenderingObjects;
        canvas.scaling = previousScaling;

        // _onMouseDown tests
        var onMouseDownTriggered = 0, getTargetCalled = 0;
        canvas._getTargetAtPosition = function () {
            getTargetCalled++;
            return { id: 'testTarget' }
        };
        canvas._onMouseDown.dispatchEvent = function () {
            onMouseDownTriggered++;
        };

        var isTouchDevice = SmartJs.Device.isTouch;
        SmartJs.Device.isTouch = false;

        var event = {};
        canvas.__onMouseDown(event);

        assert.strictEqual(onMouseDownTriggered, 0, 'onMouseDown was not triggered by event without left click');
        assert.strictEqual(getTargetCalled, 0, 'does not search for a target if no left click registered');

        event.button = 1;

        canvas.__onMouseDown(event);
        assert.strictEqual(onMouseDownTriggered, 1, 'onMouseDown triggered if button in event is 1');
        assert.strictEqual(onMouseDownTriggered, 1, 'searchTargets triggered if button in event is 1');

        event.button = 0;
        canvas.__onMouseDown(event);
        assert.strictEqual(onMouseDownTriggered, 1, 'onMouseDown not triggered if button in event is 0');
        assert.strictEqual(onMouseDownTriggered, 1, 'searchTargets not triggered if button in event is 0');

        event.which = 1;
        canvas.__onMouseDown(event);
        assert.strictEqual(onMouseDownTriggered, 2, 'onMouseDown triggered if "which" in event is 1');
        assert.strictEqual(onMouseDownTriggered, 2, 'onMouseDown triggered if "which" in event is 1');

        event.which = 0;
        event.button = 1;
        canvas.__onMouseDown(event);
        assert.strictEqual(onMouseDownTriggered, 2, 'onMouseDown not triggered if "which" in event is not 1 (no matter what button is set)');
        assert.strictEqual(onMouseDownTriggered, 2, 'onMouseDown not triggered if "which" in event is not 1 (no matter what button is set)');

        SmartJs.Device.isTouch = true;
        event = { touches: [{}] };
        canvas.__onMouseDown(event);

        assert.strictEqual(onMouseDownTriggered, 3, 'onMouseDown triggered if touch event');

        //restore to previous setting
        SmartJs.Device.isTouch = isTouchDevice;

        // ********************* TEST WITH CANVAS SCALING ******************************************************************
        canvas.setDimensions(80, 40, viewportScaling);

        assert.equal(canvas._lowerCanvasEl.height, 40, 'setDimensions sets height for lower canvas');
        assert.equal(canvas._lowerCanvasEl.width, 80, 'setDimensions sets width for lower canvas');
        assert.equal(canvas._upperCanvasEl.height, 40, 'setDimensions sets height for upper canvas');
        assert.equal(canvas._upperCanvasEl.width, 80, 'setDimensions sets width for upper canvas');
        assert.equal(canvas._cacheCanvasEl.height, Math.floor(40 / viewportScaling), 'setDimensions sets height for cache canvas');
        assert.equal(canvas._cacheCanvasEl.width, Math.floor(80 / viewportScaling), 'setDimensions sets width for cache canvas');
        assert.equal(canvas.scaling, viewportScaling, 'setDimensions sets scaling');

        var contextScaling = 0;
        var drawCalledRenderingImage = 0;
        var scaleX, scaleY;

        var context = canvas._lowerCanvasEl.getContext('2d');

        context.scale = function (x, y) {
            scaleX = x;
            scaleY = y;
        };

        var mockRenderingImage = {
            draw: function () {
                contextScaling = scaleX;
                drawCalledRenderingImage++;
            }
        };

        var drawCalledRenderingText = 0;
        var mockRenderingText = {
            draw: function () {
                drawCalledRenderingText++;
            }
        };

        canvas.renderingImages = [mockRenderingImage];
        canvas.renderingTexts = [mockRenderingText];

        viewportScaling = 1.5;
        canvas.scaling = 2;

        canvas.render(viewportScaling);
        assert.equal(contextScaling, viewportScaling, "viewportScaling used to scale context if it exists");
        assert.equal(drawCalledRenderingImage, 1, "renderingImage draw called on rendering");
        assert.equal(drawCalledRenderingImage, 1, "renderingText draw called on rendering");

        canvas.render();
        assert.equal(contextScaling, canvas.scaling, "canvas scaling used to scale context if no viewportScaling passed");

        canvas.renderingImages = [renderingImageOpaque];

        var scalingY = 50;
        canvas.scalingY = scalingY;
        assert.equal(canvas._scalingY, scalingY, "scalingY set correctly.");
        assert.equal(canvas.scalingY, canvas._scalingY, "get scalingY");

        var scalingX = 10;
        canvas.scalingX = scalingX;
        assert.equal(canvas._scalingX, scalingX, "scalingX set correctly.");
        assert.equal(canvas.scalingY, canvas._scalingY, "get scalingX");

        canvas._onMouseDown = "onMouseDown";
        assert.equal(canvas.onMouseDown, canvas._onMouseDown, "get onMouseDown");

        canvas._contextTop = "contextTop";
        assert.equal(canvas.contextTop, canvas._contextTop, "get contextTop");

        canvas.dispose();
        assert.equal(canvas._disposed, true, "disposed");


        done();
    };


    var gameEngine = new PocketCode.GameEngine();
    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper14.png", size: 1 }, // 100% opaque red square
            { id: "s2", url: "imgHelper15.png", size: 1 }  // green square inside transparent area
        ];

    var viewportScaling = 1.5; // dont set too high, or scaled position wont be on canvas anymore

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runDefaultTests));
    var canvas = new PocketCode.Ui.Canvas();
    canvas.setDimensions(80, 40, 1);
    is.loadImages(baseUrl, images, 1);
});
