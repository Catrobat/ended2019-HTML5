/// <reference path='../../../smartJs/sj.js' />
/// <reference path='../../../smartJs/sj-core.js' />
/// <reference path='../../../smartJs/sj-event.js' />
/// <reference path='../../../smartJs/sj-ui.js' />
/// <reference path='../core.js' />
/// <reference path='../ui.js' />
'use strict';


PocketCode.Ui.I18nCheckbox = (function () {
    I18nCheckbox.extends(SmartJs.Ui.Control, false);

    //cntr
    function I18nCheckbox(i18nKey, value, props) {
        SmartJs.Ui.Control.call(this, 'div', props || { className: 'pc-checkbox' });

        this._input = new SmartJs.Ui.HtmlTag('input');
        this._input.setDomAttribute('type', 'checkbox');
        this._onCheckedChangeListener = this._input.addDomListener('change', function (e) {
            this._onCheckedChange.dispatchEvent({ value: this._value, checked: this.checked });
        }.bind(this));
        this._appendChild(this._input);

        this._label = new SmartJs.Ui.HtmlTag('label');
        this._label.setDomAttribute('for', this._input.id);
        this._label.setDomAttribute('onclick', ''); //fix: IOS4+
        this._textNode = new PocketCode.Ui.I18nTextNode(i18nKey);
        this._label.appendChild(this._textNode);
        this._appendChild(this._label);

        this._value = value;

        //events
        this._onCheckedChange = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(I18nCheckbox.prototype, {
        value: {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._value = value;
            },
        },
        checked: {
            get: function () {
                return this._input.dom.checked;
            },
            set: function (bool) {
                if (typeof bool != 'boolean')
                    throw new Error('invalid argument: expected type: boolean');

                if (this._input.dom.checked == bool)
                    return;
                this._input.dom.checked = bool;
                this._onCheckedChange.dispatchEvent({ value: this._value, checked: this.checked });
            },
        },
    });

    //events
    Object.defineProperties(I18nCheckbox.prototype, {
        onCheckedChange: {
            get: function () {
                return this._onCheckedChange;
            },
        },
    });

    //methods
    I18nCheckbox.prototype.merge({
        dispose: function () {
            this._input.removeDomListener('change', this._onCheckedChangeListener);
            SmartJs.Ui.Control.prototype.dispose.call(this);    //call super
        },
    });

    return I18nCheckbox;
})();


PocketCode.Ui.merge({
    RadioGroup: (function () {

        //cntr
        function RadioGroup(id) {
            this._id = id || SmartJs.getNewId();
            this._radios = [];
            this._checked = undefined;

            //events
            this._onCheckedChange = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(RadioGroup.prototype, {
            id: {
                get: function() {
                    return this._id;
                },
            },
            radios: {
                get: function() {
                    return this._radios;
                },
            },
            checked: {
                get: function() {
                    return this._checked;
                },
                set: function(radio) {
                    if (!(radio instanceof PocketCode.Ui.Radio))
                        throw new Error('invalid argument: expected type: Radio');

                    if (this._checked === radio)
                        return;
                    var idx = this._radios.indexOf(radio);
                    if (idx != -1) {
                        var r = this._radios[idx];
                        r.checked = true;   //will trigger event
                    }
                },
            },
        });

        //events
        Object.defineProperties(RadioGroup.prototype, {
            onCheckedChange: {
                get: function() {
                    return this._onCheckedChange;
                }
            }
        });

        //methods
        RadioGroup.prototype.merge({
            add: function (radio) {
                if (!(radio instanceof PocketCode.Ui.Radio) && !(radio instanceof Array))
                    throw new Error('invalid argument: expected Radio or Radio[]');

                if (radio instanceof Array) {
                    for (var i = 0, l = radio.length; i < l; i++)
                        this.add(radio[i]);
                }
                else {
                    var idx = this._radios.indexOf(radio);
                    if (idx == -1) {    //prevent from adding twice
                        radio.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(this._radioCheckHandler, this));
                        this._radios.push(radio);
                        radio.group = this;
                        this._radioCheckHandler({ checked: radio.checked, target: radio }); //call to make sure a checked item triggers event and all other radios become unchecked
                    }
                }
            },
            remove: function (radio) {
                if (!(radio instanceof PocketCode.Ui.Radio) && !(radio instanceof Array))
                    throw new Error('invalid argument: expected Radio or Radio[]');

                if (radio instanceof Array) {
                    for (var i = 0, l = radio.length; i < l; i++)
                        this.remove(radio[i]);
                }
                else {
                    var idx = this._radios.indexOf(radio);
                    if (idx != -1) {
                        this._radios.remove(radio);
                        radio.onCheckedChange.removeEventListener(new SmartJs.Event.EventListener(this._radioCheckHandler, this));
                        radio.group = undefined;
                        if (radio.checked) {
                            this._checked = undefined;
                            this._onCheckedChange.dispatchEvent({ groupId: this._id, value: undefined, radio: this._checked });
                        }
                    }
                }
            },
            _radioCheckHandler: function (e) {
                if (e.checked && this._checked !== e.target) {
                    this._checked = e.target;
                    var radios = this._radios,
                        r;
                    for (var i = 0, l = radios.length; i < l; i++) {    //this is required because radios will not change if they are not attached to the DOM
                        r = radios[i];
                        if (r !== e.target)
                            r.checked = false;
                    }
                    this._onCheckedChange.dispatchEvent({ groupId: this._id, value: this._checked.value, radio: this._checked });
                }
            },
            dispose: function () {
                this._checked = undefined;
                this._radios.length = 0;  //remove and unbind all
                this._disposed = true;
            },
        });

        return RadioGroup;
    })(),

    Radio: (function () {
        Radio.extends(PocketCode.Ui.I18nCheckbox, false);

        //cntr
        function Radio(text, value, props) {
            PocketCode.Ui.I18nCheckbox.call(this, '', value, props || { className: 'pc-radio' });

            this._input.setDomAttribute('type', 'radio');
            this._textNode.dispose();
            this._textNode = new SmartJs.Ui.TextNode(text);
            this._label.appendChild(this._textNode);
            this._label.setDomAttribute('dir', PocketCode.I18nProvider.getTextDirection(text));

            this._group = undefined;
            //this.name = SmartJs.getNewId();
            this._value = value;

        }

        //properties
        Object.defineProperties(Radio.prototype, {
            group: {
                set: function (group) {
                    if (group && !(group instanceof PocketCode.Ui.RadioGroup))
                        throw new Error('invalid argument: expected type: RadioGroup');
                    if (group === this._group)
                        return;
                    if (this._group)
                        this._group.remove(this);
                    if (group) {
                        this._group = group;
                        this._input.name = group.id;
                        group.add(this);
                    }
                    else {  //undefined
                        this._group = undefined;
                        this._input.name = SmartJs.getNewId();
                    }
                },
            },
        });

        //methods
        Radio.prototype.merge({
            dispose: function () {
                this._group = undefined;
                PocketCode.Ui.I18nCheckbox.prototype.dispose.call(this);    //call super
            },
        });

        return Radio;
    })(),
});

