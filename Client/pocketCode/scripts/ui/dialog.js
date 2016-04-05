/// <reference path='../../../smartJs/sj.js' />
/// <reference path='../../../smartJs/sj-core.js' />
/// <reference path='../../../smartJs/sj-event.js' />
/// <reference path='../../../smartJs/sj-ui.js' />
/// <reference path='../core.js' />
/// <reference path='../ui.js' />
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
    function Dialog(type, i18nCaptionKey, i18nMsgKey) {
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-webOverlay', style: { position: 'absolute' } });

        //settings
        this._minHeight = 200;
        this._marginTopBottom = 15;

        //private controls
        this._header = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogHeader' });
        // !!!
        this._captionTextNode = new PocketCode.Ui.I18nTextNode(i18nCaptionKey);
        this._messageTextNode = new PocketCode.Ui.I18nTextNode(i18nMsgKey);
        this._header.appendChild(this._captionTextNode);

        //define the body as inner container
        this._dialog = new SmartJs.Ui.ContainerControl({ className: 'pc-dialog' });
        this._container = new PocketCode.Ui.ScrollContainer({ className: 'pc-dialogBody' }, { className: 'pc-dialogContent' });
        this._footer = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogFooter' });// dialogFooterSingleButton' });

        this._createLayout();

        this._type = type || PocketCode.Ui.DialogType.DEFAULT;
        this.type = this._type;

        this._onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
        this._languageChangeListener = new SmartJs.Event.EventListener(this._updateUiStrings, this);
        PocketCode.I18nProvider.onLanguageChange.addEventListener(this._languageChangeListener);
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
        i18nCaptionKey: {
            get: function () {
                return this._captionTextNode.text;
            },
            set: function (i18nKey) {
                if (typeof i18nKey !== 'string')
                    throw new error('invalid argument: caption: expected type = string');
                this._captionTextNode.i18n = i18nKey;
            },
        },
    });

    //methods
    Dialog.prototype.merge({
        _updateUiStrings: function () {
            //TODO: override this in the individual controls
        },
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

            var dialog = this._dialog;//new SmartJs.Ui.ContainerControl({ className: 'pc-dialog' });
            center.appendChild(dialog._dom);

            this.appendChild(this._messageTextNode);
            dialog.appendChild(this._header);
            dialog.appendChild(this._container);
            dialog.appendChild(this._footer);
        },
        /* override */
        //verifyResize: function(caller) {
        //    SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this, this);
        //    if (this._container)    //this method is typically called when setting a css class and therefor before initialising the container element
        //        this._container.verifyResize(this);
        //},
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

PocketCode.Ui.ErrorDialog = (function () {
    ErrorDialog.extends(PocketCode.Ui.Dialog, false);

    //cntr
    function ErrorDialog(i18nCaptionKey, i18nMsgKey) {
        PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, i18nCaptionKey, i18nMsgKey);
        // i18n: lblOk
        this._btnOK = new PocketCode.Ui.Button('lblOk');
        this.addButton(this._btnOK);

        this._sorryMessageTextNode = new PocketCode.Ui.I18nTextNode('msgErrorSorry', '\n');
        this.insertAt(0, this._sorryMessageTextNode);
        this._logMessageTextNode = new PocketCode.Ui.I18nTextNode('lblErrorReportGenerated', '\n');
        this._logMessageTextNode.hide();    //default
        this.appendChild(this._logMessageTextNode);
        this._closeMessageTextNode = new PocketCode.Ui.I18nTextNode('msgErrorExit', '\n');
        this.appendChild(this._closeMessageTextNode);
    }

    //events
    Object.defineProperties(ErrorDialog.prototype, {
        onOK: {
            get: function () {
                return this._btnOK.onClick;
            },
        },
    });

    //properties
    Object.defineProperties(ErrorDialog.prototype, {
        logMsgVisible: {
            set: function (bool) {
                if (bool)
                    this._logMessageTextNode.show();
                else
                    this._logMessageTextNode.hide();
            },
        },
        closeMsgVisible: {
            set: function (bool) {
                if (bool)
                    this._closeMessageTextNode.show();
                else
                    this._closeMessageTextNode.hide();
            },
        },
    });

    //methods
    //ErrorDialog.prototype.merge({
    //    /* override */
    //    handleHistoryBack: function () {
    //        this.onOK.dispatchEvent();
    //    },
    //});

    return ErrorDialog;
})();

