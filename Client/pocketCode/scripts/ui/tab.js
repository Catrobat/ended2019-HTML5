/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.merge({
    TabControl: (function () {  //caption, showCaption, addTabs[], removeTab, activeTab: get/set id
        TabControl.extends(SmartJs.Ui.ContainerControl, false);

        //cntr
        function TabControl(i18nKey, args) {
            SmartJs.Ui.ContainerControl.call(this, args);

            this._textNode = new PocketCode.Ui.I18nTextNode(i18nKey);
            this._appendChild(this._textNode);

            //events
            this._onClick = new SmartJs.Event.Event(this);
            this._addDomListener(this._dom, 'click', this._clickHandler);
            this._btnListener = this._addDomListener(this._dom, 'touchstart', function (e) { }, { cancelBubble: true, stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on TabControls
            //this._addDomListener(this._dom, 'touchend', this._clickHandler, { cancelBubble: true });//function (e) { this._dom.click(); });
        }

        ////events
        //Object.defineProperties(TabControl.prototype, {
        //    onClick: {
        //        get: function () {
        //            return this._onClick;
        //        },
        //    },
        //});

        //properties
        Object.defineProperties(TabControl.prototype, {
            text: {
                get: function () {
                    return this._textNode.text;
                },
                //set: function (value) {
                //    this._textNode.text = value;
                //},
            },
            i18nKey: {
                set: function (i18n) {
                    this._textNode.i18n = i18n;
                },
            },
            disabled: {
                get: function () {
                    return this._dom.disabled;
                },
                set: function (value) {
                    this._dom.disabled = value;
                },
            },
        });

        //methods
        TabControl.prototype.merge({
            _clickHandler: function (e) {
                this._dom.blur();
                this._onClick.dispatchEvent();
            },
            /* override */
            appendChild: function (tabPage) {
                if (!(tabPage instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                return SmartJs.Ui.ContainerControl.prototype.appendChild.call(tabPage);
            },
            insertAt: function (idx, tabPage) {
                if (!(tabPage instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                return SmartJs.Ui.ContainerControl.prototype.insertAt.call(idx, tabPage);
            },
            insertBefore: function (newTabPage, existingTabPage) {
                if (!(newTabPage instanceof PocketCode.Ui.TabPage) || !(existingTabPage instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                return SmartJs.Ui.ContainerControl.prototype.insertBefore.call(newTabPage, existingTabPage);
            },
            insertAfter: function (newTabPage, existingTabPage) {
                if (!(newTabPage instanceof PocketCode.Ui.TabPage) || !(existingTabPage instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                return SmartJs.Ui.ContainerControl.prototype.insertAfter.call(newTabPage, existingTabPage);
            },
            replaceChild: function (newTabPage, existingTabPage) {
                if (!(newTabPage instanceof PocketCode.Ui.TabPage) || !(existingTabPage instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                return SmartJs.Ui.ContainerControl.prototype.replaceChild.call(newTabPage, existingTabPage);
            },
            removeChild: function (tabPage) {
                if (!(tabPage instanceof PocketCode.Ui.TabPage))
                    throw new Error('invalid argument: tab page');
                return SmartJs.Ui.ContainerControl.prototype.removeChild.call(tabPage);
            },
        });

        return TabControl;
    })(),

    TabPage: (function () { //id, caption, body
        TabPage.extends(SmartJs.Ui.ContainerControl, false);

        //cntr
        function TabPage(i18nKey, args) {
            SmartJs.Ui.ContainerControl.call(this, args);

            this._textNode = new PocketCode.Ui.I18nTextNode(i18nKey);
            this._appendChild(this._textNode);

            //events
            this._onClick = new SmartJs.Event.Event(this);
            this._addDomListener(this._dom, 'click', this._clickHandler);
            this._btnListener = this._addDomListener(this._dom, 'touchstart', function (e) { }, { cancelBubble: true, stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on TabPages
            //this._addDomListener(this._dom, 'touchend', this._clickHandler, { cancelBubble: true });//function (e) { this._dom.click(); });
        }

        //events
        Object.defineProperties(TabPage.prototype, {
            onClick: {
                get: function () {
                    return this._onClick;
                },
            },
        });

        //properties
        Object.defineProperties(TabPage.prototype, {
            text: {
                get: function () {
                    return this._textNode.text;
                },
                //set: function (value) {
                //    this._textNode.text = value;
                //},
            },
            i18nKey: {
                set: function (i18n) {
                    this._textNode.i18n = i18n;
                },
            },
            disabled: {
                get: function () {
                    return this._dom.disabled;
                },
                set: function (value) {
                    this._dom.disabled = value;
                },
            },
        });

        //methods
        TabPage.prototype.merge({
            _clickHandler: function (e) {
                this._dom.blur();
                this._onClick.dispatchEvent();
            },
        });

        return TabPage;
    })(),
});
