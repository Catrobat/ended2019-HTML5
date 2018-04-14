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
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-webOverlay', style: { position: 'absolute', zIndex: 0 } });

        //settings
        this._minHeight = 200;
        this._marginTopBottom = 15;

        //private controls
        this._header = new SmartJs.Ui.HtmlTag('div', { className: 'pc-dialogHeader' });
        // !!!
        this._captionTextNode = new PocketCode.Ui.I18nTextNode(i18nCaptionKey);
        this._messageTextNode = new PocketCode.Ui.I18nTextNode(i18nMsgKey);
        this._header.appendChild(this._captionTextNode);

        //define the body as inner container
        this._dialog = new SmartJs.Ui.ContainerControl({ className: 'pc-dialog' });
        this._container = new PocketCode.Ui.ScrollContainer({ className: 'pc-dialogBody' }, { className: 'pc-dialogContent' });
        this._footer = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogFooter' });

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
            setTimeout(this._container.onResize.dispatchEvent.bind(this._container.onResize), 0);
            //make sure the scroll position is updated after strings were replaced
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

            var dialog = this._dialog;
            center.appendChild(dialog._dom);

            this.appendChild(this._messageTextNode);
            dialog.appendChild(this._header);
            dialog.appendChild(this._container);
            dialog.appendChild(this._footer);
        },
        /* override */
        _resizeHandler: function (e) {
            var availableHeight = this.height - (this._header.height + this._footer.height + 2 * this._marginTopBottom);
            var minHeight = this._minHeight - (this._header.height + this._footer.height);
            if (availableHeight > minHeight)
                this._container.style.maxHeight = availableHeight + 'px';
            else
                this._container.style.maxHeight = minHeight + 'px';
            this._dialog.style.width = (this.width - 30) + 'px';

            var buttons = this._footer._dom.children;
            for (var i = 0, l = buttons.length; i < l; i++) {
                if (l == 1)
                    buttons[i].style.width = '100%';
                else
                    buttons[i].style.width = ((this._dialog.width - 2 * (l - 1)) / l) + 'px';
            }
            this._container.onResize.dispatchEvent();
        },
        addButton: function (button) {
            if (!(button instanceof PocketCode.Ui.Button))
                throw new Error('invalid argument: button: expected type PocketCode.Ui.Button');

            var count = this._footer._dom.children.length;
            if (count > 1)
                throw new Error('add button: there are currently 2 buttons supported at max');

            this._footer.appendChild(button);
        },
        execDefaultBtnAction: function () {
            if (this.onCancel)
                this.onCancel.dispatchEvent();
            else if (this.onOK)
                this.onOK.dispatchEvent();
        },
    });

    return Dialog;
})();

