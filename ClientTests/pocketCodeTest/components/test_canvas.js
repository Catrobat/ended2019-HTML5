/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/canvas.js" />
'use strict';


//QUnit.module("canvas.js");
//
//QUnit.test("Canvas", function (assert) {
//
//    var done = assert.async();  //async tests: due to image loading delay
//
//    var sprite2test = null;
//    var dom = document.getElementById("qunit-fixture");
//
//    //var el = fabric.document.createElement("canvas");
//    var el = document.createElement("canvas");
//    dom.appendChild(el);
//
//    el.width = 600; el.height = 600;
//
//    var canvas = new PocketCode.Canvas(el, 0.5);
//
//    var imageOnLoad_runTests = function () {
//
//        //var currentLook = new Image ();
//        //currentLook.src="_resources/img/tree-transparent.png";
//        //var looks = [];
//        //looks[0] = currentLook;
//
//        //create 5 sprites
//        for (var i = 0; i < 5; i++) {
//            canvas.addSprite(populateSprites(i, 'tree', i, 10 * i, 10 * i, 20, looks, true, 100, 0, 0));
//        }
//        canvas.render();
//
//        assert.ok(canvas._canvas.getObjects().length == 5, "sprite count");
//
//        //insert element with id 5 (eleventh element) at layer 3 
//        canvas.addSprite(populateSprites(5, 'tree', 3, 15, 15, 20, looks, true, 100, 0, 0, false, false));
//        canvas.render();
//        assert.ok(canvas.getSpriteById(5)._layer == 3 && canvas.getSpriteById(3)._layer == 4 && canvas.getSpriteById(2)._layer == 2 && canvas._canvas.getObjects().length == 6, "insert sprite at layer in use (move other sprites one layer to front)");
//
//        // get sprite by id
//        sprite2test = canvas.getSpriteById(5);
//        assert.ok(sprite2test.id == 5, "get sprite by id");
//
//        // move sprite with id 5 to position 300, 400
//        canvas.renderSpriteChange({ id: 5, changes: [{ property: '_positionX', value: 300 }, { property: '_positionY', value: 400 }] });
//        sprite2test = canvas.getSpriteById(5);
//        assert.ok(sprite2test._positionX == 300 && sprite2test._positionY == 400, "move sprite to position");
//
//        // change layer of sprite
//        canvas.renderSpriteChange({ id: 5, changes: [{ property: '_layer', value: 0 }] });
//        sprite2test = canvas.getSpriteById(5);
//        assert.ok(sprite2test._layer == 0 && sprite2test.id == canvas._canvas.getObjects()[0].id && canvas.getSpriteById(0)._layer == 1 && canvas.getSpriteById(3)._layer == 4, "change layer of sprite");
//
//        // sync of internal sprite list and sprites on canvas
//        sprite2test = canvas.getSpriteById(5);
//        var sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
//        assert.ok(sprite2test._positionX == sprite2testOnCanvas.top, "sync of internal sprite list and actual sprites on canvas");
//
//        // change direction of sprite
//        canvas.renderSpriteChange({ id: 5, changes: [{ property: '_direction', value: 180 }] });
//        sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
//        sprite2test = canvas.getSpriteById(5);
//        assert.ok(sprite2test._direction == 180 && sprite2testOnCanvas.angle == 90, "change direction of sprite");
//
//        // change transparency of sprite
//        canvas.renderSpriteChange({ id: 5, changes: [{ property: '_transparency', value: 80 }] });
//        sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
//        sprite2test = canvas.getSpriteById(5);
//        assert.ok(sprite2test._transparency == 80 && sprite2testOnCanvas.opacity == 0.2, "change transparency of sprite");
//
//        // change visibility of sprite
//        canvas.renderSpriteChange({ id: 5, changes: [{ property: '_visible', value: false }] });
//        sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
//        sprite2test = canvas.getSpriteById(5);
//        assert.ok(sprite2test._visible == false && sprite2testOnCanvas.visible == false, "change visibility of sprite");
//        done(); //async tests completed
//    };
//
//    var currentLook = new Image();
//    var looks = [];
//    looks[0] = currentLook;
//    currentLook.addEventListener("load", imageOnLoad_runTests);  //added handler to run tests when image completed loading
//    currentLook.src = "_resources/img/tree-transparent.png";
//
//
//});







// ----------------------------------------- OLD CODE --------------------------------------------------

var canvas;

//document.addEventListener("DOMContentLoaded", function(event) { 
//	initTest();
//});

//function initTest(){
//	canvas = new PocketCode.Canvas("pcCanvas", 0.5);

