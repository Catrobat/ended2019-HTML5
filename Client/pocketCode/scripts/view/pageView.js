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
        this._bodyLayout = new SmartJs.Ui.ContainerControl({ className: 'pc-pageBodyLayout' });
        this._bodyLayout.appendChild(this._container);
        this._appendChild(this._bodyLayout);
        this._footer = new SmartJs.Ui.ContainerControl({ className: 'pc-pageFooter' });
        this._appendChild(this._footer);

        this._onResize.addEventListener(new SmartJs.Event.EventListener(this._handleResize, this));
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

            // TODO: make sure to edit the caption area as well to enable text-overflow: ellipsis (max-width)
            // console.log(e);
            //this.height = this.height;   //width/height is defined as 100% -> has to be set as px valiu to enablel page transitions
            //this.width = this.width;
            //this._container.height = this.height - this._header.height - this._footer.height;
            var style = this._bodyLayout.style,
                hh = this._header.hidden,
                fh = this._footer.hidden;

            if (!hh && !fh)
                style.paddingBottom = (this._header.height + this._footer.height) + 'px';
            else if (hh && fh)
                style.paddingBottom = '0';
            else if (hh)
                style.paddingBottom = this._footer.height + 'px';
            else if (fh)
                style.paddingBottom = this._header.height + 'px';
            this._container.verifyResize(this);
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
        dispose: function () {
            this._onResize.removeEventListener(new SmartJs.Event.EventListener(this._handleResize, this));
            //override: to make sure a view is disposed by it's controller
        },
    });

    return PageView;
})();