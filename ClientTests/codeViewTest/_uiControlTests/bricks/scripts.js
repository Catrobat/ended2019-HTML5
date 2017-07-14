'use strict';

window.onload = function () {

    var container = new SmartJs.Ui.HtmlTag('ul');
    document.body.appendChild(container._dom);


    var device = "device";
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var b = new PocketCode.Model.WaitBrick("device", "sprite", { duration: duration });

    var brick = new PocketCode.WaitBrick(b, false);
    container._appendChild(brick._view);


    b = new PocketCode.Model.ForeverBrick("device", "sprite", 50, { id: "id" });
    brick = new PocketCode.ForeverBrick(b, false);
    container._appendChild(brick._view);


    var cond = JSON.parse('{"type":"OPERATOR","value":"EQUAL","right":{"type":"NUMBER","value":"1","right":null,"left":null},"left":{"type":"NUMBER","value":"1","right":null,"left":null}}');
    b = new PocketCode.Model.IfThenElseBrick("device", "sprite", { condition: cond });
    brick = new PocketCode.IfThenElseBrick(b, false, true);
    container._appendChild(brick._view);


    var gameEngine = new PocketCode.GameEngine();
    gameEngine._collisionManager = new PocketCode.CollisionManager(400, 200);  //make sure collisionMrg is initialized before calling an onStart event
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    gameEngine.__currentScene = scene; //set internal: tests only
    gameEngine._startScene = scene;

    gameEngine._background = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });  //to avoid error on start
    gameEngine.projectReady = true;

    b = new PocketCode.Model.WhenProgramStartBrick("device", "sprite", { x: 1, y: 2 }, scene.onStart);
    brick = new PocketCode.WhenProgramStartBrick(b, false);
    container._appendChild(brick._view);

}