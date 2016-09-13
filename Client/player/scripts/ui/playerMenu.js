/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../pocketCode/scripts/core.js" />
/// <reference path="../../../pocketCode/scripts/ui.js" />
/// <reference path="../../../pocketCode/scripts/ui/input.js" />
/// <reference path="../../../pocketCode/scripts/ui/menu.js" />
'use strict';

PocketCode.Player.merge({

    MenuCommand: {
        FULLSCREEN: 1,
        LANGUAGE_CHANGE: 2,
        TERMS_OF_USE: 3,
        IMPRINT: 4,
        HELP: 5,
    },

    Ui: {
        Menu: (function () {
            Menu.extends(PocketCode.Ui.Menu, false);

            //cntr
            function Menu(args) {
                PocketCode.Ui.Menu.call(this);

                var item;
                if (SmartJs.Device.isMobile) {
                    this.hide();
                    item = new PocketCode.Ui.I18nCheckbox("menuFullscreen");
                    this.appendChild(item);
                    item.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                        this.close();
                        this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.FULLSCREEN, checked: e.checked });
                    }, this));
                    this.appendChild(new PocketCode.Ui.MenuSeparator());
                }

                this._languageRadioGroup = new PocketCode.Ui.RadioGroup();
                this._languageRadioGroup.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
                    this.close();
                    this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.LANGUAGE_CHANGE, languageCode: e.value }, this);
                }, this));

                this._sep = new PocketCode.Ui.MenuSeparator();
                this.appendChild(this._sep);
                item = new PocketCode.Ui.MenuItem("menuTermsOfUse");
                this.appendChild(item);
                item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.TERMS_OF_USE }); }, this));
                item = new PocketCode.Ui.MenuItem("menuImpressum");
                this.appendChild(item);
                item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.IMPRINT }); }, this));
                item = new PocketCode.Ui.MenuItem("menuHelp");
                this.appendChild(item);
                item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.HELP }); }, this));

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
                            this.insertBefore(radio, this._sep);
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
    },
});

