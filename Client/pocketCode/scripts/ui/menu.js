/**
 * Created by Michael Pittner on 17.06.2016.
 */
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
    SmartJs.Ui.ContainerControl.call(this, { className: 'pc-topElement' });

    this._states = {
      CLOSED: 'open',
      OPEN: 'closed'
    };



    // Object parameters
    this._state = this._states.OPEN;
    this._content = null;
    this._minHeight = 200;

    var img_tag = document.createElement("IMG");
    img_tag.setAttribute("src", "/HTML5/Client/pocketCode/img/menue.png");
    img_tag.setAttribute("width", "40");
    img_tag.setAttribute("width", "40");
    img_tag.setAttribute("alt", "Menu");


    var menuAlign = document.createElement( "DIV" );
    menuAlign.className = "pc-menuAlign";

    var mainMenu = document.createElement( "DIV" );
    mainMenu.className = "pc-mainMenu";
    var menuContainer = document.createElement( "DIV" );
    menuContainer.className = "pc-menuContainer";
    var menu = document.createElement( "DIV" );
    menu.className = "pc-menu";
    this._menuTitle = document.createElement( "DIV" );
    this._menuTitle.className = "pc-menuTitle";
    this._menuTitle.appendChild( img_tag );
    this._menuLabel = img_tag;
    var submenu = document.createElement( "DIV" );
    submenu.className = "pc-submenu";
    var scrollContainer = document.createElement( "DIV" );
    scrollContainer.className = "pc-scrollContainer";

    this._content = document.createElement( "DIV" );
    this._content.style = "padding:0";

    this._container = new PocketCode.Ui.ScrollContainer({ style: 'padding:0' });

    this._container.style.maxHeight = 1000;

    scrollContainer.appendChild( this._container._dom );
    submenu.appendChild( scrollContainer );
    menu.appendChild( this._menuTitle );
    menu.appendChild( submenu );
    menuContainer.appendChild( menu );
    mainMenu.appendChild( menuContainer );
    menuAlign.appendChild( mainMenu );
    this._dom.appendChild( menuAlign );

    //events
    this._onClick = new SmartJs.Event.Event(this);
    this._addDomListener(this._menuTitle, 'click', this._clickHandler);
    this._addDomListener(this._menuTitle, 'touchstart', function (e) { }, { cancelBubble: true, stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
    this._onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
  }

  //properties
  Object.defineProperties(Menu.prototype, {
    disabled: {
      get: function () {
        return this._dom.disabled;
      },
      set: function (value) {
        this._dom.disabled = value;
      }
    }
  });

  //events
  Object.defineProperties(Menu.prototype, {
    onClick: {
      get: function () {
        return this._onClick;
      }
    }
  });

  //methods
  Menu.prototype.merge({
    _clickHandler: function (e) {
      if( this._state == this._states.CLOSED ) {
        this._open();
      } else {
        this._close();
      }
      this._dom.blur();
      this._onClick.dispatchEvent();
    },
    _open: function(e) {
      this._container._dom.style = "display:block;padding:0;";
      this._state = this._states.OPEN;
      this._onResize.dispatchEvent();
    },
    _close: function(e) {
      this._container._dom.style = "display:none";
      this._state = this._states.CLOSED;
      this._onResize.dispatchEvent();
    },
    addElement: function(element) {
      console.log( element );
      this._container.appendChild( element );
    },
    _resizeHandler: function (e) {
      var availableHeight = document.documentElement.clientHeight - 65;
      var minHeight = this._minHeight - (this._menuLabel.height);

      if (availableHeight > minHeight)
        this._container.style.maxHeight = availableHeight + 'px';
      else
        this._container.style.maxHeight = minHeight + 'px';
      }
  });

  return Menu;
})();

PocketCode.Ui.MenuSeparator = (function () {
  MenuSeparator.extends(SmartJs.Ui.Control, false);

  //cntr
  function MenuSeparator(args) {
    SmartJs.Ui.Control.call(this, 'div', { className: 'pc-menuItemSep' });
    this._dom.appendChild(document.createElement("hr"));
  }

  return MenuSeparator;
})();

PocketCode.Ui.MenuItem = (function () {
  MenuItem.extends(PocketCode.Ui.Button, false);

  //cntr
  function MenuItem(i18nKey) {
    PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-menuItem' });
  }

  return MenuItem;
})();