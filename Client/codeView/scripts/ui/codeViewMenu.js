/// <reference path='../../../smartJs/sj.js' />
/// <reference path='../../../smartJs/sj-core.js' />
/// <reference path='../../../smartJs/sj-ui.js' />
/// <reference path='../../../pocketCode/scripts/core.js' />
/// <reference path='../../../pocketCode/scripts/ui.js' />
/// <reference path='../../../pocketCode/scripts/ui/input.js' />
/// <reference path='../../../pocketCode/scripts/ui/menu.js' />
'use strict';


PocketCode.CodeView.Ui.merge({

    /*MenuCommand: {
        TERMS_OF_USE: 3,
        IMPRINT: 4,
        HELP: 5,
        GITHUB: 6,
        REPORT_ISSUE: 7,
    },*/

    Menu: (function () {
        Menu.extends(PocketCode.Ui.Menu, false);
        //cntr
        function Menu() {
            PocketCode.Ui.Menu.call(this);

            //this.addClassName('pc-menuMobile');
            //var item;

            this._exp = new PocketCode.Ui.Expander('menuNavigation');
            this.appendChild(this._exp);

            /* item = new PocketCode.Ui.I18nCheckbox('testing purpose');
             this.appendChild(item);
             item = new PocketCode.Ui.I18nCheckbox('menuTermsOfUse');
             this.appendChild(item);
             //item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.TERMS_OF_USE }); }, this));
 
             this._sep = new PocketCode.Ui.MenuSeparator();
             this.appendChild(this._sep);
 
             item = new PocketCode.Ui.MenuItem('menuHelp');
             this.appendChild(item);
             //item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.HELP }); }, this));
             item = new PocketCode.Ui.MenuItem('menuReportIssue');
             this.appendChild(item);
             item = new PocketCode.Ui.MenuItem('menuHelp');
             this.appendChild(item);
             //item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.HELP }); }, this));
             item = new PocketCode.Ui.MenuItem('menuReportIssue');
             this.appendChild(item);*/

            //    //item.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
            //    //    this.close();
            //    //    this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.FULLSCREEN, checked: e.checked });
            //    //}, this));
            //    //this.appendChild(new PocketCode.Ui.MenuSeparator());
            //}

            //this._languageRadioGroup = new PocketCode.Ui.RadioGroup();
            //this._languageRadioGroup.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(function (e) {
            //    this.close();
            //    this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.LANGUAGE_CHANGE, languageCode: e.value }, this);
            //}, this));

            //this._sep = new PocketCode.Ui.MenuSeparator();
            //this.appendChild(this._sep);
            //item = new PocketCode.Ui.MenuItem('menuTermsOfUse');
            //this.appendChild(item);
            //item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.TERMS_OF_USE }); }, this));
            //item = new PocketCode.Ui.MenuItem('menuImprint');
            //this.appendChild(item);
            //item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.IMPRINT }); }, this));
            //item = new PocketCode.Ui.MenuItem('menuHelp');
            //this.appendChild(item);
            //item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.HELP }); }, this));
            //item = new SmartJs.Ui.HtmlTag('button', { className: 'pc-menuItem' });
            //this._addDomListener(item.dom, 'touchstart', function (e) { }, { stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
            //this._addDomListener(item.dom, 'click', function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.GITHUB }); });
            //item.dom.innerHTML = '<svg aria-hidden="true" class="pc-githubIcon" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>&nbsp;&nbsp;GitHub&nbsp;&nbsp;';
            //this.appendChild(item);

            //var sep2 = new PocketCode.Ui.MenuSeparator();
            //this.appendChild(sep2);
            //item = new PocketCode.Ui.MenuItem('menuReportIssue');
            //this.appendChild(item);
            //item.onClick.addEventListener(new SmartJs.Event.EventListener(function () { this.close(); this._onMenuAction.dispatchEvent({ command: PocketCode.Player.MenuCommand.REPORT_ISSUE }); }, this));

            //PocketCode.I18nProvider.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(this._onLanguageChange, this));   //dispatched onLoad too
            //this._onLanguageChange({ language: PocketCode.I18nProvider.currentLanguage });   //mobile: menu may be created after loading languages

            //event
            this._onNavigation = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(Menu.prototype, {
            onNavigation: {
                get: function () {
                    return this._onNavigation;
                },
            },
        });

        //properties
        Object.defineProperties(Menu.prototype, {
            navigationJson: {
                set: function (scenes) {
                    var scene;
                    if (scenes.length > 1) {
                        for (var i = 0, l = scenes.length; i < l; i++) {
                            scene = scenes[i];
                            var expander = new PocketCode.Ui.ExpanderTree();
                            expander.caption.text = scene.name;
                            expander.onCaptionClick.addEventListener(new SmartJs.Event.EventListener(
                                function (e) {
                                    this._onNavigation.dispatchEvent(e);
                                }.bind(this, { sceneId: scene.id })
                            ));

                            var sprite;
                            for (var j = 0, k = scene.sprites.length; j < k; j++) {
                                sprite = scene.sprites[j];
                                var item = new PocketCode.Ui.MenuItem();
                                item.text = sprite.name;
                                item.onClick.addEventListener(new SmartJs.Event.EventListener(
                                    function (e) {
                                        this._onNavigation.dispatchEvent(e);
                                    }.bind(this, { sceneId: scene.id, spriteId: sprite.id })
                                ));
                                expander.appendChild(item);
                            }
                            this._exp.appendChild(expander);
                        }
                    }
                    else {
                        if (scenes.length == 0) {
                            return;
                        }
                        for (var j = 0, k = scenes[0].sprites.length; j < k; j++) {
                            scene = scenes[0];
                            sprite = scenes[0].sprites[j];
                            var item = new PocketCode.Ui.MenuItem();
                            item.text = sprite.name;
                            item.onClick.addEventListener(new SmartJs.Event.EventListener(
                                function (e) {
                                    this._onNavigation.dispatchEvent(e);
                                }.bind(this, { sceneId: scene.id, spriteId: sprite.id })
                            ));
                            this._exp.appendChild(item);
                        }
                    }
                }
            }
        });


        //methods
        Menu.prototype.merge({
            /* override */
            verifyResize: function () {
                if (!this._subMenu) //called during constructor call
                    return;
                var clientRect = this._subMenu.clientRect,
                    parentHeight = document.body.clientHeight;
                this._container.style.maxHeight = (parentHeight - clientRect.top - 10) + 'px';

                SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this);  //call super
                this._container.verifyResize();
            },
        });

        return Menu;
    })(),

});

