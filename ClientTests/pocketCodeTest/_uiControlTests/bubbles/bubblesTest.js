'use strict';

window.onload = function () {

    var rb = new PocketCode.RenderingBubble();
    rb.text='s';

    document.body.appendChild(rb._cacheCanvas);

    var canvas = document.getElementById("testCanvas"),
        ctx = canvas.getContext("2d");
    rb.draw(ctx);



}