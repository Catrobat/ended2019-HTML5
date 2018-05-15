'use strict';

window.onload = function () {

    var rb = new PocketCode.RenderingBubble();
    rb.content='Je vais faire une phrase simple afin de démontrer que cela s affiche bien sans problème';
    //rb.type = PocketCode.Ui.BubbleType.THINK;
    rb.orientation = PocketCode.BubbleOrientation.TOPRIGHT;

    document.body.appendChild(rb._cacheCanvas);

    var canvas = document.getElementById("testCanvas"),
        ctx = canvas.getContext("2d");
    rb.draw(ctx);



}