PocketCode.Ui.merge({
    I18nRadio: (function () {
        I18nRadio.extends(PocketCode.Ui.Radio, false);

        //cntr
        function I18nRadio(i18nKey, value, props) {
            PocketCode.Ui.Radio.call(this, '', value, props);

            this._textNode.dispose();
            this._textNode = new PocketCode.Ui.I18nTextNode(i18nKey);
            this._label.appendChild(this._textNode);

            this._group = undefined;
            this._value = value;
        }

        return I18nRadio;
    })(),

    Slider: (function () {
        Slider.extends(SmartJs.Ui.Control, false);

        //cntr
        function Slider(propObj) {
            SmartJs.Ui.Control.call(this, 'div', { className: 'pc-slider' });
            var input = new SmartJs.Ui.HtmlTag('input');
            var dom = input.dom;
            this._sliderDom = dom;
            dom.type = 'range';
            this._addDomListener(dom, 'change', this._onChangeHandler);

            //span for minLabel
            var spanMin = new SmartJs.Ui.HtmlTag('span');
            this._spanDomMin = spanMin.dom;
            this._appendChild(spanMin);

            this._appendChild(input);

            //Span for maxLabel +-
            var spanMax = new SmartJs.Ui.HtmlTag('span');
            this._spanDomMax = spanMax.dom;
            this.merge(propObj);
            this._appendChild(spanMax);

            //events
            this._onChange = new SmartJs.Event.Event(this);

        }

        //events
        Object.defineProperties(Slider.prototype, {
            onChange: {
                get: function() {
                    return this._onChange;
                },
            },
        });

        //properties
        Object.defineProperties(Slider.prototype, {
            //TODO: min, max, value, hor/vertical, ...
            //min: minimal value of slider
            min: {
                get: function () {
                    return this._sliderDom.min;
                },
                set: function (minVal) {
                    this._sliderDom.min = minVal;
                },
            },
            //max: maximal value of slider
            max: {
                get: function () {
                    return this._sliderDom.max;
                },
                set: function (maxVal) {
                    this._sliderDom.max = maxVal;
                },
            },
            //value: start position of slider
            value: {
                get: function () {
                    return this._sliderDom.value;
                },
                set: function (value) {
                    this._sliderDom.value = value;
                },
            },
            //orient: orientation of slider
            orientation: {
                get: function () {
                    return this._sliderDom.orient;
                },
                set: function (orientation) {
                    this._sliderDom.orient = orientation;
                },
            },
            //Label name for minimum
            minLabel: {
                get: function () {
                    return this._spanDomMin.innerHTML;
                },
                set: function (minLabel) {
                    this._spanDomMin.innerHTML = minLabel;
                },
            },
            //Label name for maximum
            maxLabel: {
                get: function () {
                    return this._spanDomMax.innerHTML;
                },
                set: function (maxLabel) {
                    this._spanDomMax.innerHTML = maxLabel;
                },
            },
        });

        Slider.prototype.merge({
            _onChangeHandler: function (e) {
                this._onChange.dispatchEvent({ value: e.target.value });
                this._sliderDom.blur();
                document.body.focus();
            },
        });

        return Slider;
    })(),

});
