/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.merge({
    TabControl: (function () {
        TabControl.extends(SmartJs.Ui.ContainerControl, false);

        //cntr
        function TabControl(i18nKey) {
            SmartJs.Ui.ContainerControl.call(this, { className: 'pc-menuItem' });

        }

        TabControl.prototype.merge({
            /* override */
            appendChild: function (uiControl) {
                if (!(uiControl instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                SmartJs.Ui.ContainerControl.prototype.appendChild.call(this, uiControl);
            },
            insertAt: function (idx, uiControl) {
                if (!(uiControl instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                SmartJs.Ui.ContainerControl.prototype.insertAt.call(this, idx, uiControl);
            },
            insertBefore: function (newUiC, existingUiC) {
                if (!(newUiC instanceof PocketCode.Ui.TabPage) || !(existingUiC instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                SmartJs.Ui.ContainerControl.prototype.insertBefore.call(this, newUiC, existingUiC);
            },
            insertAfter: function (newUiC, existingUiC) {
                if (!(newUiC instanceof PocketCode.Ui.TabPage) || !(existingUiC instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                SmartJs.Ui.ContainerControl.prototype.insertAfter.call(this, newUiC, existingUiC);
            },
            replaceChild: function (newUiC, existingUiC) {
                if (!(newUiC instanceof PocketCode.Ui.TabPage) || !(existingUiC instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                SmartJs.Ui.ContainerControl.prototype.replaceChild.call(this, newUiC, existingUiC);
            },
            removeChild: function (uiControl) {
                if (!(uiControl instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab');
                SmartJs.Ui.ContainerControl.prototype.appendChild.call(this, uiControl);
            },
        });

        return TabControl;
    })(),

    TabPage: (function () {
        TabPage.extends(SmartJs.Ui.ContainerControl, false);

        //cntr
        function TabPage(i18nKey) {
            SmartJs.Ui.ContainerControl.call(this, { className: 'pc-menuItem' });

            //this._removeDomListener(this._dom, 'touchstart', this._btnListener);    //make sure events for scrolling get passed
            //this._addDomListener(this._dom, 'touchstart', function (e) { }, { stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
        }

        return TabPage;
    })(),

});
