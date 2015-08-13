/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../ui.js" />
'use strict';


PocketCode.Ui.PageView = (function () {
    PageView.extends(SmartJs.Ui.ContainerControl, false);

    //cntr
    function PageView(propObject) {
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-page' }.merge(propObject));

        this._header = new SmartJs.Ui.ContainerControl({ className: 'pc-pageHeader' });
        this._appendChild(this._header);
        this._captionArea = new SmartJs.Ui.ContainerControl();
        this._caption = new SmartJs.Ui.TextNode();  //TODO: not needed right now
        this._captionArea.appendChild(this._caption);

        //define body as inner container: override
        this._container = new SmartJs.Ui.ContainerControl({ className: 'pc-pageBody' });  //TODO: style really needed?
        this._appendChild(this._container);
        this._footer = new SmartJs.Ui.ContainerControl({ className: 'pc-pageFooter' });
        this.appendChild(this._footer);

        this.onResize.addEventListener(new SmartJs.Event.EventListener(this._handleResize, this));
    }

    //properties
    Object.defineProperties(PageView.prototype, {
        //caption: {  //TODO: not needed right now
        //    get: function () {
        //        return this._caption.text;
        //    },
        //    set: function (value) {
        //        this._caption.text = value;
        //    },
        //}
    });

    //events
    Object.defineProperties(PageView.prototype, {
    });

    //methods
    PageView.prototype.merge({
        _handleResize: function(e) {
            //TODO: make sure to edit the caption area as well to enable text-overflow: ellipsis (max-width)
            this._container.height = this.height - this._header.height - this._footer.height;
        },
        hideHeader: function () {
            this._header.hide();
            this._handleResize();
        },
        showHeader: function () {
            this._header.show();
            this._handleResize();
        },
        hideFooter: function () {
            this._footer.hide();
            this._handleResize();
        },
        showFooter: function () {
            this._footer.show();
            this._handleResize();
        },
    });

    return PageView;
})();