/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
"use strict";

QUnit.module("components/renderingImage.js");


QUnit.test("RenderingImage", function (assert) {

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


            //
            // centerTop = {x: renderingImage.x + xOffset, y: renderingImage.y + yOffset};
            // centerBottom = {x: renderingImage.x - xOffset, y: renderingImage.y - yOffset};
            //
            //
            // var tl = {x: renderingImage.x - xOffset, y: renderingImage.y - yOffset};
            // var tr = {x: renderingImage.x + xOffset, y: renderingImage.y - yOffset};
            // var bl = {x: renderingImage.x - xOffset, y: renderingImage.y + yOffset};
            // var br = {x: renderingImage.x + xOffset, y: renderingImage.y + yOffset};
            // assert.ok(renderingImage.containsPoint(tl) && renderingImage.containsPoint(tr)
            //        && renderingImage.containsPoint(bl) && renderingImage.containsPoint(br), "Contains Points on corners with rotation: " + rotationAngle);
            //
            // xOffset = ((renderingImage.width / 2) + 1) * Math.cos(rad);
            //
            // tl = {x: renderingImage.x - xOffset, y: renderingImage.y - yOffset};
            // tr = {x: renderingImage.x + xOffset, y: renderingImage.y - yOffset};
            // bl = {x: renderingImage.x - xOffset, y: renderingImage.y + yOffset};
            // br = {x: renderingImage.x + xOffset, y: renderingImage.y + yOffset};
            // assert.ok(!renderingImage.containsPoint(tl) && !renderingImage.containsPoint(tr)
            //     && !renderingImage.containsPoint(bl) && !renderingImage.containsPoint(br), "Does not contain Points outside of corners with rotation: " + rotationAngle);
            //
            // xOffset = renderingImage.width / 2 * Math.cos(rad);
            // yOffset = ((renderingImage.height / 2) + 1) * Math.sin(rad);
            //
            // tl = {x: renderingImage.x - xOffset, y: renderingImage.y - yOffset};
            // tr = {x: renderingImage.x + xOffset, y: renderingImage.y - yOffset};
            // bl = {x: renderingImage.x - xOffset, y: renderingImage.y + yOffset};
            // br = {x: renderingImage.x + xOffset, y: renderingImage.y + yOffset};
            // assert.ok(!renderingImage.containsPoint(tl) && !renderingImage.containsPoint(tr)
            //     && !renderingImage.containsPoint(bl) && !renderingImage.containsPoint(br), "Does not contain Points outside of corners with rotation: " + rotationAngle);
        }

        //draw tests
        var looks1 = [{id:"s1", name:"look1"}];
        var looks2 = [{id:"s2", name:"look2"}];
        var sprite1 = new PocketCode.Model.Sprite(gameEngine, {id: "id0", name: "sprite0", looks:looks1});
        var sprite2 = new PocketCode.Model.Sprite(gameEngine, {id: "id1", name: "sprite1", looks:looks2});

        var renderingImageOpaque = new PocketCode.RenderingImage(sprite1.renderingProperties);
        var renderingImageTransparent = new PocketCode.RenderingImage(sprite2.renderingProperties);


        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        //console.log(canvasElement.width, canvasElement.height);



        //
        // var canvas = new PocketCode.Ui.Canvas();
        // canvas.setDimensions(80, 40, 1);

        //todo set canvas size

        renderingImageOpaque.draw(ctx);
        assert.ok(ctx.getImageData(0,0,1,1).data[3], "visible image drawn");
        renderingImageOpaque._visible = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderingImageOpaque.draw(ctx);
        console.log(ctx.getImageData(0,0,1,1).data[3]);
        assert.ok(!ctx.getImageData(0,0,1,1).data[3], "invisible image not drawn");


        console.log(canvas.toDataURL('image/png'));
        //var imageData = this.contextCache.getImageData(Math.floor(x), Math.floor(y), 1, 1);


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



