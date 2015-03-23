/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("sprite.js");



QUnit.test("Sprite", function (assert) {

    var prog= new PocketCode.Model.Program();
    var sprite = new PocketCode.Model.Sprite(prog,null);
    assert.ok(sprite instanceof PocketCode.Model.Sprite, "instance check");


    assert.throws(sprite.setBrightness("sdfsdf"),false, "invalid brightness percentage");
    sprite.setBrightness(110);
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


});

