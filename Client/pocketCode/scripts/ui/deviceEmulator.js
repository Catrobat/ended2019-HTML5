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
        //this._pollingInterval = 100;

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

        var defaultVal = device.defaultInclinationMax * (90 / 46);
        this._maxSlider = new PocketCode.Ui.Slider({min: 1, max: 90, value: defaultVal, minLabel: "1", maxLabel: '&plusmn;' + "90"});
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

        defaultVal = device.defaultInclinationAcceleration * (5 / 8);
        this._accSlider = new PocketCode.Ui.Slider({min: 1, max: 10, value: defaultVal, minLabel: "1", maxLabel: '&plusmn;' + "10"});
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

        this._keyDownListener = this._addDomListener(document, 'keydown', this._imgTransformation);
        this._keyUpListener = this._addDomListener(document, 'keyup', this._resetImgTransformation);
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
            this.device._inclinationLimits = {
                X_MIN: -e.value * (46 / 90),
                X_MAX: e.value * (46 / 90),
                Y_MIN: -e.value * (46 / 90),
                Y_MAX: e.value * (46 / 90),
            };
        },
        _maxAccChangeHandler: function(e) {
            this.device._inclinationIncr = {
                X: 46 / e.value,
                Y: 46 / e.value,
            };
        },
        _imgTransformation: function (e) {

            var image = document.getElementById("sj69");

            image.style.webkitTransform = "rotateX(" + this.device.inclinationY  + "deg) rotateY(" + this.device.inclinationX + "deg)";
            image.style.transform = "rotateX(" + -this.device.inclinationY  + "deg) rotateY(" + -this.device.inclinationX  + "deg)";

            document.getElementById("sj73").innerHTML = Math.round(this.device.inclinationX * (90 / 46));
            document.getElementById("sj76").innerHTML = Math.round(this.device.inclinationY * (90 / 46));

            // if (this.device._keyPress.LEFT && this.device._keyPress.RIGHT)
            // {
            //     console.log("halt");
            //     console.log(this.device._keyPress);
            //
            //     image.style.webkitTransform = "rotateX(" + this.device.inclinationY  + "deg) rotateY(" + this.device.inclinationX + "deg)";
            //     image.style.transform = "rotateX(" + -this.device.inclinationY  + "deg) rotateY(" + -this.device.inclinationX  + "deg)";
            //
            //     document.getElementById("sj73").innerHTML = Math.round(this.device.inclinationX * (90 / 46));
            // }




        },
        _resetImgTransformation: function (e) {

            var image = document.getElementById("sj69");

            if (!this.device._keyPress.LEFT && !this.device._keyPress.RIGHT && !this.device._keyPress.UP && !this.device._keyPress.DOWN)
            {
                image.style.webkitTransform = "rotateX(" + this.device._defaultInclination.Y + "deg) rotateY(" + this.device._defaultInclination.X + "deg)";
                image.style.transform = "rotateX(" + -this.device._defaultInclination.Y + "deg) rotateY(" + -this.device._defaultInclination.X + "deg)";

                document.getElementById("sj73").innerHTML = Math.round(this.device.inclinationX * (90 / 46));
                document.getElementById("sj76").innerHTML = Math.round(this.device.inclinationY * (90 / 46));
            }
            else if ((this.device._keyPress.LEFT || this.device._keyPress.RIGHT) && (!this.device._keyPress.UP && !this.device._keyPress.DOWN))
            {
                image.style.webkitTransform = "rotateX(" + this.device.inclinationY + "deg) rotateY(" + this.device.inclinationX + "deg)";
                image.style.transform = "rotateX(" + -this.device.inclinationY + "deg) rotateY(" + -this.device.inclinationX + "deg)";

                document.getElementById("sj76").innerHTML = Math.round(this.device.inclinationY * (90 / 46));
            }
            else if ((!this.device._keyPress.LEFT && !this.device._keyPress.RIGHT) && (this.device._keyPress.UP || this.device._keyPress.DOWN))
            {
                image.style.webkitTransform = "rotateX(" + this.device.inclinationY + "deg) rotateY(" + this.device._defaultInclination.X + "deg)";
                image.style.transform = "rotateX(" + -this.device.inclinationY + "deg) rotateY(" + -this.device._defaultInclination.X + "deg)";

                document.getElementById("sj73").innerHTML = Math.round(this.device.inclinationX * (90 / 46));
            }
        },
        _openCloseHandler: function (e) {
            if (e.opened)
            {
                //this._pollingTimer = setInterval(,);
                ;//TODO: start polling (this._pollingTimer = setInterval(...)
            }
            else
            {
                //clearInterval(this._pollingTimer);
                ;//TODO: stop polling (stopInterval(this._pollingTimer)
            }
            //this._container.hidden) {
            //     this._container.show();
            //     this.verifyResize();
            //     //this._onOpen.dispatchEvent();
            // } else {
            //     this.close();
            // }
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
