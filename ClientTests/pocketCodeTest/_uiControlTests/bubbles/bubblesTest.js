'use strict';

window.onload = function () {
    var text = JSON.parse('{"type":"STRING","value":"good morning","right":null,"left":null}');
    var device = "device";
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    var sprite = new PocketCode.Model.Sprite(gameEngine, scene, { id: "spriteId", name: "spriteName" });
    //var outputContainer = document.getElementById('outputContainer');
    var b = new PocketCode.Model.showBubbleBrick(device, sprite, { text: text, bubbleType : PocketCode.Ui.BubbleType.THINK });
    PocketCode.RenderingSprite(b);
    //RenderingSprite(bubble);

//Creation of the bubble




//Call Rendering item bubbles


}