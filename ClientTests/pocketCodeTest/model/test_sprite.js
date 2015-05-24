/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/sprite.js" />
/// <reference path="../../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("sprite.js");



QUnit.test("Sprite", function (assert) {

    var prog = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(prog, {id: "newId", name: "myName"});
    assert.ok(sprite instanceof PocketCode.Model.Sprite, "instance check");

    //properties
    assert.throws(function () { var err = new PocketCode.Model.Sprite(prog); }, Error, "missing ctr arguments");
    assert.equal(sprite.id, "newId", "id ctr setter");
    assert.equal(sprite.name, "myName", "name ctr setter");

    assert.throws(function () { sprite.looks = undefined; }, Error, "ERROR: setting looks");
    var looks = [{ id: 1 }, { id: 2 }];
    sprite.looks = looks;
    assert.equal(sprite._looks, looks, "looks setter");
    assert.equal(sprite.currentLook, looks[0], "current look getter");

    assert.equal(sprite.size, 100, "size (percentage) initial");
    assert.equal(sprite.visible, true, "visibility initial");
    assert.equal(sprite.transparency, 0, "transparency initial");
    assert.equal(sprite.brightness, 100, "brighness initial");

    //events
    assert.ok(sprite.onChange instanceof SmartJs.Event.Event, "event: onChange accessor and instance");
    assert.equal(sprite.onChange, prog.onSpriteChange, "program - sprite event sharing");
    assert.equal(sprite.onChange.target, prog, "onSpriteChange target check");

    assert.ok(sprite.onExecuted === sprite._onExecuted && sprite.onExecuted instanceof SmartJs.Event.Event, "event: onExecuted accessor and instance");

    var props = [{ direction: 90 }];
    var onChangeHandler = function (e) {
        assert.equal(e.target, evSprite, "onChange target check");
        assert.equal(e.id, "newId", " onChange id check");
        assert.equal(e.properties, props, "onChange event args properties check");
    };
    var prog2 = new PocketCode.GameEngine();
    var evSprite = new PocketCode.Model.Sprite(prog2, { id: "newId", name: "myName" })
    evSprite.onChange.addEventListener(new SmartJs.Event.EventListener(onChangeHandler, this));

    evSprite._triggerOnChange(props);


    sprite = new PocketCode.Model.Sprite(prog, { id: "newId", name: "myName" });
    // ********************* GraphicEffects *********************
    assert.throws(function () { sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, "asdf") }, Error, "invalid brightness percentage");
    assert.throws(function () { sprite.setGraphicEffect(null, 50) }, Error, "unknown graphic effect");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 210);
    assert.equal(sprite._brightness, 200, "set brightness over 200");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, -210);
    assert.equal(sprite._brightness, 0, "set brightness under 0");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 110);
    assert.equal(sprite._transparency, 100.0, "set transparency over 100");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, -110);
    assert.equal(sprite._transparency, 0.0, "set transparency under 0");


    assert.throws(function () { sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, "asdf") }, Error, "invalid brightness percentage");
    assert.throws(function () { sprite.changeGraphicEffect(null, 50) }, Error, "unknown graphic effect");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 100);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 110);
    assert.equal(sprite._brightness, 200, "change brightness over 200");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 100);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, -110);
    assert.equal(sprite._brightness, 0, "change brightness under 0");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 50);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST, 60);
    assert.equal(sprite._transparency, 100.0, "change transparency over 100");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 50);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST, -60);
    assert.equal(sprite._transparency, 0.0, "change transparency under 0");


    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 50);
    assert.equal(sprite._transparency, 50.0, "set transparency");
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST, 10);
    assert.equal(sprite._transparency, 60.0, "change transparency");


    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 50);
    assert.equal(sprite._brightness, 50.0, "set brightness");
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 60);
    assert.equal(sprite._brightness, 110, "change brightness");

    sprite.clearGraphicEffects();
    assert.ok(sprite._brightness == 100 && sprite._transparency == 0, "graphic effects cleared");

    // *************************************************************

    // ********************* show/hide *********************
    sprite.show();
    assert.ok(sprite._visible, "show sprite");
    sprite.hide();
    assert.ok(!sprite._visible, "show sprite");
    sprite.hide();
    sprite.show();
    assert.ok(sprite._visible, "show sprite");
    // *************************************************************

    // ********************* Constructor *********************

    var device = new PocketCode.Device(this._soundManager);
    prog._brickFactory = new PocketCode.BrickFactory(device, prog, prog._broadcastMgr, prog._soundManager, 20);

    var jsonProject = JSON.parse(JSON.stringify(projectSounds));
    var jsonSprite = jsonProject.sprites[0];
    jsonSprite.sounds = jsonProject.sounds;
    jsonSprite.variables = strProject11.variables;

    var testSprite = new PocketCode.Model.Sprite(prog, jsonSprite);

    assert.deepEqual(testSprite.id, jsonSprite.id, "Id set correctly.");
    assert.deepEqual(testSprite.name, jsonSprite.name, "Name set correctly.");

    var varsMatch = true;
    for (var i = 0, length = jsonSprite.variables.length; i < length; i++) {
        if (!testSprite.__variables[jsonSprite.variables[i].id] === jsonSprite.variables[i].id)
            varsMatch = false;
    }
    assert.ok(varsMatch, "Variables set correctly.");

    //var soundsMatch = true;
    //for (var i = 0, length = jsonSprite.sounds.length; i < length; i++) {
    //    if (!testSprite._sounds[jsonSprite.sounds[i].id])
    //        soundsMatch = false;
    //}
    //assert.ok(soundsMatch, "Sounds set correctly.");
    assert.equal(testSprite.sounds, jsonSprite.sounds, "Sounds set correctly");

    var bricksMatch = true;
    for (var i = 0, length = jsonSprite.bricks.length; i < length; i++) {
        if (testSprite._bricks[i].id !== jsonSprite.bricks[i].id)
            bricksMatch = false;
    }
    assert.ok(bricksMatch, "Bricks set correctly.");

    var looksMatch = true;
    for (var i = 0, length = jsonSprite.looks.length; i < length; i++) {
        if (testSprite._looks[i].id !== jsonSprite.looks[i].id)
            looksMatch = false;
    }
    assert.ok(looksMatch, "Looks set correctly.");

    var corruptSprite = JSON.parse(JSON.stringify(projectSounds.sprites[0]));
    corruptSprite.bricks = {};
    assert.throws(function () { new PocketCode.Model.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for bricks.");

    corruptSprite = JSON.parse(JSON.stringify(projectSounds.sprites[0]));
    corruptSprite.sounds = {};
    assert.throws(function () { new PocketCode.Model.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for sounds.");

    corruptSprite = JSON.parse(JSON.stringify(projectSounds.sprites[0]));
    corruptSprite.variables = {};
    assert.throws(function () { new PocketCode.Model.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for variables.");

    corruptSprite = JSON.parse(JSON.stringify(projectSounds.sprites[0]));
    corruptSprite.looks = {};
    assert.throws(function () { new PocketCode.Model.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for looks.");


    // *************************************************************

    // ********************* Size *********************
    assert.throws(function () { sprite.setSize("asdf") }, Error, "invalid percentage");

    sprite.setSize(-20);
    assert.equal(sprite._size, 0, "set size below 0");
    sprite.setSize(50);
    assert.equal(sprite._size, 50, "set size");
    sprite.changeSize(-60);
    assert.equal(sprite._size, 0, "change size below 0");
    sprite.changeSize(20);
    assert.equal(sprite._size, 20, "change size upwards");
    sprite.changeSize(15);
    sprite.changeSize(20);
    assert.equal(sprite._size, 55, "double change size");
    // *************************************************************

    // ********************* Position *********************
    sprite.setPosition(10, 10);
    assert.ok(sprite._positionX == 10 && sprite._positionY == 10, "set Position");
    sprite.setPositionY(90);
    assert.ok(sprite._positionX == 10 && sprite._positionY == 90, "set PositionY");
    sprite.setPositionX(35);
    assert.ok(sprite._positionX == 35 && sprite._positionY == 90, "set PositionX");
    sprite.changePositionX(50);
    assert.ok(sprite._positionX == 35 + 50 && sprite._positionY == 90, "change PositionX");
    sprite.changePositionY(-20);
    assert.ok(sprite._positionX == 35 + 50 && sprite._positionY == 90 - 20, "change PositionY");
    // *************************************************************

    // ********************* Move/Direction *********************
    sprite.setPosition(-10, -10);
    sprite.move(25);
    assert.ok(sprite._positionX == 15 && sprite._positionY == -10 && sprite._direction == 90, "move steps 90°");

    var triggerEvent;
    sprite.setDirection(-90, triggerEvent);
    sprite.setPosition(-10, -10);
    sprite.move(25);
    assert.ok(sprite._positionX == -35 && sprite._positionY == -10 && sprite._direction == -90, "move steps -90°");

    sprite.setDirection(-180, triggerEvent);
    sprite.setPosition(-10, -10);
    sprite.move(25);
    assert.ok(sprite._positionX == -10 && sprite._positionY == -35 && sprite._direction == -180, "move steps -180°");

    sprite.setDirection(180, triggerEvent);
    sprite.setPosition(-10, -10);
    sprite.move(25);
    assert.ok(sprite._positionX == -10 && sprite._positionY == -35 && sprite._direction == 180, "move steps 180°");

    sprite.setDirection(0, triggerEvent);
    sprite.setPosition(-10, -10);
    sprite.move(25);
    assert.ok(sprite._positionX == -10 && sprite._positionY == 15 && sprite._direction == 0, "move steps 0°");

    // *************************************************************

    // ********************* turn *********************

    sprite.setDirection(90, triggerEvent);
    sprite.turnRight(50);
    assert.ok(sprite._direction == 140, "turn right 50°");
    sprite.turnRight(570); //710 --> -10
    assert.ok(sprite._direction == -10, "turn right to 710°");
    sprite.turnRight(-180); // -190 --> 170
    assert.ok(sprite._direction == 170, "turn right to -190°");

    sprite.setDirection(90, triggerEvent);
    sprite.turnRight(100); //190 --> -170
    assert.ok(sprite._direction == -170, "turn right to 190°");
    sprite.turnRight(180); //-170 --> 10
    assert.ok(sprite._direction == 10, "turn right to 10°");
    sprite.turnRight(-20); //-170 --> 10
    assert.ok(sprite._direction == -10, "turn right to 10°");
    sprite.setDirection(90, triggerEvent);
    sprite.turnRight(-100); //-10 --> -10
    assert.ok(sprite._direction == -10, "turn right to -10°");

    sprite.setDirection(0, triggerEvent);
    sprite.turnRight(-350); //-350 --> 10
    assert.ok(sprite._direction == 10, "turn right to 10°");
    sprite.setDirection(0, triggerEvent);
    sprite.turnRight(350); //350 --> -10
    assert.ok(sprite._direction == -10, "turn right to -10°");
    sprite.setDirection(0, triggerEvent);
    sprite.turnLeft(350); //350 --> 10
    assert.ok(sprite._direction == 10, "turn left to 10°");
    sprite.setDirection(0, triggerEvent);
    sprite.turnLeft(-350); //-350 --> -10
    assert.ok(sprite._direction == -10, "turn left to -10°");

    sprite.setDirection(90, triggerEvent);
    sprite.turnRight(-540); //-350 --> 10
    assert.ok(sprite._direction == -90, "turn right to -90°");
    sprite.setDirection(90, triggerEvent);
    sprite.turnRight(541); //350 --> -10
    assert.ok(sprite._direction == -89, "turn right to -89°");
    sprite.setDirection(90, triggerEvent);
    sprite.turnLeft(540); //350 --> 10
    assert.ok(sprite._direction == -90, "turn left to -90°");
    sprite.setDirection(90, triggerEvent);
    sprite.turnLeft(-541); //-350 --> -10
    assert.ok(sprite._direction == -89, "turn left to -89°");

    sprite.setDirection(-90, triggerEvent);
    sprite.turnRight(-450); //-350 --> 10
    assert.ok(sprite._direction == 180, "turn right to 180°");
    sprite.setDirection(-90, triggerEvent);
    sprite.turnRight(450); //350 --> -10
    assert.ok(sprite._direction == 0, "turn right to 0°");
    sprite.setDirection(-90, triggerEvent);
    sprite.turnLeft(450); //350 --> 10
    assert.ok(sprite._direction == 180, "turn left to 180°");
    sprite.setDirection(-90, triggerEvent);
    sprite.turnLeft(-450); //-350 --> -10
    assert.ok(sprite._direction == 0, "turn left to 0°");
    //console.log("direction : "+sprite._direction);

    // *************************************************************

    // ********************* variables *********************
    var varArray = [{ id: [21], name: ["two-one"] }, { id: [24], name: ["two-four"] }];
    sprite._variables = varArray;
    assert.ok(sprite.__variables[21].value == 0.0, "correct init");
    assert.ok(sprite.__variables[21].name == "two-one", "correct insertion of array entries");
    assert.ok(sprite.__variables[24].name == "two-four", "correct insertion of array entries");
    var fakeArray = "error"
    assert.throws(function () { sprite._variables = fakeArray }, Error, "passing non Array");
    var v = sprite.getVariable(21);
    assert.ok(v.name == "two-one", "get variable");
    assert.throws(function () { sprite.getVariable(22) }, Error, "unknown variable id");

    var varNames = sprite.getVariableNames();
    assert.ok(varNames[21].name == "two-one", "get variableNames");


    // *************************************************************

    // ********************* looks *********************
    var look1 = new Object();
    look1.name = "look1";
    look1.id = "first";
    var look2 = new Object();
    look2.name = "look2";
    look2.id = "second";
    var looks = [];
    looks[0] = look1;
    looks[1] = look2;
    sprite.looks = looks;
    assert.ok(sprite._looks[1].name == "look2", "set looks1");
    assert.ok(sprite._currentLook == looks[0], "set looks2");
    assert.ok(sprite._currentLook.name == "look1", "set looks3");

    sprite.setLook("second");
    assert.ok(sprite._currentLook.name == "look2", "set current look with id");

    sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look1", "next look");

    sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look2", "next look 2");

    var look3 = new Object();
    look3.name = "look3";
    look3.id = "third";
    looks[2] = look3;
    sprite.looks = looks;
    assert.ok(sprite._currentLook.name == "look1", "current look set back to first after look setter");
    assert.ok(sprite._looks.length == 3, "looks count increased");

    sprite.setLook("third");
    assert.ok(sprite._currentLook.name == "look3", "next look to last look");

    sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look1", "look loop 1");
    sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look2", "look loop 2");
    sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look3", "look loop 3");
    sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look1", "look loop 4 back to first");

    // *************************************************************

    // ********************* start/pause/resume/stop *********************
    var brick1 = new PocketCode.Bricks.RootContainerBrick();
    brick1.id = "first";
    var brick2 = new PocketCode.Bricks.RootContainerBrick();
    var brick3 = new PocketCode.Bricks.RootContainerBrick();
    var brick4 = new PocketCode.Bricks.RootContainerBrick();
    var brick5 = new PocketCode.Bricks.RootContainerBrick();
    var tmpBricks = [];
    tmpBricks[0] = brick1;
    tmpBricks[1] = brick2;
    tmpBricks[2] = brick3;
    sprite.bricks = tmpBricks;
    assert.ok(sprite._bricks.length == 3, "bricks length");

    //sprite.execute();
    //assert.ok(sprite._executionState == PocketCode.ExecutionState.RUNNING,"start() call running true");

    //sprite.stop();
    //assert.ok(sprite._executionState == PocketCode.ExecutionState.STOPPED,"stop() call running false");

    //sprite.resume();
    //assert.ok(sprite._executionState == PocketCode.ExecutionState.STOPPED,"stop() call running false");

    //sprite.pause();
    //assert.ok(sprite._executionState == PocketCode.ExecutionState.STOPPED,"stop() call running false");


    // ********************* come to front/go back *********************
    var program = new PocketCode.GameEngine();

    var newSprite = new PocketCode.Model.Sprite(program, { id: "newId", name: "myName" });
    program._sprites.push(newSprite);
    var firstLayer = newSprite.layer;

    var newSprite2 = new PocketCode.Model.Sprite(program, { id: "newId", name: "myName" });
    program._sprites.push(newSprite2);

    var tmpsprite = new PocketCode.Model.Sprite(program, { id: "newId", name: "myName" });
    program._sprites.push(tmpsprite);

    newSprite.comeToFront();
    assert.ok(newSprite.layer == program._sprites.length, "come to front 1");
    tmpsprite.comeToFront();
    assert.ok(tmpsprite.layer == program._sprites.length, "come to front 2");
    newSprite2.comeToFront();
    assert.ok(newSprite2.layer == program._sprites.length, "come to front 3");

    var layerBefore = newSprite.layer;
    newSprite.goBack(2);
    assert.ok(newSprite.layer == firstLayer, "go back 2 layers");
    layerBefore = newSprite2.layer;
    newSprite2.goBack(1);
    assert.ok(newSprite2.layer == layerBefore - 1, "go back 1 layers");
    layerBefore = tmpsprite.layer;
    tmpsprite.goBack(2);
    assert.ok(tmpsprite.layer == layerBefore - 2, "go back 2 layers");
    layerBefore = tmpsprite.layer;
    tmpsprite.goBack(3);
    assert.ok(tmpsprite.layer == firstLayer, "go back 3 layers");
    // *************************************************************

    // ********************* point to *********************
    sprite.id = "id1";
    newSprite = new PocketCode.Model.Sprite(prog, { id: "newId", name: "myName" });
    newSprite.id = "id2";
    prog._sprites.push(newSprite);
    var tmp = prog.getSpriteById("id2");
    assert.ok(tmp === newSprite, "push sprite to program");

    newSprite.setPosition(100, 100);
    sprite.setPosition(50, 50);

    sprite.pointTo("id2");
    assert.ok(sprite.direction == 45, "point to right up sprite");

    newSprite.setPosition(0, 0);
    sprite.setPosition(50, 50);

    sprite.pointTo("id2");
    assert.ok(sprite.direction == -180 + 45, "point to left down sprite");
    // *************************************************************

});

