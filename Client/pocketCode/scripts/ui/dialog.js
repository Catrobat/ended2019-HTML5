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
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry. A global exception was detected.<br/>Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.';
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
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'This application makes use of html5 features but is tested to be compatible with the latest versions of all common browsers. <br />We are sorry, but your browser does not meet the minimal requirements to run this application.<br />Please try again using another browser.';
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
            this._btnCancel = new PocketCode.Ui.Button('Cancel');
            this.addButton(this._btnCancel);
            this._btnConfirm = new PocketCode.Ui.Button('Confirm');
            this.addButton(this._btnConfirm);

            this.bodyInnerHTML = 'Due to mobile browser restrictions you have to confirm that this application is allowed to download/cache/show/play images and audio/video content required in the requested project.<br /><br />';
            this.bodyInnerHTML += 'There is currently NO official support for mobile devices- this is an experimental preview only! So please do NOT file bugs until there is an official release available.';
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
            this._btnExit = new PocketCode.Ui.Button('Exit');
            this.addButton(this._btnExit);
            this._btnCancel = new PocketCode.Ui.Button('Cancel');
            this._btnCancel.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onCancel.dispatchEvent(); }, this));
            this.addButton(this._btnCancel);

            this.bodyInnerHTML = 'Do you really want to exit?';

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
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry.<br/>The project you are requesting could not be found on our server. Plese make sure you are using a valid Project ID.';
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
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry.<br/>The project you are requesting has an invalid file structure or missing resources.<br/>Details:<br/>';
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
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry.<br/>The project you are requesting could not be parsed correctly on our server. Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.';
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
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry. The latest request caused an internal server error.<br/>';
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
            this._btnCancel = new PocketCode.Ui.Button('Cancel');
            this.addButton(this._btnCancel);
            this._btnRetry = new PocketCode.Ui.Button('Retry');
            this.addButton(this._btnRetry);

            this.bodyInnerHTML = 'Error connecting our server or server not responding.<br/>Please make sure you are connected to the internet.<br />If your connection was temporarily unavailable please click "Retry" to resend the request';
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
            this._btnCancel = new PocketCode.Ui.Button('Cancel');
            this.addButton(this._btnCancel);
            this._btnContinue = new PocketCode.Ui.Button('Continue');
            this._btnContinue.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onContinue.dispatchEvent(); }, this));
            this.addButton(this._btnContinue);

            this.bodyInnerHTML = 'We have detected a sound file (or codec) that is not compatible with your current browser.<br />You can run the project anyway- unsupported sounds will be ignored.';

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
            this._btnCancel = new PocketCode.Ui.Button('Cancel');
            this.addButton(this._btnCancel);
            this._btnContinue = new PocketCode.Ui.Button('Continue');
            this.addButton(this._btnContinue);

            this.bodyInnerHTML = 'The requested project makes use of device features currently not supported in our player and/or not available on your device/current browser.<br />You can run the project anyway- unsupported features will be ignored.<br />Details:<br />';
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
                    return this._btnContinue.onClick;
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
            this._btnCancel = new PocketCode.Ui.Button('Close');
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
            }
            else {
                this._btnDownload = new PocketCode.Ui.Button('Download');
                this._btnDownload.disabled = true;
                this._btnDownload.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onDownload.dispatchEvent(); }, this));
                this.addButton(this._btnDownload);

                //this.bodyInnerHTML += 'TODO: desktop';
            }

            this.onResize.addEventListener(new SmartJs.Event.EventListener(this._onResizeHandler, this));

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
                    this._screenshotImage.src = src;//'https://web-test.catrob.at/html5/pocketCode/img/logo.png';//src;
                    //alert("TODO: show image- setting src + form if download is provided");
                    this.appendChild(this._screenshotImage);
                    //^^ this is necessary to include the src prop in DOM and make the image visible (rerender image tag)
                },
            },
            requestForm: {
                get: function () {
                    return; //TODO: getter for http request form (download)
                },
            },
        });
                
        //methods
        ScreenshotDialog.prototype.merge({
            _imageOnLoadHandler: function () {
                var img = this._screenshotImage,//._dom,
                    w = img.naturalWidth,
                    h = img.naturalHeight;
                //img.width = 250;
                //img.height = 300;

                if(this._btnDownload)
                    this._btnDownload.disabled = false;
            },
            _onResizeHandler: function () {
                this._screenshotImage.width = 200;    //TODO:
                this._screenshotImage.height = 200;
            },
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        });

        return ScreenshotDialog;
    })(),

});