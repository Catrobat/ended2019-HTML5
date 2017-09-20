'use strict';

PocketCode.Ui.CodePageView = (function () {
    CodePageView.extends(PocketCode.Ui.PageView);

    function CodePageView() {
        //PocketCode.Ui.PageView.call(this);  //even if we do not pass argument, ui is built in the constructor so we have to call the ctr to reinit
        //this._header.show();
        this._footer.hide();
        this.caption = 'this is a very long caption textthis is a very long caption textthis is a very long caption text';

        this._menu = new PocketCode.CodeView.Ui.Menu();
        this._header.appendChild(this._menu);

        //
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

        this._menu.navigationJson = scenes; //TODO
        this._menu._onNavigation.addEventListener(new SmartJs.Event.EventListener( function(e) {
            console.log(e.sceneId + ", " + e.spriteId);
        }));
    }

    //properties
    //Object.defineProperties(CodePageView.prototype, {
    //});

    //methods
    CodePageView.prototype.merge({
        /* override */
        verifyResize: function () {
            this._menu.verifyResize();  //menu is positioned absolute
            PocketCode.Ui.PageView.prototype.verifyResize.call(this);
        },
    });

    return CodePageView;
})();
