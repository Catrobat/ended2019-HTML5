'use strict';

window.onload = function () {

    var container = new SmartJs.Ui.HtmlTag('ul');
    document.body.appendChild(container._dom);


    var device = "device";
    /*var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });*/
    var duration = JSON.parse('{"type":"NUMBER","value":"0.5","right":null,"left":null}');
    var b = new PocketCode.Model.WaitBrick("device", "sprite", { duration: duration });

    var brick = new PocketCode.WaitBrick(b, false);
    container._appendChild(brick._view);

}