////	var currentLook = new Image();
////	currentLook.src="_resources/img/minion.jpg";
//////	populateSprites(1, 'minion', 0, 100,50,0.7,currentLook,true,1,1,0,true,false);
////	
////	var currentLook2 = new Image ();
////	currentLook.src="_resources/img/tree-transparent.png";
////	populateSprites(2, 'tree', 1, 200,180,0.2,currentLook2,true,1,1,0,false,false);
//}



//function changeSize(){
//	canvas.updateLayer({id:1, layer:0, });
//}

function populateSprites(id, name, layer, x, y, scale, imgElement, visible, bright, transp, angle) {
    var sprite = new PocketCode.Model.Sprite(new PocketCode.Model.Program());

    sprite.id = id;
    sprite.name = name;
    sprite.layer = layer;
    sprite.setPositionX(x);
    sprite.setPositionY(y);
    sprite.setSize(scale);
    sprite.looks = imgElement;
    sprite.setTransparency(transp);
    sprite.setBrightness(bright);
    sprite.setDirection(angle);
    if (visible)
        sprite.show();
    else
        sprite.hide();

    return sprite;

    //	
    //		canvas.addSprite({
    //		id: id, //TODO
    //		name: name, //TODO
    //	_layer: layer,
    //	_positionX: x,
    //	_positionY: y,
    //	_size: scale,
    //	_currentLook: imgElement[0],
    //	_visible: visible,
    //	_brightness: bright,
    //	_transparency: transp,
    //	_direction: angle,
    //		
    //	});
}

function updateSprite(){
	var sprite2test = null;
	canvas = new PocketCode.Canvas("pcCanvas", 0.5);
	var currentLook = new Image ();
	currentLook.src="_resources/img/tree-transparent.png";
	var looks = [];
	looks[0] = currentLook;
	//create 5 sprites
	for(var i = 0; i < 5; i++){
		canvas.addSprite(populateSprites(i, 'tree', i, 50*i,50*i,20,looks,true,i*60,0,0));
	}
	var currentLook2 = new Image ();
	currentLook2.src="_resources/img/minion.jpg";
	var looks2 = [];
	looks2[0] = currentLook2;
	canvas.addSprite(populateSprites(5, 'tree', 5, 200,400,100,looks2,true,255,0,0));
	canvas.render();
	//insert element with id 6 (eleventh element) at layer 3 
	canvas.addSprite(populateSprites(6, 'tree', 3, 15,15,20,looks,true,-255,0,0));
	canvas.render();
	// get sprite by id
	sprite2test = canvas.getSpriteById(5);
	// move sprite with id 5 to position 300, 400
	canvas.renderSpriteChange({id: 5, changes: [{property: '_positionX', value: 300}, {property: '_positionY', value: 400}]});
	sprite2test = canvas.getSpriteById(5);
	// change layer of sprite
	canvas.renderSpriteChange({id: 5, changes:[{property: '_layer', value: 0}]});
	sprite2test = canvas.getSpriteById(5);
	// sync of internal sprite list and sprites on canvas
	sprite2test = canvas.getSpriteById(5);
	var sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
	// change direction of sprite
	canvas.renderSpriteChange({id: 5, changes:[{property: '_direction', value: 180}]});
	sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
	sprite2test = canvas.getSpriteById(5);
	// change transparency of sprite
	canvas.renderSpriteChange({id: 5, changes:[{property: '_transparency', value: 80}]});
	sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
	sprite2test = canvas.getSpriteById(5);
	// change visibility of sprite
	canvas.renderSpriteChange({id: 5, changes:[{property: '_visible', value: false}]});
	sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
	sprite2test = canvas.getSpriteById(5);
	
	canvas.showAxes = true;
	
//	canvas.showAxes = false;
}



//function updateSprite(){
//	
//	var src = document.getElementById("src").value;
//	var positionX = document.getElementById("positionX").value;
//	var positionY = document.getElementById("positionY").value;
//	var size = document.getElementById("size").value;
//	var visible = document.getElementById("visible").checked;
//	var brightness = document.getElementById("brightness").value;
//	var transparency = document.getElementById("transparency").value;
//	var direction = document.getElementById("direction").value;
//	var flipH = document.getElementById("flipH").checked;
//	var flipV = document.getElementById("flipV").checked;
//
//	var currentLook = new Image();
//	currentLook.src=src;
//	console.log(brightness)
//	var looks = [];
//	looks[0] = currentLook;
//	populateSprites(1, 'minion', 0, positionX,positionY,size,looks,visible,brightness,transparency,direction);
//
//	var currentLook2 = new Image ();
//	currentLook2.src="_resources/img/tree-transparent.png";
//	looks[0] = currentLook2;
//	populateSprites(2, 'tree', 1, 200,180,20,looks,true,100,100,0);
//
//	canvas.render();
//
//
//	}