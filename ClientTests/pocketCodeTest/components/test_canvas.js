/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/canvas.js" />
'use strict';

//QUnit.module("canvas.js");
//
//
//QUnit.test("Canvas", function (assert) {
//	canvas = new PocketCode.Canvas("pcCanvas", 0.5);
//	
//	
//	//create 10 sprites
//	for(var i = 0; i < 10; i++){
//		
//		populateSprites(2, 'tree', 1, 200,180,0.2,0,0,currentLook2,true,1,1,0,false,false);
//	}
//	
//    assert.ok(true, "TODO:");
//
//});








// ----------------------------------------- OLD CODE --------------------------------------------------

var canvas;

document.addEventListener("DOMContentLoaded", function(event) { 
	initTest();
});

function initTest(){
	canvas = new PocketCode.Canvas("pcCanvas", 0.5);
	
//	var currentLook = new Image();
//	currentLook.src="_resources/img/minion.jpg";
////	populateSprites(1, 'minion', 0, 100,50,0.7,currentLook,true,1,1,0,true,false);
//	
//	var currentLook2 = new Image ();
//	currentLook.src="_resources/img/tree-transparent.png";
//	populateSprites(2, 'tree', 1, 200,180,0.2,currentLook2,true,1,1,0,false,false);
}



function changeSize(){
	canvas.updateLayer({id:1, layer:0, });
}

function populateSprites(id, name, layer, x,y,scale,h,w,imgElement,visible,bright,transp,angle,flipX,flipV,spriteLayer){
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
	
	canvas.addSprite(sprite);
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
	
	var src = document.getElementById("src").value;
	var positionX = document.getElementById("positionX").value;
	var positionY = document.getElementById("positionY").value;
	var size = document.getElementById("size").value;
	var visible = document.getElementById("visible").checked;
	var brightness = document.getElementById("brightness").value;
	var transparency = document.getElementById("transparency").value;
	var direction = document.getElementById("direction").value;
	var flipH = document.getElementById("flipH").checked;
	var flipV = document.getElementById("flipV").checked;

	var currentLook = new Image();
	currentLook.src=src;
	console.log(brightness)
	var looks = [];
	looks[0] = currentLook;
	populateSprites(1, 'minion', 0, positionX,positionY,size,0,0,looks,visible,brightness,transparency,direction,flipH,flipV);

	var currentLook2 = new Image ();
	currentLook2.src="_resources/img/tree-transparent.png"
	looks[0] = currentLook2;
	populateSprites(2, 'tree', 1, 200,180,20,0,0,looks,true,100,100,0,false,false);

	canvas.render();


	}