/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/renderingImage.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/renderingText.js" />
/// <reference path="../../../Client/pocketCode/scripts/ui/canvas.js" />
'use strict';

QUnit.module("ui/canvas.js");


QUnit.test("Canvas", function (assert) {

    var done = assert.async();
    var ALPHA_CHANNEL_IDX = 3;

    var alphaAtPoint = function (x, y) {
        var ctx = canvas._lowerCanvasCtx;   // access to check internal settings
        return ctx.getImageData(x, y, 1, 1).data[ALPHA_CHANNEL_IDX];
    };

    var pixelHasAlpha = function (x, y) {
        return alphaAtPoint(x, y) > 0.;
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

    var gameEngine = new PocketCode.GameEngine();
    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper14.png", size: 1 }, // 100% opaque red square
            { id: "s2", url: "imgHelper15.png", size: 1 }  // green square inside transparent area
        ];

    var viewportScaling = 1.5; // dont set too high, or scaled position wont be on canvas anymore

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runTests));
    var canvas = new PocketCode.Ui.Canvas();
    assert.ok(canvas instanceof PocketCode.Ui.Canvas && canvas instanceof SmartJs.Ui.Control, "instance check");
    assert.ok(canvas.onMouseDown instanceof SmartJs.Event.Event && canvas.onMouseUp instanceof SmartJs.Event.Event, "event accessors");

    assert.equal(canvas.contextTop, canvas._upperCanvasCtx, "upper context accessor");

    canvas.setDimensions(80, 40, 1, 1);
    is.loadImages(baseUrl, images, 1);

    //start tests after imageStore has loaded all required images/looks
    function runTests() {
        var looks1 = [{ resourceId: "s1", id: "s1", name: "look1" }];
        var looks2 = [{ resourceId: "s2", id: "s2", name: "look2" }];
        var sprite1 = new PocketCode.Model.Sprite(gameEngine, { id: "id0", name: "sprite0", looks: looks1 });
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, { id: "id1", name: "sprite1", looks: looks2 });

        sprite1.initLooks();
        sprite2.initLooks();

        var renderingImageOpaque = sprite1.renderingImage;
        var renderingImageTransparent = sprite2.renderingImage;

        var opaqueImageWidth = renderingImageOpaque.look.width;
        var opaqueImageHeight = renderingImageOpaque.look.height;

        //for tests only
        document.body.appendChild(canvas._lowerCanvasEl);
        canvas._lowerCanvasEl.style.position = 'absolute';
        canvas._lowerCanvasEl.style.zIndex = 10000;

        //move to top left
        renderingImageOpaque.x -= canvas.width / 2.0;
        renderingImageOpaque.y += canvas.height / 2.0;

        canvas.renderingImages = [renderingImageOpaque];
        canvas.render();
        assert.notOk(canvas._isTargetTransparent(renderingImageOpaque, renderingImageOpaque.x, renderingImageOpaque.y), "target not transparent");

        assert.equal(countPixels(), opaqueImageWidth * opaqueImageHeight / 4.0, "correct nr of pixels rendered on canvas");
        //check position
        var visible = 0, transparent = 0;
        var list = [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }];
        for (var i = 0, l = list.length; i < l; i++) {
            if (pixelHasAlpha(list[i].x, list[i].y))
                visible++;
        }
        assert.equal(visible, 9, "visible boundary check: rendering position");

        list = [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }, { x: 0, y: 5 }];
        for (var i = 0, l = list.length; i < l; i++) {
            if (!pixelHasAlpha(list[i].x, list[i].y))
                transparent++;
        }
        assert.equal(transparent, 11, "transparent boundary check: rendering position");

        assert.throws(function () { canvas.renderingImages = renderingImageTransparent; }, Error, "ERROR: invalid argument: rendering image setter");
        canvas.renderingImages = [renderingImageTransparent];

        canvas.render();

        assert.ok(canvas._isTargetTransparent(renderingImageTransparent, 3, 3), "isTargetTransparent returns true for transparent pixels");
        assert.ok(!canvas._isTargetTransparent(renderingImageTransparent, 2, 2), "isTargetTransparent returns false for non transparent pixel");
        assert.ok(canvas._isTargetTransparent(renderingImageTransparent, 8, 3), "isTargetTransparent returns true for transparent pixels");
        canvas.clear();

        //TODO: testing the canvas rendering Text does not only mean to check the setter but to render a text and check the output
        var renderingText = new PocketCode.RenderingText({ id: "rt_id", text: "TEXT", visible: true, x: 0, y: 0 });
        assert.throws(function () { canvas.renderingTexts = renderingText; }, Error, "ERROR: invalid argument: rendering text setter");
        canvas.renderingTexts = [renderingText];
        assert.equal(canvas._renderingTexts[0], renderingText, "renderingTexts: setter");
        canvas.renderingTexts = [];

        //_getTargetAtPosition
        var scalingAppliedToPointer = false;

        var previousScaling = { x: canvas._scalingX, y: canvas._scalingY };
        var scaling = 2.0;
        canvas.scale(scaling, scaling);
        var mockPointer = { x: -30, y: 10 }; //{ x: 10, y: 10 };

        canvas.getPointer = function () {
            return mockPointer;
        };

        canvas._isTargetTransparent = function () { return false; };

        var createMockRenderingObject = function (id, isPotentialTarget) {
            var ro = new PocketCode.RenderingImage({ id: id, visible: true });
            //override containsPoint
            ro.containsPoint = function (pointer) {
                if (pointer.x === mockPointer.x / scaling && pointer.y === mockPointer.y / scaling)
                    scalingAppliedToPointer = true;
                return isPotentialTarget;
            };
            return ro;
            //return {
            //    id: id,
            //    visible: true,
            //    containsPoint: function (pointer) {
            //        if (pointer.x === mockPointer.x / scaling && pointer.y === mockPointer.y / scaling)
            //            scalingAppliedToPointer = true;
            //        return isPotentialTarget;
            //    }
            //}
        };

        var previousRenderingObjects = canvas._renderingImages;
        canvas._renderingImages = [];
        canvas._renderingImages.push(createMockRenderingObject(1, false));
        canvas._renderingImages.push(createMockRenderingObject(2, false));
        canvas._renderingImages.push(createMockRenderingObject(4, true));

        var target = canvas._getTargetAtPosition(mockPointer.x, mockPointer.y);
        assert.strictEqual(target.id, 4, '_getTargetAtPosition returns correct target');

        target.visible = false;
        target = canvas._getTargetAtPosition(mockPointer.x, mockPointer.y);
        assert.ok(!target, "target not found if invisible");

        canvas._renderingImages.push(createMockRenderingObject(5, false));
        canvas._renderingImages.push(createMockRenderingObject(6, false));
        canvas._renderingImages.push(createMockRenderingObject(7, true));

        assert.strictEqual(canvas._getTargetAtPosition(mockPointer.x, mockPointer.y).id, 7, '_getTargetAtPosition returns last correct target in renderingObjects');

        canvas._renderingImages = [];
        assert.ok(!canvas._getTargetAtPosition(mockPointer.x, mockPointer.y), 'no target found if there are no rendering objects');

        canvas._renderingImages.push(createMockRenderingObject(1, false));
        assert.ok(!canvas._getTargetAtPosition(mockPointer.x, mockPointer.y), 'no target found if there are no target rendering objects');

        canvas._renderingImages = previousRenderingObjects;
        canvas.scale(previousScaling.x, previousScaling.y);

        // _onMouseDown tests
        var onMouseDownTriggered = 0, getTargetCalled = 0;
        canvas._getTargetAtPosition = function () {
            getTargetCalled++;
            return { id: 'testTarget' };
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

        canvas.height = 45;
        assert.equal(canvas.height, 45, "height getter/setter");
        assert.throws(function () { canvas.height = "45px"; }, Error, "ERROR: height setter argument check");
        canvas.width = 25;
        assert.equal(canvas.width, 25, "width getter/setter");
        assert.throws(function () { canvas.width = "45px"; }, Error, "ERROR: width setter argument check");

        // ********************* TEST WITH CANVAS SCALING ******************************************************************
        canvas.setDimensions(80, 40, viewportScaling, viewportScaling);

        assert.equal(canvas._lowerCanvasEl.height, 40, 'setDimensions sets height for lower canvas');
        assert.equal(canvas._lowerCanvasEl.width, 80, 'setDimensions sets width for lower canvas');
        assert.equal(canvas._upperCanvasEl.height, 40, 'setDimensions sets height for upper canvas');
        assert.equal(canvas._upperCanvasEl.width, 80, 'setDimensions sets width for upper canvas');
        assert.equal(canvas._cacheCanvasEl.height, 40, 'setDimensions sets height for cache canvas');
        assert.equal(canvas._cacheCanvasEl.width, 80, 'setDimensions sets width for cache canvas');
        assert.equal(canvas._scalingX, viewportScaling, 'setDimensions sets scalingX');
        assert.equal(canvas._scalingY, viewportScaling, 'setDimensions sets scalingY');

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

        canvas.scale(viewportScaling, viewportScaling); //scale triggers a render()

        canvas.render();
        assert.equal(contextScaling, viewportScaling, "viewportScaling used to scale context if it exists");
        assert.equal(drawCalledRenderingImage, 2, "renderingImage draw called on rendering");
        assert.equal(drawCalledRenderingText, 2, "renderingText draw called on rendering");

        canvas.render();
        assert.equal(contextScaling, canvas._scalingX, "canvas scalingX used to scale context if no viewportScaling passed");

        canvas.renderingImages = [renderingImageOpaque];

        var scalingY = 50;
        var scalingX = 10;

        canvas.scale(scalingX, scalingY);
        assert.equal(canvas._scalingX, scalingX, "scalingX set correctly.");
        assert.equal(canvas._scalingY, scalingY, "scalingY set correctly.");

        canvas.dispose();
        assert.equal(canvas._disposed, true, "disposed");

        done();
    };

});
