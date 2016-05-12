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

    var pixelHasAlpha = function(x,y) {
        return alphaAtPoint(x, y) > 0.;
    };

    var alphaAtPoint = function (x, y) {
        var ctx = canvas.contextContainer;   // access to check internal settings
        return ctx.getImageData(x, y, 1, 1).data[ALPHA_CHANNEL];
    };

    var polarOffset = function(distance, angle) {
        var x = distance * Math.cos(angle);
        var y = distance * Math.sin(angle);
        return {xOffset:x, yOffset:y};
    };

    var countPixels = function() {
        var canvasHeight = canvas.height;
        var canvasWidth = canvas.width;
        var pixels = 0;

        for (var i = 0; i < canvasHeight;i++) {
            for (var j = 0; j < canvasWidth; j++) {
                if (pixelHasAlpha(j,i)) {
                    pixels++;
                }
            }
        }
        return pixels;
    };

    var pixelNearEdge = function(x, y, rect, minorThreshold) {
        var eps = minorThreshold ? 1.0 : 2.0;

        var ld = Math.abs(rect.tlX - x) <= eps;
        var rd = Math.abs(rect.tlX + rect.width - x) <= eps;
        var td = Math.abs(rect.tlY - y) <= eps;
        var bd = Math.abs(rect.tlY + rect.height - y) <= eps;

        return ld || rd || td || bd;
    };

    var pixelWithinBoundaries = function(x, y, rect) {
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
    var checkPixels = function(centerX, centerY, width, height, rotation, log) {
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

        rect = {tlX: topLeftX, tlY: topLeftY, width: width, height: height};

        for (var currentY = 0; currentY < canvasHeight;currentY++) {
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
                            console.log(currentX, currentY, 'orig', rotatedPoint.x, rotatedPoint.y);
                            console.log('source px inside bounds but destination px not set');
                            return false;
                        }
                    }

                    else {
                        if (pixelIsSet) {
                            if (pixelNearEdge(originalX, originalY, rect))
                                continue;
                            console.log(currentX, currentY, 'orig', originalX, originalY);
                            console.log('source px outside bounds but destination px set to', alphaAtPoint(currentX, currentY));
                            return false;
                        }
                    }
                }

                else {
                    if (pixelWithinBoundaries(currentX, currentY, rect)) {
                        // pixel is within boundaries, is it set?
                        if (!pixelIsSet && !pixelNearEdge(currentX, currentY, rect, true)) {
                            console.log('pixel not set, but it should be', currentX, currentY);
                            return false;
                        }
                    }

                    else {
                        // pixel not inside boundaries, is it set?
                        if (pixelIsSet && !pixelNearEdge(currentX, currentY, rect, true)) {
                            console.log('pixel set, but it shouldnt be', currentX, currentY);
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };


    var runDefaultTests = function() {
        var looks1 = [{id:"s1", name:"look1"}];
        var looks2 = [{id:"s2", name:"look2"}];
        var sprite1 = new PocketCode.Model.Sprite(gameEngine, {id: "id0", name: "sprite0", looks:looks1});
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, {id: "id1", name: "sprite1", looks:looks2});

        var renderingImageOpaque = new PocketCode.RenderingImage(sprite1.renderingProperties);
        var renderingImageTransparent = new PocketCode.RenderingImage(sprite2.renderingProperties);

        var opaqueImageWidth = renderingImageOpaque.object.width;
        var opaqueImageHeight = renderingImageOpaque.object.height;

        var rotationAngle = 0;

        var transparentImageWidth = renderingImageTransparent.object.width;
        var transparentImageHeight = renderingImageTransparent.object.height;

        var canvasWidth = canvas.width, canvasHeight = canvas.height;

        canvas.renderingImages = [renderingImageOpaque];
        canvas.render();

        assert.equal(countPixels(), opaqueImageWidth*opaqueImageHeight / 4.0, "correct nr of pixels rendered on canvas");

        var estimatedCenterX, estimatedCenterY;

    //   ************** TESTS WITH 100% opaque SPRITE ******************************************************************
        //  test simple rendering on origin
        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0;
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (topleft)');
        canvas.clear();
        //  test centered rendering
        estimatedCenterX = renderingImageOpaque.x = canvasWidth / 2.;
        estimatedCenterY = renderingImageOpaque.y = canvasHeight / 2.;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (center)');
        canvas.clear();
        //  test rendering corners
        estimatedCenterX = renderingImageOpaque.x = canvasWidth;
        estimatedCenterY = renderingImageOpaque.y = 0.;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (top right)');
        canvas.clear();
        //  test rendering bottom left
        estimatedCenterX = renderingImageOpaque.x = 0.;
        estimatedCenterY = renderingImageOpaque.y = canvasHeight;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (bottom left)');
        canvas.clear();
        //  test rendering bottom right
        estimatedCenterX = renderingImageOpaque.x = canvasWidth;
        estimatedCenterY = renderingImageOpaque.y = canvasHeight;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (bottom right)');
        canvas.clear();
        //  test rendering somewhere
        estimatedCenterX = renderingImageOpaque.x = Math.random() * canvasWidth;
        estimatedCenterY = renderingImageOpaque.y = Math.random() * canvasHeight;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (random position)');
        canvas.clear();
        // test subpixel rendering x ceil
        estimatedCenterX = 26;
        estimatedCenterY = 30;
        renderingImageOpaque.x = 25.55;
        renderingImageOpaque.y = 30;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, false, true), 'opaque sprite (subpixel x ceil)');
        canvas.clear();
        // test subpixel rendering y ceil
        estimatedCenterX = 25;
        estimatedCenterY = 31;
        renderingImageOpaque.x = 25;
        renderingImageOpaque.y = 30.55;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (subpixel y ceil)');
        canvas.clear();
        // test subpixel rendering x floor
        estimatedCenterX = 25;
        estimatedCenterY = 30;
        renderingImageOpaque.x = 25.45;
        renderingImageOpaque.y = 30;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (subpixel x floor)');
        canvas.clear();
        // test subpixel rendering y floor
        estimatedCenterX = 25;
        estimatedCenterY = 30;
        renderingImageOpaque.x = 25;
        renderingImageOpaque.y = 30.45;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight), 'opaque sprite (subpixel y floor)');
        canvas.clear();

        for (rotationAngle = 0; rotationAngle <= 360; rotationAngle+=30) {
            // test rotated rendering
            estimatedCenterX = renderingImageOpaque.x = 10;
            estimatedCenterY = renderingImageOpaque.y = 10;
            renderingImageOpaque.rotation = rotationAngle;
            canvas.render();
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth, opaqueImageHeight, rotationAngle), 'opaque sprite (rotated '+rotationAngle+')');
            canvas.clear();
        }

    // ******************* TEST WITH PARTLY TRANSPARENT SPRITE *********************************************************
    // 5x5 area of 10x10 image
        canvas.renderingImages = [renderingImageTransparent];

        // TODO test rendering with partly transparent sprite
        // simple rendering in origin
        estimatedCenterX = estimatedCenterY = renderingImageTransparent.x = renderingImageTransparent.y = 5;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight), 'transparent sprite (origin)');
        canvas.clear();

        // render in center
        estimatedCenterX = renderingImageTransparent.x = canvasWidth / 2.;
        estimatedCenterY = renderingImageTransparent.y = canvasHeight / 2.;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight), 'transparent sprite (center)');
        canvas.clear();

        // rendering rotated 45
        estimatedCenterX = estimatedCenterY = renderingImageTransparent.x = renderingImageTransparent.y = 5;
        rotationAngle = 45;
        renderingImageTransparent.rotation = rotationAngle;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight, rotationAngle), 'transparent sprite (rotated 45)');
        canvas.clear();

        // rendering rotated 60
        estimatedCenterX = estimatedCenterY = renderingImageTransparent.x = renderingImageTransparent.y = 5;
        rotationAngle = 60;
        renderingImageTransparent.rotation = rotationAngle;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, transparentImageWidth, transparentImageHeight, rotationAngle), 'transparent sprite (rotated 60)');
        canvas.clear();

        var renderingTexts = 'renderingTexts';
        canvas.renderingTexts = renderingTexts;
        assert.equal(canvas._renderingTexts, renderingTexts, 'set renderingTexts');
        canvas.renderingTexts = [];


        // _isTargetTransparent


        // _checkTarget
        //mock objects
        var mockObj = {
            visible: true,
            evented: true,
            containsPoint: function () {
                return true;
            }
        };

        mockObj.setCoords = function () {
            return true;
        };

        var mockPointer = {
            x: 0,
            y: 0
        };

        canvas.isTargetTransparent = function () { return false; };

        assert.ok(canvas._checkTarget(mockObj, mockPointer), 'checkTarget returns true if object is visible, contains the pointer and is not transparent');

        mockObj.visible = false;
        assert.ok(!canvas._checkTarget(mockObj, mockPointer), 'checkTarget returns false if object is not visible');
        mockObj.visible = true;

        mockObj.containsPoint = function () { return false; };
        assert.ok(!canvas._checkTarget(mockObj, mockPointer), 'checkTarget returns false if object does not contain pointer');
        mockObj.containsPoint = function () { return true; };

        canvas.isTargetTransparent = function () { return true; };
        assert.ok(!canvas._checkTarget(mockObj, mockPointer), 'checkTarget returns false if object is transparent');

        // geteventpointer
        //
        // var getScrollLeftTop = function () {
        //     return {scroll: { left: 5, right:5 } }
        // };
        // canvas._getEventPointer();


        // getPointer


        // _searchPossibleTargets
        canvas.getPointer = function (mockPointer) {
            return mockPointer;
        };

        var scalingAppliedToPointer = false;

        var previousScaling = canvas.scaling;
        canvas.scaling = 2;
        mockPointer = { x: 10, y: 10};

        this.getPointer = function () {
            return mockPointer;
        };

        canvas._checkTarget = function (obj, pointer) {
            if(pointer.x === mockPointer.x/this.scaling && pointer.y === mockPointer.y/this.scaling)
                scalingAppliedToPointer = true;

                return !!obj.mockTarget;
        };

        var previousRenderingObjects = canvas._renderingObjects;
        canvas._renderingObjects = [ {object:{ id: 1 }}, {object:{id: 2}}, {object:{id:3}}, {object:{ mockTarget: true, id:4 }}];


        assert.strictEqual(canvas._searchPossibleTargets(mockPointer).id, 4, 'searchPossibleTargets returns correct target');
        assert.ok(scalingAppliedToPointer, 'scaling applied to pointer before checking');

        canvas._renderingObjects.push({object:{mockTarget:true, id: 5}});
        canvas._renderingObjects.push({object:{mockTarget:false, id: 6}});
        canvas._renderingObjects.push({object:{mockTarget:true, id: 7}});

        assert.strictEqual(canvas._searchPossibleTargets(mockPointer).id, 7, 'searchPossibleTargets returns last correct target in renderingObjects');

        canvas._renderingObjects = [];
        assert.ok(!canvas._searchPossibleTargets(mockPointer), 'no target found if there are no rendering objects');

        canvas._renderingObjects.push({object:{}});
        assert.ok(!canvas._searchPossibleTargets(mockPointer), 'no target found if there are no target rendering objects');

        canvas._renderingObjects = previousRenderingObjects;
        canvas.scaling = previousScaling;


        // _onMouseDown tests
        var onMouseDownTriggered = 0, searchTargetsTriggered = 0;
        canvas._searchPossibleTargets = function () {
            searchTargetsTriggered++;
            return {id: 'testTarget'}
        };
        canvas._onMouseDown.dispatchEvent = function () {
            onMouseDownTriggered++;
        };

        var isTouchDevice = SmartJs.Device.isTouch;
        SmartJs.Device.isTouch = false;

        var event = {};
        canvas.__onMouseDown(event);

        assert.strictEqual(onMouseDownTriggered, 0, 'onMouseDown was not triggered by event without left click');
        assert.strictEqual(searchTargetsTriggered, 0, 'does not search for a target if no left click registered');

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

        event.button = 1;
        canvas.__onMouseDown(event);

        //restore to previous setting
        SmartJs.Device.isTouch = isTouchDevice;

        // ********************* TEST WITH CANVAS SCALING ******************************************************************
        // TODO test rendering with canvas scaling (via setDimensions)
        renderingImageOpaque.rotation = 0;
        canvas.renderingImages = [renderingImageOpaque];
        canvas.setDimensions(80, 40, viewportScaling);
        canvasHeight = canvas.height;
        canvasWidth = canvas.width;

        assert.equal(canvas.lowerCanvasEl.height, 40, 'setDimensions sets height for lower canvas');
        assert.equal(canvas.lowerCanvasEl.width,  80, 'setDimensions sets width for lower canvas');
        assert.equal(canvas.upperCanvasEl.height, 40, 'setDimensions sets height for upper canvas');
        assert.equal(canvas.upperCanvasEl.width,  80, 'setDimensions sets width for upper canvas');
        assert.equal(canvas.cacheCanvasEl.height, Math.floor(40/viewportScaling), 'setDimensions sets height for cache canvas');
        assert.equal(canvas.cacheCanvasEl.width,  Math.floor(80/viewportScaling), 'setDimensions sets width for cache canvas');
        assert.equal(canvas.scaling, viewportScaling, 'setDimensions sets scaling');

        // rendering origin 1.5x
        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0; // 0 * 1.5
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), 'opaque sprite (canvas 1.5x, origin)');
        canvas.clear();

        renderingImageOpaque.x = canvasWidth / 2.;
        renderingImageOpaque.y = canvasHeight / 2.;
        estimatedCenterX = renderingImageOpaque.x * viewportScaling;
        estimatedCenterY = renderingImageOpaque.y * viewportScaling;

        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling), 'opaque sprite (canvas 1.5x)');
        canvas.clear();


        for (rotationAngle = 0; rotationAngle<=360;rotationAngle+=36) {
            renderingImageOpaque.rotation = rotationAngle;
            canvas.render();
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth * viewportScaling, opaqueImageHeight * viewportScaling, rotationAngle), 'opaque sprite (canvas 1.5x, rotated '+rotationAngle+')');
            canvas.clear();
        }

        reconfigureTestSettings();
        // done();
    };

    var runScaledImagesTests = function () {
        // TODO test rendering with initialscaling in sprite (via imagestore)
        var lookOpaque = [{id:"s3", name:"look3"}];
        var lookTransparent = [{id:"s4", name:"look4"}];
        var spriteOpaque = new PocketCode.Model.Sprite(gameEngine, {id: "id2", name: "sprite2", looks:lookOpaque});
        var spriteTransparent = new PocketCode.Model.Sprite(gameEngine, {id: "id3", name: "sprite3", looks:lookTransparent});
        var renderingImageOpaque = new PocketCode.RenderingImage(spriteOpaque.renderingProperties);
        // var renderingImageTransparent = new PocketCode.RenderingImage(spriteTransparent.renderingProperties);

        var estimatedCenterX, estimatedCenterY, rotationAngle, canvasWidth, canvasHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        var opaqueImageWidth = renderingImageOpaque.object.width;
        var opaqueImageHeight = renderingImageOpaque.object.height;
    //     ****************** TEST OPAQUE SPRITE SCALED RENDERING ******************************************************
        canvas.renderingImages = [renderingImageOpaque];

        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth / imageScalingFactor, opaqueImageHeight / imageScalingFactor), 'opaque sprite (2.5x, origin)');
        canvas.clear();

        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 20;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth / imageScalingFactor, opaqueImageHeight / imageScalingFactor), 'opaque sprite (2.5x, (20,20))');
        canvas.clear();

        for (rotationAngle = 0;rotationAngle <= 360; rotationAngle+=36) {
            renderingImageOpaque.rotation = rotationAngle;
            estimatedCenterX = renderingImageOpaque.x = Math.random() * canvasWidth;
            estimatedCenterY = renderingImageOpaque.y = Math.random() * canvasHeight;
            canvas.render();
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth / imageScalingFactor, opaqueImageHeight / imageScalingFactor, rotationAngle), 'opaque sprite (2.5x, rotated ' + rotationAngle + ')');
            canvas.clear();
        }
    //       ****************** TEST OPAQUE SPRITE SCALED RENDERING ****************************************************

        // TODO test rendering with initialscaling AND viewportscaling
        canvas.setDimensions(80, 40, viewportScaling);
        estimatedCenterX = estimatedCenterY = renderingImageOpaque.x = renderingImageOpaque.y = 0; // 0 * viewportScaling
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth / imageScalingFactor * viewportScaling, opaqueImageHeight / imageScalingFactor * viewportScaling), 'opaque sprite (2.5x, canvas 1.5x, origin)');
        canvas.clear();

        renderingImageOpaque.x = renderingImageOpaque.y = 20;
        estimatedCenterX = renderingImageOpaque.x * viewportScaling;
        estimatedCenterY = renderingImageOpaque.y * viewportScaling;
        canvas.render();
        assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth / imageScalingFactor * viewportScaling, opaqueImageHeight / imageScalingFactor * viewportScaling), 'opaque sprite (2.5x, canvas 1.5x)');
        canvas.clear();

        for (rotationAngle = 0;rotationAngle <= 360; rotationAngle+=36) {
            renderingImageOpaque.rotation = rotationAngle;
            renderingImageOpaque.x = Math.random() * canvasWidth / viewportScaling;
            renderingImageOpaque.y = Math.random() * canvasHeight / viewportScaling;

            estimatedCenterX = renderingImageOpaque.x * viewportScaling;
            estimatedCenterY = renderingImageOpaque.y * viewportScaling;

            canvas.render();
            assert.ok(checkPixels(estimatedCenterX, estimatedCenterY, opaqueImageWidth / imageScalingFactor * viewportScaling, opaqueImageHeight / imageScalingFactor * viewportScaling, rotationAngle), 'opaque sprite (2.5x, canvas 1.5x, rotated ' + rotationAngle + ')');
            canvas.clear();
        }
    // ********************************** TEST TRANSPARENT SPRITE INTEGRATED *******************************************

        done();
    };

    var reconfigureTestSettings = function () {
        is.onLoad.removeEventListener(new SmartJs.Event.EventListener(runDefaultTests));
        is.onLoad.addEventListener(new SmartJs.Event.EventListener(runScaledImagesTests));
        is.loadImages(baseUrl, imagesScaling, imageScalingFactor);
        canvas.clear();
        canvas.setDimensions(80, 40, 1);
    };

    var gameEngine = new PocketCode.GameEngine();
    //var app = new PocketCode.PlayerApplication();
    //app._project = gameEngine;
   // playerPageController.project = gameEngine;

    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper14.png", size: 1 }, // 100% opaque red square
            { id: "s2", url: "imgHelper15.png", size: 1 }  // green square inside transparent area
        ];

    var imagesScaling = [{id:'s3', url:'imgHelper14.png', size: 1},
                         {id:'s4', url:'imgHelper15.png', size: 1}];
    var imageScalingFactor = 2.5;
    var viewportScaling = 1.5; // dont set too high, or scaled position wont be on canvas anymore

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runDefaultTests));
    var canvas = new PocketCode.Ui.Canvas();
    canvas.setDimensions(80, 40, 1);
    is.loadImages(baseUrl, images, 1);
});