PocketCode.Ui.merge({
    AskDialog: (function () {
        AskDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function AskDialog(question) {
            PocketCode.Ui.Dialog.call(this);

            this._minHeight = 250;
            if (SmartJs.Device.isMobile) {
                this.style.position = '';   //not absolute to enable resize for mobile browsers keyboard
                this.style.minHeight = (this._minHeight + 2 * this._marginTopBottom) + 'px';
            }

            this._captionTextNode.dispose();
            this._captionTextNode = new SmartJs.Ui.TextNode(question);

            this._scrollContainer = new PocketCode.Ui.ScrollContainer();
            this._header.className = 'pc-askDialogHeader';
            this._header.appendChild(this._scrollContainer);  //scrollcontainer in header
            this._scrollContainer.appendChild(this._captionTextNode);
            if (!question || question.toString().length == 0) {
                this._header.hide();
            }
            else {
                var dir = PocketCode.I18nProvider.getTextDirection(question);
                this._header.dom.dir = dir;
            }

            this._container.dispose();  //this._messageTextNode is getting disposed as well
            this._container = new SmartJs.Ui.ContainerControl({ className: 'pc-askDialogBody' });
            this._messageTextNode = new PocketCode.Ui.I18nTextNode('lblEnterAnswer', '', ':');
            var layout = new SmartJs.Ui.ContainerControl();
            layout.appendChild(this._messageTextNode);
            this._container.appendChild(layout);

            this._answerInput = new SmartJs.Ui.HtmlTag('input');
            this._answerInput.setDomAttribute('dir', 'auto');
            this._answerInput.setDomAttribute('type', 'text');
            this._addDomListener(this._answerInput.dom, 'keypress', function (e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    this._onSubmit.dispatchEvent({ answer: this.answer });
                }
            });
            this._container.appendChild(this._answerInput);
            this._dialog.insertAt(1, this._container);

            this._btnSubmit = new PocketCode.Ui.Button('lblSubmitAnswer');
            this._btnSubmit.onClick.addEventListener(new SmartJs.Event.EventListener(function () {
                this._onSubmit.dispatchEvent({ answer: this.answer });
            }, this));
            this.addButton(this._btnSubmit);

            //event
            this._onSubmit = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(AskDialog.prototype, {
            onSubmit: {
                get: function () {
                    return this._onSubmit;
                },
            },
        });

        //properties
        Object.defineProperties(AskDialog.prototype, {
            answer: {
                get: function () {
                    return this._answerInput.dom.value;
                },
            },
        });

        //methods           
        AskDialog.prototype.merge({
            focusInputField: function () {
                this._answerInput.dom.focus();
            },
            /* override */
            _resizeHandler: function (e) {
                var availableHeight = this.height - (this._container.height + this._footer.height + 2 * this._marginTopBottom + 34);    //including header padding
                var minHeight = this._minHeight - (this._container.height + this._footer.height);
                if (availableHeight > minHeight)
                    this._scrollContainer.style.maxHeight = availableHeight + 'px';
                else
                    this._scrollContainer.style.maxHeight = minHeight + 'px';
                this._dialog.style.width = (this.width - 30) + 'px';

                var buttons = this._footer._dom.children;
                for (var i = 0, l = buttons.length; i < l; i++) {
                    if (l == 1)
                        buttons[i].style.width = '100%';
                    else
                        buttons[i].style.width = ((this._dialog.width - 2 * (l - 1)) / l) + 'px';
                }
                this._scrollContainer.onResize.dispatchEvent();
            },
        });

        return AskDialog;
    })(),

    ErrorDialog: (function () {
        ErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ErrorDialog(i18nCaptionKey, i18nMsgKey) {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, i18nCaptionKey, i18nMsgKey);
            // i18n: lblOk
            this._btnOK = new PocketCode.Ui.Button('lblOk');
            this.addButton(this._btnOK);

            this._sorryMessageTextNode = new PocketCode.Ui.I18nTextNode('msgErrorSorry', '', ' ');
            this.insertAt(0, this._sorryMessageTextNode);

            this._br1 = new SmartJs.Ui.HtmlTag('br');
            this.appendChild(this._br1);
            this._logMessageTextNode = new PocketCode.Ui.I18nTextNode('msgErrorReportGenerated');
            this.appendChild(this._logMessageTextNode);
            this._br1.hide();                   //default
            this._logMessageTextNode.hide();    //default

            this._br2 = new SmartJs.Ui.HtmlTag('br');
            this._br3 = new SmartJs.Ui.HtmlTag('br');
            this.appendChild(this._br2);
            this.appendChild(this._br3);
            this._closeMessageTextNode = new PocketCode.Ui.I18nTextNode('msgErrorExit');
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
                    if (bool) {
                        this._br1.show();
                        this._logMessageTextNode.show();
                    }
                    else {
                        this._br1.hide();
                        this._logMessageTextNode.hide();
                    }
                },
            },
            closeMsgVisible: {
                set: function (bool) {
                    if (bool) {
                        this._br2.show();
                        this._br3.show();
                        this._closeMessageTextNode.show();
                    }
                    else {
                        this._br2.hide();
                        this._br3.hide();
                        this._closeMessageTextNode.hide();
                    }
                },
            },
        });

        return ErrorDialog;
    })(),
});

