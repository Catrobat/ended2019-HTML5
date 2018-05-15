/// <reference path='../../../smartJs/sj.js' />
/// <reference path='../../../smartJs/sj-core.js' />
/// <reference path='../../../smartJs/sj-ui.js' />
/// <reference path='../../../pocketCode/scripts/core.js' />
/// <reference path='../../../pocketCode/scripts/ui.js' />
/// <reference path='../../../pocketCode/scripts/ui/input.js' />
/// <reference path='../../../pocketCode/scripts/ui/menu.js' />
'use strict';

PocketCode.Player.MenuCommand = {
    FULLSCREEN: 1,
    LANGUAGE_CHANGE: 2,
    TERMS_OF_USE: 3,
    IMPRINT: 4,
    HELP: 5,
    GITHUB: 6,
    REPORT_ISSUE: 7,
};

PocketCode.Player.Ui.merge({

    Menu: (function () {
        Menu.extends(PocketCode.Ui.Menu, false);

        //cntr
        function Menu(args) {
            PocketCode.Ui.Menu.call(this);

            var item;
            if (SmartJs.Device.isMobile) {
                this.hide();
                //temporarely disabled
                //item = new PocketCode.Ui.I18nCheckbox('menuFitToScreen');
                //this.appendChild(item);
                //item.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                //    this.close();
                //    this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.FULLSCREEN, checked: e.checked });
                //}, this));
                //this.appendChild(new PocketCode.Ui.MenuSeparator());
            }

            this._languageGroup = new PocketCode.Ui.Expander('lbLanguage');
            this._languageGroup.open();
            this.appendChild(this._languageGroup);
            this._languageRadioGroup = new PocketCode.Ui.RadioGroup();
            this._languageRadioGroup.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                this.close();
                this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.LANGUAGE_CHANGE, languageCode: e.value }, this);
            }, this));

            var sep = new PocketCode.Ui.MenuSeparator();
            this.appendChild(sep);
            item = new PocketCode.Ui.MenuItem('menuTermsOfUse');
            this.appendChild(item);
            item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.TERMS_OF_USE }); }, this));
            item = new PocketCode.Ui.MenuItem('menuImprint');
            this.appendChild(item);
            item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.IMPRINT }); }, this));
            item = new PocketCode.Ui.MenuItem('menuHelp');
            this.appendChild(item);
            item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.HELP }); }, this));
            item = new SmartJs.Ui.HtmlTag('button', { className: 'pc-menuItem' });
            this._addDomListener(item.dom, 'touchstart', function (e) { }, { stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
            this._addDomListener(item.dom, 'click', function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.GITHUB }); });
            item.dom.innerHTML = '<svg aria-hidden="true" class="pc-githubIcon" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>&nbsp;&nbsp;GitHub&nbsp;&nbsp;';
            this.appendChild(item);

            sep = new PocketCode.Ui.MenuSeparator();
            this.appendChild(sep);
            item = new PocketCode.Ui.MenuItem('menuReportIssue');
            this.appendChild(item);
            item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.REPORT_ISSUE }); }, this));

            PocketCode.I18nProvider.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(this._onLanguageChange, this));   //dispatched onLoad too
            this._onLanguageChange({ language: PocketCode.I18nProvider.currentLanguage });   //mobile: menu may be created after loading languages
        }

        //methods
        Menu.prototype.merge({
            _onLanguageChange: function (e) {
                var currentLang = e.language,
                    radios = this._languageRadioGroup.radios;

                if (radios.length == 0) {  //ui buttons not created
                    var langs = PocketCode.I18nProvider.supportedLanguages,
                        lang,
                        radio;

                    for (var i = 0, l = langs.length; i < l; i++) {
                        lang = langs[i];
                        radio = new PocketCode.Ui.Radio(lang.uiString, lang.languageCode);
                        this._languageGroup.appendChild(radio);
                        this._languageRadioGroup.add(radio);
                    }
                }

                for (var i = 0, l = radios.length; i < l; i++)
                    if (radios[i].value == currentLang) {
                        radios[i].checked = true;
                        break;
                    }
            },
            addToDom: function (domElement) {
                if (!domElement || !(domElement instanceof HTMLElement))
                    throw new Error('invalid argument: dom element');
                domElement.appendChild(this._dom);
            },
        });

        return Menu;
    })(),

});
