'use strict';

PocketCode.CodeView.Ui.merge({

    CodeListing: (function() {
        CodeListing.extends(PocketCode.Ui.ScrollContainer, false);

        //cntr
        function CodeListing() {
            PocketCode.Ui.ScrollContainer.call(this, { style: {minHeight: '100%' } });//, { className: 'pc-CodeListing' });
            var ul = new SmartJs.Ui.HtmlTag('ul', { className: 'pc-codeListing' });
            this.appendChild(ul);
            this._container = ul;
        }

        //properties
        Object.defineProperties(CodeListing.prototype, {
            scaleBricksToWidth: {
                set: function (value) {
                    if (!!value)
                        this._container.style.display = 'block';
                    else
                        this._container.style.display = '';
                },
            },
        });

        return CodeListing;
    })(),

    CodeContainer: (function () {
        CodeContainer.extends(SmartJs.Ui.ContainerControl, false);

        //cntr
        function CodeContainer(i18nKey) {
            SmartJs.Ui.ContainerControl.call(this, { className: 'pc-codeContainer' });
            var debugContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-debugContainer' });
            var code = new PocketCode.CodeView.Ui.CodeListing();
            debugContainer.appendChild(code);
            this.appendChild(debugContainer);
            this._container = code;
            this._zoom = 1.0;
        }

        //properties
        Object.defineProperties(CodeContainer.prototype, {
            zoom: {
                set: function (value) {
                    if (isNaN(value))
                        throw new Error('invalid zoom level: expected type: number');
                    this._zoom = value;
                    this.style.fontSize = (this._zoom * 10) + 'px';
                },
            },
            scaleBricksToWidth: {
                set: function (value) {
                    this._container.scaleBricksToWidth = value;
                },
            },
            showAsCode: {
                set: function (value) {
                    if (!!value)
                        this._container.addClassName('pc-code');
                    else
                        this._container.removeClassName('pc-code');
                },
            },
            indentsEnabled: {
                set: function (value) {
                    if (!!value)
                        this._container.addClassName('pc-indents');
                    else
                        this._container.removeClassName('pc-indents');
                },
            },
            selectEnabled: {
                set: function (value) {
                    if (!!value)
                        this._container.addClassName('pc-selectable');
                    else
                        this._container.removeClassName('pc-selectable');
                },
            },
            debugEnabled: {
                set: function (value) {
                    if (!!value)
                        this.addClassName('pc-debugEnabled');
                    else
                        this.removeClassName('pc-debugEnabled');
                },
            },
        });

        //methods
        CodeContainer.prototype.merge({

        });

        return CodeContainer;
    })(),

});