PocketCode.Ui.merge({
    GlobalErrorDialog: (function () {
        GlobalErrorDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function GlobalErrorDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblGlobalErrorCaption', 'msgGlobalError');
            this._logMessageTextNode.show();
            //// i18n: lblOk
            //this._btnOK = new PocketCode.Ui.Button('lblOk');
            //this.addButton(this._btnOK);

            // i18n: msgGlobal
            // ??
            //this.innerHTML = PocketCode.I18nProvider.getLocString('msgGlobal');
        }

        //events
        //Object.defineProperties(GlobalErrorDialog.prototype, {
        //    onOK: {
        //        get: function () {
        //            return this._btnOK.onClick;
        //        },
        //    },
        //});

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
        BrowserNotSupportedDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function BrowserNotSupportedDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblBrowserNotSupportedErrorCaption', 'msgBrowserNotSupportedError');
            this._logMessageTextNode.show();
            // i18n: lblOk
            //this._btnOK = new PocketCode.Ui.Button('lblOk');
            //this.addButton(this._btnOK);

            // i18n: msgBrowserNotSupported
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgBrowserNotSupported');
        }

        //events
        //Object.defineProperties(BrowserNotSupportedDialog.prototype, {
        //    onOK: {
        //        get: function () {
        //            return this._btnOK.onClick;
        //        },
        //    },
        //});

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
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'lblMobileRestrictionsWarningCaption', 'msgMobileRestrictionsWarning');

            this._debugMessage = new PocketCode.Ui.I18nTextNode('msgMobileRestrictionsDebug', '\n');
            this.appendChild(this._debugMessage);

            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button('lblCancel');
            this.addButton(this._btnCancel);
            // i18n: lblConfirm
            this._btnConfirm = new PocketCode.Ui.Button('lblConfirm');
            this.addButton(this._btnConfirm);

            // i18n: msgMobileRestrictions
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgMobileRestrictions');
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
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.DEFAULT, 'lblExitDialogCaption', 'msgExitDialog');
            // i18n: lblExit
            this._btnExit = new PocketCode.Ui.Button('lblExit');
            this.addButton(this._btnExit);
            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button('lblCancel');
            this._btnCancel.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onCancel.dispatchEvent(); }, this));
            this.addButton(this._btnCancel);

            // i18n: msgExit
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgExit');
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
        ProjectNotFoundDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function ProjectNotFoundDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblProjectNotFoundErrorCaption', 'msgProjectNotFoundError');
            // i18n: lblOk
            //this._btnOK = new PocketCode.Ui.Button('lblOk');
            //this.addButton(this._btnOK);

            // i18n: msgProjectNotFound
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgProjectNotFound');
        }

        //events
        //Object.defineProperties(ProjectNotFoundDialog.prototype, {
        //    onOK: {
        //        get: function () {
        //            return this._btnOK.onClick;
        //        },
        //    },
        //});

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
        ProjectNotValidDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function ProjectNotValidDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblProjectNotValidErrorCaption', 'msgProjectNotValidError');
            // i18n: lblOk
            //this._btnOK = new PocketCode.Ui.Button('lblOk');
            //this.addButton(this._btnOK);

            // i18n: msgProjectNotValid
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgProjectNotValid');
        }

        //events
        //Object.defineProperties(ProjectNotValidDialog.prototype, {
        //    onOK: {
        //        get: function () {
        //            return this._btnOK.onClick;
        //        },
        //    },
        //});

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
        ParserErrorDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function ParserErrorDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblParserErrorCaption', 'msgParserError');
            this._logMessageTextNode.show();
            // i18n: lblOk
            //this._btnOK = new PocketCode.Ui.Button('lblOk');
            //this.addButton(this._btnOK);

            // i18n: msgParser
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgParser');
        }

        //events
        //Object.defineProperties(ParserErrorDialog.prototype, {
        //    onOK: {
        //        get: function () {
        //            return this._btnOK.onClick;
        //        },
        //    },
        //});

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
        InternalServerErrorDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function InternalServerErrorDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblInternalServerErrorCaption', 'msgInternalServerError');
            this._logMessageTextNode.show();
            // i18n: lblOk
            //this._btnOK = new PocketCode.Ui.Button('lblOk');
            //this.addButton(this._btnOK);

            // i18n: msgInternalServer
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgInternalServer');
        }

        //events
        //Object.defineProperties(InternalServerErrorDialog.prototype, {
        //    onOK: {
        //        get: function () {
        //            return this._btnOK.onClick;
        //        },
        //    },
        //});

        //methods
        //InternalServerErrorDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return InternalServerErrorDialog;
    })(),

    //ServerConnectionErrorDialog: (function () {
    //    ServerConnectionErrorDialog.extends(PocketCode.Ui.Dialog, false);

    //    //cntr
    //    function ServerConnectionErrorDialog() {
    //        PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'lblServerConnectionErrorCaption', 'msgServerConnectionError');
    //        // i18n: lblCancel
    //        this._btnCancel = new PocketCode.Ui.Button('lblCancel');
    //        this.addButton(this._btnCancel);
    //        // i18n: lblRetry
    //        this._btnRetry = new PocketCode.Ui.Button('lblRetry');
    //        this.addButton(this._btnRetry);

    //        // i18n: msgServerConnection
    //        // ??
    //        //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgServerConnection');
    //    }

    //    //events
    //    Object.defineProperties(ServerConnectionErrorDialog.prototype, {
    //        onCancel: {
    //            get: function () {
    //                return this._btnCancel.onClick;
    //            },
    //        },
    //        onRetry: {
    //            get: function () {
    //                return this._btnRetry.onClick;
    //            },
    //        },
    //    });

    //    //methods
    //    //ServerConnectionErrorDialog.prototype.merge({
    //    //    /* override */
    //    //    handleHistoryBack: function () {
    //    //        this.onOK.dispatchEvent();
    //    //    },
    //    //});

    //    return ServerConnectionErrorDialog;
    //})(),

    UnsupportedFeatureDialog: (function () {
        UnsupportedFeatureDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function UnsupportedFeatureDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'lblUnsupportedSoundWarningCaption', 'msgUnsupportedSoundWarning');
            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button('lblCancel');
            this.addButton(this._btnCancel);
            // i18n: lblContinue
            this._btnContinue = new PocketCode.Ui.Button('lblContinue');
            this._btnContinue.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onContinue.dispatchEvent(); }, this));
            this.addButton(this._btnContinue);

            // i18n: msgUnsupportedSound
            // ??
            //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgUnsupportedSound');
            this._onContinue = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(UnsupportedFeatureDialog.prototype, {
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
        //UnsupportedFeatureDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        //});

        return UnsupportedFeatureDialog;
    })(),

    //UnsupportedSoundFileDialog: (function () {
    //    UnsupportedSoundFileDialog.extends(PocketCode.Ui.Dialog, false);

    //    //cntr
    //    function UnsupportedSoundFileDialog() {
    //        PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'lblUnsupportedSoundWarningCaption', 'msgUnsupportedSoundWarning');
    //        // i18n: lblCancel
    //        this._btnCancel = new PocketCode.Ui.Button('lblCancel');
    //        this.addButton(this._btnCancel);
    //        // i18n: lblContinue
    //        this._btnContinue = new PocketCode.Ui.Button('lblContinue');
    //        this._btnContinue.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onContinue.dispatchEvent(); }, this));
    //        this.addButton(this._btnContinue);

    //        // i18n: msgUnsupportedSound
    //        // ??
    //        //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgUnsupportedSound');
    //        this._onContinue = new SmartJs.Event.Event(this);
    //    }

    //    //events
    //    Object.defineProperties(UnsupportedSoundFileDialog.prototype, {
    //        onCancel: {
    //            get: function () {
    //                return this._btnCancel.onClick;
    //            },
    //        },
    //        onContinue: {
    //            get: function () {
    //                return this._onContinue;
    //            },
    //        },
    //    });

    //    //methods
    //    //UnsupportedSoundFileDialog.prototype.merge({
    //    //    /* override */
    //    //    handleHistoryBack: function () {
    //    //        this.onCancel.dispatchEvent();
    //    //    },
    //    //});

    //    return UnsupportedSoundFileDialog;
    //})(),

    //UnsupportedBrickDialog

    //DeviceFeatureInUseDialog

    //UnsupportedDeviceFeatureDialog: (function () {
    //    UnsupportedDeviceFeatureDialog.extends(PocketCode.Ui.Dialog, false);

    //    //cntr
    //    function UnsupportedDeviceFeatureDialog() {
    //        PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'lblUnsupportedDeviceFeatureWarningCaption', 'msgUnsupportedDeviceFeatureWarning');
    //        // i18n: lblCancel
    //        this._btnCancel = new PocketCode.Ui.Button('lblCancel');
    //        this.addButton(this._btnCancel);
    //        // i18n: lblContinue
    //        this._btnContinue = new PocketCode.Ui.Button('lblContinue');
    //        this._btnContinue.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onContinue.dispatchEvent(); }, this));
    //        this.addButton(this._btnContinue);

    //        // i18n: msgUnsupportedDevice
    //        // ??
    //        //this.bodyInnerHTML = PocketCode.I18nProvider.getLocString('msgUnsupportedDevice');
    //        this._onContinue = new SmartJs.Event.Event(this);
    //    }

    //    //events
    //    Object.defineProperties(UnsupportedDeviceFeatureDialog.prototype, {
    //        onCancel: {
    //            get: function () {
    //                return this._btnCancel.onClick;
    //            },
    //        },
    //        onContinue: {
    //            get: function () {
    //                return this._onContinue;
    //            },
    //        },
    //    });

    //    //methods
    //    //UnsupportedDeviceFeatureDialog.prototype.merge({
    //    //    /* override */
    //    //    handleHistoryBack: function () {
    //    //        this.onCancel.dispatchEvent();
    //    //    },
    //    //});

    //    return UnsupportedDeviceFeatureDialog;
    //})(),

    ScreenshotDialog: (function () {
        ScreenshotDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ScreenshotDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.DEFAULT, 'lblScreenshotCaption');
            this._btnCancel = new PocketCode.Ui.Button('lblClose');
            this._btnCancel.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onCancel.dispatchEvent(); }, this));
            this.addButton(this._btnCancel);
            
            this._screenshotImage = new SmartJs.Ui.Image({ style: { width: '100%' } });
            this._screenshotImage.onLoad.addEventListener(new SmartJs.Event.EventListener(this._imageOnLoadHandler, this));

            if (SmartJs.Device.isMobile) {
                this._addDomListener(this._screenshotImage._dom, 'touchstart', function (e) {
                    //make sure event is bubbled to enable image download
                }, { stopPropagation: false, systemAllowed: true });
                
                this._screenshotImage.style.paddingTop = '10px';
                this._messageTextNode.i18n = 'msgScreenshotMobile';
                //this._container.appendChild(new PocketCode.Ui.I18nTextNode('msgScreenshotMobile'));
            }
            else {
                //remove message
                this._messageTextNode.dispose();
                //add download form
                this._downloadForm = document.createElement('form');
                this._downloadForm.style.margin = 0;
                this._downloadForm.style.padding = 0;
                this._downloadForm.method = 'POST';
                this._downloadForm.action = 'https://web-test.catrob.at/html5/rest/v0.1/file/screenshot/';
                this._downloadInput = document.createElement('input');
                this._downloadInput.type = 'hidden';
                this._downloadInput.name = 'base64string';

                this._downloadForm.appendChild(this._downloadInput);
                this._dom.appendChild(this._downloadForm);

                this._btnDownload = new PocketCode.Ui.Button('lblDownload');
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
        });
                
        //methods
        ScreenshotDialog.prototype.merge({
            _imageOnLoadHandler: function () {
                if(this._btnDownload)
                    this._btnDownload.disabled = false;
                window.setTimeout(this._container.onResize.dispatchEvent.bind(this._container.onResize), 10);
            },
            download: function () {
                if (this._downloadForm)
                    this._downloadForm.submit();
            }
        });

        return ScreenshotDialog;
    })(),

});