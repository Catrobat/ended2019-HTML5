/// <reference path="../../Client/pocketCode/libs/smartJs/sj.custom.min.js" />
/// <reference path="brickSvg.js" />

window.onload = function () {

    var defaultCont = document.getElementById('default'),
        defaultEndCont = document.getElementById('defaultEnd'),
        loopIfElseCont = document.getElementById('loopIfElse'),
        loopEndCont = document.getElementById('loopEnd'),
        ifThenElseCont = document.getElementById('ifThenElse');

    var defaultSvg = new PocketCode.Ui.BrickSvg(),
        defaultEndSvg = new PocketCode.Ui.BrickSvg(),
        loopIfElseSvg = new PocketCode.Ui.BrickSvg(),
        loopEndSvg = new PocketCode.Ui.BrickSvg(),
        ifThenElseSvg = new PocketCode.Ui.BrickSvg();

    defaultCont.appendChild(defaultSvg._dom);
    defaultEndCont.appendChild(defaultEndSvg._dom);
    loopIfElseCont.appendChild(loopIfElseSvg._dom);
    loopEndCont.appendChild(loopEndSvg._dom);
    ifThenElseCont.appendChild(ifThenElseSvg._dom);

    defaultSvg.draw(PocketCode.BrickType.DEFAULT, 300, 60, 1, false);
    defaultEndSvg.draw(PocketCode.BrickType.DEFAULT, 300, 60, 1, false, true);
    loopIfElseSvg.draw(PocketCode.BrickType.LOOP, 300, [100, 100, 100], 1, false);
    loopEndSvg.draw(PocketCode.BrickType.LOOP, 300, [100, 100, 100], 1, false, true);
    ifThenElseSvg.draw(PocketCode.BrickType.IF_THEN_ELSE, 400, [100,100,100,100,100], 1, false);

};