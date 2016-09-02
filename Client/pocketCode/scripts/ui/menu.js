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
    this._minHeight = 200;
    this._dom.disabled = false;


    //var img_tag = new SmartJs.Ui.Image({ style: { width: '100%' } });
    var img_tag = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.MENU, null, false, true);
    img_tag.className += ' pc-menuSymbol';

    var topContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-menuAlign' });
    var wholeMenuContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-mainMenu' });
    var innerMenuContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-menuContainer' });
    var titleAndContentContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-menu' });
    this._menuTitle = new SmartJs.Ui.ContainerControl({ className: 'pc-menuTitle' });
    this._menuTitle.appendChild( img_tag );
    this._menuLabel = img_tag;
    var contentContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-submenu' });
    var scrollContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-scrollContainer' });
    this._container = new PocketCode.Ui.ScrollContainer();
    this._container.style.padding = 0;

    scrollContainer.appendChild( this._container );
    contentContainer.appendChild( scrollContainer );
    titleAndContentContainer.appendChild( this._menuTitle );
    titleAndContentContainer.appendChild( contentContainer );
    innerMenuContainer.appendChild( titleAndContentContainer );
    wholeMenuContainer.appendChild( innerMenuContainer );
    topContainer.appendChild( wholeMenuContainer );
    this._appendChild( topContainer );

    //events
    this._onClick = new SmartJs.Event.Event(this);
    //this._menuTitle._dom.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._clickHandler.dispatchEvent(); }, this));

    this._addDomListener(this._menuTitle._dom, 'click', this._clickHandler);
    this._addDomListener(this._menuTitle._dom, 'touchstart', function (e) { }, { cancelBubble: true, stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
    this._onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
    //window.addEventListener('resize', alert());
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
      this._container.style.display = 'block';
      this._state = this._states.OPEN;
      this._onResize.dispatchEvent();
    },
    _close: function(e) {
      this._container.style.display = 'none';
      this._state = this._states.CLOSED;
      this._onResize.dispatchEvent();
    },
    addElement: function(element) {
      console.log( "add element" );
      this._container.appendChild( element )
      console.log( this._container );
      this._container.onResize.dispatchEvent();
    },
    _resizeHandler: function (e) {
      console.log('resize...');
      //console.log( this._menuLabel.height );
      var availableHeight = document.documentElement.clientHeight - this._menuLabel.height - 20;
      var minHeight = this._minHeight - (this._menuLabel.height);

      //console.log(availableHeight);
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
    this._dom.appendChild(document.createElement('hr'));
  }

  return MenuSeparator;
})();

PocketCode.Ui.MenuItem = (function () {
  MenuItem.extends(PocketCode.Ui.Button, false);

  //cntr
  function MenuItem(i18nKey) {
    PocketCode.Ui.Button.call(this, i18nKey, {className: 'pc-menuItem'});
  }


  return MenuItem;
})();

PocketCode.Ui.SubMenu = (function () {
  SubMenu.extends(SmartJs.Ui.ContainerControl, false);


  //cntr
  function SubMenu() {
    SmartJs.Ui.ContainerControl.call(this, { className: 'pc-topElement2' });

    this._states = {
      CLOSED: 'open',
      OPEN: 'closed'
    };



    // Object parameters
    this._state = this._states.OPEN;
    this._content = null;
    this._minHeight = 200;


    var sb1 = new SmartJs.Ui.ContainerControl({ className: 'pc-submenu' });

    var button7 = new PocketCode.Ui.MenuItem('hey');
    var button8 = new PocketCode.Ui.MenuItem('submenu');
    sb1.appendChild( button7 );
    var section = new SmartJs.Ui.ContainerControl();
    section.appendChild( button8 );
    sb1.appendChild( section );
    this._dom.appendChild( sb1._dom );
    //this._dom = test;

  }

  return SubMenu;
})();