PocketCode.Ui.merge({
    GlobalErrorDialog: (function () {
        GlobalErrorDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function GlobalErrorDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblGlobalErrorCaption', 'msgGlobalError');
            this.logMsgVisible = true;
        }

        return GlobalErrorDialog;
    })(),

    BrowserNotSupportedDialog: (function () {
        BrowserNotSupportedDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function BrowserNotSupportedDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblBrowserNotSupportedErrorCaption', 'msgBrowserNotSupportedError');

            this.appendChild(new SmartJs.Ui.HtmlTag('br'));
            this.insertAt(2, new SmartJs.Ui.HtmlTag('br'));
            this.insertAt(3, new PocketCode.Ui.I18nTextNode('msgBrowserNotSupportedErrorOther'));
            this.insertAt(4, new SmartJs.Ui.HtmlTag('br'));

            this.logMsgVisible = true;
            this.closeMsgVisible = true;
        }

        return BrowserNotSupportedDialog;
    })(),

    MobileRestrictionDialog: (function () {
        MobileRestrictionDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function MobileRestrictionDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'lblMobileRestrictionsWarningCaption', 'msgMobileRestrictionsWarning');

            this._debugMessage = new PocketCode.Ui.I18nTextNode('msgMobileRestrictionsDebug');
            this.appendChild(new SmartJs.Ui.HtmlTag('br'));
            this.appendChild(new SmartJs.Ui.HtmlTag('br'));
            this.appendChild(this._debugMessage);

            // i18n: lblCancel
            this._btnCancel = new PocketCode.Ui.Button('lblCancel');
            this.addButton(this._btnCancel);
            // i18n: lblConfirm
            this._btnConfirm = new PocketCode.Ui.Button('lblConfirm');
            this.addButton(this._btnConfirm);
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

        return ExitWarningDialog;
    })(),

    ProjectNotFoundDialog: (function () {
        ProjectNotFoundDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function ProjectNotFoundDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblProjectNotFoundErrorCaption', 'msgProjectNotFoundError');
        }

        return ProjectNotFoundDialog;
    })(),

    ProjectNotValidDialog: (function () {
        ProjectNotValidDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function ProjectNotValidDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblProjectNotValidErrorCaption', 'msgProjectNotValidError');
        }

        return ProjectNotValidDialog;
    })(),

    ParserErrorDialog: (function () {
        ParserErrorDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function ParserErrorDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblParserErrorCaption', 'msgParserError');
            this.logMsgVisible = true;
        }

        return ParserErrorDialog;
    })(),

    InternalServerErrorDialog: (function () {
        InternalServerErrorDialog.extends(PocketCode.Ui.ErrorDialog, false);

        //cntr
        function InternalServerErrorDialog() {
            PocketCode.Ui.ErrorDialog.call(this, 'lblInternalServerErrorCaption', 'msgInternalServerError');
            this.logMsgVisible = true;
        }

        return InternalServerErrorDialog;
    })(),

    ServerConnectionErrorDialog: (function () {
        ServerConnectionErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ServerConnectionErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'lblServerConnectionErrorCaption', 'msgServerConnectionError');

            this.appendChild(new SmartJs.Ui.HtmlTag('br'));
            this.appendChild(new PocketCode.Ui.I18nTextNode('msgInternetConnectionAvailable'));

            this._btnCancel = new PocketCode.Ui.Button('lblCancel');
            this.addButton(this._btnCancel);
            this._btnRetry = new PocketCode.Ui.Button('lblRetry');
            this.addButton(this._btnRetry);

            this._onRetry = new SmartJs.Event.Event(this);  //we need the dialog as target here
            this._btnRetry.onClick.addEventListener(new SmartJs.Event.EventListener(this._onRetry.dispatchEvent, this._onRetry));
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
                    return this._onRetry;
                },
            },
        });

        return ServerConnectionErrorDialog;
    })(),

    ProjectLoadingErrorDialog: (function () {
        ProjectLoadingErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ProjectLoadingErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'lblProjectLoadingErrorCaption', 'msgProjectLoadingError');

            this.appendChild(new SmartJs.Ui.HtmlTag('br'));
            this.appendChild(new PocketCode.Ui.I18nTextNode('msgInternetConnectionAvailable'));

            this._btnCancel = new PocketCode.Ui.Button('lblCancel');
            this.addButton(this._btnCancel);
            this._btnRetry = new PocketCode.Ui.Button('lblRetry');
            this.addButton(this._btnRetry);

            this._onRetry = new SmartJs.Event.Event(this);  //we need the dialog as target here
            this._btnRetry.onClick.addEventListener(new SmartJs.Event.EventListener(this._onRetry.dispatchEvent, this._onRetry));
        }

        //events
        Object.defineProperties(ProjectLoadingErrorDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._btnCancel.onClick;
                },
            },
            onRetry: {
                get: function () {
                    return this._onRetry;
                },
            },
        });

        return ProjectLoadingErrorDialog;
    })(),

    ProjectLoadingAlertDialog: (function () {
        ProjectLoadingAlertDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ProjectLoadingAlertDialog(i18nAlerts, i18nWarnings) {
            if (!(i18nAlerts instanceof Array))
                throw new Error('invalid parameter: i18nAlerts');
            if (i18nWarnings && !(i18nWarnings instanceof Array))
                throw new Error('invalid parameter: i18nWarnings');

            if (i18nWarnings && i18nWarnings.length > 0)
                PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'msgUnsupportedWarningCaption', 'msgUnsupportedDefault');
            else
                PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.DEFAULT, 'msgUnsupportedDefaultCaption', 'msgUnsupportedDefault');

            this._container.style.textAlign = 'inherit';

            this._btnCancel = new PocketCode.Ui.Button('lblCancel');
            this.addButton(this._btnCancel);
            this._btnContinue = new PocketCode.Ui.Button('lblContinue');
            this._btnContinue.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onContinue.dispatchEvent(); }, this));
            this.addButton(this._btnContinue);

            //msg
            if (i18nAlerts.length > 0) {
                this._msgUl = new SmartJs.Ui.HtmlTag('ul', { style: { color: '#33B5E5' } });
                this._container.appendChild(this._msgUl);

                for (var i = 0, l = i18nAlerts.length; i < l; i++) {
                    this._addLiItem(i18nAlerts[i], this._msgUl);
                }
            }
            else
                this._messageTextNode.i18n = 'msgUnsupportedWarning';

            //warning
            if (i18nWarnings && i18nWarnings.length > 0) {
                if (i18nAlerts.length > 0)
                    this._container.appendChild(new PocketCode.Ui.I18nTextNode('msgUnsupportedWarning'));
                this._warningUl = new SmartJs.Ui.HtmlTag('ul', { style: { color: '#EF7716' } });

                for (var i = 0, l = i18nWarnings.length; i < l; i++) {
                    this._addLiItem(i18nWarnings[i], this._warningUl);
                }
                this._container.appendChild(this._warningUl);
                this._container.appendChild(new PocketCode.Ui.I18nTextNode('msgUnsupportedWarningContinue'));
            }

            //event
            this._onContinue = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(ProjectLoadingAlertDialog.prototype, {
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
        ProjectLoadingAlertDialog.prototype.merge({
            _addLiItem: function (i18nKey, ul) {
                var li = new SmartJs.Ui.HtmlTag('li');
                li.appendChild(new PocketCode.Ui.I18nTextNode(i18nKey));
                ul.appendChild(li);
            },
        });

        return ProjectLoadingAlertDialog;
    })(),

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
                this._downloadForm.action = PocketCode._serviceEndpoint + 'file/screenshot/';
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
                if (this._btnDownload)
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