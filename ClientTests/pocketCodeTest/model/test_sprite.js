/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("sprite.js");



QUnit.test("Sprite", function (assert) {

    var prog= new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(prog,null);
    assert.ok(sprite instanceof PocketCode.Model.Sprite, "instance check");

    // ********************* GraphicEffects *********************
    assert.throws(function () {sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,"asdf")},Error, "invalid brightness percentage");
    assert.throws(function () {sprite.setGraphicEffect(null,50)},Error, "unknown graphic effect");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,210);
    assert.equal(sprite._brightness,200,"set brightness over 200");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,-210);
    assert.equal(sprite._brightness,0,"set brightness under 0");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST,110);
    assert.equal(sprite._transparency,100.0,"set transparency over 100");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST,-110);
    assert.equal(sprite._transparency,0.0,"set transparency under 0");


    assert.throws(function () {sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,"asdf")},Error, "invalid brightness percentage");
    assert.throws(function () {sprite.changeGraphicEffect(null,50)},Error, "unknown graphic effect");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,100);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,110);
    assert.equal(sprite._brightness,200,"change brightness over 200");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,100);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,-110);
    assert.equal(sprite._brightness,0,"change brightness under 0");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST,50);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST,60);
    assert.equal(sprite._transparency,100.0,"change transparency over 100");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST,50);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST,-60);
    assert.equal(sprite._transparency,0.0,"change transparency under 0");


    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST,50);
    assert.equal(sprite._transparency,50.0,"set transparency");
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST,10);
    assert.equal(sprite._transparency,60.0,"change transparency");


    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,50);
    assert.equal(sprite._brightness,50.0,"set brightness");
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS,60);
    assert.equal(sprite._brightness,110,"change brightness");

    sprite.clearGraphicEffects();
    assert.ok(sprite._brightness==100 && sprite._transparency==0, "graphic effects cleared");

    // *************************************************************

    // ********************* show/hide *********************
    sprite.show();
    assert.ok(sprite._visible,"show sprite");
    sprite.hide();
    assert.ok(!sprite._visible,"show sprite");
    sprite.hide();
    sprite.show();
    assert.ok(sprite._visible,"show sprite");
    // *************************************************************

    // ********************* Size *********************
    assert.throws(function () {sprite.setSize("asdf")},Error,"invalid percentage");

    sprite.setSize(-20);
    assert.equal(sprite._size,0,"set size below 0");
    sprite.setSize(50);
    assert.equal(sprite._size,50,"set size");
    sprite.changeSize(-60);
    assert.equal(sprite._size,0,"change size below 0");
    sprite.changeSize(20);
    assert.equal(sprite._size,20,"change size upwards");
    sprite.changeSize(15);
    sprite.changeSize(20);
    assert.equal(sprite._size,55,"double change size");
    // *************************************************************

    // ********************* Position *********************
    sprite.setPosition(10,10);
    assert.ok(sprite._positionX==10 && sprite._positionY==10, "set Position");
    sprite.setPositionY(90);
    assert.ok(sprite._positionX==10 && sprite._positionY==90, "set PositionY");
    sprite.setPositionX(35);
    assert.ok(sprite._positionX==35 && sprite._positionY==90, "set PositionX");
    sprite.changePositionX(50);
    assert.ok(sprite._positionX==35+50 && sprite._positionY==90, "change PositionX");
    sprite.changePositionY(-20);
    assert.ok(sprite._positionX==35+50 && sprite._positionY==90-20, "change PositionY");
    // *************************************************************
  /*  console.log("direction: "+sprite._direction);
    console.log("x: "+sprite._positionX);
    console.log("y: "+sprite._positionY);
    sprite.move(10);
    console.log("x: "+sprite._positionX);
    console.log("y: "+sprite._positionY);*/
    sprite.setPosition(-10,-10);
    sprite.move(25);
    assert.ok(sprite._positionX==15 && sprite._positionY==-10 && sprite._direction==90, "move steps 90°");

    var triggerEvent;
    sprite.setDirection(-90,triggerEvent);
    sprite.setPosition(-10,-10);
    sprite.move(25);
    assert.ok(sprite._positionX==-35 && sprite._positionY==-10 && sprite._direction==-90, "move steps -90°");

    sprite.setDirection(-180,triggerEvent);
    sprite.setPosition(-10,-10);
    sprite.move(25);
    assert.ok(sprite._positionX==-10 && sprite._positionY==-35 && sprite._direction==-180, "move steps -180°");

    sprite.setDirection(180,triggerEvent);
    sprite.setPosition(-10,-10);
    sprite.move(25);
    assert.ok(sprite._positionX==-10 && sprite._positionY==-35 && sprite._direction==180, "move steps 180°");

    sprite.setDirection(0,triggerEvent);
    sprite.setPosition(-10,-10);
    sprite.move(25);
    assert.ok(sprite._positionX==-10 && sprite._positionY==15 && sprite._direction==0, "move steps 0°");

    console.log("direction: "+sprite._direction);
    console.log("x: "+sprite._positionX);
    console.log("y: "+sprite._positionY);

    var steps=10;
    var rad = sprite.direction * (Math.PI / 180.0);
    console.log("rad : "+rad);
    var offsetX = Math.round(Math.sin(rad) * steps);
    var offsetY = Math.round(Math.cos(rad) * steps);
    console.log("offsetX: "+offsetX);
    console.log("offsetY: "+offsetY);

    /*  sprite.setBrightness(110);
      assert.equal(sprite.brightness, 100, "setBrightness over 100");

      sprite.setBrightness(-5);
      assert.equal(sprite.brightness, 0, "setBrightness under 0");


      assert.throws(sprite.changeBrightness("sdfsdf"),false, "invalid brightness value");
      sprite.setBrightness(90);
      sprite.changeBrightness(12);
      assert.equal(sprite.brightness, 100, "changeBrightness over 100");

      sprite.setBrightness(30);
      sprite.changeBrightness(-32);
      assert.equal(sprite.brightness, 0, "changeBrightness under 0");

      assert.throws(sprite.setTransparency("sdfsdf"),false, "invalid transparency percentage");
      sprite.setTransparency(110);
      assert.equal(sprite.transparency, 100, "setTransparency over 100");

      sprite.setTransparency(-5);
      assert.equal(sprite.transparency, 0, "setTransparency under 0");

      sprite.setTransparency(90);
      sprite.changeTransparency(12);
      assert.equal(sprite.transparency, 100, "setTransparency over 100");

      sprite.setTransparency(30);
      sprite.changeTransparency(-32);
      assert.equal(sprite.transparency, 0, "setTransparency under 0");
  */

});

