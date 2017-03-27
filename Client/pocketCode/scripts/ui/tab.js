/**
 * Created by alexandra on 27.03.17.
 */

//TODO tab - control bsp:
// https://www.webcomponents.org/element/PolymerElements/paper-tabs
// http://jsfiddle.net/syahrasi/Us8uc/
// https://os.alfajango.com/easytabs/#tabs1-css
/*
PocketCode.Ui.Tabs = (function () {
    Menu.extends(SmartJs.Ui.ContainerControl, false);

    //cntr
    function Menu(args) {
        SmartJs.Ui.ContainerControl.call(this, {className: 'pc-tabs'});
    }

    this._tab = new SmartJs.Ui.ContainerControl({ className: 'pc-tabButton' });
    this.appendChild(this._tab);

    var li = document.createElement('li');
    var a = document.createElement('a');
    var ul = document.createElement('ul');
    ul.appendChild(li);
    li.appendChild(a);

    this._dom.appendChild(document.createElement('ul'));


}
*/

PocketCode.Ui.TabControl = (function () {
    TabControl.extends(SmartJs.Ui.ContainerControl, false);

    //cntr
    /*
    function TabControl(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-menuItem' });

        this._removeDomListener(this._dom, 'touchstart', this._btnListener);    //make sure events for scrolling get passed
        this._addDomListener(this._dom, 'touchstart', function (e) { }, { stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
    }
*/

    return TabControl;
})();

PocketCode.Ui.TabPage = (function () {
    TabPage.extends(SmartJs.Ui.ContainerControl, false);
/*
    //cntr
    function TabPage(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-menuItem' });

        this._removeDomListener(this._dom, 'touchstart', this._btnListener);    //make sure events for scrolling get passed
        this._addDomListener(this._dom, 'touchstart', function (e) { }, { stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
    }
*/

    return TabPage;
})();