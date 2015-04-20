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

    // ********************* Move/Direction *********************
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

    // *************************************************************

    // ********************* turn *********************

    sprite.setDirection(90,triggerEvent);
    sprite.turnRight(50);
    assert.ok( sprite._direction==140, "turn right 50°");
    sprite.turnRight(570); //710 --> -10
    assert.ok( sprite._direction==-10, "turn right to 710°");
    sprite.turnRight(-180); // -190 --> 170
    assert.ok( sprite._direction==170, "turn right to -190°");

    sprite.setDirection(90,triggerEvent);
    sprite.turnRight(100); //190 --> -170
    assert.ok( sprite._direction==-170, "turn right to 190°");
    sprite.turnRight(180); //-170 --> 10
    assert.ok( sprite._direction==10, "turn right to 10°");
    sprite.turnRight(-20); //-170 --> 10
    assert.ok( sprite._direction==-10, "turn right to 10°");
    sprite.setDirection(90,triggerEvent);
    sprite.turnRight(-100); //-10 --> -10
    assert.ok( sprite._direction==-10, "turn right to -10°");

    sprite.setDirection(0,triggerEvent);
    sprite.turnRight(-350); //-350 --> 10
    assert.ok( sprite._direction==10, "turn right to 10°");
    sprite.setDirection(0,triggerEvent);
    sprite.turnRight(350); //350 --> -10
    assert.ok( sprite._direction==-10, "turn right to -10°");
    sprite.setDirection(0,triggerEvent);
    sprite.turnLeft(350); //350 --> 10
    assert.ok( sprite._direction==10, "turn left to 10°");
    sprite.setDirection(0,triggerEvent);
    sprite.turnLeft(-350); //-350 --> -10
    assert.ok( sprite._direction==-10, "turn left to -10°");

    sprite.setDirection(90,triggerEvent);
    sprite.turnRight(-540); //-350 --> 10
    assert.ok( sprite._direction==-90, "turn right to -90°");
    sprite.setDirection(90,triggerEvent);
    sprite.turnRight(541); //350 --> -10
    assert.ok( sprite._direction==-89, "turn right to -89°");
    sprite.setDirection(90,triggerEvent);
    sprite.turnLeft(540); //350 --> 10
    assert.ok( sprite._direction==-90, "turn left to -90°");
    sprite.setDirection(90,triggerEvent);
    sprite.turnLeft(-541); //-350 --> -10
    assert.ok( sprite._direction==-89, "turn left to -89°");

    sprite.setDirection(-90,triggerEvent);
    sprite.turnRight(-450); //-350 --> 10
    assert.ok( sprite._direction==180, "turn right to 180°");
    sprite.setDirection(-90,triggerEvent);
    sprite.turnRight(450); //350 --> -10
    assert.ok( sprite._direction==0, "turn right to 0°");
    sprite.setDirection(-90,triggerEvent);
    sprite.turnLeft(450); //350 --> 10
    assert.ok( sprite._direction==180, "turn left to 180°");
    sprite.setDirection(-90,triggerEvent);
    sprite.turnLeft(-450); //-350 --> -10
    assert.ok( sprite._direction==0, "turn left to 0°");
    //console.log("direction : "+sprite._direction);

    // *************************************************************

    // ********************* variables *********************
    var varArray=[{id: [21], name: ["two-one"]},{id: [24], name:["two-four"]}];
    sprite.variables= varArray;
    assert.ok( sprite._variables[21].value==0.0, "correct init");
    assert.ok( sprite._variables[21].name=="two-one", "correct insertion of array entries");
    assert.ok( sprite._variables[24].name=="two-four", "correct insertion of array entries");
    var fakeArray= "error"
    assert.throws(function () {sprite.variables=fakeArray},Error,"passing non Array");
    var v=sprite.getVariable(21);
    assert.ok(v.name=="two-one","get variable");
    assert.throws(function () {sprite.getVariable(22)},Error,"unknown variable id");

    var varNames=sprite.getVariableNames();
    assert.ok(varNames[21].name=="two-one","get variableNames");

    /*var steps=10;
     var rad = sprite.direction * (Math.PI / 180.0);
     console.log("rad : "+rad);
     var offsetX = Math.round(Math.sin(rad) * steps);
     var offsetY = Math.round(Math.cos(rad) * steps);
     console.log("offsetX: "+offsetX);
     console.log("offsetY: "+offsetY); */

    // *************************************************************

    // ********************* looks *********************
    var look1= new Object();
    look1.name= "look1";
    look1.id="first";
    var look2 = new Object();
    look2.name= "look2";
    look2.id="second";
    var looks=[];
    looks[0]=look1;
    looks[1]=look2;
    sprite.looks=looks;
    assert.ok(sprite._looks[1].name=="look2","set looks1");
    assert.ok(sprite._currentLook==looks[0],"set looks2");
    assert.ok(sprite._currentLook.name=="look1","set looks3");

    sprite.setLook("second");
    assert.ok(sprite._currentLook.name=="look2","set current look with id");

    sprite.nextLook();
    assert.ok(sprite._currentLook.name=="look1","next look");

    sprite.nextLook();
    assert.ok(sprite._currentLook.name=="look2","next look 2");

    var look3= new Object();
    look3.name= "look3";
    look3.id="third";
    looks[2]=look3;
    sprite.looks=looks;
    assert.ok(sprite._currentLook.name=="look1","current look set back to first after look setter");
    assert.ok(sprite._looks.length==3,"looks count increased");

    sprite.setLook("third");
    assert.ok(sprite._currentLook.name=="look3","next look to last look");

    sprite.nextLook();
    assert.ok(sprite._currentLook.name=="look1","look loop 1");
    sprite.nextLook();
    assert.ok(sprite._currentLook.name=="look2","look loop 2");
    sprite.nextLook();
    assert.ok(sprite._currentLook.name=="look3","look loop 3");
    sprite.nextLook();
    assert.ok(sprite._currentLook.name=="look1","look loop 4 back to first");

    // *************************************************************

    // ********************* start/pause/resume/stop *********************
    var brick1= new PocketCode.Bricks.RootContainerBrick();
    brick1.id="first";
    var brick2= new PocketCode.Bricks.RootContainerBrick();
    var brick3= new PocketCode.Bricks.RootContainerBrick();
    var brick4= new PocketCode.Bricks.RootContainerBrick();
    var brick5= new PocketCode.Bricks.RootContainerBrick();
    var tmpBricks=[];
    tmpBricks[0]=brick1;
    tmpBricks[1]=brick2;
    tmpBricks[2]=brick3;
    sprite.bricks=tmpBricks;
    assert.ok(sprite._bricks.length==3,"bricks length");

    sprite.execute();
    assert.ok(sprite._executionState == PocketCode.ExecutingState.RUNNING,"start() call running true");

    sprite.stop();
    assert.ok(sprite._executionState == PocketCode.ExecutingState.STOPPED,"stop() call running false");

    sprite.resume();
    assert.ok(sprite._executionState == PocketCode.ExecutingState.STOPPED,"stop() call running false");

    sprite.pause();
    assert.ok(sprite._executionState == PocketCode.ExecutingState.STOPPED,"stop() call running false");

    // *************************************************************

    // ********************* trigger on change *********************
        // like broadcastmgr tests line 138

    var degree= 90;
    var direction =degree;

    sprite._triggerOnChange([{direction: degree}]);
    console.log("trigger event: "+sprite._onChange);


    // ********************* come to front/go back *********************
    var tmpprog= new PocketCode.Model.Program();

    var newSprite = new PocketCode.Model.Sprite(tmpprog);
    newSprite.id="test2";
    newSprite.name="test2";
    tmpprog.sprites.push(newSprite);
    var firstLayer=newSprite.layer;

    var newSprite2 = new PocketCode.Model.Sprite(tmpprog);
    newSprite2.id="test3";
    newSprite2.name="test3";
    tmpprog.sprites.push(newSprite2);

    var tmpsprite =  new PocketCode.Model.Sprite(tmpprog);
    tmpsprite.id="test1";
    tmpsprite.name="test1";
    tmpprog.sprites.push(tmpsprite);

    newSprite.comeToFront();
    assert.ok(newSprite.layer==tmpprog.sprites.length+1,"go back 2 layers");
    tmpsprite.comeToFront();
    assert.ok(tmpsprite.layer==tmpprog.sprites.length+1,"go back 2 layers");
    newSprite2.comeToFront();
    assert.ok(newSprite2.layer==tmpprog.sprites.length+1,"go back 2 layers");

    var layerBefore=newSprite.layer;
    newSprite.goBack();
    assert.ok(newSprite.layer==firstLayer,"go back 2 layers");
    layerBefore=newSprite2.layer;
    newSprite2.goBack();
    assert.ok(newSprite2.layer==layerBefore-1,"go back 2 layers");
    layerBefore=tmpsprite.layer;
    tmpsprite.goBack();
    assert.ok(tmpsprite.layer==layerBefore-1,"go back 2 layers");
    layerBefore=tmpsprite.layer;
    tmpsprite.goBack();
    assert.ok(tmpsprite.layer==firstLayer,"go back 2 layers");
    // *************************************************************

    // ********************* point to *********************
    sprite.id="id1";
    var newSprite = new PocketCode.Model.Sprite(prog);
    newSprite.id="id2";
    prog.sprites.push(newSprite);
    var tmp= prog.getSprite("id2");

    assert.ok(tmp=newSprite,"push sprite to program");

    newSprite.setPosition(100,100);
    sprite.setPosition(50,50);

    sprite.pointTo("id2");
    assert.ok(sprite.direction==45,"point to right up sprite");

    newSprite.setPosition(0,0);
    sprite.setPosition(50,50);

    sprite.pointTo("id2");
    assert.ok(sprite.direction==-180+45,"point to left down sprite");
    // *************************************************************




});

