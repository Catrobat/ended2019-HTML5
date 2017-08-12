/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.DeviceEmulator = (function () {
    DeviceEmulator.extends(SmartJs.Ui.Control, false);

    function DeviceEmulator(device) {
        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-deviceEmulator' });

        this.device = device;
        this._pollingInterval = 100;

        this._container = new PocketCode.Ui.Expander('lbDeviceEmulator');
        this._appendChild(this._container);
        var scroll = new PocketCode.Ui.ScrollContainer({ className: 'pc-deviceEmulatorScroll' });
        this._container.appendChild(scroll);

        var tn = new PocketCode.Ui.I18nTextNode('lbDeviceMaxDegree');
        var span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceMaxDegreeDescr');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        var defaultVal = device.defaultInclinationMax * (90/46);
        this._maxSlider = new PocketCode.Ui.Slider({min:0, max:90, value:defaultVal});
        this._maxSlider.onChange.addEventListener(new SmartJs.Event.EventListener(this._maxDegreeChangeHandler, this));
        scroll.appendChild(this._maxSlider);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceAcc');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceAccDescr');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        defaultVal = device.defaultInclinationAcceleration * (50/8);
        this._accSlider = new PocketCode.Ui.Slider({min:1, max:100, value:defaultVal});
        this._accSlider.onChange.addEventListener(new SmartJs.Event.EventListener(this._maxAccChangeHandler, this));
        scroll.appendChild(this._accSlider);

        this.hide();
        this._img = new SmartJs.Ui.Image();
        this._img.onLoad.addEventListener(new SmartJs.Event.EventListener(this.show, this));
        this._img.src = 'https://share.catrob.at/html5/pocketCode/img/emulatorPhone.png';
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(this._img);
        span.addClassName('pc-dEImg');
        scroll.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDInclinationX');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDInclinationY');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        //events
        //this._onMaxInclinationChange=new SmartJs.Event.Event(this);
        //this._onInclinationAccelerationChange=new SmartJs.Event.Event(this);
    }

    //events
    //Object.defineProperties(Slider.prototype, {       //not needed: direct access to device provided
    //    onMaxInclinationChange: {
    //        get: function () {
    //            return this._maxSlider.onChange;
    //        },
    //    },
    //    onInclinationAccelerationChange: {
    //        get: function () {
    //            return this._accSlider.onChange;
    //        },
    //    },
    //});

    //properties
    Object.defineProperties(DeviceEmulator.prototype, {
        dom: {  //public accessor needed to access DOM (added to player's webOverlay)
            get: function () {
                return this._dom;
            },
        },/*
        device: {
            set: function (device) {
                if (!(device instanceof PocketCode.DeviceEmulator))
                    throw new Error('Emulator UI con only be used with a PocketCode.DeviceEmulator');
                this._device = device;
            },
        },*/
    });

    //methods
    DeviceEmulator.prototype.merge({
        _maxDegreeChangeHandler: function(e) {
            //TODO: set e.value to device
            this.device.setNewDegree(e.value * 46/90);
        },
        _maxAccChangeHandler: function(e) {
            //TODO: set e.value to device
            this.device.setNewAcceleration(e.value * 0.02);
        },
        imgTransformation: function (e) {
            var image = document.getElementsByClassName("pc-dEImg")[0];
            image.style.webkitTransform = "rotateX(" + this.device.inclinationY  + "deg) rotateY(" + this.device.inclinationX + "deg)";
            image.style.transform = "rotateX(" + -this.device.inclinationY  + "deg) rotateY(" + -this.device.inclinationX  + "deg)";

        },
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
