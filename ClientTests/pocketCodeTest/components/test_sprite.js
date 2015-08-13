/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksCore.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/bricksControl.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/device.js" />
/// <reference path="../../../Client/pocketCode/scripts/component/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
'use strict';

QUnit.module("sprite.js");



QUnit.test("Sprite", function (assert) {

    var programExecAsync = assert.async();
    var testsExecAsync = assert.async();
    var finalAsyncCall = assert.async();
    var asyncCalls = 0; //check all async calls where executed before running dispose

    var prog = new PocketCode.GameEngine();
    var sprite = new PocketCode.Sprite(prog, {id: "newId", name: "myName"});
    assert.ok(sprite instanceof PocketCode.Sprite && sprite instanceof PocketCode.UserVariableHost && sprite instanceof SmartJs.Core.Component, "instance check");

    //dispose: this is called after the last async test to avoid errors 
    var disposeTest = function () {
        if (asyncCalls < 2)
            return;
        sprite.dispose();
        assert.ok(sprite._disposed, "sprite disposed");
        finalAsyncCall();
    };

    //attach listener to get latest changes
    var lastOnChangeArgs;
    var onChangeHandler = function (e) {
        lastOnChangeArgs = e.properties;
    }
    sprite._onChange.addEventListener(new SmartJs.Event.EventListener(onChangeHandler, this));

    //properties
    assert.throws(function () { var err = new PocketCode.Sprite(prog); }, Error, "missing ctr arguments");
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
        assert.deepEqual(e.properties, props[0], "onChange event args properties check");
    };
    var prog2 = new PocketCode.GameEngine();
    var evSprite = new PocketCode.Sprite(prog2, { id: "newId", name: "myName" })
    evSprite.onChange.addEventListener(new SmartJs.Event.EventListener(onChangeHandler, this));

    evSprite._triggerOnChange(props);


    sprite = new PocketCode.Sprite(prog, { id: "newId", name: "myName" });
    var returnVal;

    // ********************* GraphicEffects *********************
    assert.throws(function () { sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, "asdf") }, Error, "invalid brightness percentage");
    assert.throws(function () { sprite.setGraphicEffect(null, 50) }, Error, "unknown graphic effect");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 210);
    assert.equal(sprite._brightness, 200, "set brightness over 200");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, -210);
    assert.equal(sprite._brightness, 0, "set brightness under 0");

    returnVal = sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 110);
    assert.equal(sprite._transparency, 100.0, "set transparency over 100");
    assert.ok(returnVal, "update: transparency");
    returnVal = sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 110);
    assert.ok(!returnVal, "update: transparency: not changed");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, -110);
    assert.equal(sprite._transparency, 0.0, "set transparency under 0");


    assert.throws(function () { sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, "asdf") }, Error, "ERROR: invalid brightness percentage");
    assert.throws(function () { sprite.changeGraphicEffect(null, 50) }, Error, "ERROR: unknown graphic effect");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 100);
    assert.ok(!sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 100), "set grafic effect: no change to brightness");
    assert.throws(function () { sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS); }, Error, "ERROR: set grafic effect: missing argument brightness");

    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 110);
    assert.equal(sprite._brightness, 200, "change brightness over 200");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 100);
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, -110);
    assert.equal(sprite._brightness, 0, "change brightness under 0");
    returnVal = sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, -110);
    assert.ok(!returnVal, "set brightness: no update on value");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 50);
    assert.ok(!sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 50), "set grafic effect: no change to transparency");
    assert.throws(function () { sprite.setGraphicEffect("UNKNOWN", 50); }, Error, "ERROR: set grafic effect: unknown effect");
    assert.throws(function () { sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST); }, Error, "ERROR: set grafic effect: missing argument transparency");

    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST, 60);
    assert.equal(sprite._transparency, 100.0, "change transparency over 100");
    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 50);
    returnVal = sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST, -60);
    assert.equal(sprite._transparency, 0.0, "change transparency under 0");
    assert.ok(returnVal, "change transparency: return value");
    returnVal = sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST, -60);
    assert.ok(!returnVal, "change transparency: return value (no change)");

    sprite.setGraphicEffect(PocketCode.GraphicEffect.GHOST, 50);
    assert.equal(sprite._transparency, 50.0, "set transparency");
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.GHOST, 10);
    assert.equal(sprite._transparency, 60.0, "change transparency");


    sprite.setGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 50);
    assert.equal(sprite._brightness, 50.0, "set brightness");
    sprite.changeGraphicEffect(PocketCode.GraphicEffect.BRIGHTNESS, 60);
    assert.equal(sprite._brightness, 110, "change brightness");

    returnVal = sprite.setGraphicEffect(PocketCode.GraphicEffect.FISHEYE, 50);
    assert.ok(!returnVal, "setting an undefined effect");
    returnVal = sprite.changeGraphicEffect(PocketCode.GraphicEffect.MOSAIC, 60);
    assert.ok(!returnVal, "changing an undefined effect");

    returnVal = sprite.clearGraphicEffects();
    assert.ok(sprite._brightness == 100 && sprite._transparency == 0, "graphic effects cleared");
    assert.ok(returnVal, "clear graphic effect: retrun value");
    returnVal = sprite.clearGraphicEffects();
    assert.ok(!returnVal, "clear graphic effect: retrun value (no updates)");

    // *************************************************************

    // ********************* show/hide *********************
    returnVal = sprite.show();
    assert.ok(sprite._visible, "show sprite");
    assert.ok(!returnVal, "call show() on visisble sprite: return value");
    returnVal = sprite.hide();
    assert.ok(!sprite._visible, "show sprite");
    assert.ok(returnVal, "call hide() on invisisble sprite: return value");
    assert.ok(lastOnChangeArgs.visible !== undefined, "visibility event args");
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

    var testSprite = new PocketCode.Sprite(prog, jsonSprite);

    assert.deepEqual(testSprite.id, jsonSprite.id, "Id set correctly.");
    assert.deepEqual(testSprite.name, jsonSprite.name, "Name set correctly.");

    var varsMatch = true;
    for (var i = 0, length = jsonSprite.variables.length; i < length; i++) {
        //if (!testSprite.__variablesSimple._variables[jsonSprite.variables[i].id] === jsonSprite.variables[i].id)
        if (testSprite.getVariable(jsonSprite.variables[i].id)._id !== jsonSprite.variables[i].id)
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
    assert.throws(function () { new PocketCode.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for bricks.");

    corruptSprite = JSON.parse(JSON.stringify(projectSounds.sprites[0]));
    corruptSprite.sounds = {};
    assert.throws(function () { new PocketCode.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for sounds.");

    corruptSprite = JSON.parse(JSON.stringify(projectSounds.sprites[0]));
    corruptSprite.variables = {};
    assert.throws(function () { new PocketCode.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for variables.");

    corruptSprite = JSON.parse(JSON.stringify(projectSounds.sprites[0]));
    corruptSprite.looks = {};
    assert.throws(function () { new PocketCode.Sprite(prog, corruptSprite); }, Error, "Error: incorrect argument for looks.");


    // *************************************************************

    // ********************* Size *********************
    assert.throws(function () { sprite.setSize("asdf") }, Error, "invalid percentage");

    sprite.setSize(0);
    assert.ok(!sprite.setSize(-20), "size not changed: 0");
    sprite.setSize(100);
    assert.ok(!sprite.setSize(100), "size not changed: same size");
    sprite.setSize(-20);
    assert.equal(sprite._size, 0, "set size below 0");
    returnVal = sprite.setSize(50);
    assert.equal(sprite._size, 50, "set size");
    assert.ok(returnVal, "set size return val");
    assert.ok(lastOnChangeArgs.size !== undefined, "set size event args");

    returnVal = sprite.changeSize(-60);
    assert.equal(sprite._size, 0, "change size below 0");
    assert.ok(returnVal, "change size: changed");
    assert.ok(lastOnChangeArgs.size !== undefined, "change size event args");

    sprite.changeSize(20);
    assert.equal(sprite._size, 20, "change size upwards");
    sprite.changeSize(15);
    sprite.changeSize(20);
    assert.equal(sprite._size, 55, "double change size");
    assert.throws(function () { sprite.changeSize(); }, Error, "ERROR: missing argument");
    lastOnChangeArgs = undefined;
    returnVal = sprite.changeSize(0);
    assert.ok(!returnVal, "change size: not changed");
    assert.ok(lastOnChangeArgs == undefined, "change size: no event dispatched");

    // *************************************************************

    // ********************* Position *********************
    returnVal = sprite.setPosition(10, 10);
    assert.ok(sprite._positionX == 10 && sprite._positionY == 10, "set Position");
    assert.ok(returnVal, "set position: update");
    assert.ok(lastOnChangeArgs.positionX !== undefined || lastOnChangeArgs.positionY !== undefined, "set position event args");
    returnVal = sprite.setPosition(10, 10);
    assert.ok(returnVal == false, "set position: no change");

    returnVal = sprite.setPositionY(90);
    assert.ok(sprite._positionX == 10 && sprite._positionY == 90, "set PositionY");
    assert.ok(returnVal, "set positionY: update");
    assert.ok(lastOnChangeArgs.positionY !== undefined, "set positionY event args");
    returnVal = sprite.setPositionY(90);
    assert.ok(returnVal == false, "set positionY: no change");

    returnVal = sprite.setPositionX(35);
    assert.ok(sprite._positionX == 35 && sprite._positionY == 90, "set PositionX");
    assert.ok(returnVal, "set positionX: update");
    assert.ok(lastOnChangeArgs.positionX !== undefined, "set positionX event args");
    returnVal = sprite.setPositionX(35);
    assert.ok(returnVal == false, "set positionX: no change");

    returnVal = sprite.changePositionX(50);
    assert.ok(sprite._positionX == 35 + 50 && sprite._positionY == 90, "change PositionX");
    assert.ok(returnVal, "change positionX: change");
    assert.ok(lastOnChangeArgs.positionX !== undefined, "chagne positionX event args");
    assert.ok(sprite.changePositionX(0) == false, "change positionX: no change");
    returnVal = sprite.changePositionY(-20);
    assert.ok(sprite._positionX == 35 + 50 && sprite._positionY == 90 - 20, "change PositionY");
    assert.ok(returnVal, "change positionY: change");
    assert.ok(lastOnChangeArgs.positionY !== undefined, "change positionY event args");
    assert.ok(sprite.changePositionY(0) == false, "change positionY: no change");
    // *************************************************************

    //if on edge, bounce
    assert.ok(typeof prog.checkSpriteOnEdgeBounce === "function", "sprite-brogram interface: if on edge bounce");
    var ioeCalled = false;
    prog.checkSpriteOnEdgeBounce = function () {    //override to check call
        ioeCalled = true;
    };
    sprite.ifOnEdgeBounce();
    assert.ok(ioeCalled, "if on edge bounce: call parent");

    // ********************* Move/Direction *********************
    sprite.setPosition(-10, -10);
    returnVal = sprite.move(25);
    assert.ok(sprite._positionX == 15 && sprite._positionY == -10 && sprite._direction == 90, "move steps 90°");
    assert.ok(returnVal, "move return value: true on change");
    assert.ok(lastOnChangeArgs.positionX !== undefined || lastOnChangeArgs.positionY !== undefined, "move event args");
    assert.ok(sprite.move(0) == false, "move return value: false if position did not change");

    var triggerEvent;   //undefined = true
    sprite.setDirection(0);
    returnVal = sprite.setDirection(-90, triggerEvent);
    assert.ok(returnVal, "setDirection return value");
    assert.ok(lastOnChangeArgs.direction !== undefined, "set direction event args");
    returnVal = sprite.setDirection(-90, triggerEvent);
    assert.ok(!returnVal, "setDirection return value false (no change)");
    assert.ok(sprite.setDirection() == false, "setDirection return value false (no parameter)");
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
    returnVal = sprite.turnRight(180); //-170 --> 10
    assert.ok(returnVal, "turnRight returns true on update");
    assert.ok(lastOnChangeArgs.direction !== undefined, "turn right event args");
    returnVal = sprite.turnRight(0); //-170 --> 10
    assert.ok(!returnVal, "turnRight returns false: no update");
    returnVal = sprite.turnRight(360);
    assert.ok(!returnVal, "turnRight returns false: no update (360°) turn");
    assert.ok(sprite.turnRight() == false, "turn right without parameter");

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
    returnVal = sprite.turnLeft(350); //350 --> 10
    assert.ok(returnVal, "turnLeft returns true on update");
    returnVal = sprite.turnLeft(360);
    assert.ok(!returnVal, "turnLeft returns false: no update (360°) turn");
    assert.ok(sprite.turnLeft() == false, "turn left without parameter");

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
    assert.ok(lastOnChangeArgs.direction !== undefined, "turn left event args");
    sprite.setDirection(-90, triggerEvent);
    sprite.turnLeft(-450); //-350 --> -10
    assert.ok(sprite._direction == 0, "turn left to 0°");
    //console.log("direction : "+sprite._direction);

    // *************************************************************

    // ********************* variables *********************
    var varArray = [{ id: [21], name: ["two-one"] }, { id: [24], name: ["two-four"] }];
    sprite._variables = varArray;
    assert.ok(sprite.getVariable(21).value == undefined, "correct init");
    assert.ok(sprite.getVariable(21).name == "two-one", "correct insertion of array entries");
    assert.ok(sprite.getVariable(24).name == "two-four", "correct insertion of array entries");
    var fakeArray = "error"
    assert.throws(function () { sprite._variables = fakeArray }, Error, "passing non Array");
    var v = sprite.getVariable(21);
    assert.ok(v.name == "two-one", "get variable");
    assert.throws(function () { sprite.getVariable(22) }, Error, "unknown variable id");

    var varNames = sprite.getAllVariables();
    assert.ok(varNames.local[21].name == "two-one", "get variableNames");


    // *************************************************************

    // ********************* looks *********************
    sprite.looks = [];
    returnVal = sprite.setLook("non existing");
    assert.ok(!returnVal, "set look on nonexisting look");

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
    assert.equal(sprite.looks, looks, "looks getter");
    assert.ok(sprite._looks[1].name == "look2", "set looks1");
    assert.ok(sprite._currentLook == looks[0], "set looks2");
    assert.ok(sprite._currentLook.name == "look1", "set looks3");

    returnVal = sprite.setLook("first");
    assert.ok(!returnVal, "set already active look: no change");

    returnVal = sprite.setLook("second");
    assert.ok(sprite._currentLook.name == "look2", "set current look with id");
    assert.ok(returnVal, "set look: change (return value)");
    assert.ok(lastOnChangeArgs.lookId !== undefined, "set look event args");
    assert.throws(function () { sprite.setLook("non existing"); }, "ERROR: try to set undefined look");

    sprite.looks = [];
    returnVal = sprite.nextLook();
    assert.ok(!returnVal, "next look on nonexisting look");

    sprite.looks = looks;
    returnVal = sprite.setLook("second");
    returnVal = sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look1", "next look");
    assert.ok(returnVal, "first look is set after last");
    assert.ok(lastOnChangeArgs.lookId !== undefined, "next look event args");
    returnVal = sprite.nextLook();
    assert.ok(sprite._currentLook.name == "look2", "next look 2");
    assert.ok(returnVal, "next look is set correctly");

    looks.pop();    //only one left
    returnVal = sprite.nextLook();
    assert.ok(!returnVal, "next look if only one is defined");

    looks[1] = look2;   //add again
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
    //var device = new PocketCode.Device();
    var programAsync = new PocketCode.GameEngine();
    var brick1 = new PocketCode.Bricks.ProgramStartBrick(device, programAsync, sprite);
    brick1.id = "first";
    var brick2 = new PocketCode.Bricks.ProgramStartBrick(device, programAsync, sprite);
    //adding a test brick to the internal brick container
    var testBrick = new PocketCode.Bricks.WaitBrick(device, sprite, { duration: { type: "NUMBER", value: 1, right: null, left: null } });
    brick2._bricks._bricks.push(testBrick);
    var brick3 = new PocketCode.Bricks.ProgramStartBrick(device, programAsync, sprite);
    var brick4 = new PocketCode.Bricks.ProgramStartBrick(device, programAsync, sprite);
    var brick5 = new PocketCode.Bricks.ProgramStartBrick(device, programAsync, sprite);
    var tmpBricks = [];
    tmpBricks[0] = brick1;
    tmpBricks[1] = brick2;
    tmpBricks[2] = brick3;
    sprite.bricks = tmpBricks;
    assert.equal(sprite.bricks, tmpBricks, "bricks getter");
    assert.ok(sprite._bricks.length == 3, "bricks length");

    assert.ok(sprite.scriptsRunning == false, "scrips not running");
    brick2._executionState = PocketCode.ExecutionState.PAUSED;  //simulate paused
    assert.ok(sprite.scriptsRunning, "scrips running: paused");
    brick2._executionState = PocketCode.ExecutionState.RUNNING;  //simulate running
    assert.ok(sprite.scriptsRunning, "scrips running: running");

    //start, pause, resume, stop + executed
    //binding program events
    for (var i = 0, l = tmpBricks.length; i < l; i++) {
        tmpBricks[i].onExecuted.addEventListener(new SmartJs.Event.EventListener(programAsync._spriteOnExecutedHandler, programAsync));
    }

    var programExecutedHandler = function () {
        assert.ok(true, "program executed: all running scripts executed");

        //remove after dispatched to avoid multiple calls
        for (var i = 0, l = tmpBricks.length; i < l; i++) {
            tmpBricks[i].onExecuted.removeEventListener(new SmartJs.Event.EventListener(programAsync._spriteOnExecutedHandler, programAsync));
        }
        programExecAsync();
        asyncCalls++;
        disposeTest();  //make sure this is called last
    };
    programAsync.onProgramExecuted.addEventListener(new SmartJs.Event.EventListener(programExecutedHandler, this));
    programAsync.onProgramStart.dispatchEvent();
    assert.ok(sprite.scriptsRunning, "scrips running: onExecute (program)");

    sprite.pauseScripts();
    assert.ok(sprite.scriptsRunning, "scrips running: paused");

    //making sure the script was really paused is quite a hack here
    var isPaused = function () {
        for (var p in testBrick._pendingOps) {
            if (testBrick._pendingOps.hasOwnProperty(p)) {
                var po = testBrick._pendingOps[p];
                if (po.timer._paused == true)
                    ;//paused = true;
                else 
                    return false;
            }
        }
        return true;
    };

    assert.ok(isPaused(), "script paused correctly: deep check (timer)");

    sprite.resumeScripts();
    assert.ok(sprite.scriptsRunning, "scrips running: running");
    assert.ok(!isPaused(), "script resumed correctly: deep check (timer)");

    sprite.stopScripts();
    assert.ok(!sprite.scriptsRunning, "scrips running: stopped");
    assert.ok(  function () { 
                    for (var p in testBrick._pendingOps)
                        if (testBrick._pendingOps.hasOwnProperty(p))
                            return false;
                    return true;
                }, "script stopped correctly: deep check: no threaded items left");

    //start script again to get an onExecEvent in the gameEngine
    programAsync.onProgramStart.dispatchEvent();

    // ********************* come to front/go back *********************
    var program = new PocketCode.GameEngine();

    var newSprite = new PocketCode.Sprite(program, { id: "newId", name: "myName" });
    program._sprites.push(newSprite);
    var firstLayer = newSprite.layer;

    var newSprite2 = new PocketCode.Sprite(program, { id: "newId", name: "myName" });
    program._sprites.push(newSprite2);

    var tmpsprite = new PocketCode.Sprite(program, { id: "newId", name: "myName" });
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
    newSprite = new PocketCode.Sprite(prog, { id: "newId", name: "myName" });
    newSprite.id = "id2";
    prog._sprites.push(newSprite);
    var tmp = prog.getSpriteById("id2");
    assert.ok(tmp === newSprite, "push sprite to program");

    newSprite.setPosition(100, 100);
    sprite.setPosition(50, 50);

    returnVal = sprite.pointTo();
    assert.ok(!returnVal, "pointTo: missing argument");
    returnVal = sprite.pointTo("id2");
    assert.ok(sprite.direction == 45, "point to right up sprite");
    assert.ok(returnVal, "point to: value changed");
    assert.ok(lastOnChangeArgs.direction !== undefined, "pointTo event args");
    returnVal = sprite.pointTo("id2");
    assert.ok(!returnVal, "point to: value not changed");
    //returnVal = sprite.pointTo(sprite.id);
    //assert.ok(!returnVal, "point to: self (no change)");
    assert.throws(function () { sprite.pointTo(sprite.id); }, "ERROR: point to: self");

    newSprite.setPosition(0, 0);
    sprite.setPosition(0, 0);
    returnVal = sprite.pointTo("id2");
    assert.ok(!returnVal, "point to: sprite on same position: ignored");

    sprite.setPosition(50, 50);

    sprite.pointTo("id2");
    assert.ok(sprite.direction == -180 + 45, "point to left down sprite");
    // *************************************************************

    testsExecAsync();
    asyncCalls++;
    disposeTest();

});

