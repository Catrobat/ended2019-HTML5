/// <reference path='../../../smartJs/sj.js' />
/// <reference path='../../../smartJs/sj-core.js' />
/// <reference path='../../../smartJs/sj-event.js' />
/// <reference path='../../../smartJs/sj-ui.js' />
/// <reference path='../core.js' />
/// <reference path='../ui.js' />
'use strict';


PocketCode.Ui.merge({
    RadioGroup: (function () {

        //cntr
        function RadioGroup(type, i18nCaptionKey, i18nMsgKey) {
            this._groupId = SmartJs.getNewId();
            this._radios = [];
            this._checked = undefined;
            //events
            this._onCheckedChange = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(RadioGroup.prototype, {
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
                        //this._checked = r;    //triggers radio onCheck
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
                        radio.name = this._groupId;
                        radio.onCheck.addEventListener(new SmartJs.Event.EventListener(this._radioCheckHandler, this));
                        this._radios.push(radio);
                    }
                }
            },
            remove: function () {
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
                        radio.onCheck.removeEventListener(new SmartJs.Event.EventListener(this._radioCheckHandler, this));
                        this._radios.remove(radio);
                    }
                }
            },
            _radioCheckHandler: function (e) {
                this._onCheckedChange.dispatchEvent(e.target);//trey to merge all properties, e.g. name, value, checked, ...//old: { radio: e.target });
            }
        });

        return RadioGroup;
    })(),

    Radio: (function () {
        Radio.extends(SmartJs.Ui.Control, false);

        //cntr
        function Radio(i18nKey, value) {
            SmartJs.Ui.Control.call(this, 'div', { className: 'pc-radio' });

            this._input = document.createElement('input');
            this._input.setAttribute('type', 'radio');
            this._input.id = this.id + '-rd';
            this._dom.appendChild(this._input);

            var label = document.createElement('label');
            label.for = this._input.id;
            label.appendChild((new PocketCode.Ui.I18nTextNode(i18nKey))._dom);
            this._dom.appendChild(label);

            this.name = SmartJs.getNewId();
            if (value)
                this.value = value;
            this._onCheckListener = this._addDomListener(this._input, 'change', function (e) {
                if (this.checked)
                    this._onCheck.dispatchEvent();
            }.bind(this));

            //events
            this._onCheck = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(Radio.prototype, {
            name: {
                //get: function () {
                //    return this._input.name;
                //},
                set: function (name) {
                    this._input.name = name;
                },
            },
            value: {
                get: function () {
                    return this._input.value;
                },
                set: function (value) {
                    this._input.value = value;
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
        Object.defineProperties(Radio.prototype, {
            onCheck: {
                get: function () {
                    return this._onCheck;
                },
            },
        });

        //methods
        Radio.prototype.merge({
            dispose: function () {
                this._removeDomListener(this._input, 'change', this._onCheckListener);
                SmartJs.Ui.Control.prototype.dispose.call(this);    //call super
            },
        });

        return Radio;
    })(),

    Checkbox: (function () {
        Checkbox.extends(SmartJs.Ui.Control, false);

        //cntr
        function Checkbox(i18nKey, value) {
            SmartJs.Ui.Control.call(this, 'div', { className: 'pc-checkbox' });

            this._input = document.createElement('input');
            this._input.setAttribute('type', 'checkbox');
            this._input.id = this.id + '-cb';
            this._dom.appendChild(this._input);

            var label = document.createElement('label');
            label.for = this._input.id;
            label.appendChild((new PocketCode.Ui.I18nTextNode(i18nKey))._dom);
            this._dom.appendChild(label);

            this.name = SmartJs.getNewId();
            if (value)
                this.value = value;
            this._onCheckedChangeListener = this._addDomListener(this._input, 'change', function (e) {
                this._onCheckedChange.dispatchEvent({ checked: this.checked });
            }.bind(this));

            //events
            this._onCheckedChange = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(Checkbox.prototype, {
            //name: {
            //    //get: function () {
            //    //    return this._input.name;
            //    //},
            //    set: function (name) {
            //        this._input.name = name;
            //    },
            //},
            value: {
                get: function () {
                    return this._input.value;
                },
                set: function (value) {
                    this._input.value = value;
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
    })(),
});
