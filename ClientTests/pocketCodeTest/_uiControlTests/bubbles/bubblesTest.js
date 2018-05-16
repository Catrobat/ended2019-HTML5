/// <reference path="../../../../Client/pocketCode/scripts/components/renderingItem.js" />
'use strict';

window.onload = function () {

    //init test canvas
    var canvas = document.getElementById("testCanvas"),
        ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 200;

    //speech
    var sb1 = new PocketCode.RenderingBubble(),
        sb2 = new PocketCode.RenderingBubble(),
        sb3 = new PocketCode.RenderingBubble(),
        sb4 = new PocketCode.RenderingBubble();

    sb1.content = sb2.content = sb3.content = 'Je vais faire une phrase simple afin de démontrer que cela s affiche bien sans problème';
    sb4.content = 'a';  //minHeight, minWidth
    sb1.orientation = PocketCode.BubbleOrientation.TOPRIGHT;
    sb2.orientation = PocketCode.BubbleOrientation.TOPLEFT;
    sb3.orientation = PocketCode.BubbleOrientation.RIGHT;
    sb4.orientation = PocketCode.BubbleOrientation.LEFT;

    sb1._cacheCanvas.style.backgroundColor = sb3._cacheCanvas.style.backgroundColor = 'blue';
    sb2._cacheCanvas.style.backgroundColor = sb4._cacheCanvas.style.backgroundColor = 'red';
    //show caches
    document.body.appendChild(sb1._cacheCanvas);
    document.body.appendChild(sb2._cacheCanvas);
    document.body.appendChild(sb3._cacheCanvas);
    document.body.appendChild(sb4._cacheCanvas);

    //check draw on screen
    ctx.save();
    ctx.translate(200, 100);
    sb1.draw(ctx);
    ctx.restore();

    //break
    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(document.createElement('br'));

    //think
    var tb1 = new PocketCode.RenderingBubble(),
        tb2 = new PocketCode.RenderingBubble(),
        tb3 = new PocketCode.RenderingBubble(),
        tb4 = new PocketCode.RenderingBubble();

    tb1.type = PocketCode.Ui.BubbleType.THINK;
    tb2.type = PocketCode.Ui.BubbleType.THINK;
    tb3.type = PocketCode.Ui.BubbleType.THINK;
    tb4.type = PocketCode.Ui.BubbleType.THINK;

    tb1.content = tb2.content = tb3.content = 'Je vais faire une phrase simple afin de démontrer que cela s affiche bien sans problème';
    tb4.content = 'a';  //minHeight, minWidth
    tb1.orientation = PocketCode.BubbleOrientation.TOPRIGHT;
    tb2.orientation = PocketCode.BubbleOrientation.TOPLEFT;
    tb3.orientation = PocketCode.BubbleOrientation.RIGHT;
    tb4.orientation = PocketCode.BubbleOrientation.LEFT;

    tb1._cacheCanvas.style.backgroundColor = tb3._cacheCanvas.style.backgroundColor = 'blue';
    tb2._cacheCanvas.style.backgroundColor = tb4._cacheCanvas.style.backgroundColor = 'red';
    //show caches
    document.body.appendChild(tb1._cacheCanvas);
    document.body.appendChild(tb2._cacheCanvas);
    document.body.appendChild(tb3._cacheCanvas);
    document.body.appendChild(tb4._cacheCanvas);

    //draw on screen
    ctx.save();
    ctx.translate(200, 100);
    tb4.draw(ctx);
    ctx.restore();

};
