/// <reference path="../../Client/pocketCode/libs/smartJs/sj.custom.min.js" />
/// <reference path="brickSvg.js" />

window.onload = function () {

    var defaultCont = document.getElementById('default'),
        defaultEndCont = document.getElementById('defaultEnd'),
        loopIfElseCont = document.getElementById('loopIfElse'),
        loopEndCont = document.getElementById('loopEnd'),
        ifThenElseCont = document.getElementById('ifThenElse'),
        eventCont = document.getElementById('event');

    var defaultSvg = new PocketCode.Ui.BrickSvg(),
        defaultEndSvg = new PocketCode.Ui.BrickSvg(),
        loopIfElseSvg = new PocketCode.Ui.BrickSvg(),
        loopEndSvg = new PocketCode.Ui.BrickSvg(),
        ifThenElseSvg = new PocketCode.Ui.BrickSvg(),
        eventSvg = new PocketCode.Ui.BrickSvg();

    defaultCont.appendChild(defaultSvg._dom);
    defaultEndCont.appendChild(defaultEndSvg._dom);
    loopIfElseCont.appendChild(loopIfElseSvg._dom);
    loopEndCont.appendChild(loopEndSvg._dom);
    ifThenElseCont.appendChild(ifThenElseSvg._dom);
    eventCont.appendChild(eventSvg._dom);

    defaultSvg.draw(PocketCode.BrickType.DEFAULT, 300, 40, 1, false);
    defaultEndSvg.draw(PocketCode.BrickType.DEFAULT, 290, 50, 1, false, true);
    loopIfElseSvg.draw(PocketCode.BrickType.LOOP, 270, [50, 40, 50], 1, false);
    loopIfElseSvg.draw(PocketCode.BrickType.LOOP, 270, [50, 40, 30], 1, false); //called twice to check dispose
    loopEndSvg.draw(PocketCode.BrickType.LOOP, 300, [50, 20, 50], 1, false, true);
    ifThenElseSvg.draw(PocketCode.BrickType.IF_THEN_ELSE, 400, [50, 30, 50, 30, 40], 1, false);
    eventSvg.draw(PocketCode.BrickType.EVENT, 320, 100, 1, false);
};