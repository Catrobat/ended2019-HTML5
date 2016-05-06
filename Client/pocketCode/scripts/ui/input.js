/// <reference path='../../../smartJs/sj.js' />
/// <reference path='../../../smartJs/sj-core.js' />
/// <reference path='../../../smartJs/sj-event.js' />
/// <reference path='../../../smartJs/sj-ui.js' />
/// <reference path='../core.js' />
/// <reference path='../ui.js' />
'use strict';


PocketCode.Ui.Checkbox = (function () {
    Checkbox.extends(SmartJs.Ui.Control, false);

    //cntr
    function Checkbox(i18nKey, value) {
        SmartJs.Ui.Control.call(this, 'div', { className: 'pc-checkbox' });

        this._input = document.createElement('input');
        this._input.setAttribute('type', 'checkbox');
        this._input.id = this.id + '-cb';
        this._dom.appendChild(this._input);

        var label = document.createElement('label');
        label.setAttribute('for', this._input.id)
        label.appendChild((new PocketCode.Ui.I18nTextNode(i18nKey))._dom);
        this._dom.appendChild(label);

        this.name = SmartJs.getNewId();
        if (value)
            this._value = value;
        this._onCheckedChangeListener = this._addDomListener(this._input, 'change', function (e) {
            this._onCheckedChange.dispatchEvent({ value: this._value, checked: this.checked });
        }.bind(this));

        //events
        this._onCheckedChange = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Checkbox.prototype, {
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
                return this._input.checked;
            },
            set: function (bool) {
                if (typeof bool != 'boolean')
                    throw new Error('invalid argument: expected type: boolean');

                this._input.checked = true;
            },
        },
    });

    //events
    Object.defineProperties(Checkbox.prototype, {
        onCheckedChange: {
            get: function () {
                return this._onCheckedChange;
            },
        },
    });

    //methods
    Checkbox.prototype.merge({
        dispose: function () {
            this._removeDomListener(this._input, 'change', this._onCheckedChangeListener);
            SmartJs.Ui.Control.prototype.dispose.call(this);    //call super
        },
    });

    return Checkbox;
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
            checked: {
                get: function() {
                    return this._checked;
                },
                set: function(radio) {
                    if (!(radio instanceof PocketCode.Ui.Radio))
                        throw new Error('invalid argument: expected type: Radio');
                    var idx = this._radios.indexOf(radio);
                    if (idx >= 0) {
                        var r = this._radios[i];
                        r.checked = true;
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
                        radio.group = this;
                        radio.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(this._radioCheckHandler, this));
                        this._radios.push(radio);
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
                    if (idx >= 0) {
                        radio.name = SmartJs.getNewId();
                        radio.onCheckedChange.removeEventListener(new SmartJs.Event.EventListener(this._radioCheckHandler, this));
                        this._radios.remove(radio);
                    }
                }
            },
            _radioCheckHandler: function (e) {
                if (e.checked)
                    this._onCheckedChange.dispatchEvent({ groupId: this._id, value: e.target.value, radio: e.target });
            },
            dispose: function () {
                this._checked = undefined;
                this.remove(this._radios);  //remove and unbind all
            },
        });

        return RadioGroup;
    })(),

    Radio: (function () {
        Radio.extends(PocketCode.Ui.Checkbox);

        //cntr
        function Radio(i18nKey, value) {
            SmartJs.Ui.Control.call(this, 'div', { className: 'pc-radio' });

            this._input = document.createElement('input');
            this._input.setAttribute('type', 'radio');
            this._input.id = this.id + '-rd';
            this._dom.appendChild(this._input);

            var label = document.createElement('label');
            label.setAttribute('for', this._input.id);
            label.appendChild((new PocketCode.Ui.I18nTextNode(i18nKey))._dom);
            this._dom.appendChild(label);

            this._group = undefined;
            this.name = SmartJs.getNewId();
            if (value)
                this._value = value;
            this._onCheckedChangeListener = this._addDomListener(this._input, 'change', function (e) {
                this._onCheckedChange.dispatchEvent({ value: this._value, checked: this.checked });
            }.bind(this));

            //events
            this._onCheckedChange = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(Radio.prototype, {
            group: {
                set: function (group) {
                    if (!(group instanceof PocketCode.Ui.RadioGroup))
                        throw new Error('invalid argument: expected type: RadioGroup');
                    if (group == this._group)
                        return;
                    if (this._group)
                        this._group.remove(this);
                    this._group = group;
                    this._input.name = group.id;
                    group.add(this);
                },
            },
        });

        //methods
        Radio.prototype.merge({
            dispose: function () {
                this._group = undefined;
                PocketCode.Ui.Checkbox.prototype.dispose.call(this);    //call super
            },
        });

        return Radio;
    })(),

});
