/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../PocketCodePlayer/_startup/pocketCodePlayer.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.merge({

    PlayerStartScreen: (function () {
        PlayerStartScreen.extends(PocketCode.Ui.I18nControl, false);

        function PlayerStartScreen(title, base64peviewImage) {
            PocketCode.Ui.I18nControl.call(this, 'div');

            this._dom.className = 'pc-playerStartScreen';
            this._titleTextNode = new SmartJs.Ui.TextNode('');
            if (title)
                this.title = title;

            this._previewImage = new Image();
            if (base64peviewImage)
                this.previewImage = base64peviewImage;

            this._progressLayout = new SmartJs.Ui.Control('div');
            this._progressTextNode = new SmartJs.Ui.TextNode('loading resources...');
            this._progressBar = new PocketCode.Web.LoadingIndicator();

            this._startButton = document.createElement('button');
            this.startEnabled = false;
            this._addDomListener(this._startButton, 'click', this._startClickHandler);
            this._addDomListener(this._startButton, 'touchend', function (e) { this._startButton.click(); this._dom.blur(); });

            this._createLayout();
            this.onResize.addEventListener(new SmartJs.Event.EventListener(this._onResizeHandler, this));

            //events
            this._onStartClicked = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(PlayerStartScreen.prototype, {
            title: {
                get: function () {
                    return this._titleTextNode.text;
                },
                set: function (value) {
                    if (typeof value !== 'string')
                        throw new error('invalid argument: title: expected type = string');
                    this._titleTextNode.text = value;
                },
            },
            previewImage: {
                //get: function () {

                //},
                set: function (value) {
                    this._previewImage.src = value;
                },
            },
            progressText: {
                //get: function () {

                //},
                set: function (value) {
                    this._progressTextNode.text = value;
                },
            },
            startEnabled: {
                set: function (value) {
                    this._startButton.disabled = !value;
                    if (value) {
                        this._previewImage.className = '';
                        this.hideProgress();
                    }
                    else {
                        this._previewImage.className = 'disabled';
                        this.showProgress();
                    }
                },
            },
            //executionState: {
            //    set: function (value) {
            //        this._executionState = value;
            //        this._updateExecutionState();
            //    },
            //}
        });

        //events
        Object.defineProperties(PlayerStartScreen.prototype, {
            onStartClicked: {
                get: function () {
                    return this._onStartClicked;
                },
            },
        });

        //methods
        PlayerStartScreen.prototype.merge({
            _startClickHandler: function (e) {
                this._onStartClicked.dispatchEvent();
            },
            _onResizeHandler: function (e) {
                //font-size of 10px => 194px x 90px
                var fs = Math.round(this._dom.offsetWidth * 0.6 / 19.4);
                var fh = Math.round(window.innerHeight * 0.3 / 9.0);
                fs = (fs < fh) ? fs : fh;
                fs = (fs < 10) ? 10 : fs;
                fs = (fs > 12) ? 12 : fs;
                this._dom.style.fontSize = fs + 'px';
            },
            _createLayout: function () {
                //img
                this._dom.appendChild(this._previewImage);
                //title
                var tmp = document.createElement('div');
                tmp.className = 'pc-title';
                var text = document.createElement('div');
                tmp.appendChild(text);
                text.appendChild(this._titleTextNode._dom);
                this._dom.appendChild(tmp);
                //loading indicator
                this._progressLayout.className = 'pc-loadingIndicatorLayout';
                this._appendChild(this._progressLayout);

                tmp = document.createElement('div');
                tmp.className = 'pc-loadingIndicator';
                this._progressLayout._dom.appendChild(tmp);

                var span = document.createElement('span');
                span.appendChild(this._progressTextNode._dom);
                tmp.appendChild(span);
                tmp.appendChild(this._progressBar._dom);

                this._startButton.innerHTML =   '<svg preserveAspectRatio="xMidYMid meet" viewBox="0,0,64,64">' +
                                                    '<path d="M32,1C14.88,1,1,14.88,1,31.999C1,49.12,14.88,63,32,63s31-13.88,31-31.001C63,14.88,49.12,1,32,1z M32,56.979c-13.796,0-24.98-11.184-24.98-24.98c0-13.795,11.185-24.98,24.98-24.98s24.979,11.186,24.979,24.98 C56.979,45.796,45.796,56.979,32,56.979z" />' +
                                                    '<polygon points="34.662,32 22.934,44.066 27.438,48.55 43.629,32 27.438,15.45 22.934,19.934" />' +
                                                '</svg>';
                this._dom.appendChild(this._startButton);
            },
            showProgress: function () {
                this._progressLayout.show();
                //this._progressTextNode.show();
                //this._progressBar.show();
            },
            hideProgress: function () {
                this._progressLayout.hide();
                //this._progressTextNode.hide();
                //this._progressBar.hide();
            },
            setProgress: function (value) {
                this._progressBar.setProgress(value);
            },
            //hide: function() {
            //    this.hideBrowseProjectsButton();
            //    SmartJs.Ui.Control.prototype.hide.call(this);
            //},
            //showBrowseProjectsButton: function () {
            //    //shows a button "browse other projects" to be called on project onExecuted event
            //},
            //hideBrowseProjectsButton: function() {

            //},
            //_createMenuBackground: function (container) {
            //    return container;   //TODO: 
            //    //returns inner container where the buttons have to be placed in
            //},
            //_createMenuButtons: function(container) {

            //},
            //_updateExecutionState: function () {
            //    //show text start/resume and button start or Pause
            //},
            //_resizeHandler: function (args) {

            //},
        });

        return PlayerStartScreen;
    })(),

});

