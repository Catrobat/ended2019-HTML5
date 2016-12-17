'use strict';

window.onload = init;


var outputContainer;
//create canvas
var canvas = null;
var device = null;
var context = null;



//window onLoad
function init() {
    console.log("initializing");
        canvas = new PocketCode.Ui.Canvas();
    device = new PocketCode.Device(null);
    canvas.width = 500;
    canvas.height = 700;
        var body = document.getElementsByTagName('body')[0];
    body.appendChild(canvas._dom);
    device.cameraOn = true;
    setTimeout(renderCamera, 1000);

    //for the test page we hace to use the private _dom propery

    //create some rendering objects for click tests - onLoad

};

function renderCamera(){
    canvas._cameraCanvasCtx.drawImage( device._cameraStream, 0, 0, canvas.width, canvas.height);
    setTimeout(renderCamera, 10);
}

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
