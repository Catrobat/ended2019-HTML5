/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("view/playerViewportView.js");


QUnit.test("PlayerViewportView", function (assert) {

    var view = new PocketCode.Ui.PlayerViewportView();
    assert.ok(view instanceof PocketCode.Ui.PlayerViewportView, 'instance check');
    assert.ok(view.axisVisible == false, 'axes hidden initially');
    assert.ok(view.onUserAction instanceof SmartJs.Event.Event, 'click event instance check');

    // ********************* events *********************
    assert.ok(view.onUserAction instanceof SmartJs.Event.Event, "onUserAction getter");

    // ********************* properties *********************

    //_mobileResizeLocked
    view._mobileResizeLocked = true;
    assert.ok(view.__resizeLocked == false, "__resizeLocked is false, isMobile = false");

    var currentIsMobile = SmartJs.Device.isMobile;
    SmartJs.Device.isMobile = true;
    assert.throws(function () { view._mobileResizeLocked = "a"; }, Error, "wrong arguments for _mobileResizeLocked");

    view._mobileResizeLocked = true;
    assert.ok(view.__resizeLocked == true, "__resizeLocked is true");
    assert.ok(view._canvas.style.width == view._canvas.width + "px", "canvas width set");
    assert.ok(view._canvas.style.height == view._canvas.height + "px", "canvas height set");
    assert.ok(SmartJs.Ui.Window.onResize._listeners.length == 1, "add onResize EventListener");

    view._mobileResizeLocked = true;
    assert.ok(SmartJs.Ui.Window.onResize._listeners.length == 1, "_mobileResizeLocked nothing changed");

    view._mobileResizeLocked = false;
    assert.ok(view.style.width == "100%", "PlayerViewportView width set to 100%");
    assert.ok(view.style.height == "100%", "PlayerViewportView height set to 100%");
    assert.ok(SmartJs.Ui.Window.onResize._listeners.length == 0, "remove onResize EventListener");

    SmartJs.Device.isMobile = currentIsMobile;

    //axisVisible
    var axisVisible = view.axisVisible;
    assert.ok(axisVisible == view._axesVisible, "axisVisible getter");
    view._axesVisible = true;
    axisVisible = view.axisVisible;
    assert.ok(axisVisible == view._axesVisible, "axisVisible setter");

    //renderingSprites
    var renderingSprite = new PocketCode.RenderingSprite({ id: "sprite1" });
    var sprites = [renderingSprite];
    view.renderingSprites = sprites;
    assert.ok(view._canvas._renderingSprites[0] == renderingSprite, "renderingSprite setter");

    //renderingTexts
    var renderingText = new PocketCode.RenderingText({ id: "rt_id", text: "TEXT", visible: true, x: 0, y: 0 });
    var texts = [renderingText];
    view.renderingTexts = texts;
    assert.ok(view._canvas._renderingTexts[0] == renderingText, "renderingText setter");

    // ********************* methods *********************

    //_windowOrientationChangeHandler
    var param = { width: 370.7 };
    view._windowOrientationChangeHandler(param);
    assert.ok(view._canvas.style.left == "35px", "_windowOrientationChangeHandler");

    //_updateCanvasSize
    view._updateCanvasSize();
    assert.ok(view._canvas.height == 150 && view._canvas.width == 300 && view._canvas._scalingX == 1 && view._canvas._scalingY == 1,
        "canvas height, width and scaling not changed (witdh and heigt == 0)");

    view.__resizeLocked = true;
    view._updateCanvasSize();
    assert.ok(view._canvas.height == 150 && view._canvas.width == 300 && view._canvas._scalingX == 1 && view._canvas._scalingY == 1,
        "canvas height, width and scaling not changed (__resizeLocked == true;)");
    view.__resizeLocked = false;

    //setOriginalViewportSize
    view.setOriginalViewportSize(80, 70);
    assert.ok(view._originalHeight == 70 && view._originalWidth == 80, "change originalViewportSize");

    //showAskDialog
    view.showAskDialog("question1");
    assert.ok(view._activeAskDialog._captionTextNode._text == "question1" && view._childs[1] instanceof PocketCode.Ui.AskDialog &&
        view._activeAskDialog._onSubmit._listeners.length == 1, "showAskDialog")
    view.hideAskDialog();
    assert.equal(view._activeAskDialog, undefined, "hide ask dialog: removed");
    
    //initScene
    var gameEngine = new PocketCode.GameEngine();
    var scene = new PocketCode.Model.Scene(gameEngine, undefined, []);
    scene._id = "scene1";

    var args = {};
    var clear = 0;
    var mockCanvas = {
        initScene: function (id, screenSize) {
            args = { id: id, width: screenSize.width, height: screenSize.height };
        },
        drawStamp: function (spriteId) {
            args = { spriteId: spriteId };
        },
        movePen: function (spriteId, toX, toY) {
            args = { spriteId: spriteId, x: toX, y: toY };
        },
        clearCurrentPenStampCache: function () {
            clear++;
        },
        clearPenStampCache: function () {
            clear++;
        },
        render: function () {

        },
    };
    var tempCanvas = view._canvas;
    view._canvas = mockCanvas;

    view.initScene("scene1", { width: 400, height: 300 }, true);
    assert.ok(args.id == "scene1" && args.width == 400 && args.height == 300, "initScene, id and screenSize set");

    view.drawStamp("id1");
    assert.ok(args.spriteId == "id1", "drawStamp");

    view.movePen("id2", 5, 6);
    assert.ok(args.spriteId == "id2" && args.x == 5 && args.y == 6, "movePen");

    view.clearCurrentPenStampCache();
    assert.ok(clear == 2, "clearCurrentPenStampCache");

    view.showAskDialog("question1");
    view.clear();
    assert.ok(clear == 3, "clear");
    assert.ok(view._activeAskDialog == undefined, "clear: askdialog disposed")

    view._canvas = tempCanvas;

    //updateCameraUse
    var cameraStream = { width: 40, height: 30 };
    view.updateCameraUse(false, cameraStream);
    assert.ok(view._canvas._cameraStream == cameraStream, "updateCameraUse");

    //showAxes //drawAxes
    view._axesVisible = false;
    var dataUrl = view._canvas._upperCanvasEl.toDataURL('image/png');
    view.showAxes();
    assert.ok(view._axesVisible == true, "showAxes");
    assert.notEqual(dataUrl, view._canvas._upperCanvasEl.toDataURL('image/png'), "drawAxes");
    view.showAxes();
    assert.ok(view._axesVisible == true, "showAxes 2");

    //hideAxes //clearAxes
    dataUrl = view._canvas._upperCanvasEl.toDataURL('image/png');
    view.hideAxes();
    assert.ok(view._axesVisible == false, "hideAxes");
    assert.notEqual(dataUrl, view._canvas._upperCanvasEl.toDataURL('image/png'), "clearAxes");
    view.hideAxes();
    assert.ok(view._axesVisible == false, "hideAxes 2");

    //getCanvasDataURL
    view._canvas.toDataURL = function () {
        return "dataUrl";
    };
    dataUrl = view.getCanvasDataURL();
    assert.ok(dataUrl == "dataUrl", "getCanvasDataURL");

    //dispose
    view.dispose();
    assert.ok(view._onResize._disposed == true && view._disposed == true, "disposed");
});



