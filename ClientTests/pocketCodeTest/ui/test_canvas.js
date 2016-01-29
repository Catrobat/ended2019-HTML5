/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("canvas.js");


QUnit.test("Canvas", function (assert) {

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

        var base64data = canvas.toDataURL();
        console.log(base64data);

        assert.ok(true, "TODO");
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
    is.loadImages(baseUrl, images, 1);
});



