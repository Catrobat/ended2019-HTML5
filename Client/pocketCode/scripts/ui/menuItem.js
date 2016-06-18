/**
 * Created by Michael Pittner on 18.06.2016.
 */

PocketCode.Ui.MenuItem = (function () {
  MenuItem.extends(SmartJs.Ui.Control, false);

  //cntr
  function MenuItem(txt, args) {
    SmartJs.Ui.Control.call(this, 'menuItem', args);
    var element = document.createElement("DIV");
    element.className = "pc-menuItem";
    element.innerHTML = txt;
    this._dom = element;
  }

  return MenuItem;
})();