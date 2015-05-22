/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/canvas.js" />
'use strict';


QUnit.module("canvas.js");

QUnit.test("Canvas", function (assert) {

	var done = assert.async();  //async tests: due to image loading delay

	var sprite2test = null;
	var dom = document.getElementById("qunit-fixture");

	var el = document.createElement("canvas");
	dom.appendChild(el);

	el.width = 600; el.height = 600;

	var canvas = new PocketCode.Canvas(el, 0.5);

	var imageOnLoad_runTests = function () {

		assert.ok(canvas.zoomfactor == 0.5, "get zoomfactor");
		assert.ok(canvas.canvas instanceof fabric.Canvas, "get canvas")

		//create 5 sprites
		for (var i = 0; i < 5; i++) {
			canvas.addSprite(populateSprites(i, 'tree', i, 50 * i, 50 * i, 20, looks, true, i * 60, 0, 90));
		}
		//render canvas
		canvas.render();

		assert.ok(canvas._canvas.getObjects().length == 5, "sprite count");

		//insert new element with id 5 (sixth element) at layer 2 
		canvas.addSprite(populateSprites(5, 'tree', 2, 200, 400, 100, looks, true, 100, 0, 90));
		canvas.render();
		var sprites = canvas._canvas.getObjects();
		assert.ok(sprites.indexOf(canvas._getSpriteOnCanvas(5)) == 2 && sprites.indexOf(canvas._getSpriteOnCanvas(3)) == 4 && sprites.indexOf(canvas._getSpriteOnCanvas(2)) == 3 && sprites.indexOf(canvas._getSpriteOnCanvas(1)) == 1 && canvas._canvas.getObjects().length == 6, "insert sprite at layer in use (move other sprites one layer to front)");

		// move sprite with id 5 to position 300, 400
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_positionX', value: 300 }, { property: '_positionY', value: 400 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.top == 300 && sprite2test.left == 400, "move sprite to specified position");

		// change layer of sprite
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_layer', value: 0 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprites.indexOf(sprite2test) == 0 && sprites.indexOf(canvas._getSpriteOnCanvas(0)) == 1 && sprites.indexOf(canvas._getSpriteOnCanvas(3)) == 4, "change layer of sprite");

		// change direction of sprite
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_direction', value: 180 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.angle == 90, "change direction of sprite by 180 (should be actual direction of 90 on canvas)");

		// change transparency of sprite
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_transparency', value: 80 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.opacity == 0.2, "change transparency of sprite by 80 % (should be 20% opacity on canvas)");

		// change visibility of sprite
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_visible', value: false }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.visible == false, "change visibility of sprite");

		// change brightness of sprite to max brightness
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_brightness', value: 200 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.filters[0].brightness == 255, "change brightness to max (200) (should be 255 on canvas)");

		// change brightness of sprite to min brightness
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_brightness', value: 0 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.filters[0].brightness == -255, "change brightness to min (0) (should be -255 on canvas)");

		// change brightness of sprite to normal brightness (default value)
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_brightness', value: 100 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.filters[0].brightness == 0, "change brightness to default value (100) (should be 0 on canvas)");

		// change brightness of sprite to 50% brightness
		canvas.renderSpriteChange({ id: 5, changes: [{ property: '_brightness', value: 50 }] });
		sprite2test = canvas._getSpriteOnCanvas(5);
		assert.ok(sprite2test.filters[0].brightness == -127, "change brightness to 50% (should be 127 on canvas)");

		//TODO test Axes + click 

		done(); //async tests completed
	};

	var currentLook = new Image();
	var looks = [];
	looks[0] = currentLook;
	currentLook.addEventListener("load", imageOnLoad_runTests);  //added handler to run tests when image completed loading
	currentLook.src = "_resources/img/tree-transparent.png";


});


function populateSprites(id, name, layer, x, y, scale, imgElement, visible, bright, transp, angle) {
    var sprite = new PocketCode.Model.Sprite(new PocketCode.GameEngine(), { id: "newId", name: "myName" });

	sprite.id = id;
	sprite.name = name;
	sprite.layer = layer;
	sprite.setPositionX(x);
	sprite.setPositionY(y);
	sprite.setSize(scale);
	sprite.looks = imgElement;
	sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, transp);
	sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, bright);
	sprite.setDirection(angle);
	if (visible)
		sprite.show();
	else
		sprite.hide();

	return sprite;

}

// ----------------------------------------- OLD CODE --------------------------------------------------



function updateSprite() {
	var sprite2test = null;
	canvas = new PocketCode.Canvas("pcCanvas", 0.5);
	var currentLook = new Image();
	currentLook.src = "_resources/img/tree-transparent.png";
	var looks = [];
	looks[0] = currentLook;

	//create 5 sprites
	for (var i = 0; i < 5; i++) {
		canvas.addSprite(populateSprites(i, 'tree', i, 50 * i, 50 * i, 20, looks, true, i * 60, 0, 90));
	}
	var currentLook2 = new Image();
	currentLook2.src = "_resources/img/minion.jpg";
	var looks2 = [];
	looks2[0] = currentLook2;
	canvas.addSprite(populateSprites(5, 'tree', 5, 200, 400, 100, looks2, true, 100, 0, 90));
	canvas.render();

	//insert element with id 6 (eleventh element) at layer 3 
	canvas.addSprite(populateSprites(6, 'tree', 3, 15, 15, 20, looks, true, 0, 0, 90));
	canvas.render();

	// move sprite with id 5 to position 300, 400
	canvas.renderSpriteChange({ id: 5, changes: [{ property: '_positionX', value: 300 }, { property: '_positionY', value: 400 }] });

	//	 change layer of sprite
	canvas.renderSpriteChange({ id: 5, changes: [{ property: '_layer', value: 0 }] });


	// change direction of sprite
	canvas.renderSpriteChange({ id: 5, changes: [{ property: '_direction', value: 180 }] });

	// change transparency of sprite
	canvas.renderSpriteChange({ id: 5, changes: [{ property: '_transparency', value: 80 }] });

	//	// change visibility of sprite
	//	canvas.renderSpriteChange({id: 5, changes:[{property: '_visible', value: false}]});
	//	sprite2testOnCanvas = canvas.getSpriteOnCanvas(5);
	//	sprite2test = canvas.getSpriteById(5);

	canvas.showAxes = true;

	//	canvas.showAxes = false;
}


