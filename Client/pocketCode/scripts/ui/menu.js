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
    SmartJs.Ui.Control.call(this, 'DIV', { className: 'pc-topElement' });

    this._states = {
      CLOSED: 'open',
      OPEN: 'closed'
    };



    // Object parameters
    this._state = this._states.OPEN;
    this._content = null;


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
    var menuTitle = document.createElement( "DIV" );
    menuTitle.className = "pc-menuTitle";
    menuTitle.appendChild( img_tag );
    this._menuLabel = img_tag;
    var submenu = document.createElement( "DIV" );
    submenu.className = "pc-submenu";
    var scrollContainer = document.createElement( "DIV" );
    scrollContainer.className = "pc-scrollContainer";

    this._content = document.createElement( "DIV" );
    this._content.style = "padding:0";


    scrollContainer.appendChild( this._content );
    submenu.appendChild( scrollContainer );
    menu.appendChild( menuTitle );
    menu.appendChild( submenu );
    menuContainer.appendChild( menu );
    mainMenu.appendChild( menuContainer );
    menuAlign.appendChild( mainMenu );
    this._dom.appendChild( menuAlign );



    //events
    this._onClick = new SmartJs.Event.Event(this);
    this._addDomListener(this._menuLabel, 'click', this._clickHandler);
    this._addDomListener(this._menuLabel, 'touchstart', function (e) { }, { cancelBubble: true, stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
    //this._addDomListener(this._dom, 'touchend', this._clickHandler, { cancelBubble: true });//function (e) { this._dom.click(); });
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
      this._content.style = "display:block;padding:0;";
      this._state = this._states.OPEN;
    },
    _close: function(e) {
      this._content.style = "display:none";
      this._state = this._states.CLOSED;
    },
    addElement: function(element) {
      this._content.appendChild( element._dom );
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