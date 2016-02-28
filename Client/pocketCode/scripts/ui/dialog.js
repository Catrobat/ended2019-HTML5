/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';


/**
 * dialog dialog types
 * @type {{DEFAULT: string, WARNING: string, ERROR: string}}
 */
PocketCode.Ui.DialogType = {
    DEFAULT: 0,
    WARNING: 1,
    ERROR: 2,
};

PocketCode.Ui.Dialog = (function () {
    Dialog.extends(SmartJs.Ui.ContainerControl, false);

    //cntr
    function Dialog(type, caption) {
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-webOverlay', style: { position: 'absolute' } });

        //settings
        this._minHeight = 200;
        this._marginTopBottom = 15;

        //private controls
        this._header = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogHeader' });
        this._captionTextNode = new SmartJs.Ui.TextNode();
        this._header.appendChild(this._captionTextNode);

        //define the body as inner container
        this._container = new PocketCode.Ui.ScrollContainer({ className: 'pc-dialogBody' }, { className: 'pc-dialogContent' });
        this._footer = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogFooter' });// dialogFooterSingleButton' });

        this._createLayout();

        this._type = type || PocketCode.Ui.DialogType.DEFAULT;
        this.type = this._type;

        if (caption) {
            this.caption = caption;
        }

        this._onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
    }

    //properties
    Object.defineProperties(Dialog.prototype, {
        type: {
            get: function () {
                return this._type;
            },
            set: function (value) {
                switch (value) {
                    case PocketCode.Ui.DialogType.DEFAULT:
                        this._header.className = 'pc-dialogHeader';
                        break;
                    case PocketCode.Ui.DialogType.WARNING:
                        this._header.className = 'pc-dialogHeader pc-dialogWarning';
                        break;
                    case PocketCode.Ui.DialogType.ERROR:
                        this._header.className = 'pc-dialogHeader pc-dialogError';
                        break;
                    default:
                        throw new Error('invalid argument: dialog type');
                }
                this._type = value;
            },
        },
        caption: {
            get: function () {
                return this._captionTextNode.text;
            },
            set: function (value) {
                if (typeof value !== 'string')
                    throw new error('invalid argument: caption: expected type = string');
                this._captionTextNode.text = value;
            },
        },
        bodyInnerHTML: {
            get: function () {
                return this._container.innerHTML;
            },
            set: function (value) {
                this._container.innerHTML = value;
            },
        },
    });

    //methods
    Dialog.prototype.merge({
        _createLayout: function () {
            var background = document.createElement('div');
            background.className = 'pc-dialogOverlay';
            this._dom.appendChild(background);

            var layout = document.createElement('div');
            layout.className = 'pc-webLayout';
            this._dom.appendChild(layout);

            var layoutRow = document.createElement('div');
            layoutRow.className = 'pc-webLayoutRow';
            layout.appendChild(layoutRow);

            var col = document.createElement('div');
            col.className = 'pc-dialogCol';
            layoutRow.appendChild(col);

            var center = document.createElement('div');
            center.className = 'pc-centerCol';
            layoutRow.appendChild(center);

            col = document.createElement('div');
            col.className = 'pc-dialogCol';
            layoutRow.appendChild(col);

            var dialog = new SmartJs.Ui.ContainerControl({ className: 'pc-dialog' });
            center.appendChild(dialog._dom);

            dialog.appendChild(this._header);
            dialog.appendChild(this._container);
            dialog.appendChild(this._footer);
            this._dialog = dialog;
        },
        /* override */
        verifyResize: function(caller) {
            SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this, this);
            if (this._container)    //this method is typically called when setting a css class and therefor before initialising the container element
                this._container.verifyResize(this);
        },
        _resizeHandler: function (e) {
            var availableHeight = this.height - (this._header.height + this._footer.height + 2 * this._marginTopBottom);
            var minHeight = this._minHeight - (this._header.height + this._footer.height);
            if (availableHeight > minHeight)
                this._container.style.maxHeight = availableHeight + 'px';
            else
                this._container.style.maxHeight = minHeight + 'px';
            //var width = this.width - 30;
            this._dialog.style.width = (this.width - 30) + 'px';//width + 'px';

            var buttons = this._footer._dom.children;
            for (var i = 0, l = buttons.length; i < l; i++)
                if (l == 1)
                    buttons[i].style.width = '100%';
                else
                    buttons[i].style.width = ((this._dialog.width - 2 * (l - 1)) / l) + 'px';

            //this._container.verifyResize(this); //=SmartJs.Ui.ContainerControl.prototype...
        },
        addButton: function (button) {
            if (!(button instanceof PocketCode.Ui.Button))
                throw new Error('invalid argument: button: expected type PocketCode.Ui.Button');

            var count = this._footer._dom.children.length;
            if (count > 1)
                throw new Error('add button: there are currently 2 buttons supported at max');

            this._footer.appendChild(button);
            //if (count == 1)
            //    this._footer.replaceClassName('dialogFooterSingleButton', 'dialogFooterTwoButtons');
        },
        execDefaultBtnAction: function() {
            //_callHistoryBack: function () {
            //    this.hide();
            //    if (SmartJs.Device.isMobile)
            //        history.back();
            //this method should be overridden to implement specific functionality on browser-back navigation
            //e.g. calling dispatch() on the default buttons click event
            if (this.onCancel)
                this.onCancel.dispatchEvent();
            else if (this.onOK)
                this.onOK.dispatchEvent();
        },
    });

    return Dialog;
})();

