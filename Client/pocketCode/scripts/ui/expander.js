/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.Expander = (function () {
    Expander.extends(SmartJs.Ui.ContainerControl, false);

    function Expander(i18nKey, args) {
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-expander' });

        //header
        this._header = new SmartJs.Ui.ContainerControl({ className: 'pc-expanderHeader' });
        this._appendChild(this._header);
        this._checkbox = new PocketCode.Ui.I18nCheckbox(i18nKey, undefined, { className: '' });
        this._checkbox.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(this._onChangeHandler, this));
        this._header.appendChild(this._checkbox);

        //body
        this._container = new SmartJs.Ui.ContainerControl({ className: 'pc-expanderBody' });
        this._appendChild(this._container);

        //events
        this._onVisibilityChange = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(Expander.prototype, {
        onVisibilityChange: {
            get: function () {
                return this._onVisibilityChange;
            }
        },
    });

    //properties
    Object.defineProperties(Expander.prototype, {
        opened: {
            get: function () {
                return this._checkbox.checked;
            }
        },
    });

    //methods
    Expander.prototype.merge({
        _onChangeHandler: function (e) {
            if (e.checked) {
                this._container.addClassName("pc-bodyVisible");
                this._onVisibilityChange.dispatchEvent({ opened: true });
            }
            else {
                this._container.removeClassName("pc-bodyVisible");
                this._onVisibilityChange.dispatchEvent({ opened: false });
            }

            window.setTimeout(this.verifyResize.bind(this), 400);
            window.setTimeout(this.verifyResize.bind(this), 800);
        },
        open: function () {
            this._checkbox.checked = true;
        },
        close: function () {
            this._checkbox.checked = false;
        }
    });

    return Expander;
})();


PocketCode.Ui.ExpanderTree = (function () {
    ExpanderTree.extends(PocketCode.Ui.Expander, false);

    function ExpanderTree(i18nKey) {
        PocketCode.Ui.Expander.call(this);
        this.className = 'pc-expanderTree';
        this._button = new PocketCode.Ui.Button(i18nKey);
        this._header.appendChild(this._button);
    }

    //events
    Object.defineProperties(ExpanderTree.prototype, {
        onCaptionClick: {
            get: function () {
                return this._button.onClick;
            }
        }
    });

    //properties
    Object.defineProperties(ExpanderTree.prototype, { //Control.caption.text = ...
        caption: {
            get: function () {
                return this._button;
            }
        }
    });

    return ExpanderTree;
})();
