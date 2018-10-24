'use strict';

window.onload = init;

var gameEngine = new PocketCode.GameEngine();
var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
var is = new PocketCode.ImageStore();
gameEngine._imageStore = is;
var outputContainer;
//create canvas
var canvas = new PocketCode.Ui.Canvas();
canvas.onRenderingSpriteTouched.addEventListener(new SmartJs.Event.EventListener(onTouched));
canvas.onTouchStart.addEventListener(new SmartJs.Event.EventListener(onTouchStart));
canvas.onTouchMove.addEventListener(new SmartJs.Event.EventListener(onTouchMove));
canvas.onTouchEnd.addEventListener(new SmartJs.Event.EventListener(onTouchEnd));

function onTouched(e) {
    outputContainer.innerHTML = 'touch: targetId:' + e.targetId + ' x:' + e.x + ' y:' + e.y + '<br />' + outputContainer.innerHTML;
};
function onTouchStart(e) {
    outputContainer.innerHTML = 'touchStart: id:' + e.id + ' x:' + e.x + ' y:' + e.y + '<br />' + outputContainer.innerHTML;
};
function onTouchMove(e) {
    outputContainer.innerHTML = 'touchMove: id:' + e.id + ' x:' + e.x + ' y:' + e.y + '<br />' + outputContainer.innerHTML;
};
function onTouchEnd(e) {
    outputContainer.innerHTML = 'touchEnd: id:' + e.id + ' x:' + e.x + ' y:' + e.y + '<br />' + outputContainer.innerHTML;
};


canvas.width = 500;
canvas.height = 700;

//window onLoad
function init() {

    outputContainer = document.getElementById('outputContainer');
    var lc = document.getElementById('layoutContainer');
    lc.appendChild(canvas._dom);    //for the test page we hace to use the private _dom propery

    //create some rendering objects for click tests - onLoad
    var baseUrl = "../../_resources/images/",
        images = [
            { id: "s1", url: "imgHelper14.png", size: 1 }, // 100% opaque red square
            { id: "s2", url: "imgHelper15.png", size: 1 }  // green square inside transparent area
        ];

    is.onLoad.addEventListener(new SmartJs.Event.EventListener(imagesLoadHandler));
    is.loadImages(baseUrl, images, 1);

};

//create renderingSprites
function imagesLoadHandler() {
    var looks1 = [{ resourceId: "s1", id: "s1", name: "look1" }];
    var looks2 = [{ resourceId: "s2", id: "s2", name: "look2" }];
    var sprite1 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "id0", name: "sprite0", looks: looks1 });   //(0/0)
    var sprite2 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "id1", name: "sprite1", looks: looks2 });
    sprite2.setPosition(40, 30);
    var sprite3 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "id2", name: "sprite2", looks: looks1 });
    sprite3.setPosition(10, -40);
    var sprite4 = new PocketCode.Model.Sprite(gameEngine, scene, { id: "id3", name: "sprite3", looks: looks2 });
    sprite4.setPosition(-40, 20);

    sprite1.initLooks();
    sprite2.initLooks();
    sprite3.initLooks();
    sprite4.initLooks();

    canvas.renderingSprites = [sprite1.renderingSprite, sprite2.renderingSprite, sprite3.renderingSprite, sprite4.renderingSprite];
    canvas.render();
    canvas.scale(1.5, 3);
};

function updateScaling() {
    canvas.scale(document.getElementById('scaleX').value, document.getElementById('scaleY').value);
};