PocketCode.Ui.merge({
    GlobalErrorDialog: (function () {
        GlobalErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function GlobalErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Global Error');
            // i18n: lblOk
            this._btnOK = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblOk'));
            this.addButton(this._btnOK);

            // i18n: msgGlobal
            this.innerHTML = PocketCode.I18nProvider.translate('msgGlobal');
        }

        //events
        Object.defineProperties(GlobalErrorDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //GlobalErrorDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return GlobalErrorDialog;
    })(),

    BrowserNotSupportedDialog: (function () {
        BrowserNotSupportedDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function BrowserNotSupportedDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Framework Not Supported');
            // i18n: lblOk
            this._btnOK = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblOk'));
            this.addButton(this._btnOK);

            // i18n: msgBrowserNotSupported
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgBrowserNotSupported');
        }

        //events
        Object.defineProperties(BrowserNotSupportedDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //BrowserNotSupportedDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return BrowserNotSupportedDialog;
    })(),

    MobileRestrictionDialog: (function () {
        MobileRestrictionDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function MobileRestrictionDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'Please Confirm');
            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblCancel'));
            this.addButton(this._btnCancel);
            // i18n: lblConfirm
            this._btnConfirm = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblConfirm'));
            this.addButton(this._btnConfirm);

            // i18n: msgMobileRestrictions
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgMobileRestrictions');
        }

        //events
        Object.defineProperties(MobileRestrictionDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._btnCancel.onClick;
                },
            },
            onConfirm: {
                get: function () {
                    return this._btnConfirm.onClick;
                },
            },
        });

        //methods
        //MobileRestrictionDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        //});

        return MobileRestrictionDialog;
    })(),

    ExitWarningDialog: (function () {
        ExitWarningDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ExitWarningDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.DEFAULT, 'Exit Application');
            // i18n: lblExit
            this._btnExit = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblExit'));
            this.addButton(this._btnExit);
            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblCancel'));
            this._btnCancel.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onCancel.dispatchEvent(); }, this));
            this.addButton(this._btnCancel);

            // i18n: msgExit
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgExit');
            this._onCancel = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(ExitWarningDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._onCancel;
                },
            },
            onExit: {
                get: function () {
                    return this._btnExit.onClick;
                },
            },
        });

        ////methods
        //ExitWarningDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onExit.dispatchEvent();
        //    },
        //});

        return ExitWarningDialog;
    })(),

    ProjectNotFoundDialog: (function () {
        ProjectNotFoundDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ProjectNotFoundDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Project Not Found');
            // i18n: lblOk
            this._btnOK = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblOk'));
            this.addButton(this._btnOK);

            // i18n: msgProjectNotFound
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgProjectNotFound');
        }

        //events
        Object.defineProperties(ProjectNotFoundDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //ProjectNotFoundDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return ProjectNotFoundDialog;
    })(),

    ProjectNotValidDialog: (function () {
        ProjectNotValidDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ProjectNotValidDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Project Not Valid');
            // i18n: lblOk
            this._btnOK = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblOk'));
            this.addButton(this._btnOK);

            // i18n: msgProjectNotValid
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgProjectNotValid');
        }

        //events
        Object.defineProperties(ProjectNotValidDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //ProjectNotValidDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return ProjectNotValidDialog;
    })(),

    ParserErrorDialog: (function () {
        ParserErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ParserErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Error Parsing Project');
            // i18n: lblOk
            this._btnOK = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblOk'));
            this.addButton(this._btnOK);

            // i18n: msgParser
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgParser');
        }

        //events
        Object.defineProperties(ParserErrorDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //ParserErrorDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return ParserErrorDialog;
    })(),

    InternalServerErrorDialog: (function () {
        InternalServerErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function InternalServerErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Internal Server Error');
            // i18n: lblOk
            this._btnOK = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblOk'));
            this.addButton(this._btnOK);

            // i18n: msgInternalServer
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgInternalServer');
        }

        //events
        Object.defineProperties(InternalServerErrorDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //InternalServerErrorDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return InternalServerErrorDialog;
    })(),

    ServerConnectionErrorDialog: (function () {
        ServerConnectionErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ServerConnectionErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Server Not Responding');
            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblCancel'));
            this.addButton(this._btnCancel);
            // i18n: lblRetry
            this._btnRetry = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblRetry'));
            this.addButton(this._btnRetry);

            // i18n: msgServerConnection
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgServerConnection');
        }

        //events
        Object.defineProperties(ServerConnectionErrorDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._btnCancel.onClick;
                },
            },
            onRetry: {
                get: function () {
                    return this._btnRetry.onClick;
                },
            },
        });

        //methods
        //ServerConnectionErrorDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return ServerConnectionErrorDialog;
    })(),

    UnsupportedSoundFileDialog: (function () {
        UnsupportedSoundFileDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function UnsupportedSoundFileDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'Unsupported Sound File');
            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblCancel'));
            this.addButton(this._btnCancel);
            // i18n: lblContinue
            this._btnContinue = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblContinue'));
            this._btnContinue.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onContinue.dispatchEvent(); }, this));
            this.addButton(this._btnContinue);

            // i18n: msgUnsupportedSound
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgUnsupportedSound');
            this._onContinue = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(UnsupportedSoundFileDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._btnCancel.onClick;
                },
            },
            onContinue: {
                get: function () {
                    return this._onContinue;
                },
            },
        });

        //methods
        //UnsupportedSoundFileDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        //});

        return UnsupportedSoundFileDialog;
    })(),

    //UnsupportedBrickDialog

    //DeviceFeatureInUseDialog

    UnsupportedDeviceFeatureDialog: (function () {
        UnsupportedDeviceFeatureDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function UnsupportedDeviceFeatureDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'Unsupported Device Feature');
            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblCancel'));
            this.addButton(this._btnCancel);
            // i18n: lblContinue
            this._btnContinue = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblContinue'));
            this._btnContinue.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onContinue.dispatchEvent(); }, this));
            this.addButton(this._btnContinue);

            // i18n: msgUnsupportedDevice
            this.bodyInnerHTML = PocketCode.I18nProvider.translate('msgUnsupportedDevice');
            this._onContinue = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(UnsupportedDeviceFeatureDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._btnCancel.onClick;
                },
            },
            onContinue: {
                get: function () {
                    return this._onContinue;
                },
            },
        });

        //methods
        //UnsupportedDeviceFeatureDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        //});

        return UnsupportedDeviceFeatureDialog;
    })(),

    ScreenshotDialog: (function () {
        ScreenshotDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ScreenshotDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.DEFAULT, 'Screenshot');
            // i18n: lblClose
            this._btnCancel = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblClose'));
            this._btnCancel.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onCancel.dispatchEvent(); }, this));
            this.addButton(this._btnCancel);
            
            //var imageBorder = new SmartJs.Ui.ContainerControl({ className: 'pc-screenshotContainer' });
            this._screenshotImage = new SmartJs.Ui.Image();
            //var origin = PocketCode.crossOrigin;
            //if (origin.initialized && origin.current && origin.supported)
            //    this._screenshotImage.crossOrigin = 'anonymous';
            this._screenshotImage.onLoad.addEventListener(new SmartJs.Event.EventListener(this._imageOnLoadHandler, this));

            //imageBorder.appendChild(this._screenshotImage);
            //this.appendChild(this._screenshotImage);//imageBorder);   //we have to add it onload

            if (SmartJs.Device.isMobile) {
                this.bodyInnerHTML += 'TODO: mobile';

                this.onResize.addEventListener(new SmartJs.Event.EventListener(this._onResizeHandler, this));
            }
            else {
                //add download form
                this._downloadForm = document.createElement('form');
                this._downloadForm.style = 'margin: 0; padding: 0;';
                this._downloadForm.method = 'POST';
                this._downloadForm.action = 'https://web-test.catrob.at/html5/rest/v0.1/file/screenshot/';
                this._downloadInput = document.createElement('input');
                this._downloadInput.type = 'hidden';
                this._downloadInput.name = /*this._downloadInput.id =*/ 'base64string';

                this._downloadForm.appendChild(this._downloadInput);
                this._dom.appendChild(this._downloadForm);

                // i18n: lblDownload
                this._btnDownload = new PocketCode.Ui.Button(PocketCode.I18nProvider.translate('lblDownload'));
                this._btnDownload.disabled = true;
                this._btnDownload.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onDownload.dispatchEvent(); }, this));
                this.addButton(this._btnDownload);

            }

            this._onCancel = new SmartJs.Event.Event(this);
            this._onDownload = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(ScreenshotDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._onCancel;
                },
            },
            onDownload: {
                get: function () {
                    return this._onDownload;
                },
            },
        });

        //properties
        Object.defineProperties(ScreenshotDialog.prototype, {
            imageSrc: {
                set: function (src) {
                    if (this._downloadInput)
                        this._downloadInput.value = src;
                    this._screenshotImage.src = src;
                    this.appendChild(this._screenshotImage);
                    //^^ this is necessary to include the src prop in DOM and make the image visible (rerender image tag)
                },
            },
            //requestForm: {
            //    get: function () {
            //        return; //TODO: getter for http request form (download)
            //    },
            //},
        });
                
        //methods
        ScreenshotDialog.prototype.merge({
            _imageOnLoadHandler: function () {
                //var img = this._screenshotImage,//._dom,    //TODO: move this to resize?
                //    w = img.naturalWidth,
                //    h = img.naturalHeight;
                //img.width = 250;
                //img.height = 300;
                //this._onResizeHandler();

                if(this._btnDownload)
                    this._btnDownload.disabled = false;
            },
            _onResizeHandler: function () {
                //this handler is called only once in desktop app by _imageOnLoadHandler
                if (SmartJs.Device.isMobile) {
                    //TODO: screenshot without scroll container on mobile devices to enable long-tab download 
                }
                //var img = this._screenshotImage;
                //var scale = Math.min(this._container.width/img.naturalWidth, this._container.height/img.naturalHeight);
                //this._screenshotImage.width = img.naturalWidth * scale * 0.75;    //TODO:
                //this._screenshotImage.height = img.naturalHeight * scale * 0.75;
            },

            download: function () {
                this._downloadForm.submit();
                //var link = document.createElement('a');
                //link.href =  this._screenshotImage.src;
                //link.download = 'Screenshot.png';
                //document.body.appendChild(link);
                //link.click();
                //document.body.removeChild(link);
            }
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        });

        return ScreenshotDialog;
    })(),

});