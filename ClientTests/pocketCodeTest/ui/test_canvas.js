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

        canvas.renderingImages = [renderingImage];
        canvas.render();
        console.log(canvas.toDataURL('rgba(155, 155, 155, 1)'));
        assert.ok(true, "TODO");
    };
    var gameEngine = new PocketCode.GameEngine();
    var is = new PocketCode.ImageStore();
    gameEngine._imageStore = is;

    var baseUrl = "_resources/images/",
        images = [
            { id: "s1", url: "imgHelper6.png", size: 2 },
            // { id: "s2", url: "imgHelper2.png", size: 8 },
        ];

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler));
    var canvas = new PocketCode.Ui.Canvas();
    is.loadImages(baseUrl, images, 1);
});



