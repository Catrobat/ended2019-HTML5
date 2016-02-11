/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("canvas.js");


QUnit.test("Canvas", function (assert) {

    var getAlphaAtPoint = function(context, x, y){
        return context.getImageData(x,y,1,1).data[3];
    };

    var checkRectangleAlpha = function(context, x, y, width, height){

        //inside the rectangle
        var upperLeft = getAlphaAtPoint(context, x, y) > 0;
        var upperRight = getAlphaAtPoint(context, x + width - 1, y) > 0;
        var bottomLeft = getAlphaAtPoint(context, x, y + height - 1) > 0;
        var bottomRight = getAlphaAtPoint(context, x + width - 1, y + height - 1) > 0;

        //console.log(upperLeft, upperRight, bottomLeft, bottomRight);

        //todo
        //outside the rectangle
        var outerTop  = (y-1) < 0 || getAlphaAtPoint(context, x, y-1) === 0;
        var outerLeft  = (x-1) < 0 || getAlphaAtPoint(context, x-1, y) === 0;
        var outerRight  = (x + width) > canvas.width || getAlphaAtPoint(context, x-1, y) === 0;
        var outerBottom  = (y + height) > canvas.height || getAlphaAtPoint(context, x-1, y) === 0;


        return upperLeft && upperRight && bottomLeft && bottomRight && outerTop && outerLeft && outerRight && outerBottom;
    };


    var onLoadHandler = function() {
        var looks = [{id:"s1", name:"look1"}];
        var sprite1 = new PocketCode.Model.Sprite(gameEngine, {id: "id0", name: "sprite0", looks:looks});
        var renderingImage = new PocketCode.RenderingImage(sprite1.renderingProperties);

        var width = renderingImage.object.width;
        var height = renderingImage.object.height;

        var x = renderingImage.x = width / 2.;
        var y = renderingImage.y = height / 2.;

        canvas.renderingImages = [renderingImage];
        canvas.render();

        var pxls = 0;
        width = canvas.width;
        height = canvas.height;
        var ctx = canvas.context;
        for (var i = 0; i < height;i++) {
            for (var j = 0; j < width; j++) {
                var px = ctx.getImageData(j, i, 1, 1).data;
                if (px[3] != 0)
                    pxls++;
             }
        }
        assert.equal(pxls, 80, "Correct amount of pixels are rendered on Canvas.");
        assert.ok(checkRectangleAlpha(ctx, 0, 0, 10, 8), "10 x 8 rectangle rendered correctly");

        renderingImage.rotation = 90;
        canvas.render();
        assert.ok(checkRectangleAlpha(ctx, 1, 0, 8, 9), "rendered correctly after rotation");

        renderingImage.rotation = 180;
        canvas.render();
        assert.ok(checkRectangleAlpha(ctx, 0, 0, 10, 8), "10 x 8 rectangle rendered correctly after two rotations");

        renderingImage.x = 25;
        renderingImage.y = 20;

        canvas.render();
        assert.ok(checkRectangleAlpha(ctx, 25-5, 20-4, 10, 8), "10 x 8 rectangle rendered correctly after moving");

        //var boundary = is.getLookBoundary(sprite1.id, "s1", 1, 0, false, false);
        //console.log(boundary);

        var base64data = canvas.toDataURL();
        console.log(base64data);

        asyncOnLoadTests();
    };
    var gameEngine = new PocketCode.GameEngine();
    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper6.png", size: 1 },
            //{ id: "s2", url: "imgHelper2.png", size: 8 },
        ];

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler));
    var canvas = new PocketCode.Ui.Canvas();
    canvas.setDimensions(300,150,1);
    var asyncOnLoadTests = assert.async();
    is.loadImages(baseUrl, images, 1);

});



