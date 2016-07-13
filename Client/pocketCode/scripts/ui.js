/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../smartJs/sj-core.js" />
/// <reference path="../../smartJs/sj-ui.js" />
'use strict';

/**
 * PocketCode User Interface Namespace
 * @namespace PocketCode.Ui
 */
PocketCode.Ui = {
    _svgs: {
        tagStart: '<svg preserveAspectRatio="xMidYMin meet" viewBox="0,0,64,64">',
        tagEnd: '</svg>',
        circle: '<path d="M32,1C14.88,1,1,14.88,1,31.999C1,49.12,14.88,63,32,63s31-13.88,31-31.001C63,14.88,49.12,1,32,1zM32,56.979c-13.796,0-24.98-11.184-24.98-24.98c0-13.795,11.185-24.98,24.98-24.98s24.979,11.186,24.979,24.98C56.979,45.796,45.796,56.979,32,56.979z"/>',
    },
    Direction: {
        LTR: 'ltr',
        RTL: 'rtl',
    },
    PageNavigation: {
        FORWARD: 0,
        BACKWARD: 1,
    },
};

PocketCode.Ui.merge({

    //svg icons
    SvgImageString: {

        PLAY: function () {
            var svgs = PocketCode.Ui._svgs;
            var icon = '<polygon points="34.662,32 22.934,44.066 27.438,48.55 43.629,32 27.438,15.45 22.934,19.934"/>';
            return svgs.tagStart + svgs.circle + icon + svgs.tagEnd;
        }(),
        PAUSE: function () {
            var svgs = PocketCode.Ui._svgs;
            var icon = '<path id="pause-3-icon" d="M29.95,45.617h-7.932V18.384h7.932V45.617z M42.949,45.617h-7.934V18.384h7.934V45.617z" />';
            return svgs.tagStart + svgs.circle + icon + svgs.tagEnd;
        }(),
        RESTART: function () {
            var svgs = PocketCode.Ui._svgs;
            var icon = '<path d="M42.275,22.056l-3.266,3.267c-1.772-1.773-4.222-2.87-6.927-2.87c-5.41,0-9.796,4.389-9.796,9.8c0,0.001,0-0.002,0,0h3.806l-6.079,6.075l-6.072-6.075h3.726c0-0.001,0,0,0,0c0-7.961,6.454-14.417,14.415-14.417C36.063,17.835,39.666,19.448,42.275,22.056z"/>';
            var icon2 = '<path d="M50.059,31.747l-6.073-6.075l-6.079,6.075h3.808c0,0.002,0-0.001,0,0c0,5.411-4.387,9.799-9.797,9.799c-2.706,0-5.154-1.097-6.927-2.868l-3.267,3.266c2.608,2.608,6.213,4.221,10.193,4.221c7.961,0,14.414-6.455,14.414-14.417c0,0,0,0.001,0,0H50.059L50.059,31.747z"/>';
            return svgs.tagStart + svgs.circle + icon + icon2 + svgs.tagEnd;
        }(),
        //STOP: '',
        BACK: function () {
            var svgs = PocketCode.Ui._svgs;
            var icon = '<polygon points="27.583,32 39.629,44.395 35.001,49 18.371,32 35.001,15 39.629,19.605" class="pc-svgPlayerIcon"/>';
            return svgs.tagStart + svgs.circle + icon + svgs.tagEnd;
        }(),
        SCREENSHOT: function () {
            var svgs = PocketCode.Ui._svgs;
            var icon = '<path d="M35.486,32.488c0,1.867-1.519,3.385-3.385,3.385c-1.868,0-3.388-1.518-3.388-3.385c0-1.867,1.52-3.385,3.388-3.385C33.968,29.103,35.486,30.622,35.486,32.488z"/>';
            var icon2 = '<path d="M37.338,23.314v-2.832H26.662v2.832H17v18.204h30V23.314H37.338z M32.102,38.787c-3.475,0-6.299-2.825-6.299-6.298s2.824-6.153,6.299-6.153c3.472,0,6.298,2.68,6.298,6.153S35.573,38.787,32.102,38.787z"/>';
            return svgs.tagStart + svgs.circle + icon + icon2 + svgs.tagEnd;
        }(),
        AXES: function () {
            var svgs = PocketCode.Ui._svgs;
            var text1 = '<text font-size="15.6718" font-weight="bold" font-family="Arial, sans-serif" transform="matrix(1 0 0 1 19.2988 29.2036)">X</text>';
            var text2 = '<text font-size="15.6718" font-weight="bold" font-family="Arial, sans-serif" transform="matrix(1 0 0 1 34.9707 46.7944)">Y</text>';
            var icon = '<polygon points="23.996,46.546 20.307,46.546 40.004,18.416 43.693,18.416"/>';
            return svgs.tagStart + svgs.circle + text1 + text2 + icon + svgs.tagEnd;
        }(),
        MENU: function () {
            var svgs = PocketCode.Ui._svgs;
            var icon = '<path d="M26 13 l0 -6 6 0 6 0 0 6 0 6 -6 0 -6 0 0 -60z"/> <path d="M26 32 l0 -6 6 0 6 0 0 6 0 6 -6 0 -6 0 0 -60z"/> <path d="M26 51 l0 -6 6 0 6 0 0 6 0 6 -6 0 -6 0 0 -60z"/>';
            return svgs.tagStart + icon + svgs.tagEnd;
        }(),
    },

    I18nTextNode: (function () {
        I18nTextNode.extends(SmartJs.Ui.TextNode, false);

        //cntr
        function I18nTextNode(i18n, insertBefore, insertAfter) {
            SmartJs.Ui.TextNode.call(this);

            if (i18n && typeof i18n != 'string' && !(i18n instanceof PocketCode.Core.I18nString))
                throw new Error('invalid argument: i18nKey or i18nString');

            this._i18n = i18n || 'undefined';
            this._insertBefore = insertBefore || '';
            this._insertAfter = insertAfter || '';

            if (PocketCode.I18nProvider)
                PocketCode.I18nProvider.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(this._updateUiStrings, this));
            this._updateUiStrings();
        }

        //properties
        Object.defineProperties(I18nTextNode.prototype, {
            i18n: {
                set: function (i18n) {
                    if (typeof i18n != 'string' && !(i18n instanceof PocketCode.Core.I18nString))
                        throw new Error('invalid argument: i18nKey or i18nString');

                    if (this._i18n instanceof PocketCode.Core.I18nString && typeof i18n == 'string')
                        this._i18n.i18nKey = i18n;  //set new key internal
                    else
                        this._i18n = i18n;
                    this._updateUiStrings();
                },
            },
        });

        //methods
        I18nTextNode.prototype.merge({
            _updateUiStrings: function () {
                var text = '';
                if (this._i18n instanceof PocketCode.Core.I18nString)
                    text = this._i18n.toString();
                else {
                    if (!PocketCode.I18nProvider || !PocketCode.I18nProvider.getLocString)
                        text = '[' + this._i18n + ']';
                    else
                        text = PocketCode.I18nProvider.getLocString(this._i18n);
                }

                this.text = this._insertBefore.toString() + text + this._insertAfter.toString();
                this._text = text;  //make sure only the text is returned when calling the derived text getter
            },
            /* override */
            show: function () {
                this._dom.textContent = this._insertBefore.toString() + this._text + this._insertAfter.toString();
                this._onResize.dispatchEvent();
            },
        });

        return I18nTextNode;
    })(),

    I18nControl: (function () {
        I18nControl.extends(SmartJs.Ui.Control, false);

        //cntr
        function I18nControl(element, propObject) {
            SmartJs.Ui.Control.call(this, element, propObject);

            var languageChangeListener = new SmartJs.Event.EventListener(this._updateUiStrings, this);
            PocketCode.I18nProvider.onLanguageChange.addEventListener(languageChangeListener);
        }

        //methods
        I18nControl.prototype.merge({
            _updateUiStrings: function () {
                //TODO: override this in the individual controls
            },
        });

        return I18nControl;
    })(),

    Viewport: (function () {
        Viewport.extends(SmartJs.Ui.Viewport, false);

        //cntr
        function Viewport() {
            SmartJs.Ui.Viewport.call(this, {className: 'pc-playerViewport'});
            this._dom.dir = 'ltr';

            this._disableBrowserGestures();
        }

        //properties
        Object.defineProperties(Viewport.prototype, {
            uiDirection: {
                set: function (direction) {
                    this._dom.dir = direction;
                },
            },
        });

        ////events
        //Object.defineProperties(Viewport.prototype, {

        //});

        //methods
        Viewport.prototype.merge({
            _disableBrowserGestures: function () {
                this._clickHandler = this._addDomListener(this._dom, 'click', function (e) { e.preventDefault(); });
                this._dblClickHandler = this._addDomListener(this._dom, 'dblclick', function (e) { e.preventDefault(); });
                this._touchStartHandler = this._addDomListener(this._dom, 'touchstart', function (e) {
                    if (!e.systemAllowed)
                        e.preventDefault();
                });
                //this._touchEndHandler = this._addDomListener(this._dom, 'touchend', function (e) { e.preventDefault(); });
                this._touchCancelHandler = this._addDomListener(this._dom, 'touchcancel', function (e) { e.preventDefault(); });
                this._touchLeaveandler = this._addDomListener(this._dom, 'touchleave', function (e) { e.preventDefault(); });
                this._touchMoveHandler = this._addDomListener(this._dom, 'touchmove', function (e) { e.preventDefault(); });
            },
            _enableBrowserGestures: function () {
                this._removeDomListener(this._dom, 'click', this._clickHandler);
                this._removeDomListener(this._dom, 'dblclick', this._dblClickHandler);
                this._removeDomListener(this._dom, 'touchstart', this._touchStartHandler);
                //this._removeDomListener(this._dom, 'touchend', this._touchEndHandler);
                this._removeDomListener(this._dom, 'touchcancel', this._touchCancelHandler);
                this._removeDomListener(this._dom, 'touchleave', this._touchLeaveandler);
                this._removeDomListener(this._dom, 'touchmove', this._touchMoveHandler);
            },
            addDialog: function(dialog) {
                if (!(dialog instanceof PocketCode.Ui.Dialog))
                    throw new Error('invalid parameter: dialog');
                this._appendChild(dialog);
            },
            loadPageView: function (page) {
                if (!(page instanceof PocketCode.Ui.PageView))
                    throw new Error('invalid parameter: page');
                this._appendChild(page);    //TODO: check current page + viewState + tests (removing and readding existing pages)
            },
            /*override*/
            dispose: function () {
                this._enableBrowserGestures();
                SmartJs.Ui.Viewport.prototype.dispose.call(this);    //call super()
            },
        });

        return Viewport;
    })(),

});

