/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.Menu = (function () {
    Menu.extends(SmartJs.Ui.ContainerControl, false);

    //cntr
    function Menu(args) {
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-menu' });

        if (SmartJs.Device.isMobile)
            this.addClassName('pc-menuMobile');

        this._menuButton = new SmartJs.Ui.ContainerControl({ className: 'pc-menuButton' });
        this.appendChild(this._menuButton);

        var btnControl = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.MENU, undefined, false, true);
        //btnControl.style.margin = '2px'; //TODO
        btnControl.onClick.addEventListener(new SmartJs.Event.EventListener(this._openCloseHandler, this));
        this._menuButton.appendChild(btnControl);
        this._subMenu = new SmartJs.Ui.ContainerControl({ className: 'pc-subMenu' });
        this._subMenu.hide();   //default
        this._appendChild(this._subMenu);
        this._container = new PocketCode.Ui.ScrollContainer();
        this._subMenu.appendChild(this._container);

        //events
        this._onMenuAction = new SmartJs.Event.Event(this);
        this._onOpen = new SmartJs.Event.Event(this);

        PocketCode.I18nProvider.onDirectionChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._dom.dir = e.direction; }, this));
    }

    //events
    Object.defineProperties(Menu.prototype, {
        onMenuAction: {
            get: function () {
                return this._onMenuAction;
            }
        },
        onOpen: {
            get: function () {
                return this._onOpen;
            }
        },
    });

    //methods
    Menu.prototype.merge({
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
        /* override */
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

    return Menu;
})();

PocketCode.Ui.MenuSeparator = (function () {
    MenuSeparator.extends(SmartJs.Ui.Control, false);

    //cntr
    function MenuSeparator(args) {
        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-menuSeparator' });
        this._dom.appendChild(document.createElement('hr'));
    }

    return MenuSeparator;
})();

PocketCode.Ui.MenuItem = (function () {
    MenuItem.extends(PocketCode.Ui.Button, false);

    //cntr
    function MenuItem(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-menuItem' });

        this._removeDomListener(this._dom, 'touchstart', this._btnListener);    //make sure events for scrolling get passed
        this._addDomListener(this._dom, 'touchstart', function (e) { }, { stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
    }


    return MenuItem;
})();

/*

PocketCode.Ui.SubMenu = (function () {
    SubMenu.extends(SmartJs.Ui.ContainerControl, false);


    //cntr
    function SubMenu() {
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-topElement2' });

        this._subMenu = new SmartJs.Ui.ContainerControl({ className: 'pc-subMenu' });
        this._subMenu.show();   //default
        this._appendChild(this._subMenu);
        this._container = new PocketCode.Ui.ScrollContainer();
        this._subMenu.appendChild(this._container);

        //events
        this._onMenuAction = new SmartJs.Event.Event(this);
        this._onOpen = new SmartJs.Event.Event(this);
        /*

        this._states = {
            CLOSED: 'open',
            OPENED: 'closed'
        };



        // Object parameters
        this._state = this._states.CLOSED;
        this._content = null;
        this._minHeight = 200;


        var sb1 = new SmartJs.Ui.ContainerControl({ className: 'pc-subMenu' });

        var button7 = new PocketCode.Ui.MenuItem('hey');
        var button8 = new PocketCode.Ui.MenuItem('submenu');
        sb1.appendChild(button7);
        var section = new SmartJs.Ui.ContainerControl();
        section.appendChild(button8);
        sb1.appendChild(section);
        this._dom.appendChild(sb1._dom);
        //this._dom = test;

    }

    //methods
    SubMenu.prototype.merge({
        _openCloseHandler: function (e) {
            if (this._subMenu.hidden) {
                this._subMenu.show();
                this.verifyResize();
                //this._menuButton.addClassName('pc-menuButtonOpened');
                this._onOpen.dispatchEvent();
            } else {
                this.close();
            }
        },
        close: function (e) {
            this._subMenu.hide();
            //this._menuButton.removeClassName('pc-menuButtonOpened');
        },

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

    return SubMenu;
})();
*/