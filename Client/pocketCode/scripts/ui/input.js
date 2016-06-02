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

                if (this._input.checked == bool)
                    return;
                this._input.checked = bool;
                this._onCheckedChange.dispatchEvent({ value: this._value, checked: this.checked });
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
            this._value = value;

            this._onCheckedChangeListener = this._addDomListener(this._input, 'change', function (e) {
                //please notice: a radio buttons change event is only fired when set to true
                this._onCheckedChange.dispatchEvent({ value: this._value, checked: this.checked });
            }.bind(this));

            //events
            this._onCheckedChange = new SmartJs.Event.Event(this);
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
                PocketCode.Ui.Checkbox.prototype.dispose.call(this);    //call super
            },
        });

        return Radio;
    })(),

});
