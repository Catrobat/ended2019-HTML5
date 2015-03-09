/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/canvas.js" />
'use strict';

//QUnit.module("canvas.js");
//
//
//QUnit.test("Canvas", function (assert) {
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
	
	var currentLook = new Image();
	currentLook.src="_resources/img/minion.jpg";
	populateSprites(1, 'minion', 0, 100,50,0.7,currentLook,true,1,1,0,true,false);
	
	var currentLook2 = new Image ();
	currentLook2.src="_resources/img/tree-transparent.png";
	populateSprites(2, 'tree', 1, 200,180,0.2,currentLook2,true,1,1,0,false,false);
}

function changeSize(){
	canvas.updateLayer({id:1, layer:0, });
}

function populateSprites(id, name, layer, x,y,scale,h,w,imgElement,visible,bright,transp,angle,flipX,flipV,spriteLayer){
	canvas.addSprite({
		id: id, //TODO
		name: name, //TODO
		layer: layer,
		positionX: x,
		positionY: y,
		size: scale,
		currentLook: imgElement,
		visible: visible,
		brightness: bright,
		transparency: transp,
		direction: angle,
		
		//TODO TDB in sprite.js
		flipH: flipX,
		flipV: flipV,
		
	});
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
	console.log(brightness);
	populateSprites(1, 'minion', 0, positionX,positionY,size,0,0,currentLook,visible,brightness,transparency,direction,flipH,flipV);


	var currentLook2 = new Image ();
	currentLook2.src="_resources/img/tree-transparent.png";
	populateSprites(2, 'tree', 1, 200,180,0.2,0,0,currentLook2,true,1,1,0,false,false);

	canvas.render();
}

	function renderSpritesDemo(){
	//createCanvas(800,600);
	render(sprites);
	}