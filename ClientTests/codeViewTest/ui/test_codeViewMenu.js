/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("/ui/codeViewMenu.js");


QUnit.test("CodeViewMenu", function (assert) {

    var view = new PocketCode.CodeView.Ui.Menu();
    assert.ok(view instanceof PocketCode.CodeView.Ui.Menu && view instanceof PocketCode.Ui.Menu, "instance check + inheritance");
    assert.ok(view.objClassName === "Menu", "objClassName check");
    assert.equal(view._exp._childs[0]._childs[0]._textNode._text, "Navigation", "Navigation added to expander" );

    //navigationJson

    //scene length > 1
    var scenes = [{
        id: "sceneid1",
        name: "scene1",
        sprites: [{ id: "spriteid1", name: "sprite1" }, { id: "spriteid2", name: "sprite2" }]
    },
        {
            id: "sceneid2",
            name: "scene2",
            sprites: [{ id: "spriteid3", name: "sprite3" }, { id: "spriteid4", name: "sprite4" }]
        }];

    view.navigationJson = scenes;

    assert.equal(view._exp._childs[1]._childs[0]._childs[0]._childs[1]._textNode._text, "scene1", "scene1 added to expander" );
    assert.equal(view._exp._childs[1]._childs[1]._childs[0]._childs[1]._textNode._text, "scene2", "scene2 added to expander" );

    assert.equal(view._exp._childs[1]._childs[0]._childs[1]._childs[0]._textNode._text, "sprite1", "sprite1 added to expander" );
    assert.equal(view._exp._childs[1]._childs[0]._childs[1]._childs[1]._textNode._text, "sprite2", "sprite2 added to expander" );

    assert.equal(view._exp._childs[1]._childs[1]._childs[1]._childs[0]._textNode._text, "sprite3", "sprite3 added to expander" );
    assert.equal(view._exp._childs[1]._childs[1]._childs[1]._childs[1]._textNode._text, "sprite4", "sprite4 added to expander" );

    //scene length == 1
    var scenes2 = [{
        id: "sceneid3",
        name: "scene3",
        sprites: [{ id: "spriteid5", name: "sprite5" }, { id: "spriteid6", name: "sprite6" }]
    }];

    view.navigationJson = scenes2;

    assert.equal(view._exp._childs[1]._childs[2]._textNode._text, "sprite5", "sprite5 added to expander" );
    assert.equal(view._exp._childs[1]._childs[3]._textNode._text, "sprite6", "sprite6 added to expander" );

    //scene length == 0
    var scenes3 = [];
    view.navigationJson = scenes3;
    assert.equal(view._exp._childs[1]._childs[4], undefined, "scene lenght == 0" );



    //TODO verifyResize
});