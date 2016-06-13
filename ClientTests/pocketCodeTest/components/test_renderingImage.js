/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("components/renderingImage.js");


QUnit.test("RenderingImage", function (assert) {
    // var gameEngine = new PocketCode.GameEngine();
    //
    // // taken from test_sprite.js, overwrite game engine look getter
    // assert.ok(typeof gameEngine.getLookImage === "function", "sprite-program interface: get look from store");
    // var initialScaling = 0.5;
    // gameEngine.getLookImage = function () {
    //     return { canvas: document.createElement('canvas'), center: { length: 0, angle: 0 }, initialScaling: initialScaling };
    // };
    //
    // var id = 'id0';
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
    // assert.throws(function() {new PocketCode.RenderingImage()}, Error, 'missing constructor argument');
    //
    // var renderingImage = new PocketCode.RenderingImage(sprite.renderingProperties);
    //
    // assert.ok(renderingImage instanceof  PocketCode.RenderingImage, 'Instance check');
    //
    // var image = renderingImage.object;
    // assert.ok(image.perPixelTargetFind == true, 'perpixeltargetfind setup correctly');
    // assert.ok(image.selectable == false, 'selection setup correctly');
    // assert.ok(image.hasControls == false, 'controls setup correctly');
    // assert.ok(image.hasBorders == false, 'borders setup correctly');
    // assert.ok(image.hasRotatingPoint == false, 'rotation point setup correctly');
    // assert.ok(image.originX == 'center', 'origin x setup correctly');
    // assert.ok(image.originY == 'center', 'origin y setup correctly');
    // assert.ok(image.centeredScaling == true, 'centeredscaling setup correctly');
    //
    // assert.ok(renderingImage.id == id, 'id set correctly');
    // assert.ok(renderingImage.x == x, 'x set correctly');
    // assert.ok(renderingImage.y == y, 'y set correctly');
    // assert.ok(image.scaleX == 1. / initialScaling, 'x scaling set correctly');
    // assert.ok(image.scaleY == 1. / initialScaling, 'y scaling set correctly');
    //
    // assert.ok(image.angle == rotationAngle - 90., 'rotation angle set correctly');
    // assert.ok(image.flipX == false, 'flipX set correctly');
    // assert.ok(image.visible == true, 'visibility set correctly');
    //
    // // needs restructuring if more filters become available
    // assert.ok(image.filters.length == 1, 'filter is set');
    // assert.ok(image.filters[0].brightness == Math.round((brightness - 100) * 2.55), 'filter value correct');
    // renderingImage.graphicEffects = [{effect:PocketCode.GraphicEffect.BRIGHTNESS, value:0}];
    // assert.ok(image.filters.length == 0, 'setting brightness to 100% removes filter');
    //
    // assert.ok(image.opacity == opacity / 100., 'opacity set correctly');
    // var setGraphicEffects = function () {renderingImage.graphicEffects = 1;};
    // assert.throws(function() {setGraphicEffects()}, Error, 'set effects to non-array type');

    var asyncTestsDone = assert.async();

    var runTests = function () {

        var canvasElement = {width: 10, height: 20};
        var renderingImage = new PocketCode.RenderingImage({look: canvasElement});

        assert.ok(renderingImage instanceof PocketCode.RenderingImage, "instance check");
        assert.equal(renderingImage.object, canvasElement, "RenderingImage.object returns canvas element");

        assert.throws(function () {new PocketCode.RenderingImage(); }, Error, "missing arguments");
        assert.throws(function () {new PocketCode.RenderingImage("string"); }, Error, "argument not an object");

        renderingImage._x = 10;
        renderingImage._y = 15;

        assert.ok(renderingImage.containsPoint({x:5, y:5}), "Contains Point on left top corner");
        assert.ok(renderingImage.containsPoint({x:15, y:5}), "Contains Point on right top corner");
        assert.ok(renderingImage.containsPoint({x:15, y:25}), "Contains Point on right bottom corner");
        assert.ok(renderingImage.containsPoint({x:5, y:25}), "Contains Point on left bottom corner");
        assert.ok(!renderingImage.containsPoint({x:4, y:5}), "Does not contain Point outside left border");
        assert.ok(!renderingImage.containsPoint({x:5, y:4}), "Does not contain Point outside top border");
        assert.ok(!renderingImage.containsPoint({x:5, y:26}), "Does not contain Point outside bottom border");
        assert.ok(!renderingImage.containsPoint({x:16, y:6}), "Does not contain Point outside top border");

        for (var rotationAngle = 0; rotationAngle <= 360; rotationAngle+=30) {
            renderingImage.rotation = rotationAngle;
            var rad = (-rotationAngle + 90) * (Math.PI / 180.0);

            var xOffset = renderingImage.height / 2 * Math.cos(rad);
            var yOffset = renderingImage.height / 2 * Math.sin(rad);
            var centerTop = {x: renderingImage.x + xOffset, y: renderingImage.y - yOffset};
            var centerBottom = {x: renderingImage.x - xOffset, y: renderingImage.y + yOffset};

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = renderingImage.width / 2 * Math.cos(rad);
            yOffset = renderingImage.width / 2 * Math.sin(rad);
            var centerRight = {x: renderingImage.x + xOffset, y: renderingImage.y - yOffset};
            var centerLeft = {x: renderingImage.x - xOffset, y: renderingImage.y + yOffset};

            assert.ok(renderingImage.containsPoint(centerTop) && renderingImage.containsPoint(centerBottom)
                && renderingImage.containsPoint(centerLeft) && renderingImage.containsPoint(centerRight), "Contains Points on boundaries with rotation: " + rotationAngle);

            rad = (-rotationAngle + 90) * (Math.PI / 180.0);
            xOffset = ((renderingImage.height / 2) + 1) * Math.cos(rad);
            yOffset = ((renderingImage.height / 2) + 1) * Math.sin(rad);
            centerTop = {x: renderingImage.x + xOffset, y: renderingImage.y - yOffset};
            centerBottom = {x: renderingImage.x - xOffset, y: renderingImage.y + yOffset};

            rad = (-rotationAngle + 180) * (Math.PI / 180.0);
            xOffset = ((renderingImage.width / 2) + 1) * Math.cos(rad);
            yOffset = ((renderingImage.width / 2) + 1) * Math.sin(rad);
            centerRight = {x: renderingImage.x + xOffset, y: renderingImage.y - yOffset};
            centerLeft = {x: renderingImage.x - xOffset, y: renderingImage.y + yOffset};

            assert.ok(!renderingImage.containsPoint(centerTop) && !renderingImage.containsPoint(centerBottom)
                && !renderingImage.containsPoint(centerLeft) && !renderingImage.containsPoint(centerRight), "Does not contain Points outside boundaries with rotation: " + rotationAngle);

        }

        //draw tests
        var looks1 = [{id:"s1", name:"look1"}];
        var looks2 = [{id:"s2", name:"look2"}];
        var sprite1 = new PocketCode.Model.Sprite(gameEngine, {id: "id0", name: "sprite0", looks:looks1});
        //var sprite2 = new PocketCode.Model.Sprite(gameEngine, {id: "id1", name: "sprite1", looks:looks2});

        var renderingImageOpaque = new PocketCode.RenderingImage(sprite1.renderingProperties);
        //var renderingImageTransparent = new PocketCode.RenderingImage(sprite2.renderingProperties);


        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        renderingImageOpaque.draw(ctx);
        assert.ok(ctx.getImageData(0,0,1,1).data[3], "visible image drawn");
        renderingImageOpaque._visible = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderingImageOpaque.draw(ctx);
        assert.ok(!ctx.getImageData(0,0,1,1).data[3], "invisible image not drawn");


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
        for(var i = 0, l = modifiedData.length; i < l; i++){
            if(originalData[i] !== modifiedData[i])
                dataAsExpected = false;
        }

        assert.ok(dataAsExpected, "applyBrightnessFilter: no change made to brightness if brightness is 0");

        var brightnessChange = 10;
        renderingImage._filters.brightness = brightnessChange;

        dataAsExpected = true;
        modifiedData = originalData.slice(0);
        renderingImage.applyBrightnessFilter(modifiedData);

        for(i = 0, l = modifiedData.length; i < l; i++){
            if(!(i % 4) && (modifiedData[i] !== originalData[i] + Math.round(brightnessChange * 2.55))){
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
            colorFilterApplied= true;
        };

        var originalElement = 'test';
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

        asyncTestsDone();
    };

    var gameEngine = new PocketCode.GameEngine();
    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper14.png", size: 1 }, // 100% opaque red square
            { id: "s2", url: "imgHelper15.png", size: 1 }  // green square inside transparent area
        ];

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(runTests));
    is.loadImages(baseUrl, images, 1);

});



