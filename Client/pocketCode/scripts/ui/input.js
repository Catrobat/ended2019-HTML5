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
                get: function () {
                    return this._id;
                },
            },
            radios: {
                get: function () {
                    return this._radios;
                },
            },
            checked: {
                get: function () {
                    return this._checked;
                },
                set: function (radio) {
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
                get: function () {
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

            propObj = propObj || {};

            //min label
            this._minLabel = new SmartJs.Ui.ContainerControl({ className: 'pc-label' });
            this._min = propObj.minValue || 0;
            this._minTextNode = new SmartJs.Ui.TextNode();
            this._minLabel.appendChild(this._minTextNode);
            this._appendChild(this._minLabel);

            //control
            var cntr = new SmartJs.Ui.ContainerControl({ className: 'pc-sliderControl' });
            this._track = new SmartJs.Ui.HtmlTag('div', { className: 'pc-track' });
            this._trackValue = new SmartJs.Ui.HtmlTag('div');
            this._track.appendChild(this._trackValue);
            cntr.appendChild(this._track);
            this._thumb = new SmartJs.Ui.HtmlTag('div', { className: 'pc-thumb' });

            this._valueLabel = new SmartJs.Ui.ContainerControl({ className: 'pc-valueLabel' });
            this._valueTextNode = new SmartJs.Ui.TextNode();//this._min.toString());
            this._valueLabel.appendChild(this._valueTextNode);
            this._thumb.appendChild(this._valueLabel);
            cntr.appendChild(this._thumb);
            this._appendChild(cntr);

            //max label
            this._maxLabel = new SmartJs.Ui.ContainerControl({ className: 'pc-label' });
            this._max = propObj.maxValue || 100;
            this._maxTextNode = new SmartJs.Ui.TextNode();
            this._maxLabel.appendChild(this._maxTextNode);
            this._appendChild(this._maxLabel);

            this._mouseDownAt = undefined;

            this._trackDownListener = this._addDomListener(this._track.dom, 'mousedown', this._trackDownHandler);
            this._mouseDownListener = this._addDomListener(this._thumb.dom, 'mousedown', this._thumbDownHandler);
            this._mouseMoveListener = this._addDomListener(document, 'mousemove', this._thumbMoveHandler);
            this._mouseUpListener = this._addDomListener(document, 'mouseup', this._thumbUpHandler);
            this._mouseLeaveListener = this._addDomListener(document.body, 'mouseleave', this._thumbUpHandler);

            //events
            this._onChange = new SmartJs.Event.Event(this);

            this._valueDigits = 1;
            var value = propObj.value || this._min;
            delete propObj.value;
            this.merge(propObj);
            this.value = value; //init min/max first
            this._onResize.addEventListener(new SmartJs.Event.EventListener(this._updateValue, this));
        }

        //events
        Object.defineProperties(Slider.prototype, {
            onChange: {
                get: function () {
                    return this._onChange;
                },
            },
        });

        //properties
        Object.defineProperties(Slider.prototype, {
            minValue: {
                get: function () {
                    return this._min;
                },
                set: function (value) {
                    if (typeof value != 'number' || value > this._max)
                        throw new Error('invalid setter: min value');
                    this._min = value;
                    if (value > this.value)
                        this.value = value;
                    else
                        this._updateValue();
                },
            },
            maxValue: {
                get: function () {
                    return this._max;
                },
                set: function (value) {
                    if (typeof value != 'number' || value < this._min)
                        throw new Error('invalid setter: max value');
                    this._max = value;
                    if (value < this.value)
                        this.value = value;
                    else
                        this._updateValue();
                },
            },
            value: {
                get: function () {
                    return parseFloat(this._valueTextNode.text);
                },
                set: function (value) {
                    if (typeof value != 'number')
                        throw new Error('invalid setter: value');
                    var valid = Math.min(Math.max(this._min, value), this._max);
                    this._valueTextNode.text = valid.toFixed(this._valueDigits);
                    this._updateValue();
                },
            },
            valueDigits: {
                get: function () {
                    return this._valueDigits;
                },
                set: function (value) {
                    if (typeof value != 'number' || parseInt(value) !== value)
                        throw new Error('invalid setter: value');
                    this._valueDigits = value;
                    this.value = this.value;
                },
            },
            minLabel: {
                get: function () {
                    return this._minTextNode.text;
                },
                set: function (label) {
                    this._minTextNode.text = label;
                    window.setTimeout(this._updateValue.bind(this), 20);  //resize?
                },
            },
            maxLabel: {
                get: function () {
                    return this._maxTextNode.text;
                },
                set: function (label) {
                    this._maxTextNode.text = label;
                    window.setTimeout(this._updateValue.bind(this), 20);  //resize?
                },
            },
        });

        Slider.prototype.merge({
            _updatePosition: function (e) {
                var mousePos = this._getMousePosition(e),
                    ltr = this._minLabel.clientRect.left < this._maxLabel.clientRect.left,
                    style = this._thumb.style;

                var margin = parseInt(this._thumb.style.marginLeft);
                margin = isNaN(margin) ? 0 : margin;

                var thumbWidth = this._thumb.width - 2 * margin,
                    maxMargin = this._track.width - thumbWidth;//,

                if (this._mouseDownAt) {
                    var offset = mousePos.x - this._mouseDownAt.x;
                    margin = ltr ? this._mouseDownAt.margin + offset : this._mouseDownAt.margin - offset;
                }
                else {
                    var bcr = this._track.clientRect,
                    html = document.documentElement,
                    trackPos = {
                        top: bcr.top + window.pageYOffset - html.clientTop,
                        left: bcr.left + window.pageXOffset - html.clientLeft,
                    },

                    margin = mousePos.x - trackPos.left;
                    margin = ltr ? margin - Math.round(thumbWidth / 2) : this._track.width - margin - Math.round(thumbWidth / 2);
                }
                margin = Math.max(Math.min(margin, maxMargin), 0);
                style.marginLeft = style.marginRight = margin + 'px';
                this._trackValue.width = margin + thumbWidth / 2;

                var value = this._min + (this._max - this._min) / maxMargin * margin;
                this._valueTextNode.text = value.toFixed(this._valueDigits);
                this._onChange.dispatchEvent({ value: value });
            },
            _updateValue: function () {
                var margin = parseInt(this._thumb.style.marginLeft);
                margin = isNaN(margin) ? 0 : margin;

                var thumbWidth = this._thumb.width - 2 * margin,
                    maxMargin = this._track.width - thumbWidth,
                    margin = maxMargin / (this._max - this._min) * (this.value - this._min),
                    style = this._thumb.style;

                style.marginLeft = style.marginRight = margin + 'px';
                this._trackValue.width = margin + thumbWidth / 2;

                this._onChange.dispatchEvent({ value: this.value });
            },
            _getMousePosition: function (e) {
                var pos = { x: 0, y: 0 };
                e = e || window.event;

                if (e.pageX || e.pageY) {
                    pos.x = e.pageX;
                    pos.y = e.pageY;
                }
                else if (e.clientX || e.clientY) {
                    pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                return pos;
            },
            _trackDownHandler: function (e) {
                this._updatePosition(e);
                this._thumbDownHandler(e);
            },
            _thumbDownHandler: function (e) {
                this._mouseDownAt = this._getMousePosition(e);
                var margin = parseInt(this._thumb.style.marginLeft);
                this._mouseDownAt.margin = isNaN(margin) ? 0 : margin;

                this._thumb.addClassName('pc-thumb-down');
                e.preventDefault();
            },
            _thumbMoveHandler: function (e) {
                if (!this._mouseDownAt)
                    return;
                this._updatePosition(e);
                e.preventDefault();
            },
            _thumbUpHandler: function (e) {
                if (!this._mouseDownAt)
                    return;
                this._mouseDownAt = undefined;
                this._thumb.removeClassName('pc-thumb-down');
                e.preventDefault();
            },
            /* override */
            dispose: function () {
                this._removeDomListener(this._track.dom, 'mousedown', this._trackDownListener);
                this._removeDomListener(this._thumb.dom, 'mousedown', this._mouseDownListener);
                this._removeDomListener(document, 'mousemove', this._mouseMoveListener);
                this._removeDomListener(document, 'mouseup', this._mouseUpListener);
                this._removeDomListener(document.body, 'mouseleave', this._mouseLeaveListener);

                this._onChange.dispose();   //dispose first to avoid events during dispose
                SmartJs.Ui.Control.prototype.dispose.call(this);    //call super()
            }

        });

        return Slider;
    })(),

});
