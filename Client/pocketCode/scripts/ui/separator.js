/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.Separator = (function () {
    Separator.extends(SmartJs.Ui.Control, false);

    //cntr
    function Separator(args) {
      SmartJs.Ui.Control.call(this, 'separator', args);
      var element = document.createElement("LI");
      element.className = "pc-menuItemSep";
      var separator = document.createElement("HR");
      element.appendChild( separator );
      this._dom = element;
    }

    return Separator;
})();

