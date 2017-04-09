/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.Expander = (function () {
    Expander.extends(SmartJs.Ui.ContainerControl, false);

    function Expander(args) {
        SmartJs.Ui.ContainerControl.call(this, {className: 'pc-expander'});

        var testObject = [{
            sceneid: "sceneid1",
            name: "scene1",
            sprites: [{id: "spriteid1", name: "sprite1"}, {id: "spriteid2", name: "sprite2"}]
        },
            {
                sceneid: "sceneid2",
                name: "scene2",
                sprites: [{id: "spriteid3", name: "sprite3"}, {id: "spriteid4", name: "sprite4"}]
            }];

        var tree = PocketCode.Ui.ExpanderTree(testObject);
        this.appendChild(tree);

        //this._textNode = new PocketCode.Ui.I18nTextNode(i18nKey);
        //this._appendChild(this._textNode);

        //events
        this._onClick = new SmartJs.Event.Event(this);
        this._addDomListener(this._dom, 'click', this._clickHandler);
        this._btnListener = this._addDomListener(this._dom, 'touchstart', function (e) { }, { cancelBubble: true, stopPropagation: false, systemAllowed: true });
        //this._addDomListener(this._dom, 'touchend', this._clickHandler, { cancelBubble: true });//function (e) { this._dom.click(); });
    }

    //events
    Object.defineProperties(Expander.prototype, {
        onExpanderAction: {
            get: function () {
                return this._onExpanderAction;
            }
        },
        onOpen: {
            get: function () {
                return this._onOpen;
            }
        },
    });

    //methods
    /*
    Expander.prototype.merge({
        _openCloseHandler: function (e) {
            if (this._subMenu.hidden) {
                this._subMenu.show();
                this.verifyResize();
                this._menuButton.addClassName('pc-menuButtonOpened');
                this._onOpen.dispatchEvent();
            } else {
                this.close();
            }
        },
        close: function (e) {
            this._subMenu.hide();
            this._menuButton.removeClassName('pc-menuButtonOpened');
        },
        //overwrite
        verifyResize: function () {
            if (!this._subMenu) //called during constructor call
                return;
            var clientRect = this._subMenu.clientRect,
                parentHeight = this._parent ? this._parent.height : document.body.clientHeight;
            this._container.style.maxHeight = (parentHeight - clientRect.top - 10) + 'px';

            SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this);  //call super
            this._container.verifyResize();
        },
    });
*/

    return Expander;

})();


PocketCode.Ui.ExpanderTree = (function () {
    ExpanderTree.extends(PocketCode.Ui.Expander, false);

    function ExpanderTree(object) {
        //PocketCode.Ui.ExpanderTree.call(this, { className: 'pc-menu' });

        this.appendChild(new SmartJs.Ui.HtmlTag('div'));

        for (var scenes in object) {
            this._checkbox = new SmartJs.Ui.HtmlTag('checkbox');
            this.appendChild(this._checkbox);

            this._button = new PocketCode.Ui.Button(scenes.name);
            this.appendChild(this._button);

            this._container = new SmartJs.Ui.HtmlTag('section', {className: 'pc-menuItem'}); //TODO???
            this._checkbox._appendChild(this._container);

            for (var sprites in scenes.sprites) {
                this._subbutton = new PocketCode.Ui.Button(sprites.name);
                _container.appendChild(this._subbutton);
            }
        }
    }
    return ExpanderTree;
})();