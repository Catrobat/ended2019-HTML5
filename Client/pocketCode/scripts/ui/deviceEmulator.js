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

        this._device = device;

        this._container = new PocketCode.Ui.Expander('lbDeviceEmulator');
        this._container.onVisibilityChange.addEventListener(new SmartJs.Event.EventListener(this._openCloseHandler, this));
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

        this._maxSlider = new PocketCode.Ui.Slider({min: device.degreeChangeMin / (46 * -1), max: device.degreeChangeMax * (90 / 46), value: device.degreeChangeValue * (90 / 46), minLabel: device.degreeChangeMin / (46 * -1), maxLabel: '&plusmn;' + device.degreeChangeMax * (90 / 46)});
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

        this._accSlider = new PocketCode.Ui.Slider({min: device.accelerationChangeMin / (8 * -1), max: device.accelerationChangeMax * (10 / 8), value: device.accelerationChangeValue * (5 / 8), minLabel: device.accelerationChangeMin / (8 * -1), maxLabel: device.accelerationChangeMax * (10 / 8)});
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
        var div = new SmartJs.Ui.HtmlTag('div');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        div.appendChild(span);
        span = new SmartJs.Ui.HtmlTag('span');
        div.appendChild(span);
        scroll.appendChild(div);

        tn = new PocketCode.Ui.I18nTextNode('lbDInclinationY');
        div = new SmartJs.Ui.HtmlTag('div');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        div.appendChild(span);
        span = new SmartJs.Ui.HtmlTag('span');
        div.appendChild(span);
        scroll.appendChild(div);

        /*var tn = new PocketCode.Ui.I18nTextNode('lbFlashlight');
        var span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        this._flashSlider = new PocketCode.Ui.Slider({min: 0, max: 1, value: 0, minLabel: 'Off', maxLabel: 'On'});
        this._flashSlider.onChange.addEventListener(new SmartJs.Event.EventListener(this._flashChangeHandler, this));
        scroll.appendChild(this._flashSlider);*/
    }

    //properties
    Object.defineProperties(DeviceEmulator.prototype, {
        dom: {  //public accessor needed to access DOM (added to player's webOverlay)
            get: function () {
                return this._dom;
            },
        },
    });

    //methods
    DeviceEmulator.prototype.merge({
        _maxDegreeChangeHandler: function(e) {
            this._device.degreeChangeValue = e.value / 90 * 46;
        },
        _maxAccChangeHandler: function(e) {
            this._device.accelerationChangeValue = e.value;
        },
        /*_flashChangeHandler: function (e) {
            if (e.value == 1)
                this._device.flashOn = true;
            if (e.value == 0)
                this._device.flashOn = false;
        },*/
        _updateImageTransformation: function (e) {
            var image = document.getElementById("sj69");

            image.style.webkitTransform = "rotateX(" + this._device.inclinationY  + "deg) rotateY(" + this._device.inclinationX + "deg)";
            image.style.transform = "rotateX(" + -this._device.inclinationY  + "deg) rotateY(" + -this._device.inclinationX  + "deg)";

            document.getElementById("sj73").innerHTML = Math.round(this._device.inclinationX * (90 / 46));
            document.getElementById("sj76").innerHTML = Math.round(this._device.inclinationY * (90 / 46));
        },
        _openCloseHandler: function (e) {
            if (e.opened)
            {
                this._pollingTimer = setInterval(this._updateImageTransformation.bind(this), 100);
            }
            else
            {
                clearInterval(this._pollingTimer);
            }

        },
        /* override */
        verifyResize: function () {
            if (!this._container) //called during constructor call
                return;
            var clientRect = this._container.clientRect,
                parentHeight = this._parent ? this._parent.height : document.body.clientHeight;
            this._container.style.maxHeight = (parentHeight - clientRect.top - 10) + 'px';

            SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this);  //call super
            this._container.verifyResize();
        },
    });

    return DeviceEmulator;
})();
