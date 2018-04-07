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
        var scroll = new PocketCode.Ui.ScrollContainer({ className: 'pc-deviceEmulatorBody' }, { className: 'pc-deviceEmulatorContent' });
        this._container.appendChild(scroll);

        var tn = new PocketCode.Ui.I18nTextNode('lbDeviceMaxDegree');
        var span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceMaxDegreeDescr');
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(tn);
        scroll.appendChild(span);

        this._maxSlider = new PocketCode.Ui.Slider({ minValue: device.inclinationMinMaxRange.MIN, maxValue: device.inclinationMinMaxRange.MAX, /*valueDigits: 0,*/ value: device.inclinationMinMax, minLabel: device.inclinationMinMaxRange.MIN, maxLabel: '±' + device.inclinationMinMaxRange.MAX });
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

        this._accSlider = new PocketCode.Ui.Slider({ minValue: device.inclinationChangePerSecRange.MIN, maxValue: device.inclinationChangePerSecRange.MAX, /*valueDigits: 0,*/ value: device.inclinationChangePerSec, minLabel: device.inclinationChangePerSecRange.MIN, maxLabel: device.inclinationChangePerSecRange.MAX });
        this._accSlider.onChange.addEventListener(new SmartJs.Event.EventListener(this._maxAccChangeHandler, this));
        scroll.appendChild(this._accSlider);

        this.hide();
        this._img = new SmartJs.Ui.Image();
        this._img.onLoad.addEventListener(new SmartJs.Event.EventListener(this.show, this));
        this._img.src = PocketCode.domain + 'html5/pocketCode/img/emulatorPhone.png';
        span = new SmartJs.Ui.HtmlTag('span');
        span.appendChild(this._img);
        span.addClassName('pc-imgContainer');
        scroll.appendChild(span);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceIncX');
        var div = new SmartJs.Ui.HtmlTag('div', { className: 'pc-inclinationLabel' });
        span = new SmartJs.Ui.HtmlTag('div', { className: 'pc-label' });
        span.appendChild(tn);
        div.appendChild(span);
        this._inclXTextNode = new SmartJs.Ui.TextNode('');
        span = new SmartJs.Ui.HtmlTag('div', { style: { display: 'inline' } });
        span.appendChild(this._inclXTextNode);
        div.appendChild(span);
        scroll.appendChild(div);

        tn = new PocketCode.Ui.I18nTextNode('lbDeviceIncY');
        div = new SmartJs.Ui.HtmlTag('div', { className: 'pc-inclinationLabel' });
        span = new SmartJs.Ui.HtmlTag('div', { className: 'pc-label' });
        span.appendChild(tn);
        div.appendChild(span);
        this._inclYTextNode = new SmartJs.Ui.TextNode('');
        span = new SmartJs.Ui.HtmlTag('div', { style: { display: 'inline' } });
        span.appendChild(this._inclYTextNode);
        div.appendChild(span);
        scroll.appendChild(div);
        this._scollCntr = scroll;

        //handling window resize
        SmartJs.Ui.Window.onResize.addEventListener(new SmartJs.Event.EventListener(this.verifyResize, this));
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
        _maxDegreeChangeHandler: function (e) {
            this._device.inclinationMinMax = e.value;
        },
        _maxAccChangeHandler: function (e) {
            this._device.inclinationChangePerSec = e.value;
        },
        _updateImageTransformation: function (e) {
            var image = this._img;

            image.style.webkitTransform = 'rotateX(' + this._device.inclinationY + 'deg) rotateY(' + this._device.inclinationX + 'deg)';
            image.style.transform = 'rotateX(' + -this._device.inclinationY + 'deg) rotateY(' + -this._device.inclinationX + 'deg)';

            this._inclXTextNode.text = this._device.inclinationX.toFixed(1);
            this._inclYTextNode.text = this._device.inclinationY.toFixed(1);
        },
        _openCloseHandler: function (e) {
            if (e.opened) {
                this._pollingTimer = setInterval(this._updateImageTransformation.bind(this), 100);
                window.setTimeout(this._updateScrollbars.bind(this), 200);   //make sure the scrollbars are updated correctly
                window.setTimeout(this._updateScrollbars.bind(this), 400);
            }
            else {
                clearInterval(this._pollingTimer);
            }
        },
        _updateScrollbars:function(){
            this._scollCntr.onResize.dispatchEvent();
        },
        /* override */
        verifyResize: function () {
            var height = document.body.clientHeight;
            this._scollCntr.style.maxHeight = Math.max(height - 101, 100) + 'px';

            SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this);  //call super
            this._scollCntr.verifyResize();
        },
        dispose: function () {
            SmartJs.Ui.Window.onResize.removeEventListener(new SmartJs.Event.EventListener(this._windowResizeHandler, this));
            SmartJs.Ui.Control.prototype.dispose.call(this);
        },
    });

    return DeviceEmulator;
})();
