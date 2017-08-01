/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.DeviceEmulator = (function () {
    DeviceEmulator.extends(SmartJs.Ui.Control, false);

    function DeviceEmulator(i18nCaption) {
        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-deviceEmulator' });

        this._container = new PocketCode.Ui.Expander(i18nCaption);
        this._appendChild(this._container);

        var tn = new PocketCode.Ui.I18nTextNode('lbDeviceMaxDegree');
        var span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        this._container.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceMaxDegreeDescr');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        this._container.appendChild(span);

        this._maxSlider = new PocketCode.Ui.Slider();
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(this._maxSlider);
        this._container.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceAcc');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        this._container.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceAccDescr');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        this._container.appendChild(span);

        this._accSlider = new PocketCode.Ui.Slider();
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(this._accSlider);
        this._container.appendChild(span);

        this._img = new SmartJs.Ui.Image();
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(this._img);
        this._container.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDInclinationX');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        this._container.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDInclinationY');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        this._container.appendChild(span);

        //events
        //this._onMaxInclinationChange=new SmartJs.Event.Event(this);
        //this._onInclinationAccelerationChange=new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(Slider.prototype, {
        onMaxInclinationChange: {
            get: function() {
                return this._maxSlider.onChange;
            },
        },
        onInclinationAccelerationChange: {
            get: function() {
                return this._accSlider.onChange;
            },
        },
    });

    //methods
    DeviceEmulator.prototype.merge({
        _openCloseHandler: function (e) {
            if (this._subMenu.hidden) {
                this._subMenu.show();
                this.verifyResize();
                this._onOpen.dispatchEvent();
            } else {
                this.close();
            }
        },
        close: function (e) {
            this._subMenu.hide();
        },
        /* override */
        verifyResize: function () {
            if (!this._subMenu) //called during constructor call
                return;
            var clientRect = this._subMenu.clientRect,
                parentHeight = this._parent ? this._parent.height : document.body.clientHeight;
            this._container.style.maxHeight = (parentHeight - clientRect.top - 10) + 'px';

            SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this);  //call super
            this._container.verifyResize();
        },
    });

    return DeviceEmulator;
})();
